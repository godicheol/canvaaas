[DEMO](https://eeecheol.github.io/canvaaas/)

1. HTML

        <style>
          #target{
            margin: 24px; /* overlay size */
            overflow: hidden; /* recommend */
          }
        </style>

        <!-- MAIN ELEMENT -->
        <div id="target"></div>

2. Init

        <script>
          canvaaas.init(document.getElementById("target"), function(err, res){
            if (err) {
              console.log(err);
              return false;
            }
            console.log("canvaaas.init() callback", res);
          });
        </script>

3. Set Config (optional)

        <script>
          canvaaas.config({
            allowedExtensions: ["jpg","jpeg","png","gif","svg","svg+xml","tiff","tif","webp",], // array
            deniedTagNamesToFocusOut: ["A","BUTTON","INPUT","LABEL","TEXTAREA","SELECT","OPTION",], // array
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

4. New Canvas (optional)

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

5. Add Image (optional)

```html
<input id="blahblah" type="file" onchange="canvaaas.uploadFile(this.files)" accept="image/*">
```
        <script>
          canvaaas.uploadUrl( Your url, function(err, res){
          	if (err) {
          		console.log(err);
          		return false;
          	}
          	console.log(res);
          });
        </script>

        <script>
          canvaaas.uploadState( Your JSON or JSON.stringify(Your JSON), function(err, res){
          	if (err) {
          		console.log(err);
          		return false;
          	}
          	console.log(res);
          });
        </script>

        <script>
          canvaaas.uploadElement( <img> , function(err, res){
          	if (err) {
          		console.log(err);
          		return false;
          	}
          	console.log(res);
          });
        </script>
