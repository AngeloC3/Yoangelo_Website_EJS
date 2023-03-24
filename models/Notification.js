'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const NotificationSchema = Schema( {
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
} );

module.exports = mongoose.model( 'Notification', NotificationSchema );