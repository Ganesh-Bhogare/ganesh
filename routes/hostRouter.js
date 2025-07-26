// Core Module

// External Module
const express = require('express');
const hostRouter = express.Router();

// Local Module

const hostController = require('../controllers/hostController');

hostRouter.get("/add-home", hostController.addHome);
hostRouter.post('/add-home', hostController.addHomePost);
hostRouter.get("/host-home-list", hostController.hostHomeList);
hostRouter.get("/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/edit-home/:homeId", hostController.postEditHome);
hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);

exports.hostRouter = hostRouter;
