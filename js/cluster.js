/**
 *
 */
// global variables
var data;
var funcs;
var cluster;

var primaryMainPath = [];
var endPoints = [];
var yLines = [];

var sortedSessions = [];

var PATH_MODE = {
	"RightLeft" : "RL",
	"TopTop" : "TT",
	"BottomBottom" : "BB",
	"LeftLeft" : "LL",
	"RightRight" : "RR",
	"LeftBottom" : "LB",
	"BottomLeft" : "BL",
	"BottomRight" : "BR",
	"RightBottom" : "RB",
	"RightTop" : "RT"
};

// 參數設定
var divGap = 200;
var yGap = 115;
var clusterGap = yGap + 35;
var x = 0;
var maxX = 0;
var minY = 0;
var y = 100;

var ARROW_WIDTH = 6;
var HALF_ARROW_WIDTH = ARROW_WIDTH / 2;
var SVG_NAME_SPACE = "http://www.w3.org/2000/svg";
var XML_NAME_SPACE = "http://www.w3.org/1999/xhtml";
var STROKE_WIDTH = 1;
var PATH_HEIGHT = 30;
var ANCHOR_SHIFT = 8;
var LABEL_STOP_RATE = 0.4;

// 文字定義
var ExitLabel = "離開服務";
var StartLabel;
var RequiredLabel = "初始最大路徑";
var TIME_LABEL = "Time";
var FAIL_LABEL = "Fail";

var START_FUNCID = "Start";
var END_FUNCID = "End";
var NULL_FUNCID = "Null";

var levelUp = false;
var level = 0;

var currClusterIdx;
var currTab;
var NORMAL_COLOR = "#EEEEEF";
var FAIL_COLOR = "#CDCDD6";

// 路徑線條樣式(滑鼠hover前後)
var PATH_SIZE = 2;
var PATH_COLOR = "#61B7CF";
var PATH_SIZE_HOVER = 4;
var PATH_OUT_COLOR_HOVER = "#FF0000";
var PATH_IN_COLOR_HOVER = "#9ACD32";

var terminalFunc = [];

$(function() {

	//$("#limit").val(REQ_LIMIT);
	getEl("limit").value = REQ_LIMIT;

	loadData();

	//var $inspector = $("<div>").css('display', 'none').addClass("myConnector");

	var $inspector = document.createElement("div");
	$inspector.setAttribute("class", "myConnector");
	$inspector.style.display = "none";

	//$("body").append($inspector);
	document.body.appendChild($inspector);

	//STROKE_WIDTH = parseInt($inspector.css("stroke-width").replace("px", ""), 10);
	STROKE_WIDTH = parseInt(_getComputedStyle($inspector, "stroke-width")
			.replace("px", ""), 10);

	//$inspector.remove();
	document.body.removeChild($inspector);

	for (var i = 0; i < data.numOfCluster; i++) {
		$("#funcDiv").append(
				"<input type=\"button\" value=\"群" + (i + 1)
						+ "\" onclick=\"go('" + (i + 1) + "')\" />&nbsp;");
	}

	currTab = "chartDiv";

	if (REQ_CLUSTER_IDX == 0) {

		minY = y;
		for (var i = 0; i < data.numOfCluster; i++) {

			StartLabel = "群" + (i + 1);
			x = 0;
			maxX = 0;

			genChart(REQ_LIMIT, i);

			if (levelUp) {
				y += clusterGap;
				levelUp = false;
			}

		}

	} else {
		StartLabel = "群" + REQ_CLUSTER_IDX;
		x = 0;

		genChart(REQ_LIMIT, REQ_CLUSTER_IDX - 1);
	}

});

function _getComputedStyle(dom, propName) {

	var style;

	// FireFox and Chrome way
	if (window.getComputedStyle) {
		style = window.getComputedStyle(dom, null);
		for (var i = 0, l = style.length; i < l; i++) {
			var prop = style[i];
			if (prop == propName) {
				return style.getPropertyValue(prop);
			}
		}
		return returns;
	}
	// IE and Opera way
	if (dom.currentStyle) {
		style = dom.currentStyle;
		for ( var prop in style) {
			if (prop == propName) {
				return style[prop];
			}
		}
	}
	// Style from style attribute
	if (style = dom.style) {
		for ( var prop in style) {
			if (typeof style[prop] != 'function') {
				if (prop == propName) {
					return style[prop];
				}
			}
		}
	}
	return "";
}

function queueTerminal(terminal) {

	terminalFunc.push(terminal);
	var div = getDiv("", terminal[0], true, 0);
	// store end point
	getAnchor(div, "R");

}

function copy_and_sort(sessions) {
	
	for (var i=0; i < sessions.length; i++) {
		
		var currSession = sessions[i];
		var tmpSorted = [];
		
		for (var s = 0; s < currSession.length; s++) {

			var sess = [];
			sess.push(currSession[s]);
			sess.push(s);
			tmpSorted.push(sess);

		}
		
		// descending sort
		tmpSorted.sort(function(a, b) {
			return b[0] - a[0]
		});
		
		sortedSessions[i] = tmpSorted;
	}
	
}

