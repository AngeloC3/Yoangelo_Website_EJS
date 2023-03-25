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
  createdAt: {
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

NotificationSchema.methods.getTypeInfo = function() {
  const infoObj = {
    deleteRoute: "/idkyet/" + this._id,
  }
  switch (this.notifType) {
    case 'pair-request':
      infoObj.message = 'You have a new pair request';
      infoObj.viewRoute = "/notifications/respond_pair_request";
    default:
      infoObj.message = 'You have a new notification';
  }
  return infoObj;
};

module.exports = mongoose.model( 'Notification', NotificationSchema );