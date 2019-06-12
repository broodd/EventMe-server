// { __pageSize, __position, __membersSize, __commentsSize }
const defaultVars = require('../config/defaultVars.js');

module.exports = (req, res, next) => {
  req.defVars = defaultVars;
  req.userId = req.headers['userid'];
  // req.userId = req.body.user_id || req.body.userId || req.query.user_id || req.query.userId || req.query.id || req.body.id;


  var position = (req.headers['position'] && req.headers['position'].split(',')) || defaultVars.__position;
  position[0] = +position[0];
  position[1] = +position[1];
  req.position = position;

  if (req.userId)
    next();
  else {
    res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
};
