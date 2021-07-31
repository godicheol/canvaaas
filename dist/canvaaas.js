/*!
 * 
 * canvaaas.js
 * 
 * eeecheol@gmail.com
 * 
 * 0.0.6
 * 
 */

/***!
 *** 
 *** caution
 * 
 * if use `canvaaas.init()` callback, you should insert `canvaaas.showContainer()` into callback
 * 
 */

/***!
 *** 
 *** release note
 * 
 * update pinch zoom - outside canvas
 * 
 * update resize handle - onShiftKey
 * 
 * update config.state
 * 
 * update all callback error messages
 * 
 * update handle css
 * 
 * update undo, redo
 * 
 * update index
 * 
 * update arrow key
 * 
 * update canvas, container
 * 
 * update preview
 * 
 * remove cache breaker from renderImage()
 * 
 * add clone event handles
 * 
 * update drawCanvas, drawImage, preview, download :: adjust argument "width"
 * 
 * fix exceed max canvas size
 * 
 * add freeze mode
 * 
 * update drawCanvas()
 * 
 * update all methods
 * 
 */

/*!
 * 
 * 업데이트 예정
 * 
 * init() & reset() 통합, init() 시 이미 존재하면 삭제 후 진행
 * 
 * initImage() 추가, 중앙으로 가져오기
 * 
 * config.canvasWidth & canvasHeight 를 canvasState에 이동
 * 시작할 때 canvasSize 입력 받기?
 * 
 */

