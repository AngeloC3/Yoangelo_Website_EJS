'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var toDoItemSchema = Schema( {
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: Number,
    required: true,
    default: 0
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  addedBy: {
    type: String,
    required: true,
  }
} );

const watchListItem = mongoose.model( 'WatchListItem', toDoItemSchema );
const bucketListItem = mongoose.model( 'BucketListItem', toDoItemSchema );

module.exports = {
  watchListItem : watchListItem,
  bucketListItem : bucketListItem
}