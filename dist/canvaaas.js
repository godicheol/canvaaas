// canvaaas.js
// godicheol@gmail.com

(function(window){
	'use strict';

	function canvaaas() {

		var myObject = {};

		var defaultConfig = {
			allowedExtensionsForUpload: [
				"bmp",
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

			maxDrawWidth: 4096 * 4, // number, px

			maxDrawHeight: 4096 * 4, // number, px

			maxDrawWidthOnMobile: 4096, // number, px, iOS always limited draw size in 4096px

			maxDrawHeightOnMobile: 4096, // number, px, iOS always limited draw size in 4096px

			imageScaleAfterRender: 0.5, // number, 0 ~ 1 scale in canvas

			lockAspectRatioAfterRender: false, // boolean

			upload: undefined, // callback function

			focus: undefined, // callback function

			edit: undefined, // callback function

			remove: undefined, // callback function
		};

		var defaultCanvasState = {
			filename: "untitled", // string, without extension
			mimeType: "image/png", // string
			dataType: "url", // string, ["url", "file"]
			quality: 0.92, // number, 0 ~ 1
			editabled: true, // boolean
			focusabled: true, // boolean
			background: "transparent", // string, "transparent" or "#FFFFFF" ~ "#000000"
			overlay: true, // boolean
			checker: true // boolean
		};

		// insidee: resize, crop
		// outside: rotate, flip
		// error! outside.ne: "rotate"
		// error! outside.se: "rotate"
		// error! outside.nw: "rotate"
		// error! outside.sw: "rotate"
		var defaultHandleState = {
			inside: {
				n: "resize",
				ne: "resize",
				e: "resize",
				se: "resize",
				s: "resize",
				sw: "resize",
				w: "resize",
				nw: "resize"
			},
			outside: {
				n: "rotate",
				ne: "crop",
				e: "flip",
				se: "crop",
				s: "flip",
				sw: "crop",
				w: "flip",
				nw: "crop"
			}
		};

		// to get default state of image
		var defaultImageState = function(newImage) {
			var id = getShortId();

			var nextIndex = 0;
			imageStates.forEach(function(elem){
				if (nextIndex < elem.index) {
					nextIndex = elem.index;
				}
			});

			var fittedSizes = getContainedSizes(
				newImage.width,
				newImage.height,
				canvasState.width * config.imageScaleAfterRender,
				canvasState.height * config.imageScaleAfterRender
			);

			return {
				id: id,
				src: newImage.src,
				index: nextIndex + 1,
				originalWidth: newImage.width,
				originalHeight: newImage.height,
				width: fittedSizes[0],
				height: fittedSizes[1],
				x: canvasState.width * 0.5,
				y: canvasState.height * 0.5,
				rotate: 0,
				rotateX: 0,
				rotateY: 0,
				scaleX: 1,
				scaleY: 1,
				opacity: 1,
				cropTop: 0,
				cropBottom: 0,
				cropLeft: 0,
				cropRight: 0,
				lockAspectRatio: config.lockAspectRatioAfterRender || false,
				visible: true,
				focusabled: true,
				editabled: true,
				drawabled: true,
			}
		};

		Object.freeze(defaultConfig);
		Object.freeze(defaultCanvasState);
		Object.freeze(defaultHandleState);

		var conatinerTemplate = "";
		conatinerTemplate += "<div class='canvaaas-container'>";
		conatinerTemplate += "<div class='canvaaas-mirror'></div>";
		conatinerTemplate += "<div class='canvaaas-background'></div>";
		conatinerTemplate += "<div class='canvaaas-checker'></div>";
		conatinerTemplate += "<div class='canvaaas-canvas'></div>";
		conatinerTemplate += "</div>";

		var imageTemplate = "";
		imageTemplate += "<div class='canvaaas-image'><img></div>";
		imageTemplate += "<div class='canvaaas-overlay'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-top'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-bottom'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-left'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-right'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-top'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-bottom'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-left'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-right'></div>";
		imageTemplate += "<div class='canvaaas-inhandle canvaaas-handle-n'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-inhandle canvaaas-handle-e'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-inhandle canvaaas-handle-s'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-inhandle canvaaas-handle-w'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-inhandle canvaaas-handle-ne'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-inhandle canvaaas-handle-nw'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-inhandle canvaaas-handle-se'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-inhandle canvaaas-handle-sw'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-outhandle canvaaas-handle-n'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-outhandle canvaaas-handle-e'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-outhandle canvaaas-handle-s'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-outhandle canvaaas-handle-w'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-outhandle canvaaas-handle-ne'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-outhandle canvaaas-handle-nw'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-outhandle canvaaas-handle-se'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-outhandle canvaaas-handle-sw'><div class='canvaaas-handle-box'></div></div>";

		var config = {};

		var originId = "canvaaas-o";
		var cloneId = "canvaaas-c";

		var undoCaches = [];
		var redoCaches = [];

		var eventState = {};
		var containerState = {};
		var canvasState = {};
		var handleState = {};
		var imageStates = [];

		var containerObject;
		var canvasObject;
		var mirrorObject;
		var backgroundObject;
		var checkerObject;

		var viewportResizeEvent;

		copyObject(config, defaultConfig);
		copyObject(canvasState, defaultCanvasState);
		copyObject(handleState, defaultHandleState);

		//
		// event handlers start
		//

		var handlers = {

			stopEvents: function(e) {
				e.preventDefault();
				e.stopPropagation();
			},

			drop: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var dt = e.dataTransfer;
				var files = dt.files;

				var index = files.length;
				var count = 0;

				if (eventState.onUpload === true) {
					if (config.upload) {
						config.upload("Already in progress");
					}
					return false;
				}

				eventState.onUpload = true;

				recursiveFunc();

				function recursiveFunc() {
					if (count < index) {
						renderImage(files[count], null, function(err, res) {
							if (err) {
								if (config.upload) {
									config.upload(err);
								}
							} else {
								if (config.upload) {
									config.upload(null, exportImageState(res));
								}
							}
							count++;
							recursiveFunc();
						});
					} else {
						eventState.onUpload = false;
					}
				}
			},

			// deprecated
			hover: function(e) {
				if (!whereIsContainer()) {
					return false;
				}

				var scaleRatio = canvasState.width / canvasState.originalWidth;
				var result;
				var mouseX;
				var mouseY;
				var target;
				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - (containerState.left + canvasState.left);
					mouseY = e.clientY - (containerState.top + canvasState.top);
					target = getTarget(e);
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - (containerState.left + canvasState.left);
					mouseY = e.touches[0].clientY - (containerState.top + canvasState.top);
					target = getTarget(e.touches[0]);
				} else {
					return false;
				}

				result = {
					x: mouseX / scaleRatio,
					y: mouseY / scaleRatio,
					target: target
				}

				if (config.hover) {
					config.hover(null, result)
				}
			},

			route: function(e) {
				var handle = e.target;
				var id = getId(handle.parentNode);
				var direction;
				var position;

				if (!id) {
					return false;
				}
				if (!isFocusable(id)) {
					return false;
				}
				if (!eventState.target) {
					setFocusIn(id);
				} else {
					if (eventState.target !== id) {
						setFocusOut(eventState.target);
						setFocusIn(id);
					}
				}

				if (handle.classList.contains("canvaaas-inhandle")) {
					position = "inside";
				} else if (handle.classList.contains("canvaaas-outhandle")) {
					position = "outside";
				}
				if (handle.classList.contains("canvaaas-handle-n")) {
					direction = "n";
				} else if (handle.classList.contains("canvaaas-handle-ne")) {
					direction = "ne";
				} else if (handle.classList.contains("canvaaas-handle-e")) {
					direction = "e";
				} else if (handle.classList.contains("canvaaas-handle-se")) {
					direction = "se";
				} else if (handle.classList.contains("canvaaas-handle-s")) {
					direction = "s";
				} else if (handle.classList.contains("canvaaas-handle-sw")) {
					direction = "sw";
				} else if (handle.classList.contains("canvaaas-handle-w")) {
					direction = "w";
				} else if (handle.classList.contains("canvaaas-handle-nw")) {
					direction = "nw";
				} else {
					return false;
				}

				if (handleState[position][direction] === "resize") {
					return handlers.startResize(e);
				} else if (handleState[position][direction] === "rotate") {
					return handlers.startRotate(e);
				} else if (handleState[position][direction] === "flip") {
					return handlers.startFlip(e);
				} else if (handleState[position][direction] === "crop") {
					return handlers.startCrop(e);
				} else {
					return false;
				}
			},

			focusIn: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var id = getTarget(e);
				if (!id) {
					return false;
				}
				if (!isFocusable(id)) {
					return false;
				}
				if (eventState.target) {
					if (eventState.target !== id) {
						setFocusOut(eventState.target);
					}
				}

				setFocusIn(id);

				return handlers.startMove(e);
			},

			focusOut: function(e) {
				var deniedTagNames = [
					"A",
					"BUTTON",
					"INPUT",
					"LABEL",
					"TEXTAREA",
					"SELECT",
					"OPTION"
				];

				if (typeof(e.touches) !== "undefined") {
					if (e.touches.length > 1) {
						return handlers.startMove(e);
					}
				}
				if (deniedTagNames.indexOf(e.target.tagName) > -1) {
					return false;
				}

				e.preventDefault();
				e.stopPropagation();
				
				if (eventState.target) {
					setFocusOut(eventState.target);
				}
			},

			startMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!chkTarget(e)) {
					return false;
				}
				if (!isEditable(eventState.target)) {
					return false;
				}
				if (!whereIsContainer()) {
					return false;
				}

				// fix osx wheel
				if (eventState.onZoom) {
					return false;
				}

				var state = getState(eventState.target);
				var mouseX;
				var mouseY;
				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX;
					mouseY = e.clientY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX;
					mouseY = e.touches[0].clientY;
				} else {
					return handlers.startPinchZoom(e);
				}

				eventState.onMove = true;
				eventState.x = state.x;
				eventState.y = state.y;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;

				// cache
				saveUndo(eventState.target);

				// class
				addClassToWrapper(eventState.target, "editing");

				// event
				document.addEventListener("mousemove", handlers.onMove, false);
				document.addEventListener("mouseup", handlers.endMove, false);

				document.addEventListener("touchmove", handlers.onMove, false);
				document.addEventListener("touchend", handlers.endMove, false);
			},

			onMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!eventState.onMove) {
					return false;
				}

				var state = getState(eventState.target);
				var onShiftKey = e.shiftKey;
				var mouseX;
				var mouseY;
				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - eventState.mouseX;
					mouseY = e.clientY - eventState.mouseY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - eventState.mouseX;
					mouseY = e.touches[0].clientY - eventState.mouseY;
				} else {
					return false;
				}

				if (onShiftKey) {
					if (Math.abs(mouseX) > Math.abs(mouseY)) {
						mouseY = 0;
					} else if (Math.abs(mouseX) < Math.abs(mouseY)) {
						mouseX = 0;
					}
				}

				// save state
				setState(eventState.target, {
					x: eventState.x + mouseX,
					y: eventState.y + mouseY,
				});
			},

			endMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				// class
				removeClassToWrapper(eventState.target, "editing");

				// clear
				eventState.onMove = false;

				// event
				document.removeEventListener("mousemove", handlers.onMove, false);
				document.removeEventListener("mouseup", handlers.endMove, false);

				document.removeEventListener("touchmove", handlers.onMove, false);
				document.removeEventListener("touchend", handlers.endMove, false);

				// callback
				if (config.edit) {
					config.edit(null, exportImageState(eventState.target));
				}
			},

			startResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!chkTarget(e)) {
					return false;
				}
				if (!isEditable(eventState.target)) {
					return false;
				}
				if (!whereIsContainer()) {
					return false;
				}

				var state = getState(eventState.target);
				var handle = e.target;
				var direction = getFlippedDirection(handle, state.scaleX, state.scaleY);
				var mouseX;
				var mouseY;

				if (!direction) {
					return false;
				}

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX;
					mouseY = e.clientY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX;
					mouseY = e.touches[0].clientY;
				} else {
					return false;
				}

				eventState.onResize = true;
				eventState.handle = handle;
				eventState.direction = direction;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;
				eventState.width = state.width;
				eventState.height = state.height;
				eventState.x = state.x;
				eventState.y = state.y;
				eventState.cropTop = state.cropTop;
				eventState.cropBottom = state.cropBottom;
				eventState.cropLeft = state.cropLeft;
				eventState.cropRight = state.cropRight;

				// cache
				saveUndo(eventState.target);

				// class
				addClassToWrapper(eventState.target, "editing");
				addClassToHandle(eventState.handle, "editing");

				// event
				document.addEventListener("mousemove", handlers.onResize, false);
				document.addEventListener("mouseup", handlers.endResize, false);

				document.addEventListener("touchmove", handlers.onResize, false);
				document.addEventListener("touchend", handlers.endResize, false);
			},

			onResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!eventState.onResize) {
					return false;
				}

				var state = getState(eventState.target);
				var onShiftKey = e.shiftKey || state.lockAspectRatio;
				var direction = eventState.direction;
				var width = eventState.width;
				var height = eventState.height;
				var axisX = eventState.x;
				var axisY = eventState.y;
				var cropTop = eventState.cropTop;
				var cropBottom = eventState.cropBottom;
				var cropLeft = eventState.cropLeft;
				var cropRight = eventState.cropRight;
				var croppedOriginalWidth = state.originalWidth - ((eventState.cropLeft + eventState.cropRight) / (eventState.width / state.originalWidth));
				var croppedOriginalHeight = state.originalHeight - ((eventState.cropTop + eventState.cropBottom) / (eventState.height / state.originalHeight));
				var aspectRatio = croppedOriginalWidth / croppedOriginalHeight;
				var diffX;
				var diffY;
				var radians;
				var cosFraction;
				var sinFraction;
				var mouseX;
				var mouseY;
				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - eventState.mouseX;
					mouseY = e.clientY - eventState.mouseY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - eventState.mouseX;
					mouseY = e.touches[0].clientY - eventState.mouseY;
				} else {
					return false;
				}

				radians = state.rotate * Math.PI / 180;
				cosFraction = Math.cos(radians);
				sinFraction = Math.sin(radians);
				diffX = (mouseX * cosFraction) + (mouseY * sinFraction);
				diffY = (mouseY * cosFraction) - (mouseX * sinFraction);

				width -= cropLeft + cropRight;
				height -= cropTop + cropBottom;

				var scaleCropTop = cropTop / height;
				var scaleCropBottom = cropBottom / height;
				var scaleCropLeft = cropLeft / width;
				var scaleCropRight = cropRight / width;

				if (direction === "n") {
					height -= diffY;
					if (onShiftKey) {
						width = height * aspectRatio;
					}
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else if (direction === "ne") {
					width += diffX;
					height -= diffY;
					if (onShiftKey) {
						if (2 * diffX < 2 * -diffY * aspectRatio) {
							diffX -= width - (height * aspectRatio);
							width = height * aspectRatio;
						} else {
							diffY += height - (width / aspectRatio);
							height = width / aspectRatio;
						}
					}
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else if (direction === "e") {
					width += diffX;
					if (onShiftKey) {
						height = width / aspectRatio;
					}
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
				} else if (direction === "se") {
					width += diffX;
					height += diffY;
					if (onShiftKey) {
						if (2 * diffX < 2 * diffY * aspectRatio) {
							diffX -= width - (height * aspectRatio);
							width = height * aspectRatio;
						} else {
							diffY -= height - (width / aspectRatio);
							height = width / aspectRatio;
						}
					}
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else if (direction === "s") {
					height += diffY;
					if (onShiftKey) {
						width = height * aspectRatio;
					}
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else if (direction === "sw") {
					width -= diffX;
					height += diffY;
					if (onShiftKey) {
						if (2 * -diffX < 2 * diffY * aspectRatio) {
							diffX += width - (height * aspectRatio);
							width = height * aspectRatio;
						} else {
							diffY -= height - (width / aspectRatio);
							height = width / aspectRatio;
						}
					}
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else if (direction === "w") {
					width -= diffX;
					if (onShiftKey) {
						height = width / aspectRatio;
					}
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
				} else if (direction === "nw") {
					width -= diffX;
					height -= diffY;
					if (onShiftKey) {
						if (2 * -diffX < 2 * -diffY * aspectRatio) {
							diffX += width - (height * aspectRatio);
							width = height * aspectRatio;
						} else {
							diffY += height - (width / aspectRatio);
							height = width / aspectRatio;
						}
					}
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else {
					return false;
				}

				cropTop = height * scaleCropTop;
				cropBottom = height * scaleCropBottom;
				cropLeft = width * scaleCropLeft;
				cropRight = width * scaleCropRight;

				width += cropLeft + cropRight;
				height += cropTop + cropBottom;

				if (width - (cropLeft + cropRight) < 10) {
					return false;
				}
				if (height - (cropTop + cropBottom) < 10) {
					return false;
				}

				// save state
				setState(eventState.target, {
					x: axisX,
					y: axisY,
					width: width,
					height: height,
					cropTop: cropTop,
					cropBottom: cropBottom,
					cropLeft: cropLeft,
					cropRight: cropRight
				});
			},

			endResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				// class
				removeClassToWrapper(eventState.target, "editing");
				removeClassToHandle(eventState.handle, "editing");

				// clear
				eventState.onResize = false;
				eventState.handle = undefined;

				// event
				document.removeEventListener("mousemove", handlers.onResize, false);
				document.removeEventListener("mouseup", handlers.endResize, false);

				document.removeEventListener("touchmove", handlers.onResize, false);
				document.removeEventListener("touchend", handlers.endResize, false);

				// callback
				if (config.edit) {
					config.edit(null, exportImageState(eventState.target));
				}
			},

			startWheelZoom: function(e){
				e.preventDefault();
				e.stopPropagation();

				if (
					eventState.onMove === true ||
					eventState.onResize === true ||
					eventState.onRotate === true
				) {
					return false;
				}

				if (!eventState.onZoom) {
					if (!chkTarget(e)) {
						return false;
					}
					if (!isEditable(eventState.target)) {
						return false;
					}
					if (!whereIsContainer()) {
						return false;
					}

					eventState.onZoom = true;

					// cache
					saveUndo(eventState.target);

					// class
					addClassToWrapper(eventState.target, "editing");
				}

				var state = getState(eventState.target);
				var ratio = -e.deltaY * 0.001;
				var width = state.width + (state.width * ratio);
				var height = state.height + (state.height * ratio);
				var cropTop = state.cropTop + (state.cropTop * ratio);
				var cropBottom = state.cropBottom + (state.cropBottom * ratio);
				var cropLeft = state.cropLeft + (state.cropLeft * ratio);
				var cropRight = state.cropRight + (state.cropRight * ratio);

				// add timer
				clearTimeout(eventState.wheeling);

				if (width < 10) {
					return false;
				}
				if (height < 10) {
					return false;
				}

				// save state
				setState(eventState.target, {
					width: width,
					height: height,
					cropTop: cropTop,
					cropBottom: cropBottom,
					cropLeft: cropLeft,
					cropRight: cropRight
				});

				eventState.wheeling = setTimeout(function() {
					// remove timer
					eventState.wheeling = undefined;
					// clear
					eventState.onZoom = false;
					// class
					removeClassToWrapper(eventState.target, "editing");
					// callback
					if (config.edit) {
						config.edit(null, exportImageState(eventState.target));
					}
				}, 64);
			},

			startPinchZoom: function(e){
				e.preventDefault();
				e.stopPropagation();

				if (eventState.onMove) {
					handlers.endMove(e);
				}
				if (!chkTarget(e)) {
					return false;
				}
				if (!isEditable(eventState.target)) {
					return false;
				}
				if (!whereIsContainer()) {
					return false;
				}

				var state = getState(eventState.target);
				var mouseX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
				var mouseY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
				var diagonal = Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2));

				eventState.onZoom = true;
				eventState.width = state.width;
				eventState.height = state.height;
				eventState.cropTop = state.cropTop;
				eventState.cropBottom = state.cropBottom;
				eventState.cropLeft = state.cropLeft;
				eventState.cropRight = state.cropRight;
				eventState.diagonal = diagonal;

				// cache
				saveUndo(eventState.target);

				// class
				addClassToWrapper(eventState.target, "editing");

				// event
				document.addEventListener("touchmove", handlers.onPinchZoom, false);
				document.addEventListener("touchend", handlers.endPinchZoom, false);
			},

			onPinchZoom: function(e){
				e.preventDefault();
				e.stopPropagation();

				if (!eventState.onZoom) {
					return false;
				}

				var state = getState(eventState.target);
				var mouseX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
				var mouseY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
				var diagonal = getDiagonal(mouseX, mouseY);
				var ratio = ((diagonal - eventState.diagonal) * 0.01);
				var width = eventState.width + (eventState.width * ratio);
				var height = eventState.height + (eventState.height * ratio);
				var cropTop = eventState.cropTop + (eventState.cropTop * ratio);
				var cropBottom = eventState.cropBottom + (eventState.cropBottom * ratio);
				var cropLeft = eventState.cropLeft + (eventState.cropLeft * ratio);
				var cropRight = eventState.cropRight + (eventState.cropRight * ratio);

				if (width < 10) {
					return false;
				}
				if (height < 10) {
					return false;
				}

				// save state
				setState(eventState.target, {
					width: width,
					height: height,
					cropTop: cropTop,
					cropBottom: cropBottom,
					cropLeft: cropLeft,
					cropRight: cropRight,
				});
			},

			endPinchZoom: function(e) {
				e.preventDefault();
				e.stopPropagation();

				// class
				removeClassToWrapper(eventState.target, "editing");

				// clear
				eventState.onZoom = false;

				// event
				document.removeEventListener("touchmove", handlers.onPinchZoom, false);
				document.removeEventListener("touchend", handlers.endPinchZoom, false);

				// callback
				if (config.edit) {
					config.edit(null, exportImageState(eventState.target));
				}

				// event propagation
				handlers.startMove(e);
			},

			startRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!chkTarget(e)) {
					return false;
				}
				if (!isEditable(eventState.target)) {
					return false;
				}
				if (!whereIsContainer()) {
					return false;
				}

				var handle = e.target;
				var direction = getDirection(handle);
				if (!direction) {
					return false;
				}

				eventState.onRotate = true;
				eventState.handle = handle;
				eventState.direction = direction;

				// cache
				saveUndo(eventState.target);

				// class
				addClassToWrapper(eventState.target, "editing");
				addClassToHandle(eventState.handle, "editing");

				// event
				document.addEventListener("mousemove", handlers.onRotate, false);
				document.addEventListener("mouseup", handlers.endRotate, false);

				document.addEventListener("touchmove", handlers.onRotate, false);
				document.addEventListener("touchend", handlers.endRotate, false);
			},

			onRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!eventState.onRotate) {
					return false;
				}

				var state = getState(eventState.target);
				var direction = eventState.direction;
				var onShiftKey = e.shiftKey;
				var radians;
				var deg;
				var mouseX;
				var mouseY;
				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - (containerState.left + canvasState.left);
					mouseY = e.clientY - (containerState.top + canvasState.top);
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - (containerState.left + canvasState.left);
					mouseY = e.touches[0].clientY - (containerState.top + canvasState.top);
				} else {
					return false;
				}

				// calculate degree
				radians = Math.atan2(state.y-mouseY, mouseX-state.x) * 180 / Math.PI;

				if (direction === "n") {
					deg = 360 - ((radians + 270) % 360);
				} else if (direction === "ne") {
					deg = 360 - ((radians + 315) % 360);
				} else if (direction === "e") {
					deg = 360 - ((radians + 360) % 360);
				} else if (direction === "se") {
					deg = 360 - ((radians + 405) % 360);
				} else if (direction === "s") {
					deg = 360 - ((radians + 450) % 360);
				} else if (direction === "sw") {
					deg = 360 - ((radians + 495) % 360);
				} else if (direction === "w") {
					deg = 360 - ((radians + 540) % 360);
				} else if (direction === "nw") {
					deg = 360 - ((radians + 585) % 360);
				}

				if (state.scaleX < 0) {
					deg = deg;
				}
				if (state.scaleY < 0) {
					deg = deg + 180;
				}

				if (onShiftKey) {
					deg = Math.round(deg / 45) * 45;
				}

				// save state
				setState(eventState.target, {
					rotate: deg
				});
			},

			endRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				// class
				removeClassToWrapper(eventState.target, "editing");
				removeClassToHandle(eventState.handle, "editing");

				// clear
				eventState.onRotate = false;
				eventState.handle = undefined;

				// event
				document.removeEventListener("mousemove", handlers.onRotate, false);
				document.removeEventListener("mouseup", handlers.endRotate, false);

				document.removeEventListener("touchmove", handlers.onRotate, false);
				document.removeEventListener("touchend", handlers.endRotate, false);

				// callback
				if (config.edit) {
					config.edit(null, exportImageState(eventState.target));
				}
			},

			startFlip: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!chkTarget(e)) {
					return false;
				}
				if (!isEditable(eventState.target)) {
					return false;
				}
				if (!whereIsContainer()) {
					return false;
				}

				var state = getState(eventState.target);
				var handle = e.target;
				var direction = getDirection(handle);
				var diffX;
				var diffY;
				var mouseX;
				var mouseY;

				if (!direction) {
					return false;
				}

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - (containerState.left + canvasState.left);
					mouseY = e.clientY - (containerState.top + canvasState.top);
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - (containerState.left + canvasState.left);
					mouseY = e.touches[0].clientY - (containerState.top + canvasState.top);
				} else {
					return false;
				}

				diffX = Math.abs(state.x) - Math.abs(mouseX);
				diffY = Math.abs(state.y) - Math.abs(mouseY);

				var diagonal = getDiagonal(
					state.x + diffX - mouseX,
					state.y + diffY - mouseY
				);

				eventState.onFlip = true;
				eventState.handle = handle;
				eventState.direction = direction;
				eventState.diagonal = diagonal;
				eventState.x = state.x + diffX;
				eventState.y = state.y + diffY;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;

				// cache
				saveUndo(eventState.target);

				// class
				addClassToWrapper(eventState.target, "editing");
				addClassToHandle(eventState.handle, "editing");

				// event
				document.addEventListener("mousemove", handlers.onFlip, false);
				document.addEventListener("mouseup", handlers.endFlip, false);

				document.addEventListener("touchmove", handlers.onFlip, false);
				document.addEventListener("touchend", handlers.endFlip, false);
			},

			onFlip: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!eventState.onFlip) {
					return false;
				}

				var state = getState(eventState.target);
				var direction = eventState.direction;
				var onShiftKey = e.shiftKey;
				var degX = 0;
				var degY = 0;
				var mouseX;
				var mouseY;
				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - (containerState.left + canvasState.left);
					mouseY = e.clientY - (containerState.top + canvasState.top);
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - (containerState.left + canvasState.left);
					mouseY = e.touches[0].clientY - (containerState.top + canvasState.top);
				} else {
					return false;
				}

				if (eventState.mouseX < eventState.x) {
					if (mouseX > eventState.x) {
						mouseX = eventState.x;
					}
				} else {
					if (mouseX < eventState.x) {
						mouseX = eventState.x;
					}
				}
				if (eventState.mouseY < eventState.y) {
					if (mouseY > eventState.y) {
						mouseY = eventState.y;
					}
				} else {
					if (mouseY < eventState.y) {
						mouseY = eventState.y;
					}
				}

				var maxDiagonal = eventState.diagonal;
				var diagonalA = getDiagonal(
					eventState.mouseX - mouseX,
					eventState.mouseY - mouseY
				);
				var diagonalB = getDiagonal(
					eventState.x - mouseX,
					eventState.y - mouseY
				);

				if (direction === "n") {
					degY = diagonalA * (180 / maxDiagonal);

					if (diagonalB > maxDiagonal) {
						degY = 0;
					}
				} else if (direction === "ne") {
					degX = diagonalA * (180 / maxDiagonal);
					degY = diagonalA * (180 / maxDiagonal);

					if (diagonalB > maxDiagonal) {
						degX = 0;
						degY = 0;
					}
				} else if (direction === "e") {
					degX = diagonalA * (180 / maxDiagonal);

					if (diagonalB > maxDiagonal) {
						degX = 0;
					}
				} else if (direction === "se") {
					degX = diagonalA * (180 / maxDiagonal);
					degY = diagonalA * (180 / maxDiagonal);

					if (diagonalB > maxDiagonal) {
						degX = 0;
						degY = 0;
					}
				} else if (direction === "s") {
					degY = diagonalA * (180 / maxDiagonal);

					if (diagonalB > maxDiagonal) {
						degY = 0;
					}
				} else if (direction === "sw") {
					degX = diagonalA * (180 / maxDiagonal);
					degY = diagonalA * (180 / maxDiagonal);

					if (diagonalB > maxDiagonal) {
						degX = 0;
						degY = 0;
					}
				} else if (direction === "w") {
					degX = diagonalA * (180 / maxDiagonal);

					if (diagonalB > maxDiagonal) {
						degX = 0;
					}
				} else if (direction === "nw") {
					degX = diagonalA * (180 / maxDiagonal);
					degY = diagonalA * (180 / maxDiagonal);

					if (diagonalB > maxDiagonal) {
						degX = 0;
						degY = 0;
					}
				}

				if (degX > 180) {
					degX = 180;
				}
				if (degX < -180) {
					degX = -180;
				}
				if (degY > 180) {
					degY = 180;
				}
				if (degY < -180) {
					degY = -180;
				}

				if (onShiftKey) {
					degX = Math.round(degX / 180) * 180;
					degY = Math.round(degY / 180) * 180;
				}

				// save state
				setState(eventState.target, {
					rotateX: degY,
					rotateY: degX
				});
			},

			endFlip: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var state = getState(eventState.target);
				var rotateX = state.rotateX;
				var rotateY = state.rotateY;
				var scaleX = state.scaleX;
				var scaleY = state.scaleY;
				var cropTop = state.cropTop;
				var cropBottom = state.cropBottom;
				var cropLeft = state.cropLeft;
				var cropRight = state.cropRight;

				if (Math.abs(rotateX) > 90) {
					scaleY = -1 * scaleY;
					// var tmp = cropTop;
					// cropTop = cropBottom;
					// cropBottom = tmp;
				}
				if (Math.abs(rotateY) > 90) {
					scaleX = -1 * scaleX;
					// var tmp = cropLeft;
					// cropLeft = cropRight;
					// cropRight = tmp;
				}

				// save state
				setState(eventState.target, {
					rotateX: 0,
					rotateY: 0,
					scaleX: scaleX,
					scaleY: scaleY,
					cropTop: cropTop,
					cropBottom: cropBottom,
					cropLeft: cropLeft,
					cropRight: cropRight,
				});

				// class
				removeClassToWrapper(eventState.target, "editing");
				removeClassToHandle(eventState.handle, "editing");

				// toggle
				eventState.onFlip = false;
				eventState.handle = undefined;

				// event
				document.removeEventListener("mousemove", handlers.onFlip, false);
				document.removeEventListener("mouseup", handlers.endFlip, false);

				document.removeEventListener("touchmove", handlers.onFlip, false);
				document.removeEventListener("touchend", handlers.endFlip, false);

				// callback
				if (config.edit) {
					config.edit(null, exportImageState(eventState.target));
				}
			},

			startCrop: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!chkTarget(e)) {
					return false;
				}
				if (!isEditable(eventState.target)) {
					return false;
				}
				if (!whereIsContainer()) {
					return false;
				}

				var state = getState(eventState.target);
				var handle = e.target;
				var direction = getFlippedDirection(handle, state.scaleX, state.scaleY);
				var mouseX;
				var mouseY;

				if (!direction) {
					return false;
				}

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX;
					mouseY = e.clientY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX;
					mouseY = e.touches[0].clientY;
				} else {
					return false;
				}

				eventState.onCrop = true;
				eventState.handle = handle;
				eventState.direction = direction;
				eventState.top = state.cropTop;
				eventState.bottom = state.cropBottom;
				eventState.left = state.cropLeft;
				eventState.right = state.cropRight;
				eventState.width = state.width;
				eventState.height = state.height;
				eventState.x = state.x;
				eventState.y = state.y;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;

				// cache
				saveUndo(eventState.target);

				// class
				addClassToWrapper(eventState.target, "editing");
				addClassToHandle(eventState.handle, "editing");

				// event
				document.addEventListener("mousemove", handlers.onCrop, false);
				document.addEventListener("mouseup", handlers.endCrop, false);

				document.addEventListener("touchmove", handlers.onCrop, false);
				document.addEventListener("touchend", handlers.endCrop, false);
			},

			onCrop: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!eventState.onCrop) {
					return false;
				}

				var state = getState(eventState.target);
				// var onShiftKey = e.shiftKey || state.lockAspectRatio;
				var direction = eventState.direction;
				var aspectRatio = state.originalWidth / state.originalHeight;
				var axisX = eventState.x;
				var axisY = eventState.y;
				var width = eventState.width;
				var height = eventState.height;
				var top = eventState.top;
				var bottom = eventState.bottom;
				var left = eventState.left;
				var right = eventState.right;
				var diffX;
				var diffY;
				var radians;
				var cosFraction;
				var sinFraction;
				var mouseX;
				var mouseY;
				var reset = false;
				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - eventState.mouseX;
					mouseY = e.clientY - eventState.mouseY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - eventState.mouseX;
					mouseY = e.touches[0].clientY - eventState.mouseY;
				} else {
					return false;
				}

				radians = state.rotate * Math.PI / 180;
				cosFraction = Math.cos(radians);
				sinFraction = Math.sin(radians);
				diffX = (mouseX * cosFraction) + (mouseY * sinFraction);
				diffY = (mouseY * cosFraction) - (mouseX * sinFraction);

				if (direction === "n") {
					if (-diffY > top) {
						diffY = -top;
					}
					top += diffY;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else if (direction === "ne") {
					if (-diffY > top) {
						diffY = -top;
					}
					if (diffX > right) {
						diffX = right;
					}
					top += diffY;
					right -= diffX;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
				} else if (direction === "e") {
					if (diffX > right) {
						diffX = right;
					}
					right -= diffX;
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
				} else if (direction === "se") {
					if (diffY > bottom) {
						diffY = bottom;
					}
					if (diffX > right) {
						diffX = right;
					}
					bottom -= diffY;
					right -= diffX;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
				} else if (direction === "s") {
					if (diffY > bottom) {
						diffY = bottom;
					}
					bottom -= diffY;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else if (direction === "sw") {
					if (diffY > bottom) {
						diffY = bottom;
					}
					if (-diffX > left) {
						diffX = -left;
					}
					bottom -= diffY;
					left += diffX;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
				} else if (direction === "w") {
					if (-diffX > left) {
						diffX = -left;
					}
					left += diffX;
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
				} else if (direction === "nw") {
					if (-diffY > top) {
						diffY = -top;
					}
					if (-diffX > left) {
						diffX = -left;
					}
					top += diffY;
					left += diffX;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
				} else {
					return false;
				}

				if (top + bottom > height - 10) {
					return false;
				}

				if (left + right > width - 10) {
					return false;
				}

				// save state
				setState(eventState.target, {
					x: axisX,
					y: axisY,
					cropTop: top,
					cropBottom: bottom,
					cropLeft: left,
					cropRight: right
				});
			},

			endCrop: function(e) {
				e.preventDefault();
				e.stopPropagation();

				// class
				removeClassToWrapper(eventState.target, "editing");
				removeClassToHandle(eventState.handle, "editing");

				// clear
				eventState.onCrop = false;
				eventState.handle = undefined;

				// event
				document.removeEventListener("mousemove", handlers.onCrop, false);
				document.removeEventListener("mouseup", handlers.endCrop, false);

				document.removeEventListener("touchmove", handlers.onCrop, false);
				document.removeEventListener("touchend", handlers.endCrop, false);

				// callback
				if (config.edit) {
					config.edit(null, exportImageState(eventState.target));
				}
			},

			debounce: function(func, time){
				var timer;
				return function(e){
					if (timer) {
						clearTimeout(timer);
					};
					timer = setTimeout(func, time, e);
				};
			},

			resizeViewport: function(e){
				e.preventDefault();
				e.stopPropagation();

				var oldWidth = containerState.width;
				var oldHeight = containerState.height;

				initContainer();

				if (
					canvasState.originalWidth &&
					canvasState.originalHeight
				) {
					initCanvas();

					var newWidth = containerState.width;
					var newHeight = containerState.height;
					var scaleRatioX = newWidth / oldWidth;
					var scaleRatioY = newHeight / oldHeight;

					imageStates.forEach(function(state){
						// save state
						setState(state.id, {
							x: state.x * scaleRatioX,
							y: state.y * scaleRatioY,
							width: state.width * scaleRatioX,
							height: state.height * scaleRatioY,
							cropTop: state.cropTop * scaleRatioY,
							cropBottom: state.cropBottom * scaleRatioY,
							cropLeft: state.cropLeft * scaleRatioX,
							cropRight: state.cropRight * scaleRatioX
						});
					});
				}
			},

		}

		//
		// event handlers end
		//

		//
		// methods start
		//

		function getId(obj) {
			if (!obj) {
				return false;
			}
			var id = obj.id;
			if (!obj.id) {
				return false;
			}
			if (id.indexOf(originId) > -1) {
				return id.replace(originId, "");
			} else if (id.indexOf(cloneId) > -1) {
				return id.replace(cloneId, "");
			} else {
				return false;
			}
		}

		function getOriginWrapper(id) {
			return document.getElementById(originId + id);
		}

		function getOriginImage(id) {
			var wrapper = document.getElementById(originId + id);
			if (!wrapper) {
				return false;
			}
			return wrapper.querySelector("div.canvaaas-image");
		}

		function getCloneWrapper(id) {
			return document.getElementById(cloneId + id);
		}

		function getCloneImage(id) {
			var wrapper = document.getElementById(cloneId + id);
			if (!wrapper) {
				return false;
			}
			return wrapper.querySelector("div.canvaaas-image");
		}

		function getState(id) {
			if (!id) {
				return false;
			}
			var state = imageStates.find(function(elem){
				if (elem.id === id) {
					return elem;
				}
			});
			if (!state) {
				return false;
			}

			var tmp = {};
			for (var key in state) {
				if (state.hasOwnProperty(key)) {
					tmp[key] = state[key];
				}
			}

			return tmp;
		}

		function setState(id, newState) {
			if (!id) {
				return false;
			}
			if (typeof(newState) !== "object" || newState === null) {
				return false;
			}
			var state = imageStates.find(function(elem){
				if (elem.id === id) {
					return elem;
				}
			});
			if (!state) {
				return false;
			}

			var originWrapper = getOriginWrapper(id);
			var cloneWrapper = getCloneWrapper(id);
			if (
				!originWrapper ||
				!cloneWrapper
			) {
				return false;
			}

			var originImage = originWrapper.querySelector("div.canvaaas-image");
			var cloneImage = cloneWrapper.querySelector("div.canvaaas-image");
			if (
				!originImage ||
				!cloneImage
			) {
				return false;
			}

			var originImg = originImage.querySelector("img");
			var cloneImg = cloneImage.querySelector("img");
			if (
				!originImg ||
				!cloneImg
			) {
				return false;
			}

			if (isString(newState.id)) {
				if (!isExist(toString(newState.id))) {
					// change focus
					if (eventState.target) {
						if (eventState.target === state.id) {
							eventState.target = newState.id;
						}
					}

					// change element id
					originWrapper.id = originId + newState.id;
					cloneWrapper.id = cloneId + newState.id;

					// change undo caches
					undoCaches.forEach(function(elem){
						if (elem.id === state.id) {
							elem.id = newState.id;
							elem.state.id = newState.id;
						}
					});

					// change redo caches
					redoCaches.forEach(function(elem){
						if (elem.id === state.id) {
							elem.id = newState.id;
							elem.state.id = newState.id;
						}
					});

					state.id = toString(newState.id);
				}
			}

			if (isNumeric(newState.index)) {
				state.index = toNumber(newState.index);
			}
			if (isNumeric(newState.x)) {
				state.x = toNumber(newState.x);
			}
			if (isNumeric(newState.y)) {
				state.y = toNumber(newState.y);
			}
			if (isNumeric(newState.width)) {
				state.width = toNumber(newState.width);
			}
			if (isNumeric(newState.height)) {
				state.height = toNumber(newState.height);
			}
			if (isNumeric(newState.rotate)) {
				state.rotate = toNumber(newState.rotate);
			}
			if (isNumeric(newState.rotateX)) {
				state.rotateX = toNumber(newState.rotateX);
			}
			if (isNumeric(newState.rotateY)) {
				state.rotateY = toNumber(newState.rotateY);
			}
			if (isNumeric(newState.opacity)) {
				state.opacity = toNumber(newState.opacity);
			}

			if (isBoolean(newState.visible)) {
				state.visible = toBoolean(newState.visible);

				if (!state.visible) {
					if (eventState.target) {
						if (eventState.target === state.id) {
							setFocusOut(state.id);
						}
					}
				}
			}
			if (isBoolean(newState.editabled)) {
				state.editabled = toBoolean(newState.editabled);
			}
			if (isBoolean(newState.focusabled)) {
				state.focusabled = toBoolean(newState.focusabled);

				if (!state.focusabled) {
					if (eventState.target) {
						if (eventState.target === state.id) {
							setFocusOut(state.id);
						}
					}
				}
			}
			if (isBoolean(newState.drawabled)) {
				state.drawabled = toBoolean(newState.drawabled);
			}

			if (isNumeric(newState.cropTop)) {
				if (toNumber(newState.cropTop) < 0) {
					state.cropTop = 0;
				} else if (toNumber(newState.cropTop) < state.height - (state.cropBottom + 10)) {
					state.cropTop = toNumber(newState.cropTop);
				}
			}
			if (isNumeric(newState.cropBottom)) {
				if (toNumber(newState.cropBottom) < 0) {
					state.cropBottom = 0;
				} else if (toNumber(newState.cropBottom) < state.height - (state.cropTop + 10)) {
					state.cropBottom = toNumber(newState.cropBottom);
				}
			}
			if (isNumeric(newState.cropLeft)) {
				if (toNumber(newState.cropLeft) < 0) {
					state.cropLeft = 0;
				} else if (toNumber(newState.cropLeft) < state.width - (state.cropRight + 10)) {
					state.cropLeft = toNumber(newState.cropLeft);
				}
			}
			if (isNumeric(newState.cropRight)) {
				if (toNumber(newState.cropRight) < 0) {
					state.cropRight = 0;
				} else if (toNumber(newState.cropRight) < state.width - (state.cropLeft + 10)) {
					state.cropRight = toNumber(newState.cropRight);
				}
			}

			if (isNumeric(newState.scaleX)) {
				if (
					toNumber(newState.scaleX) === 1 ||
					toNumber(newState.scaleX) === -1
				) {
					if (state.scaleX !== toNumber(newState.scaleX)) {
						var tmp = state.cropLeft;
						state.cropLeft = state.cropRight;
						state.cropRight = tmp;
					}
					state.scaleX = toNumber(newState.scaleX);
				}
			}

			if (isNumeric(newState.scaleY)) {
				if (
					toNumber(newState.scaleY) === 1 ||
					toNumber(newState.scaleY) === -1
				) {
					if (state.scaleY !== toNumber(newState.scaleY)) {
						var tmp = state.cropTop;
						state.cropTop = state.cropBottom;
						state.cropBottom = tmp;
					}
					state.scaleY = toNumber(newState.scaleY);
				}
			}

			if (isBoolean(newState.lockAspectRatio)) {
				if (
					state.lockAspectRatio === false &&
					toBoolean(newState.lockAspectRatio) === true
				) {
					var cw = state.width - (state.cropLeft + state.cropRight);
					var ch = state.height - (state.cropTop + state.cropBottom);
					var scaleCropTop = state.cropTop / ch;
					var scaleCropBottom = state.cropBottom / ch;
					var scaleCropLeft = state.cropLeft / cw;
					var scaleCropRight = state.cropRight / cw;
					var croppedOriginalWidth = state.originalWidth - ((state.cropLeft + state.cropRight) / (state.width / state.originalWidth));
					var croppedOriginalHeight = state.originalHeight - ((state.cropTop + state.cropBottom) / (state.height / state.originalHeight));
					var croppedOriginalAspectRatio = croppedOriginalWidth / croppedOriginalHeight;

					if (cw > ch * croppedOriginalAspectRatio) {
						ch = cw / croppedOriginalAspectRatio;
					} else {
						cw = ch * croppedOriginalAspectRatio;
					}

					state.cropTop = ch * scaleCropTop;
					state.cropBottom = ch * scaleCropBottom;
					state.cropLeft = cw * scaleCropLeft;
					state.cropRight = cw * scaleCropRight;

					state.width = cw + (cw * scaleCropLeft) + (cw * scaleCropRight);
					state.height = ch + (ch * scaleCropTop) + (ch * scaleCropBottom);
				}
				
				state.lockAspectRatio = toBoolean(newState.lockAspectRatio);
			}

			// set style
			var index = state.index;
			var width = state.width;
			var height = state.height;
			// var top = (state.y - (state.height * 0.5));
			// var left = (state.x - (state.width * 0.5));
			var opacity = state.opacity;
			var croppedWidth = width - (state.cropLeft + state.cropRight);
			var croppedHeight = height - (state.cropTop + state.cropBottom);
			var croppedTop = state.y - (croppedHeight * 0.5);
			var croppedLeft = state.x - (croppedWidth * 0.5);

			var transform = "";
			if (state.rotate !== 0) {
				transform += "rotate(" + state.rotate + "deg)";
			}
			if (state.rotateX !== 0) {
				transform += "rotateX(" + state.rotateX +  "deg)";
			}
			if (state.rotateY !== 0) {
				transform += "rotateY(" + state.rotateY +  "deg)";
			}
			if (state.scaleX === -1) {
				transform += "scaleX(" + state.scaleX + ")";
			}
			if (state.scaleY === -1) {
				transform += "scaleY(" + state.scaleY + ")";
			}

			originWrapper.style.zIndex = index;
			originWrapper.style.top = croppedTop + "px";
			originWrapper.style.left = croppedLeft + "px";
			originWrapper.style.width = croppedWidth + "px";
			originWrapper.style.height = croppedHeight + "px";
			originWrapper.style.transform = transform;

			cloneWrapper.style.zIndex = index;
			cloneWrapper.style.top = croppedTop + "px";
			cloneWrapper.style.left = croppedLeft + "px";
			cloneWrapper.style.width = croppedWidth + "px";
			cloneWrapper.style.height = croppedHeight + "px";
			cloneWrapper.style.transform = transform;

			if (state.scaleX > 0) {
				originImg.style.left = (-state.cropLeft) + "px";
			} else {
				originImg.style.left = (-state.cropRight) + "px";
			}
			if (state.scaleY > 0) {
				originImg.style.top = (-state.cropTop) + "px";
			} else {
				originImg.style.top = (-state.cropBottom) + "px";
			}
			originImg.style.width = width + "px";
			originImg.style.height = height + "px";
			originImg.style.opacity = opacity;

			if (state.scaleX > 0) {
				cloneImg.style.left = (-state.cropLeft) + "px";
			} else {
				cloneImg.style.left = (-state.cropRight) + "px";
			}
			if (state.scaleY > 0) {
				cloneImg.style.top = (-state.cropTop) + "px";
			} else {
				cloneImg.style.top = (-state.cropBottom) + "px";
			}
			cloneImg.style.width = width + "px";
			cloneImg.style.height = height + "px";
			cloneImg.style.opacity = opacity;
			
			if (!state.visible) {
				if (eventState.target) {
					if (eventState.target === state.id) {
						setFocusOut(state.id);
					}
				}

				if (!originWrapper.classList.contains("hidden")) {
					originWrapper.classList.add("hidden");
				}
				if (!cloneWrapper.classList.contains("hidden")) {
					cloneWrapper.classList.add("hidden");
				}
			} else {
				if (originWrapper.classList.contains("hidden")) {
					originWrapper.classList.remove("hidden");
				}
				if (cloneWrapper.classList.contains("hidden")) {
					cloneWrapper.classList.remove("hidden");
				}
			}

			if (!state.focusabled) {
				if (eventState.target) {
					if (eventState.target === state.id) {
						setFocusOut(state.id);
					}
				}

				if (!originWrapper.classList.contains("blurred")) {
					originWrapper.classList.add("blurred");
				}
				if (!cloneWrapper.classList.contains("blurred")) {
					cloneWrapper.classList.add("blurred");
				}
			} else {
				if (originWrapper.classList.contains("blurred")) {
					originWrapper.classList.remove("blurred");
				}
				if (cloneWrapper.classList.contains("blurred")) {
					cloneWrapper.classList.remove("blurred");
				}
			}

			return true;
		}

		function addClassToWrapper(id, cls) {
			if (!id) {
				return false;
			}
			var originWrapper = getOriginWrapper(id);
			var cloneWrapper = getCloneWrapper(id);
			if (
				!originWrapper ||
				!cloneWrapper
			) {
				return false;
			}

			if (!originWrapper.classList.contains(cls)) {
				originWrapper.classList.add(cls);
			}
			if (!cloneWrapper.classList.contains(cls)) {
				cloneWrapper.classList.add(cls);
			}
			return true;
		}

		function removeClassToWrapper(id, cls) {
			if (!id) {
				return false;
			}
			var originWrapper = getOriginWrapper(id);
			var cloneWrapper = getCloneWrapper(id);
			if (
				!originWrapper ||
				!cloneWrapper
			) {
				return false;
			}

			if (originWrapper.classList.contains(cls)) {
				originWrapper.classList.remove(cls);
			}
			if (cloneWrapper.classList.contains(cls)) {
				cloneWrapper.classList.remove(cls);
			}

			return true;
		}

		function addClassToHandle(handle, cls) {
			var id = getId(handle.parentNode);
			if (!id) {
				return false;
			}
			var position;
			var direction;
			if (handle.classList.contains("canvaaas-inhandle")) {
				position = ".canvaaas-inhandle";
			} else if (handle.classList.contains("canvaaas-outhandle")) {
				position = ".canvaaas-outhandle";
			} else {
				return false;
			}
			if (handle.classList.contains("canvaaas-handle-n")) {
				direction = ".canvaaas-handle-n";
			} else if (handle.classList.contains("canvaaas-handle-ne")) {
				direction = ".canvaaas-handle-ne";
			} else if (handle.classList.contains("canvaaas-handle-e")) {
				direction = ".canvaaas-handle-e";
			} else if (handle.classList.contains("canvaaas-handle-se")) {
				direction = ".canvaaas-handle-se";
			} else if (handle.classList.contains("canvaaas-handle-s")) {
				direction = ".canvaaas-handle-s";
			} else if (handle.classList.contains("canvaaas-handle-sw")) {
				direction = ".canvaaas-handle-sw";
			} else if (handle.classList.contains("canvaaas-handle-w")) {
				direction = ".canvaaas-handle-w";
			} else if (handle.classList.contains("canvaaas-handle-nw")) {
				direction = ".canvaaas-handle-nw";
			} else {
				return false;
			}

			var originWrapper = getOriginWrapper(id);
			var cloneWrapper = getCloneWrapper(id);
			if (
				!originWrapper ||
				!cloneWrapper
			) {
				return false;
			}

			var originHandle = originWrapper.querySelector("div" + position + direction);
			var cloneHandle = cloneWrapper.querySelector("div" + position + direction);
			if (
				!originHandle ||
				!cloneHandle
			) {
				return false;
			}

			if (!originHandle.classList.contains(cls)) {
				originHandle.classList.add(cls);
			}
			if (!cloneHandle.classList.contains(cls)) {
				cloneHandle.classList.add(cls);
			}
			return true;
		}

		function removeClassToHandle(handle, cls) {
			var id = getId(handle.parentNode);
			if (!id) {
				return false;
			}
			var position;
			var direction;
			if (handle.classList.contains("canvaaas-inhandle")) {
				position = ".canvaaas-inhandle";
			} else if (handle.classList.contains("canvaaas-outhandle")) {
				position = ".canvaaas-outhandle";
			} else {
				return false;
			}
			if (handle.classList.contains("canvaaas-handle-n")) {
				direction = ".canvaaas-handle-n";
			} else if (handle.classList.contains("canvaaas-handle-ne")) {
				direction = ".canvaaas-handle-ne";
			} else if (handle.classList.contains("canvaaas-handle-e")) {
				direction = ".canvaaas-handle-e";
			} else if (handle.classList.contains("canvaaas-handle-se")) {
				direction = ".canvaaas-handle-se";
			} else if (handle.classList.contains("canvaaas-handle-s")) {
				direction = ".canvaaas-handle-s";
			} else if (handle.classList.contains("canvaaas-handle-sw")) {
				direction = ".canvaaas-handle-sw";
			} else if (handle.classList.contains("canvaaas-handle-w")) {
				direction = ".canvaaas-handle-w";
			} else if (handle.classList.contains("canvaaas-handle-nw")) {
				direction = ".canvaaas-handle-nw";
			} else {
				return false;
			}

			var originWrapper = getOriginWrapper(id);
			var cloneWrapper = getCloneWrapper(id);
			if (
				!originWrapper ||
				!cloneWrapper
			) {
				return false;
			}

			var originHandle = originWrapper.querySelector("div" + position + direction);
			var cloneHandle = cloneWrapper.querySelector("div" + position + direction);
			if (
				!originHandle ||
				!cloneHandle
			) {
				return false;
			}

			if (originHandle.classList.contains(cls)) {
				originHandle.classList.remove(cls);
			}
			if (cloneHandle.classList.contains(cls)) {
				cloneHandle.classList.remove(cls);
			}
			return true;
		}

		function exportConfig() {
			var tmp = {};
			for(var key in config) {
				if (config.hasOwnProperty(key)) {
					if (isFunction(config[key])) {
						tmp[key] = true;
					} else {
						tmp[key] = config[key];
					}
				}
			}
			return tmp;
		}

		function exportHandleState() {
			var tmp = {};
			copyObject(tmp, handleState);
			return tmp;
		}

		function exportCanvasState() {
			var tmp = {};
			tmp.filename = canvasState.filename;
			tmp.dataType = canvasState.dataType;
			tmp.mimeType = canvasState.mimeType;
			tmp.quality = canvasState.quality;
			tmp.width = canvasState.originalWidth;
			tmp.height = canvasState.originalHeight;
			tmp.editabled = canvasState.editabled;
			tmp.focusabled = canvasState.focusabled;
			tmp.background = canvasState.background;
			tmp.checker = canvasState.checker;
			tmp.overlay = canvasState.overlay;

			var ar = getAspectRatio(tmp.width, tmp.height);
			tmp.aspectRatio = "" + ar[0] + ":" + ar[1];

			tmp.element = canvasObject;

			return tmp;
		}

		function importImageState(state) {
			var tmp = {};

			if (isString(state.id)) {
				tmp.id = toString(state.id);
			}
			if (isNumeric(state.index)) {
				tmp.index = toNumber(state.index);
			}
			if (isNumeric(state.x)) {
				tmp.x = toNumber(state.x) * (canvasState.width / canvasState.originalWidth);
			}
			if (isNumeric(state.y)) {
				tmp.y = toNumber(state.y) * (canvasState.height / canvasState.originalHeight);
			}
			if (isNumeric(state.width)) {
				tmp.width = toNumber(state.width) * (canvasState.width / canvasState.originalWidth);
			}
			if (isNumeric(state.height)) {
				tmp.height = toNumber(state.height) * (canvasState.height / canvasState.originalHeight);
			}
			if (isNumeric(state.cropTop)) {
				tmp.cropTop = toNumber(state.cropTop) * (canvasState.height / canvasState.originalHeight);
			}
			if (isNumeric(state.cropBottom)) {
				tmp.cropBottom = toNumber(state.cropBottom) * (canvasState.height / canvasState.originalHeight);
			}
			if (isNumeric(state.cropLeft)) {
				tmp.cropLeft = toNumber(state.cropLeft) * (canvasState.width / canvasState.originalWidth);
			}
			if (isNumeric(state.cropRight)) {
				tmp.cropRight = toNumber(state.cropRight) * (canvasState.width / canvasState.originalWidth);
			}
			if (isNumeric(state.rotate)) {
				tmp.rotate = toNumber(state.rotate);
			}
			if (isNumeric(state.scaleX)) {
				tmp.scaleX = toNumber(state.scaleX);
			}
			if (isNumeric(state.scaleY)) {
				tmp.scaleY = toNumber(state.scaleY);
			}
			if (isNumeric(state.opacity)) {
				tmp.opacity = toNumber(state.opacity);
			}
			if (isBoolean(state.lockAspectRatio)) {
				tmp.lockAspectRatio = toBoolean(state.lockAspectRatio);
			}
			if (isBoolean(state.visible)) {
				tmp.visible = toBoolean(state.visible);
			}
			if (isBoolean(state.editabled)) {
				tmp.editabled = toBoolean(state.editabled);
			}
			if (isBoolean(state.focusabled)) {
				tmp.focusabled = toBoolean(state.focusabled);
			}
			if (isBoolean(state.drawabled)) {
				tmp.drawabled = toBoolean(state.drawabled);
			}

			return tmp;
		}

		function exportImageState(id) {
			var state = getState(id);
			var originWrapper = getOriginWrapper(id);
			var cloneWrapper = getCloneWrapper(id);
			var tmp = {};

			if (isString(state.id)) {
				tmp.id = toString(state.id);
			}
			if (isString(state.src)) {
				tmp.src = toString(state.src);
			}
			if (isNumeric(state.index)) {
				tmp.index = toNumber(state.index);
			}
			if (isNumeric(state.x)) {
				tmp.x = toNumber(state.x) / (canvasState.width / canvasState.originalWidth);
			}
			if (isNumeric(state.y)) {
				tmp.y = toNumber(state.y) / (canvasState.height / canvasState.originalHeight);
			}
			if (isNumeric(state.width)) {
				tmp.width = toNumber(state.width) / (canvasState.width / canvasState.originalWidth);
			}
			if (isNumeric(state.height)) {
				tmp.height = toNumber(state.height) / (canvasState.height / canvasState.originalHeight);
			}
			if (isNumeric(state.cropLeft)) {
				tmp.cropLeft = toNumber(state.cropLeft) / (canvasState.width / canvasState.originalWidth);
			}
			if (isNumeric(state.cropRight)) {
				tmp.cropRight = toNumber(state.cropRight) / (canvasState.width / canvasState.originalWidth);
			}
			if (isNumeric(state.cropTop)) {
				tmp.cropTop = toNumber(state.cropTop) / (canvasState.height / canvasState.originalHeight);
			}
			if (isNumeric(state.cropBottom)) {
				tmp.cropBottom = toNumber(state.cropBottom) / (canvasState.height / canvasState.originalHeight);
			}
			if (isNumeric(state.originalWidth)) {
				tmp.originalWidth = toNumber(state.originalWidth);
			}
			if (isNumeric(state.originalHeight)) {
				tmp.originalHeight = toNumber(state.originalHeight);
			}
			if (isNumeric(state.rotate)) {
				tmp.rotate = toNumber(state.rotate);
			}
			if (isNumeric(state.scaleX)) {
				tmp.scaleX = toNumber(state.scaleX);
			}
			if (isNumeric(state.scaleY)) {
				tmp.scaleY = toNumber(state.scaleY);
			}
			if (isNumeric(state.opacity)) {
				tmp.opacity = toNumber(state.opacity);
			}
			if (isBoolean(state.lockAspectRatio)) {
				tmp.lockAspectRatio = toBoolean(state.lockAspectRatio);
			}
			if (isBoolean(state.visible)) {
				tmp.visible = toBoolean(state.visible);
			}
			if (isBoolean(state.editabled)) {
				tmp.editabled = toBoolean(state.editabled);
			}
			if (isBoolean(state.focusabled)) {
				tmp.focusabled = toBoolean(state.focusabled);
			}
			if (isBoolean(state.drawabled)) {
				tmp.drawabled = toBoolean(state.drawabled);
			}

			var originalAspectRatio = getAspectRatio(tmp.originalWidth, tmp.originalHeight);
			var aspectRatio = getAspectRatio(tmp.width, tmp.height);

			tmp.originalAspectRatio = "" + originalAspectRatio[0] + ":" + originalAspectRatio[1];
			tmp.aspectRatio = "" + aspectRatio[0] + ":" + aspectRatio[1];
			tmp.left = tmp.x - (0.5 * tmp.width);
			tmp.top = tmp.y - (0.5 * tmp.height);

			tmp.elements = [originWrapper, cloneWrapper];

			return tmp;
		}

		function parseState(state) {
			var tmp = {};
			if (isString(state.id)) {
				tmp.id = toString(state.id);
			}
			if (isString(state.url)) {
				tmp.src = toString(state.url);
			}
			if (isString(state.path)) {
				tmp.src = toString(state.path);
			}
			if (isString(state.src)) {
				tmp.src = toString(state.src);
			}
			if (isNumeric(state.x)) {
				tmp.x = toNumber(state.x);
			}
			if (isNumeric(state.y)) {
				tmp.y = toNumber(state.y);
			}
			if (isNumeric(state.width)) {
				tmp.width = toNumber(state.width);
			}
			if (isNumeric(state.height)) {
				tmp.height = toNumber(state.height);
			}
			if (isNumeric(state.index)) {
				tmp.index = toNumber(state.index);
			}
			if (isNumeric(state.rotate)) {
				tmp.rotate = toNumber(state.rotate);
			}
			if (isNumeric(state.scaleX)) {
				tmp.scaleX = toNumber(state.scaleX);
			}
			if (isNumeric(state.scaleY)) {
				tmp.scaleY = toNumber(state.scaleY);
			}
			if (isNumeric(state.opacity)) {
				tmp.opacity = toNumber(state.opacity);
			}
			if (isBoolean(state.lockAspectRatio)) {
				tmp.lockAspectRatio = toBoolean(state.lockAspectRatio);
			}
			if (isBoolean(state.visible)) {
				tmp.visible = toBoolean(state.visible);
			}
			if (isBoolean(state.editabled)) {
				tmp.editabled = toBoolean(state.editabled);
			}
			if (isBoolean(state.focusabled)) {
				tmp.focusabled = toBoolean(state.focusabled);
			}
			if (isBoolean(state.drawabled)) {
				tmp.drawabled = toBoolean(state.drawabled);
			}
			if (isNumeric(state.cropTop)) {
				tmp.cropTop = toNumber(state.cropTop);
			}
			if (isNumeric(state.cropBottom)) {
				tmp.cropBottom = toNumber(state.cropBottom);
			}
			if (isNumeric(state.cropLeft)) {
				tmp.cropLeft = toNumber(state.cropLeft);
			}
			if (isNumeric(state.cropRight)) {
				tmp.cropRight = toNumber(state.cropRight);
			}
			return tmp;
		}

		function getDataset(elem) {
			var datasetKeys = [
				"_id",
				"id",
				"src",
				"url",
				"path",
				"index",
				"x",
				"y",
				"width",
				"height",
				"rotate",
				"scalex",
				"scaley",
				"scale-x",
				"scale-y",
				"opacity",
				"lockaspectratio",
				"lock-aspect-ratio",
				"visible",
				"focusabled",
				"editabled",
				"drawabled",
				"croptop",
				"cropbottom",
				"cropleft",
				"cropright",
				"crop-top",
				"crop-bottom",
				"crop-right",
				"crop-left",
			];

			var stateKeys = {
				"_id": "id",
				"id": "id",
				"src": "src",
				"url": "src",
				"path": "src",
				"index": "index",
				"x": "x",
				"y": "y",
				"width": "width",
				"height": "height",
				"rotate": "rotate",
				"scale-x": "scaleX",
				"scale-y": "scaleY",
				"scalex": "scaleX",
				"scaley": "scaleY",
				"opacity": "opacity",
				"lock-aspect-ratio": "lockAspectRatio",
				"lockaspectratio": "lockAspectRatio",
				"visible": "visible",
				"focusabled": "focusabled",
				"editabled": "editabled",
				"drawabled": "drawabled",
				"croptop": "cropTop",
				"cropbottom": "cropBottom",
				"cropleft": "cropLeft",
				"cropright": "cropRight",
				"crop-top": "cropTop",
				"crop-bottom": "cropBottom",
				"crop-left": "cropLeft",
				"crop-right": "cropRight",
			}

			var attr = {};
			for (var i = 0; i < datasetKeys.length; i++) {
				var v = elem.getAttribute("data-" + datasetKeys[i]);
				if (
					v !== undefined &&
					v !== null &&
					v !== ""
				) {
					attr[stateKeys[datasetKeys[i]]] = v;
				}
			}

			return parseState(attr);
		}

		function isEditable(id) {
			if (!id) {
				return false;
			}
			if (!canvasState.editabled) {
				return false;
			}
			var state = getState(id);
			if (!state) {
				return false;
			}
			if (!state.editabled) {
				return false;
			}
			return true;
		}

		function isFocusable(id) {
			if (!id) {
				return false;
			}
			if (!canvasState.focusabled) {
				return false;
			}
			var state = getState(id);
			if (!state) {
				return false;
			}
			if (!state.focusabled) {
				return false;
			}
			return true;
		}

		function isExist(id) {
			var exists = imageStates.find(function(elem){
				if (elem.id === id) {
					return elem;
				}
			});

			if (!exists) {
				return false;
			} else {
				return true;
			}
		}

		function whereIsContainer(e) {
			if (!containerObject) {
				return false;
			}
			var cont = containerObject.getBoundingClientRect();
			containerState.left = cont.left;
			containerState.rop = cont.top;

			return true;
		}

		function chkTarget(e) {
			if (!eventState.target) {
				return false;
			}
			if (!isExist(eventState.target)) {
				eventState.target = undefined;
				return false;
			}
			return true;
		}

		function getTarget(e) {
			try {
				var tmp = e.target;
				var found;
				for(var i = 0; i < 3; i++) {
					if (!found) {
						if (tmp.classList.contains("canvaaas-wrapper")) {
							found = tmp;
						} else {
							if (tmp.parentNode) {
								tmp = tmp.parentNode;
							}
						}
					}
				}

				if (!found) {
					return false;
				}

				var id = getId(found);
				if (!id) {
					return false;
				} else {
					return id;
				}
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setFocusIn(id) {
			var exists = isExist(id);
			if (!exists) {
				return false;
			}
			try {
				var originWrapper = getOriginWrapper(id);
				var cloneWrapper = getCloneWrapper(id);
				if (
					!originWrapper ||
					!cloneWrapper
				) {
					return false;
				}

				if (!canvasObject.classList.contains("focusing")) {
					canvasObject.classList.add("focusing");
				}
				if (!mirrorObject.classList.contains("focusing")) {
					mirrorObject.classList.add("focusing");
				}

				if (!originWrapper.classList.contains("focusing")) {
					originWrapper.classList.add("focusing");
				}
				if (!cloneWrapper.classList.contains("focusing")) {
					cloneWrapper.classList.add("focusing");
				}

				originWrapper.removeEventListener("mousedown", handlers.focusIn, false);

				originWrapper.addEventListener("mousedown", handlers.startMove, false);
				originWrapper.addEventListener("touchstart", handlers.startMove, false);
				originWrapper.addEventListener("wheel", handlers.startWheelZoom, false);

				cloneWrapper.removeEventListener("mousedown", handlers.focusIn, false);

				cloneWrapper.addEventListener("mousedown", handlers.startMove, false);
				cloneWrapper.addEventListener("touchstart", handlers.startMove, false);
				cloneWrapper.addEventListener("wheel", handlers.startWheelZoom, false);

				document.addEventListener("mousedown", handlers.focusOut, false);
				document.addEventListener("touchstart", handlers.focusOut, false);

				eventState.target = id;

				if (config.focus) {
					config.focus(null, exportImageState(id));
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setFocusOut(id) {
			var exists = isExist(id);
			if (!exists) {
				return false;
			}
			try {
				var originWrapper = getOriginWrapper(id);
				var cloneWrapper = getCloneWrapper(id);
				if (
					!originWrapper ||
					!cloneWrapper
				) {
					return false;
				}

				if (canvasObject.classList.contains("focusing")) {
					canvasObject.classList.remove("focusing");
				}
				if (mirrorObject.classList.contains("focusing")) {
					mirrorObject.classList.remove("focusing");
				}

				if (originWrapper.classList.contains("focusing")) {
					originWrapper.classList.remove("focusing");
				}
				if (cloneWrapper.classList.contains("focusing")) {
					cloneWrapper.classList.remove("focusing");
				}

				originWrapper.addEventListener("mousedown", handlers.focusIn, false);

				originWrapper.removeEventListener("mousedown", handlers.startMove, false);
				originWrapper.removeEventListener("touchstart", handlers.startMove, false);
				originWrapper.removeEventListener("wheel", handlers.startWheelZoom, false);

				cloneWrapper.addEventListener("mousedown", handlers.focusIn, false);

				cloneWrapper.removeEventListener("mousedown", handlers.startMove, false);
				cloneWrapper.removeEventListener("touchstart", handlers.startMove, false);
				cloneWrapper.removeEventListener("wheel", handlers.startWheelZoom, false);

				document.removeEventListener("mousedown", handlers.focusOut, false);
				document.removeEventListener("touchstart", handlers.focusOut, false);

				eventState.target = undefined;

				if (config.focus) {
					config.focus(null, null);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function saveUndo(id, keepRedo) {
			var state = getState(id);
			var tmpState = {};
			copyObject(tmpState, state);

			var tmp = {};
			tmp.id = id;
			tmp.state = tmpState;
			tmp.updatedAt = Date.now();

			undoCaches.push(tmp);

			if (undoCaches.length > config.cacheLevels) {
				undoCaches.shift();
			}

			if (!keepRedo) {
				redoCaches = [];
			}
			return true;
		}

		function saveRedo(id) {
			var state = getState(id);
			var tmpState = {};
			copyObject(tmpState, state);

			var tmp = {};
			tmp.id = id;
			tmp.state = tmpState;
			tmp.updatedAt = Date.now();

			redoCaches.push(tmp);

			return true;
		}

		function callUndo() {
			if (undoCaches.length < 1) {
				return false;
			}

			var recent = undoCaches.pop();

			saveRedo(recent.id);

			// save state
			setState(recent.id, recent.state);

			return recent.id;
		}

		function callRedo() {
			if (redoCaches.length < 1) {
				return false;
			}

			var recent = redoCaches.pop();

			saveUndo(recent.id, true);

			// save state
			setState(recent.id, recent.state);

			return recent.id;
		}

		// asynchronous
		function drawCanvas(drawState, canvState, imgStates, cb) {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");

			var drawSizes = getContainedSizes(
				canvState.width,
				canvState.height,
				drawState.width,
				drawState.height,
			);

			var maxWidth = config.maxDrawWidth;
			var maxHeight = config.maxDrawHeight;
			if (isMobile()) {
				maxWidth = config.maxDrawWidthOnMobile;
				maxHeight = config.maxDrawHeightOnMobile;
			};
			if (isIos()) {
				maxWidth = 4096;
				maxHeight = 4096;
			};
			var canvasSizes = getFittedSizes({
				width: drawSizes[0],
				height: drawSizes[1],
				maxWidth: maxWidth,
				maxHeight: maxHeight,
				minWidth: 0,
				minHeight: 0
			});

			var options = {
				filename: canvState.filename,
				mimeType: canvState.mimeType,
				dataType: canvState.dataType,
				quality: canvState.quality,
				background: canvState.background,
				width: Math.floor(canvasSizes[0]),
				height: Math.floor(canvasSizes[1]),
				numberOfImages: imgStates.length,
			};

			canvas.width = options.width;
			canvas.height = options.height;

			ctx.fillStyle = options.background;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.save();

			// fix canvas resized
			var scaleRatioX = canvasSizes[0] / canvState.width;
			var scaleRatioY = canvasSizes[1] / canvState.height;

			var convertedStates = [];
			imgStates.forEach(function(elem){
				var tmp = {};
				copyObject(tmp, elem);
				tmp.cropTop *= scaleRatioY;
				tmp.cropBottom *= scaleRatioY;
				tmp.cropLeft *= scaleRatioX;
				tmp.cropRight *= scaleRatioX;
				tmp.x *= scaleRatioX;
				tmp.y *= scaleRatioY;
				tmp.width *= scaleRatioX;
				tmp.height *= scaleRatioY;
				convertedStates.push(tmp);
			});

			var index = convertedStates.length;
			var count = 0;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// recursive
					drawImage(canvas, convertedStates[count], function(err) {
						if (err) {
							console.log(err);
						}
						count++;
						recursiveFunc();
					});
				} else {
					// end
					var dataURL = canvas.toDataURL(options.mimeType, options.quality);
					var data;
					if (options.dataType === "url") {
						data = dataURL;
					} else if (options.dataType === "file") {
						data = dataURLtoFile(dataURL, options.filename);
					} else {
						data = dataURL;
					}

					return cb(null, data, options);
				}
			}
		}

		// asynchronous
		function drawImage(mainCanvas, imgState, cb) {
			var newImage = new Image();
			newImage.src = imgState.src;
			newImage.onerror = function(err) {
				return cb(err);
			}
			newImage.onload = function(e) {
				// create canvas
				var canvasA = document.createElement("canvas");
				var canvasB = document.createElement("canvas");
				var canvasC = document.createElement("canvas");
				var ctxA = canvasA.getContext("2d");
				var ctxB = canvasB.getContext("2d");
				var ctxC = canvasC.getContext("2d");

				// canvasA - resize
				// calculate resized sizes
				var maxWidth = config.maxDrawWidth;
				var maxHeight = config.maxDrawHeight;
				if (isMobile()) {
					maxWidth = config.maxDrawWidthOnMobile;
					maxHeight = config.maxDrawHeightOnMobile;
				}
				if (isIos()) {
					maxWidth = 4096;
					maxHeight = 4096;
				}
				var resizedSizes = getFittedSizes({
					width: imgState.width,
					height: imgState.height,
					maxWidth: maxWidth,
					maxHeight: maxHeight,
					minWidth: 0,
					minHeight: 0
				});

				var scaleRatioX = resizedSizes[0] / imgState.width;
				var scaleRatioY = resizedSizes[1] / imgState.height;

				// set canvas sizes
				canvasA.width = Math.floor(resizedSizes[0]);
				canvasA.height = Math.floor(resizedSizes[1]);

				// set canvas options
				ctxA.save();
				ctxA.fillStyle = "transparent";
				ctxA.imageSmoothingQuality = "low";
				ctxA.imageSmoothingEnabled = false;
				ctxA.fillRect(0, 0, canvasA.width, canvasA.height);

				ctxA.drawImage(
					newImage,
					0, 0,
					canvasA.width, canvasA.height
				);

				// canvasB - crop
				var cropTop = imgState.cropTop * scaleRatioY;
				var cropBottom = imgState.cropBottom * scaleRatioY;
				var cropLeft = imgState.cropLeft * scaleRatioX;
				var cropRight = imgState.cropRight * scaleRatioX;
				if (imgState.scaleX < 0) {
					var tmp = cropLeft;
					cropLeft = cropRight;
					cropRight = tmp;
				}
				if (imgState.scaleY < 0) {
					var tmp = cropTop;
					cropTop = cropBottom;
					cropBottom = tmp;
				}
				var croppedTop = cropTop;
				var croppedLeft = cropLeft;
				var croppedWidth = canvasA.width - (cropLeft + cropRight);
				var croppedHeight = canvasA.height - (cropTop + cropBottom);

				// set canvas sizes
				canvasB.width = Math.floor(croppedWidth);
				canvasB.height = Math.floor(croppedHeight);

				// set canvas options
				ctxB.save();
				ctxB.fillStyle = "transparent";
				ctxB.imageSmoothingQuality = "low";
				ctxB.imageSmoothingEnabled = false;
				ctxB.fillRect(0, 0, canvasB.width, canvasB.height);

				ctxB.drawImage(
					canvasA,
					Math.floor(croppedLeft), Math.floor(croppedTop),
					Math.floor(croppedWidth), Math.floor(croppedHeight),
					0, 0,
					canvasB.width, canvasB.height
				);

				// clear canvas A
				ctxA.restore();

				// canvasC - rotate, flip, opacity
				var rotatedSizesA = getRotatedSizes(
					canvasB.width,
					canvasB.height,
					imgState.rotate
				);

				var rotatedSizesB = getFittedSizes({
					width: rotatedSizesA[0],
					height: rotatedSizesA[1],
					maxWidth: maxWidth,
					maxHeight: maxHeight,
					minWidth: 0,
					minHeight: 0
				});

				// set canvas sizes
				canvasC.width = Math.floor(rotatedSizesB[0]);
				canvasC.height = Math.floor(rotatedSizesB[1]);

				ctxC.globalAlpha = imgState.opacity;
				ctxC.fillStyle = "transparent";
				ctxC.imageSmoothingQuality = "low";
				ctxC.imageSmoothingEnabled = false;
				ctxC.fillRect(0, 0, canvasC.width, canvasC.height);
				ctxC.translate(Math.floor(canvasC.width * 0.5), Math.floor(canvasC.height * 0.5));
				ctxC.rotate(imgState.rotate * (Math.PI / 180));
				ctxC.scale(imgState.scaleX, imgState.scaleY);

				ctxC.drawImage(
					canvasB,
					0, 0,
					canvasB.width, canvasB.height,
					-Math.floor(canvasB.width * 0.5), -Math.floor(canvasB.height * 0.5),
					Math.floor(canvasB.width), Math.floor(canvasB.height)
				);

				// clear canvas B
				ctxB.restore();

				// calculate rotated size
				var dx = (imgState.x - (canvasC.width / scaleRatioX * 0.5));
				var dy = (imgState.y - (canvasC.height / scaleRatioY * 0.5));
				var dw = canvasC.width / scaleRatioX;
				var dh = canvasC.height / scaleRatioY;

				// draw to main canvas
				mainCanvas.getContext("2d").drawImage(
					canvasC,
					0, 0,
					canvasC.width, canvasC.height,
					Math.floor(dx), Math.floor(dy),
					Math.floor(dw), Math.floor(dh)
				);

				if (cb) {
					cb(null, true);
				}
			}
		}

		// asynchronous
		function renderImage(file, exportedState, cb) {
			var newImage = new Image();
			var src;
			var ext;

			try {
				// check file or url
				if (isObject(file)) {
					// file
					try {
						src = URL.createObjectURL(file);
					} catch(err) {
						if (cb) {
							cb("File not found");
						}
						return false;
					}
				} else if (isString(file)) {
					// url
					src = file;
				} else {
					if (cb) {
						cb("File not found");
					}
					return false;
				}

				// check mimeType
				ext = getExtension(file);
				if (!ext) {
					if (cb) {
						cb("Extension not found");
					}
					return false;
				}
				if (config.allowedExtensionsForUpload.indexOf(ext.toLowerCase()) < 0) {
					if (cb) {
						cb("Extension not allowed");
					}
					return false;
				}
			} catch(err) {
				if (cb) {
					cb("Type error");
				}
				return false;
			}

			// start to load
			newImage.src = src;

			newImage.onerror = function(err) {
				if (cb) {
					cb("Image load failed");
				}
				return false;
			}

			newImage.onload = function(e) {
				// check canvas
				if (
					!canvasState.originalWidth ||
					!canvasState.originalHeight
				) {
					canvasState.originalWidth = newImage.width;
					canvasState.originalHeight = newImage.height;
					initCanvas();
				}

				var state = defaultImageState(newImage);

				// create origin element
				var newOrigin = document.createElement("div");
				newOrigin.classList.add("canvaaas-wrapper");
				newOrigin.id = originId + state.id;
				newOrigin.innerHTML = imageTemplate;
				var newOriginImage = newOrigin.querySelector("div.canvaaas-image");
				newOriginImage.querySelector("img").src = newImage.src;

				// create clone element
				var newClone = document.createElement("div");
				newClone.classList.add("canvaaas-wrapper");
				newClone.id = cloneId + state.id;
				newClone.innerHTML = imageTemplate;
				var newCloneImage = newClone.querySelector("div.canvaaas-image");
				newCloneImage.querySelector("img").src = newImage.src;

				// set events
				newOriginImage.addEventListener("mousedown", handlers.focusIn, false);
				newOriginImage.addEventListener("touchstart", handlers.focusIn, false);

				newCloneImage.addEventListener("mousedown", handlers.focusIn, false);
				newCloneImage.addEventListener("touchstart", handlers.focusIn, false);

				newOrigin.querySelectorAll("div.canvaaas-inhandle").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.route, false);
					elem.addEventListener("touchstart", handlers.route, false);
				});
				newOrigin.querySelectorAll("div.canvaaas-outhandle").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.route, false);
					elem.addEventListener("touchstart", handlers.route, false);
				});

				newClone.querySelectorAll("div.canvaaas-inhandle").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.route, false);
					elem.addEventListener("touchstart", handlers.route, false);
				});
				newClone.querySelectorAll("div.canvaaas-outhandle").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.route, false);
					elem.addEventListener("touchstart", handlers.route, false);
				});

				canvasObject.appendChild(newOrigin);
				mirrorObject.appendChild(newClone);

				imageStates.push(state);

				var newState;
				if (isObject(exportedState)) {
					newState = importImageState(exportedState);
				} else {
					newState = {};
				}

				// save state
				setState(state.id, newState);

				if (cb) {
					cb(null, state.id);
				}
			}
		}

		function removeImage(id) {
			try {
				if (!isExist(id)) {
					return false;
				}

				// check focus
				if (eventState.target) {
					if (eventState.target === id) {
						setFocusOut(id);
					}
				}

				var originWrapper = getOriginWrapper(id);
				var cloneWrapper = getCloneWrapper(id);
				var state = getState(id);
				var src = originWrapper.querySelector("img").src;

				var seq = imageStates.findIndex(function(elem){
					if (elem.id === state.id) {
						return elem;
					}
				});

				originWrapper.parentNode.removeChild(originWrapper);
				cloneWrapper.parentNode.removeChild(cloneWrapper);

				// fix error
				setTimeout(function(){
					imageStates.splice(seq, 1);
				}, 128);

				// clear caches
				var filterdUC = undoCaches.filter(function(elem){
					if (elem.id === id) {
						return false;
					}
					return true;
				});

				var filterdRC = redoCaches.filter(function(elem){
					if (elem.id === id) {
						return false;
					}
					return true;
				});

				undoCaches = filterdUC;
				redoCaches = filterdRC;

				URL.revokeObjectURL(src);

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function initContainer() {
			// reset canvas size
			containerObject.style.width = "";
			containerObject.style.height = "";

			var viewportSizes = getViewportSizes();
			var aspectRatio = config.containerAspectRatio;
			var width = containerObject.offsetWidth;
			var height = containerObject.offsetWidth / aspectRatio;

			var sizes = getFittedSizes({
				width: width,
				height: height,
				maxWidth: viewportSizes[0] * config.maxContainerWidth,
				maxHeight: viewportSizes[1] * config.maxContainerHeight,
				minWidth: 0,
				minHeight: 0
			});

			containerState.width = sizes[0];
			containerState.height = sizes[1];
			containerState.left = containerObject.getBoundingClientRect().left;
			containerState.top = containerObject.getBoundingClientRect().top;

			containerObject.style.width = containerState.width + "px";
			containerObject.style.height = containerState.height + "px";

			if (hasScrollbar()) {
				var sbw = getScrollbarWidth();

				containerState.width -= sbw;
				containerState.height = containerState.width / aspectRatio;

				containerObject.style.width = containerState.width + "px";
				containerObject.style.height = containerState.height + "px";
			}

			return true;
		}

		function initCanvas() {
			var sizes = getFittedSizes({
				width: canvasState.originalWidth,
				height: canvasState.originalHeight,
				maxWidth: containerState.width,
				maxHeight: containerState.height,
				minWidth: 0,
				minHeight: 0
			});

			// set styles
			canvasState.width = sizes[0];
			canvasState.height = sizes[1];
			canvasState.left = 0.5 * (containerState.width - sizes[0]);
			canvasState.top = 0.5 * (containerState.height - sizes[1]);

			canvasObject.style.width = canvasState.width + "px";
			canvasObject.style.height = canvasState.height + "px";
			canvasObject.style.left = canvasState.left + "px";
			canvasObject.style.top = canvasState.top + "px";

			mirrorObject.style.width = canvasState.width + "px";
			mirrorObject.style.height = canvasState.height + "px";
			mirrorObject.style.left = canvasState.left + "px";
			mirrorObject.style.top = canvasState.top + "px";

			backgroundObject.style.width = canvasState.width + "px";
			backgroundObject.style.height = canvasState.height + "px";
			backgroundObject.style.left = canvasState.left + "px";
			backgroundObject.style.top = canvasState.top + "px";
			backgroundObject.style.background = canvasState.background;

			checkerObject.style.width = canvasState.width + "px";
			checkerObject.style.height = canvasState.height + "px";
			checkerObject.style.left = canvasState.left + "px";
			checkerObject.style.top = canvasState.top + "px";

			// set class names
			if (!canvasState.checker) {
				if (!checkerObject.classList.contains("hidden")) {
					checkerObject.classList.add("hidden");
				}
			} else {
				if (checkerObject.classList.contains("hidden")) {
					checkerObject.classList.remove("hidden");
				}
			}

			if (!canvasState.overlay) {
				if (!mirrorObject.classList.contains("hidden")) {
					mirrorObject.classList.add("hidden");
				}
			} else {
				if (mirrorObject.classList.contains("hidden")) {
					mirrorObject.classList.remove("hidden");
				}
			}

			if (!canvasState.focusabled) {
				if (eventState.target) {
					setFocusOut(eventState.target);
				}
			}

			return true;
		}

		function clearCanvas() {
			// clear canvas state
			canvasState = {};
			copyObject(canvasState, defaultCanvasState);

			canvasObject.style.width = "";
			canvasObject.style.height = "";
			canvasObject.style.left = "";
			canvasObject.style.top = "";

			mirrorObject.style.width = "";
			mirrorObject.style.height = "";
			mirrorObject.style.left = "";
			mirrorObject.style.top = "";

			if (!canvasState.overlay) {
				if (!mirrorObject.classList.contains("hidden")) {
					mirrorObject.classList.add("hidden");
				}
			} else {
				if (mirrorObject.classList.contains("hidden")) {
					mirrorObject.classList.remove("hidden");
				}
			}

			backgroundObject.style.width = "";
			backgroundObject.style.height = "";
			backgroundObject.style.left = "";
			backgroundObject.style.top = "";
			backgroundObject.style.background = "";

			checkerObject.style.width = "";
			checkerObject.style.height = "";
			checkerObject.style.left = "";
			checkerObject.style.top = "";

			if (!canvasState.checker) {
				if (!checkerObject.classList.contains("hidden")) {
					checkerObject.classList.add("hidden");
				}
			} else {
				if (checkerObject.classList.contains("hidden")) {
					checkerObject.classList.remove("hidden");
				}
			}

			return true;
		}

		function setHandleState(obj) {
			if (isObject(obj.inside)) {
				for(var key in obj.inside) {
					if (
						obj.inside.hasOwnProperty(key) &&
						handleState.inside.hasOwnProperty(key)
					) {
						handleState["inside"][key] = obj["inside"][key];
					}
				}
			}

			if (isObject(obj.outside)) {
				for(var key in obj.outside) {
					if (
						obj.outside.hasOwnProperty(key) &&
						handleState.outside.hasOwnProperty(key)
					) {
						handleState["outside"][key] = obj["outside"][key];
					}
				}
			}

			return true;
		}

		function unsetHandleState() {
			handleState = {};
			copyObject(handleState, defaultHandleState);

			return true;
		}

		function getContainedSizes(srcW, srcH, areaW, areaH) {
			var aspectRatio = srcW / srcH;

			if (areaH * aspectRatio > areaW) {
				return [areaW, areaW / aspectRatio];
			} else {
				return [areaH * aspectRatio, areaH];
			}
		}

		function getCoveredSizes(srcW, srcH, areaW, areaH) {
			var aspectRatio = srcW / srcH;

			if (areaH * aspectRatio < areaW) {
				return [
					areaW,
					areaW / aspectRatio
				];
			} else {
				return [
					areaH * aspectRatio,
					areaH
				];
			}
		}

		function getFittedSizes(options) {
			var fooMax = getContainedSizes(
				options.width,
				options.height,
				options.maxWidth,
				options.maxHeight
			);

			var fooMin = getCoveredSizes(
				options.width,
				options.height,
				options.minWidth,
				options.minHeight
			);

			return [
				Math.min(fooMax[0], Math.max(fooMin[0], options.width)),
				Math.min(fooMax[1], Math.max(fooMin[1], options.height))
			];
		}

		function getRotatedSizes(w, h, d) {
			if (
				w === undefined ||
				h === undefined ||
				d === undefined
			) {
				return false;
			}

			var radians = d * Math.PI / 180;
			var sinFraction = Math.sin(radians);
			var cosFraction = Math.cos(radians);

			if (sinFraction < 0) {
				sinFraction = -sinFraction;
			}

			if (cosFraction < 0) {
				cosFraction = -cosFraction;
			}

			return [
				(w * cosFraction) + (h * sinFraction),
				(w * sinFraction) + (h * cosFraction)
			];
		}

		function getDiagonal(width, height) {
			return Math.sqrt( Math.pow(width, 2) + Math.pow(height, 2) );
		}

		function getAspectRatio(width, height, limited) {
			var val = width / height;
			var lim = limited || 50;

			var lower = [0, 1];
			var upper = [1, 0];

			while (true) {
				var mediant = [lower[0] + upper[0], lower[1] + upper[1]];

				if (val * mediant[1] > mediant[0]) {
					if (lim < mediant[1]) {
						return upper;
					}
					lower = mediant;
				} else if (val * mediant[1] == mediant[0]) {
					if (lim >= mediant[1]) {
						return mediant;
					}
					if (lower[1] < upper[1]) {
						return lower;
					}
					return upper;
				} else {
					if (lim < mediant[1]) {
						return lower;
					}
					upper = mediant;
				}
			}
		}

		function getDirection(handle) {
			if (handle.classList.contains("canvaaas-handle-n")) {
				return "n";
			} else if (handle.classList.contains("canvaaas-handle-ne")) {
				return "ne";
			} else if (handle.classList.contains("canvaaas-handle-e")) {
				return "e";
			} else if (handle.classList.contains("canvaaas-handle-se")) {
				return "se";
			} else if (handle.classList.contains("canvaaas-handle-s")) {
				return "s";
			} else if (handle.classList.contains("canvaaas-handle-sw")) {
				return "sw";
			} else if (handle.classList.contains("canvaaas-handle-w")) {
				return "w";
			} else if (handle.classList.contains("canvaaas-handle-nw")) {
				return "nw";
			} else {
				return false;
			}
		}

		function getFlippedDirection(handle, scaleX, scaleY) {
			var direction = getDirection(handle);
			var flipX;
			var flipY;
			if (scaleX > 0 || scaleX === false) {
				flipX = false;
			} else if (scaleX < 0 || scaleX === true) {
				flipX = true;
			}
			if (scaleY > 0 || scaleY === false) {
				flipY = false;
			} else if (scaleY < 0 || scaleY === true) {
				flipY = true;
			}

			var north = ["n", "N", "north", "North", "NORTH"];
			var south = ["s", "S", "south", "South", "SOUTH"];
			var east = ["e", "E", "east", "East", "EAST"];
			var west = ["w", "W", "west", "West", "WEST"];
			var northEast = ["ne", "NE", "north-east", "North-East", "NORTH-EAST"];
			var northWest = ["nw", "NW", "north-west", "North-West", "NORTH-WEST"];
			var southEast = ["se", "SE", "south-east", "South-East", "SOUTH-EAST"];
			var southWest = ["sw", "SW", "south-west", "South-West", "SOUTH-WEST"];

			var radians;
			if (north.indexOf(direction) > -1) {
				radians = 0;
			} else if (northEast.indexOf(direction) > -1) {
				radians = 45;
			} else if (east.indexOf(direction) > -1) {
				radians = 90;
			} else if (southEast.indexOf(direction) > -1) {
				radians = 135;
			} else if (south.indexOf(direction) > -1) {
				radians = 180;
			} else if (southWest.indexOf(direction) > -1) {
				radians = 225;
			} else if (west.indexOf(direction) > -1) {
				radians = 270;
			} else if (northWest.indexOf(direction) > -1) {
				radians = 315;
			}

			if (flipX === false && flipY === false) {
				if (radians === 0) {
					return "n";
				} else if (radians === 45) {
					return "ne";
				} else if (radians === 90) {
					return "e";
				} else if (radians === 135) {
					return "se";
				} else if (radians === 180) {
					return "s";
				} else if (radians === 225) {
					return "sw";
				} else if (radians === 270) {
					return "w";
				} else if (radians === 315) {
					return "nw";
				} else {
					return false;
				}
			} else if (flipX === true && flipY === false) {
				if (radians === 0) {
					return "n";
				} else if (radians === 45) {
					return "nw";
				} else if (radians === 90) {
					return "w";
				} else if (radians === 135) {
					return "sw";
				} else if (radians === 180) {
					return "s";
				} else if (radians === 225) {
					return "se";
				} else if (radians === 270) {
					return "e";
				} else if (radians === 315) {
					return "ne";
				}
			} else if (flipX === false && flipY === true) {
				if (radians === 0) {
					return "s";
				} else if (radians === 45) {
					return "se";
				} else if (radians === 90) {
					return "e";
				} else if (radians === 135) {
					return "ne";
				} else if (radians === 180) {
					return "n";
				} else if (radians === 225) {
					return "nw";
				} else if (radians === 270) {
					return "w";
				} else if (radians === 315) {
					return "sw";
				} else {
					return false;
				}
			} else if (flipX === true && flipY === true) {
				if (radians === 0) {
					return "s";
				} else if (radians === 45) {
					return "sw";
				} else if (radians === 90) {
					return "w";
				} else if (radians === 135) {
					return "nw";
				} else if (radians === 180) {
					return "n";
				} else if (radians === 225) {
					return "ne";
				} else if (radians === 270) {
					return "e";
				} else if (radians === 315) {
					return "se";
				} else {
					return false;
				}
			} else {
				return false;
			}
		}

		function dataURLtoFile(dataurl, filename) {
			var arr = dataurl.split(','),
				mime = arr[0].match(/:(.*?);/)[1],
				bstr = atob(arr[1]),
				n = bstr.length,
				u8arr = new Uint8Array(n);

			while(n--){
				u8arr[n] = bstr.charCodeAt(n);
			}

			return new File([u8arr], filename, {type:mime});
		}

		function getShortId() {
			var firstPart = (Math.random() * 46656) | 0;
			var secondPart = (Math.random() * 46656) | 0;
			firstPart = ("000" + firstPart.toString(36)).slice(-3);
			secondPart = ("000" + secondPart.toString(36)).slice(-3);
			return firstPart + secondPart;
		}

		function isBoolean(b) {
			return b !== undefined && (
				typeof(b) === "boolean" ||
				b === "true" ||
				b === "false" ||
				b === 0 ||
				b === 1
			);
		}

		function isNumeric(n) {
			return n !== undefined && !isNaN(parseFloat(n)) && isFinite(n);
		}

		function isNumber(n) {
			return n !== undefined && typeof(n) === 'number' && !isNaN(n);
		}

		function isString(str) {
			return str !== undefined && (typeof(str) === "string" || (typeof(str) === "number" && !isNaN(str)));
		}

		function isObject(obj) {
			return obj !== undefined && typeof(obj) === "object" && obj !== null && !Array.isArray(obj);
		}

		function isFunction(func) {
			return func !== undefined && typeof(func) === "function";
		}

		function isArray(arr) {
			return arr !== undefined && Array.isArray(arr);
		}

		function isNode(obj){
			return (
				typeof Node === "object" ? obj instanceof Node :
				obj &&
				typeof obj === "object" &&
				typeof obj.nodeType === "number" &&
				typeof obj.nodeName === "string"
			);
		}

		function isElement(obj){
			return (
				typeof HTMLElement === "object" ? obj instanceof HTMLElement :
				obj &&
				typeof obj === "object" &&
				obj !== null &&
				obj.nodeType === 1 &&
				typeof obj.nodeName==="string"
			);
		}

		function isNodeList(obj) {
			var stringRepr = Object.prototype.toString.call(obj);

			return typeof obj === 'object' &&
				/^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr) &&
				(typeof obj.length === 'number') &&
				(obj.length === 0 || (typeof obj[0] === "object" && obj[0].nodeType > 0));
		}

		function isIos() {
			return [
				'iPad Simulator',
				'iPhone Simulator',
				'iPod Simulator',
				'iPad',
				'iPhone',
				'iPod'
			].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
		}

		function isMobile() {
			var check = false;
			(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
			return check;
		}

		function isDataType(str) {
			var chk = false;
			try {
				return ["url", "file"].indexOf(str.toLowerCase()) > -1;
			} catch (err) {
				return false;
			}
		}

		function isMimeType(str) {
			var pattern = new RegExp("(application|audio|font|example|image|message|model|multipart|text|video|x-(?:[0-9A-Za-z!#$%&'*+.^_`|~-]+))/([0-9A-Za-z!#$%&'*+.^_`|~-]+)((?:[ \t]*;[ \t]*[0-9A-Za-z!#$%&'*+.^_`|~-]+=(?:[0-9A-Za-z!#$%&'*+.^_`|~-]+|\"(?:[^\"\\\\]|\\.)*\"))*)");
			return str.match(pattern);
		}

		function isColor(str) {
			var pattern = new RegExp("^(?:#(?:[A-Fa-f0-9]{3}){1,2}|(?:rgb[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*(?:,(?![)])|(?=[)]))){3}|hsl[(]\s*0*(?:[12]?\d{1,2}|3(?:[0-5]\d|60))\s*(?:\s*,\s*0*(?:\d\d?(?:\.\d+)?\s*%|\.\d+\s*%|100(?:\.0*)?\s*%)){2}\s*|(?:rgba[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*,){3}|hsla[(]\s*0*(?:[12]?\d{1,2}|3(?:[0-5]\d|60))\s*(?:\s*,\s*0*(?:\d\d?(?:\.\d+)?\s*%|\.\d+\s*%|100(?:\.0*)?\s*%)){2}\s*,)\s*0*(?:\.\d+|1(?:\.0*)?)\s*)[)])$");
			return str.match(pattern);
		}

		function toBoolean(b) {
			if (typeof(b) === "boolean") {
				return b;
			} else if (typeof(b) === "string") {
				return b === "true";
			} else if (typeof(b) === "number") {
				return b === 1;
			} else {
				return undefined;
			}
		}

		function toNumber(n) {
			return parseFloat(n);
		}

		function toString(n) {
			return "" + n;
		}

		function toArray(str) {
			if (Array.isArray(str)) {
				return str;
			} else {
				return [str];
			}
		}

		function hasScrollbar() {
			// The Modern solution
			if (typeof window.innerWidth === 'number') {
				return window.innerWidth > document.documentElement.clientWidth;
			}

			// rootElem for quirksmode
			var rootElem = document.documentElement || document.body;

			// Check overflow style property on body for fauxscrollbars
			var overflowStyle;

			if (typeof rootElem.currentStyle !== 'undefined') {
				overflowStyle = rootElem.currentStyle.overflow;
			}

			overflowStyle = overflowStyle || window.getComputedStyle(rootElem, '').overflow;

			// Also need to check the Y axis overflow
			var overflowYStyle;

			if (typeof rootElem.currentStyle !== 'undefined') {
				overflowYStyle = rootElem.currentStyle.overflowY
			}

			overflowYStyle = overflowYStyle || window.getComputedStyle(rootElem, '').overflowY;

			var contentOverflows = rootElem.scrollHeight > rootElem.clientHeight;
			var overflowShown    = /^(visible|auto)$/.test(overflowStyle) || /^(visible|auto)$/.test(overflowYStyle);
			var alwaysShowScroll = overflowStyle === 'scroll' || overflowYStyle === 'scroll';

			return (contentOverflows && overflowShown) || (alwaysShowScroll);
		}

		function getScrollbarWidth() {
			var tmp = document.createElement('div');
			tmp.style.overflow = 'scroll';
			document.body.appendChild(tmp);
			var scrollbarWidth = tmp.offsetWidth - tmp.clientWidth;
			document.body.removeChild(tmp);
			return scrollbarWidth;
		}

		function getViewportSizes() {
			var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
			var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			return [w, h]
		}

		function getExtension(data) {
			try {
				if (isObject(data)) {
					if (data.type) {
						return data.type.split("/").pop();
					} else {
						return false;
					}
				} else if (isString(data)) {
					if (
						data.trim !== "" &&
						data.indexOf(".") > -1
					) {
						return data.split('.').pop();
					} else {
						return false;
					}
				} else {
					return false;
				}
			} catch (err) {
				console.log(err);
				return false;
			}
		}

		function getFilename(str) {
			if (!str) {
				return false;
			}
			return str.replace(/^.*[\\\/]/, '');

			// deprecated
			// return str.substring(url.lastIndexOf('/')+1);
		}

		function copyObject(destiObj, srcObj) {
			try {
				Object.keys(srcObj).forEach(function(key){
					destiObj[key] = srcObj[key];
				});
			} catch(err) {
				console.log(err);
				return false;
			}
			return true;
		}

		//
		// methods end
		//

		//
		// exports start
		//

		myObject.init = function(target, cb) {
			if (!isObject(target)) {
				if (cb) {
					cb("Element not found");
				}
				return false;
			}

			// set template
			target.innerHTML = conatinerTemplate;

			// set element
			containerObject = target.querySelector("div.canvaaas-container");
			canvasObject = target.querySelector("div.canvaaas-canvas");
			mirrorObject = target.querySelector("div.canvaaas-mirror");
			backgroundObject = target.querySelector("div.canvaaas-background");
			checkerObject = target.querySelector("div.canvaaas-checker");

			// set container
			initContainer();

			// set events
			viewportResizeEvent = handlers.resizeViewport;
			// viewportResizeEvent = handlers.debounce( handlers.resizeViewport, 300 );

			window.addEventListener("resize", viewportResizeEvent, false);

			containerObject.addEventListener('dragenter', handlers.stopEvents, false);
			containerObject.addEventListener('dragleave', handlers.stopEvents, false);
			containerObject.addEventListener('dragover', handlers.stopEvents, false);
			containerObject.addEventListener('drop', handlers.drop, false);

			if (cb) {
				cb(null, exportConfig());
			}
			return exportConfig();
		}

		myObject.destroy = function(cb){
			window.removeEventListener("resize", viewportResizeEvent, false);

			containerObject.parentNode.removeChild(containerObject);

			config = {};
			eventState = {};
			containerState = {};
			canvasState = {};
			handleState = {};
			imageStates = [];
			undoCaches = [];
			redoCaches = [];

			containerObject = undefined;
			canvasObject = undefined;
			mirrorObject = undefined;
			backgroundObject = undefined;
			checkerObject = undefined;

			viewportResizeEvent = undefined;

			originId = "canvaaas-o";
			cloneId = "canvaaas-c";

			copyObject(config, defaultConfig);
			copyObject(canvasState, defaultCanvasState);
			copyObject(handleState, defaultHandleState);

			if (cb) {
				cb(null, true);
			}
			return true;
		}

		// asynchronous
		myObject.uploadFiles = function(imageFiles, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			if (!isObject(imageFiles)) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			if (imageFiles.length < 1) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			var index = imageFiles.length;
			var count = 0;
			var result = [];
			var status = [];

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderImage(imageFiles[count], null, function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
							status.push({
								message: err,
								status: false
							});
						} else {
							if (config.upload) {
								config.upload(null, exportImageState(res));
							}
							status.push({
								message: null,
								status: true
							});
							result.push(exportImageState(res))
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;

					if (cb) {
						cb(null, result, status);
					}
				}
			}
		}

		// asynchronous
		myObject.uploadUrls = function(imageURLs, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			if (!isArray(imageURLs)) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			if (imageURLs.length < 1) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			var index = imageURLs.length;
			var count = 0;
			var result = [];
			var status = [];

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderImage(imageURLs[count], null, function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
							status.push({
								message: err,
								status: false
							});
						} else {
							if (config.upload) {
								config.upload(null, exportImageState(res));
							}
							status.push({
								message: null,
								status: true
							});
							result.push(exportImageState(res))
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;

					if (cb) {
						cb(null, result, status);
					}
				}
			}
		}

		// asynchronous
		myObject.uploadStates = function(exportedStates, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			if (!isArray(exportedStates)) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			if (exportedStates.length < 1) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			var index = exportedStates.length;
			var count = 0;
			var result = [];
			var status = [];

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					var parsedState = parseState(exportedStates[count]);
					if (!parsedState) {
						if (config.upload) {
							config.upload("State not found");
						}
						status.push({
							message: "State not found",
							status: false
						});
						count++;
						recursiveFunc();
						return false;
					}
					if (!parsedState.src) {
						if (config.upload) {
							config.upload("URL not found");
						}
						status.push({
							message: "URL not found",
							status: false
						});
						count++;
						recursiveFunc();
						return false;
					}
					renderImage(parsedState.src, parsedState, function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
							status.push({
								message: err,
								status: false
							});
						} else {
							if (config.upload) {
								config.upload(null, exportImageState(res));
							}
							status.push({
								message: null,
								status: true
							});
							result.push(exportImageState(res))
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;

					if (cb) {
						cb(null, result, status);
					}
				}
			}
		}

		// asynchronous
		myObject.uploadElements = function(targets, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			if (!isArray(targets)) {
				if (config.upload) {
					config.upload("Argument is not array");
				}
				if (cb) {
					cb("Argument is not array");
				}
				return false;
			}

			var index = targets.length;
			var count = 0;
			var result = [];
			var status = [];

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					if (!isElement(targets[count])) {
						if (config.upload) {
							config.upload("Target is not DOM Object");
						}
						status.push({
							message: "Target is not DOM Object",
							status: false
						});
						count++;
						recursiveFunc();
						return false;
					}
					var state = getDataset(targets[count]);
					var src;
					if (!targets[count].src) {
						if (!state.src) {
							if (config.upload) {
								config.upload("URL not found");
							}
							status.push({
								message: "URL not found",
								status: false
							});
							count++;
							recursiveFunc();
							return false;
						}
						src = state.src;
					} else {
						src = targets[count].src;
					}
					renderImage(src, state, function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
							status.push({
								message: err,
								status: false
							});
						} else {
							if (config.upload) {
								config.upload(null, exportImageState(res));
							}
							status.push({
								message: null,
								status: true
							});
							result.push(exportImageState(res))
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;

					if (cb) {
						cb(null, result, status);
					}
				}
			}
		}

		//
		// image
		//

		myObject.findOne = function(query, cb){
			if (!isObject(query)) {
				if (cb) {
					cb("Argument is not obejct");
				}
				return false;
			}

			var founds = [];
			imageStates.forEach(function(elem){
				var isMatch = true;
				for(var key in query) {
					if (query.hasOwnProperty(key)) {
						if (elem[key] !== query[key]) {
							isMatch = false;
						}
					}
				}
				if (isMatch === true) {
					founds.push(exportImageState(elem.id));
				}
			});

			if (founds.length < 1) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (founds.length > 1) {
				if (cb) {
					cb("Image found more than one");
				}
				return false;
			}

			if (cb) {
				cb(null, founds[0]);
			}
			return founds[0];
		}

		myObject.findMany = function(query, cb){
			if (!isObject(query)) {
				if (cb) {
					cb("Argument is not obejct");
				}
				return false;
			}

			var founds = [];
			imageStates.forEach(function(elem){
				var isMatch = true;
				for(var key in query) {
					if (query.hasOwnProperty(key)) {
						if (elem[key] !== query[key]) {
							isMatch = false;
						}
					}
				}
				if (isMatch === true) {
					founds.push(exportImageState(elem.id));
				}
			});

			if (founds.length < 1) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (cb) {
				cb(null, founds);
			}
			return founds;
		}

		myObject.state = function(id, newState, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isObject(newState)) {
				if (config.edit) {
					config.edit("Argument is not object");
				}
				if (cb) {
					cb("Argument is not object");
				}
				return false;
			}

			if (!isEditable(id) && !newState.editabled) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			var updates = importImageState(newState);

			if (updates.id) {
				if (isExist(updates.id)) {
					if (config.edit) {
						config.edit("ID duplicated");
					}
					if (cb) {
						cb("ID duplicated");
					}
					return false;
				}
			} else {
				updates.id = id;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, updates);

			if (config.edit) {
				config.edit(null, exportImageState(updates.id));
			}
			if (cb) {
				cb(null, exportImageState(updates.id));
			}
			return exportImageState(updates.id);
		}

		myObject.moveX = function(id, n, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				x: state.x + toNumber(n)
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.moveY = function(id, n, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				y: state.y + toNumber(n)
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.zoom = function(id, n, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);
			var ratio = toNumber(n);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				width: state.width * (1 + ratio),
				height: state.height * (1 + ratio),
				cropTop: state.cropTop * (1 + ratio),
				cropBottom: state.cropBottom * (1 + ratio),
				cropLeft: state.cropLeft * (1 + ratio),
				cropRight: state.cropRight * (1 + ratio),
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.cover = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			var state = getState(id);
			var axisX = 0.5 * canvasState.width;
			var axisY = 0.5 * canvasState.height;
			var croppedWidth = state.width - (state.cropLeft + state.cropRight);
			var croppedHeight = state.height - (state.cropTop + state.cropBottom);
			var croppedOriginalWidth = state.originalWidth - ((state.cropLeft + state.cropRight) / (state.width / state.originalWidth));
			var croppedOriginalHeight = state.originalHeight - ((state.cropTop + state.cropBottom) / (state.height / state.originalHeight));
			var scaleCropTop = state.cropTop / croppedHeight;
			var scaleCropBottom = state.cropBottom / croppedHeight;
			var scaleCropLeft = state.cropLeft / croppedWidth;
			var scaleCropRight = state.cropRight / croppedWidth;

			var fittedSizes = getCoveredSizes(
				croppedOriginalWidth,
				croppedOriginalHeight,
				canvasState.width,
				canvasState.height
			);

			var cropTop = fittedSizes[1] * scaleCropTop;
			var cropBottom = fittedSizes[1] * scaleCropBottom;
			var cropLeft = fittedSizes[0] * scaleCropLeft;
			var cropRight = fittedSizes[0] * scaleCropRight;

			var width = fittedSizes[0] + cropLeft + cropRight;
			var height = fittedSizes[1] + cropTop + cropBottom;

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				x: axisX,
				y: axisY,
				width: width,
				height: height,
				rotate: 0,
				scaleX: 1,
				scaleY: 1,
				cropTop: cropTop,
				cropBottom: cropBottom,
				cropLeft: cropLeft,
				cropRight: cropRight,
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.contain = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			var state = getState(id);
			var axisX = 0.5 * canvasState.width;
			var axisY = 0.5 * canvasState.height;
			var croppedWidth = state.width - (state.cropLeft + state.cropRight);
			var croppedHeight = state.height - (state.cropTop + state.cropBottom);
			var croppedOriginalWidth = state.originalWidth - ((state.cropLeft + state.cropRight) / (state.width / state.originalWidth));
			var croppedOriginalHeight = state.originalHeight - ((state.cropTop + state.cropBottom) / (state.height / state.originalHeight));
			var scaleCropTop = state.cropTop / croppedHeight;
			var scaleCropBottom = state.cropBottom / croppedHeight;
			var scaleCropLeft = state.cropLeft / croppedWidth;
			var scaleCropRight = state.cropRight / croppedWidth;

			var fittedSizes = getContainedSizes(
				croppedOriginalWidth,
				croppedOriginalHeight,
				canvasState.width,
				canvasState.height
			);

			var cropTop = fittedSizes[1] * scaleCropTop;
			var cropBottom = fittedSizes[1] * scaleCropBottom;
			var cropLeft = fittedSizes[0] * scaleCropLeft;
			var cropRight = fittedSizes[0] * scaleCropRight;

			var width = fittedSizes[0] + cropLeft + cropRight;
			var height = fittedSizes[1] + cropTop + cropBottom;

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				x: axisX,
				y: axisY,
				width: width,
				height: height,
				rotate: 0,
				scaleX: 1,
				scaleY: 1,
				cropTop: cropTop,
				cropBottom: cropBottom,
				cropLeft: cropLeft,
				cropRight: cropRight,
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.rotate = function(id, n, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				rotate: state.rotate + toNumber(n)
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.flipX = function(id, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				scaleY: state.scaleY * -1
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.flipY = function(id, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				scaleX: state.scaleX * -1
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.opacity = function(id, n, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				opacity: toNumber(n)
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.cropTop = function(id, n, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);
			var scaleRatio = canvasState.height / canvasState.originalHeight;

			var cropTop = state.cropTop + (toNumber(n) * scaleRatio);
			if (cropTop < 0) {
				cropTop = 0;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				cropTop: cropTop
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.cropBottom = function(id, n, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);
			var scaleRatio = canvasState.height / canvasState.originalHeight;

			var cropBottom = state.cropBottom + (toNumber(n) * scaleRatio);
			if (cropBottom < 0) {
				cropBottom = 0;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				cropBottom: cropBottom
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.cropLeft = function(id, n, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);
			var scaleRatio = canvasState.width / canvasState.originalWidth;

			var cropLeft = state.cropLeft + (toNumber(n) * scaleRatio);
			if (cropLeft < 0) {
				cropLeft = 0;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				cropLeft: cropLeft
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.cropRight = function(id, n, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);
			var scaleRatio = canvasState.width / canvasState.originalWidth;

			var cropRight = state.cropRight + (toNumber(n) * scaleRatio);
			if (cropRight < 0) {
				cropRight = 0;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				cropRight: cropRight
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.index = function(id, n, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);

			// save state
			setState(id, {
				index: state.index + toNumber(n)
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.focusIn = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isFocusable(id)) {
				if (config.edit) {
					config.edit("Image is not focusable");
				}
				if (cb) {
					cb("Image is not focusable");
				}
				return false;
			}

			var state = getState(id);

			if (eventState.target) {
				setFocusOut(eventState.target);
			}

			setFocusIn(id);
			
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.focusOut = function(cb) {
			if (!eventState.target) {
				if (config.edit) {
					config.edit("Did not found focused image");
				}
				if (cb) {
					cb("Did not found focused image");
				}
				return false;
			}

			setFocusOut(eventState.target);

			if (cb) {
				cb(null, null);
			}
			return true;
		}

		myObject.reset = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			var state = getState(id);

			var fittedSizes = getContainedSizes(
				state.originalWidth,
				state.originalHeight,
				canvasState.width * config.imageScaleAfterRender,
				canvasState.height * config.imageScaleAfterRender,
			);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				width: fittedSizes[0],
				height: fittedSizes[1],
				x: canvasState.width * 0.5,
				y: canvasState.height * 0.5,
				rotate: 0,
				rotateX: 0,
				rotateY: 0,
				scaleX: 1,
				scaleY: 1,
				opacity: 1,
				lockAspectRatio: config.lockAspectRatioAfterRender || false,
				visible: true,
				focusabled: true,
				editabled: true,
				drawabled: true,
				cropTop: 0,
				cropBottom: 0,
				cropLeft: 0,
				cropRight: 0,
			});

			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.remove = function(id, cb) {
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isEditable(id)) {
				if (config.edit) {
					config.edit("Image is not editabled");
				}
				if (cb) {
					cb("Image is not editabled");
				}
				return false;
			}

			var tmp = exportImageState(id);
			var res = removeImage(id);
			if (!res) {
				if (config.remove) {
					config.remove("Could not remove image");
				}
				if (cb) {
					cb("Could not remove image");
				}
				return false;
			} else {
				if (config.remove) {
					config.remove(null, tmp);
				}
				if (cb) {
					cb(null, tmp);
				}
				return tmp;
			}
		}

		//
		// config
		//

		myObject.config = function(newConfig, cb) {
			if (!canvasState.editabled) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

			if (!isObject(newConfig)) {
				if (cb) {
					cb("Argument is not object");
				}
				return false;
			}

			var tmpConfig = {};

			// set config
			copyObject(tmpConfig, config);
			copyObject(config, newConfig);

			// check cache
			if (undoCaches.length > config.cacheLevels) {
				var diff = undoCaches.length - config.cacheLevels;
				undoCaches.splice(undoCaches.length - diff, diff);
				redoCaches = [];
			}

			// check drag and drop
			if (
				tmpConfig.dragAndDrop === true &&
				config.dragAndDrop === false
			) {
				containerObject.removeEventListener('dragenter', handlers.stopEvents, false);
				containerObject.removeEventListener('dragleave', handlers.stopEvents, false);
				containerObject.removeEventListener('dragover', handlers.stopEvents, false);
				containerObject.removeEventListener('drop', handlers.drop, false);
			} else if (
				tmpConfig.dragAndDrop === false &&
				config.dragAndDrop === true
			) {
				containerObject.addEventListener('dragenter', handlers.stopEvents, false);
				containerObject.addEventListener('dragleave', handlers.stopEvents, false);
				containerObject.addEventListener('dragover', handlers.stopEvents, false);
				containerObject.addEventListener('drop', handlers.drop, false);
			}

			// check container
			initContainer();
			if (
				canvasState.originalWidth &&
				canvasState.originalHeight
			) {
				initCanvas();
			}

			if (cb) {
				cb(null, exportConfig());
			}
			return exportConfig();
		}

		//
		// handle
		//

		myObject.handle = function(obj, cb) {
			// obj = {
			// 	inside: {
			// 		n: "resize", // resize, crop
			// 		ne: "resize", // resize, crop
			// 		e: "resize", // resize, crop
			// 		se: "resize", // resize, crop
			// 		s: "resize", // resize, crop
			// 		sw: "resize", // resize, crop
			// 		w: "resize", // resize, crop
			// 		nw: "resize" // resize, crop
			// 	},
			// 	outside: {
			// 		n: "rotate", // rotate, flip, crop, resize
			// 		ne: "flip", // flip, crop, resize
			// 		e: "flip", // rotate, flip, crop, resize
			// 		se: "flip", // flip, crop, resize
			// 		s: "flip", // rotate, flip, crop, resize
			// 		sw: "flip", // flip, crop, resize
			// 		w: "flip", // rotate, flip, crop, resize
			// 		nw: "flip" // flip, crop, resize
			// 	}
			// }
			
			if (!isObject(obj)) {
				if (cb) {
					cb("Argument is not object");
				}
				return false;
			}

			setHandleState(obj);

			if (cb) {
				cb(null, exportHandleState());
			}
			return exportHandleState();
		}

		//
		// canvas
		//

		myObject.new = function(options, cb) {
			// options = {
			// 	width: number, (required)
			// 	height: number, (required)
			// 	filename: string, (optional, default 'untitled')
			//  quality: number, (optional, default '0.92')
			//  mimeType: string, (optional, default 'image/png')
			//  dataType: string, (optional, default 'url')
			// 	overlay: boolean, (optional, default 'false')
			// 	checker: boolean, (optional, default 'true')
			// 	editabled: boolean, (optional, default 'true')
			// 	focusabled: boolean, (optional, default 'true')
			// 	background: string, (optional, default '#FFFFFF')
			// }

			if (
				!containerState.width ||
				!containerState.height
			) {
				if (cb) {
					cb("Container has been not initialized");
				}
				return false;
			}

			if (
				canvasState.originalWidth ||
				canvasState.originalHeight
			) {
				if (cb) {
					cb("Canvas already initialized");
				}
				return false;
			}

			if (!isObject(options)) {
				if (cb) {
					cb("Argument is not object");
				}
				return false;
			}

			if (
				!isNumeric(options.width) ||
				!isNumeric(options.height)
			) {
				if (cb) {
					cb("Argument is not allowed");
				}
				return false;
			}

			canvasState.originalWidth = toNumber(options.width);
			canvasState.originalHeight = toNumber(options.height);

			if (isString(options.filename)) {
				if (toString(options.filename).trim() === "") {
					options.filename = "untitled";
				}
				canvasState.filename = toString(options.filename);
			}
			if (isString(options.mimeType)) {
				if (isMimeType(toString(options.mimeType))) {
					canvasState.mimeType = toString(options.mimeType);
				}
			}
			if (isString(options.dataType)) {
				if (isDataType(toString(options.dataType))) {
					canvasState.dataType = toString(options.dataType);
				}
			}
			if (isNumeric(options.quality)) {
				if (toNumber(options.quality) > 1) {
					canvasState.quality = 1;
				} else if (toNumber(options.quality) < 0) {
					canvasState.quality = 0;
				} else {
					canvasState.quality = toNumber(options.quality);
				}
			}
			if (isBoolean(options.checker)) {
				canvasState.checker = toBoolean(options.checker);
			}
			if (isBoolean(options.overlay)) {
				canvasState.overlay = toBoolean(options.overlay);
			}
			if (isBoolean(options.editabled)) {
				canvasState.editabled = toBoolean(options.editabled);
			}
			if (isBoolean(options.focusabled)) {
				canvasState.focusabled = toBoolean(options.focusabled);
			}
			if (isString(options.background)) {
				var colour = toString(options.background).toLowerCase().trim();
				if (
					colour === "alpha" ||
					colour === "transparent" ||
					colour === "none" ||
					colour === "unset"
				) {
					canvasState.background = "transparent";
				} else if (isColor(colour)) {
					canvasState.background = colour;
				}
			}

			initCanvas();

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.close = function(cb) {
			if (
				!canvasState.originalWidth ||
				!canvasState.originalHeight
			) {
				if (cb) {
					cb("Canvas has been not initialized");
				}
				return false;
			}

			if (eventState.target) {
				setFocusOut(eventState.target);
			}

			eventState = {};
			undoCaches = [];
			redoCaches = [];

			imageStates.forEach(function(elem){
				removeImage(elem.id);
			});

			clearCanvas();

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.canvas = function(options, cb) {
			// options = {
			// 	width: number, (required)
			// 	height: number, (required)
			// 	filename: string, (optional, default 'untitled')
			//  quality: number, (optional, default '0.92')
			//  mimeType: string, (optional, default 'image/png')
			//  dataType: string, (optional, default 'url')
			// 	overlay: boolean, (optional, default 'false')
			// 	checker: boolean, (optional, default 'true')
			// 	editabled: boolean, (optional, default 'true')
			// 	focusabled: boolean, (optional, default 'true')
			// 	background: string, (optional, default '#FFFFFF')
			// }

			if (
				!containerState.width ||
				!containerState.height
			) {
				if (cb) {
					cb("Container has been not initialized");
				}
				return false;
			}

			if (
				!canvasState.originalWidth ||
				!canvasState.originalHeight
			) {
				if (cb) {
					cb("Canvas has been not initialized");
				}
				return false;
			}

			if (!isObject(options)) {
				if (cb) {
					cb("Argument is not object");
				}
				return false;
			}

			if (isString(options.filename)) {
				if (toString(options.filename).trim() === "") {
					options.filename = "untitled";
				}
				canvasState.filename = toString(options.filename);
			}
			if (isString(options.mimeType)) {
				if (isMimeType(toString(options.mimeType))) {
					canvasState.mimeType = toString(options.mimeType);
				}
			}
			if (isString(options.dataType)) {
				if (isDataType(toString(options.dataType))) {
					canvasState.dataType = toString(options.dataType);
				}
			}
			if (isNumeric(options.quality)) {
				if (toNumber(options.quality) > 1) {
					canvasState.quality = 1;
				} else if (toNumber(options.quality) < 0) {
					canvasState.quality = 0;
				} else {
					canvasState.quality = toNumber(options.quality);
				}
			}
			if (isNumeric(options.width)) {
				canvasState.originalWidth = toNumber(options.width);
			}
			if (isNumeric(options.height)) {
				canvasState.originalHeight = toNumber(options.height);
			}
			if (isBoolean(options.checker)) {
				canvasState.checker = toBoolean(options.checker);
			}
			if (isBoolean(options.overlay)) {
				canvasState.overlay = toBoolean(options.overlay);
			}
			if (isBoolean(options.editabled)) {
				canvasState.editabled = toBoolean(options.editabled);
			}
			if (isBoolean(options.focusabled)) {
				canvasState.focusabled = toBoolean(options.focusabled);
			}
			if (isString(options.background)) {
				var colour = toString(options.background).toLowerCase().trim();
				if (
					colour === "alpha" ||
					colour === "transparent" ||
					colour === "none" ||
					colour === "unset"
				) {
					canvasState.background = "transparent";
				} else if (isColor(colour)) {
					canvasState.background = colour;
				}
			}

			initCanvas();

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		//
		// draw
		//

		myObject.draw = function(options, cb){
			// options = {
			// 	filename: string, (optional, default 'getCanvas().filename')
			// 	dataType: string 'url' or 'file', (optional, default 'getCanvas().dataType')
			// 	mimeType: string, (optional, default 'getCanvas().mimeType')
			// 	width(or drawWidth): number, (optional, default 'getCanvas().width')
			// 	height(or drawHeight): number, (optional, default 'getCanvas().height')
			// 	background: string, (optional, default 'getCanvas().background')
			// 	quality: number, (optional, default 'getCanvas().quality')
			// }

			if (eventState.onDraw === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			var canvState = exportCanvasState();
			var drawState = {};

			drawState.width = canvasState.originalWidth;
			drawState.height = canvasState.originalHeight;

			if (isObject(options)) {
				if (isString(options.filename)) {
					canvState.filename = toString(options.filename);
				}
				if (isString(options.mimeType)) {
					canvState.mimeType = toString(options.mimeType);
				}
				if (isString(options.dataType)) {
					if (options.dataType.toLowerCase() === "url") {
						canvState.dataType = "url";
					} else if (options.dataType.toLowerCase() === "file") {
						canvState.dataType = "file";
					}
				}
				if (isNumeric(options.quality)) {
					canvState.quality = toNumber(options.quality);
				}
				if (isString(options.background)) {
					canvState.background = toString(options.background);
				}
				if (isNumeric(options.width)) {
					drawState.width = toNumber(options.width);
				} else if (isNumeric(options.drawWidth)) {
					drawState.width = toNumber(options.drawWidth);
				}
				if (isNumeric(options.height)) {
					drawState.height = toNumber(options.height);
				} else if (isNumeric(options.drawHeight)) {
					drawState.height = toNumber(options.drawHeight);
				}
			}

			var imgStates = [];
			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawabled === true) {
					imgStates.push(exportImageState(imageStates[i].id));
				}
			}

			imgStates.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			eventState.onDraw = true;

			drawCanvas(drawState, canvState, imgStates, function(err, res, result){
				if (err) {
					console.log(err);
					if (cb) {
						cb(err);
					}
				} else {
					if (cb) {
						cb(null, res, result);
					}
				}
				eventState.onDraw = false;
			});
		}

		myObject.drawTo = function(options, states, cb){
			// options = {
			// 	filename: string, (optional, default 'getCanvas().filename')
			// 	dataType: string 'url' or 'file', (optional, default 'getCanvas().dataType')
			// 	mimeType: string, (optional, default 'getCanvas().mimeType')
			// 	width: number, (required)
			// 	drawWidth: number, (optional, default 'width')
			// 	height: number, (required)
			// 	drawHeight: number, (optional, default 'height')
			// 	background: string, (optional, default 'getCanvas().background')
			// 	quality: number, (optional, default 'getCanvas().quality')
			// }

			// states = [{
			// 	src(required),
			// 	index(required),
			// 	x(required),
			// 	y(required),
			// 	width(required),
			// 	height(required),
			// 	rotate(optional),
			// 	scaleX(optinal),
			// 	scaleY(optinal),
			// 	opacity(optional),
			// 	cropTop(optional),
			// 	cropBottom(optional),
			// 	cropLeft(optional),
			// 	cropRight(optional),
			// }]

			if (eventState.onDraw === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			if (!isObject(options)) {
				if (cb) {
					cb("Argument is not object");
				}
				return false;
			}
			if (!isArray(states)) {
				if (cb) {
					cb("Argument is not array");
				}
				return false;
			}

			var canvState = {};
			var drawState = {};

			copyObject(canvState, defaultCanvasState);

			if (isString(options.filename)) {
				canvState.filename = toString(options.filename);
			}
			if (isString(options.mimeType)) {
				canvState.mimeType = toString(options.mimeType);
			}
			if (isString(options.dataType)) {
				if (options.dataType.toLowerCase() === "url") {
					canvState.dataType = "url";
				} else if (options.dataType.toLowerCase() === "file") {
					canvState.dataType = "file";
				}
			}
			if (isNumeric(options.quality)) {
				canvState.quality = toNumber(options.quality);
			}
			if (isString(options.background)) {
				canvState.background = toString(options.background);
			}
			if (isNumeric(options.width)) {
				canvState.width = toNumber(options.width);
			} else {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}
			if (isNumeric(options.height)) {
				canvState.height = toNumber(options.height);
			} else {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}
			if (isNumeric(options.width)) {
				drawState.width = toNumber(options.width);
			} else if (isNumeric(options.drawWidth)) {
				drawState.width = toNumber(options.drawWidth);
			} else {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}
			if (isNumeric(options.height)) {
				drawState.height = toNumber(options.height);
			} else if (isNumeric(options.drawHeight)) {
				drawState.height = toNumber(options.drawHeight);
			} else {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			var imgStates = [];
			for (var i = 0; i < states.length; i++) {
				var tmp = {};
				copyObject(tmp, states[i]);
				if (!tmp.src) {
					if (tmp.url) {
						tmp.src = tmp.url;
					} else if (tmp.path) {
						tmp.src = tmp.path;
					}
				}
				if (tmp.rotate === undefined) {
					tmp.rotate = 0;
				}
				if (tmp.scaleX === undefined) {
					tmp.scaleX = 1;
				}
				if (tmp.scaleY === undefined) {
					tmp.scaleY = 1;
				}
				if (tmp.opacity === undefined) {
					tmp.opacity = 1;
				}
				if (tmp.cropTop === undefined) {
					tmp.cropTop = 0;
				}
				if (tmp.cropBottom === undefined) {
					tmp.cropBottom = 0;
				}
				if (tmp.cropLeft === undefined) {
					tmp.cropLeft = 0;
				}
				if (tmp.cropRight === undefined) {
					tmp.cropRight = 0;
				}

				if (
					tmp.src !== undefined ||
					tmp.index !== undefined ||
					tmp.x !== undefined ||
					tmp.y !== undefined ||
					tmp.width !== undefined ||
					tmp.height !== undefined
				) {
					imgStates.push(tmp);
				}
			}

			imgStates.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			eventState.onDraw = true;

			drawCanvas(drawState, canvState, imgStates, function(err, res, result){
				if (err) {
					console.log(err);
					if (cb) {
						cb(err);
					}
				} else {
					if (cb) {
						cb(null, res, result);
					}
				}
				eventState.onDraw = false;
			});
		}

		//
		// get data
		//

		myObject.this = function(cb){
			if (!eventState.target) {
				if (cb) {
					cb("Target not found");
				}
				return false;
			}

			if (cb) {
				cb(null, exportImageState(eventState.target));
			}
			return exportImageState(eventState.target);
		}

		myObject.getConfig = function(cb){
			if (cb) {
				cb(null, exportConfig());
			}
			return exportConfig();
		}

		myObject.getCanvas = function(cb){
			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.getImage = function(id, cb){
			if (!isString(id)) {
				if (cb) {
					cb("Argument is not string");
				}
				return false;
			}
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.getImages = function(cb){
			var states = [];
			imageStates.forEach(function(elem){
				states.push(exportImageState(elem.id));
			});

			var sorted = states.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			if (cb) {
				cb(null, sorted);
			}
			return sorted;
		}

		myObject.getPreviousImage = function(id, cb){
			if (!isString(id)) {
				if (cb) {
					cb("Argument is not string");
				}
				return false;
			}
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var states = [];
			var state = getState(id);

			imageStates.forEach(function(elem){
				states.push(elem);
			});

			var sorted = states.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			var found;
			for (var i = 0; i < sorted.length; i++) {
				if (sorted[i].id === id) {
					if (sorted[i - 1]) {
						found = exportImageState(sorted[i - 1].id);
					}
				}
			}

			if (!found) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (cb) {
				cb(null, found);
			}
			return found;
		}

		myObject.getNextImage = function(id, cb){
			if (!isString(id)) {
				if (cb) {
					cb("Argument is not string");
				}
				return false;
			}
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var states = [];
			var state = getState(id);

			imageStates.forEach(function(elem){
				states.push(elem);
			});

			var sorted = states.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			var found;
			for (var i = 0; i < sorted.length; i++) {
				if (sorted[i].id === id) {
					if (sorted[i + 1]) {
						found = exportImageState(sorted[i + 1].id);
					}
				}
			}

			if (!found) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (cb) {
				cb(null, found);
			}
			return found;
		}

		myObject.getUndo = function(cb){
			var tmp = [];

			for(var i = 0; i < undoCaches.length; i++) {
				var copy = {};
				copyObject(copy, undoCaches[i]);
				tmp.push(copy);
			}

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getRedo = function(cb){
			var tmp = [];

			for(var i = 0; i < redoCaches.length; i++) {
				var copy = {};
				copyObject(copy, redoCaches[i]);
				tmp.push(copy);
			}

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.export = myObject.getImages;

		myObject.import = function(exportedStates, cb){
			if (!canvasState.editabled) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

			if (!isArray(exportedStates)) {
				if (cb) {
					cb("Argument is not array");
				}
				return false;
			}

			var chkObj = true;
			exportedStates.forEach(function(elem){
				if (!isObject(elem)) {
					chkObj = false;
				}
			});
			if (chkObj === false) {
				if (cb) {
					cb("Argument is not object");
				}
				return false;
			}

			var index = exportedStates.length;
			var count = 0;
			var result = [];
			var status = [];

			eventState.onUpload = true;

			recursiveFunc()

			function recursiveFunc() {
				if (count < index) {
					renderImage(exportedStates[count].src, exportedStates[count], function(err, res) {
						if (err) {
							status.push({
								message: err,
								status: false
							});
						} else {
							status.push({
								message: null,
								status: true
							});
							result.push(exportImageState(res));
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;

					if (cb) {
						cb(null, result, status);
					}
					return false;
				}
			}
		}

		//
		// undo & redo
		//

		myObject.undo = function(cb){
			if (!canvasState.editabled) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

			if (undoCaches.length < 1) {
				if (cb) {
					cb("Cache not found");
				}
				return false;
			}

			if (eventState.target) {
				setFocusOut(eventState.target);
			}

			var id = callUndo();

			setFocusIn(id);

			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.redo = function(cb){
			if (!canvasState.editabled) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (redoCaches.length < 1) {
				if (cb) {
					cb("Cache is empty");
				}
				return false;
			}

			if (eventState.target) {
				setFocusOut(eventState.target);
			}

			var id = callRedo();

			setFocusIn(id);

			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		//
		// exports end
		//

		return myObject;

	}

	//
	// global export
	//

	if (typeof(window.canvaaas) === 'undefined') {
		window.canvaaas = canvaaas();
	}

})(window);