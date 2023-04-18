'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const WishlistSchema = Schema( {
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
    trim: true
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
      type: Number,
  },
  rating: {
      type: Number,
      required: true,
      min: [0, "The Rating must be at least 0"],
      max: [10, "The Rating must be at most 10"]   
  },
  url: {
      type: String,
      trim: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const { getDateString } = require("../public/js/schemaUtils");
WishlistSchema.methods.getCreatedAtString = function() {
  return getDateString(this.createdAt);
}

module.exports = mongoose.model( 'Wishlist', WishlistSchema );