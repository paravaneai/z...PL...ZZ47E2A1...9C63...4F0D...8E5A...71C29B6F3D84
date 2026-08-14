/* ==========================================================================
   File: animated.js
   DOYDL TECHNOLOGIES: HOMEPAGE PARTICLE ANIMATION SCRIPT
   ==========================================================================
   Description:
     Renders animated "rain" particles on the home header background canvas
     to create a subtle, floating motion effect on the landing section.

   Used in:
     - index.html (applies to #app-body and #rain-canvas)

   Main Features:
     - Full-screen, responsive canvas animation
     - Particles ("raindrops") fall from above and fade as they move
     - Pauses animation when user scrolls past the hero/header
     - Adapts to window resize events

   --------------------------------------------------------------------------
   DEPENDENCIES:
     - None (pure vanilla JS)
     - Canvas element with id="rain-canvas" inside #app-body
   --------------------------------------------------------------------------
   NOTES:
     - All code is self-contained and runs on page load.
     - Adjust the `for` loop for circle count to increase/decrease particle density.
     - Last updated: 2025-08-07
========================================================================== */


(function() {
    var width, height, largeHeader, canvas, ctx, circles, target, animateHeader = true;

    // Initialize the canvas and animation
    initHeader();
    addListeners();

    // Sets up canvas size, header height, and initial circle particles
    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: 0, y: height};

        largeHeader = document.getElementById('app-body');
        // largeHeader.style.height = height + 'px';

        canvas = document.getElementById('rain-canvas');  // Main Page for index.html
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // Create rain drops
        circles = [];
        for (var x = 0; x < width * 12.1; x++) {  // Increase loop for amount of rain       	
            var c = new Circle();
            circles.push(c);
        }

        animate();
    }

    // Add scroll and resize event listeners
    function addListeners() {
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    // Pause animation when user scrolls past the header
    function scrollCheck() {
        animateHeader = document.body.scrollTop <= height;
    }

    // Adjust canvas and header size on window resize
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height + 'px';
        canvas.width = width;
        canvas.height = height;
    }

    // Main animation loop: clears and redraws all circles
    function animate() {
        if (animateHeader) {
            ctx.clearRect(0, 0, width, height);
            for (var i in circles) {
                circles[i].draw();
            }
        }
        requestAnimationFrame(animate);
    }

    // Circle constructor: defines each particle's position, opacity, size, and behavior
    function Circle() {
        var _this = this;

        // Initialize a circle's properties
        (function init() {
            _this.pos = {};
            reset();
        })();

        // Reset circle when it fades out or moves out of view
        function reset() {
            _this.pos.x = Math.random() * width;
            // _this.pos.y = height + Math.random() * 100;						// Original: Make particles rise from below
            _this.pos.y = -Math.random() * 100; 											// Modified: Make particles fall from above          
            _this.alpha = 0.1 + Math.random() * 0.3;
            _this.scale = 0.1 + Math.random() * 0.3;
            _this.velocity = 1 + Math.random() * 2;  									// Modified: Make particles fall faster 
        }

        // Draw the circle with decreasing opacity as it moves up
        this.draw = function() {
            if (_this.alpha <= 0) {
                reset();
            }
           // _this.pos.y -= _this.velocity;													// Original: Make particles rise from below           
            _this.pos.y += _this.velocity * 1.5; 											// Modified: Make particles fall from above                     
            _this.alpha -= 0.0005;

            
            // ctx.beginPath();
            // ctx.arc(_this.pos.x, _this.pos.y, _this.scale * 10, 0, 2 * Math.PI, false);
            // ctx.fillStyle = 'rgba(255,255,255,' + _this.alpha + ')';
            // ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,' + _this.alpha + ')';
            ctx.lineWidth = 1 * _this.scale; // Adjust width to scale
            ctx.moveTo(_this.pos.x, _this.pos.y);
            ctx.lineTo(_this.pos.x, _this.pos.y + 10 * _this.scale); // Length of the raindrop
            ctx.stroke();

        };
    }
})();


