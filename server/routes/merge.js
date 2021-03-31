const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require("../models/User");

const CLIENT_SECRET = "tjfjfL7BSIdCyUnuc6R15Q4qtzWMMyZ8";

// CREATE USER
router.post("/users", (req, res) => {
  // console.log("Client-secret: ", req.headers["client-secret"]);
  // console.log("user info: ", req.body.user);

  if (req.headers["client-secret"] !== CLIENT_SECRET) {
    res.status(405).send({ status: 0, error: "None of your business!" });
    return
  }

  const userInfo = req.body.user;

  User.create({
    name: userInfo.name,
    email: userInfo.email,
    token: userInfo.ssoUserId,
    tokenExp: "",
  })
  .then(() => {
    res.status(200).send({ status: 1 });
  })
  .catch(err => {
    res.status(500).send({ status: 0, error: err });
  })
})

// LOGIN
router.post("/users/token", (req, res) => {

  if (req.headers["client-secret"] !== CLIENT_SECRET) {
    res.status(405).send({ status: 0, error: "None of your business!" });
    return
  }

  // console.log("This is your access token: ", req.body.accessToken);
  const token = req.body.accessToken;
  const decodeInfo = jwt.verify(token, "9d5067a5a36f2bd6f5e93008865536c7", (err, decode) => {
    if (err) {
      res.status(500).send({ status: 0, err: `Having problem decoding, ${err}` });
      throw err;
    }
    return decode;
  });

  const ssoUserId = decodeInfo.ssoUserId;

  User.find({ token: ssoUserId })
  .then(userFound => {
    if (userFound.length === 0) {
      res.status(404).send({ status: 0, err: "User doesn't exist!" });
      return
    } else {
      req.session.user = {
        token: token,
      }

      const user = userFound[0];
      user.tokenExp = decodeInfo.exp;
      user.save();
      
      res.status(200).send({ status: 1 });
    }
  })
})

// LOGOUT
router.post("/users/logout", (req, res) => {

  if (req.headers["client-secret"] !== CLIENT_SECRET) {
    res.status(405).send({ status: 0, error: "None of your business!" });
    return
  }

  const token = req.body.accessToken;
  const decodeInfo = jwt.verify(token, "9d5067a5a36f2bd6f5e93008865536c7", (err, decode) => {
    if (err) {
      res.status(500).send({ status: 0, err: `Having problem decoding, ${err}` });
      throw err;
    }
    return decode;
  });

  const ssoUserId = decodeInfo.ssoUserId;

  User.find({ token: ssoUserId })
  .then(userFound => {
    if (userFound.length === 0) {
      res.status(404).send({ status: 0, err: "User doesn't exist!" });
      return
    } else {
      const user = userFound[0]
      if (user.tokenExp === null) {
        res.status(500).send({ status: 0, err: "The user is already logged out!" });
      } else {
        req.session.destroy((err) => {
          if(err) res.status(400).send({ status: 0, error: err });
          else {
            user.tokenExp = "";
            user.save();
            res.status(200).send({ status: 1 });
          } 
        });
      }
    }
  })
  .catch(err => {
    res.status(500).send({ status: 0, error: err });
  });
})

router.get("/isLogin", (req, res) => {
  if (req.session.user !== null && req.session.user !== undefined) {
    res.status(200).send({ status: 1, isAuth: true });
    return
  }

  req.session.destroy((err)=>{
    if(err) res.status(500).send({ status: 0, error: err });
    else res.status(200).send({ status: 1, isAuth: false });
  });
  
})

module.exports = router;