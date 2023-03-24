'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const NotificationSchema = Schema( {
  recipientId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: ObjectId,
    ref: 'User',
  },
  notifType: {
    type: String,
    required: true,
    trim: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true
  },
  related: {
    relatedSchema: {
      type: String,
      validate: function() {
        return (this.relatedSchema && this.relatedId) || (!this.relatedSchema && !this.relatedId);
      }
    },
    relatedId: {
      type: ObjectId,
      validate: function() {
        return (this.relatedSchema && this.relatedId) || (!this.relatedSchema && !this.relatedId);
      }
    }
  }
} );

module.exports = mongoose.model( 'Notification', NotificationSchema );