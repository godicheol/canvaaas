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
 * pinch zoom, outside canvas
 * 
 * resize handle, shiftKey
 * 
 * config.disalbe, config.enable => config.state
 * 
 */

/*!
 * 
 * 업데이트 예정
 * 
 * 에러 메세지 정리
 * 
 * 수정 이력, 되돌리기
 * 
 * 단축키
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

			editable: true, // boolean

			checker: true, // boolean

			overlay: true, // boolean

			magnetic: true, // boolean

    		editableAspectRatio: true, // boolean

			maxNumberOfImages: 999,

			canvasWidth: 1920,

			canvasHeight: 1080,

			minCanvasWidth: 256,

			minCanvasHeight: 256,

			maxCanvasWidth: 4096, // for Mobile

			maxCanvasHeight: 4096, // for Mobile

			minImageWidth: 64, // number, px

			minImageHeight: 64, // number, px

			minImageRenderWidth: 0.1, // 0 ~ 1

			minImageRenderHeight: 0.1, // 0 ~ 1

			maxImageRenderWidth: 0.9, // 0 ~ 1

			maxImageRenderHeight: 0.9, // 0 ~ 1

			imageSmoothingEnabled: false, // boolean
			
    		imageSmoothingQuality: "low", // low, medium, high
			
    		fillColor: "#FFFFFF", // RGB
			
    		mimeType: "image/jpeg", // image/jpeg, image/png, image/webp...

    		quality: 0.8, // 0 ~ 1

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

    		container: undefined, // callback function

    		canvas: undefined, // callback function

    		upload: undefined, // callback function

    		draw: undefined, // callback function

    		capture: undefined, // callback function

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

		var errMsg = {
			TARGET: "이미지를 찾을 수 없습니다",
			EVENT_TARGET: "event.target 을 찾을 수 없습니다.",
			UNEDITABLE: "config.editable => false",
			ALREADY_UPLOADED: "이미 업로드 된 파일입니다",
			ALREADY_UPLOADING: "다른 업로드가 진행 중입니다",
			HAS_CLASS: "클래스가 존재합니다",
			HASNOT_CLASS: "클래스를 찾을 수 없습니다",
			HAS_PROPERTY: "속성이 존재합니다",
			HASNOT_PROPERTY: "속성을 찾을 수 없습니다",
			DUPE_PROPERTY: "같은 속성이 이미 존재합니다",
			DUPE_FILENAME: "같은 파일이름이 존재합니다",
			IMAGE_LOAD: "이미지를 로드할 수 없습니다",
			ISNOT_MIMETYPE: "올바른 MimeType 형식이 아닙니다",
			ELEMENT_FOCUSABLE: "state.focusable => false",
			ELEMENT_MOVABLE: "state.movable => false",
			ELEMENT_RESIZABLE: "state.resizable => false",
			ELEMENT_ROTATABLE: "state.rotatable => false",
			ELEMENT_FLIPPABLE: "state.flippable => false",
			ELEMENT_INDEXABLE: "state.indexable => false",
			ELEMENT_DRAWABLE: "state.drawable => false",
			ARGUMENT_NOT_FOUND: "인수를 찾을 수 없습니다",
			ARGUMENT_NO_NUMBER: "인수가 숫자가 아닙니다",
			ARGUMENT_NO_STRING: "인수가 문자가 아닙니다",
			ARGUMENT_NO_ARRAY: "인수가 배열이 아닙니다",
			ARGUMENT_NO_OBJECT: "인수가 오브젝트가 아닙니다",
			ARGUMENT_IS_NUMBER: "숫자 인수는 허용되지 않습니다",
			ARGUMENT_IS_STRING: "문자 인수는 허용되지 않습니다",
			ARGUMENT_IS_ARRAY: "배열 인수는 허용되지 않습니다",
			ARGUMENT_IS_OBJECT: "오브젝트 인수는 허용되지 않습니다",
			MAX_UPLOAD_LIMIT: "최대 업로드 파일 개수를 초과했습니다",
			NO_MIMETYPE: "허용되지 않는 MimeType입니다",
			UNKNOWN: "알 수 없는 에러가 발생했습니다"
		}

		var conatinerTemplate = "";
		conatinerTemplate += "<div class='canvaaas'>";
		conatinerTemplate += "<div class='canvaaas-mirror'></div>";
		conatinerTemplate += "<div class='canvaaas-canvas'></div>";
		conatinerTemplate += "<div class='canvaaas-preview hidden'></div>";
		conatinerTemplate += "</div>";

		var imageTemplate = "";
		imageTemplate += "<img>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-n'></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-e'></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-s'></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-w'></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-ne'></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-nw'></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-se'></div>";
		imageTemplate += "<div class='canvaaas-rotate-handle canvaaas-rotate-sw'></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-n'></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-e'></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-s'></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-w'></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-ne'></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-nw'></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-se'></div>";
		imageTemplate += "<div class='canvaaas-flip-handle canvaaas-flip-sw'></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-n'></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-e'></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-s'></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-w'></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-ne'></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-nw'></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-se'></div>";
		imageTemplate += "<div class='canvaaas-resize-handle canvaaas-resize-sw'></div>";

		var eventState = {};
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
						config.upload(errMsg.ALREADY_UPLOADING);
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

					if (
						!e.target.classList.contains("canvaaas-image") &&
						!e.target.classList.contains("canvaaas-clone")
					) {
						var x = getIdByImageElement(eventState.target);
						setFocusOut(x);
					}
				}
			},

			onOutsideScroll: function(e) {
				if (eventState.target) {
					var x = getIdByImageElement(eventState.target);
					setFocusOut(x);
				}
			},

			startFocusIn: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!config.editable) {
					return false;
				}


				var newElem;

				if (!e.target.classList.contains("canvaaas-image")) {
					if (!e.target.parentNode.classList.contains("canvaaas-image")) {
						return false;
					} else {
						newElem = e.target.parentNode;
					}
				} else {
					newElem = e.target;
				}


				var state = getImageStateByImageElement(newElem);

				if (!state.focusable) {
					return false;
				}

				// preEvent();

				if (eventState.target) {

					if (newElem.isSameNode(eventState.target)) {
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

				preEvent();

				var oldId = getIdByImageElement(eventState.target);

				setFocusOut(oldId);
			},

			startMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				preEvent();

				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);
				var mouseX,
					mouseY,
					rotated,
					halfWidth,
					halfHeight;

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

				rotated = getRotatedRect(state.width, state.height, state.rotate);
				halfWidth = 0.5 * rotated[0];
				halfHeight = 0.5 * rotated[1];

				eventState.initialX = state.x;
				eventState.initialY = state.y;
				eventState.minX = halfWidth;
				eventState.minY = halfHeight;
				eventState.maxX = canvasState.width - halfWidth;
				eventState.maxY = canvasState.height - halfHeight;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;

				onMove = true;

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
				var state = getImageStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
				var mouseX,
					mouseY,
					axisX,
					axisY;

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

				if (config.magnetic) {
					if (eventState.maxX - 5 < axisX && eventState.maxX + 5 > axisX) {
						axisX = eventState.maxX;
					}

					if (eventState.maxY - 5 < axisY && eventState.maxY + 5 > axisY) {
						axisY = eventState.maxY;
					}

					if (eventState.minX - 5 < axisX && eventState.minX + 5 > axisX) {
						axisX = eventState.minX;
					}

					if (eventState.minY - 5 < axisY && eventState.minY + 5 > axisY) {
						axisY = eventState.minY;
					}
				}

				state.x = axisX;
				state.y = axisY;

				setElement(elem, state);
				setElement(clone, state);

				if (config.move) {
					config.move(null, state.id);
				}
			},

			endMove: function(e) {
				e.preventDefault();
				e.stopPropagation();

				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);

		    	onMove = false;

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

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				preEvent();

				var handle = e.target;
				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);
				var mouseX,
					mouseY,
					axisX,
					axisY,
					deg;

				if (!state.rotatable) {
					return false;
				}

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - containerState.left;
					mouseY = e.clientY - containerState.top;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - containerState.left;
					mouseY = e.touches[0].clientY - containerState.top;
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

				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;
				eventState.initialR = state.rotate;
				eventState.initialD = deg;

				onRotate = true;

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
				var state = getImageStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
				var mouseX,
					mouseY,
					axisX,
					axisY,
					deg;

				if (typeof(e.touches) === "undefined") {
					mouseX = e.clientX - containerState.left;
					mouseY = e.clientY - containerState.top;
				} else if(e.touches.length === 1) {
					mouseX = e.touches[0].clientX - containerState.left;
					mouseY = e.touches[0].clientY - containerState.top;
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

				state.rotate = eventState.initialR + (deg - eventState.initialD);

				setElement(elem, state);
				setElement(clone, state);

				if (config.move) {
					config.rotate(null, state.id);
				}
			},

			endRotate: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);

		    	onRotate = false;

				document.removeEventListener("mousemove", handlers.onRotate, false);
				document.removeEventListener("mouseup", handlers.endRotate, false);

				document.removeEventListener("touchmove", handlers.onRotate, false);
				document.removeEventListener("touchend", handlers.endRotate, false);

				if (config.rotate) {
					config.rotate(null, state.id);
				}
			},

			startFlip: function(e) {
				e.preventDefault();
				e.stopPropagation();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				preEvent();

				var handle = e.target;
				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);
				var mouseX,
					mouseY;

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

			onFlip: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				var handle = eventState.handle;
				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
				var mouseX,
					mouseY,
					rotateX,
					rotateY,
					degX,
					degY;

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

			endFlip: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);
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

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				preEvent();

				var handle = e.target;
				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);
				var mouseX,
					mouseY,
					flipX,
					flipY,
					dire,
					direction,
					minW,
					minH;

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

				minW = config.minImageWidth * canvasState.width / canvasState.originalWidth;
				minH = config.minImageHeight * canvasState.height / canvasState.originalHeight;

				eventState.handle = handle;
				eventState.direction = direction;
				eventState.mouseX = mouseX;
				eventState.mouseY = mouseY;
				eventState.initialW = state.width;
				eventState.initialH = state.height;
				eventState.initialX = state.x;
				eventState.initialY = state.y;
				eventState.minW = minW;
				eventState.minH = minH;

				onResize = true;

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
				
				if (!eventState.handle) {
					return false;
				}

				var handle = eventState.handle;
				var direction = eventState.direction;
				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
				var aspectRatio,
					mouseX,
					mouseY,
					width,
					height,
					axisX,
					axisY,
					diffX,
					diffY,
					radians,
					cosFraction,
					sinFraction,
					onShiftKey = false,
					minW,
					minH;

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

				setElement(elem, state);
				setElement(clone, state);

				if (config.resize) {
					config.resize(null, state.id);
				}
			},

			endResize: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);

		    	onResize = false;
		    	eventState.handle = undefined;

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
				var state = getImageStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);

				var ratio,
					diffX,
					diffY,
					width,
					height,
					minW,
					minH;

				if (!state.resizable) {
					return false;
				}

				minW = config.minImageWidth * canvasState.width / canvasState.originalWidth;
				minH = config.minImageHeight * canvasState.height / canvasState.originalHeight;

				ratio = e.deltaY * 0.002;
				diffX = state.width * ratio;
				diffY = state.height * ratio;
				width = state.width + diffX;
				height = state.height + diffY;

				if (!onZoom) {

					preEvent();

					onZoom = true;
				} else {
					if (config.resize) {
						config.resize(null, state.id);
					}
				}

				clearTimeout(eventState.wheeling);

				if (minW > width) {
					return false;
				}

				if (minH > height) {
					return false;
				}

				state.width = width;
				state.height = height;

				setElement(elem, state);
				setElement(clone, state);

				eventState.wheeling = setTimeout(function() {

					eventState.wheeling = undefined;

					onZoom = false;

					if (config.resize) {
						config.resize(null, state.id);
					}

				}, 300);
			},

			startPinchZoom: function(e){
			    e.preventDefault();
				e.stopPropagation();

				if (!config.editable) {
					return false;
				}

				if (!eventState.target) {
					return false;
				}

				if (onMove) {
					onMove = false;

					document.removeEventListener("mousemove", handlers.onMove, false);
					document.removeEventListener("mouseup", handlers.endMove, false);

					document.removeEventListener("touchmove", handlers.onMove, false);
					document.removeEventListener("touchend", handlers.endMove, false);

				}

				preEvent();

				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
				var diagonal,
					mouseX,
					mouseY,
					minW,
					minH;

				if (!state.resizable) {
					return false;
				}

				mouseX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
				mouseY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
				diagonal = getDiagonal(mouseX, mouseY);

				minW = config.minImageWidth * canvasState.width / canvasState.originalWidth;
				minH = config.minImageHeight * canvasState.height / canvasState.originalHeight;

				eventState.diagonal = diagonal;
				eventState.initialW = state.width;
				eventState.initialH = state.height;
				eventState.minW = minW;
				eventState.minH = minH;

				onZoom = true;

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
				var state = getImageStateByImageElement(elem);
				var clone = getCloneElementByImageElement(elem);
				var diagonal,
					mouseX,
					mouseY,
					width,
					height,
					ratio,
					minW,
					minH;

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

				setElement(elem, state);
				setElement(clone, state);

				if (config.resize) {
					config.resize(null, state.id);
				}
			},

			endPinchZoom: function(e) {
			    e.preventDefault();
				e.stopPropagation();

				var elem = eventState.target;
				var state = getImageStateByImageElement(elem);

		    	onZoom = false;

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

				var oldWidth,
					newWidth,
					scaleRatio;

				oldWidth = containerElement.offsetWidth;

				containerElement.style.width = ""; // auto

				newWidth = containerElement.offsetWidth;

				scaleRatio = newWidth / oldWidth;

		        initContainer();

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

			var left = "",
				top = "",
				width = "",
				height = "",
				opacity = "",
				transform = "";

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

		};

		function preEvent() {
			// container
			var offset = containerElement.getBoundingClientRect();
			containerState.left = offset.left;
			containerState.top = offset.top;
		};

		function setObject(srcObj, destiObj) {
			if (!srcObj || !destiObj) {
				return false;
			}
			Object.keys(srcObj).forEach(function(key){
				destiObj[key] = srcObj[key];
			});
		};

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

			eventState.target = elem;
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

			eventState.target = undefined;
		};

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
			});

			tmpStates.forEach(function(state){
				var elem = getImageElementById(state.id);

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

				var clone = getCloneElementById(state.id);

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
			});

			imageStates = tmpStates;
			imageElements = tmpImageElements;
			cloneElements = tmpCloneElements;
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

			imageElements.splice(seq, 1);

			elem.parentNode.removeChild(elem);
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

			imageElements.splice(seq, 1);

			elem.parentNode.removeChild(elem);
		};

		function getImageStateById(id) {
			if (!id) {
				return false;
			}
			return imageStates.find(function(state){
				if (state.id === id) {
					return state;
				}
			});
		};

		function getImageStateByImageElement(elem) {
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

			imageStates.splice(seq, 1);
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

			imageStates.splice(seq, 1);
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

			cloneElements.splice(seq, 1);

			elem.parentNode.removeChild(elem);
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

			cloneElements.splice(seq, 1);

			elem.parentNode.removeChild(elem);
		};

		function getDegrees(x, y) {
			// return Math.atan2(y, x) * 180 / Math.PI;
			var radians = Math.atan2(y, x) * 180 / Math.PI;

			return (-radians + 450) % 360;
		};

		function getFittedRect(width, height, aspectRatio, fitType) {
			var t = fitType || "contain";
			var candidateWidth = height * aspectRatio;
			var w, h;

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
			var w, h;

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

			// return
			// [
			// 	[0],[1],[2], 
			// 	[3],[4],[5],
			// 	[6],[7],[8]
			// ]

			var radians = angle * Math.PI / 180;
			var sinFraction = Math.sin(radians);
			var cosFraction = Math.cos(radians);

			var topLeft,
				topCenter,
				topRight,
				middleLeft,
				middleCenter,
				middleRight,
				bottomLeft,
				bottomCenter,
				bottomRight;

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
			var flipX, flipY, direction;

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
			let check = false;
			(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
			return check;
		};

		function isMobileOrTablet() {
			let check = false;
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

		function getScrollbarWidth() {
			var scrollbarWidth;
			var tmp = document.createElement('div');
			tmp.style.overflow = 'scroll';

			document.body.appendChild(tmp);

			scrollbarWidth = tmp.offsetWidth - tmp.clientWidth;

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
			if (!canvas || !id || !cb) {
				return cb(errMsg.ARGUMENT_NOT_FOUND);
			}

			var elem = getImageElementById(id);
			var state = getImageStateById(id);
			var originalImg = elem.querySelector("img");

			var virtualImg = new Image();
			virtualImg.src = originalImg.src;

			virtualImg.onerror = function(e) {
				return cb(errMsg.IMAGE_LOAD);
			}
			virtualImg.onload = function(e) {
				var maxCanvasWidth,
					maxCanvasHeight,
					minCanvasWidth,
					minCanvasHeight;

				// check mobile
				if (!isMobile()) {
					maxCanvasWidth = 9999;
					maxCanvasHeight = 9999;
				} else {
					maxCanvasWidth = config.maxCanvasWidth;
					maxCanvasHeight = config.maxCanvasHeight;
				}
				minCanvasWidth = config.minCanvasWidth;
				minCanvasHeight = config.minCanvasHeight;

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

				var tmpCanvas = document.createElement("canvas");
				var tmpCtx = tmpCanvas.getContext("2d");

				tmpCanvas.width = Math.floor(canvasWidth);
				tmpCanvas.height = Math.floor(canvasHeight);

				tmpCtx.globalAlpha = state.opacity;
				tmpCtx.fillStyle = "transparent";
				tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
				tmpCtx.save();
				tmpCtx.translate(tmpCanvas.width * 0.5, tmpCanvas.height * 0.5);
				tmpCtx.scale(state.scaleX, state.scaleY);
				tmpCtx.rotate(state.rotate * (Math.PI / 180));
				tmpCtx.imageSmoothingQuality = config.imageSmoothingQuality;
				tmpCtx.imageSmoothingEnabled = config.imageSmoothingEnabled;
			    tmpCtx.drawImage(
			    	virtualImg,
					-Math.floor(absWidth * 0.5), -Math.floor(absHeight * 0.5),
			    	Math.floor(absWidth), Math.floor(absHeight)
			    );
			 	tmpCtx.restore();

			 	var sx, sy, sw, sh, dx, dy, dw, dh;

				sx = 0;
				sy = 0;
				sw = tmpCanvas.width;
				sh = tmpCanvas.height;
				dx = rotatedLeft;
				dy = rotatedTop;
				dw = rotatedWidth;
				dh = rotatedHeight;

				var ctx = canvas.getContext("2d");
				ctx.drawImage(
			    	tmpCanvas,
			    	sx, sy,
			    	sw, sh,
			    	dx, dy,
			    	dw, dh
			    );
		 		ctx.restore();

	 			return cb(null, true);
			}
		};

		function setCanvas(w, h) {

			var oldWidth = config.canvasWidth;
			var oldHeight = config.canvasHeight;
			var oldAspectRatio = config.canvasWidth / config.canvasHeight;

			var newWidth = w;
			var newHeight = h;
			var newAspectRatio = w / h;

			if (
				oldWidth === newWidth && 
				oldHeight === newHeight
			) {
				return false;
			}

			// config
			var newObj = {
				canvasWidth: newWidth,
				canvasHeight: newHeight
			}

			setObject(newObj, config);

			// container
			initContainer();

        	// canvas
			canvasState.originalWidth = newWidth;
			canvasState.originalHeight = newHeight;
			canvasState.width = containerState.width;
			canvasState.height = containerState.height;
			canvasState.left = 0;
			canvasState.top = 0;

			initCanvas();

			return true;
		}

		function initImage(id) {
			var elem = getImageElementById(id)
			var state = getImageStateById(id);
			var clone = getCloneElementByIid(id);

			var originalWidth = state.originalWidth;
			var originalHeight = state.originalHeight;
			var aspectRatio = state.originalWidth / state.originalHeight;
			var maxWidth,
				maxHeight,
				minWidth,
				minHeight;

			maxWidth = canvasState.width * config.maxImageRenderWidth;
			maxHeight = canvasState.height * config.maxImageRenderHeight;
			minWidth = canvasState.width * config.minImageRenderWidth;
			minHeight = canvasState.height * config.minImageRenderHeight;

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
			state.indexable = true;
			state.drawable = true;

			setElement(elem, state);
			setElement(clone, state);
		};

		function renderImage(file, cb) {

			if (imageElements.length > config.maxNumberOfImages - 1) {
				return cb(errMsg.MAX_UPLOAD_LIMIT);
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
				return cb(errMsg.NO_MIMETYPE);
			}

			// check filename duplicate
			imageStates.forEach(function(state){
				if (state.filename === filename) {
					isDuplicate = true;
				}
			});

			if (isDuplicate === true) {
				return cb(errMsg.DUPE_FILENAME);
			}

			// start load
			newImage.src = src;

			newImage.onload = function(e){

				var maxIndex = 0;

				imageStates.map(function(state) {
					if (state.index < 1000) {	
						if (maxIndex < state.index) {
							maxIndex = state.index;
						}
					}
				});

				var newState = {};

				var newWrap = document.createElement("div");
				newWrap.classList.add("canvaaas-image");

				newWrap.id = imageId + id;

				newWrap.innerHTML = imageTemplate;

				var newImg = newWrap.querySelector("img");
				var rotateHandles = newWrap.querySelectorAll("div.canvaaas-rotate-handle");
				var resizeHandles = newWrap.querySelectorAll("div.canvaaas-resize-handle");
				var flipHandles = newWrap.querySelectorAll("div.canvaaas-flip-handle");

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

				newState.index = maxIndex + 1;

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
				newState.indexable = true;
				newState.drawable = true;

				canvasElement.appendChild(newWrap);

				setElement(newWrap, newState);

				imageStates.push(newState);

				imageElements.push(newWrap);

				// mirror
				var wrapClone = newWrap.cloneNode();
				var wrapHTML = newWrap.innerHTML;
				var overlay = document.createElement("div");
				overlay.classList.add("canvaaas-overlay");

				wrapClone.innerHTML = wrapHTML;
				wrapClone.id = cloneId + id;
				wrapClone.classList.replace("canvaaas-image", "canvaaas-clone");
				wrapClone.insertBefore(overlay, wrapClone.querySelector("img").nextSibling); // fix index, overlay < handles
				mirrorElement.appendChild(wrapClone);
				cloneElements.push(wrapClone);

				newWrap.addEventListener("mousedown", handlers.startFocusIn, false);
				newWrap.addEventListener("touchstart", handlers.startFocusIn, false);

				setIndex();

				return cb(null, id);
			}
		}

		function removeImage(id) {

			var elem = getImageElementById(id);

			if (!elem) {
				return false;
			}

			if (eventState.target) {
				if (elem.isSameNode(eventState.target)) {
					setFocusOut(id);
				}
			}

			// #1 remove clone element
			removeCloneElementById(id);

			// #2 remove state
			removeImageStateById(id);

			// #3 remove image element
			removeImageElementById(id);

			return true;
		}

		function initContainer() {

			if (!containerElement) {
				console.log("Container not found");
				return false;
			}

			var aspectRatio,
				width,
				height,
				left,
				top;

			aspectRatio = config.canvasWidth / config.canvasHeight;
			width = containerElement.offsetWidth;
			height = containerElement.offsetWidth / aspectRatio;

 			containerState.width = width;
 			containerState.height = height;

        	setElement(containerElement, containerState);

        	if (hasScrollbar()) {

        		containerElement.style.width = "";

				width = containerElement.offsetWidth;
				height = width / aspectRatio;

	 			containerState.width = width;
	 			containerState.height = height;

	        	setElement(containerElement, containerState);
        	}

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

			var left,
				top,
				width,
				height,
				originalWidth,
				originalHeight,
				aspectRatio;

        	originalWidth = config.canvasWidth;
        	originalHeight = config.canvasHeight;
			aspectRatio = originalWidth / originalHeight;

			var fittedSizes = getFittedRect(
				containerState.width,
				containerState.height,
				aspectRatio,
			);

			width = fittedSizes[0];
			height = fittedSizes[1];
			left = canvasElement.offsetLeft;
			top = canvasElement.offsetTop;

			canvasState.originalWidth = originalWidth;
			canvasState.originalHeight = originalHeight;
			canvasState.width = width;
			canvasState.height = height;

        	setElement(canvasElement, canvasState);

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

			// 
			// set template
			// 

			target.innerHTML = conatinerTemplate;

	        containerElement = target.querySelector("div.canvaaas");
	        canvasElement = target.querySelector("div.canvaaas-canvas");
	        mirrorElement = target.querySelector("div.canvaaas-mirror");
	        previewElement = target.querySelector("div.canvaaas-preview");

	        // 
	        // set container
	        // 

	        initContainer();
        	console.log("Container initialized", containerState);

	        // 
	        // set canvas
	        // 

	        initCanvas();
        	console.log("Canvas initialized", canvasState);

        	// 
        	// set style
        	// 

			if (config.checker === true) {
				containerElement.classList.add("checker");
			}

			if (config.overlay === true) {
				mirrorElement.classList.add("active");
			}

	        // 
	        // set events
	        // 

	        // window.addEventListener("resize", handlers.debounce( handlers.resizeWindow, 100 ), false);
			window.addEventListener("resize", handlers.resizeWindow, false);

			document.addEventListener("mousedown", handlers.isOutside, false);
			document.addEventListener("touchstart", handlers.isOutside, false);

			document.addEventListener("scroll", handlers.onOutsideScroll, false);


			containerElement.addEventListener('dragenter', handlers.preventDefaults, false);
			containerElement.addEventListener('dragleave', handlers.preventDefaults, false);
			containerElement.addEventListener('dragover', handlers.preventDefaults, false);
			containerElement.addEventListener('drop', handlers.preventDefaults, false);
			containerElement.addEventListener('drop', handlers.dropImages, false);

			console.log("canvaaas.js initialized", config);
		}

		myObject.uploadFiles = function(self, cb) {
			var files = self.files;

			if (typeof(self) !== "object") {
				if (config.upload) {
					config.upload(errMsg.ARGUMENT_NO_OBJECT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_OBJECT);
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
					config.upload(errMsg.ALREADY_UPLOADING);
				}
				if (cb) {
					cb(errMsg.ALREADY_UPLOADING);
				} 
				return false;
			}

			onUpload = true;

			var results = [],
				index = files.length,
				count = 0;

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
					config.upload(errMsg.ARGUMENT_NO_ARRAY);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_ARRAY);
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
					config.upload(errMsg.ALREADY_UPLOADING);
				}
				if (cb) {
					cb(errMsg.ALREADY_UPLOADING);
				} 
				return false;
			}

			var arr = [],
				results = [];

			if (!Array.isArray(imageUrls)) {
				arr = [imageUrls]
			} else {
				arr = imageUrls;
			}

			var index = arr.length,
				count = 0;

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

		myObject.setPreview = function(target){

      		target.innerHTML = "";

      		var previewWidth = target.offsetWidth;
      		var previewHeight = previewWidth / (canvasState.width / canvasState.height);

			target.style.position = "relative";
			target.style.overflow = "hidden";
			target.style.backgroundColor = config.fillColor;
			target.style.fontSize = "0px";
			// target.style.width = previewWidth + "px";
			target.style.height = previewHeight + "px";

			var states = [];

			for (var i = 0; i < imageStates.length; i++) {
				var id = imageStates[i].id;

				if (imageStates[i].drawable) {
					states.push(imageStates[i]);
				}
			}

			for (var i = 0; i < states.length; i++) {
				var newImage = document.createElement("img");
				newImage.style.display = "block";
				newImage.style.position = "absolute";
				newImage.style.transformOrigin = "center center";

				var scaleRatio,
					aspectRatio,
					newState = {};

				scaleRatio = previewWidth / canvasState.width;
				aspectRatio = states[i].width / states[i].height;

				newState.width = states[i].width * scaleRatio;
				newState.height = newState.width / aspectRatio;
				newState.x = states[i].x * scaleRatio;
				newState.y = states[i].y * scaleRatio;
				newState.rotate = states[i].rotate;
				newState.scaleX = states[i].scaleX;
				newState.scaleY = states[i].scaleY;
				newState.opacity = states[i].opacity;

				setElement(newImage, newState);

				newImage.src = states[i].src;

				target.appendChild(newImage);
			}
		}

		// 
		// image
		// 

		myObject.moveX = function(id, num, cb) {
			var elem = getImageElementById(id);
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.move) {
					config.move(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (typeof(num) !== "number") {
				if (config.move) {
					config.move(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.move(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.movable) {
				if (config.move) {
					config.move(errMsg.ELEMENT_MOVABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_MOVABLE);
				} 
				return false;
			}

			state.x -= num;

			setElement(elem, state);
			setElement(clone, state);

			if (config.move) {
				config.move(null, state.id);
			}
			if (cb) {
				cb(null, state.id)
			}
		}

		myObject.moveY = function(id, num, cb) {
			var elem = getImageElementById(id);
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.move) {
					config.move(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (typeof(num) !== "number") {
				if (config.move) {
					config.move(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.move(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.movable) {
				if (config.move) {
					config.move(errMsg.ELEMENT_MOVABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_MOVABLE);
				} 
				return false;
			}

			state.y -= num;

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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.move) {
					config.move(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (
				typeof(x) === "object" ||
				typeof(y) === "object"
			) {
				if (config.move) {
					config.move(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.move(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 

				return false;
			}

			if (!state.movable) {
				if (config.move) {
					config.move(errMsg.ELEMENT_MOVABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_MOVABLE);
				} 
				return false;
			}

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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.resize) {
					config.resize(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (typeof(ratio) !== "number") {
				if (config.resize) {
					config.resize(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.resize(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.resizable) {
				if (config.resize) {
					config.resize(errMsg.ELEMENT_RESIZABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_RESIZABLE);
				} 
				return false;
			}

			state.width *= 1 + ratio;
			state.height *= 1 + ratio;

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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.resize) {
					config.resize(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (
				typeof(ratio) === "object" || 
				typeof(ratio) === "undefined"
			) {
				if (config.resize) {
					config.resize(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.resize(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.resizable) {
				if (config.resize) {
					config.resize(errMsg.ELEMENT_RESIZABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_RESIZABLE);
				} 
				return false;
			}

			var width, height, left, top, fittedSizes, aspectRatio;

			aspectRatio = state.originalWidth / state.originalHeight;

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
						config.resize(errMsg.ARGUMENT_NO_NUMBER);
					}
					if (cb) {
						cb(errMsg.ARGUMENT_NO_NUMBER);
					} 
					return false;
				}
			} else {
				width = state.originalWidth * ratio;
				height = state.originalHeight * ratio;
				left = state.left;
				top = state.top;
			}

			state.width = width;
			state.height = height;
			state.left = left;
			state.top = top;

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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.rotate) {
					config.rotate(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (typeof(deg) !== "number") {
				if (config.rotate) {
					config.rotate(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.rotate(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.rotatable) {
				if (config.rotate) {
					config.rotate(errMsg.ELEMENT_ROTATABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_ROTATABLE);
				} 
				return false;
			}


			if (state.scaleX === -1) {
				deg *= -1;
			}

			if (state.scaleY === -1) {
				deg *= -1;
			}

			state.rotate += deg;

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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.rotate) {
					config.rotate(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (typeof(deg) !== "number") {
				if (config.rotate) {
					config.rotate(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.rotate(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.rotatable) {
				if (config.rotate) {
					config.rotate(errMsg.ELEMENT_ROTATABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_ROTATABLE);
				} 
				return false;
			}

			if (state.scaleX === -1) {
				deg *= -1;
			}

			if (state.scaleY === -1) {
				deg *= -1;
			}

			state.rotate = deg;

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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.flip) {
					config.flip(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
					config.flip(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.flippable) {
				if (config.flip) {
					config.flip(errMsg.ELEMENT_FLIPPABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_FLIPPABLE);
				} 
				return false;
			}

			state.scaleX *= -1;
			state.rotate *= -1;

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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.flip) {
					config.flip(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
					config.flip(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.flippable) {
				if (config.flip) {
					config.flip(errMsg.ELEMENT_FLIPPABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_FLIPPABLE);
				} 
				return false;
			}

			state.scaleY *= -1;
			state.rotate *= -1;

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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.flip) {
					config.flip(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (
				typeof(x) !== "number" ||
				typeof(y) !== "number"
			) {
				if (config.flip) {
					config.flip(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.flip(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.flippable) {
				if (config.flip) {
					config.flip(errMsg.ELEMENT_FLIPPABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_FLIPPABLE);
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

			state.scaleX = x;
			state.scaleY = x;

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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.opacity) {
					config.opacity(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (typeof(num) !== "number") {
				if (config.opacity) {
					config.opacity(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.opacity(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (num > 1) {
				num = 1;
			}
			if (num < 0) {
				num = 0;
			}

			state.opacity = num;

			setElement(elem, state);
			setElement(clone, state);

			if (config.opacity) {
				config.opacity(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.indexUp = function(id, num, cb) {
			var elem = getImageElementById(id);
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.index) {
					config.index(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (typeof(num) !== "number") {
				if (config.index) {
					config.index(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.index(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.indexable) {
				if (config.index) {
					config.index(errMsg.ELEMENT_INDEXABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_INDEXABLE);
				} 
				return false;
			}

			state.index += num;

			setElement(elem, state);
			setElement(clone, state);

			setIndex();

			if (config.index) {
				config.index(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}

		}

		myObject.indexDown = function(id, num, cb) {
			var elem = getImageElementById(id);
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.index) {
					config.index(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (typeof(num) !== "number") {
				if (config.index) {
					config.index(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
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
					config.index(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.indexable) {
				if (config.index) {
					config.index(errMsg.ELEMENT_INDEXABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_INDEXABLE);
				} 
				return false;
			}

			state.index -= num;

			setElement(elem, state);
			setElement(clone, state);

			setIndex();

			if (config.index) {
				config.index(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}

		}

		myObject.indexTo = function(id, num, cb) {
			var elem = getImageElementById(id);
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.index) {
					config.index(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
					config.index(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.indexable) {
				if (config.index) {
					config.index(errMsg.ELEMENT_INDEXABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_INDEXABLE);
				} 
				return false;
			}

			if (typeof(num) !== "number") {
				if (config.index) {
					config.index(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
				} 
				return false;
			}

			state.index = num;

			setElement(elem, state);
			setElement(clone, state);

			setIndex();

			if (config.index) {
				config.index(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.show = function(id, cb) {
			var elem = getImageElementById(id);
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.visibility) {
					config.visibility(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
					config.visibility(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.visibility) {
					config.visibility(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
					config.visibility(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

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
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.focus) {
					config.focus(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
					config.focus(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (!state.focusable) {
				if (config.focus) {
					config.focus(errMsg.ELEMENT_FOCUSABLE);
				}
				if (cb) {
					cb(errMsg.ELEMENT_FOCUSABLE);
				} 
				return false;
			}

			if (eventState.target) {
				var x = getIdByImageElement(eventState.target);
				setFocusOut(x);
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
				if (config.focus) {
					config.focus(errMsg.UNEDITABLE);
				}
				if (cb) {
					cb(errMsg.UNEDITABLE);
				}
				return false;
			}

			if (!eventState.target) {
				if (config.focus) {
					config.focus(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			var id = getIdByImageElement(eventState.target);

			setFocusOut(id);

			if (config.focus) {
				config.focus(null, id);
			}
			if (cb) {
				cb(null, id);
			}
		}

		myObject.enableFocus = function(id, cb){
			var elem = getImageElementById(id);
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
					config.state(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			state.focusable = true;

			elem.classList.remove("disabled");

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.enableMove = function(id, cb){
			var elem = getImageElementById(id);
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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

			state.flippable = true;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.enableIndex = function(id, cb){
			var elem = getImageElementById(id);
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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

			state.indexable = true;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.enableDraw = function(id, cb){
			var elem = getImageElementById(id);
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
					config.state(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			if (eventState.target) {
				if (elem.isSameNode(eventState.target)) {
					setFocusOut(id);
				}	
			}

			state.focusable = false;

			elem.classList.add("disabled");

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.disableMove = function(id, cb){
			var elem = getImageElementById(id);
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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

			state.flippable = false;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.disableIndex = function(id, cb){
			var elem = getImageElementById(id);
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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

			state.indexable = false;

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.disableDraw = function(id, cb){
			var elem = getImageElementById(id);
			var state = getImageStateById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
			var state = getImageStateById(id);
			var clone = getCloneElementById(id);

			if (typeof(id) !== "string") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				} 
				return false;
			}

			if (typeof(obj) !== "object") {
				if (config.state) {
					config.state(errMsg.ARGUMENT_NO_OBJECT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_OBJECT);
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
					config.state(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			setObject(obj, state);
			setElement(elem, state);
			setElement(clone, state);
			setIndex();

			if (config.state) {
				config.state(null, state.id);
			}
			if (cb) {
				cb(null, state.id);
			}
		}

		myObject.removeOne = function(id, cb) {
			var elem = getImageElementById(id);

			if (typeof(id) !== "string") {
				if (config.remove) {
					config.remove(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
					config.remove(errMsg.TARGET);
				}
				if (cb) {
					cb(errMsg.TARGET);
				} 
				return false;
			}

			var res = removeImage(id);

			if (config.remove) {
				config.remove(null, res);
			}
			if (cb) {
				cb(null, res);
			}
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

			var tmp = [];
			var results = [];

			for (var i = imageStates.length - 1; i >= 0; i--) {
				tmp.push(imageStates[i].id) ;
			}

			for (var i = 0; i < tmp.length; i++) {
				var res = removeImage(tmp[i]);

				if (config.remove) {
					config.remove(null, res);
				}

				results.push(res);
			}

			if (cb) {
				cb(null, results);
			}
		}

		// 
		// config
		// 

		myObject.setConfig = function(obj, cb) {

			if (typeof(obj) !== "object") {
				if (config.config) {
					config.config(errMsg.ARGUMENT_NO_OBJECT);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_OBJECT);
				}
				return false;
			}

			var oldConfig = {};
			var newConfig = {};

			setObject(config, oldConfig);
			setObject(config, newConfig);
			setObject(obj, newConfig);

			config = newConfig;

			if (config.config) {
				config.config(null, newConfig);
			}
			if (cb) {
				cb(null, newConfig);
			}
		}

		myObject.setCanvas = function(w, h, cb) {

			if (
				typeof(w) !== "number" ||
				typeof(h) !== "number"
			) {
				if (config.canvas) {
					config.canvas(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
				}
				return false;
			}

			setCanvas(w, h);

	      	// check image in canvas
        	imageStates.forEach(function(state){
        		var elem = getImageElementById(state.id);
        		var clone = getImageElementById(state.id);
       			var maxLeft,
        			maxTop,
        			minLeft,
        			minTop;

        		// var isOutside = false;

				minLeft = 0;
				minTop = 0;
				maxLeft = canvasState.width;
				maxTop = canvasState.height;

				if (state.x > maxLeft) {
					state.x = maxLeft;
					// isOutside = true;
				}
				if (state.x < minLeft) {
					state.x = minLeft;
					// isOutside = true;
				}
				if (state.y > maxTop) {
					state.y = maxTop;
					// isOutside = true;
				}
				if (state.y < minTop) {
					state.y = minTop;
					// isOutside = true;
				}

				// if (isOutside === true) {
				// 	resetImage(state.id);
				// }

				setElement(elem, state);
				setElement(clone, state);

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

		myObject.setEditable = function(cb) {

			config.editable = true;

			if (config.config) {
				config.config(null);
			}
        	if (cb) {
				cb(null, config.editable);
			}
		}

		myObject.unsetEditable = function(cb) {

			config.editable = false;

			if (config.config) {
				config.config(null);
			}
			if (cb) {
				cb(null, config.editable);
			}
		}

		myObject.setFillColor = function(colour, cb) {

			if (typeof(colour) !== "string") {
				if (config.config) {
					config.config(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
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
				config.config(null, colour);
			}
			if (cb) {
				cb(null, colour);
			}
		}

		myObject.unsetFillColor = function(cb) {

			config.fillColor = defaultConfiguration.fillColor;

			if (config.config) {
				config.config(null, config.fillColor);
			}
			if (cb) {
				cb(null, config.fillColor);
			}
		}

		myObject.setMimeType = function(typ, cb) {

			if (typeof(typ) !== "string") {
				if (config.config) {
					config.config(errMsg.ARGUMENT_NO_STRING);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_STRING);
				}
				return false;
			}

			if (typ.indexOf("/") < 0) {
				if (config.config) {
					config.config(errMsg.ISNOT_MIMETYPE);
				}
				if (cb) {
					cb(errMsg.ISNOT_MIMETYPE);
				}
				return false;
			}

			config.mimeType = typ.toLowerCase();

			if (config.config) {
				config.config(null, config.mimeType);
			}
			if (cb) {
				cb(null, config.mimeType);
			}
		}

		myObject.unsetMimeType = function(cb) {

			config.mimeType = defaultConfiguration.mimeType;

			if (config.config) {
				config.config(null, config.mimeType);
			}
			if (cb) {
				cb(null, config.mimeType);
			}
		}

		myObject.setExtentions = function(exts, cb) {

			if (!Array.isArray(exts)) {
				if (config.config) {
					config.config(errMsg.ARGUMENT_NO_ARRAY);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_ARRAY);
				}
				return false;
			}

			config.extensions = exts;

			if (config.config) {
				config.config(null, config.extensions);
			}
			if (cb) {
				cb(null, config.extensions);
			}
		}

		myObject.unsetExtentions = function(cb) {

			config.extensions = defaultConfiguration.extensions;

			if (cb) {
				cb(null, config.extensions);
			}
		}

		myObject.setMaxNumberOfImages = function(num, cb) {

			if (typeof(num) !== "number") {
				if (config.config) {
					config.config(errMsg.ARGUMENT_NO_NUMBER);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_NUMBER);
				}
				return false;
			}

			config.maxNumberOfImages = num;

			if (config.config) {
				config.config(null, config.maxNumberOfImages);
			}
			if (cb) {
				cb(null, config.maxNumberOfImages);
			}
		}

		myObject.setOverlay = function(cb){

			config.overlay = true;

			mirrorElement.classList.add("active");

			if (config.config) {
				config.config(null, config.overlay);
			}
			if (cb) {
				cb(null, config.overlay);
			}
		}

		myObject.unsetOverlay = function(cb){

			config.overlay = false;

			mirrorElement.classList.remove("active");

			if (config.config) {
				config.config(null, config.overlay);
			}
			if (cb) {
				cb(null, config.overlay);
			}
		}

		myObject.setMagnetic = function(cb){

			config.magnetic = true;

			if (config.config) {
				config.config(null, config.magnetic);
			}
			if (cb) {
				cb(null, config.magnetic);
			}
		}

		myObject.unsetMagnetic = function(cb){

			config.magnetic = false;

			if (config.config) {
				config.config(null, config.magnetic);
			}
			if (cb) {
				cb(null, config.magnetic);
			}
		}

		myObject.lockAspectRatio = function(cb){

			config.editableAspectRatio = false;

			if (config.config) {
				config.config(null, config.editableAspectRatio);
			}
			if (cb) {
				cb(null, config.editableAspectRatio);
			}
		}

		myObject.unlockAspectRatio = function(cb){

			config.editableAspectRatio = true;
			
			if (config.config) {
				config.config(null, config.editableAspectRatio);
			}
			if (cb) {
				cb(null, config.editableAspectRatio);
			}
		}

		myObject.draw = function(cb){
			var canvas = drawCanvas();
			var ctx = canvas.getContext("2d");
			var drawables = [];

			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawable) {
					drawables.push(imageStates[i]);
				}
			}

			var index = drawables.length,
				count = 0,
				result = {},
				drawResults = [];

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

		myObject.capture = function(cb){

			if (eventState.target) {
				var x = getIdByImageElement(eventState.target);
				setFocusOut(x);
			}

			previewElement.innerHTML = "";

			config.editable = false;

			var canvas = drawCanvas();
			var ctx = canvas.getContext("2d");
			var drawables = [];

			for (var i = 0; i < imageStates.length; i++) {
				if (imageStates[i].drawable) {
					drawables.push(imageStates[i]);
				}
			}

			var index = drawables.length,
				count = 0,
				result = {},
				drawResults = [];

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

					setElement(previewElement, containerState);

					var newImage = document.createElement("img");
					newImage.style.width = "100%";
					newImage.style.height = "auto";
					newImage.style.left = "0px";
					newImage.style.top = "0px";
					newImage.src = result.data;

					previewElement.appendChild(newImage);

					canvasElement.classList.add("hidden");
					mirrorElement.classList.add("hidden");
					previewElement.classList.remove("hidden");

					if (config.capture) {
						config.capture(null, result);
					}
					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		myObject.escapeCapture = function(cb){

			previewElement.innerHTML = "";
			previewElement.style.width = "";
			previewElement.style.height = "";

			canvasElement.classList.remove("hidden");
			mirrorElement.classList.remove("hidden");
			previewElement.classList.add("hidden");

			config.editable = true;

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

			var index = drawables.length,
				count = 0,
				result = {},
				drawResults = [];

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

					if (config.draw) {
						config.draw(null, result);
					}
					if (cb) {
						cb(null, result);
					}
				}
			}
		}

		myObject.export = function(cb) {
			var states = [];

			imageStates.forEach(function(state){
				var tmp = {};

				tmp.index = state.index;
				tmp.filename = state.filename;

				tmp.canvasWidth = canvasState.width;
				tmp.canvasHeight = canvasState.height;

				tmp.x = state.x;
				tmp.y = state.y;
				tmp.width = state.width;
				tmp.height = state.height;
				tmp.rotate = state.rotate;
				tmp.scaleX = state.scaleX;
				tmp.scaleY = state.scaleY;
				tmp.opacity = state.opacity;

				tmp.focusable = state.focusable;
				tmp.movable = state.movable;
				tmp.resizable = state.resizable;
				tmp.rotatable = state.rotatable;
				tmp.flippable = state.flippable;
				tmp.indexable = state.indexable;
				tmp.drawable = state.drawable;

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

			if (!Array.isArray(states)) {
				if (config.import) {
					config.import(errMsg.ARGUMENT_NO_ARRAY);
				}
				if (cb) {
					cb(errMsg.ARGUMENT_NO_ARRAY);
				}
				return false;
			}

			var results = [];

			for (var i = 0; i < states.length; i++){

				if (!states[i].filename) {
					results.push({
						key: i,
						err: "filename not found"
					})
					continue;
				}
				if (!states[i].canvasWidth) {
					results.push({
						key: i,
						err: "canvas width not found"
					})
					continue;
				}

				var candidateState = states[i],
					scaleRatio,
					aspectRatio;

				var elem = getImageElementByFilename(candidateState.filename);
				var clone = getCloneElementByImageElement(elem);
				var state = getImageStateByImageElement(elem);

				if (!elem || !state || !clone) {
					results.push({
						key: i,
						err: "image not found"
					})
					continue;
				}

				scaleRatio = canvasState.width / candidateState.canvasWidth;
				aspectRatio = candidateState.width / candidateState.height;

				// check aspect ratio
				if (
					Math.abs(
						(candidateState.canvasWidth/candidateState.canvasHeight)-
						(canvasState.originalWidth/canvasState.originalHeight)
					) > 0.01
				) {
					results.push({
						key: i,
						err: "apsect ratio not match"
					})
					continue;
				}

				state.isImported = true;
				state.index = candidateState.index;

				state.x = candidateState.x * scaleRatio;
				state.y = candidateState.y * scaleRatio;
				state.width = candidateState.width * scaleRatio;
				state.height = state.width / aspectRatio;

				state.rotate = candidateState.rotate;
				state.scaleX = candidateState.scaleX;
				state.scaleY = candidateState.scaleY;
				state.opacity = candidateState.opacity;

				state.focusable = candidateState.focusable;
				state.movable = candidateState.movable;
				state.resizable = candidateState.resizable;
				state.rotatable = candidateState.rotatable;
				state.flippable = candidateState.flippable;
				state.drawable = candidateState.drawable;

				setElement(elem, state);
				setElement(clone, state);

				results.push(state);
			}

			setIndex();

			if (config.import) {
				config.import(null, results);
			}
			if (cb) {
				cb(null, results);
			}

		}

		myObject.this = function(cb){

			if (!eventState.target) {
				return false;
			}

			var id = getIdByImageElement(eventState.target);

			if (!id) {
				if (cb) {
					cb(errMsg.ARGUMENT_NOT_FOUND);
				}
				return false;
			}

			if (cb) {
				cb(null, id);
			}
			return id;
		}

		myObject.getThis = function(cb){

			if (!eventState.target) {
				return false;
			}

			var id = getIdByImageElement(eventState.target);

			if (!id) {
				if (cb) {
					cb(errMsg.ARGUMENT_NOT_FOUND);
				}
				return false;
			}

			if (cb) {
				cb(null, id);
			}
			return id;
		}

		myObject.getThisData = function(cb){

			if (!eventState.target) {
				return false;
			}

			var id = getIdByImageElement(eventState.target);

			if (!id) {
				if (cb) {
					cb(errMsg.ARGUMENT_NOT_FOUND);
				}
				return false;
			}

			var state = getImageStateById(id);

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

		myObject.getImageData = function(cb){
			if (cb) {
				cb(null, imageStates);
			}
			return imageStates;
		}

		myObject.reset = function(preConfig, cb){

			window.removeEventListener("resize", handlers.resizeWindow, false);

			document.addEventListener("mousedown", handlers.isOutside, false);
			document.addEventListener("touchstart", handlers.isOutside, false);

			document.addEventListener("scroll", handlers.onOutsideScroll, false);

			var target = containerElement.parentNode;

			target.removeChild(containerElement);

			config = {};

			setObject(defaultConfiguration, config);

			eventState = {};
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