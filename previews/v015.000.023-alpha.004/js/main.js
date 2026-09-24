/* ==========================================================================
   File: main.js
   DOYDL TECHNOLOGIES: FRONTEND UI CONTROLLER
   ==========================================================================
   Description:
     - Primary UI initialization script for index.html (Landing Page).
     - Handles preloader animation, smooth scrolling, and parallax background effects.

   Features:
     - Preloader fade-out after full page (including images) loads.
     - Enables smooth scrolling via NiceScroll.
     - Activates parallax backgrounds with Stellar.js.
     - All logic is encapsulated in the App object.

   --------------------------------------------------------------------------
   DEPENDENCIES:
     - jQuery
     - NiceScroll (jquery.nicescroll.min.js)
     - Stellar.js (jquery.stellar.min.js)
     - index.html
   --------------------------------------------------------------------------
   NOTES:
     - Runs automatically on DOM and window load.
     - Designed for DOYDL Technologies homepage.
     - Last updated: 2025-08-07
========================================================================== */


/*global jQuery */
jQuery(function ($) {
  'use strict';

  var App = {
    $options: {},
    $loader: $(".loader"),
    $animationload: $(".animationload"),

    // Set up initial event bindings
    bindEvents: function() {
      $(window).on('load', this.load.bind(this));        // When full page (including images) is loaded
      $(document).on('ready', this.docReady.bind(this)); // When DOM is ready
    },

    // Handles the fade-out of the loading screen
    load: function() {
      /* ==============================================
      Page Preloader
      =============================================== */
      const gifDuration = 1000; // Duration before preloader is removed (ms)

      setTimeout(() => {
        this.$loader.fadeOut();
        this.$animationload.fadeOut("slow");
      }, gifDuration);
    },

    // Initializes scrolling and parallax after DOM is ready
    docReady: function() {
      /* ==============================================
      Enable Smooth Scrolling with NiceScroll
      =============================================== */
      $("html").niceScroll({
        scrollspeed: 50,
        mousescrollstep: 38,
        cursorwidth: 7,
        cursorborder: 0,
        autohidemode: true,
        zindex: 9999999,
        horizrailenabled: false,
        cursorborderradius: 0
      });

      /* ==============================================
      Activate Parallax Effects with Stellar.js
      =============================================== */
      $(window).stellar({
        horizontalScrolling: false,
        responsive: true,
        scrollProperty: 'scroll',
        parallaxElements: false,
        horizontalOffset: 0,
        verticalOffset: 0
      });

      // Placeholder for additional setup logic if needed
    },

    // Initializes the app with optional configuration
    init: function (_options) {
      $.extend(this.$options, _options);
      this.bindEvents();
    }
  };

  // Initialize the app to kick things off
  App.init();

});
