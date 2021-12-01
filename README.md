[DEMO](https://godicheol.github.io/canvaaas/)

## HTML

```html
<style>
  #target{
    margin: 24px; /* overlay size */
    overflow: hidden; /* recommend */
  }
</style>
```

```html
<!-- MAIN ELEMENT -->
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

## Set config (optional)

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
    showGridAfterRender: true, // boolean
    showPivotAfterRender: true, // boolean
    click: undefined, // function(err, res)
    rightClick: undefined, // function(err, res, next)
    doubleClick: undefined, // function(err, res)
    clickHandle: undefined, // function(err, res, direction)
    upload: undefined, // function(err, res)
    edit: undefined, // function(err, res)
    remove: undefined, // function(err, res)
  }, function(err, res) {
    // Your code
  });
</script>
```

## New canvas (optional)

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
  // Argument type `Array`
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
    "drawable": true,
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
    "drawable": true,
  }];
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
  data-drawable = "true">

<script>
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
    background: '#000000', // optional, rgb format, 7 characters or "transparent"
  }, function(err, file, result){
    // Your code
  });
</script>
```

## Save image with filter

```html
<script>
  canvaaas.draw({
    filter: function(red, green, blue, alpha) {
      var luma = red * 0.2126 + green * 0.7152 + blue * 0.0722; // grayscale
      return [luma, luma, luma, alpha];
    }
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
    dataType: 'url', // optional
    mimeType: 'image/png', // optional
    width: 1800, // required
    height: 1200, // required
    drawWidth: 3600, // optional
    drawHeight: 3600, // optional
    quality: 0.92, // optional
    background: '#FFFFFF', // optional, rgb format, 7 characters
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
    "drawable": true, // boolean
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
      "n-n": null,
      "ne-ne": null,
      "e-e": null,
      "se-se": null,
      "s-s": null,
      "sw-sw": null,
      "w-w": null,
      "nw-nw": null,
    }
  }, function(err, res) {
    // Your code
  })
</script>
```

## Add filter

```html
<script>
  canvaaas.filter("id", function(red, green, blue, alpha) {
    var luma = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    return [luma, luma, luma, alpha]; // return [red, green, blue, alpha];
  }, function(err, res) {
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
    "n-n": "rotate",
    "ne-ne": null, // hide
    "e-e": "flip",
    "se-se": null, // hide
    "s-s": "click", // config.clickHandle callback
    "sw-sw": null, // hide
    "w-w": "click", // config.clickHandle callback
    "nw-nw": null, // hide
  }, function(err, res){
    // Your code
  });
</script>
```

```html
<script>
  canvaaas.handleAll({
    'n': 'crop',
    'ne': 'crop',
    'e': 'crop',
    'se': 'crop',
    's': 'crop',
    'sw': 'crop',
    'w': 'crop',
    'nw': 'crop',
    "n-n": null, // hide
    "ne-ne": null, // hide
    "e-e": null, // hide
    "se-se": null, // hide
    "s-s": null, // hide
    "sw-sw": null, // hide
    "w-w": null, // hide
    "nw-nw": null, // hide
  }, function(err, res){
    // Your code
  });
</script>
```

## Export

```html
<script>
canvaaas.export(["id-1", "id-2"], function(err, res){
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
    "drawable": true,
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
    "drawable": true,
  }]

  canvaaas.import(exportedStates, function(err, res){
    // Your code
  })
</script>
```
