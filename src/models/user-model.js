const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  fbid: {
    type: String,
    default: null
  },
  login: {
    type: String,
    unique: true,
    default: undefined
  },
  img: {
    type: String,
    default: undefined
  },
  bio: {
    type: String,
  },
  cards: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'card'
  }],
  visit:  [{ 
    type: Schema.Types.ObjectId, 
    ref: 'card',
    default: undefined 
  }],
})

module.exports = mongoose.model('user', UserSchema)