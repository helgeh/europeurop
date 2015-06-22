'use strict';

angular.module('europeuropApp')
  .factory('Auth', function Auth($location, $rootScope, $http, $cookieStore, $q, User) {
    var currentUser = {};
    var currentPurchase = {};
    if($cookieStore.get('token')) {
      currentUser = User.get(function () {
        currentUser.purchases = User.getPurchases({ id: currentUser._id }); //, function (result) {
        //   currentUser.purchases = result;
        // });
      });
    }

    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/auth/local', {
          email: user.email,
          password: user.password
        }).
        success(function(data) {
          $cookieStore.put('token', data.token);
          currentUser = User.get();
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        $cookieStore.remove('token');
        currentUser = {};
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, callback) {
        var cb = callback || angular.noop;

        return User.save(user,
          function(data) {
            $cookieStore.put('token', data.token);
            currentUser = User.get();
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
        return currentUser;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
        return currentUser.role === 'admin';
      },

      /**
       * Get auth token
       */
      getToken: function() {
        return $cookieStore.get('token');
      },

      /**
       * Check if user has a new purchase
       */
      hasPurchase: function () {
        return currentPurchase.hasOwnProperty('_id') || currentUser.purchases;
      },

      /**
       * Get Purchase
       */
      getPurchase: function () {
        return currentPurchase;
      },

      /**
       * Set Purchase
       */
      setPurchase: function (purchase) {
        currentPurchase = purchase;
      },

      /**
       * If user is logged in save current purchase to current user
       */
      savePurchase: function () {
        console.log("When coming from singup, user is not logged in when calling savePurchase()");
        console.log(currentUser);
        if (!currentPurchase) {
          Notify.error({text: 'No purchase to save!'});
        }
        else if (!this.isLoggedIn()) {
          Notify.error({text: 'Not logged in!'});
        }
        else if (currentPurchase.user_id) {
          Notify.error({text: 'Purchase allready saved!'});
        }
        else {
          currentPurchase.user_id = currentUser._id;
          $http.put('/api/purchases/' + currentPurchase._id, currentPurchase).success(function (data) {
            Notify.success({text: 'Purchase added to your account!'});
          }).error(function (data) {
            Notify.error({text: 'Even if you are logged in we could not add the purchase to your account. Please contact administrators!'});
          });
        }
      },

      /**
       * Get All Purchases
       */
      getAllPurchases: function () {
        return currentUser.purchases;
      }
    };
  });
