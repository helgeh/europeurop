'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PurchaseSchema = new Schema({
  user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
  campaign    : { type: Schema.Types.ObjectId, ref: 'Campaign' },
  code_id     : { type: Schema.Types.ObjectId, ref: 'Code' },
  active      : Boolean
});

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
PurchaseSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    // if (false && !this.campaign || !validatePresenceOf(this.code_id)) {
    //   console.log(this);
    //   next(new Error('Invalid input'));
    // }
    // else
      next();
  });


module.exports = mongoose.model('Purchase', PurchaseSchema);
