'use strict';

var mongoose = require('mongoose'),
    slug = require('slug'),
    Schema = mongoose.Schema;

var auth = require('../../auth/auth.service');

var ThingSchema = new Schema({
  name: String,
  info: String,
  url: String,
  s3Object: {
    bucket: String,
    etag: String,
    key: String,
    location: String
  }
});

ThingSchema.set('autoIndex', false);



// ThingSchema
//   .virtual('link')
//   .get(function() {
//     return 'https://europeurop.s3.amazonaws.com/campaignmedia/' + this.name;
//   });



module.exports = mongoose.model('Thing', ThingSchema);