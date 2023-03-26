'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema = Schema( {
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  partnerId: {
    type: ObjectId,
    ref: 'User',
    default: null
  },
} );

UserSchema.methods.hasPartner = function() {
  return this.partnerId !== null;
}

module.exports = mongoose.model( 'User', UserSchema );
