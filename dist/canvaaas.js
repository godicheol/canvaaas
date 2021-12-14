// canvaaas.js
// godicheol@gmail.com

(function(window){
	'use strict';

	function canvaaas() {

		var myObject = {};

		var defaultConfig = {
			allowedMimeTypes: [
				"image/bmp",
				"image/x-ms-bmp",
				"image/jpg",
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/svg",
				"image/svg+xml",
				"image/tiff",
				"image/tif",
				"image/webp",
			], // array of allowed mimetypes
			cacheLevels: 999, // number
			startIndexAfterRender: 1, // number
			maxIndexAfterRender: 1000, // number
			imageScaleAfterRender: 0.5, // number, 0 ~ 1 scale in canvas
			lockAspectRatioAfterRender: false, // boolean
			showGridAfterRender: true, // boolean
			showPivotAfterRender: true, // boolean
			showBorderAfterRender: {
				"n": "crop",
				"s": "crop",
				"e": "crop",
				"w": "crop",
			}, // object
			showHandleAfterRender: {
				"n": "resize",
				"s": "resize",
				"e": "resize",
				"w": "resize",
				"ne": "resize",
				"nw": "resize",
				"se": "resize",
				"sw": "resize",
				"nn": "rotate",
				"ee": "flip",
			}, // object
			click: undefined, // function(err, res, event)
			rightClick: undefined, // function(err, res. event)
			upload: undefined, // function(err, res)
			edit: undefined, // function(err, res, event)
			remove: undefined, // function(err, res)
		};

		var defaultCanvasState = {
			isInitialized: false, // boolean
			originalWidth: undefined, // number
			originalHeight: undefined, // number
			width: undefined, // number
			height: undefined, // number
			x: undefined, // number
			y: undefined, // number
			scaleX: undefined, // number,
			scaleY: undefined, // number,
			background: "transparent", // string, "transparent" or "#FFFFFF" ~ "#000000"
			overflow: true, // boolean
			checker: true, // boolean
			uploadable: true, // boolean
			clickable: true, // boolean
			editable: true, // boolean
			movable: true, // boolean
			resizable: true, // boolean
			rotatable: true, // boolean
			flippable: true, // boolean
			croppable: true, // boolean
		};
		var handleDirectionSet = [
			"n",
			"s",
			"e",
			"w",
			"ne",
			"nw",
			"se",
			"sw",
			"nn",
			"ss",
			"ee",
			"ww",
			"nwnw",
			"nene",
			"swsw",
			"sese",
		];
		var allowedHandleEvents = [
			"none",
			"click",
			"resize",
			"crop",
			"rotate",
			"flip",
		];
		var borderDirectionSet = [
			"n",
			"s",
			"e",
			"w",
		];
		var allowedBorderEvents = [
			"none",
			"click",
			"resize",
			"crop",
			"flip",
		];

		// generate default state of image
		var generateImageState = function(newImage) {
			var id = getShortId();
			var lastIndex = config.startIndexAfterRender - 1;
			var coordinate = getCoordinate();

			var fittedSizes = getContainedSizes(
				newImage.width,
				newImage.height,
				coordinate.relativeWidth * config.imageScaleAfterRender,
				coordinate.relativeHeight * config.imageScaleAfterRender
			);
			var tmpHandleState = {};
			var tmpBorderState = {};

			var width = fittedSizes[0];
			var height = fittedSizes[1];
			var axisX = coordinate.relativeX;
			var axisY = coordinate.relativeY;

			for(var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].index < config.maxIndexAfterRender) {
					if (imageStates[i].index > lastIndex) {
						lastIndex = imageStates[i].index;
					}
				}
			}
			for (var i = 0; i < Object.keys(config.showBorderAfterRender).length; i++) {
				var k = Object.keys(config.showBorderAfterRender)[i];
				var v = config.showBorderAfterRender[k];
				if (hasArgument(borderDirectionSet, k)) {						
					tmpBorderState[k] = v;
				}
			}
			for (var i = 0; i < Object.keys(config.showHandleAfterRender).length; i++) {
				var k = Object.keys(config.showHandleAfterRender)[i];
				var v = config.showHandleAfterRender[k];
				if (hasArgument(handleDirectionSet, k)) {						
					tmpHandleState[k] = v;
				}
			}
			
			return {
				id: id,
				src: newImage.src,
				index: lastIndex + 1,
				originalWidth: newImage.width,
				originalHeight: newImage.height,
				width: width,
				height: height,
				x: axisX,
				y: axisY,
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
				anchor: 4,
				lockAspectRatio: config.lockAspectRatioAfterRender || false,
				visible: true,
				clickable: true,
				editable: true,
				movable: true,
				resizable: true,
				rotatable: true,
				flippable: true,
				croppable: true,
				drawable: true,
				pivot: config.showPivotAfterRender || false,
				grid: config.showGridAfterRender || false,
				border: tmpBorderState,
				handle: tmpHandleState
			}
		};

		var canvasTemplate = "";
		canvasTemplate += "<div class='canvaaas-screen'>";
		canvasTemplate += "<div class='canvaaas-canvas'>";
		canvasTemplate += "<div class='canvaaas-images'></div>";
		canvasTemplate += "<div class='canvaaas-background'></div>";
		canvasTemplate += "<div class='canvaaas-checker'></div>";
		canvasTemplate += "</div>";
		canvasTemplate += "<div class='canvaaas-mirror'>";
		canvasTemplate += "<div class='canvaaas-images'></div>";
		canvasTemplate += "</div>";
		canvasTemplate += "</div>";

		var imageTemplate = "";
		imageTemplate += "<div class='canvaaas-content'><img></div>";
		imageTemplate += "<div class='canvaaas-overlay'></div>";
		imageTemplate += "<div class='canvaaas-pivot canvaaas-direction-x'></div>";
		imageTemplate += "<div class='canvaaas-pivot canvaaas-direction-y'></div>";
		imageTemplate += "<div class='canvaaas-grid canvaaas-direction-n'></div>";
		imageTemplate += "<div class='canvaaas-grid canvaaas-direction-s'></div>";
		imageTemplate += "<div class='canvaaas-grid canvaaas-direction-e'></div>";
		imageTemplate += "<div class='canvaaas-grid canvaaas-direction-w'></div>";
		imageTemplate += "<div class='canvaaas-border canvaaas-direction-n'><div class='canvaaas-border-line'></div></div>";
		imageTemplate += "<div class='canvaaas-border canvaaas-direction-s'><div class='canvaaas-border-line'></div></div>";
		imageTemplate += "<div class='canvaaas-border canvaaas-direction-e'><div class='canvaaas-border-line'></div></div>";
		imageTemplate += "<div class='canvaaas-border canvaaas-direction-w'><div class='canvaaas-border-line'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-n'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-e'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-s'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-w'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-ne'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-nw'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-se'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-sw'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-nn'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-ee'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-ss'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-ww'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-nene'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-nwnw'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-sese'><div class='canvaaas-handle-square'></div></div>";
		imageTemplate += "<div class='canvaaas-handle canvaaas-direction-swsw'><div class='canvaaas-handle-square'></div></div>";

		var directionSet = [
			"n",
			"s",
			"e",
			"w",
			"ne",
			"nw",
			"se",
			"sw",
			"nn",
			"ss",
			"ee",
			"ww",
			"nwnw",
			"nene",
			"swsw",
			"sese",
		];

		var MAX_WIDTH = 4096; // canvas
		var MAX_HEIGHT = 4096; // canvas
		var MIN_WIDTH = 1; // canvas
		var MIN_HEIGHT = 1; // canvas
		var SCROLLBAR_WIDTH = 0;

		var originId = "canvaaas-o-";
		var cloneId = "canvaaas-c-";
		var originImgId = "canvaaas-oi-";
		var cloneImgId = "canvaaas-ci-";
		var originHandleId = "canvaaas-oh-";
		var cloneHandleId = "canvaaas-ch-";
		var originBorderId = "canvaaas-ob-";
		var cloneBorderId = "canvaaas-cb-";

		var config = {};
		var eventState = {};
		var canvasState = {};
		var imageStates = [];
		var undoCaches = [];
		var redoCaches = [];
		var containerElement;
		var screenElement;
		var canvasElement;
		var mirrorElement;
		var windowResizeEvent;
		var windowScrollEvent;

		Object.freeze(defaultConfig);
		Object.freeze(defaultCanvasState);

		copyObject(config, defaultConfig);
		copyObject(canvasState, defaultCanvasState);

		//
		// event handlers start
		//

		var handlers = {

			stopEvents: function(e) {
				e.preventDefault();
				e.stopPropagation();
			},

			drop: function(e) {
				try {
					var coordinate = getCoordinate(e);
					var dt = e.dataTransfer;
					var files = dt.files;
					var index = files.length;
					var count = 0;
					var state = {
						x: coordinate.mouseX,
						y: coordinate.mouseY,
					}
	
					if (eventState.onUpload) {
						if (config.upload) {
							config.upload("Already in progress");
						}
						return false;
					}
					if (!canvasState.uploadable) {
						if (config.upload) {
							config.upload("You are not allowed to upload in this canvas by canvas settings");
						}
						return false;
					}
	
					eventState.onUpload = true;

					recursiveFunc();

					function recursiveFunc() {
						if (count < index) {
							renderImage(files[count], state, function(err, res) {
								if (err) {
									if (config.upload) {
										config.upload(err);
									}
								} else {
									var tmp = copyImageState(res);
									if (config.upload) {
										config.upload(null, tmp);
									}
								}
								count++;
								recursiveFunc();
							});
						} else {
							eventState.onUpload = false;
						}
					}
				} catch(err) {
					console.log(err);
					return false;
				}				
			},

			// deprecated
			startHover: function(e) {
				try {
					if (eventState.onClick) {
						return false;
					}
					if (eventState.onMove) {
						return false;
					}
					if (eventState.onResize) {
						return false;
					}
					if (eventState.onZoom) {
						return false;
					}
					if (eventState.onRotate) {
						return false;
					}
					if (eventState.onFlip) {
						return false;
					}
					if (eventState.onCrop) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					var target = getTargetElement(e);
					if (!target) {
						return false;
					}
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;

					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else {
						return false;
					}

					// save event state
					eventState.onHover = true;
					eventState.target = target;
					
					// add events
					target.addEventListener("mousemove", handlers.onHover, false);
					target.addEventListener("mouseleave", handlers.endHover, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "hover",
						status: "start",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.hover) {	
						config.hover(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			// deprecated
			onHover: function(e) {
				try {
					if (eventState.onClick) {
						return false;
					}
					if (eventState.onMove) {
						return false;
					}
					if (eventState.onResize) {
						return false;
					}
					if (eventState.onZoom) {
						return false;
					}
					if (eventState.onRotate) {
						return false;
					}
					if (eventState.onFlip) {
						return false;
					}
					if (eventState.onCrop) {
						return false;
					}
					if (!eventState.onHover) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else {
						return false;
					}
					
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "hover",
						status: "continue",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.hover) {	
						config.hover(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			// deprecated
			endHover: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					if (typeof(e.changedTouches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else {
						return false;
					}
					
					// clear event state
					eventState.onHover = false;
					eventState.target = undefined;

					// remove events
					target.removeEventListener("mousemove", handlers.onHover, false);
					target.removeEventListener("mouseleave", handlers.endHover, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "hover",
						status: "end",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (!res) {
						return false;
					}
					if (config.hover) {	
						config.hover(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			// deprecated
			doubleClick: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var res = copyImageState(id);
					if (config.doubleClick) {
						config.doubleClick(null, res);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			rightClick: function(e) {
				try {
					var target = getTargetElement(e);
					var isRightClick = e.button === 2 || e.ctrlKey;
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;

					if (!target) {
						return false;
					}
					if (type !== "image") {
						return false;
					}
					if (!isRightClick) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();

					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else {
						return false;
					}

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "rightClick",
						status: "end",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.rightClick) {	
						config.rightClick(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startClickHandle: function(e) {
				try {
					var target = getTargetElement(e);
				
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var flippedDirection = flipDirection(direction, state.scaleX, state.scaleY);
					var mouseX;
					var mouseY;

					if (!target) {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					if (!state["handle"][flippedDirection]) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();
					if (state["handle"][flippedDirection] === "resize") {
						return handlers.startResize(e);
					} else if (state["handle"][flippedDirection] === "rotate") {
						return handlers.startRotate(e);
					} else if (state["handle"][flippedDirection] === "flip") {
						return handlers.startFlip(e);
					} else if (state["handle"][flippedDirection] === "crop") {
						return handlers.startCrop(e);
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

					// save event state
					eventState.click = true;
					eventState.onClick = true;
					eventState.target = target;
					eventState.mouseX = mouseX;
					eventState.mouseY = mouseY;

					// add events
					document.addEventListener("mousemove", handlers.onClickHandle, false);
					document.addEventListener("mouseup", handlers.endClickHandle, false);

					document.addEventListener("touchmove", handlers.onClickHandle, false);
					document.addEventListener("touchend", handlers.endClickHandle, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "click",
						status: "start",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onClickHandle: function(e) {
				try {
					if (!eventState.onClick) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					var moveX;
					var moveY;
					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.touches.length === 1) {
						mouseX = e.touches[0].clientX;
						mouseY = e.touches[0].clientY;
					} else {
						return false;
					}

					moveX = mouseX - eventState.mouseX;
					moveY = mouseY - eventState.mouseY;

					if (Math.abs(moveX) > 12 || Math.abs(moveY) > 12) {
						eventState.click = false;
						eventState.onClick = false;
					}

					// callback
					// var res = copyImageState(id);
					// var evt = {
					// 	id: id,
					// 	method: "click",
					// 	status: "continue",
					// 	type: type,
					// 	direction: direction,
					// 	mouseX: mouseX,
					// 	mouseY: mouseY
					// }
					// if (config.edit) {	
					// 	config.edit(null, res, evt);
					// }
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endClickHandle: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					if (typeof(e.changedTouches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.changedTouches.length === 1) {
						mouseX = e.changedTouches[0].clientX;
						mouseY = e.changedTouches[0].clientY;
					} else {
						return false;
					}

					// clear event state
					eventState.click = false;
					eventState.onClick = false;
					eventState.target = undefined;

					// remove events
					document.removeEventListener("mousemove", handlers.onClickHandle, false);
					document.removeEventListener("mouseup", handlers.endClickHandle, false);

					document.removeEventListener("touchmove", handlers.onClickHandle, false);
					document.removeEventListener("touchend", handlers.endClickHandle, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "click",
						status: "end",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startClickBorder : function(e) {
				try {
					var target = getTargetElement(e);
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var flippedDirection = flipDirection(direction, state.scaleX, state.scaleY);
					var mouseX;
					var mouseY;

					if (!target) {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					if (!state["border"][flippedDirection]) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();

					if (state["border"][flippedDirection] === "resize") {
						return handlers.startResize(e);
					} else if (state["border"][flippedDirection] === "crop") {
						return handlers.startCrop(e);
					} else if (state["border"][flippedDirection] === "flip") {
						return handlers.startFlip(e);
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

					// save event state
					eventState.click = true;
					eventState.onClick = true;
					eventState.target = target;
					eventState.mouseX = mouseX;
					eventState.mouseY = mouseY;

					// add events
					document.addEventListener("mousemove", handlers.onClickBorder, false);
					document.addEventListener("mouseup", handlers.endClickBorder, false);

					document.addEventListener("touchmove", handlers.onClickBorder, false);
					document.addEventListener("touchend", handlers.endClickBorder, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "click",
						status: "start",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onClickBorder : function(e) {
				try {
					if (!eventState.onClick) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					var moveX;
					var moveY;
					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.touches.length === 1) {
						mouseX = e.touches[0].clientX;
						mouseY = e.touches[0].clientY;
					} else {
						return false;
					}

					moveX = mouseX - eventState.mouseX;
					moveY = mouseY - eventState.mouseY;

					if (Math.abs(moveX) > 12 || Math.abs(moveY) > 12) {
						eventState.click = false;
						eventState.onClick = false;
					}

					// callback
					// var res = copyImageState(id);
					// var evt = {
					// 	id: id,
					// 	method: "click",
					// 	status: "continue",
					// 	type: type,
					// 	direction: direction,
					// 	mouseX: mouseX,
					// 	mouseY: mouseY
					// }
					// if (config.edit) {	
					// 	config.edit(null, res, evt);
					// }
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endClickBorder : function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					if (typeof(e.changedTouches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.changedTouches.length === 1) {
						mouseX = e.changedTouches[0].clientX;
						mouseY = e.changedTouches[0].clientY;
					} else {
						return false;
					}

					// clear event state
					eventState.click = false;
					eventState.onClick = false;
					eventState.target = undefined;

					// remove events
					document.removeEventListener("mousemove", handlers.onClickBorder, false);
					document.removeEventListener("mouseup", handlers.endClickBorder, false);

					document.removeEventListener("touchmove", handlers.onClickBorder, false);
					document.removeEventListener("touchend", handlers.endClickBorder, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "click",
						status: "end",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},
			
			startClick: function(e) {
				try {
					var target = getTargetElement(e);
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var mouseX;
					var mouseY;

					if (!target) {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();
					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.touches.length === 1) {
						mouseX = e.touches[0].clientX;
						mouseY = e.touches[0].clientY;
					} else if (e.touches.length > 1) {
						// mobile
						return handlers.startPinchZoom(e);
					} else {
						return false;
					}

					// save event state
					eventState.click = true;
					eventState.onClick = true;
					eventState.target = target;
					eventState.mouseX = mouseX;
					eventState.mouseY = mouseY;

					// add class
					addClassToImage(id, "canvaaas-editing");

					// add events
					document.addEventListener("mousemove", handlers.onClick, false);
					document.addEventListener("mouseup", handlers.endClick, false);

					document.addEventListener("touchmove", handlers.onClick, false);
					document.addEventListener("touchend", handlers.endClick, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "click",
						status: "start",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.click) {	
						config.click(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onClick: function(e) {
				try {
					if (!eventState.onClick) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					var moveX;
					var moveY;
					var diff;
					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.touches.length === 1) {
						mouseX = e.touches[0].clientX;
						mouseY = e.touches[0].clientY;
					} else {
						return false;
					}

					moveX = mouseX - eventState.mouseX;
					moveY = mouseY - eventState.mouseY;
					diff = Math.abs(moveX) + Math.abs(moveY);

					if (diff > 2) {
						// end click
						handlers.endClick(e);

						// event propagation
						return handlers.startMove(e);
					}	
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endClick: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					if (typeof(e.changedTouches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.changedTouches.length === 1) {
						mouseX = e.changedTouches[0].clientX;
						mouseY = e.changedTouches[0].clientY;
					} else {
						return false;
					}

					// clear event state
					eventState.click = false;
					eventState.onClick = false;
					eventState.target = undefined;

					// remove class
					removeClassToImage(id, "canvaaas-editing");

					// remove events
					document.removeEventListener("mousemove", handlers.onClick, false);
					document.removeEventListener("mouseup", handlers.endClick, false);

					document.removeEventListener("touchmove", handlers.onClick, false);
					document.removeEventListener("touchend", handlers.endClick, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "click",
						status: "end",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.click) {	
						config.click(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startMove: function(e) {
				try {
					if (eventState.onClick) {
						return false;
					}

					var target = getTargetElement(e);
					var isLeftClick = (e.button === 0 && !e.ctrlKey) || typeof(e.touches) !== "undefined";
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var mouseX;
					var mouseY;

					if (!target) {
						return false;
					}
					if (!state) {
						return false;
					}
					// fix osx wheeling
					if (eventState.onZoom) {
						return false;
					}
					// fix right click
					if (!isLeftClick) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();
					if (!canvasState.editable || !canvasState.movable) {
						return false;
					}
					if (!state.editable || !state.movable) {
						return false;
					}
					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.touches.length === 1) {
						mouseX = e.touches[0].clientX;
						mouseY = e.touches[0].clientY;
					} else if (e.touches.length > 1) {
						return handlers.startPinchZoom(e);
					} else {
						return false;
					}
	
					// save event state
					eventState.onMove = true;
					eventState.target = target;
					eventState.x = state.x;
					eventState.y = state.y;
					eventState.mouseX = mouseX;
					eventState.mouseY = mouseY;
	
					// save cache
					saveUndo(id);

					// add class
					addClassToImage(id, "canvaaas-editing");
	
					// add events
					document.addEventListener("mousemove", handlers.onMove, false);
					document.addEventListener("mouseup", handlers.endMove, false);
	
					document.addEventListener("touchmove", handlers.onMove, false);
					document.addEventListener("touchend", handlers.endMove, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "move",
						status: "start",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onMove: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					if (!eventState.onMove) {
						return false;
					}

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var onShiftKey = e.shiftKey;
					var mouseX;
					var mouseY;
					var moveX;
					var moveY;
					var axisX = eventState.x;
					var axisY = eventState.y;
					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.touches.length === 1) {
						mouseX = e.touches[0].clientX;
						mouseY = e.touches[0].clientY;
					} else {
						return false;
					}

					moveX = mouseX - eventState.mouseX;
					moveY = mouseY - eventState.mouseY;

					// check press shift
					if (onShiftKey) {
						if (Math.abs(moveX) > Math.abs(moveY)) {
							moveY = 0;
						} else if (Math.abs(moveX) < Math.abs(moveY)) {
							moveX = 0;
						}
					}

					// save image state
					setImage(id, {
						x: axisX + moveX,
						y: axisY + moveY,
					});
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "move",
						status: "continue",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endMove: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					if (typeof(e.changedTouches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.changedTouches.length === 1) {
						mouseX = e.changedTouches[0].clientX;
						mouseY = e.changedTouches[0].clientY;
					} else {
						return false;
					}

					// clear event state
					eventState.onMove = false;
					eventState.target = undefined;

					// remove class
					removeClassToImage(id, "canvaaas-editing");

					// remove events
					document.removeEventListener("mousemove", handlers.onMove, false);
					document.removeEventListener("mouseup", handlers.endMove, false);

					document.removeEventListener("touchmove", handlers.onMove, false);
					document.removeEventListener("touchend", handlers.endMove, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "move",
						status: "end",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startResize: function(e) {
				try {
					var target = getTargetElement(e);
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var mouseX;
					var mouseY;

					if (!target) {
						return false;
					}
					if (!state) {
						return false;
					}
					// fix osx wheeling
					if (eventState.onZoom) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();
					if (!canvasState.editable || !canvasState.resizable) {
						return false;
					}
					if (!state.editable || !state.resizable) {
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

					// save event state
					eventState.onResize = true;
					eventState.target = target;
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

					// save cache
					saveUndo(id);
					
					// add class
					if (type === "handle") {
						addClassToHandle(id, direction, "canvaaas-editing");
					} else if (type ==="border") {
						addClassToBorder(id, direction, "canvaaas-editing");
					}

					// add events
					document.addEventListener("mousemove", handlers.onResize, false);
					document.addEventListener("mouseup", handlers.endResize, false);

					document.addEventListener("touchmove", handlers.onResize, false);
					document.addEventListener("touchend", handlers.endResize, false);
					
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "resize",
						status: "start",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}	
			},

			onResize: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					if (!eventState.onResize) {
						return false;
					}

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var onShiftKey = e.shiftKey || state.lockAspectRatio;
					var width;
					var height;
					var axisX = eventState.x;
					var axisY = eventState.y;
					var cropTop;
					var cropBottom;
					var cropLeft;
					var cropRight;
					var croppedW = eventState.width - (eventState.cropLeft + eventState.cropRight);
					var croppedH = eventState.height - (eventState.cropTop + eventState.cropBottom);
					var croppedOW = state.originalWidth - ((eventState.cropLeft + eventState.cropRight) / (eventState.width / state.originalWidth));
					var croppedOH = state.originalHeight - ((eventState.cropTop + eventState.cropBottom) / (eventState.height / state.originalHeight));
					var aspectRatio = croppedOW / croppedOH;
					var diffX;
					var diffY;
					var rotate = state.rotate;
					var radians = state.rotate * Math.PI / 180;;
					var cosFraction = Math.cos(radians);
					var sinFraction = Math.sin(radians);
					var mouseX;
					var mouseY;
					var moveX;
					var moveY;
					var fixX;
					var fixY;
					var flippedDirection = flipDirection(direction, state.scaleX, state.scaleY);
					var scaleCropTop = eventState.cropTop / croppedH;
					var scaleCropBottom = eventState.cropBottom / croppedH;
					var scaleCropLeft = eventState.cropLeft / croppedW;
					var scaleCropRight = eventState.cropRight / croppedW;
					var directionSetY = ["n","nn","s","ss","ne","nene","nw","nwnw","se","sese","sw","swsw"];
					var directionSetX = ["e","ee","w","ww","ne","nene","nw","nwnw","se","sese","sw","swsw"];

					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.touches.length === 1) {
						mouseX = e.touches[0].clientX;
						mouseY = e.touches[0].clientY;
					} else {
						return false;
					}

					moveX = mouseX - eventState.mouseX;
					moveY = mouseY - eventState.mouseY;

					diffX = (moveX * cosFraction) + (moveY * sinFraction);
					diffY = (moveY * cosFraction) - (moveX * sinFraction);
					width = croppedW;
					height = croppedH;

					if (
						flippedDirection === "n" ||
						flippedDirection === "nn"
					) {
						height -= diffY;
						if (onShiftKey) {
							width = height * aspectRatio;
						}
					} else if (
						flippedDirection === "ne" ||
						flippedDirection === "nene"
					) {
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
					} else if (
						flippedDirection === "e" ||
						flippedDirection === "ee"
					) {
						width += diffX;
						if (onShiftKey) {
							height = width / aspectRatio;
						}
					} else if (
						flippedDirection === "se" ||
						flippedDirection === "sese"
					) {
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
					} else if (
						flippedDirection === "s" ||
						flippedDirection === "sese"
					) {
						height += diffY;
						if (onShiftKey) {
							width = height * aspectRatio;
						}
					} else if (
						flippedDirection === "sw" ||
						flippedDirection === "swsw"
					) {
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
					} else if (
						flippedDirection === "w" ||
						flippedDirection === "ww"
					) {
						width -= diffX;
						if (onShiftKey) {
							height = width / aspectRatio;
						}
					} else if (
						flippedDirection === "nw" ||
						flippedDirection === "nwnw"
					) {
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
					} else {
						return false;
					}

					fixX = fixCoordinateX(diffX, rotate);
					fixY = fixCoordinateY(diffY, rotate);

					if (hasArgument(directionSetY, flippedDirection)) {
						axisX += 0.5 * fixY[0];
						axisY += 0.5 * fixY[1];
					}
					if (hasArgument(directionSetX, flippedDirection)) {
						axisX += 0.5 * fixX[0];
						axisY += 0.5 * fixX[1];
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

					// save image state
					setImage(id, {
						x: axisX,
						y: axisY,
						width: width,
						height: height,
						cropTop: cropTop,
						cropBottom: cropBottom,
						cropLeft: cropLeft,
						cropRight: cropRight
					});
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "resize",
						status: "continue",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endResize: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					if (typeof(e.changedTouches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.changedTouches.length === 1) {
						mouseX = e.changedTouches[0].clientX;
						mouseY = e.changedTouches[0].clientY;
					} else {
						return false;
					}

					// clear event state
					eventState.onResize = false;
					eventState.target = undefined;

					// remove class
					if (type === "handle") {
						removeClassToHandle(id, direction, "canvaaas-editing");
					} else if (type ==="border") {
						removeClassToBorder(id, direction, "canvaaas-editing");
					}

					// remove events
					document.removeEventListener("mousemove", handlers.onResize, false);
					document.removeEventListener("mouseup", handlers.endResize, false);

					document.removeEventListener("touchmove", handlers.onResize, false);
					document.removeEventListener("touchend", handlers.endResize, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "resize",
						status: "end",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startWheelZoom: function(e){
				try {
					if (eventState.onMove) {
						return false;
					}
					if (eventState.onResize) {
						return false;
					}
					if (eventState.onRotate) {
						return false;
					}
					if (eventState.onClick) {
						return false;
					}
					if (eventState.onCrop) {
						return false;
					}
					if (eventState.onFlip) {
						return false;
					}

					var target = getTargetElement(e);
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var ratio = -e.deltaY * 0.001;
					var width;
					var height;
					var cropTop;
					var cropBottom;
					var cropLeft;
					var cropRight;
					var res;
					var evt;
					var mouseX;
					var mouseY;
					if (!target) {
						return false;
					}
					if (type !== "image") {
						return false;
					}
					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();

					if (!eventState.onZoom) {
						if (!canvasState.editable || !canvasState.resizable) {
							return false;
						}
						if (!state.editable || !state.resizable) {
							return false;
						}
						eventState.onZoom = true;

						// save cache
						saveUndo(id);

						// callback
						res = copyImageState(id);
						evt = {
							id: id,
							method: "resize",
							status: "start",
							type: type,
							direction: direction,
							mouseX: mouseX,
							mouseY: mouseY
						}
						if (config.edit) {	
							config.edit(null, res, evt);
						}
					}

					// clear timer
					if (eventState.wheeling) {
						clearTimeout(eventState.wheeling);
					}

					width = state.width + (state.width * ratio);
					height = state.height + (state.height * ratio);
					cropTop = state.cropTop + (state.cropTop * ratio);
					cropBottom = state.cropBottom + (state.cropBottom * ratio);
					cropLeft = state.cropLeft + (state.cropLeft * ratio);
					cropRight = state.cropRight + (state.cropRight * ratio);

					if (width < 10) {
						return false;
					}
					if (height < 10) {
						return false;
					}

					// save image state
					setImage(id, {
						width: width,
						height: height,
						cropTop: cropTop,
						cropBottom: cropBottom,
						cropLeft: cropLeft,
						cropRight: cropRight
					});
					// callback
					res = copyImageState(id);
					evt = {
						id: id,
						method: "resize",
						status: "continue",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}

					eventState.wheeling = setTimeout(function() {
						// remove timer
						eventState.wheeling = undefined;
						// clear event state
						eventState.onZoom = false;
						// callback
						res = copyImageState(id);
						evt = {
							id: id,
							method: "resize",
							status: "end",
							type: type,
							direction: direction,
							mouseX: mouseX,
							mouseY: mouseY
						}
						if (config.edit) {	
							config.edit(null, res, evt);
						}
					}, 64);
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			fixPinchZoom: function(e){
				if (typeof(e.touches) === "undefined") {
					return false;
				}
				if (e.touches.length < 2) {
					return false;
				}
				if (eventState.target && eventState.onMove) {
					handlers.endMove(e);
				}
				handlers.startPinchZoom(e);
			},

			startPinchZoom: function(e){
				try {
					if (typeof(e.touches) === "undefined") {
						return false;
					}
					if (e.touches.length < 2) {
						return false;
					}

					var target = getTargetElement(e);
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var mouseX;
					var mouseY;
					var diffX;
					var diffY;
					var diagonal;

					if (!target) {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();
					if (!canvasState.editable || !canvasState.resizable) {
						return false;
					}
					if (!state.editable || !state.resizable) {
						return false;
					}
					mouseX = [e.touches[0].clientX, e.touches[1].clientX];
					mouseY = [e.touches[0].clientY, e.touches[1].clientY];
					diffX = Math.abs(mouseX[0] - mouseX[1]);
					diffY = Math.abs(mouseY[0] - mouseY[1]);
					diagonal = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));

					// save event state
					eventState.onZoom = true;
					eventState.target = target;
					eventState.width = state.width;
					eventState.height = state.height;
					eventState.cropTop = state.cropTop;
					eventState.cropBottom = state.cropBottom;
					eventState.cropLeft = state.cropLeft;
					eventState.cropRight = state.cropRight;
					eventState.diagonal = diagonal;

					// save cache
					saveUndo(id);

					// add events
					document.addEventListener("touchmove", handlers.onPinchZoom, false);
					document.addEventListener("touchend", handlers.endPinchZoom, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "resize",
						status: "start",
						type: type,
						direction: direction,
						mouseX: mouseX[1],
						mouseY: mouseY[1],
						touches: [{
							x: mouseX[0],
							y: mouseY[0],
						}, {
							x: mouseX[1],
							y: mouseY[1]
						}],
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onPinchZoom: function(e){
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX = [e.touches[0].clientX, e.touches[1].clientX];
					var mouseY = [e.touches[0].clientY, e.touches[1].clientY];
					var diffX = Math.abs(mouseX[0] - mouseX[1]);
					var diffY = Math.abs(mouseY[0] - mouseY[1]);
					var diagonal = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
					var ratio = (diagonal - eventState.diagonal) * 0.01;
					var width = eventState.width + (eventState.width * ratio);
					var height = eventState.height + (eventState.height * ratio);
					var cropTop = eventState.cropTop + (eventState.cropTop * ratio);
					var cropBottom = eventState.cropBottom + (eventState.cropBottom * ratio);
					var cropLeft = eventState.cropLeft + (eventState.cropLeft * ratio);
					var cropRight = eventState.cropRight + (eventState.cropRight * ratio);

					if (!eventState.onZoom) {
						return false;
					}
					if (width < 10) {
						return false;
					}
					if (height < 10) {
						return false;
					}

					// save image state
					setImage(id, {
						width: width,
						height: height,
						cropTop: cropTop,
						cropBottom: cropBottom,
						cropLeft: cropLeft,
						cropRight: cropRight,
					});
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "resize",
						status: "continue",
						type: type,
						direction: direction,
						mouseX: mouseX[1],
						mouseY: mouseY[1],
						touches: [{
							x: mouseX[0],
							y: mouseY[0],
						}, {
							x: mouseX[1],
							y: mouseY[1]
						}],
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endPinchZoom: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();
	
					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var keepTouchingX;
					var keepTouchingY;
					var touchEndX;
					var touchEndY;
					if (e.touches.length > 0 && e.changedTouches.length > 0) {
						keepTouchingX = e.touches[e.touches.length - 1].clientX;
						keepTouchingY = e.touches[e.touches.length - 1].clientY;
						touchEndX = e.changedTouches[0].clientX;
						touchEndY = e.changedTouches[0].clientY;
					}

					// clear event state
					eventState.onZoom = false;
					eventState.target = undefined;

					// remove event
					document.removeEventListener("touchmove", handlers.onPinchZoom, false);
					document.removeEventListener("touchend", handlers.endPinchZoom, false);
	
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "resize",
						status: "end",
						type: type,
						direction: direction,
						mouseX: keepTouchingX,
						mouseY: keepTouchingY,
						touches: [{
							x: keepTouchingX,
							y: keepTouchingY,
						}, {
							x: touchEndX,
							y: touchEndY
						}],
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}

					// event propagation
					return handlers.startMove(e);
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startRotate: function(e) {
				try {
					var target = getTargetElement(e);
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var coordinate = getCoordinate();
					var containerX = coordinate.containerLeft;
					var containerY = coordinate.containerTop;
					var rotate = state.rotate;
					var mouseX;
					var mouseY;
					var canvasX;
					var canvasY;
					var centerX;
					var centerY;
					var radians;

					if (!target) {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();
					if (!canvasState.editable || !canvasState.rotatable) {
						return false;
					}
					if (!state.editable || !state.rotatable) {
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

					centerX = state.x + coordinate.screenLeft + coordinate.canvasLeft;
					centerY = state.y + coordinate.screenTop + coordinate.canvasTop;
					canvasX = mouseX - containerX;
					canvasY = mouseY - containerY;
					
					// calculate degree
					radians = Math.atan2(centerY - canvasY, canvasX - centerX) * 180 / Math.PI;

					// save event state
					eventState.onRotate = true;
					eventState.target = target;
					eventState.rotate = rotate;
					eventState.centerX = centerX;
					eventState.centerY = centerY;
					eventState.containerX = containerX;
					eventState.containerY = containerY;
					eventState.radians = radians;

					// save cache
					saveUndo(id);

					// add class
					addClassToHandle(id, direction, "canvaaas-editing");

					// add events
					document.addEventListener("mousemove", handlers.onRotate, false);
					document.addEventListener("mouseup", handlers.endRotate, false);

					document.addEventListener("touchmove", handlers.onRotate, false);
					document.addEventListener("touchend", handlers.endRotate, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "rotate",
						status: "start",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onRotate: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var onShiftKey = e.shiftKey;
					var radians;
					var rotate = eventState.rotate;
					var deg;
					var diff;
					var mouseX;
					var mouseY;
					var canvasX;
					var canvasY;
					var centerX = eventState.centerX;
					var centerY = eventState.centerY;
					var containerX = eventState.containerX;
					var containerY = eventState.containerY;

					if (!eventState.onRotate) {
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

					canvasX = mouseX -= containerX;
					canvasY = mouseY -= containerY;					

					// calculate degree
					radians = Math.atan2(centerY - canvasY, canvasX - centerX) * 180 / Math.PI;
					diff = -((radians - eventState.radians) % 360);
					deg = rotate + diff;

					if (onShiftKey) {
						deg = Math.round(deg / 45) * 45;
					}
	
					// save image state
					setImage(id, {
						rotate: deg
					});
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "rotate",
						status: "continue",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endRotate: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					if (typeof(e.changedTouches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.changedTouches.length === 1) {
						mouseX = e.changedTouches[0].clientX;
						mouseY = e.changedTouches[0].clientY;
					} else {
						return false;
					}

					// clear event state
					eventState.onRotate = false;
					eventState.target = undefined;

					// remove class
					removeClassToHandle(id, direction, "canvaaas-editing");

					// remove events
					document.removeEventListener("mousemove", handlers.onRotate, false);
					document.removeEventListener("mouseup", handlers.endRotate, false);

					document.removeEventListener("touchmove", handlers.onRotate, false);
					document.removeEventListener("touchend", handlers.endRotate, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "rotate",
						status: "end",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startFlip: function(e) {
				try {
					var target = getTargetElement(e);
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var coordinate = getCoordinate();
					var containerX = coordinate.containerLeft;
					var containerY = coordinate.containerTop;
					var diffX;
					var diffY;
					var mouseX;
					var mouseY;
					var canvasX;
					var canvasY;
					var centerX;
					var centerY;
					var maxDiagonal;
					
					if (!target) {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();
					if (!canvasState.editable || !canvasState.flippable) {
						return false;
					}
					if (!state.editable || !state.flippable) {
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

					centerX = state.x + coordinate.screenLeft + coordinate.canvasLeft;
					centerY = state.y + coordinate.screenTop + coordinate.canvasTop;
					canvasX = mouseX - containerX;
					canvasY = mouseY - containerY;

					diffX = Math.abs(centerX) - Math.abs(canvasX);
					diffY = Math.abs(centerY) - Math.abs(canvasY);

					maxDiagonal = getDiagonal(
						centerX + diffX - canvasX,
						centerY + diffY - canvasY
					);

					// save event state
					eventState.onFlip = true;
					eventState.target = target;
					eventState.maxDiagonal = maxDiagonal;
					eventState.x = centerX + diffX;
					eventState.y = centerY + diffY;
					eventState.canvasX = canvasX;
					eventState.canvasY = canvasY;
					eventState.containerX = containerX;
					eventState.containerY = containerY;

					// save cache
					saveUndo(id);

					// add class
					if (type === "handle") {
						addClassToHandle(id, direction, "canvaaas-editing");
					} else if (type ==="border") {
						addClassToBorder(id, direction, "canvaaas-editing");
					}

					// add events
					document.addEventListener("mousemove", handlers.onFlip, false);
					document.addEventListener("mouseup", handlers.endFlip, false);

					document.addEventListener("touchmove", handlers.onFlip, false);
					document.addEventListener("touchend", handlers.endFlip, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "flip",
						status: "start",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onFlip: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();
	
					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var onShiftKey = e.shiftKey;
					var degX;
					var degY;
					var mouseX;
					var mouseY;
					var canvasX;
					var canvasY;
					var containerX = eventState.containerX;
					var containerY = eventState.containerY;
					var maxDiagonal = eventState.maxDiagonal;
					var distanceMoved;
					var distanceFromPivot;

					if (!eventState.onFlip) {
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

					canvasX = mouseX - containerX;
					canvasY = mouseY - containerY;
	
					if (eventState.canvasX < eventState.x) {
						if (canvasX > eventState.x) {
							canvasX = eventState.x;
						}
					} else {
						if (canvasX < eventState.x) {
							canvasX = eventState.x;
						}
					}
					if (eventState.canvasY < eventState.y) {
						if (mouseY > eventState.y) {
							mouseY = eventState.y;
						}
					} else {
						if (mouseY < eventState.y) {
							mouseY = eventState.y;
						}
					}
	
					// mouse distance moved
					distanceMoved = getDiagonal(
						eventState.canvasX - canvasX,
						eventState.canvasY - canvasY
					);

					// distance from pivot
					distanceFromPivot = getDiagonal(
						eventState.x - canvasX,
						eventState.y - canvasY
					);
	
					if (
						direction === "n" ||
						direction === "nn"
					) {
						degY = distanceMoved * (180 / maxDiagonal);
	
						if (distanceFromPivot > maxDiagonal) {
							degY = 0;
						}
					} else if (
						direction === "ne" ||
						direction === "nene"
					) {
						degX = distanceMoved * (180 / maxDiagonal);
						degY = distanceMoved * (180 / maxDiagonal);
	
						if (distanceFromPivot > maxDiagonal) {
							degX = 0;
							degY = 0;
						}
					} else if (
						direction === "e" ||
						direction === "ee"
					) {
						degX = distanceMoved * (180 / maxDiagonal);
	
						if (distanceFromPivot > maxDiagonal) {
							degX = 0;
						}
					} else if (
						direction === "se" ||
						direction === "sese"
					) {
						degX = distanceMoved * (180 / maxDiagonal);
						degY = distanceMoved * (180 / maxDiagonal);
	
						if (distanceFromPivot > maxDiagonal) {
							degX = 0;
							degY = 0;
						}
					} else if (
						direction === "s" ||
						direction === "ss"
					) {
						degY = distanceMoved * (180 / maxDiagonal);
	
						if (distanceFromPivot > maxDiagonal) {
							degY = 0;
						}
					} else if (
						direction === "sw" ||
						direction === "swsw"
					) {
						degX = distanceMoved * (180 / maxDiagonal);
						degY = distanceMoved * (180 / maxDiagonal);
	
						if (distanceFromPivot > maxDiagonal) {
							degX = 0;
							degY = 0;
						}
					} else if (
						direction === "w" ||
						direction === "ww"
					) {
						degX = distanceMoved * (180 / maxDiagonal);
	
						if (distanceFromPivot > maxDiagonal) {
							degX = 0;
						}
					} else if (
						direction === "nw" ||
						direction === "nwnw"
					) {
						degX = distanceMoved * (180 / maxDiagonal);
						degY = distanceMoved * (180 / maxDiagonal);
	
						if (distanceFromPivot > maxDiagonal) {
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

					// save image state
					setImage(id, {
						rotateX: degY,
						rotateY: degX
					});
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "flip",
						status: "continue",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endFlip: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var rotateX = state.rotateX;
					var rotateY = state.rotateY;
					var scaleX = state.scaleX;
					var scaleY = state.scaleY;
					var mouseX;
					var mouseY;
					if (typeof(e.changedTouches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.changedTouches.length === 1) {
						mouseX = e.changedTouches[0].clientX;
						mouseY = e.changedTouches[0].clientY;
					} else {
						return false;
					}
	
					if (Math.abs(rotateX) > 90) {
						scaleY = -1 * scaleY;
					}
					if (Math.abs(rotateY) > 90) {
						scaleX = -1 * scaleX;
					}
	
					// save image state
					setImage(id, {
						rotateX: 0,
						rotateY: 0,
						scaleX: scaleX,
						scaleY: scaleY,
					});

					// clear event state
					eventState.onFlip = false;
					eventState.target = undefined;

					// remove class
					if (type === "handle") {
						removeClassToHandle(id, direction, "canvaaas-editing");
					} else if (type ==="border") {
						removeClassToBorder(id, direction, "canvaaas-editing");
					}

					// remove events
					document.removeEventListener("mousemove", handlers.onFlip, false);
					document.removeEventListener("mouseup", handlers.endFlip, false);
	
					document.removeEventListener("touchmove", handlers.onFlip, false);
					document.removeEventListener("touchend", handlers.endFlip, false);
	
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "flip",
						status: "end",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startCrop: function(e) {
				try {
					var target = getTargetElement(e);
					var targetData = getTargetData(target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var mouseX;
					var mouseY;

					if (!target) {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable || !state.clickable) {
						return false;
					}
					e.preventDefault();
					e.stopPropagation();
					if (!canvasState.editable || !canvasState.croppable) {
						return false;
					}
					if (!state.editable || !state.croppable) {
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

					// save event state
					eventState.onCrop = true;
					eventState.target = target;
					eventState.cropTop = state.cropTop;
					eventState.cropBottom = state.cropBottom;
					eventState.cropLeft = state.cropLeft;
					eventState.cropRight = state.cropRight;
					eventState.width = state.width;
					eventState.height = state.height;
					eventState.x = state.x;
					eventState.y = state.y;
					eventState.mouseX = mouseX;
					eventState.mouseY = mouseY;

					// save cache
					saveUndo(id);

					// add class
					if (type === "handle") {
						addClassToHandle(id, direction, "canvaaas-editing");
					} else if (type ==="border") {
						addClassToBorder(id, direction, "canvaaas-editing");
					}

					// add events
					document.addEventListener("mousemove", handlers.onCrop, false);
					document.addEventListener("mouseup", handlers.endCrop, false);

					document.addEventListener("touchmove", handlers.onCrop, false);
					document.addEventListener("touchend", handlers.endCrop, false);

					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "crop",
						status: "start",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onCrop: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();
	
					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var state = getImageState(id);
					var onShiftKey = e.shiftKey;
					var rotate = state.rotate;
					var axisX = eventState.x;
					var axisY = eventState.y;
					var width = eventState.width;
					var height = eventState.height;
					var cropTop = eventState.cropTop;
					var cropBottom = eventState.cropBottom;
					var cropLeft = eventState.cropLeft;
					var cropRight = eventState.cropRight;
					var scaleX = state.scaleX;
					var scaleY = state.scaleY;
					var flippedDirection = flipDirection(direction, scaleX, scaleY);
					var diffX;
					var diffY;
					var radians;
					var cosFraction;
					var sinFraction;
					var mouseX;
					var mouseY;
					var moveX;
					var moveY;
					var fixX;
					var fixY;
					var directionSetY = ["n","nn","s","ss","ne","nene","nw","nwnw","se","sese","sw","swsw"];
					var directionSetX = ["e","ee","w","ww","ne","nene","nw","nwnw","se","sese","sw","swsw"];
					
					if (!eventState.onCrop) {
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

					moveX = mouseX - eventState.mouseX;
					moveY = mouseY - eventState.mouseY;

					radians = rotate * Math.PI / 180;
					cosFraction = Math.cos(radians);
					sinFraction = Math.sin(radians);
					diffX = (moveX * cosFraction) + (moveY * sinFraction);
					diffY = (moveY * cosFraction) - (moveX * sinFraction);

					if (
						flippedDirection === "n" ||
						flippedDirection === "nn"
					) {
						if (-diffY > cropTop) {
							diffY = -cropTop;
						}
						cropTop += diffY;
					} else if (
						flippedDirection === "ne" ||
						flippedDirection === "nene"
					) {
						if (-diffY > cropTop) {
							diffY = -cropTop;
						}
						if (diffX > cropRight) {
							diffX = cropRight;
						}
						cropTop += diffY;
						cropRight -= diffX;
					} else if (
						flippedDirection === "e" ||
						flippedDirection === "ee"
					) {
						if (diffX > cropRight) {
							diffX = cropRight;
						}
						cropRight -= diffX;
					} else if (
						flippedDirection === "se" ||
						flippedDirection === "sese"
					) {
						if (diffY > cropBottom) {
							diffY = cropBottom;
						}
						if (diffX > cropRight) {
							diffX = cropRight;
						}
						cropBottom -= diffY;
						cropRight -= diffX;
					} else if (
						flippedDirection === "s" ||
						flippedDirection === "ss"
					) {
						if (diffY > cropBottom) {
							diffY = cropBottom;
						}
						cropBottom -= diffY;
					} else if (
						flippedDirection === "sw" ||
						flippedDirection === "swsw"
					) {
						if (diffY > cropBottom) {
							diffY = cropBottom;
						}
						if (-diffX > cropLeft) {
							diffX = -cropLeft;
						}
						cropBottom -= diffY;
						cropLeft += diffX;
					} else if (
						flippedDirection === "w" ||
						flippedDirection === "ww"
					) {
						if (-diffX > cropLeft) {
							diffX = -cropLeft;
						}
						cropLeft += diffX;
					} else if (
						flippedDirection === "nw" ||
						flippedDirection === "nwnw"
					) {
						if (-diffY > cropTop) {
							diffY = -cropTop;
						}
						if (-diffX > cropLeft) {
							diffX = -cropLeft;
						}
						cropTop += diffY;
						cropLeft += diffX;
					} else {
						return false;
					}

					fixX = fixCoordinateX(diffX, rotate);
					fixY = fixCoordinateY(diffY, rotate);

					if (hasArgument(directionSetY, flippedDirection)) {
						axisX += 0.5 * fixY[0];
						axisY += 0.5 * fixY[1];
					}
					if (hasArgument(directionSetX, flippedDirection)) {
						axisX += 0.5 * fixX[0];
						axisY += 0.5 * fixX[1];
					}

					// min height 10px
					if (cropTop + cropBottom > height - 10) {
						return false;
					}
					// min width 10px
					if (cropLeft + cropRight > width - 10) {
						return false;
					}
	
					// save image state
					setImage(id, {
						x: axisX,
						y: axisY,
						cropTop: cropTop,
						cropBottom: cropBottom,
						cropLeft: cropLeft,
						cropRight: cropRight
					});
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "crop",
						status: "continue",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endCrop: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var targetData = getTargetData(eventState.target);
					var id = targetData.id;
					var type = targetData.type;
					var direction = targetData.direction;
					var mouseX;
					var mouseY;
					if (typeof(e.changedTouches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.changedTouches.length === 1) {
						mouseX = e.changedTouches[0].clientX;
						mouseY = e.changedTouches[0].clientY;
					} else {
						return false;
					}

					// clear event state
					eventState.onCrop = false;
					eventState.target = undefined;

					// remove class
					if (type === "handle") {
						removeClassToHandle(id, direction, "canvaaas-editing");
					} else if (type ==="border") {
						removeClassToBorder(id, direction, "canvaaas-editing");
					}
	
					// remove events
					document.removeEventListener("mousemove", handlers.onCrop, false);
					document.removeEventListener("mouseup", handlers.endCrop, false);
	
					document.removeEventListener("touchmove", handlers.onCrop, false);
					document.removeEventListener("touchend", handlers.endCrop, false);
	
					// callback
					var res = copyImageState(id);
					var evt = {
						id: id,
						method: "crop",
						status: "end",
						type: type,
						direction: direction,
						mouseX: mouseX,
						mouseY: mouseY
					}
					if (config.edit) {	
						config.edit(null, res, evt);
					}
				} catch(err) {
					console.log(err);
					return false;
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

			resizeWindow: function(e){
				try {
					e.preventDefault();
					e.stopPropagation();
	
					if (!canvasState.isInitialized) {
						return false;
					}
					applyStyleToCanvas();
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			scrollWindow: function(e){
				try {
					console.log("Window Moved");
				} catch(err) {
					console.log(err);
					return false;
				}
			},
		};

		//
		// methods
		//

		function getTargetData(elem) {
			try {
				var arr;
				var id;
				var typ;
				var direction;

				if (!elem) {
					return {};
				}
				if (!elem.id) {
					return {};
				}
				if (
					!elem.classList.contains("canvaaas-image") &&
					!elem.classList.contains("canvaaas-handle") &&
					!elem.classList.contains("canvaaas-border")
				) {
					return {};
				}
				arr = elem.id.split("-");
				id = arr[2];
				if (!id) {
					return {};
				}
				if (arr[1] === "o" || arr[1] === "c") {
					typ = "image";
				} else if (arr[1] === "oh" || arr[1] === "ch") {
					typ = "handle";
				} else if (arr[1] === "ob" || arr[1] === "cb") {
					typ = "border";
				} else {
					return {};
				}
				if (arr.length > 3) {
					direction = arr[3];
				}
				return {
					id: id,
					type: typ,
					direction: direction
				};
			} catch(err) {
				console.log(err);
				return {};
			}
		}

		function getTargetElement(e) {
			try {
				var candidate;
				var found;
				if (typeof(e.touches) === "undefined") {
					candidate = e.target;
				} else if (e.touches.length > 0) {
					for(var i = 0; i < e.touches.length; i++) {
						var tmp = e.touches[i].target;
						for(var j = 0; j < 2; j++) {
							if (!candidate) {
								if (
									tmp.classList.contains("canvaaas-image") ||
									tmp.classList.contains("canvaaas-handle") ||
									tmp.classList.contains("canvaaas-border")
								) {
									candidate = tmp;
								} else {
									if (tmp.parentNode) {
										tmp = tmp.parentNode;
									}
								}
							}
						}
					}
				} else {
					return false;
				}
				for(var i = 0; i < 2; i++) {
					if (!found) {
						if (
							candidate.classList.contains("canvaaas-image") ||
							candidate.classList.contains("canvaaas-handle") ||
							candidate.classList.contains("canvaaas-border")
						) {
							found = candidate;
						} else {
							if (candidate.parentNode) {
								candidate = candidate.parentNode;
							}
						}
					}
				}
				return found;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getImageState(id) {
			try {
				var candidate;
				if (isString(id)) {
					candidate = toString(id);
				} else {
					return false;
				}
				var found;
				for (var i = 0; i < imageStates.length; i++) {
					if (candidate === imageStates[i].id) {
						found = imageStates[i];
					}
				}
				return found;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setId(oldId, newId) {
			try {
				if (!isString(oldId)) {
					return false;
				}
				if (!isString(newId)) {
					return false;
				}
				var oldStr = toString(oldId);
				var newStr = toString(newId);
				if (oldStr === newStr) {
					return false;
				}
				if (!isExist(oldStr)) {
					return false;
				}
				if (isExist(newStr)) {
					return false;
				}
				var state = getImageState(oldStr);
				var origin = document.getElementById(originId + oldStr);
				var clone = document.getElementById(cloneId + oldStr);
				var originImg = document.getElementById(originImgId + oldStr);
				var cloneImg = document.getElementById(cloneImgId + oldStr);
				var originHandles = origin.querySelectorAll("div.canvaaas-handle");
				var cloneHandles = clone.querySelectorAll("div.canvaaas-handle");
				var originBorders = origin.querySelectorAll("div.canvaaas-border");
				var cloneBorders = clone.querySelectorAll("div.canvaaas-border");

				// change undo caches
				for (var i = 0; i < undoCaches.length; i++) {
					if (undoCaches[i].id === oldStr) {
						undoCaches[i].id = newStr;
						undoCaches[i].state.id = newStr;
					}
				}
				// change redo caches
				for (var i = 0; i < redoCaches.length; i++) {
					if (redoCaches[i].id === oldStr) {
						redoCaches[i].id = newStr;
						redoCaches[i].state.id = newStr;
					}
				}

				// change element id
				for (var i = 0; i < originHandles.length; i++) {
					var d = getDirection(originHandles[i]);
					originHandles[i].id = originHandleId + newStr + "-" + d;
				}
				for (var i = 0; i < cloneHandles.length; i++) {
					var d = getDirection(cloneHandles[i]);
					cloneHandles[i].id = cloneHandleId + newStr + "-" + d;
				}
				for (var i = 0; i < originBorders.length; i++) {
					var d = getDirection(originBorders[i]);
					originBorders[i].id = originBorderId + newStr + "-" + d;
				}
				for (var i = 0; i < cloneBorders.length; i++) {
					var d = getDirection(cloneBorders[i]);
					cloneBorders[i].id = cloneBorderId + newStr + "-" + d;
				}
				originImg.id = originImgId + newStr;
				cloneImg.id = cloneImgId + newStr;
				origin.id = originId + newStr;
				clone.id = cloneId + newStr;

				// change state
				state.id = newStr;

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setImage(id, newState) {
			try {
				var state = getImageState(id);
				var origin = document.getElementById(originId + id);
				var clone = document.getElementById(cloneId + id);
				var originImg = document.getElementById(originImgId + id);
				var cloneImg = document.getElementById(cloneImgId + id);
				var newScaleX;
				var oldScaleX;
				var newScaleY;
				var oldScaleY;
				var newLAR;
				var oldLAR;
				var tmp;

				if (!isObject(newState)) {
					return false;
				}
				if (!state) {
					return false;
				}
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}
				if (!originImg) {
					return false;
				}
				if (!cloneImg) {
					return false;
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
					tmp = toNumber(newState.opacity);
					if (tmp > 1) {
						state.opacity = 1;
					} else if (tmp < 0) {
						state.opacity = 0;
					} else {
						state.opacity = tmp;
					}
				}
				if (isBoolean(newState.visible)) {
					state.visible = toBoolean(newState.visible);
				}
				if (isBoolean(newState.clickable)) {
					state.clickable = toBoolean(newState.clickable);
				}
				if (isBoolean(newState.editable)) {
					state.editable = toBoolean(newState.editable);
				}
				if (isBoolean(newState.movable)) {
					state.movable = toBoolean(newState.movable);
				}
				if (isBoolean(newState.resizable)) {
					state.resizable = toBoolean(newState.resizable);
				}
				if (isBoolean(newState.rotatable)) {
					state.rotatable = toBoolean(newState.rotatable);
				}
				if (isBoolean(newState.flippable)) {
					state.flippable = toBoolean(newState.flippable);
				}
				if (isBoolean(newState.croppable)) {
					state.croppable = toBoolean(newState.croppable);
				}
				if (isBoolean(newState.drawable)) {
					state.drawable = toBoolean(newState.drawable);
				}
				if (isNumeric(newState.cropTop)) {
					tmp = toNumber(newState.cropTop);
					if (tmp < 0) {
						state.cropTop = 0;
					} else {
						state.cropTop = tmp;
					}
				}
				if (isNumeric(newState.cropBottom)) {
					tmp = toNumber(newState.cropBottom);
					if (tmp < 0) {
						state.cropBottom = 0;
					} else {
						state.cropBottom = tmp;
					}
				}
				if (isNumeric(newState.cropLeft)) {
					tmp = toNumber(newState.cropLeft);
					if (tmp < 0) {
						state.cropLeft = 0;
					} else {
						state.cropLeft = tmp;
					}
				}
				if (isNumeric(newState.cropRight)) {
					tmp = toNumber(newState.cropRight);
					if (tmp < 0) {
						state.cropRight = 0;
					} else {
						state.cropRight = tmp;
					}
				}
				if (isNumeric(newState.scaleX)) {
					oldScaleX = state.scaleX;
					newScaleX = toNumber(newState.scaleX);
					if (newScaleX === 1 || newScaleX === -1) {
						state.scaleX = newScaleX;
					}
				}
				if (isNumeric(newState.scaleY)) {
					oldScaleY = state.scaleY;
					newScaleY = toNumber(newState.scaleY);
					if (newScaleY === 1 || newScaleY === -1) {
						state.scaleY = newScaleY;
					}
				}
				if (isBoolean(newState.lockAspectRatio)) {
					oldLAR = state.lockAspectRatio;
					newLAR = toBoolean(newState.lockAspectRatio);
					if (newLAR !== oldLAR && newLAR === true) {
						var croppedWidth = state.width - (state.cropLeft + state.cropRight);
						var croppedHeight = state.height - (state.cropTop + state.cropBottom);
						var scaleCropTop = state.cropTop / croppedHeight;
						var scaleCropBottom = state.cropBottom / croppedHeight;
						var scaleCropLeft = state.cropLeft / croppedWidth;
						var scaleCropRight = state.cropRight / croppedWidth;
						var croppedOriginalWidth = state.originalWidth - ((state.cropLeft + state.cropRight) / (state.width / state.originalWidth));
						var croppedOriginalHeight = state.originalHeight - ((state.cropTop + state.cropBottom) / (state.height / state.originalHeight));
						var croppedOriginalAspectRatio = croppedOriginalWidth / croppedOriginalHeight;

						if (croppedWidth > croppedHeight * croppedOriginalAspectRatio) {
							croppedHeight = croppedWidth / croppedOriginalAspectRatio;
						} else {
							croppedWidth = croppedHeight * croppedOriginalAspectRatio;
						}

						state.cropTop = croppedHeight * scaleCropTop;
						state.cropBottom = croppedHeight * scaleCropBottom;
						state.cropLeft = croppedWidth * scaleCropLeft;
						state.cropRight = croppedWidth * scaleCropRight;
						state.width = croppedWidth + (croppedWidth * scaleCropLeft) + (croppedWidth * scaleCropRight);
						state.height = croppedHeight + (croppedHeight * scaleCropTop) + (croppedHeight * scaleCropBottom);
					}
					state.lockAspectRatio = newLAR;
				}
				if (isBoolean(newState.pivot)) {
					state.pivot = toBoolean(newState.pivot);
				}
				if (isBoolean(newState.grid)) {
					state.grid = toBoolean(newState.grid);
				}
				if (isObject(newState.border)) {
					var obj = {};
					for (var i = 0; i < borderDirectionSet.length; i++) {
						var k = borderDirectionSet[i];
						var isStr = isString(newState.border[k]);
						var isAllowed = false;
						if (isStr) {
							tmp = toString(newState.border[k]);
							isAllowed = hasArgument(allowedBorderEvents, tmp);
						}

						if (isAllowed) {
							obj[k] = toString(newState.border[k]);
						}
					}
					state.border = obj;
				}
				if (isObject(newState.handle)) {
					var obj = {};
					for (var i = 0; i < handleDirectionSet.length; i++) {
						var k = handleDirectionSet[i];
						var isStr = isString(newState.handle[k]);
						var isAllowed = false;
						if (isStr) {
							tmp = toString(newState.handle[k]);
							isAllowed = hasArgument(allowedHandleEvents, tmp);
						}
						if (isAllowed) {
							obj[k] = toString(newState.handle[k]);
						}
					}
					state.handle = obj;
				}

				// fix flip Y
				if (newScaleX !== oldScaleX) {
					tmp = state.cropLeft;
					state.cropLeft = state.cropRight;
					state.cropRight = tmp;
				}

				// fix flip X
				if (newScaleY !== oldScaleY) {
					tmp = state.cropTop;
					state.cropTop = state.cropBottom;
					state.cropBottom = tmp;
				}

				applyStyleToImage(id);

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function applyStyleToImage(id) {
			try {
				var state = getImageState(id);
				var origin = document.getElementById(originId + id);
				var clone = document.getElementById(cloneId + id);
				var originImg = document.getElementById(originImgId + id);
				var cloneImg = document.getElementById(cloneImgId + id);
				var originPivots;
				var clonePivots;
				var originGrids;
				var cloneGrids;
				var transform = "";
				var webkitTransform = ""; // deprecated
				var index = state.index;
				var axisX = state.x;
				var axisY = state.y;
				var rotate = state.rotate;
				var rotateX = state.rotateX;
				var rotateY = state.rotateY;
				var scaleX = state.scaleX;
				var scaleY = state.scaleY;
				var width = state.width;
				var height = state.height;
				var cropTop = state.cropTop;
				var cropBottom = state.cropBottom;
				var cropLeft = state.cropLeft;
				var cropRight = state.cropRight;
				var opacity = state.opacity;

				var imgT;
				var imgL;
				var imgW;
				var imgH;

				var croppedW;
				var croppedH;
				var croppedT;
				var croppedL;

				if (!state) {
					return false;
				}
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}
				if (!originImg) {
					return false;
				}
				if (!cloneImg) {
					return false;
				}

				// get elements
				originPivots = origin.querySelectorAll("div.canvaaas-pivot");
				clonePivots = clone.querySelectorAll("div.canvaaas-pivot");
				originGrids = origin.querySelectorAll("div.canvaaas-grid");
				cloneGrids = clone.querySelectorAll("div.canvaaas-grid");

				// transform
				if (rotate !== 0) {
					transform += "rotate(" + Math.floor(rotate) + "deg)";
					webkitTransform += "rotate(" + Math.floor(rotate) + "deg)"; // deprecated
				}
				if (rotateX !== 0) {
					transform += "rotateX(" + Math.floor(rotateX) +  "deg)";
					webkitTransform +="rotateX(" + Math.floor(rotateX) +  "deg)"; // deprecated
				}
				if (rotateY !== 0) {
					transform += "rotateY(" + Math.floor(rotateY) +  "deg)";
					webkitTransform += "rotateY(" + Math.floor(rotateY) +  "deg)"; // deprecated
				}
				if (scaleX === -1) {
					transform += "scaleX(" + scaleX + ")";
					webkitTransform += "scaleX(" + scaleX + ")"; // deprecated
				}
				if (scaleY === -1) {
					transform += "scaleY(" + scaleY + ")";
					webkitTransform += "scaleY(" + scaleY + ")"; // deprecated
				}

				// for image
				croppedW = Math.floor(width - (cropLeft + cropRight));
				croppedH = Math.floor(height - (cropTop + cropBottom));
				croppedT = Math.floor(axisY - (0.5 * croppedH));
				croppedL = Math.floor(axisX - (0.5 * croppedW));

				// chk flip
				if (scaleX < 0) {
					var tmp = cropLeft;
					cropLeft = cropRight;
					cropRight = tmp;
				}
				if (scaleY < 0) {
					var tmp = cropTop;
					cropTop = cropBottom;
					cropBottom = tmp
				}
				
				// for img
				imgT = Math.floor(-cropTop);
				imgL = Math.floor(-cropLeft);
				imgW = Math.floor(width);
				imgH = Math.floor(height);

				// set image
				origin.style.zIndex = index;
				origin.style.top = croppedT + "px";;
				origin.style.left = croppedL + "px";
				origin.style.width = croppedW + "px";
				origin.style.height = croppedH + "px";
				origin.style.transform = transform;
				origin.style.webkitTransform = webkitTransform; // deprecated

				clone.style.zIndex = index;
				clone.style.top = croppedT + "px";
				clone.style.left = croppedL + "px";
				clone.style.width = croppedW + "px";
				clone.style.height = croppedH + "px";
				clone.style.transform = transform;
				clone.style.webkitTransform = webkitTransform; // deprecated

				// set img
				originImg.style.top = imgT + "px";
				originImg.style.left = imgL + "px";
				originImg.style.width = imgW + "px";
				originImg.style.height = imgH + "px";
				originImg.style.opacity = opacity;

				cloneImg.style.top = imgT + "px";
				cloneImg.style.left = imgL + "px";
				cloneImg.style.width = imgW + "px";
				cloneImg.style.height = imgH + "px";
				cloneImg.style.opacity = opacity;

				// set visible
				if (!state.visible) {
					if (!origin.classList.contains("canvaaas-hidden")) {
						origin.classList.add("canvaaas-hidden");
					}
					if (!clone.classList.contains("canvaaas-hidden")) {
						clone.classList.add("canvaaas-hidden");
					}
				} else {
					if (origin.classList.contains("canvaaas-hidden")) {
						origin.classList.remove("canvaaas-hidden");
					}
					if (clone.classList.contains("canvaaas-hidden")) {
						clone.classList.remove("canvaaas-hidden");
					}
				}

				// set clickable
				if (!state.clickable) {
					if (!origin.classList.contains("canvaaas-unclickable")) {
						origin.classList.add("canvaaas-unclickable");
					}
					if (!clone.classList.contains("canvaaas-unclickable")) {
						clone.classList.add("canvaaas-unclickable");
					}
				} else {
					if (origin.classList.contains("canvaaas-unclickable")) {
						origin.classList.remove("canvaaas-unclickable");
					}
					if (clone.classList.contains("canvaaas-unclickable")) {
						clone.classList.remove("canvaaas-unclickable");
					}
				}

				// set pivots
				for (var i = 0; i < originPivots.length; i++) {
					if (!state.pivot) {
						if (!originPivots[i].classList.contains("canvaaas-hidden")) {
							originPivots[i].classList.add("canvaaas-hidden");
						}
					} else {
						if (originPivots[i].classList.contains("canvaaas-hidden")) {
							originPivots[i].classList.remove("canvaaas-hidden");
						}
					}
				}
				for (var i = 0; i < clonePivots.length; i++) {
					if (!state.pivot) {
						if (!clonePivots[i].classList.contains("canvaaas-hidden")) {
							clonePivots[i].classList.add("canvaaas-hidden");
						}
					} else {
						if (clonePivots[i].classList.contains("canvaaas-hidden")) {
							clonePivots[i].classList.remove("canvaaas-hidden");
						}
					}
				}

				// set grids
				for (var i = 0; i < originGrids.length; i++) {
					if (!state.grid) {
						if (!originGrids[i].classList.contains("canvaaas-hidden")) {
							originGrids[i].classList.add("canvaaas-hidden");
						}
					} else {
						if (originGrids[i].classList.contains("canvaaas-hidden")) {
							originGrids[i].classList.remove("canvaaas-hidden");
						}
					}
				}
				for (var i = 0; i < cloneGrids.length; i++) {
					if (!state.grid) {
						if (!cloneGrids[i].classList.contains("canvaaas-hidden")) {
							cloneGrids[i].classList.add("canvaaas-hidden");
						}
					} else {
						if (cloneGrids[i].classList.contains("canvaaas-hidden")) {
							cloneGrids[i].classList.remove("canvaaas-hidden");
						}
					}
				}

				applyStyleToHandle(state);
				
				applyStyleToBorder(state);

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setConfig(newConfig) {
			try {
				var tmp;
				if (!isObject(newConfig)) {
					return false;
				}
				if (isArray(newConfig.allowedMimeTypes)) {
					var arr = [];
					for (var i = 0; i < newConfig.allowedMimeTypes.length; i++) {
						if (isMimetype(newConfig.allowedMimeTypes[i])) {
							arr.push(newConfig.allowedMimeTypes[i]);
						}
					}
					config.allowedMimeTypes = arr;
				} else if (newConfig.allowedMimeTypes === null) {
					config.allowedMimeTypes = undefined;	
				}
				if (isNumeric(newConfig.cacheLevels)) {
					tmp = toNumber(newConfig.cacheLevels);
					if (tmp > 0) {
						config.cacheLevels = tmp;

						// check cache level
						if (undoCaches.length > config.cacheLevels) {
							undoCaches.splice(-config.cacheLevels);
							redoCaches = [];
						}
					}
				}
				if (isNumeric(newConfig.startIndexAfterRender)) {
					tmp = toNumber(newConfig.startIndexAfterRender);
					config.startIndexAfterRender = tmp;
				}
				if (isNumeric(newConfig.maxIndexAfterRender)) {
					tmp = toNumber(newConfig.maxIndexAfterRender);
					if (tmp > config.startIndexAfterRender) {
						config.maxIndexAfterRender = tmp;
					}
				}
				if (isNumeric(newConfig.imageScaleAfterRender)) {
					tmp = toNumber(newConfig.imageScaleAfterRender);
					if (tmp > 1) {
						config.imageScaleAfterRender = 1;
					} else if (tmp <  0) {
						config.imageScaleAfterRender = 0;
					} else {
						config.imageScaleAfterRender = tmp;
					}
				}
				if (isBoolean(newConfig.lockAspectRatioAfterRender)) {
					config.lockAspectRatioAfterRender = toBoolean(newConfig.lockAspectRatioAfterRender);
				}
				if (isBoolean(newConfig.showGridAfterRender)) {
					config.showGridAfterRender = toBoolean(newConfig.showGridAfterRender);
				}
				if (isBoolean(newConfig.showPivotAfterRender)) {
					config.showPivotAfterRender = toBoolean(newConfig.showPivotAfterRender);
				}
				if (isObject(newConfig.showBorderAfterRender)) {
					var obj = {};
					for (var i = 0; i < borderDirectionSet.length; i++) {
						var k = borderDirectionSet[i];
						var v = newConfig.showBorderAfterRender[k];
						var isStr = isString(v);
						var isAllowed = hasArgument(allowedBorderEvents, v);

						if (isStr && isAllowed) {
							obj[k] = toString(v);
						} else {
							obj[k] = undefined;
						}
					}
					config.showBorderAfterRender = obj;
				} else if (newConfig.showBorderAfterRender === null) {
					config.showBorderAfterRender = {};
				}
				if (isObject(newConfig.showHandleAfterRender)) {
					var obj = {};
					for (var i = 0; i < handleDirectionSet.length; i++) {
						var k = handleDirectionSet[i];
						var v = newConfig.showHandleAfterRender[k];
						var isStr = isString(v);
						var isAllowed = hasArgument(allowedHandleEvents, v);

						if (isStr && isAllowed) {
							obj[k] = toString(v);
						} else {
							obj[k] = undefined;
						}
					}
					config.showHandleAfterRender = obj;
				} else if (newConfig.showHandleAfterRender === null) {
					config.showHandleAfterRender = {};
				}
				if (isFunction(newConfig.click)) {
					config.click = newConfig.click;
				} else if (newConfig.click === null) {
					config.click = undefined;
				}
				if (isFunction(newConfig.rightClick)) {
					config.rightClick = newConfig.rightClick;
				} else if (newConfig.rightClick === null) {
					config.rightClick = undefined;
				}
				if (isFunction(newConfig.upload)) {
					config.upload = newConfig.upload;
				} else if (newConfig.upload === null) {
					config.upload = undefined;
				}
				if (isFunction(newConfig.edit)) {
					config.edit = newConfig.edit;
				} else if (newConfig.edit === null) {
					config.edit = undefined;
				}
				if (isFunction(newConfig.remove)) {
					config.remove = newConfig.remove;
				} else if (newConfig.remove === null) {
					config.remove = undefined;
				}

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setCanvas(newState) {
			try {
				if (!isObject(newState)) {
					return false;
				}
				if (isNumeric(newState.x)) {
					canvasState.x = toNumber(newState.x);
				}
				if (isNumeric(newState.y)) {
					canvasState.y = toNumber(newState.y);
				}
				if (isNumeric(newState.width)) {
					canvasState.width = toNumber(newState.width);
				}
				if (isNumeric(newState.height)) {
					canvasState.height = toNumber(newState.height);
				}
				if (isNumeric(newState.originalWidth)) {
					canvasState.originalWidth = toNumber(newState.originalWidth);
				}
				if (isNumeric(newState.originalHeight)) {
					canvasState.originalHeight = toNumber(newState.originalHeight);
				}
				if (isString(newState.background)) {
					var tmp = toString(newState.background);
					var candidates = ["alpha","unset","transparent","none"];
					if (hasArgument(candidates, tmp)) {
						canvasState.background = "transparent";
					} else if (isColor(tmp)) {
						canvasState.background = tmp;
					}
				}
				if (isBoolean(newState.overflow)) {
					canvasState.overflow = toBoolean(newState.overflow);
				}
				if (isBoolean(newState.checker)) {
					canvasState.checker = toBoolean(newState.checker);
				}
				if (isBoolean(newState.uploadable)) {
					canvasState.uploadable = toBoolean(newState.uploadable);
				}
				if (isBoolean(newState.clickable)) {
					canvasState.clickable = toBoolean(newState.clickable);
				}
				if (isBoolean(newState.editable)) {
					canvasState.editable = toBoolean(newState.editable);
				}
				if (isBoolean(newState.movable)) {
					canvasState.movable = toBoolean(newState.movable);
				}
				if (isBoolean(newState.resizable)) {
					canvasState.resizable = toBoolean(newState.resizable);
				}
				if (isBoolean(newState.rotatable)) {
					canvasState.rotatable = toBoolean(newState.rotatable);
				}
				if (isBoolean(newState.flippable)) {
					canvasState.flippable = toBoolean(newState.flippable);
				}
				if (isBoolean(newState.croppable)) {
					canvasState.croppable = toBoolean(newState.croppable);
				}
				if (typeof(canvasState.width) === "undefined") {
					canvasState.width = canvasState.originalWidth;
				}
				if (typeof(canvasState.height) === "undefined") {
					canvasState.height = canvasState.originalHeight;
				}
				if (typeof(canvasState.x) === "undefined") {
					canvasState.x = 0.5 * canvasState.originalWidth;
				}
				if (typeof(canvasState.y) === "undefined") {
					canvasState.y = 0.5 * canvasState.originalHeight;
				}

				applyStyleToCanvas();

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function applyStyleToCanvas() {
			try {
				var oldCanvasWidth = canvasState.canvasWidth;
				var oldCanvasHeight = canvasState.canvasHeight;

				var containerPadding = getPadding(containerElement);
				var containerPaddingX = containerPadding[1] + containerPadding[3];
				var containerPaddingY = containerPadding[0] + containerPadding[2];
				var containerWidth = containerElement.offsetWidth - containerPaddingX;
				var containerHeight = containerElement.offsetHeight - containerPaddingY;

				var screenSizes = getContainedSizes(
					canvasState.width, canvasState.height,
					containerWidth, containerHeight
				);
				var screenWidth = screenSizes[0];
				var screenHeight = screenSizes[1];
				var screenLeft = containerPadding[3] + (0.5 * containerWidth) - (0.5 * screenWidth);
				var screenTop = containerPadding[0] + (0.5 * containerHeight) - (0.5 * screenHeight);
				var screenAspectRatio = screenWidth / screenHeight;

				screenElement.style.width =  Math.floor(screenWidth) + "px";
				screenElement.style.height =  Math.floor(screenHeight) + "px";
				screenElement.style.left =  Math.floor(screenLeft) + "px";
				screenElement.style.top =  Math.floor(screenTop) + "px";

				// fix scrollbar width
				if (hasScrollbar()) {
					screenWidth -= SCROLLBAR_WIDTH;
					screenHeight = screenWidth / screenAspectRatio;
					screenLeft = containerPadding[3] + (0.5 * containerWidth) - (0.5 * screenWidth);
					screenTop = containerPadding[0] + (0.5 * containerHeight) - (0.5 * screenHeight);
	
					screenElement.style.width =  Math.floor(screenWidth) + "px";
					screenElement.style.height =  Math.floor(screenHeight) + "px";
					screenElement.style.left =  Math.floor(screenLeft) + "px";
					screenElement.style.top =  Math.floor(screenTop) + "px";
				}

				// calculate scale after fix scrollbar 
				var screenScaleRatioX = screenWidth / canvasState.width;
				var screenScaleRatioY = screenHeight / canvasState.height;

				var backgroundElement = canvasElement.querySelector("div.canvaaas-background");
				var checkerElement = canvasElement.querySelector("div.canvaaas-checker");
				var canvasWidth = canvasState.originalWidth * screenScaleRatioX;
				var canvasHeight = canvasState.originalHeight * screenScaleRatioY;
				var canvasLeft = (0.5 * screenWidth) - (canvasState.x * screenScaleRatioX);
				var canvasTop = (0.5 * screenHeight) - (canvasState.y * screenScaleRatioY);

				canvasState.scaleX = screenScaleRatioX;
				canvasState.scaleY = screenScaleRatioY;
				
				canvasState.screenWidth = screenWidth;
				canvasState.screenHeight = screenHeight;
				canvasState.screenLeft = screenLeft;
				canvasState.screenTop = screenTop;

				canvasState.canvasWidth = canvasWidth;
				canvasState.canvasHeight = canvasHeight;
				canvasState.canvasLeft = canvasLeft;
				canvasState.canvasTop = canvasTop;

				canvasElement.style.width = Math.floor(canvasWidth) + "px";
				canvasElement.style.height = Math.floor(canvasHeight) + "px";
				canvasElement.style.left = Math.floor(canvasLeft) + "px";
				canvasElement.style.top = Math.floor(canvasTop) + "px";
	
				mirrorElement.style.width = Math.floor(canvasWidth) + "px";
				mirrorElement.style.height = Math.floor(canvasHeight) + "px";
				mirrorElement.style.left = Math.floor(canvasLeft) + "px";
				mirrorElement.style.top = Math.floor(canvasTop) + "px";

				backgroundElement.style.background = canvasState.background || "transparent";
	
				// set class names
				if (!canvasState.checker) {
					if (!checkerElement.classList.contains("canvaaas-hidden")) {
						checkerElement.classList.add("canvaaas-hidden");
					}
				} else {
					if (checkerElement.classList.contains("canvaaas-hidden")) {
						checkerElement.classList.remove("canvaaas-hidden");
					}
				}

				if (!canvasState.overflow) {
					if (!mirrorElement.classList.contains("canvaaas-hidden")) {
						mirrorElement.classList.add("canvaaas-hidden");
					}
				} else {
					if (mirrorElement.classList.contains("canvaaas-hidden")) {
						mirrorElement.classList.remove("canvaaas-hidden");
					}
				}

				if (!canvasState.clickable) {
					if (!screenElement.classList.contains("canvaaas-unclickable")) {
						screenElement.classList.add("canvaaas-unclickable");
					}
				} else {
					if (screenElement.classList.contains("canvaaas-unclickable")) {
						screenElement.classList.remove("canvaaas-unclickable");
					}
				}

				canvasState.isInitialized = true;

				var newCanvasWidth = canvasState.canvasWidth;
				var newCanvasHeight = canvasState.canvasHeight;
				var scaleRatioX = newCanvasWidth / oldCanvasWidth;
				var scaleRatioY = newCanvasHeight / oldCanvasHeight;

				for(var i = 0; i < imageStates.length; i++) {
					var state = imageStates[i];
					setImage(state.id, {
						x: state.x * scaleRatioX,
						y: state.y * scaleRatioY,
						width: state.width * scaleRatioX,
						height: state.height * scaleRatioY,
						cropTop: state.cropTop * scaleRatioY,
						cropBottom: state.cropBottom * scaleRatioY,
						cropLeft: state.cropLeft * scaleRatioX,
						cropRight: state.cropRight * scaleRatioX
					});
				}

				return true;
			} catch(err) {
				console.log(err);
				canvasState.isInitialized = false;
				return false;
			}
		}

		function clearCanvas() {
			try {
				// clear images
				for (var i = imageStates.length - 1; i >= 0; i--) {
					removeImage(imageStates[i].id);
				}

				// clear canvas state
				canvasState = {};
				copyObject(canvasState, defaultCanvasState);

				var backgroundElement = canvasElement.querySelector("div.canvaaas-background");
				var checkerElement = canvasElement.querySelector("div.canvaaas-checker");

				screenElement.style.width = "";
				screenElement.style.height = "";
				screenElement.style.left = "";
				screenElement.style.top = "";

				canvasElement.style.width = "";
				canvasElement.style.height = "";
				canvasElement.style.left = "";
				canvasElement.style.top = "";

				mirrorElement.style.width = "";
				mirrorElement.style.height = "";
				mirrorElement.style.left = "";
				mirrorElement.style.top = "";

				backgroundElement.style.background = canvasState.background;

				if (!canvasState.checker) {
					if (!checkerElement.classList.contains("canvaaas-hidden")) {
						checkerElement.classList.add("canvaaas-hidden");
					}
				} else {
					if (checkerElement.classList.contains("canvaaas-hidden")) {
						checkerElement.classList.remove("canvaaas-hidden");
					}
				}

				if (!canvasState.overflow) {
					if (!mirrorElement.classList.contains("canvaaas-hidden")) {
						mirrorElement.classList.add("canvaaas-hidden");
					}
				} else {
					if (mirrorElement.classList.contains("canvaaas-hidden")) {
						mirrorElement.classList.remove("canvaaas-hidden");
					}
				}

				if (!canvasState.clickable) {
					if (!screenElement.classList.contains("canvaaas-unclickable")) {
						screenElement.classList.add("canvaaas-unclickable");
					}
				} else {
					if (screenElement.classList.contains("canvaaas-unclickable")) {
						screenElement.classList.remove("canvaaas-unclickable");
					}
				}

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}			
		}

		function applyStyleToHandle(state) {
			try {
				var id = state.id;
				var scaleX = state.scaleX;
				var scaleY = state.scaleY;
				var origin = document.getElementById(originId + id);
				var clone = document.getElementById(cloneId + id);
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}

				for (var i = 0; i < handleDirectionSet.length; i++) {
					var d = handleDirectionSet[i];
					var f = flipDirection(d, scaleX, scaleY);
					var originHandle = document.getElementById(originHandleId+id+"-"+d);
					var cloneHandle = document.getElementById(cloneHandleId+id+"-"+d);
					if (originHandle && cloneHandle) {
						if (state["handle"][f]) {
							if (originHandle.classList.contains("canvaaas-hidden")) {
								originHandle.classList.remove("canvaaas-hidden");
							}
							if (cloneHandle.classList.contains("canvaaas-hidden")) {
								cloneHandle.classList.remove("canvaaas-hidden");
							}
						} else {
							if (!originHandle.classList.contains("canvaaas-hidden")) {
								originHandle.classList.add("canvaaas-hidden");
							}
							if (!cloneHandle.classList.contains("canvaaas-hidden")) {
								cloneHandle.classList.add("canvaaas-hidden");
							}
						}

						if (state["handle"][f] === "none") {
							if (!originHandle.classList.contains("canvaaas-unclickable")) {
								originHandle.classList.add("canvaaas-unclickable");
							}
							if (!cloneHandle.classList.contains("canvaaas-unclickable")) {
								cloneHandle.classList.add("canvaaas-unclickable");
							}
						} else {
							if (originHandle.classList.contains("canvaaas-unclickable")) {
								originHandle.classList.remove("canvaaas-unclickable");
							}
							if (cloneHandle.classList.contains("canvaaas-unclickable")) {
								cloneHandle.classList.remove("canvaaas-unclickable");
							}
						}
					}
				}

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function applyStyleToBorder(state) {
			try {
				var id = state.id;
				var scaleX = state.scaleX;
				var scaleY = state.scaleY;
				var origin = document.getElementById(originId + id);
				var clone = document.getElementById(cloneId + id);
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}
				for (var i = 0; i < borderDirectionSet.length; i++) {
					var d = borderDirectionSet[i];
					var f = flipDirection(d, scaleX, scaleY);
					var originBorder = document.getElementById(originBorderId+id+"-"+d);
					var cloneBorder = document.getElementById(cloneBorderId+id+"-"+d);
					if (originBorder && cloneBorder) {
						if (state["border"][f]) {
							if (originBorder.classList.contains("canvaaas-hidden")) {
								originBorder.classList.remove("canvaaas-hidden");
							}
							if (cloneBorder.classList.contains("canvaaas-hidden")) {
								cloneBorder.classList.remove("canvaaas-hidden");
							}
						} else {
							if (!originBorder.classList.contains("canvaaas-hidden")) {
								originBorder.classList.add("canvaaas-hidden");
							}
							if (!cloneBorder.classList.contains("canvaaas-hidden")) {
								cloneBorder.classList.add("canvaaas-hidden");
							}
						}

						if (state["border"][f] === "none") {
							if (!originBorder.classList.contains("canvaaas-unclickable")) {
								originBorder.classList.add("canvaaas-unclickable");
							}
							if (!cloneBorder.classList.contains("canvaaas-unclickable")) {
								cloneBorder.classList.add("canvaaas-unclickable");
							}
						} else {
							if (originBorder.classList.contains("canvaaas-unclickable")) {
								originBorder.classList.remove("canvaaas-unclickable");
							}
							if (cloneBorder.classList.contains("canvaaas-unclickable")) {
								cloneBorder.classList.remove("canvaaas-unclickable");
							}
						}
					}
				}

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function addClassToImage(id, cls) {
			try {
				var candidate = toString(id);
				var origin = document.getElementById(originId + candidate);
				var clone = document.getElementById(cloneId + candidate);
				if (!origin.classList.contains(cls)) {
					origin.classList.add(cls);
				}
				if (!clone.classList.contains(cls)) {
					clone.classList.add(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function removeClassToImage(id, cls) {
			try {
				var candidate = toString(id);
				var origin = document.getElementById(originId + candidate);
				var clone = document.getElementById(cloneId + candidate);
				if (origin.classList.contains(cls)) {
					origin.classList.remove(cls);
				}
				if (clone.classList.contains(cls)) {
					clone.classList.remove(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function addClassToHandle(id, direction, cls) {
			try {
				var originHandle = document.getElementById(originHandleId + id + "-" + direction);
				var cloneHandle = document.getElementById(cloneHandleId + id + "-" + direction);
				if (!originHandle.classList.contains(cls)) {
					originHandle.classList.add(cls);
				}
				if (!cloneHandle.classList.contains(cls)) {
					cloneHandle.classList.add(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function removeClassToHandle(id, direction, cls) {
			try {
				var originHandle = document.getElementById(originHandleId + id + "-" + direction);
				var cloneHandle = document.getElementById(cloneHandleId + id + "-" + direction);
				if (originHandle.classList.contains(cls)) {
					originHandle.classList.remove(cls);
				}
				if (cloneHandle.classList.contains(cls)) {
					cloneHandle.classList.remove(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function addClassToBorder(id, direction, cls) {
			try {
				var originBorder = document.getElementById(originBorderId + id + "-" + direction);
				var cloneBorder = document.getElementById(cloneBorderId + id + "-" + direction);
				if (!originBorder.classList.contains(cls)) {
					originBorder.classList.add(cls);
				}
				if (!cloneBorder.classList.contains(cls)) {
					cloneBorder.classList.add(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function removeClassToBorder(id, direction, cls) {
			try {
				var originBorder = document.getElementById(originBorderId + id + "-" + direction);
				var cloneBorder = document.getElementById(cloneBorderId + id + "-" + direction);
				if (originBorder.classList.contains(cls)) {
					originBorder.classList.remove(cls);
				}
				if (cloneBorder.classList.contains(cls)) {
					cloneBorder.classList.remove(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function addClassToScreen(cls) {
			try {
				if (!screenElement.classList.contains(cls)) {
					screenElement.classList.add(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function removeClassToScreen(cls) {
			try {
				if (screenElement.classList.contains(cls)) {
					screenElement.classList.remove(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function addClassToCanvas(cls) {
			try {
				if (!canvasElement.classList.contains(cls)) {
					canvasElement.classList.add(cls);
				}
				if (!mirrorElement.classList.contains(cls)) {
					mirrorElement.classList.add(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function removeClassToCanvas(cls) {
			try {
				if (canvasElement.classList.contains(cls)) {
					canvasElement.classList.remove(cls);
				}
				if (mirrorElement.classList.contains(cls)) {
					mirrorElement.classList.remove(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function addClassToContainer(cls) {
			try {
				if (!containerElement.classList.contains(cls)) {
					containerElement.classList.add(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function removeClassToContainer(cls) {
			try {
				if (containerElement.classList.contains(cls)) {
					containerElement.classList.remove(cls);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function copyConfig() {
			try {
				var tmp = {};
				for (var i = 0; i < Object.keys(config).length; i++) {
					var k = Object.keys(config)[i];
					if (isFunction(config[k])) {
						tmp[k] = true;
					} else {
						tmp[k] = config[k];
					}
				}
				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function copyCanvasState() {
			try {
				var tmp = {};
				var ar = getAspectRatio(canvasState.originalWidth, canvasState.originalHeight);
	
				tmp.x = canvasState.x;
				tmp.y = canvasState.y;
				tmp.width = canvasState.width;
				tmp.height = canvasState.height;
				tmp.originalWidth = canvasState.originalWidth;
				tmp.originalHeight = canvasState.originalHeight;
				tmp.background = canvasState.background;
				tmp.overflow = canvasState.overflow;
				tmp.checker = canvasState.checker;
				tmp.uploadable = canvasState.uploadable;
				tmp.clickable = canvasState.clickable;
				tmp.editable = canvasState.editable;
				tmp.movable = canvasState.movable;
				tmp.resizable = canvasState.resizable;
				tmp.rotatable = canvasState.rotatable;
				tmp.flippable = canvasState.flippable;
				tmp.croppable = canvasState.croppable;
				tmp.aspectRatio = "" + ar[0] + ":" + ar[1];
	
				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function copyImageState(id) {
			try {
				var tmp = {};
				var state = getImageState(id);
				var origin = document.getElementById(originId + id);
				var clone = document.getElementById(cloneId + id);
				var originImg = document.getElementById(originImgId + id);
				var cloneImg = document.getElementById(cloneImgId + id);
				var scaleRatioX = canvasState.scaleX;
				var scaleRatioY = canvasState.scaleY;

				if (!state) {
					return false;
				}
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}
				if (!originImg) {
					return false;
				}
				if (!cloneImg) {
					return false;
				}

				tmp.id = state.id;
				tmp.src = state.src;
				tmp.index = state.index;
				tmp.x = state.x / scaleRatioX;
				tmp.y = state.y / scaleRatioY;
				tmp.originalWidth = state.originalWidth;
				tmp.originalHeight = state.originalHeight;
				tmp.width = state.width / scaleRatioX;
				tmp.height = state.height / scaleRatioY;
				tmp.cropTop = state.cropTop / scaleRatioY;
				tmp.cropBottom = state.cropBottom / scaleRatioY;
				tmp.cropLeft = state.cropLeft / scaleRatioX;
				tmp.cropRight = state.cropRight / scaleRatioX;
				tmp.rotate = state.rotate;
				tmp.rotateX = state.rotateX;
				tmp.rotateY = state.rotateY;
				tmp.scaleX = state.scaleX;
				tmp.scaleY = state.scaleY;
				tmp.opacity = state.opacity;
				tmp.lockAspectRatio = state.lockAspectRatio;
				tmp.visible = state.visible;
				tmp.clickable = state.clickable;
				tmp.editable = state.editable;
				tmp.movable = state.movable;
				tmp.resizable = state.resizable;
				tmp.rotatable = state.rotatable;
				tmp.flippable = state.flippable;
				tmp.croppable = state.croppable;
				tmp.drawable = state.drawable;
				tmp.pivot = state.pivot;
				tmp.grid = state.grid;

				var tmpBorder = {};
					for (var i = 0; i < Object.keys(state.border).length; i++) {
					var k = Object.keys(state.border)[i];
					tmpBorder[k] = state.border[k];
				}
				var tmpHandle = {};
				for (var i = 0; i < Object.keys(state.handle).length; i++) {
					var k = Object.keys(state.handle)[i];
					tmpHandle[k] = state.handle[k];
				}

				tmp.border = tmpBorder;
				tmp.handle = tmpHandle;

				var croppedWidth = (state.width - (state.cropLeft + state.cropRight)) / scaleRatioX;
				var croppedHeight = (state.height - (state.cropTop + state.cropBottom)) / scaleRatioY;
				var originalAspectRatio = getAspectRatio(tmp.originalWidth, tmp.originalHeight);
				var aspectRatio = getAspectRatio(croppedWidth, croppedHeight);

				tmp.originalAspectRatio = "" + originalAspectRatio[0] + ":" + originalAspectRatio[1];
				tmp.aspectRatio = "" + aspectRatio[0] + ":" + aspectRatio[1];

				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function importImageState(state) {
			try {
				var tmp = {};
				var scaleRatioX = canvasState.scaleX;
				var scaleRatioY = canvasState.scaleY;

				if (!isObject(state)) {
					return false;
				}
				if (isString(state._id)) {
					tmp.id = toString(state._id);
				}
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
				if (isNumeric(state.index)) {
					tmp.index = toNumber(state.index);
				}
				if (isNumeric(state.x)) {
					tmp.x = toNumber(state.x) * scaleRatioX;
				}
				if (isNumeric(state.y)) {
					tmp.y = toNumber(state.y) * scaleRatioY;
				}
				if (isNumeric(state.width)) {
					tmp.width = toNumber(state.width) * scaleRatioX;
				}
				if (isNumeric(state.height)) {
					tmp.height = toNumber(state.height) * scaleRatioY;
				}
				if (isNumeric(state.cropTop)) {
					tmp.cropTop = toNumber(state.cropTop) * scaleRatioY;
				}
				if (isNumeric(state.cropBottom)) {
					tmp.cropBottom = toNumber(state.cropBottom) * scaleRatioY;
				}
				if (isNumeric(state.cropLeft)) {
					tmp.cropLeft = toNumber(state.cropLeft) * scaleRatioX;
				}
				if (isNumeric(state.cropRight)) {
					tmp.cropRight = toNumber(state.cropRight) * scaleRatioX;
				}
				if (isNumeric(state.rotate)) {
					tmp.rotate = toNumber(state.rotate);
				}
				if (isNumeric(state.rotateX)) {
					tmp.rotateX = toNumber(state.rotateX);
				}
				if (isNumeric(state.rotateY)) {
					tmp.rotateY = toNumber(state.rotateY);
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
				if (isBoolean(state.clickable)) {
					tmp.clickable = toBoolean(state.clickable);
				}
				if (isBoolean(state.editable)) {
					tmp.editable = toBoolean(state.editable);
				}
				if (isBoolean(state.movable)) {
					tmp.movable = toBoolean(state.movable);
				}
				if (isBoolean(state.resizable)) {
					tmp.resizable = toBoolean(state.resizable);
				}
				if (isBoolean(state.rotatable)) {
					tmp.rotatable = toBoolean(state.rotatable);
				}
				if (isBoolean(state.flippable)) {
					tmp.flippable = toBoolean(state.flippable);
				}
				if (isBoolean(state.croppable)) {
					tmp.croppable = toBoolean(state.croppable);
				}
				if (isBoolean(state.drawable)) {
					tmp.drawable = toBoolean(state.drawable);
				}
				if (isBoolean(state.pivot)) {
					tmp.pivot = toBoolean(state.pivot);
				}
				if (isBoolean(state.grid)) {
					tmp.grid = toBoolean(state.grid);
				}
				if (isObject(state.border)) {
					tmp.border = state.border;
				}
				if (isObject(state.handle)) {
					tmp.handle = state.handle;
				}
				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getDatasetFromElement(elem) {
			try {
				var tmp = {};
				var datasetKeys = [
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
					"rotate-x",
					"rotate-y",
					"scale-x",
					"scale-y",
					"opacity",
					"crop-top",
					"crop-bottom",
					"crop-right",
					"crop-left",
					"lock-aspect-ratio",
					"visible",
					"clickable",
					"editable",
					"movable",
					"resizable",
					"rotatable",
					"flippable",
					"croppable",
					"drawable",
					"pivot",
					"grid",
				];

				for (var i = 0; i < datasetKeys.length; i++) {
					var v = elem.getAttribute("data-" + datasetKeys[i]);
					var k = datasetKeys[i];
					if (v !== undefined && v !== null && v !== "") {
						for (var j = 0; j < 2; j++) {
							if (k.indexOf("-") > 0) {
								var idx = k.indexOf("-");
								var newKey = k.slice(0, idx) + k.slice(idx + 1, idx + 2).toUpperCase() + k.slice(idx + 2);
								k = newKey;
							}
						}
						tmp[k] = v;
					}
				}

				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function saveUndo(id, keepRedo) {
			try {
				var state = getImageState(id);
				// var origin = document.getElementById(originId + id);
				// var clone = document.getElementById(cloneId + id);
				var copiedState = {};
				var newCache = {};
				// var originCls = origin.className;
				// var cloneCls = clone.className;

				copyObject(copiedState, state);
	
				newCache.id = copiedState.id;
				newCache.state = copiedState;
				// newCache.originClassNames = originCls;
				// newCache.cloneClassNames = cloneCls;
				newCache.updatedAt = Date.now();
	
				undoCaches.push(newCache);
	
				if (undoCaches.length > config.cacheLevels) {
					undoCaches.shift();
				}
				if (!keepRedo) {
					redoCaches = [];
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function saveRedo(id) {
			try {
				var state = getImageState(id);
				// var origin = document.getElementById(originId + id);
				// var clone = document.getElementById(cloneId + id);
				var copiedState = {};
				var newCache = {};
				// var originCls = origin.className;
				// var cloneCls = clone.className;

				copyObject(copiedState, state);
	
				newCache.id = copiedState.id;
				newCache.state = copiedState;
				// newCache.originClassNames = originCls;
				// newCache.cloneClassNames = cloneCls;
				newCache.updatedAt = Date.now();
	
				redoCaches.push(newCache);
	
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function callUndo() {
			try {
				if (undoCaches.length < 1) {
					return false;
				}

				var recent = undoCaches.pop();
				var id = recent.id;
				// var origin = document.getElementById(originId + id);
				// var clone = document.getElementById(cloneId + id);

				saveRedo(id);

				setImage(id, recent.state);

				// origin.className = recent.originClassNames;
				// clone.className = recent.cloneClassNames;

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function callRedo() {
			try {
				if (redoCaches.length < 1) {
					return false;
				}
	
				var recent = redoCaches.pop();
				var id = recent.id;
				// var origin = document.getElementById(originId + id);
				// var clone = document.getElementById(cloneId + id);

				// keep redo
				saveUndo(id, true);
	
				setImage(id, recent.state);

				// origin.className = recent.originClassNames;
				// clone.className = recent.cloneClassNames;

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		// asynchronous
		function drawCanvas(option, canvState, imgStates, cb) {
			try {
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");
				var canvasSizes;
				var maxSizes;
				var filename = "untitled";
				var mimetype = "image/png";
				var quality = 0.92;
				var background = canvState.background || "transparent";
				var canvasWidth = canvState.originalWidth;
				var canvasHeight = canvState.originalHeight;
				var maxWidth = MAX_WIDTH;
				var maxHeight = MAX_HEIGHT;
				var minWidth = MIN_WIDTH;
				var minHeight = MIN_HEIGHT;
				var filter;
				var scaleRatioX;
				var scaleRatioY;
				var convertedImgStates = [];
				var result = {};
				var index;
				var count;
				var tmp;

				if (isObject(option)) {
					if (isString(option.filename)) {
						tmp = toString(option.filename);
						if (!isEmpty(tmp)) {
							filename = tmp;
						}
					}
					if (isString(option.mimetype)) {
						tmp = toString(option.mimetype);
						if (isMimetype(tmp)) {
							mimetype = tmp;
						}
					}
					if (isNumeric(option.quality)) {
						tmp = toNumber(option.quality);
						if (tmp > 1) {
							quality = 1;
						} else if (tmp < 0) {
							quality = 0;
						} else {
							quality = tmp;
						}
					}
					if (isString(option.background)) {
						tmp = toString(option.background);
						var candidates = ["alpha","unset","transparent","none"];
						if (hasArgument(candidates, tmp)) {
							background = "transparent";
						} else if (isColor(tmp)) {
							background = tmp;
						}
					}
					if (isNumeric(option.width)) {
						tmp = toNumber(option.width);
						if (tmp < maxWidth) {
							maxWidth = tmp
						}
					}
					if (isNumeric(option.height)) {
						tmp = toNumber(option.height);
						if (tmp < maxHeight) {
							maxHeight = tmp
						}
					}
					if (isFunction(option.filter)) {
						filter = option.filter;
					}
				}

				maxSizes = getFittedSizes({
					width: canvasWidth,
					height: canvasHeight,
					maxWidth: maxWidth,
					maxHeight: maxHeight,
					minWidth: minWidth,
					minHeight: minHeight,
				})

				canvasSizes = getContainedSizes(
					canvState.originalWidth,
					canvState.originalHeight,
					maxSizes[0],
					maxSizes[1]
				);
				
				// fix canvas resized
				scaleRatioX = canvasSizes[0] / canvState.originalWidth;
				scaleRatioY = canvasSizes[1] / canvState.originalHeight;

				for (var i = 0; i < imgStates.length; i++) {
					try {
						var obj = {};
						var isAllowed = true;

						if (isString(imgStates[i].src)) {
							obj.src = toString(imgStates[i].src);
						} else if (isString(imgStates[i].path)) {
							obj.src = toString(imgStates[i].path);
						} else if (isString(imgStates[i].url)) {
							obj.src = toString(imgStates[i].url);
						} else {
							isAllowed = false;
						}
						if (isNumeric(imgStates[i].x)) {
							obj.x = toNumber(imgStates[i].x) * scaleRatioX;
						} else {
							isAllowed = false;
						}
						if (isNumeric(imgStates[i].y)) {
							obj.y = toNumber(imgStates[i].y) * scaleRatioY;
						} else {
							isAllowed = false;
						}
						if (isNumeric(imgStates[i].width)) {
							obj.width = toNumber(imgStates[i].width) * scaleRatioX;
						} else {
							isAllowed = false;
						}
						if (isNumeric(imgStates[i].height)) {
							obj.height = toNumber(imgStates[i].height) * scaleRatioY;
						} else {
							isAllowed = false;
						}
						if (isNumeric(imgStates[i].rotate)) {
							obj.rotate = toNumber(imgStates[i].rotate);
						} else {
							obj.rotate = 0;
						}
						if (isNumeric(imgStates[i].scaleX)) {
							tmp = toNumber(imgStates[i].scaleX);
							if (tmp === 1) {
								obj.scaleX = 1;
							} else if (tmp === -1) {
								obj.scaleX = -1;
							} else {
								obj.scaleX = 1;
							}
						} else {
							obj.scaleX = 1;
						}
						if (isNumeric(imgStates[i].scaleY)) {
							tmp = toNumber(imgStates[i].scaleY);
							if (tmp === 1) {
								obj.scaleY = 1;
							} else if (tmp === -1) {
								obj.scaleY = -1;
							} else {
								obj.scaleY = 1;
							}
						} else {
							obj.scaleY = 1;
						}
						if (isNumeric(imgStates[i].opacity)) {
							tmp = toNumber(imgStates[i].opacity);
							if (tmp > 1) {
								obj.opacity = 1;
							} else if (tmp < 0) {
								obj.opacity = 0;
							} else {
								obj.opacity = tmp;
							}
						} else {
							obj.opacity = 1;
						}
						if (isNumeric(imgStates[i].cropTop)) {
							obj.cropTop = toNumber(imgStates[i].cropTop) * scaleRatioY;
						} else {
							obj.cropTop = 0;
						}
						if (isNumeric(imgStates[i].cropBottom)) {
							obj.cropBottom = toNumber(imgStates[i].cropBottom) * scaleRatioY;
						} else {
							obj.cropBottom = 0;
						}
						if (isNumeric(imgStates[i].cropLeft)) {
							obj.cropLeft = toNumber(imgStates[i].cropLeft) * scaleRatioX;
						} else {
							obj.cropLeft = 0;
						}
						if (isNumeric(imgStates[i].cropRight)) {
							obj.cropRight = toNumber(imgStates[i].cropRight) * scaleRatioX;
						} else {
							obj.cropRight = 0;
						}

						if (isAllowed) {
							convertedImgStates.push(obj);
						}
					} catch(err) {
						console.log(err);
					}
				}

				result.filename = filename;
				result.mimetype = mimetype;
				result.quality = quality;
				result.background = background;
				result.width = canvasSizes[0];
				result.height = canvasSizes[1];
				result.numberOfImages = convertedImgStates.length;

				canvas.width = result.width;
				canvas.height = result.height;

				ctx.fillStyle = result.background;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.save();

				index = convertedImgStates.length;
				count = 0;

				recursiveFunc();

				function recursiveFunc() {
					if (count < index) {
						drawImage(canvas, convertedImgStates[count], function(err) {
							if (err) {
								console.log(err);
							}
							count++;
							recursiveFunc();
						});
					} else {

						// apply filter
						if (filter) {
							var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
							var filteredImageData = getFilteredImageData(imageData, filter);

							ctx.clearRect(0, 0, canvas.width, canvas.height);
							ctx.putImageData(filteredImageData, 0, 0);
						}

						var base64 = canvas.toDataURL(result.mimetype, result.quality);
	
						return cb(null, base64, result);
					}
				}
			} catch(err) {
				return cb(err);
			}
		}

		// asynchronous
		function drawImage(canv, option, cb) {
			var newImage = new Image();
			newImage.onerror = function(err) {
				return cb(err);
			}
			newImage.onload = function(e) {
				var ctx = canv.getContext("2d");
				var axisX = option.x;
				var axisY = option.y;
				var width = option.width;
				var height = option.height;
				var rotate = option.rotate;
				var scaleX = option.scaleX;
				var scaleY = option.scaleY;
				var opacity = option.opacity;
				var cropTop = option.cropTop;
				var cropBottom = option.cropBottom;
				var cropLeft = option.cropLeft;
				var cropRight = option.cropRight;
				var scaleRatioX;
				var scaleRatioY;
				var resizedCanvas;
				var rotatedCanvas;
				var croppedCanvas;
				var sx;
				var sy;
				var sw;
				var sh;
				var dx;
				var dy;
				var dw;
				var dh;

				resizedCanvas = getResizedCanvas(newImage, {
					maxWidth: MAX_WIDTH,
					maxHeight: MAX_HEIGHT,
					minWidth: MIN_WIDTH,
					minHeight: MIN_HEIGHT,
					width: width,
					height: height,
				});

				scaleRatioX = resizedCanvas.width / width;
				scaleRatioY = resizedCanvas.height / height;

				cropTop *= scaleRatioY;
				cropBottom *= scaleRatioY;
				cropLeft *= scaleRatioX;
				cropRight *= scaleRatioX;

				croppedCanvas = getCroppedCanvas(resizedCanvas, {
					cropTop: cropTop,
					cropBottom: cropBottom,
					cropLeft: cropLeft,
					cropRight: cropRight,
					scaleX: scaleX,
					scaleY: scaleY,
				});

				rotatedCanvas = getRotatedCanvas(croppedCanvas, {
					maxWidth: MAX_WIDTH,
					maxHeight: MAX_HEIGHT,
					minWidth: MIN_WIDTH,
					minHeight: MIN_HEIGHT,
					rotate: rotate,
					scaleX: scaleX,
					scaleY: scaleY,
					opacity: opacity
				});

				// calculate coordinate
				sx = 0;
				sy = 0;
				sw = Math.floor(rotatedCanvas.width);
				sh = Math.floor(rotatedCanvas.height);
				dx = Math.floor(axisX - (rotatedCanvas.width / scaleRatioX * 0.5));
				dy = Math.floor(axisY - (rotatedCanvas.height / scaleRatioY * 0.5));
				dw = Math.floor(rotatedCanvas.width / scaleRatioX);
				dh = Math.floor(rotatedCanvas.height / scaleRatioY);

				// draw to main canvas
				ctx.drawImage(
					rotatedCanvas,
					sx, sy,
					sw, sh,
					dx, dy,
					dw, dh
				);

				if (cb) {
					cb(null, true);
				}
				return false;
			}
			newImage.src = option.src;
		}

		function getResizedCanvas(img, option) {
			try {
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");
				var width = option.width;
				var height = option.height;
				var maxWidth = option.maxWidth;
				var maxHeight = option.maxHeight;
				var minWidth = option.minWidth;
				var minHeight = option.minHeight;
				var dx;
				var dy;
				var dw;
				var dh;

				var fittedSizes = getFittedSizes({
					width: width,
					height: height,
					maxWidth: maxWidth,
					maxHeight: maxHeight,
					minWidth: minWidth,
					minHeight: minHeight
				});
	
				dx = 0;
				dy = 0;
				dw = Math.floor(fittedSizes[0]);
				dh = Math.floor(fittedSizes[1]);

				canvas.width = Math.floor(fittedSizes[0]);
				canvas.height = Math.floor(fittedSizes[1]);
	
				ctx.save();
				ctx.fillStyle = "transparent";
				ctx.imageSmoothingQuality = "low";
				ctx.imageSmoothingEnabled = false;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(
					img,
					dx, dy,
					dw, dh
				);
	
				return canvas;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getCroppedCanvas(canv, option) {
			try {
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");
				var width = canv.width;
				var height = canv.height;
				var cropTop = option.cropTop;
				var cropBottom = option.cropBottom;
				var cropLeft = option.cropLeft;
				var cropRight = option.cropRight;
				var scaleX = option.scaleX;
				var scaleY = option.scaleY;
				var croppedWidth;
				var croppedHeight;
				var tmp;
				var sx;
				var sy;
				var sw;
				var sh;
				var dx;
				var dy;
				var dw;
				var dh;
	
				if (scaleX === -1) {
					tmp = cropLeft;
					cropLeft = cropRight;
					cropRight = tmp;
				}
				if (scaleY === -1) {
					tmp = cropTop;
					cropTop = cropBottom;
					cropBottom = tmp;
				}
	
				croppedWidth = width - (cropLeft + cropRight);
				croppedHeight = height - (cropTop + cropBottom);

				sx = Math.floor(cropLeft);
				sy = Math.floor(cropTop);
				sw = Math.floor(croppedWidth);
				sh = Math.floor(croppedHeight);
				dx = 0;
				dy = 0;
				dw = Math.floor(croppedWidth);
				dh = Math.floor(croppedHeight);
	
				canvas.width = Math.floor(croppedWidth);
				canvas.height = Math.floor(croppedHeight);

				ctx.save();
				ctx.fillStyle = "transparent";
				ctx.imageSmoothingQuality = "low";
				ctx.imageSmoothingEnabled = false;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(
					canv,
					sx, sy,
					sw, sh,
					dx, dy,
					dw, dh
				);
	
				return canvas;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getRotatedCanvas(canv, option) {
			try {
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");
				var maxWidth = option.maxWidth;
				var maxHeight = option.maxHeight;
				var minWidth = option.minWidth;
				var minHeight = option.minHeight;
				var opacity = option.opacity;
				var rotate = option.rotate;
				var scaleX = option.scaleX;
				var scaleY = option.scaleY;
				var width = canv.width;
				var height = canv.height;
				var sx = 0;
				var sy = 0;
				var sw = Math.floor(width);
				var sh = Math.floor(height);
				var dx = -Math.floor(width * 0.5);
				var dy = -Math.floor(height * 0.5);
				var dw = Math.floor(width);
				var dh = Math.floor(height);

				var rotatedSizes = getRotatedSizes(
					width,
					height,
					rotate
				);
	
				var fittedSizes = getFittedSizes({
					width: rotatedSizes[0],
					height: rotatedSizes[1],
					maxWidth: maxWidth,
					maxHeight: maxHeight,
					minWidth: minWidth,
					minHeight: minHeight
				});
	
				// set canvas sizes
				canvas.width = Math.floor(fittedSizes[0]);
				canvas.height = Math.floor(fittedSizes[1]);
	
				// set canvas options
				ctx.save();
				ctx.globalAlpha = opacity;
				ctx.fillStyle = "transparent";
				ctx.imageSmoothingQuality = "low";
				ctx.imageSmoothingEnabled = false;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.translate(Math.floor(canvas.width * 0.5), Math.floor(canvas.height * 0.5));
				ctx.rotate(rotate * (Math.PI / 180));
				ctx.scale(scaleX, scaleY);
				ctx.drawImage(
					canv,
					sx, sy,
					sw, sh,
					dx, dy,
					dw, dh
				);
	
				return canvas;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getFilteredImageData(imageData, filterFunc) {
			try {
				var data = imageData.data;

				for (var i = 0; i < data.length; i += 4) {
					var arr = filterFunc(data[i], data[i + 1], data[i + 2], data[i + 3]); // return [red, green, blue, alpha];
					data[i] = toRgbInteger(arr[0]); // red
					data[i + 1] = toRgbInteger(arr[1]); // green
					data[i + 2] = toRgbInteger(arr[2]); // blue
					data[i + 3] = toRgbInteger(arr[3]); // alpha
				}

				return imageData;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getCoordinate(e) {
			try {
				var tmp = {};
				var containerCoordinate = containerElement.getBoundingClientRect();
				var mouseX;
				var mouseY;
				
				tmp.containerTop = containerCoordinate.top;
				tmp.containerLeft = containerCoordinate.left;
				tmp.containerWidth = containerCoordinate.width;
				tmp.containerHeight = containerCoordinate.height;
				tmp.containerX = containerCoordinate.left + (0.5 * containerCoordinate.width);
				tmp.containerY = containerCoordinate.top + (0.5 * containerCoordinate.height);

				tmp.screenTop = canvasState.screenTop;
				tmp.screenLeft = canvasState.screenLeft;
				tmp.screenWidth = canvasState.screenWidth;
				tmp.screenHeight = canvasState.screenHeight;
				tmp.screenX = canvasState.screenLeft + (0.5 * canvasState.screenWidth);
				tmp.screenY = canvasState.screenTop + (0.5 * canvasState.screenHeight);
				tmp.screenScaleX = canvasState.screenWidth / canvasState.width;
				tmp.screenScaleY = canvasState.screenHeight / canvasState.height;

				tmp.canvasLeft = canvasState.canvasLeft;
				tmp.canvasTop = canvasState.canvasTop;
				tmp.canvasWidth = canvasState.canvasWidth;
				tmp.canvasHeight = canvasState.canvasHeight;
				tmp.canvasX = ((0.5 * canvasState.canvasWidth) + canvasState.canvasLeft);
				tmp.canvasY = ((0.5 * canvasState.canvasHeight) + canvasState.canvasTop);

				tmp.originalCanvasLeft = canvasState.canvasLeft / canvasState.scaleX;
				tmp.originalCanvasTop = canvasState.canvasTop / canvasState.scaleY;
				tmp.originalCanvasWidth = canvasState.canvasWidth / canvasState.scaleX;
				tmp.originalCanvasHeight = canvasState.canvasHeight / canvasState.scaleY;
				tmp.originalCanvasX = ((0.5 * canvasState.canvasWidth) + canvasState.canvasLeft) / canvasState.scaleX;
				tmp.originalCanvasY = ((0.5 * canvasState.canvasHeight) + canvasState.canvasTop) / canvasState.scaleY;

				tmp.relativeLeft = canvasState.canvasLeft;
				tmp.relativeTop = canvasState.canvasTop;
				tmp.relativeWidth = canvasState.screenWidth;
				tmp.relativeHeight = canvasState.screenHeight;
				tmp.relativeX = (0.5 * canvasState.screenWidth) - canvasState.canvasLeft;
				tmp.relativeY = (0.5 * canvasState.screenHeight) - canvasState.canvasTop;

				if (e) {
					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.touches.length === 1) {
						mouseX = e.touches[0].clientX;
						mouseY = e.touches[0].clientY;
					} else {
						return tmp;
					}
					tmp.mouseX = (mouseX - canvasState.canvasLeft - containerCoordinate.left - canvasState.screenLeft) / canvasState.scaleX;
					tmp.mouseY = (mouseY - canvasState.canvasTop - containerCoordinate.top - canvasState.screenTop) / canvasState.scaleY;
				}

				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		// asynchronous
		function renderImage(file, exportedState, cb) {
			var newImage = new Image();
			var src;

			if (!canvasState.uploadable) {
				if (cb) {
					cb("You are not allowed to upload in this canvas by canvas settings");
				}
				return false;
			}

			try {
				// check file or url
				if (isObject(file)) {
					// file
					src = window.URL.createObjectURL(file);
					// check mimetype
					if (!hasArgument(config.allowedMimeTypes, file.type)) {
						if (cb) {
							cb("File not allowed");
						}
						return false;
					}
				} else if (isString(file)) {
					// url
					src = file;
					// check mimetype
					var typ = getMimetype(file);
					if (!hasArgument(config.allowedMimeTypes, typ)) {
						if (cb) {
							cb("File not allowed");
						}
						return false;
					}
				} else {
					if (cb) {
						cb("File not found");
					}
					return false;
				}
			} catch(err) {
				console.log(err);
				if (cb) {
					cb("File not Allowed");
				}
				return false;
			}
			newImage.onerror = function(err) {
				// console.log(err);
				if (cb) {
					cb("Image load failed");
				}
				return false;
			}
			newImage.onload = function(e) {
				var state = generateImageState(newImage);
				var containerInCanvas = canvasElement.querySelector("div.canvaaas-images");
				var containerInMirror = mirrorElement.querySelector("div.canvaaas-images");
				var newOriginImage = document.createElement("div");
				var newCloneImage = document.createElement("div");
				var newOriginImg;
				var newCloneImg;
				var newOriginHandles;
				var newCloneHandles;
				var newOriginBorders;
				var newCloneBorders;
				var additionalState;

				// intialize canvas before render image
				if (!canvasState.isInitialized) {
					setCanvas({
						originalWidth: newImage.width,
						originalHeight: newImage.height
					});
				}

				// create origin element
				newOriginImage.classList.add("canvaaas-image");
				newOriginImage.id = originId + state.id;
				newOriginImage.innerHTML = imageTemplate;

				newOriginImg = newOriginImage.querySelector("img");
				newOriginImg.id = originImgId + state.id;
				newOriginImg.src = newImage.src;

				// create clone element
				newCloneImage.classList.add("canvaaas-image");
				newCloneImage.id = cloneId + state.id;
				newCloneImage.innerHTML = imageTemplate;

				newCloneImg = newCloneImage.querySelector("img");
				newCloneImg.id = cloneImgId + state.id;
				newCloneImg.src = newImage.src;

				// set events
				newOriginImage.addEventListener("contextmenu", handlers.rightClick, false);
				// newOriginImage.addEventListener("dblclick", handlers.doubleClick, false); // deprecated
				newOriginImage.addEventListener("mousedown", handlers.startClick, false);
				newOriginImage.addEventListener("touchstart", handlers.startClick, false);
				// newOriginImage.addEventListener("mouseover", handlers.startHover, false); // deprecated
				newOriginImage.addEventListener("wheel", handlers.startWheelZoom, false);

				newCloneImage.addEventListener("contextmenu", handlers.rightClick, false);
				// newCloneImage.addEventListener("dblclick", handlers.doubleClick, false); // deprecated
				newCloneImage.addEventListener("mousedown", handlers.startClick, false);
				newCloneImage.addEventListener("touchstart", handlers.startClick, false);
				// newCloneImage.addEventListener("mouseover", handlers.startHover, false); // deprecated
				newCloneImage.addEventListener("wheel", handlers.startWheelZoom, false);

				// insert to canvas element
				containerInCanvas.appendChild(newOriginImage);
				containerInMirror.appendChild(newCloneImage);

				// insert to image states
				imageStates.push(state);

				// find handels
				newOriginHandles = newOriginImage.querySelectorAll("div.canvaaas-handle");
				newCloneHandles = newCloneImage.querySelectorAll("div.canvaaas-handle");

				// find borders
				newOriginBorders = newOriginImage.querySelectorAll("div.canvaaas-border");
				newCloneBorders = newCloneImage.querySelectorAll("div.canvaaas-border");

				// set handles
				for (var i = 0; i < newOriginHandles.length; i++) {
					var d = getDirection(newOriginHandles[i]);
					newOriginHandles[i].id = originHandleId + state.id + "-" + d;
					newOriginHandles[i].addEventListener("mousedown", handlers.startClickHandle, false);
					newOriginHandles[i].addEventListener("touchstart", handlers.startClickHandle, false);
				}
				for (var i = 0; i < newCloneHandles.length; i++) {
					var d = getDirection(newCloneHandles[i]);
					newCloneHandles[i].id = cloneHandleId + state.id + "-" + d;
					newCloneHandles[i].addEventListener("mousedown", handlers.startClickHandle, false);
					newCloneHandles[i].addEventListener("touchstart", handlers.startClickHandle, false);
				}

				// set borders
				for (var i = 0; i < newOriginBorders.length; i++) {
					var d = getDirection(newOriginBorders[i]);
					newOriginBorders[i].id = originBorderId + state.id + "-" + d;
					newOriginBorders[i].addEventListener("mousedown", handlers.startClickBorder, false);
					newOriginBorders[i].addEventListener("touchstart", handlers.startClickBorder, false);
				}
				for (var i = 0; i < newCloneBorders.length; i++) {
					var d = getDirection(newCloneBorders[i]);
					newCloneBorders[i].id = cloneBorderId + state.id + "-" + d;
					newCloneBorders[i].addEventListener("mousedown", handlers.startClickBorder, false);
					newCloneBorders[i].addEventListener("touchstart", handlers.startClickBorder, false);
				}

				// save image state
				var id = state.id;
				if (isObject(exportedState)) {
					additionalState = importImageState(exportedState);
				} else {
					additionalState = {};
				}
				if (additionalState.id) {
					if (!isExist(additionalState.id)) {
						setId(state.id, additionalState.id);
						id = additionalState.id;
					}
				}
				setImage(id, additionalState);

				// callback
				if (cb) {
					cb(null, id);
				}
				return false;
			}

			// start loading
			newImage.src = src;
		}

		function removeImage(id) {
			try {
				var state = getImageState(id);
				var origin = document.getElementById(originId + id);
				var clone = document.getElementById(cloneId + id);
				var originImg = document.getElementById(originImgId + id);
				var cloneImg = document.getElementById(cloneImgId + id);
				var stateSrc
				var originSrc;
				var cloneSrc;
				if (!state) {
					return false;
				}
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}
				if (!originImg) {
					return false;
				}
				if (!cloneImg) {
					return false;
				}

				var stateSrc = state.src;
				var originSrc = origin.src;
				var cloneSrc = cloneImg.src;

				// remove element
				origin.parentNode.removeChild(origin);
				clone.parentNode.removeChild(clone);

				// remove image state
				for (var i = 0; i < imageStates.length; i++) {
					if (imageStates[i].id === id) {
						imageStates.splice(i, 1);
					}
				}

				// clear caches
				for (var i = undoCaches.length - 1; i >= 0; i--) {
					if (undoCaches[i].id === id) {
						undoCaches.splice(i, 1);
					}
				}
				for (var i = redoCaches.length - 1; i >= 0; i--) {
					if (redoCaches[i].id === id) {
						redoCaches.splice(i, 1);
					}
				}

				window.URL.revokeObjectURL(stateSrc);
				if (state.src !== originSrc) {
					window.URL.revokeObjectURL(originSrc);
				}
				if (state.src !== cloneSrc) {
					window.URL.revokeObjectURL(cloneSrc);
				}

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getPadding(elem) {
			try {
				var style = elem.currentStyle || window.getComputedStyle(elem);

				return [
					toNumber(style.paddingTop.replace(/px/gi, "")),
					toNumber(style.paddingRight.replace(/px/gi, "")),
					toNumber(style.paddingBottom.replace(/px/gi, "")),
					toNumber(style.paddingLeft.replace(/px/gi, "")),
				];
			} catch(err) {
				console.log(err);
				return false;
			} 
		}

		function getContainedSizes(srcW, srcH, areaW, areaH) {
			try {
				var aspectRatio = srcW / srcH;

				if (areaH * aspectRatio > areaW) {
					return [areaW, areaW / aspectRatio];
				} else {
					return [areaH * aspectRatio, areaH];
				}
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getCoveredSizes(srcW, srcH, areaW, areaH) {
			try {
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
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getFittedSizes(option) {
			try {
				var maxSizes = getContainedSizes(
					option.width,
					option.height,
					option.maxWidth,
					option.maxHeight
				);
	
				var minSizes = getCoveredSizes(
					option.width,
					option.height,
					option.minWidth || 0,
					option.minHeight || 0
				);
	
				return [
					Math.min(maxSizes[0], Math.max(minSizes[0], option.width)),
					Math.min(maxSizes[1], Math.max(minSizes[1], option.height))
				];
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function fixCoordinateX(x, d) {
			try {
				var radians = d * Math.PI / 180;
				var sinFraction = Math.sin(radians);
				var cosFraction = Math.cos(radians);
				
				return [
					x * cosFraction,
					x * sinFraction
				];
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function fixCoordinateY(y, d) {
			try {
				var radians = d * Math.PI / 180;
				var sinFraction = Math.sin(radians);
				var cosFraction = Math.cos(radians);
				return [
					y * -sinFraction,
					y * cosFraction
				];
			} catch(err) {
				console.log(err);
				return false;
			}
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

		function getDiagonal(w, h) {
			return Math.sqrt( Math.pow(w, 2) + Math.pow(h, 2) );
		}

		function getAspectRatio(w, h, limited) {
			var val = w / h;
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

		function getDirection(elem) {
			try {
				var found;
				if (!elem) {
					return false;
				}
				for (var i = 0; i < directionSet.length; i++) {
					if (elem.classList.contains("canvaaas-direction-" + directionSet[i])) {
						found = directionSet[i];
					}
				}
				return found;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function flipDirection(direction, scaleX, scaleY) {
			try {
				var tmp = direction;
				if (scaleX) {
					if (scaleX === -1) {
						if (tmp.indexOf("e") > -1) {
							tmp = tmp.replace(/e/gi, "w");
						} else if (tmp.indexOf("w") > -1) {
							tmp = tmp.replace(/w/gi, "e");
						}
					}
				}
				if (scaleY) {
					if (scaleY === -1) {
						if (tmp.indexOf("n") > -1) {
							tmp = tmp.replace(/n/gi, "s");
						} else if (tmp.indexOf("s") > -1) {
							tmp = tmp.replace(/s/gi, "n");
						}
					}
				}
				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getShortId() {
			var firstPart = (Math.random() * 46656) | 0;
			var secondPart = (Math.random() * 46656) | 0;
			firstPart = ("000" + firstPart.toString(36)).slice(-3);
			secondPart = ("000" + secondPart.toString(36)).slice(-3);
			return firstPart + secondPart;
		}

		function getMaximumCanvas() {
			try {
				var w = [8388607, 4194303, 65535, 32767, 16384, 8192, 4096, 1];
				var h = [8388607, 4194303, 65535, 32767, 16384, 8192, 4096, 1];
				var a = [65535, 32767, 16384, 14188, 11402, 11180, 10836, 8192, 4096, 1];
				var maxLength;
				var responseTime = 0;
	
				for (var i = 0; i < a.length; i++) {
					if (!maxLength) {
						var res = testCanvas(a[i], a[i]);
						if (res.status) {
							maxLength = a[i];
						}
						responseTime += res.responseTime;
					}
				}

				if (!maxLength) {
					return false;
				}
	
				return {
					maxWidth: maxLength,
					maxHeight: maxLength,
					responseTime: responseTime
				};
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function testCanvas(w, h) {
			try {
				var start = Date.now();
				var width = w;
				var height = h;
				var status;
				var drawCanvas = document.createElement("canvas");
				var drawCtx = drawCanvas.getContext("2d");
				var testCanvas = document.createElement("canvas");
				var testCtx = testCanvas.getContext("2d");

				drawCanvas.width = width;
				drawCanvas.height = height;

				testCanvas.width = 1;
				testCanvas.height = 1;

				drawCtx.fillStyle = "#123123";
				drawCtx.fillRect(width - 1, height - 1, 1, 1);

				testCtx.drawImage(drawCanvas, width - 1, height - 1, 1, 1, 0, 0, 1, 1);

				status = testCtx.getImageData(0, 0, 1, 1).data[3] !== 0;

				return {
					width: width,
					height: height,
					status: status,
					responseTime: Date.now() - start
				}
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		// test
		function setCookie(k, v) {
			document.cookie = k + '=' + v;
		}

		// test
		function getCookie(k) {
			var cookies = document.cookie.split(';');
			var found;
			for(var i = 0; i < cookies.length; i++) {
				var arr = cookies[i].split("=");
				if (arr[0] === k) {
					found = arr[1];
					break;
				}
			}
			return found;
		}

		function isExist(id) {
			try {
				var candidate;
				var found = false;

				if (isString(id)) {
					candidate = toString(id);
				} else {
					return false;
				}
				for (var i = 0; i < imageStates.length; i++) {
					if (imageStates[i].id === candidate) {
						found = true;
					}
				}
				return found
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function isEmpty(candidate) {
			if (typeof(candidate) === "string") {
				return candidate.replace(/^\s+|\s+$/gm, "") === "";
			} else if (isArray(candidate)) {
				return candidate.length === 0;
			} else if (typeof(candidate) === "object" && candidate !== null) {
				return Object.keys(candidate).length === 0 && candidate.constructor === Object;
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
			return obj !== undefined && typeof(obj) === "object" && obj !== null && Object.prototype.toString.call(obj) !== '[object Array]';
		}

		function isFunction(func) {
			return func !== undefined && typeof(func) === "function";
		}

		function isArray(arr) {
			return arr !== undefined && Object.prototype.toString.call(arr) === '[object Array]';
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

		function isMimetype(str) {
			var pattern = new RegExp("(application|audio|font|example|image|message|model|multipart|text|video|x-(?:[0-9A-Za-z!#$%&'*+.^_`|~-]+))/([0-9A-Za-z!#$%&'*+.^_`|~-]+)((?:[ \t]*;[ \t]*[0-9A-Za-z!#$%&'*+.^_`|~-]+=(?:[0-9A-Za-z!#$%&'*+.^_`|~-]+|\"(?:[^\"\\\\]|\\.)*\"))*)");
			return str.match(pattern);
		}

		function isColor(str) {
			var pattern = new RegExp("^(?:#(?:[A-Fa-f0-9]{3}){1,2}|(?:rgb[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*(?:,(?![)])|(?=[)]))){3}|hsl[(]\s*0*(?:[12]?\d{1,2}|3(?:[0-5]\d|60))\s*(?:\s*,\s*0*(?:\d\d?(?:\.\d+)?\s*%|\.\d+\s*%|100(?:\.0*)?\s*%)){2}\s*|(?:rgba[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*,){3}|hsla[(]\s*0*(?:[12]?\d{1,2}|3(?:[0-5]\d|60))\s*(?:\s*,\s*0*(?:\d\d?(?:\.\d+)?\s*%|\.\d+\s*%|100(?:\.0*)?\s*%)){2}\s*,)\s*0*(?:\.\d+|1(?:\.0*)?)\s*)[)])$");
			return str.match(pattern);
		}

		function toBoolean(b) {
			return b === true || b === "true" || b === 1;
		}

		function toNumber(n) {
			return parseFloat(n);
		}

		function toString(n) {
			return "" + n;
		}

		function toArray(str) {
			if (isArray(str)) {
				return str;
			} else {
				return [str];
			}
		}

		function toRgbInteger(n) {
			n = Math.round(n);
			if (n < 0) {
				return 0;
			}
			if (n > 255) {
				return 255;
			}
			return n;
		}

		function hasArgument(arr, x) {
			var found = false;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === x) {
					found = true;
					break;
				}
			}
			return found;
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
			try {
				var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
				var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
				return [w, h];
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getMimetype(str) {
			try {
				var ext = str.split('.').pop().toLowerCase();
				if (ext === "html" || ext === "htm" || ext === "shtml") {
					return "text/html";
				}
				if (ext === "css") {
					return "text/css";
				}
				if (ext === "xml") {
					return "text/xml";
				}
				if (ext === "gif") {
					return "image/gif";
				}
				if (ext === "jpeg" || ext === "jpg") {
					return "image/jpeg";
				}
				if (ext === "js") {
					return "application/x-javascript";
				}
				if (ext === "atom") {
					return "application/atom+xml";
				}
				if (ext === "rss") {
					return "application/rss+xml";
				}
				if (ext === "mml") {
					return "text/mathml";
				}
				if (ext === "txt") {
					return "text/plain";
				}
				if (ext === "jad") {
					return "text/vnd.sun.j2me.app-descriptor";
				}
				if (ext === "wml") {
					return "text/vnd.wap.wml";
				}
				if (ext === "htc") {
					return "text/x-component";
				}
				if (ext === "png") {
					return "image/png";
				}
				if (ext === "tif") {
					return "image/tiff";
				}
				if (ext === "tiff") {
					return "image/tiff";
				}
				if (ext === "wbmp") {
					return "image/vnd.wap.wbmp";
				}
				if (ext === "ico") {
					return "image/x-icon";
				}
				if (ext === "jng") {
					return "image/x-jng";
				}
				if (ext === "bmp") {
					return "image/x-ms-bmp";
				}
				if (ext === "svg") {
					return "image/svg+xml";
				}
				if (ext === "webp") {
					return "image/webp";
				}
				if (ext === "jar") {
					return "application/java-archive";
				}
				if (ext === "war") {
					return "application/java-archive";
				}
				if (ext === "ear") {
					return "application/java-archive";
				}
				if (ext === "hqx") {
					return "application/mac-binhex40";
				}
				if (ext === "doc") {
					return "application/msword";
				}
				if (ext === "pdf") {
					return "application/pdf";
				}
				if (ext === "ps") {
					return "application/postscript";
				}
				if (ext === "eps") {
					return "application/postscript";
				}
				if (ext === "ai") {
					return "application/postscript";
				}
				if (ext === "rtf") {
					return "application/rtf";
				}
				if (ext === "xls") {
					return "vnd.ms-excel";
				}
				if (ext === "ppt") {
					return "application/vnd.ms-powerpoint";
				}
				if (ext === "wmlc") {
					return "application/vnd.wap.wmlc";
				}
				if (ext === "kml") {
					return "application/vnd.google-earth.kml+xml";
				}
				if (ext === "kmz") {
					return "application/vnd.google-earth.kmz";
				}
				if (ext === "7z") {
					return "application/x-7z-compressed";
				}
				if (ext === "cco") {
					return "application/x-cocoa";
				}
				if (ext === "jardiff") {
					return "application/x-java-archive-diff";
				}
				if (ext === "jnlp") {
					return "application/x-java-jnlp-file";
				}
				if (ext === "run") {
					return "application/x-makeself";
				}
				if (ext === "pl") {
					return "application/x-perl";
				}
				if (ext === "pm") {
					return "application/x-perl";
				}
				if (ext === "prc") {
					return "application/x-pilot";
				}
				if (ext === "pdb") {
					return "application/x-pilot";
				}
				if (ext === "rar") {
					return "application/x-rar-compressed";
				}
				if (ext === "rpm") {
					return "application/x-redhat-package-manager";
				}
				if (ext === "sea") {
					return "application/x-sea";
				}
				if (ext === "swf") {
					return "application/x-shockwave-flash";
				}
				if (ext === "sit") {
					return "application/x-stuffit";
				}
				if (ext === "tcl") {
					return "application/x-tcl";
				}
				if (ext === "tk") {
					return "application/x-tcl";
				}
				if (ext === "der") {
					return "application/x-x509-ca-cert";
				}
				if (ext === "pem") {
					return "application/x-x509-ca-cert";
				}
				if (ext === "crt") {
					return "application/x-x509-ca-cert";
				}
				if (ext === "xpi") {
					return "application/x-xpinstall";
				}
				if (ext === "xhtml") {
					return "application/xhtml+xml";
				}
				if (ext === "zip") {
					return "application/zip";
				}
				if (ext === "bin") {
					return "application/octet-stream";
				}
				if (ext === "exe") {
					return "application/octet-stream";
				}
				if (ext === "dll") {
					return "application/octet-stream";
				}
				if (ext === "deb") {
					return "application/octet-stream";
				}
				if (ext === "dmg") {
					return "application/octet-stream";
				}
				if (ext === "eot") {
					return "application/octet-stream";
				}
				if (ext === "iso") {
					return "application/octet-stream";
				}
				if (ext === "img") {
					return "application/octet-stream";
				}
				if (ext === "msi") {
					return "application/octet-stream";
				}
				if (ext === "msp") {
					return "application/octet-stream";
				}
				if (ext === "msm") {
					return "application/octet-stream";
				}
				if (ext === "mid") {
					return "audio/midi";
				}
				if (ext === "midi") {
					return "audio/midi";
				}
				if (ext === "kar") {
					return "audio/midi";
				}
				if (ext === "audio/mpeg") {
					return "audio/mpeg";
				}
				if (ext === "ogg") {
					return "audio/ogg";
				}
				if (ext === "ra") {
					return "audio/x-realaudio";
				}
				if (ext === "3gpp") {
					return "video/3gpp";
				}
				if (ext === "3gp") {
					return "video/3gpp";
				}
				if (ext === "mpeg") {
					return "video/mpeg";
				}
				if (ext === "mpg") {
					return "video/mpeg";
				}
				if (ext === "mov") {
					return "video/quicktime";
				}
				if (ext === "flv") {
					return "video/x-flv";
				}
				if (ext === "mng") {
					return "video/x-mng";
				}
				if (ext === "asx") {
					return "video/x-ms-asf";
				}
				if (ext === "asf") {
					return "video/x-ms-asf";
				}
				if (ext === "wmv") {
					return "video/x-ms-wmv";
				}
				if (ext === "avi") {
					return "video/x-msvideo";
				}
				if (ext === "m4v") {
					return "video/mp4";
				}
				if (ext === "mp4") {
					return "video/mp4";
				}
				return false;
			} catch (err) {
				console.log(err);
				return false;
			}
		}

		function getExtension(str) {
			try {
				return str.split('.').pop().toLowerCase();
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getFilename(str) {
			try {
				return str.replace(/^.*[\\\/]/, '');
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function copyObject(destiObj, srcObj) {
			try {
				for (var i = 0; i < Object.keys(srcObj).length; i++) {
					var k = Object.keys(srcObj)[i];
					destiObj[k] = srcObj[k];
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		//
		// export
		//

		myObject.init = function(target, cb) {
			try {
				if (!target) {
					if (cb) {
						cb("Argument `target` not found");
					}
					return false;
				}
				if (!isElement(target)) {
					if (cb) {
						cb("Argument `target` is not HTML element");
					}
					return false;
				}

				// get limited canvas sizes
				var maxCanvasSizes = getMaximumCanvas();
				if (maxCanvasSizes) {
					MAX_WIDTH = maxCanvasSizes.maxWidth;
					MAX_HEIGHT = maxCanvasSizes.maxHeight;
				}

				// set scrollbar width
				SCROLLBAR_WIDTH = getScrollbarWidth();

				// set template
				target.innerHTML = canvasTemplate;

				// set elements
				containerElement = target;
				screenElement = containerElement.querySelector("div.canvaaas-screen");
				canvasElement = containerElement.querySelector("div.canvaaas-canvas");
				mirrorElement = containerElement.querySelector("div.canvaaas-mirror");

				if (!screenElement) {
					if (cb) {
						cb("Screen element not found");
					}
					return false;
				}
				if (!canvasElement) {
					if (cb) {
						cb("Canvas element not found");
					}
					return false;
				}
				if (!mirrorElement) {
					if (cb) {
						cb("Mirror element not found");
					}
					return false;
				}

				// set events
				windowResizeEvent = handlers.resizeWindow;
				// windowResizeEvent = handlers.debounce( handlers.resizeWindow, 300 );
				window.addEventListener("resize", windowResizeEvent, false);

				// windowScrollEvent = handlers.scrollWindow;
				// windowScrollEvent = handlers.debounce( handlers.scrollWindow, 300 );
				// window.addEventListener("scroll", windowScrollEvent, false);

				document.addEventListener("touchstart", handlers.fixPinchZoom, false);

				// drag and drop upload event
				screenElement.addEventListener('dragenter', handlers.stopEvents, false);
				screenElement.addEventListener('dragleave', handlers.stopEvents, false);
				screenElement.addEventListener('dragover', handlers.stopEvents, false);
				screenElement.addEventListener('drop', handlers.stopEvents, false);
				screenElement.addEventListener('drop', handlers.drop, false);

				// callback
				var res = copyConfig();
				if (cb) {
					cb(null, res);
				}
				return res;
			} catch(err) {
				cb(err);
				return false;
			}
		}

		myObject.destroy = function(cb){
			try {
				// remove window event
				window.removeEventListener("resize", windowResizeEvent, false);
				// window.removeEventListener("scroll", windowScrollEvent, false);

				// remove container element
				containerElement.innerHTML = "";

				// clear states
				config = {};
				eventState = {};
				canvasState = {};
				imageStates = [];
				undoCaches = [];
				redoCaches = [];
				
				// clear elements
				containerElement = undefined;
				canvasElement = undefined;
				screenElement = undefined;
				mirrorElement = undefined;

				// clear events
				windowResizeEvent = undefined;
				windowScrollEvent = undefined;

				// reset ID
				originId = "canvaaas-o-";
				cloneId = "canvaaas-c-";
				originImgId = "canvaaas-oi-";
				cloneImgId = "canvaaas-ci-";
				originHandleId = "canvaaas-oh-";
				cloneHandleId = "canvaaas-ch-";
				originBorderId = "canvaaas-ob-";
				cloneBorderId = "canvaaas-cb-";
		
				MAX_WIDTH = 4096;
				MAX_HEIGHT = 4096;
				MIN_WIDTH = 1;
				MIN_HEIGHT = 1;

				// reset default states
				copyObject(config, defaultConfig);
				copyObject(canvasState, defaultCanvasState);

				// callback
				if (cb) {
					cb(null, true);
				}
				return true;
			} catch(err) {
				if (cb) {
					cb(err);
				}
				return false;
			}
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
					config.upload("Argument `imageFiles` is not Object");
				}
				if (cb) {
					cb("Argument `imageFiles` is not Object");
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
			if (!canvasState.uploadable) {
				if (config.upload) {
					config.upload("You are not allowed to upload in this canvas by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to upload in this canvas by canvas settings");
				}
				return false;
			}

			var index = imageFiles.length;
			var count = 0;
			var result = [];

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderImage(imageFiles[count], null, function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
							result.push({
								error: err
							});
						} else {
							var tmp = copyImageState(res);
							if (config.upload) {
								config.upload(null, tmp);
							}
							result.push(tmp);
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;
					// callback
					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		// asynchronous
		myObject.uploadUrls = function(imageUrls, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			if (!isArray(imageUrls)) {
				if (config.upload) {
					config.upload("Argument `imageUrls` is not Array");
				}
				if (cb) {
					cb("Argument `imageUrls` is not Array");
				}
				return false;
			}
			if (imageUrls.length < 1) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				}
				return false;
			}
			if (!canvasState.uploadable) {
				if (config.upload) {
					config.upload("You are not allowed to upload in this canvas by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to upload in this canvas by canvas settings");
				}
				return false;
			}

			var index = imageUrls.length;
			var count = 0;
			var result = [];

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderImage(imageUrls[count], null, function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
							result.push({
								error: err
							});
						} else {
							var tmp = copyImageState(res);
							if (config.upload) {
								config.upload(null, tmp);
							}
							result.push(tmp);
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;
					// callback
					if (cb) {
						cb(null, result);
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
					config.upload("Argument `exportedStates` is not Array");
				}
				if (cb) {
					cb("Argument `exportedStates` is not Array");
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
			if (!canvasState.uploadable) {
				if (config.upload) {
					config.upload("You are not allowed to upload in this canvas by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to upload in this canvas by canvas settings");
				}
				return false;
			}

			var index = exportedStates.length;
			var count = 0;
			var result = [];

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderImage(exportedStates[count].src, exportedStates[count], function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
							result.push({
								error: err
							});
						} else {
							var tmp = copyImageState(res);
							if (config.upload) {
								config.upload(null, tmp);
							}
							result.push(tmp);
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;
					// callback
					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		// asynchronous
		myObject.uploadElements = function(imgElements, cb) {
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			if (!isArray(imgElements) && !isNodeList(imgElements)) {
				if (config.upload) {
					config.upload("Argument `imgElements` is not Array or NodeList");
				}
				if (cb) {
					cb("Argument `imgElements` is not Array or NodeList");
				}
				return false;
			}
			if (imgElements.length < 1) {
				if (config.upload) {
					config.upload("File not found");
				}
				if (cb) {
					cb("File not found");
				}
				return false;
			}
			if (!canvasState.uploadable) {
				if (config.upload) {
					config.upload("You are not allowed to upload in this canvas by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to upload in this canvas by canvas settings");
				}
				return false;
			}

			var index = imgElements.length;
			var count = 0;
			var result = [];

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					if (!isElement(imgElements[count])) {
						if (config.upload) {
							config.upload("Argument is not DOM Object");
						}
						count++;
						recursiveFunc();
						return false;
					}
					var attrs = getDatasetFromElement(imgElements[count]);
					var src = imgElements[count].src || attrs.src;
					renderImage(src, attrs, function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
							result.push({
								error: err
							});
						} else {
							var tmp = copyImageState(res);
							if (config.upload) {
								config.upload(null, tmp);
							}
							result.push(tmp);
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;
					// callback
					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		//
		// edit image
		//

		myObject.find = function(query, cb){
			if (!isObject(query)) {
				if (cb) {
					cb("Argument `query` is not Object");
				}
				return false;
			}

			var founds = [];
			for(var i = 0; i < imageStates.length; i++) {
				var isMatch = true;
				for(var j = 0; j < Object.keys(query).length; j++) {
					var k = Object.keys(query)[j];
					if (imageStates[i][k] !== undefined) {
						if (typeof(imageStates[i][k]) === "number") {
							if (imageStates[i][k] !== toNumber(query[k])) {
								isMatch = false;
							}
						} else if (typeof(imageStates[i][k]) === "string") {
							if (imageStates[i][k] !== toString(query[k])) {
								isMatch = false;
							}
						} else if (typeof(imageStates[i][k]) === "boolean") {
							if (imageStates[i][k] !== toBoolean(query[k])) {
								isMatch = false;
							}
						}
					}	
				}
				if (isMatch) {
					var tmp = copyImageState(imageStates[i].id);
					founds.push(tmp);
				}
			}

			if (founds.length < 1) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			// callback
			if (cb) {
				cb(null, founds);
			}
			return founds;
		}

		myObject.id = function(oldId, newId, cb) {
			if (!isExist(oldId)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isString(newId)) {
				if (config.edit) {
					config.edit("Argument `newId` is not String");
				}
				if (cb) {
					cb("Argument `newId` is not String");
				}
				return false;
			}

			var state = getImageState(oldId);
			var str = toString(newId);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by image settings");
				}
				return false;
			}
			if (isExist(str)) {
				if (config.edit) {
					config.edit("ID already exists");
				}
				if (cb) {
					cb("ID already exists");
				}
				return false;
			}

			setId(oldId, str);

			// callback
			var res = copyImageState(str);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		/*
			newState = {
				index
				width
				height
				x
				y
				rotate
				scaleX
				scaleY
				opacity
				cropTop
				cropBottom
				cropLeft
				cropRight
				lockAspectRatio
				visible
				clickable
				editable
				movable
				resizable
				rotatable
				flippable
				croppable
				drawable
				grid
				pivot
				handle
				border
			}
		*/
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
					config.edit("Argument `newState` is not Object");
				}
				if (cb) {
					cb("Argument `newState` is not Object");
				}
				return false;
			}

			var state = getImageState(id);
			var updates = importImageState(newState);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, updates);
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.states = function(newStates, cb) {
			if (!isArray(newStates)) {
				if (config.edit) {
					config.edit("Argument `newStates` is not Array");
				}
				if (cb) {
					cb("Argument `newStates` is not Array");
				}
				return false;
			}
			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			var result = [];

			for (var i = 0; i < newStates.length; i++) {
				var id = newStates[i].id;
				var state = getImageState(id);
				var updates = importImageState(newStates[i]);

				// save cache
				saveUndo(id);

				// save image state
				setImage(id, updates);

				// callback
				var res = copyImageState(id);
				if (config.edit) {
					config.edit(null, res);
				}
				result.push(res);
			}
			if (cb) {
				cb(null, result);
			}
			return result;
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Numeric");
				}
				if (cb) {
					cb("Argument `n` is not Numeric");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable || !canvasState.movable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.movable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				x: state.x + toNumber(n)
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Numeric");
				}
				if (cb) {
					cb("Argument `n` is not Numeric");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable || !canvasState.movable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.movable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				y: state.y + toNumber(n)
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.width = function(id, n, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Object");
				}
				if (cb) {
					cb("Argument `n` is not Object");
				}
				return false;
			}

			var state = getImageState(id);
			var obj = {
				width: n
			}
			var add = importImageState(obj).width;
			var fix = fixCoordinateX(add, state.rotate);
			var width = state.width;
			var axisX = state.x;
			var axisY = state.y;
			var anchor = state.anchor;

			width += add;

			if (anchor === 0 || anchor === 3 || anchor === 6) {
				axisX += 0.5 * fix[0];
				axisY += 0.5 * fix[1];	
			} else if (anchor === 2 || anchor === 5 || anchor === 6) {
				axisX -= 0.5 * fix[0];
				axisY -= 0.5 * fix[1];	
			}

			if (!canvasState.editable || !canvasState.resizable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.resizable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				x: axisX,
				y: axisY,
				width: width
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.height = function(id, n, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Object");
				}
				if (cb) {
					cb("Argument `n` is not Object");
				}
				return false;
			}

			var state = getImageState(id);
			var obj = {
				height: n
			}
			var add = importImageState(obj).height;
			var fix = fixCoordinateY(add, state.rotate);
			var height = state.height;
			var axisX = state.x;
			var axisY = state.y;
			var anchor = state.anchor;

			height += add;

			if (anchor === 0 || anchor === 1 || anchor === 2) {
				axisX += 0.5 * fix[0];
				axisY += 0.5 * fix[1];
			} else if (anchor === 6 || anchor === 7 || anchor === 8) {
				axisX -= 0.5 * fix[0];
				axisY -= 0.5 * fix[1];	
			}

			if (!canvasState.editable || !canvasState.resizable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.resizable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				x: axisX,
				y: axisY,
				height: height
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Numeric");
				}
				if (cb) {
					cb("Argument `n` is not Numeric");
				}
				return false;
			}

			var state = getImageState(id);
			var ratio = toNumber(n);

			if (!canvasState.editable || !canvasState.resizable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.resizable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				width: state.width * ratio,
				height: state.height * ratio,
				cropTop: state.cropTop * ratio,
				cropBottom: state.cropBottom * ratio,
				cropLeft: state.cropLeft * ratio,
				cropRight: state.cropRight * ratio,
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
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

			var state = getImageState(id);
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

			if (
				!canvasState.editable ||
				!canvasState.movable ||
				!canvasState.resizable ||
				!canvasState.rotatable ||
				!canvasState.flippable ||
				!canvasState.croppable
			) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (
				!state.editable ||
				!state.movable ||
				!state.resizable ||
				!state.rotatable ||
				!state.flippable ||
				!state.croppable
			) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
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
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
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

			var state = getImageState(id);
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

			if (
				!canvasState.editable ||
				!canvasState.movable ||
				!canvasState.resizable ||
				!canvasState.rotatable ||
				!canvasState.flippable ||
				!canvasState.croppable
			) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (
				!state.editable ||
				!state.movable ||
				!state.resizable ||
				!state.rotatable ||
				!state.flippable ||
				!state.croppable
			) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
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
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Numeric");
				}
				if (cb) {
					cb("Argument `n` is not Numeric");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable || !canvasState.rotatable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.rotatable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				rotate: state.rotate + toNumber(n)
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
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

			var state = getImageState(id);

			if (!canvasState.editable || !canvasState.flippable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.flippable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				scaleY: state.scaleY * -1
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
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

			var state = getImageState(id);

			if (!canvasState.editable || !canvasState.flippable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.flippable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				scaleX: state.scaleX * -1
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Numeric");
				}
				if (cb) {
					cb("Argument `n` is not Numeric");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				opacity: state.opacity + toNumber(n)
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.cropTop = function(id, n, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Object");
				}
				if (cb) {
					cb("Argument `n` is not Object");
				}
				return false;
			}

			var state = getImageState(id);
			var obj = {
				cropTop: n
			}
			var add = importImageState(obj).cropTop;
			var fix = fixCoordinateY(add, state.rotate);

			if (!canvasState.editable || !canvasState.croppable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.croppable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}


			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				x: state.x + 0.5 * fix[0],
				y: state.y + 0.5 * fix[1],
				cropTop: state.cropTop + add,
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.cropBottom = function(id, n, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Object");
				}
				if (cb) {
					cb("Argument `n` is not Object");
				}
				return false;
			}

			var state = getImageState(id);
			var obj = {
				cropBottom: n
			}
			var add = importImageState(obj).cropBottom;
			var fix = fixCoordinateY(add, state.rotate);

			if (!canvasState.editable || !canvasState.croppable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.croppable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				x: state.x - 0.5 * fix[0],
				y: state.y - 0.5 * fix[1],
				cropBottom: state.cropBottom + add,
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.cropLeft = function(id, n, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Object");
				}
				if (cb) {
					cb("Argument `n` is not Object");
				}
				return false;
			}

			var state = getImageState(id);
			var obj = {
				cropLeft: n
			}
			var add = importImageState(obj).cropLeft;
			var fix = fixCoordinateX(add, state.rotate);

			if (!canvasState.editable || !canvasState.croppable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.croppable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				x: state.x + 0.5 * fix[0],
				y: state.y + 0.5 * fix[1],
				cropLeft: state.cropLeft + add,
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.cropRight = function(id, n, cb){
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Object");
				}
				if (cb) {
					cb("Argument `n` is not Object");
				}
				return false;
			}

			var state = getImageState(id);
			var obj = {
				cropRight: n
			}
			var add = importImageState(obj).cropRight;
			var fix = fixCoordinateX(add, state.rotate);

			if (!canvasState.editable || !canvasState.croppable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable || !state.croppable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				x: state.x - 0.5 * fix[0],
				y: state.y - 0.5 * fix[1],
				cropRight: state.cropRight + add,
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not Numeric");
				}
				if (cb) {
					cb("Argument `n` is not Numeric");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);

			// save image state
			setImage(id, {
				index: state.index + toNumber(n)
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.lockAspectRatio = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable) {
				if (config.edit) {
					config.edit("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				lockAspectRatio: state.lockAspectRatio === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.visible = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				visible: state.visible === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.clickable = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				clickable: state.clickable === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.editable = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				editable: state.editable === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.movable = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				movable: state.movable === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.resizable = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				resizable: state.resizable === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.rotatable = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				rotatable: state.rotatable === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.flippable = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				flippable: state.flippable === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.croppable = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				croppable: state.croppable === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.drawable = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				drawable: state.drawable === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.pivot = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				pivot: state.pivot === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.grid = function(id, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				grid: state.grid === false
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.handle = function(id, newHandle, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isObject(newHandle)) {
				if (config.edit) {
					config.edit("Argument `newHandle` is not Object");
				}
				if (cb) {
					cb("Argument `newHandle` is not Object");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				handle: newHandle
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.border = function(id, newBorder, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isObject(newBorder)) {
				if (config.edit) {
					config.edit("Argument `newBorder` is not Object");
				}
				if (cb) {
					cb("Argument `newBorder` is not Object");
				}
				return false;
			}

			var state = getImageState(id);

			if (!canvasState.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by canvas settings");
				}
				return false;
			}
			
			// save cache
			saveUndo(id);
			// save image state
			setImage(id, {
				border: newBorder
			});
			// callback
			var res = copyImageState(id);
			if (config.edit) {
				config.edit(null, res);
			}
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.remove = function(id, cb) {
			if (!isExist(id)) {
				if (config.remove) {
					config.remove("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);
			var tmp = copyImageState(id);

			if (!canvasState.editable) {
				if (config.remove) {
					config.remove("This image not allowed to edit this image by canvas settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by canvas settings");
				}
				return false;
			}
			if (!state.editable) {
				if (config.remove) {
					config.remove("This image not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("This image not allowed to edit this image by image settings");
				}
				return false;
			}

			// callback
			var res = removeImage(id);
			if (!res) {
				if (config.remove) {
					config.remove("Failed to remove image");
				}
				if (cb) {
					cb("Failed to remove image");
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
		// class
		// 

		myObject.addClassToContainer = function(cls, cb) {
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("canvaaas has been not initialized");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}
			// callback
			var res = addClassToContainer(cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.removeClassToContainer = function(cls, cb) {
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("canvaaas has been not initialized");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}

			// callback
			var res = removeClassToContainer(cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.addClassToScreen = function(cls, cb) {
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("canvaaas has been not initialized");
				}
				return false;
			}
			if (!canvasState.isInitialized) {
				if (cb) {
					cb("canvas has been not initialized");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}

			// callback
			var res = addClassToScreen(cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.removeClassToScreen = function(cls, cb) {
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("canvaaas has been not initialized");
				}
				return false;
			}
			if (!canvasState.isInitialized) {
				if (cb) {
					cb("canvas has been not initialized");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}

			// callback
			var res = removeClassToScreen(cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.addClassToCanvas = function(cls, cb) {
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("canvaaas has been not initialized");
				}
				return false;
			}
			if (!canvasState.isInitialized) {
				if (cb) {
					cb("canvas has been not initialized");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}

			// callback
			var res = addClassToCanvas(cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.removeClassToCanvas = function(cls, cb) {
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("canvaaas has been not initialized");
				}
				return false;
			}
			if (!canvasState.isInitialized) {
				if (cb) {
					cb("canvas has been not initialized");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}

			// callback
			var res = removeClassToCanvas(cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.addClassToImage = function(id, cls, cb) {
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}

			// callback
			var res = addClassToImage(id, cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.removeClassToImage = function(id, cls, cb) {
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}

			// callback
			var res = removeClassToImage(id, cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.addClassToHandle = function(id, direction, cls, cb) {
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isString(direction)) {
				if (cb) {
					cb("Argument `direction` is not String");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}
			if (!hasArgument(handleDirectionSet, direction)) {
				if (cb) {
					cb("Argument `direction` is not available");
				}
				return false;
			}

			// callback
			var res = addClassToHandle(id, direction, cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.removeClassToHandle = function(id, direction, cls, cb) {
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isString(direction)) {
				if (cb) {
					cb("Argument `direction` is not String");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}
			if (!hasArgument(handleDirectionSet, direction)) {
				if (cb) {
					cb("Argument `direction` is not available");
				}
				return false;
			}

			// callback
			var res = removeClassToHandle(id, direction, cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.addClassToBorder = function(id, direction, cls, cb) {
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isString(direction)) {
				if (cb) {
					cb("Argument `direction` is not String");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}
			if (!hasArgument(borderDirectionSet, direction)) {
				if (cb) {
					cb("Argument `direction` is not available");
				}
				return false;
			}

			// callback
			var res = addClassToBorder(id, direction, cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		myObject.removeClassToBorder = function(id, direction, cls, cb) {
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isString(direction)) {
				if (cb) {
					cb("Argument `direction` is not String");
				}
				return false;
			}
			if (!isString(cls)) {
				if (cb) {
					cb("Argument `cls` is not String");
				}
				return false;
			}
			if (!hasArgument(borderDirectionSet, direction)) {
				if (cb) {
					cb("Argument `direction` is not available");
				}
				return false;
			}

			// callback
			var res = removeClassToBorder(id, direction, cls);
			if (!res) {
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		//
		// config
		//

		/*
			newConfig = {
				allowedMimeTypes: [], // array
				cacheLevels: 999, // number
				startIndexAfterRender: 1, // number
				maxIndexAfterRender: 1000, // number
				imageScaleAfterRender: 0.5, // number, 0 ~ 1 scale in canvas
				lockAspectRatioAfterRender: false, // boolean
				showGridAfterRender: true, // boolean
				showPivotAfterRender: true, // boolean
				showBorderAfterRender: {}, // object
				showHandleAfterRender: {},// object
				click: undefined, // function(err, res, event)
				rightClick: undefined, // function(err, res, event)
				upload: undefined, // function(err, res,)
				edit: undefined, // function(err, res, event)
				remove: undefined, // function(err, res,)
			}
		*/
		myObject.config = function(newConfig, cb) {
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("Canvaaas has been not initialized");
				}
				return false;
			}
			if (!isObject(newConfig)) {
				if (cb) {
					cb("Argument `newConfig` is not Object");
				}
				return false;
			}

			// set config
			setConfig(newConfig);

			// callback
			var res = copyConfig();
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		//
		// canvas
		//

		/*
			option = {
				originalWidth: number,
				originalHeight: number,
				background: "transparent", // string, "transparent" or "#FFFFFF" ~ "#000000"
				overflow: true, // boolean
				checker: true, // boolean
				uploadable: true, // boolean
				clickable: true, // boolean
				editable: true, // boolean
				movable: true, // boolean
				resizable: true, // boolean
				rotatable: true, // boolean
				flippable: true, // boolean
				croppable: true, // boolean
			}
		*/
		myObject.new = function(option, cb) {
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("canvaaas has been not initialized");
				}
				return false;
			}
			if (canvasState.isInitialized) {
				if (cb) {
					cb("canvas already created");
				}
				return false;
			}
			if (!isObject(option)) {
				if (cb) {
					cb("Argument `option` is not Object");
				}
				return false;
			}
			if (!option.originalWidth === undefined) {
				if (cb) {
					cb("Argument `option.originalWidth` is required");
				}
				return false;
			}
			if (!option.originalHeight === undefined) {
				if (cb) {
					cb("Argument `option.originalHeight` is required");
				}
				return false;
			}
			if (!isNumeric(option.originalWidth)) {
				if (cb) {
					cb("Argument `option.originalWidth` is not Numeric");
				}
				return false;
			}
			if (!isNumeric(option.originalHeight)) {
				if (cb) {
					cb("Argument `option.originalHeight` is not Numeric");
				}
				return false;
			}

			setCanvas(option);

			// callback
			var res = copyCanvasState();
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.close = function(cb) {
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("canvaaas has been not initialized");
				}
				return false;
			}
			if (!canvasState.isInitialized) {
				if (cb) {
					cb("Canvas has been not initialized");
				}
				return false;
			}

			eventState = {};
			undoCaches = [];
			redoCaches = [];

			clearCanvas();

			// callback
			var res = copyCanvasState();
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		/*
			option = {
				originalWidth: number,
				originalHeight: number,
				x: number,
				y: number,
				width: number,
				height: number,
				background: "transparent", // string, "transparent" or "#FFFFFF" ~ "#000000"
				overflow: true, // boolean
				checker: true, // boolean
				uploadable: true, // boolean
				clickable: true, // boolean
				editable: true, // boolean
				movable: true, // boolean
				resizable: true, // boolean
				rotatable: true, // boolean
				flippable: true, // boolean
				croppable: true, // boolean
			}
		*/
		myObject.canvas = function(option, cb) {
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("Canvaaas has been not initialized");
				}
				return false;
			}
			if (!canvasState.isInitialized) {
				if (cb) {
					cb("Canvas has been not initialized");
				}
				return false;
			}
			if (!isObject(option)) {
				if (cb) {
					cb("Argument `option` is not Object");
				}
				return false;
			}

			setCanvas(option);

			// callback
			var res = copyCanvasState();
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		//
		// draw
		//

		/*
			option = {
				filename(optional)
				mimetype(optional)
				quality(optional)
				background(optional)
				width(optional)
				height(optional)
				filter(optional)
			}
		*/
		myObject.draw = function(option, cb){
			if (!containerElement || !screenElement || !canvasElement || !mirrorElement) {
				if (cb) {
					cb("Canvaaas has been not initialized");
				}
				return false;
			}
			if (!canvasState.isInitialized) {
				if (cb) {
					cb("Canvas has been not initialized");
				}
				return false;
			}
			if (eventState.onDraw) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			if (!isObject(option)) {
				if (cb) {
					cb("Argument `option` is not Object");
				}
				return false;
			}

			var canvState = copyCanvasState();
			var convertedImageStates = [];
			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawable) {
					var tmp = copyImageState(imageStates[i].id);
					convertedImageStates.push(tmp);
				}
			}
			convertedImageStates.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			eventState.onDraw = true;

			drawCanvas(option, canvState, convertedImageStates, function(err, base64, result){
				if (err) {
					if (cb) {
						cb(err);
					}
				} else {
					if (cb) {
						cb(null, base64, result);
					}
				}
				eventState.onDraw = false;
				return false;
			});
		}

		/*
			option = {
				filename(optional)
				mimetype(optional)
				quality(optional)
				background(optional)
				width(optional)
				height(optional)
				filter(optional)
			}
			exportedCanvasSizes = {
				width(required)
				height(required)
			}
			exportedImageStates = {
				src(required)
				index(required)
				x(required)
				y(required)
				width(required)
				height(required)
				rotate(optional)
				scaleX(optional)
				scaleY(optional)
				opacity(optional)
				cropTop(optional)
				cropBottom(optional)
				cropLeft(optional)
				cropRight(optional)
				drawable(optional)
			}
		*/
		myObject.drawTo = function(option, exportedCanvasSizes, exportedImageStates, cb){
			var canvState = {};
			var convertedImageStates = [];

			if (eventState.onDraw === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			if (!isObject(option)) {
				if (cb) {
					cb("Argument `option` is not Object");
				}
				return false;
			}
			if (!isObject(exportedCanvasSizes)) {
				if (cb) {
					cb("Argument `exportedCanvasSizes` is not Object");
				}
				return false;
			}
			if (!isArray(exportedImageStates)) {
				if (cb) {
					cb("Argument `exportedImageStates` is not Array");
				}
				return false;
			}
			if (!exportedCanvasSizes.width) {
				if (cb) {
					cb("Argument `exportedCanvasSizes.width` is required");
				}
				return false;
			}
			if (!exportedCanvasSizes.height) {
				if (cb) {
					cb("Argument `exportedCanvasSizes.height` is required");
				}
				return false;
			}
			if (!isNumeric(exportedCanvasSizes.width)) {
				if (cb) {
					cb("Argument `exportedCanvasSizes.width` is not Numeric");
				}
				return false;
			} else {
				canvState.width = toNumber(exportedCanvasSizes.width);
			}
			if (!isNumeric(exportedCanvasSizes.height)) {
				if (cb) {
					cb("Argument `exportedCanvasSizes.height` is not Numeric");
				}
				return false;
			} else {
				canvState.height = toNumber(exportedCanvasSizes.height);
			}

			for (var i = 0; i < exportedImageStates.length; i++) {
				var isObj = isObject(exportedImageStates[i]);
				var isDrawable;
				if (isObj) {
					isDrawable = exportedImageStates[i].drawable === undefined || exportedImageStates[i].drawable === true;
					if (isDrawable) {
						var tmp = copyObject(imageStates[i].id);
						convertedImageStates.push(tmp);
					}
				}
			}

			convertedImageStates.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			eventState.onDraw = true;

			drawCanvas(option, canvState, convertedImageStates, function(err, base64, result){
				if (err) {
					if (cb) {
						cb(err);
					}
				} else {
					if (cb) {
						cb(null, base64, result);
					}
				}
				eventState.onDraw = false;
				return false;
			});
		}

		//
		// get data
		//

		myObject.getDevice = function(cb){
			var sizes = getViewportSizes();
			var tmp = {
				viewportWidth: sizes[0],
				viewportHeight: sizes[1],
				maxCanvasWidth: MAX_WIDTH,
				maxCanvasHeight: MAX_HEIGHT,
				minCanvasWidth: MIN_WIDTH,
				minCanvasHeight: MIN_HEIGHT,
			}
			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getConfig = function(cb){
			var res = copyConfig();
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.getCanvas = function(cb){
			var res = copyCanvasState();
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.getImage = function(id, cb){
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			var res = copyImageState(id);
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.getImages = function(cb){
			var arr = [];
			for(var i = 0; i < imageStates.length; i++) {
				var tmp = copyImageState(imageStates[i].id);
				arr.push(tmp);
			}
			arr.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			if (cb) {
				cb(null, arr);
			}
			return arr;
		}

		myObject.getPrevious = function(id, cb){
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);
			var sortedStates = [];

			for(var i = 0; i < imageStates.length; i++) {
				sortedStates.push(imageStates[i]);
			}

			sortedStates.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			var found;
			for (var i = 0; i < sortedStates.length; i++) {
				if (sortedStates[i].id === id) {
					if (sortedStates[i - 1]) {
						found = copyImageState(sortedStates[i - 1].id);
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

		myObject.getNext = function(id, cb){
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}

			var state = getImageState(id);
			var sortedStates = [];

			for(var i = 0; i < imageStates.length; i++) {
				sortedStates.push(imageStates[i]);
			}

			sortedStates.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			var found;
			for (var i = 0; i < sortedStates.length; i++) {
				if (sortedStates[i].id === id) {
					if (sortedStates[i - 1]) {
						found = copyImageState(sortedStates[i + 1].id);
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

		myObject.getMouse = function(x, y, cb){
			if (!isNumeric(x)) {
				if (cb) {
					cb("Argument `x` is not Numeric");
				}
				return false;
			}
			if (!isNumeric(y)) {
				if (cb) {
					cb("Argument `y` is not Numeric");
				}
				return false;
			}
			var mouseX = toNumber(x);
			var mouseY = toNumber(y);
			var coordinate = getCoordinate();
			var tmp = {};
			tmp.x = (mouseX - coordinate.canvasLeft - coordinate.containerLeft - coordinate.screenLeft) / coordinate.screenScaleX;
			tmp.y = (mouseY - coordinate.canvasTop - coordinate.containerTop - coordinate.screenTop) / coordinate.screenScaleY;
			// tmp.clientX = mouseX - coordinate.containerLeft - coordinate.screenLeft;
			// tmp.clientY = mouseY - coordinate.containerTop - coordinate.screenTop;

			if (cb) {
				cb(null, tmp);
			}
			return tmp;
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

		// 
		// export
		// 

		myObject.export = function(imageIds, cb) {
			if (!isArray(imageIds)) {
				if (cb) {
					cb("Argument `imageIds` is not Array");
				}
				return false;
			}

			var arr = [];
			for(var i = 0; i < imageStates.length; i++) {
				if (hasArgument(imageIds, imageStates[i].id)) {
					var tmp = copyImageState(imageStates[i].id);
					arr.push(tmp);
				}
			}

			arr.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			if (cb) {
				cb(null, arr);
			}
			return arr;
		};

		myObject.import = function(exportedImageStates, cb){
			if (eventState.onUpload) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			if (!isArray(exportedImageStates)) {
				if (cb) {
					cb("Argument `exportedImageStates` is not Array");
				}
				return false;
			}
			if (!canvasState.uploadable) {
				if (config.upload) {
					config.upload("You are not allowed to upload in this canvas by canvas settings");
				}
				if (cb) {
					cb("You are not allowed to upload in this canvas by canvas settings");
				}
				return false;
			}

			var filterdStates = [];
			for(var i = 0; i < exportedImageStates.length; i++) {
				var candidate = exportedImageStates[i];
				var isObj = isObject(candidate);

				if (isObj) {
					if (candidate.src) {
						filterdStates.push(candidate);
					}
				}
			}
			filterdStates.sort(function(a, b){
				if (a.index > b.index) {
					return 1;
				}
				if (a.index < b.index) {
					return -1;
				}
				return 0;
			});

			var index = filterdStates.length;
			var count = 0;
			var result = [];

			eventState.onUpload = true;

			recursiveFunc()

			function recursiveFunc() {
				if (count < index) {
					renderImage(filterdStates[count].src, filterdStates[count], function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
						} else {
							var tmp = copyImageState(res);
							if (config.upload) {
								config.upload(null, tmp);
							}
							result.push(tmp)
						}
						count++;
						recursiveFunc();
					});
				} else {
					eventState.onUpload = false;
					// callback
					if (cb) {
						cb(null, result);
					}
					return false;
				}
			}
		}

		//
		// undo & redo
		//

		myObject.undo = function(cb){
			if (undoCaches.length < 1) {
				if (cb) {
					cb("Cache is empty");
				}
				return false;
			}

			var id = callUndo();
			var res = copyImageState(id);
			if (cb) {
				cb(null, res);
			}
			return res;
		}

		myObject.redo = function(cb){
			if (redoCaches.length < 1) {
				if (cb) {
					cb("Cache is empty");
				}
				return false;
			}

			var id = callRedo();
			var res = copyImageState(id);
			if (cb) {
				cb(null, res);
			}
			return res;
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
	if (!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		};
	}
	if (!Array.isArray) {
		Array.isArray = function(arg) {
			return Object.prototype.toString.call(arg) === '[object Array]';
		};
	}
})(window);