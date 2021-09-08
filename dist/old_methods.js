// 
		// calculate
		// 

		function getDegrees(x, y) {
			var radians = Math.atan2(y, x) * 180 / Math.PI;

			return (450 - radians) % 360;

			// deprecated
			// return Math.atan2(y, x) * 180 / Math.PI;
		}

		function getFittedSizes(w, h, ar, fit) {
			if (!fit) {
				fit = "contain";
			}
			var x = h * ar;

			if (
				fit === "contain" && x > w ||
				fit === "cover" && x < w
			) {
				return [w, w/ar];
			} else {
				return [h*ar, h];
			}
		}

		function getRotatedSizes(width, height, angle) {
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
			return Math.sqrt( Math.pow(width, 2) + Math.pow(height, 2) );
		}

		function getAdjustedDirection(direction, scaleX, scaleY) {
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
			return typeof(b) === "boolean";
		}

		function isNumeric(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}

		function isString(str) {
			return typeof(str) === "string";
		}

		function isObject(obj) {
			return typeof(obj) === "object" && obj !== null;
		}

		function isFunction(func) {
			return typeof(func) === "function";
		}

		function isArray(arr) {
			return Array.isArray(arr);
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
				return [str]
			}
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