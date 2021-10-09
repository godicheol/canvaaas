// canvaaas.js
// godicheol@gmail.com

(function(window){
	'use strict';

	function canvaaas() {

		var myObject = {};

		var defaultConfig = {

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

			upload: undefined, // callback function

			focus: undefined, // callback function

			edit: undefined, // callback function

			remove: undefined, // callback function

		};

		var defaultCanvasState = {
			filename: "untitled", // string, without extension
			mimeType: "image/png", // string
			dataType: "url", // string, url, file
			quality: 0.92, // number, 0 ~ 1
			editabled: true, // boolean
			focusabled: true, // boolean
			drawabled: true, // boolean
			background: "transparent", // string, transparent or #FFFFFF ~ #000000
			overlay: false, // boolean
			checker: true // boolean
		};

		var defaultHandleState = {
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
				lockAspectRatio: config.lockAspectRatioAfterRender || false,
				visible: true,
				focusabled: true,
				editabled: true,
				drawabled: true,
				cropTop: 0,
				cropBottom: 0,
				cropLeft: 0,
				cropRight: 0,
			}
		};

		var classNames = {
			hidden: "hidden",
			checker: "checker",
			onEdit: "on-edit",
			onFocus: "on-focus",
			onCrop: "on-crop",
			unfocusabled: "unfocusabled",
			uneditabled: "uneditabled",
			undrawabled: "undrawabled"
		};

		Object.freeze(defaultConfig);
		Object.freeze(defaultCanvasState);
		Object.freeze(defaultHandleState);
		Object.freeze(classNames);

		var conatinerTemplate = "";
		conatinerTemplate += "<div class='canvaaas'>";
		conatinerTemplate += "<div class='canvaaas-mirror'></div>";
		conatinerTemplate += "<div class='canvaaas-background'></div>";
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
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-rotate canvaaas-handle-n'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-rotate canvaaas-handle-e'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-rotate canvaaas-handle-s'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-rotate canvaaas-handle-w'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-rotate canvaaas-handle-ne'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-rotate canvaaas-handle-nw'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-rotate canvaaas-handle-se'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-rotate canvaaas-handle-sw'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-resize canvaaas-handle-n'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-resize canvaaas-handle-e'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-resize canvaaas-handle-s'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-resize canvaaas-handle-w'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-resize canvaaas-handle-ne'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-resize canvaaas-handle-nw'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-resize canvaaas-handle-se'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-resize canvaaas-handle-sw'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-flip canvaaas-handle-n'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-flip canvaaas-handle-e'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-flip canvaaas-handle-s'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-flip canvaaas-handle-w'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-flip canvaaas-handle-ne'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-flip canvaaas-handle-nw'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-flip canvaaas-handle-se'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-flip canvaaas-handle-sw'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-crop canvaaas-handle-n'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-crop canvaaas-handle-e'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-crop canvaaas-handle-s'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-crop canvaaas-handle-w'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-crop canvaaas-handle-ne'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-crop canvaaas-handle-nw'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-crop canvaaas-handle-se'><div class='canvaaas-handle-box'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-handle-crop canvaaas-handle-sw'><div class='canvaaas-handle-box'></div></div>";

		var loadingTemplate = "";
		loadingTemplate += "<div class='canvaaas-loading'>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "<div></div>";
		loadingTemplate += "</div>";

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
				var loading = startLoading(document.body);

				setTimeout(function(e){
					recursiveFunc();
				}, 100);

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
						endLoading(loading);
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

			focusIn: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var id = getTarget(e);
				if (!isFocusable(id)) {
					return false;
				}
				if (eventState.target !== id) {
					setFocusOut(eventState.target);
				}

				setFocusIn(id);

				if (config.focus) {
					config.focus(null, exportImageState(id));
				}
				return handlers.startMove(e);
			},

			focusOut: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (typeof(e.touches) !== "undefined") {
					if (e.touches.length > 1) {
						return handlers.startMove(e);
					}
				}
				if (config.deniedTagNamesForFocusOut.indexOf(e.target.tagName) > -1) {
					return false;
				}
				if (eventState.target) {
					setFocusOut(eventState.target);
				}
				if (config.focus) {
					config.focus(null, null);
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
				addClassToWrapper(eventState.target, classNames.onEdit);

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
				removeClassToWrapper(eventState.target, classNames.onEdit);

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
				addClassToWrapper(eventState.target, classNames.onEdit);
				addClassToHandle(eventState.handle, classNames.onEdit);

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
				var aspectRatio = state.originalWidth / state.originalHeight;
				var width = eventState.width;
				var height = eventState.height;
				var axisX = eventState.x;
				var axisY = eventState.y;
				var cropTop = eventState.cropTop;
				var cropBottom = eventState.cropBottom;
				var cropLeft = eventState.cropLeft;
				var cropRight = eventState.cropRight;
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

				// fix slow resize after crop
				diffX *= (2 * (cropLeft + cropRight) + width) / width;
				diffY *= (2 * (cropTop + cropBottom) + height) / height;

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

				cropTop = height * (eventState.cropTop / eventState.height);
				cropBottom = height * (eventState.cropBottom / eventState.height);
				cropLeft = width * (eventState.cropLeft / eventState.width);
				cropRight = width * (eventState.cropRight / eventState.width);

				// cropTop *= height / eventState.height;
				// cropBottom *= height / eventState.height;
				// cropLeft *= width / eventState.width;
				// cropRight *= width / eventState.width;

				diffX = (cropLeft - eventState.cropLeft) + (cropRight - eventState.cropRight);
				diffY = (cropTop - eventState.cropTop) + (cropBottom - eventState.cropBottom);

				// on developing
				// bad performance resize after crop

				// slow but correct calculation
				if (direction === "n") {
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else if (direction === "ne") {
					axisX -= 0.5 * diffX * cosFraction;
					axisY -= 0.5 * diffX * sinFraction;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else if (direction === "e") {
					axisX -= 0.5 * diffX * cosFraction;
					axisY -= 0.5 * diffX * sinFraction;
				} else if (direction === "se") {
					axisX -= 0.5 * diffX * cosFraction;
					axisY -= 0.5 * diffX * sinFraction;
					axisX += 0.5 * diffY * sinFraction;
					axisY -= 0.5 * diffY * cosFraction;
				} else if (direction === "s") {
					axisX += 0.5 * diffY * sinFraction;
					axisY -= 0.5 * diffY * cosFraction;
				} else if (direction === "sw") {
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
					axisX += 0.5 * diffY * sinFraction;
					axisY -= 0.5 * diffY * cosFraction;
				} else if (direction === "w") {
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
				} else if (direction === "nw") {
					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;
					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;
				} else {
					return false;
				}

				// incorrect calculation but fast
				// if (direction === "n") {
				// 	height += diffY;
				// } else if (direction === "ne") {
				// 	width += diffX;
				// 	height += diffY;
				// } else if (direction === "e") {
				// 	width += diffX;
				// } else if (direction === "se") {
				// 	width += diffX;
				// 	height += diffY;
				// } else if (direction === "s") {
				// 	height += diffY;
				// } else if (direction === "sw") {
				// 	width += diffX;
				// 	height += diffY;
				// } else if (direction === "w") {
				// 	width += diffX;
				// } else if (direction === "nw") {
				// 	width += diffX;
				// 	height += diffY;
				// } else {
				// 	return false;
				// }

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
				removeClassToWrapper(eventState.target, classNames.onEdit);
				removeClassToHandle(eventState.handle, classNames.onEdit);

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
					addClassToWrapper(eventState.target, classNames.onEdit);
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
					removeClassToWrapper(eventState.target, classNames.onEdit);
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
				addClassToWrapper(eventState.target, classNames.onEdit);

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
				removeClassToWrapper(eventState.target, classNames.onEdit);

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
				addClassToWrapper(eventState.target, classNames.onEdit);
				addClassToHandle(eventState.handle, classNames.onEdit);

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
				removeClassToWrapper(eventState.target, classNames.onEdit);
				removeClassToHandle(eventState.handle, classNames.onEdit);

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
				addClassToWrapper(eventState.target, classNames.onEdit);
				addClassToHandle(eventState.handle, classNames.onEdit);

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
					var tmp = cropTop;
					cropTop = cropBottom;
					cropBottom = tmp;
				}
				if (Math.abs(rotateY) > 90) {
					scaleX = -1 * scaleX;
					var tmp = cropLeft;
					cropLeft = cropRight;
					cropRight = tmp;
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
				removeClassToWrapper(eventState.target, classNames.onEdit);
				removeClassToHandle(eventState.handle, classNames.onEdit);

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
				addClassToWrapper(eventState.target, classNames.onEdit);
				addClassToHandle(eventState.handle, classNames.onEdit);

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
				removeClassToWrapper(eventState.target, classNames.onEdit);
				removeClassToHandle(eventState.handle, classNames.onEdit);

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
			var state = imageStates.find(function(elem){
				if (elem.id === id) {
					return elem;
				}
			});
			if (!state) {
				return false;
			}

			var originWrapper = document.getElementById(originId + id);
			var cloneWrapper = document.getElementById(cloneId + id);
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

			for(var key in newState) {
				if (newState.hasOwnProperty(key)) {
					if ([
						"id"
					].indexOf(key) > -1) {
						if (
							isString(newState[key]) &&
							!isExist(newState[key]) &&
							!isEmpty(newState[key])
						) {
							state["oldId"] = state[key];
							state[key] = toString(newState[key]);
						}
					} else if ([
						"index",
						"width",
						"height",
						"x",
						"y",
						"rotate",
						"rotateX",
						"rotateY",
						"scaleX",
						"scaleY",
						"opacity",
						"cropTop",
						"cropBottom",
						"cropLeft",
						"cropRight",
					].indexOf(key) > -1) {
						if (isNumeric(newState[key])) {
							state[key] = toNumber(newState[key]);
						}
					} else if ([
						"lockAspectRatio",
						"visible",
						"focusabled",
						"editabled",
						"drawabled",
					].indexOf(key) > -1) {
						if (isBoolean(newState[key])) {
							state[key] = toBoolean(newState[key]);
						}
					}
				}
			}

			// id changed
			if (state.oldId) {
				// change focus
				if (eventState.target) {
					if (eventState.target === state.oldId) {
						eventState.target = state.id;
					}
				}

				// change element id
				originWrapper.id = originId + state.id;
				cloneWrapper.id = cloneId + state.id;

				// change undo caches
				undoCaches.forEach(function(elem){
					if (elem.id === state.oldId) {
						elem.id = state.id;
						elem.state.id = state.id;
					}
				});

				// change redo caches
				redoCaches.forEach(function(elem){
					if (elem.id === state.oldId) {
						elem.id = state.id;
						elem.state.id = state.id;
					}
				});

				// clear old id
				state.oldId = undefined;
			}

			var index = state.index;
			var width = state.width;
			var height = state.height;
			var top = (state.y - (state.height * 0.5));
			var left = (state.x - (state.width * 0.5));
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
				if (!originWrapper.classList.contains(classNames.hidden)) {
					originWrapper.classList.add(classNames.hidden);
				}
				if (!cloneWrapper.classList.contains(classNames.hidden)) {
					cloneWrapper.classList.add(classNames.hidden);
				}
			} else {
				if (originWrapper.classList.contains(classNames.hidden)) {
					originWrapper.classList.remove(classNames.hidden);
				}
				if (cloneWrapper.classList.contains(classNames.hidden)) {
					cloneWrapper.classList.remove(classNames.hidden);
				}
			}

			if (!state.focusabled) {
				if (!originWrapper.classList.contains(classNames.unfocusabled)) {
					originWrapper.classList.add(classNames.unfocusabled);
				}
				if (!cloneWrapper.classList.contains(classNames.unfocusabled)) {
					cloneWrapper.classList.add(classNames.unfocusabled);
				}
			} else {
				if (originWrapper.classList.contains(classNames.unfocusabled)) {
					originWrapper.classList.remove(classNames.unfocusabled);
				}
				if (cloneWrapper.classList.contains(classNames.unfocusabled)) {
					cloneWrapper.classList.remove(classNames.unfocusabled);
				}
			}

			if (!state.editabled) {
				if (!originWrapper.classList.contains(classNames.uneditabled)) {
					originWrapper.classList.add(classNames.uneditabled);
				}
				if (!cloneWrapper.classList.contains(classNames.uneditabled)) {
					cloneWrapper.classList.add(classNames.uneditabled);
				}
			} else {
				if (originWrapper.classList.contains(classNames.uneditabled)) {
					originWrapper.classList.remove(classNames.uneditabled);
				}
				if (cloneWrapper.classList.contains(classNames.uneditabled)) {
					cloneWrapper.classList.remove(classNames.uneditabled);
				}
			}

			if (!state.drawabled) {
				if (!originWrapper.classList.contains(classNames.undrawabled)) {
					originWrapper.classList.add(classNames.undrawabled);
				}
				if (!cloneWrapper.classList.contains(classNames.undrawabled)) {
					cloneWrapper.classList.add(classNames.undrawabled);
				}
			} else {
				if (originWrapper.classList.contains(classNames.undrawabled)) {
					originWrapper.classList.remove(classNames.undrawabled);
				}
				if (cloneWrapper.classList.contains(classNames.undrawabled)) {
					cloneWrapper.classList.remove(classNames.undrawabled);
				}
			}

			return true;
		}

		function addClassToWrapper(id, cls) {
			if (!id) {
				return false;
			}
			var originWrapper = document.getElementById(originId + id);
			var cloneWrapper = document.getElementById(cloneId + id);
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
			var originWrapper = document.getElementById(originId + id);
			var cloneWrapper = document.getElementById(cloneId + id);
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
			var typ;
			var direction;
			if (handle.classList.contains("canvaaas-handle-rotate")) {
				typ = ".canvaaas-handle-rotate";
			} else if (handle.classList.contains("canvaaas-handle-resize")) {
				typ = ".canvaaas-handle-resize";
			} else if (handle.classList.contains("canvaaas-handle-flip")) {
				typ = ".canvaaas-handle-flip";
			} else if (handle.classList.contains("canvaaas-handle-crop")) {
				typ = ".canvaaas-handle-crop";
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

			var originWrapper = document.getElementById(originId + id);
			var cloneWrapper = document.getElementById(cloneId + id);
			if (
				!originWrapper ||
				!cloneWrapper
			) {
				return false;
			}

			var originHandle = originWrapper.querySelector("div" + typ + direction);
			var cloneHandle = cloneWrapper.querySelector("div" + typ + direction);
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
			var typ;
			var direction;
			if (handle.classList.contains("canvaaas-handle-rotate")) {
				typ = ".canvaaas-handle-rotate";
			} else if (handle.classList.contains("canvaaas-handle-resize")) {
				typ = ".canvaaas-handle-resize";
			} else if (handle.classList.contains("canvaaas-handle-flip")) {
				typ = ".canvaaas-handle-flip";
			} else if (handle.classList.contains("canvaaas-handle-crop")) {
				typ = ".canvaaas-handle-crop";
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

			var originWrapper = document.getElementById(originId + id);
			var cloneWrapper = document.getElementById(cloneId + id);
			if (
				!originWrapper ||
				!cloneWrapper
			) {
				return false;
			}

			var originHandle = originWrapper.querySelector("div" + typ + direction);
			var cloneHandle = cloneWrapper.querySelector("div" + typ + direction);
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

		function unsetHandleState() {
			handleState = {
				resize: {
					n: false,
					ne: false,
					e: false,
					se: false,
					s: false,
					sw: false,
					w: false,
					nw: false
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
					n: false,
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
					e: false,
					se: false,
					s: false,
					sw: false,
					w: false,
					nw: false
				}
			}
			return true;
		}

		function setHandleState(newState) {
			var resize = newState.resize;
			var crop = newState.crop;
			var rotate = newState.rotate;
			var flip = newState.flip;

			unsetHandleState();

			if (
				typeof(resize) === "object" &&
				resize !== null
			) {
				for(var key in resize) {
					if (resize.hasOwnProperty(key)) {
						if (isBoolean(resize[key])) {
							handleState["resize"][key] = toBoolean(resize[key]);
						}
					}
				}
			}
			if (
				typeof(crop) === "object" &&
				crop !== null
			) {
				for(var key in crop) {
					if (crop.hasOwnProperty(key)) {
						if (isBoolean(crop[key])) {
							handleState["crop"][key] = toBoolean(crop[key]);
						}
					}
				}
			}
			if (
				typeof(rotate) === "object" &&
				rotate !== null
			) {
				for(var key in rotate) {
					if (rotate.hasOwnProperty(key)) {
						if (isBoolean(rotate[key])) {
							handleState["rotate"][key] = toBoolean(rotate[key]);
						}
					}
				}
			}
			if (
				typeof(flip) === "object" &&
				flip !== null
			) {
				for(var key in flip) {
					if (flip.hasOwnProperty(key)) {
						if (isBoolean(flip[key])) {
							handleState["flip"][key] = toBoolean(flip[key]);
						}
					}
				}
			}
			if (eventState.target) {
				hideHandle(eventState.target);
				showHandle(eventState.target);
			}
			return true;
		}

		function showHandle(id) {
			var originWrapper = document.getElementById(originId + id);
			var cloneWrapper = document.getElementById(cloneId + id);
			if (
				!originWrapper ||
				!cloneWrapper
			) {
				return false;
			}

			var originResizeHandles = originWrapper.querySelectorAll("div.canvaaas-handle-resize");
			var originCropHandles = originWrapper.querySelectorAll("div.canvaaas-handle-crop");
			var originRotateHandles = originWrapper.querySelectorAll("div.canvaaas-handle-rotate");
			var originFlipHandles = originWrapper.querySelectorAll("div.canvaaas-handle-flip");
			var cloneResizeHandles = cloneWrapper.querySelectorAll("div.canvaaas-handle-resize");
			var cloneCropHandles = cloneWrapper.querySelectorAll("div.canvaaas-handle-crop");
			var cloneRotateHandles = cloneWrapper.querySelectorAll("div.canvaaas-handle-rotate");
			var cloneFlipHandles = cloneWrapper.querySelectorAll("div.canvaaas-handle-flip");

			originResizeHandles.forEach(function(elem){
				var direction = getDirection(elem);
				if (handleState["resize"][direction] === true) {
					if (elem.classList.contains(classNames.hidden)) {
						elem.classList.remove(classNames.hidden);
					}
				} else {
					if (!elem.classList.contains(classNames.hidden)) {
						elem.classList.add(classNames.hidden);
					}
				}
			});

			originCropHandles.forEach(function(elem){
				var direction = getDirection(elem);
				if (handleState["crop"][direction] === true) {
					if (elem.classList.contains(classNames.hidden)) {
						elem.classList.remove(classNames.hidden);
					}
				} else {
					if (!elem.classList.contains(classNames.hidden)) {
						elem.classList.add(classNames.hidden);
					}
				}
			});

			originRotateHandles.forEach(function(elem){
				var direction = getDirection(elem);
				if (handleState["rotate"][direction] === true) {
					if (elem.classList.contains(classNames.hidden)) {
						elem.classList.remove(classNames.hidden);
					}
				} else {
					if (!elem.classList.contains(classNames.hidden)) {
						elem.classList.add(classNames.hidden);
					}
				}
			});

			originFlipHandles.forEach(function(elem){
				var direction = getDirection(elem);
				if (handleState["flip"][direction] === true) {
					if (elem.classList.contains(classNames.hidden)) {
						elem.classList.remove(classNames.hidden);
					}
				} else {
					if (!elem.classList.contains(classNames.hidden)) {
						elem.classList.add(classNames.hidden);
					}
				}
			});

			cloneResizeHandles.forEach(function(elem){
				var direction = getDirection(elem);
				if (handleState["resize"][direction] === true) {
					if (elem.classList.contains(classNames.hidden)) {
						elem.classList.remove(classNames.hidden);
					}
				} else {
					if (!elem.classList.contains(classNames.hidden)) {
						elem.classList.add(classNames.hidden);
					}
				}
			});

			cloneCropHandles.forEach(function(elem){
				var direction = getDirection(elem);
				if (handleState["crop"][direction] === true) {
					if (elem.classList.contains(classNames.hidden)) {
						elem.classList.remove(classNames.hidden);
					}
				} else {
					if (!elem.classList.contains(classNames.hidden)) {
						elem.classList.add(classNames.hidden);
					}
				}
			});

			cloneRotateHandles.forEach(function(elem){
				var direction = getDirection(elem);
				if (handleState["rotate"][direction] === true) {
					if (elem.classList.contains(classNames.hidden)) {
						elem.classList.remove(classNames.hidden);
					}
				} else {
					if (!elem.classList.contains(classNames.hidden)) {
						elem.classList.add(classNames.hidden);
					}
				}
			});

			cloneFlipHandles.forEach(function(elem){
				var direction = getDirection(elem);
				if (handleState["flip"][direction] === true) {
					if (elem.classList.contains(classNames.hidden)) {
						elem.classList.remove(classNames.hidden);
					}
				} else {
					if (!elem.classList.contains(classNames.hidden)) {
						elem.classList.add(classNames.hidden);
					}
				}
			});

			return true;
		}

		function hideHandle(id) {
			var originWrapper = document.getElementById(originId + id);
			var cloneWrapper = document.getElementById(cloneId + id);
			if (
				!originWrapper ||
				!cloneWrapper
			) {
				return false;
			}

			var originResizeHandles = originWrapper.querySelectorAll("div.canvaaas-handle-resize");
			var originCropHandles = originWrapper.querySelectorAll("div.canvaaas-handle-crop");
			var originRotateHandles = originWrapper.querySelectorAll("div.canvaaas-handle-rotate");
			var originFlipHandles = originWrapper.querySelectorAll("div.canvaaas-handle-flip");
			var cloneResizeHandles = cloneWrapper.querySelectorAll("div.canvaaas-handle-resize");
			var cloneCropHandles = cloneWrapper.querySelectorAll("div.canvaaas-handle-crop");
			var cloneRotateHandles = cloneWrapper.querySelectorAll("div.canvaaas-handle-rotate");
			var cloneFlipHandles = cloneWrapper.querySelectorAll("div.canvaaas-handle-flip");

			originResizeHandles.forEach(function(elem){
				if (!elem.classList.contains(classNames.hidden)) {
					elem.classList.add(classNames.hidden);
				}
			});

			originCropHandles.forEach(function(elem){
				if (!elem.classList.contains(classNames.hidden)) {
					elem.classList.add(classNames.hidden);
				}
			});

			originRotateHandles.forEach(function(elem){
				if (!elem.classList.contains(classNames.hidden)) {
					elem.classList.add(classNames.hidden);
				}
			});

			originFlipHandles.forEach(function(elem){
				if (!elem.classList.contains(classNames.hidden)) {
					elem.classList.add(classNames.hidden);
				}
			});

			cloneResizeHandles.forEach(function(elem){
				if (!elem.classList.contains(classNames.hidden)) {
					elem.classList.add(classNames.hidden);
				}
			});

			cloneCropHandles.forEach(function(elem){
				if (!elem.classList.contains(classNames.hidden)) {
					elem.classList.add(classNames.hidden);
				}
			});

			cloneRotateHandles.forEach(function(elem){
				if (!elem.classList.contains(classNames.hidden)) {
					elem.classList.add(classNames.hidden);
				}
			});

			cloneFlipHandles.forEach(function(elem){
				if (!elem.classList.contains(classNames.hidden)) {
					elem.classList.add(classNames.hidden);
				}
			});

			return true;
		}

		function exportConfig() {
			var tmp = {};
			for(var key in config) {
				if (config.hasOwnProperty(key)) {
					if (typeof(config[key]) === "function") {
						tmp[key] = true;
					} else {
						tmp[key] = config[key];
					}
				}
			}
			return tmp;
		}

		function exportHandleState() {
			var resize = handleState.resize;
			var crop = handleState.crop;
			var rotate = handleState.rotate;
			var flip = handleState.flip;
			var tmp = {
				resize: {},
				crop: {},
				rotate: {},
				flip: {},
			};

			for(var key in resize) {
				if (resize.hasOwnProperty(key)) {
					tmp["resize"][key] = resize[key];
				}
			}
			for(var key in crop) {
				if (crop.hasOwnProperty(key)) {
					tmp["crop"][key] = crop[key];
				}
			}
			for(var key in rotate) {
				if (rotate.hasOwnProperty(key)) {
					tmp["rotate"][key] = rotate[key];
				}
			}
			for(var key in flip) {
				if (flip.hasOwnProperty(key)) {
					tmp["flip"][key] = flip[key];
				}
			}

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
			tmp.drawabled = canvasState.drawabled;
			tmp.background = canvasState.background;
			tmp.checker = canvasState.checker;
			tmp.overlay = canvasState.overlay;

			var ar = getAspectRatio(tmp.width, tmp.height);
			tmp.aspectRatio = "" + ar[0] + ":" + ar[1];

			return tmp;
		}

		function importImageState(state) {
			var tmp = {};
			for(var key in state) {
				if (state.hasOwnProperty(key)) {
					if ([
						"id"
					].indexOf(key) > -1) {
						if (isString(state[key])) {
							tmp[key] = toString(state[key]);
						}
					} else if ([
						"width",
						"x",
						"cropLeft",
						"cropRight",
					].indexOf(key) > -1) {
						if (isNumeric(state[key])) {
							tmp[key] = toNumber(state[key]) * (canvasState.width / canvasState.originalWidth);
						}
					} else if ([
						"height",
						"y",
						"cropTop",
						"cropBottom",
					].indexOf(key) > -1) {
						if (isNumeric(state[key])) {
							tmp[key] = toNumber(state[key]) * (canvasState.height / canvasState.originalHeight);
						}
					} else if ([
						"index",
						"rotate",
						"scaleX",
						"scaleY",
						"opacity",
					].indexOf(key) > -1) {
						if (isNumeric(state[key])) {
							tmp[key] = toNumber(state[key]);
						}
					} else if ([
						"lockAspectRatio",
						"visible",
						"focusabled",
						"editabled",
						"drawabled",
					].indexOf(key) > -1) {
						if (isBoolean(state[key])) {
							tmp[key] = toBoolean(state[key]);
						}
					}
				}
			}

			return tmp;
		}

		function exportImageState(id) {
			var state = getState(id);
			var tmp = {};
			for(var key in state) {
				if (state.hasOwnProperty(key)) {
					if ([
						"id",
						"src",
					].indexOf(key) > -1) {
						if (isString(state[key])) {
							tmp[key] = toString(state[key]);
						}
					} else if ([
						"width",
						"x",
						"cropLeft",
						"cropRight",
					].indexOf(key) > -1) {
						if (isNumeric(state[key])) {
							tmp[key] = toNumber(state[key]) / (canvasState.width / canvasState.originalWidth);
						}
					} else if ([
						"height",
						"y",
						"cropTop",
						"cropBottom",
					].indexOf(key) > -1) {
						if (isNumeric(state[key])) {
							tmp[key] = toNumber(state[key]) / (canvasState.height / canvasState.originalHeight);
						}
					} else if ([
						"originalWidth",
						"originalHeight",
						"index",
						"rotate",
						"scaleX",
						"scaleY",
						"opacity",
					].indexOf(key) > -1) {
						if (isNumeric(state[key])) {
							tmp[key] = toNumber(state[key]);
						}
					} else if ([
						"lockAspectRatio",
						"visible",
						"focusabled",
						"editabled",
						"drawabled",
					].indexOf(key) > -1) {
						if (isBoolean(state[key])) {
							tmp[key] = toBoolean(state[key]);
						}
					}
				}
			}

			var originalAspectRatio = getAspectRatio(tmp.originalWidth, tmp.originalHeight);
			var aspectRatio = getAspectRatio(tmp.width, tmp.height);

			tmp.originalAspectRatio = "" + originalAspectRatio[0] + ":" + originalAspectRatio[1];
			tmp.aspectRatio = "" + aspectRatio[0] + ":" + aspectRatio[1];
			tmp.left = tmp.x - (0.5 * tmp.width);
			tmp.top = tmp.y - (0.5 * tmp.height);

			return tmp;
		}

		function parseState(obj) {
			var res = {};

			if (isObject(obj)) {
				var stateKeys = Object.keys(obj);
				for (var i = 0; i < stateKeys.length; i++) {
					var j = stateKeys[i];
					if (obj.hasOwnProperty(j)) {
						if (isNumeric(obj[j])) {
							res[j] = toNumber(obj[j]);
						} else if (isBoolean(obj[j])) {
							res[j] = toBoolean(obj[j]);
						} else if (isString(obj[j])) {
							res[j] = toString(obj[j]);
						}
					}
				}
			} else if (isString(obj)) {
				try {
					var parsed = JSON.parse(obj);
					var parsedKeys = Object.keys(parsed);
					for (var i = 0; i < parsedKeys.length; i++) {
						var j = parsedKeys[i];
						if (parsed.hasOwnProperty(j)) {
							if (isNumeric(parsed[j])) {
								res[j] = toNumber(parsed[j]);
							} else if (isBoolean(parsed[j])) {
								res[j] = toBoolean(parsed[j]);
							} else if (isString(parsed[j])) {
								res[j] = parsed[j];
							}
						}
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			} else {
				return false;
			}

			if (!res.src) {
				if (res.url) {
					res.src = res.url;
				} else if (res.path) {
					res.src = res.path;
				}
			}

			return res;
		}

		function getDataset(elem) {
			var stateKeys = [
				"state",
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
				"scaleX",
				"scaleY",
				"opacity",
				"lockAspectRatio",
				"visible",
				"focusabled",
				"editabled",
				"drawabled",
				"cropTop",
				"cropBottom",
				"cropLeft",
				"cropRight",
			];

			var thisAttrs = {};
			for (var i = 0; i < stateKeys.length; i++) {
				var tmp = elem.getAttribute("data-" + stateKeys[i]);
				if (!isEmpty(tmp)) {
					if (isNumeric(tmp)) {
						thisAttrs[stateKeys[i]] = toNumber(tmp);
					} else {
						thisAttrs[stateKeys[i]] = tmp;
					}
				}
			}

			var res;
			if (thisAttrs.state) {
				res = parseState(thisAttrs.state);
			} else {
				res = parseState(thisAttrs);
			}
			return res;
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

				if (!canvasObject.classList.contains(classNames.onFocus)) {
					canvasObject.classList.add(classNames.onFocus);
				}
				if (!mirrorObject.classList.contains(classNames.onFocus)) {
					mirrorObject.classList.add(classNames.onFocus);
				}

				if (!originWrapper.classList.contains(classNames.onFocus)) {
					originWrapper.classList.add(classNames.onFocus);
				}
				if (!cloneWrapper.classList.contains(classNames.onFocus)) {
					cloneWrapper.classList.add(classNames.onFocus);
				}

				originWrapper.removeEventListener("mousedown", handlers.focusIn, false);

				originWrapper.addEventListener("mousedown", handlers.startMove, false);
				originWrapper.addEventListener("touchstart", handlers.startMove, false);
				originWrapper.addEventListener("wheel", handlers.startWheelZoom, false);

				originWrapper.querySelectorAll("div.canvaaas-handle-rotate").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startRotate, false);
					elem.addEventListener("touchstart", handlers.startRotate, false);
				});

				originWrapper.querySelectorAll("div.canvaaas-handle-resize").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startResize, false);
					elem.addEventListener("touchstart", handlers.startResize, false);
				});

				originWrapper.querySelectorAll("div.canvaaas-handle-flip").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startFlip, false);
					elem.addEventListener("touchstart", handlers.startFlip, false);
				});

				originWrapper.querySelectorAll("div.canvaaas-handle-crop").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startCrop, false);
					elem.addEventListener("touchstart", handlers.startCrop, false);
				});

				cloneWrapper.removeEventListener("mousedown", handlers.focusIn, false);

				cloneWrapper.addEventListener("mousedown", handlers.startMove, false);
				cloneWrapper.addEventListener("touchstart", handlers.startMove, false);
				cloneWrapper.addEventListener("wheel", handlers.startWheelZoom, false);

				cloneWrapper.querySelectorAll("div.canvaaas-handle-rotate").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startRotate, false);
					elem.addEventListener("touchstart", handlers.startRotate, false);
				});

				cloneWrapper.querySelectorAll("div.canvaaas-handle-resize").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startResize, false);
					elem.addEventListener("touchstart", handlers.startResize, false);
				});

				cloneWrapper.querySelectorAll("div.canvaaas-handle-flip").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startFlip, false);
					elem.addEventListener("touchstart", handlers.startFlip, false);
				});

				cloneWrapper.querySelectorAll("div.canvaaas-handle-crop").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startCrop, false);
					elem.addEventListener("touchstart", handlers.startCrop, false);
				});

				document.addEventListener("mousedown", handlers.focusOut, false);
				document.addEventListener("touchstart", handlers.focusOut, false);

				showHandle(id);

				eventState.target = id;

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

				if (canvasObject.classList.contains(classNames.onFocus)) {
					canvasObject.classList.remove(classNames.onFocus);
				}
				if (mirrorObject.classList.contains(classNames.onFocus)) {
					mirrorObject.classList.remove(classNames.onFocus);
				}

				if (originWrapper.classList.contains(classNames.onFocus)) {
					originWrapper.classList.remove(classNames.onFocus);
				}
				if (cloneWrapper.classList.contains(classNames.onFocus)) {
					cloneWrapper.classList.remove(classNames.onFocus);
				}

				originWrapper.addEventListener("mousedown", handlers.focusIn, false);

				originWrapper.removeEventListener("mousedown", handlers.startMove, false);
				originWrapper.removeEventListener("touchstart", handlers.startMove, false);
				originWrapper.removeEventListener("wheel", handlers.startWheelZoom, false);

				originWrapper.querySelectorAll("div.canvaaas-handle-rotate").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startRotate, false);
					elem.removeEventListener("touchstart", handlers.startRotate, false);
				});

				originWrapper.querySelectorAll("div.canvaaas-handle-resize").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startResize, false);
					elem.removeEventListener("touchstart", handlers.startResize, false);
				});

				originWrapper.querySelectorAll("div.canvaaas-handle-flip").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startFlip, false);
					elem.removeEventListener("touchstart", handlers.startFlip, false);
				});

				originWrapper.querySelectorAll("div.canvaaas-handle-crop").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startCrop, false);
					elem.removeEventListener("touchstart", handlers.startCrop, false);
				});

				cloneWrapper.addEventListener("mousedown", handlers.focusIn, false);

				cloneWrapper.removeEventListener("mousedown", handlers.startMove, false);
				cloneWrapper.removeEventListener("touchstart", handlers.startMove, false);
				cloneWrapper.removeEventListener("wheel", handlers.startWheelZoom, false);

				cloneWrapper.querySelectorAll("div.canvaaas-handle-rotate").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startRotate, false);
					elem.removeEventListener("touchstart", handlers.startRotate, false);
				});

				cloneWrapper.querySelectorAll("div.canvaaas-handle-resize").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startResize, false);
					elem.removeEventListener("touchstart", handlers.startResize, false);
				});

				cloneWrapper.querySelectorAll("div.canvaaas-handle-flip").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startFlip, false);
					elem.removeEventListener("touchstart", handlers.startFlip, false);
				});

				cloneWrapper.querySelectorAll("div.canvaaas-handle-crop").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startCrop, false);
					elem.removeEventListener("touchstart", handlers.startCrop, false);
				});

				document.removeEventListener("mousedown", handlers.focusOut, false);
				document.removeEventListener("touchstart", handlers.focusOut, false);

				hideHandle(id);

				eventState.target = undefined;

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
			var thisImage = new Image();
			thisImage.src = imgState.src;
			thisImage.onerror = function(err) {
				return cb(err);
			}
			thisImage.onload = function(e) {
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
					thisImage,
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
		function renderImage(data, exportedState, cb) {
			var newImage = new Image();
			var src;
			var ext;

			try {
				// check file or url
				if (isObject(data)) {
					// file
					try {
						src = URL.createObjectURL(data);
					} catch(err) {
						console.log(err);
						if (cb) {
							cb("File not found");
						}
						return false;
					}
				} else if (isString(data)) {
					// url
					src = data;
				} else {
					if (cb) {
						cb("File not found");
					}
					return false;
				}

				// check mimeType
				ext = getExtension(data);
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
					console.log(err);
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

				// set handles hidden
				newOrigin.querySelectorAll("div.canvaaas-handle").forEach(function(elem){
					if (!elem.classList.contains(classNames.hidden)) {
						elem.classList.add(classNames.hidden);
					}
				});

				newClone.querySelectorAll("div.canvaaas-handle").forEach(function(elem){
					if (!elem.classList.contains(classNames.hidden)) {
						elem.classList.add(classNames.hidden);
					}
				});

				// set events
				newOriginImage.addEventListener("mousedown", handlers.focusIn, false);
				newOriginImage.addEventListener("touchstart", handlers.focusIn, false);

				newCloneImage.addEventListener("mousedown", handlers.focusIn, false);
				newCloneImage.addEventListener("touchstart", handlers.focusIn, false);

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

				imageStates.splice(seq, 1);
				originWrapper.parentNode.removeChild(originWrapper);
				cloneWrapper.parentNode.removeChild(cloneWrapper);

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

			// set class names
			if (!canvasState.checker) {
				if (canvasObject.classList.contains(classNames.checker)) {
					canvasObject.classList.remove(classNames.checker);
				}
			} else {
				if (!canvasObject.classList.contains(classNames.checker)) {
					canvasObject.classList.add(classNames.checker);
				}
			}

			if (!canvasState.overlay) {
				if (!mirrorObject.classList.contains(classNames.hidden)) {
					mirrorObject.classList.add(classNames.hidden);
				}
			} else {
				if (mirrorObject.classList.contains(classNames.hidden)) {
					mirrorObject.classList.remove(classNames.hidden);
				}
			}

			if (!canvasState.focusabled) {
				if (!canvasObject.classList.contains(classNames.unfocusabled)) {
					canvasObject.classList.add(classNames.unfocusabled);
				}
				if (!mirrorObject.classList.contains(classNames.unfocusabled)) {
					mirrorObject.classList.add(classNames.unfocusabled);
				}
			} else {
				if (canvasObject.classList.contains(classNames.unfocusabled)) {
					canvasObject.classList.remove(classNames.unfocusabled);
				}
				if (mirrorObject.classList.contains(classNames.unfocusabled)) {
					mirrorObject.classList.remove(classNames.unfocusabled);
				}
			}

			if (!canvasState.editabled) {
				if (!canvasObject.classList.contains(classNames.uneditabled)) {
					canvasObject.classList.add(classNames.uneditabled);
				}
				if (!mirrorObject.classList.contains(classNames.uneditabled)) {
					mirrorObject.classList.add(classNames.uneditabled);
				}
			} else {
				if (canvasObject.classList.contains(classNames.uneditabled)) {
					canvasObject.classList.remove(classNames.uneditabled);
				}
				if (mirrorObject.classList.contains(classNames.uneditabled)) {
					mirrorObject.classList.remove(classNames.uneditabled);
				}
			}

			if (!canvasState.drawabled) {
				if (!canvasObject.classList.contains(classNames.undrawabled)) {
					canvasObject.classList.add(classNames.undrawabled);
				}
				if (!mirrorObject.classList.contains(classNames.undrawabled)) {
					mirrorObject.classList.add(classNames.undrawabled);
				}
			} else {
				if (canvasObject.classList.contains(classNames.undrawabled)) {
					canvasObject.classList.remove(classNames.undrawabled);
				}
				if (mirrorObject.classList.contains(classNames.undrawabled)) {
					mirrorObject.classList.remove(classNames.undrawabled);
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

			if (!canvasState.checker) {
				if (canvasObject.classList.contains(classNames.checker)) {
					canvasObject.classList.remove(classNames.checker);
				}
			} else {
				if (!canvasObject.classList.contains(classNames.checker)) {
					canvasObject.classList.add(classNames.checker);
				}
			}

			mirrorObject.style.width = "";
			mirrorObject.style.height = "";
			mirrorObject.style.left = "";
			mirrorObject.style.top = "";

			if (!canvasState.overlay) {
				if (!mirrorObject.classList.contains(classNames.hidden)) {
					mirrorObject.classList.add(classNames.hidden);
				}
			} else {
				if (mirrorObject.classList.contains(classNames.hidden)) {
					mirrorObject.classList.remove(classNames.hidden);
				}
			}

			backgroundObject.style.width = "";
			backgroundObject.style.height = "";
			backgroundObject.style.left = "";
			backgroundObject.style.top = "";
			backgroundObject.style.background = "";

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

		function startLoading(target) {
			var wrapper = document.createElement("div");
			wrapper.classList.add("canvaaas-loading-wrapper");
			wrapper.innerHTML = loadingTemplate;

			eventState.scrollTop = document.documentElement.scrollTop || document.querySelector('html').scrollTop;

			document.body.classList.add("canvaaas-fixed");

			target.appendChild(wrapper);

			return wrapper;
		}

		function endLoading(wrapper) {
			document.body.classList.remove("canvaaas-fixed");

			window.scrollTo({
				top: eventState.scrollTop,
				behavior:'smooth'
			});

			eventState.scrollTop = undefined;

			wrapper.parentNode.removeChild(wrapper);
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

		function isEmpty(obj) {
			if (typeof(obj) === "undefined") {
				return true;
			} else if (typeof(obj) === "string") {
				return obj.trim() === "";
			} else if (typeof(obj) === "number") {
				return obj === NaN;
			} else if (Array.isArray(obj)) {
				return obj.length < 1;
			} else if (typeof(obj) === "object") {
				if (obj === null) {
					return true;
				}
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						return false;
					}
				}
				return JSON.stringify(obj) === JSON.stringify({});
			} else {
				return false;
			}
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
			let check = false;
			(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
			return check;
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
				if (
					typeof(data) === "object" &&
					data !== null
				) {
					if (data.type) {
						return data.type.split("/").pop();
					} else {
						return false;
					}
				} else if (typeof(data) === "string") {
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
		// export methods start
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
			containerObject = target.querySelector("div.canvaaas");
			canvasObject = target.querySelector("div.canvaaas-canvas");
			mirrorObject = target.querySelector("div.canvaaas-mirror");
			backgroundObject = target.querySelector("div.canvaaas-background");

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
		myObject.uploadFile = function(files, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			if (!isObject(files)) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			var thisFiles = files;
			if (thisFiles.length < 1) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				}
				return false;
			} else if (thisFiles.length > 1) {
				if (config.upload) {
					config.upload("Multiple upload not allowed");
				}
				if (cb) {
					cb("Multiple upload not allowed");
				}
				return false;
			}

			eventState.onUpload = true;
			var loading = startLoading(document.body);

			renderImage(thisFiles[0], null, function(err, res) {
				eventState.onUpload = false;
				endLoading(loading);

				if (err) {
					if (config.upload) {
						config.upload(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}

				if (config.upload) {
					config.upload(null, exportImageState(res));
				}
				if (cb) {
					cb(null, exportImageState(res));
				}
			});
		}

		// asynchronous
		myObject.uploadUrl = function(str, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			if (!str) {
				if (config.upload) {
					config.upload("URL not found");
				}
				if (cb) {
					cb("URL not found");
				}
				return false;
			}

			if (!isString(str)) {
				if (config.upload) {
					config.upload("Argument is not string");
				}
				if (cb) {
					cb("Argument is not string");
				}
				return false;
			}

			eventState.onUpload = true;
			var loading = startLoading(document.body);

			renderImage(str, null, function(err, res) {
				eventState.onUpload = false;
				endLoading(loading);

				if (err) {
					if (config.upload) {
						config.upload(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}

				if (config.upload) {
					config.upload(null, exportImageState(res));
				}
				if (cb) {
					cb(null, exportImageState(res));
				}
			});
		}

		// asynchronous
		myObject.uploadState = function(obj, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			var thisState = parseState(obj);
			if (!thisState) {
				if (config.upload) {
					config.upload("State not found");
				}
				if (cb) {
					cb("State not found");
				}
				return false;
			}
			if (!thisState.src) {
				if (config.upload) {
					config.upload("URL not found");
				}
				if (cb) {
					cb("URL not found");
				}
				return false;
			}

			eventState.onUpload = true;
			var loading = startLoading(document.body);

			renderImage(thisState.src, thisState, function(err, res) {
				eventState.onUpload = false;
				endLoading(loading);

				if (err) {
					if (config.upload) {
						config.upload(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}

				if (config.upload) {
					config.upload(null, exportImageState(res));
				}
				if (cb) {
					cb(null, exportImageState(res));
				}
			});
		}

		// asynchronous
		myObject.uploadElement = function(target, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			if (!target) {
				if (config.upload) {
					config.upload("Target not found");
				}
				if (cb) {
					cb("Target not found");
				}
				return false;
			}
			if (!isElement(target)) {
				if (config.upload) {
					config.upload("Target is not DOM Object");
				}
				if (cb) {
					cb("Target is not DOM Object");
				}
				return false;
			}

			var thisState = getDataset(target);
			var thisSrc;
			if (!target.src) {
				if (!thisState.src) {
					if (config.upload) {
						config.upload("File not found");
					}
					if (cb) {
						cb("File not found");
					}
					return false;
				} else {
					thisSrc = thisState.src;
				}
			} else {
				thisSrc = target.src;
			}

			eventState.onUpload = true;
			var loading = startLoading(document.body);

			renderImage(thisSrc, thisState, function(err, res) {
				eventState.onUpload = false;
				endLoading(loading);

				if (err) {
					if (config.upload) {
						config.upload(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}

				if (config.upload) {
					config.upload(null, exportImageState(res));
				}
				if (cb) {
					cb(null, exportImageState(res));
				}
			});
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

		// deprecated
		myObject.updateOne = function(query, updates, cb){
			if (
				!isObject(query) ||
				!isObject(updates)
			) {
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
					founds.push(elem.id);
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

			// save state
			setState(founds[0], updates);

			if (cb) {
				cb(null, exportImageState(founds[0]));
			}
			return exportImageState(founds[0]);
		}

		// deprecated
		myObject.updateMany = function(query, updates, cb){
			if (
				!isObject(query) ||
				!isObject(updates)
			) {
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
					founds.push(elem.id);
				}
			});

			if (founds.length < 1) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var results = [];
			for (var i = 0; i < founds.length; i++) {
				// save state
				setState(founds[i], updates);

				results.push(exportImageState(founds[i]));
			}

			if (cb) {
				cb(null, results);
			}
			return results;
		}

		myObject.id = function(id, newId, cb) {
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

			if (isEmpty(newId)) {
				if (config.edit) {
					config.edit("Argument is null");
				}
				if (cb) {
					cb("Argument is null");
				}
				return false;
			}

			if (isExist(newId)) {
				if (config.edit) {
					config.edit("ID duplicated");
				}
				if (cb) {
					cb("ID duplicated");
				}
				return false;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				id: newId
			});

			if (config.edit) {
				config.edit(null, exportImageState(newId));
			}
			if (cb) {
				cb(null, exportImageState(newId));
			}
			return exportImageState(newId);
		}

		myObject.move = function(id, x, y, cb) {
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

			if (
				!isNumeric(x) ||
				!isNumeric(y)
			) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);
			x = toNumber(x);
			y = toNumber(y);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				x: state.x + x,
				y: state.y + y
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.moveTo = function(id, x, y, cb) {
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

			if (
				(typeof(x) !== "string" && typeof(x) !== "number") ||
				(typeof(y) !== "string" && typeof(y) !== "number")
			) {
				if (config.edit) {
					config.edit("Argument is not numeric or string");
				}
				if (cb) {
					cb("Argument is not numeric or string");
				}
				return false;
			}

			var state = getState(id);

			if (isNumeric(x) === true) {
				x = toNumber(x);
			} else {
				var adjw = state.width - (state.cropLeft + state.cropRight);
				if (
					x.toLowerCase() === "l" ||
					x.toLowerCase() === "left"
				) {
					x = (canvasState.width * 0) + (adjw * 0.5);
				} else if (
					x.toLowerCase() === "c" ||
					x.toLowerCase() === "center"
				) {
					x = (canvasState.width * 0.5);
				} else if (
					x.toLowerCase() === "r" ||
					x.toLowerCase() === "right"
				) {
					x = (canvasState.width * 1) - (adjw * 0.5);
				}
			}

			if (isNumeric(y) === true) {
				y = toNumber(y);
			} else {
				var adjh = state.height - (state.cropTop + state.cropBottom);
				if (
					y.toLowerCase() === "t" ||
					y.toLowerCase() === "top"
				) {
					y = (canvasState.height * 0) + (adjh * 0.5);
				} else if (
					y.toLowerCase() === "c" ||
					y.toLowerCase() === "center" ||
					y.toLowerCase() === "middle"
				) {
					y = (canvasState.height * 0.5);
				} else if (
					y.toLowerCase() === "b" ||
					y.toLowerCase() === "bottom"
				) {
					y = (canvasState.height * 1) - (adjh * 0.5);
				}
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				x: x,
				y: y
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.zoom = function(id, ratio, cb) {
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

			if (!isNumeric(ratio)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);
			ratio = toNumber(ratio);

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

		myObject.zoomTo = function(id, ratio, cb) {
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

			if (
				typeof(ratio) !== "number" &&
				typeof(ratio) !== "string"
			) {
				if (config.edit) {
					config.edit("Argument is not numeric or string");
				}
				if (cb) {
					cb("Argument is not numeric or string");
				}
				return false;
			}

			var state = getState(id);
			var width;
			var height;
			var fittedSizes;
			if (!isNumeric(ratio)) {
				if (ratio === "cover") {
					fittedSizes = getCoveredSizes(
						state.originalWidth,
						state.originalHeight,
						canvasState.width,
						canvasState.height
					)
					width = fittedSizes[0];
					height = fittedSizes[1];
				} else if (ratio === "contain") {
					fittedSizes = getContainedSizes(
						state.originalWidth,
						state.originalHeight,
						canvasState.width,
						canvasState.height
					)
					width = fittedSizes[0];
					height = fittedSizes[1];
				} else {
					if (cb) {
						cb("Argument error");
					}
					return false;
				}
			} else {
				ratio = toNumber(ratio);
				width = state.originalWidth * ratio;
				height = state.originalHeight * ratio;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				width: width,
				height: height,
				cropTop: 0,
				cropBottom: 0,
				cropLeft: 0,
				cropRight: 0,
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.rotate = function(id, deg, cb){
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

			if (!isNumeric(deg)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);
			deg = toNumber(deg);

			if (state.scaleX === -1) {
				deg *= -1;
			}

			if (state.scaleY === -1) {
				deg *= -1;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				rotate: state.rotate + deg
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.rotateTo = function(id, deg, cb){
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

			if (!isNumeric(deg)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);
			deg = toNumber(deg);

			if (state.scaleX === -1) {
				deg *= -1;
			}

			if (state.scaleY === -1) {
				deg *= -1;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				rotate: deg
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
				scaleY: state.scaleY * -1,
				cropTop: state.cropBottom,
				cropBottom: state.cropTop
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
				scaleX: state.scaleX * -1,
				cropLeft: state.cropRight,
				cropRight: state.cropLeft
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.opacity = function(id, num, cb){
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

			if (!isNumeric(num)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			num = toNumber(num);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				opacity: num
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.crop = function(id, obj, cb) {
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

			if (!isObject(obj)) {
				if (config.edit) {
					config.edit("Argument is not object");
				}
				if (cb) {
					cb("Argument is not object");
				}
				return false;
			}

			var state = getState(id);
			var scaleRatioX = canvasState.width / canvasState.originalWidth;
			var scaleRatioY = canvasState.height / canvasState.originalHeight;
			var cropTop = state.cropTop;
			var cropBottom = state.cropBottom;
			var cropLeft = state.cropLeft;
			var cropRight = state.cropRight;
			if (isNumeric(obj.top)) {
				cropTop += toNumber(obj.top) * scaleRatioY;
			}
			if (isNumeric(obj.bottom)) {
				cropBottom += toNumber(obj.bottom) * scaleRatioY;
			}
			if (isNumeric(obj.left)) {
				cropLeft += toNumber(obj.left) * scaleRatioX;
			}
			if (isNumeric(obj.right)) {
				cropRight += toNumber(obj.right) * scaleRatioX;
			}
			if (cropTop < 0) {
				cropTop = 0;
			}
			if (cropBottom < 0) {
				cropBottom = 0;
			}
			if (cropLeft < 0) {
				cropLeft = 0;
			}
			if (cropRight < 0) {
				cropRight = 0;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				// width: width,
				// height: height,
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

		myObject.cropTo = function(id, obj, cb) {
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

			if (!isObject(obj)) {
				if (config.edit) {
					config.edit("Argument is not object");
				}
				if (cb) {
					cb("Argument is not object");
				}
				return false;
			}

			var state = getState(id);
			var scaleRatioX = canvasState.width / canvasState.originalWidth;
			var scaleRatioY = canvasState.height / canvasState.originalHeight;
			var cropTop = state.cropTop;
			var cropBottom = state.cropBottom;
			var cropLeft = state.cropLeft;
			var cropRight = state.cropRight;
			if (isNumeric(obj.top)) {
				cropTop = toNumber(obj.top) * scaleRatioY;
			}
			if (isNumeric(obj.bottom)) {
				cropBottom = toNumber(obj.bottom) * scaleRatioY;
			}
			if (isNumeric(obj.left)) {
				cropLeft = toNumber(obj.left) *scaleRatioX;
			}
			if (isNumeric(obj.right)) {
				cropRight = toNumber(obj.right) *scaleRatioX;
			}
			if (cropTop < 0) {
				cropTop = 0;
			}
			if (cropBottom < 0) {
				cropBottom = 0;
			}
			if (cropLeft < 0) {
				cropLeft = 0;
			}
			if (cropRight < 0) {
				cropRight = 0;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				// width: width,
				// height: height,
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

		myObject.index = function(id, idx, cb) {
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

			if (!isNumeric(idx)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			var state = getState(id);
			idx = toNumber(idx);

			// save state
			setState(id, {
				index: state.index + idx
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.indexTo = function(id, idx, cb) {
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

			if (!isNumeric(idx)) {
				if (config.edit) {
					config.edit("Argument is not numeric");
				}
				if (cb) {
					cb("Argument is not numeric");
				}
				return false;
			}

			idx = toNumber(idx);

			// save state
			setState(id, {
				index: idx
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

			if (config.focus) {
				config.focus(null, exportImageState(id));
			}
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

			if (config.focus) {
				config.focus(null, null);
			}
			if (cb) {
				cb(null, null);
			}
			return true;
		}

		myObject.aspectRatio = function(id, b, cb){
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

			if (!isBoolean(b)) {
				if (config.edit) {
					config.edit("Argument is not boolean");
				}
				if (cb) {
					cb("Argument is not boolean");
				}
				return false;
			}

			var state = getState(id);
			var aspectRatio = state.originalWidth / state.originalHeight;
			var width = state.width;
			var height = state.height;
			var cropTop = state.cropTop;
			var cropBottom = state.cropBottom;
			var cropLeft = state.cropLeft;
			var cropRight = state.cropRight;

			if (
				state.lockAspectRatio === false &&
				toBoolean(b) === true
			) {
				if (width > height * aspectRatio) {
					height = width / aspectRatio;
				} else {
					width = height * aspectRatio;
				}
				var scaleRatioX = (width / state.width);
				var scaleRatioY = (height / state.height);
				cropTop = cropTop * scaleRatioY;
				cropBottom = cropBottom * scaleRatioY;
				cropLeft = cropLeft * scaleRatioX;
				cropRight = cropRight * scaleRatioX;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				lockAspectRatio: toBoolean(b),
				width: width,
				height: height,
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

		myObject.focusable = function(id, b, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isBoolean(b)) {
				if (config.edit) {
					config.edit("Argument is not boolean");
				}
				if (cb) {
					cb("Argument is not boolean");
				}
				return false;
			}

			var state = getState(id);

			if (eventState.target) {
				if (eventState.target === id) {
					setFocusOut(id);
				}
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				focusabled: toBoolean(b)
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.editable = function(id, b, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			if (!isBoolean(b)) {
				if (config.edit) {
					config.edit("Argument is not boolean");
				}
				if (cb) {
					cb("Argument is not boolean");
				}
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				editabled: toBoolean(b)
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.drawable = function(id, b, cb){
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

			if (!isBoolean(b)) {
				if (config.edit) {
					config.edit("Argument is not boolean");
				}
				if (cb) {
					cb("Argument is not boolean");
				}
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				drawabled: toBoolean(b)
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.visible = function(id, b, cb){
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

			if (!isBoolean(b)) {
				if (config.edit) {
					config.edit("Argument is not boolean");
				}
				if (cb) {
					cb("Argument is not boolean");
				}
				return false;
			}

			var state = getState(id);

			if (toBoolean(b) === false) {
				if (eventState.target) {
					if (eventState.target === id) {
						setFocusOut(id);
					}
				}
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				visible: toBoolean(b)
			});

			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
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
			// 	overlay: boolean, (optional, default 'false')
			// 	checker: boolean, (optional, default 'true')
			// 	editabled: boolean, (optional, default 'true')
			// 	focusabled: boolean, (optional, default 'true')
			// 	drawabled: boolean, (optional, default 'true')
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
				if (isEmpty(options.filename)) {
					options.filename = "untitled";
				}
				canvasState.filename = toString(options.filename);
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
				var colour = toString(options.background).trim();
				if (
					colour.toLowerCase() === "alpha" ||
					colour.toLowerCase() === "transparent"
				) {
					colour = "transparent";
				} else {
					if (colour.charAt(0) !== "#") {
						colour = "#" + colour;
					}
					if (colour.length === 7) {
						canvasState.background = colour;
					}
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

		myObject.resize = function(options, cb) {
			if (!canvasState.editabled) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

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

			// set canvas
			initCanvas();

			// set images
			imageStates.forEach(function(elem){
				var maxX = canvasState.width;
				var maxY = canvasState.height;
				var minX = 0;
				var minY = 0;

				var axisX = elem.x;
				var axisY = elem.y;

				if (axisX > maxX) {
					axisX = maxX;
				}
				if (axisX < minX) {
					axisX = minX;
				}
				if (axisY > maxY) {
					axisY = maxY;
				}
				if (axisY < minY) {
					axisY = minY;
				}

				// save state
				setState(elem.id, {
					x: axisX,
					y: axisY
				});
			});

			// clear caches
			undoCaches = [];
			redoCaches = [];

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.filename = function(str, cb) {
			if (!canvasState.editabled) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

			if (!isString(str)) {
				if (cb) {
					cb("Argument is not string");
				}
				return false;
			}

			if (isEmpty(str)) {
				if (cb) {
					cb("Filename cannot be empty ");
				}
				return false;
			}

			canvasState.filename = str;

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.editableAll = function(b, cb) {
			if (!isBoolean(b)) {
				if (cb) {
					cb("Argument is not boolean");
				}
				return false;
			}

			canvasState.editabled = toBoolean(b);

			initCanvas();

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.focusableAll = function(b, cb) {
			if (!isBoolean(b)) {
				if (cb) {
					cb("Argument is not boolean");
				}
				return false;
			}

			if (eventState.target) {
				setFocusOut(eventState.target);
			}

			canvasState.focusabled = toBoolean(b);

			initCanvas();

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.drawableAll = function(b, cb) {
			if (!isBoolean(b)) {
				if (cb) {
					cb("Argument is not boolean");
				}
				return false;
			}

			canvasState.drawabled = toBoolean(b);

			initCanvas();

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.background = function(colour, cb) {
			if (!isString(colour)) {
				if (cb) {
					cb("Argument is not string");
				}
				return false;
			}

			colour = toString(colour);

			if (
				colour.toLowerCase() === "alpha" ||
				colour.toLowerCase() === "transparent" ||
				colour.toLowerCase() === "unset"
			) {
				colour = "transparent";
			} else if (
				colour.length < 6 ||
				colour.length > 7
			) {
				if (cb) {
					cb("Argument is not rgb format");
				}
				return false;
			} else {
				if (colour.charAt(0) !== "#") {
					colour = "#" + colour;
				}

				if (colour.length !== 7) {
					if (cb) {
						cb("Argument is not rgb format");
					}
					return false;
				}
			}

			canvasState.background = colour;

			initCanvas();

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.overlay = function(b, cb) {
			if (!isBoolean(b)) {
				if (cb) {
					cb("Argument is not boolean");
				}
				return false;
			}

			canvasState.overlay = toBoolean(b);

			initCanvas();

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.checker = function(b, cb) {
			if (!isBoolean(b)) {
				if (cb) {
					cb("Argument is not boolean");
				}
				return false;
			}

			canvasState.checker = toBoolean(b);

			initCanvas();

			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		//
		// draw
		//

		myObject.draw = function(canvState, cb){
			// canvState = {
			// 	filename: string, (optional, default 'getCanvas().filename')
			// 	dataType: string 'url' or 'file', (optional, default 'getCanvas().dataType')
			// 	mimeType: string, (optional, default 'getCanvas().mimeType')
			// 	drawWidth(or width): number, (optional, default 'getCanvas().width')
			// 	drawHeight(or height): number, (optional, default 'getCanvas().height')
			// 	background: string, (optional, default 'getCanvas().background')
			// 	quality: number, (optional, default 'getCanvas().quality')
			// }

			if (eventState.onDraw === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			var thisCanvasState = exportCanvasState();
			var thisDrawState = {};

			thisDrawState.width = canvasState.originalWidth;
			thisDrawState.height = canvasState.originalHeight;

			if (isObject(canvState)) {
				if (isString(canvState.filename)) {
					thisCanvasState.filename = toString(canvState.filename);
				}
				if (isString(canvState.mimeType)) {
					thisCanvasState.mimeType = toString(canvState.mimeType);
				}
				if (isString(canvState.dataType)) {
					if (canvState.dataType.toLowerCase() === "url") {
						thisCanvasState.dataType = "url";
					} else if (canvState.dataType.toLowerCase() === "file") {
						thisCanvasState.dataType = "file";
					}
				}
				if (isNumeric(canvState.quality)) {
					thisCanvasState.quality = toNumber(canvState.quality);
				}
				if (isString(canvState.background)) {
					thisCanvasState.background = toString(canvState.background);
				}
				if (isNumeric(canvState.drawWidth)) {
					thisDrawState.width = toNumber(canvState.drawWidth);
				} else if (isNumeric(canvState.width)) {
					thisDrawState.width = toNumber(canvState.width);
				}
				if (isNumeric(canvState.drawHeight)) {
					thisDrawState.height = toNumber(canvState.drawHeight);
				} else if (isNumeric(canvState.height)) {
					thisDrawState.height = toNumber(canvState.height);
				}
			}

			var drawables = [];
			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawabled === true) {
					drawables.push(exportImageState(imageStates[i].id));
				}
			}

			drawables.sort(function(a, b){
				return a.index - b.index;
			});

			eventState.onDraw = true;
			var loading = startLoading(document.body);

			drawCanvas(thisDrawState, thisCanvasState, drawables, function(err, res, result){
				eventState.onDraw = false;
				endLoading(loading);

				if (err) {
					console.log(err);
					if (cb) {
						cb(err);
					}
					return false;
				} else {
					if (cb) {
						cb(null, res, result);
					}
					return true;
				}
			});
		}

		myObject.drawTo = function(canvState, imgStates, cb){
			// canvState = {
			// 	filename(optional),
			// 	dataType(optional),
			// 	mimeType(optional),
			// 	width(required),
			// 	height(required),
			// 	drawWidth(optional),
			// 	drawHeight(optional),
			// 	quality(optional),
			// 	background(optional),
			// }

			// imgStates = [{
			// 	src(required),
			// 	index(required),
			// 	width(required),
			// 	height(required),
			// 	rotate(required),
			// 	scaleX(required),
			// 	scaleY(required),
			// 	opacity(required),
			//  drawabled(required),
			// }]

			if (eventState.onDraw === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			if (!isObject(canvState)) {
				if (cb) {
					cb("Argument is not object");
				}
				return false;
			}
			if (!isArray(imgStates)) {
				if (cb) {
					cb("Argument is not array");
				}
				return false;
			}

			var thisCanvasState = {};
			var thisDrawState = {};

			copyObject(thisCanvasState, defaultCanvasState);

			if (isString(canvState.filename)) {
				thisCanvasState.filename = toString(canvState.filename);
			}
			if (isString(canvState.mimeType)) {
				thisCanvasState.mimeType = toString(canvState.mimeType);
			}
			if (isString(canvState.dataType)) {
				if (canvState.dataType.toLowerCase() === "url") {
					thisCanvasState.dataType = "url";
				} else if (canvState.dataType.toLowerCase() === "file") {
					thisCanvasState.dataType = "file";
				}
			}
			if (isNumeric(canvState.quality)) {
				thisCanvasState.quality = toNumber(canvState.quality);
			}
			if (isString(canvState.background)) {
				thisCanvasState.background = toString(canvState.background);
			}
			if (isNumeric(canvState.width)) {
				thisCanvasState.width = toNumber(canvState.width);
			} else {
				if (cb) {
					cb("Argument not found");
				}
				return false;
			}
			if (isNumeric(canvState.height)) {
				thisCanvasState.height = toNumber(canvState.height);
			} else {
				if (cb) {
					cb("Argument not found");
				}
				return false;
			}
			if (isNumeric(canvState.drawWidth)) {
				thisDrawState.width = toNumber(canvState.drawWidth);
			} else {
				thisDrawState.width = toNumber(canvState.width);
			}
			if (isNumeric(canvState.drawHeight)) {
				thisDrawState.height = toNumber(canvState.drawHeight);
			} else {
				thisDrawState.height = toNumber(canvState.height);
			}

			var drawables = [];
			for (var i = 0; i < imgStates.length; i++) {
				if (imgStates[i].drawabled !== false) {
					var copied = {};
					copyObject(copied, imgStates[i]);
					if (!copied.src) {
						if (copied.url) {
							copied.src = copied.url;
						} else if (copied.path) {
							copied.src = copied.path;
						}
					}
					if (copied.src) {
						drawables.push(copied);
					}
				}
			}

			drawables.sort(function(a, b){
				return a.index - b.index;
			});

			eventState.onDraw = true;
			var loading = startLoading(document.body);

			drawCanvas(thisDrawState, thisCanvasState, drawables, function(err, res, options){
				eventState.onDraw = false;
				endLoading(loading);

				if (err) {
					console.log(err);
					if (cb) {
						cb(err);
					}
					return false;
				} else {
					if (cb) {
						cb(null, res, options);
					}
					return true;
				}
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
				cb(null, eventState.target);
			}
			return eventState.target;
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

		myObject.getImages = function(cb){
			var states = [];
			imageStates.forEach(function(elem){
				states.push(exportImageState(elem.id));
			});

			var results = states.sort(function(a, b){
				return a.index - b.index;
			});

			if (cb) {
				cb(null, results);
			}
			return results;
		}

		myObject.getUndo = function(cb){
			if (cb) {
				cb(null, undoCaches.length);
			}
			return undoCaches.length;
		}

		myObject.getRedo = function(cb){
			if (cb) {
				cb(null, redoCaches.length);
			}
			return redoCaches.length;
		}

		myObject.export = myObject.getImages;

		myObject.import = function(states, cb){
			if (!canvasState.editabled) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

			if (!isArray(states)) {
				if (!isString(states)) {
					if (cb) {
						cb("Argument is not array");
					}
					return false;
				} else {
					var tmp;
					try {
						tmp = JSON.parse(states);
					} catch(err) {
						console.log(err);
						tmp = undefined;
					}
					if (!isArray(tmp)) {
						if (cb) {
							cb("Argument is not array");
						}
						return false;
					} else {
						states = tmp;
					}
				}
			}

			var index = states.length;
			var count = 0;
			var results = [];

			eventState.onUpload = true;
			var loading = startLoading(document.body);

			recursiveFunc()

			function recursiveFunc() {
				if (count < index) {
					var thisState = states[count];
					var thisSrc = thisState.src || thisState.url || thisState.path;
					renderImage(thisSrc, thisState, function(err, res) {
						if (err) {
							results.push({
								err: err
							});
						} else {
							results.push(
								exportImageState(res)
							);
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;
					endLoading(loading);

					if (cb) {
						cb(null, results);
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
		// end
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
