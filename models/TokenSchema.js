'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const PasswordResetToken = new Schema({
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // this is the expiry time in seconds --> 1 hour
      required: true,
    },
  });

  module.exports = mongoose.model("Password-Reset-Token", PasswordResetToken);