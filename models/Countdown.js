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

module.exports = mongoose.model( 'Countdown', CountdownSchema );
