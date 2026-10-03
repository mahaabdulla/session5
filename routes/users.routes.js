const express = require("express");
const router = express.Router();

const userscontrollers = require("../controllers/users.controllers");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
// get all users
router.route("/").get(verifyToken, userscontrollers.getAllUsers);

// get user by id
router.route("/:id").get(verifyToken, userscontrollers.getUserById);

// register
router.route("/register")
.post(
    upload.single("avatar"),
     userscontrollers.register);

// login
router.route("/login").post(userscontrollers.login);

module.exports = router;
