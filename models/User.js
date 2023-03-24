'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = Schema( {
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  partnerId: {
    type: ObjectId,
    ref: 'User',
    default: null
  },
} );

module.exports = mongoose.model( 'User', userSchema );
