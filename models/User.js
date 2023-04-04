'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const passportLocalMongoose = require("passport-local-mongoose");

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
  // password: {
  //   type: String,
  //   required: true,
  //   trim: true,
  // },
  pairId: {
    type: ObjectId,
    ref: 'User',
    default: null,
  },
  todoTypes: {
    type: [String],
    default: [],
    trim: true,
    required: true
  },
  lastLogin: {
    type: Date,
    default: Date.now(),
  },
  google: {
    id: String,
  }
} );

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model( 'User', UserSchema );
