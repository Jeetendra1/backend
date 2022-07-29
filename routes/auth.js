const express = require("express");
const User = require('../models/User');
const router = express.Router();

//Create user using : POST '/api/auth'. Doesn't require auth
router.post("/", (req, rep) => {
  console.log(req.body);
  const user = User(req.body);
  user.save();

});

module.exports = router;