function genChart(limit, clusterIdx) {

	currClusterIdx = clusterIdx;
	cluster = data.clusters[clusterIdx];
	level = 0;
	var maxRatePos = [];
	terminalFunc = [];

	// traverse main path
	for (var j = 0; j < cluster.session.length; j++) {
		maxRatePos[j] = -1;
	}

	primaryMainPath = [];
	primaryMainPath.push(0);
	// start node;
	var firstDiv = getDiv(StartLabel + "<br/>" + roundUp(cluster.rate, 100)
			+ "%", START_FUNCID);

	var maxRate = 0;
	var idx = -1;

	var i;
	var session0 = cluster.session[0];
	for (i = 0; i < session0.length; i++) {
		if (session0[i] > maxRate) {
			maxRate = session0[i];
			idx = i;
		}
	}

	if (maxRate >= limit) {

		//console.log("MAX RATE: " + maxRate);
		maxRatePos[0] = idx;

		if (idx == 0) {
			var currFuncIdx = firstDiv.id
					.substring(4, firstDiv.id.indexOf("_"));
			var terminal = [ START_FUNCID, maxRate ];
			queueTerminal(terminal);
		} else {

			var funcIdx = idx - 1;
			var fail = roundUp(cluster.fail[funcIdx], 100);
			var content = getFuncContent(funcIdx, cluster);

			var funcId = funcs[funcIdx].funcId;

			var lastDiv = getDiv(content, funcId, true, fail);

			makeConnection(firstDiv, lastDiv, true, maxRate);

			var c;
			for (c = 0;; c++) {

				maxRate = 0;
				var originIdx = idx;
				var curSession = cluster.session[originIdx];
				primaryMainPath.push(originIdx);
				idx = -1;
				for (i = 0; i < curSession.length; i++) {

					var rate = curSession[i];
					if (rate > maxRate && rate >= limit) {
						idx = i;
						maxRate = rate;
					}
				}

				maxRatePos[originIdx] = idx;

				if (idx == 0) {
					var currFuncIdx = lastDiv.id.substring(4, lastDiv.id
							.indexOf("_"));
					var terminal = [ currFuncIdx, maxRate ];
					queueTerminal(terminal);
				}
				if (idx <= 0) {
					//console.log("break: " + idx);
					break;
				}

				var funcIdx = idx - 1;
				var fail = roundUp(cluster.fail[funcIdx], 100);
				var content = getFuncContent(funcIdx, cluster);

				var funcId = funcs[funcIdx].funcId;

				var div = getDiv(content, funcs[funcIdx].funcId, true, fail);

				if (maxRatePos[idx] > -1) { // stop at loop
					makeConnection(lastDiv, div, false, maxRate);
					break;
				}
				
				makeConnection(lastDiv, div, true, maxRate);
				lastDiv = div;

			}

		}

	} else if (maxRatePos[0] == -1) {
		getDiv(RequiredLabel + ":" + roundUp(maxRate, 100) + "%", NULL_FUNCID);
		var endDiv = getDiv(ExitLabel, END_FUNCID);
	}

	// sub-path
	var sessions = cluster.session;
	sortedSessions = []; // reset
	copy_and_sort(sessions);
	
	for (p = 0; p < primaryMainPath.length; p++) {

		var mainPathIdx = primaryMainPath[p];

		if (mainPathIdx == 0) {
			x = $(firstDiv).position().left + $(firstDiv).width();
		}

		if (levelUp) {
			y += yGap;
			levelUp = false;
		}

		traversePath(mainPathIdx, sessions, limit, maxRatePos)

	}

	// generate paths to EXIT label with all terminals
	x = maxX + divGap;
	var startDiv = getDiv("", START_FUNCID);
	var currY = y;
	y = $(startDiv).position().top;

	console.log("MAX X = " + maxX + ", MIN Y=" + minY);

	var endDiv = getDiv(ExitLabel, END_FUNCID);
	y = currY;
	if (levelUp) {
		y -= yGap;
	}

	// empty enpoints before draw path to exit
	endPoints = [];

	for (var t = 0; t < terminalFunc.length; t++) {

		var tFuncId = terminalFunc[t][0];
		var tRate = terminalFunc[t][1];
		var terminalDiv = getDiv("", tFuncId);
		var defAnchor = false;

		if (t == 0) {
			defAnchor = true;
		}
		makeConnection(terminalDiv, endDiv, defAnchor, tRate);

	}

	//    var src = getDiv("SOURCE", "src");   
	//    var dest = getDiv("TARGET", "dest");
	//    $(dest).offset({left: $(src).offset().left-divGap, top: $(src).offset().top+yGap});
	//    
	//    makeConnection(dest, src);
	//    makeConnection(dest, src);
	//    makeConnection(dest, src);

	//    makeConnection(src, dest);
	//    makeConnection(src, dest);
	//    makeConnection(src, dest);

}

function traversePath(sessionIdx, sessions, limit, maxRatePos) {

	var currSession = sessions[sessionIdx];
	var funcIdx = sessionIdx - 1;
	var currDiv;

	if (sessionIdx != 0) {
		var fail = roundUp(cluster.fail[funcIdx], 100);
		var content = getFuncContent(funcIdx, cluster);
		currDiv = getDiv(content, funcs[funcIdx].funcId, true, fail);
	} else {
		currDiv = getDiv("", START_FUNCID);
	}

	// get global sorted session
	var sortedSession = sortedSessions[sessionIdx];

	var firstMaxPath = true;
	for (var i = 0; i < sortedSession.length; i++) {

		var realIdx = sortedSession[i][1];

		var rate = sortedSession[i][0];
		if (rate >= limit && realIdx != maxRatePos[sessionIdx]) {

			sessions[sessionIdx][realIdx] = 0; // mark as done
			sortedSession[i][0] = 0; // mark as done

			if (realIdx == 0) {
				var currFuncIdx = currDiv.id.substring(4, currDiv.id
						.indexOf("_"));
				var terminal = [ currFuncIdx, rate ];
				queueTerminal(terminal);
				y += yGap;
				levelUp = false;
			} else {

				var tmpFuncIdx = realIdx - 1;
				console.log("connect " + funcIdx + " to " + tmpFuncIdx);

				var fail = roundUp(cluster.fail[tmpFuncIdx], 100);
				var content = getFuncContent(tmpFuncIdx, cluster);
				x = $(currDiv).position().left + divGap;

				var nextDiv = getDiv(content, funcs[tmpFuncIdx].funcId, false,
						fail);

				if (firstMaxPath) {
					var srcY = $(currDiv).position().top;
					var destY = $(nextDiv).position().top;
					var srcId = $(currDiv).attr("id");
					var destId = $(nextDiv).attr("id");
					if (srcY == destY
							&& !(isOnMainPath(srcId) || isOnMainPath(destId))) {
						makeConnection(currDiv, nextDiv, true, rate);
					} else {
						makeConnection(currDiv, nextDiv, false, rate);
					}
					firstMaxPath = false;
				} else {
					makeConnection(currDiv, nextDiv, false, rate);
				}

				traversePath(realIdx, sessions, limit, maxRatePos);

			}

		}

	}

	if (levelUp) {
		y += yGap;
		levelUp = false;
	}

}

