const User = require('./user-model.js');
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentModel = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    default: undefined
  },
  text: String,
  create: {
    type: Date, 
    default: Date.now
  },
  reply: [{
    type: Schema.Types.ObjectId, 
    ref: 'comment',
    default: undefined 
  }]
})

module.exports = mongoose.model('comment', CommentModel)