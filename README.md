[DEMO](https://eeecheol.github.io/canvaaas/)

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
  canvaaas.init(document.getElementById("target"), function(err, res){
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
    allowedExtensions: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "svg",
      "svg+xml",
      "tiff",
      "tif",
      "webp"
    ], // array
    cacheLevels: 999, // number
    containerAspectRatio: 1, // number, width / height
    maxContainerWidth: 1, // number, 0 ~ 1
    maxContainerHeight: 0.7, // number, 0 ~ 1
    renderScale: 0.5, // number, 0 ~ 1
    restrictAfterRender: false, // boolean
    restrictMove: false, // boolean
    restrictRotate: true, // boolean
    restrictRotateRadians: 45, // number
    restrictResize: true, // boolean
    canvas: function(err, res){
      if (err) {
        console.log(err);
        return false;
      }
      console.log("config.canvas callback", res);
    },
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
    width: 6,
    height: 4,
    unit: "in", // mm, cm, in...
    dpi : 300,
    filename: "TEST",
    overlay: true,
    checker: true
  }, function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log("canvaaas.new() callback",res);
  });
</script>
```

5. Open Image

```html
<input id="blahblah" type="file" onchange="canvaaas.uploadFile(this.files)" accept="image/*">
```

```html
<script>
  canvaaas.uploadUrl( Your url, function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log(res);
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
    console.log(res);
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
  data-restricted = "false"
  data-focusabled = "true"
  data-editabled = "true"
  data-drawabled = "true">

<img
  id="blahblah"
  src="./img/2.jpg"
  data-state='{
    "id": "2",
    "type": "url",
    "index": 2,
    "width": 594.2754728305664,
    "height": 792.367297107422,
    "x": 1629.1280148423007,
    "y": 366.2337662337663,
    "rotate": 383.231324008005,
    "scaleX": 1,
    "scaleY": -1,
    "opacity": 1,
    "restricted": false,
    "focusabled": true,
    "editabled": true,
    "drawabled": true
  }'>

<script>
  canvaaas.uploadElement( <img> , function(err, res){
    if (err) {
      console.log(err);
      return false;
    }
    console.log(res);
  });
</script>
```

6. Save File

```html
<script>
  canvaaas.draw({
    filename: 'thumbnail', // optional, default "untitled"
    mimeType: 'image/png', // optional, default "image/png"
    dataType: 'url',  // optional, "url" or "file", default "url"
    width: 256, // optional, default canvasWidth
    height: 256, // optional, default canvasHeight
    quality: 0.5, // optional, default 0.92
    backgroundColor: '#000000', // optional, rgb format, default "#FFFFFF"
  }, function(err, res, result){
    if (err) {
      console.log(err);
      return false;
    }
    console.log(res, result);
  });
</script>
```

7. Save File from JSON Data
```html
<script>
  canvaaas.drawTo({
    filename: 'TEST', // optional, default "untitled"
    quality: 0.92, // optional, default 0.92
    mimeType: 'image/png', // optional, default "image/png"
    dataType: 'url', // optional, default "url"
    backgroundColor: '#FFFFFF', // optional, rgb format, default "#FFFFFF"
    width: 1800, // required, px
    height: 1200, // required, px
    drawWidth: 3600, // optional, default width
    drawHeight: 3600 // optional, default height
  },
  exportedStates, // array, imageState with src
  function(err, res, result){
    if (err) {
      console.log(err);
      return false;
    }
    canvaaas.download(res, result.filename); // iOS not supported
  })
</script>
```
