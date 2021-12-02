// canvaaas.js
// godicheol@gmail.com

(function(window){
	'use strict';

	function canvaaas() {

		var myObject = {};

		var defaultConfig = {
			allowedMimeTypesForUpload: [
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
			aspectRatioOfContainer: 1 / 1, // number, width / height
			maxWidthOfContainer: undefined, // number, px
			maxHeightOfContainer: undefined, // number, px
			startIndexAfterRender: 1, // number
			maxIndexAfterRender: 1000, // number
			imageScaleAfterRender: 0.5, // number, 0 ~ 1 scale in canvas
			lockAspectRatioAfterRender: false, // boolean
			showGridAfterRender: true, // boolean
			showPivotAfterRender: true, // boolean
			click: undefined, // function(err, res)
			rightClick: undefined, // function(err, res, next)
			clickHandle: undefined, // function(err, res, direction)
			upload: undefined, // function(err, res)
			edit: undefined, // function(err, res)
			remove: undefined, // function(err, res)
		};

		var defaultCanvasState = {
			filename: "untitled", // string, without extension
			mimetype: "image/png", // string
			quality: 0.92, // number, 0 ~ 1
			background: "transparent", // string, "transparent" or "#FFFFFF" ~ "#000000"
			overlay: true, // boolean
			checker: true, // boolean
			ruler: false, // boolean
			clickable: true, // boolean
			editable: true, // boolean
		};

		// allowed values = ["resize", "crop", "rotate", "flip"];
		var defaultHandleState = {
			"n": "resize",
			"s": "resize",
			"e": "resize",
			"w": "resize",
			"ne": "resize",
			"nw": "resize",
			"se": "resize",
			"sw": "resize",
			"nn": "rotate",
			"ss": "flip",
			"ee": "flip",
			"ww": "rotate",
			"nene": "crop",
			"nwnw": "crop",
			"sese": "crop",
			"swsw": "crop",
		};

		// generate default state of image
		var generateImageState = function(newImage) {
			var id = getShortId();
			var lastIndex = config.startIndexAfterRender - 1;
			var fittedSizes = getContainedSizes(
				newImage.width,
				newImage.height,
				canvasState.width * config.imageScaleAfterRender,
				canvasState.height * config.imageScaleAfterRender
			);
			var tmpHandleState = {};

			for(var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].index < config.maxIndexAfterRender) {
					if (imageStates[i].index > lastIndex) {
						lastIndex = imageStates[i].index;
					}
				}
			}

			for (var i = 0; i < Object.keys(handleState).length; i++) {
				var k = Object.keys(handleState)[i];
				if (_directions.indexOf(k) > -1) {						
					tmpHandleState[k] = handleState[k];
				}
			}

			return {
				id: id,
				src: newImage.src,
				index: lastIndex + 1,
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
				clickable: true,
				editable: true,
				drawable: true,
				pivot: config.showPivotAfterRender || false,
				grid: config.showGridAfterRender || false,
				handle: tmpHandleState,
				handleEvents: {},
				filter: undefined
			}
		};

		var _containerTemplate = "";
		_containerTemplate += "<div class='canvaaas-container'>";
		_containerTemplate += "<div class='canvaaas-mirror'></div>";
		_containerTemplate += "<div class='canvaaas-rulers'>";
		_containerTemplate += "<div class='canvaaas-ruler canvaaas-direction-n'></div>";
		_containerTemplate += "<div class='canvaaas-ruler canvaaas-direction-s'></div>";
		_containerTemplate += "<div class='canvaaas-ruler canvaaas-direction-e'></div>";
		_containerTemplate += "<div class='canvaaas-ruler canvaaas-direction-w'></div>";
		_containerTemplate += "</div>";
		_containerTemplate += "<div class='canvaaas-background'></div>";
		_containerTemplate += "<div class='canvaaas-checker'></div>";
		_containerTemplate += "<div class='canvaaas-canvas'></div>";
		_containerTemplate += "</div>";

		var _imageTemplate = "";
		_imageTemplate += "<div class='canvaaas-content'><img></div>";
		_imageTemplate += "<div class='canvaaas-overlay'></div>";
		_imageTemplate += "<div class='canvaaas-pivot canvaaas-direction-x'></div>";
		_imageTemplate += "<div class='canvaaas-pivot canvaaas-direction-y'></div>";
		_imageTemplate += "<div class='canvaaas-grid canvaaas-direction-n'></div>";
		_imageTemplate += "<div class='canvaaas-grid canvaaas-direction-s'></div>";
		_imageTemplate += "<div class='canvaaas-grid canvaaas-direction-e'></div>";
		_imageTemplate += "<div class='canvaaas-grid canvaaas-direction-w'></div>";
		_imageTemplate += "<div class='canvaaas-border canvaaas-direction-n'></div>";
		_imageTemplate += "<div class='canvaaas-border canvaaas-direction-s'></div>";
		_imageTemplate += "<div class='canvaaas-border canvaaas-direction-e'></div>";
		_imageTemplate += "<div class='canvaaas-border canvaaas-direction-w'></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-n'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-e'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-s'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-w'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-ne'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-nw'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-se'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-sw'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-nn'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-ee'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-ss'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-ww'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-nene'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-nwnw'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-sese'><div class='canvaaas-handle-square'></div></div>";
		_imageTemplate += "<div class='canvaaas-handle canvaaas-direction-swsw'><div class='canvaaas-handle-square'></div></div>";

		var _directions = [
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

		var _maxWidth;
		var _maxHeight;
		var _minWidth = 1;
		var _minHeight = 1;
		var _originId = "canvaaas-" + getShortId() + "-";
		var _cloneId = "canvaaas-" + getShortId() + "-";

		var config = {};
		var eventState = {};
		var containerState = {};
		var canvasState = {};
		var handleState = {};
		var imageStates = [];
		var undoCaches = [];
		var redoCaches = [];
		var containerElement;
		var canvasElement;
		var rulerElement;
		var mirrorElement;
		var backgroundElement;
		var checkerElement;
		var windowResizeEvent;
		var windowScrollEvent;

		Object.freeze(defaultConfig);
		Object.freeze(defaultCanvasState);
		Object.freeze(defaultHandleState);

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
				try {
					var dt = e.dataTransfer;
					var files = dt.files;
					var index = files.length;
					var count = 0;
	
					if (eventState.onUpload) {
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
				} catch(err) {
					console.log(err);
					return false;
				}				
			},

			// deprecated
			startHover: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var id = getTargetId(e);
					var isTarget = e.target.classList.contains("canvaaas-image") || e.target.classList.contains("canvaaas-content");

					if (!isTarget) {
						return false;
					}

					if (config.hover) {
						config.hover(null, exportImageState(id));
					}

					// add events
					document.addEventListener("mousemove", handlers.onHover, false);
					document.addEventListener("mouseup", handlers.endHover, false);
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			// deprecated
			onHover: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var id = getTargetId(e);
					var isTarget = e.target.classList.contains("canvaaas-image") || e.target.classList.contains("canvaaas-content");
					var tmp = exportImageState(id);
					var mouseX;
					var mouseY;
					if (!chkContainerCoordinates()) {
						return false;
					}
					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else {
						return false;
					}
					
					tmp.canvasTop = containerState.top;
					tmp.canvasLeft = containerState.left;
					tmp.mouseTop = mouseX;
					tmp.mouseLeft = mouseY;

					if (!isTarget) {
						return false;	
					}
					if (config.hover) {
						config.hover(null, tmp);
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

					var isTarget = e.target.classList.contains("canvaaas-image") || e.target.classList.contains("canvaaas-content");

					if (!isTarget) {
						return false;
					}

					if (config.hover) {
						config.hover(null, null);
					}

					// remove events
					document.addEventListener("mousemove", handlers.onHover, false);
					document.addEventListener("mouseup", handlers.endHover, false);
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			click: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var id = getTargetId(e);
					var isTarget = e.target.classList.contains("canvaaas-image") || e.target.classList.contains("canvaaas-content");

					if (!isExist(id)) {
						return false;
					}
					if (!isTarget) {
						return false;
					}
					if (config.click) {
						config.click(null, exportImageState(id));
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

					var id = getTargetId(e);
					var isTarget = e.target.classList.contains("canvaaas-image") || e.target.classList.contains("canvaaas-content");

					if (!isExist(id)) {
						return false;
					}
					if (!isTarget) {
						return false;
					}
					if (config.doubleClick) {
						config.doubleClick(null, exportImageState(id));
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			rightClick: function(e) {
				try {
					var id = getTargetId(e);
					var rightClick = e.button === 2 || e.ctrlKey;
					var endFunc = function() {
						eventState.onMenu = false;
					}

					if (!rightClick) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					if (config.rightClick) {

						eventState.onMenu = true;

						config.rightClick(null, exportImageState(id), endFunc);
						return false;
					}
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			// for handle
			startClick: function(e) {
				try {
					var id = getTargetId(e);
					var state = getImageState(id);
					var handle = e.target;
					var direction = getDirection(e.target);
					var mouseX;
					var mouseY;

					// fix opened menu
					if (eventState.onMenu) {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable) {
						return false;
					}
					if (!state.clickable) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					// if (!canvasState.editable) {
					// 	return false;
					// }
					// if (!state.editable) {
					// 	return false;
					// }
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
					eventState.onClick = true;
					eventState.target = id;
					eventState.handle = handle;
					eventState.direction = direction;
					eventState.mouseX = mouseX;
					eventState.mouseY = mouseY;
					eventState.click = true;

					// add class
					addClassToImage(eventState.target, "editing");
					addClassToHandle(eventState.handle, "editing");

					// add events
					document.addEventListener("mousemove", handlers.onClick, false);
					document.addEventListener("mouseup", handlers.endClick, false);

					document.addEventListener("touchmove", handlers.onClick, false);
					document.addEventListener("touchend", handlers.endClick, false);
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

					if (Math.abs(mouseX) > 12) {
						eventState.click = false;
					} else if (Math.abs(mouseY) > 12) {
						eventState.click = false;
					}

					if (!eventState.click) {
						// remove class
						removeClassToImage(eventState.target, "editing");
						removeClassToHandle(eventState.handle, "editing");
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

					// remove class
					removeClassToImage(eventState.target, "editing");
					removeClassToHandle(eventState.handle, "editing");

					// remove events
					document.removeEventListener("mousemove", handlers.onClick, false);
					document.removeEventListener("mouseup", handlers.endClick, false);

					document.removeEventListener("touchmove", handlers.onClick, false);
					document.removeEventListener("touchend", handlers.endClick, false);

					// callback
					if (eventState.click) {
						if (config.clickHandle) {
							config.clickHandle(null, exportImageState(eventState.target), eventState.direction);
						}
					}

					// clear event state
					eventState.onClick = false;
					eventState.target = undefined;
					eventState.handle = undefined;
					eventState.direction = undefined;
					eventState.click = false;
				} catch(err) {
					console.log(err);
					return false;
				}
			},
			
			// deprecated
			touch: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			// deprecated
			doubleTouch: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startMove: function(e) {
				try {
					var id = getTargetId(e);
					var state = getImageState(id);
					var mouseX;
					var mouseY;
					var rightClick = e.button === 2 || e.ctrlKey;

					// fix osx wheeling
					if (eventState.onZoom) {
						return false;
					}
					// fix opened menu
					if (eventState.onMenu) {
						return false;
					}
					// fix right click
					if (rightClick) {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable) {
						return false;
					}
					if (!state.clickable) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					if (!canvasState.editable) {
						return false;
					}
					if (!state.editable) {
						return false;
					}
					if (typeof(e.touches) === "undefined") {
						// desktop
						mouseX = e.clientX;
						mouseY = e.clientY;
					} else if(e.touches.length === 1) {
						// mobile
						mouseX = e.touches[0].clientX;
						mouseY = e.touches[0].clientY;
					} else {
						// mobile
						return handlers.startPinchZoom(e);
					}
	
					// save event state
					eventState.onMove = true;
					eventState.target = id;
					eventState.x = state.x;
					eventState.y = state.y;
					eventState.mouseX = mouseX;
					eventState.mouseY = mouseY;
	
					// save cache
					saveUndo(eventState.target);
	
					// add class
					addClassToImage(eventState.target, "editing");
	
					// add events
					document.addEventListener("mousemove", handlers.onMove, false);
					document.addEventListener("mouseup", handlers.endMove, false);
	
					document.addEventListener("touchmove", handlers.onMove, false);
					document.addEventListener("touchend", handlers.endMove, false);
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

					// var state = getImageState(eventState.target);
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

					// check press shift
					if (onShiftKey) {
						if (Math.abs(mouseX) > Math.abs(mouseY)) {
							mouseY = 0;
						} else if (Math.abs(mouseX) < Math.abs(mouseY)) {
							mouseX = 0;
						}
					}

					// save image state
					setImageState(eventState.target, {
						x: eventState.x + mouseX,
						y: eventState.y + mouseY,
					});
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endMove: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					// remove class
					removeClassToImage(eventState.target, "editing");

					// remove events
					document.removeEventListener("mousemove", handlers.onMove, false);
					document.removeEventListener("mouseup", handlers.endMove, false);

					document.removeEventListener("touchmove", handlers.onMove, false);
					document.removeEventListener("touchend", handlers.endMove, false);

					// callback
					if (config.edit) {
						config.edit(null, exportImageState(eventState.target));
					}

					// clear event state
					eventState.onMove = false;
					eventState.target = undefined;
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startResize: function(e) {
				try {
					var id = getTargetId(e);
					var state = getImageState(id);
					var handle = e.target;
					var direction = getDirection(e.target);
					var mouseX;
					var mouseY;

					// fix osx wheeling
					if (eventState.onZoom) {
						return false;
					}
					// fix opened menu
					if (eventState.onMenu) {
						return false;
					}
					if (!state) {
						return false;
					}
					if (!canvasState.clickable) {
						return false;
					}
					if (!state.clickable) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					if (!canvasState.editable) {
						return false;
					}
					if (!state.editable) {
						return false;
					}
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

					// save event state
					eventState.onResize = true;
					eventState.target = id;
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

					// save cache
					saveUndo(eventState.target);

					// add class
					addClassToImage(eventState.target, "editing");
					addClassToHandle(eventState.handle, "editing");

					// add events
					document.addEventListener("mousemove", handlers.onResize, false);
					document.addEventListener("mouseup", handlers.endResize, false);

					document.addEventListener("touchmove", handlers.onResize, false);
					document.addEventListener("touchend", handlers.endResize, false);
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

					var state = getImageState(eventState.target);
					var onShiftKey = e.shiftKey || state.lockAspectRatio;
					var direction = eventState.direction;
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
					var scaleX = state.scaleX;
					var scaleY = state.scaleY;
					var radians = state.rotate * Math.PI / 180;;
					var cosFraction = Math.cos(radians);
					var sinFraction = Math.sin(radians);
					var mouseX;
					var mouseY;
					var scaleCropTop = eventState.cropTop / croppedH;
					var scaleCropBottom = eventState.cropBottom / croppedH;
					var scaleCropLeft = eventState.cropLeft / croppedW;
					var scaleCropRight = eventState.cropRight / croppedW;

					if (typeof(e.touches) === "undefined") {
						mouseX = e.clientX - eventState.mouseX;
						mouseY = e.clientY - eventState.mouseY;
					} else if(e.touches.length === 1) {
						mouseX = e.touches[0].clientX - eventState.mouseX;
						mouseY = e.touches[0].clientY - eventState.mouseY;
					} else {
						return false;
					}

					diffX = (mouseX * cosFraction) + (mouseY * sinFraction);
					diffY = (mouseY * cosFraction) - (mouseX * sinFraction);
					width = croppedW;
					height = croppedH;

					// fix direction
					if (scaleX === -1) {
						if (direction.indexOf("e") > -1) {
							direction = direction.replace(/e/gi, "w");
						} else if (direction.indexOf("w") > -1) {
							direction = direction.replace(/w/gi, "e");
						}
					}
					if (scaleY === -1) {
						if (direction.indexOf("n") > -1) {
							direction = direction.replace(/n/gi, "s");
						} else if (direction.indexOf("s") > -1) {
							direction = direction.replace(/s/gi, "n");
						}
					}

					if (
						direction === "n" ||
						direction === "nn"
					) {
						height -= diffY;
						if (onShiftKey) {
							width = height * aspectRatio;
						}
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else if (
						direction === "ne" ||
						direction === "nene"
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
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else if (
						direction === "e" ||
						direction === "ee"
					) {
						width += diffX;
						if (onShiftKey) {
							height = width / aspectRatio;
						}
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					} else if (
						direction === "se" ||
						direction === "sese"
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
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else if (
						direction === "s" ||
						direction === "sese"
					) {
						height += diffY;
						if (onShiftKey) {
							width = height * aspectRatio;
						}
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else if (
						direction === "sw" ||
						direction === "swsw"
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
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else if (
						direction === "w" ||
						direction === "ww"
					) {
						width -= diffX;
						if (onShiftKey) {
							height = width / aspectRatio;
						}
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					} else if (
						direction === "nw" ||
						direction === "nwnw"
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

					// save image state
					setImageState(eventState.target, {
						x: axisX,
						y: axisY,
						width: width,
						height: height,
						cropTop: cropTop,
						cropBottom: cropBottom,
						cropLeft: cropLeft,
						cropRight: cropRight
					});
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endResize: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					// remove class
					removeClassToImage(eventState.target, "editing");
					removeClassToHandle(eventState.handle, "editing");

					// remove events
					document.removeEventListener("mousemove", handlers.onResize, false);
					document.removeEventListener("mouseup", handlers.endResize, false);

					document.removeEventListener("touchmove", handlers.onResize, false);
					document.removeEventListener("touchend", handlers.endResize, false);

					// callback
					if (config.edit) {
						config.edit(null, exportImageState(eventState.target));
					}

					// clear event state
					eventState.onResize = false;
					eventState.target = undefined;
					eventState.handle = undefined;
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
					if (eventState.onMenu) {
						return false;
					}

					var id = getTargetId(e);
					var state = getImageState(id);
					var ratio = -e.deltaY * 0.001;
					var width;
					var height;
					var cropTop;
					var cropBottom;
					var cropLeft;
					var cropRight;
					
					if (!state) {
						return false;
					}
					if (!canvasState.clickable) {
						return false;
					}
					if (!state.clickable) {
						return false;
					}
					
					e.preventDefault();
					e.stopPropagation();

					if (!eventState.onZoom) {
						
						if (!canvasState.editable) {
							return false;
						}
						if (!state.editable) {
							return false;
						}

						eventState.onZoom = true;

						// save cache
						saveUndo(state.id);

						// add class
						addClassToImage(state.id, "editing");
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
					setImageState(state.id, {
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
						// clear event state
						eventState.onZoom = false;
						// remove class
						removeClassToImage(state.id, "editing");
						// callback
						if (config.edit) {
							config.edit(null, exportImageState(state.id));
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

					var id = getTargetId(e);
					var state = getImageState(id);
					var mouseX;
					var mouseY;
					var diagonal;

					if (!state) {
						return false;
					}
					if (!canvasState.clickable) {
						return false;
					}
					if (!state.clickable) {
						return false;
					}
					

					e.preventDefault();
					e.stopPropagation();

					// if (eventState.onMove) {
					// 	handlers.endMove(e);
					// }
					if (!canvasState.editable) {
						return false;
					}
					if (!state.editable) {
						return false;
					}

					mouseX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
					mouseY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
					diagonal = Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2));

					// save event state
					eventState.onZoom = true;
					eventState.target = id;
					eventState.width = state.width;
					eventState.height = state.height;
					eventState.cropTop = state.cropTop;
					eventState.cropBottom = state.cropBottom;
					eventState.cropLeft = state.cropLeft;
					eventState.cropRight = state.cropRight;
					eventState.diagonal = diagonal;

					// save cache
					saveUndo(eventState.target);

					// add class
					addClassToImage(eventState.target, "editing");

					// add events
					document.addEventListener("touchmove", handlers.onPinchZoom, false);
					document.addEventListener("touchend", handlers.endPinchZoom, false);
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onPinchZoom: function(e){
				try {
					e.preventDefault();
					e.stopPropagation();

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
					setImageState(eventState.target, {
						width: width,
						height: height,
						cropTop: cropTop,
						cropBottom: cropBottom,
						cropLeft: cropLeft,
						cropRight: cropRight,
					});
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endPinchZoom: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();
	
					// remove class
					removeClassToImage(eventState.target, "editing");
	
					// remove event
					document.removeEventListener("touchmove", handlers.onPinchZoom, false);
					document.removeEventListener("touchend", handlers.endPinchZoom, false);
	
					// callback
					if (config.edit) {
						config.edit(null, exportImageState(eventState.target));
					}
	
					// clear event state
					eventState.onZoom = false;
					eventState.target = undefined;
					
					// event propagation
					return handlers.startMove(e);
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startRotate: function(e) {
				try {
					var id = getTargetId(e);
					var state = getImageState(id);
					var handle = e.target;
					var mouseX;
					var mouseY;
					var radians;

					if (!state) {
						return false;
					}
					if (!canvasState.clickable) {
						return false;
					}
					if (!state.clickable) {
						return false;
					}
					// fix opened menu
					if (eventState.onMenu) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					// fix container offset
					if (!chkContainerCoordinates()) {
						return false;
					}
					if (!canvasState.editable) {
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

					// calculate degree
					radians = Math.atan2(state.y - mouseY, mouseX - state.x) * 180 / Math.PI;

					// save event state
					eventState.onRotate = true;
					eventState.target = id;
					eventState.handle = handle;
					eventState.rotate = state.rotate;
					eventState.radians = radians;

					// save cache
					saveUndo(eventState.target);

					// add class
					addClassToImage(eventState.target, "editing");
					addClassToHandle(eventState.handle, "editing");

					// add events
					document.addEventListener("mousemove", handlers.onRotate, false);
					document.addEventListener("mouseup", handlers.endRotate, false);

					document.addEventListener("touchmove", handlers.onRotate, false);
					document.addEventListener("touchend", handlers.endRotate, false);
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onRotate: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var state = getImageState(eventState.target);
					var onShiftKey = e.shiftKey;
					var radians;
					var rotate = eventState.rotate;
					var deg;
					var diff;
					var mouseX;
					var mouseY;
	
					if (!eventState.onRotate) {
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
	
					// calculate degree
					radians = Math.atan2(state.y - mouseY, mouseX - state.x) * 180 / Math.PI;
					diff = -((radians - eventState.radians) % 360);
					deg = rotate + diff;

					if (onShiftKey) {
						deg = Math.round(deg / 45) * 45;
					}
	
					// save image state
					setImageState(eventState.target, {
						rotate: deg
					});
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endRotate: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					// remove class
					removeClassToImage(eventState.target, "editing");
					removeClassToHandle(eventState.handle, "editing");

					// remove events
					document.removeEventListener("mousemove", handlers.onRotate, false);
					document.removeEventListener("mouseup", handlers.endRotate, false);

					document.removeEventListener("touchmove", handlers.onRotate, false);
					document.removeEventListener("touchend", handlers.endRotate, false);

					// callback
					if (config.edit) {
						config.edit(null, exportImageState(eventState.target));
					}

					// clear event state
					eventState.onRotate = false;
					eventState.handle = undefined;
					eventState.target = undefined;
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startFlip: function(e) {
				try {
					var id = getTargetId(e);
					var state = getImageState(id);
					var handle = e.target;
					var direction = getDirection(e.target);
					var diffX;
					var diffY;
					var mouseX;
					var mouseY;
					var maxDiagonal;

					if (!state) {
						return false;
					}
					if (!canvasState.clickable) {
						return false;
					}
					if (!state.clickable) {
						return false;
					}
					// fix opened menu
					if (eventState.onMenu) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					if (!canvasState.editable) {
						return false;
					}
					if (!state.editable) {
						return false;
					}
					if (!direction) {
						return false;
					}
					// fix container offset
					if (!chkContainerCoordinates()) {
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

					maxDiagonal = getDiagonal(
						state.x + diffX - mouseX,
						state.y + diffY - mouseY
					);

					// save event state
					eventState.onFlip = true;
					eventState.target = id;
					eventState.handle = handle;
					eventState.direction = direction;
					eventState.maxDiagonal = maxDiagonal;
					eventState.x = state.x + diffX;
					eventState.y = state.y + diffY;
					eventState.mouseX = mouseX;
					eventState.mouseY = mouseY;

					// save cache
					saveUndo(eventState.target);

					// add class
					addClassToImage(eventState.target, "editing");
					addClassToHandle(eventState.handle, "editing");

					// add events
					document.addEventListener("mousemove", handlers.onFlip, false);
					document.addEventListener("mouseup", handlers.endFlip, false);

					document.addEventListener("touchmove", handlers.onFlip, false);
					document.addEventListener("touchend", handlers.endFlip, false);
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onFlip: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();
	
					// var state = getImageState(eventState.target);
					var direction = eventState.direction;
					var onShiftKey = e.shiftKey;
					var degX;
					var degY;
					var mouseX;
					var mouseY;
					var maxDiagonal = eventState.maxDiagonal;
					var distanceMoved;
					var distanceFromPivot;

					if (!eventState.onFlip) {
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
	
					// mouse distance moved
					distanceMoved = getDiagonal(
						eventState.mouseX - mouseX,
						eventState.mouseY - mouseY
					);

					// distance from pivot
					distanceFromPivot = getDiagonal(
						eventState.x - mouseX,
						eventState.y - mouseY
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
					setImageState(eventState.target, {
						rotateX: degY,
						rotateY: degX
					});
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endFlip: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();

					var state = getImageState(eventState.target);
					var rotateX = state.rotateX;
					var rotateY = state.rotateY;
					var scaleX = state.scaleX;
					var scaleY = state.scaleY;
	
					if (Math.abs(rotateX) > 90) {
						scaleY = -1 * scaleY;
					}
					if (Math.abs(rotateY) > 90) {
						scaleX = -1 * scaleX;
					}
	
					// save image state
					setImageState(eventState.target, {
						rotateX: 0,
						rotateY: 0,
						scaleX: scaleX,
						scaleY: scaleY,
					});
	
					// remove class
					removeClassToImage(eventState.target, "editing");
					removeClassToHandle(eventState.handle, "editing");

					// remove events
					document.removeEventListener("mousemove", handlers.onFlip, false);
					document.removeEventListener("mouseup", handlers.endFlip, false);
	
					document.removeEventListener("touchmove", handlers.onFlip, false);
					document.removeEventListener("touchend", handlers.endFlip, false);
	
					// callback
					if (config.edit) {
						config.edit(null, exportImageState(eventState.target));
					}

					// clear event state
					eventState.onFlip = false;
					eventState.target = undefined;
					eventState.handle = undefined;
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			startCrop: function(e) {
				try {
					var id = getTargetId(e);
					var state = getImageState(id);
					var handle = e.target;
					var direction = getDirection(e.target);
					var mouseX;
					var mouseY;

					if (!state) {
						return false;
					}
					if (!canvasState.clickable) {
						return false;
					}
					if (!state.clickable) {
						return false;
					}
					// fix opened menu
					if (eventState.onMenu) {
						return false;
					}

					e.preventDefault();
					e.stopPropagation();

					if (!canvasState.editable) {
						return false;
					}
					if (!state.editable) {
						return false;
					}
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

					// save event state
					eventState.onCrop = true;
					eventState.target = id;
					eventState.handle = handle;
					eventState.direction = direction;
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
					saveUndo(eventState.target);

					// add class
					addClassToImage(eventState.target, "editing");
					addClassToHandle(eventState.handle, "editing");

					// add events
					document.addEventListener("mousemove", handlers.onCrop, false);
					document.addEventListener("mouseup", handlers.endCrop, false);

					document.addEventListener("touchmove", handlers.onCrop, false);
					document.addEventListener("touchend", handlers.endCrop, false);
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			onCrop: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();
	
					var state = getImageState(eventState.target);
					var onShiftKey = e.shiftKey;
					var direction = eventState.direction;
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
					var diffX;
					var diffY;
					var radians;
					var cosFraction;
					var sinFraction;
					var mouseX;
					var mouseY;
	
					if (!eventState.onCrop) {
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

					// fix direction
					if (scaleX === -1) {
						if (direction.indexOf("e") > -1) {
							direction = direction.replace(/e/gi, "w");
						} else if (direction.indexOf("w") > -1) {
							direction = direction.replace(/w/gi, "e");
						}
					}
					if (scaleY === -1) {
						if (direction.indexOf("n") > -1) {
							direction = direction.replace(/n/gi, "s");
						} else if (direction.indexOf("s") > -1) {
							direction = direction.replace(/s/gi, "n");
						}
					}

					radians = state.rotate * Math.PI / 180;
					cosFraction = Math.cos(radians);
					sinFraction = Math.sin(radians);
					diffX = (mouseX * cosFraction) + (mouseY * sinFraction);
					diffY = (mouseY * cosFraction) - (mouseX * sinFraction);
	
					if (
						direction === "n" ||
						direction === "nn"
					) {
						if (-diffY > cropTop) {
							diffY = -cropTop;
						}
						cropTop += diffY;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else if (
						direction === "ne" ||
						direction === "nene"
					) {
						if (-diffY > cropTop) {
							diffY = -cropTop;
						}
						if (diffX > cropRight) {
							diffX = cropRight;
						}
						cropTop += diffY;
						cropRight -= diffX;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					} else if (
						direction === "e" ||
						direction === "ee"
					) {
						if (diffX > cropRight) {
							diffX = cropRight;
						}
						cropRight -= diffX;
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					} else if (
						direction === "se" ||
						direction === "sese"
					) {
						if (diffY > cropBottom) {
							diffY = cropBottom;
						}
						if (diffX > cropRight) {
							diffX = cropRight;
						}
						cropBottom -= diffY;
						cropRight -= diffX;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					} else if (
						direction === "s" ||
						direction === "ss"
					) {
						if (diffY > cropBottom) {
							diffY = cropBottom;
						}
						cropBottom -= diffY;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
					} else if (
						direction === "sw" ||
						direction === "swsw"
					) {
						if (diffY > cropBottom) {
							diffY = cropBottom;
						}
						if (-diffX > cropLeft) {
							diffX = -cropLeft;
						}
						cropBottom -= diffY;
						cropLeft += diffX;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					} else if (
						direction === "w" ||
						direction === "ww"
					) {
						if (-diffX > cropLeft) {
							diffX = -cropLeft;
						}
						cropLeft += diffX;
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					} else if (
						direction === "nw" ||
						direction === "nwnw"
					) {
						if (-diffY > cropTop) {
							diffY = -cropTop;
						}
						if (-diffX > cropLeft) {
							diffX = -cropLeft;
						}
						cropTop += diffY;
						cropLeft += diffX;
						axisX -= 0.5 * diffY * sinFraction;
						axisY += 0.5 * diffY * cosFraction;
						axisX += 0.5 * diffX * cosFraction;
						axisY += 0.5 * diffX * sinFraction;
					} else {
						return false;
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
					setImageState(eventState.target, {
						x: axisX,
						y: axisY,
						cropTop: cropTop,
						cropBottom: cropBottom,
						cropLeft: cropLeft,
						cropRight: cropRight
					});
				} catch(err) {
					console.log(err);
					return false;
				}
			},

			endCrop: function(e) {
				try {
					e.preventDefault();
					e.stopPropagation();
	
					// remove class
					removeClassToImage(eventState.target, "editing");
					removeClassToHandle(eventState.handle, "editing");
	
					// remove events
					document.removeEventListener("mousemove", handlers.onCrop, false);
					document.removeEventListener("mouseup", handlers.endCrop, false);
	
					document.removeEventListener("touchmove", handlers.onCrop, false);
					document.removeEventListener("touchend", handlers.endCrop, false);
	
					// callback
					if (config.edit) {
						config.edit(null, exportImageState(eventState.target));
					}

					// clear event state
					eventState.onCrop = false;
					eventState.target = undefined;
					eventState.handle = undefined;
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
	
					var initialized = canvasState.originalWidth && canvasState.originalHeight;
					var oldWidth = containerState.width;
					var oldHeight = containerState.height;
					var newWidth;
					var newHeight;
					var scaleRatioX;
					var scaleRatioY;

					setContainer();
	
					if (initialized) {
						setCanvas();
	
						newWidth = containerState.width;
						newHeight = containerState.height;
						scaleRatioX = newWidth / oldWidth;
						scaleRatioY = newHeight / oldHeight;
	
						for(var i = 0; i < imageStates.length; i++) {
							var state = imageStates[i];
							// save image state
							setImageState(state.id, {
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
					}
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
		// methods start
		//
		
		function getTargetId(e) {
			try {
				var candidate;
				var found;
				var id;

				if (typeof(e.touches) === "undefined") {
					candidate = e.target;
				} else if (e.touches.length > 0) {
					for(var i = 0; i < e.touches.length; i++) {
						if (!candidate) {
							var tmp = e.touches[i].target;
							for(var j = 0; j < 2; j++) {
								if (tmp.classList.contains("canvaaas-image")) {
									candidate = e.touches[i].target;
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
						if (candidate.classList.contains("canvaaas-image")) {
							found = candidate;
						} else {
							if (candidate.parentNode) {
								candidate = candidate.parentNode;
							}
						}
					}
				}
				if (!found) {
					return false;
				}
				id = getId(found);
				return id;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getId(obj) {
			try {
				var id;
				if (!obj) {
					return false;
				}
				if (!obj.id) {
					return false;
				}
				if (obj.id.indexOf(_originId) > -1) {
					id = obj.id.replace(_originId, "");
				} else if (obj.id.indexOf(_cloneId) > -1) {
					id = obj.id.replace(_cloneId, "");
				}
				return id;
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

		function setImageState(id, newState, force) {
			try {
				var cadidate;
				if (isString(id)) {
					cadidate = toString(id);
				} else {
					return false;
				}
				if (!isObject(newState)) {
					return false;
				}

				var state = getImageState(cadidate);
				var origin = document.getElementById(_originId + cadidate);
				var clone = document.getElementById(_cloneId + cadidate);
				var state;
				var oldId;
				var newId;
				var newScaleX;
				var oldScaleX;
				var newScaleY;
				var oldScaleY;
				var newLAR;
				var oldLAR;
				var tmp;
				var updated = {};

				if (!state) {
					return false;
				}
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}

				if (isNumeric(newState.scaleX)) {
					oldScaleX = state.scaleX;
					newScaleX = toNumber(newState.scaleX);
					if (
						newScaleX !== 1 &&
						newScaleX !== -1
					) {
						newScaleX = oldScaleX
					}
					state.scaleX = newScaleX;
					updated.scaleX = true;
				}

				if (isNumeric(newState.scaleY)) {
					oldScaleY = state.scaleY;
					newScaleY = toNumber(newState.scaleY);
					if (
						newScaleY !== 1 &&
						newScaleY !== -1
					) {
						newScaleY = oldScaleY
					}
					state.scaleY = newScaleY;
					updated.scaleY = true;
				}

				// id change
				if (isString(newState.id)) {
					oldId = state.id;
					newId = toString(newState.id);
					if (!isExist(tmp)) {
						// change undo caches
						for (var i = 0; i < undoCaches.length; i++) {
							if (undoCaches[i].id === oldId) {
								undoCaches[i].id = newId;
								undoCaches[i].state.id = newId;
							}
						}
						// change redo caches
						for (var i = 0; i < redoCaches.length; i++) {
							if (redoCaches[i].id === oldId) {
								redoCaches[i].id = newId;
								redoCaches[i].state.id = newId;
							}
						}
						// change element id
						origin.id = _originId + newId;
						clone.id = _cloneId + newId;
						// change state
						state.id = newId;
						updated.id = true;
					}
				}

				if (isNumeric(newState.index)) {
					state.index = toNumber(newState.index);
					updated.index = true;
				}
				if (isNumeric(newState.x)) {
					state.x = toNumber(newState.x);
					updated.x = true;
				}
				if (isNumeric(newState.y)) {
					state.y = toNumber(newState.y);
					updated.y = true;
				}
				if (isNumeric(newState.width)) {
					state.width = toNumber(newState.width);
					updated.width = true;
				}
				if (isNumeric(newState.height)) {
					state.height = toNumber(newState.height);
					updated.height = true;
				}
				if (isNumeric(newState.rotate)) {
					state.rotate = toNumber(newState.rotate);
					updated.rotate = true;
				}
				if (isNumeric(newState.rotateX)) {
					state.rotateX = toNumber(newState.rotateX);
					updated.rotateX = true;
				}
				if (isNumeric(newState.rotateY)) {
					state.rotateY = toNumber(newState.rotateY);
					updated.rotateY = true;
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
					updated.opacity = true;
				}
				if (isBoolean(newState.visible)) {
					state.visible = toBoolean(newState.visible);
					updated.visible = true;
				}
				if (isBoolean(newState.clickable)) {
					state.clickable = toBoolean(newState.clickable);
					updated.clickable = true;
				}
				if (isBoolean(newState.editable)) {
					state.editable = toBoolean(newState.editable);
					updated.editable = true;
				}
				if (isBoolean(newState.drawable)) {
					state.drawable = toBoolean(newState.drawable);
					updated.drawable = true;
				}
				if (isNumeric(newState.cropTop)) {
					tmp = toNumber(newState.cropTop);
					if (tmp < 0) {
						state.cropTop = 0;
					} else if (tmp < state.height - (state.cropBottom + 10)) {
						state.cropTop = tmp;
					}
					updated.cropTop = true;
				}
				if (isNumeric(newState.cropBottom)) {
					tmp = toNumber(newState.cropBottom);
					if (tmp < 0) {
						state.cropBottom = 0;
					} else if (tmp < state.height - (state.cropTop + 10)) {
						state.cropBottom = tmp;
					}
					updated.cropBottom = true;
				}
				if (isNumeric(newState.cropLeft)) {
					tmp = toNumber(newState.cropLeft);
					if (tmp < 0) {
						state.cropLeft = 0;
					} else if (tmp < state.width - (state.cropRight + 10)) {
						state.cropLeft = tmp;
					}
					updated.cropLeft = true;
				}
				if (isNumeric(newState.cropRight)) {
					tmp = toNumber(newState.cropRight);
					if (tmp < 0) {
						state.cropRight = 0;
					} else if (tmp < state.width - (state.cropLeft + 10)) {
						state.cropRight = tmp;
					}
					updated.cropRight = true;
				}

				// fix flipped Y
				if (newScaleX !== oldScaleX) {
					// crop
					tmp = state.cropLeft;
					state.cropLeft = state.cropRight;
					state.cropRight = tmp;
					updated.cropLeft = true;
					updated.cropRight = true;
				}

				// fix flipped X
				if (newScaleY !== oldScaleY) {
					// crop
					tmp = state.cropTop;
					state.cropTop = state.cropBottom;
					state.cropBottom = tmp;
					updated.cropTop = true;
					updated.cropBottom = true;
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
						updated.cropTop = true;
						updated.cropBottom = true;
						updated.cropLeft = true;
						updated.cropRight = true;
						updated.width = true;
						updated.height = true;
					}
					state.lockAspectRatio = newLAR;
					updated.lockAspectRatio = true;
				}
				if (isBoolean(newState.pivot)) {
					state.pivot = toBoolean(newState.pivot);
					updated.pivot = true;
				}
				if (isBoolean(newState.grid)) {
					state.grid = toBoolean(newState.grid);
					updated.grid = true;
				}
				if (isObject(newState.handle)) {
					for (var i = 0; i < Object.keys(newState.handle).length; i++) {
						var k = Object.keys(newState.handle)[i];
						if (_directions.indexOf(k) > -1) {						
							state["handle"][k] = newState.handle[k];
						}
					}
					updated.handle = true;
				}

				if (force) {
					updated = {
						id: true,
						index: true,
						x: true,
						y: true,
						width: true,
						height: true,
						rotate: true,
						rotateX: true,
						rotateY: true,
						scaleX: true,
						scaleY: true,
						opacity: true,
						lockAspectRatio: true,
						visible: true,
						clickable: true,
						editable: true,
						drawable: true,
						grid: true,
						pivot: true,
						handle: true
					}
				}

				var res = setImage(state, updated);
				return res;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setImage(state, updated) {
			try {
				var origin = document.getElementById(_originId + state.id);
				var clone = document.getElementById(_cloneId + state.id);
				var originImg;
				var cloneImg;
				var originPivots;
				var clonePivots;
				var originGrids;
				var cloneGrids;
				var croppedW;
				var croppedH;
				var croppedT;
				var croppedL;
				var transform = "";

				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}

				originImg = origin.querySelector("img");
				cloneImg = clone.querySelector("img");

				if (!originImg) {
					return false;
				}
				if (!cloneImg) {
					return false;
				}

				originPivots = origin.querySelectorAll("div.canvaaas-pivot");
				clonePivots = clone.querySelectorAll("div.canvaaas-pivot");
				originGrids = origin.querySelectorAll("div.canvaaas-grid");
				cloneGrids = clone.querySelectorAll("div.canvaaas-grid");
				croppedW = state.width - (state.cropLeft + state.cropRight);
				croppedH = state.height - (state.cropTop + state.cropBottom);
				croppedT = state.y - (croppedH * 0.5);
				croppedL = state.x - (croppedW * 0.5);

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

				origin.style.zIndex = state.index;
				origin.style.top = croppedT + "px";
				origin.style.left = croppedL + "px";
				origin.style.width = croppedW + "px";
				origin.style.height = croppedH + "px";
				origin.style.transform = transform;

				clone.style.zIndex = state.index;
				clone.style.top = croppedT + "px";
				clone.style.left = croppedL + "px";
				clone.style.width = croppedW + "px";
				clone.style.height = croppedH + "px";
				clone.style.transform = transform;

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
				originImg.style.width = state.width + "px";
				originImg.style.height = state.height + "px";
				originImg.style.opacity = state.opacity;

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
				cloneImg.style.width = state.width + "px";
				cloneImg.style.height = state.height + "px";
				cloneImg.style.opacity = state.opacity;
				
				if (!state.visible && updated.visible) {
					if (!origin.classList.contains("hidden")) {
						origin.classList.add("hidden");
					}
					if (!clone.classList.contains("hidden")) {
						clone.classList.add("hidden");
					}
				} else {
					if (origin.classList.contains("hidden")) {
						origin.classList.remove("hidden");
					}
					if (clone.classList.contains("hidden")) {
						clone.classList.remove("hidden");
					}
				}

				if (!state.clickable && updated.clickable) {
					if (!origin.classList.contains("unclickable")) {
						origin.classList.add("unclickable");
					}
					if (!clone.classList.contains("unclickable")) {
						clone.classList.add("unclickable");
					}
				} else {
					if (origin.classList.contains("unclickable")) {
						origin.classList.remove("unclickable");
					}
					if (clone.classList.contains("unclickable")) {
						clone.classList.remove("unclickable");
					}
				}

				if (!state.editable && updated.editable) {
					if (!origin.classList.contains("uneditable")) {
						origin.classList.add("uneditable");
					}
					if (!clone.classList.contains("uneditable")) {
						clone.classList.add("uneditable");
					}
				} else {
					if (origin.classList.contains("uneditable")) {
						origin.classList.remove("uneditable");
					}
					if (clone.classList.contains("uneditable")) {
						clone.classList.remove("uneditable");
					}
				}

				if (!state.drawable && updated.drawable) {
					if (!origin.classList.contains("undrawable")) {
						origin.classList.add("undrawable");
					}
					if (!clone.classList.contains("undrawable")) {
						clone.classList.add("undrawable");
					}
				} else {
					if (origin.classList.contains("undrawable")) {
						origin.classList.remove("undrawable");
					}
					if (clone.classList.contains("undrawable")) {
						clone.classList.remove("undrawable");
					}
				}

				// set pivots
				if (updated.pivot) {
					for (var i = 0; i < originPivots.length; i++) {
						if (!state.pivot) {
							if (!originPivots[i].classList.contains("hidden")) {
								originPivots[i].classList.add("hidden");
							}
						} else {
							if (originPivots[i].classList.contains("hidden")) {
								originPivots[i].classList.remove("hidden");
							}
						}
					}
					for (var i = 0; i < clonePivots.length; i++) {
						if (!state.pivot) {
							if (!clonePivots[i].classList.contains("hidden")) {
								clonePivots[i].classList.add("hidden");
							}
						} else {
							if (clonePivots[i].classList.contains("hidden")) {
								clonePivots[i].classList.remove("hidden");
							}
						}
					}
				}

				// set grids
				if (updated.grid) {
					for (var i = 0; i < originGrids.length; i++) {
						if (!state.grid) {
							if (!originGrids[i].classList.contains("hidden")) {
								originGrids[i].classList.add("hidden");
							}
						} else {
							if (originGrids[i].classList.contains("hidden")) {
								originGrids[i].classList.remove("hidden");
							}
						}
					}
					for (var i = 0; i < cloneGrids.length; i++) {
						if (!state.grid) {
							if (!cloneGrids[i].classList.contains("hidden")) {
								cloneGrids[i].classList.add("hidden");
							}
						} else {
							if (cloneGrids[i].classList.contains("hidden")) {
								cloneGrids[i].classList.remove("hidden");
							}
						}
					}
				}

				// set handle
				if (updated.handle) {
					setHandle(state);
				}				

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setCanvasState(newState) {
			try {
				var tmp;

				if (!isObject(newState)) {
					return false;
				}
				if (isNumeric(newState.width)) {
					canvasState.originalWidth = toNumber(newState.width);
				}
				if (isNumeric(newState.height)) {
					canvasState.originalHeight = toNumber(newState.height);
				}
				if (isString(newState.filename)) {
					tmp = toString(newState.filename);
					if (!isEmpty(tmp)) {
						canvasState.filename = tmp.trim();
					}
				}
				if (isString(newState.mimetype)) {
					tmp = toString(newState.mimetype);
					if (isMimetype(tmp)) {
						canvasState.mimetype = tmp;
					}
				}
				if (isNumeric(newState.quality)) {
					tmp = toNumber(newState.quality);
					if (tmp > 1) {
						canvasState.quality = 1;
					} else if (tmp < 0) {
						canvasState.quality = 0;
					} else {
						canvasState.quality = tmp;
					}
				}
				if (isString(newState.background)) {
					tmp = toString(newState.background);
					if (isColor(tmp)) {
						canvasState.background = tmp;
					} else if (
						["alpha","unset","transparent","none"].indexOf(tmp) > -1
					) {
						canvasState.background = "transparent";
					}
				}
				if (isBoolean(newState.overlay)) {
					canvasState.overlay = toBoolean(newState.overlay);
				}
				if (isBoolean(newState.checker)) {
					canvasState.checker = toBoolean(newState.checker);
				}
				if (isBoolean(newState.clickable)) {
					canvasState.clickable = toBoolean(newState.clickable);
				}
				if (isBoolean(newState.editable)) {
					canvasState.editable = toBoolean(newState.editable);
				}
				if (isBoolean(newState.ruler)) {
					canvasState.ruler = toBoolean(newState.ruler);
				}

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setCanvas() {
			try {
				var initialized = canvasState.originalWidth && canvasState.originalHeight;
				var fittedSizes;

				if (!containerElement) {
					return false;
				}
				if (!canvasElement) {
					return false;
				}
				if (!mirrorElement) {
					return false;
				}
				if (!backgroundElement) {
					return false;
				}
				if (!checkerElement) {
					return false;
				}
				if (!rulerElement) {
					return false;
				}
				if (!initialized) {
					return false;
				}

				// calculate max sizes in container
				fittedSizes = getFittedSizes({
					width: canvasState.originalWidth,
					height: canvasState.originalHeight,
					maxWidth: containerState.width,
					maxHeight: containerState.height,
					minWidth: 0,
					minHeight: 0
				});
	
				// set styles
				canvasState.width = fittedSizes[0];
				canvasState.height = fittedSizes[1];
				canvasState.left = 0.5 * (containerState.width - fittedSizes[0]);
				canvasState.top = 0.5 * (containerState.height - fittedSizes[1]);
	
				canvasElement.style.width = canvasState.width + "px";
				canvasElement.style.height = canvasState.height + "px";
				canvasElement.style.left = canvasState.left + "px";
				canvasElement.style.top = canvasState.top + "px";
	
				mirrorElement.style.width = canvasState.width + "px";
				mirrorElement.style.height = canvasState.height + "px";
				mirrorElement.style.left = canvasState.left + "px";
				mirrorElement.style.top = canvasState.top + "px";
	
				backgroundElement.style.width = canvasState.width + "px";
				backgroundElement.style.height = canvasState.height + "px";
				backgroundElement.style.left = canvasState.left + "px";
				backgroundElement.style.top = canvasState.top + "px";
				backgroundElement.style.background = canvasState.background || "transparent";
	
				checkerElement.style.width = canvasState.width + "px";
				checkerElement.style.height = canvasState.height + "px";
				checkerElement.style.left = canvasState.left + "px";
				checkerElement.style.top = canvasState.top + "px";

				rulerElement.style.width = canvasState.width + "px";
				rulerElement.style.height = canvasState.height + "px";
				rulerElement.style.left = canvasState.left + "px";
				rulerElement.style.top = canvasState.top + "px";
	
				// set class names
				if (!canvasState.checker) {
					if (!checkerElement.classList.contains("hidden")) {
						checkerElement.classList.add("hidden");
					}
				} else {
					if (checkerElement.classList.contains("hidden")) {
						checkerElement.classList.remove("hidden");
					}
				}
	
				if (!canvasState.overlay) {
					if (!mirrorElement.classList.contains("hidden")) {
						mirrorElement.classList.add("hidden");
					}
				} else {
					if (mirrorElement.classList.contains("hidden")) {
						mirrorElement.classList.remove("hidden");
					}
				}
	
				if (!canvasState.clickable) {
					if (!canvasElement.classList.contains("unclickable")) {
						canvasElement.classList.add("unclickable");
					}
					if (!mirrorElement.classList.contains("unclickable")) {
						mirrorElement.classList.add("unclickable");
					}
				} else {
					if (canvasElement.classList.contains("unclickable")) {
						canvasElement.classList.remove("unclickable");
					}
					if (mirrorElement.classList.contains("unclickable")) {
						mirrorElement.classList.remove("unclickable");
					}
				}

				if (!canvasState.editable) {
					if (!canvasElement.classList.contains("uneditable")) {
						canvasElement.classList.add("uneditable");
					}
					if (!mirrorElement.classList.contains("uneditable")) {
						mirrorElement.classList.add("uneditable");
					}
				} else {
					if (canvasElement.classList.contains("uneditable")) {
						canvasElement.classList.remove("uneditable");
					}
					if (mirrorElement.classList.contains("uneditable")) {
						mirrorElement.classList.remove("uneditable");
					}
				}

				// ruler
				clearRuler();
				if (canvasState.ruler) {
					drawRuler();
				}

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function clearCanvas() {
			try {
				var rulers = rulerElement.querySelectorAll("div.canvaaas-ruler");

				// clear images
				for (var i = imageStates.length - 1; i >= 0; i--) {
					removeImage(imageStates[i].id);
				}

				// clear canvas state
				canvasState = {};
				copyObject(canvasState, defaultCanvasState);

				canvasElement.style.width = "";
				canvasElement.style.height = "";
				canvasElement.style.left = "";
				canvasElement.style.top = "";

				mirrorElement.style.width = "";
				mirrorElement.style.height = "";
				mirrorElement.style.left = "";
				mirrorElement.style.top = "";

				backgroundElement.style.width = "";
				backgroundElement.style.height = "";
				backgroundElement.style.left = "";
				backgroundElement.style.top = "";
				backgroundElement.style.background = "";

				checkerElement.style.width = "";
				checkerElement.style.height = "";
				checkerElement.style.left = "";
				checkerElement.style.top = "";

				rulerElement.style.width = "";
				rulerElement.style.height = "";
				rulerElement.style.left = "";
				rulerElement.style.top = "";

				// clear ruler
				clearRuler();

				// clear class names
				if (canvasElement.classList.contains("unclickable")) {
					canvasElement.classList.remove("unclickable");
				}
				if (mirrorElement.classList.contains("unclickable")) {
					mirrorElement.classList.remove("unclickable");
				}
				if (canvasElement.classList.contains("uneditable")) {
					canvasElement.classList.remove("uneditable");
				}
				if (mirrorElement.classList.contains("uneditable")) {
					mirrorElement.classList.remove("uneditable");
				}

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}			
		}

		function clearRuler() {
			try {
				var rulers = rulerElement.querySelectorAll("div.canvaaas-ruler");

				for (var i = 0; i < rulers.length; i++) {
					// clear
					rulers[i].innerHTML = "";
				}
	
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function drawRuler() {
			try {
				var rulers = rulerElement.querySelectorAll("div.canvaaas-ruler");
				var length;
				var count;
				var step;
				var style;
				var absLength;
				var absStep;
				var graduation;

				for (var i = 0; i < rulers.length; i++) {
					var d = getDirection(rulers[i]);
					// init
					if (d === "n") {
						count = Math.round((canvasState.width / 10) / 5) * 5;
						step = canvasState.width / count;
						absStep = canvasState.originalWidth / count;
						style = "left";
					} else if (d === "s") {
						count = Math.round((canvasState.width / 10) / 5) * 5;
						step = canvasState.width / count;
						absStep = canvasState.originalWidth / count;
						style = "right";
					} else if (d === "e") {
						count = Math.round((canvasState.height / 10) / 5) * 5;
						step = canvasState.height / count;
						absStep = canvasState.originalHeight / count;
						style = "bottom";
					} else if (d === "w") {
						count = Math.round((canvasState.height / 10) / 5) * 5;
						step = canvasState.height / count;
						absStep = canvasState.originalHeight / count;
						style = "top";
					} else {
						break;
					}
					// draw
					for (var j = 0; j < count + 1; j++) {
						graduation = "";
						length = step * j;
						absLength = Math.round(absStep * j);
						if (j % 5 === 0) {
							if (j === 0) {
								// first
								graduation += "<div class='canvaaas-graduation-major' style='"+style+":"+(length - 1)+"px;'>";
							} else if (j === count) {
								// last
								graduation += "<div class='canvaaas-graduation-major' style='"+style+":"+(length)+"px;'>";
							} else {
								graduation += "<div class='canvaaas-graduation-major' style='"+style+":"+(length)+"px;'>";
							}
							graduation += "<div class='canvaaas-graduation-value'>"+absLength+"</div>";
						} else {
							graduation += "<div class='canvaaas-graduation-minor' style='"+style+":"+(length)+"px;'>";
						}
						graduation += "</div>";
						rulers[i].innerHTML += graduation;
					}
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setHandleState(obj) {
			try {
				for (var i = 0; i < Object.keys(obj).length; i++) {
					var k = Object.keys(obj)[i];
					if (_directions.indexOf(k) > -1) {						
						handleState[k] = obj[k];
					}
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setHandle(state) {
			try {
				var origin = document.getElementById(_originId + state.id);
				var clone = document.getElementById(_cloneId + state.id);
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}

				var originHandles = origin.querySelectorAll("div.canvaaas-handle");
				var cloneHandles = clone.querySelectorAll("div.canvaaas-handle");

				// clear event
				for (var i = 0; i < originHandles.length; i++) {
					var d = getDirection(originHandles[i]);
					if (state["handleEvents"][d]) {
						originHandles[i].removeEventListener("mousedown", state["handleEvents"][d], false);
						originHandles[i].removeEventListener("touchstart", state["handleEvents"][d], false);
					} else {
						if (originHandles[i].classList.contains("hidden")) {
							originHandles[i].classList.remove("hidden");
						}
					}
				}
				for (var i = 0; i < cloneHandles.length; i++) {
					var d = getDirection(cloneHandles[i]);
					if (state["handleEvents"][d]) {
						cloneHandles[i].removeEventListener("mousedown", state["handleEvents"][d], false);
						cloneHandles[i].removeEventListener("touchstart", state["handleEvents"][d], false);
					} else {
						if (cloneHandles[i].classList.contains("hidden")) {
							cloneHandles[i].classList.remove("hidden");
						}
					}
				}

				// clear event container
				state.handleEvents = {};
				
				// set event container
				for (var i = 0; i < _directions.length; i++) {
					var d = _directions[i];
					if (state["handle"][d]) {
						if (state["handle"][d] === "resize") {
							state["handleEvents"][d] = handlers.startResize;
						} else if (state["handle"][d] === "crop") {
							state["handleEvents"][d] = handlers.startCrop;
						} else if (state["handle"][d] === "rotate") {
							state["handleEvents"][d] = handlers.startRotate;
						} else if (state["handle"][d] === "flip") {
							state["handleEvents"][d] = handlers.startFlip;
						} else if (state["handle"][d] === "click") {
							state["handleEvents"][d] = handlers.startClick;
						}
					}
				}

				// add event
				for (var i = 0; i < originHandles.length; i++) {
					var d = getDirection(originHandles[i]);
					if (state["handleEvents"][d]) {
						originHandles[i].addEventListener("mousedown", state["handleEvents"][d], false);
						originHandles[i].addEventListener("touchstart", state["handleEvents"][d], false);
					} else {
						if (!originHandles[i].classList.contains("hidden")) {
							originHandles[i].classList.add("hidden");
						}
					}
				}
				for (var i = 0; i < cloneHandles.length; i++) {
					var d = getDirection(cloneHandles[i]);
					if (state["handleEvents"][d]) {
						cloneHandles[i].addEventListener("mousedown", state["handleEvents"][d], false);
						cloneHandles[i].addEventListener("touchstart", state["handleEvents"][d], false);
					} else {
						if (!cloneHandles[i].classList.contains("hidden")) {
							cloneHandles[i].classList.add("hidden");
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
				var candidate;
				var clsName;
				if (isString(id)) {
					candidate = toString(id);
				} else {
					return false;
				}
				if (isString(cls)) {
					clsName = toString(cls);
				} else {
					return false;
				}
				var origin = document.getElementById(_originId + candidate);
				var clone = document.getElementById(_cloneId + candidate);
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}
				if (!origin.classList.contains(clsName)) {
					origin.classList.add(clsName);
				}
				if (!clone.classList.contains(clsName)) {
					clone.classList.add(clsName);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function removeClassToImage(id, cls) {
			try {
				var candidate;
				var clsName;
				if (isString(id)) {
					candidate = toString(id);
				} else {
					return false;
				}
				if (isString(cls)) {
					clsName = toString(cls);
				} else {
					return false;
				}
				var origin = document.getElementById(_originId + candidate);
				var clone = document.getElementById(_cloneId + candidate);
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}
				if (origin.classList.contains(clsName)) {
					origin.classList.remove(clsName);
				}
				if (clone.classList.contains(clsName)) {
					clone.classList.remove(clsName);
				}
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function addClassToHandle(handle, cls) {
			try {
				var id;
				var origin;
				var clone;
				var originHandles;
				var cloneHandles;
				var originHandle;
				var cloneHandle;
				var clsName;
				var found;
				var nextNode = handle;

				if (!handle) {
					return false;
				}

				for (var i = 0; i < 3; i++) {
					if (!found) {
						if (nextNode.classList.contains("canvaaas-image")) {
							found = nextNode;
						} else {
							if (nextNode.parentNode) {
								var tmp = nextNode.parentNode;
								nextNode = tmp;
							}
						}
					}
				}
				
				if (!found) {
					return false;
				}

				id = getId(found);
				origin = document.getElementById(_originId + id);
				clone = document.getElementById(_cloneId + id);
				clsName = handle.className;

				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}

				originHandles = origin.querySelectorAll("div.canvaaas-handle");
				cloneHandles = clone.querySelectorAll("div.canvaaas-handle");

				for (var i = 0; i < originHandles.length; i++) {
					if (originHandles[i].className === clsName) {
						originHandle = originHandles[i];
					}
				}

				for (var i = 0; i < cloneHandles.length; i++) {
					if (cloneHandles[i].className === clsName) {
						cloneHandle = cloneHandles[i];
					}
				}

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

		function removeClassToHandle(handle, cls) {
			try {
				var id;
				var origin;
				var clone;
				var originHandles;
				var cloneHandles;
				var originHandle;
				var cloneHandle;
				var clsName;
				var found;
				var nextNode = handle;

				if (!handle) {
					return false;
				}

				for (var i = 0; i < 3; i++) {
					if (!found) {
						if (nextNode.classList.contains("canvaaas-image")) {
							found = nextNode;
						} else {
							if (nextNode.parentNode) {
								var tmp = nextNode.parentNode;
								nextNode = tmp;
							}
						}
					}
				}
				
				if (!found) {
					return false;
				}

				id = getId(found);
				origin = document.getElementById(_originId + id);
				clone = document.getElementById(_cloneId + id);
				clsName = handle.className;

				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}

				originHandles = origin.querySelectorAll("div.canvaaas-handle");
				cloneHandles = clone.querySelectorAll("div.canvaaas-handle");

				for (var i = 0; i < originHandles.length; i++) {
					if (originHandles[i].className === clsName) {
						originHandle = originHandles[i];
					}
				}

				for (var i = 0; i < cloneHandles.length; i++) {
					if (cloneHandles[i].className === clsName) {
						cloneHandle = cloneHandles[i];
					}
				}

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

		function exportConfig() {
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

		function exportHandleState(id) {
			try {
				var candidate;
				if (isString(id)) {
					candidate = toString(id);
				} else {
					return false;
				}
				var state = getImageState(candidate);
				if (!state) {
					return false;
				}

				var tmp = {};
				for (var i = 0; i < Object.keys(state.handle).length; i++) {
					var k = Object.keys(state.handle)[i];
					tmp[k] = state["handle"][k];
				}
				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function exportCanvasState() {
			try {
				var tmp = {};
				var aspectRatio = getAspectRatio(canvasState.originalWidth, canvasState.originalHeight);
	
				tmp.filename = canvasState.filename;
				tmp.mimetype = canvasState.mimetype;
				tmp.quality = canvasState.quality;
				tmp.background = canvasState.background;
				tmp.overlay = canvasState.overlay;
				tmp.checker = canvasState.checker;
				tmp.clickable = canvasState.clickable;
				tmp.editable = canvasState.editable;
				tmp.ruler = canvasState.ruler;
				tmp.width = canvasState.originalWidth;
				tmp.height = canvasState.originalHeight;
				tmp.aspectRatio = "" + aspectRatio[0] + ":" + aspectRatio[1];
	
				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function exportImageState(id) {
			try {
				var tmp = {};
				var state = getImageState(id);
				var origin = document.getElementById(_originId + id);
				var clone = document.getElementById(_cloneId + id);
				var scaleRatioX = canvasState.width / canvasState.originalWidth;
				var scaleRatioY = canvasState.height / canvasState.originalHeight;
				var originalAspectRatio;
				var croppedAspectRatio;
				var aspectRatio;
				var croppedWidth = (state.width - (state.cropLeft + state.cropRight)) / scaleRatioX;
				var croppedHeight = (state.height - (state.cropTop + state.cropBottom)) / scaleRatioY;

				if (!state) {
					return false;
				}
				if (!origin) {
					return false;
				}
				if (!clone) {
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
				// tmp.croppedWidth = croppedWidth;
				// tmp.croppedHeight = croppedHeight;
				tmp.rotate = state.rotate;
				tmp.scaleX = state.scaleX;
				tmp.scaleY = state.scaleY;
				// tmp.flipX = state.scaleY < 0;
				// tmp.flipY = state.scaleX < 0;
				tmp.opacity = state.opacity;
				tmp.lockAspectRatio = state.lockAspectRatio;
				tmp.visible = state.visible;
				tmp.clickable = state.clickable;
				tmp.editable = state.editable;
				tmp.drawable = state.drawable;
				tmp.pivot = state.pivot;
				tmp.grid = state.grid;
				// tmp.filter = state.filter;
				tmp.handle = state.handle;
				// tmp.handleEvents = state.handleEvents;

				originalAspectRatio = getAspectRatio(tmp.originalWidth, tmp.originalHeight);
				croppedAspectRatio = getAspectRatio(croppedWidth, croppedHeight);
				aspectRatio = getAspectRatio(tmp.width, tmp.height);

				tmp.originalAspectRatio = "" + originalAspectRatio[0] + ":" + originalAspectRatio[1];
				tmp.croppedAspectRatio = "" + croppedAspectRatio[0] + ":" + croppedAspectRatio[1];
				tmp.aspectRatio = "" + aspectRatio[0] + ":" + aspectRatio[1];
				tmp.left = tmp.x - (0.5 * tmp.width);
				tmp.top = tmp.y - (0.5 * tmp.height);

				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function importImageState(state) {
			try {
				var tmp = {};
				var scaleRatioX = canvasState.width / canvasState.originalWidth;
				var scaleRatioY = canvasState.height / canvasState.originalHeight;

				if (!state) {
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
				if (isBoolean(state.drawable)) {
					tmp.drawable = toBoolean(state.drawable);
				}
				if (isBoolean(state.pivot)) {
					tmp.pivot = toBoolean(state.pivot);
				}
				if (isBoolean(state.grid)) {
					tmp.grid = toBoolean(state.grid);
				}
				// if (isObject(state.handle)) {
				// 	tmp.handle = state.handle;
				// }

				return tmp;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function getDataset(elem) {
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
					"drawable",
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

		function chkContainerCoordinates() {
			try {
				if (!containerElement) {
					return false;
				}
				var cont = containerElement.getBoundingClientRect();
				containerState.left = cont.left;
				containerState.top = cont.top;
	
				return true;
			} catch(err) {
				console.log(err);
				return false;
			}	
		}

		function saveUndo(id, keepRedo) {
			try {
				var state = getImageState(id);
				var origin = document.getElementById(_originId + id);
				var clone = document.getElementById(_cloneId + id);
				var copiedState = {};
				var newCache = {};
				var originCls = origin.className;
				var cloneCls = clone.className;

				copyObject(copiedState, state);
	
				newCache.id = copiedState.id;
				newCache.state = copiedState;
				newCache.originClassNames = originCls;
				newCache.cloneClassNames = cloneCls;
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
				var origin = document.getElementById(_originId + id);
				var clone = document.getElementById(_cloneId + id);
				var copiedState = {};
				var newCache = {};
				var originCls = origin.className;
				var cloneCls = clone.className;

				copyObject(copiedState, state);
	
				newCache.id = copiedState.id;
				newCache.state = copiedState;
				newCache.originClassNames = originCls;
				newCache.cloneClassNames = cloneCls;
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
				var origin = document.getElementById(_originId + id);
				var clone = document.getElementById(_cloneId + id);

				saveRedo(id);

				setImageState(id, recent.state);

				origin.className = recent.originClassNames;
				clone.className = recent.cloneClassNames;

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
				var origin = document.getElementById(_originId + id);
				var clone = document.getElementById(_cloneId + id);

				// keep redo
				saveUndo(id, true);
	
				setImageState(id, recent.state);

				origin.className = recent.originClassNames;
				clone.className = recent.cloneClassNames;

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		// asynchronous
		function drawCanvas(options, canvState, imgStates, cb) {
			try {
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");
				var canvasSizes;
				var filename = canvasState.filename || "untitled";
				var mimetype = canvasState.mimetype || "image/png";
				var quality = canvasState.quality || 0.92;
				var background = canvasState.background || "#FFFFFF";
				var maxWidth = canvState.width;
				var maxHeight = canvState.height;
				var filter;
				var scaleRatioX = 1;
				var scaleRatioY = 1;
				var convertedImgStates = [];
				var result = {};
				var index;
				var count;
				var tmp;

				if (isObject(options)) {
					if (isString(options.filename)) {
						tmp = toString(options.filename);
						if (!isEmpty(tmp)) {
							filename = tmp;
						}
					}
					if (isString(options.mimetype)) {
						tmp = toString(options.mimetype);
						if (isMimetype(tmp)) {
							mimetype = tmp;
						}
					}
					if (isNumeric(options.quality)) {
						tmp = toNumber(options.quality);
						if (tmp > 1) {
							quality = 1;
						} else if (tmp < 0) {
							quality = 0;
						} else {
							quality = tmp;
						}
					}
					if (isString(options.background)) {
						tmp = toString(options.background);
						if (isColor(tmp)) {
							background = tmp;
						}
					}
					if (isNumeric(options.width)) {
						maxWidth = toNumber(options.width);
					}
					if (isNumeric(options.height)) {
						maxHeight = toNumber(options.height);
					}
					if (isFunction(options.filter)) {
						filter = options.filter;
					}
				}

				canvasSizes = getContainedSizes(
					canvState.width,
					canvState.height,
					maxWidth,
					maxHeight
				);
				
				// fix canvas resized
				scaleRatioX = canvasSizes[0] / canvState.width;
				scaleRatioY = canvasSizes[1] / canvState.height;

				for (var i = 0; i < imgStates.length; i++) {
					try {
						var obj = {};
						var chk = true;

						if (isString(imgStates[i].src)) {
							obj.src = toString(imgStates[i].src);
						} else if (isString(imgStates[i].path)) {
							obj.src = toString(imgStates[i].path);
						} else if (isString(imgStates[i].url)) {
							obj.src = toString(imgStates[i].url);
						} else {
							chk = false;
						}
						if (isNumeric(imgStates[i].x)) {
							obj.x = toNumber(imgStates[i].x) * scaleRatioX;
						} else {
							chk = false;
						}
						if (isNumeric(imgStates[i].y)) {
							obj.y = toNumber(imgStates[i].y) * scaleRatioY;
						} else {
							chk = false;
						}
						if (isNumeric(imgStates[i].width)) {
							obj.width = toNumber(imgStates[i].width) * scaleRatioX;
						} else {
							chk = false;
						}
						if (isNumeric(imgStates[i].height)) {
							obj.height = toNumber(imgStates[i].height) * scaleRatioY;
						} else {
							chk = false;
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
						if (isFunction(imgStates[i].filter)) {
							obj.filter = imgStates[i].filter;
						} else {
							obj.filter = null;
						}

						if (chk) {
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
		function drawImage(canv, options, cb) {
			var newImage = new Image();
			newImage.onerror = function(err) {
				return cb(err);
			}
			newImage.onload = function(e) {
				var ctx = canv.getContext("2d");
				var axisX = options.x;
				var axisY = options.y;
				var width = options.width;
				var height = options.height;
				var rotate = options.rotate;
				var scaleX = options.scaleX;
				var scaleY = options.scaleY;
				var opacity = options.opacity;
				var cropTop = options.cropTop;
				var cropBottom = options.cropBottom;
				var cropLeft = options.cropLeft;
				var cropRight = options.cropRight;
				var filter = options.filter;
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
					width: width,
					height: height,
					maxWidth: _maxWidth,
					maxHeight: _maxHeight,
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
					maxWidth: _maxWidth,
					maxHeight: _maxHeight,
					rotate: rotate,
					scaleX: scaleX,
					scaleY: scaleY,
					opacity: opacity
				});

				// apply filter
				if (filter) {
					var tmpCtx = rotatedCanvas.getContext("2d");
					var imageData = tmpCtx.getImageData(0, 0, rotatedCanvas.width, rotatedCanvas.height);
					var filteredImageData = getFilteredImageData(imageData, filter);

					tmpCtx.clearRect(0, 0, rotatedCanvas.width, rotatedCanvas.height);
					tmpCtx.putImageData(filteredImageData, 0, 0);
				}

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
			newImage.src = options.src;
		}

		function getResizedCanvas(img, options) {
			try {
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");
				var width = options.width;
				var height = options.height;
				var maxWidth = options.maxWidth;
				var maxHeight = options.maxHeight;
				var dx;
				var dy;
				var dw;
				var dh;

				var fittedSizes = getFittedSizes({
					width: width,
					height: height,
					maxWidth: maxWidth,
					maxHeight: maxHeight,
					minWidth: _minWidth,
					minHeight: _minHeight
				});
	
				canvas.width = Math.floor(fittedSizes[0]);
				canvas.height = Math.floor(fittedSizes[1]);
	
				ctx.save();
				ctx.fillStyle = "transparent";
				ctx.imageSmoothingQuality = "low";
				ctx.imageSmoothingEnabled = false;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
	
				dx = 0;
				dy = 0;
				dw = Math.floor(canvas.width);
				dh = Math.floor(canvas.height);
	
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

		function getCroppedCanvas(canv, options) {
			try {
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");
				var cropTop = options.cropTop;
				var cropBottom = options.cropBottom;
				var cropLeft = options.cropLeft;
				var cropRight = options.cropRight;
				var scaleX = options.scaleX;
				var scaleY = options.scaleY;
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
	
				var croppedWidth = canv.width - (cropLeft + cropRight);
				var croppedHeight = canv.height - (cropTop + cropBottom);

				canvas.width = Math.floor(croppedWidth);
				canvas.height = Math.floor(croppedHeight);

				ctx.save();
				ctx.fillStyle = "transparent";
				ctx.imageSmoothingQuality = "low";
				ctx.imageSmoothingEnabled = false;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
	
				sx = Math.floor(cropLeft);
				sy = Math.floor(cropTop);
				sw = Math.floor(canvas.width);
				sh = Math.floor(canvas.height);
				dx = 0;
				dy = 0;
				dw = Math.floor(canvas.width);
				dh = Math.floor(canvas.height);
	
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

		function getRotatedCanvas(canv, options) {
			try {
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");
				var maxWidth = options.maxWidth;
				var maxHeight = options.maxHeight;
				var opacity = options.opacity;
				var rotate = options.rotate;
				var scaleX = options.scaleX;
				var scaleY = options.scaleY;
				var width = canv.width;
				var height = canv.height;
				var sx;
				var sy;
				var sw;
				var sh;
				var dx;
				var dy;
				var dw;
				var dh;

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
					minWidth: 0,
					minHeight: 0
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

				sx = 0;
				sy = 0;
				sw = Math.floor(width);
				sh = Math.floor(height);
				dx = -Math.floor(width * 0.5);
				dy = -Math.floor(height * 0.5);
				dw = Math.floor(width);
				dh = Math.floor(height);
	
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
					var arr = filterFunc(data[i], data[i + 1], data[i + 2], data[i + 3]);
					// return [red, green, blue, alpha];
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

		// var luma = r * 0.2126 + g * 0.7152 + b * 0.0722;
		// asynchronous
		function applyFilter(id, filterFunc, cb) {
			var state = getImageState(id);
			var origin = document.getElementById(_originId + id);
			var clone = document.getElementById(_cloneId + id);

			if (!state) {
				return false;
			}
			if (!origin) {
				return false;
			}
			if (!clone) {
				return false;
			}

			var originImg = origin.querySelector("img");
			var cloneImg = clone.querySelector("img");

			if (!originImg) {
				return false;
			}
			if (!cloneImg) {
				return false;
			}

			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			var img = new Image();
			var tmp;

			if (state.filter) {
				tmp = originImg.src;
			}

			img.onerror = function(err) {
				cb(err);
				return false;
			}
			img.onload = function() {
				canvas.width = img.width;
				canvas.height = img.height;

				ctx.drawImage(img, 0, 0);

				var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				var filteredImageData = getFilteredImageData(imageData, filterFunc);

				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.putImageData(filteredImageData, 0, 0);

				var base64 = canvas.toDataURL('image/jpeg', 0.72);

				originImg.src = base64;
				// cloneImg.src = base64;

				state.filter = filterFunc;

				if (tmp) {
					// remove cache
					window.URL.revokeObjectURL(tmp);
				}

				cb(null, true);
			}
			img.src = state.src;
		}

		function removeFilter(id) {
			var state = getImageState(id);
			var origin = document.getElementById(_originId + id);
			var clone = document.getElementById(_cloneId + id);

			if (!state) {
				return false;
			}
			if (!origin) {
				return false;
			}
			if (!clone) {
				return false;
			}

			var originImg = origin.querySelector("img");
			var cloneImg = clone.querySelector("img");

			if (!originImg) {
				return false;
			}
			if (!cloneImg) {
				return false;
			}

			var tmp = originImg.src;

			originImg.src = state.src;
			state.filter = undefined;

			// remove cache
			window.URL.revokeObjectURL(tmp);
			
			return true;
		}

		// asynchronous
		function renderImage(file, exportedState, cb) {
			var initialized = canvasState.originalWidth && canvasState.originalHeight;
			var newImage = new Image();
			var src;

			try {
				// check file or url
				if (isObject(file)) {
					// file
					src = window.URL.createObjectURL(file);
					// check mimetype
					if (config.allowedMimeTypesForUpload.indexOf(file.type) < 0) {
						if (cb) {
							cb("File not allowed");
						}
						return false;
					}
				} else if (isString(file)) {
					// url
					src = file;
					// check mimetype
					if (config.allowedMimeTypesForUpload.indexOf(getMimetype(file)) < 0) {
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
				var newOrigin = document.createElement("div");
				var newClone = document.createElement("div");
				var additionalState = {};

				// initialize canvas
				if (!initialized) {
					canvasState.originalWidth = newImage.width;
					canvasState.originalHeight = newImage.height;
					setCanvas();
				}

				// create origin element
				newOrigin.classList.add("canvaaas-image");
				newOrigin.id = _originId + state.id;
				newOrigin.innerHTML = _imageTemplate;
				newOrigin.querySelector("img").src = newImage.src;

				// create clone element
				newClone.classList.add("canvaaas-image");
				newClone.id = _cloneId + state.id;
				newClone.innerHTML = _imageTemplate;
				newClone.querySelector("img").src = newImage.src;

				// set events
				newOrigin.addEventListener("contextmenu", handlers.rightClick, false);
				// newOrigin.addEventListener("dblclick", handlers.doubleClick, false); // deprecated
				newOrigin.addEventListener("click", handlers.click, false);
				newOrigin.addEventListener("touchstart", handlers.click, false);
				// newOrigin.addEventListener("mouseover", handlers.startHover, false); // deprecated
				newOrigin.addEventListener("mousedown", handlers.startMove, false);
				newOrigin.addEventListener("touchstart", handlers.startMove, false);
				newOrigin.addEventListener("wheel", handlers.startWheelZoom, false);

				newClone.addEventListener("contextmenu", handlers.rightClick, false);
				// newClone.addEventListener("dblclick", handlers.doubleClick, false); // deprecated
				newClone.addEventListener("click", handlers.click, false);
				newClone.addEventListener("touchstart", handlers.click, false);
				// newClone.addEventListener("mouseover", handlers.startHover, false); // deprecated
				newClone.addEventListener("mousedown", handlers.startMove, false);
				newClone.addEventListener("touchstart", handlers.startMove, false);
				newClone.addEventListener("wheel", handlers.startWheelZoom, false);

				canvasElement.appendChild(newOrigin);
				mirrorElement.appendChild(newClone);

				imageStates.push(state);

				// save image state
				if (isObject(exportedState)) {
					additionalState = importImageState(exportedState);
				}
				setImageState(state.id, additionalState, true);

				if (cb) {
					cb(null, state.id);
				}
			}

			// start loading
			newImage.src = src;
		}

		function removeImage(id) {
			try {
				var state = getImageState(id);
				var origin = document.getElementById(_originId + id);
				var clone = document.getElementById(_cloneId + id);
				var src = origin.querySelector("img").src;

				if (!state) {
					return false;
				}
				if (!origin) {
					return false;
				}
				if (!clone) {
					return false;
				}

				// remove element
				origin.parentNode.removeChild(origin);
				clone.parentNode.removeChild(clone);

				// remove image state
				for (var i = 0; i < imageStates.length; i++) {
					if (imageStates[i].id === id) {
						imageStates.splice(i, 1);
					}
				}

				// fix error
				// setTimeout(function(){}, 128);

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

				window.URL.revokeObjectURL(src);

				return true;
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		function setContainer() {
			try {
				var aspectRatio = config.aspectRatioOfContainer;
				var width;
				var height;
				var fittedSizes;
				var scrollBarWidth;

				if (!containerElement) {
					return false;
				}

				// reset container size
				containerElement.style.width = "";
				containerElement.style.height = "";

				width = containerElement.offsetWidth;
				height = containerElement.offsetWidth / aspectRatio;

				fittedSizes = getFittedSizes({
					width: width,
					height: height,
					maxWidth: config.maxWidthOfContainer || 8388607,
					maxHeight: config.maxHeightOfContainer || 8388607,
					minWidth: 0,
					minHeight: 0
				});

				containerState.width = fittedSizes[0];
				containerState.height = fittedSizes[1];
				containerState.left = containerElement.getBoundingClientRect().left;
				containerState.top = containerElement.getBoundingClientRect().top;

				containerElement.style.width = containerState.width + "px";
				containerElement.style.height = containerState.height + "px";

				if (hasScrollbar()) {
					scrollBarWidth = getScrollbarWidth();

					containerState.width -= scrollBarWidth;
					containerState.height = containerState.width / aspectRatio;

					containerElement.style.width = containerState.width + "px";
					containerElement.style.height = containerState.height + "px";
				}

				return true;
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

		function getFittedSizes(options) {
			try {
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
				for (var i = 0; i < _directions.length; i++) {
					if (elem.classList.contains("canvaaas-direction-" + _directions[i])) {
						found = _directions[i];
					}
				}
				return found;
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
	
				_maxWidth = maxLength;
				_maxHeight = maxLength;
	
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
				return candidate.trim() === true;
			} else if (Array.isArray(candidate)) {
				return candidate.length > 0;
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
			if (Array.isArray(str)) {
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
				switch(ext) {
					case "html":
					case "htm":
					case "shtml":
						return "text/html";
					case "css":
						return "text/css";
					case "xml":
						return "text/xml";
					case "gif":
						return "image/gif";
					case "jpeg":
					case "jpg":
						return "image/jpeg";
					case "js":
						return "application/x-javascript";
					case "atom":
						return "application/atom+xml";
					case "rss":
						return "application/rss+xml";
					case "mml":
						return "text/mathml";
					case "txt":
						return "text/plain";
					case "jad":
						return "text/vnd.sun.j2me.app-descriptor";
					case "wml":
						return "text/vnd.wap.wml";
					case "htc":
						return "text/x-component";
					case "png":
						return "image/png";
					case "tif":
					case "tiff":
						return "image/tiff";
					case "wbmp":
						return "image/vnd.wap.wbmp";
					case "ico":
						return "image/x-icon";
					case "jng":
						return "image/x-jng";
					case "bmp":
						return "image/x-ms-bmp";
					case "svg":
						return "image/svg+xml";
					case "webp":
						return "image/webp";
					case "jar":
					case "war":
					case "ear":
						return "application/java-archive";
					case "hqx":
						return "application/mac-binhex40";
					case "doc":
						return "application/msword";
					case "pdf":
						return "application/pdf";
					case "ps":
					case "eps":
					case "ai":
						return "application/postscript";
					case "rtf":
						return "application/rtf";
					case "xls":
						return "vnd.ms-excel";
					case "ppt":
						return "application/vnd.ms-powerpoint";
					case "wmlc":
						return "application/vnd.wap.wmlc";
					case "kml":
						return "application/vnd.google-earth.kml+xml";
					case "kmz":
						return "application/vnd.google-earth.kmz";
					case "7z":
						return "application/x-7z-compressed";
					case "cco":
						return "application/x-cocoa";
					case "jardiff":
						return "application/x-java-archive-diff";
					case "jnlp":
						return "application/x-java-jnlp-file";
					case "run":
						return "application/x-makeself";
					case "pl":
					case "pm":
						return "application/x-perl";
					case "prc":
					case "pdb":
						return "application/x-pilot";
					case "rar":
						return "application/x-rar-compressed";
					case "rpm":
						return "application/x-redhat-package-manager";
					case "sea":
						return "application/x-sea";
					case "swf":
						return "application/x-shockwave-flash";
					case "sit":
						return "application/x-stuffit";
					case "tcl":
					case "tk":
						return "application/x-tcl";
					case "der":
					case "pem":
					case "crt":
						return "application/x-x509-ca-cert";
					case "xpi":
						return "application/x-xpinstall";
					case "xhtml":
						return "application/xhtml+xml";
					case "zip":
						return "application/zip";
					case "bin":
					case "exe":
					case "dll":
					case "deb":
					case "dmg":
					case "eot":
					case "iso":
					case "img":
					case "msi":
					case "msp":
					case "msm":
						return "application/octet-stream";
					case "mid":
					case "midi":
					case "kar":
						return "audio/midi";
					case "audio/mpeg":
						return "audio/mpeg";
					case "ogg":
						return "audio/ogg";
					case "ra":
						return "audio/x-realaudio";
					case "3gpp":
					case "3gp":
						return "video/3gpp";
					case "mpeg":
					case "mpg":
						return "video/mpeg";
					case "mov":
						return "video/quicktime";
					case "flv":
						return "video/x-flv";
					case "mng":
						return "video/x-mng";
					case "asx":
					case "asf":
						return "video/x-ms-asf";
					case "wmv":
						return "video/x-ms-wmv";
					case "avi":
						return "video/x-msvideo";
					case "m4v":
					case "mp4":
						return "video/mp4";
					default:
						return false;
				}
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

		function debugCanvas(base64) {
			try {
				var image = new Image();
				image.src = base64;
				image.style.display = "block";
				image.style.position = 'absolute';
				image.style.top = '50%';
				image.style.left = '50%';
				image.style.transform = 'translate(-50%, -50%)';
				image.style.width = '256px';
				image.style.height = '256px';
				image.style.objectFit = "contain";
				image.style.objectPosition = "50% 50%";
				image.style.border = "2px dashed #FFFFFF";

				var newTab = window.open(base64);
				newTab.document.write(image.outerHTML);
				newTab.document.body.style.backgroundColor = '#000000';
				newTab.document.body.style.padding = '24px';
				newTab.document.body.style.position = 'relative';

				window.URL.revokeObjectURL(base64);
			} catch(err) {
				console.log(err);
				return false;
			}
		}

		//
		// exports start
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
				if (!maxCanvasSizes) {
					_maxWidth = 4096;
					_maxHeight = 4096;
				} else {
					_maxWidth = maxCanvasSizes.maxWidth;
					_maxHeight = maxCanvasSizes.maxHeight;
				}
				console.log("canvaaas response time: " + maxCanvasSizes.responseTime + " ms");
				console.log("canvaaas max area: " + _maxWidth + " x " + _maxHeight + " px");

				// set template
				target.innerHTML = _containerTemplate;
	
				// set elements
				containerElement = target.querySelector("div.canvaaas-container");
				canvasElement = target.querySelector("div.canvaaas-canvas");
				mirrorElement = target.querySelector("div.canvaaas-mirror");
				backgroundElement = target.querySelector("div.canvaaas-background");
				checkerElement = target.querySelector("div.canvaaas-checker");
				rulerElement = target.querySelector("div.canvaaas-rulers");
	
				// set container
				setContainer();

				// set events
				windowResizeEvent = handlers.resizeWindow;
				// windowResizeEvent = handlers.debounce( handlers.resizeWindow, 300 );
				window.addEventListener("resize", windowResizeEvent, false);

				// windowScrollEvent = handlers.scrollWindow;
				// windowScrollEvent = handlers.debounce( handlers.scrollWindow, 300 );
				// window.addEventListener("scroll", windowScrollEvent, false);

				document.addEventListener("touchstart", handlers.fixPinchZoom, false);

				// drag and drop upload event
				canvasElement.addEventListener('dragenter', handlers.stopEvents, false);
				canvasElement.addEventListener('dragleave', handlers.stopEvents, false);
				canvasElement.addEventListener('dragover', handlers.stopEvents, false);
				canvasElement.addEventListener('drop', handlers.stopEvents, false);
				canvasElement.addEventListener('drop', handlers.drop, false);

				// callback
				if (cb) {
					cb(null, exportConfig());
				}
				return exportConfig();
			} catch(err) {
				cb(err);
				return false;
			}
		}

		myObject.destroy = function(cb){
			try {
				// remove event
				window.removeEventListener("resize", windowResizeEvent, false);
				// window.removeEventListener("scroll", windowScrollEvent, false);

				// remove container element
				containerElement.parentNode.removeChild(containerElement);

				// clear states
				config = {};
				eventState = {};
				containerState = {};
				canvasState = {};
				handleState = {};
				imageStates = [];
				undoCaches = [];
				redoCaches = [];
				
				// clear elements
				containerElement = undefined;
				canvasElement = undefined;
				mirrorElement = undefined;
				backgroundElement = undefined;
				checkerElement = undefined;

				// clear events
				windowResizeEvent = undefined;
				windowScrollEvent = undefined;

				// reset ID
				_originId = "canvaaas-" + getShortId() + "-";
				_cloneId = "canvaaas-" + getShortId() + "-";
				_maxWidth = undefined;
				_maxHeight = undefined;

				// reset default states
				copyObject(config, defaultConfig);
				copyObject(canvasState, defaultCanvasState);
				copyObject(handleState, defaultHandleState);

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
					config.upload("Argument `imageFiles` is not object");
				}
				if (cb) {
					cb("Argument `imageFiles` is not object");
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

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderImage(imageFiles[count], null, function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
						} else {
							if (config.upload) {
								config.upload(null, exportImageState(res));
							}
							result.push(exportImageState(res))
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
					config.upload("Argument `imageUrls` is not array");
				}
				if (cb) {
					cb("Argument `imageUrls` is not array");
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
						} else {
							if (config.upload) {
								config.upload(null, exportImageState(res));
							}
							result.push(exportImageState(res))
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
					config.upload("Argument `exportedStates` is not array");
				}
				if (cb) {
					cb("Argument `exportedStates` is not array");
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

			eventState.onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					var importedState = importImageState(exportedStates[count]);
					if (!importedState) {
						if (config.upload) {
							config.upload("State not found");
						}
						count++;
						recursiveFunc();
						return false;
					}
					renderImage(importedState.src, importedState, function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
						} else {
							if (config.upload) {
								config.upload(null, exportImageState(res));
							}
							result.push(exportImageState(res))
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
			if (!isArray(imgElements)) {
				if (config.upload) {
					config.upload("Argument `imgElements` is not array");
				}
				if (cb) {
					cb("Argument `imgElements` is not array");
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
					var attrs = getDataset(imgElements[count]);
					var importedState = importImageState(attrs);
					var src = imgElements[count].src || importedState.src;
					renderImage(src, importedState, function(err, res) {
						if (err) {
							if (config.upload) {
								config.upload(err);
							}
						} else {
							if (config.upload) {
								config.upload(null, exportImageState(res));
							}
							result.push(exportImageState(res))
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
					cb("Argument `query` is not object");
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
					founds.push(
						exportImageState(imageStates[i].id)
					);
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

		myObject.addClass = function(id, cls, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isString(cls)) {
				if (config.edit) {
					config.edit("Argument `cls` is not string");
				}
				if (cb) {
					cb("Argument `cls` is not string");
				}
				return false;
			}

			// test
			// save cache
			saveUndo(id);

			var res = addClassToImage(id, cls);
			if (!res) {
				if (config.edit) {
					config.edit("Unknown error occurred");
				}
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}

			// callback
			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.removeClass = function(id, cls, cb) {
			if (!isExist(id)) {
				if (config.edit) {
					config.edit("Image not found");
				}
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isString(cls)) {
				if (config.edit) {
					config.edit("Argument `cls` is not string");
				}
				if (cb) {
					cb("Argument `cls` is not string");
				}
				return false;
			}

			// test
			// save cache
			saveUndo(id);

			var res = removeClassToImage(id, cls);
			if (!res) {
				if (config.edit) {
					config.edit("Unknown error occurred");
				}
				if (cb) {
					cb("Unknown error occurred");
				}
				return false;
			}

			// callback
			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		/*
			newState = {
				id
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
				drawable
				grid
				pivot
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
					config.edit("Argument `newState` is not object");
				}
				if (cb) {
					cb("Argument `newState` is not object");
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
			if (!state.editable) {
				if (config.edit) {
					config.edit("You are not allowed to edit this image by image settings");
				}
				if (cb) {
					cb("You are not allowed to edit this image by image settings");
				}
				return false;
			}

			if (isString(updates.id)) {
				if (isExist(toString(updates.id))) {
					if (config.edit) {
						config.edit("ID duplicated");
					}
					if (cb) {
						cb("ID duplicated");
					}
					return false;
				}
			} else {
				updates.id = id
			}
			
			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, updates);
			// callback
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not numeric");
				}
				if (cb) {
					cb("Argument `n` is not numeric");
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
			if (!state.editable) {
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
			setImageState(id, {
				x: state.x + toNumber(n)
			});
			// callback
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not numeric");
				}
				if (cb) {
					cb("Argument `n` is not numeric");
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
			if (!state.editable) {
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
			setImageState(id, {
				y: state.y + toNumber(n)
			});
			// callback
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not numeric");
				}
				if (cb) {
					cb("Argument `n` is not numeric");
				}
				return false;
			}

			var state = getImageState(id);
			var ratio = toNumber(n);

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

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
				width: state.width * ratio,
				height: state.height * ratio,
				cropTop: state.cropTop * ratio,
				cropBottom: state.cropBottom * ratio,
				cropLeft: state.cropLeft * ratio,
				cropRight: state.cropRight * ratio,
			});
			// callback
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

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
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
			setImageState(id, {
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not numeric");
				}
				if (cb) {
					cb("Argument `n` is not numeric");
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
			setImageState(id, {
				rotate: state.rotate + toNumber(n)
			});
			// callback
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
			setImageState(id, {
				scaleY: state.scaleY * -1
			});
			// callback
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
			setImageState(id, {
				scaleX: state.scaleX * -1
			});
			// callback
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not numeric");
				}
				if (cb) {
					cb("Argument `n` is not numeric");
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
			setImageState(id, {
				opacity: state.opacity + toNumber(n)
			});
			// callback
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
			if (!isNumeric(n)) {
				if (config.edit) {
					config.edit("Argument `n` is not numeric");
				}
				if (cb) {
					cb("Argument `n` is not numeric");
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
			setImageState(id, {
				index: state.index + toNumber(n)
			});
			// callback
			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
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

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
				lockAspectRatio: state.lockAspectRatio === false
			});
			// callback
			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
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

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
				visible: state.visible === false
			});
			// callback
			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
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

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
				clickable: state.clickable === false
			});
			// callback
			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
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

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
				editable: state.editable === false
			});
			// callback
			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
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

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
				drawable: state.drawable === false
			});
			// callback
			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
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

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
				pivot: state.pivot === false
			});
			// callback
			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
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

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
				grid: state.grid === false
			});
			// callback
			if (config.edit) {
				config.edit(null, exportImageState(id));
			}
			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.handle = function(id, newHandle, cb) {
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (!isObject(newHandle)) {
				if (cb) {
					cb("Argument `newHandle` is not object");
				}
				return false;
			}

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
				handle: newHandle
			});
			// callback
			if (cb) {
				cb(null, exportHandleState(id));
			}
			return exportHandleState(id);
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

			var state = getImageState(id);
			var fittedSizes = getContainedSizes(
				state.originalWidth,
				state.originalHeight,
				canvasState.width * config.imageScaleAfterRender,
				canvasState.height * config.imageScaleAfterRender,
			);

			// save cache
			saveUndo(id);
			// save image state
			setImageState(id, {
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
				clickable: true,
				editabled: true,
				drawable: true,
				cropTop: 0,
				cropBottom: 0,
				cropLeft: 0,
				cropRight: 0,
				grid: config.showGridAfterRender || false,
				pivot: config.showPivotAfterRender || false,
			});
			// callback
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

			var state = getImageState(id);
			var tmp = exportImageState(id);

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

		myObject.handleAll = function(newHandle, cb) {
			if (!isObject(newHandle)) {
				if (cb) {
					cb("Argument `newHandle` is not object");
				}
				return false;
			}

			for (var i = 0; i < imageStates.length; i++) {
				// save cache
				// saveUndo(id);

				// save image state
				setImageState(imageStates[i].id, {
					handle: newHandle
				});
			}

			// set global handle state
			setHandleState(newHandle);

			// callback
			if (cb) {
				cb(null, true);
			}
			return true;
		}

		// 
		// filter (test)
		// 

		myObject.filter = function(id, newFunction, cb) {
			if (!isExist(id)) {
				if (cb) {
					cb("Image not found");
				}
				return false;
			}
			if (
				!isFunction(newFunction) &&
				newFunction !== null &&
				newFunction !== false
			) {
				if (cb) {
					cb("Argument `newFunction` is not function or null or false");
				}
				return false;
			}

			var state = getImageState(id);

			if (newFunction === null || newFunction === false) {

				removeFilter(id);

				if (cb) {
					cb(null, exportImageState(id));
				}
				return false;
			}

			applyFilter(id, newFunction, function(err, res) {
				if (err) {
					if (config.edit) {
						config.edit(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}
				if (cb) {
					cb(null, exportImageState(id));
				}
				return exportImageState(id);
			});
		}

		//
		// config
		//

		myObject.config = function(newConfig, cb) {
			if (!isObject(newConfig)) {
				if (cb) {
					cb("Argument `newConfig` is not object");
				}
				return false;
			}

			// set config
			copyObject(config, newConfig);

			// check cache level
			if (undoCaches.length > config.cacheLevels) {
				undoCaches.splice(-config.cacheLevels);
				redoCaches = [];
			}

			// check container
			setContainer();
			
			var initialized = canvasState.originalWidth && canvasState.originalHeight;
			if (initialized) {
				setCanvas();
			}

			if (cb) {
				cb(null, exportConfig());
			}
			return exportConfig();
		}

		//
		// canvas
		//

		myObject.new = function(options, cb) {
			var containerInitialized = containerState.width && containerState.height;
			var canvaInitialized = canvasState.originalWidth && canvasState.originalHeight;
			if (!containerInitialized) {
				if (cb) {
					cb("Container has been not initialized");
				}
				return false;
			}
			if (canvaInitialized) {
				if (cb) {
					cb("Canvas already initialized");
				}
				return false;
			}
			if (!isObject(options)) {
				if (cb) {
					cb("Argument `options` is not object");
				}
				return false;
			}
			if (!options.width === undefined) {
				if (cb) {
					cb("Argument `options.width` is required");
				}
				return false;
			}
			if (!options.height === undefined) {
				if (cb) {
					cb("Argument `options.height` is required");
				}
				return false;
			}
			if (!isNumeric(options.width)) {
				if (cb) {
					cb("Argument `options.width` is not numeric");
				}
				return false;
			}
			if (!isNumeric(options.height)) {
				if (cb) {
					cb("Argument `options.height` is not numeric");
				}
				return false;
			}

			setCanvasState(options);
			setCanvas();

			// callback
			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.close = function(cb) {
			try {
				var initialized = canvasState.originalWidth && canvasState.originalHeight;
				if (!initialized) {
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
				if (cb) {
					cb(null, exportCanvasState());
				}
				return exportCanvasState();
			} catch(err) {
				if (cb) {
					cb(err);
				}
				return false;
			}
		}

		/*
			options = {
				filename: "untitled", // string, without extension
				mimetype: "image/png", // string
				quality: 0.92, // number, 0 ~ 1
				background: "transparent", // string, "transparent" or "#FFFFFF" ~ "#000000"
				overlay: true, // boolean
				checker: true, // boolean
				clickable: true, // boolean
				editable: true, // boolean
				ruler: false, // boolean
			}
		*/
		myObject.canvas = function(options, cb) {
			var containerInitialized = containerState.width && containerState.height;
			var canvasInitialized = canvasState.originalWidth && canvasState.originalHeight;
			if (!containerInitialized) {
				if (cb) {
					cb("Container has been not initialized");
				}
				return false;
			}
			if (!canvasInitialized) {
				if (cb) {
					cb("Canvas has been not initialized");
				}
				return false;
			}
			if (!isObject(options)) {
				if (cb) {
					cb("Argument `options` is not object");
				}
				return false;
			}

			setCanvasState(options);
			setCanvas();

			// callback
			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		//
		// draw
		//

		/*
			options = {
				filename(optional)
				mimetype(optional)
				quality(optional)
				background(optional)
				width(optional)
				height(optional)
				filter(optional)(function)
			}
		*/
		myObject.draw = function(options, cb){
			try {
				var canvasInitialized = canvasState.originalWidth && canvasState.originalHeight;
				if (eventState.onDraw) {
					if (cb) {
						cb("Already in progress");
					}
					return false;
				}
				if (!canvasInitialized) {
					if (cb) {
						cb("Canvas has been not initialized");
					}
					return false;
				}
	
				var canvState = exportCanvasState();
				var convertedImageStates = [];
	
				for (var i = 0; i < imageStates.length; i++) {
					if (imageStates[i].drawable) {
						var tmp = exportImageState(imageStates[i].id);
						tmp.filter = imageStates[i].filter;
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
	
				drawCanvas(options, canvState, convertedImageStates, function(err, base64, result){
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
			} catch(err) {
				if (cb) {
					cb(err);
				}
				return false;
			}
		}

		/*
			options = {
				filename(optional)
				mimetype(optional)
				quality(optional)
				background(optional)
				width(optional)
				height(optional)
				filter(optional)(function)
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
		myObject.drawTo = function(options, exportedCanvasSizes, exportedImageStates, cb){
			var canvState = {};
			var convertedImageStates = [];

			if (eventState.onDraw === true) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}
			if (!isObject(options)) {
				if (cb) {
					cb("Argument `options` is not object");
				}
				return false;
			}
			if (!isObject(exportedCanvasSizes)) {
				if (cb) {
					cb("Argument `exportedCanvasSizes` is not object");
				}
				return false;
			}
			if (!isArray(exportedImageStates)) {
				if (cb) {
					cb("Argument `exportedImageStates` is not array");
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
					cb("Argument `exportedCanvasSizes.width` is not numeric");
				}
				return false;
			} else {
				canvState.width = toNumber(exportedCanvasSizes.width);
			}
			if (!isNumeric(exportedCanvasSizes.height)) {
				if (cb) {
					cb("Argument `exportedCanvasSizes.height` is not numeric");
				}
				return false;
			} else {
				canvState.height = toNumber(exportedCanvasSizes.height);
			}

			for (var i = 0; i < exportedImageStates.length; i++) {
				if (
					(exportedImageStates[i].drawable === undefined || exportedImageStates[i].drawable === true) &&
					exportedImageStates[i].index
				) {
					var tmp = exportImageState(imageStates[i].id);
					tmp.filter = exportedImageStates[i].filter;
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

			drawCanvas(options, canvState, convertedImageStates, function(err, base64, result){
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

		myObject.getConfig = function(cb){
			if (cb) {
				cb(null, exportConfig());
			}
			return exportConfig();
		}

		myObject.getLimit = function(cb){
			var tmp = {
				maxWidth: _maxWidth,
				maxHeight: _maxHeight,
				minWidth: _minWidth,
				minHeight: _minHeight,
			};
			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getCanvas = function(cb){
			if (cb) {
				cb(null, exportCanvasState());
			}
			return exportCanvasState();
		}

		myObject.getImage = function(id, cb){
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
			var arr = [];

			for(var i = 0; i < imageStates.length; i++) {
				arr.push(exportImageState(imageStates[i].id));
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

		myObject.getPreviousImage = function(id, cb){
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
						found = exportImageState(sortedStates[i - 1].id);
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
						found = exportImageState(sortedStates[i + 1].id);
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

		// 
		// utility
		// 

		myObject.getViewport = function(cb){
			var sizes = getViewportSizes();
			if (cb) {
				cb(null, {
					width: sizes[0],
					height: sizes[1],
				});
			}
			return {
				width: sizes[0],
				height: sizes[1],
			};
		}

		// 
		// export
		// 

		myObject.export = function(imageIds, cb) {
			if (!isArray(imageIds)) {
				if (cb) {
					cb("Argument `imageIds` is not array");
				}
				return false;
			}

			var arr = [];
			for(var i = 0; i < imageStates.length; i++) {
				if (imageIds.indexOf(imageStates[i].id) > -1) {
					arr.push(exportImageState(imageStates[i].id));
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

		myObject.import = function(exportedStates, cb){
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
				if (cb) {
					cb("Argument `exportedStates` is not array");
				}
				return false;
			}

			var filterdStates = [];
			for(var i = 0; i < exportedStates.length; i++) {
				var candidate = exportedStates[i];
				if (!isObject(candidate)) {
					continue;
				}
				if (
					!candidate.src &&
					!candidate.url &&
					!candidate.path &&
					!candidate.index
				) {
					continue;
				}
				filterdStates.push(candidate);
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
							if (config.upload) {
								config.upload(null, exportImageState(res));
							}
							result.push(exportImageState(res))
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

			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.redo = function(cb){
			if (redoCaches.length < 1) {
				if (cb) {
					cb("Cache is empty");
				}
				return false;
			}

			var id = callRedo();

			if (cb) {
				cb(null, exportImageState(id));
			}
			return exportImageState(id);
		}

		myObject.debug = function(base64){
			debugCanvas(base64);
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

	if (!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		};
	}
})(window);