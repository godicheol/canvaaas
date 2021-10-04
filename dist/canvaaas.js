// canvaaas.js
// godicheol@gmail.com

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
			], // array of allowed extensions

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

			containerAspectRatio: 1 / 1, // number, width / height

			maxContainerWidth: 1, // number, 0 ~ 1 scale in viewport(device screen)

			maxContainerHeight: 0.7, // number, 0 ~ 1 scale in viewport(device screen)

			maxDrawWidth: 4096 * 4, // number, iOS always has been adjusted 4096px

			maxDrawHeight: 4096 * 4, // number, iOS always has been adjusted 4096px

			imageScaleAfterRender: 0.5, // number, 0 ~ 1 scale in canvas

			lockAspectRatioAfterRender: false, // boolean

			upload: undefined, // callback function

			canvas: undefined, // callback function

			focus: undefined, // callback function

			edit: undefined, // callback function

			remove: undefined, // callback function

		};

		var defaultCanvasState = {
			filename: "untitled", // without extension
			quality: 0.92,
			mimeType: "image/png",
			dataType: "url", // url, file
			editabled: true,
			focusabled: true,
			drawabled: true,
			background: "transparent", // transparent, #FFFFFF ~ #000000
			overlay: false,
			checker: true
		};

		var defaultImageState = function(newImage) { // to get default state of image
			var id = getShortId();

			var nextIndex = 0;
			imageStates.forEach(function(elem){
				if (elem.drawabled) {
					if (nextIndex < elem.index) {
						nextIndex = elem.index;
					}
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
			onEdit: "onEdit",
			onFocus: "onFocus",
			onDrag: "onDrag",
			onCrop: "onCrop",
			unfocusabled: "unfocusabled",
			uneditabled: "uneditabled",
			undrawabled: "undrawabled"
		};

		Object.freeze(defaultConfig);
		Object.freeze(defaultCanvasState);
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
		var imageStates = [];

		var containerObject;
		var canvasObject;
		var mirrorObject;
		var backgroundObject;

		var windowResizeEvent;

		copyObject(config, defaultConfig);
		copyObject(canvasState, defaultCanvasState);

		// event handlers
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
				
