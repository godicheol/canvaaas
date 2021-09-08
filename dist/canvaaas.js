/*!
 * 
 * canvaaas.js
 * 
 * 0.2.2
 * 
 * eeecheol@gmail.com
 * 
 */

(function(window){
	'use strict';

	function canvaaas() {

		var myObject = {};

		var defaultConfig = {

			allowedExtensions: [
				"jpg",
				"jpeg",
				"png",
				"gif",
				"svg",
				"svg+xml",
				"tiff",
				"tif",
				"webp",
			], // array

			deniedTagNamesToFocusOut: [
				"A",
				"BUTTON",
				"INPUT",
				"LABEL",
				"TEXTAREA",
				"SELECT",
				"OPTION",
			], // array

			cacheLevels: 999, // number

			containerAspectRatio: undefined, // number, 0 ~ 1

			minContainerWidth: 0, // number, 0 ~ 1

			minContainerHeight: 0, // number, 0 ~ 1

			maxContainerWidth: 1, // number, 0 ~ 1

			maxContainerHeight: 0.7, // number, 0 ~ 1

			renderImageScale: 0.5, // number,

			hover: undefined, // callback function

			upload: undefined, // callback function

			focus: undefined, // callback function

			edit: undefined, // callback function

			remove: undefined, // callback function
		};

		Object.freeze(defaultConfig);
		
		var defaultCanvas = {
			filename: "untitled",
			quality: 0.92,
			mimeType: "image/png",
			dataType: "file",
			editabled: true,
		};
		
		Object.freeze(defaultCanvas);

		var classNames = {
			checker: "canvaaas-checker",
			unfocusabled: "unfocusabled",
			uneditabled: "uneditabled",
			undrawabled: "undrawabled",
			onActivated: "activated",
			onEditing: "editing",
			onFocused: "focused",
			onFreezed: "freezed",
			cursorCrosshair: "canvaaas-cursor-crosshair",
			cursorProgress: "canvaaas-cursor-progress",
			cursorHelp: "canvaaas-cursor-help",
			cursorGrab: "canvaaas-cursor-grab",
			cursorGrabbing: "canvaaas-cursor-grabbing",
			cursorPointer: "canvaaas-cursor-pointer",
			cursorMove: "canvaaas-cursor-move",
			cursorZoomIn: "canvaaas-cursor-zoomIn",
			cursorZoomOut: "canvaaas-cursor-zoomOut",
		}
		
		Object.freeze(classNames);

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
		var imageStates = [];

		var containerObject;
		var canvasObject;
		var mirrorObject;

		var windowResizeEvent;

		copyObject(config, defaultConfig);
		copyObject(canvasState, defaultCanvas);

		// 
		// handlers
		// 

		var handlers = {

			stopEvents: function(e) {
				e.preventDefault();
				e.stopPropagation();
			},

			hover: function(e) {
				var mouseX;
				var mouseY;
				var target;

				if (!whereContainer()) {
					return false;
				}

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - (containerState.left + canvasState.left);
					mouseY = e.clientY - (containerState.top + canvasState.top);
					target = getTarget(e);
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - (containerState.left + canvasState.left);
					mouseY = e.touches[0].clientY - (containerState.top + canvasState.top);
					target = getTarget(e.touches[0]);
				}

				var scaleRatio = canvasState.width / canvasState.originalWidth;

				var result = {
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
				var state = getState(id);
				if (!state) {
					return false;
				}
				if (!state.focusabled) {
					return false;
				}

				if (eventState.target !== id) {
					focusOut(eventState.target);
				}

				focusIn(id);

				if (config.focus) {
					config.focus(null, exportState(id));
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

				if (config.deniedTagNamesToFocusOut.indexOf(e.target.tagName) > -1) {
					return false;
				}

				if (eventState.target) {
					focusOut(eventState.target);
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

				if (!isAvailable(eventState.target)) {
					return false;
				}

				if (!whereContainer()) {
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

				// initialize
				eventState.initialX = state.x;
				eventState.initialY = state.y;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;

				// toggle
				eventState.onMove = true;

				// cache
				saveUndo(eventState.target);

				// class
				addClass(eventState.target, classNames.onEditing);

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

				// save state
				setState(eventState.target, {
					x: eventState.initialX + mouseX,
					y: eventState.initialY + mouseY,
				});
			},

			endMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				// toggle
				eventState.onMove = false;

				// class
				removeClass(eventState.target, classNames.onEditing);

				// event
				document.removeEventListener("mousemove", handlers.onMove, false);
				document.removeEventListener("mouseup", handlers.endMove, false);

				document.removeEventListener("touchmove", handlers.onMove, false);
				document.removeEventListener("touchend", handlers.endMove, false);

				// callback
				if (config.edit) {
					config.edit(null, exportState(eventState.target));
				}
			},

			startRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!chkTarget(e)) {
					return false;
				}

				if (!isAvailable(eventState.target)) {
					return false;
				}

				if (!whereContainer()) {
					return false;
				}

				// toggle
				eventState.onRotate = true;

				// cache
				saveUndo(eventState.target);

				// class
				addClass(eventState.target, classNames.onEditing);

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
				var onShiftKey = e.shiftKey;
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
				var radians = Math.atan2(state.y-mouseY, mouseX-state.x) * 180 / Math.PI;
				var deg = -radians + 90;

				if (state.scaleX < 0) {
					deg = deg - 360;
				}
				if (state.scaleY < 0) {
					deg = deg - 180;
				}

				// save state
				setState(eventState.target, {
					rotate: deg
				});
			},

			endRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				// toggle
				eventState.onRotate = false;

				// class
				removeClass(eventState.target, classNames.onEditing);

				// event
				document.removeEventListener("mousemove", handlers.onRotate, false);
				document.removeEventListener("mouseup", handlers.endRotate, false);

				document.removeEventListener("touchmove", handlers.onRotate, false);
				document.removeEventListener("touchend", handlers.endRotate, false);

				// callback
				if (config.edit) {
					config.edit(null, exportState(eventState.target));
				}
			},

			startResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!chkTarget(e)) {
					return false;
				}

				if (!isAvailable(eventState.target)) {
					return false;
				}

				if (!whereContainer()) {
					return false;
				}

				var state = getState(eventState.target);
				var handle = e.target;

				var flipX;
				var flipY;
				var direction;

				var mouseX;
				var mouseY;
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
					direction = getFlippedDirection("n", state.scaleX, state.scaleY);
				} else if (handle.classList.contains("canvaaas-resize-ne")) {
					direction = getFlippedDirection("ne", state.scaleX, state.scaleY);
				} else if (handle.classList.contains("canvaaas-resize-e")) {
					direction = getFlippedDirection("e", state.scaleX, state.scaleY);
				} else if (handle.classList.contains("canvaaas-resize-se")) {
					direction = getFlippedDirection("se", state.scaleX, state.scaleY);
				} else if (handle.classList.contains("canvaaas-resize-s")) {
					direction = getFlippedDirection("s", state.scaleX, state.scaleY);
				} else if (handle.classList.contains("canvaaas-resize-sw")) {
					direction = getFlippedDirection("sw", state.scaleX, state.scaleY);
				} else if (handle.classList.contains("canvaaas-resize-w")) {
					direction = getFlippedDirection("w", state.scaleX, state.scaleY);
				} else if (handle.classList.contains("canvaaas-resize-nw")) {
					direction = getFlippedDirection("nw", state.scaleX, state.scaleY);
				} else {
					return false;
				}

				// initialize
				eventState.direction = direction;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;
				eventState.initialW = state.width;
				eventState.initialH = state.height;
				eventState.initialX = state.x;
				eventState.initialY = state.y;

				// toggle
				eventState.onResize = true;

				// cache
				saveUndo(eventState.target);

				// class
				addClass(eventState.target, classNames.onEditing);

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
				var onShiftKey = e.shiftKey;
				var direction = eventState.direction;

				var aspectRatio;
				var width;
				var height;
				var axisX;
				var axisY;
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

				if (state.lockAspectRatio) {
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

				if (width < 10) {
					return false;
				}
				if (height < 10) {
					return false;
				}

				// save state
				setState(eventState.target, {
					x: axisX,
					y: axisY,
					width: width,
					height: height
				});
			},

			endResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				// toggle
				eventState.onResize = false;

				// class
				removeClass(eventState.target, classNames.onEditing);

				// event
				document.removeEventListener("mousemove", handlers.onResize, false);
				document.removeEventListener("mouseup", handlers.endResize, false);

				document.removeEventListener("touchmove", handlers.onResize, false);
				document.removeEventListener("touchend", handlers.endResize, false);

				// callback
				if (config.edit) {
					config.edit(null, exportState(eventState.target));
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

					if (!isAvailable(eventState.target)) {
						return false;
					}

					if (!whereContainer()) {
						return false;
					}

					// toggle
					eventState.onZoom = true;

					// cache
					saveUndo(eventState.target);

					// class
					addClass(eventState.target, classNames.onEditing);
				}

				var state = getState(eventState.target);
				var ratio;
				var diffX;
				var diffY;
				var width;
				var height;
				var aspectRatio;

				ratio = -e.deltaY * 0.001;
				diffX = state.width * ratio;
				diffY = state.height * ratio;
				width = state.width + diffX;
				height = state.height + diffY;

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
					height: height
				});

				eventState.wheeling = setTimeout(function() {
					// remove timer
					eventState.wheeling = undefined;

					// toggle
					eventState.onZoom = false;

					// class
					removeClass(eventState.target, classNames.onEditing);

					// callback
					if (config.edit) {
						config.edit(null, exportState(eventState.target));
					}
				}, 100);
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

				if (!isAvailable(eventState.target)) {
					return false;
				}

				if (!whereContainer()) {
					return false;
				}

				var state = getState(eventState.target);
				var mouseX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
				var mouseY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
				var diagonal = Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2));

				// initialize
				eventState.diagonal = diagonal;
				eventState.initialW = state.width;
				eventState.initialH = state.height;

				// toggle
				eventState.onZoom = true;

				// cache
				saveUndo(eventState.target);

				// class
				addClass(eventState.target, classNames.onEditing);

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
				var diagonal;
				var mouseX;
				var mouseY;
				var width;
				var height;
				var ratio;

				mouseX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
				mouseY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
				diagonal = getDiagonal(mouseX, mouseY);
				ratio = 1 + ((diagonal - eventState.diagonal) * 0.01);

				width = eventState.initialW * ratio;
				height = eventState.initialH * ratio;

				if (width < 10) {
					return false;
				}
				if (height < 10) {
					return false;
				}

				// save state
				setState(eventState.target, {
					width: width,
					height: height
				});
			},

			endPinchZoom: function(e) {
				e.preventDefault();
				e.stopPropagation();

				// toggle
				eventState.onZoom = false;

				// class
				removeClass(eventState.target, classNames.onEditing);

				// event
				document.removeEventListener("touchmove", handlers.onPinchZoom, false);
				document.removeEventListener("touchend", handlers.endPinchZoom, false);

				// callback
				if (config.edit) {
					config.edit(null, exportState(eventState.target));
				}

				// event propagation
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

			resizeWindow: function(e){
				e.preventDefault();
				e.stopPropagation();

				if (
					!canvasState.width ||
					!canvasState.height
				) {
					return false;
				}

				var oldWidth = containerState.width;

				initCanvas();

				var newWidth = containerState.width;
				var scaleRatio = newWidth / oldWidth;

				imageStates.forEach(function(state){
					// save state
					setState(state.id, {
						x: state.x * scaleRatio,
						y: state.y * scaleRatio,
						width: state.width * scaleRatio,
						height: state.height * scaleRatio
					});
				});
			},


		};

		// 
		// methods
		// 

		function getId(obj) {
			if (!obj) {
				return false;
			}
			try {
				var id = obj.id;
				if (id.indexOf(originId) > -1) {
					return id.replace(originId, "");
				} else if (id.indexOf(cloneId) > -1) {
					return id.replace(cloneId, "");
				} else {
					return false;
				}
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getSrc(id) {
			var tmp = document.getElementById(originId + id);
			if (!tmp) {
				return false;
			}
			if (!tmp.querySelector("img")) {
				return false;
			}
			return tmp.querySelector("img").src;
		}

		function getOrigin(id) {
			return document.getElementById(originId + id);
		}

		function getClone(id) {
			return document.getElementById(cloneId + id);
		}

		function getState(id) {
			var state = imageStates.find(function(elem){
				if (elem.id === id) {
					return elem;
				}
			});

			if (!state) {
				return undefined;
			}

			var tmp = {};
			tmp.id = state.id;
			tmp.type = state.type;
			tmp.src = state.src;
			tmp.index = state.index;
			tmp.originalWidth = state.originalWidth;
			tmp.originalHeight = state.originalHeight;
			tmp.width = state.width;
			tmp.height = state.height;
			tmp.x = state.x;
			tmp.y = state.y;
			tmp.rotate = state.rotate;
			tmp.scaleX = state.scaleX;
			tmp.scaleY = state.scaleY;
			tmp.opacity = state.opacity;
			tmp.lockAspectRatio = state.lockAspectRatio;
			tmp.focusabled = state.focusabled;
			tmp.editabled = state.editabled;
			tmp.drawabled = state.drawabled;
			return tmp;
		}

		function getCanvas() {
			var tmp = {};
			tmp.width = canvasState.originalWidth;
			tmp.height = canvasState.originalHeight;
			tmp.backgroundColor = canvasState.backgroundColor;
			tmp.editabled = canvasState.editabled;
			
			tmp.filename = canvasState.filename;
			tmp.mimeType = canvasState.mimeType;
			tmp.dataType = canvasState.dataType;
			tmp.quality = canvasState.quality;

			var as = getAspectRatio(tmp.width, tmp.height);
			tmp.aspectRatio = "" + as[0] + ":" + as[1];

			return tmp;
		}

		function getConfig() {
			var tmp = {};
			var candidtaeFuncs = [
				"hover",
				"upload",
				"focus",
				"edit",
			];

			var candidtaeKeys = [
				"allowedExtensions",
				"deniedTagNamesToFocusOut",
				"cacheLevels",
				"renderImageScale",
				"containerAspectRatio",
				"minContainerWidth",
				"minContainerHeight",
				"maxContainerWidth",
				"maxContainerHeight",
			]

			candidtaeKeys.forEach(function(elem){
				tmp[elem] = config[elem];
			});

			candidtaeFuncs.forEach(function(elem){
				if (config[elem] !== undefined) {
					tmp[elem] = true;
				} else {
					tmp[elem] = false;
				}
			})

			return tmp;
		}

		function setState(id, newState) {
			var state = imageStates.find(function(elem){
				if (elem.id === id) {
					return elem;
				}
			});

			var originObj = document.getElementById(originId + id);
			var cloneObj = document.getElementById(cloneId + id);

			var idChanged = false;
			var oldId;
			for(var key in newState) {
				if (newState.hasOwnProperty(key)) {
					if ([
						"id"
					].indexOf(key) > -1) {
						if (state[key] !== newState[key]) {
							idChanged = true;
							oldId = state[key];
						}
						if (
							isString(newState[key]) &&
							!isExist(newState[key])
						) {
							state[key] = toString(newState[key]);
						}
					} else if ([
						"index",
						"width",
						"height",
						"x",
						"y",
						"rotate",
						"scaleX",
						"scaleY",
						"opacity",
					].indexOf(key) > -1) {
						if (isNumeric(newState[key])) {
							state[key] = toNumber(newState[key]);
						}
					} else if ([
						"lockAspectRatio",
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

			var index = state.index;
			var top = ( state.y - (state.height * 0.5) ) + "px";
			var left = ( state.x - (state.width * 0.5) ) + "px";
			var width = state.width + "px";
			var height = state.height + "px";
			var opacity = state.opacity;

			var transform = "";
			if (state.rotate !== 0) {
				transform += "rotate(" + state.rotate + "deg)";
			}
			if (state.scaleX === -1) {
				transform += "scaleX(" + state.scaleX + ")";
			}
			if (state.scaleY === -1) {
				transform += "scaleY(" + state.scaleY + ")";
			}

			if (idChanged === true) {
				originObj.id = originId + state.id;
				cloneObj.id = cloneId + state.id;

				undoCaches.forEach(function(elem){
					if (elem.id === oldId) {
						elem.id = state.id;
					}
					if (elem.state) {
						if (elem.state.id === oldId) {
							elem.state.id = state.id;
						}
					}
				});

				redoCaches.forEach(function(elem){
					if (elem.id === oldId) {
						elem.id = state.id;
					}
					if (elem.state) {
						if (elem.state.id === oldId) {
							elem.state.id = state.id;
						}
					}
				});
			}

			originObj.style.zIndex = index;
			originObj.style.top = top;
			originObj.style.left = left;
			originObj.style.width = width;
			originObj.style.height = height;
			originObj.style.transform = transform;
			originObj.querySelector("img").style.opacity = opacity;

			cloneObj.style.zIndex = index;
			cloneObj.style.top = top;
			cloneObj.style.left = left;
			cloneObj.style.width = width;
			cloneObj.style.height = height;
			cloneObj.style.transform = transform;
			cloneObj.querySelector("img").style.opacity = opacity;

			if (state.focusabled === false) {
				if (!originObj.classList.contains(classNames.unfocusabled)) {
					originObj.classList.add(classNames.unfocusabled);
				}
				if (!cloneObj.classList.contains(classNames.unfocusabled)) {
					cloneObj.classList.add(classNames.unfocusabled);
				}
			} else {
				if (originObj.classList.contains(classNames.unfocusabled)) {
					originObj.classList.remove(classNames.unfocusabled);
				}
				if (cloneObj.classList.contains(classNames.unfocusabled)) {
					cloneObj.classList.remove(classNames.unfocusabled);
				}
			}

			if (state.editabled === false) {
				if (!originObj.classList.contains(classNames.uneditabled)) {
					originObj.classList.add(classNames.uneditabled);
				}
				if (!cloneObj.classList.contains(classNames.uneditabled)) {
					cloneObj.classList.add(classNames.uneditabled);
				}
			} else {
				if (originObj.classList.contains(classNames.uneditabled)) {
					originObj.classList.remove(classNames.uneditabled);
				}
				if (cloneObj.classList.contains(classNames.uneditabled)) {
					cloneObj.classList.remove(classNames.uneditabled);
				}
			}

			if (state.drawabled === false) {
				if (!originObj.classList.contains(classNames.undrawabled)) {
					originObj.classList.add(classNames.undrawabled);
				}
				if (!cloneObj.classList.contains(classNames.undrawabled)) {
					cloneObj.classList.add(classNames.undrawabled);
				}
			} else {
				if (originObj.classList.contains(classNames.undrawabled)) {
					originObj.classList.remove(classNames.undrawabled);
				}
				if (cloneObj.classList.contains(classNames.undrawabled)) {
					cloneObj.classList.remove(classNames.undrawabled);
				}
			}

			return true;
		}

		function addClass(id, cls){
			try {
				var originObj = document.getElementById(originId + id);
				var cloneObj = document.getElementById(cloneId + id);

				if (!originObj.classList.contains(cls)) {
					originObj.classList.add(cls);
				}
				if (!cloneObj.classList.contains(cls)) {
					cloneObj.classList.add(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function removeClass(id, cls){
			try {
				var originObj = document.getElementById(originId + id);
				var cloneObj = document.getElementById(cloneId + id);

				if (originObj.classList.contains(cls)) {
					originObj.classList.remove(cls);
				}
				if (cloneObj.classList.contains(cls)) {
					cloneObj.classList.remove(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function importState(state) {
			var scaleRatio = canvasState.width / canvasState.originalWidth;

			var tmp = {};
			for(var key in state) {
				if (state.hasOwnProperty(key)) {
					if ([
						"id"
					].indexOf(key) > -1) {
						tmp[key] = toString(state[key]);
					} else if ([
						"width",
						"height",
						"x",
						"y",
					].indexOf(key) > -1) {
						tmp[key] = toNumber(state[key]) * scaleRatio;
					} else if ([
						"index",
						"rotate",
						"scaleX",
						"scaleY",
						"opacity",
					].indexOf(key) > -1) {
						tmp[key] = toNumber(state[key]);
					} else if ([
						"lockAspectRatio",
						"focusabled",
						"editabled",
						"drawabled",
					].indexOf(key) > -1) {
						tmp[key] = toBoolean(state[key]);
					}
				}
			}

			return tmp;
		}

		function exportState(id) {
			var state = getState(id);
			var scaleRatio = canvasState.width / canvasState.originalWidth;

			var tmp = {};
			for(var key in state) {
				if (state.hasOwnProperty(key)) {
					if ([
						"id",
						"src"
					].indexOf(key) > -1) {
						tmp[key] = toString(state[key]);
					} else if ([
						"originalWidth",
						"originalHeight",
					].indexOf(key) > -1) {
						tmp[key] = toNumber(state[key]);
					}else if ([
						"width",
						"height",
						"x",
						"y",
					].indexOf(key) > -1) {
						tmp[key] = toNumber(state[key]) / scaleRatio;
					} else if ([
						"index",
						"rotate",
						"scaleX",
						"scaleY",
						"opacity",
					].indexOf(key) > -1) {
						tmp[key] = toNumber(state[key]);
					} else if ([
						"lockAspectRatio",
						"focusabled",
						"editabled",
						"drawabled",
					].indexOf(key) > -1) {
						tmp[key] = toBoolean(state[key]);
					}
				}
			}

			var oar = getAspectRatio(tmp.originalWidth, tmp.originalHeight);
			var ar = getAspectRatio(tmp.width, tmp.height);
			tmp.originalAspectRatio = "" + oar[0] + ":" + oar[1];
			tmp.aspectRatio = "" + ar[0] + ":" + ar[1];
			tmp.left = tmp.x - (0.5 * tmp.width);
			tmp.top = tmp.y - (0.5 * tmp.height);

			return tmp;
		}

		function parseState(obj) {
			var result = {};

			if (isObject(obj)) {
				var stateKeys = Object.keys(obj);
				for (var i = 0; i < stateKeys.length; i++) {
					var j = stateKeys[i];
					if (obj.hasOwnProperty(j)) {
						if (isNumeric(obj[j])) {
							result[j] = toNumber(obj[j]);
						} else if (isBoolean(obj[j])) {
							result[j] = toBoolean(obj[j]);
						} else if (isString(obj[j])) {
							result[j] = toString(obj[j]);
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
								result[j] = toNumber(parsed[j]);
							} else if (isBoolean(parsed[j])) {
								result[j] = toBoolean(parsed[j]);
							} else if (isString(parsed[j])) {
								result[j] = parsed[j];
							}
						}
					}
				} catch(err) {
					console.log(err);
					result = {};
				}
			} else {
				return false;
			}

			if (!result.src) {
				if (result.url) {
					result.src = result.url;
				} else if (result.path) {
					result.src = result.path;
				}
			}

			return result;
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
				"focusabled",
				"editabled",
				"drawabled",
			];

			var thisAttrs = {};
			for (var i = 0; i < stateKeys.length; i++) {
				var j = stateKeys[i];
				var tmp = elem.getAttribute("data-" + j);
				if (!isEmpty(tmp)) {
					if (isNumeric(tmp)) {
						thisAttrs[j] = toNumber(tmp);
					} else {
						thisAttrs[j] = tmp;
					}
				}
			}

			var result;
			if (thisAttrs.state) {
				result = parseState(thisAttrs.state);
			} else {
				result = parseState(thisAttrs);
			}
			console.log(result);
			return result;
		}

		function isAvailable(id) {
			if (!canvasState.editabled) {
				return false;
			}
			if (!id) {
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

		function whereContainer(e) {
			try {
				var cont = containerObject.getBoundingClientRect();
				containerState.left = cont.left;
				containerState.rop = cont.top;
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
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
						if (tmp.classList.contains("canvaaas-image")) {
							found = tmp;
						}
						if (tmp.classList.contains("canvaaas-clone")) {
							found = tmp;
						}
						if (!found) {
							if (tmp.parentNode) {
								tmp = tmp.parentNode;
							}
						}
					}
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

		function focusIn(id) {
			var exists = isExist(id);
			if (!exists) {
				return false;
			}
			try {
				var originObj = getOrigin(id);
				var cloneObj = getClone(id);

				if (!canvasObject.classList.contains(classNames.onActivated)) {
					canvasObject.classList.add(classNames.onActivated);
				}
				if (!mirrorObject.classList.contains(classNames.onActivated)) {
					mirrorObject.classList.add(classNames.onActivated);
				}

				if (!originObj.classList.contains(classNames.onFocused)) {
					originObj.classList.add(classNames.onFocused);
				}
				if (!cloneObj.classList.contains(classNames.onFocused)) {
					cloneObj.classList.add(classNames.onFocused);
				}

				originObj.removeEventListener("mousedown", handlers.focusIn, false);

				originObj.addEventListener("mousedown", handlers.startMove, false);
				originObj.addEventListener("touchstart", handlers.startMove, false);
				originObj.addEventListener("wheel", handlers.startWheelZoom, false);

				originObj.querySelectorAll("div.canvaaas-rotate-handle").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startRotate, false);
					elem.addEventListener("touchstart", handlers.startRotate, false);
				});

				originObj.querySelectorAll("div.canvaaas-resize-handle").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startResize, false);
					elem.addEventListener("touchstart", handlers.startResize, false);
				});

				cloneObj.removeEventListener("mousedown", handlers.focusIn, false);

				cloneObj.addEventListener("mousedown", handlers.startMove, false);
				cloneObj.addEventListener("touchstart", handlers.startMove, false);
				cloneObj.addEventListener("wheel", handlers.startWheelZoom, false);

				cloneObj.querySelectorAll("div.canvaaas-rotate-handle").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startRotate, false);
					elem.addEventListener("touchstart", handlers.startRotate, false);
				});

				cloneObj.querySelectorAll("div.canvaaas-resize-handle").forEach(function(elem){
					elem.addEventListener("mousedown", handlers.startResize, false);
					elem.addEventListener("touchstart", handlers.startResize, false);
				});

				document.addEventListener("mousedown", handlers.focusOut, false);
				document.addEventListener("touchstart", handlers.focusOut, false);
			} catch(err) {
				console.log(err);
				return false;
			}
			
			eventState.target = id;

			return true;
		}

		function focusOut(id) {
			var exists = isExist(id);
			if (!exists) {
				return false;
			}
			try {
				var originObj = getOrigin(id);
				var cloneObj = getClone(id);

				if (canvasObject.classList.contains(classNames.onActivated)) {
					canvasObject.classList.remove(classNames.onActivated);
				}
				if (mirrorObject.classList.contains(classNames.onActivated)) {
					mirrorObject.classList.remove(classNames.onActivated);
				}

				if (originObj.classList.contains(classNames.onFocused)) {
					originObj.classList.remove(classNames.onFocused);
				}
				if (cloneObj.classList.contains(classNames.onFocused)) {
					cloneObj.classList.remove(classNames.onFocused);
				}

				originObj.addEventListener("mousedown", handlers.focusIn, false);

				originObj.removeEventListener("mousedown", handlers.startMove, false);
				originObj.removeEventListener("touchstart", handlers.startMove, false);
				originObj.removeEventListener("wheel", handlers.startWheelZoom, false);

				originObj.querySelectorAll("div.canvaaas-rotate-handle").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startRotate, false);
					elem.removeEventListener("touchstart", handlers.startRotate, false);
				});

				originObj.querySelectorAll("div.canvaaas-resize-handle").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startResize, false);
					elem.removeEventListener("touchstart", handlers.startResize, false);
				});

				cloneObj.addEventListener("mousedown", handlers.focusIn, false);

				cloneObj.removeEventListener("mousedown", handlers.startMove, false);
				cloneObj.removeEventListener("touchstart", handlers.startMove, false);
				cloneObj.removeEventListener("wheel", handlers.startWheelZoom, false);

				cloneObj.querySelectorAll("div.canvaaas-rotate-handle").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startRotate, false);
					elem.removeEventListener("touchstart", handlers.startRotate, false);
				});

				cloneObj.querySelectorAll("div.canvaaas-resize-handle").forEach(function(elem){
					elem.removeEventListener("mousedown", handlers.startResize, false);
					elem.removeEventListener("touchstart", handlers.startResize, false);
				});

				document.removeEventListener("mousedown", handlers.focusOut, false);
				document.removeEventListener("touchstart", handlers.focusOut, false);
			} catch(err) {
				console.log(err);
				return false;
			}
			
			eventState.target = undefined;

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
				return [areaW, areaW / aspectRatio];
			} else {
				return [areaH * aspectRatio, areaH];
			}
		}

		function getFittedSizes(options) {
			var fooMax = getContainedSizes(
				options.width,
				options.height,
				options.maxWidth,
				options.maxHeight,
			)
			var fooMin = getCoveredSizes(
				options.width,
				options.height,
				options.minWidth,
				options.minHeight
			)

			return [
				Math.min(fooMax[0], Math.max(fooMin[0], options.width)),
				Math.min(fooMax[1], Math.max(fooMin[1], options.height))
			]
		}

		function getRotatedSizes(w, h, d) {
			try {
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
			} catch(err) {
				console.log(err);
				return false;
			}
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

		function getFlippedDirection(direction, scaleX, scaleY) {
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

		function dimensionsToPx(width, height, unit, dpi) {
			try {
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

				w *= parseFloat(dpi);
				h *= parseFloat(dpi);

				return [w, h];
			} catch(err) {
				console.log(err);
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
		    // I generate the UID from two parts here 
		    // to ensure the random number provide enough bits.
			var firstPart = (Math.random() * 46656) | 0;
			var secondPart = (Math.random() * 46656) | 0;
			firstPart = ("000" + firstPart.toString(36)).slice(-3);
			secondPart = ("000" + secondPart.toString(36)).slice(-3);
			return firstPart + secondPart;
		}

		function isEmpty(str) {
			if (typeof(str) === "string" || typeof(str) === "number" || str === null) {
				return str === undefined || str === null || str === "";
			} else if (Array.isArray(str)) {
				return str.length < 1;
			} else if (typeof(str) === "object") {
				return Object.keys(str).length < 1;
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
			return Array.isArray(arr);
		}

		function isNode(obj){
			return (
				typeof Node === "object" ? obj instanceof Node : 
				obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName==="string"
			);
		}

		function isElement(obj){
			return (
				typeof HTMLElement === "object" ? obj instanceof HTMLElement :
				obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName==="string"
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
			if (!isNaN(parseFloat(n)) && isFinite(n)) {
				return parseFloat(n);
			} else {
				return undefined;
			}
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

		function drawCanvas(options) {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			
			var maxWidth = 999999;
			var maxHeight = 999999;
			if (isIos()) {
				maxWidth = 4096;
				maxHeight = 4096;
			}
			var sizes = getFittedSizes({
				width: options.width,
				height: options.height,
				maxWidth: maxWidth,
				maxHeight: maxHeight,
				minWidth: 0,
				minHeight: 0
			});

			canvas.width = Math.floor(sizes[0]);
			canvas.height = Math.floor(sizes[1]);

			ctx.fillStyle = options.backgroundColor || "#FFFFFF";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.save();

			return canvas;
		}

		// asynchronous
		function drawImage(mainCanvas, canvState, imgState, cb) {
			/*!
			 * canvState = {
			 * 		width
			 * }
			 */

			/*!
			 * imgState = {
			 * 		src
			 * 		width,
			 *  	height,
			 * 		x,
			 * 		y,
			 * 		rotate,
			 * 		opacity,
			 * 		scaleX,
			 * 		scaleY,
			 * 		smoothing(optional)	
			 * }
			 */

			var thisImg = new Image();
			thisImg.src = imgState.src;
			thisImg.onerror = function(err) {
				return cb(err);
			}
			thisImg.onload = function(e) {
				// create canvas
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");

				// original
				var scaleRatio = mainCanvas.width / canvState.width;
				var originalWidth = imgState.width * scaleRatio;
				var originalHeight = imgState.height * scaleRatio;
				var originalX = imgState.x * scaleRatio;
				var originalY = imgState.y * scaleRatio;

				// original & rotate
				var rotatedSizes = getRotatedSizes(
					originalWidth,
					originalHeight,
					imgState.rotate
				);
				var rotatedWidth = Math.floor(rotatedSizes[0]);
				var rotatedHeight = Math.floor(rotatedSizes[1]);
				var rotatedLeft = Math.floor(originalX - (rotatedSizes[0] * 0.5));
				var rotatedTop = Math.floor(originalY - (rotatedSizes[1] * 0.5));
				
				// original & rotate & resize
				var maxWidth = 999999;
				var maxHeight = 999999;
				if (isIos()) {
					maxWidth = 4096;
					maxHeight = 4096;
				}
				var canvasSizes = getFittedSizes({
					width: rotatedWidth,
					height: rotatedHeight,
					maxWidth: maxWidth,
					maxHeight: maxHeight,
					minWidth: 0,
					minHeight: 0
				});

				// orignal & resize
				var scaleRatioX = canvasSizes[0] / rotatedWidth;
				var scaleRatioY = canvasSizes[1] / rotatedHeight;
				var absWidth = originalWidth * scaleRatioX;
				var absHeight = originalHeight * scaleRatioY;

				// set canvas sizes
				canvas.width = Math.floor(canvasSizes[0]);
				canvas.height = Math.floor(canvasSizes[1]);

				// set canvas options
				ctx.globalAlpha = imgState.opacity;
				ctx.fillStyle = "transparent";
				if (imgState.smoothing) {
					ctx.imageSmoothingQuality = imgState.smoothing;
					ctx.imageSmoothingEnabled = true;
				}
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.save();
				ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
				ctx.rotate(imgState.rotate * (Math.PI / 180));
				ctx.scale(imgState.scaleX, imgState.scaleY);

				// draw
				ctx.drawImage(
					thisImg,
					-Math.floor(absWidth * 0.5), -Math.floor(absHeight * 0.5),
					Math.floor(absWidth), Math.floor(absHeight)
				);
				ctx.restore();

				var sx = 0;
				var sy = 0;
				var sw = canvas.width;
				var sh = canvas.height;
				var dx = rotatedLeft;
				var dy = rotatedTop;
				var dw = rotatedWidth;
				var dh = rotatedHeight;

				// draw to main canvas
				var mainCtx = mainCanvas.getContext("2d");
				mainCtx.drawImage(
					canvas,
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
		function renderImage(file, newState, cb) {
			var newImage = new Image();
			var id = getShortId();
			var ext;
			var src;
			var typ;

			// check file or url
			if (isObject(file)) {
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
				src = URL.createObjectURL(file);
			} else if (isString(file)) {
				// url
				typ = "url";
				ext = file.split('.').pop();;
				src = file;
			} else {
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			// check mimeType
			if (config.allowedExtensions.indexOf(ext) < 0) {
				if (cb) {
					cb("This extention not allowed =>" + ext);
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
				// check canvas
				if (
					!canvasState.originalWidth &&
					!canvasState.originalHeight
				) {
					canvasState.originalWidth = newImage.width;
					canvasState.originalHeight = newImage.height;
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

				var fittedSizes = getContainedSizes(
					newImage.width,
					newImage.height,
					canvasState.width,
					canvasState.height
				);

				var state = {
					id: id,
					type: typ,
					src: newImage.src,
					index: nextIndex,
					originalWidth: originalWidth,
					originalHeight: originalHeight,
					width: fittedSizes[0] * config.renderImageScale,
					height: fittedSizes[1] * config.renderImageScale,
					x: canvasState.width * 0.5,
					y: canvasState.height * 0.5,
					rotate: 0,
					scaleX: 1,
					scaleY: 1,
					opacity: 1,
					lockAspectRatio: true,
					focusabled: true,
					editabled: true,
					drawabled: true,
				}

				// create origin element
				var newOrigin = document.createElement("div");
				newOrigin.classList.add("canvaaas-image");
				newOrigin.id = originId + state.id;
				newOrigin.innerHTML = imageTemplate;
				newOrigin.querySelector("img").src = newImage.src;

				// create clone element
				var newClone = document.createElement("div");
				newClone.classList.add("canvaaas-clone");
				newClone.id = cloneId + state.id;
				newClone.innerHTML = imageTemplate;
				newClone.querySelector("img").src = newImage.src;

				// set events
				newOrigin.addEventListener("mousedown", handlers.focusIn, false);
				newOrigin.addEventListener("touchstart", handlers.focusIn, false);

				newClone.addEventListener("mousedown", handlers.focusIn, false);
				newClone.addEventListener("touchstart", handlers.focusIn, false);

				canvasObject.appendChild(newOrigin);
				mirrorObject.appendChild(newClone);

				imageStates.push(state);

				var addition;
				if (isObject(newState)) {
					addition = importState(newState);
				} else {
					addition = {};
				}

				setState(id, addition);

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
				var originObj = getOrigin(id);
				var cloneObj = getClone(id);
				var state = getState(id);
				var src = originObj.querySelector("img").src;

				var seq = imageStates.findIndex(function(elem){
					if (elem.id === state.id) {
						return elem;
					}
				});

				imageStates.splice(seq, 1);
				originObj.parentNode.removeChild(originObj);
				cloneObj.parentNode.removeChild(cloneObj);

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

		function initCanvas() {
			/*!
			 * require
			 * 
			 * canvasState.originalWidth
			 * canvasState.originalHeight
			 * 
			 */

			var viewportSizes = getViewportSizes();

			// clear container style
			containerObject.style.width = "";
			containerObject.style.height = "";

			var containerAspectRatio = config.containerAspectRatio || canvasState.originalWidth / canvasState.originalHeight;
			var containerWidth = containerObject.offsetWidth;
			var containerHeight = containerObject.offsetWidth / containerAspectRatio;

			var maxSizes = getContainedSizes(
				containerWidth,
				containerHeight,
				viewportSizes[0] * config.maxContainerWidth,
				viewportSizes[1] * config.maxContainerHeight
			);

			var minSizes = getCoveredSizes(
				containerWidth,
				containerHeight,
				config.minContainerWidth || 0,
				config.minContainerHeight || 0
			);

			var containerWidth = Math.min(maxSizes[0], Math.max(minSizes[0], containerWidth));
			var containerHeight = Math.min(maxSizes[1], Math.max(minSizes[1], containerHeight));

			containerState.width = containerWidth;
			containerState.height = containerHeight;
			containerState.left = containerObject.getBoundingClientRect().left;
			containerState.top = containerObject.getBoundingClientRect().top;

			containerObject.style.width = containerState.width + "px";
			containerObject.style.height = containerState.height + "px";

			if (hasScrollbar()) {
				var sbw = getScrollbarWidth();

				containerState.width -= sbw;
				containerState.height = containerState.width / containerAspectRatio;

				containerObject.style.width = containerState.width + "px";
				containerObject.style.height = containerState.height + "px";
			}

			var fittedSizes = getContainedSizes(
				canvasState.originalWidth,
				canvasState.originalHeight,
				containerState.width,
				containerState.height
			);

			canvasState.width = fittedSizes[0];
			canvasState.height = fittedSizes[1];
			canvasState.left = 0.5 * (containerState.width - fittedSizes[0]);
			canvasState.top = 0.5 * (containerState.height - fittedSizes[1]);

			canvasObject.style.width = canvasState.width + "px";
			canvasObject.style.height = canvasState.height + "px";
			canvasObject.style.left = canvasState.left + "px";
			canvasObject.style.top = canvasState.top + "px";

			mirrorObject.style.width = canvasState.width + "px";
			mirrorObject.style.height = canvasState.height + "px";
			mirrorObject.style.left = canvasState.left + "px";
			mirrorObject.style.top = canvasState.top + "px";

			return true;
		}

		// 
		// exports
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

			// set elements
			containerObject = target.querySelector("div.canvaaas");
			canvasObject = target.querySelector("div.canvaaas-canvas");
			mirrorObject = target.querySelector("div.canvaaas-mirror");

			canvasObject.classList.add(classNames.checker);

			// set events(fix removeEventListener)
			windowResizeEvent = handlers.resizeWindow;
			// windowResizeEvent = handlers.debounce( handlers.resizeWindow, 300 );

			window.addEventListener("resize", windowResizeEvent, false);

			canvasObject.addEventListener("mousemove", handlers.hover, true);
			canvasObject.addEventListener("touchmove", handlers.hover, true);

			if (
				canvasState.originalWidth &&
				canvasState.originalHeight
			) {
				// set canvas
				initCanvas();
			}

			if (cb) {
				cb(null, getConfig());
			}
			return getConfig();
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
					config.upload(null, res);
				}
				if (cb) {
					cb(null, res);
				}
			});
		}

		// asynchronous
		myObject.uploadUrl = function(imageUrl, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				} 
				return false;
			}

			if (!imageUrl) {
				if (config.upload) {
					config.upload("URL not found");
				}
				if (cb) {
					cb("URL not found");
				} 
				return false;
			}

			if (!isString(imageUrl)) {
				if (config.upload) {
					config.upload("Argument not string");
				}
				if (cb) {
					cb("Argument not string");
				} 
				return false;
			}

			eventState.onUpload = true;
			var loading = startLoading(document.body);

			renderImage(imageUrl, null, function(err, res) {

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
					config.upload(null, res);
				}
				if (cb) {
					cb(null, res);
				}
			});
		}

		// asynchronous
		myObject.uploadState = function(imageState, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				} 
				return false;
			}

			var thisState = parseState(imageState);
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

			var thisSrc = thisState.src;

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
					config.upload(null, res);
				}
				if (cb) {
					cb(null, res);
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

		myObject.findOne = function(query, cb){
			if (!isObject(query)) {
				if (cb) {
					cb("Argument not obejct");
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
					founds.push(exportState(elem.id));
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
					cb("Argument not obejct");
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
					founds.push(exportState(elem.id));
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

		myObject.updateOne = function(query, updates, cb){
			if (
				!isObject(query) ||
				!isObject(updates)
			) {
				if (cb) {
					cb("Argument not obejct");
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

			setState(founds[0], updates);

			if (cb) {
				cb(null, exportState(founds[0]));
			}
			return exportState(founds[0]);
		}

		myObject.updateMany = function(query, updates, cb){
			if (
				!isObject(query) ||
				!isObject(updates)
			) {
				if (cb) {
					cb("Argument not obejct");
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
				setState(founds[i], updates);

				results.push(exportState(founds[i]));
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			var state = getState(id);

			if (isExist(newId)) {
				if (config.edit) {
					config.edit("ID duplicated");
				}
				if (cb) {
					cb("ID duplicated");
				} 
				return false;
			}

			if (eventState.target === id) {
				focusOut(id);
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				id: newId
			});

			if (config.edit) {
				config.edit(null, exportState(newId));
			}
			if (cb) {
				cb(null, exportState(newId));
			}
			return exportState(newId);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			if (
				!isNumeric(x) ||
				!isNumeric(y)
			) {
				if (config.edit) {
					config.edit("Argument not numeric");
				}
				if (cb) {
					cb("Argument not numeric");
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
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			if (
				(typeof(x) !== "string" && typeof(x) !== "number") ||
				(typeof(y) !== "string" && typeof(y) !== "number")
			) {
				if (config.edit) {
					config.edit("Argument not numeric or string");
				}
				if (cb) {
					cb("Argument not numeric or string");
				} 
				return false;
			}

			var state = getState(id);

			if (isNumeric(x) === true) {
				x = toNumber(x);
			} else {
				if (
					x.toLowerCase() === "l" || 
					x.toLowerCase() === "left"
				) {
					x = (canvasState.width * 0) + (state.width * 0.5);
				} else if (
					x.toLowerCase() === "c" || 
					x.toLowerCase() === "center"
				) {
					x = (canvasState.width * 0.5);
				} else if (
					x.toLowerCase() === "r" || 
					x.toLowerCase() === "right"
				) {
					x = (canvasState.width * 1) - (state.width * 0.5);
				}
			}

			if (isNumeric(y) === true) {
				y = toNumber(y);
			} else {
				if (
					y.toLowerCase() === "t" || 
					y.toLowerCase() === "top"
				) {
					y = (canvasState.height * 0) + (state.height * 0.5);
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
					y = (canvasState.height * 1) - (state.height * 0.5);
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
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
		}

		myObject.resize = function(id, w, h, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			if (
				!isNumeric(w) ||
				!isNumeric(h)
			) {
				if (config.edit) {
					config.edit("Argument not numeric or string");
				}
				if (cb) {
					cb("Argument not numeric or string");
				} 
				return false;
			}

			var state = getState(id);
			var ar = state.originalWidth / state.originalHeight;
			w = toNumber(w);
			h = toNumber(h);

			var lockAspectRatio;
			if (w !== h * ar) {
				lockAspectRatio = false;
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				width: w,
				height: h,
				lockAspectRatio: lockAspectRatio
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			if (!isNumeric(ratio)) {
				if (config.edit) {
					config.edit("Argument not numeric");
				}
				if (cb) {
					cb("Argument not numeric");
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
				height: state.height * (1 + ratio)
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			if (
				typeof(ratio) !== "number" &&
				typeof(ratio) !== "string"
			) {
				if (config.edit) {
					config.edit("Argument not numeric or string");
				}
				if (cb) {
					cb("Argument not numeric or string");
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
				height: height
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			if (!isNumeric(deg)) {
				if (config.edit) {
					config.edit("Argument not numeric");
				}
				if (cb) {
					cb("Argument not numeric");
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
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			if (!isNumeric(deg)) {
				if (config.edit) {
					config.edit("Argument not numeric");
				}
				if (cb) {
					cb("Argument not numeric");
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
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				scaleY: state.scaleY * -1,
				rotate: state.rotate * -1
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			} 
			return exportState(id);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				scaleX: state.scaleX * -1,
				rotate: state.rotate * -1
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			} 
			return exportState(id);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			if (!isNumeric(num)) {
				if (config.edit) {
					config.edit("Argument not numeric");
				}
				if (cb) {
					cb("Argument not numeric");
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
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			if (!isNumeric(idx)) {
				if (config.edit) {
					config.edit("Argument not numeric");
				}
				if (cb) {
					cb("Argument not numeric");
				} 
				return false;
			}

			var state = getState(id);
			idx = toNumber(idx);

			setState(id, {
				index: state.index + idx
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			if (!isNumeric(idx)) {
				if (config.edit) {
					config.edit("Argument not numeric");
				}
				if (cb) {
					cb("Argument not numeric");
				} 
				return false;
			}

			idx = toNumber(idx);

			setState(id, {
				index: idx
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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

			if (eventState.target) {
				focusOut(eventState.target);
			}

			focusIn(id);

			if (config.focus) {
				config.focus(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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

			focusOut(eventState.target);

			if (config.focus) {
				config.focus(null, null);
			}
			if (cb) {
				cb(null, null);
			}
			return true;
		}

		myObject.aspectRatio = function(id, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			var state = getState(id);
			var width = state.width;
			var height = state.height;

			if (state.lockAspectRatio === false) {
				var aspectRatio = state.originalWidth / state.originalHeight;
				if (state.width > state.height * aspectRatio) {
					height = state.width / aspectRatio;
				} else {
					width = state.height * aspectRatio;
				}
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				width: width,
				height: height,
				lockAspectRatio: state.lockAspectRatio === false
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
		}

		myObject.focusable = function(id, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			var state = getState(id);

			if (state.focusabled === true) {
				if (eventState.target === id) {
					focusOut(id);
				}
			}

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				focusabled: state.focusabled === false
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
		}

		myObject.editable = function(id, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				editabled: state.editabled === false
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
		}

		myObject.drawable = function(id, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			var state = getState(id);

			// save cache
			saveUndo(id);

			// save state
			setState(id, {
				drawabled: state.drawabled === false
			});

			if (config.edit) {
				config.edit(null, exportState(id));
			}
			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
		}

		myObject.remove = function(id, cb) {
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				} 
				return false;
			}

			if (!canvasState.editabled) {
				if (cb) {
					cb("Canvas editing not enabled");
				}
				return false;
			}

			// check focus
			if (eventState.target) {
				if (eventState.target === id) {
					focusOut(id);
				}
			}

			var tmp = exportState(id);
			var res = removeImage(id);
			if (!res) { 
				if (cb) {
					cb("Could not remove image");
				}
				return false;
			} else {
				if (cb) {
					cb(null, tmp);
				}
				return tmp;
			}
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

			if (!isAvailable(id)) {
				if (config.edit) {
					config.edit("Could not edit image");
				}
				if (cb) {
					cb("Could not edit image");
				} 
				return false;
			}

			var state = getState(id);

			var fittedSizes = getContainedSizes(
				state.originalWidth,
				state.originalHeight,
				canvasState.width * config.renderImageWidth,
				canvasState.height * config.renderImageHeight,
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
				lockAspectRatio: true,
				focusabled: true,
				editabled: true,
				drawabled: true
			});

			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
		}

		// 
		// config
		// 

		myObject.config = function(newConfig, cb) {
			if (!canvasState.editabled && canvasObject) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

			if (!isObject(newConfig)) {
				if (cb) {
					cb("Argument not object");
				}
				return false;
			}

			// set config
			copyObject(config, newConfig);

			if (cb) {
				cb(null, getConfig());
			}
			return getConfig();
		}

		// 
		// canvas
		// 

		myObject.canvas = function(options, cb) {
			if (!canvasState.editabled && canvasObject) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

			if (!isObject(options)) {
				if (cb) {
					cb("Argument not object");
				}
				return false;
			}

			if (
				!isNumeric(options.width) ||
				!isNumeric(options.height) ||
				(!isString(options.unit) && options.unit !== undefined) ||
				(!isNumeric(options.dpi) && options.dpi !== undefined)
			) {
				if (cb) {
					cb("Argument not allowed");
				}
				return false;
			}

			var inputW = toNumber(options.width);
			var inputH = toNumber(options.height);
			var inputU = options.unit || "px";
			var inputD = isNumeric(options.dpi) ? toNumber(options.dpi) : 300;

			var sizes = dimensionsToPx(inputW, inputH, inputU, inputD);
			if (!sizes) {
				if (cb) {
					cb("Argument not allowed");
				}
				return false;
			}

			canvasState.originalWidth = sizes[0];
			canvasState.originalHeight = sizes[1];

			if (canvasObject) {
				// set canvas
				initCanvas();

				// set images
				imageStates.forEach(function(elem){
					var minX = 0;
					var minY = 0;
					var maxX = canvasState.width;
					var maxY = canvasState.height;

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
			}

			if (cb) {
				cb(null, getCanvas());
			}
			return getCanvas();
		}

		myObject.newCanvas = function(options, cb) {
			if (!canvasObject) {
				if (cb) {
					cb("Canvas not initialized");
				}
				return false;
			}

			if (!canvasState.editabled) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

			if (!isObject(options)) {
				if (cb) {
					cb("Argument not object");
				}
				return false;
			}

			if (
				!isNumeric(options.width) ||
				!isNumeric(options.height) ||
				(!isString(options.unit) && options.unit !== undefined) ||
				(!isNumeric(options.dpi) && options.dpi !== undefined)
			) {
				if (cb) {
					cb("Argument not allowed");
				}
				return false;
			}

			var inputW = toNumber(options.width);
			var inputH = toNumber(options.height);
			var inputU = options.unit || "px";
			var inputD = isNumeric(options.dpi) ? toNumber(options.dpi) : 300;

			var sizes = dimensionsToPx(inputW, inputH, inputU, inputD);
			if (!sizes) {
				if (cb) {
					cb("Argument not allowed");
				}
				return false;
			}

			// remove image
			var tmp = [];
			imageStates.forEach(function(elem){
				tmp.push(elem.id);
			});

			tmp.forEach(function(elem){
				removeImage(elem);
			});

			canvasState.originalWidth = sizes[0];
			canvasState.originalHeight = sizes[1];

			// set canvas
			initCanvas();

			// reset background
			canvasState.backgroundColor = undefined;
			canvasObject.style.backgroundColor = "";

			// clear caches
			undoCaches = [];
			redoCaches = [];

			if (cb) {
				cb(null, getCanvas());
			}
			return getCanvas();
		}

		myObject.lock = function(cb) {
			if (canvasState.editabled) {
				canvasState.editabled = false;
			} else {
				canvasState.editabled = true;
			}

			if (cb) {
				cb(null, getCanvas());
			}
			return getCanvas();
		}

		myObject.checker = function(cb) {
			if (!canvasState.editabled) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

			if (!canvasObject.classList.contains(classNames.checker)) {
				canvasObject.classList.add(classNames.checker);
			} else {
				canvasObject.classList.remove(classNames.checker);
			}
			if (cb) {
				return cb(null, true);
			}
		}

		myObject.background = function(colour, cb) {
			if (!canvasState.editabled) {
				if (cb) {
					cb("Canvas has been uneditabled");
				}
				return false;
			}

			if (!isString(colour)) {
				if (cb) {
					cb("Argument not string");
				}
				return false;
			}

			if (
				colour.toLowerCase() === "alpha" ||
				colour.toLowerCase() === "transparent"
			) {
				colour = "transparent";
			} else if (colour !== "") {
				if (colour.charAt(0) !== "#") {
					colour = "#" + colour;
				}	
			} else {
				colour = "";
			}

			canvasState.backgroundColor = colour;
			canvasObject.style.backgroundColor = colour;

			if (cb) {
				cb(null, getCanvas());
			}
			return getCanvas();
		}

		myObject.freeze = function(cb){
			if (eventState.onFreezed === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			if (eventState.target) {
				focusOut(eventState.target);
			}

			if (!containerObject.classList.contains(classNames.onFreezed)) {
				containerObject.classList.add(classNames.onFreezed);
			}

			if (canvasObject.classList.contains(classNames.checker)) {
				eventState.checker = true;
				canvasObject.classList.remove(classNames.checker);
			}

			if (canvasState.editabled) {
				eventState.editabled = canvasState.editabled;
			}

			canvasState.editabled = false;
			eventState.onFreezed = true;

			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.thaw = function(cb){
			if (eventState.onFreezed === false) {
				if (cb) {
					cb("No progress in");
				}
				return false;
			}

			canvasState.editabled = eventState.editabled;
			eventState.onFreezed = false;

			if (containerObject.classList.contains(classNames.onFreezed)) {
				containerObject.classList.remove(classNames.onFreezed);
			}

			if (eventState.checker) {
				if (!canvasObject.classList.contains(classNames.checker)) {
					canvasObject.classList.add(classNames.checker);
				}
				eventState.checker = undefined;
			}

			eventState.editabled = undefined;

			if (cb) {
				cb(null, true);
			}
			return true;
		}

		// 
		// draw
		// 

		myObject.draw = function(options, cb){
			/*
				options = {
					filename(optional),
					fileType(optional),
					mimeType(optional),
					width(optional), 
					height(optional),
					backgroundColor(optional),
					quality(optional),
				}
			*/

			if (eventState.onDraw === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			
			var filename = canvasState.filename;
			var mimeType = canvasState.mimeType;
			var dataType = canvasState.dataType;
			var quality = canvasState.quality;
			var backgroundColor = canvasState.backgroundColor;
			var width = canvasState.originalWidth;
			var height = canvasState.originalHeight;
			
			if (isObject(options)) {
				if (isString(options.filename)) {
					filename = options.filename;
				}
				if (isString(options.mimeType)) {
					mimeType = options.mimeType;
				}
				if (isString(options.dataType)) {
					if (options.dataType.toLowerCase() === "url") {
						dataType = "url";
					}
				}
				if (isNumeric(options.quality)) {
					quality = toNumber(options.quality);
				}
				if (isString(options.backgroundColor)) {
					backgroundColor = options.backgroundColor;
				}
				if (isNumeric(options.width)) {
					width = toNumber(options.width);
				}
				if (isNumeric(options.height)) {
					height = toNumber(options.height);
				}
			}

			var canvasSizes = getContainedSizes(
				canvasState.originalWidth,
				canvasState.originalHeight,
				width,
				height,
			);

			var canvas = drawCanvas({
				width: canvasSizes[0],
				height: canvasSizes[1],
				backgroundColor: backgroundColor
			});
			if (!canvas) {
				if (cb) {
					cb("Draw error");
				}
				return false;
			}

			var drawables = [];
			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawabled === true) {
					drawables.push(exportState(imageStates[i].id));
				}
			}

			drawables.sort(function(a, b){
				return a.index - b.index;
			});

			var result = {
				filename: filename,
				mimeType: mimeType,
				dataType: dataType,
				quality: quality,
				backgroundColor: backgroundColor,
				width: canvas.width,
				height: canvas.height,
				numberOfImages: drawables.length,
			};

			var imageResults = [];

			eventState.onDraw = true;
			var loading = startLoading(document.body);

			var index = drawables.length;
			var count = 0;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// recursive
					var canvState = getCanvas();
					var imgState = drawables[count];
					drawImage(canvas, canvState, imgState, function(err) {
						if (err) {
							imageResults.push({
								id: imgState.id,
								err: err
							});
						} else {
							imageResults.push(imgState);	
						}
						count++;
						recursiveFunc();
					});
				} else {
					// end
					var dataURL = canvas.toDataURL(mimeType, quality);
					var data;
					if (dataType === "url") {
						data = dataURL;
					} else if (dataType === "file") {
						data = dataURLtoFile(dataURL, filename);
					} else {
						if (cb) {
							cb("DataType not found");
						}
						return false;
					}

					result.images = imageResults;

					eventState.onDraw = false;
					endLoading(loading);

					if (cb) {
						cb(null, data, result);
					}
					return data;
				}
			}
		}

		myObject.drawTo = function(options, canvState, imgStates, cb){
			/*
				options = {
					filename(optional),
					fileType(optional),
					mimeType(optional),
					width(optional), 
					height(optional),
					backgroundColor(optional),
					quality(optional),
				}

				canvState => canvaaas.getCanvasData()

				imgStates => canvaaas.export()
			*/

			if (eventState.onDraw === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			
			var filename = canvState.filename;
			var mimeType = canvState.mimeType;
			var dataType = canvState.dataType;
			var quality = canvState.quality;
			var backgroundColor = canvState.backgroundColor;
			var width = canvState.width;
			var height = canvState.height;
			
			if (isObject(options)) {
				if (isString(options.filename)) {
					filename = options.filename;
				}
				if (isString(options.mimeType)) {
					mimeType = options.mimeType;
				}
				if (isString(options.dataType)) {
					if (options.dataType.toLowerCase() === "url") {
						dataType = "url";
					}
				}
				if (isNumeric(options.quality)) {
					quality = toNumber(options.quality);
				}
				if (isString(options.backgroundColor)) {
					backgroundColor = options.backgroundColor;
				}
				if (isNumeric(options.width)) {
					width = toNumber(options.width);
				}
				if (isNumeric(options.height)) {
					height = toNumber(options.height);
				}
			}

			var canvasSizes = getContainedSizes(
				canvState.width,
				canvState.height,
				width,
				height,
			);

			var canvas = drawCanvas({
				width: canvasSizes[0],
				height: canvasSizes[1],
				backgroundColor: backgroundColor
			});
			if (!canvas) {
				if (cb) {
					cb("Draw error");
				}
				return false;
			}

			var drawables = [];
			for (var i = 0; i < imgStates.length; i++) {
				var copied = {};
				copyObject(copied, imgStates[i]);

				if (!copied.src) {
					if (copied.url) {
						copied.src = copied.url;
					} else if (copied.path) {
						copied.src = copied.path;
					}
				}

				if (copied.drawabled === true) {
					drawables.push(copied);
				}
			}

			drawables.sort(function(a, b){
				return a.index - b.index;
			});

			var result = {
				filename: filename,
				mimeType: mimeType,
				dataType: dataType,
				quality: quality,
				backgroundColor: backgroundColor,
				width: canvas.width,
				height: canvas.height,
				numberOfImages: drawables.length,
			};

			var imageResults = [];

			eventState.onDraw = true;
			var loading = startLoading(document.body);

			var index = drawables.length;
			var count = 0;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// recursive
					var imgState = drawables[count];
					drawImage(canvas, canvState, imgState, function(err) {
						if (err) {
							imageResults.push({
								id: imgState.id,
								err: err
							});
						} else {
							imageResults.push(imgState);	
						}
						count++;
						recursiveFunc();
					});
				} else {
					// end
					var dataURL = canvas.toDataURL(mimeType, quality);
					var data;
					if (dataType === "url") {
						data = dataURL;
					} else if (dataType === "file") {
						data = dataURLtoFile(dataURL, filename);
					} else {
						if (cb) {
							cb("DataType not found");
						}
						return false;
					}

					result.images = imageResults;
					eventState.onDraw = false;

					endLoading(loading);

					if (cb) {
						cb(null, data, result);
					}
					return data;
				}
			}
		}
		
		myObject.download = function(data, filename){
			var link = document.createElement('a');
			link.setAttribute('href', data);
			link.setAttribute('download', filename);
			link.style.display = 'none';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(data);
		}
		
		myObject.newTab = function(data){
			var image = new Image();
			image.src = data;
			image.style.position = 'absolute';
			image.style.top = '50%';
			image.style.left = '50%';
			image.style.transform = 'translate(-50%, -50%)';
			image.style.width = '100%';
			image.style.height = 'auto';

			var newTab = window.open('');
			newTab.document.write(image.outerHTML);
			newTab.document.body.style.backgroundColor = '#000000';
			newTab.document.body.style.padding = '24px';
			newTab.document.body.style.position = 'relative';

			window.URL.revokeObjectURL(data);
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

			if (cb) {
				cb(null, eventState.target);
			}
			return eventState.target;
		}

		myObject.getConfigData = function(cb){
			if (cb) {
				cb(null, getConfig());
			}
			return getConfig();
		}

		myObject.getCanvasData = function(cb){
			if (cb) {
				cb(null, getCanvas());
			}
			return getCanvas();
		}

		myObject.getUndoData = function(cb){
			if (cb) {
				cb(null, undoCaches.length);
			}
			return undoCaches.length;
		}

		myObject.getRedoData = function(cb){
			if (cb) {
				cb(null, redoCaches.length);
			}
			return redoCaches.length;
		}

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
				focusOut(eventState.target);
			}

			var id = callUndo();

			focusIn(id);

			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
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
				focusOut(eventState.target);
			}

			var id = callRedo();

			focusIn(id);

			if (cb) {
				cb(null, exportState(id));
			}
			return exportState(id);
		}

		myObject.export = function(cb){
			var states = [];
			imageStates.forEach(function(elem){
                var tmp = exportState(elem.id);
                tmp.src = elem.src;
				states.push(tmp);
			});

			var results = states.sort(function(a, b){
				return a.index - b.index;
			});

			if (cb) {
				cb(null, results, getCanvas());
			}
			return results;
		}

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
						cb("Argument not array");
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
							cb("Argument not array");
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
								exportState(res)
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
				}
			}
		}

		myObject.destroy = function(cb){
			window.removeEventListener("resize", windowResizeEvent, false);

			containerObject.parentNode.removeChild(containerObject);

			config = {};
			copyObject(config, defaultConfig);

			eventState = {};
			containerState = {};
			canvasState = {};
			copyObject(canvasState, defaultCanvas);
			imageStates = [];
			undoCaches = [];
			redoCaches = [];

			containerObject = undefined;
			canvasObject = undefined;
			mirrorObject = undefined;

			windowResizeEvent = undefined;

			originId = "canvaaas-o";
			cloneId = "canvaaas-c";

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