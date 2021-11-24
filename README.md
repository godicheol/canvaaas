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
## 1.Init

```html
<script>
  canvaaas.init(document.getElementById("target"), function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.init() callback", res);
  });
</script>
```
## 2.Set Config (optional)

```html
<script>
  canvaaas.config({
    allowedExtensionsForUpload: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "svg",
      "svg+xml",
      "tiff",
      "tif",
      "webp",
    ], // array of allowed extensions
    cacheLevels: 999, // number
    dragAndDrop: true, // boolean
    containerAspectRatio: 1 / 1, // number, width / height
    maxContainerWidth: 1, // number, 0 ~ 1 scale in viewport
    maxContainerHeight: 0.7, // number, 0 ~ 1 scale in viewport
    maxDrawWidth: 4096 * 4, // number, px,
    maxDrawHeight: 4096 * 4, // number, px,
    maxDrawWidthOnMobile: 4096, // number, px, iOS always limited draw size in 4096px
    maxDrawHeightOnMobile: 4096, // number, px, iOS always limited draw size in 4096px
    imageScaleAfterRender: 0.5, // number, 0 ~ 1 scale in canvas
    lockAspectRatioAfterRender: false, // boolean
    upload: function(err, res){
      if (err) {
        console.log(err);
        return false;
      }
      console.log("config.upload callback", res);
    },
    focus: function(err, res){
      if (err) {
        console.log(err);
        return false;
      }
      console.log("config.focus callback", res);
    },
    edit: function(err, res){
      if (err) {
        console.log(err);
        return false;
      }
      console.log("config.edit callback", res);
    },
    remove: function(err, res){
      if (err) {
        console.log(err);
        return false;
      }
      console.log("config.remove callback", res);
    },
  });
</script>
```

## 3.New Canvas (optional)

```html
<script>
  canvaaas.new({
    filename: "filename", // string
    dataType: "url", // string
    mimeType: "image/png", // string
    quality: 0.92, // number, 0 ~ 1
    width: 1800, // number, required, px
    height: 1200, // number, required, px
    overlay: true, // boolean
    checker: true, // boolean
    editabled: true, // boolean
    focusabled: true, // boolean
    background: "#FFFFFF" // string, rgb format(7 characters) or "alpha" or "transparent"
  }, function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.new() callback", res);
  });
</script>
```

## 4.Open Image

```html
<input id="blahblah" type="file" onchange="canvaaas.uploadFiles(this.files)" accept="image/*" multiple>
```

```html
<script>
  canvaaas.uploadUrls(["./img/1.png", "./img/2.png"], function(err, res, status){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.uploadUrls() callback", res, status);
  });
</script>
```

```html
<script>
  canvaaas.uploadStates([{
    "id": "blahblah-1", // string
    "src": "./img/1.png", // string
    "cropTop": 0, // number
    "cropBottom": 0, // number
    "cropLeft": 0, // number
    "cropRight": 0, // number
    "index": 1, // number
    "width": 600.0000000000001, // number
    "height": 600.0000000000001, // number
    "x": 399.07235621521335, // number
    "y": 808.7198515769946, // number
    "rotate": 17.46323891797897, // number
    "scaleX": 1, // number
    "scaleY": 1, // number
    "opacity": 1, // number
    "lockAspectRatio": false, // boolean
    "visible": true, // boolean
    "focusabled": true, // boolean
    "editabled": true, // boolean
    "drawabled": true, // boolean
  }, {
    "id": "blahblah-2", // string
    "src": "./img/2.png", // string
    "cropTop": 0, // number
    "cropBottom": 0, // number
    "cropLeft": 0, // number
    "cropRight": 0, // number
    "index": 1, // number
    "width": 600.0000000000001, // number
    "height": 600.0000000000001, // number
    "x": 399.07235621521335, // number
    "y": 808.7198515769946, // number
    "rotate": 17.46323891797897, // number
    "scaleX": 1, // number
    "scaleY": 1, // number
    "opacity": 1, // number
    "lockAspectRatio": false, // boolean
    "visible": true, // boolean
    "focusabled": true, // boolean
    "editabled": true, // boolean
    "drawabled": true, // boolean
  }], function(err, res){
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
  data-src = "./img/1.png"
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
  data-focusabled = "true"
  data-editabled = "true"
  data-drawabled = "true">

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

## 5.Get Edited Image

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
  }, function(err, res, result){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.draw() callback", res, result);
  });
</script>
```

## Get Edited Image from JSON Data

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
  }], function(err, res, result){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.drawTo() callback", res, result);
  });
</script>
```

## Handle Style

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
