const Home = require('../models/home');
const User = require('../models/user');

exports.getHomes = async (req, res, next) => {
    try {
        const registeredHomes = await Home.find();
        res.render('store/home-list', {
            registeredHomes,
            user: req.session.user,
            pageTitle: 'airbnb Home',
            currentPage: 'Home',
            isLoggedIn: req.isLoggedIn
        });
    } catch (err) {
        next(err);
    }
};

exports.getBookings = (req, res, next) => {
    res.render('store/bookings', {
        pageTitle: 'My Bookings',
        currentPage: 'bookings',
        user: req.session.user,
        isLoggedIn: req.isLoggedIn
    });
};

exports.getFavourite = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId).populate('favourites');
        res.render('store/favourite-list', {
            favouriteHomes: user.favourites,
            user: req.session.user,
            pageTitle: 'Favourites',
            currentPage: 'favourite',
            isLoggedIn: req.isLoggedIn
        });
    } catch (err) {
        next(err);
    }
};

exports.getAddToFavourite = async (req, res, next) => {
    try {
        const homeId = req.body.homeId;
        const userId = req.session.user._id;
        const user = await User.findById(userId);
        if (!user.favourites.includes(homeId)) {
            user.favourites.push(homeId);
            await user.save();
        }
        res.redirect('/favourite-list');
    } catch (err) {
        next(err);
    }
};

exports.postDeleteFavourite = async (req, res, next) => {
    try {
        const homeId = req.params.homeId;
        const userId = req.session.user._id;
        const user = await User.findById(userId);
        user.favourites = user.favourites.filter(fav => fav.toString() !== homeId);
        await user.save();
        res.redirect('/favourite-list');
    } catch (err) {
        console.error('Error deleting favourite:', err);
        res.status(500).send('Failed to delete favourite');
    }
};

exports.getIndex = async (req, res, next) => {
    try {
        const registeredHomes = await Home.find();
        res.render('store/index', {
            registeredHomes,
            user: req.session.user,
            pageTitle: 'Home',
            currentPage: 'index',
            isLoggedIn: req.isLoggedIn
        });
    } catch (err) {
        next(err);
    }
};

exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        currentPage: '404',
        user: req.session.user,
        isLoggedIn: req.isLoggedIn
    });
};

exports.getHomeDetails = async (req, res, next) => {
    try {
        const homeId = req.params.homeId;
        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).render('404', {
                pageTitle: 'Home Not Found',
                currentPage: '404',
                user: req.session.user,
                isLoggedIn: req.isLoggedIn
            });
        }
        res.render('store/home-details', {
            home,
            pageTitle: 'Home Details',
            currentPage: 'home-details',
            user: req.session.user,
            isLoggedIn: req.isLoggedIn
        });
    } catch (err) {
        next(err);
    }
};
