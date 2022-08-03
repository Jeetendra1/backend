var jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = "dabli_priya";

const fetchUser = (req, res, next) => {
  //Get the user from jwt token and add the id to the request
  try {
    const token = req.header('auth-token');
    if (!token) {
      res.status(401).send({error: 'Please authenticate using valid token.'});
    }
    const data = jwt.verify(token, JWT_SECRET_KEY);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({error: 'Please authenticate using valid token.'});
  }
};

module.exports = fetchUser;
