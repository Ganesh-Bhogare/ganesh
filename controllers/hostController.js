const path = require('path');
const fs = require('fs');
const Home = require('../models/home');

// Renders the form to add a new home
exports.addHome = (req, res, next) => {
    res.render('host/edit-home', {
        pageTitle: 'Add Home to Airbnb',
        user: req.session.user,
        currentPage: 'addHome',
        editing: false,
        isLoggedIn: req.isLoggedIn
    });
};

// Renders the form to edit an existing home
exports.getEditHome = (req, res, next) => {
    const homeId = req.params.homeId;
    const editing = req.query.editing === 'true';

    Home.findById(homeId).then(home => {
        if (!home) {
            return res.redirect('/host/host-home-list');
        }

        res.render('host/edit-home', {
            pageTitle: 'Edit Home',
            user: req.session.user,
            currentPage: 'hostHomeList',
            editing: editing,
            home: home,
            isLoggedIn: req.isLoggedIn
        });
    });
};

// Handles form submission to add a new home
exports.addHomePost = (req, res, next) => {
    const { houseName, price, location, rating } = req.body;

    if (!req.file) {
        return res.status(400).send("Photo is required.");
    }

    const photo = req.file.filename; // ✅ Only filename stored

    const home = new Home({
        houseName,
        price,
        location,
        rating,
        photo
    });

    home.save()
        .then(() => {
            console.log('Home added successfully');
            res.redirect('/host/host-home-list');
        })
        .catch(err => {
            console.error('Error saving home:', err);
            res.status(500).send("Failed to add home.");
        });
};

// Handles form submission to edit an existing home
exports.postEditHome = (req, res, next) => {
    const { id, houseName, price, location, rating } = req.body;

    Home.findById(id)
        .then(home => {
            if (!home) {
                return res.status(404).send("Home not found.");
            }

            home.houseName = houseName;
            home.price = price;
            home.location = location;
            home.rating = rating;

            // If a new image is uploaded, delete the old one
            if (req.file) {
                const oldImagePath = path.join(__dirname, '..', 'uploads', home.photo);
                fs.unlink(oldImagePath, err => {
                    if (err) console.error("Error deleting old image:", err);
                });

                home.photo = req.file.filename; // ✅ Save only filename
            }

            return home.save();
        })
        .then(() => {
            console.log('Home updated successfully');
            res.redirect('/host/host-home-list');
        })
        .catch(error => {
            console.error('Error updating home:', error);
            res.status(500).send("Failed to update home.");
        });
};

// Show list of homes for host
exports.hostHomeList = (req, res, next) => {
    Home.find().then(registeredHomes => {
        res.render('host/host-home-list', {
            registeredHomes: registeredHomes,
            user: req.session.user,
            pageTitle: 'Host Home List',
            currentPage: 'hostHomeList',
            isLoggedIn: req.isLoggedIn
        });
    });
};

// Delete a home
exports.postDeleteHome = (req, res, next) => {
    const homeId = req.params.homeId;

    Home.findById(homeId).then(home => {
        if (!home) {
            return res.redirect('/host/host-home-list');
        }

        const photoPath = path.join(__dirname, '..', 'uploads', home.photo);
        fs.unlink(photoPath, err => {
            if (err) console.error('Error deleting photo:', err);
        });

        return Home.findByIdAndDelete(homeId);
    })
        .then(() => {
            console.log('Home deleted successfully');
            res.redirect('/host/host-home-list');
        })
        .catch(error => {
            console.error('Error deleting home:', error);
            res.status(500).send("Failed to delete home.");
        });
};