function getFuncContent(funcIdx, cluster) {

	var content = funcs[funcIdx].funcName;
	content += "<br/>" + TIME_LABEL + ": ";
	content += roundUp(cluster.mean[funcIdx]);
	content += "s<br/>" + FAIL_LABEL + ": ";
	content += roundUp(cluster.fail[funcIdx], 100);
	content += "%";

	return content;

}

function roundUp(num, multi, digits) {

	if (isNaN(num)) {
		return "";
	}

	if (typeof multi == "undefined") {
		multi = 1;
	}

	if (typeof digits == "undefined") {
		digits = 2;
	}

	var d = Math.pow(10, digits);
	var roundNum = Math.round(num * d);
	roundNum = roundNum / d;
	var result = Math.round(multi * roundNum);

	return result;
}

function getDiv(content, divId, autoIncX, fail) {

	if (typeof autoIncX == "undefined") {
		autoIncX = true;
	}

	if (typeof fail == "undefined") {
		fail = 0;
	}

	console.log("Make div of fucn [" + divId + "] with [" + content + "]");

	var newDivId = "func" + divId + "_" + currClusterIdx;
	if ($("#" + newDivId).length > 0) {
		console.log("Func[" + newDivId + "] already exists.");
		return $("#" + newDivId)[0];
	}

	var div = document.createElement('div');
	div.className = "func";
	div.id = newDivId;
	div.style.position = "absolute";
	div.style.left = x + "px";
	div.style.top = y + "px";

	div.style.background = "linear-gradient(" + NORMAL_COLOR + " "
			+ (100 - fail) + "%, " + FAIL_COLOR + " " + fail + "%)";
	div.innerHTML = content;

	$("#" + currTab).append(div);

	if (autoIncX) {
		x += divGap;
	}

	if (x > maxX) {
		maxX = x;
	}

	levelUp = true;

	$(div).hover(
			function() {
				var id = $(this).attr("id");
				$("svg[id^='" + id + "']").css("stroke", PATH_OUT_COLOR_HOVER)
						.css("stroke-width", PATH_SIZE_HOVER).css("z-index",
								999);
				$("svg[id$='" + id + "']").css("stroke", PATH_IN_COLOR_HOVER)
						.css("stroke-width", PATH_SIZE_HOVER).css("z-index",
								999);
				$("div[id^='" + id + "_LBL']").css("color",
						PATH_OUT_COLOR_HOVER).css("font-weight", "bold").css(
						"z-index", 999);
				$("div[id$='LBL_" + id + "']")
						.css("color", PATH_IN_COLOR_HOVER).css("font-weight",
								"bold").css("z-index", 999);
			},
			function() {
				var id = $(this).attr("id");
				$("svg[id^='" + id + "']").css("stroke", PATH_COLOR).css(
						"stroke-width", PATH_SIZE).css("z-index", "");
				$("svg[id$='" + id + "']").css("stroke", PATH_COLOR).css(
						"stroke-width", PATH_SIZE).css("z-index", "");
				$("div[id^='" + id + "_LBL']").css("color", "#444").css(
						"font-weight", "").css("z-index", "");
				$("div[id$='LBL_" + id + "']").css("color", "#444").css(
						"font-weight", "").css("z-index", "");
			});

	return div;

}

function getFuncId(idx) {

	if (idx == 0) {
		return "func" + START_FUNCID + "_" + currClusterIdx;
	}

	return "func" + funcs[idx - 1].funcId + "_" + currClusterIdx;

}

function isOnMainPath(funcId) {

	var on = false;

	for (var i = 0; i < primaryMainPath.length; i++) {
		var mainFuncId = getFuncId(primaryMainPath[i]);
		if (funcId == mainFuncId) {
			on = true;
			break;
		}
	}

	return on;

}

function getPathMode(srcId, destId, isPrimaryMainPath) {

	if (typeof isPrimaryMainPath !== 'undefined' && true == isPrimaryMainPath) {
		return PATH_MODE.RightLeft;
	}

	var srcX = $("#" + srcId).position().left;
	var srcY = $("#" + srcId).position().top;
	var destX = $("#" + destId).position().left;
	var destY = $("#" + destId).position().top;

	if (srcY == destY) {
		if (srcX > destX) {
			return PATH_MODE.BottomBottom;
		} else {
			if (!isPrimaryMainPath) {
				return PATH_MODE.TopTop;
			}
		}
	} else if (srcX == destX) {
		if (srcY > destY) {
			return PATH_MODE.LeftLeft;
		} else {
			return PATH_MODE.RightRight;
		}
	} else if (srcX > destX && srcY > destY) {
		return PATH_MODE.BottomBottom;
	} else if (srcX < destX && srcY < destY) {
		if (isOnMainPath(srcId)) {
			return PATH_MODE.BottomLeft;
		} else {
			return PATH_MODE.RightTop;
		}
	} else if (srcX > destX && srcY < destY) {
		return PATH_MODE.BottomRight;
	} else if (srcX < destX && srcY > destY) {
		return PATH_MODE.RightBottom;
	}

	return PATH_MODE.RightLeft;
}

