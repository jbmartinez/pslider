var Slider = (function() {

  // utility functions
  function addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
  }

  function removeClass(el, list) {
    if (el.classList) {
      // we can't do it in a single line, thanks IE!
      // DOMTokenList.prototype.remove.apply(el.classList, list.split(' '));
      list.split(' ').forEach(function(className) {
        el.classList.remove(className);
      });
    } else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + list.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  function deepExtend(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];

      if (!obj)
        continue;

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object') {
            deepExtend(out[key], obj[key]);
          } else {
            out[key] = obj[key];
          }
        }
      }
    }

    return out;
  }

  /* From Modernizr */
  function whichTransitionEvent(){
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }

  function whichAnimationEvent(){
    var t;
    var el = document.createElement('fakeelement');
    var animations = {
      'animation': 'animationend',
      'OAnimation': 'oAnimationEnd',
      'MozAnimation': 'animationend',
      'WebkitAnimation': 'webkitAnimationEnd'
    };

    for (t in animations) {
      if (el.style[t] !== undefined) {
        return animations[t];
      }
    }
  }

  /*
   * Slider object.
   */
  // Slider = function(options, element) {
  Slider = function(element, options) {
    this.$el  = document.getElementById(element);
    this._init(options || {});
  };

  Slider.defaults = {
    current: 0,      // index of current slide
    bgincrement: 50, // increment the bg position (parallax effect) when sliding
    autoplay: false, // slideshow on / off
    interval: 4000   // time between transitions
  };

  Slider.prototype = {
    _init: function(options) {

      this.options = deepExtend({}, Slider.defaults, options);

      // this.$slides = this.$el.children('div.da-slide');
      this.$slides = this.$el.querySelectorAll('div.da-slide');
      this.slidesCount = this.$slides.length;

      this.current = this.options.current;

      if (this.current < 0 || this.current >= this.slidesCount) {
        this.current  = 0;
      }

      // this.$slides.eq( this.current ).addClass( 'da-slide-current' );
      addClass(this.$slides[this.current], 'da-slide-current');

      var $navigation = document.createElement('nav');
      $navigation.className = 'da-dots';

      for (var i = 0; i < this.slidesCount; ++i) {
        var tmp = document.createElement('span');
        $navigation.appendChild(tmp);
      }

      this.$el.appendChild($navigation);

      // this.$pages = this.$el.find('nav.da-dots > span');
      this.$pages = this.$el.querySelectorAll('nav.da-dots > span');
      // convert to an array
      this.$pages = Array.prototype.slice.call(this.$pages);
      this.$navNext = this.$el.querySelector('span.da-arrows-next');
      this.$navPrev = this.$el.querySelector('span.da-arrows-prev');

      this.isAnimating  = false;
      this.bgpositer    = 0;

      // this.cssAnimations  = Modernizr.cssanimations;
      // this.cssTransitions  = Modernizr.csstransitions;
      this.cssAnimations  = true;
      this.cssTransitions  = true;

      // if ( !this.cssAnimations || !this.cssAnimations ) {
      //   this.$el.addClass( 'da-slider-fb' );
      // }

      this._updatePage();

      // load the events
      this._loadEvents();

      // slideshow
      if (this.options.autoplay) {
        this._startSlideshow();
      }

    },
    _navigate: function(page, dir) {
      var $current  = this.$slides[this.current], $next, _self = this;

      if (this.current === page || this.isAnimating) {
        return false;
      }

      this.isAnimating  = true;

      // check dir
      var classTo, classFrom, d;

      if (!dir) {
        (page > this.current) ? d = 'next' : d = 'prev';
      } else {
        d = dir;
      }

      if (this.cssAnimations && this.cssAnimations) {
        if (d === 'next') {
          classTo = 'da-slide-toleft';
          classFrom = 'da-slide-fromright';
          ++this.bgpositer;
        } else {
          classTo = 'da-slide-toright';
          classFrom = 'da-slide-fromleft';
          --this.bgpositer;
        }

        this.$el.style.backgroundPosition = this.bgpositer * this.options.bgincrement + '% 0%';
      }

      this.current = page;
      $next = this.$slides[this.current];

      if (this.cssAnimations && this.cssAnimations) {
        var rmClasses  = 'da-slide-toleft da-slide-toright da-slide-fromleft da-slide-fromright';
        removeClass($current, rmClasses);
        removeClass($next, rmClasses);

        addClass($current, classTo);
        addClass($next, classFrom);

        removeClass($current, 'da-slide-current');
        addClass($next, 'da-slide-current');
}

      // fallback
      // if ( !this.cssAnimations || !this.cssAnimations ) {
      //
      //   $next.css( 'left', ( d === 'next' ) ? '100%' : '-100%' ).stop().animate( {
      //     left : '0%'
      //   }, 1000, function() {
      //     _self.isAnimating = false;
      //   });
      //
      //   $current.stop().animate( {
      //     left : ( d === 'next' ) ? '-100%' : '100%'
      //   }, 1000, function() {
      //     $current.removeClass( 'da-slide-current' );
      //   });
      //
      // }

      this._updatePage();
    },
    _updatePage: function() {
      this.$pages.forEach(function(el) {
        removeClass(el, 'da-dots-current');
      });
      addClass(this.$pages[this.current], 'da-dots-current');
    },
    _startSlideshow: function() {
      var _self  = this;
      this.slideshow  = setTimeout( function() {
        var page = (_self.current < _self.slidesCount - 1) ? page = _self.current + 1 : page = 0;
        _self._navigate(page, 'next');

        if (_self.options.autoplay) {
          _self._startSlideshow();
        }
      }, this.options.interval );
    },
    page: function(idx) {
      if (idx >= this.slidesCount || idx < 0) {
        return false;
      }

      if (this.options.autoplay) {
        clearTimeout(this.slideshow);
        this.options.autoplay = false;
      }

      this._navigate(idx);
    },
    _loadEvents: function() {
      var _self = this;
      var pagesClick = function(event) {
        _self.page(_self.$pages.indexOf(event.target));
        return false;
      };
      // this.$pages.on( 'click.cslider', function( event ) {
      //   _self.page( $(this).index() );
      //   return false;
      // });
      this.$pages.forEach(function(el) {
        // el.addEventListener('click.cslider', pagesClick)
        el.addEventListener('click', pagesClick);
      });

      // this.$navNext.addEventListener('click.cslider', function(event) {
      this.$navNext.addEventListener('click', function(event) {
        if (_self.options.autoplay) {
          clearTimeout(_self.slideshow);
          _self.options.autoplay = false;
        }

        var page = (_self.current < _self.slidesCount - 1) ? page = _self.current + 1 : page = 0;
        _self._navigate(page, 'next');
        return false;
      });

      // this.$navPrev.addEventListener('click.cslider', function(event) {
      this.$navPrev.addEventListener('click', function(event) {
        if (_self.options.autoplay) {
          clearTimeout(_self.slideshow);
          _self.options.autoplay = false;
        }

        var page = (_self.current > 0) ? page = _self.current - 1 : page = _self.slidesCount - 1;
        _self._navigate(page, 'prev');
        return false;
      });

      if (this.cssTransitions) {
        if (!this.options.bgincrement) {
          // this.$el.addEventListener('webkitAnimationEnd.cslider animationend.cslider OAnimationEnd.cslider', function( event ) {
          var animationEvent = whichAnimationEvent();
          // this.$el.addEventListener('animationend', function( event ) {
          this.$el.addEventListener(animationEvent, function( event ) {
            if (event.animationName === 'toRightAnim4' || event.animationName === 'toLeftAnim4' ) {
              _self.isAnimating  = false;
            }
          });

        } else {
          // this.$el.on( 'webkitTransitionEnd.cslider transitionend.cslider OTransitionEnd.cslider', function( event ) {
          var transitionEvent = whichTransitionEvent();
          // this.$el.addEventListener('transitionend', function(event) {
          this.$el.addEventListener(transitionEvent, function(event) {
            if (event.target.id === _self.$el.id)
              _self.isAnimating  = false;
          });
        }
      }
    }
  };

  // var logError = function(message) {
  //   if (this.console) {
  //     console.error(message);
  //   }
  // };

  return Slider;
})();

if (typeof module != "undefined" && module.exports)
  module.exports = Slider;
