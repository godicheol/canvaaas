[Test page](https://eeecheol.github.io/canvaaas/)

1. init

  canvaaas.init(target, function(err, res){
    if (err) {
      console.log(err);
      return false;
    }

    checkCaches();

    console.log("canvaaas.init() callback", res);
  });

2. config

  canvaaas.config({
    // allowedExtensions: ["jpg","jpeg","png","gif","svg","svg+xml","tiff","tif","webp",], // array
    // deniedTagNamesToFocusOut: ["A","BUTTON","INPUT","LABEL","TEXTAREA","SELECT","OPTION",], // array
    // cacheLevels: 999, // number
    // containerAspectRatio: 1, // number, width / height
    // maxContainerWidth: 1, // number, 0 ~ 1
    // maxContainerHeight: 0.7, // number, 0 ~ 1
    // renderScale: 0.5, // number, 0 ~ 1
    // restrictAfterRender: false, // boolean
    // restrictMove: false, // boolean
    // restrictRotate: true, // boolean
    // restrictRotateRadians: 15, // number
    // restrictResize: true, // boolean
    hover: function(err, res){
      if (err) {
        console.log(err);
        return false;
      }
      writeCursor(res);
      // console.log("config.hover callback", res);
    },
    upload: function(err, res){
      if (err) {
        console.log(err);
        return false;
      }
      // fix canvas not initialized
      writeCanvasData();

      checkCaches();
      console.log("config.upload callback", res);
    },
    focus: function(err, res){
      if (err) {
        console.log(err);
        return false;
      }
      writeImageData(res);
      checkCaches();
      console.log("config.focus callback", res);
    },
    edit: function(err, res){
      if (err) {
        console.log(err);
        return false;
      }
      writeImageData(res);
      checkCaches();
      console.log("config.edit callback", res);
    },
  });

3. new canvas

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
    writeCanvasData();
  });

4. upload

  canvaaas.uploadUrl( Your url, function(err, res){
  	if (err) {
  		console.log(err);
  		return false;
  	}
  	console.log(res);
  });

  canvaaas.uploadState( Your JSON or JSON.stringify(Your JSON), function(err, res){
  	if (err) {
  		console.log(err);
  		return false;
  	}
  	console.log(res);
  });

  canvaaas.uploadElement( document.getElementById(Your img with dataset), function(err, res){
  	if (err) {
  		console.log(err);
  		return false;
  	}
  	console.log(res);
  });
