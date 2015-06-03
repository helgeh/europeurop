'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CodeSchema = new Schema({
  value: String,
  info: String,
  campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' }
});

CodeSchema.set('autoIndex', false);

module.exports = mongoose.model('Code', CodeSchema);