function getAnchor(funcDiv, side) {

	var anchorX;
	var anchorY;

	var paddingLeft = parseFloat($(funcDiv).css("padding-left").replace("px",
			""));
	var paddingRight = parseFloat($(funcDiv).css("padding-right").replace("px",
			""));
	var paddingTop = parseFloat($(funcDiv).css("padding-top").replace("px", ""));
	var paddingBottom = parseFloat($(funcDiv).css("padding-bottom").replace(
			"px", ""));
	var borderFix = 2;

	if ("L" == side) {

		anchorX = $(funcDiv).position().left;
		anchorY = roundUp($(funcDiv).position().top + $(funcDiv).height() / 2
				+ paddingTop);

	} else if ("R" == side) {

		anchorX = roundUp($(funcDiv).position().left + $(funcDiv).width()
				+ paddingLeft + paddingRight);
		anchorY = roundUp($(funcDiv).position().top + $(funcDiv).height() / 2
				+ paddingTop);
		anchorX += borderFix;

	} else if ("T" == side) {

		anchorX = roundUp($(funcDiv).position().left + $(funcDiv).width() / 2
				+ paddingLeft);
		anchorY = $(funcDiv).position().top;

	} else if ("B" == side) {

		anchorX = roundUp($(funcDiv).position().left + $(funcDiv).width() / 2
				+ paddingLeft);
		anchorY = roundUp($(funcDiv).position().top + $(funcDiv).height()
				+ paddingTop + paddingBottom);
		anchorY += borderFix;

	}

	var endPointIdx = endPointUsed(anchorX, anchorY);
	var accum = 0;

	if (endPointIdx < 0) {
		var endPoint = [ anchorX, anchorY, accum ];
		endPoints.push(endPoint);
	} else {

		accum = endPoints[endPointIdx][2];
		var plus = false;
		if (accum % 2 == 0) {
			plus = true;
		}

		if ("L" == side || "R" == side) {
			if (plus) {
				anchorY = anchorY + (parseInt(accum / 2) + 1) * ANCHOR_SHIFT;
			} else {
				anchorY = anchorY - (parseInt(accum / 2) + 1) * ANCHOR_SHIFT;
			}
		} else if ("T" == side || "B" == side) {
			if (plus) {
				anchorX = anchorX + (parseInt(accum / 2) + 1) * ANCHOR_SHIFT;
			} else {
				anchorX = anchorX - (parseInt(accum / 2) + 1) * ANCHOR_SHIFT;
			}
		}

		accum += 1;
		endPoints[endPointIdx][2] = accum;

	}

	return [ anchorX, anchorY, accum ];

}

function makeConnection(source, target, isMainPath, rate) {

	if (typeof isMainPath === 'undefined') {
		isMainPath = false;
	}

	var srcId = $(source).attr("id");
	var destId = $(target).attr("id");
	var svgId = srcId + "_TO_" + destId; // + "_" + currClusterIdx;
	var pathMode = getPathMode(srcId, destId, isMainPath);

	if (pathMode == PATH_MODE.RightLeft) {
		drawPathRightLeft(source, target, pathMode, svgId, rate);
	} else if (pathMode == PATH_MODE.TopTop) {
		drawPathTopTop(source, target, pathMode, svgId, rate);
	} else if (pathMode == PATH_MODE.BottomBottom) {
		drawPathBottomBottom(source, target, pathMode, svgId, rate);
	} else if (pathMode == PATH_MODE.LeftLeft) {
		drawPathLeftLeft(source, target, pathMode, svgId, rate);
	} else if (pathMode == PATH_MODE.RightRight) {
		drawPathRightRight(source, target, pathMode, svgId, rate);
	} else if (pathMode == PATH_MODE.LeftBottom) {
		drawPathLeftBottom(source, target, pathMode, svgId, rate);
	} else if (pathMode == PATH_MODE.BottomLeft) {
		drawPathBottomLeft(source, target, pathMode, svgId, rate);
	} else if (pathMode == PATH_MODE.BottomRight) {
		drawPathBottomRight(source, target, pathMode, svgId, rate);
	} else if (pathMode == PATH_MODE.RightBottom) {
		drawPathRightBottom(source, target, pathMode, svgId, rate);
	} else if (pathMode == PATH_MODE.RightTop) {
		drawPathRightTop(source, target, pathMode, svgId, rate);
	} else {
		// not supported
	}

}

function getEndpoints(source, target, pathMode) {

	var srcCoordinate = getAnchor(source, pathMode.substring(0, 1));
	var destCoordinate = getAnchor(target, pathMode.substring(1, 2));

	return [ srcCoordinate[0], srcCoordinate[1], srcCoordinate[2],
			destCoordinate[0], destCoordinate[1], destCoordinate[2] ];

}

function endPointUsed(x, y) {

	for (var i = 0; i < endPoints.length; i++) {

		var coord = endPoints[i];
		if (x == coord[0] && y == coord[1]) {
			return i;
		}

	}

	return -1;

}

function getSVGElement(left, top, width, height, svgId) {

	var svg = document.createElementNS(SVG_NAME_SPACE, "svg");

	svg.style.position = "absolute";
	svg.style.left = left + "px";
	svg.style.top = top + "px";
	svg.setAttribute("width", width);
	svg.setAttribute("height", height);
	svg.setAttribute("position", "absolute");
	svg.setAttribute("version", "1.1");
	svg.setAttribute("xmlns", XML_NAME_SPACE);
	svg.setAttribute("class", "myConnector");
	svg.id = svgId;

	return svg;

}

