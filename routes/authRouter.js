const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/authController");



//authRouter.post('/auth/signup', authController.signUp);
authRouter.post('/auth/login', authController.login);
authRouter.get('/auth/status', authController.status);
authRouter.post('/auth/logout', authController.logout);
authRouter.post('/auth/signup', authController.signUp);

module.exports = authRouter;