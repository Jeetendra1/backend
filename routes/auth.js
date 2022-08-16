const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const fetchUser = require('../middleware/fetchUser');

const JWT_SECRET_KEY = "dabli_priya";

//Create user using : POST '/api/auth/createuser'. Doesn't require auth. No login required
router.post(
  "/createuser",
  [
    body("name", "Enter valid name").isLength({ min: 3 }),
    body("email", "Enter valid email").isEmail(),
    body("password", "Enter valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //if there are errors, return bad request
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      //check whether user email is already exist
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "Sorry user with this email already exist." });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      var auttoken = jwt.sign(data, JWT_SECRET_KEY);
      success = true;
      res.json({ success, auttoken });
    } catch (error) {
      res.status(500).send(error.msg);
    }
    // .then(user => res.json(user))
    // .catch(error => res.send(error));
  }
);

//Authenticate user using : POST '/api/auth/login'. No login required

router.post(
  "/login",
  [
    body("email", "Enter valid email").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      let success = false;
      if (!user) {
        res
          .status(400)
          .json({ success, error: "Please try to login with correct credentials." });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        res
          .status(400)
          .json({ success, error: "Please try to login with correct credentials." });
      }

      const userPayload = {
        user: {
          id: user.id,
        },
      };
      success = true;
      const authToken = jwt.sign(userPayload, JWT_SECRET_KEY);
      res.json({ success, authToken });
    } catch (error) {
      res.status(500).send(error.msg);
    }
  }
);

//Route3: Get logged in user details : POST '/api/auth/getUser'. L ogin required

router.post("/getuser", fetchUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    console.log('user', user);
    if (user) {
      res.send(user);
    }
  } catch (error) {
    console.log(error.msg);
    res.status(500).send(error.msg);
  }
});
module.exports = router;
