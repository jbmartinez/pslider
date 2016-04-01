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
   * Private functions
   */
  function createNav(slidesCount) {
    var $navigation = document.createElement('nav');
    $navigation.className = 'da-dots';

    for (var i = 0; i < slidesCount; ++i) {
     var tmp = document.createElement('span');
     $navigation.appendChild(tmp);
    }
    return $navigation;
  }

  function init(slider, options) {
    slider.options = deepExtend({}, Slider.defaults, options);

    slider.$slides = slider.$el.querySelectorAll('.da-slide');
    slider.slidesCount = slider.$slides.length;
    slider.current = slider.options.current;

    if (slider.current < 0 || slider.current >= slider.slidesCount) {
     slider.current  = 0;
    }

    addClass(slider.$slides[slider.current], 'da-slide-current');

    var $navigation = createNav(slider.slidesCount);
    slider.$el.appendChild($navigation);

    slider.$pages = slider.$el.querySelectorAll('nav.da-dots > span');
    slider.$pages = Array.prototype.slice.call(slider.$pages);
    slider.$navNext = slider.$el.querySelector('span.da-arrows-next');
    slider.$navPrev = slider.$el.querySelector('span.da-arrows-prev');

    slider.isAnimating  = false;
    slider.bgpositer = 0;

    updatePage(slider);

    // load the events
    loadEvents(slider);

    // slideshow
    if (slider.options.autoplay) {
     startSlideshow(slider);
    }
  }

  function updatePage(slider) {
    var pages = slider.$pages;
    pages.forEach(function(el) {
      removeClass(el, 'da-dots-current');
    });
    addClass(pages[slider.current], 'da-dots-current');
  }

  function startSlideshow(slider) {
    slider.slideshow  = setTimeout( function() {
      if (!slider.options.autoplay) {
        return;
      }
      var page = (slider.current < slider.slidesCount - 1) ? slider.current + 1 : 0;
      navigate(slider, page, 'next');
      startSlideshow(slider);
    }, slider.options.interval );
  }

  function navigate(slider, page, dir) {
    if (slider.current === page || slider.isAnimating) {
      return false;
    }

    var $current = slider.$slides[slider.current];
    var $next;

    slider.isAnimating = true;

    // check dir
    var classTo, classFrom, d;

    if (!dir) {
      d = page > slider.current ? 'next' : 'prev';
    } else {
      d = dir;
    }

    if (d === 'next') {
      classTo = 'da-slide-toleft';
      classFrom = 'da-slide-fromright';
      ++slider.bgpositer;
    } else {
      classTo = 'da-slide-toright';
      classFrom = 'da-slide-fromleft';
      --slider.bgpositer;
    }

    slider.$el.style.backgroundPosition = slider.bgpositer * slider.options.bgincrement + '% 0%';

    slider.current = page;
    $next = slider.$slides[slider.current];

    var rmClasses  = 'da-slide-toleft da-slide-toright da-slide-fromleft da-slide-fromright';
    removeClass($current, rmClasses);
    removeClass($next, rmClasses);

    addClass($current, classTo);
    addClass($next, classFrom);

    removeClass($current, 'da-slide-current');
    addClass($next, 'da-slide-current');

    updatePage(slider);
  }

  function loadEvents(slider) {
    var pagesClick = function(event) {
      slider.page(slider.$pages.indexOf(event.target));
      return false;
    };

    slider.$pages.forEach(function(el) {
      el.addEventListener('click', pagesClick);
    });

    slider.$navNext.addEventListener('click', function(event) {
      if (slider.options.autoplay) {
        clearTimeout(slider.slideshow);
        slider.options.autoplay = false;
      }

      var page = slider.current < slider.slidesCount - 1 ? slider.current + 1 : 0;
      navigate(slider, page, 'next');
      return false;
    });

    slider.$navPrev.addEventListener('click', function(event) {
      if (slider.options.autoplay) {
        clearTimeout(slider.slideshow);
        slider.options.autoplay = false;
      }

      var page = slider.current > 0 ? slider.current - 1 : slider.slidesCount - 1;
      navigate(slider, page, 'prev');
      return false;
    });

    if (!slider.options.bgincrement) {
      var animationEvent = whichAnimationEvent();
      slider.$el.addEventListener(animationEvent, function( event ) {
        if (event.animationName === 'toRightAnim4' || event.animationName === 'toLeftAnim4' ) {
          slider.isAnimating  = false;
        }
      });

    } else {
      var transitionEvent = whichTransitionEvent();
      slider.$el.addEventListener(transitionEvent, function(event) {
        if (event.target.id === slider.$el.id) {
          slider.isAnimating  = false;
        }
      });
    }
  }

  /*
   * Slider object.
   */
  Slider = function(element, options) {
    this.$el  = document.getElementById(element);
    init(this, options || {});
  };

  Slider.defaults = {
    current: 0,      // index of current slide
    bgincrement: 50, // increment the bg position (parallax effect) when sliding
    autoplay: false, // slideshow on / off
    interval: 4000   // time between transitions
  };

  Slider.prototype = {
    page: function(idx) {
      if (idx >= this.slidesCount || idx < 0) {
        return false;
      }

      if (this.options.autoplay) {
        clearTimeout(this.slideshow);
        this.options.autoplay = false;
      }

      navigate(this, idx);
    }
  };

  return Slider;
})();

if (typeof module != "undefined" && module.exports)
  module.exports = Slider;
