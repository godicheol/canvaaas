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
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.uploadStates() callback", res, status);
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
  canvaaas.uploadElements([document.getElementById("blahblah")], function(err, res, status){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.uploadElements() callback", res, status);
  });
</script>
```

## Save image

```html
<script>
  canvaaas.draw({
    filename: 'filename', // optional
    dataType: 'url',  // optional, "url" or "file"
    mimeType: 'image/png', // optional
    width: 256, // optional
    height: 256, // optional
    quality: 0.5, // optional
    background: '#000000', // optional, rgb format, 7 characters
  }, function(err, file, result){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.draw() callback", file, result);
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
    "editabled": true, // boolean
    "focusabled": true, // boolean
    "drawabled": true, // boolean
  }, function(err, res) {
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.state() callback", res);
  })
</script>
```
## Handle style

```html
<script>
  canvaaas.handle({
    inside: {
      n: "resize", // resize, crop
      ne: "resize", // resize, crop
      e: "resize", // resize, crop
      se: "resize", // resize, crop
      s: "resize", // resize, crop
      sw: "resize", // resize, crop
      w: "resize", // resize, crop
      nw: "resize" // resize, crop
    },
    outside: {
      n: "rotate", // rotate, flip, crop, resize
      ne: "flip", // flip, crop, resize
      e: "flip", // rotate, flip, crop, resize
      se: "flip", // flip, crop, resize
      s: "flip", // rotate, flip, crop, resize
      sw: "flip", // flip, crop, resize
      w: "flip", // rotate, flip, crop, resize
      nw: "flip" // flip, crop, resize
    }
  }, function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.handle() callback", res);
  });
</script>
```

## Export

```html
<script>
  canvaaas.export(function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log('canvaaas.export()', res);
  });
</script>
```

## Import

```html
<script>

  var exportedStates = [{
    "id": "TEST_1",
    "src": "./img/1.png", // required
    "index": 1,
    "originalWidth": 800,
    "originalHeight": 800,
    "width": 1389.1845477281024,
    "height": 1452.5345652293522,
    "x": 216.7047507081002,
    "y": 904.9299631740255,
    "rotate": 17.46323891797897,
    "scaleX": 1,
    "scaleY": 1,
    "opacity": 1,
    "lockAspectRatio": false,
    "visible": true,
    "focusabled": true,
    "editabled": true,
    "drawabled": true,
    "cropTop": 529.1925640873653,
    "cropBottom": 366.4937371942563,
    "cropLeft": 401.27017944833125,
    "cropRight": 409.5133951606077,
    "originalAspectRatio": "1:1", // not reuiqred
    "aspectRatio": "22:23", // not reuiqred
    "left": -477.88752315595104,
    "top": 178.66268055934938
  }, {
    "id": "TEST_2",
    "src": "./img/2.jpg", // required
    "index": 2,
    "originalWidth": 1350,
    "originalHeight": 1800,
    "width": 1751.507666697458,
    "height": 2335.3435555966116,
    "x": 1447.1731276242556,
    "y": 650.4442925495557,
    "rotate": 527.5827758913651,
    "scaleX": 1,
    "scaleY": -1,
    "opacity": 1,
    "lockAspectRatio": false,
    "visible": true,
    "focusabled": true,
    "editabled": true,
    "drawabled": true,
    "cropTop": 426.9755450634543,
    "cropBottom": 380.74198598946873,
    "cropLeft": 686.5002741759678,
    "cropRight": 616.2810396067391,
    "originalAspectRatio": "3:4", // not reuiqred
    "aspectRatio": "3:4", // not reuiqred
    "left": 571.4192942755266,
    "top": -517.2274852487501
  }];

  canvaaas.import(exportedStates, function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log('import callback', res);
  })
</script>
```