function getPathElement(pathString, xShift, yShift, isFill) {

	if (typeof xShift === 'undefined') {
		xShift = 0;
	}
	if (typeof yShift === 'undefined') {
		yShift = 0;
	}
	if (typeof isFill === 'undefined') {
		isFill = true;
	}

	var path = document.createElementNS(SVG_NAME_SPACE, "path");
	path.setAttribute("d", pathString);

	if (xShift != 0 || yShift != 0) {
		path.setAttribute("transform", "translate(" + xShift + ", " + yShift
				+ ")");
	}

	if (!isFill) {
		path.setAttribute("fill", "none");
	}
	//		path.setAttribute("stroke", "#61B7CF");
	//		path.setAttribute("stroke-width", 2);
	//		path.setAttribute("class","myConnector");

	return path;
}

function composePathString() {

	if (arguments.length < 4) {
		return "M 0 0";
	}

	// MOVE TO
	var pathStr = "M " + arguments[0] + " " + arguments[1];
	var len = arguments.length;
	if (len % 2 == 1) {
		len = len - 1;
	}

	for (var i = 2; i < len; i++) {

		pathStr += " L " + arguments[i++];
		pathStr += " " + arguments[i];

	}

	var lastArg = arguments[arguments.length - 1];
	if (lastArg === true) {
		pathStr += " Z";
	}

	return pathStr;

}

function getLabelElement(labelX, labelY, rate, svgId) {

	var label = document.createElement("div");
	label.style.position = "absolute";
	label.style.left = labelX + "px";
	label.style.top = labelY + "px";
	label.innerHTML = "" + roundUp(rate, 100) + "%";
	label.setAttribute("class", "myLabel");
	label.id = svgId.replace("_TO_", "_LBL_");

	return label;

}

function drawPathRightLeft(source, target, pathMode, svgId, rate) {
	// PATH_MODE.RightLeft
	var endpoints = getEndpoints(source, target, pathMode);
	var srcX = endpoints[0];
	var srcY = endpoints[1];
	var accum = endpoints[2];
	var destX = endpoints[3];
	var destY = endpoints[4];
	accum += endpoints[5];

	var svgWidth = roundUp(Math.abs(destX - srcX));
	var svgHeight = roundUp(STROKE_WIDTH + ARROW_WIDTH * 2
			+ Math.abs(destY - srcY));
	var yShift = roundUp(svgHeight / 2);

	var svg = getSVGElement(srcX, (srcY - yShift), svgWidth, svgHeight, svgId);
	$("#" + currTab).append(svg);

	var startX = 0;
	var startY = 0;
	var endX = svgWidth;
	var endY = roundUp(Math.abs(destY - srcY));
	var pathString = composePathString(startX, startY, endX, endY);

	var path = getPathElement(pathString, 0, yShift, false);
	$(svg).append(path);

	startX = (svgWidth - ARROW_WIDTH);
	startY = (0 - HALF_ARROW_WIDTH);
	var midX = svgWidth;
	var midY = 0;
	endX = startX;
	endY = HALF_ARROW_WIDTH;
	pathString = composePathString(startX, startY, midX, midY, endX, endY, true);

	var pathArrow = getPathElement(pathString, 0, yShift, true);
	$(svg).append(pathArrow);

	var pathLength = svgWidth;
	var labelX = roundUp(srcX + pathLength * LABEL_STOP_RATE - 18);
	var labelY = roundUp(srcY - 10);

	var label = getLabelElement(labelX, labelY, rate, svgId);
	$("#" + currTab).append(label);

}

function drawPathTopTop(source, target, pathMode, svgId, rate) {
	// PATH_MODE.TopTop
	var endpoints = getEndpoints(source, target, pathMode);
	var srcX = endpoints[0];
	var srcY = endpoints[1];
	var accum = endpoints[2];
	var destX = endpoints[3];
	var destY = endpoints[4];
	accum += endpoints[5];

	var accumFix = 0;
	if (srcY == destY) {

		for (var i = 0; i < yLines.length; i++) {
			if (yLines[i][0] == srcY) {
				yLines[i][1]++;
				accumFix = yLines[i][1] * 5;
				break;
			}
		}
		if (accumFix == 0) {
			var yLine = [ srcY, 0 ];
			yLines.push(yLine);
		}
	}

	var xShift = STROKE_WIDTH + ARROW_WIDTH;
	var xDiff = Math.abs(destX - srcX);
	var svgWidth = roundUp(xDiff) + xShift * 2;
	var accumShift = PATH_HEIGHT + (ANCHOR_SHIFT * accum) + accumFix;
	var svgHeight = roundUp(STROKE_WIDTH + accumShift);

	var svg = getSVGElement((srcX - xShift), (srcY - svgHeight), svgWidth,
			svgHeight, svgId);
	$("#" + currTab).append(svg);

	var startX = xShift;
	var startY = svgHeight;
	var stop1X = startX;
	var stop1Y = STROKE_WIDTH;
	var stop2X = startX + xDiff;
	var stop2Y = stop1Y;
	var endX = stop2X;
	var endY = startY;
	var pathString = composePathString(startX, startY, stop1X, stop1Y, stop2X,
			stop2Y, endX, endY);

	var path = getPathElement(pathString, 0, 0, false);
	$(svg).append(path);

	var length1 = startY - stop1Y;
	var length2 = stop2X - stop1X;
	var length3 = endY - stop2Y;
	var pathLength = length1 + length2 + length3;
	var labelStop = roundUp(pathLength * LABEL_STOP_RATE);

	var pathArrow = document.createElementNS(SVG_NAME_SPACE, "path");
	startX = endX - HALF_ARROW_WIDTH;
	startY = svgHeight - HALF_ARROW_WIDTH;
	var midX = endX;
	var midY = endY;
	endX = endX + HALF_ARROW_WIDTH;
	endY = startY;
	pathString = composePathString(startX, startY, midX, midY, endX, endY, true);

	var pathArrow = getPathElement(pathString, 0, 0, true);
	$(svg).append(pathArrow);

	var labelX;
	var labelY;

	if (labelStop > length1 + length2) {
		labelX = roundUp(destX - 18);
		labelY = roundUp(destY - (pathLength - labelStop) - 10);
	} else if (labelStop > length1) {
		labelX = roundUp(srcX + (labelStop - length1) - 18);
		labelY = roundUp(srcY - length1 - 10);
	} else {
		labelX = roundUp(srcX - 18);
		labelY = roundUp(srcY - abelStop - 10);
	}

	var label = getLabelElement(labelX, labelY, rate, svgId);
	$("#" + currTab).append(label);

}

