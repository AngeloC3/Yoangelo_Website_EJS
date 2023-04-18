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
  pairRate: {
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
  url: {
    type: String,
    trim: true
  },
});

TodoItemSchema.methods.getAvgRating = function() {
  // TODO: round this?
  let num = undefined;
  if (this.pairRate !== undefined){
    num = (this.creatorRate + this.pairRate) / 2;
  } else {
    num = this.creatorRate;
  }
  return parseFloat(num.toFixed(2)).toString();
};

TodoItemSchema.methods.didRate = function(id) {
  if (id.equals(this.creatorInfo.creatorId)) {
    return true;
  }
  if (this.pairRate === undefined){
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
    if (this.pairRate !== undefined) num2 = this.pairRate;
  } else {
    num2 = this.creatorRate;
    if (this.pairRate !== undefined) num1 = this.pairRate;
  }
  return getRateString(num1) + " - " + getRateString(num2);
}

const { getDateString } = require("../public/js/schemaUtils");
TodoItemSchema.methods.getCreatedAtString = function() {
  return getDateString(this.createdAt);
}

module.exports = mongoose.model( 'TodoItem', TodoItemSchema );
