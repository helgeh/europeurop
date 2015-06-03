'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Code = require('../code/code.model');

var CampaignSchema = new Schema({
  title: String,
  info: String,
  slug: String,
  things: [{ type: Schema.Types.ObjectId, ref: 'Thing' }],
  codes: [{ type: Schema.Types.ObjectId, ref: 'Code'}],
  active: Boolean
});

CampaignSchema.set('autoIndex', false);



module.exports = mongoose.model('Campaign', CampaignSchema);