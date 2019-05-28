// { __pageSize, __position, __membersSize, __commentsSize }
const defaultVars = require('../config/defaultVars.js');

module.exports = (req, res, next) => {
  req.defVars = defaultVars;
  req.userId = req.body.user_id || req.body.userId || req.query.user_id || req.query.userId || req.query.id || req.body.id;

  var position = req.query.position || defaultVars.__position;
  position[0] = +position[0];
  position[1] = +position[1];
  req.position = position;

  next();
};
