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
    default: null
  },
  notifDetails: {
    notifType: {
      type: String,
      required: true,
      trim: true,
      enum: ["system", "pair-request",]
    },
    notifMessage: {
      type: String,
      trim: true,
      required: function() {
        return this.notifDetails.notifType === 'system';
      },
      trim: true,
    },
  },
  viewed: {
    type: Boolean,
    default: false,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  related: {
    relatedSchema: {
      type: String,
      trim: true,
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

NotificationSchema.methods.getTypeInfo = () => {
  const infoObj = {
    deleteRoute: "/notifications/delete/" + this._id,
  }
  switch (this.notifDetails.notifType) {
    case "system":
      infoObj.message = this.notifDetails.notifMessage;
      break;
    case 'pair-request':
      infoObj.message = 'You have a new pair request';
      infoObj.viewRoute = "/pair/respond_pair_request/" + this._id;
      break;
    default:
      infoObj.message = 'You have a new notification';
  }
  return infoObj;
};

module.exports = mongoose.model( 'Notification', NotificationSchema );