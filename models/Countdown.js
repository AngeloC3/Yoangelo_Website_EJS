'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const countdownSchema = Schema( {
  userId: {
    type: ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    required: true,
  },
  endTime: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model( 'Countdown', countdownSchema );
