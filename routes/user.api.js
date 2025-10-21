const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

// Sign up
router.post("/", userController.createUser);

// "/me" route: validate the token (1. check expiration, 2. verify user exists)
// If valid, find the user from the token and return it (middleware structure)
router.get("/me", authController.authenticate, userController.getUser);

module.exports = router;