function drawPathBottomBottom(source, target, pathMode, svgId, rate) {
	// PATH_MODE.BottomBottom
	var endpoints = getEndpoints(source, target, pathMode);
	var srcX = endpoints[0];
	var srcY = endpoints[1];
	var accum = endpoints[2];
	var destX = endpoints[3];
	var destY = endpoints[4];
	//accum += endpoints[5];

	var accumFix = 0;
	if (srcY == destY) {

		for (var i = 0; i < yLines.length; i++) {
			if (yLines[i][0] == srcY) {
				yLines[i][1]++;
				accumFix = yLines[i][1] * 5;
				break;
			}
		}
		if (accumFix == 0) {
			var yLine = [ srcY, 0 ];
			yLines.push(yLine);
		}
	}

	var xDiff = roundUp(Math.abs(srcX - destX));
	var yDiff = roundUp(Math.abs(srcY - destY));
	var xShift = STROKE_WIDTH + ARROW_WIDTH;
	var svgWidth = xDiff + xShift * 2;
	var accumShift = PATH_HEIGHT + (ANCHOR_SHIFT * accum) + accumFix;
	var svgHeight = roundUp(STROKE_WIDTH + accumShift) + yDiff;

	var svg = getSVGElement((destX - xShift), destY, svgWidth, svgHeight, svgId);
	$("#" + currTab).append(svg);

	var startX = xDiff + xShift;
	var startY = yDiff;
	var stop1X = startX;
	var stop1Y = svgHeight - STROKE_WIDTH;
	var stop2X = xShift;
	var stop2Y = stop1Y;
	var endX = stop2X;
	var endY = 0;
	var pathString = composePathString(startX, startY, stop1X, stop1Y, stop2X,
			stop2Y, endX, endY);

	var path = getPathElement(pathString, 0, 0, false);
	$(svg).append(path);

	var length1 = stop1Y - startY;
	var length2 = stop1X - stop2X;
	var length3 = stop2Y - endY;
	var pathLength = length1 + length2 + length3;
	var labelStop = roundUp(pathLength * LABEL_STOP_RATE);

	var pathArrow = document.createElementNS(SVG_NAME_SPACE, "path");
	startX = endX - HALF_ARROW_WIDTH;
	startY = HALF_ARROW_WIDTH;
	var midX = endX;
	var midY = 0;
	endX = midX + HALF_ARROW_WIDTH;
	endY = startY;
	pathString = composePathString(startX, startY, midX, midY, endX, endY, true);

	var pathArrow = getPathElement(pathString, 0, 0, true);
	$(svg).append(pathArrow);

	var labelX;
	var labelY;

	if (labelStop > length1 + length2) {
		labelX = roundUp(destX - 18);
		labelY = roundUp(destY + (pathLength - labelStop) - 10);
	} else if (labelStop > length1) {
		labelX = roundUp(srcX - (labelStop - length1) - 18);
		labelY = roundUp(srcY + length1 - 10);
	} else {
		labelX = roundUp(srcX - 18);
		labelY = roundUp(srcY + (length1 - labelStop) - 10);
	}

	var label = getLabelElement(labelX, labelY, rate, svgId);
	$("#" + currTab).append(label);

}

function drawPathLeftLeft(source, target, pathMode, svgId, rate) {
	// PATH_MODE.LeftLeft
	var endpoints = getEndpoints(source, target, pathMode);
	var srcX = endpoints[0];
	var srcY = endpoints[1];
	var accum = endpoints[2];
	var destX = endpoints[3];
	var destY = endpoints[4];
	accum += endpoints[5];

	var yShift = STROKE_WIDTH + ARROW_WIDTH;
	var accumShift = PATH_HEIGHT + (ANCHOR_SHIFT * accum);

	var svgWidth = roundUp(STROKE_WIDTH + accumShift);
	var svgHeight = roundUp(Math.abs(destY - srcY)) + yShift * 2;

	var svg = getSVGElement((destX - svgWidth), (destY - yShift), svgWidth,
			svgHeight, svgId);
	$("#" + currTab).append(svg);

	var startX = svgWidth;
	var startY = Math.abs(srcY - destY);
	var stop1X = STROKE_WIDTH;
	var stop1Y = startY;
	var stop2X = stop1X;
	var stop2Y = 0;
	var endX = startX;
	var endY = 0;
	var pathString = composePathString(startX, startY, stop1X, stop1Y, stop2X,
			stop2Y, endX, endY);

	var path = getPathElement(pathString, 0, yShift, false);
	$(svg).append(path);

	var pathArrow = document.createElementNS(SVG_NAME_SPACE, "path");
	startX = startX - HALF_ARROW_WIDTH;
	startY = 0 - HALF_ARROW_WIDTH;
	var midX = endX;
	var midY = 0;
	endX = startX;
	endY = HALF_ARROW_WIDTH;
	pathString = composePathString(startX, startY, midX, midY, endX, endY, true);

	var pathArrow = getPathElement(pathString, 0, yShift, true);
	$(svg).append(pathArrow);

}

