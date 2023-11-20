const Users = require("../models/user.js");

function auth(allowed_roles) {
  return function (req, res, next) {
    // which part sends authkey to header?
    const authenticationKey = req.get("X-AUTH-KEY");

    if (authenticationKey) {
      Users.getByAuthenticationKey(authenticationKey)
        .then((user) => {
          if (allowed_roles.includes(user.role)) {
            next();
          } else {
            res.status(403).json({
              status: 403,
              message: "Access forbidden",
            });
          }
        })
        .catch((error) => {
          res.status(401).json({
            status: 401,
            message: "Authentication key invalid",
          });
        });
    } else {
      res.status(401).json({
        status: 401,
        message: "Authentication key missing",
      });
    }
  };
}

module.exports = auth;
