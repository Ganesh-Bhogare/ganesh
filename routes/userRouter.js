// Core Modules
const path = require('path');

// External Module
const express = require('express');
const userRouter = express.Router();


const storeController = require('../controllers/storeController');

userRouter.get("/", storeController.getHomes);
userRouter.get("/bookings", storeController.getBookings);
userRouter.get("/favourite-list", storeController.getFavourite);
userRouter.get("/index", storeController.getIndex);
userRouter.get('/index/:homeId', storeController.getHomeDetails);
userRouter.post('/favourite-list', storeController.getAddToFavourite);
userRouter.post('/delete-favourite/:homeId', storeController.postDeleteFavourite);

module.exports = userRouter;