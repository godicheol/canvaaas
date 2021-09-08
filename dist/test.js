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
				var canvasSizes = getFittedSizes({
					width: rotatedWidth,
					height: rotatedHeight,
					maxWidth: isIos() ? 4096 : 999999,
					maxHeight: isIos() ? 4096 : 999999,
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
				ctx.scale(imgState.scaleX, imgState.scaleY);
				ctx.rotate(imgState.rotate * (Math.PI / 180));

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