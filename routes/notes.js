const express = require("express");

const router = express.Router();

router.get("/", (req, rep) => {
  rep.send('Hi notes');

});

module.exports = router;