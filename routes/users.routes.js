const express = require("express");
const router = express.Router();

const userscontrollers = require("../controllers/users.controllers");

// get all users
// register
// login

router.route("/").get(userscontrollers.getAllUsers);

router.route("/:id").get(userscontrollers.getUserById);

router.route("/register").post(userscontrollers.register);

router.route("/login").post(userscontrollers.login);

module.exports = router;
