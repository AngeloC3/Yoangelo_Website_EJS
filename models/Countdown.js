'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CountdownSchema = Schema( {
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
  title: {
    type: String,
    required: true,
  },
  endsAt: {
    type: Date,
    required: true
  }
});

CountdownSchema.methods.isInPast = function(){
  if (new Date(this.endsAt) - new Date() > 0 ){
    return false;
  }
  return true;
}

module.exports = mongoose.model( 'Countdown', CountdownSchema );
