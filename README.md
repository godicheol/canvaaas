[DEMO](https://godicheol.github.io/canvaaas/)

## HTML

```html
<style>
  #target{
    padding: 24px; /* overlay size */
    margin: 0 auto; /* container align center */
    overflow: hidden; /* recommend */
  }
</style>
<!-- Main container -->
<div id="target"></div>
```

## Set size to js

```html
<script>
  canvaaas.config({
    aspectRatioOfContainer: 1 / 1, // number, width / height
    maxWidthOfContainer: 500, // number, px
    maxHeightOfContainer: 500, // number, px
  })
</script>
```

## Set size to css

```html
<style>
  #target{
    box-sizing: border-box; /* recommend */
    width: 100%;
    height: 500px;
  }
</style>
<script>
  canvaaas.config({
    aspectRatioOfContainer: undefined 
  })
</script>
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
    allowedMimeTypesForUpload: [
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
    aspectRatioOfContainer: 1 / 1, // number, width / height
    maxWidthOfContainer: undefined, // number, px
    maxHeightOfContainer: undefined, // number, px
    startIndexAfterRender: 1, // number
    maxIndexAfterRender: 1000, // number
    imageScaleAfterRender: 0.5, // number, 0 ~ 1 scale in canvas
    lockAspectRatioAfterRender: false, // boolean
    showBorderAfterRender: true, // boolean
    showGridAfterRender: true, // boolean
    showPivotAfterRender: true, // boolean
    setHandleAfterRender: {}, // object
    click: undefined, // function(err, res)
    rightClick: undefined, // function(err, event, res)
    clickHandle: undefined, // function(err, res, direction)
    upload: undefined, // function(err, res)
    edit: undefined, // function(err, res)
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
    filename: "untitled", // string, without extension
    mimetype: "image/png", // string
    quality: 0.92, // number, 0 ~ 1
    background: "transparent", // string, "transparent" or "#FFFFFF" ~ "#000000"
    overlay: true, // boolean
    checker: true, // boolean
    ruler: false, // boolean
    uploadable: true, // boolean
    clickable: true, // boolean
    editable: true, // boolean
  }, function(err, res){
    // Your code
  });
</script>
```

## Open image

```html
<input id="blahblah" type="file" onchange="canvaaas.uploadFiles(this.files)" accept="image/*" multiple>
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
    "scaleX": 1,
    "scaleY": 1,
    "opacity": 1,
    "lockAspectRatio": false,
    "visible": true,
    "clickable": true,
    "editable": true,
    "indexable": true,
    "movable": true,
    "resizable": true,
    "rotatable": true,
    "flippable": true,
    "croppable": true,
    "filterable": true,
    "removable": true,
    "drawable": true,
    "border": true,
    "pivot": true,
    "grid": true,
  }, {
    "id": "test-2",
    "src": "http://localhost:3000/img/1.png",
    "index": 3,
    "x": 1005.7025081608402,
    "y": 233.64928605958755,
    "width": 2124.7504194708827,
    "height": 2124.7504194708827,
    "cropTop": 801.2362568440648,
    "cropBottom": 749.4330219066668,
    "cropLeft": 671.584540163499,
    "cropRight": 723.0107480910889,
    "rotate": 6.213787277395312,
    "scaleX": 1,
    "scaleY": 1,
    "opacity": 1,
    "lockAspectRatio": false,
    "visible": true,
    "clickable": true,
    "editable": true,
    "indexable": true,
    "movable": true,
    "resizable": true,
    "rotatable": true,
    "flippable": true,
    "croppable": true,
    "filterable": true,
    "removable": true,
    "drawable": true,
    "border": true,
    "pivot": true,
    "grid": true,
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
  data-indexable = "true"
  data-movable = "true"
  data-resizable = "true"
  data-rotatable = "true"
  data-flippable = "true"
  data-croppable = "true"
  data-filterable = "true"
  data-removable = "true"
  data-drawable = "true"
  data-border = "true"
  data-pivot = "true"
  data-grid = "true">

<script>
  // Argument type `Array`
  canvaaas.uploadElements([document.getElementById("blahblah")], function(err, res){
    // Your code
  });
</script>
```

## Save image

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

## Save image from JSON data

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
  }], function(err, file, result){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.drawTo() callback", file, result);
  });
