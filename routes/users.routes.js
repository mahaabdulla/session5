const express = require("express");
const router = express.Router();

const userscontrollers = require("../controllers/users.controllers");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../util/userRoles");

// register
router
  .route("/register")
  .post(upload.single("avatar"), userscontrollers.register);

// login
router.route("/login").post(userscontrollers.login);

// get all users
router
  .route("/")
  .get(verifyToken, allowedTo(userRoles.ADMIN), userscontrollers.getAllUsers);

// update user role
router
  .route("/:id/role")
  .patch(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    userscontrollers.updateUserRole,
  );

// get user by id
router.route("/:id").get(verifyToken, userscontrollers.getUserById);

module.exports = router;
