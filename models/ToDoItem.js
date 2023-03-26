'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

// shared vals
const minRate = [0, "The Rating must be at least 0"]
const maxRate = [10, "The Rating must be at most 10"]

const TodoItemSchema = Schema( {
  userInfo: {
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    }
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  userRate: {
    type: Number,
    required: true,
    default: 0,
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

TodoItemSchema.methods.getAvgRating = () => {
  // TODO: round this?
  let num = undefined;
  if (this.partnerRate){
    num = (this.userRate + this.partnerRate) / 2;
  } else {
    num = this.userRate;
  }
  return parseFloat(num.toFixed(2)).toString();
}

module.exports = mongoose.model( 'TodoItem', TodoItemSchema );