</script>
```

## Edit image

```html
<script>
  canvaaas.state(id, {
    "id": "test", // string
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
    "indexable": true, // boolean
    "movable": true, // boolean
    "resizable": true, // boolean
    "rotatable": true, // boolean
    "flippable": true, // boolean
    "croppable": true, // boolean
    "filterable": true, // boolean
    "removable": true, // boolean
    "drawable": true, // boolean
    "border": true, // boolean
    "pivot": true, // boolean
    "grid": true, // boolean
    "handle": {
      'n': 'resize',
      'ne': 'resize',
      'e': 'resize',
      'se': 'resize',
      's': 'resize',
      'sw': 'resize',
      'w': 'resize',
      'nw': 'resize',
    } // object (keys: n, s, e, w, ne, nw, se, sw, nn, ss, ee, ww, nene, nwnw, sese, swsw)
  }, function(err, res) {
    // Your code
  })
</script>
```

```html
<script>
  canvaaas.state(id, {
    "rotate": 45, // number
    "opacity": 0.5, // number, min: 0, max: 1
  }, function(err, res) {
    // Your code
  })
</script>
```

## Add filter

```html
<script>
  canvaaas.filter(id, function(red, green, blue, alpha) {
    var luma = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    return [luma, luma, luma, alpha]; // return [red, green, blue, alpha];
  }, function(err, res) {
    // Your code
  })
</script>
```

## Remove filter

```html
<script>
  canvaaas.filter(id, null, function(err, res) {
    // Your code
  })
</script>
```

## Handle style

```html
<script>
  canvaaas.handle(id, {
    'n': 'resize',
    'ne': 'resize',
    'e': 'resize',
    'se': 'resize',
    's': 'resize',
    'sw': 'resize',
    'w': 'resize',
    'nw': 'resize',
    "nn": "rotate",
    "nene": null, // hide
    "ee": "flip",
    "sese": null, // hide
    "ss": "click", // config.clickHandle callback
    "swsw": null, // hide
    "ww": "click", // config.clickHandle callback
    "nwnw": null, // hide
  }, function(err, res){
    // Your code
  });
</script>
```

```html
<script>
  canvaaas.handle(id, {
    'n': 'crop',
    'e': 'crop',
    's': 'crop',
    'w': 'crop',
  }, function(err, res){
    // Your code
  });
</script>
```

## Global handle style

```html
<script>
  canvaaas.config({
    setHandleAfterRender: {
      'n': 'resize',
      'ne': 'resize',
      'e': 'resize',
      'se': 'resize',
      's': 'resize',
      'sw': 'resize',
      'w': 'resize',
      'nw': 'resize',
      "nn": "rotate",
      "ee": "flip",
      "nene": null, // hide
    }
  }, function(err, res){
    // Your code
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
    clickHandle: function(err, res, direction) {
      if (err) { return false; }
      var id = res.id;
      switch(direciton) {
        case "n":
          canvaaas.rotate(id, 50);
          break;
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
canvaaas.export([id, id], function(err, res){
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
    "indexable": true,
    "movable": true,
    "resizable": true,
    "rotatable": true,
    "flippable": true,
    "croppable": true,
    "filterable": true,
    "removable": true,
    "drawable": true,
    "border": true,
    "pivot": true,
    "grid": true,
  }, {
    "id": "test-2",
    "src": "http://localhost:3000/img/1.png",
    "index": 3,
    "x": 1005.7025081608402,
    "y": 233.64928605958755,
    "width": 2124.7504194708827,
    "height": 2124.7504194708827,
    "cropTop": 801.2362568440648,
    "cropBottom": 749.4330219066668,
    "cropLeft": 671.584540163499,
    "cropRight": 723.0107480910889,
    "rotate": 6.213787277395312,
    "scaleX": 1,
    "scaleY": 1,
    "opacity": 1,
    "lockAspectRatio": false,
    "visible": true,
    "clickable": true,
    "editable": true,
    "indexable": true,
    "movable": true,
    "resizable": true,
    "rotatable": true,
    "flippable": true,
    "croppable": true,
    "filterable": true,
    "removable": true,
    "drawable": true,
    "border": true,
    "pivot": true,
    "grid": true,
  }]

  canvaaas.import(exportedStates, function(err, res){
    // Your code
  })
</script>
```
