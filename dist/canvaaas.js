/*!
 * 
 * canvaaas.js
 * 
 * eeecheol@gmail.com
 * 
 * 0.0.7
 * 
 */

/***!
 *** 
 *** release note
 * 
 * remove preview
 * 
 * reset(container) => reset(image)
 * 
 * typeof() === object <= add null check
 * 
 * config.drawWidth => config.initDrawWidth
 * config.drawHeight => config.initDrawHeight
 * 
 * draw() width, height => canvasState.originalWidth, canvasState.originalHeight
 * drawTo() width, height => canvasState.originalWidth, canvasState.originalHeight
 * download() width, height => canvasState.originalWidth, canvasState.originalHeight
 * downloadTo() width, height => canvasState.originalWidth, canvasState.originalHeight
 * 
 * remove export
 * remove import 
 * 
 * uploadUrls, uploadFiles add argument `imageStates`
 * 
 * elem => source
 * 
 */

/*!
 * 
 * 업데이트 예정
 * 
 * 
 */

/*!
 * 
 * 테스트 예정
 * 
 * index 1000 이상
 * 
 * index 겹치기
 * 
 * 
 * 
 * 
 */

(function(window){
	'use strict';

	function canvaaas() {

		var myObject = {};

		var defaultConfiguration = {

			filename: undefined, // string

			allowedExtensions: ["jpg", "jpeg", "png", "webp", "svg"], // string, jpg, jpeg, png, webp, svg...

			editable: true, // boolean

			magnetic: true, // boolean

			lockAspectRatio: true, // boolean

			minAutoIndexing: 0, // number

			maxAutoIndexing: 999, // number

			maxNumberOfImages: 999, // number

			cacheLevels: 999, // number

			containerAspectRatio: undefined, // width / height

			minContainerWidth: 0, // number, px

			minContainerHeight: 0, // number, px

			maxContainerWidth: 1, // number, px, (0 ~ 1) => viewportWidth * (0 ~ 1)

			maxContainerHeight: 0.7, // number, px, (0 ~ 1) => viewportHeight * (0 ~ 1)

			drawFillColor: "#FFFFFF", // string, RGB

			drawMimeType: "image/jpeg", // string, image/jpeg, image/png, image/webp...

			drawQuality: 0.8, // number, 0 ~ 1

			drawSmoothingEnabled: false, // boolean
			
			drawSmoothingQuality: "low", // string, low, medium, high

			initDrawWidth: undefined, // number, px

			initDrawHeight: undefined, // number, px

			minDrawWidth: 64, // number, px

			minDrawHeight: 64, // number, px

			maxDrawWidth: 4096, // number, px, for Mobile

			maxDrawHeight: 4096, // number, px, for Mobile

			minImageWidth: 64, // number, px

			minImageHeight: 64, // number, px

			minImageRenderWidth: 0.2, //number,  0 ~ 1

			minImageRenderHeight: 0.2, // number, 0 ~ 1

			maxImageRenderWidth: 1, // number, 0 ~ 1

			maxImageRenderHeight: 1, // number, 0 ~ 1

			focus: undefined, // callback function

			edit: undefined, // callback function

			remove: undefined, // callback function

			config: undefined, // callback function

			upload: undefined, // callback function

			draw: undefined, // callback function

		};

		Object.freeze(defaultConfiguration);

		var config = {};

		var sourceId = "canvaaas-" + getShortId() + "-";
		var cloneId = "canvaaas-" + getShortId() + "-";

		var isInitialized = false;

		var onUpload = false;
		var onMove = false;
		var onZoom = false;
		var onResize = false;
		var onRotate = false;
		var onFlip = false;
		var onFreeze = false;

		var conatinerTemplate = "";
		conatinerTemplate += "<div class='canvaaas'>";
		conatinerTemplate += "<div class='canvaaas-mirror'></div>";
		conatinerTemplate += "<div class='canvaaas-canvas checker'></div>";
		conatinerTemplate += "</div>";

		var imageTemplate = "";
		imageTemplate += "<img>";
		imageTemplate += "<div class='canvaaas-overlay'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-top'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-bottom'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-left'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-right'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-top'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-bottom'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-left'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-right'></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-n'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-e'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-s'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-w'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-ne'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-nw'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-se'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-sw'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-n'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-e'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-s'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-w'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-ne'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-nw'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-se'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-sw'><div class='canvaaas-handle'></div></div>";

		var eventState = {};
		var eventCaches = [];
		var eventSubCaches = [];
		var containerState = {};
		var canvasState = {};
		var imageStates = [];

		var containerElement;
		var canvasElement;
		var mirrorElement;

		var sourceElements = [];
		var cloneElements = [];

		copyObject(defaultConfiguration, config);

		// 
		// handlers
		// 

		var handlers = {

			preventDefaults: function(e) {
				e.preventDefault();
				e.stopPropagation();
			},

			dropImages: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var dt = e.dataTransfer;
				var files = dt.files;

				var index = files.length;
				var count = 0;

				if (!config.editable) {
					if (config.upload) {
						config.upload("Editing has been disabled");
					}
					return false;
				}

				if (onUpload === true) {
					if (config.upload) {
						config.upload("Already in progress");
					}
					return false;
				}

				onUpload = true;

				recursiveFunc();

				function recursiveFunc() {
					if (count < index) {
						renderImage(files[count], null, function(err, id) {
							if (err) {
								if (config.upload) {
									config.upload(err);
								}
							} else {
								if (config.upload) {
									config.upload(null, id);
								}
							}
							count++;
							recursiveFunc();
						});
					} else {
						// end
						onUpload = false;
					}
				}
			},

			isOutside: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (onMove = true) {
					if (e.touches) {
						if (e.touches.length === 2) {
							handlers.startPinchZoom(e);
							return false;
						}
					}
				}

				if (
					e.target.tagName === "BUTTON" ||
					e.target.tagName === "INPUT"
				) {
					return false;
				}

				if (
					!e.target.classList.contains("canvaaas-image") &&
					!e.target.classList.contains("canvaaas-clone")
				) {
					var oldId = getIdBySource(eventState.target);
					setFocusOut(oldId);
				}
			},

			onScroll: function(e) {
				if (eventState.target) {
					var oldId = getIdBySource(eventState.target);
					setFocusOut(oldId);
				}
			},

			keydown: function(e) {
				var source = eventState.target;
				var state = getStateBySource(source);
				var clone = getCloneById(state.id);

				if (!config.editable) {
					return false;
				}
				if (!eventState.target) {
					return false;
				}
				if (!source || !state || !clone) {
					return false;
				}
				if (!state.editable) {
					return false;
				}

				var rotatedRect = getRotatedRect(state.width, state.height, state.rotate);
				var halfWidth = 0.5 * rotatedRect[0];
				var halfHeight = 0.5 * rotatedRect[1];
				var magL = halfWidth;
				var magT = halfHeight;
				var magR = canvasState.width - halfWidth;
				var magB = canvasState.height - halfHeight;
				var x = 0;
				var y = 0;

				if (e.keyCode == '38') {
					// up arrow
					y -= 10;
				} else if (e.keyCode == '40') {
					// down arrow
					y += 10;
				} else if (e.keyCode == '37') {
					// left arrow
					x -= 10;
				} else if (e.keyCode == '39') {
					// right arrow
					x += 10;
				} else {
					return false;
				}

				// save cache
				pushCache(state.id);
				eventSubCaches = [];

				// save state
				state.x += x;
				state.y += y;

				// check magnetic option
				if (config.magnetic) {
					if (magR - 5 < state.x && magR + 5 > state.x) {
						state.x = magR;
					}

					if (magB - 5 < state.y && magB + 5 > state.y) {
						state.y = magB;
					}

					if (magL - 5 < state.x && magL + 5 > state.x) {
						state.x = magL;
					}

					if (magT - 5 < state.y && magT + 5 > state.y) {
						state.y = magT;
					}
				}

				// adjust state
				setElement(source, state);
				setElement(clone, state);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			startFocusIn: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var source;
				if (!e.target.classList.contains("canvaaas-image")) {
					if (!e.target.parentNode.classList.contains("canvaaas-image")) {
						return false;
					} else {
						source = e.target.parentNode;
					}
				} else {
					source = e.target;
				}

				if (!config.editable) {
					if (config.focus) {
						config.focus("Editing has been disabled");
					}
					return false;
				}

				var state = getStateBySource(source);

				if (!state.focusable) {
					if (config.focus) {
						config.focus("Has been denied");
					}
					return false;
				}

				if (eventState.target) {
					if (source.isSameNode(eventState.target)) {
						if (config.focus) {
							config.focus("Already focused");
						}
						return false;
					}

					var oldId = getIdBySource(eventState.target);
					setFocusOut(oldId);
				}

				setFocusIn(state.id);

				handlers.startMove(e);

				if (config.focus) {
					config.focus(null, state.id);
				}
			},

			startFocusOut: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!eventState.target) {
					return false;
				}

				if (typeof(e.touches) !== "undefined") {
					if (e.touches.length === 2) {
						return handlers.startPinchZoom(e);
					}
				}

				var oldId = getIdBySource(eventState.target);
				setFocusOut(oldId);
			},

			startMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				setContainerCoordinates();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				var source = eventState.target;
				var state = getStateBySource(source);
				var mouseX;
				var mouseY;
				var rotatedRect;
				var halfWidth;
				var halfHeight;

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX;
					mouseY = e.clientY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX;
					mouseY = e.touches[0].clientY;
				} else {
					return handlers.startPinchZoom(e);
				}

				if (!state.editable) {
					return false;
				}

				// calc rotate rect
				rotatedRect = getRotatedRect(state.width, state.height, state.rotate);
				halfWidth = 0.5 * rotatedRect[0];
				halfHeight = 0.5 * rotatedRect[1];

				// save initial data
				eventState.initialX = state.x;
				eventState.initialY = state.y;
				eventState.magL = halfWidth;
				eventState.magT = halfHeight;
				eventState.magR = canvasState.width - halfWidth;
				eventState.magB = canvasState.height - halfHeight;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;

				// toggle
				onMove = true;

				// save cache
				pushCache(state.id);
				eventSubCaches = [];

				// add event handles
				document.addEventListener("mousemove", handlers.onMove, false);
				document.addEventListener("mouseup", handlers.endMove, false);

				document.addEventListener("touchmove", handlers.onMove, false);
				document.addEventListener("touchend", handlers.endMove, false);
			},

			onMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!onMove) {
					return false;
				}

				var source = eventState.target;
				var state = getStateBySource(source);
				var clone = getCloneBySource(source);
				var mouseX;
				var mouseY;
				var axisX;
				var axisY;

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - eventState.mouseX;
					mouseY = e.clientY - eventState.mouseY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - eventState.mouseX;
					mouseY = e.touches[0].clientY - eventState.mouseY;
				} else {
					return false;
				}

				// calc mouse point
				axisX = eventState.initialX + mouseX;
				axisY = eventState.initialY + mouseY;

				// check magnetic option
				if (config.magnetic) {
					if (eventState.magR - 5 < axisX && eventState.magR + 5 > axisX) {
						axisX = eventState.magR;
					}
					if (eventState.magB - 5 < axisY && eventState.magB + 5 > axisY) {
						axisY = eventState.magB;
					}
					if (eventState.magL - 5 < axisX && eventState.magL + 5 > axisX) {
						axisX = eventState.magL;
					}
					if (eventState.magT - 5 < axisY && eventState.magT + 5 > axisY) {
						axisY = eventState.magT;
					}
				}

				// save state
				state.x = axisX;
				state.y = axisY;

				// adjust state
				setElement(source, state);
				setElement(clone, state);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			endMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				setContainerCoordinates();

				var source = eventState.target;
				var state = getStateBySource(source);

				// toggle off
				onMove = false;

				// remove event handles
				document.removeEventListener("mousemove", handlers.onMove, false);
				document.removeEventListener("mouseup", handlers.endMove, false);

				document.removeEventListener("touchmove", handlers.onMove, false);
				document.removeEventListener("touchend", handlers.endMove, false);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			startRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				setContainerCoordinates();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				var handle = e.target;
				var source = eventState.target;
				var state = getStateBySource(source);
				var mouseX;
				var mouseY;
				var axisX;
				var axisY;
				var deg;

				if (!state.editable) {
					return false;
				}

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - (containerState.left + canvasState.x - (0.5 * canvasState.width));
					mouseY = e.clientY - (containerState.top + canvasState.y - (0.5 * canvasState.height));
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - (containerState.left + canvasState.x - (0.5 * canvasState.width));
					mouseY = e.touches[0].clientY - (containerState.top + canvasState.y - (0.5 * canvasState.height));
				} else {
					return false;
				}

				// calc offset
				axisX = mouseX - state.x;
				axisY = state.y - mouseY;

				deg = getDegrees(axisX, axisY);

				if (state.scaleX < 0) {
					deg = 360 - deg;
				}
				if (state.scaleY < 0) {
					deg = 180 - deg;
				}

				// save initial data
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;
				eventState.initialR = state.rotate;
				eventState.initialD = deg;

				// toggle on
				onRotate = true;

				// save cache
				pushCache(state.id);
				eventSubCaches = [];

				// add event handles
				document.addEventListener("mousemove", handlers.onRotate, false);
				document.addEventListener("mouseup", handlers.endRotate, false);

				document.addEventListener("touchmove", handlers.onRotate, false);
				document.addEventListener("touchend", handlers.endRotate, false);
			},

			onRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!onRotate) {
					return false;
				}

				var source = eventState.target;
				var state = getStateBySource(source);
				var clone = getCloneBySource(source);
				var mouseX;
				var mouseY;
				var axisX;
				var axisY;
				var deg;

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - (containerState.left + canvasState.x - (0.5 * canvasState.width));
					mouseY = e.clientY - (containerState.top + canvasState.y - (0.5 * canvasState.height));
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - (containerState.left + canvasState.x - (0.5 * canvasState.width));
					mouseY = e.touches[0].clientY - (containerState.top + canvasState.y - (0.5 * canvasState.height));
				} else {
					return false;
				}

				// calc offset
				axisX = mouseX - state.x;
				axisY = state.y - mouseY;

				deg = getDegrees(axisX, axisY);

				if (state.scaleX < 0) {
					deg = 360 - deg;
				}
				if (state.scaleY < 0) {
					deg = 180 - deg;
				}

				// save state
				state.rotate = eventState.initialR + (deg - eventState.initialD);

				// adjust state
				setElement(source, state);
				setElement(clone, state);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			endRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				setContainerCoordinates();

				var source = eventState.target;
				var state = getStateBySource(source);

				// toggle off
				onRotate = false;

				document.removeEventListener("mousemove", handlers.onRotate, false);
				document.removeEventListener("mouseup", handlers.endRotate, false);

				document.removeEventListener("touchmove", handlers.onRotate, false);
				document.removeEventListener("touchend", handlers.endRotate, false);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			startResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				setContainerCoordinates();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				var handle = e.target;
				var source = eventState.target;
				var state = getStateBySource(source);
				var mouseX;
				var mouseY;
				var flipX;
				var flipY;
				var dire;
				var direction;
				var minW;
				var minH;

				if (!state.editable) {
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

				if (handle.classList.contains("canvaaas-resize-n")) {
					dire = "n";
				} else if (handle.classList.contains("canvaaas-resize-ne")) {
					dire = "ne";
				} else if (handle.classList.contains("canvaaas-resize-e")) {
					dire = "e";
				} else if (handle.classList.contains("canvaaas-resize-se")) {
					dire = "se";
				} else if (handle.classList.contains("canvaaas-resize-s")) {
					dire = "s";
				} else if (handle.classList.contains("canvaaas-resize-sw")) {
					dire = "sw";
				} else if (handle.classList.contains("canvaaas-resize-w")) {
					dire = "w";
				} else if (handle.classList.contains("canvaaas-resize-nw")) {
					dire = "nw";
				} else {
					return false;
				}

				direction = getDirection(dire, state.scaleX, state.scaleY);

				minW = config.minImageWidth;
				minH = config.minImageHeight;

				// save initial data
				eventState.direction = direction;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;
				eventState.initialW = state.width;
				eventState.initialH = state.height;
				eventState.initialX = state.x;
				eventState.initialY = state.y;
				eventState.minW = minW;
				eventState.minH = minH;

				// toggle on
				onResize = true;

				// save cache
				pushCache(state.id);
				eventSubCaches = [];

				// add event handles
				document.addEventListener("mousemove", handlers.onResize, false);
				document.addEventListener("mouseup", handlers.endResize, false);

				document.addEventListener("touchmove", handlers.onResize, false);
				document.addEventListener("touchend", handlers.endResize, false);
			},

			onResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!onResize) {
					return false;
				}

				var direction = eventState.direction;
				var source = eventState.target;
				var state = getStateBySource(source);
				var clone = getCloneBySource(source);
				var aspectRatio;
				var mouseX;
				var mouseY;
				var width;
				var height;
				var axisX;
				var axisY;
				var diffX;
				var diffY;
				var radians;
				var cosFraction;
				var sinFraction;
				var onShiftKey = false;
				var minW;
				var minH;

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - eventState.mouseX;
					mouseY = e.clientY - eventState.mouseY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - eventState.mouseX;
					mouseY = e.touches[0].clientY - eventState.mouseY;
				} else {
					return false;
				}

				if (config.lockAspectRatio || e.shiftKey) {
					onShiftKey = true;
				}

				minW = eventState.minW;
				minH = eventState.minH;

				aspectRatio = state.originalWidth / state.originalHeight;
				radians = state.rotate * Math.PI / 180;

				if (state.scaleX !== 1) {
					radians *= -1;
				}

				if (state.scaleY !== 1) {
					radians *= -1;
				}

				cosFraction = Math.cos(radians);
				sinFraction = Math.sin(radians);
				diffX = (mouseX * cosFraction) + (mouseY * sinFraction);
				diffY = (mouseY * cosFraction) - (mouseX * sinFraction);

				width = eventState.initialW;
				height = eventState.initialH;
				axisX = eventState.initialX;
				axisY = eventState.initialY;

				if (direction === "n") {
					height -= diffY;

					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;

					if (onShiftKey) {
						width = height * aspectRatio;
					}
				} else if (direction === "ne") {
					width += diffX;
					height -= diffY;

					if (!onShiftKey) {
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else {
						if (2 * diffX < 2 * -diffY * aspectRatio) {
							height -= diffY;
							width = height * aspectRatio;
						} else {
							width += diffX;
							height = width / aspectRatio;
						}
					}
				} else if (direction === "e") {
					width += diffX;

					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;

					if (onShiftKey) {
						height = width / aspectRatio;
					}
				} else if (direction === "se") {
					width += diffX;
					height += diffY;

					if (!onShiftKey) {
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else {
						if (2 * diffX < 2 * diffY * aspectRatio) {
							height += diffY;
							width = height * aspectRatio;
						} else {
							width += diffX;
							height = width / aspectRatio;
						}
					}
				} else if (direction === "s") {
					height += diffY;

					axisX -= 0.5 * diffY * sinFraction;
					axisY += 0.5 * diffY * cosFraction;

					if (onShiftKey) {
						width = height * aspectRatio;
					}
				} else if (direction === "sw") {
					width -= diffX;
					height += diffY;

					if (!onShiftKey) {
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else {
						if (2 * -diffX < 2 * diffY * aspectRatio) {
							height += diffY;
							width = height * aspectRatio;
						} else {
							width -= diffX;
							height = width / aspectRatio;
						}
					}
				} else if (direction === "w") {
					width -= diffX;

					axisX += 0.5 * diffX * cosFraction;
					axisY += 0.5 * diffX * sinFraction;

					if (onShiftKey) {
						height = width / aspectRatio;
					}
				} else if (direction === "nw") {
					width -= diffX;
					height -= diffY;

					if (!onShiftKey) {
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else {
						if (2 * -diffX < 2 * -diffY * aspectRatio) {
							height -= diffY;
							width = height * aspectRatio;
						} else {
							width -= diffX;
							height = width / aspectRatio;
						}
					}
				} else {
					return false;
				}

				if (minW > width) {
					return false;
				}

				if (minH > height) {
					return false;
				}

				state.width = width;
				state.height = height;
				state.x = axisX;
				state.y = axisY;

				// adjust state
				setElement(source, state);
				setElement(clone, state);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			endResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				setContainerCoordinates();

				var source = eventState.target;
				var state = getStateBySource(source);

				// toggle off
				onResize = false;

				// remove event handles
				document.removeEventListener("mousemove", handlers.onResize, false);
				document.removeEventListener("mouseup", handlers.endResize, false);

				document.removeEventListener("touchmove", handlers.onResize, false);
				document.removeEventListener("touchend", handlers.endResize, false);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			startWheelZoom: function(e){
				e.preventDefault();
				e.stopPropagation();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				if (onMove || onResize || onRotate) {
					return false;
				}

				var source = eventState.target;
				var state = getStateBySource(source);
				var clone = getCloneBySource(source);
				var ratio;
				var diffX;
				var diffY;
				var width;
				var height;
				var minW;
				var minH;

				if (!state.editable) {
					return false;
				}

				minW = config.minImageWidth;
				minH = config.minImageHeight;

				ratio = -e.deltaY * 0.001;
				diffX = state.width * ratio;
				diffY = state.height * ratio;
				width = state.width + diffX;
				height = state.height + diffY;

				if (!onZoom) {

					setContainerCoordinates();

					// toggle on
					onZoom = true;

					// save cache
					pushCache(state.id);
					eventSubCaches = [];

				} else {
					if (config.edit) {
						config.edit(null, state.id);
					}
				}

				// add timer
				clearTimeout(eventState.wheeling);

				if (minW > width) {
					return false;
				}

				if (minH > height) {
					return false;
				}

				state.width = width;
				state.height = height;

				// adjust state
				setElement(source, state);
				setElement(clone, state);

				eventState.wheeling = setTimeout(function() {
					// remove timer
					eventState.wheeling = undefined;

					// toggle off
					onZoom = false;

					if (config.edit) {
						config.edit(null, state.id);
					}
				}, 300);
			},

			startPinchZoom: function(e){
				e.preventDefault();
				e.stopPropagation();

				setContainerCoordinates();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				// check move toggle on
				if (onMove) {
					onMove = false;

					document.removeEventListener("mousemove", handlers.onMove, false);
					document.removeEventListener("mouseup", handlers.endMove, false);

					document.removeEventListener("touchmove", handlers.onMove, false);
					document.removeEventListener("touchend", handlers.endMove, false);
				}

				var source = eventState.target;
				var state = getStateBySource(source);
				var clone = getCloneBySource(source);
				var diagonal;
				var mouseX;
				var mouseY;
				var minW;
				var minH;

				if (!state.editable) {
					return false;
				}

				mouseX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
				mouseY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
				diagonal = getDiagonal(mouseX, mouseY);

				minW = config.minImageWidth;
				minH = config.minImageHeight;

				// save initial data
				eventState.diagonal = diagonal;
				eventState.initialW = state.width;
				eventState.initialH = state.height;
				eventState.minW = minW;
				eventState.minH = minH;

				// toggle on
				onZoom = true;

				// save cache
				pushCache(state.id);
				eventSubCaches = [];

				// add event handles
				document.addEventListener("touchmove", handlers.onPinchZoom, false);
				document.addEventListener("touchend", handlers.endPinchZoom, false);
			},

			onPinchZoom: function(e){
				e.preventDefault();
				e.stopPropagation();

				if (!onZoom) {
					return false;
				}

				if (e.touches.length !== 2) {
					return false;
				}

				var source = eventState.target;
				var state = getStateBySource(source);
				var clone = getCloneBySource(source);
				var diagonal;
				var mouseX;
				var mouseY;
				var width;
				var height;
				var ratio;
				var minW;
				var minH;

				minW = eventState.minW;
				minH = eventState.minH;

				mouseX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
				mouseY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
				diagonal = getDiagonal(mouseX, mouseY);
				ratio = 1 + ((diagonal - eventState.diagonal) * 0.01);

				width = eventState.initialW * ratio;
				height = eventState.initialH * ratio;

				if (minW > width) {
					return false;
				}

				if (minH > height) {
					return false;
				}

				state.width = width;
				state.height = height;

				// adjust state
				setElement(source, state);
				setElement(clone, state);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			endPinchZoom: function(e) {
				e.preventDefault();
				e.stopPropagation();

				setContainerCoordinates();

				var source = eventState.target;
				var state = getStateBySource(source);

				// toggle off
				onZoom = false;

				// remove event handles
				document.removeEventListener("touchmove", handlers.onPinchZoom, false);
				document.removeEventListener("touchend", handlers.endPinchZoom, false);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			debounce: function(cb, time){
				var timer;
				return function(e){
					if (timer) {
						clearTimeout(timer);
					};

					timer = setTimeout(cb, time, e);
				};
			},

			resizeWindow: function(e){
				e.preventDefault();
				e.stopPropagation();

				if (!isInitialized) {
					return false;
				}

				var oldWidth = containerElement.offsetWidth;

				initContainer(canvasState.originalWidth, canvasState.originalHeight);

				var newWidth = containerState.width;
				var scaleRatio = newWidth / oldWidth;

				initCanvas(canvasState.originalWidth, canvasState.originalHeight);

				imageStates.forEach(function(state){
					var source = getSourceById(state.id);
					var clone = getCloneById(state.id);

					state.width *= scaleRatio;
					state.height *= scaleRatio;
					state.x *= scaleRatio;
					state.y *= scaleRatio;

					setElement(source, state);
					setElement(clone, state);
				});

			},

		};

		// 
		// methods
		// 

		function setElement(elem, state) {
			if (!elem) {
				return false;
			}
			if (!state) {
				return false;
			}

			var left = "";
			var top = "";
			var width = "";
			var height = "";
			var opacity = "";
			var transform = "";

			if (
				state.x !== undefined ||
				state.x !== null ||
				state.x !== ""
			) {
				left = ( state.x - (state.width * 0.5) ) + "px";
			}

			if (
				state.y !== undefined ||
				state.y !== null ||
				state.y !== ""
			) {
				top = ( state.y - (state.height * 0.5) ) + "px";
			}

			if (
				state.scaleX !== undefined ||
				state.scaleX !== null ||
				state.scaleX !== "" ||
				state.scaleX !== 1
			) {
				transform += "scaleX(" + state.scaleX + ")";
			}

			if (
				state.scaleY !== undefined ||
				state.scaleY !== null ||
				state.scaleY !== "" ||
				state.scaleY !== 1
			) {
				transform += "scaleY(" + state.scaleY + ")";
			}

			if (
				state.rotate !== undefined ||
				state.rotate !== null ||
				state.rotate !== "" ||
				state.rotate !== 0
			) {
				transform += "rotate(" + state.rotate + "deg)";
			}

			if (
				state.width !== undefined ||
				state.width !== null ||
				state.width !== ""
			) {
				width = state.width + "px";
			}

			if (
				state.height !== undefined ||
				state.height !== null ||
				state.height !== ""
			) {
				height = state.height + "px";
			}

			if (
				state.opacity !== undefined ||
				state.opacity !== null ||
				state.opacity !== ""
			) {
				opacity = state.opacity;
			}

			elem.style.left = left;
			elem.style.top = top;
			elem.style.width = width;
			elem.style.height = height;
			elem.style.opacity = opacity;
			elem.style.transform = transform;

			return true;
		};

		function copyObject(srcObj, destiObj) {
			if (
				typeof(srcObj) !== "object" ||
				srcObj === null
			) {
				return false;
			}
			if (
				typeof(destiObj) !== "object" ||
				destiObj === null
			) {
				return false;
			}

			Object.keys(srcObj).forEach(function(key){
				destiObj[key] = srcObj[key];
			});

			return true;
		};

		function pushCache(id) {
			if (!id) {
				return false;
			}

			var source = getSourceById(id);
			if (!source) {
				return false;
			}

			var clone = getCloneById(id);
			if (!clone) {
				return false;
			}

			var state = getStateById(id);
			if (!state) {
				return false;
			}

			var tmpState = {};
			var res = copyObject(state, tmpState);
			if (!res) {
				return false;
			}

			var tmp = {};
			tmp.id = id;
			tmp.state = tmpState;
			tmp.sourceClass = source.className.split(' ');
			tmp.cloneClass = clone.className.split(' ');
			tmp.updatedAt = Date.now();

			eventCaches.push(tmp);

			if (eventCaches.length > config.cacheLevels) {
				eventCaches.shift();
			}

			return true;
		}

		function pushSubCache(id) {
			if (!id) {
				return false;
			}

			var source = getSourceById(id);
			if (!source) {
				return false;
			}

			var clone = getCloneById(id);
			if (!clone) {
				return false;
			}
			
			var state = getStateById(id);
			if (!state) {
				return false;
			}

			var tmpState = {};
			var res = copyObject(state, tmpState);
			if (!res) {
				return false;
			}

			var tmp = {};
			tmp.id = id;
			tmp.state = tmpState;
			tmp.sourceClass = source.className.split(' ');
			tmp.cloneClass = clone.className.split(' ');
			tmp.updatedAt = Date.now();

			eventSubCaches.push(tmp);

			return true;
		}

		function setFocusIn(id) {
			if (!id) {
				return false;
			}

			var source = getSourceById(id);
			if (!source) {
				return false;
			}

			var clone = getCloneById(id);
			if (!clone) {
				return false;
			}

			try {
				canvasElement.classList.add("focused");
				mirrorElement.classList.add("focused");

				source.classList.add("focused");
				clone.classList.add("focused");

				source.removeEventListener("mousedown", handlers.startFocusIn, false);
				source.removeEventListener("touchstart", handlers.startFocusIn, false);

				source.addEventListener("mousedown", handlers.startMove, false);
				source.addEventListener("touchstart", handlers.startMove, false);
				source.addEventListener("wheel", handlers.startWheelZoom, false);

				clone.removeEventListener("mousedown", handlers.startFocusIn, false);
				clone.removeEventListener("touchstart", handlers.startFocusIn, false);

				clone.addEventListener("mousedown", handlers.startMove, false);
				clone.addEventListener("touchstart", handlers.startMove, false);
				clone.addEventListener("wheel", handlers.startWheelZoom, false);

				document.addEventListener("keydown", handlers.keydown, false);

				document.addEventListener("mousedown", handlers.isOutside, false);
				document.addEventListener("touchstart", handlers.isOutside, false);


				document.addEventListener("scroll", handlers.onScroll, false);
			} catch(err) {
				console.log(err);
				return false;
			}
			
			eventState.target = source;

			return true;
		};

		function setFocusOut(id) {
			if (!id) {
				return false;
			}

			var source = getSourceById(id)
			if (!source) {
				return false;
			}

			var clone = getCloneById(id);
			if (!clone) {
				return false;
			}

			try {
				canvasElement.classList.remove("focused");
				mirrorElement.classList.remove("focused");

				source.classList.remove("focused");
				clone.classList.remove("focused");

				source.removeEventListener("mousedown", handlers.startMove, false);
				source.removeEventListener("touchstart", handlers.startMove, false);
				source.removeEventListener("wheel", handlers.startWheelZoom, false);

				source.addEventListener("mousedown", handlers.startFocusIn, false);
				source.addEventListener("touchstart", handlers.startFocusIn, false);

				clone.removeEventListener("mousedown", handlers.startMove, false);
				clone.removeEventListener("touchstart", handlers.startMove, false);
				clone.removeEventListener("wheel", handlers.startWheelZoom, false);

				clone.addEventListener("mousedown", handlers.startFocusIn, false);
				clone.addEventListener("touchstart", handlers.startFocusIn, false);

				document.removeEventListener("keydown", handlers.keydown, false);

				document.removeEventListener("mousedown", handlers.isOutside, false);
				document.removeEventListener("touchstart", handlers.isOutside, false);

				document.removeEventListener("scroll", handlers.onScroll, false);
			} catch(err) {
				console.log(err);
				return false;
			}

			eventState.target = undefined;

			return true;
		}

		function setIndex() {
			var tmpStates = [];
			var tmpSourceElements = [];
			var tmpCloneElements = [];
			var firstSourceChild = canvasElement.firstChild;
			var lastSourceChild = undefined;
			var firstCloneChild = mirrorElement.firstChild;
			var lastCloneChild = undefined;

			tmpStates = imageStates.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			}).map(function(state, i){
				if (
					state.index > config.minAutoIndexing - 1 &&
					state.index < config.maxAutoIndexing
				) {
					state.index = i;
				}
				return state;
			});

			tmpStates.forEach(function(state){
				var source = getSourceById(state.id);
				var clone = getCloneById(state.id);

				// set source
				try {
					if (!lastSourceChild) {
						if (!source.isSameNode(firstSourceChild)) {
							canvasElement.insertBefore(source, firstSourceChild);
						} else {
							if (source.nextSibling) {
								lastSourceChild = source.nextSibling;
							}
						}
					} else {
						if (!source.isSameNode(lastSourceChild)) {
							canvasElement.insertBefore(source, lastSourceChild);
						} else {
							if (source.nextSibling) {
								lastSourceChild = source.nextSibling;
							}
						}
					}

					tmpSourceElements.push(source);
				} catch (err) {
					return false;
				}

				// set clone
				try {
					if (!lastCloneChild) {
						if (!clone.isSameNode(firstCloneChild)) {
							mirrorElement.insertBefore(clone, firstCloneChild);
						} else {
							if (clone.nextSibling) {
								lastCloneChild = clone.nextSibling;
							}
						}
					} else {
						if (!clone.isSameNode(lastCloneChild)) {
							mirrorElement.insertBefore(clone, lastCloneChild);
						} else {
							if (clone.nextSibling) {
								lastCloneChild = clone.nextSibling;
							}
						}
					}

					tmpCloneElements.push(clone);
				} catch (err) {
					return false;
				}
			});

			imageStates = tmpStates;
			sourceElements = tmpSourceElements;
			cloneElements = tmpCloneElements;

			return true;
		}

		function setContainerCoordinates() {
			var offset = containerElement.getBoundingClientRect();
			containerState.left = offset.left;
			containerState.top = offset.top;

			return true;
		}

		function getCalculatedState(state) {
			var scaleRatio = canvasState.width / canvasState.originalWidth;
			var aspectRatio = state.width / state.height;
			var tmp = {};
			tmp.width = state.width / scaleRatio;
			tmp.height = tmp.width / aspectRatio;
			tmp.x = state.x / scaleRatio;
			tmp.y = state.y / scaleRatio;
			// tmp.left = (state.x / scaleRatio) - ((state.width / scaleRatio) / 2);
			// tmp.top = (state.y / scaleRatio) - ((state.height / scaleRatio) / 2);
			tmp.rotate = state.rotate;
			tmp.scaleX = state.scaleX;
			tmp.scaleY = state.scaleY;
			tmp.opacity = state.opacity;
			tmp.index = state.index;
			tmp.focusable = state.focusable;
			tmp.editable = state.editable;
			tmp.drawable = state.drawable;
			return tmp;
		}

		function getIdBySource(source) {
			if (!source) {
				return false;
			}
			if (!source.classList.contains("canvaaas-image")) {
				return false;
			}
			if (
				source.id === undefined ||
				source.id === null ||
				source.id === ""
			) {
				return false;
			}
			return source.id.split("-").pop();
		}

		function getSourceById(id) {
			if (!id) {
				return false;
			}
			return document.getElementById(sourceId + id);
		}

		function getSourceByFilename(str) {
			if (!str) {
				return false;
			}
			var state = imageStates.find(function(state){
				if (state.filename === str) {
					return state;
				}
			});
			if (!state) {
				return false;
			}
			return document.getElementById(sourceId + state.id);
		}

		function getStateById(id) {
			if (!id) {
				return false;
			}
			return imageStates.find(function(state){
				if (state.id === id) {
					return state;
				}
			});
		}

		function getStateBySource(source) {
			if (!source) {
				return false;
			}
			if (!source.classList.contains("canvaaas-image")) {
				return false;
			}
			if (
				source.id === undefined ||
				source.id === null ||
				source.id === ""
			) {
				return false;
			}

			var id = source.id.split("-").pop();

			return imageStates.find(function(state){
				if (state.id === id) {
					return state;
				}
			});
		}

		function getStateByFilename(str) {
			if (!str) {
				return false;
			}
			return imageStates.find(function(state){
				if (state.filename === str) {
					return state;
				}
			});
		}

		function getCloneById(id) {
			if (!id) {
				return false;
			}
			return document.getElementById(cloneId + id);
		}

		function getCloneBySource(source) {
			if (!source) {
				return false;
			}
			if (!source.classList.contains("canvaaas-image")) {
				return false;
			}
			if (
				source.id === undefined ||
				source.id === null ||
				source.id === ""
			) {
				return false;
			}
			
			var id = source.id.split("-").pop();

			return document.getElementById(cloneId + id);
		}

		function removeImageById(id) {
			if (!id) {
				return false;
			}
			var source = document.getElementById(sourceId + id);
			var clone = document.getElementById(cloneId + id);

			if (!source || !clone) {
				return false;
			}

			var stateSeq = imageStates.findIndex(function(state){
				if (state.id === id) {
					return state;
				}
			});

			if (stateSeq === undefined || stateSeq === null) {
				return false;
			}

			var sourceSeq = sourceElements.findIndex(function(candidateSource){
				if (candidateSource.isSameNode(source)) {
					return candidateSource;
				}
			});

			if (sourceSeq === undefined || sourceSeq === null) {
				return false;
			}

			try {
				imageStates.splice(stateSeq, 1);
				sourceElements.splice(sourceSeq, 1);
				source.parentNode.removeChild(source);
				clone.parentNode.removeChild(clone);
			} catch(err) {
				console.log(err);
				return false;
			}

			return true;
		}

		function getDegrees(x, y) {
			if (x === undefined || y === undefined) {
				return false;
			}
			var radians = Math.atan2(y, x) * 180 / Math.PI;

			return (-radians + 450) % 360;

			// deprecated
			// return Math.atan2(y, x) * 180 / Math.PI;
		}

		function getFittedRect(width, height, aspectRatio, fit) {
			if (
				width === undefined ||
				height === undefined ||
				aspectRatio === undefined
			) {
				return false;
			}

			var typ = fit || "contain";
			var candidateWidth = height * aspectRatio;
			var w;
			var h;

			if (
				typ === "contain" && candidateWidth > width ||
				typ === "cover" && candidateWidth < width
			) {
				w = width;
				h = width / aspectRatio;
			} else {
				w = height * aspectRatio;
				h = height;
			}

			return [w, h];
		}

		function getRotatedRect(width, height, angle) {
			if (
				width === undefined ||
				height === undefined ||
				angle === undefined
			) {
				return false;
			}
			
			var radians = angle * Math.PI / 180;
			var sinFraction = Math.sin(radians);
			var cosFraction = Math.cos(radians);
			var w;
			var h;

			if (sinFraction < 0) { 
				sinFraction = -sinFraction; 
			}

			if (cosFraction < 0) {
				cosFraction = -cosFraction;
			}

			w = (width * cosFraction) + (height * sinFraction);
			h = (width * sinFraction) + (height * cosFraction);

			return [w, h];
		}

		// deprecated
		function getRotatedAnchors(cx, cy, w, h, angle) {
			if (!angle) {
				angle = 0;
			}

			var radians = angle * Math.PI / 180;
			var sinFraction = Math.sin(radians);
			var cosFraction = Math.cos(radians);

			var topLeft;
			var topCenter;
			var topRight;
			var middleLeft;
			var middleCenter;
			var middleRight;
			var bottomLeft;
			var bottomCenter;
			var bottomRight;

			topLeft = [
				((-w/2) * cosFraction) - ((-h/2) * sinFraction) + cx,
				((-w/2) * sinFraction) + ((-h/2) * cosFraction) + cy
			];

			topCenter = [
				((0) * cosFraction) - ((-h/2) * sinFraction) + cx,
				((0) * sinFraction) + ((-h/2) * cosFraction) + cy
			];

			topRight = [
				((w/2) * cosFraction) - ((-h/2) * sinFraction) + cx,
				((w/2) * sinFraction) + ((-h/2) * cosFraction) + cy
			];

			middleLeft = [
				((-w/2) * cosFraction) - (0 * sinFraction) + cx,
				((-w/2) * sinFraction) + (0 * cosFraction) + cy
			];

			middleCenter = [
				(0 * cosFraction) - (0 * sinFraction) + cx,
				(0 * sinFraction) + (0 * cosFraction) + cy
			];

			middleRight = [
				((w/2) * cosFraction) - (0 * sinFraction) + cx,
				((w/2) * sinFraction) + (0 * cosFraction) + cy
			];

			bottomLeft = [
				((-w/2) * cosFraction) - ((h/2) * sinFraction) + cx,
				((-w/2) * sinFraction) + ((h/2) * cosFraction) + cy
			];

			bottomCenter = [
				(0 * cosFraction) - ((h/2) * sinFraction) + cx,
				(0 * sinFraction) + ((h/2) * cosFraction) + cy
			];

			bottomRight = [
				((w/2) * cosFraction) - ((h/2) * sinFraction) + cx,
				((w/2) * sinFraction) + ((h/2) * cosFraction) + cy
			];

			// [
			// 	[0],[1],[2], 
			// 	[3],[4],[5],
			// 	[6],[7],[8]
			// ]

			return [
				topLeft,
				topCenter,
				topRight,
				middleLeft,
				middleCenter,
				middleRight,
				bottomLeft,
				bottomCenter,
				bottomRight
			];
		}

		function getDiagonal(w, h) {
			if (w === undefined || h === undefined) {
				return false;
			}
			return Math.sqrt( Math.pow(w, 2) + Math.pow(h, 2) );
		}

		function getDirection(direction, scaleX, scaleY) {
			if (
				!direction ||
				scaleX === undefined ||
				scaleY === undefined
			) {
				return false;
			}

			var flipX;
			var flipY;
			var radians;

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

			if (
				direction === "n" ||
				direction === "N" ||
				direction === "north" ||
				direction === "North"
			) {
				radians = 0;
			} else if (
				direction === "ne" ||
				direction === "NE" ||
				direction === "north-east" ||
				direction === "North-East"
			) {
				radians = 45;
			} else if (
				direction === "e" ||
				direction === "E" ||
				direction === "east" ||
				direction === "East"
			) {
				radians = 90;
			} else if (
				direction === "se" ||
				direction === "SE" ||
				direction === "south-east" ||
				direction === "South-East"
			) {
				radians = 135;
			} else if (
				direction === "s" ||
				direction === "S" ||
				direction === "south" ||
				direction === "South"
			) {
				radians = 180;
			} else if (
				direction === "sw" ||
				direction === "SW" ||
				direction === "south-west" ||
				direction === "South-West"
			) {
				radians = 225;
			} else if (
				direction === "w" ||
				direction === "W" ||
				direction === "west" ||
				direction === "West"
			) {
				radians = 270;
			} else if (
				direction === "nw" ||
				direction === "NW" ||
				direction === "north-west" ||
				direction === "North-West"
			) {
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

		function getShortId() {
		    // I generate the UID from two parts here 
		    // to ensure the random number provide enough bits.
			var firstPart = (Math.random() * 46656) | 0;
			var secondPart = (Math.random() * 46656) | 0;
			firstPart = ("000" + firstPart.toString(36)).slice(-3);
			secondPart = ("000" + secondPart.toString(36)).slice(-3);
			return firstPart + secondPart;
		}

		function isMobile() {
			var res = false;
			// device detection
			if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
			    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
			    res = true;
			}
			return res;
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

		function getExtension(str) {
			if (!str) {
				return false;
			}
			return str.split('.').pop();
		}

		function getFilename(str) {
			if (!str) {
				return false;
			}
			return str.replace(/^.*[\\\/]/, '');
			// return str.substring(url.lastIndexOf('/')+1);
		}

		function drawCanvas(options) {
			if (
				typeof(options) !== "object" ||
				options === null
			) {
				return false;
			}

			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");

			var width = options.width;
			var height = options.height;
			var aspectRatio = options.width / options.height;
			var maxWidth = options.maxWidth;
			var maxHeight = options.maxHeight;
			var minWidth = options.minWidth || 0;
			var minHeight = options.minHeight || 0;
			var fillColor = options.fillColor;

			if (
				!width ||
				!height ||
				!aspectRatio ||
				!fillColor ||
				!maxWidth ||
				!maxHeight
			) {
				return false;
			}

			var maxSizes = getFittedRect(
				maxWidth,
				maxHeight,
				aspectRatio
			);

			var minSizes = getFittedRect(
				minWidth,
				minHeight,
				aspectRatio,
				'cover'
			);

			var canvasWidth = Math.min(maxSizes[0], Math.max(minSizes[0], width));
			var canvasHeight = Math.min(maxSizes[1], Math.max(minSizes[1], height));

			canvas.width = canvasWidth;
			canvas.height = canvasHeight;

			ctx.fillStyle = fillColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.save();

			return canvas;
		}

		// callback
		function drawImage(canvas, id, cb){
			if (
				typeof(canvas) !== "object" ||
				canvas === null
			) {
				return cb("Argument error");
			}
			if (typeof(id) !== "string") {
				return cb("Argument error");
			}

			var source = getSourceById(id);
			if (!source) {
				return cb("Source element not found");
			}
			var state = getStateById(id);
			if (!state) {
				return cb("State not found");
			}
			var originalImg = source.querySelector("img");
			if (!originalImg) {
				return cb("Image element not found");
			}

			var virtualImg = new Image();
			virtualImg.src = originalImg.src;

			virtualImg.onerror = function(e) {
				return cb(e);
			}
			virtualImg.onload = function(e) {
				var maxCanvasWidth = config.maxDrawWidth || 9999;
				var maxCanvasHeight = config.maxDrawHeight || 9999;
				var minCanvasWidth = config.minDrawWidth || 0;
				var minCanvasHeight = config.minDrawHeight || 0;

				// original
				var scaleRatio = canvasState.width / canvas.width;
				var adjW = state.width / scaleRatio;
				var adjH = state.height / scaleRatio;
				var adjX = state.x / scaleRatio;
				var adjY = state.y / scaleRatio;

				// original > rotate
				var adjSizes = getRotatedRect(
					adjW,
					adjH,
					state.rotate
				);
				var rotatedWidth = Math.floor(adjSizes[0]);
				var rotatedHeight = Math.floor(adjSizes[1]);
				var rotatedLeft = Math.floor(adjX - (adjSizes[0] * 0.5));
				var rotatedTop = Math.floor(adjY - (adjSizes[1] * 0.5));

				var maxSizes = getFittedRect(
					maxCanvasWidth,
					maxCanvasHeight,
					rotatedWidth / rotatedHeight,
				);

				var minSizes = getFittedRect(
					minCanvasWidth,
					minCanvasHeight,
					rotatedWidth / rotatedHeight,
					'cover'
				);

				// original > rotate > resize
				var canvasWidth = Math.min(maxSizes[0], Math.max(minSizes[0], rotatedWidth));
				var canvasHeight = Math.min(maxSizes[1], Math.max(minSizes[1], rotatedHeight));

				// orignal > resize
				var scaleRatioX = canvasWidth / rotatedWidth;
				var scaleRatioY = canvasHeight / rotatedHeight;
				var absWidth = adjW * scaleRatioX;
				var absHeight = adjH * scaleRatioY;

				// create canvas
				var tmpCanvas = document.createElement("canvas");
				var tmpCtx = tmpCanvas.getContext("2d");

				// set canvas sizes
				tmpCanvas.width = Math.floor(canvasWidth);
				tmpCanvas.height = Math.floor(canvasHeight);

				// set canvas options
				tmpCtx.globalAlpha = state.opacity;
				tmpCtx.fillStyle = "transparent";
				tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
				tmpCtx.save();
				tmpCtx.translate(tmpCanvas.width * 0.5, tmpCanvas.height * 0.5);
				tmpCtx.scale(state.scaleX, state.scaleY);
				tmpCtx.rotate(state.rotate * (Math.PI / 180));

				// draw
				tmpCtx.drawImage(
					virtualImg,
					-Math.floor(absWidth * 0.5), -Math.floor(absHeight * 0.5),
					Math.floor(absWidth), Math.floor(absHeight)
				);
				tmpCtx.restore();

				var sx = 0;
				var sy = 0;
				var sw = tmpCanvas.width;
				var sh = tmpCanvas.height;
				var dx = rotatedLeft;
				var dy = rotatedTop;
				var dw = rotatedWidth;
				var dh = rotatedHeight;

				// draw to main canvas
				var ctx = canvas.getContext("2d");
				ctx.drawImage(
					tmpCanvas,
					sx, sy,
					sw, sh,
					dx, dy,
					dw, dh
				);
				ctx.restore();

				if (cb) {
					return cb(null);
				}
			}
		}

		// callback
		function renderImage(file, oldState, cb) {
			if (!file) {
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			if (sourceElements.length > config.maxNumberOfImages - 1) {
				if (cb) {
					cb("Exceed `config.maxNumberOfImages`");
				}
				return false;
			}

			var ext;
			var src;
			var newImage = new Image();
			var id = getShortId();

			// check file or url
			if (
				typeof(file) === "object" &&
				file !== null
			) {
				// file
				ext = file.type.split("/").pop();
				src = URL.createObjectURL(file);
			} else if (typeof(file) === "string") {
				// url
				ext = getExtension(file);
				src = file;
				// src = file + "?" + new Date().getTime(); // fix ios refresh error, cachebreaker
			} else {
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			// check mimeType
			if (config.allowedExtensions.indexOf(ext) < 0) {
				if (cb) {
					cb("Extentions not allowed");
				}
				return false;
			}

			// start load
			newImage.src = src;

			newImage.onerror = function(e) {
				if (cb) {
					cb("Image load failed");
				}
				return false;
			}

			newImage.onload = function(e) {
				if (!isInitialized) {
					var resA = initContainer(newImage.width, newImage.height);
					if (!resA) {

						if (cb) {
							cb("`initContainer()` error");
						}
						return false;
					}
					var resB = initCanvas(newImage.width, newImage.height);
					if (!resB) {
						if (cb) {
							cb("`initCanvas()` error");
						}
						return false;
					}

					isInitialized = true;
				}

				var nextIndex = config.minAutoIndexing;
				imageStates.forEach(function(state){
					if (state.index < config.maxAutoIndexing) {
						if (nextIndex < state.index) {
							nextIndex = state.index;
						}
					}
				});

				var newSource = document.createElement("div");
				newSource.classList.add("canvaaas-image");
				newSource.id = sourceId + id;
				newSource.innerHTML = imageTemplate;

				var newImg = newSource.querySelector("img");
				newImg.src = newImage.src;

				// image
				var originalWidth = newImage.width;
				var originalHeight = newImage.height;

				var aspectRatio = originalWidth / originalHeight;
				var scaleRatio = canvasState.width / canvasState.originalWidth;

				var maxWidth = canvasState.width * config.maxImageRenderWidth;
				var maxHeight = canvasState.height * config.maxImageRenderHeight;
				var minWidth = canvasState.width * config.minImageRenderWidth;
				var minHeight = canvasState.height * config.minImageRenderHeight;				

				var maxSizes = getFittedRect(
					maxWidth,
					maxHeight,
					aspectRatio,
				);

				var minSizes = getFittedRect(
					minWidth,
					minHeight,
					aspectRatio,
					"cover"
				);

				var index = nextIndex + 1;
				var width = Math.min(maxSizes[0], Math.max(minSizes[0], originalWidth));
				var height = Math.min(maxSizes[1], Math.max(minSizes[1], originalHeight));
				var axisX = canvasState.width * 0.5;
				var axisY = canvasState.height * 0.5;
				var rotate = 0;
				var scaleX = 1;
				var scaleY = 1;
				var opacity = 1;
				var focusable = true;
				var editable = true;
				var drawable = true;

				if (
					typeof(oldState) === "object" &&
					oldState !== null
				) {
					if (
						oldState.width !== undefined &&
						oldState.height !== undefined 
					) {
						// from same canvas.originalWidth & canvas.originalHeight
						width = oldState.width * scaleRatio;
						height = width / (oldState.width / oldState.height);
					}

					if (
						oldState.x !== undefined &&
						oldState.y !== undefined
					) {
						axisX = oldState.x * scaleRatio;
						axisY = oldState.y * scaleRatio;
					}

					if (oldState.index !== undefined) {
						index = oldState.index;
					}

					if (oldState.opacity !== undefined) {
						opacity = oldState.opacity;
					}

					if (oldState.rotate !== undefined) {
						rotate = oldState.rotate;
					}

					if (oldState.scaleX !== undefined) {
						scaleX = oldState.scaleX;
					}

					if (oldState.scaleY !== undefined) {
						scaleY = oldState.scaleY;
					}

					if (oldState.focusable !== undefined) {
						focusable = oldState.focusable;
					}

					if (oldState.editable !== undefined) {
						editable = oldState.editable;
					}

					if (oldState.drawable !== undefined) {
						drawable = oldState.drawable;
					}
				}

				var newState = {};
				newState.src = src;
				newState.id = id;
				newState.index = index;
				newState.originalWidth = originalWidth;
				newState.originalHeight = originalHeight;
				newState.width = width;
				newState.height = height;
				newState.x = axisX;
				newState.y = axisY;
				newState.rotate = rotate;
				newState.scaleX = scaleX;
				newState.scaleY = scaleY;
				newState.opacity = opacity;
				newState.focusable = focusable;
				newState.editable = editable;
				newState.drawable = drawable;

				setElement(newSource, newState);

				imageStates.push(newState);

				canvasElement.appendChild(newSource);
				sourceElements.push(newSource);

				// mirror
				var newClone = newSource.cloneNode();

				newClone.innerHTML = newSource.innerHTML;
				newClone.id = cloneId + id;
				newClone.classList.replace("canvaaas-image", "canvaaas-clone");

				// events
				var rotateHandlesA = newSource.querySelectorAll("div.canvaaas-rotate-handle");
				var resizeHandlesA = newSource.querySelectorAll("div.canvaaas-resize-handle");
				
				rotateHandlesA.forEach(function(handleElem){
					handleElem.addEventListener("mousedown", handlers.startRotate, false);
					handleElem.addEventListener("touchstart", handlers.startRotate, false);
				});

				resizeHandlesA.forEach(function(handleElem){
					handleElem.addEventListener("mousedown", handlers.startResize, false);
					handleElem.addEventListener("touchstart", handlers.startResize, false);
				});

				newSource.addEventListener("mousedown", handlers.startFocusIn, false);
				newSource.addEventListener("touchstart", handlers.startFocusIn, false);

				var rotateHandlesB = newClone.querySelectorAll("div.canvaaas-rotate-handle");
				var resizeHandlesB = newClone.querySelectorAll("div.canvaaas-resize-handle");

				rotateHandlesB.forEach(function(handleElem){
					handleElem.addEventListener("mousedown", handlers.startRotate, false);
					handleElem.addEventListener("touchstart", handlers.startRotate, false);
				});

				resizeHandlesB.forEach(function(handleElem){
					handleElem.addEventListener("mousedown", handlers.startResize, false);
					handleElem.addEventListener("touchstart", handlers.startResize, false);
				});

				newClone.addEventListener("mousedown", handlers.startFocusIn, false);
				newClone.addEventListener("touchstart", handlers.startFocusIn, false);

				mirrorElement.appendChild(newClone);
				cloneElements.push(newClone);

				var res = setIndex();
				if (!res) {
					if (cb) {
						cb("`setIndex()` error");
					}
					return false;
				}
				if (cb) {
					cb(null, id);
				}		
				return false;
			}
		}

		function initContainer(width, height) {
			if (
				containerElement === false ||
				containerElement === undefined ||
				typeof(width) !== "number" ||
				typeof(height) !== "number"
			) {
				return false;
			}

			var viewportSizes = getViewportSizes();
			var viewportWidth = viewportSizes[0];
			var viewportHeight = viewportSizes[1];

			if (
				viewportSizes === false ||
				viewportSizes === undefined
			) {
				return false;
			}

			// clear container style
			containerElement.style.width = "";
			containerElement.style.height = "";

			var minWidth = config.minContainerWidth || 0;
			var minHeight = config.minContainerHeight || 0;
			var maxWidth;
			var maxHeight;

			if (!config.maxContainerWidth) {
				maxWidth = viewportWidth;
			} else if (config.maxContainerWidth === 1) {
				maxWidth = viewportWidth;
			} else if (config.maxContainerWidth < 1) {
				maxWidth = viewportWidth * config.maxContainerWidth;
			} else {
				maxWidth = config.maxContainerWidth;
			}

			if (!config.maxContainerHeight) {
				maxHeight = viewportHeight;
			} else if (config.maxContainerHeight === 1) {
				maxHeight = viewportHeight;
			} else if (config.maxContainerHeight < 1) {
				maxHeight = viewportHeight * config.maxContainerHeight;
			} else {
				maxHeight = config.maxContainerHeight;
			}

			var aspectRatio = config.containerAspectRatio || width / height;

			var containerWidth = containerElement.offsetWidth;
			var containerHeight = containerElement.offsetWidth / aspectRatio;

			var maxSizes = getFittedRect(
				maxWidth,
				maxHeight,
				aspectRatio
			);

			var minSizes = getFittedRect(
				minWidth,
				minHeight,
				aspectRatio,
				"cover"
			);

			var adjWidth = Math.min(maxSizes[0], Math.max(minSizes[0], containerWidth));
			var adjHeight = Math.min(maxSizes[1], Math.max(minSizes[1], containerHeight));

			containerState.width = adjWidth;
			containerState.height = adjHeight;

			setElement(containerElement, containerState);

			// if (hasScrollbar()) {
			// 	var tmp = containerState.width / containerState.height;
			// 	containerState.width -= scrollbarWidth;
			// 	containerState.height = containerState.width / tmp;

			// 	setElement(containerElement, containerState);
			// }

			var offset = containerElement.getBoundingClientRect();
			containerState.left = offset.left;
			containerState.top = offset.top;

			return true;
		}

		function initCanvas(width, height) {
			if (
				!canvasElement ||
				!containerState.width ||
				!containerState.height ||
				typeof(width) !== "number" ||
				typeof(height) !== "number"
			) {
				return false;
			}

			var aspectRatio = width / height;

			var fittedSizes = getFittedRect(
				containerState.width,
				containerState.height,
				aspectRatio
			);

			var axisX = 0.5 * containerState.width;
			var axisY = 0.5 * containerState.height;

			canvasState.originalWidth = width;
			canvasState.originalHeight = height;
			canvasState.width = fittedSizes[0];
			canvasState.height = fittedSizes[1];
			canvasState.x = axisX;
			canvasState.y = axisY;

			setElement(canvasElement, canvasState);
			setElement(mirrorElement, canvasState);

			return true;
		}

		// 
		// exports
		// 

		myObject.init = function(target, preConfig, cb) {
			if (
				containerElement ||
				canvasElement ||
				sourceElements.length > 0 ||
				isInitialized === true
			) {
				if (cb) {
					cb("Already initialized");
				}
				return false;
			}

			if (
				typeof(target) !== "object" ||
				target === null
			) {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (
				typeof(preConfig) === "object" &&
				preConfig !== null
			) {
				var copyRes = copyObject(preConfig, config);
				if (!copyRes) {
					if (cb) {
						cb("`copyObject()` error");
					}
					return false;
				}
			}

			// check target inner
			var tmpUrls = [];
			if (target.querySelectorAll("img").length > 0) {
				target.querySelectorAll("img").forEach(function(img){
					tmpUrls.push(img.src);
				});
			}

			// set template
			target.innerHTML = conatinerTemplate;
			containerElement = target.querySelector("div.canvaaas");
			canvasElement = target.querySelector("div.canvaaas-canvas");
			mirrorElement = target.querySelector("div.canvaaas-mirror");

			// check config.initDrawWidth, config.initDrawHeight
			var hasCanvasSizes = false;
			if (
				config.initDrawWidth !== undefined &&
				config.initDrawHeight !== undefined
			) {
				// set container
				var resA = initContainer(config.initDrawWidth, config.initDrawHeight);
				if (!resA) {
					if (cb) {
						cb("`initContainer()` error");
					}
					return false;
				}

				// set canvas
				var resB = initCanvas(config.initDrawWidth, config.initDrawHeight);
				if (!resB) {
					if (cb) {
						cb("`initCanvas()` error");
					}
					return false;
				}

				hasCanvasSizes = true;
				isInitialized = true;

				containerElement.classList.add("hidden");
			}

			// set styles

			// set events
			// window.addEventListener("resize", handlers.debounce( handlers.resizeWindow, 100 ), false);
			window.addEventListener("resize", handlers.resizeWindow, false);

			containerElement.addEventListener('dragenter', handlers.preventDefaults, false);
			containerElement.addEventListener('dragleave', handlers.preventDefaults, false);
			containerElement.addEventListener('dragover', handlers.preventDefaults, false);
			containerElement.addEventListener('drop', handlers.preventDefaults, false);
			containerElement.addEventListener('drop', handlers.dropImages, false);

			// init target inner
			var index = tmpUrls.length;
			var count = 0;

			onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderImage(tmpUrls[count], null, function(err, id) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
						} else {
							if (config.upload) {
								config.upload(null, id);
							}
						}
						count++;
						recursiveFunc();
					});
				} else {
					onUpload = false;

					if (hasCanvasSizes === true) {
						containerElement.classList.remove("hidden");
					}

					if (cb) {
						cb(null, config);
					} 
					console.log("canvaaas.js initialized", config);
				}
			}
		}

		myObject.uploadFiles = function(self, imageStates, cb) {
			if (
				typeof(self) !== "object" ||
				self === null
			) {
				if (config.upload) {
					config.upload("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			var files = self.files;
			if (files.length < 1) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				} 
				return false;
			}

			var states = [];
			for (var i = 0; i < files.length; i++) {
				states[i] = null;
			}

			if (imageStates) {
				if (Array.isArray(imageStates)) {
					for (var i = 0; i < imageStates.length; i++) {
						states.push(imageStates[i]);
					}
				}
			}

			if (!config.editable) {
				if (config.upload) {
					config.upload("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (onUpload === true) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				} 
				return false;
			}

			onUpload = true;

			var index = files.length;
			var count = 0;
			var results = [];

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					var thisUrl = files[count];
					var thisState = states[count];

					renderImage(thisUrl, thisState, function(err, id) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
						} else {
							if (config.upload) {
								config.upload(null, id);
							}
							results.push(id);
						}
						count++;
						recursiveFunc();
					});
				} else {

					onUpload = false;

					if (cb) {
						cb(null, results);
					}
				}
			}
		}

		myObject.uploadUrls = function(imageURLs, imageStates, cb) {
			if (!Array.isArray(imageURLs)) {
				if (config.upload) {
					config.upload("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			var states = [];
			for (var i = 0; i < imageURLs.length; i++) {
				states[i] = null;
			}

			if (imageStates) {
				if (Array.isArray(imageStates)) {
					for (var i = 0; i < imageStates.length; i++) {
						states.push(imageStates[i]);
					}
				}
			}

			if (!config.editable) {
				if (config.upload) {
					config.upload("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (onUpload === true) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				} 
				return false;
			}

			var index = imageURLs.length;
			var count = 0;
			var results = [];

			onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					var thisUrl = imageURLs[count];
					var thisState = states[count];

					renderImage(thisUrl, thisState, function(err, id) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
						} else {
							if (config.upload) {
								config.upload(null, id);
							}
							results.push(id);
						}
						count++;
						recursiveFunc();
					});
				} else {

					onUpload = false;

					if (cb) {
						cb(null, results);
					}
				}
			}
		}

		// 
		// image
		// 

		myObject.moveX = function(id, x, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (typeof(x) !== "number") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.x -= x;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
		}

		myObject.moveY = function(id, y, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (typeof(y) !== "number") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.y -= y;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
		}

		myObject.moveTo = function(id, x, y, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (
				(typeof(x) !== "number" && typeof(x) !== "string") ||
				(typeof(y) !== "number" && typeof(y) !== "string")
			) {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			if (
				x === 0 ||
				x === "l" ||
				x === "left"
			) {
				state.x = (canvasState.width * 0) + (state.width * 0.5);
			} else if (
				x === 0.5 ||
				x === "c" ||
				x === "center"
			) {
				state.x = (canvasState.width * 0.5);
			} else if (
				x === 1 ||
				x === "r" ||
				x === "right"
			) {
				state.x = (canvasState.width * 1) - (state.width * 0.5);
			} else if (
				x !== null &&
				x !== undefined
			) {
				state.x = x;
			}

			if (
				y === 0 ||
				y === "t" ||
				y === "top"
			) {
				state.y = (canvasState.height * 0) + (state.height * 0.5);
			} else if (
				y === 0.5 ||
				y === "c" ||
				y === "center" ||
				y === "middle"
			) {
				state.y = (canvasState.height * 0.5);
			} else if (
				y === 1 ||
				y === "b" ||
				y === "bottom"
			) {
				state.y = (canvasState.height * 1) - (state.height * 0.5);
			} else if (
				y !== null &&
				y !== undefined
			) {
				state.y = y;
			}

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
		}

		myObject.zoom = function(id, ratio, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (typeof(ratio) !== "number") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.width *= 1 + ratio;
			state.height *= 1 + ratio;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
		}

		myObject.zoomTo = function(id, ratio, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (
				typeof(ratio) !== "number" &&
				typeof(ratio) !== "string" 
			) {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			var width;
			var height;
			var left;
			var top;
			var fittedSizes;
			var aspectRatio = state.originalWidth / state.originalHeight;

			if (typeof(ratio) === "string") {
				if (ratio === "cover") {
					fittedSizes = getFittedRect(
						canvasState.width,
						canvasState.height,
						aspectRatio,
						"cover"
					)
					width = fittedSizes[0];
					height = fittedSizes[1];
					left = canvasState.width * 0.5;
					top = canvasState.height * 0.5;
				} else if (ratio === "contain") {
					fittedSizes = getFittedRect(
						canvasState.width,
						canvasState.height,
						aspectRatio,
						"contain"
					)
					width = fittedSizes[0];
					height = fittedSizes[1];
					left = canvasState.width * 0.5;
					top = canvasState.height * 0.5;
				} else {
					if (config.edit) {
						config.edit("Argument error");
					}
					if (cb) {
						cb("Argument error");
					} 
					return false;
				}
			} else {
				width = state.originalWidth * ratio;
				height = state.originalHeight * ratio;
				left = state.left;
				top = state.top;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.width = width;
			state.height = height;
			state.left = left;
			state.top = top;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.rotate = function(id, deg, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (typeof(deg) !== "number") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			if (state.scaleX === -1) {
				deg *= -1;
			}

			if (state.scaleY === -1) {
				deg *= -1;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.rotate += deg;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.rotateTo = function(id, deg, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (typeof(deg) !== "number") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			if (state.scaleX === -1) {
				deg *= -1;
			}

			if (state.scaleY === -1) {
				deg *= -1;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.rotate = deg;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.flipX = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.scaleX *= -1;
			state.rotate *= -1;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			} 
		}

		myObject.flipY = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.scaleY *= -1;
			state.rotate *= -1;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			} 
		}

		myObject.flipTo = function(id, x, y, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (
				typeof(x) !== "number" ||
				typeof(y) !== "number"
			) {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			if (x > 1) {
				x = 1;
			}
			if (x < -1) {
				x = -1;
			}
			if (y > 1) {
				y = 1;
			}
			if (y < -1) {
				y = -1;
			}
			if (x !== state.scaleX) {
				state.rotate *= -1;
			}
			if (y !== state.scaleY) {
				state.rotate *= -1;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.scaleX = x;
			state.scaleY = x;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			} 
		}

		myObject.opacityTo = function(id, num, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (typeof(num) !== "number") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			if (num > 1) {
				num = 1;
			}
			if (num < 0) {
				num = 0;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.opacity = num;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.indexUp = function(id, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// check index limit
			if (state.index > config.maxAutoIndexing - 1) {
				if (config.edit) {
					config.edit("Exceed max number of index");
				}
				if (cb) {
					cb("Exceed max number of index");
				}
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// check next index
			if (imageStates[state.index + 1] !== undefined) {
				if (
					imageStates[state.index + 1].index > config.minAutoIndexing - 1 &&
					imageStates[state.index + 1].index < config.maxAutoIndexing
				) {
					imageStates[state.index + 1].index = state.index;
				}
			}

			// save state
			state.index += 1;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			var res = setIndex();
			if (!res) {
				if (config.edit) {
					config.edit("`setIndex()` error");
				}
				if (cb) {
					cb("`setIndex()` error");
				}
				return false;
			}
			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.indexDown = function(id, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// check index limit
			if (state.index - 1 < config.minAutoIndexing) {
				if (config.edit) {
					config.edit("Reached min number of index");
				}
				if (cb) {
					cb("Reached min number of index");
				}
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// check previous state
			if (imageStates[state.index - 1] !== undefined) {
				if (
					imageStates[state.index - 1].index > config.minAutoIndexing - 1 &&
					imageStates[state.index - 1].index < config.maxAutoIndexing
				) {
					imageStates[state.index - 1].index = state.index;
				}
			}

			// save state
			state.index -= 1;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			var res = setIndex();
			if (!res) {
				if (config.edit) {
					config.edit("`setIndex()` error");
				}
				if (cb) {
					cb("`setIndex()` error");
				}
				return false;
			}
			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.indexTo = function(id, num, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (typeof(num) !== "number") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.index = num;

			// adjust state
			setElement(source, state);
			setElement(clone, state);

			var res = setIndex();
			if (!res) {
				if (config.edit) {
					config.edit("`setIndex()` error");
				}
				if (cb) {
					cb("`setIndex()` error");
				}
				return false;
			}
			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.focusIn = function(id, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.focus) {
					config.focus("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!source || !state) {
				if (config.focus) {
					config.focus("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.focusable) {
				if (config.focus) {
					config.focus("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			if (eventState.target) {
				var oldId = getIdBySource(eventState.target);
				setFocusOut(oldId);
			}

			setFocusIn(id);

			if (config.focus) {
				config.focus(null, id);
			}
			if (cb) {
				cb(null, id);
			}
		}

		myObject.focusOut = function(cb) {
			if (!eventState.target) {
				if (cb) {
					cb("Target not found");
				} 
				return false;
			}

			var id = getIdBySource(eventState.target);
			
			if (!id) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			setFocusOut(id);

			if (cb) {
				cb(null, id);
			}
		}

		myObject.focusable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.focusable = true;

			// remove class
			source.classList.remove("unclickable");

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.editable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!source || !state) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.editable = true;

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.drawable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.drawable = true;

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.unfocusable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			if (eventState.target) {
				if (source.isSameNode(eventState.target)) {
					var res = setFocusOut(id);
					if (!res) {
						if (config.edit) {
							config.edit("`setFocusOut()` error");
						}
						if (cb) {
							cb("`setFocusOut()` error");
						} 
						return false;
					}
				}	
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.focusable = false;

			// add class
			source.classList.add("unclickable");

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.uneditable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.editable = false;

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.undrawable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.edit) {
					config.edit("Has been denied");
				}
				if (cb) {
					cb("Has been denied");
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.drawable = false;

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.remove = function(id, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.remove) {
					config.remove("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.remove) {
					config.remove("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.remove) {
					config.remove("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// check focus
			if (eventState.target) {
				if (source.isSameNode(eventState.target)) {
					var res = setFocusOut(id);
					if (!res) {
						if (config.remove) {
							config.remove("`setFocusOut()` error");
						}
						if (cb) {
							cb("`setFocusOut()` error");
						}
						return false;
					}
				}
			}

			// remove element
			var res = removeImageById(id);
			if (!res) {
				if (config.remove) {
					config.remove("`removeImageById()` error");
				}
				if (cb) {
					cb("`removeImageById()` error");
				}
			} else {
				if (config.remove) {
					config.remove(null, id);
				}
				if (cb) {
					cb(null, id);
				}
			}
		}

		myObject.removeAll = function(cb) {
			if (!config.editable) {
				if (config.remove) {
					config.remove("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			var arr = [];
			for (var i = imageStates.length - 1; i >= 0; i--) {
				arr.push(imageStates[i].id);
			}

			var results = [];
			var index = arr.length;
			var count = 0;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// remove element
					var res = removeImageById(arr[count]);
					if (!res) {
						if (config.remove) {
							config.remove("`removeImageById()` error");
						}
					} else {
						if (config.remove) {
							config.remove(null, arr[count]);
						}
					}
					results.push({
						err: "`removeImageById()` error",
						res: arr[count]
					});
					count++;
					recursiveFunc();
				} else {
					if (cb) {
						cb(null, results);
					}
				}
			}
		}

		myObject.reset = function(id, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.edit) {
					config.edit("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.edit) {
					config.edit("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			var originalWidth = state.originalWidth;
			var originalHeight = state.originalHeight;
			var aspectRatio = state.originalWidth / state.originalHeight;

			var maxWidth = canvasState.width * config.maxImageRenderWidth;
			var maxHeight = canvasState.height * config.maxImageRenderHeight;
			var minWidth = canvasState.width * config.minImageRenderWidth;
			var minHeight = canvasState.height * config.minImageRenderHeight;

			var maxSizes = getFittedRect(
				maxWidth,
				maxHeight,
				aspectRatio,
			);

			var minSizes = getFittedRect(
				minWidth,
				minHeight,
				aspectRatio,
				"cover"
			);

			var width = Math.min(maxSizes[0], Math.max(minSizes[0], originalWidth));
			var height = Math.min(maxSizes[1], Math.max(minSizes[1], originalHeight));
			var axisX = canvasState.width * 0.5;
			var axisY = canvasState.height * 0.5;

			state.width = width;
			state.height = height;
			state.x = axisX;
			state.y = axisY;
			state.rotate = 0;
			state.scaleX = 1;
			state.scaleY = 1;
			state.opacity = 1;

			state.focusable = true;
			state.editable = true;
			state.drawable = true;

			setElement(source, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		// 
		// config
		// 

		myObject.config = function(newConfig, cb) {
			if (
				typeof(newConfig) !== "object" ||
				newConfig === null
			) {
				if (config.config) {
					config.config("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (!config.editable) {
				if (config.config) {
					config.config("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			// set config
			copyObject(newConfig, config);

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.canvas = function(w, h, cb) {
			if (
				typeof(w) !== "number" ||
				typeof(h) !== "number"
			) {
				if (config.config) {
					config.config("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (!config.editable) {
				if (config.config) {
					config.config("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			var oldW = canvasState.width;
			var oldH = canvasState.height;

			// set container
			initContainer(w, h);

			// set canvas
			initCanvas(w, h);

			// set images
			var newW = canvasState.width;
			var newH = canvasState.height;

			var scaleRatioX = newW / oldW;
			var scaleRatioY = newH / oldH;

			// new state adjust to images
			imageStates.forEach(function(state){
				var source = getSourceById(state.id);
				var clone = getCloneById(state.id);

				var aspectRatio = state.width / state.height;

				state.width *= scaleRatioX;
				state.height = state.width / aspectRatio;
				state.x *= scaleRatioX;
				state.y *= scaleRatioY;

				setElement(source, state);
				setElement(clone, state);
			});

			if (config.config) {
				config.config(null, canvasState);
			}
			if (cb) {
				cb(null, canvasState);
			}
		}

		myObject.hideContainer = function(cb) {

			containerElement.classList.add("hidden");

			if (cb) {
				cb(null, canvasState);
			}
		}

		myObject.showContainer = function(cb) {

			containerElement.classList.remove("hidden");

			if (cb) {
				cb(null, canvasState);
			}
		}

		myObject.resume = function(cb) {

			config.editable = true;

			if (cb) {
				cb(null, config);
			}
		}

		myObject.stop = function(cb) {
			if (eventState.target) {
				var oldId = getIdBySource(eventState.target);
				var res = setFocusOut(oldId);
				if (!res) {
					if (cb) {
						cb("`setFocusOut()` error");
					}
					return false;
				}
			}

			config.editable = false;

			if (cb) {
				cb(null, config);
			}
		}

		myObject.setFillColor = function(colour, cb) {

			if (typeof(colour) !== "string") {
				if (config.config) {
					config.config("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (colour.toLowerCase() === "alpha") {
				colour = "transparent";
			} else {
				if (colour.charAt(0) !== "#") {
					colour = "#" + colour;
				}	
			}

			config.drawFillColor = colour;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.unsetFillColor = function(cb) {

			config.drawFillColor = defaultConfiguration.fillColor;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.lockAspectRatio = function(cb){

			config.lockAspectRatio = true;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.unlockAspectRatio = function(cb){

			config.lockAspectRatio = false;
			
			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		// 
		// draw
		// 

		myObject.draw = function(cb){
			var drawWidth = canvasState.originalWidth;
			var drawHeight = canvasState.originalHeight;
			var quality = config.drawQuality;
			var mimeType = config.drawMimeType;
			var imageSmoothingQuality = config.drawSmoothingQuality;
			var imageSmoothingEnabled = config.drawSmoothingEnabled;
			var fillColor = config.drawFillColor;

			var drawOption = {
				width: drawWidth,
				height: drawHeight,
				maxWidth: config.maxDrawWidth || 9999,
				maxHeight: config.maxDrawHeight || 9999,
				minWidth: config.minDrawWidth || 0,
				minHeight: config.minDrawHeight || 0,
				fillColor: fillColor
			}

			var canvas = drawCanvas(drawOption);
			if (!canvas) {
				if (config.draw) {
					config.draw("`drawCanvas()` error");
				}
				if (cb) {
					cb("`drawCanvas()` error");
				}
				return false;
			}
			var ctx = canvas.getContext("2d");

			var drawables = [];
			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawable) {
					drawables.push(imageStates[i]);
				}
			}

			var index = drawables.length;
			var count = 0;
			var result = {};

			result.width = canvas.width;
			result.height = canvas.height;
			result.numberOfImages = drawables.length;
			result.fillColor = fillColor;
			result.mimeType = mimeType;
			result.quality = quality;
			result.imageSmoothingQuality = imageSmoothingQuality;
			result.imageSmoothingEnabled = imageSmoothingEnabled;

			recursiveFunc();

			var drawResults = [];
			function recursiveFunc() {
				if (count < index) {
					drawImage(canvas, drawables[count].id, function(err) {
						drawResults.push({
							err: err,
							res: drawables[count]
						});
						count++;
						recursiveFunc();
					});
				} else {
					ctx.imageSmoothingQuality = imageSmoothingQuality;
					ctx.imageSmoothingEnabled = imageSmoothingEnabled;
					ctx.restore();

					result.states = drawResults;
					result.file = canvas.toDataURL(mimeType, quality);

					if (config.draw) {
						config.draw(null, result);
					}
					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		myObject.drawTo = function(options, cb){
			/*!
			 * options keys => width, quality, mimeType, fillColor, filename, smoothingQuality, smoothingEnabled
			 */

			if (
				typeof(options) !== "object" ||
				options === null
			) {
				if (config.draw) {
					config.draw("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			var drawAspectRatio = canvasState.originalWidth / canvasState.originalHeight;
			var drawWidth = options.width || options.drawWidth || canvasState.originalWidth;
			var drawHeight = drawWidth / drawAspectRatio;
			var quality = options.quality || options.drawQuality || config.drawQuality;
			var mimeType = options.mimeType || options.drawMimeType || config.drawMimeType;
			var fillColor = options.fillColor || options.drawFillColor || config.drawFillColor;
			var imageSmoothingQuality = options.smoothingQuality || options.imageSmoothingQuality || config.drawSmoothingQuality;
			var imageSmoothingEnabled = options.smoothingQuality || options.imageSmoothingEnabled || config.drawSmoothingEnabled;

			var drawOption = {
				width: drawWidth,
				height: drawHeight,
				maxWidth: config.maxDrawWidth || 9999,
				maxHeight: config.maxDrawHeight || 9999,
				minWidth: config.minDrawWidth || 0,
				minHeight: config.minDrawHeight || 0,
				fillColor: fillColor
			}

			var canvas = drawCanvas(drawOption);
			if (!canvas) {
				if (config.draw) {
					config.draw("`drawCanvas()` error");
				}
				if (cb) {
					cb("`drawCanvas()` error");
				}
				return false;
			}
			var ctx = canvas.getContext("2d");

			var drawables = [];
			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawable) {
					drawables.push(imageStates[i]);
				}
			}

			var index = drawables.length;
			var count = 0;
			var result = {};
			var drawResults = [];

			result.width = canvas.width;
			result.height = canvas.height;
			result.numberOfImages = drawables.length;
			result.fillColor = fillColor;
			result.mimeType = mimeType;
			result.quality = quality;
			result.imageSmoothingQuality = imageSmoothingQuality;
			result.imageSmoothingEnabled = imageSmoothingEnabled;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// recursive
					drawImage(canvas, drawables[count].id, function(err) {
						drawResults.push({
							err: err,
							res: drawables[count]
						});
						count++;
						recursiveFunc();
					});
				} else {
					// end
					ctx.imageSmoothingQuality = imageSmoothingQuality;
					ctx.imageSmoothingEnabled = imageSmoothingEnabled;
					ctx.restore();

					result.states = drawResults;
					result.file = canvas.toDataURL(mimeType, quality);

					if (config.draw) {
						config.draw(null, result);
					}
					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		myObject.download = function(cb){
			var drawWidth = canvasState.originalWidth;
			var drawHeight = canvasState.originalHeight;
			var quality = config.drawQuality;
			var mimeType = config.drawMimeType;
			var imageSmoothingQuality = config.drawSmoothingQuality;
			var imageSmoothingEnabled = config.drawSmoothingEnabled;
			var fillColor = config.drawFillColor;
			var filename = config.filename || "Untitled";
			filename += "." + mimeType.split("/")[1];

			var drawOption = {
				width: drawWidth,
				height: drawHeight,
				maxWidth: config.maxDrawWidth || 9999,
				maxHeight: config.maxDrawHeight || 9999,
				minWidth: config.minDrawWidth || 0,
				minHeight: config.minDrawHeight || 0,
				fillColor: fillColor
			}

			var canvas = drawCanvas(drawOption);
			if (!canvas) {
				if (cb) {
					cb("`drawCanvas()` error");
				}
				return false;
			}
			var ctx = canvas.getContext("2d");

			var drawables = [];
			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawable) {
					drawables.push(imageStates[i]);
				}
			}

			var index = drawables.length;
			var count = 0;
			var result = {};
			var drawResults = [];

			result.filename = filename;
			result.width = canvas.width;
			result.height = canvas.height;
			result.numberOfImages = drawables.length;
			result.fillColor = fillColor;
			result.mimeType = mimeType;
			result.quality = quality;
			result.imageSmoothingQuality = imageSmoothingQuality;
			result.imageSmoothingEnabled = imageSmoothingEnabled;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// draw image
					drawImage(canvas, drawables[count].id, function(err) {
						drawResults.push({
							err: err,
							res: drawables[count]
						});
						count++;
						recursiveFunc();
					});
				} else {
					// end
					ctx.imageSmoothingQuality = imageSmoothingQuality;
					ctx.imageSmoothingEnabled = imageSmoothingEnabled;
					ctx.restore();

					result.states = drawResults;

					var file = canvas.toDataURL(mimeType, quality);

					var link = document.createElement('a');
					link.setAttribute('href', file);
					link.setAttribute('download', filename);
					link.style.display = "none";

					document.body.appendChild(link);

					link.click();

					document.body.removeChild(link);

					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		myObject.downloadTo = function(options, cb){
			/*!
			 * options keys => width, quality, mimeType, fillColor, filename, smoothingQuality, smoothingEnabled
			 */
			if (
				typeof(options) !== "object" ||
				options === null
			) {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			var drawAspectRatio = canvasState.originalWidth / canvasState.originalHeight;
			var drawWidth = options.width || options.drawWidth || canvasState.originalWidth;
			var drawHeight = drawWidth / drawAspectRatio;
			var quality = options.quality || options.drawQuality || config.drawQuality;
			var mimeType = options.mimeType || options.drawMimeType || config.drawMimeType;
			var fillColor = options.fillColor || options.drawFillColor || config.drawFillColor;
			var imageSmoothingQuality = options.smoothingQuality || options.imageSmoothingQuality || config.drawSmoothingQuality;
			var imageSmoothingEnabled = options.smoothingQuality || options.imageSmoothingEnabled || config.drawSmoothingEnabled;
			var filename = options.filename || config.filename || "Untitled";
			filename += "." + mimeType.split("/").pop();

			var drawOption = {
				width: drawWidth,
				height: drawHeight,
				maxWidth: config.maxDrawWidth || 9999,
				maxHeight: config.maxDrawHeight || 9999,
				minWidth: config.minDrawWidth || 0,
				minHeight: config.minDrawHeight || 0,
				fillColor: fillColor
			}

			var canvas = drawCanvas(drawOption);
			if (!canvas) {
				if (cb) {
					cb("`drawCanvas()` error");
				}
				return false;
			}
			var ctx = canvas.getContext("2d");

			var drawables = [];
			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawable) {
					drawables.push(imageStates[i]);
				}
			}

			var index = drawables.length;
			var count = 0;
			var result = {};
			var drawResults = [];

			result.filename = filename;
			result.width = canvas.width;
			result.height = canvas.height;
			result.numberOfImages = drawables.length;
			result.fillColor = fillColor;
			result.mimeType = mimeType;
			result.quality = quality;
			result.imageSmoothingQuality = imageSmoothingQuality;
			result.imageSmoothingEnabled = imageSmoothingEnabled;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// draw image
					drawImage(canvas, drawables[count].id, function(err) {
						drawResults.push({
							err: err,
							res: drawables[count]
						});
						count++;
						recursiveFunc();
					});
				} else {
					// end
					ctx.imageSmoothingQuality = imageSmoothingQuality;
					ctx.imageSmoothingEnabled = imageSmoothingEnabled;
					ctx.restore();

					result.states = drawResults;

					var file = canvas.toDataURL(mimeType, quality);

					var link = document.createElement('a');
					link.setAttribute('href', file);
					link.setAttribute('download', filename);
					link.style.display = "none";

					document.body.appendChild(link);

					link.click();

					document.body.removeChild(link);

					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		myObject.freeze = function(cb){
			if (onFreeze === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			if (eventState.target) {
				var oldId = getIdBySource(eventState.target);
				var res = setFocusOut(oldId);
				if (!res) {
					if (cb) {
						cb("`setFocusOut()` error");
					}
					return false;
				}
			}

			config.editable = false;
			onFreeze = true;

			// set bg
			canvasElement.style.backgroundColor = config.drawFillColor;
			canvasElement.classList.remove("checker");

			if (cb) {
				cb(null);
			}
		}

		myObject.escapeFreeze = function(cb){
			if (onFreeze === false) {
				if (cb) {
					cb("No progress in");
				}
				return false;
			}

			config.editable = true;
			onFreeze = false;

			// unset bg
			canvasElement.style.backgroundColor = "";
			canvasElement.classList.add("checker");

			if (cb) {
				cb(null);
			}
		}

		myObject.this = function(cb){
			if (!eventState.target) {
				if (cb) {
					cb("Target not found");
				}
				return false;
			}

			var id = getIdBySource(eventState.target);

			if (cb) {
				cb(null, id);
			}
			return id;
		}

		myObject.getThis = function(cb){
			if (!eventState.target) {
				if (cb) {
					cb("Target not found");
				}
				return false;
			}

			var id = getIdBySource(eventState.target);
			var state = getStateById(id);

			var tmp = {};
			copyObject(state, tmp);

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getThisData = function(cb){
			if (!eventState.target) {
				if (cb) {
					cb("Target not found");
				}
				return false;
			}

			var id = getIdBySource(eventState.target);
			var state = getStateById(id);

			var scaleRatio = canvasState.width / canvasState.originalWidth;
			var aspectRatio = state.width / state.height;
			var tmp = getCalculatedState(state);

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getConfigData = function(cb){
			var tmp = {};
			copyObject(config, tmp);
			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getContainerData = function(cb){
			var tmp = {};
			copyObject(containerState, tmp);
			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getCanvasData = function(cb){
			var tmp = {};
			copyObject(canvasState, tmp);
			tmp.backgroundColor = config.drawFillColor;

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getImageData = function(id, cb){
			var state = getStateById(id);
			if (!state) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var tmp = getCalculatedState(state);

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getImageDataAll = function(cb){
			var tmpStates = [];
			var scaleRatio = canvasState.width / canvasState.originalWidth;
			imageStates.forEach(function(state){
				tmpStates.push(getCalculatedState(state));
			});

			if (cb) {
				cb(null, tmpStates);
			}
			return tmpStates;
		}

		myObject.undo = function(cb){
			if (eventCaches.length < 1) {
				if (cb) {
					cb("Cache is empty");
				}
				return false;
			}
			var recent = eventCaches.pop();
			var source = getSourceById(recent.id);
			var clone = getCloneById(recent.id);
			var state = getStateById(recent.id);

			pushSubCache(recent.id);

			source.className = recent.sourceClass.join(" ");
			clone.className = recent.cloneClass.join(" ");
			copyObject(recent.state, state);

			setElement(source, state);
			setElement(clone, state);

			var res = setIndex();
			if (!res) {
				if (cb) {
					cb("`setIndex()` error");
				}
				return false;
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.redo = function(cb){
			if (eventSubCaches.length < 1) {
				if (config.redo) {
					config.redo("Cache is empty");
				}
				if (cb) {
					cb("Cache is empty");
				}
				return false;
			}
			var recent = eventSubCaches.pop();
			var source = getSourceById(recent.id);
			var clone = getCloneById(recent.id);
			var state = getStateById(recent.id);

			pushCache(recent.id);

			source.className = recent.sourceClass.join(" ");
			clone.className = recent.cloneClass.join(" ");
			copyObject(recent.state, state);

			setElement(source, state);
			setElement(clone, state);

			var res = setIndex();
			if (!res) {
				if (cb) {
					cb("`setIndex()` error");
				}
				return false;
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.destroy = function(cb){

			window.removeEventListener("resize", handlers.resizeWindow, false);

			containerElement.parentNode.removeChild(containerElement);

			config = {};

			copyObject(defaultConfiguration, config);

			eventState = {};
			eventCaches = [];
			eventSubCaches = [];
			containerState = {};
			canvasState = {};
			imageStates = [];

			containerElement = undefined;
			canvasElement = undefined;
			mirrorElement = undefined;

			sourceElements = [];
			cloneElements = [];
				
			isInitialized = false;

			onUpload = false;
			onMove = false;
			onZoom = false;
			onResize = false;
			onRotate = false;
			onFlip = false;
			onFreeze = false;

			sourceId = "canvaaas-" + getShortId() + "-";
			cloneId = "canvaaas-" + getShortId() + "-";

			if (cb) {
				cb(null, true);
			}
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