/*!
 * 
 * canvaaas.js
 * 
 * 0.1.5
 * 
 * eeecheol@gmail.com
 * 
 */

(function(window){
	'use strict';

	function canvaaas() {

		var myObject = {};

		var defaultConfig = {

			filename: undefined, // string

			allowedExtensions: [
				"jpg",
				"jpeg",
				"png",
				"webp",
				"gif",
				"svg",
				"svg+xml",
				"tiff",
				"tif"
			], // string, jpg, jpeg, ,gif, png, webp, svg...

			dropSpace: "document", // undefined, canvas, document

			editable: true, // boolean

			initChecker: true, // boolean

			magneticRange: 5, // number, px

			maxNumberOfImages: 999, // number

			cacheLevels: 999, // number

			containerAspectRatio: undefined, // width / height

			minContainerWidth: 0, // number, px

			minContainerHeight: 0, // number, px

			maxContainerWidth: 1, // number, px, (0 ~ 1) => viewportWidth * (0 ~ 1)

			maxContainerHeight: 0.7, // number, px, (0 ~ 1) => viewportHeight * (0 ~ 1)

			initCanvasWidth: undefined, // number, px

			initCanvasHeight: undefined, // number, px

			minCanvasWidth: 64, // number, px

			minCanvasHeight: 64, // number, px

			maxCanvasWidth: 4096, // number, px, for Mobile

			maxCanvasHeight: 4096, // number, px, for Mobile

			minImageWidth: 64, // number, px

			minImageHeight: 64, // number, px

			minImageRenderWidth: 0.2, //number,  0 ~ 1

			minImageRenderHeight: 0.2, // number, 0 ~ 1

			maxImageRenderWidth: 1, // number, 0 ~ 1

			maxImageRenderHeight: 1, // number, 0 ~ 1

			upload: undefined, // callback function

			draw: undefined, // callback function

			focusIn: undefined, // callback function

			focusOut: undefined, // callback function

			index: undefined, // callback function

			move: undefined, // callback function

			resize: undefined, // callback function

			rotate: undefined, // callback function

			flip: undefined, // callback function

			opacity: undefined, // callback function
		};

		Object.freeze(defaultConfig);

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
		var onDraw = false;

		var conatinerTemplate = "";
		conatinerTemplate += "<div class='canvaaas'>";
		conatinerTemplate += "<div class='canvaaas-mirror'></div>";
		conatinerTemplate += "<div class='canvaaas-canvas'></div>";
		conatinerTemplate += "</div>";

		var imageTemplate = "";
		imageTemplate += "<img>";
		imageTemplate += "<div class='canvaaas-overlay'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-top'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-bottom'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-left'></div>";
		imageTemplate += "<div class='canvaaas-innerline canvaaas-innerline-right'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-top'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-bottom'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-left'></div>";
		imageTemplate += "<div class='canvaaas-outline canvaaas-outline-right'></div>";
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
		var undoCaches = [];
		var redoCaches = [];
		var containerState = {};
		var canvasState = {};
		var imageStates = [];

		var containerObject;
		var canvasObject;
		var mirrorObject;
		var imageObjects = [];

		var windowScrollEvent;
		var windowResizeEvent;

		copyObject(config, defaultConfig);

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
						renderObject(files[count], function(err, res) {
							if (err) {
								if (config.upload) {
									config.upload(err);
								}
							} else {
								if (config.upload) {
									config.upload(null, res);
								}
							}
							count++;
							recursiveFunc();
						});
					} else {
						onUpload = false;
					}
				}
			},

			isOutside: function(e) {
				if (onMove === true) {
					if (e.touches !== undefined) {
						if (e.touches.length === 2) {
							handlers.startPinchZoom(e);
							return false;
						}
					}
				}

				if (
					e.target.tagName === "BUTTON" ||
					e.target.tagName === "INPUT" ||
					e.target.tagName === "LABEL" ||
					e.target.tagName === "TEXTAREA" ||
					e.target.tagName === "SELECT" ||
					e.target.tagName === "OPTION" ||
					e.target.tagName === "A"
				) {
					return false;
				}

				e.preventDefault();
				e.stopPropagation();

				if (
					!e.target.classList.contains("canvaaas-image") &&
					!e.target.classList.contains("canvaaas-clone")
				) {
					if (eventState.target) {
						var id = getIdByObject(eventState.target);
						setFocusOut(id);

						if (config.focusOut) {
							config.focusOut(null, id);
						}
					}
				}
			},

			keydown: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var clone = getCloneByObject(source);
				var state = getStateByObject(source);

				if (!config.editable) {
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
				var canvasL = halfWidth;
				var canvasT = halfHeight;
				var canvasR = canvasState.width - halfWidth;
				var canvasB = canvasState.height - halfHeight;
				var axisX = state.x;
				var axisY = state.y;

				if (e.keyCode == '38') {
					// up arrow
					axisY -= 10;
					if (e.shiftKey) {
						axisY = canvasT;
					}
				} else if (e.keyCode == '40') {
					// down arrow
					axisY += 10;
					if (e.shiftKey) {
						axisY = canvasB;
					}
				} else if (e.keyCode == '37') {
					// left arrow
					axisX -= 10;
					if (e.shiftKey) {
						axisX = canvasL;
					}
				} else if (e.keyCode == '39') {
					// right arrow
					axisX += 10;
					if (e.shiftKey) {
						axisX = canvasR;
					}
				} else {
					return false;
				}

				// check magnetic
				if (config.magneticRange !== 0) {
					if (
						axisX > canvasR - config.magneticRange &&
						axisX < canvasR + config.magneticRange
					) {
						axisX = canvasR;
					}
					if (
						axisX > canvasL - config.magneticRange &&
						axisX < canvasL + config.magneticRange 
					) {
						axisX = canvasL;
					}
					if (
						axisY > canvasB - config.magneticRange &&
						axisY < canvasB + config.magneticRange
					) {
						axisY = canvasB;
					}
					if (
						axisY > canvasT - config.magneticRange &&
						axisY < canvasT + config.magneticRange 
					) {
						axisY = canvasT;
					}
				}

				// save cache
				pushUndoCache(state.id, true);

				// save state
				setState(state, {
					x: axisX,
					y: axisY
				});

				// adjust state
				setObject(source, state);
				setObject(clone, state);

				if (config.move) {
					config.move(null, state.id);
				}
			},

			startFocusIn: function(e) {
				if (!config.editable) {
					return false;
				}

				if (onMove === true) {
					return false;
				}

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
				var state = getStateByObject(source);

				if (!source || !state) {
					return false;
				}

				if (!state.focusable) {
					return false;
				}

				if (eventState.target) {
					if (source.isSameNode(eventState.target)) {
						return false;
					}

					var oldId = getIdByObject(eventState.target);
					setFocusOut(oldId);

					if (config.focusOut) {
						config.focusOut(null, oldId);
					}
				}

				setFocusIn(state.id);

				handlers.startMove(e);

				if (config.focusIn) {
					config.focusIn(null, state.id);
				}
			},

			startMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var clone = getCloneByObject(source);
				var state = getStateByObject(source);
				var mouseX;
				var mouseY;
				var rotatedRect;
				var halfWidth;
				var halfHeight;

				if (!config.editable) {
					return false;
				}

				if (!source || !state || !clone) {
					return false;
				}

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
					return handlers.startPinchZoom(e);
				}

				// calculate rotate rect
				rotatedRect = getRotatedRect(state.width, state.height, state.rotate);
				halfWidth = 0.5 * rotatedRect[0];
				halfHeight = 0.5 * rotatedRect[1];

				// save initial data
				eventState.initialX = state.x;
				eventState.initialY = state.y;
				eventState.canvasL = halfWidth;
				eventState.canvasT = halfHeight;
				eventState.canvasR = canvasState.width - halfWidth;
				eventState.canvasB = canvasState.height - halfHeight;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;

				// toggle
				onMove = true;

				// save cache
				pushUndoCache(state.id, true);

				// add event handles
				document.addEventListener("mousemove", handlers.onMove, false);
				document.addEventListener("mouseup", handlers.endMove, false);

				document.addEventListener("touchmove", handlers.onMove, false);
				document.addEventListener("touchend", handlers.endMove, false);
			},

			onMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var state = getStateByObject(source);
				var clone = getCloneByObject(source);
				var mouseX;
				var mouseY;
				var axisX;
				var axisY;

				if (!onMove) {
					return false;
				}

				if (!source || !state || !clone) {
					return false;
				}

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - eventState.mouseX;
					mouseY = e.clientY - eventState.mouseY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - eventState.mouseX;
					mouseY = e.touches[0].clientY - eventState.mouseY;
				} else {
					return false;
				}

				axisX = eventState.initialX + mouseX;
				axisY = eventState.initialY + mouseY;

				// check magnetic
				if (config.magneticRange !== 0) {
					if (
						axisX > eventState.canvasR - config.magneticRange &&
						axisX < eventState.canvasR + config.magneticRange
					) {
						axisX = eventState.canvasR;
					}
					if (
						axisY > eventState.canvasB - config.magneticRange &&
						axisY < eventState.canvasB + config.magneticRange
					) {
						axisY = eventState.canvasB;
					}
					if (
						axisX > eventState.canvasL - config.magneticRange &&
						axisX < eventState.canvasL + config.magneticRange
					) {
						axisX = eventState.canvasL;
					}
					if (
						axisY > eventState.canvasT - config.magneticRange &&
						axisY < eventState.canvasT + config.magneticRange
					) {
						axisY = eventState.canvasT;
					}
				}

				// save state
				setState(state, {
					x: axisX,
					y: axisY
				});

				// adjust state
				setObject(source, state);
				setObject(clone, state);

				if (config.move) {
					config.move(null, state.id);
				}
			},

			endMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var clone = getCloneByObject(source);
				var state = getStateByObject(source);

				// if (!source || !state || !clone) {
				// 	return false;
				// }

				// toggle off
				onMove = false;

				// remove event handles
				document.removeEventListener("mousemove", handlers.onMove, false);
				document.removeEventListener("mouseup", handlers.endMove, false);

				document.removeEventListener("touchmove", handlers.onMove, false);
				document.removeEventListener("touchend", handlers.endMove, false);
			},

			startRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var handle = e.target;
				var source = eventState.target;
				var clone = getCloneByObject(source);
				var state = getStateByObject(source);
				var mouseX;
				var mouseY;
				var axisX;
				var axisY;
				var deg;

				if (!config.editable) {
					return false;
				}

				if (!source || !state || !clone) {
					return false;
				}

				if (!state.editable) {
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

				// calculate mouse point
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
				eventState.handle = handle;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;
				eventState.initialR = state.rotate;
				eventState.initialD = deg;

				// toggle on
				onRotate = true;

				// save cache
				pushUndoCache(state.id, true);

				// add event handles
				document.addEventListener("mousemove", handlers.onRotate, false);
				document.addEventListener("mouseup", handlers.endRotate, false);

				document.addEventListener("touchmove", handlers.onRotate, false);
				document.addEventListener("touchend", handlers.endRotate, false);
			},

			onRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var state = getStateByObject(source);
				var clone = getCloneByObject(source);
				var mouseX;
				var mouseY;
				var axisX;
				var axisY;
				var deg;
				var rotate;
				// var onShiftKey = false;

				if (!onRotate) {
					return false;
				}

				if (!source || !state || !clone) {
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

				// if (e.shiftKey) {
				// 	onShiftKey = true;
				// }

				// calculate mouse point
				axisX = mouseX - state.x;
				axisY = state.y - mouseY;

				deg = getDegrees(axisX, axisY);

				if (state.scaleX < 0) {
					deg = 360 - deg;
				}
				if (state.scaleY < 0) {
					deg = 180 - deg;
				}

				rotate = eventState.initialR + (deg - eventState.initialD);
				// rotate = rotate % 360;

				// if (onShiftKey === true) {
				// 	var overflow = rotate % 45;
				// 	if (overflow > 22.5) {
				// 		rotate = rotate - overflow - 45;
				// 	} else {
				// 		rotate = rotate - overflow;
				// 	}
				// }

				// save state
				setState(state, {
					rotate: rotate
				});

				// adjust state
				setObject(source, state);
				setObject(clone, state);

				if (config.rotate) {
					config.rotate(null, state.id);
				}
			},

			endRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var state = getStateByObject(source);
				var clone = getCloneByObject(source);

				// if (!source || !state || !clone) {
				// 	return false;
				// }

				// toggle off
				onRotate = false;

				document.removeEventListener("mousemove", handlers.onRotate, false);
				document.removeEventListener("mouseup", handlers.endRotate, false);

				document.removeEventListener("touchmove", handlers.onRotate, false);
				document.removeEventListener("touchend", handlers.endRotate, false);
			},

			startResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var handle = e.target;
				var source = eventState.target;
				var clone = getCloneByObject(source);
				var state = getStateByObject(source);
				var mouseX;
				var mouseY;
				var flipX;
				var flipY;
				var dire;
				var direction;
				var maxSizes;
				var minSizes;

				if (!config.editable) {
					return false;
				}

				if (!source || !clone || !state) {
					return false;
				}

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

				maxSizes = getFittedRect(
					config.maxImageWidth || 99999,
					config.maxImageHeight || 99999,
					state.originalWidth / state.originalHeight
				);

				minSizes = getFittedRect(
					config.minImageWidth || 0,
					config.minImageHeight || 0,
					state.originalWidth / state.originalHeight,
					"cover"
				);

				// save initial data
				eventState.direction = direction;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;
				eventState.initialW = state.width;
				eventState.initialH = state.height;
				eventState.initialX = state.x;
				eventState.initialY = state.y;
				eventState.maxW = maxSizes[0];
				eventState.maxH = maxSizes[1];
				eventState.minW = minSizes[0];
				eventState.minH = minSizes[1];

				// toggle on
				onResize = true;

				// save cache
				pushUndoCache(state.id, true);

				// add event handles
				document.addEventListener("mousemove", handlers.onResize, false);
				document.addEventListener("mouseup", handlers.endResize, false);

				document.addEventListener("touchmove", handlers.onResize, false);
				document.addEventListener("touchend", handlers.endResize, false);
			},

			onResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var direction = eventState.direction;
				var source = eventState.target;
				var state = getStateByObject(source);
				var clone = getCloneByObject(source);
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

				if (!onResize) {
					return false;
				}

				if (!source || !state || !clone) {
					return false;
				}

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - eventState.mouseX;
					mouseY = e.clientY - eventState.mouseY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - eventState.mouseX;
					mouseY = e.touches[0].clientY - eventState.mouseY;
				} else {
					return false;
				}

				if (state.lockAspectRatio || e.shiftKey) {
					onShiftKey = true;
				}

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
					if (!onShiftKey) {
						height -= diffY;

						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else {
						height -= diffY;
						width = height * aspectRatio;

						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					}
				} else if (direction === "ne") {
					if (!onShiftKey) {
						width += diffX;
						height -= diffY;

						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else {
						if (2 * diffX < 2 * -diffY * aspectRatio) {
							height -= diffY * 2;
							width = height * aspectRatio;
						} else {
							width += diffX * 2;
							height = width / aspectRatio;
						}
					}
				} else if (direction === "e") {
					if (!onShiftKey) {
						width += diffX;

						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					} else {
						width += diffX;
						height = width / aspectRatio;

						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					}
				} else if (direction === "se") {
					if (!onShiftKey) {
						width += diffX;
						height += diffY;

						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else {
						if (2 * diffX < 2 * diffY * aspectRatio) {
							height += 2 * diffY;
							width = height * aspectRatio;
						} else {
							width += 2 * diffX;
							height = width / aspectRatio;
						}
					}
				} else if (direction === "s") {
					if (!onShiftKey) {
						height += diffY;

						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else {
						height += diffY;
						width = height * aspectRatio;

						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					}
				} else if (direction === "sw") {
					if (!onShiftKey) {
						width -= diffX;
						height += diffY;

						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else {
						if (2 * -diffX < 2 * diffY * aspectRatio) {
							height += 2 * diffY;
							width = height * aspectRatio;
						} else {
							width -= 2 * diffX;
							height = width / aspectRatio;
						}
					}
				} else if (direction === "w") {
					if (!onShiftKey) {
						width -= diffX;

						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					} else {
						width -= diffX;
						height = width / aspectRatio;

						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					}
				} else if (direction === "nw") {
					if (!onShiftKey) {
						width -= diffX;
						height -= diffY;

						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else {
						if (2 * -diffX < 2 * -diffY * aspectRatio) {
							height -= 2 * diffY;
							width = height * aspectRatio;
						} else {
							width -= 2 * diffX;
							height = width / aspectRatio;
						}
					}
				} else {
					return false;
				}

				if (width < eventState.minW) {
					return false;
				}
				if (width > eventState.maxW) {
					return false;
				}
				if (height < eventState.minH) {
					return false;
				}
				if (height > eventState.maxH) {
					return false;
				}

				// save state
				setState(state, {
					x: axisX,
					y: axisY,
					width: width,
					height: height
				});

				// adjust state
				setObject(source, state);
				setObject(clone, state);

				if (config.resize) {
					config.resize(null, state.id);
				}
			},

			endResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var clone = getCloneByObject(source);
				var state = getStateByObject(source);

				// if (!source || !state || !clone) {
				// 	return false;
				// }

				// toggle off
				onResize = false;

				// remove event handles
				document.removeEventListener("mousemove", handlers.onResize, false);
				document.removeEventListener("mouseup", handlers.endResize, false);

				document.removeEventListener("touchmove", handlers.onResize, false);
				document.removeEventListener("touchend", handlers.endResize, false);
			},

			startWheelZoom: function(e){
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var state = getStateByObject(source);
				var clone = getCloneByObject(source);
				var ratio;
				var diffX;
				var diffY;
				var width;
				var height;
				var minW;
				var maxW;
				var minH;
				var maxH;
				var minSizes;
				var maxSizes;

				if (!config.editable) {
					return false;
				}

				if (
					onMove === true || 
					onResize === true || 
					onRotate === true 
				) {
					return false;
				}

				if (!source || !state || !clone) {
					return false;
				}

				if (!state.editable) {
					return false;
				}

				maxSizes = getFittedRect(
					config.maxImageWidth || 99999,
					config.maxImageHeight || 99999,
					state.originalWidth / state.originalHeight
				);

				minSizes = getFittedRect(
					config.minImageWidth || 0,
					config.minImageHeight || 0,
					state.originalWidth / state.originalHeight,
					"cover"
				);

				maxW = maxSizes[0];
				maxH = maxSizes[1];
				minW = minSizes[0];
				minH = minSizes[1];

				ratio = -e.deltaY * 0.001;
				diffX = state.width * ratio;
				diffY = state.height * ratio;
				width = state.width + diffX;
				height = state.height + diffY;

				if (!onZoom) {
					// toggle on
					onZoom = true;

					// save cache
					pushUndoCache(state.id, true);
				}

				// add timer
				clearTimeout(eventState.wheeling);

				if (width < minW) {
					width = minW;
				}
				if (width > maxW) {
					width = maxW;
				}
				if (height < minH) {
					height = minH;
				}
				if (height > maxH) {
					height = maxH;
				}

				// save state
				setState(state, {
					width: width,
					height: height
				});

				// adjust state
				setObject(source, state);
				setObject(clone, state);

				if (config.resize) {
					config.resize(null, state.id);
				}

				eventState.wheeling = setTimeout(function() {
					// remove timer
					eventState.wheeling = undefined;

					// toggle off
					onZoom = false;
				}, 300);
			},

			startPinchZoom: function(e){
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var state = getStateByObject(source);
				var clone = getCloneByObject(source);
				var diagonal;
				var mouseX;
				var mouseY;
				var maxSizes;
				var minSizes;

				if (onMove === true) {
					handlers.endMove(e)
				}

				if (!config.editable) {
					return false;
				}

				if (!source || !state || !clone) {
					return false;
				}

				if (!state.editable) {
					return false;
				}

				mouseX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
				mouseY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
				diagonal = getDiagonal(mouseX, mouseY);

				maxSizes = getFittedRect(
					config.maxImageWidth || 99999,
					config.maxImageHeight || 99999,
					state.originalWidth / state.originalHeight
				)

				minSizes = getFittedRect(
					config.minImageWidth || 0,
					config.minImageHeight || 0,
					state.originalWidth / state.originalHeight,
					"cover"
				)

				// save initial data
				eventState.diagonal = diagonal;
				eventState.initialW = state.width;
				eventState.initialH = state.height;
				eventState.maxW = maxSizes[0];
				eventState.maxH = maxSizes[1];
				eventState.minW = minSizes[0];
				eventState.minH = minSizes[1];

				// toggle on
				onZoom = true;

				// save cache
				pushUndoCache(state.id, true);

				// add event handles
				document.addEventListener("touchmove", handlers.onPinchZoom, false);
				document.addEventListener("touchend", handlers.endPinchZoom, false);
			},

			onPinchZoom: function(e){
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var state = getStateByObject(source);
				var clone = getCloneByObject(source);
				var diagonal;
				var mouseX;
				var mouseY;
				var width;
				var height;
				var ratio;
				var maxW = eventState.maxW;
				var maxH = eventState.maxH;
				var minW = eventState.minW;
				var minH = eventState.minH;

				if (!onZoom) {
					return false;
				}

				if (!source || !state || !clone) {
					return false;
				}

				if (e.touches.length !== 2) {
					return false;
				}

				mouseX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
				mouseY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
				diagonal = getDiagonal(mouseX, mouseY);
				ratio = 1 + ((diagonal - eventState.diagonal) * 0.01);

				width = eventState.initialW * ratio;
				height = eventState.initialH * ratio;

				if (width < minW) {
					width = minW;
				}
				if (width > maxW) {
					width = maxW;
				}
				if (height < minH) {
					height = minH;
				}
				if (height > maxH) {
					height = maxH;
				}

				// save state
				setState(state, {
					width: width,
					height: height
				});

				// adjust state
				setObject(source, state);
				setObject(clone, state);

				if (config.resize) {
					config.resize(null, state.id);
				}
			},

			endPinchZoom: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var source = eventState.target;
				var state = getStateByObject(source);
				var clone = getCloneByObject(source);

				// if (!source || !state || !clone) {
				// 	return false;
				// }

				// toggle off
				onZoom = false;

				// remove event handles
				document.removeEventListener("touchmove", handlers.onPinchZoom, false);
				document.removeEventListener("touchend", handlers.endPinchZoom, false);

				handlers.startMove(e);
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

			whereContainer: function(e){
				if (!isInitialized) {
					return false;
				}

				if (!containerObject || !containerState) {
					return false;
				}

				var containerOffset = containerObject.getBoundingClientRect();
				containerState.left = containerOffset.left;
				containerState.top = containerOffset.top;
			},

			resizeWindow: function(e){
				e.preventDefault();
				e.stopPropagation();

				if (!isInitialized) {
					return false;
				}

				var oldWidth = containerObject.offsetWidth;

				initContainer();

				var newWidth = containerState.width;
				var scaleRatio = newWidth / oldWidth;

				initCanvas();

				imageStates.forEach(function(state){
					var source = getSourceById(state.id);
					var clone = getCloneById(state.id);

					if (!source || !clone) {
						return;
					}

					// save state
					setState(state, {
						x: state.x * scaleRatio,
						y: state.y * scaleRatio,
						width: state.width * scaleRatio,
						height: state.height * scaleRatio
					});

					// adjust state
					setObject(source, state);
					setObject(clone, state);

					// if (config.move) {
					// 	config.move(null, state.id);
					// }
					// if (config.resize) {
					// 	config.resize(null, state.id);
					// }
				});
			},

		};

		// 
		// methods
		// 

		function setState(state, additionalState){
			if (
				typeof(state) !== "object" ||
				state === null || 
				typeof(additionalState) !== "object" ||
				additionalState === null
			) {
				return false;
			}

			var newId;
			if (additionalState.id) {
				newId = additionalState.id;			
			} else if (additionalState._id) {
				newId = additionalState._id;
			}

			if (newId) {
				if (typeof(newId) === "string") {
					newId = newId;
				} else if (typeof(newId) === "number") {
					newId = "" + newId;
				}

				newId = newId.trim();

				if (
					newId !== "" &&
					newId.length > 0
				) {
					if (!existsId(newId)) {
						changeId(state.id, newId);
					}
				}	
			}

			if (isNumeric(additionalState.originalWidth)) {
				state.originalWidth = parseFloat(additionalState.originalWidth);
			}

			if (isNumeric(additionalState.originalHeight)) {
				state.originalHeight = parseFloat(additionalState.originalHeight);
			}

			if (isNumeric(additionalState.index)) {
				state.index = parseFloat(additionalState.index);
			}

			if (isNumeric(additionalState.width)) {
				state.width = parseFloat(additionalState.width);
			}

			if (isNumeric(additionalState.height)) {
				state.height = parseFloat(additionalState.height);
			}

			if (isNumeric(additionalState.left)) {
				state.left = parseFloat(additionalState.left);
			}

			if (isNumeric(additionalState.top)) {
				state.top = parseFloat(additionalState.top);
			}

			if (isNumeric(additionalState.x)) {
				state.x = parseFloat(additionalState.x);
			}

			if (isNumeric(additionalState.y)) {
				state.y = parseFloat(additionalState.y);
			}

			if (isNumeric(additionalState.rotate)) {
				state.rotate = parseFloat(additionalState.rotate);
			}

			if (isNumeric(additionalState.scaleX)) {
				if (parseFloat(additionalState.scaleX) > 0) {
					state.scaleX = 1;
				} else {
					state.scaleX = -1;
				}
			}

			if (isNumeric(additionalState.scaleY)) {
				if (parseFloat(additionalState.scaleY) > 0) {
					state.scaleY = 1;
				} else {
					state.scaleY = -1;
				}
			}

			if (isNumeric(additionalState.opacity)) {
				if (parseFloat(additionalState.opacity) > 1) {
					state.opacity = 1;
				} else if (parseFloat(additionalState.opacity) < 0) {
					state.opacity = 0;
				} else {
					state.opacity = parseFloat(additionalState.opacity);
				}
			}

			if (typeof(additionalState.lockAspectRatio) === "boolean") {
				state.lockAspectRatio = additionalState.lockAspectRatio;
			}

			if (typeof(additionalState.focusable) === "boolean") {
				state.focusable = additionalState.focusable;
			}

			if (typeof(additionalState.editable) === "boolean") {
				state.editable = additionalState.editable;
			}

			if (typeof(additionalState.drawable) === "boolean") {
				state.drawable = additionalState.drawable;
			}

			return true;
		}

		function setObject(elem, state) {
			if (
				typeof(elem) !== "object" ||
				elem === null
			) {
				return false;
			}

			if (
				typeof(state) !== "object" ||
				state === null
			) {
				return false;
			}

			var left,
				top,
				width,
				height,
				opacity,
				index,
				transform = "";

			left = ( state.x - (state.width * 0.5) ) + "px";
			top = ( state.y - (state.height * 0.5) ) + "px";
			width = state.width + "px";
			height = state.height + "px";
			index = state.index;
			opacity = state.opacity;

			if (state.scaleX === -1) {
				transform += "scaleX(" + state.scaleX + ")";
			}
			if (state.scaleY === -1) {
				transform += "scaleY(" + state.scaleY + ")";
			}
			if (state.rotate !== 0) {
				transform += "rotate(" + state.rotate + "deg)";
			}

			elem.style.zIndex = index;
			elem.style.left = left;
			elem.style.top = top;
			elem.style.width = width;
			elem.style.height = height;
			elem.style.transform = transform;

			if (
				elem.classList.contains("canvaaas-image") ||
				elem.classList.contains("canvaaas-clone")
			) {
				elem.querySelector("img").style.opacity = opacity;
			}

			return true;
		};

		function copyObject(destiObj, srcObj) {
			if (
				typeof(destiObj) !== "object" ||
				destiObj === null ||
				typeof(srcObj) !== "object" ||
				srcObj === null
			) {
				return false;
			}

			Object.keys(srcObj).forEach(function(key){
				destiObj[key] = srcObj[key];
			});

			return true;
		};

		function pushUndoCache(id, clearRedoCaches) {
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (!source || !clone || !state) {
				return false;
			}

			var tmpState = {};
			var res = copyObject(tmpState, state);
			if (!res) {
				return false;
			}

			var tmp = {};
			tmp.id = id;
			tmp.state = tmpState;
			tmp.sourceClass = source.className.replace(" focus", "").split(' ');
			tmp.cloneClass = clone.className.replace(" focus", "").split(' ');
			tmp.updatedAt = Date.now();

			undoCaches.push(tmp);

			if (undoCaches.length > config.cacheLevels) {
				undoCaches.shift();
			}

			if (clearRedoCaches === true) {
				redoCaches = [];
			}
			
			return true;
		}

		function pushSubCache(id) {
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (!source || !clone || !state) {
				return false;
			}

			var tmpState = {};
			var res = copyObject(tmpState, state);
			if (!res) {
				return false;
			}

			var tmp = {};
			tmp.id = id;
			tmp.state = tmpState;
			tmp.sourceClass = source.className.replace(" focus", "").split(' ');
			tmp.cloneClass = clone.className.replace(" focus", "").split(' ');
			tmp.updatedAt = Date.now();

			redoCaches.push(tmp);

			return true;
		}

		function setFocusIn(id) {
			var source = getSourceById(id);
			var clone = getCloneById(id);

			if (!source || !clone) {
				return false;
			}

			try {
				canvasObject.classList.add("focus");
				mirrorObject.classList.add("focus");

				source.classList.add("focus");
				clone.classList.add("focus");

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
			} catch(err) {
				console.log(err);
				return false;
			}
			
			eventState.target = source;

			return true;
		};

		function setFocusOut(id) {
			var source = getSourceById(id)
			var clone = getCloneById(id);

			if (!source || !clone) {
				return false;
			}

			try {
				canvasObject.classList.remove("focus");
				mirrorObject.classList.remove("focus");

				source.classList.remove("focus");
				clone.classList.remove("focus");

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
			} catch(err) {
				console.log(err);
				return false;
			}

			eventState.target = undefined;

			return true;
		}

		// deprecated
		function setIndex() {
			var tmpStates = [];
			var tmpimageObjects = [];
			var firstSourceChild = canvasObject.firstChild;
			var lastSourceChild = undefined;
			var firstCloneChild = mirrorObject.firstChild;
			var lastCloneChild = undefined;

			var tmpStates = imageStates.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			tmpStates.forEach(function(state){
				var source = getSourceById(state.id);
				var clone = getCloneById(state.id);

				if (!source || !clone) {
					return false;
				}

				// set source
				try {
					if (!lastSourceChild) {
						if (!source.isSameNode(firstSourceChild)) {
							canvasObject.insertBefore(source, firstSourceChild);
						} else {
							if (source.nextSibling) {
								lastSourceChild = source.nextSibling;
							}
						}
					} else {
						if (!source.isSameNode(lastSourceChild)) {
							canvasObject.insertBefore(source, lastSourceChild);
						} else {
							if (source.nextSibling) {
								lastSourceChild = source.nextSibling;
							}
						}
					}
					tmpimageObjects.push(source);
				} catch (err) {
					console.log(err);
					return false;
				}

				// set clone
				try {
					if (!lastCloneChild) {
						if (!clone.isSameNode(firstCloneChild)) {
							mirrorObject.insertBefore(clone, firstCloneChild);
						} else {
							if (clone.nextSibling) {
								lastCloneChild = clone.nextSibling;
							}
						}
					} else {
						if (!clone.isSameNode(lastCloneChild)) {
							mirrorObject.insertBefore(clone, lastCloneChild);
						} else {
							if (clone.nextSibling) {
								lastCloneChild = clone.nextSibling;
							}
						}
					}
				} catch (err) {
					console.log(err);
					return false;
				}
			});

			imageStates = tmpStates;
			imageObjects = tmpimageObjects;

			return true;
		}

		function getAdjustedDataById(id) {
			var state = getStateById(id);
			if (!state) {
				return false;
			}

			var scaleRatio = canvasState.width / canvasState.originalWidth;
			var tmp = {};
			tmp.id = state.id;
			tmp.type = state.type;
			tmp.src = state.src;
			tmp.index = state.index;
			tmp.originalWidth = state.originalWidth;
			tmp.originalHeight = state.originalHeight;
			tmp.width = state.width / scaleRatio;
			tmp.height = state.height / scaleRatio;
			tmp.left = (state.x - (state.width * 0.5)) / scaleRatio;
			tmp.top = (state.y - (state.height * 0.5)) / scaleRatio;
			tmp.x = state.x / scaleRatio;
			tmp.y = state.y / scaleRatio;
			tmp.rotate = state.rotate;
			tmp.scaleX = state.scaleX;
			tmp.scaleY = state.scaleY;
			tmp.opacity = state.opacity;
			tmp.lockAspectRatio = state.lockAspectRatio;
			tmp.focusable = state.focusable;
			tmp.editable = state.editable;
			tmp.drawable = state.drawable;

			return tmp;
		}

		function existsId(id) {
			if (
				id === undefined ||
				id === null ||
				id === ""
			) {
				return false;
			}

			var exists = imageStates.find(function(elem){
				if (elem.id === id) {
					return elem;
				}
			});

			if (exists) {
				return true;
			} else {
				return false;
			}
		}

		function changeId(id, candidateId) {
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (!source || !clone || !state || !candidateId) {
				return false;
			}

			var exists = imageStates.find(function(elem){
				if (elem.id === candidateId) {
					return elem;
				}
			});

			if (exists) {
				return false;
			}

			undoCaches.forEach(function(elem){
				if (elem.id === id) {
					elem.id = candidateId;
				}
				if (elem.state) {
					if (elem.state.id === id) {
						elem.state.id = candidateId;
					}
				}
			});

			redoCaches.forEach(function(elem){
				if (elem.id === id) {
					elem.id = candidateId;
				}
				if (elem.state) {
					if (elem.state.id === id) {
						elem.state.id = candidateId;
					}
				}
			});

			source.id = sourceId + candidateId;
			clone.id = cloneId + candidateId;
			state.id = candidateId;

			return true;
		}

		function getIdByObject(obj) {
			if (!obj) {
				return false;
			}
			if (
				!obj.classList.contains("canvaaas-image") &&
				!obj.classList.contains("canvaaas-clone")
			) {
				return false;
			}
			if (
				obj.id === undefined ||
				obj.id === null ||
				obj.id === ""
			) {
				return false;
			}

			var arr = obj.id.split("-");
			var id;
			if (arr.length === 3) {
				id = arr.pop();
			} else if (arr.length > 3) {
				var tmp = [];
				for (var i = 2; i < arr.length; i++) {
					tmp.push(arr[i])
				}
				id = tmp.join("-");
			}
			return id;
		}

		function getStatesByIndex(idx) {
			if (
				idx === undefined ||
				idx === null ||
				idx === ""
			) {
				return false;
			}

			var arr = [];

			imageStates.forEach(function(elem){
				if (elem.index === idx) {
					arr.push(elem);
				}
			})

			return arr;
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
			var state = imageStates.find(function(elem){
				if (elem.filename === str) {
					return elem;
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
			return imageStates.find(function(elem){
				if (elem.id === id) {
					return elem;
				}
			});
		}

		function getStateByObject(obj) {
			if (!obj) {
				return false;
			}
			if (
				!obj.classList.contains("canvaaas-image") &&
				!obj.classList.contains("canvaaas-clone")
			) {
				return false;
			}
			if (
				obj.id === undefined ||
				obj.id === null ||
				obj.id === ""
			) {
				return false;
			}

			var arr = obj.id.split("-");
			var id;
			if (arr.length === 3) {
				id = arr.pop();
			} else if (arr.length > 3) {
				var tmp = [];
				for (var i = 2; i < arr.length; i++) {
					tmp.push(arr[i])
				}
				id = tmp.join("-");
			}

			return imageStates.find(function(elem){
				if (elem.id === id) {
					return elem;
				}
			});
		}

		function getStateByFilename(str) {
			if (!str) {
				return false;
			}
			return imageStates.find(function(elem){
				if (elem.filename === str) {
					return elem;
				}
			});
		}

		function getCloneById(id) {
			if (!id) {
				return false;
			}
			return document.getElementById(cloneId + id);
		}

		function getCloneByObject(obj) {
			if (!obj) {
				return false;
			}
			if (
				!obj.classList.contains("canvaaas-image") &&
				!obj.classList.contains("canvaaas-clone")
			) {
				return false;
			}
			if (
				obj.id === undefined ||
				obj.id === null ||
				obj.id === ""
			) {
				return false;
			}
			
			var arr = obj.id.split("-");
			var id;
			if (arr.length === 3) {
				id = arr.pop();
			} else if (arr.length > 3) {
				var tmp = [];
				for (var i = 2; i < arr.length; i++) {
					tmp.push(arr[i])
				}
				id = tmp.join("-");
			}

			return document.getElementById(cloneId + id);
		}

		function removeObjectById(id) {
			if (!id) {
				return false;
			}
			var source = document.getElementById(sourceId + id);
			var clone = document.getElementById(cloneId + id);
			var state = getStateById(id);

			URL.revokeObjectURL(state.src);

			if (!source || !clone || !state) {
				return false;
			}

			var stateSeq = imageStates.findIndex(function(elem){
				if (elem.id === state.id) {
					return elem;
				}
			});

			if (stateSeq === undefined || stateSeq === null) {
				return false;
			}

			var sourceSeq = imageObjects.findIndex(function(elem){
				if (elem.isSameNode(source)) {
					return elem;
				}
			});

			if (sourceSeq === undefined || sourceSeq === null) {
				return false;
			}

			try {
				imageStates.splice(stateSeq, 1);
				imageObjects.splice(sourceSeq, 1);
				source.parentNode.removeChild(source);
				clone.parentNode.removeChild(clone);
			} catch(err) {
				console.log(err);
				return false;
			}

			// clear caches
			var tmpUC = undoCaches.filter(function(elem){
				if (elem.id === id) {
					return false;
				}
				return true;
			});

			var tmpRC = redoCaches.filter(function(elem){
				if (elem.id === id) {
					return false;
				}
				return true;
			});

			undoCaches = tmpUC;
			redoCaches = tmpRC;

			return true;
		}

		function showImageById(id) {
			var source = getSourceById(id);
			var clone = getCloneById(id);

			if (!source || !clone) {
				return false;
			}

			source.classList.remove("hidden");
			clone.classList.remove("hidden");

			return true;
		}

		function hideImageById(id) {
			var source = getSourceById(id);
			var clone = getCloneById(id);

			if (!source || !clone) {
				return false;
			}

			source.classList.add("hidden");
			clone.classList.add("hidden");

			return true;
		}

		function getDegrees(x, y) {
			if (
				typeof(x) !== "number" ||
				typeof(y) !== "number"
			) {
				return false;
			}
			var radians = Math.atan2(y, x) * 180 / Math.PI;

			return (450 - radians) % 360;

			// deprecated
			// return Math.atan2(y, x) * 180 / Math.PI;
		}

		function getFittedRect(width, height, aspectRatio, fit) {
			if (
				typeof(width) !== "number" ||
				typeof(height) !== "number" ||
				typeof(aspectRatio) !== "number"
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
				typeof(width) !== "number" ||
				typeof(height) !== "number" ||
				typeof(angle) !== "number"
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

		function getDiagonal(width, height) {
			if (
				typeof(width) !== "number" ||
				typeof(height) !== "number"
			) {
				return false;
			}
			return Math.sqrt( Math.pow(width, 2) + Math.pow(height, 2) );
		}

		function getDirection(direction, scaleX, scaleY) {
			if (
				direction === undefined ||
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

		function isNumeric(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}

		function isNodeList(nodes) {
			var stringRepr = Object.prototype.toString.call(nodes);

			return typeof nodes === 'object' &&
				/^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr) &&
				(typeof nodes.length === 'number') &&
				(nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0));
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
			var fillStyle = options.backgroundColor || "#FFFFFF";

			if (
				!width ||
				!height ||
				!aspectRatio ||
				!fillStyle ||
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

			ctx.fillStyle = fillStyle;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.save();

			return canvas;
		}

		// asynchronous
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
			var state = getStateById(id);
			var originalImg = source.querySelector("img");

			if (!source) {
				return cb("Source not found");
			}
			if (!state) {
				return cb("State not found");
			}
			if (!originalImg) {
				return cb("Image not found");
			}

			var virtualImg = new Image();
			virtualImg.src = originalImg.src;

			virtualImg.onerror = function(e) {
				return cb(e);
			}
			virtualImg.onload = function(e) {
				var maxCanvasWidth = config.maxCanvasWidth || 99999;
				var maxCanvasHeight = config.maxCanvasHeight || 99999;
				var minCanvasWidth = config.minCanvasWidth || 0;
				var minCanvasHeight = config.minCanvasHeight || 0;

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
					cb(null, true);
				}
			}
		}

		// asynchronous
		function renderObject(file, cb) {
			if (!file) {
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			if (imageObjects.length > config.maxNumberOfImages - 1) {
				if (cb) {
					cb("Exceed max number of images");
				}
				return false;
			}

			var ext;
			var src;
			var typ;
			var data;
			var newImage = new Image();
			var id = getShortId();

			// check file or url
			if (
				typeof(file) === "object" &&
				file !== null
			) {
				if (
					!file.name ||
					!file.type ||
					!file.size
				) {
					if (cb) {
						cb("File not found");
					}
					return false;
				}

				// file
				typ = "file";
				ext = file.type.split("/").pop();
				src = file;
				data = URL.createObjectURL(file);
			} else if (typeof(file) === "string") {
				// url
				typ = "url";
				ext = getExtension(file);
				src = file;
				data = file;
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
			newImage.src = data;

			newImage.onerror = function(e) {
				if (cb) {
					cb("Image load failed");
				}
				return false;
			}

			newImage.onload = function(e) {

				// check initialized canvas
				if (!isInitialized) {
					canvasState.originalWidth = newImage.width;
					canvasState.originalHeight = newImage.height;

					var resA = initContainer();
					if (!resA) {
						if (cb) {
							cb("`initContainer()` error");
						}
						return false;
					}

					var resB = initCanvas();
					if (!resB) {
						if (cb) {
							cb("`initCanvas()` error");
						}
						return false;
					}

					isInitialized = true;
				}

				// get last index
				var nextIndex = 0;
				imageStates.forEach(function(state){
					if (nextIndex < state.index) {
						nextIndex = state.index;
					}
				});
				nextIndex += 1;

				// create states
				var originalWidth = newImage.width;
				var originalHeight = newImage.height;

				var aspectRatio = originalWidth / originalHeight;

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

				var index = nextIndex;
				var width = Math.min(maxSizes[0], Math.max(minSizes[0], originalWidth));
				var height = Math.min(maxSizes[1], Math.max(minSizes[1], originalHeight));
				var axisX = canvasState.width * 0.5;
				var axisY = canvasState.height * 0.5;
				var rotate = 0;
				var scaleX = 1;
				var scaleY = 1;
				var opacity = 1;
				var lockAspectRatio = true;
				var focusable = true;
				var editable = true;
				var drawable = true;

				var newState = {};
				newState.type = typ;
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
				newState.lockAspectRatio = lockAspectRatio;
				newState.focusable = focusable;
				newState.editable = editable;
				newState.drawable = drawable;

				// create wrap element
				var newSource = document.createElement("div");
				newSource.classList.add("canvaaas-image");
				newSource.id = sourceId + id;
				newSource.innerHTML = imageTemplate;

				var newImg = newSource.querySelector("img");
				newImg.src = newImage.src;

				// create clone element
				var newClone = document.createElement("div");
				newClone.classList.add("canvaaas-clone");
				newClone.innerHTML = newSource.innerHTML;
				newClone.id = cloneId + id;

				// set events
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

				// finish
				imageStates.push(newState);

				setObject(newSource, newState);
				canvasObject.appendChild(newSource);
				mirrorObject.appendChild(newClone);
				imageObjects.push(newSource);

				if (cb) {
					cb(null, id);
				}
			}
		}

		function initContainer() {
			if (!containerObject) {
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
			containerObject.style.width = "";
			containerObject.style.height = "";

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

			var canvasAspectRatio = canvasState.originalWidth / canvasState.originalHeight;
			var aspectRatio = config.containerAspectRatio || canvasAspectRatio;

			var containerWidth = containerObject.offsetWidth;
			var containerHeight = containerObject.offsetWidth / aspectRatio;

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
			var offset = containerObject.getBoundingClientRect();

			// save state
			setState(containerState, {
				width: adjWidth,
				height: adjHeight,
				left: offset.left,
				top: offset.top
			});

			// adjust state
			setObject(containerObject, containerState);

			if (hasScrollbar()) {
				var sbw = getScrollbarWidth();
				var tmp = containerState.width / containerState.height;
				containerState.width -= sbw;
				containerState.height = containerState.width / tmp;

				setObject(containerObject, containerState);
			}

			return true;
		}

		function initCanvas() {
			if (
				!canvasObject ||
				!containerState.width ||
				!containerState.height
			) {
				return false;
			}

			var aspectRatio = canvasState.originalWidth / canvasState.originalHeight;
			var maxWidth = config.maxCanvasWidth || 99999;
			var maxHeight = config.maxCanvasHeight || 99999;
			var minWidth = config.minCanvasWidth || 0;
			var minHeight = config.minCanvasHeight || 0;

			var maxSizes = getFittedRect(
				maxWidth,
				maxHeight,
				aspectRatio
			);

			var minSizes = getFittedRect(
				minWidth,
				minHeight,
				aspectRatio
			);

			var fittedSizes = getFittedRect(
				containerState.width,
				containerState.height,
				aspectRatio
			);

			var originalWidth = Math.min(maxSizes[0], Math.max(minSizes[0], canvasState.originalWidth));
			var originalHeight = Math.min(maxSizes[1], Math.max(minSizes[1], canvasState.originalHeight));
			var axisX = 0.5 * containerState.width;
			var axisY = 0.5 * containerState.height;
			var rectL = Math.round( 0.5 * (containerState.width - fittedSizes[0]) );
			var rectT = Math.round( 0.5 * (containerState.height - fittedSizes[1]) );

			// save state
			setState(canvasState, {
				originalWidth: originalWidth,
				originalHeight: originalHeight,
				x: axisX,
				y: axisY,
				left: rectL,
				top: rectT,
				width: fittedSizes[0],
				height: fittedSizes[1],
			});

			// adjust state
			setObject(canvasObject, canvasState);
			setObject(mirrorObject, canvasState);

			return true;
		}

		// 
		// exports
		// 

		myObject.init = function(target, cb) {
			if (isInitialized === true) {
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

			// set template
			target.innerHTML = conatinerTemplate;

			// set elements
			containerObject = target.querySelector("div.canvaaas");
			canvasObject = target.querySelector("div.canvaaas-canvas");
			mirrorObject = target.querySelector("div.canvaaas-mirror");

			// set canvasState
			canvasState.quality = 0.8;
			canvasState.mimeType = "image/jpeg";
			canvasState.smoothingQuality = "low"; // "low", "medium", "high"
			canvasState.smoothingEnabled = false; // false, true
			canvasState.backgroundColor = "#FFFFFF";

			// set canvas background
			canvasObject.style.backgroundColor = canvasState.backgroundColor;

			// check canvas dimensions
			if (
				typeof(config.initCanvasWidth) === "number" &&
				typeof(config.initCanvasHeight) === "number"
			) {
				canvasState.originalWidth = config.initCanvasWidth;
				canvasState.originalHeight = config.initCanvasHeight;

				// set container
				var resA = initContainer();
				if (!resA) {
					if (cb) {
						cb("`initContainer()` error");
					}
					return false;
				}

				// set canvas
				var resB = initCanvas();
				if (!resB) {
					if (cb) {
						cb("`initCanvas()` error");
					}
					return false;
				}

				isInitialized = true;
			}

			// set events
			windowResizeEvent = handlers.resizeWindow;
			windowScrollEvent = handlers.debounce( handlers.whereContainer, 300 );

			// window.addEventListener("resize", handlers.debounce( handlers.resizeWindow, 100 ), false);
			window.addEventListener("resize", windowResizeEvent, false);

			// window.addEventListener("scroll", handlers.debounce( handlers.whereContainer, 300 ), false);
			window.addEventListener("scroll", windowScrollEvent, false);

			if (config.dropSpace !== undefined) {
				if ([
					"canvas",
					"container"
				].indexOf(config.dropSpace) > -1) {
					containerObject.addEventListener('dragenter', handlers.preventDefaults, false);
					containerObject.addEventListener('dragleave', handlers.preventDefaults, false);
					containerObject.addEventListener('dragover', handlers.preventDefaults, false);
					containerObject.addEventListener('drop', handlers.preventDefaults, false);
					containerObject.addEventListener('drop', handlers.dropImages, false);
				} else if ([
					"window",
					"document",
					"page",
					"screen",
					"all",
					"body"
				].indexOf(config.dropSpace) > -1) {
					document.addEventListener('dragenter', handlers.preventDefaults, false);
					document.addEventListener('dragleave', handlers.preventDefaults, false);
					document.addEventListener('dragover', handlers.preventDefaults, false);
					document.addEventListener('drop', handlers.preventDefaults, false);
					document.addEventListener('drop', handlers.dropImages, false);
				}
			}

			if (config.initChecker === true) {
				canvasState.checker = true;
				canvasObject.classList.add("checker");
			}

			// console.log("canvaaas.js initialized", config);

			if (cb) {
				cb(null, config);
			}
			return config;
		}

		// asynchronous
		myObject.uploadFiles = function(self, cb) {
			if (onUpload === true) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				} 
				return false;
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

			var thisFiles = self.files;
			if (thisFiles.length < 1) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				} 
				return false;
			}

			var index = thisFiles.length;
			var count = 0;
			var results = [];

			onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderObject(thisFiles[count], function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
						} else {
							if (config.upload) {
								config.upload(null, res);
							}
						}
						results.push({
							err: err,
							id: res
						});

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

		// asynchronous
		myObject.uploadUrl = function(imageUrl, cb) {
			if (onUpload === true) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				} 
				return false;
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

			var thisFile = imageUrl;
			if (!thisFile) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				} 
				return false;
			}

			renderObject(thisFile, function(err, res) {
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
					config.upload(null, res);
				}
				if (cb) {
					cb(null, res);
				}
			});
		}

		// 
		// image
		// 

		myObject.id = function(id, newId, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (
				typeof(newId) !== "string" &&
				typeof(newId) !== "number"
			) {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (typeof(newId) === "number") {
				newId = "" + newId;
			}

			if (newId.trim() === "") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (!source || !state || !clone) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			if (existsId(newId)) {
				if (cb) {
					cb("ID duplicated");
				} 
				return false;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				id: newId
			});

			if (cb) {
				cb(null, state.id)
			}
			return state.id;
		}

		myObject.moveX = function(id, x, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.move) {
					config.move("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!isNumeric(x)) {
				if (config.move) {
					config.move("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.move) {
					config.move("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (!source || !state || !clone) {
				if (config.move) {
					config.move("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.move) {
					config.move("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			x = parseFloat(x);

			var axisX = state.x - x;

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				x: axisX
			})

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.move) {
				config.move(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
			return state.id;
		}

		myObject.moveY = function(id, y, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.move) {
					config.move("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!isNumeric(y)) {
				if (config.move) {
					config.move("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.move) {
					config.move("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (!source || !state || !clone) {
				if (config.move) {
					config.move("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.move) {
					config.move("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			y = parseFloat(y);

			var axisY = state.y - y;

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				y: axisY
			})

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.move) {
				config.move(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
			return state.id;
		}

		myObject.moveTo = function(id, x, y, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.move) {
					config.move("Argument error");
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
				if (config.move) {
					config.move("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.move) {
					config.move("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (!source || !state || !clone) {
				if (config.move) {
					config.move("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.move) {
					config.move("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			var axisX = state.x;
			var axisY = state.y;

			if (isNumeric(x) === true) {
				axisX = parseFloat(x);
			} else {
				if (
					x.toLowerCase() === "l" || 
					x.toLowerCase() === "left"
				) {
					axisX = (canvasState.width * 0) + (state.width * 0.5);
				} else if (
					x.toLowerCase() === "c" || 
					x.toLowerCase() === "center"
				) {
					axisX = (canvasState.width * 0.5);
				} else if (
					x.toLowerCase() === "r" || 
					x.toLowerCase() === "right"
				) {
					axisX = (canvasState.width * 1) - (state.width * 0.5);
				}
			}

			if (isNumeric(y) === true) {
				axisY = parseFloat(y);
			} else {
				if (
					y.toLowerCase() === "t" || 
					y.toLowerCase() === "top"
				) {
					axisY = (canvasState.height * 0) + (state.height * 0.5);
				} else if (
					y.toLowerCase() === "c" || 
					y.toLowerCase() === "center" || 
					y.toLowerCase() === "middle"
				) {
					axisY = (canvasState.height * 0.5);
				} else if (
					y.toLowerCase() === "b" || 
					y.toLowerCase() === "bottom"
				) {
					axisY = (canvasState.height * 1) - (state.height * 0.5);
				}
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				x: axisX,
				y: axisY
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.move) {
				config.move(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
			return state.id;
		}

		myObject.resize = function(id, w, h, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.resize) {
					config.resize("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (
				!isNumeric(w) ||
				!isNumeric(h)
			) {
				if (config.resize) {
					config.resize("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.resize) {
					config.resize("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (!source || !state || !clone) {
				if (config.resize) {
					config.resize("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.resize) {
					config.resize("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}


			w = parseFloat(w);
			h = parseFloat(h);

			var aspectRatio = state.originalWidth / state.originalHeight;
			var width = w;
			var height = h;
			var lockAspectRatio;
			if (width !== height * aspectRatio) {
				lockAspectRatio = false;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				width: width,
				height: height,
				lockAspectRatio: lockAspectRatio
			})

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.resize) {
				config.resize(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
			return state.id;
		}

		myObject.zoom = function(id, ratio, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.resize) {
					config.resize("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!isNumeric(ratio)) {
				if (config.resize) {
					config.resize("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.resize) {
					config.resize("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.resize) {
					config.resize("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.resize) {
					config.resize("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			ratio = parseFloat(ratio);

			var width = state.width * (1 + ratio);
			var height = state.height * (1 + ratio);

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				width: width,
				height: height
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.resize) {
				config.resize(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
			return state.id;
		}

		myObject.zoomTo = function(id, ratio, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.resize) {
					config.resize("Argument error");
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
				if (config.resize) {
					config.resize("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.resize) {
					config.resize("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.resize) {
					config.resize("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.resize) {
					config.resize("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			var width;
			var height;
			var axisX;
			var axisY;
			var fittedSizes;
			var aspectRatio = state.originalWidth / state.originalHeight;

			if (!isNumeric(ratio)) {
				if (ratio === "cover") {
					fittedSizes = getFittedRect(
						canvasState.width,
						canvasState.height,
						aspectRatio,
						"cover"
					)
					width = fittedSizes[0];
					height = fittedSizes[1];
					axisX = canvasState.width * 0.5;
					axisY = canvasState.height * 0.5;
				} else if (ratio === "contain") {
					fittedSizes = getFittedRect(
						canvasState.width,
						canvasState.height,
						aspectRatio,
						"contain"
					)
					width = fittedSizes[0];
					height = fittedSizes[1];
					axisX = canvasState.width * 0.5;
					axisY = canvasState.height * 0.5;
				} else {
					if (cb) {
						cb("Argument error");
					} 
					return false;
				}
			} else {
				width = state.originalWidth * parseFloat(ratio);
				height = state.originalHeight * parseFloat(ratio);
				axisX = state.x;
				axisY = state.y;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				x: axisX,
				y: axisY,
				width: width,
				height: height
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.resize) {
				config.resize(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.rotate = function(id, deg, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.rotate) {
					config.rotate("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!isNumeric(deg)) {
				if (config.rotate) {
					config.rotate("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.rotate) {
					config.rotate("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.rotate) {
					config.rotate("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.rotate) {
					config.rotate("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			deg = parseFloat(deg);

			if (state.scaleX === -1) {
				deg *= -1;
			}

			if (state.scaleY === -1) {
				deg *= -1;
			}

			// save cache
			pushUndoCache(state.id, true);

			var rotate = state.rotate + parseFloat(deg);

			// save state
			setState(state, {
				rotate: rotate
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.rotate) {
				config.rotate(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.rotateTo = function(id, deg, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.rotate) {
					config.rotate("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!isNumeric(deg)) {
				if (config.rotate) {
					config.rotate("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.rotate) {
					config.rotate("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.rotate) {
					config.rotate("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.rotate) {
					config.rotate("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			deg = parseFloat(deg);

			var rotate = deg;

			if (state.scaleX === -1) {
				rotate *= -1;
			}

			if (state.scaleY === -1) {
				rotate *= -1;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				rotate: rotate
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.rotate) {
				config.rotate(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.flipX = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.flip) {
					config.flip("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.flip) {
					config.flip("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.flip) {
					config.flip("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.flip) {
					config.flip("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			var scaleX = state.scaleX * -1;
			var rotate = state.rotate * -1;

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				scaleX: scaleX,
				rotate: rotate
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.flip) {
				config.flip(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			} 
			return state.id;
		}

		myObject.flipY = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.flip) {
					config.flip("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.flip) {
					config.flip("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.flip) {
					config.flip("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.flip) {
					config.flip("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			var scaleY = state.scaleY * -1;
			var rotate = state.rotate * -1;

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				scaleY: scaleY,
				rotate: rotate
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.flip) {
				config.flip(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			} 
			return state.id;
		}

		myObject.flipTo = function(id, x, y, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.flip) {
					config.flip("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (
				!isNumeric(x) ||
				!isNumeric(y)
			) {
				if (config.flip) {
					config.flip("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.flip) {
					config.flip("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.flip) {
					config.flip("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.flip) {
					config.flip("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			x = parseInt(x);
			y = parseInt(y);

			var scaleX = x;
			var scaleY = y;
			var rotate = state.rotate;

			if (
				scaleX !== 1 &&
				scaleX !== -1
			) {
				scaleX = 1;
			}

			if (
				scaleY !== 1 &&
				scaleY !== -1
			) {
				scaleY = 1;
			}

			if (scaleX !== state.scaleX) {
				rotate *= -1;
			}
			if (scaleY !== state.scaleY) {
				rotate *= -1;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				rotate: rotate,
				scaleX: scaleX,
				scaleY: scaleY
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.flip) {
				config.flip(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			} 
			return state.id;
		}

		myObject.opacityTo = function(id, num, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.opacity) {
					config.opacity("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!isNumeric(num)) {
				if (config.opacity) {
					config.opacity("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.opacity) {
					config.opacity("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.opacity) {
					config.opacity("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.opacity) {
					config.opacity("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			num = parseFloat(num);

			var opacity = num;

			if (opacity > 1) {
				opacity = 1;
			}
			if (opacity < 0) {
				opacity = 0;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				opacity: opacity
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.opacity) {
				config.opacity(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.index = function(id, num, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.index) {
					config.index("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!isNumeric(num)) {
				if (config.index) {
					config.index("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (parseInt(num) === 0) {
				if (config.index) {
					config.index("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.index) {
					config.index("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.index) {
					config.index("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.index) {
					config.index("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			num = parseInt(num);

			if (state.index + num < 0) {
				if (config.index) {
					config.index("Index less than 0");
				}
				if (cb) {
					cb("Index less than 0");
				} 
				return false;
			}

			// save cache
			pushUndoCache(state.id, true);

			var nextIndex = state.index + num;

			// save state
			setState(state, {
				index: nextIndex
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			// deprecated
			// check next index
			// var diff = Math.abs(num);
			// for (var i = 0; i < diff; i++) {
			// 	var thisIndex = state.index;
			// 	var nextIndex;
			// 	if (num < 0) {
			// 		nextIndex = thisIndex - 1;
			// 	} else {
			// 		nextIndex = thisIndex + 1;
			// 	}

			// 	var dupeStates = getStatesByIndex(nextIndex);
			// 	if (dupeStates.length > 0) {
			// 		dupeStates.forEach(function(elem){
			// 			var thisSource = getSourceById(elem.id);
			// 			var thisClone = getCloneById(elem.id);

			// 			setState(elem, {
			// 				index: thisIndex
			// 			});

			// 			setObject(thisSource, elem);
			// 			setObject(thisClone, elem);
			// 		})
			// 	}

			// 	// save state
			// 	setState(state, {
			// 		index: nextIndex
			// 	});

			// 	// adjust state
			// 	setObject(source, state);
			// 	setObject(clone, state);
			// }

			if (config.index) {
				config.index(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.indexTo = function(id, num, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (config.index) {
					config.index("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!isNumeric(num)) {
				if (config.index) {
					config.index("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.index) {
					config.index("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.index) {
					config.index("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.index) {
					config.index("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			num = parseInt(num);

			var thisIndex = state.index;
			var nextIndex = num;

			// check duplicate
			// var dupeStates = getStatesByIndex(nextIndex);
			// if (dupeStates.length !== 0) {
			// 	if (config.index) {
			// 		config.index("Already exists in the index");
			// 	}
			// 	if (cb) {
			// 		cb("Already exists in the index");
			// 	} 
			// 	return false;
			// }

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				index: nextIndex
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.index) {
				config.index(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.indexSwap = function(id, targetId, cb) {
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			var targetSource = getSourceById(targetId);
			var targetClone = getCloneById(targetId);
			var targetState = getStateById(targetId);

			if (typeof(id) !== "string") {
				if (config.index) {
					config.index("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (typeof(targetId) !== "string") {
				if (config.index) {
					config.index("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.index) {
					config.index("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.index) {
					config.index("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!targetSource || !targetState || !targetClone) {
				if (config.index) {
					config.index("Target not found");
				}
				if (cb) {
					cb("Target not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.index) {
					config.index("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			if (!targetState.editable) {
				if (config.index) {
					config.index("Target element has been denied");
				}
				if (cb) {
					cb("Target element has been denied");
				} 
				return false;
			}

			var thisIndex = state.index;
			var targetIndex = targetState.index;

			if (thisIndex === targetIndex) {
				if (config.index) {
					config.index("Same index");
				}
				if (cb) {
					cb("Same index");
				} 
				return false;
			}

			// save cache
			pushUndoCache(state.id, true);

			// set state
			setState(targetState, {
				index: thisIndex
			});

			setState(state, {
				index: targetIndex
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);
			setObject(targetSource, targetState);
			setObject(targetClone, targetState);

			if (config.index) {
				config.index(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.toggleAspectRatio = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			var aspectRatio = state.originalWidth / state.originalHeight;
			var lockAspectRatio = state.lockAspectRatio;
			var width = state.width;
			var height = state.height;
			if (lockAspectRatio === true) {
				lockAspectRatio = false;
			} else {
				lockAspectRatio = true;
				if (width > height / aspectRatio) {
					height = width / aspectRatio;
				} else {
					width = height * aspectRatio;
				}
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				width: width,
				height: height,
				lockAspectRatio: lockAspectRatio
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.lockAspectRatio = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			if (state.lockAspectRatio === true) {
				if (cb) {
					cb("Already locked aspect ratio");
				} 
				return false;
			}

			var aspectRatio = state.originalWidth / state.originalHeight;
			var lockAspectRatio = true;
			var width = state.width;
			var height = state.height;
			if (width > height / aspectRatio) {
				height = width / aspectRatio;
			} else {
				width = height * aspectRatio;
			}

			// save cache
			pushUndoCache(state.id, true);
			
			// save state
			setState(state, {
				width: width,
				height: height,
				lockAspectRatio: lockAspectRatio
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.unlockAspectRatio = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			if (state.lockAspectRatio === false) {
				if (cb) {
					cb("Already unlocked aspect ratio");
				} 
				return false;
			}

			var lockAspectRatio = false;

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				lockAspectRatio: lockAspectRatio
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.focusIn = function(id, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.focusIn) {
					config.focusIn("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.focusIn) {
					config.focusIn("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (config.focusIn) {
					config.focusIn("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.focusable) {
				if (config.focusIn) {
					config.focusIn("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			if (eventState.target) {
				var oldId = getIdByObject(eventState.target);
				var res = setFocusOut(oldId);
				if (res === true) {
					if (config.focusOut) {
						config.focusOut(null, oldId);
					}
				}
			}

			setFocusIn(id);

			if (config.focusIn) {
				config.focusIn(null, id);
			}
			if (cb) {
				cb(null, id);
			}
			return state.id;
		}

		myObject.focusOut = function(cb) {
			if (!eventState.target) {
				if (config.focusOut) {
					config.focusOut("Target not found");
				}
				if (cb) {
					cb("Target not found");
				} 
				return false;
			}

			var source = eventState.target;
			var state = getStateByObject(source);

			if (!state) {
				if (config.focusOut) {
					config.focusOut("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			setFocusOut(state.id);

			if (config.focusOut) {
				config.focusOut(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.toggleFocusable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			var focusable = state.focusable === false;

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				focusable: focusable
			});

			// focus out
			if (focusable === false) {
				if (eventState.target) {
					if (source.isSameNode(eventState.target)) {
						var res = setFocusOut(id);
						if (res === true) {
							if (config.focusOut) {
								config.focusOut(null, id);
							}
						}
					}	
				}
			}

			// remove class
			if (focusable === true) {
				source.classList.remove("unclickable");
			} else {
				source.classList.add("unclickable");
			}

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.toggleEditable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!source || !state) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			var editable = state.editable === false;

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				editable: editable
			});

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.toggleDrawable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			var drawable = state.drawable === false;

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				drawable: drawable
			});

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.focusable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				focusable: true
			});

			// remove class
			source.classList.remove("unclickable");

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.editable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!source || !state) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				editable: true
			});

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.drawable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				drawable: true
			});

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.unfocusable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			if (eventState.target) {
				if (source.isSameNode(eventState.target)) {
					var res = setFocusOut(id);
					if (res === true) {
						if (config.focusOut) {
							config.focusOut(null, id);
						}
					}
				}	
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				focusable: false
			});

			// add class
			source.classList.add("unclickable");

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.uneditable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				editable: false
			});

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.undrawable = function(id, cb){
			var source = getSourceById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				drawable: false
			});

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.remove = function(id, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// check focus
			if (eventState.target) {
				if (source.isSameNode(eventState.target)) {
					var res = setFocusOut(id);
					// if (res === true) {
					// 	if (config.focusOut) {
					// 		config.focusOut(null, id);
					// 	}
					// }
				}
			}

			// remove element
			var res = removeObjectById(id);
			if (!res) {
				if (cb) {
					cb("`removeObjectById()` error");
				}
				return false;
			}
			if (cb) {
				cb(null, id);
			}
			return id;
		}

		myObject.removeAll = function(cb) {
			if (!config.editable) {
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
					var res = removeObjectById(arr[count]);
					if (!res) {
						results.push({
							err: "`removeObjectById()` error",
							res: arr[count]
						});
					} else {
						results.push({
							err: null,
							res: arr[count]
						});
					}
					count++;
					recursiveFunc();
				} else {
					if (cb) {
						cb(null, results);
					}
					return results;
				}
			}
		}

		myObject.state = function(id, newState, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (
				typeof(newState) !== "object" ||
				newState === null
			) {
				if (typeof(newState) !== "string") {
					if (cb) {
						cb("Argument error");
					} 
					return false;
				} else {
					var tmp;
					try {
						tmp = JSON.parse(newState);
					} catch(err) {
						tmp = undefined;
					}
					if (
						typeof(tmp) !== "object" ||
						tmp === null
					) {
						if (cb) {
							cb("Argument error");
						} 
						return false;
					} else {
						newState = tmp;
					}
				}
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// preset state
			var scaleRatio = canvasState.width / canvasState.originalWidth;

			if (isNumeric(newState.index)) {
				var thisIndex = state.index;
				var nextIndex = newState.index;
				var dupeStates = getStatesByIndex(nextIndex);
				if (dupeStates.length > 0) {
					dupeStates.forEach(function(elem){
						var thisSource = getSourceById(elem.id);
						var thisClone = getCloneById(elem.id);

						setState(elem, {
							index: thisIndex
						});

						setObject(thisSource, elem);
						setObject(thisClone, elem);
					})				
				}
			}

			if (isNumeric(newState.x)) {
				newState.x = parseFloat(newState.x) * scaleRatio;
			}

			if (isNumeric(newState.y)) {
				newState.y = parseFloat(newState.y) * scaleRatio;
			}

			if (isNumeric(newState.width)) {
				newState.width = parseFloat(newState.width) * scaleRatio;
			}

			if (isNumeric(newState.height)) {
				newState.height = parseFloat(newState.height) * scaleRatio;
			}

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, newState);

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.reset = function(id, cb) {
			var source = getSourceById(id);
			var state = getStateById(id);
			var clone = getCloneById(id);

			if (typeof(id) !== "string") {
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
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

			// save cache
			pushUndoCache(state.id, true);

			// save state
			setState(state, {
				width: width,
				height: height,
				x: axisX,
				y: axisY,
				rotate: 0,
				scaleX: 1,
				scaleY: 1,
				opacity: 1,
				lockAspectRatio: true,
				focusable: true,
				editable: true,
				drawable: true,
			});
			
			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		// 
		// config
		// 

		myObject.config = function(newConfig, cb) {
			if (
				typeof(newConfig) !== "object" ||
				newConfig === null
			) {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			// set config
			copyObject(config, newConfig);

			if (cb) {
				cb(null, config);
			}
			return config;
		}

		// 
		// canvas
		// 

		myObject.canvas = function(w, h, cb) {
			if (
				!isNumeric(w) ||
				!isNumeric(h)
			) {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			var oldW = canvasState.originalWidth;
			var oldH = canvasState.originalHeight;

			setState(canvasState, {
				originalWidth: w,
				originalHeight: h,
			});

			// set container
			var resA = initContainer();
			if (!resA) {
				setState(canvasState, {
					originalWidth: oldW,
					originalHeight: oldH,
				});

				if (cb) {
					cb("`initContainer()` error");
				}
				return false;
			}

			// set canvas
			var resB = initCanvas();
			if (!resB) {
				setState(canvasState, {
					originalWidth: oldW,
					originalHeight: oldH,
				});

				if (cb) {
					cb("`initCanvas()` error");
				}
				return false;
			}

			// set images
			var newW = canvasState.originalWidth;
			var newH = canvasState.originalHeight;

			// new state adjust to images
			imageStates.forEach(function(state){
				var source = getSourceById(state.id);
				var clone = getCloneById(state.id);

				if (!source || !clone) {
					return;
				}

				var minX = 0;
				var minY = 0;
				var maxX = canvasState.width;
				var maxY = canvasState.height;

				var axisX = state.x;
				var axisY = state.y;

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
				setState(state, {
					x: axisX,
					y: axisY
				});
				
				// adjust state
				setObject(source, state);
				setObject(clone, state);
			});

			// clear cache
			undoCaches = [];
			redoCaches = [];

			if (cb) {
				cb(null, canvasState);
			}
			return canvasState;
		}

		myObject.checker = function(bool, cb) {
			if (
				typeof(bool) === "undefined" ||
				typeof(bool) === "object" ||
				bool === null
			) {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			var tmp = canvasState.checker;

			if (
				bool === true ||
				bool === 1 ||
				bool === "true"
			) {
				canvasState.checker = true;
				if (tmp === false) {
					canvasObject.classList.add("checker");
				}
			} else if (
				bool === false ||
				bool === 0 ||
				bool === -1 ||
				bool === "false" ||
				bool === "none"
			) {
				canvasState.checker = false;
				if (tmp === true) {
					canvasObject.classList.remove("checker");
				}
			} else {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (cb) {
				cb(null, canvasState);
			}
			return canvasState;
		}

		myObject.quality = function(num, cb) {
			if (!isNumeric(num)) {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			var quality = parseFloat(num);

			if (quality > 1) {
				quality = 1;
			}

			if (quality < 0) {
				quality = 0;
			}

			canvasState.quality = quality;

			if (cb) {
				cb(null, canvasState);
			}
			return canvasState;
		}

		myObject.mimeType = function(mimeType, cb) {
			if (typeof(mimeType) !== "string") {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			mimeType = mimeType.toLowerCase();

			if (mimeType.indexOf("/") < 0) {
				if (
					mimeType === "jpg" ||
					mimeType === "jpeg"
				) {
					mimeType = "image/jpeg";
				} else if (
					mimeType === "png"
				) {
					mimeType = "image/png";
				} else if (
					mimeType === "tif" ||
					mimeType === "tiff"
				) {
					mimeType = "image/tiff";
				} else if (
					mimeType === "svg" ||
					mimeType === "svg+xml"
				) {
					mimeType = "image/svg";
				} else if (
					mimeType === "bmp"
				) {
					mimeType = "image/bmp";
				} else if (
					mimeType === "webp"
				) {
					mimeType = "image/webp";
				} else {
					if (cb) {
						cb("Argument error");
					}
					return false;
				}
			}

			canvasState.mimeType = mimeType;

			if (cb) {
				cb(null, canvasState);
			}
			return canvasState;
		}

		myObject.backgroundColor = function(colour, cb) {
			if (typeof(colour) !== "string") {
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

			canvasState.backgroundColor = colour;
			canvasObject.style.backgroundColor = colour;

			if (cb) {
				cb(null, canvasState);
			}
			return canvasState;
		}

		myObject.smoothingQuality = function(str, cb) {
			if (typeof(str) !== "string") {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			str = str.toLowerCase();

			if (
				str !== "low" &&
				str !== "medium" &&
				str !== "high"
			) {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			canvasState.smoothingQuality = str;

			if (cb) {
				cb(null, canvasState);
			}
			return canvasState;
		}

		myObject.smoothingEnabled = function(num, cb) {
			if (
				!isNumeric(num) &&
				typeof(num) !== "boolean" &&
				typeof(num) !== "string"
			) {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			var enabled;
			if (isNumeric(num) === true) {
				num = parseInt(num);

				if (num < 1) {
					enabled = false;
				} else {
					enabled = true;
				}
			} else if (typeof(num) === "boolean") {
				enabled = num;
			} else if (typeof(num) === "string") {
				if (num === "true") {
					enabled = true;
				} else if (num === "false") {
					enabled = false;
				}
			}

			if (enabled === undefined) {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			canvasState.smoothingEnabled = enabled;

			if (cb) {
				cb(null, canvasState);
			}
			return canvasState;
		}

		myObject.freeze = function(cb){
			if (onFreeze === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			if (eventState.target) {
				var id = getIdByObject(eventState.target);
				var res = setFocusOut(id);
				// if (res === true) {
				// 	if (config.focusOut) {
				// 		config.focusOut(null, id);
				// 	}
				// }
			}

			config.editable = false;
			onFreeze = true;

			// check drawable
			imageStates.forEach(function(state){
				if (!state.drawable) {
					hideImageById(state.id);
				}
			})

			// hide checker
			if (canvasState.checker === true) {
				canvasObject.classList.remove("checker");
			}

			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.thaw = function(cb){
			if (onFreeze === false) {
				if (cb) {
					cb("No progress in");
				}
				return false;
			}

			config.editable = true;
			onFreeze = false;

			// check drawable
			imageStates.forEach(function(state){
				if (!state.drawable) {
					showImageById(state.id);
				}
			})

			// set checker
			if (canvasState.checker === true) {
				canvasObject.classList.add("checker");
			}

			if (cb) {
				cb(null, true);
			}
			return true;
		}

		// 
		// draw
		// 

		myObject.draw = function(options, cb){
			/*!
			 * options = {
			 * width, 
			 * quality,
			 * mimeType,
			 * backgroundColor,
			 * smoothingQuality,
			 * smoothingEnabled
			 * }
			 */

			if (onDraw === true) {
				if (config.draw) {
					config.draw("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			var canvasAspectRatio;
			var canvasWidth;
			var canvasHeight;
			var quality;
			var mimeType;
			var backgroundColor;
			var imageSmoothingQuality;
			var imageSmoothingEnabled;

			if (
				typeof(options) === "object" &&
				options !== null
			) {
				canvasAspectRatio = canvasState.originalWidth / canvasState.originalHeight;
				canvasWidth = options.width || options.canvasWidth || canvasState.originalWidth;
				canvasHeight = canvasWidth / canvasAspectRatio;
				quality = options.quality || canvasState.quality;
				mimeType = options.mimeType || canvasState.mimeType;
				imageSmoothingQuality = options.smoothingQuality || canvasState.smoothingQuality;
				imageSmoothingEnabled = options.smoothingEnabled || canvasState.smoothingEnabled;
				backgroundColor = options.backgroundColor || canvasState.backgroundColor;
			} else {
				canvasWidth = canvasState.originalWidth;
				canvasHeight = canvasState.originalHeight;
				quality = canvasState.quality;
				mimeType = canvasState.mimeType;
				imageSmoothingQuality = canvasState.smoothingQuality;
				imageSmoothingEnabled = canvasState.smoothingEnabled;
				backgroundColor = canvasState.backgroundColor;
			}

			var drawOption = {
				width: canvasWidth,
				height: canvasHeight,
				maxWidth: config.maxCanvasWidth || 99999,
				maxHeight: config.maxCanvasHeight || 99999,
				minWidth: config.minCanvasWidth || 0,
				minHeight: config.minCanvasHeight || 0,
				backgroundColor: backgroundColor
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

			var drawables = [];
			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawable) {
					drawables.push(imageStates[i]);
				}
			}

			var result = {};
			var canvasResult = {};
			var drawResults = [];

			canvasResult.width = canvas.width;
			canvasResult.height = canvas.height;
			canvasResult.numberOfImages = drawables.length;
			canvasResult.backgroundColor = backgroundColor;
			canvasResult.mimeType = mimeType;
			canvasResult.quality = quality;
			canvasResult.smoothingQuality = imageSmoothingQuality;
			canvasResult.smoothingEnabled = imageSmoothingEnabled;

			onDraw = true;

			var index = drawables.length;
			var count = 0;

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
					var ctx = canvas.getContext("2d");
					ctx.imageSmoothingQuality = imageSmoothingQuality;
					ctx.imageSmoothingEnabled = imageSmoothingEnabled;
					ctx.restore();

					result.states = drawResults;
					result.canvas = canvasResult;
					result.file = canvas.toDataURL(mimeType, quality);

					onDraw = false;

					if (config.draw) {
						config.draw(null, result);
					}
					if (cb) {
						cb(null, result);
					}
					return result;
				}
			}
		}

		// 
		// data
		// 

		myObject.this = function(cb){
			if (!eventState.target) {
				if (cb) {
					cb("Target not found");
				}
				return false;
			}

			var id = getIdByObject(eventState.target);

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

			var id = getIdByObject(eventState.target);
			var tmp = getAdjustedDataById(id);

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

			var id = getIdByObject(eventState.target);
			var tmp = getAdjustedDataById(id);

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getConfigData = function(cb){
			var tmp = {};
			copyObject(tmp, config);

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getContainerData = function(cb){
			var tmp = {};
			copyObject(tmp, containerState);

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getCanvasData = function(cb){
			var tmp = {};
			copyObject(tmp, canvasState);

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getCacheData = function(cb){
			var tmp = {
				undo: undoCaches,
				redo: redoCaches
			};

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getImageData = function(id, cb){
			if (!id) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var tmp = getAdjustedDataById(id);

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getImageDataAll = function(cb){
			var tmp = [];
			imageStates.forEach(function(state){
				tmp.push(getAdjustedDataById(state.id));
			});

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.undo = function(cb){
			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (undoCaches.length < 1) {
				if (cb) {
					cb("Cache is empty");
				}
				return false;
			}

			if (eventState.target) {
				var oldId = getIdByObject(eventState.target);
				var res = setFocusOut(oldId);
				// if (res === true) {
				// 	if (config.focusOut) {
				// 		config.focusOut(null, oldId);
				// 	}
				// }
			}

			var recent = undoCaches.pop();
			var source = getSourceById(recent.id);
			var clone = getCloneById(recent.id);
			var state = getStateById(recent.id);

			pushSubCache(recent.id);

			source.className = recent.sourceClass.join(" ");
			clone.className = recent.cloneClass.join(" ");

			// save state
			setState(state, recent.state);

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.redo = function(cb){
			if (!config.editable) {
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
				var oldId = getIdByObject(eventState.target);
				var res = setFocusOut(oldId);
				// if (res === true) {
				// 	if (config.focusOut) {
				// 		config.focusOut(null, oldId);
				// 	}
				// }
			}

			var recent = redoCaches.pop();
			var source = getSourceById(recent.id);
			var clone = getCloneById(recent.id);
			var state = getStateById(recent.id);

			pushUndoCache(recent.id);

			source.className = recent.sourceClass.join(" ");
			clone.className = recent.cloneClass.join(" ");

			// save state
			setState(state, recent.state);

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, state.id);
			}
			return state.id;
		}

		myObject.export = function(id, cb){
			var thisId;
			var thisCb;
			var newExports = [];

			if (
				cb === undefined &&
				typeof(id) === "function"
			) {
				thisId = [];
				thisCb = id;
			} else {
				if (typeof(id) === "string") {
					thisId = [id];
				} else if (Array.isArray(id) === true) {
					thisId = id;
				} else {
					thisId = [];
				}
				thisCb = cb;
			}

			var newExports = imageStates.filter(function(elem){
				if (elem.type !== "url") {
					return false;
				}

				if (thisId.length > 0) {
					if (thisId.indexOf(elem.id) < 0) {
						return false;
					}
				}

				return elem;
			}).map(function(elem){
				return getAdjustedDataById(elem.id);
			});

			if (thisCb) {
				thisCb(null, newExports);
			}
			return newExports;
		}

		myObject.import = function(exportedStates, cb){
			if (!Array.isArray(exportedStates)) {
				if (typeof(exportedStates) !== "string") {
					if (cb) {
						cb("Argument error");
					} 
					return false;
				} else {
					var tmp;
					try {
						tmp = JSON.parse(exportedStates);
					} catch(err) {
						tmp = undefined;
					}
					if (!Array.isArray(tmp)) {
						if (cb) {
							cb("Argument error");
						} 
						return false;
					} else {
						exportedStates = tmp;
					}
				}

			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			// check index
			// var hasDupe = false;
			// var noIndex = false;
			// var candidateIndexes = [];
			// exportedStates.forEach(function(elem){
			// 	if (isNumeric(elem.index)) {
			// 		if (candidateIndexes.indexOf(elem.index) < 0) {
			// 			candidateIndexes.push(elem.index);
			// 		} else {
			// 			hasDupe = true;
			// 		}
			// 	} else {
			// 		noIndex = true;
			// 	}
			// });

			// if (hasDupe === true) {
			// 	if (cb) {
			// 		cb("Duplicate index error");
			// 	}
			// 	return false;
			// }

			// if (noIndex === true) {
			// 	if (cb) {
			// 		cb("No index error");
			// 	}
			// 	return false;
			// }

			var index = exportedStates.length;
			var count = 0;
			var results = [];

			onUpload = true;

			recursiveFunc()

			function recursiveFunc() {
				if (count < index) {
					var thisState = {};
					copyObject(thisState, exportedStates[count]);
					var thisUrl = thisState.url || thisState.src || thisState.path;

					renderObject(thisUrl, function(err, res) {
						if (err) {
							results.push({
								err: err,
								id: null
							});

							count++;
							recursiveFunc();
							return false;
						} 

						var scaleRatio = canvasState.width / canvasState.originalWidth;
						var state = getStateById(res);
						var source = getSourceById(res);
						var clone = getCloneById(res);

						if (!state || !source || !clone) {
							removeObjectById(res);

							results.push({
								err: "Image element not found",
								id: null
							});

							count++;
							recursiveFunc();
							return false;
						}

						if (existsId(thisState.id) === true) {
							removeObjectById(res);

							results.push({
								err: "ID duplicated",
								id: null
							});

							count++;
							recursiveFunc();
							return false;
						}

						if (isNumeric(thisState.x)) {
							thisState.x = parseFloat(thisState.x) * scaleRatio;
						}

						if (isNumeric(thisState.y)) {
							thisState.y = parseFloat(thisState.y) * scaleRatio;
						}

						if (isNumeric(thisState.width)) {
							thisState.width = parseFloat(thisState.width) * scaleRatio;
						}

						if (isNumeric(thisState.height)) {
							thisState.height = parseFloat(thisState.height) * scaleRatio;
						}

						// save cache
						pushUndoCache(state.id, true);

						// save state
						setState(state, thisState);

						// adjust state
						setObject(source, state);
						setObject(clone, state);

						results.push({
							err: null,
							id: state.id
						});

						count++;
						recursiveFunc();
					});
				} else {
					onUpload = false;

					if (cb) {
						cb(null, results)
					}
				}
			}
		}

		myObject.destroy = function(cb){
			if (isInitialized !== true) {
				if (cb) {
					cb("Canvas not initialized");
				}
				return false;
			}

			window.removeEventListener("resize", windowResizeEvent, false);
			window.removeEventListener("scroll", windowScrollEvent, false);

			if (config.dropSpace !== undefined) {
				if ([
						"window",
						"document",
						"page",
						"screen",
						"all",
						"body"
				].indexOf(config.dropSpace) > -1) {
					document.removeEventListener('dragenter', handlers.preventDefaults, false);
					document.removeEventListener('dragleave', handlers.preventDefaults, false);
					document.removeEventListener('dragover', handlers.preventDefaults, false);
					document.removeEventListener('drop', handlers.preventDefaults, false);
					document.removeEventListener('drop', handlers.dropImages, false);
				}
			}

			containerObject.parentNode.removeChild(containerObject);

			config = {};

			copyObject(config, defaultConfig);

			eventState = {};
			undoCaches = [];
			redoCaches = [];
			containerState = {};
			canvasState = {};
			imageStates = [];

			containerObject = undefined;
			canvasObject = undefined;
			mirrorObject = undefined;
			imageObjects = [];

			windowScrollEvent = undefined;
			windowResizeEvent = undefined;

			isInitialized = false;

			onUpload = false;
			onMove = false;
			onZoom = false;
			onResize = false;
			onRotate = false;
			onFlip = false;
			onFreeze = false;
			onDraw = false;

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