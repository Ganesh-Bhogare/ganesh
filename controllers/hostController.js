const Home = require('../models/home');

const fs = require('fs')

exports.addHome = (req, res, next) => {
    res.render('host/edit-home', { pageTitle: 'Add Home to airbnb', user: req.session.user, currentPage: 'addHome', editing: false, isLoggedIn: req.isLoggedIn });
}

exports.getEditHome = (req, res, next) => {
    const homeId = req.params.homeId;
    const editing = req.query.editing === 'true';
    Home.findById(homeId).then(home => {
        if (!home) {
            return res.redirect('/host/host-home-list');
        }
        console.log(homeId, editing, home);
        res.render('host/edit-home', { pageTitle: 'Edit Home to airbnb', user: req.session.user, currentPage: 'hostHomeList', editing: editing, home: home, isLoggedIn: req.isLoggedIn });
    })

}

exports.addHomePost = (req, res, next) => {
    const { houseName, price, location, rating } = req.body;

    if (!req.file) {
        return res.status(400).send("Photo is required.");
    }

    const photo = req.file.filename;

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

            // only update photo if a file was uploaded
            if (req.file) {
                fs.unlink(fs.photo, err => {
                    console.log(err);
                })
                home.photo = req.file.path;
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


exports.hostHomeList = (req, res, next) => {
    Home.find().then(registeredHomes => {
        res.render('host/host-home-list', { registeredHomes: registeredHomes, user: req.session.user, pageTitle: 'Host Home List', currentPage: 'hostHomeList', isLoggedIn: req.isLoggedIn });
    });
}

exports.postDeleteHome = (req, res, next) => {
    const homeId = req.params.homeId;
    console.log(homeId);
    Home.findByIdAndDelete(homeId).then(error => {
        if (error) {
            console.error('Error deleting home:', error);
        }
        res.redirect('/host/host-home-list');
    })

}




