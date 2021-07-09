const JWT = require("jsonwebtoken");

const authentication = (req, res, next) => {
    if (req.headers.authorization.length) {
        jwt.verify(req.headers.authorization, process.env.PASS, (err, decoded) => {
          if (err) {
            res.status(401).json({ message: "token authorization failed" });
          }
        //   console.log(decoded);
        });
        next();
      } else {
        res.status(401).json({ message: "No token in header" });
      }
}
module.exports = { authentication }