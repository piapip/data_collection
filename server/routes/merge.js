const express = require('express');
const router = express.Router();

// CREATE USER
router.post("/sso/users", (req, res) => {
  return null;
})

// ??? Wakanai
router.get("sso/users/:ssoUserID", (req, res) => {
  return null;
})

// LOGOUT
router.post("/sso/logout", (req, res) => {
  return null;
})

module.exports = router;