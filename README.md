# pslider

A simple parallax content slider based on [this codrops article](http://tympanus.net/codrops/2012/03/15/parallax-content-slider-with-css3-and-jquery/).
I removed jQuery dependency and made it more reusable. It has no dependencies and
works on IE10+ and modern browsers.

I used to call it cslider, but I think it's better to give it another name because
I modified it quite a bit.

## Usage

```html
<div id="my-slider" class="da-slider">
    <div class="da-slide">
        <div class="da-anim1"><img src="image1.png" alt="image01" /></div>
    </div>
    <div class="da-slide">
        <div class="da-anim1"><img src="image2.png" alt="image01" /></div>
    </div>
</div>

<script type="text/javascript" src="pslider.js"></script>

<script type="text/javascript">
    // initialize the slider passing the element's id
    new Slider('my-slider');
</script>
```

You can also `require` it:

```js
var Slider = require('pslider');

var mySlider = new Slider('my-slider');
```

See the demo and the original article.

## (Possible) TODO

* Cleaning and refactoring (likely using ES2015)
* Better animation handling
* A few additional options

## License

MIT
