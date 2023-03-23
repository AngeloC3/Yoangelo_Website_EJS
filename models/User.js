'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var userSchema = Schema( {
  username: {
    type: String,
    required: true,
  },
  passphrase: {
    type: String,
    required: true
  },
  partnerID: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  partnerCode: {
    type: String,
    required: true
  } // NEEDS TO BE ADDED IN AUTH? same was ay passphrase?
} );

module.exports = mongoose.model( 'User', userSchema );
