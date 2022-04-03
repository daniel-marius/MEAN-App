const express = require("express");

const UserController = require("../controllers/user");

const router = express.Router();

router.post("/signup", UserController.userSignup);
router.post("/signin", UserController.userSignin);

module.exports = router;
