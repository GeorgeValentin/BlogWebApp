const jwt = require('jsonwebtoken');
const config = process.env;

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send('Please login first!');
  }

  try {
    const decoded = jwt.verify(token, config.MY_SECRET);

    const userPayload = {
      userEmail: decoded.email,
      userId: decoded.userId,
    };

    req.user = userPayload;
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }

  // move to the next execution point
  return next();
};

module.exports = verifyToken;
