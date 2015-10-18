var PATH_MODE = {
    "RightLeft": "RL",
    "TopTop": "TT",
    "BottomBottom": "BB",
    "LeftLeft": "LL",
    "RightRight": "RR",
    "LeftBottom": "LB",
    "BottomLeft": "BL",
    "BottomRight": "BR",
    "RightBottom": "RB",
    "RightTop": "RT"
};

var ARROW_WIDTH = 6;
var HALF_ARROW_WIDTH = ARROW_WIDTH / 2;
var STROKE_WIDTH = 1;
var PATH_HEIGHT = 30;
var ANCHOR_SHIFT = 8;

var currTab = "drawArea";
var endPoints = [];

var LABEL_STOP_RATE = 0.4;

function isOnMainPath(funcId) {

    var on = false;

    //for (var i = 0; i < primaryMainPath.length; i++) {
    //    var mainFuncId = getFuncId(primaryMainPath[i]);
    //    if (funcId == mainFuncId) {
    //        on = true;
    //        break;
    //    }
    //}

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
        var endPoint = [anchorX, anchorY, accum];
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

    return [anchorX, anchorY, accum];

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

    return [srcCoordinate[0], srcCoordinate[1], srcCoordinate[2],
        destCoordinate[0], destCoordinate[1], destCoordinate[2]];

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
            var yLine = [srcY, 0];
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
            var yLine = [srcY, 0];
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