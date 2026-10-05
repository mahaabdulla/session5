const express = require("express");
const router = express.Router();

const userscontrollers = require("../controllers/users.controllers");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../util/userRoles");

router
  .route("/")
  .get(verifyToken, allowedTo(userRoles.ADMIN), userscontrollers.getAllUsers);

router.route("/:id").get(verifyToken, userscontrollers.getUserById);

router
  .route("/:id/role")
  .put(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    userscontrollers.updateUserRole,
  );

router
  .route("/register")
  .post(upload.single("avatar"), userscontrollers.register);

router.route("/login").post(userscontrollers.login);

module.exports = router;
