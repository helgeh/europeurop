var crypto = require('crypto');

function generate(chars, total, safe, cb) {
  var ret = [];
  var count = 0;
  for (var i = 0; i < total; i++) {
    crypto.randomBytes(chars, function(ex, buf) {
      if (ex) throw ex;

      var string = buf.toString('base64');
      if (safe) {
        string = string.replace(/\//g,'_').replace(/\+/g,'-');
      }

      ret.push(string.substr(0, chars));
      if (total <= ++count)
        cb(ret);
    });
  }
}

function randomStrings(options, cb) {
  if (typeof(options) === 'function') {
    cb = options;
    options = {};
  } else {
    options = options || {};
  }
  var length = options['length'] || 32;
  var total = options['total'] || 1;

  var codes = generate(length, total, options.urlsafe, function(res) {
    cb(res);
  });
};

module.exports = randomStrings;