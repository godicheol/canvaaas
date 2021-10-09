[DEMO](https://godicheol.github.io/canvaaas/)

1. HTML

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
2. Init

```html
<script>
  canvaaas.init( document.getElementById("target") , function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.init() callback", res);
  });
</script>
```
3. Set Config (optional)

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
    deniedTagNamesForFocusOut: [
      "A",
      "BUTTON",
      "INPUT",
      "LABEL",
      "TEXTAREA",
      "SELECT",
      "OPTION",
    ], // array of denied tag names
    cacheLevels: 999, // number
    dragAndDrop: true, // boolean
    containerAspectRatio: 1 / 1, // number, width / height
    maxContainerWidth: 1, // number, 0 ~ 1 scale in viewport
    maxContainerHeight: 0.7, // number, 0 ~ 1 scale in viewport
    maxDrawWidth: 4096 * 4, // number, px, max zoom size if over quality loss
    maxDrawHeight: 4096 * 4, // number, px, max zoom size if over quality loss
    maxDrawWidthOnMobile: 4096, // number, if bigger than 4096px throw an error in iOS
    maxDrawHeightOnMobile: 4096, // number, if bigger than 4096px throw an error in iOS
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

4. New Canvas (optional)

```html
<script>
  canvaaas.new({
    filename: "filename", // string
    width: 1800, // number, px
    height: 1200, // number, px
    overlay: true, // boolean
    checker: true, // boolean
    editabled: true, // boolean
    focusabled: true, // boolean
    drawabled: true, // boolean
    background: "#000000" // string, rgb format or "alpha"
  }, function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.new() callback", res);
  });
</script>
```

5. Open Image

```html
<input id="blahblah" type="file" onchange="canvaaas.uploadFile(this.files)" accept="image/*">
```

```html
<script>
  canvaaas.uploadUrl( Your URL, function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.uploadUrl() callback", res);
  });
</script>
```

```html
<script>
  canvaaas.uploadState( Your JSON or JSON.stringify(Your JSON), function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.uploadState() callback", res);
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
  data-scaleX = "1"
  data-scaleY = "1"
  data-opacity = "1"
  data-lockAspectRatio = "false"
  data-visible = "true"
  data-focusabled = "true"
  data-editabled = "true"
  data-drawabled = "true">

<img
  id="blahblah"
  src="./img/2.jpg"
  data-state='{
    "id": "2",
    "index": 2,
    "width": 594.2754728305664,
    "height": 792.367297107422,
    "x": 1629.1280148423007,
    "y": 366.2337662337663,
    "rotate": 383.231324008005,
    "scaleX": 1,
    "scaleY": -1,
    "opacity": 1,
    "lockAspectRatio": false,
    "visible": true,
    "focusabled": true,
    "editabled": true,
    "drawabled": true
  }'>

<script>
  canvaaas.uploadElement( document.getElementById("blahblah") , function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.uploadElement() callback", res);
  });
</script>
```

6. Get Edited Image

```html
<script>
  canvaaas.draw({
    filename: 'filename', // optional, default "untitled"
    dataType: 'url',  // optional, "url" or "file", default "url"
    mimeType: 'image/png', // optional, default "image/png"
    drawWidth: 256, // optional, default canvasWidth
    drawHeight: 256, // optional, default canvasHeight
    quality: 0.5, // optional, default 0.92
    background: '#000000', // optional, rgb format, default "#FFFFFF"
  }, function(err, res, result){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.draw() callback", res, result);
  });
</script>
```

7. Get Edited Image from JSON Data

```html
<script>
  canvaaas.drawTo({
    // getCanvas()
    filename: 'filename', // optional, default "untitled"
    dataType: 'url', // optional, default "url"
    mimeType: 'image/png', // optional, default "image/png"
    width: 1800, // required, px
    height: 1200, // required, px
    drawWidth: 3600, // optional, default argument.width e.g. 1800
    drawHeight: 3600, // optional, default argument.height e.g. 1200
    quality: 0.92, // optional, default 0.92
    background: '#FFFFFF', // optional, rgb format, default "#FFFFFF"
  }, {
    // getImages()
    "src": "./img/1.png", // required
    "index": 1, // required
    "width": 600.0000000000001, // required
    "height": 600.0000000000001, // required
    "x": 399.07235621521335, // required
    "y": 808.7198515769946, // required
    "rotate": 17.46323891797897, // required
    "scaleX": 1, // required
    "scaleY": 1, // required
    "opacity": 1, // required
    "drawabled": true, // required
  }, function(err, res, result){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.drawTo() callback", res, result);
  });
</script>
```


0. Handle Controll

```html
<script>
  canvaaas.handle({
    // default handle
    resize: {
      n: true,
      ne: true,
      e: true,
      se: true,
      s: true,
      sw: true,
      w: true,
      nw: true
    },
    crop: {
      n: false,
      ne: false,
      e: false,
      se: false,
      s: false,
      sw: false,
      w: false,
      nw: false
    },
    rotate: {
      n: true,
      ne: false,
      e: false,
      se: false,
      s: false,
      sw: false,
      w: false,
      nw: false
    },
    flip: {
      n: false,
      ne: false,
      e: true,
      se: false,
      s: false,
      sw: false,
      w: false,
      nw: false
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
