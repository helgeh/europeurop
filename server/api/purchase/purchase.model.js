'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PurchaseSchema = new Schema({
  user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
  campaign_id : { type: Schema.Types.ObjectId, ref: 'Campaign' },
  code_id     : { type: Schema.Types.ObjectId, ref: 'Code' }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);