function drawPathRightRight(source, target, pathMode, svgId, rate) {
	// PATH_MODE.RightRight
	var endpoints = getEndpoints(source, target, pathMode);
	var srcX = endpoints[0];
	var srcY = endpoints[1];
	var accum = endpoints[2];
	var destX = endpoints[3];
	var destY = endpoints[4];
	accum += endpoints[5];

	var yShift = STROKE_WIDTH + ARROW_WIDTH;
	var accumShift = PATH_HEIGHT + (ANCHOR_SHIFT * accum);

	var svgWidth = roundUp(STROKE_WIDTH + accumShift);
	var svgHeight = roundUp(Math.abs(srcY - destY)) + yShift * 2;

	var svg = getSVGElement(srcX, (srcY - yShift), svgWidth, svgHeight, svgId);
	$("#" + currTab).append(svg);

	var startX = 0;
	var startY = 0;
	var stop1X = accumShift;
	var stop1Y = 0;
	var stop2X = accumShift;
	var stop2Y = Math.abs(srcY - destY);
	var endX = 0;
	var endY = stop2Y;
	var pathString = composePathString(startX, startY, stop1X, stop1Y, stop2X,
			stop2Y, endX, endY);

	var path = getPathElement(pathString, 0, yShift, false);
	$(svg).append(path);

	var pathArrow = document.createElementNS(SVG_NAME_SPACE, "path");
	startX = HALF_ARROW_WIDTH;
	startY = endY - HALF_ARROW_WIDTH;
	var midX = 0;
	var midY = endY;
	endX = startX;
	endY = midY + HALF_ARROW_WIDTH;
	pathString = composePathString(startX, startY, midX, midY, endX, endY, true);

	var pathArrow = getPathElement(pathString, 0, yShift, true);
	$(svg).append(pathArrow);

}

function drawPathLeftBottom(source, target, pathMode, svgId, rate) {
	// PATH_MODE.LeftBottom
	var endpoints = getEndpoints(source, target, pathMode);
	var srcX = endpoints[0];
	var srcY = endpoints[1];
	var accum = endpoints[2];
	var destX = endpoints[3];
	var destY = endpoints[4];
	accum += endpoints[5];

	var xShift = STROKE_WIDTH + ARROW_WIDTH;

	var svgWidth = roundUp(Math.abs(srcX - destX)) + xShift;
	var svgHeight = roundUp(Math.abs(srcY - destY)) + xShift;

	var svg = getSVGElement((destX - xShift), destY, svgWidth, svgHeight, svgId);
	$("#" + currTab).append(svg);

	var startX = svgWidth;
	var startY = svgHeight - xShift;
	var stop1X = xShift;
	var stop1Y = startY;
	var endX = stop1X;
	var endY = 0;
	var pathString = composePathString(startX, startY, stop1X, stop1Y, endX,
			endY);

	var path = getPathElement(pathString, 0, 0, false);
	$(svg).append(path);

	var pathArrow = document.createElementNS(SVG_NAME_SPACE, "path");
	startX = endX - HALF_ARROW_WIDTH;
	startY = HALF_ARROW_WIDTH;
	var midX = endX;
	var midY = endY;
	endX = midX + HALF_ARROW_WIDTH;
	endY = midY + HALF_ARROW_WIDTH;
	pathString = composePathString(startX, startY, midX, midY, endX, endY, true);

	var pathArrow = getPathElement(pathString, 0, 0, true);
	$(svg).append(pathArrow);

}

function drawPathBottomLeft(source, target, pathMode, svgId, rate) {
	// PATH_MODE.BottomLeft
	var endpoints = getEndpoints(source, target, pathMode);
	var srcX = endpoints[0];
	var srcY = endpoints[1];
	var accum = endpoints[2];
	var destX = endpoints[3];
	var destY = endpoints[4];
	accum += endpoints[5];

	var xShift = STROKE_WIDTH + ARROW_WIDTH;

	var svgWidth = roundUp(Math.abs(srcX - destX)) + xShift;
	var svgHeight = roundUp(Math.abs(srcY - destY)) + xShift;

	var svg = getSVGElement((srcX - xShift), srcY, svgWidth, svgHeight, svgId);
	$("#" + currTab).append(svg);

	var startX = xShift;
	var startY = 0;
	var stop1X = startX;
	var stop1Y = svgHeight - xShift;
	var endX = svgWidth;
	var endY = stop1Y;
	var pathString = composePathString(startX, startY, stop1X, stop1Y, endX,
			endY);

	var path = getPathElement(pathString, 0, 0, false);
	$(svg).append(path);

	var length1 = stop1Y - startY;
	var length2 = endX - startX;
	var pathLength = length1 + length2;
	var labelStop = roundUp(pathLength * LABEL_STOP_RATE);

	var pathArrow = document.createElementNS(SVG_NAME_SPACE, "path");
	startX = endX - HALF_ARROW_WIDTH;
	startY = endY - HALF_ARROW_WIDTH;
	var midX = endX;
	var midY = endY;
	endX = startX;
	endY = midY + HALF_ARROW_WIDTH;
	pathString = composePathString(startX, startY, midX, midY, endX, endY, true);

	var pathArrow = getPathElement(pathString, 0, 0, true);
	$(svg).append(pathArrow);

	var labelX;
	var labelY;

	if (labelStop > length1) {
		labelX = roundUp(labelStop - length1 + srcX - 18);
		labelY = roundUp(destY - 10);
	} else {
		labelX = roundUp(srcX - 18);
		labelY = roundUp(length1 - labelStop + srcY - 10);
	}

	var label = getLabelElement(labelX, labelY, rate, svgId);
	$("#" + currTab).append(label);

}

