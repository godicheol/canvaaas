/*!
 * 
 * canvaaas.js
 * 
 * 0.2.0
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
			], // array

			editable: true, // boolean

			checker: true, // boolean

			shortcut: false, // boolean

			magneticRange: 5, // number, px

			maxNumberOfImages: 999, // number

			cacheLevels: 999, // number

			containerAspectRatio: undefined, // number, width / height

			minContainerWidth: undefined, // number, px

			minContainerHeight: undefined, // number, px

			maxContainerWidth: 1, // number, px, 0 ~ 1

			maxContainerHeight: 0.7, // number, px, 0 ~ 1

			minCanvasWidth: 64, // number, px

			minCanvasHeight: 64, // number, px

			maxCanvasWidth: 4096, // number, px, for Mobile

			maxCanvasHeight: 4096, // number, px, for Mobile

			minImageWidth: 64, // number, px

			minImageHeight: 64, // number, px

			maxImageWidth: undefined, // number, px

			maxImageHeight: undefined, // number, px

			renderImageType: "contain", // string, "cover", "contain"

			renderImageWidth: 0.7, // number,  0 ~ 1

			renderImageHeight: 0.7, // number, 0 ~ 1

			upload: undefined, // callback function

			canvas: undefined, // callback function

			draw: undefined, // callback function

			focusIn: undefined, // callback function

			focusOut: undefined, // callback function

			id: undefined, // callback function

			index: undefined, // callback function

			move: undefined, // callback function

			resize: undefined, // callback function

			rotate: undefined, // callback function

			flip: undefined, // callback function

			opacity: undefined, // callback function

			permission: undefined, // callback function

			remove: undefined, // callback function
		};

		Object.freeze(defaultConfig);

		var classNames = {
			unfocusable: "unfocusabled",
			uneditable: "uneditabled",
			undrawable: "undrawabled",
			unindexable:"unindexabled",
			onFocused: "focused",
			onFrozen: "frozen",
			onChecker: "checker"
		}
		
		Object.freeze(classNames);

		var errorMessages = {
			noArgument: "Argument not found",
			errArgument: "Argument error",
		}

		Object.freeze(errorMessages);

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

		var config = {};

		var sourceId = "canvaaas-" + getShortId() + "-";
		var cloneId = "canvaaas-" + getShortId() + "-";

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

			stopEvents: function(e) {
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
						renderImage(files[count], function(err, res) {
							if (err) {
								if (config.upload) {
									config.upload(err);
								}
							} else {
								if (config.upload) {
									config.upload(null, getDataById(res));
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

			keydown: function(e) {
				e.preventDefault();
				// e.stopPropagation();

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
				if (config.magneticRange) {
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
				saveUndoCache(state.id, true);

				// save state
				setState(state, {
					x: axisX,
					y: axisY
				});

				// adjust state
				setObject(source, state);
				setObject(clone, state);

				if (config.move) {
					config.move(null, getDataByState(state));
				}
			},

			startFocusIn: function(e) {
				e.preventDefault();
				e.stopPropagation();

				// fix startZoom
				if (eventState.onMove === true) {
					return handlers.startMove(e);
				}

				if (!config.editable) {
					return false;
				}

				var source;
				try {
					if (!e.target.classList.contains("canvaaas-image")) {
						if (!e.target.parentNode.classList.contains("canvaaas-image")) {
							return false;
						} else {
							source = e.target.parentNode;
						}
					} else {
						source = e.target;
					}
				} catch (err) {
					return false;
				}

				if (eventState.target) {
					if (source.isSameNode(eventState.target)) {
						return false;
					}
				}

				var state = getStateByObject(source);

				if (!source || !state) {
					return false;
				}

				if (!state.focusable) {
					return false;
				}

				if (eventState.target) {
					var oldId = getIdByObject(eventState.target);
					setFocusOut(oldId);

					if (config.focusOut) {
						config.focusOut(null, getDataById(oldId));
					}
				}

				setFocusIn(state.id);

				handlers.startMove(e);

				if (config.focusIn) {
					config.focusIn(null, getDataByState(state));
				}
			},

			startFocusOut: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!eventState.target) {
					return false;
				}

				if (eventState.onMove === true) {
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

				try {
					if (!eventState.target.isSameNode(e.target)) {
						var id = getIdByObject(eventState.target);
						setFocusOut(id);

						if (config.focusOut) {
							config.focusOut(null, getDataById(id));
						}
					}
				} catch (err) {
					return false;
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
				eventState.onMove = true;

				// save cache
				saveUndoCache(state.id, true);

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

				if (!eventState.onMove) {
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
				if (config.magneticRange) {
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

				// if (config.move) {
				// 	config.move(null, getDataByState(state));
				// }
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
				eventState.onMove = false;

				// remove event handles
				document.removeEventListener("mousemove", handlers.onMove, false);
				document.removeEventListener("mouseup", handlers.endMove, false);

				document.removeEventListener("touchmove", handlers.onMove, false);
				document.removeEventListener("touchend", handlers.endMove, false);

				if (config.move) {
					config.move(null, getDataByState(state));
				}
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
				eventState.onRotate = true;

				// save cache
				saveUndoCache(state.id, true);

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

				if (!eventState.onRotate) {
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

				// if (config.rotate) {
				// 	config.rotate(null, getDataByState(state));
				// }
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
				eventState.onRotate = false;

				document.removeEventListener("mousemove", handlers.onRotate, false);
				document.removeEventListener("mouseup", handlers.endRotate, false);

				document.removeEventListener("touchmove", handlers.onRotate, false);
				document.removeEventListener("touchend", handlers.endRotate, false);

				if (config.rotate) {
					config.rotate(null, getDataByState(state));
				}
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
				var aspectRatio;

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

				aspectRatio = state.originalWidth / state.originalHeight;

				maxSizes = getFittedRect(
					config.maxImageWidth || 99999,
					config.maxImageHeight || 99999,
					aspectRatio
				);

				minSizes = getFittedRect(
					config.minImageWidth || 0,
					config.minImageHeight || 0,
					aspectRatio,
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
				eventState.onResize = true;

				// save cache
				saveUndoCache(state.id, true);

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

				if (!eventState.onResize) {
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

				// if (config.resize) {
				// 	config.resize(null, getDataByState(state));
				// }
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
				eventState.onResize = false;

				// remove event handles
				document.removeEventListener("mousemove", handlers.onResize, false);
				document.removeEventListener("mouseup", handlers.endResize, false);

				document.removeEventListener("touchmove", handlers.onResize, false);
				document.removeEventListener("touchend", handlers.endResize, false);

				if (config.resize) {
					config.resize(null, getDataByState(state));
				}
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
				var aspectRatio;

				if (!config.editable) {
					return false;
				}

				if (
					eventState.onMove === true || 
					eventState.onResize === true || 
					eventState.onRotate === true 
				) {
					return false;
				}

				if (!source || !state || !clone) {
					return false;
				}

				if (!state.editable) {
					return false;
				}

				ratio = -e.deltaY * 0.001;
				diffX = state.width * ratio;
				diffY = state.height * ratio;
				width = state.width + diffX;
				height = state.height + diffY;

				if (!eventState.onZoom) {
					// toggle on
					eventState.onZoom = true;

					// save cache
					saveUndoCache(state.id, true);

					aspectRatio = state.originalWidth / state.originalHeight;

					maxSizes = getFittedRect(
						config.maxImageWidth || 99999,
						config.maxImageHeight || 99999,
						aspectRatio
					);

					minSizes = getFittedRect(
						config.minImageWidth || 0,
						config.minImageHeight || 0,
						aspectRatio,
						"cover"
					);

					eventState.maxW = maxSizes[0];
					eventState.maxH = maxSizes[1];
					eventState.minW = minSizes[0];
					eventState.minH = minSizes[1];
				}

				maxW = eventState.maxW;
				maxH = eventState.maxH;
				minW = eventState.minW;
				minH = eventState.minH;

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

				// if (config.resize) {
				// 	config.resize(null, getDataByState(state));
				// }

				eventState.wheeling = setTimeout(function() {
					// remove timer
					eventState.wheeling = undefined;

					// toggle off
					eventState.onZoom = false;

					if (config.resize) {
						config.resize(null, getDataByState(state));
					}
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
				var aspectRatio;

				if (eventState.onMove === true) {
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

				aspectRatio = state.originalWidth / state.originalHeight;

				maxSizes = getFittedRect(
					config.maxImageWidth || 99999,
					config.maxImageHeight || 99999,
					aspectRatio
				)

				minSizes = getFittedRect(
					config.minImageWidth || 0,
					config.minImageHeight || 0,
					aspectRatio,
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
				eventState.onZoom = true;

				// save cache
				saveUndoCache(state.id, true);

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

				if (!eventState.onZoom) {
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

				// if (config.resize) {
				// 	config.resize(null, getDataByState(state));
				// }
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
				eventState.onZoom = false;

				// remove event handles
				document.removeEventListener("touchmove", handlers.onPinchZoom, false);
				document.removeEventListener("touchend", handlers.endPinchZoom, false);

				if (config.resize) {
					config.resize(null, getDataByState(state));
				}

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
				if (!containerObject || !containerState) {
					return false;
				}

				if (!containerState.isInitialized) {
					return false;
				}

				var containerOffset = containerObject.getBoundingClientRect();
				containerState.left = containerOffset.left;
				containerState.top = containerOffset.top;
			},

			resizeWindow: function(e){
				e.preventDefault();
				e.stopPropagation();

				if (!canvasState.isInitialized) {
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
				});
			},

		};

		// 
		// methods
		// 

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
				transform = "",
				backgroundColor,
				isImage = false;

			if (
				elem.classList.contains("canvaaas-image") ||
				elem.classList.contains("canvaaas-clone")
			) {
				isImage = true;
			}

			left = ( state.x - (state.width * 0.5) ) + "px";
			top = ( state.y - (state.height * 0.5) ) + "px";
			width = state.width + "px";
			height = state.height + "px";
			index = state.index;
			opacity = state.opacity;
			backgroundColor = state.backgroundColor;

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
			elem.style.backgroundColor = backgroundColor;

			if (isImage === true) {

				var img = elem.querySelector("img");

				if (img) {
					img.style.opacity = opacity;
				}

				if (!state.editable) {
					if (!elem.classList.contains(classNames.uneditable)) {
						elem.classList.add(classNames.uneditable);
					}
				} else {
					if (elem.classList.contains(classNames.uneditable)) {
						elem.classList.remove(classNames.uneditable);
					}
				}

				if (!state.focusable) {
					if (!elem.classList.contains(classNames.unfocusable)) {
						elem.classList.add(classNames.unfocusable);
					}
				} else {
					if (elem.classList.contains(classNames.unfocusable)) {
						elem.classList.remove(classNames.unfocusable);
					}
				}

				if (!state.drawable) {
					if (!elem.classList.contains(classNames.undrawable)) {
						elem.classList.add(classNames.undrawable);
					}
				} else {
					if (elem.classList.contains(classNames.undrawable)) {
						elem.classList.remove(classNames.undrawable);
					}
				}

				if (!state.indexable) {
					if (!elem.classList.contains(classNames.unindexable)) {
						elem.classList.add(classNames.unindexable);
					}
				} else {
					if (elem.classList.contains(classNames.unindexable)) {
						elem.classList.remove(classNames.unindexable);
					}
				}
			}

			return true;
		};

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
			} else if (typeof(additionalState.lockAspectRatio) === "string") {
				if (additionalState.lockAspectRatio === "true") {
					state.lockAspectRatio = true;
				} else if (additionalState.lockAspectRatio === "false") {
					state.lockAspectRatio = false;
				}
			}

			if (typeof(additionalState.focusable) === "boolean") {
				state.focusable = additionalState.focusable;
			} else if (typeof(additionalState.focusable) === "string") {
				if (additionalState.focusable === "true") {
					state.focusable = true;
				} else if (additionalState.focusable === "false") {
					state.focusable = false;
				}
			}

			if (typeof(additionalState.editable) === "boolean") {
				state.editable = additionalState.editable;
			} else if (typeof(additionalState.editable) === "string") {
				if (additionalState.editable === "true") {
					state.editable = true;
				} else if (additionalState.editable === "false") {
					state.editable = false;
				}
			}

			if (typeof(additionalState.drawable) === "boolean") {
				state.drawable = additionalState.drawable;
			} else if (typeof(additionalState.drawable) === "string") {
				if (additionalState.drawable === "true") {
					state.drawable = true;
				} else if (additionalState.drawable === "false") {
					state.drawable = false;
				}
			}

			if (typeof(additionalState.indexable) === "boolean") {
				state.indexable = additionalState.indexable;
			} else if (typeof(additionalState.indexable) === "string") {
				if (additionalState.indexable === "true") {
					state.indexable = true;
				} else if (additionalState.indexable === "false") {
					state.indexable = false;
				}
			}

			if (typeof(additionalState.isInitialized) === "boolean") {
				state.isInitialized = additionalState.isInitialized;
			} else if (typeof(additionalState.isInitialized) === "string") {
				if (additionalState.isInitialized === "true") {
					state.isInitialized = true;
				} else if (additionalState.isInitialized === "false") {
					state.isInitialized = false;
				}
			}

			return true;
		}

		function getDataById(id) {
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
			tmp.originalAspectRatio = getAspectRatio(state.originalWidth, state.originalHeight);
			tmp.originalWidth = state.originalWidth;
			tmp.originalHeight = state.originalHeight;
			tmp.width = state.width / scaleRatio;
			tmp.height = state.height / scaleRatio;
			tmp.aspectRatio = getAspectRatio(tmp.width, tmp.height);
			tmp.x = state.x / scaleRatio;
			tmp.y = state.y / scaleRatio;
			tmp.left = (state.x - (state.width * 0.5)) / scaleRatio;
			tmp.top = (state.y - (state.height * 0.5)) / scaleRatio;
			tmp.rotate = state.rotate;
			tmp.scaleX = state.scaleX;
			tmp.scaleY = state.scaleY;
			tmp.opacity = state.opacity;
			tmp.lockAspectRatio = state.lockAspectRatio;
			tmp.focusable = state.focusable;
			tmp.editable = state.editable;
			tmp.drawable = state.drawable;
			tmp.indexable = state.indexable;

			return tmp;
		}

		function getDataByState(state) {
			if (!state) {
				return false;
			}
			var scaleRatio = canvasState.width / canvasState.originalWidth;
			var oas = getAspectRatio(state.originalWidth, state.originalHeight);
			var as = getAspectRatio(state.width / scaleRatio, state.height / scaleRatio);

			var tmp = {};
			tmp.id = state.id;
			tmp.type = state.type;
			tmp.src = state.src;
			tmp.index = state.index;
			tmp.originalAspectRatio = oas[0] + ":" + oas[1];
			tmp.originalWidth = state.originalWidth;
			tmp.originalHeight = state.originalHeight;
			tmp.width = state.width / scaleRatio;
			tmp.height = state.height / scaleRatio;
			tmp.aspectRatio = as[0] + ":" + as[1];
			tmp.x = state.x / scaleRatio;
			tmp.y = state.y / scaleRatio;
			tmp.left = (state.x - (state.width * 0.5)) / scaleRatio;
			tmp.top = (state.y - (state.height * 0.5)) / scaleRatio;
			tmp.rotate = state.rotate;
			tmp.scaleX = state.scaleX;
			tmp.scaleY = state.scaleY;
			tmp.opacity = state.opacity;
			tmp.lockAspectRatio = state.lockAspectRatio;
			tmp.focusable = state.focusable;
			tmp.editable = state.editable;
			tmp.drawable = state.drawable;
			tmp.indexable = state.indexable;

			return tmp;
		}

		function getFittedState(state) {
			var scaleRatio = canvasState.width / canvasState.originalWidth;

			var tmp = {};

			var tmpId;
			if (state.id) {
				tmpId = state.id;
			} else if (state._id) {
				tmpId = state._id;
			}

			if (typeof(tmpId) === "string") {
				tmp.id = tmpId;
			} else if (typeof(tmpId) === "number") {
				tmp.id = "" + tmpId;
			}

			if (isNumeric(state.index)) {
				tmp.index = parseFloat(state.index);
			}

			if (isNumeric(state.x)) {
				tmp.x = parseFloat(state.x);
			}

			if (isNumeric(state.x)) {
				tmp.x = parseFloat(state.x) * scaleRatio;
			}

			if (isNumeric(state.y)) {
				tmp.y = parseFloat(state.y) * scaleRatio;
			}

			if (isNumeric(state.width)) {
				tmp.width = parseFloat(state.width) * scaleRatio;
			}

			if (isNumeric(state.height)) {
				tmp.height = parseFloat(state.height) * scaleRatio;
			}

			if (isNumeric(state.rotate)) {
				tmp.rotate = parseFloat(state.rotate);
			}

			if (isNumeric(state.scaleX)) {
				if (parseFloat(state.scaleX) > 0) {
					tmp.scaleX = 1;
				} else {
					tmp.scaleX = -1;
				}
			}

			if (isNumeric(state.scaleY)) {
				if (parseFloat(state.scaleY) > 0) {
					tmp.scaleY = 1;
				} else {
					tmp.scaleY = -1;
				}
			}

			if (isNumeric(state.opacity)) {
				if (parseFloat(state.opacity) > 1) {
					tmp.opacity = 1;
				} else if (parseFloat(state.opacity) < 0) {
					tmp.opacity = 0;
				} else {
					tmp.opacity = parseFloat(state.opacity);
				}
			}

			if (typeof(state.lockAspectRatio) === "boolean") {
				tmp.lockAspectRatio = state.lockAspectRatio;
			} else if (typeof(state.lockAspectRatio) === "string") {
				if (state.lockAspectRatio === "true") {
					tmp.lockAspectRatio = true;
				} else if (state.lockAspectRatio === "false") {
					tmp.lockAspectRatio = false;
				}
			}

			if (typeof(state.focusable) === "boolean") {
				tmp.focusable = state.focusable;
			} else if (typeof(state.focusable) === "string") {
				if (state.focusable === "true") {
					tmp.focusable = true;
				} else if (state.focusable === "false") {
					tmp.focusable = false;
				}
			}

			if (typeof(state.editable) === "boolean") {
				tmp.editable = state.editable;
			} else if (typeof(state.editable) === "string") {
				if (state.editable === "true") {
					tmp.editable = true;
				} else if (state.editable === "false") {
					tmp.editable = false;
				}
			}

			if (typeof(state.drawable) === "boolean") {
				tmp.drawable = state.drawable;
			} else if (typeof(state.drawable) === "string") {
				if (state.drawable === "true") {
					tmp.drawable = true;
				} else if (state.drawable === "false") {
					tmp.drawable = false;
				}
			}

			if (typeof(state.indexable) === "boolean") {
				tmp.indexable = state.indexable;
			} else if (typeof(state.indexable) === "string") {
				if (state.indexable === "true") {
					tmp.indexable = true;
				} else if (state.indexable === "false") {
					tmp.indexable = false;
				}
			}

			return tmp;
		}

		function getStateByAttribute(target) {
			var stateKeys = [
				"_id",
				"id",
				"state",
				"index",
				"originalWidth",
				"originalHeight",
				"x",
				"y",
				"width",
				"height",
				"rotate",
				"scaleX",
				"scaleY",
				"opacity",
				"lockAspectRatio",
				"focusable",
				"editable",
				"drawable",
				"indexable",
				"backgroundColor",
				"unit",
				"dpi",
			];

			var thisAttrs = {};
			for (var i = 0; i < stateKeys.length; i++) {
				var j = stateKeys[i];
				var tmp = target.getAttribute("data-" + j);
				if (
					tmp !== undefined &&
					tmp !== null &&
					tmp !== ""
				) {
					if (isNumeric(tmp)) {
						thisAttrs[j] = parseFloat(tmp);
					} else {
						thisAttrs[j] = tmp;
					}
				}
			}


			if (thisAttrs.state) {
				var tmp = {};
				try {
					var parsed = JSON.parse(thisAttrs.state);
					var parsedKeys = Object.keys(parsed);
					for (var i = 0; i < stateKeys.length; i++) {
						var j = stateKeys[i];
						if (isNumeric(parsed[j])) {
							tmp[j] = parseFloat(parsed[j]);
						} else if (typeof(parsed[j] === "string")) {
							tmp[j] = parsed[j];
						}
					}
				} catch(err) {
					console.log(err);
					tmp = {};
				}

				return tmp;
			} else {
				return thisAttrs;
			}
		}

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

		function saveUndoCache(id, clearRedoCaches) {
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (!source || !clone || !state) {
				return false;
			}

			var tmpState = {};
			copyObject(tmpState, state);

			var tmp = {};
			tmp.id = id;
			tmp.state = tmpState;
			tmp.sourceClass = source.className.replace(" "+classNames.onFocused, "").split(' ');
			tmp.cloneClass = clone.className.replace(" "+classNames.onFocused, "").split(' ');
			tmp.updatedAt = Date.now();

			undoCaches.push(tmp);

			if (undoCaches.length > config.cacheLevels) {
				undoCaches.shift();
			}

			if (clearRedoCaches) {
				redoCaches = [];
			}
			
			return true;
		}

		function saveRedoCache(id) {
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (!source || !clone || !state) {
				return false;
			}

			var tmpState = {};
			copyObject(tmpState, state);

			var tmp = {};
			tmp.id = id;
			tmp.state = tmpState;
			tmp.sourceClass = source.className.replace(" "+classNames.onFocused, "").split(' ');
			tmp.cloneClass = clone.className.replace(" "+classNames.onFocused, "").split(' ');
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
				if (!canvasObject.classList.contains(classNames.onFocused)) {
					canvasObject.classList.add(classNames.onFocused);
				}
				if (!mirrorObject.classList.contains(classNames.onFocused)) {
					mirrorObject.classList.add(classNames.onFocused);
				}

				if (!source.classList.contains(classNames.onFocused)) {
					source.classList.add(classNames.onFocused);
				}
				if (!clone.classList.contains(classNames.onFocused)) {
					clone.classList.add(classNames.onFocused);
				}

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

				if (config.shortcut) {
					document.addEventListener("keydown", handlers.keydown, false);
				}

				document.addEventListener("mousedown", handlers.startFocusOut, false);
				document.addEventListener("touchstart", handlers.startFocusOut, false);
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
				if (canvasObject.classList.contains(classNames.onFocused)) {
					canvasObject.classList.remove(classNames.onFocused);
				}
				if (mirrorObject.classList.contains(classNames.onFocused)) {
					mirrorObject.classList.remove(classNames.onFocused);
				}

				if (source.classList.contains(classNames.onFocused)) {
					source.classList.remove(classNames.onFocused);
				}
				if (clone.classList.contains(classNames.onFocused)) {
					clone.classList.remove(classNames.onFocused);
				}

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

				if (config.shortcut) {
					document.removeEventListener("keydown", handlers.keydown, false);
				}

				document.removeEventListener("mousedown", handlers.startFocusOut, false);
				document.removeEventListener("touchstart", handlers.startFocusOut, false);
			} catch(err) {
				console.log(err);
				return false;
			}

			eventState.target = undefined;

			return true;
		}

		function getConfigData(obj) {
			var tmp = {};
			var candidtaeKeys = [
				"filename",
				"allowedExtensions",
				"editable",
				"checker",
				"magneticRange",
				"maxNumberOfImages",
				"cacheLevels",
				"containerAspectRatio",
				"minContainerWidth",
				"minContainerHeight",
				"maxContainerWidth",
				"maxContainerHeight",
				"minCanvasWidth",
				"minCanvasHeight",
				"maxCanvasWidth",
				"maxCanvasHeight",
				"minImageWidth",
				"minImageHeight",
				"maxImageWidth",
				"maxImageHeight",
				"renderImageType",
				"renderImageWidth",
				"renderImageHeight",
			];

			candidtaeKeys.forEach(function(elem){
				tmp[elem] = obj[elem];
			});

			return tmp;
		}

		function getCanvasData(obj) {
			var tmp = {};
			var candidtaeKeys = [
				"isInitialized",
				"originalWidth",
				"originalHeight",
				"width",
				"height",
				"left",
				"top",
				"x",
				"y",
				"backgroundColor",
				"mimeType",
				"quality",
				"smoothingEnabled",
				"smoothingQuality"
			];

			candidtaeKeys.forEach(function(elem){
				tmp[elem] = obj[elem];
			});

			var as = getAspectRatio(tmp.originalWidth, tmp.originalHeight);
			tmp.aspectRatio = as[0] + ":" + as[1];

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

		function existsIndex(idx) {
			if (
				idx === undefined ||
				idx === null ||
				idx === ""
			) {
				return false;
			}

			var exists = imageStates.find(function(elem){
				if (elem.index === idx) {
					return elem;
				}
			});

			if (exists) {
				return true;
			} else {
				return false;
			}
		}

		function getIdByObject(obj) {
			if (!obj) {
				return false;
			}
			try {
				if (
					!obj.classList.contains("canvaaas-image") &&
					!obj.classList.contains("canvaaas-clone")
				) {
					return false;
				}
			} catch (err) {
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
			try {
				if (
					!obj.classList.contains("canvaaas-image") &&
					!obj.classList.contains("canvaaas-clone")
				) {
					return false;
				}
			} catch (err) {
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
			try {
				if (
					!obj.classList.contains("canvaaas-image") &&
					!obj.classList.contains("canvaaas-clone")
				) {
					return false;
				}
			} catch (err) {
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

		// 
		// calculate
		// 

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

		function dimensionsToPx(width, height, unit, dpi) {
			if (!isNumeric(width)) {
				return false;
			}
			if (!isNumeric(height)) {
				return false;
			}
			if (
				typeof(unit) !== "string" ||
				unit === ""
			) {
				return false;
			}
			if (!isNumeric(dpi)) {
				return false;
			}

			var w, h;
			switch(unit.toLowerCase()) {
				case "nm":
				case "nanometer":
				case "nanometers":
					w = parseFloat(width) * 3.937e-8;
					h = parseFloat(height) * 3.937e-8;
					break;
				case "mm":
				case "millimeter":
				case "millimeters":
					w = parseFloat(width) * 0.0393701;
					h = parseFloat(height) * 0.0393701;
					break;
				case "cm":
				case "centimeter":
				case "centimeters":
					w = parseFloat(width) * 0.393701;
					h = parseFloat(height) * 0.393701;
					break;
				case "m":
				case "meter":
				case "meters":
					w = parseFloat(width) * 39.3701;
					h = parseFloat(height) * 39.3701;
					break;
				case "km":
				case "kilometer":
				case "kilometers":
					w = parseFloat(width) * 39370.1;
					h = parseFloat(height) * 39370.1;
					break;
				case "in":
				case "inch":
				case "inches":
					w = parseFloat(width);
					h = parseFloat(height);
					break;
				case "mile":
				case "miles":
					w = parseFloat(width) * 63360;
					h = parseFloat(height) * 63360;
					break;
				case "yard":
				case "yards":
					w = parseFloat(width) * 36;
					h = parseFloat(height) * 36;
					break;
				case "nautical mile":
				case "nauticalmile":
				case "nmi":
					w = parseFloat(width) * 72913.4;
					h = parseFloat(height) * 72913.4;
					break;
				case "px":
				case "pixel":
				case "pixels":
					w = parseFloat(width);
					h = parseFloat(height);
					dpi = 1;
					break;
			}

			if (!w || !h) {
				return false;
			}

			w *= parseFloat(dpi);
			h *= parseFloat(dpi);

			return [w, h]
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
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");

			var width = options.width;
			var height = options.height;
			var aspectRatio = options.width / options.height;
			var fillStyle = options.backgroundColor || "#FFFFFF";

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

			virtualImg.onerror = function(err) {
				return cb(err);
			}
			virtualImg.onload = function(e) {
				var maxWidth = config.maxCanvasWidth || 99999;
				var maxHeight = config.maxCanvasHeight || 99999;
				var minWidth = config.minCanvasWidth || 0;
				var minHeight = config.minCanvasHeight || 0;

				// original
				var scaleRatio = canvas.width / canvasState.width;
				var adjW = state.width * scaleRatio;
				var adjH = state.height * scaleRatio;
				var adjX = state.x * scaleRatio;
				var adjY = state.y * scaleRatio;

				// original & rotate
				var rotatedSizes = getRotatedRect(
					adjW,
					adjH,
					state.rotate
				);
				var rotatedWidth = Math.floor(rotatedSizes[0]);
				var rotatedHeight = Math.floor(rotatedSizes[1]);
				var rotatedLeft = Math.floor(adjX - (rotatedSizes[0] * 0.5));
				var rotatedTop = Math.floor(adjY - (rotatedSizes[1] * 0.5));

				// original & rotate & resize
				var maxSizes = getFittedRect(
					maxWidth,
					maxHeight,
					rotatedWidth / rotatedHeight,
				);
				var minSizes = getFittedRect(
					minWidth,
					minHeight,
					rotatedWidth / rotatedHeight,
					'cover'
				);
				var canvasWidth = Math.min(maxSizes[0], Math.max(minSizes[0], rotatedWidth));
				var canvasHeight = Math.min(maxSizes[1], Math.max(minSizes[1], rotatedHeight));

				// orignal & resize
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
		function renderImage(file, cb) {
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
				if (!canvasState.isInitialized) {
					setState(canvasState, {
						originalWidth: newImage.width,
						originalHeight: newImage.height
					});

					initContainer();

					initCanvas();
				}

				// get last index
				var nextIndex = 0;
				imageStates.forEach(function(elem){
					if (nextIndex < elem.index) {
						nextIndex = elem.index;
					}
				});
				nextIndex += 1;

				// create states
				var originalWidth = newImage.width;
				var originalHeight = newImage.height;

				var aspectRatio = originalWidth / originalHeight;

				var fittedSizes = getFittedRect(
					canvasState.width * config.renderImageWidth,
					canvasState.height * config.renderImageHeight,
					aspectRatio,
					config.renderImageType
				);

				var index = nextIndex;
				var width = fittedSizes[0];
				var height = fittedSizes[1];
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
				var indexable = true;

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
				newState.indexable = indexable;

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

				// adjust state
				setObject(newSource, newState);
				setObject(newClone, newState);

				canvasObject.appendChild(newSource);
				mirrorObject.appendChild(newClone);

				imageStates.push(newState);
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
			var viewportWidth = viewportSizes[0] || 99999;
			var viewportHeight = viewportSizes[1] || 99999;

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

			var width = Math.min(maxSizes[0], Math.max(minSizes[0], containerWidth));
			var height = Math.min(maxSizes[1], Math.max(minSizes[1], containerHeight));
			var offset = containerObject.getBoundingClientRect();

			// save state
			setState(containerState, {
				width: width,
				height: height,
				left: offset.left,
				top: offset.top,
				isInitialized: true
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
			if (!containerState.isInitialized) {
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
			var left = Math.round( 0.5 * (containerState.width - fittedSizes[0]) );
			var top = Math.round( 0.5 * (containerState.height - fittedSizes[1]) );

			// save state
			setState(canvasState, {
				originalWidth: originalWidth,
				originalHeight: originalHeight,
				x: axisX,
				y: axisY,
				left: left,
				top: top,
				width: fittedSizes[0],
				height: fittedSizes[1],
				isInitialized: true
			});

			// adjust state
			setObject(canvasObject, canvasState);
			setObject(mirrorObject, canvasState);

			return true;
		}

		// 
		// exports
		// 

		// 
		// init
		// 

		myObject.init = function(target, cb) {
			if (containerState.isInitialized === true) {
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

			containerState.isInitialized = false;

			// set elements
			containerObject = target.querySelector("div.canvaaas");
			canvasObject = target.querySelector("div.canvaaas-canvas");
			mirrorObject = target.querySelector("div.canvaaas-mirror");

			// set canvasState
			canvasState.isInitialized = false;
			canvasState.quality = 0.92;
			canvasState.mimeType = "image/png";
			canvasState.smoothingQuality = "low"; // "low", "medium", "high"
			canvasState.smoothingEnabled = false; // false, true
			canvasState.backgroundColor = "#FFFFFF";

			if (config.checker === true) {
				if (!canvasObject.classList.contains(classNames.onChecker)) {
					canvasObject.classList.add(classNames.onChecker);
				}
			}

			if (
				canvasState.originalWidth &&
				canvasState.originalHeight
			) {
				// set container
				initContainer();

				// set canvas
				initCanvas();
			}

			// set events
			windowResizeEvent = handlers.resizeWindow;
			windowScrollEvent = handlers.debounce( handlers.whereContainer, 300 );

			window.addEventListener("resize", windowResizeEvent, false);
			window.addEventListener("scroll", windowScrollEvent, false);

			containerObject.addEventListener('dragenter', handlers.stopEvents, false);
			containerObject.addEventListener('dragleave', handlers.stopEvents, false);
			containerObject.addEventListener('dragover', handlers.stopEvents, false);
			containerObject.addEventListener('drop', handlers.dropImages, false);

			// console.log("canvaaas.js initialized", config);

			if (cb) {
				cb(null, getConfigData(config));
			}
			return getConfigData(config);
		}

		// 
		// upload
		// 

		// asynchronous
		myObject.uploadFiles = function(self, cb) {
			if (eventState.onUpload === true) {
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

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderImage(thisFiles[count], function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
							results.push({
								err: err
							});
						} else {
							if (config.upload) {
								config.upload(null, res);
							}
							results.push(getDataById(res));
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;

					if (cb) {
						cb(null, results);
					}
				}
			}
		}

		// asynchronous
		myObject.uploadUrl = function(imageUrl, imageState, cb) {
			var thisState,
				thisCb;

			if (typeof(imageState) === "object") {
				thisState = imageState;
				thisCb = cb;
			} else if (typeof(imageState) === "funciton") {
				thisState = {};
				thisCb = imageState;
			} else if (typeof(imageState) === "string") {
				var tmp;
				try {
					tmp = JSON.parse(imageState);
				} catch(err) {
					tmp = {};
				}

				thisState = tmp;
				thisCb = cb;
			} else {
				thisState = {};
				thisCb = cb;
			}

			if (eventState.onUpload === true) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (thisCb) {
					thisCb("Already in progress");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.upload) {
					config.upload("Editing has been disabled");
				}
				if (thisCb) {
					thisCb("Editing has been disabled");
				} 
				return false;
			}

			var thisSrc = imageUrl;
			if (!thisSrc) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (thisCb) {
					thisCb("File not found");
				} 
				return false;
			}

			eventState.onUpload = true;

			renderImage(thisSrc, function(err, res) {
				if (err) {
					if (config.upload) {
						config.upload(err);
					}
					if (thisCb) {
						thisCb(err);
					}
					return false;
				}

				var state = getStateById(res);
				var source = getSourceById(res);
				var clone = getCloneById(res);

				var fittedState = getFittedState(thisState);

				// save cache
				saveUndoCache(res, true);

				// save state
				setState(state, fittedState);

				// adjust state
				setObject(source, state);
				setObject(clone, state);

				eventState.onUpload = false;

				if (config.upload) {
					config.upload(null, getDataByState(state));
				}
				if (thisCb) {
					thisCb(null, getDataByState(state));
				}
			});
		}

		// asynchronous
		myObject.uploadElement = function(target, cb) {
			if (eventState.onUpload === true) {
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
				typeof(target) !== "object" ||
				target === null
			) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				} 
				return false;
			}

			var thisState = getStateByAttribute(target);

			var thisSrc;
			if (target.src) {
				thisSrc = target.src;
			} else if (thisState.src) {
				thisSrc = thisState.src;
			} else {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				} 
				return false;
			}

			eventState.onUpload = true;

			renderImage(thisSrc, function(err, res) {
				if (err) {
					if (config.upload) {
						config.upload(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}

				var state = getStateById(res);
				var source = getSourceById(res);
				var clone = getCloneById(res);

				var fittedState = getFittedState(thisState);

				// save cache
				saveUndoCache(res, true);

				// save state
				setState(state, fittedState);

				// adjust state
				setObject(source, state);
				setObject(clone, state);

				eventState.onUpload = false;

				if (config.upload) {
					config.upload(null, getDataByState(state));
				}
				if (cb) {
					cb(null, getDataByState(state));
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
				if (config.id) {
					config.id("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (
				typeof(newId) !== "string" &&
				typeof(newId) !== "number"
			) {
				if (config.id) {
					config.id("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (typeof(newId) === "number") {
				newId = "" + newId;
			}

			if (newId.trim() === "") {
				if (config.id) {
					config.id("Argument error");
				}
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.id) {
					config.id("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				} 
				return false;
			}

			if (!source || !state || !clone) {
				if (config.id) {
					config.id("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!state.editable) {
				if (config.id) {
					config.id("This image has been uneditabled");
				}
				if (cb) {
					cb("This image has been uneditabled");
				} 
				return false;
			}

			if (existsId(newId)) {
				if (config.id) {
					config.id("ID duplicated");
				}
				if (cb) {
					cb("ID duplicated");
				} 
				return false;
			}

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				id: newId
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.id) {
				config.id(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state))
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				x: axisX
			})

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.move) {
				config.move(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				y: axisY
			})

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.move) {
				config.move(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				x: axisX,
				y: axisY
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.move) {
				config.move(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

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
				config.resize(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				width: width,
				height: height
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.resize) {
				config.resize(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

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
				config.resize(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

			var rotate = state.rotate + parseFloat(deg);

			// save state
			setState(state, {
				rotate: rotate
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.rotate) {
				config.rotate(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				rotate: rotate
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.rotate) {
				config.rotate(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				scaleX: scaleX,
				rotate: rotate
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.flip) {
				config.flip(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			} 
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				scaleY: scaleY,
				rotate: rotate
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.flip) {
				config.flip(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			} 
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

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
				config.flip(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			} 
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				opacity: opacity
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.opacity) {
				config.opacity(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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

			if (!state.indexable) {
				if (config.index) {
					config.index("This image has been unindexabled");
				}
				if (cb) {
					cb("This image has been unindexabled");
				} 
				return false;
			}

			num = parseInt(num);

			// recursive
			var diff = Math.abs(num);
			for (var i = 0; i < diff; i++) {
				var thisIndex = state.index;
				var nextIndex;
				if (num < 0) {
					nextIndex = thisIndex - 1;
				} else {
					nextIndex = thisIndex + 1;
				}

				if (nextIndex < 0) {
					continue;
				}

				// check next index
				var isIndexable = true;
				var dupeStates = getStatesByIndex(nextIndex);
				if (dupeStates.length > 0) {
					dupeStates.forEach(function(elem){
						if (!elem.indexable) {
							isIndexable = false;
						}
					})

					if (isIndexable === true) {
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

				if (isIndexable === true) {
					// save state
					setState(state, {
						index: nextIndex
					});

					// adjust state
					setObject(source, state);
					setObject(clone, state);
				}
			}

			if (config.index) {
				config.index(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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

			if (!state.indexable) {
				if (config.index) {
					config.index("This image has been unindexabled");
				}
				if (cb) {
					cb("This image has been unindexabled");
				} 
				return false;
			}

			num = parseInt(num);

			var thisIndex = state.index;
			var nextIndex = num;

			var isIndexable = true;

			// check duplicate
			var dupeStates = getStatesByIndex(nextIndex);
			if (dupeStates.length > 0) {
				dupeStates.forEach(function(elem){
					if (!elem.indexable) {
						isIndexable = false;
					}
				})

				if (!isIndexable) {
					if (config.index) {
						config.index("Target image has been unindexabled");
					}
					if (cb) {
						cb("Target image has been unindexabled");
					} 
					return false;
				}

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

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				index: nextIndex
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.index) {
				config.index(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
				config.focusIn(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
				config.focusOut(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

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
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);
			
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
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				lockAspectRatio: lockAspectRatio
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.toggleFocusable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			var focusable = state.focusable === false;

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				focusable: focusable
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			// focus out
			if (focusable === false) {
				if (eventState.target) {
					if (source.isSameNode(eventState.target)) {
						var res = setFocusOut(id);
						if (res === true) {
							if (config.focusOut) {
								config.focusOut(null, getDataById(id));
							}
						}
					}	
				}
			}

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.toggleEditable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			var editable = state.editable === false;

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				editable: editable
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.toggleDrawable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
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

			var drawable = state.drawable === false;

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				drawable: drawable
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.toggleIndexable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			var indexable = state.indexable === false;

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				indexable: indexable
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.focusable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				focusable: true
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.editable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				editable: true
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.drawable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				drawable: true
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.indexable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				indexable: true
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.unfocusable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (eventState.target) {
				if (source.isSameNode(eventState.target)) {
					var res = setFocusOut(id);
					if (res === true) {
						if (config.focusOut) {
							config.focusOut(null, getDataById(id));
						}
					}
				}	
			}

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				focusable: false
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.uneditable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				editable: false
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.undrawable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				drawable: false
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
		}

		myObject.unindexable = function(id, cb){
			var source = getSourceById(id);
			var clone = getCloneById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.permission) {
					config.permission("Argument error");
				} 
				if (cb) {
					cb("Argument error");
				} 
				return false;
			}

			if (!config.editable) {
				if (config.permission) {
					config.permission("Editing has been disabled");
				} 
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (!source || !state || !clone) {
				if (config.permission) {
					config.permission("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			// save cache
			saveUndoCache(state.id, true);

			// save state
			setState(state, {
				indexable: false
			});

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (config.permission) {
				config.permission(null, getDataByState(state));
			}
			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
					// if (res === true) {
					// 	if (config.focusOut) {
					// 		config.focusOut(null, id);
					// 	}
					// }
				}
			}

			// remove element
			var tmp = getDataById(id)
			var res = removeObjectById(id);
			if (!res) {
				if (config.remove) {
					config.remove("`removeObjectById()` error");
				} 
				if (cb) {
					cb("`removeObjectById()` error");
				}
				return false;
			}
			if (config.remove) {
				config.remove(null, tmp);
			} 
			if (cb) {
				cb(null, tmp);
			}
			return tmp;
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
					var tmp = getDataById(arr[count]);
					var res = removeObjectById(arr[count]);
					if (!res) {
						if (config.remove) {
							config.remove("`removeObjectById()` error");
						}
						results.push({
							err: "`removeObjectById()` error"
						});
					} else {
						if (config.remove) {
							config.remove(null, tmp);
						} 
						results.push(tmp);
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

		// deprecated
		myObject.state = function(newStates, cb) {
			if (!Array.isArray(newStates)) {
				if (
					typeof(newStates) !== "object" ||
					newStates === null
				) {
					if (typeof(newStates) !== "string") {
						if (cb) {
							cb("Argument error");
						} 
						return false;
					} else {
						var tmp;
						try {
							tmp = JSON.parse(newStates);
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
							newStates = tmp;
						}
					}

					if (!Array.isArray(newStates)) {
						newStates = [newStates];
					}
				}
			}

			if (!config.editable) {
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			var results = [];
			for (var i = 0; i < newStates.length; i++) {
				var newState = newStates[i];

				if (!existsId(newState.id)) {
					results.push({
						err: "Image not found"
					});
					continue;
				}

				var source = getSourceById(newState.id);
				var clone = getCloneById(newState.id);
				var state = getStateById(newState.id);

				if (!source || !clone || !state) {
					results.push({
						err: "Image not found"
					});
					continue;
				}

				// save cache
				saveUndoCache(state.id, true);

				// save state
				setState(state, newState);

				// adjust state
				setObject(source, state);
				setObject(clone, state);

				results.push(getDataByState(state));
			}

			if (cb) {
				cb(null, results);
			}
			return results;
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

			var fittedSizes = getFittedRect(
				canvasState.width * config.renderImageWidth,
				canvasState.height * config.renderImageHeight,
				aspectRatio,
				config.renderImageType
			);

			var width = fittedSizes[0];
			var height = fittedSizes[1];
			var axisX = canvasState.width * 0.5;
			var axisY = canvasState.height * 0.5;

			// save cache
			saveUndoCache(state.id, true);

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
				indexable: true,
			});
			
			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
				cb(null, getConfigData(config));
			}
			return getConfigData(config);
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

			if (
				bool === true ||
				bool === 1 ||
				bool === "true"
			) {
				config.checker = true;
				if (!canvasObject.classList.contains(classNames.onChecker)) {
					canvasObject.classList.add(classNames.onChecker);
				}
			} else if (
				bool === false ||
				bool === 0 ||
				bool === -1 ||
				bool === "false" ||
				bool === "none"
			) {
				config.checker = false;
				if (canvasObject.classList.contains(classNames.onChecker)) {
					canvasObject.classList.remove(classNames.onChecker);
				}
			} else {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (cb) {
				cb(null, getConfigData(config));
			}
			return getConfigData(config);
		}

		// 
		// canvas
		// 

		myObject.canvas = function(options, cb) {
			if (
				typeof(options) !== "object" ||
				options === null
			) {
				if (config.canvas) {
					config.canvas("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (
				!isNumeric(options.width) ||
				!isNumeric(options.height)
			) {
				if (config.canvas) {
					config.canvas("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (!config.editable) {
				if (config.canvas) {
					config.canvas("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			var inputW = parseFloat(options.width);
			var inputH = parseFloat(options.height);
			var inputU = options.unit || "px";
			var inputD = isNumeric(options.dpi) ? parseFloat(options.dpi) : 300;

			var sizes = dimensionsToPx(inputW, inputH, inputU, inputD);
			if (!sizes) {
				if (config.canvas) {
					config.canvas("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (!canvasState.isInitialized) {
				setState(canvasState, {
					originalWidth: sizes[0],
					originalHeight: sizes[1],
				});

				if (config.canvas) {
					config.canvas(null, getCanvasData(canvasState));
				}
				if (cb) {
					cb(null, getCanvasData(canvasState));
				}
				return getCanvasData(canvasState);
			}

			var newW = sizes[0];
			var newH = sizes[1];

			var oldW = canvasState.originalWidth;
			var oldH = canvasState.originalHeight;

			setState(canvasState, {
				originalWidth: newW,
				originalHeight: newH,
			});

			// set container
			initContainer();

			// set canvas
			initCanvas();

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

			if (config.canvas) {
				config.canvas(null, getCanvasData(canvasState));
			}
			if (cb) {
				cb(null, getCanvasData(canvasState));
			}
			return getCanvasData(canvasState);
		}

		myObject.quality = function(num, cb) {
			if (!isNumeric(num)) {
				if (config.canvas) {
					config.canvas("Argument error");
				}
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

			if (config.canvas) {
				config.canvas(null, getCanvasData(canvasState));
			}
			if (cb) {
				cb(null, getCanvasData(canvasState));
			}
			return getCanvasData(canvasState);
		}

		myObject.mimeType = function(mimeType, cb) {
			if (typeof(mimeType) !== "string") {
				if (config.canvas) {
					config.canvas("Argument error");
				}
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
					if (config.canvas) {
						config.canvas("Argument error");
					}
					if (cb) {
						cb("Argument error");
					}
					return false;
				}
			}

			canvasState.mimeType = mimeType;

			if (config.canvas) {
				config.canvas(null, getCanvasData(canvasState));
			}
			if (cb) {
				cb(null, getCanvasData(canvasState));
			}
			return getCanvasData(canvasState);
		}

		myObject.backgroundColor = function(colour, cb) {
			if (typeof(colour) !== "string") {
				if (config.canvas) {
					config.canvas("Argument error");
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

			canvasState.backgroundColor = colour;

			setObject(canvasObject, canvasState);

			if (config.canvas) {
				config.canvas(null, getCanvasData(canvasState));
			}
			if (cb) {
				cb(null, getCanvasData(canvasState));
			}
			return getCanvasData(canvasState);
		}

		myObject.smoothingQuality = function(str, cb) {
			if (typeof(str) !== "string") {
				if (config.canvas) {
					config.canvas("Argument error");
				}
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
				if (config.canvas) {
					config.canvas("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			canvasState.smoothingQuality = str;

			if (config.canvas) {
				config.canvas(null, getCanvasData(canvasState));
			}
			if (cb) {
				cb(null, getCanvasData(canvasState));
			}
			return getCanvasData(canvasState);
		}

		myObject.smoothingEnabled = function(str, cb) {
			if (
				!isNumeric(str) &&
				typeof(str) !== "boolean" &&
				typeof(str) !== "string"
			) {
				if (config.canvas) {
					config.canvas("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			var enabled;
			if (isNumeric(str) === true) {
				str = parseInt(str);

				if (str === 1) {
					enabled = true;
				} else if (str === 0){
					enabled = false;
				}
			} else if (typeof(str) === "boolean") {
				enabled = str;
			} else if (typeof(str) === "string") {
				if (str === "true") {
					enabled = true;
				} else if (str === "false") {
					enabled = false;
				}
			}

			if (enabled === undefined) {
				if (config.canvas) {
					config.canvas("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			canvasState.smoothingEnabled = enabled;

			if (config.canvas) {
				config.canvas(null, getCanvasData(canvasState));
			}
			if (cb) {
				cb(null, getCanvasData(canvasState));
			}
			return getCanvasData(canvasState);
		}

		myObject.freeze = function(cb){
			if (eventState.onFrozen === true) {
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
			eventState.onFrozen = true;

			if (!canvasObject.classList.contains(classNames.onFrozen)) {
				canvasObject.classList.add(classNames.onFrozen);
			}

			if (config.checker === true) {
				if (canvasObject.classList.contains(classNames.onChecker)) {
					canvasObject.classList.remove(classNames.onChecker);
				}
			}

			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.thaw = function(cb){
			if (eventState.onFrozen === false) {
				if (cb) {
					cb("No progress in");
				}
				return false;
			}

			config.editable = true;
			eventState.onFrozen = false;

			if (canvasObject.classList.contains(classNames.onFrozen)) {
				canvasObject.classList.remove(classNames.onFrozen);
			}

			if (config.checker === true) {
				if (!canvasObject.classList.contains(classNames.onChecker)) {
					canvasObject.classList.add(classNames.onChecker);
				}
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
			 * height,
			 * quality,
			 * mimeType,
			 * backgroundColor,
			 * smoothingQuality,
			 * smoothingEnabled
			 * }
			 */

			if (eventState.onDraw === true) {
				if (config.draw) {
					config.draw("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

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
				var fittedSizes = getFittedRect(
					options.width || canvasState.originalWidth,
					options.height || canvasState.originalHeight,
					canvasState.originalWidth / canvasState.originalHeight,
					"contain"
				);
				
				canvasWidth = fittedSizes[0];
				canvasHeight = fittedSizes[1];
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
				if (imageStates[i].drawable === true) {
					drawables.push(getDataByState(imageStates[i]));
				}
			}

			drawables.sort(function(a, b){
				return a.index - b.index;
			});

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

			eventState.onDraw = true;

			var index = drawables.length;
			var count = 0;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// recursive
					drawImage(canvas, drawables[count].id, function(err) {
						if (err) {
							drawResults.push({
								err: err,
								id: drawables[count].id
							});
						} else {
							drawResults.push(drawables[count]);
						}
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

					eventState.onDraw = false;

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

		myObject.drawToFile = function(options, cb){
			/*!
			 * options = {
			 * width, 
			 * height,
			 * quality,
			 * mimeType,
			 * backgroundColor,
			 * smoothingQuality,
			 * smoothingEnabled
			 * }
			 */

			if (eventState.onDraw === true) {
				if (config.draw) {
					config.draw("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

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
				var fittedSizes = getFittedRect(
					options.width || canvasState.originalWidth,
					options.height || canvasState.originalHeight,
					canvasState.originalWidth / canvasState.originalHeight,
					"contain"
				);
				
				canvasWidth = fittedSizes[0];
				canvasHeight = fittedSizes[1];
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
				if (imageStates[i].drawable === true) {
					drawables.push(getDataByState(imageStates[i]));
				}
			}

			drawables.sort(function(a, b){
				return a.index - b.index;
			});

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

			eventState.onDraw = true;

			var index = drawables.length;
			var count = 0;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// recursive
					drawImage(canvas, drawables[count].id, function(err) {
						if (err) {
							drawResults.push({
								err: err,
								id: drawables[count].id
							});
						} else {
							drawResults.push(drawables[count]);
						}
						count++;
						recursiveFunc();
					});
				} else {
					// end
					var ctx = canvas.getContext("2d");
					ctx.imageSmoothingQuality = imageSmoothingQuality;
					ctx.imageSmoothingEnabled = imageSmoothingEnabled;
					ctx.restore();

					var filename = config.filename || "untitled";
					filename += "." + mimeType.split("/").pop();
					var data = canvas.toDataURL(mimeType, quality);
					var file = dataURLtoFile(
						data,
						filename
					);

					result.states = drawResults;
					result.canvas = canvasResult;
					result.file = file;

					eventState.onDraw = false;

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

			if (cb) {
				cb(null, getDataById(id));
			}
			return getDataById(id);
		}

		myObject.getThisData = function(cb){
			if (!eventState.target) {
				if (cb) {
					cb("Target not found");
				}
				return false;
			}

			var id = getIdByObject(eventState.target);

			if (cb) {
				cb(null, getDataById(id));
			}
			return getDataById(id);
		}

		myObject.getConfigData = function(cb){
			if (cb) {
				cb(null, getConfigData(config));
			}
			return getConfigData(config);
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
			if (cb) {
				cb(null, getCanvasData(canvasState));
			}
			return getCanvasData(canvasState);
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

			var tmp = getDataById(id);

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getImageDataAll = function(cb){
			var tmp = [];
			imageStates.forEach(function(state){
				tmp.push(getDataByState(state));
			});

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getImageElement = function(id, cb){
			if (!id) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var elem = getSourceById(id);

			if (cb) {
				cb(null, elem);
			}
			return elem;
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

			saveRedoCache(recent.id);

			source.className = recent.sourceClass.join(" ");
			clone.className = recent.cloneClass.join(" ");

			// save state
			setState(state, recent.state);

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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

			saveUndoCache(recent.id);

			source.className = recent.sourceClass.join(" ");
			clone.className = recent.cloneClass.join(" ");

			// save state
			setState(state, recent.state);

			// adjust state
			setObject(source, state);
			setObject(clone, state);

			if (cb) {
				cb(null, getDataByState(state));
			}
			return getDataByState(state);
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
			}).sort(function(a, b){
				return a.index - b.index;
			}).map(function(elem){
				return getDataByState(elem);
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

			eventState.onUpload = true;

			recursiveFunc()

			function recursiveFunc() {
				if (count < index) {
					var thisState = {};
					copyObject(thisState, exportedStates[count]);
					var thisSrc = thisState.src || thisState.url || thisState.path;

					renderImage(thisSrc, function(err, res) {
						if (err) {
							results.push({
								err: err
							});

							count++;
							recursiveFunc();
							return false;
						} 

						var state = getStateById(res);
						var source = getSourceById(res);
						var clone = getCloneById(res);

						if (!state || !source || !clone) {
							removeObjectById(res);

							results.push({
								err: "Image element not found"
							});

							count++;
							recursiveFunc();
							return false;
						}

						if (existsId(thisState.id) === true) {
							removeObjectById(res);

							results.push({
								err: "ID duplicated"
							});

							count++;
							recursiveFunc();
							return false;
						}

						var fittedState = getFittedState(thisState);

						// save cache
						saveUndoCache(state.id, true);

						// save state
						setState(state, fittedState);

						// adjust state
						setObject(source, state);
						setObject(clone, state);

						results.push(getDataByState(state));

						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;

					if (cb) {
						cb(null, results)
					}
				}
			}
		}

		myObject.destroy = function(cb){
			window.removeEventListener("resize", windowResizeEvent, false);
			window.removeEventListener("scroll", windowScrollEvent, false);

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