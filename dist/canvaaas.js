/*!
 * 
 * canvaaas.js
 * 
 * eeecheol@gmail.com
 * 
 * 
 * 0.0.1
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
 */

/*!
 * 
 * 업데이트 예정
 * 
 */


/*!
 * 
 * 테스트 예정
 * 
 * 엄청 작은 사진 32px x 32px
 * 
 * 엄청 큰 사진
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

			mode: 1, // number, 1 = edit, 2 = view, 3 = draw

			filename: undefined, // string

			editable: true, // boolean

			overlay: true, // boolean

			magnetic: true, // boolean

    		editableAspectRatio: true, // boolean

    		minAutoIndex: 0, // number

    		maxAutoIndex: 999, // number

			maxNumberOfImages: 999, // number

    		cacheLevels: 999, // number

			containerAspectRatio: undefined, // width / height

			minContainerWidth: undefined, // number, px

			minContainerHeight: undefined, // number, px

			maxContainerWidth: 1, // number, px, if 0 ~ 1 => viewportWidth * x

			maxContainerHeight: 0.5, // number, px, if 0 ~ 1 => viewportHeight * x

			canvasWidth: 1920, // number, px

			canvasHeight: 1080, // number, px

			minImageWidth: 64, // number, px

			minImageHeight: 64, // number, px

			maxImageWidth: 4096, // number, px, for Mobile

			maxImageHeight: 4096, // number, px, for Mobile

			minImageRenderWidth: 0.2, //number,  0 ~ 1

			minImageRenderHeight: 0.2, // number, 0 ~ 1

			maxImageRenderWidth: 0.9, // number, 0 ~ 1

			maxImageRenderHeight: 0.9, // number, 0 ~ 1

			imageSmoothingEnabled: false, // boolean
			
    		imageSmoothingQuality: "low", // string, low, medium, high
			
    		fillColor: "#FFFFFF", // string, RGB
			
    		mimeType: "image/jpeg", // image/jpeg, image/png, image/webp...

    		quality: 0.8, // number, 0 ~ 1

    		extensions: ["jpg", "jpeg", "png", "webp", "svg"], // upload option

    		focus: undefined, // callback function

    		move: undefined, // callback function

    		resize: undefined, // callback function

    		rotate: undefined, // callback function

    		flip: undefined, // callback function

    		opacity: undefined, // callback function

    		index: undefined, // callback function

    		visibility: undefined, // callback function

    		state: undefined, // callback function

    		remove: undefined, // callback function

    		config: undefined, // callback function

    		canvas: undefined, // callback function

    		upload: undefined, // callback function

    		draw: undefined, // callback function

    		preview: undefined, // callback function

    		download: undefined, // callback function

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

		var errMsg = {
			ELEMENT: "Element not found",
			STATE: "State not found",
			CACHE: "Cache not found",
			TARGET: "Event target not found",
			UNEDITABLE: "This canvas is disabled",
			PROGRESS: "Another operation in progress",
			DUPLICATE: "This file is already uploaded",
			FAILLOAD: "Failed to load image from Server",
			AVAILABILITY: "This action is disabled",
			ARGUMENT: "Argument error",
			IMAGE_LIMIT: "Exceed the maximum numbers of images",
			CACHE_LIMIT: "Exceed the maximum numbers of caches",
			INDEX_LIMIT: "Exceed the maximum numbers of index",
			MIMETYPE: "MimeType not allowed",
			UNKNOWN: "An unknown error has occurred",
			INDEXING: "Error creating index",
			ALREADY_PREVIEW: "Already in preview mode",
		}

		var conatinerTemplate = "";
		conatinerTemplate += "<div class='canvaaas'>";
		conatinerTemplate += "<div class='canvaaas-mirror'></div>";
		conatinerTemplate += "<div class='canvaaas-canvas checker'></div>";
		conatinerTemplate += "<div class='canvaaas-preview hidden'></div>";
		conatinerTemplate += "</div>";

		var imageTemplate = "";
		imageTemplate += "<img>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-n'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-e'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-s'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-w'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-ne'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-nw'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-se'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-sw'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-n'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-e'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-s'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-w'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-ne'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-nw'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-se'><div class='canvaaas-handle'></div></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-sw'><div class='canvaaas-handle'></div></div>";
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
		var previewElement;

		var imageElements = [];
		var cloneElements = [];

		setObject(defaultConfiguration, config);

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
						config.upload(errMsg.UNEDITABLE);
					}
					return false;
				}

				if (onUpload === true) {
					if (config.upload) {
						config.upload(errMsg.PROGRESS);
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

				if (!config.editable) {
					return false;
				}

				if (eventState.target) {
					if (!e.target.classList.contains("canvaaas-image")) {
						var x = getIdByImageElement(eventState.target);
						setFocusOut(x);
					}
				}
			},

			onScroll: function(e) {
				if (eventState.target) {
					var x = getIdByImageElement(eventState.target);
					setFocusOut(x);
				}
			},

			keydown: function(e) {
				if (!config.editable) {
					return false;
				}
				if (!eventState.target) {
					return false;
				}

				var elem = eventState.target;
				var state = getStateByImageElement(elem);
				var clone = getCloneElementById(state.id);

				if (!elem || !state || !clone) {
					return false;
				}

				if (!state.movable) {
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

				if (config.move) {
					config.move(null, state.id);
				}
			},

			startFocusIn: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!config.editable) {
					return false;
				}

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

				var state = getStateByImageElement(elem);

				if (!state.focusable) {
					return false;
				}

				if (eventState.target) {

					if (elem.isSameNode(eventState.target)) {
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

				if (!config.editable) {
					return false;
				}

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

				preEvent();

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

				if (!state.movable) {
					return false;
				}

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

				var handle = eventState.handle;
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

				if (config.move) {
					config.move(null, state.id);
				}
			},

			endMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				preEvent();

				var elem = eventState.target;
				var state = getStateByImageElement(elem);

				// toggle off
		    	onMove = false;

		    	// remove event handles
				document.removeEventListener("mousemove", handlers.onMove, false);
				document.removeEventListener("mouseup", handlers.endMove, false);

				document.removeEventListener("touchmove", handlers.onMove, false);
				document.removeEventListener("touchend", handlers.endMove, false);

				if (config.move) {
					config.move(null, state.id);
				}
			},

			startRotate: function(e) {
				e.preventDefault();
				e.stopPropagation();

				preEvent();

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

				if (!state.rotatable) {
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

				if (config.move) {
					config.rotate(null, state.id);
				}
			},

			endRotate: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				preEvent();

				var elem = eventState.target;
				var state = getStateByImageElement(elem);

				// toggle off
		    	onRotate = false;

				document.removeEventListener("mousemove", handlers.onRotate, false);
				document.removeEventListener("mouseup", handlers.endRotate, false);

				document.removeEventListener("touchmove", handlers.onRotate, false);
				document.removeEventListener("touchend", handlers.endRotate, false);

				if (config.rotate) {
					config.rotate(null, state.id);
				}
			},

			// deprecated
			startFlip: function(e) {
				e.preventDefault();
				e.stopPropagation();

				preEvent();

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

				if (!state.flippable) {
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

				eventState.handle = handle;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;

				onFlip = true;

				document.addEventListener("mousemove", handlers.onFlip, false);
				document.addEventListener("mouseup", handlers.endFlip, false);

				document.addEventListener("touchmove", handlers.onFlip, false);
				document.addEventListener("touchend", handlers.endFlip, false);

			},

			// deprecated
			onFlip: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				var handle = eventState.handle;
				var elem = eventState.target;
				var state = getStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
				var mouseX;
				var mouseY;
				var rotateX;
				var rotateY;
				var degX;
				var degY;

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - eventState.mouseX;
					mouseY = e.clientY - eventState.mouseY;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - eventState.mouseX;
					mouseY = e.touches[0].clientY - eventState.mouseY;
				} else {
					return false;
				}

				if (state.scaleX === -1) {
					mouseX = -mouseX;
				}

				if (state.scaleY === -1) {
					mouseY = -mouseY;
				}

				if (handle.classList.contains("canvaaas-flip-n")) {
					degX = 180 * mouseY / state.height;
				} else if (handle.classList.contains("canvaaas-flip-s")) {
					mouseY = -mouseY;
					degX = 180 * mouseY / state.height;
				} else if (handle.classList.contains("canvaaas-flip-e")) {
					mouseX = -mouseX;
					degY = 180 * mouseX / state.width;
				} else if (handle.classList.contains("canvaaas-flip-w")) {
					degY = 180 * mouseX / state.width;
				} else if (handle.classList.contains("canvaaas-flip-ne")) {
					mouseX = -mouseX;
					degX = 180 * mouseY / state.height;
					degY = 180 * mouseX / state.width;
				} else if (handle.classList.contains("canvaaas-flip-sw")) {
					mouseY = -mouseY;
					degX = 180 * mouseY / state.height;
					degY = 180 * mouseX / state.width;
				} else if (handle.classList.contains("canvaaas-flip-nw")) {
					degX = 180 * mouseY / state.height;
					degY = 180 * mouseX / state.width;
				} else if (handle.classList.contains("canvaaas-flip-se")) {
					mouseY = -mouseY;
					mouseX = -mouseX;
					degX = 180 * mouseY / state.height;
					degY = 180 * mouseX / state.width;
				} else {
					return false;
				}

				if (degX < 0) {
					degX = 0;
				}

				if (degY < 0) {
					degY = 0;
				}

				state.rotateX = degX;
				state.rotateY = degY;

				setElement(elem, state);
				setElement(clone, state);

				if (config.flip) {
					config.flip(null, state.id);
				}
			},

			// deprecated
			endFlip: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				var elem = eventState.target;
				var state = getStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);

				if (state.rotateX > 90) {
					state.scaleY *= -1;
					state.rotate *= -1;
				}

				if (state.rotateY > 90) {
					state.scaleX *= -1;
					state.rotate *= -1;
				}

		    	onFlip = false;
		    	eventState.handle = undefined;

		    	state.rotateX = undefined;
		    	state.rotateY = undefined;

				setElement(elem, state);
				setElement(clone, state);

				document.removeEventListener("mousemove", handlers.onFlip, false);
				document.removeEventListener("mouseup", handlers.endFlip, false);

				document.removeEventListener("touchmove", handlers.onFlip, false);
				document.removeEventListener("touchend", handlers.endFlip, false);

				if (config.flip) {
					config.flip(null, state.id);
				}
			},

			startResize: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				preEvent();

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

				if (!state.resizable) {
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

				if (!config.editableAspectRatio || e.shiftKey) {
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

				if (config.resize) {
					config.resize(null, state.id);
				}
			},

			endResize: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				preEvent();

				var elem = eventState.target;
				var state = getStateByImageElement(elem);

				// toggle off
		    	onResize = false;

		    	// remove event handles
				document.removeEventListener("mousemove", handlers.onResize, false);
				document.removeEventListener("mouseup", handlers.endResize, false);

				document.removeEventListener("touchmove", handlers.onResize, false);
				document.removeEventListener("touchend", handlers.endResize, false);

				if (config.resize) {
					config.resize(null, state.id);
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

				if (!state.resizable) {
					return false;
				}

				minW = config.minImageWidth;
				minH = config.minImageHeight;

				ratio = e.deltaY * 0.002;
				diffX = state.width * ratio;
				diffY = state.height * ratio;
				width = state.width + diffX;
				height = state.height + diffY;

				if (!onZoom) {

					preEvent();

					// toggle on
					onZoom = true;

					// save cache
					pushCache(state.id);
					eventSubCaches = [];

				} else {
					if (config.resize) {
						config.resize(null, state.id);
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

					if (config.resize) {
						config.resize(null, state.id);
					}
				}, 300);
			},

			startPinchZoom: function(e){
			    e.preventDefault();
				e.stopPropagation();

				preEvent();

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

				if (!state.resizable) {
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

				if (config.resize) {
					config.resize(null, state.id);
				}
			},

			endPinchZoom: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				preEvent();

				var elem = eventState.target;
				var state = getStateByImageElement(elem);

				// toggle off
		    	onZoom = false;

		    	// remove event handles
				document.removeEventListener("touchmove", handlers.onPinchZoom, false);
				document.removeEventListener("touchend", handlers.endPinchZoom, false);

				if (config.resize) {
					config.resize(null, state.id);
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

				containerElement.style.width = ""; // auto

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

		        if (config.canvas) {
					config.canvas(null, canvasState);
				}
			},

		};

		// 
		// methods
		// 

		function setElement(elem, state) {

			if (!elem || !state) {
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

		function setObject(srcObj, destiObj) {
			if (!srcObj || !destiObj) {
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
			var clone = getCloneElementById(id);
			var state = getStateById(id);
			var tmpState = {};
			setObject(state, tmpState);

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
			var clone = getCloneElementById(id);
			var state = getStateById(id);
			var tmpState = {};
			setObject(state, tmpState);

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
			var elem = getImageElementById(id)
			var clone = getCloneElementById(id);

			elem.classList.add("active");
			clone.classList.add("active");

			elem.removeEventListener("mousedown", handlers.startFocusIn, false);
			elem.removeEventListener("touchstart", handlers.startFocusIn, false);

			elem.addEventListener("mousedown", handlers.startMove, false);
			elem.addEventListener("touchstart", handlers.startMove, false);
			elem.addEventListener("wheel", handlers.startWheelZoom, false);

			document.addEventListener("keydown", handlers.keydown, false);

			document.addEventListener("mousedown", handlers.isOutside, false);
			document.addEventListener("touchstart", handlers.isOutside, false);
			document.addEventListener("scroll", handlers.onScroll, false);


			eventState.target = elem;

			return true;
		};

		function setFocusOut(id) {
			if (!id) {
				return false;
			}
			var elem = getImageElementById(id)
			var clone = getCloneElementById(id);

			elem.classList.remove("active");
			clone.classList.remove("active");

			elem.removeEventListener("mousedown", handlers.startMove, false);
			elem.removeEventListener("touchstart", handlers.startMove, false);
			elem.removeEventListener("wheel", handlers.startWheelZoom, false);

			elem.addEventListener("mousedown", handlers.startFocusIn, false);
			elem.addEventListener("touchstart", handlers.startFocusIn, false);

			document.removeEventListener("keydown", handlers.keydown, false);

			document.removeEventListener("mousedown", handlers.isOutside, false);
			document.removeEventListener("touchstart", handlers.isOutside, false);
			document.removeEventListener("scroll", handlers.onScroll, false);

			eventState.target = undefined;

			return true;
		};

		function setIndex(cb) {
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
					state.index > config.minAutoIndex - 1 &&
					state.index < config.maxAutoIndex
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
					if (cb) {
						return cb(errMsg.INDEXING);
					}
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
					if (cb) {
						return cb(errMsg.INDEXING);
					}
				}
			});

			imageStates = tmpStates;
			imageElements = tmpImageElements;
			cloneElements = tmpCloneElements;

			if (cb) {
				return cb(null);
			}
		};

		function preEvent() {
			// save container offset
			var offset = containerElement.getBoundingClientRect();
			containerState.left = offset.left;
			containerState.top = offset.top;
		};

		function getIndexById(id) {
			if (!id) {
				return false;
			}
			return imageStates.findIndex(function(state){
				if (state.id === id) {
					return state;
				}
			});
		};

		function getIndexByImageElement(elem) {
			if (!elem) {
				return false;
			}
			if (!elem.classList.contains("canvaaas-image")) {
				return false;
			}
			var id = elem.id.split("-").pop();
			return imageStates.findIndex(function(state){
				if (state.id === id) {
					return state;
				}
			});
		};

		function getIdByImageElement(elem) {
			if (!elem) {
				return false;
			}
			if (!elem.classList.contains("canvaaas-image")) {
				return false;
			}
			return elem.id.split("-").pop();
		}

		function getImageElementById(id) {
			if (!id) {
				return false;
			}
			return document.getElementById(imageId + id);
		};

		function getImageElementByFilename(str) {
			if (!str) {
				return false;
			}
			var state = imageStates.find(function(state){
				if (state.filename === str) {
					return state;
				}
			});

			return document.getElementById(imageId + state.id);
		};

		function removeImageElementById(id) {
			if (!id) {
				return false;
			}
			var elem = document.getElementById(imageId + id);
			var seq = imageElements.findIndex(function(candidateElement){
				if (candidateElement.isSameNode(elem)) {
					return candidateElement;
				}
			});
			if (seq === undefined || seq === null) {
				return false;
			}
			imageElements.splice(seq, 1);

			elem.parentNode.removeChild(elem);

			return true;
		};

		function removeImageElementByImageElement(elem) {
			if (!elem) {
				return false;
			}
			if (!elem.classList.contains("canvaaas-image")) {
				return false;
			}
			var seq = imageElements.findIndex(function(candidateElement){
				if (candidateElement.isSameNode(elem)) {
					return candidateElement;
				}
			});
			if (seq === undefined || seq === null) {
				return false;
			}
			imageElements.splice(seq, 1);

			elem.parentNode.removeChild(elem);

			return true;
		};

		function getStateById(id) {
			if (!id) {
				return false;
			}
			return imageStates.find(function(state){
				if (state.id === id) {
					return state;
				}
			});
		};

		function getStateByImageElement(elem) {
			if (!elem) {
				return false;
			}
			if (!elem.classList.contains("canvaaas-image")) {
				return false;
			}
			var id = elem.id.split("-").pop();

			return imageStates.find(function(state){
				if (state.id === id) {
					return state;
				}
			});
		};

		function getImageStateByFilename(str) {
			if (!str) {
				return false;
			}
			return imageStates.find(function(state){
				if (state.filename === str) {
					return state;
				}
			});
		};

		function removeImageStateById(id) {
			if (!id) {
				return false;
			}
			var seq = imageStates.findIndex(function(state){
				if (state.id === id) {
					return state;
				}
			});
			if (seq === undefined || seq === null) {
				return false;
			}
			imageStates.splice(seq, 1);

			return true;
		};

		function removeImageStateByImageElement(elem) {
			if (!elem) {
				return false;
			}
			if (!elem.classList.contains("canvaaas-image")) {
				return false;
			}
			var id = elem.id.split("-").pop();
			var seq = imageStates.findIndex(function(state){
				if (state.id === id) {
					return state;
				}
			});
			if (seq === undefined || seq === null) {
				return false;
			}
			imageStates.splice(seq, 1);

			return true;
		};

		function getCloneElementById(id) {
			if (!id) {
				return false;
			}
			return document.getElementById(cloneId + id);
		};

		function getCloneElementByImageElement(elem) {
			if (!elem) {
				return false;
			}
			if (!elem.classList.contains("canvaaas-image")) {
				return false;
			}
			var id = elem.id.split("-").pop();

			return document.getElementById(cloneId + id);
		};

		function removeCloneElementById(id) {
			if (!id) {
				return false;
			}
			var elem = document.getElementById(cloneId + id);
			var seq = cloneElements.findIndex(function(candidateElement){
				if (candidateElement.isSameNode(elem)) {
					return candidateElement;
				}
			});
			if (seq === undefined || seq === null) {
				return false;
			}
			cloneElements.splice(seq, 1);

			elem.parentNode.removeChild(elem);

			return true;
		};

		function removeCloneElementByImageElement(elem) {
			if (!elem) {
				return false;
			}
			if (!elem.classList.contains("canvaaas-image")) {
				return false;
			}
			var id = elem.id.split("-").pop();
			var elem = document.getElementById(cloneId + id);
			var seq = cloneElements.findIndex(function(candidateElement){
				if (candidateElement.isSameNode(elem)) {
					return candidateElement;
				}
			});
			if (seq === undefined || seq === null) {
				return false;
			}
			cloneElements.splice(seq, 1);

			elem.parentNode.removeChild(elem);

			return true;
		};

		function getDegrees(x, y) {
			// return Math.atan2(y, x) * 180 / Math.PI;
			var radians = Math.atan2(y, x) * 180 / Math.PI;

			return (-radians + 450) % 360;
		};

		function getFittedRect(width, height, aspectRatio, fitType) {
			var t = fitType || "contain";
			var candidateWidth = height * aspectRatio;
			var w;
			var h;

			if (
				t === "contain" && candidateWidth > width ||
				t === "cover" && candidateWidth < width
			) {
				w = width;
				h = width / aspectRatio;
			} else {
				w = height * aspectRatio;
				h = height;
			}

			return [w, h];
		};

		function getRotatedRect(width, height, angle) {
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
		};

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
		};

		function getDiagonal(w, h) {
			return Math.sqrt( Math.pow(w, 2) + Math.pow(h, 2) );
		};

		function getDirection(candidateDirection, scaleX, scaleY) {
			var flipX;
			var flipY;
			var direction;

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
				candidateDirection === "n" ||
				candidateDirection === "N" ||
				candidateDirection === "north" ||
				candidateDirection === "North"
			) {
				direction = 0;
			} else if (
				candidateDirection === "ne" ||
				candidateDirection === "NE" ||
				candidateDirection === "north-east" ||
				candidateDirection === "North-East"
			) {
				direction = 45;
			} else if (
				candidateDirection === "e" ||
				candidateDirection === "E" ||
				candidateDirection === "east" ||
				candidateDirection === "East"
			) {
				direction = 90;
			} else if (
				candidateDirection === "se" ||
				candidateDirection === "SE" ||
				candidateDirection === "south-east" ||
				candidateDirection === "South-East"
			) {
				direction = 135;
			} else if (
				candidateDirection === "s" ||
				candidateDirection === "S" ||
				candidateDirection === "south" ||
				candidateDirection === "South"
			) {
				direction = 180;
			} else if (
				candidateDirection === "sw" ||
				candidateDirection === "SW" ||
				candidateDirection === "south-west" ||
				candidateDirection === "South-West"
			) {
				direction = 225;
			} else if (
				candidateDirection === "w" ||
				candidateDirection === "W" ||
				candidateDirection === "west" ||
				candidateDirection === "West"
			) {
				direction = 270;
			} else if (
				candidateDirection === "nw" ||
				candidateDirection === "NW" ||
				candidateDirection === "north-west" ||
				candidateDirection === "North-West"
			) {
				direction = 315;
			}

			if (flipX === false && flipY === false) {
				if (direction === 0) {
					return "n";
				} else if (direction === 45) {
					return "ne";
				} else if (direction === 90) {
					return "e";
				} else if (direction === 135) {
					return "se";
				} else if (direction === 180) {
					return "s";
				} else if (direction === 225) {
					return "sw";
				} else if (direction === 270) {
					return "w";
				} else if (direction === 315) {
					return "nw";
				} else {
					return false;
				}
			} else if (flipX === true && flipY === false) {
				if (direction === 0) {
					return "n";
				} else if (direction === 45) {
					return "nw";
				} else if (direction === 90) {
					return "w";
				} else if (direction === 135) {
					return "sw";
				} else if (direction === 180) {
					return "s";
				} else if (direction === 225) {
					return "se";
				} else if (direction === 270) {
					return "e";
				} else if (direction === 315) {
					return "ne";
				}
			} else if (flipX === false && flipY === true) {
				if (direction === 0) {
					return "s";
				} else if (direction === 45) {
					return "se";
				} else if (direction === 90) {
					return "e";
				} else if (direction === 135) {
					return "ne";
				} else if (direction === 180) {
					return "n";
				} else if (direction === 225) {
					return "nw";
				} else if (direction === 270) {
					return "w";
				} else if (direction === 315) {
					return "sw";
				} else {
					return false;
				}
			} else if (flipX === true && flipY === true) {
				if (direction === 0) {
					return "s";
				} else if (direction === 45) {
					return "sw";
				} else if (direction === 90) {
					return "w";
				} else if (direction === 135) {
					return "nw";
				} else if (direction === 180) {
					return "n";
				} else if (direction === 225) {
					return "ne";
				} else if (direction === 270) {
					return "e";
				} else if (direction === 315) {
					return "se";
				} else {
					return false;
				}
			} else {
				return false;
			}
		}

		function getShortId() {
		    var firstPart = (Math.random() * 46656) | 0;
		    var secondPart = (Math.random() * 46656) | 0;
		    firstPart = ("000" + firstPart.toString(36)).slice(-3);
		    secondPart = ("000" + secondPart.toString(36)).slice(-3);
		    return firstPart + secondPart;
		};

		function isNumeric(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		};

		function isMobile() {
			var check = false;
			(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
			return check;
		};

		function isMobileOrTablet() {
			var check = false;
			(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
			return check;
		};

		function getOS() {
			var userAgent = window.navigator.userAgent,
				platform = window.navigator.platform,
				macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
				windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
				iosPlatforms = ['iPhone', 'iPad', 'iPod'],
				os = null;

			if (macosPlatforms.indexOf(platform) !== -1) {
				os = 'Mac';
			} else if (iosPlatforms.indexOf(platform) !== -1) {
				os = 'iOS';
			} else if (windowsPlatforms.indexOf(platform) !== -1) {
				os = 'Windows';
			} else if (/Android/.test(userAgent)) {
				os = 'Android';
			} else if (!os && /Linux/.test(platform)) {
				os = 'Linux';
			}

			return os;
		};

		function isURL(str) {
			var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
			'(\\#[-a-z\\d_]*)?$','i'); // fragment locator
			return !!pattern.test(str);
		};

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
		};

		function getViewportSizes() {
			var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
			var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			return [w, h]
		}

		function getScrollbarWidth() {

			var tmp = document.createElement('div');
			tmp.style.overflow = 'scroll';

			document.body.appendChild(tmp);

			var scrollbarWidth = tmp.offsetWidth - tmp.clientWidth;

			document.body.removeChild(tmp);

			return scrollbarWidth;
		};

		function getExtension(str) {
			return str.split('.').pop();
		};

		function getFilename(str) {
			return str.replace(/^.*[\\\/]/, '');
			// return str.substring(url.lastIndexOf('/')+1);
		};

		function drawCanvas() {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			canvas.width = Math.floor(canvasState.originalWidth);
			canvas.height = Math.floor(canvasState.originalHeight);
			ctx.fillStyle = config.fillColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.save();
			// ctx.imageSmoothingQuality = config.imageSmoothingQuality;
			// ctx.imageSmoothingEnabled = config.imageSmoothingEnabled;
			return canvas;
		};

		function drawImage(canvas, id, cb){

			if (typeof(canvas) !== "object") {
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}
			if (typeof(id) !== "string") {
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			var elem = getImageElementById(id);
			var state = getStateById(id);
			var originalImg = elem.querySelector("img");

			var virtualImg = new Image();
			virtualImg.src = originalImg.src;

			virtualImg.onerror = function(e) {
				if (cb) {
					cb(errMsg.FAILLOAD);
				}
				return false;
			}
			virtualImg.onload = function(e) {
				var maxCanvasWidth;
				var maxCanvasHeight;
				var minCanvasWidth;
				var minCanvasHeight;

				// check mobile
				if (!isMobile()) {
					maxCanvasWidth = 9999;
					maxCanvasHeight = 9999;
				} else {
					maxCanvasWidth = config.maxImageWidth;
					maxCanvasHeight = config.maxImageHeight;
				}
				minCanvasWidth = config.minImageWidth;
				minCanvasHeight = config.minImageHeight;

				// original
				var scaleRatio = canvasState.width / canvasState.originalWidth;
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
				var rotatedWidth = Math.floor( adjSizes[0] );
				var rotatedHeight = Math.floor( adjSizes[1] );
				var rotatedLeft = Math.floor( adjX - (adjSizes[0] * 0.5) );
				var rotatedTop = Math.floor( adjY - (adjSizes[1] * 0.5) );

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
				tmpCtx.imageSmoothingQuality = config.imageSmoothingQuality;
				tmpCtx.imageSmoothingEnabled = config.imageSmoothingEnabled;

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
	 				return cb(null, true);
		 		}
			}
		};

		function setCanvas(w, h) {

			// config
			var newObj = {
				canvasWidth: w,
				canvasHeight: h
			}

			setObject(newObj, config);

			// container
			initContainer();

        	// canvas
			initCanvas();

			return true;
		}

		function initImage(id) {
			var elem = getImageElementById(id)
			var clone = getCloneElementById(id);
			var state = getStateById(id);

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
			state.movable = true;
			state.resizable = true;
			state.rotatable = true;
			state.flippable = true;
			state.drawable = true;

			setElement(elem, state);
			setElement(clone, state);
		};

		function renderImage(file, cb) {

			if (!file) {
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			if (imageElements.length > config.maxNumberOfImages - 1) {
				if (cb) {
					cb(errMsg.IMAGE_LIMIT);
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
			} else {
				// url
				typ = "url";
				ext = getExtension(file);
				src = file + "?" + new Date().getTime(); // fix ios refresh cache error, cachebreaker
				filename = getFilename(file);
			}

			// check mimeType
			if (config.extensions.indexOf(ext) < 0) {
				if (cb) {
					cb(errMsg.MIMETYPE);
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
					cb(errMsg.DUPLICATE);
				}
				return false;
			}

			// start load
			newImage.src = src;

			newImage.onerror = function(e) {
				if (cb) {
					cb(errMsg.FAILLOAD);
				}
				return false;
			}

			newImage.onload = function(e){

				var nextIndex = 0;
				imageStates.forEach(function(state){
					if (
						state.index > config.minAutoIndex - 1 &&
						state.index < config.maxAutoIndex
					) {
						if (nextIndex < state.index) {
							nextIndex = state.index;
						}
					}
				});

				var newState = {};

				var newElem = document.createElement("div");
				newElem.classList.add("canvaaas-image");
				newElem.id = imageId + id;
				newElem.innerHTML = imageTemplate;

				var newImg = newElem.querySelector("img");
				var rotateHandles = newElem.querySelectorAll("div.canvaaas-rotate-handle");
				var resizeHandles = newElem.querySelectorAll("div.canvaaas-resize-handle");
				var flipHandles = newElem.querySelectorAll("div.canvaaas-flip-handle");

				newImg.src = newImage.src;

				rotateHandles.forEach(function(handleElem){
					handleElem.addEventListener("mousedown", handlers.startRotate, false);
					handleElem.addEventListener("touchstart", handlers.startRotate, false);
				});

				resizeHandles.forEach(function(handleElem){
					handleElem.addEventListener("mousedown", handlers.startResize, false);
					handleElem.addEventListener("touchstart", handlers.startResize, false);
				});

				flipHandles.forEach(function(handleElem){
					handleElem.addEventListener("mousedown", handlers.startFlip, false);
					handleElem.addEventListener("touchstart", handlers.startFlip, false);
				});

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
				newState.movable = true;
				newState.resizable = true;
				newState.rotatable = true;
				newState.flippable = true;
				newState.drawable = true;

				newState.uploadedAt = Date.now();

				canvasElement.appendChild(newElem);

				setElement(newElem, newState);

				imageStates.push(newState);

				imageElements.push(newElem);

				// mirror
				var newClone = newElem.cloneNode();
				var newElemHTML = newElem.innerHTML;
				var newOverlay = document.createElement("div");
				newOverlay.classList.add("canvaaas-overlay");

				newClone.innerHTML = newElemHTML;
				newClone.id = cloneId + id;
				newClone.classList.replace("canvaaas-image", "canvaaas-clone");
				newClone.insertBefore(newOverlay, newClone.querySelector("img").nextSibling); // fix index, overlay < handles
				mirrorElement.appendChild(newClone);
				cloneElements.push(newClone);

				newElem.addEventListener("mousedown", handlers.startFocusIn, false);
				newElem.addEventListener("touchstart", handlers.startFocusIn, false);

				setIndex(function(err){
					if (err) {
						if (cb) {
							cb(err);
						}
						return false;
					}
					if (cb) {
						return cb(null, id);
					}
				});				
			}
		}

		function removeImage(id, cb) {
			if (!id) {
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			var elem = getImageElementById(id);

			if (!elem) {
				if (cb) {
					cb(errMsg.ELEMENT);
				}
				return false;
			}

			if (eventState.target) {
				if (elem.isSameNode(eventState.target)) {
					setFocusOut(id);
				}
			}

			var res;
			// #1 remove clone element
			res = removeCloneElementById(id);
			if (!res) {
				if (cb) {
					cb(errMsg.UNKNOWN);
				}
				return false;
			}

			// #2 remove image element
			res = removeImageElementById(id);
			if (!res) {
				if (cb) {
					cb(errMsg.UNKNOWN);
				}
				return false;
			}

			// #3 remove image state
			res = removeImageStateById(id);
			if (!res) {
				if (cb) {
					cb(errMsg.UNKNOWN);
				}
				return false;
			}
			

			if (cb) {
				cb(null, id);
			}
			return id;
		}

		function initContainer() {

			if (!containerElement) {
				console.log("Container not found");
				return false;
			}

			if (!config.canvasWidth) {
				console.log("Canvas width not found");
				return false;
			}

			if (!config.canvasHeight) {
				console.log("Canvas height not found");
				return false;
			}

			var scrollbarWidth = getScrollbarWidth();
			var viewportSizes = getViewportSizes();
			var viewportWidth = viewportSizes[0];
			var viewportHeight = viewportSizes[1];

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

			var aspectRatio = config.containerAspectRatio || config.canvasWidth / config.canvasHeight;
			var width = containerElement.offsetWidth;
			var height = containerElement.offsetWidth / aspectRatio;
			var canvasAspectRatio = config.canvasWidth / config.canvasHeight;

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

			var sizes = getFittedRect(
				width,
				height,
				aspectRatio
			);

			var adjWidth = Math.min(maxSizes[0], Math.max(minSizes[0], sizes[0]));
			var adjHeight = Math.min(maxSizes[1], Math.max(minSizes[1], sizes[1]));

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

			if (!canvasElement) {
				console.log("Canvas not found");
				return false;
			}

			if (!containerState.width) {
				console.log("Container width not found");
				return false;
			}

			if (!containerState.height) {
				console.log("Container height not found");
				return false;
			}

        	var originalWidth = config.canvasWidth;
        	var originalHeight = config.canvasHeight;
			var aspectRatio = originalWidth / originalHeight;

			var fittedSizes = getFittedRect(
				containerState.width,
				containerState.height,
				aspectRatio
			);

			var width = fittedSizes[0];
			var height = fittedSizes[1];
			var axisX = 0.5 * containerState.width;
			var axisY = 0.5 * containerState.height;

			canvasState.originalWidth = originalWidth;
			canvasState.originalHeight = originalHeight;
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

		myObject.init = function(target, preConfig) {

			if (!target || typeof(target) !== "object") {
				alert("canvaaas.init( /* target */ ) error");
				return false;
			}

			if (isMobile()) {
				config.editableAspectRatio = false;
			}

			if (preConfig) {
				if (typeof(preConfig) === "object") {
					setObject(preConfig, config);
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
	        initContainer();

	        // set canvas
	        initCanvas();

        	// set style
			if (config.overlay === true) {
				mirrorElement.classList.add("active");
			}

	        // set events
	        // window.addEventListener("resize", handlers.debounce( handlers.resizeWindow, 100 ), false);
			window.addEventListener("resize", handlers.resizeWindow, false);

			// document.addEventListener("mousedown", handlers.isOutside, false);
			// document.addEventListener("touchstart", handlers.isOutside, false);

			// document.addEventListener("scroll", handlers.onScroll, false);


			containerElement.addEventListener('dragenter', handlers.preventDefaults, false);
			containerElement.addEventListener('dragleave', handlers.preventDefaults, false);
			containerElement.addEventListener('dragover', handlers.preventDefaults, false);
			containerElement.addEventListener('drop', handlers.preventDefaults, false);
			containerElement.addEventListener('drop', handlers.dropImages, false);


			// recover target inner
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
				}
			}

			console.log("canvaaas.js initialized", config);
		}

		myObject.uploadFiles = function(self, cb) {
			var files = self.files;

			if (typeof(self) !== "object") {
				if (config.upload) {
					config.upload(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.upload) {
					config.upload(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				} 
				return false;
			}

			if (onUpload === true) {
				if (config.upload) {
					config.upload(errMsg.PROGRESS);
				}
				if (cb) {
					cb(errMsg.PROGRESS);
				} 
				return false;
			}

			onUpload = true;

			var results = [];
			var index = files.length;
			var count = 0;

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
					config.upload(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.upload) {
					config.upload(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				} 
				return false;
			}

			if (onUpload === true) {
				if (config.upload) {
					config.upload(errMsg.PROGRESS);
				}
				if (cb) {
					cb(errMsg.PROGRESS);
				} 
				return false;
			}

			var arr = [];
			if (!Array.isArray(imageUrls)) {
				arr[0] = imageUrls;
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
				if (config.move) {
					config.move(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (typeof(x) !== "number") {
				if (config.move) {
					config.move(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.move) {
					config.move(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				} 
				return false;
			}

			if (!elem) {
				if (config.move) {
					config.move(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (!state.movable) {
				if (config.move) {
					config.move(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
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

			if (config.move) {
				config.move(null, state.id);
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
				if (config.move) {
					config.move(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (typeof(y) !== "number") {
				if (config.move) {
					config.move(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.move) {
					config.move(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				} 
				return false;
			}

			if (!elem) {
				if (config.move) {
					config.move(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (!state.movable) {
				if (config.move) {
					config.move(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
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

			if (config.move) {
				config.move(null, state.id);
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
				if (config.move) {
					config.move(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (
				typeof(x) === "object" ||
				typeof(y) === "object"
			) {
				if (config.move) {
					config.move(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.move) {
					config.move(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				} 
				return false;
			}

			if (!elem) {
				if (config.move) {
					config.move(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 

				return false;
			}

			if (!state.movable) {
				if (config.move) {
					config.move(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			if (x === 0 || x === "l" || x === "left") {
				state.x = (canvasState.width * 0) + (state.width * 0.5);
			} else if (x === 0.5 || x === "c" || x === "center") {
				state.x = (canvasState.width * 0.5);
			} else if (x === 1 || x === "r" || x === "right") {
				state.x = (canvasState.width * 1) - (state.width * 0.5);
			} else if (x !== null && x !== undefined) {
				state.x = x;
			}

			if (y === 0 || y === "t" || y === "top") {
				state.y = (canvasState.height * 0) + (state.height * 0.5);
			} else if (y === 0.5 || y === "c" || y === "center" || y === "middle") {
				state.y = (canvasState.height * 0.5);
			} else if (y === 1 || y === "b" || y === "bottom") {
				state.y = (canvasState.height * 1) - (state.height * 0.5);
			} else if (y !== null && y !== undefined) {
				state.y = y;
			}

			// adjust state
			setElement(elem, state);
			setElement(clone, state);

			if (config.move) {
				config.move(null, state.id);
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
				if (config.resize) {
					config.resize(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (typeof(ratio) !== "number") {
				if (config.resize) {
					config.resize(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.resize) {
					config.resize(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.resize) {
					config.resize(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (!state.resizable) {
				if (config.resize) {
					config.resize(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
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

			if (config.resize) {
				config.resize(null, state.id);
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
				if (config.resize) {
					config.resize(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (
				typeof(ratio) === "object" || 
				typeof(ratio) === "undefined"
			) {
				if (config.resize) {
					config.resize(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.resize) {
					config.resize(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.resize) {
					config.resize(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (!state.resizable) {
				if (config.resize) {
					config.resize(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
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
					if (config.resize) {
						config.resize(errMsg.ARGUMENT);
					}
					if (cb) {
						cb(errMsg.ARGUMENT);
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

			if (config.resize) {
				config.resize(null, state.id);
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
				if (config.rotate) {
					config.rotate(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (typeof(deg) !== "number") {
				if (config.rotate) {
					config.rotate(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.rotate) {
					config.rotate(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.rotate) {
					config.rotate(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (!state.rotatable) {
				if (config.rotate) {
					config.rotate(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
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

			if (config.rotate) {
				config.rotate(null, state.id);
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
				if (config.rotate) {
					config.rotate(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (typeof(deg) !== "number") {
				if (config.rotate) {
					config.rotate(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.rotate) {
					config.rotate(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.rotate) {
					config.rotate(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (!state.rotatable) {
				if (config.rotate) {
					config.rotate(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
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

			if (config.rotate) {
				config.rotate(null, state.id);
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
				if (config.flip) {
					config.flip(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.flip) {
					config.flip(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.flip) {
					config.flip(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (!state.flippable) {
				if (config.flip) {
					config.flip(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
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

			if (config.flip) {
				config.flip(null, state.id);
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
				if (config.flip) {
					config.flip(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.flip) {
					config.flip(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.flip) {
					config.flip(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (!state.flippable) {
				if (config.flip) {
					config.flip(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
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

			if (config.flip) {
				config.flip(null, state.id);
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
				if (config.flip) {
					config.flip(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (
				typeof(x) !== "number" ||
				typeof(y) !== "number"
			) {
				if (config.flip) {
					config.flip(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.flip) {
					config.flip(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.flip) {
					config.flip(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (!state.flippable) {
				if (config.flip) {
					config.flip(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
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

			if (config.flip) {
				config.flip(null, state.id);
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
				if (config.opacity) {
					config.opacity(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (typeof(num) !== "number") {
				if (config.opacity) {
					config.opacity(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.opacity) {
					config.opacity(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.opacity) {
					config.opacity(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
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

			if (config.opacity) {
				config.opacity(null, state.id);
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
				if (config.index) {
					config.index(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.index) {
					config.index(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.index) {
					config.index(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// check index limit
			if (state.index > config.maxAutoIndex) {
				if (config.index) {
					config.index(errMsg.INDEX_LIMIT);
				}
				if (cb) {
					cb(errMsg.INDEX_LIMIT);
				}
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// check next index
			if (imageStates[state.index + 1] !== undefined) {
				if (
					imageStates[state.index + 1].index > config.minAutoIndex - 1 &&
					imageStates[state.index + 1].index < config.maxAutoIndex
				) {
					imageStates[state.index + 1].index = state.index;
				}
			}

			// save state
			state.index += 1;

			// adjust state
			setElement(elem, state);
			setElement(clone, state);

			// adjust index
			setIndex(function(err){
				if (err) {
					if (config.index) {
						config.index(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}
				if (config.index) {
					config.index(null, state.id);
				}
				if (cb) {
					cb(null, state.id);
				}
			});
		}

		myObject.indexDown = function(id, cb) {
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.index) {
					config.index(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.index) {
					config.index(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.index) {
					config.index(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// check index limit
			if (state.index - 1 < config.minAutoIndex) {
				if (config.index) {
					config.index(errMsg.INDEX_LIMIT);
				}
				if (cb) {
					cb(errMsg.INDEX_LIMIT);
				}
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// check previous state
			if (imageStates[state.index - 1] !== undefined) {
				if (
					imageStates[state.index - 1].index > config.minAutoIndex - 1 &&
					imageStates[state.index - 1].index < config.maxAutoIndex
				) {
					imageStates[state.index - 1].index = state.index;
				}
			}

			// save state
			state.index -= 1;

			// adjust state
			setElement(elem, state);
			setElement(clone, state);

			// adjust index
			setIndex(function(err){
				if (err) {
					if (config.index) {
						config.index(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}
				if (config.index) {
					config.index(null, state.id);
				}
				if (cb) {
					cb(null, state.id);
				}
			});
		}

		myObject.indexTo = function(id, num, cb) {
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.index) {
					config.index(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.index) {
					config.index(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.index) {
					config.index(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (typeof(num) !== "number") {
				if (config.index) {
					config.index(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
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

			// adjust index
			setIndex(function(err){
				if (err) {
					if (config.index) {
						config.index(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}
				if (config.index) {
					config.index(null, state.id);
				}
				if (cb) {
					cb(null, state.id);
				}
			});
		}

		myObject.show = function(id, cb) {
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.visibility) {
					config.visibility(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.visibility) {
					config.visibility(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.visibility) {
					config.visibility(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// remove class
			elem.classList.remove("hidden");
			clone.classList.remove("hidden");

			if (config.visibility) {
				config.visibility(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.hide = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.visibility) {
					config.visibility(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.visibility) {
					config.visibility(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.visibility) {
					config.visibility(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// add class
			elem.classList.add("hidden");
			clone.classList.add("hidden");

			if (eventState.target) {
				if (elem.isSameNode(eventState.target)) {
					setFocusOut(state.id);
				}
			}

			if (config.visibility) {
				config.visibility(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.getHiddens = function(cb) {

			var results = [];

			imageElements.forEach(function(elem){
				var id = getIdByImageElement(elem);
				if (elem.classList.contains("hidden")) {
					results.push(id);
				}
			})

			if (cb) {
				cb(null, results);
			}
			return results;
		}

		myObject.focusIn = function(id, cb) {
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.focus) {
					config.focus(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.focus) {
					config.focus(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.focus) {
					config.focus(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (!state.focusable) {
				if (config.focus) {
					config.focus(errMsg.AVAILABILITY);
				}
				if (cb) {
					cb(errMsg.AVAILABILITY);
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

			if (!config.editable) {
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!eventState.target) {
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			var id = getIdByImageElement(eventState.target);

			setFocusOut(id);

			if (cb) {
				cb(null, id);
			}
		}

		myObject.enableFocus = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
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

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.enableMove = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.movable = true;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.enableResize = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.resizable = true;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.enableRotate = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.rotatable = true;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.enableFlip = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.flippable = true;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.enableDraw = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.drawable = true;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.disableFocus = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			if (eventState.target) {
				if (elem.isSameNode(eventState.target)) {
					setFocusOut(id);
				}	
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.focusable = false;

			// add class
			elem.classList.add("unclickable");

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.disableMove = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.movable = false;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.disableResize = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.resizable = false;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.disableRotate = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			state.rotatable = false;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.disableFlip = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.flippable = false;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.disableDraw = function(id, cb){
			var elem = getImageElementById(id);
			var state = getStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			state.drawable = false;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.setState = function(id, obj, cb) {
			var elem = getImageElementById(id);
			var state = getStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (typeof(obj) !== "object") {
				if (config.state) {
					config.state(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.state) {
					config.state(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.state) {
					config.state(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// save cache
			pushCache(state.id);
			eventSubCaches = [];

			// save state
			setObject(obj, state);

			// adjust state
			setElement(elem, state);
			setElement(clone, state);

			// adjust index
			setIndex(function(err){
				if (err) {
					if (config.state) {
						config.state(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}
				if (config.state) {
					config.state(null, state.id);
				}
				if (cb) {
					cb(null, state.id);
				}
			});
		}

		myObject.removeOne = function(id, cb) {
			var elem = getImageElementById(id);

			if (typeof(id) !== "string") {
				if (config.remove) {
					config.remove(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				} 
				return false;
			}

			if (!config.editable) {
				if (config.remove) {
					config.remove(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!elem) {
				if (config.remove) {
					config.remove(errMsg.ELEMENT);
				}
				if (cb) {
					cb(errMsg.ELEMENT);
				} 
				return false;
			}

			// remove element
			removeImage(id, function(err, res) {
				if (err) {
					if (config.remove) {
						config.remove(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}
				if (config.remove) {
					config.remove(null, res);
				}
				if (cb) {
					cb(null, res);
				}
			});
		}

		myObject.removeAll = function(cb) {

			if (!config.editable) {
				if (config.remove) {
					config.remove(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			var arr = [];
			for (var i = imageStates.length - 1; i >= 0; i--) {
				arr.push(imageStates[i].id);
			}

			for (var i = 0; i < arr.length; i++) {
				// remove element
				removeImage(arr[i], function(err, res) {
					if (err) {
						if (config.remove) {
							config.remove(err);
						}
						if (cb) {
							cb(err);
						}
						return false;
					}
					if (config.remove) {
						config.remove(null, res);
					}
					if (cb) {
						cb(null, res);
					}
				});
			}
		}

		// 
		// container & canvas
		// 

		myObject.setCanvas = function(w, h, cb) {

			if (!config.editable) {
				if (config.canvas) {
					config.canvas(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (
				typeof(w) !== "number" ||
				typeof(h) !== "number"
			) {
				if (config.canvas) {
					config.canvas(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			var oldW = canvasState.width;
			var oldH = canvasState.height;

			setCanvas(w, h);

			var newW = canvasState.width;
			var newH = canvasState.height;
			var diffW = newW - oldW;
			var diffH = newH - newH;

			var scaleRatio = 1;
			if (diffW !== 0) {
				scaleRatio = newW / oldW;
			} else if (diffH !== 0) {
				scaleRatio = newH / oldH;
			}

			// new state adjust to images
        	imageStates.forEach(function(state){
        		var elem = getImageElementById(state.id);
        		var clone = getCloneElementById(state.id);

        		state.width *= scaleRatio;
        		state.height *= scaleRatio;

        		if (diffW !== 0 || diffH !== 0) {
					initImage(state.id);
				} else {
					setElement(elem, state);
					setElement(clone, state);	
				}
        	});

        	if (config.canvas) {
				config.canvas(null, canvasState);
			}
        	if (cb) {
				cb(null, canvasState);
			}
		}

		myObject.hideContainer = function(cb) {

			containerElement.classList.add("hidden");

			if (config.canvas) {
				config.canvas(null, canvasState);
			}
			if (cb) {
				cb(null, canvasState);
			}
		}

		myObject.showContainer = function(cb) {

			containerElement.classList.remove("hidden");

			if (config.canvas) {
				config.canvas(null, canvasState);
			}
        	if (cb) {
				cb(null, canvasState);
			}
		}

		// 
		// config
		// 

		myObject.setConfig = function(obj, cb) {

			if (!config.editable) {
				if (config.config) {
					config.config(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (typeof(obj) !== "object") {
				if (config.config) {
					config.config(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			var isCanvasResize = false;

			if (
				obj.canvasWidth || 
				obj.canvasHeight ||
				obj.minContainerWidth ||
				obj.minContainerHeight ||
				obj.maxContainerWidth ||
				obj.maxContainerHeight
			) {
				isCanvasResize = true
			}

			setObject(obj, config);

			if (isCanvasResize) {
				// container
				initContainer();

	        	// canvas
				initCanvas();
			}

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.editable = function(cb) {

			config.editable = true;

			if (config.config) {
				config.config(null, config);
			}
        	if (cb) {
				cb(null, config);
			}
		}

		myObject.uneditable = function(cb) {

			if (eventState.target) {
				var oldId = getIdByImageElement(eventState.target);
				setFocusOut(oldId);
			}

			config.editable = false;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.setFillColor = function(colour, cb) {

			if (typeof(colour) !== "string") {
				if (config.config) {
					config.config(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			if (colour.charAt(0) !== "#") {
				colour = "#" + colour;
			}

			if (colour.toLowerCase() === "alpha") {
				colour = "transparent";
			}

			config.fillColor = colour;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.unsetFillColor = function(cb) {

			config.fillColor = defaultConfiguration.fillColor;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.setMimeType = function(typ, cb) {

			if (typeof(typ) !== "string") {
				if (config.config) {
					config.config(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			if (typ.indexOf("/") < 0) {
				if (config.config) {
					config.config(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			config.mimeType = typ.toLowerCase();

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.unsetMimeType = function(cb) {

			config.mimeType = defaultConfiguration.mimeType;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.setExtentions = function(exts, cb) {

			if (!Array.isArray(exts)) {
				if (config.config) {
					config.config(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			config.extensions = exts;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.unsetExtentions = function(cb) {

			config.extensions = defaultConfiguration.extensions;

			if (cb) {
				cb(null, config);
			}
		}

		myObject.setMaxNumberOfImages = function(num, cb) {

			if (typeof(num) !== "number") {
				if (config.config) {
					config.config(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			config.maxNumberOfImages = num;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.setOverlay = function(cb){

			config.overlay = true;

			mirrorElement.classList.add("active");

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.unsetOverlay = function(cb){

			config.overlay = false;

			mirrorElement.classList.remove("active");

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.setMagnetic = function(cb){

			config.magnetic = true;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.unsetMagnetic = function(cb){

			config.magnetic = false;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.lockAspectRatio = function(cb){

			config.editableAspectRatio = false;

			if (config.config) {
				config.config(null, config);
			}
			if (cb) {
				cb(null, config);
			}
		}

		myObject.unlockAspectRatio = function(cb){

			config.editableAspectRatio = true;
			
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
			var canvas = drawCanvas();
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

			result.width = config.canvasWidth;
			result.height = config.canvasHeight;
			result.numberOfImages = drawables.length;
			result.fillColor = config.fillColor;
			result.mimeType = config.mimeType;
			result.quality = config.quality;
			result.imageSmoothingQuality = config.imageSmoothingQuality;
			result.imageSmoothingEnabled = config.imageSmoothingEnabled;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// recursive
					drawImage(canvas, drawables[count].id, function(err) {
						if (err) {
							drawResults.push({
								id: drawables[count].id,
								err: err
							});
						} else {
							drawResults.push(drawables[count]);
						}
						count++;
						recursiveFunc();
					});
				} else {
					// end
					ctx.imageSmoothingQuality = config.imageSmoothingQuality;
					ctx.imageSmoothingEnabled = config.imageSmoothingEnabled;
					ctx.restore();

					result.states = drawResults;
					result.data = canvas.toDataURL(config.mimeType, config.quality);

					if (config.draw) {
						config.draw(null, result);
					}
					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		myObject.preview = function(cb){

			if (onPreview === true) {
				if (config.preview) {
					config.preview(errMsg.ALREADY_PREVIEW);
				}
				if (cb) {
					cb(errMsg.ALREADY_PREVIEW);
				}
				return;
			}

			previewElement.innerHTML = "";

			if (eventState.target) {
				var oldId = getIdByImageElement(eventState.target);
				setFocusOut(oldId);
			}

			var canvas = drawCanvas();
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

			result.width = config.canvasWidth;
			result.height = config.canvasHeight;
			result.numberOfImages = drawables.length;
			result.fillColor = config.fillColor;
			result.mimeType = config.mimeType;
			result.quality = config.quality;
			result.imageSmoothingQuality = config.imageSmoothingQuality;
			result.imageSmoothingEnabled = config.imageSmoothingEnabled;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// draw image
					drawImage(canvas, drawables[count].id, function(err) {
						if (err) {
							drawResults.push({
								id: drawables[count].id,
								err: err
							});
						} else {
							drawResults.push(drawables[count]);
						}
						count++;
						recursiveFunc();
					});
				} else {
					// end
					ctx.imageSmoothingQuality = config.imageSmoothingQuality;
					ctx.imageSmoothingEnabled = config.imageSmoothingEnabled;
					ctx.restore();

					var data = canvas.toDataURL(config.mimeType, config.quality);

					result.states = drawResults;
					// result.data = data;

					setElement(previewElement, canvasState);

					var newImage = document.createElement("img");
					newImage.src = data;

					previewElement.appendChild(newImage);

					canvasElement.classList.add("hidden");
					mirrorElement.classList.add("hidden");
					previewElement.classList.remove("hidden");

					config.editable = false;
					onPreview = true;

					if (config.preview) {
						config.preview(null, result);
					}
					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		myObject.escapePreview = function(cb){

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

		myObject.download = function(cb){
			var canvas = drawCanvas();
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

			result.width = config.canvasWidth;
			result.height = config.canvasHeight;
			result.numberOfImages = drawables.length;
			result.fillColor = config.fillColor;
			result.mimeType = config.mimeType;
			result.quality = config.quality;
			result.imageSmoothingQuality = config.imageSmoothingQuality;
			result.imageSmoothingEnabled = config.imageSmoothingEnabled;

			recursiveFunc();

			function recursiveFunc() {
				if (count < index) {
					// draw image
					drawImage(canvas, drawables[count].id, function(err) {
						if (err) {
							drawResults.push({
								id: drawables[count].id,
								err: err
							});
						} else {
							drawResults.push(drawables[count]);
						}
						count++;
						recursiveFunc();
					});
				} else {
					// end
					ctx.imageSmoothingQuality = config.imageSmoothingQuality;
					ctx.imageSmoothingEnabled = config.imageSmoothingEnabled;
					ctx.restore();

					result.states = drawResults;
					result.data = canvas.toDataURL(config.mimeType, config.quality);

					var filename = config.filename || "Untitled";
					filename += "." + config.mimeType.split("/")[1];
					result.filename = filename;

					var link = document.createElement('a');
					link.setAttribute('href', result.data);
					link.setAttribute('download', filename);
					link.style.display = "none";

					document.body.appendChild(link);

					link.click();

					document.body.removeChild(link);

					if (config.download) {
						config.download(null, result);
					}
					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		myObject.export = function(keys, cb) {
			var requireKeys = [
				"filename"
			];

			if (!Array.isArray(keys)) {
				keys = [
					"index",
					"filename",
					"x",
					"y",
					"width",
					"height",
					"rotate",
					"scaleX",
					"scaleY",
					"opacity",
					"focusable",
					"movable",
					"resizable",
					"rotatable",
					"flippable",
					"drawable"
				];
			} else {
				requireKeys.forEach(function(k){
					if (keys.indexOf(k) < 0) {
						keys.push(k);
					}
				});
			}

			var states = [];
			imageStates.forEach(function(state){
				var tmp = {};

				keys.forEach(function(k){
					tmp[k] = state[k];
				});

				tmp.canvasState = {
					originalWidth: canvasState.originalWidth,
					originalHeight: canvasState.originalHeight,
					width: canvasState.width,
					height: canvasState.height
				};

				states.push(tmp);
			});

			if (config.export) {
				config.export(null, states);
			}
			if (cb) {
				cb(null, states);
			}
		}

		myObject.import = function(states, cb) {

			if (!config.editable) {
				if (config.import) {
					config.import(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!Array.isArray(states)) {
				if (config.import) {
					config.import(errMsg.ARGUMENT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT);
				}
				return false;
			}

			var results = [];

			for (var i = 0; i < states.length; i++){

				var exportedState = states[i];
				var exportedCanvasState = states[i].canvasState;

				var elem = getImageElementByFilename(exportedState.filename);
				var clone = getCloneElementByImageElement(elem);
				var state = getStateByImageElement(elem);

				if (!elem || !state || !clone) {
					results.push({
						key: i,
						err: "Image not found"
					})
					continue;
				}

				var aspectRatioA = exportedCanvasState.originalWidth / exportedCanvasState.originalHeight;
				var aspectRatioB = canvasState.originalWidth / canvasState.originalHeight;

				// check aspect ratio
				if (Math.abs(aspectRatioA - aspectRatioB) > 0.01) {
					results.push({
						key: i,
						err: "Canvas apsect ratio mismatch"
					})
					continue;
				}

				// save cache
				pushCache(state.id);
				eventSubCaches = [];

				var scaleRatio = canvasState.width / exportedCanvasState.width;
				var aspectRatioC = exportedState.width / exportedState.height;

				// save state
				if (
					exportedState.index !== undefined &&
					exportedState.index !== null
				) {
					state.index = exportedState.index;
				}

				if (
					exportedState.x !== undefined &&
					exportedState.x !== null
				) {
					state.x = exportedState.x * scaleRatio;
				}
				if (
					exportedState.y !== undefined &&
					exportedState.y !== null
				) {
					state.y = exportedState.y * scaleRatio;
				}
				if (
					exportedState.width !== undefined &&
					exportedState.width !== null
				) {
					state.width = exportedState.width * scaleRatio;
				}
				if (
					exportedState.height !== undefined &&
					exportedState.height !== null
				) {
					state.height = exportedState.width * scaleRatio / aspectRatioC;
				}
				if (
					exportedState.rotate !== undefined &&
					exportedState.rotate !== null
				) {
					state.rotate = exportedState.rotate;
				}
				if (
					exportedState.scaleX !== undefined &&
					exportedState.scaleX !== null
				) {
					state.scaleX = exportedState.scaleX;
				}
				if (
					exportedState.scaleY !== undefined &&
					exportedState.scaleY !== null
				) {
					state.scaleY = exportedState.scaleY;
				}
				if (
					exportedState.opacity !== undefined &&
					exportedState.opacity !== null
				) {
					state.opacity = exportedState.opacity;
				}

				if (
					exportedState.focusable === true ||
					exportedState.focusable === false
				) {
					state.focusable = exportedState.focusable;
				}

				if (
					exportedState.movable === true ||
					exportedState.movable === false
				) {
					state.movable = exportedState.movable;
				}

				if (
					exportedState.resizable === true ||
					exportedState.resizable === false
				) {
					state.resizable = exportedState.resizable;
				}

				if (
					exportedState.rotatable === true ||
					exportedState.rotatable === false
				) {
					state.rotatable = exportedState.rotatable;
				}

				if (
					exportedState.flippable === true ||
					exportedState.flippable === false
				) {
					state.flippable = exportedState.flippable;
				}

				if (
					exportedState.drawable === true ||
					exportedState.drawable === false
				) {
					state.drawable = exportedState.drawable;
				}

				// adjust state
				setElement(elem, state);
				setElement(clone, state);

				results.push(state);
			}

			// adjust index
			setIndex(function(err){
				if (err) {
					if (config.import) {
						config.import(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}
				if (config.import) {
					config.import(null, results);
				}
				if (cb) {
					cb(null, results);
				}
			});
		}

		myObject.this = function(cb){

			if (!eventState.target) {
				if (cb) {
					cb(errMsg.TARGET);
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
					cb(errMsg.TARGET);
				}
				return false;
			}

			var id = getIdByImageElement(eventState.target);
			var state = getStateById(id);

			if (cb) {
				cb(null, state);
			}
			return state;
		}

		myObject.getThisData = function(cb){

			if (!eventState.target) {
				if (cb) {
					cb(errMsg.TARGET);
				}
				return false;
			}

			var id = getIdByImageElement(eventState.target);
			var state = getStateById(id);

			if (cb) {
				cb(null, state);
			}
			return state;
		}

		myObject.getConfigData = function(cb){
			if (cb) {
				cb(null, config);
			}
			return config;
		}

		myObject.getContainerData = function(cb){
			if (cb) {
				cb(null, containerState);
			}
			return containerState;
		}

		myObject.getCanvasData = function(cb){
			if (cb) {
				cb(null, canvasState);
			}
			return canvasState;
		}

		myObject.getImageData = function(id, cb){
			if (!id) {
				if (cb) {
					cb(null, imageStates);
				}
				return imageStates;
			} else {

				var arr = [];
				var results = [];
				var errors = [];

				if (!Array.isArray(id)) {
					arr[0] = id;
				} else {
					arr = id;
				}

				arr.forEach(function(candidateId){
					var state = getStateById(id);
					if (state) {
						results.push(state);
					} else {
						errors.push(errMsg.STATE);
					}
				});

				if (cb) {
					cb(errors, results);
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
				if (config.undo) {
					config.undo(errMsg.CACHE);
				}
				if (cb) {
					cb(errMsg.CACHE);
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
			setObject(recent.state, state);

			setElement(elem, state);
			setElement(clone, state);

			setIndex(function(err){
				if (err) {
					if (config.undo) {
						config.undo(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}
				if (config.undo) {
					config.undo(null, state.id);
				}
				if (cb) {
					cb(null, state.id);
				}
			});
		}

		myObject.redo = function(cb){
			if (eventSubCaches.length < 1) {
				if (config.redo) {
					config.redo(errMsg.CACHE);
				}
				if (cb) {
					cb(errMsg.CACHE);
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
			setObject(recent.state, state);

			setElement(elem, state);
			setElement(clone, state);

			setIndex(function(err){
				if (err) {
					if (config.redo) {
						config.redo(err);
					}
					if (cb) {
						cb(err);
					}
					return false;
				}
				if (config.redo) {
					config.redo(null, state.id);
				}
				if (cb) {
					cb(null, state.id);
				}
			});
		}

		myObject.reset = function(preConfig, cb){

			window.removeEventListener("resize", handlers.resizeWindow, false);

			document.addEventListener("mousedown", handlers.isOutside, false);
			document.addEventListener("touchstart", handlers.isOutside, false);

			document.addEventListener("scroll", handlers.onScroll, false);

			var target = containerElement.parentNode;
			target.removeChild(containerElement);

			config = {};

			setObject(defaultConfiguration, config);

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
			return true
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