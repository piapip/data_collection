const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const jwt = require('jsonwebtoken');
const config = require('../config/key');
const { auth } = require("../middleware/auth");

//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
    token: req.user.token,
  });
});

router.post("/register", (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found",
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password" });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie("w_authExp", user.tokenExp);
        res.cookie("w_auth", user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});

router.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { token: "", tokenExp: "" },
    (err, doc) => {
      if (err) return res.json({ success: false, err });
      res.clearCookie("w_authExp");
      return res.clearCookie("w_auth").status(200).send({
        success: true,
      });
      // return res.status(200).send({
      //     success: true
      // });
    }
  );
});

const redis_client = require("../redis-client");

// GET USER BY ACCESSID
router.get("/accessToken", (req, res) => {
  const accessToken = req.headers.accesstoken;

  redis_client.get(accessToken, (err, data) => {
    if (err) {
      res.json({ isAuth: false, userFound: null });
      throw err;
    }
    if (data === null || data === 0 || data === undefined) return res.json({
      isAuth: false,  
      userFound: null,
    });

    const decodeInfo = jwt.verify(
      accessToken,
      config.JWT_SECRET_KEY,
      (err, decode) => {
        if (err) {
          res.status(500).json({ isAuth: false, userFound: null });
          throw err;
        }
        return decode;
      }
    );

    const ssoUserId = decodeInfo.ssoUserId;

    User.find({ ssoUserId: ssoUserId }).then((userFound) => {
      if (userFound.length === 0) {
        res.status(404).send({ isAuth: false, userFound: null });
        return;
      } else res.status(201).send({ isAuth: true, userFound: userFound[0] })
    });
  });
});

module.exports = router;