function drawPathBottomRight(source, target, pathMode, svgId, rate) {
	// PATH_MODE.BottomRight
	var endpoints = getEndpoints(source, target, pathMode);
	var srcX = endpoints[0];
	var srcY = endpoints[1];
	var accum = endpoints[2];
	var destX = endpoints[3];
	var destY = endpoints[4];
	accum += endpoints[5];

	var xShift = STROKE_WIDTH + ARROW_WIDTH;

	var svgWidth = roundUp(Math.abs(srcX - destX)) + xShift;
	var svgHeight = roundUp(Math.abs(srcY - destY)) + xShift;

	var svg = getSVGElement(destX, srcY, svgWidth, svgHeight, svgId);
	$("#" + currTab).append(svg);

	var startX = svgWidth - xShift;
	var startY = 0;
	var stop1X = startX;
	var stop1Y = svgHeight - xShift;
	var endX = 0;
	var endY = stop1Y;
	var pathString = composePathString(startX, startY, stop1X, stop1Y, endX,
			endY);

	var path = getPathElement(pathString, 0, 0, false);
	$(svg).append(path);

	var pathArrow = document.createElementNS(SVG_NAME_SPACE, "path");
	startX = endX + HALF_ARROW_WIDTH;
	startY = endY - HALF_ARROW_WIDTH;
	var midX = endX;
	var midY = endY;
	endX = startX;
	endY = midY + HALF_ARROW_WIDTH;
	pathString = composePathString(startX, startY, midX, midY, endX, endY, true);

	var pathArrow = getPathElement(pathString, 0, 0, true);
	$(svg).append(pathArrow);

}

function drawPathRightBottom(source, target, pathMode, svgId, rate) {
	// PATH_MODE.RightBottom
	var endpoints = getEndpoints(source, target, pathMode);
	var srcX = endpoints[0];
	var srcY = endpoints[1];
	var accum = endpoints[2];
	var destX = endpoints[3];
	var destY = endpoints[4];
	accum += endpoints[5];

	var xShift = STROKE_WIDTH + ARROW_WIDTH;

	var svgWidth = roundUp(Math.abs(srcX - destX)) + xShift;
	var svgHeight = roundUp(Math.abs(srcY - destY)) + xShift;

	var svg = getSVGElement(srcX, destY, svgWidth, svgHeight, svgId);
	$("#" + currTab).append(svg);

	var startX = 0;
	var startY = svgHeight - xShift;
	var stop1X = svgWidth - xShift;
	var stop1Y = startY;
	var endX = stop1X;
	var endY = 0;
	var pathString = composePathString(startX, startY, stop1X, stop1Y, endX,
			endY);

	var path = getPathElement(pathString, 0, 0, false);
	$(svg).append(path);

	var length1 = stop1X - startX;
	var length2 = stop1Y - endY;
	var pathLength = length1 + length2;
	var labelStop = roundUp(pathLength * LABEL_STOP_RATE);

	var pathArrow = document.createElementNS(SVG_NAME_SPACE, "path");
	startX = endX - HALF_ARROW_WIDTH;
	startY = endY + HALF_ARROW_WIDTH;
	var midX = endX;
	var midY = endY;
	endX = midX + HALF_ARROW_WIDTH;
	endY = startY;
	pathString = composePathString(startX, startY, midX, midY, endX, endY, true);

	var pathArrow = getPathElement(pathString, 0, 0, true);
	$(svg).append(pathArrow);

	var labelX;
	var labelY;

	if (labelStop > length1) {
		labelX = roundUp(srcX + length1 - 18);
		labelY = roundUp(destY + (pathLength - labelStop - 10));
	} else {
		labelX = roundUp(srcX + (length1 - labelStop - 18));
		labelY = roundUp(srcY - 10);
	}

	var label = getLabelElement(labelX, labelY, rate, svgId);
	$("#" + currTab).append(label);

}

function drawPathRightTop(source, target, pathMode, svgId, rate) {
	// PATH_MODE.RightTop
	var endpoints = getEndpoints(source, target, pathMode);
	var srcX = endpoints[0];
	var srcY = endpoints[1];
	var accum = endpoints[2];
	var destX = endpoints[3];
	var destY = endpoints[4];
	accum += endpoints[5];

	var xShift = STROKE_WIDTH + ARROW_WIDTH;

	var xDiff = roundUp(Math.abs(destX - srcX));
	var yDiff = roundUp(Math.abs(srcY - destY));
	var svgWidth = xDiff + xShift;
	var svgHeight = yDiff + xShift;

	var svg = getSVGElement(srcX, srcY - xShift, svgWidth, svgHeight, svgId);
	$("#" + currTab).append(svg);

	var startX = 0;
	var startY = xShift;
	var stop1X = svgWidth - xShift;
	var stop1Y = startY;
	var endX = stop1X;
	var endY = svgHeight;
	var pathString = composePathString(startX, startY, stop1X, stop1Y, endX,
			endY);

	var path = getPathElement(pathString, 0, 0, false);
	$(svg).append(path);

	var length1 = stop1X - startX;
	var length2 = endY - stop1Y;
	var pathLength = length1 + length2;
	var labelStop = roundUp(pathLength * LABEL_STOP_RATE);

	var pathArrow = document.createElementNS(SVG_NAME_SPACE, "path");
	startX = endX - HALF_ARROW_WIDTH;
	startY = endY - HALF_ARROW_WIDTH;
	var midX = endX;
	var midY = endY;
	endX = midX + HALF_ARROW_WIDTH;
	endY = startY;
	pathString = composePathString(startX, startY, midX, midY, endX, endY, true);

	var pathArrow = getPathElement(pathString, 0, 0, true);
	$(svg).append(pathArrow);

	var labelX;
	var labelY;

	if (labelStop > length1) {
		labelX = roundUp(srcX + length1 - 18);
		labelY = roundUp(destY - (pathLength - labelStop) - 10);
	} else {
		labelX = roundUp(srcX + (length1 - labelStop - 18));
		labelY = roundUp(srcY - 10);
	}

	var label = getLabelElement(labelX, labelY, rate, svgId);
	$("#" + currTab).append(label);

}