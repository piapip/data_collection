const { User } = require('../models/User');
const redis_client = require("../redis-client");
const jwt = require('jsonwebtoken');

let auth = (req, res, next) => {
  // let token = req.cookies.w_auth;

  // User.findByToken(token, (err, user) => {
  //   if (err) throw err;
  //   if (!user)
  //     return res.json({
  //       isAuth: false,
  //       error: true
  //     });

  //   req.token = token;
  //   req.user = user;
  //   next();
  // });

  redis_client.get("accessToken", (err, data) => {
    if (err) throw err;
    if (!data) return res.json({
      isAuth: false,  
      error: true,
    });

    const decodeInfo = jwt.verify(data, "9d5067a5a36f2bd6f5e93008865536c7", (err, decode) => {
      if (err) {
        res.status(500).json({ isAuth: false, error: true });
        throw err;
      }
      return decode;
    });

    const ssoUserId = decodeInfo.ssoUserId;

    User.find({ ssoUserId: ssoUserId })
    .then(userFound => {
      if (userFound.length === 0) {
        res.status(404).json({ isAuth: false, error: true });
        return
      } else {
        const user = userFound[0];
        req.token = user.token;
        req.user = user;
        next();
      }
    })
  })
};

module.exports = { auth };