/*!
 * 
 * 테스트 예정
 * 
 * index 1000 이상
 * 
 * import 로 index 겹치기
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

			aspectRatio: true, // boolean

			minAutoIndexing: 0, // number

			maxAutoIndexing: 999, // number

			maxNumberOfImages: 999, // number

			cacheLevels: 999, // number

			containerAspectRatio: undefined, // width / height

			minContainerWidth: undefined, // number, px

			minContainerHeight: undefined, // number, px

			maxContainerWidth: 1, // number, px, if 0 ~ 1 => viewportWidth * x

			maxContainerHeight: 0.7, // number, px, if 0 ~ 1 => viewportHeight * x

			drawFillColor: "#FFFFFF", // string, RGB

			drawMimeType: "image/jpeg", // string, image/jpeg, image/png, image/webp...

			drawQuality: 0.8, // number, 0 ~ 1

			imageSmoothingEnabled: false, // boolean
			
			imageSmoothingQuality: "low", // string, low, medium, high

			drawWidth: 4096, // number, px

			drawHeight: 2304, // number, px

			minDrawWidth: 64, // number, px

			minDrawHeight: 64, // number, px

			maxDrawWidth: 4096, // number, px, for Mobile

			maxDrawHeight: 4096, // number, px, for Mobile

			minImageWidth: 64, // number, px

			minImageHeight: 64, // number, px

			minImageRenderWidth: 0.2, //number,  0 ~ 1

			minImageRenderHeight: 0.2, // number, 0 ~ 1

			maxImageRenderWidth: 0.9, // number, 0 ~ 1

			maxImageRenderHeight: 0.9, // number, 0 ~ 1

			focus: undefined, // callback function

			edit: undefined, // callback function

			remove: undefined, // callback function

			config: undefined, // callback function

			upload: undefined, // callback function

			draw: undefined, // callback function

			export: undefined, // callback function

			import: undefined, // callback function

		};

		Object.freeze(defaultConfiguration);

		var config = {};

		var imageId = "canvaaas-" + getShortId() + "-";
		var cloneId = "canvaaas-" + getShortId() + "-";

		var onUpload = false;
		var onMove = false;
		var onZoom = false;
		var onResize = false;
		var onRotate = false;
		var onFlip = false;
		var onPreview = false;
		var onFreeze = false;

		var conatinerTemplate = "";
		conatinerTemplate += "<div class='canvaaas'>";
		conatinerTemplate += "<div class='canvaaas-mirror'></div>";
		conatinerTemplate += "<div class='canvaaas-canvas checker'></div>";
		conatinerTemplate += "<div class='canvaaas-preview hidden'></div>";
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

		var viewTemplate = "";
		viewTemplate += "<div class='canvaaas'>";
		viewTemplate += "<div class='canvaaas-canvas'></div>";
		viewTemplate += "</div>";

		var eventState = {};
		var eventCaches = [];
		var eventSubCaches = [];
		var containerState = {};
		var canvasState = {};
		var imageStates = [];

		var containerElement;
		var canvasElement;
		var mirrorElement;
		var previewElement;

		var imageElements = [];
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
						renderImage(files[count], function(err, id) {
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

				if (eventState.target) {
					if (!e.target.classList.contains("canvaaas-image")) {
						var oldId = getIdByImageElement(eventState.target);
						setFocusOut(oldId);
					}
				}
			},

			onScroll: function(e) {
				if (eventState.target) {
					var oldId = getIdByImageElement(eventState.target);
					setFocusOut(oldId);
				}
			},

			keydown: function(e) {
				var elem = eventState.target;
				var state = getStateByImageElement(elem);
				var clone = getCloneElementById(state.id);

				if (!config.editable) {
					return false;
				}
				if (!eventState.target) {
					return false;
				}
				if (!elem || !state || !clone) {
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
				setElement(elem, state);
				setElement(clone, state);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			startFocusIn: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var elem;
				if (!e.target.classList.contains("canvaaas-image")) {
					if (!e.target.parentNode.classList.contains("canvaaas-image")) {
						return false;
					} else {
						elem = e.target.parentNode;
					}
				} else {
					elem = e.target;
				}

				if (!config.editable) {
					if (config.focus) {
						config.focus("Editing has been disabled");
					}
					return false;
				}

				var state = getStateByImageElement(elem);

				if (!state.focusable) {
					if (config.focus) {
						config.focus("Has been denied");
					}
					return false;
				}

				if (eventState.target) {

					if (elem.isSameNode(eventState.target)) {
						if (config.focus) {
							config.focus("Already focused");
						}
						return false;
					}

					var oldId = getIdByImageElement(eventState.target);
					setFocusOut(oldId);
				}

				setFocusIn(state.id);

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

				var oldId = getIdByImageElement(eventState.target);
				setFocusOut(oldId);
			},

			startMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				calcContainerState();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				var elem = eventState.target;
				var state = getStateByImageElement(elem);
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

				var elem = eventState.target;
				var state = getStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
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
				setElement(elem, state);
				setElement(clone, state);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			endMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				calcContainerState();

				var elem = eventState.target;
				var state = getStateByImageElement(elem);

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

				calcContainerState();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				var handle = e.target;
				var elem = eventState.target;
				var state = getStateByImageElement(elem);
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

				var elem = eventState.target;
				var state = getStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
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
				setElement(elem, state);
				setElement(clone, state);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			endRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				calcContainerState();

				var elem = eventState.target;
				var state = getStateByImageElement(elem);

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

				calcContainerState();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				var handle = e.target;
				var elem = eventState.target;
				var state = getStateByImageElement(elem);
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
				var elem = eventState.target;
				var state = getStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
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

				if (!config.aspectRatio || e.shiftKey) {
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
				setElement(elem, state);
				setElement(clone, state);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			endResize: function(e) {
				e.preventDefault();
				e.stopPropagation();

				calcContainerState();

				var elem = eventState.target;
				var state = getStateByImageElement(elem);

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

				var elem = eventState.target;
				var state = getStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
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

					calcContainerState();

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
				setElement(elem, state);
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

				calcContainerState();

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

				var elem = eventState.target;
				var state = getStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
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

				var elem = eventState.target;
				var state = getStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
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
				setElement(elem, state);
				setElement(clone, state);

				if (config.edit) {
					config.edit(null, state.id);
				}
			},

			endPinchZoom: function(e) {
				e.preventDefault();
				e.stopPropagation();

				calcContainerState();

				var elem = eventState.target;
				var state = getStateByImageElement(elem);

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

				var oldWidth = containerElement.offsetWidth;

				initContainer();

				var newWidth = containerState.width;
				var scaleRatio = newWidth / oldWidth;

				initCanvas();

				imageStates.forEach(function(state){
					var elem = getImageElementById(state.id);
					var clone = getCloneElementById(state.id);

					state.width *= scaleRatio;
					state.height *= scaleRatio;
					state.x *= scaleRatio;
					state.y *= scaleRatio;

					setElement(elem, state);
					setElement(clone, state);
				});

				if (onPreview) {
					setElement(previewElement, canvasState);
				}
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
			if (typeof(srcObj) !== "object") {
				return false;
			}
			if (typeof(destiObj) !== "object") {
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

			var elem = getImageElementById(id);
			if (!elem) {
				return false;
			}

			var clone = getCloneElementById(id);
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
			tmp.imageClass = elem.className.split(' ');
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

			var elem = getImageElementById(id);
			if (!elem) {
				return false;
			}

			var clone = getCloneElementById(id);
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
			tmp.imageClass = elem.className.split(' ');
			tmp.cloneClass = clone.className.split(' ');
			tmp.updatedAt = Date.now();

			eventSubCaches.push(tmp);

			return true;
		}

		function setFocusIn(id) {
			if (!id) {
				return false;
			}

			var elem = getImageElementById(id);
			if (!elem) {
				return false;
			}

			var clone = getCloneElementById(id);
			if (!clone) {
				return false;
			}

			try {
				canvasElement.classList.add("focused");
				mirrorElement.classList.add("focused");

				elem.classList.add("focused");
				clone.classList.add("focused");

				elem.removeEventListener("mousedown", handlers.startFocusIn, false);
				elem.removeEventListener("touchstart", handlers.startFocusIn, false);

				elem.addEventListener("mousedown", handlers.startMove, false);
				elem.addEventListener("touchstart", handlers.startMove, false);
				elem.addEventListener("wheel", handlers.startWheelZoom, false);

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
			
			eventState.target = elem;

			return true;
		};

		function setFocusOut(id) {
			if (!id) {
				return false;
			}

			var elem = getImageElementById(id)
			if (!elem) {
				return false;
			}

			var clone = getCloneElementById(id);
			if (!clone) {
				return false;
			}

			try {
				canvasElement.classList.remove("focused");
				mirrorElement.classList.remove("focused");

				elem.classList.remove("focused");
				clone.classList.remove("focused");

				elem.removeEventListener("mousedown", handlers.startMove, false);
				elem.removeEventListener("touchstart", handlers.startMove, false);
				elem.removeEventListener("wheel", handlers.startWheelZoom, false);

				elem.addEventListener("mousedown", handlers.startFocusIn, false);
				elem.addEventListener("touchstart", handlers.startFocusIn, false);

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
			var tmpImageElements = [];
			var tmpCloneElements = [];
			var firstImageChild = canvasElement.firstChild;
			var lastImageChild = undefined;
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
				var elem = getImageElementById(state.id);
				var clone = getCloneElementById(state.id);

				try {
					if (!lastImageChild) {
						if (!elem.isSameNode(firstImageChild)) {
							canvasElement.insertBefore(elem, firstImageChild);
						} else {
							if (elem.nextSibling) {
								lastImageChild = elem.nextSibling;
							}
						}
					} else {
						if (!elem.isSameNode(lastImageChild)) {
							canvasElement.insertBefore(elem, lastImageChild);
						} else {
							if (elem.nextSibling) {
								lastImageChild = elem.nextSibling;
							}
						}
					}

					tmpImageElements.push(elem);
				} catch (err) {
					return false;
				}

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

					tmpCloneElements.push(elem);
				} catch (err) {
					return false;
				}
			});

			imageStates = tmpStates;
			imageElements = tmpImageElements;
			cloneElements = tmpCloneElements;

			return true;
		}

		function calcContainerState() {
			var offset = containerElement.getBoundingClientRect();
			containerState.left = offset.left;
			containerState.top = offset.top;

			return true;
		}

		function getIdByImageElement(elem) {
			if (!elem) {
				return false;
			}
			if (!elem.classList.contains("canvaaas-image")) {
				return false;
			}
			if (
				elem.id === undefined ||
				elem.id === null ||
				elem.id === ""
			) {
				return false;
			}
			return elem.id.split("-").pop();
		}

		function getImageElementById(id) {
			if (!id) {
				return false;
			}
			return document.getElementById(imageId + id);
		}

		function getImageElementByFilename(str) {
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
			return document.getElementById(imageId + state.id);
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

		function getStateByImageElement(elem) {
			if (!elem) {
				return false;
			}
			if (!elem.classList.contains("canvaaas-image")) {
				return false;
			}
			if (
				elem.id === undefined ||
				elem.id === null ||
				elem.id === ""
			) {
				return false;
			}

			var id = elem.id.split("-").pop();

			return imageStates.find(function(state){
				if (state.id === id) {
					return state;
				}
			});
		}

		function getImageStateByFilename(str) {
			if (!str) {
				return false;
			}
			return imageStates.find(function(state){
				if (state.filename === str) {
					return state;
				}
			});
		}

		function getCloneElementById(id) {
			if (!id) {
				return false;
			}
			return document.getElementById(cloneId + id);
		}

		function getCloneElementByImageElement(elem) {
			if (!elem) {
				return false;
			}
			if (!elem.classList.contains("canvaaas-image")) {
				return false;
			}
			if (
				elem.id === undefined ||
				elem.id === null ||
				elem.id === ""
			) {
				return false;
			}
			
			var id = elem.id.split("-").pop();

			return document.getElementById(cloneId + id);
		}

		function removeImageById(id) {
			if (!id) {
				return false;
			}
			var elem = document.getElementById(imageId + id);
			var clone = document.getElementById(cloneId + id);

			if (!elem || !clone) {
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

			var elemSeq = imageElements.findIndex(function(candidateElement){
				if (candidateElement.isSameNode(elem)) {
					return candidateElement;
				}
			});
			if (elemSeq === undefined || elemSeq === null) {
				return false;
			}

			try {
				imageStates.splice(stateSeq, 1);
				imageElements.splice(elemSeq, 1);
				elem.parentNode.removeChild(elem);
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
			if (typeof(options) !== "object") {
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
			if (typeof(canvas) !== "object") {
				return cb("Argument error");
			}
			if (typeof(id) !== "string") {
				return cb("Argument error");
			}

			var elem = getImageElementById(id);
			if (!elem) {
				return cb("element not found");
			}
			var state = getStateById(id);
			if (!state) {
				return cb("state not found");
			}
			var originalImg = elem.querySelector("img");
			if (!originalImg) {
				return cb("element not found");
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
				// tmpCtx.imageSmoothingQuality = config.imageSmoothingQuality;
				// tmpCtx.imageSmoothingEnabled = config.imageSmoothingEnabled;

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

		function initImage(id) {
			if (!id) {
				return false;
			}
			var elem = getImageElementById(id)
			var clone = getCloneElementById(id);
			var state = getStateById(id);

			if (!elem || !clone || !state) {
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

			setElement(elem, state);
			setElement(clone, state);

			return true;
		}

		// callback
		function renderImage(file, cb) {
			if (!file) {
				if (cb) {
					cb("File not found");
				}
				return false;
			}

			if (imageElements.length > config.maxNumberOfImages - 1) {
				if (cb) {
					cb("Exceed `config.maxNumberOfImages`");
				}
				return false;
			}

			var typ,
				ext,
				src,
				filename,
				newImage = new Image(),
				isDuplicate = false,
				id = getShortId();

			// check file or url
			if (typeof(file) === "object") {
				// file
				typ = "file";
				ext = file.type.split("/")[1];
				src = URL.createObjectURL(file);
				filename = file.name;
			} else if (typeof(file) === "string") {
				// url
				typ = "url";
				ext = getExtension(file);
				src = file;
				// src = file + "?" + new Date().getTime(); // fix ios refresh error, cachebreaker
				filename = getFilename(file);
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

			// check filename duplicate
			imageStates.forEach(function(state){
				if (state.filename === filename) {
					isDuplicate = true;
				}
			});

			if (isDuplicate === true) {
				if (cb) {
					cb("This file has been already uploaded");
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

			newImage.onload = function(e){

				var nextIndex = config.minAutoIndexing;
				imageStates.forEach(function(state){
					if (state.index < config.maxAutoIndexing) {
						if (nextIndex < state.index) {
							nextIndex = state.index;
						}
					}
				});

				var newElem = document.createElement("div");
				newElem.classList.add("canvaaas-image");
				newElem.id = imageId + id;
				newElem.innerHTML = imageTemplate;

				var newImg = newElem.querySelector("img");
				newImg.src = newImage.src;

				// image
				var originalWidth = newImage.width;
				var originalHeight = newImage.height;
				var aspectRatio = newImage.width / newImage.height;

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

				var newState = {};
				newState.id = id;
				newState.src = src;
				newState.type = typ;
				newState.filename = filename;

				newState.index = nextIndex + 1;

				newState.originalWidth = originalWidth;
				newState.originalHeight = originalHeight;
				newState.width = width;
				newState.height = height;
				newState.x = axisX;
				newState.y = axisY;
				newState.rotate = 0;
				newState.scaleX = 1;
				newState.scaleY = 1;
				newState.opacity = 1;

				newState.focusable = true;
				newState.editable = true;
				newState.drawable = true;

				newState.uploadedAt = Date.now();

				setElement(newElem, newState);

				canvasElement.appendChild(newElem);
				imageStates.push(newState);
				imageElements.push(newElem);

				// mirror
				var newClone = newElem.cloneNode();

				newClone.innerHTML = newElem.innerHTML;
				newClone.id = cloneId + id;
				newClone.classList.replace("canvaaas-image", "canvaaas-clone");

				// events
				var rotateHandlesA = newElem.querySelectorAll("div.canvaaas-rotate-handle");
				var resizeHandlesA = newElem.querySelectorAll("div.canvaaas-resize-handle");
				
				rotateHandlesA.forEach(function(handleElem){
					handleElem.addEventListener("mousedown", handlers.startRotate, false);
					handleElem.addEventListener("touchstart", handlers.startRotate, false);
				});

				resizeHandlesA.forEach(function(handleElem){
					handleElem.addEventListener("mousedown", handlers.startResize, false);
					handleElem.addEventListener("touchstart", handlers.startResize, false);
				});

				newElem.addEventListener("mousedown", handlers.startFocusIn, false);
				newElem.addEventListener("touchstart", handlers.startFocusIn, false);

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

		function initContainer() {
			if (
				containerElement === false ||
				containerElement === undefined ||
				config.drawWidth === false ||
				config.drawWidth === undefined ||
				config.drawHeight === false ||
				config.drawHeight === undefined
			) {
				return false;
			}

			var scrollbarWidth = getScrollbarWidth();
			var viewportSizes = getViewportSizes();
			var viewportWidth = viewportSizes[0];
			var viewportHeight = viewportSizes[1];

			if (
				scrollbarWidth === false ||
				scrollbarWidth === undefined ||
				viewportSizes === false ||
				viewportSizes === undefined
			) {
				return false;
			}

			// clear container style
			containerElement.style.width = "";
			containerElement.style.height = "";

			var maxWidth;
			var maxHeight;
			var minWidth = config.minContainerWidth || 0;
			var minHeight = config.minContainerHeight || 0;

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

			var aspectRatio = config.containerAspectRatio || config.drawWidth / config.drawHeight;
			var containerWidth = containerElement.offsetWidth;
			var containerHeight = containerElement.offsetWidth / aspectRatio;
			var canvasAspectRatio = config.drawWidth / config.drawHeight;

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

		function initCanvas() {
			if (
				!canvasElement ||
				!containerState.width ||
				!containerState.height ||
				!config.drawWidth ||
				!config.drawHeight
			) {
				return false;
			}

			var aspectRatio = config.drawWidth / config.drawHeight;

			var fittedSizes = getFittedRect(
				containerState.width,
				containerState.height,
				aspectRatio
			);

			var width = fittedSizes[0];
			var height = fittedSizes[1];
			var axisX = 0.5 * containerState.width;
			var axisY = 0.5 * containerState.height;

			canvasState.width = width;
			canvasState.height = height;
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
			if (typeof(target) !== "object") {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			if (typeof(preConfig) === "object") {
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
			previewElement = target.querySelector("div.canvaaas-preview");

			// set container
			var containerRes = initContainer();
			if (!containerRes) {
				if (cb) {
					cb("`initContainer()` error");
				}
				return false;
			}

			// set canvas
			var canvasRes = initCanvas();
			if (!canvasRes) {
				if (cb) {
					cb("`initCanvas()` error");
				}
				return false;
			}

			// set style
			containerElement.classList.add("hidden");

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
					renderImage(tmpUrls[count], function(err, id) {
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

					containerElement.classList.remove("hidden");

					if (cb) {
						cb(null, config);
					} 
					console.log("canvaaas.js initialized", config);
				}
			}
		}

		myObject.uploadFiles = function(self, cb) {
			if (typeof(self) !== "object") {
				if (config.upload) {
					config.upload("Argument error");
				}
				if (cb) {
					cb("Argument error");
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

			if (onUpload === true) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
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

			onUpload = true;

			var index = files.length;
			var count = 0;
			var results = [];

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderImage(files[count], function(err, id) {
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

		myObject.uploadUrls = function(imageUrls, cb) {
			if (
				typeof(imageUrls) === "number" ||
				typeof(imageUrls) === "undefined"
			) {
				if (config.upload) {
					config.upload("Argument error");
				}
				if (cb) {
					cb("Argument error");
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

			if (onUpload === true) {
				if (config.upload) {
					config.upload("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				} 
				return false;
			}

			var arr = [];
			if (!Array.isArray(imageUrls)) {
				arr.push(imageUrls);
			} else {
				arr = imageUrls;
			}

			var index = arr.length;
			var count = 0;
			var results = [];

			onUpload = true;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					renderImage(arr[count], function(err, id) {
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
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
		}

		myObject.moveY = function(id, y, cb) {
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
		}

		myObject.moveTo = function(id, x, y, cb) {
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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
				typeof(x) === "object" ||
				typeof(y) === "object"
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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
		}

		myObject.zoom = function(id, ratio, cb) {
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
		}

		myObject.zoomTo = function(id, ratio, cb) {
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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
				typeof(ratio) === "object" || 
				typeof(ratio) === "undefined"
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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.rotate = function(id, deg, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.rotateTo = function(id, deg, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.flipX = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			} 
		}

		myObject.flipY = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			} 
		}

		myObject.flipTo = function(id, x, y, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			} 
		}

		myObject.opacityTo = function(id, num, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
			setElement(clone, state);

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.indexUp = function(id, cb) {
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
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
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
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
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
			setElement(elem, state);
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
			var elem = getImageElementById(id);
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

			// if (!config.editable) {
			// 	if (config.focus) {
			// 		config.focus("Editing has been disabled");
			// 	}
			// 	if (cb) {
			// 		cb("Editing has been disabled");
			// 	}
			// 	return false;
			// }

			if (!elem || !state) {
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
				var oldId = getIdByImageElement(eventState.target);
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

			var id = getIdByImageElement(eventState.target);

			// if (!config.editable) {
			// 	if (cb) {
			// 		cb("Editing has been disabled");
			// 	}
			// 	return false;
			// }
			
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
			var elem = getImageElementById(id);
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

			if (!elem || !state) {
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
			elem.classList.remove("unclickable");

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.editable = function(id, cb){
			var elem = getImageElementById(id);
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

			if (!elem || !state) {
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
			state.editable = true;

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.drawable = function(id, cb){
			var elem = getImageElementById(id);
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

			if (!elem || !state) {
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
			var elem = getImageElementById(id);
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

			if (!elem || !state) {
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
				if (elem.isSameNode(eventState.target)) {
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
			elem.classList.add("unclickable");

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.uneditable = function(id, cb){
			var elem = getImageElementById(id);
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

			if (!elem || !state) {
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
			state.movable = false;

			if (config.edit) {
				config.edit(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.undrawable = function(id, cb){
			var elem = getImageElementById(id);
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

			if (!elem || !state) {
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
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

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

			if (!elem || !state || !clone) {
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
				if (elem.isSameNode(eventState.target)) {
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

		// 
		// config
		// 

		// deprecated
		myObject.config = function(newConfig, cb) {
			if (typeof(newConfig) !== "object") {
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

			// set config
			copyObject(newConfig, config);

			// container
			initContainer();

			// canvas
			initCanvas();

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

			var updates = {
				drawWidth: w,
				drawHeight: h
			};

			// set config
			copyObject(updates, config);

			// set container
			initContainer();

			// set canvas
			initCanvas();

			// set images
			var newW = canvasState.width;
			var newH = canvasState.height;

			var scaleRatioX = newW / oldW;
			var scaleRatioY = newH / oldH;

			// new state adjust to images
			imageStates.forEach(function(state){
				var elem = getImageElementById(state.id);
				var clone = getCloneElementById(state.id);

				var aspectRatio = state.width / state.height;

				state.width *= scaleRatioX;
				state.height = state.width / aspectRatio;
				state.x *= scaleRatioX;
				state.y *= scaleRatioY;

				setElement(elem, state);
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
				var oldId = getIdByImageElement(eventState.target);
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

			config.aspectRatio = false;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.unlockAspectRatio = function(cb){

			config.aspectRatio = true;
			
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
			var drawWidth = config.drawWidth;
			var drawHeight = config.drawHeight;
			var quality = config.drawQuality;
			var mimeType = config.drawMimeType;
			var imageSmoothingQuality = config.imageSmoothingQuality;
			var imageSmoothingEnabled = config.imageSmoothingEnabled;
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

			if (typeof(options) !== "object") {
				if (config.draw) {
					config.draw("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			var drawAspectRatio = config.drawWidth / config.drawHeight;
			var drawWidth = options.drawWidth || options.width || config.drawWidth;
			var drawHeight = drawWidth / drawAspectRatio;
			var quality = options.quality || options.drawQuality || config.drawQuality;
			var mimeType = options.mimeType || options.drawMimeType || config.drawMimeType;
			var fillColor = options.fillColor || options.drawFillColor || config.drawFillColor;
			var imageSmoothingQuality = options.smoothingQuality || options.imageSmoothingQuality || config.imageSmoothingQuality;
			var imageSmoothingEnabled = options.smoothingQuality || options.imageSmoothingEnabled || config.imageSmoothingEnabled;

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
			var drawWidth = config.drawWidth;
			var drawHeight = config.drawHeight;
			var quality = config.drawQuality;
			var mimeType = config.drawMimeType;
			var imageSmoothingQuality = config.imageSmoothingQuality;
			var imageSmoothingEnabled = config.imageSmoothingEnabled;
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
			if (typeof(options) !== "object") {
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			var drawAspectRatio = config.drawWidth / config.drawHeight;
			var drawWidth = options.drawWidth || options.width || config.drawWidth;
			var drawHeight = drawWidth / drawAspectRatio;
			var quality = options.quality || options.drawQuality || config.drawQuality;
			var mimeType = options.mimeType || options.drawMimeType || config.drawMimeType;
			var fillColor = options.fillColor || options.drawFillColor || config.drawFillColor;
			var imageSmoothingQuality = options.smoothingQuality || options.imageSmoothingQuality || config.imageSmoothingQuality;
			var imageSmoothingEnabled = options.smoothingQuality || options.imageSmoothingEnabled || config.imageSmoothingEnabled;
			var filename = options.filename || config.filename || "Untitled";
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

		myObject.preview = function(cb){
			if (
				onPreview === true ||
				onFreeze === true
			) {
				if (config.draw) {
					config.draw("Already in progress");
				}
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			previewElement.innerHTML = "";

			if (eventState.target) {
				var oldId = getIdByImageElement(eventState.target);
				var res = setFocusOut(oldId);
				if (!res) {
					if (cb) {
						cb("`setFocusOut()` error");
					}
					return false;
				}
			}

			var drawWidth = config.drawWidth;
			var drawHeight = config.drawHeight;
			var quality = config.drawQuality;
			var mimeType = config.drawMimeType;
			var imageSmoothingQuality = config.imageSmoothingQuality;
			var imageSmoothingEnabled = config.imageSmoothingEnabled;
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

					var file = canvas.toDataURL(mimeType, quality);

					result.states = drawResults;

					setElement(previewElement, canvasState);

					var newImage = document.createElement("img");
					newImage.src = file;

					previewElement.appendChild(newImage);

					canvasElement.classList.add("hidden");
					mirrorElement.classList.add("hidden");
					previewElement.classList.remove("hidden");

					config.editable = false;
					onPreview = true;

					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		myObject.escapePreview = function(cb){
			if (onPreview === false) {
				if (cb) {
					cb("No progress");
				}
				return false;
			}

			previewElement.innerHTML = "";
			previewElement.style.width = "";
			previewElement.style.height = "";

			canvasElement.classList.remove("hidden");
			mirrorElement.classList.remove("hidden");
			previewElement.classList.add("hidden");

			config.editable = true;
			onPreview = false;

			if (cb) {
				cb(null);
			}
		}

		myObject.freeze = function(cb){
			if (
				onPreview === true ||
				onFreeze === true
			) {
				if (cb) {
					cb("Already in progress");
				}
				return false;
			}

			if (eventState.target) {
				var oldId = getIdByImageElement(eventState.target);
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
					cb("No progress");
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
		myObject.export = function(cb) {
			var keys = [
				"filename",
				"x",
				"y",
				"width",
				"height",
				"rotate",
				"scaleX",
				"scaleY",
				"opacity",
				"index",
				"focusable",
				"editable",
				"drawable",
				"uploadedAt"
			];

			var data = {};

			var tmpConfig = {};
			copyObject(config, tmpConfig);

			var tmpCanvasState = {};
			copyObject(canvasState, tmpCanvasState);

			var tmpImagesStates = [];
			imageStates.forEach(function(state){
				var tmp = {};

				keys.forEach(function(k){
					tmp[k] = state[k];
				});

				tmpImagesStates.push(tmp);
			});

			data.config = tmpConfig;
			data.canvasState = tmpCanvasState;
			data.imageStates = tmpImagesStates;

			if (config.export) {
				config.export(null, data);
			}
			if (cb) {
				cb(null, data);
			}
			return data;
		}

		myObject.import = function(exportedData, cb) {
			if (!config.editable) {
				if (config.import) {
					config.import("Editing has been disabled");
				}
				if (cb) {
					cb("Editing has been disabled");
				}
				return false;
			}

			if (typeof(exportedData) !== "object") {
				if (config.import) {
					config.import("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			var oldConfig = exportedData.config;
			var oldCanvasState = exportedData.canvasState;
			var oldImageStates = exportedData.imageStates;

			if (
				!oldCanvasState ||
				!oldCanvasState.width ||
				!oldCanvasState.height ||
				!oldImageStates ||
				oldImageStates.length < 1
			) {
				if (config.import) {
					config.import("Argument error");
				}
				if (cb) {
					cb("Argument error");
				}
				return false;
			}

			var aspectRatioA = oldCanvasState.width / oldCanvasState.height;
			var aspectRatioB = canvasState.width / canvasState.height;

			// check aspect ratio
			if (Math.abs(aspectRatioA - aspectRatioB) > 0.01) {
				if (config.import) {
					config.import("Canvas aspect ratio mismatch");
				}
				if (cb) {
					cb("Canvas aspect ratio mismatch");
				}
				return false;
			}

			var results = [];
			for (var i = 0; i < oldImageStates.length; i++){
				var oldState = oldImageStates[i];

				var elem = getImageElementByFilename(oldState.filename);
				var clone = getCloneElementByImageElement(elem);
				var state = getStateByImageElement(elem);

				if (!elem || !state || !clone) {
					results.push({
						filename: oldState.filename,
						err: "Image not found"
					})
					continue;
				}

				// save cache
				pushCache(state.id);
				eventSubCaches = [];

				var scaleRatio = canvasState.width / oldCanvasState.width;
				var aspectRatio = oldState.width / oldState.height;

				// save state
				if (
					oldState.index !== undefined &&
					oldState.index !== null
				) {
					state.index = oldState.index;
				}

				if (
					oldState.x !== undefined &&
					oldState.x !== null
				) {
					state.x = oldState.x * scaleRatio;
				}
				if (
					oldState.y !== undefined &&
					oldState.y !== null
				) {
					state.y = oldState.y * scaleRatio;
				}
				if (
					oldState.width !== undefined &&
					oldState.width !== null
				) {
					state.width = oldState.width * scaleRatio;
				}
				if (
					oldState.height !== undefined &&
					oldState.height !== null
				) {
					state.height = oldState.width * scaleRatio / aspectRatio;
				}
				if (
					oldState.rotate !== undefined &&
					oldState.rotate !== null
				) {
					state.rotate = oldState.rotate;
				}
				if (
					oldState.scaleX !== undefined &&
					oldState.scaleX !== null
				) {
					state.scaleX = oldState.scaleX;
				}
				if (
					oldState.scaleY !== undefined &&
					oldState.scaleY !== null
				) {
					state.scaleY = oldState.scaleY;
				}
				if (
					oldState.opacity !== undefined &&
					oldState.opacity !== null
				) {
					state.opacity = oldState.opacity;
				}

				if (
					oldState.focusable === true ||
					oldState.focusable === false
				) {
					state.focusable = oldState.focusable;
				}

				if (
					oldState.editable === true ||
					oldState.editable === false
				) {
					state.editable = oldState.editable;
				}

				if (
					oldState.drawable === true ||
					oldState.drawable === false
				) {
					state.drawable = oldState.drawable;
				}

				// adjust state
				setElement(elem, state);
				setElement(clone, state);

				var tmp = {};
				copyObject(state, tmp);

				results.push(tmp);
			}

			if (oldConfig) {
				copyObject(oldConfig, config);
				initContainer();
				initCanvas();
			}

			var res = setIndex();
			if (!res) {
				if (config.import) {
					config.import("`setIndex()` error");
				}
				if (cb) {
					cb("`setIndex()` error");
				}
				return false;
			}
			if (config.import) {
				config.import(null, results);
			}
			if (cb) {
				cb(null, results);
			}
			return results;
		}

		myObject.this = function(cb){
			if (!eventState.target) {
				if (cb) {
					cb("Target not found");
				}
				return false;
			}

			var id = getIdByImageElement(eventState.target);

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

			var id = getIdByImageElement(eventState.target);
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

			var id = getIdByImageElement(eventState.target);
			var state = getStateById(id);

			var tmp = {};
			copyObject(state, tmp);

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
			if (cb) {
				cb(null, tmp);
			}
			return tmp;
		}

		myObject.getImageData = function(id, cb){
			if (!id) {
				var tmp = {};
				copyObject(imageStates, tmp);
				if (cb) {
					cb(null, tmp);
				}
				return tmp;
			} else {
				var arr = [];
				if (!Array.isArray(id)) {
					arr[0] = id;
				} else {
					arr = id;
				}

				var results = [];
				arr.forEach(function(candidateId){
					var state = getStateById(candidateId);
					var err;
					if (!state) {
						err = "State not found";
					}
					results.push({
						err: err,
						res: state
					})
				});

				if (cb) {
					cb(null, results);
				}
				return results;
			}
		}

		myObject.getUndoData = function(cb){
			if (cb) {
				cb(null, eventCaches);
			}
			return eventCaches;
		}

		myObject.getRedoData = function(cb){
			if (cb) {
				cb(null, eventSubCaches);
			}
			return eventSubCaches;
		}

		myObject.undo = function(cb){
			if (eventCaches.length < 1) {
				if (cb) {
					cb("Cache is empty");
				}
				return false;
			}
			var recent = eventCaches.pop();
			var elem = getImageElementById(recent.id);
			var clone = getCloneElementById(recent.id);
			var state = getStateById(recent.id);

			pushSubCache(recent.id);

			elem.className = recent.imageClass.join(" ");
			clone.className = recent.cloneClass.join(" ");
			copyObject(recent.state, state);

			setElement(elem, state);
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
			var elem = getImageElementById(recent.id);
			var clone = getCloneElementById(recent.id);
			var state = getStateById(recent.id);

			pushCache(recent.id);

			elem.className = recent.imageClass.join(" ");
			clone.className = recent.cloneClass.join(" ");
			copyObject(recent.state, state);

			setElement(elem, state);
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

		myObject.reset = function(preConfig, cb){

			window.removeEventListener("resize", handlers.resizeWindow, false);

			document.addEventListener("mousedown", handlers.isOutside, false);
			document.addEventListener("touchstart", handlers.isOutside, false);

			document.addEventListener("scroll", handlers.onScroll, false);

			var target = containerElement.parentNode;
			target.removeChild(containerElement);

			config = {};

			copyObject(defaultConfiguration, config);

			eventState = {};
			eventCaches = [];
			eventSubCaches = [];
			containerState = {};
			canvasState = {};
			imageStates = [];

			containerElement;
			canvasElement;
			mirrorElement;
			previewElement;

			imageElements = [];
			cloneElements = [];

			imageId = "canvaaas-" + getShortId() + "-";
			cloneId = "canvaaas-" + getShortId() + "-";

			onUpload = false;
			onMove = false;
			onZoom = false;
			onResize = false;
			onRotate = false;
			onFlip = false;
			onPreview = false;
			onFreeze = false;

			myObject.init(target, preConfig);

			if (cb) {
				cb(null, true);
			}
			return true
		}

		myObject.destroy = function(cb){
			containerElement.parentNode.removeChild(containerElement);
			if (cb) {
				cb(null, true);
			}
			return true;
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