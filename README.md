[DEMO](https://godicheol.github.io/canvaaas/)

## HTML

```html
<style>
  #target{
    position: relative; /* required */
    box-sizing: border-box; /* for width 100% */
    width: 100%; /* required */
    height: 500px; /* required */
  }
</style>

<!-- Main container -->
<div id="target"></div>
```

## Init

```html
<script>
  canvaaas.init(document.getElementById("target"), function(err, res){
    // Your code
  });
</script>
```

## Set config

```html
<script>
  canvaaas.config({
    allowedMimeTypes: [
      "image/bmp",
      "image/x-ms-bmp",
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg",
      "image/svg+xml",
      "image/tiff",
      "image/tif",
      "image/webp",
    ], // array of allowed mimetypes
    cacheLevels: 999, // number
    startIndexAfterRender: 1, // number
    maxIndexAfterRender: 1000, // number
    imageScaleAfterRender: 0.5, // number, 0 ~ 1 scale in canvas
    lockAspectRatioAfterRender: false, // boolean
    showGridAfterRender: true, // boolean
    showPivotAfterRender: true, // boolean
    showBorderAfterRender: {
      "n": "crop",
      "s": "crop",
      "e": "crop",
      "w": "crop",
    }, // object
    showHandleAfterRender: {
      "n": "resize",
      "s": "resize",
      "e": "resize",
      "w": "resize",
      "ne": "resize",
      "nw": "resize",
      "se": "resize",
      "sw": "resize",
      "nn": "rotate",
      "ee": "flip",
    }, // object
    click: undefined, // function(err, res, event)
    rightClick: undefined, // function(err, res. event)
    upload: undefined, // function(err, res)
    edit: undefined, // function(err, res, event)
    remove: undefined, // function(err, res)
  }, function(err, res) {
    // Your code
  });
</script>
```

## New canvas

```html
<script>
  canvaaas.new({
    originalWidth: 1200, // number, required
    originalHeight: 1200, // number, required
    background: "transparent", // string, "transparent" or "#FFFFFF" ~ "#000000"
    overflow: true, // boolean
    checker: true, // boolean
    uploadable: true, // boolean
    clickable: true, // boolean
    editable: true, // boolean
    movable: true, // boolean
    resizable: true, // boolean
    rotatable: true, // boolean
    flippable: true, // boolean
    croppable: true, // boolean
  }, function(err, res){
    // Your code
  });
</script>
```

## Canvas divide

```html
<script>
  canvaaas.canvas({
    originalWidth: 1200, // number
    originalHeight: 1200, // number
    x: 600, // number
    y: 300, // number
    width: 1200, // number
    height: 600 // number
  }, function(err, res){
    // Your code
  });
</script>
```

## Open image

```html
<input type="file" onchange="canvaaas.uploadFiles(this.files)" accept="image/*" multiple>
```

```html
<script>
  // Argument type `Array`
  canvaaas.uploadUrls(["./img/1.png", "./img/2.png"], function(err, res){
    // Your code
  });
</script>
```

```html
<script>
  var exportedStates = [{
    "id": "test-1",
    "src": "http://localhost:3000/img/2.jpg",
    "index": 2,
    "x": 502.5849709826538,
    "y": 986.9335338039346,
    "width": 2193.6405871177067,
    "height": 2924.854116156941,
    "cropTop": 0,
    "cropBottom": 0,
    "cropLeft": 651.3696207894449,
    "cropRight": 621.4903760197732,
    "rotate": -17.881805128766516,
    "scaleX": 1, // flipY
    "scaleY": 1, // flipX
    "opacity": 1,
  }];
  // Argument type `Array`
  canvaaas.uploadStates(exportedStates, function(err, res){
    // Your code
  });
</script>
```

```html
<img
  id="blahblah"
  src="./img/1.png"
  data-id = "1"
  data-index = "1"
  data-width = "600"
  data-height = "600"
  data-x = "399.07235621521335"
  data-y = "808.7198515769946"
  data-rotate = "17.46323891797897"
  data-scale-x = "1"
  data-scale-y = "1"
  data-opacity = "1"
  data-crop-top = "0"
  data-crop-bottom = "0"
  data-crop-left = "0"
  data-crop-right = "0"
  data-lock-aspect-ratio = "false"
  data-visible = "true"
  data-clickable = "true"
  data-editable = "true"
  data-movable = "true"
  data-resizable = "true"
  data-rotatable = "true"
  data-flippable = "true"
  data-croppable = "true"
  data-drawable = "true"
  data-pivot = "true"
  data-grid = "true">

<script>
  // Argument type `Array`
  canvaaas.uploadElements([document.getElementById("blahblah")], function(err, res){
    // Your code
  });
</script>
```

## Create image

```html
<script>
  canvaaas.draw({
    filename: 'filename', // optional
    mimeType: 'image/png', // optional
    quality: 0.92, // optional
    width: 256, // optional
    height: 256, // optional
    background: '#FFFFFF', // optional, rgb format, 7 characters or "transparent"
    filter: function(red, green, blue, alpha) {
      var luma = red * 0.2126 + green * 0.7152 + blue * 0.0722; // grayscale
      return [luma, luma, luma, alpha];
    } // optional
  }, function(err, file, result){
    // Your code
  });
</script>
```

## Create image with JSON data

```html
<script>
  canvaaas.drawTo({
    filename: 'filename', // optional
    mimeType: 'image/png', // optional
    quality: 0.92, // optional
    width: 256, // optional
    height: 256, // optional
    background: '#FFFFFF', // optional, rgb format, 7 characters or "transparent"
    filter: function(red, green, blue, alpha) {
      var luma = red * 0.2126 + green * 0.7152 + blue * 0.0722; // grayscale
      return [luma, luma, luma, alpha];
    } // optional
  }, [{
    "src": "./img/1.png", // required
    "index": 1, // required
    "width": 600.0000000000001, // required
    "height": 600.0000000000001, // required
    "x": 399.07235621521335, // required
    "y": 808.7198515769946, // required
    "rotate": 17.46323891797897, // optional
    "scaleX": 1, // optional
    "scaleY": 1, // optional
    "opacity": 1, // optional
    "cropTop": 0, // optional
    "cropBottom": 0, // optional
    "cropLeft": 0, // optional
    "cropRight": 0, // optional
    "drawable": true, // optional
  }], function(err, file, result){
    // Your code
  });
</script>
```

## Find image
```html
<script>
  var option = {
    drawable: true
  }
  canvaaas.find(option, function(err, res){
    // Your code
  })
</script>
```

## Edit image

```html
<script>
  canvaaas.state(id, {
    "index": 1, // number
    "x": 399.07235621521335, // number
    "y": 808.7198515769946, // number
    "width": 600.0000000000001, // number
    "height": 600.0000000000001, // number
    "rotate": 17.46323891797897, // number
    "scaleX": 1, // number, 1 or -1
    "scaleY": 1, // number, 1 or -1
    "opacity": 1, // number, min: 0, max: 1
    "cropTop": 0, // number, min: 0
    "cropBottom": 0, // number, min: 0
    "cropLeft": 0, // number, min: 0
    "cropRight": 0, // number, min: 0
    "lockAspectRatio": true, // boolean
    "visible": true, // boolean
    "clickable": true, // boolean
    "editable": true, // boolean
    "movable": true, // boolean
    "resizable": true, // boolean
    "rotatable": true, // boolean
    "flippable": true, // boolean
    "croppable": true, // boolean
    "drawable": true, // boolean
    "pivot": true, // boolean
    "grid": true, // boolean
    "border": {
      'n': 'crop',
      'e': 'crop',
      's': 'crop',
      'w': 'crop',
    }, // object (key: n, s, e, w)
    "handle": {
      'n': 'resize',
      'ne': 'resize',
      'e': 'resize',
      'se': 'resize',
      's': 'resize',
      'sw': 'resize',
      'w': 'resize',
      'nw': 'resize',
    } // object (key: n, s, e, w, ne, nw, se, sw, nn, ss, ee, ww, nene, nwnw, sese, swsw)
  }, function(err, res) {
    // Your code
  })
</script>
```

```html
<script>
  canvaaas.id(id, newId);
  canvaaas.moveX(id, 45);
  canvaaas.moveY(id, -45);
  canvaaas.zoom(id, 1.1);
  canvaaas.width(id, 45);
  canvaaas.height(id, -45);
  canvaaas.rotate(id, 45);
  canvaaas.flipX(id);
  canvaaas.flipY(id);
  canvaaas.opacity(id, -0.1);
  canvaaas.cropTop(id, 10);
  canvaaas.cropBottom(id, 10);
  canvaaas.cropLeft(id, 10);
  canvaaas.cropRight(id, 10);
  canvaaas.index(id, 1);
  canvaaas.index(id, -3);
  canvaaas.clickable(id);
  canvaaas.editable(id);
  canvaaas.movable(id);
  canvaaas.resizable(id);
  canvaaas.rotatable(id);
  canvaaas.flippable(id);
  canvaaas.croppable(id);
  canvaaas.drawable(id);
  canvaaas.cover(id);
  canvaaas.contain(id);
  canvaaas.remove(id);
  canvaaas.handle(id, {
    'n': 'resize',
    'e': 'rotate',
    's': 'crop',
    'w': 'flip',
    'nw': 'click',
    'nn': 'resize',
    'nwnw': 'resize',
  });
  canvaaas.border(id, {
    'n': 'resize',
    'e': 'crop',
    's': 'click',
    'w': 'flip',
  });
</script>
```

## Custom handle event

```html
<script>
  canvaaas.handle(id, {
    n: "click"
  });

  canvaaas.config({
    edit: function(err, res, evt) {
      if (err) { return false; }
      if (evt && evt.status === "start" && evt.direction === "n") {
          canvaaas.addClassToHandle(evt.id, evt.direction, "editing");
      }
      if (evt && evt.status === "end" && evt.direction === "n") {
          canvaaas.removeClassToHandle(evt.id, evt.direction, "editing");
          canvaaas.rotate(evt.id, 50);
      }
    }
  }, function(err, res){
    // Your code
  })
</script>
```

## Export

```html
<script>
canvaaas.export([id1, id2], function(err, res){
  // Your code
});
</script>
```

## Import

```html
<script>

  var exportedStates = [{
    "id": "test-1",
    "src": "http://localhost:3000/img/2.jpg",
    "index": 2,
    "x": 502.5849709826538,
    "y": 986.9335338039346,
    "width": 2193.6405871177067,
    "height": 2924.854116156941,
    "cropTop": 0,
    "cropBottom": 0,
    "cropLeft": 651.3696207894449,
    "cropRight": 621.4903760197732,
    "rotate": -17.881805128766516,
    "scaleX": 1,
    "scaleY": 1,
    "opacity": 1,
    "lockAspectRatio": false,
    "visible": true,
    "clickable": true,
    "editable": true,
    "movable": true,
    "resizable": true,
    "rotatable": true,
    "flippable": true,
    "croppable": true,
    "drawable": true,
    "pivot": true,
    "grid": true,
  }];

  canvaaas.import(exportedStates, function(err, res){
    // Your code
  })
</script>
```
