'use strict';

angular.module('europeuropApp')
  .factory('Notify', function ($rootScope) {
      // $.noty.defaults = {
      //   layout: 'top',
      //   theme: 'defaultTheme', // or 'relax'
      //   type: 'alert',
      //   text: '', // can be html or string
      //   dismissQueue: true, // If you want to use queue feature set this true
      //   template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
      //   animation: {
      //     open: {height: 'toggle'}, // or Animate.css class names like: 'animated bounceInLeft'
      //     close: {height: 'toggle'}, // or Animate.css class names like: 'animated bounceOutLeft'
      //     easing: 'swing',
      //     speed: 500 // opening & closing animation speed
      //   },
      //   timeout: false, // delay for closing event. Set false for sticky notifications
      //   force: false, // adds notification to the beginning of queue when set to true
      //   modal: false,
      //   maxVisible: 5, // you can set max visible notification for dismissQueue true option,
      //   killer: false, // for close all notifications before show
      //   closeWith: ['click'], // ['click', 'button', 'hover', 'backdrop'] // backdrop click will close all notifications
      //   callback: {
      //     onShow: function() {},
      //     afterShow: function() {},
      //     onClose: function() {},
      //     afterClose: function() {},
      //     onCloseClick: function() {},
      //   },
      //   buttons: false // an array of buttons
      // };
      // var n = noty({
      //     text: 'Codes saved!',
      //     type: 'success',
      //     animation: {
      //         open: 'animated bounceInLeft', // Animate.css class names
      //         close: 'animated bounceOutLeft', // Animate.css class names
      //         easing: 'swing', // easing
      //         speed: 500, // opening & closing animation speed
      //         timeout: 200
      //     }
      // });

    function getDefaults(options, type) {
      var options = options || {};
      var defaults = {
        text        : 'asdf',
        type        : type,
        layout      : 'topLeft',
        theme       : 'relax',
        timeout     : 5000,
        dismissQueue: false,
        maxVisible  : 5,
        closeWith   : [],
        animation   : {
          open  : 'animated bounceInLeft',
          close : 'animated bounceOutLeft',
          easing: 'swing',
          speed : 500
        }
      };
      return _.extend(defaults, options);
    }

    // Public API here
    return {
      confirm: function (options) {
        // body...
      },
      success: function (options) {
        options = getDefaults(options, 'success');
        noty(options);
      },
      error: function (options) {
        options = getDefaults(options, 'error');
        noty(options);
      },
      warning: function (options) {
        options = getDefaults(options, 'warn');
        noty(options);
      }
    }
  });