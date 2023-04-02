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
      enum: ["system", "pair-request", "new-todo-item", "new-countdown", "new-wishlist-item"]
    },
    notifMessage: {
      type: String,
      trim: true,
      required: function() {
        return this.notifDetails.notifType === 'system' || this.notifDetails.notifType === 'new-todo-item';
      },
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

NotificationSchema.methods.getTypeInfo = function() {
  const infoObj = {
    deleteId: this._id,
  }
  switch (this.notifDetails.notifType) {
    case "system":
      infoObj.message = this.notifDetails.notifMessage;
      break;
    case 'pair-request':
      infoObj.message = 'You have a new pair request';
      infoObj.viewRoute = "/pair/respond_pair_request/" + this._id;
      break;
    case 'new-todo-item':
      infoObj.message = this.notifDetails.notifMessage;
      infoObj.viewRoute = `/todos/${this.related.relatedSchema}/modify/${this.related.relatedId}?rateOnly=true&viewNotifId=${this._id}`;
      break;
    case 'new-countdown':
      infoObj.message = "A new countdown has been added to your countdowns!";
      infoObj.viewRoute = `/countdowns?viewNotifId=${this._id}`;
      break;
    case "new-wishlist-item":
      infoObj.message = "A new item has been added to your wishlist!";
      infoObj.viewRoute = `/wishlist?viewNotifId=${this._id}`;
      break;
    default:
      infoObj.message = 'You have a new notification';
  }
  return infoObj;
};

module.exports = mongoose.model( 'Notification', NotificationSchema );