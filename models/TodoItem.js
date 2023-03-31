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
  if (this.partnerRate !== undefined){
    num = (this.creatorRate + this.partnerRate) / 2;
  } else {
    num = this.creatorRate;
  }
  return parseFloat(num.toFixed(2)).toString();
};

TodoItemSchema.methods.didRate = function(id) {
  if (id.equals(this.creatorInfo.creatorId)) {
    return true;
  }
  if (this.partnerRate === undefined){
    return false;
  }
  return true;
};

TodoItemSchema.methods.getBothRateString = function(id) {
  const getRateString = (rate) => {
    if (rate === null){
      return "X"
    }
    return parseFloat(rate.toFixed(1)).toString()
  };

  let num1 = null;
  let num2 = null;
  if (id.equals(this.creatorInfo.creatorId)) {
    num1 = this.creatorRate;
    if (this.partnerRate !== undefined) num2 = this.partnerRate;
  } else {
    num2 = this.creatorRate;
    if (this.partnerRate !== undefined) num1 = this.partnerRate;
  }
  return getRateString(num1) + " - " + getRateString(num2);
}

module.exports = mongoose.model( 'TodoItem', TodoItemSchema );
