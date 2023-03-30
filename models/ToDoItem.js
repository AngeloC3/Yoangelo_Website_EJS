'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

// shared vals
const minRate = [0, "The Rating must be at least 0"]
const maxRate = [10, "The Rating must be at most 10"]

const TodoItemSchema = Schema( {
  creatorInfo: {
    creatorId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    creatorName: {
      type: String,
      required: true,
    }
  },
  todoType: {
    type: String,
    required: true,
    enum: ["watch_list", "bucket_list", "reading_list"]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
  },
  creatorRate: {
    type: Number,
    required: true,
    min: minRate,
    max: maxRate,
  },
  partnerRate: {
    type: Number,
    minRate: minRate,
    maxRate: maxRate
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
} );

TodoItemSchema.methods.getAvgRating = function() {
  // TODO: round this?
  let num = undefined;
  if (this.partnerRate){
    num = (this.creatorRate + this.partnerRate) / 2;
  } else {
    num = this.creatorRate;
  }
  return parseFloat(num.toFixed(2)).toString();
};

TodoItemSchema.methods.didRate = function(id) {
  if (this.creatorInfo.creatorId === id) {
    return true;
  }
  if (!this.partnerRate){
    return false;
  }
  return true;
};

module.exports = mongoose.model( 'TodoItem', TodoItemSchema );