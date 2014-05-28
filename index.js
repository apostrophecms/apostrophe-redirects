var async = require('async');
var _ = require('lodash');
var extend = require('extend');
var async = require('async');

module.exports = redirects;

function redirects(options, callback) {
  return new redirects.Construct(options, callback);
}

// Everything in this constructor that should really be in an apostrophe-modules
// metamodule is marked REFACTOR. -Tom

redirects.Construct = function(options, callback) {
  var self = this;

  // "Protected" properties. We want related modules and subclasses to be able
  // to access these, thus no variables defined in the closure
  self._apos = options.apos;
  self._app = options.app;
  self._options = options;

  self.redirects = self._apos.redirects;

  self._apos.mixinModuleAssets(self, 'redirects', __dirname, options);

  // REFACTOR
  self._action = '/apos-redirects';

  self.permissions = function(req, res, next) {
    if (!req.user.permissions.admin) {
      res.statusCode = 404;
      return res.send('notfound');
    }
    return next();
  };

  self.deliver = function(res, err, result) {
    if (err) {
      console.log(err);
      return res.send({
        status: 'failed'
      });
    }
    var response = { 'status': 'ok' };
    if (result !== undefined) {
      response.result = result;
    }
    return res.send(response);
  };

  function thenDeliver(res) {
    return function(err, result) {
      return self.deliver(res, err, result);
    };
  }

  // Middleware to check for hard redirects before actual pages
  self.pageMiddleware = function(req, res, next) {
    return self._apos.redirects.findOne({ from: req.params[0], hard: true }, function(err, redirect) {
      if (redirect) {
        return res.redirect(redirect.to);
      }
      return next();
    });
  };

  self.validate = function(body) {
    var redirect = {
      _id: body._id,
      from: self._apos.sanitizeString(body.from),
      to: self._apos.sanitizeString(body.to),
      reason: self._apos.sanitizeString(body.reason),
      hard: true
    };
    if ((!redirect.from) || (!redirect.to)) {
      return null;
    }
    return redirect;
  };

  // Fetch the whole list to initialize the editor

  self._app.get(options.loadUrl || self._action + '/load', self.permissions, function(req, res) {
    self.redirects.find({ hard: true }).sort({from: 1}).toArray(thenDeliver(res));
  });

  self._app.post(options.updateUrl || self._action + '/update', self.permissions, function(req, res) {
    if (typeof(req.body) !== 'object') {
      return self.deliver(res, 'invalid');
    }
    item = self.validate(req.body);
    if (!item) {
      return self.deliver(res, 'invalid');
    }
    var newItem;
    return async.series({
      remove: function(callback) {
        return self.redirects.remove({ $or: [ { _id: item._id }, { from: item.from } ] }, callback);
      },
      insert: function(callback) {
        if (!item._id) {
          item._id = self._apos.generateId();
        }
        return self.redirects.insert(item, { upsert: true }, function(err, item) {
          newItem = item;
          return callback(err);
        });
      }
    }, function(err) {
      return self.deliver(res, err, newItem);
    });
  });

  self._app.post(options.removeUrl || self._action + '/remove', self.permissions, function(req, res) {
    return self.redirects.remove({ _id: req.body._id }, function(err) {
      if (err) {
        return self.deliver(res, 'invalid');
      }
      return self.deliver(res);
    });
  });

  self._apos.pushGlobalCallWhen('user', 'window.aposRedirects = new AposRedirects()');

  self.pushAsset('script', 'editor', { when: 'user' });
  self.pushAsset('stylesheet', 'editor', { when: 'user' });
  self.pushAsset('template', 'editor', { when: 'user' });

  self._apos.addLocal('aposRedirectsMenu', function(args) {
    var result = self.render('menu', args);
    return result;
  });

  if (callback) {
    // Invoke callback on next tick so that the constructor's return
    // value can be assigned to a variable in the same closure where
    // the callback resides
    process.nextTick(function() { return callback(null); });
  }
};
