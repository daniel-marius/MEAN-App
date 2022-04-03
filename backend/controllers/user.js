const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

exports.userSignup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User created!",
          result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Invalid authentication credentials!",
        });
      });
  });
};

exports.userSignin = (req, res, next) => {
  let currentUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Auth Failed!",
        });
      }
      currentUser = user;
      return bcrypt.compare(req.body.password, currentUser.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Auth Failed!",
        });
      }
      const token = jwt.sign(
        { email: currentUser.email, userId: currentUser._id },
        "jwt-secret",
        { expiresIn: "1h" }
      );

      res.status(200).json({
        token,
        expiresIn: 3600,
        userId: currentUser._id,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(401).json({
        message: "Invalid authentication credentials!",
      });
    });
};
