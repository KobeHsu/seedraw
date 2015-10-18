var SVG_NAME_SPACE = "http://www.w3.org/2000/svg";
var XML_NAME_SPACE = "http://www.w3.org/1999/xhtml";

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;

var RECT_WIDTH = 120;
var RECT_HEIGHT = 60;
var RECT_HEIGHT_HALF = RECT_HEIGHT / 2;
var CIRCLE_R = 5;
var CIRCLE_R_HALF = CIRCLE_R / 2;

var g_line_mode = false;
var g_endpoint_id = "";
var g_text_id = "";

var g_rect_serial = 0;

var g_draw_aera;
var g_start_x;
var g_start_y;

function addPath() {

    var svg = document.createElementNS(SVG_NAME_SPACE, "svg");

    var svgId = "svg_" + g_rect_serial;
    var pathId = "path_" + g_rect_serial;
    var arrowId = "arrow_" + g_rect_serial;
    var closeId = "close_" + g_rect_serial;
    var circleId = "circle_" + g_rect_serial;

    svg.style.position = "absolute";
    svg.style.left = g_start_x + "px";
    svg.style.top = g_start_y + "px";
    svg.setAttribute("id", svgId);
    svg.setAttribute("width", (RECT_WIDTH + CIRCLE_R));
    svg.setAttribute("height", (RECT_HEIGHT + 2 * CIRCLE_R));
    svg.setAttribute("position", "absolute");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("xmlns", XML_NAME_SPACE);

    var close = document.createElementNS(SVG_NAME_SPACE, "circle");
    close.setAttribute("cx", CIRCLE_R);
    close.setAttribute("cy", CIRCLE_R);
    close.setAttribute("r", CIRCLE_R);
    close.setAttribute("id", closeId);
    close.setAttribute("fill", "black");
    close.style["z-index"] = "99";
    close.style.display = "none";

    svg.appendChild(close);

    var path = document.createElementNS(SVG_NAME_SPACE, "path");

    path.setAttribute("d", composePathString(0, RECT_HEIGHT_HALF, RECT_WIDTH, RECT_HEIGHT_HALF));
    path.setAttribute("id", pathId);
    path.style["fill"] = "none";
    path.setAttribute("class", "myConnector");

    svg.appendChild(path);

    // TODO handle arrow transform
    //var arrow = document.createElementNS(SVG_NAME_SPACE, "path");
    //arrow.setAttribute("d", composePathString(RECT_WIDTH, RECT_HEIGHT_HALF, RECT_WIDTH - 5, RECT_HEIGHT_HALF - 3, RECT_WIDTH - 5, RECT_HEIGHT_HALF + 3, true));
    //arrow.setAttribute("id", arrowId);
    //arrow.setAttribute("class", "myConnector");
    //
    //svg.appendChild(arrow);

    var circleGap = RECT_WIDTH / 3;
    var pathStrAry = [];
    for (var i = 0; i < 4; i++) {

        var circle = document.createElementNS(SVG_NAME_SPACE, "circle");

        var cx = CIRCLE_R;
        if (i > 0) {
            cx = (circleGap * i - CIRCLE_R_HALF);
        }

        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", RECT_HEIGHT_HALF);

        pathStrAry.push(cx);
        pathStrAry.push(RECT_HEIGHT_HALF);

        circle.setAttribute("r", CIRCLE_R);
        circle.setAttribute("id", circleId + "_" + i);
        circle.setAttribute("fill", "white");
        circle.setAttribute("stroke", "black");
        circle.style["z-index"] = "99";
        circle.style.display = "none";

        circle.onmousedown = circleMouseDown;

        svg.appendChild(circle);
    }
    path.setAttribute("d", composePathString(pathStrAry[0], pathStrAry[1], pathStrAry[2], pathStrAry[3], pathStrAry[4], pathStrAry[5], pathStrAry[6], pathStrAry[7]));

    // events begin
    close.onclick = function () {
        this.parentNode.parentNode.removeChild(this.parentNode);
    };

    svg.onmouseover = function (event) {

        var id = event.target.id;
        var idAry = id.split("_");
        var closeId = "close_" + idAry[1];
        var circleId = "circle_" + idAry[1];

        var x = document.getElementById(closeId);
        if (x) {
            x.style.display = "";
        }

        // refresh circles
        var pathEl = document.getElementById("path_" + idAry[1]);
        var pathStr = pathEl.getAttribute("d");
        var pathStrAry = pathStr.split(" ");
        for (var i = 0; i < 4; i++) {

            var circleEl = document.getElementById(circleId + "_" + i);
            var cx = circleEl.getAttribute("cx");
            var cy = circleEl.getAttribute("cy");
            var pathX = pathStrAry[3 * i + 1];
            var pathY = pathStrAry[3 * i + 2];
            if (cx != pathX) {
                circleEl.setAttribute("cx", pathX);
            }
            if (cy != pathY) {
                circleEl.setAttribute("cy", pathY);
            }

        }

        $("circle[id^=" + circleId + "]").show();

    };
    svg.onmouseout = function (event) {

        var id = event.target.id;
        var idAry = id.split("_");
        var closeId = "close_" + idAry[1];
        var circleId = "circle_" + idAry[1];

        var x = document.getElementById(closeId);
        if (x) {
            x.style.display = "none";
        }

        $("circle[id^=" + circleId + "]").hide();
    };

    svg.onmousedown = svgMouseDown;
    // events end

    g_rect_serial++;

    g_draw_aera.appendChild(svg);

}


function addRect() {

    var svg = document.createElementNS(SVG_NAME_SPACE, "svg");

    var svgId = "svg_" + g_rect_serial;
    var rectId = "rect_" + g_rect_serial;
    var textId = "text_" + g_rect_serial;
    var closeId = "close_" + g_rect_serial;
    var endpointId = "endpoint_" + g_rect_serial;

    svg.style.position = "absolute";
    svg.style.left = g_start_x + "px";
    svg.style.top = g_start_y + "px";
    svg.setAttribute("id", svgId);
    svg.setAttribute("width", (RECT_WIDTH + CIRCLE_R));
    svg.setAttribute("height", (RECT_HEIGHT + 2 * CIRCLE_R));
    svg.setAttribute("position", "absolute  ");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("xmlns", XML_NAME_SPACE);
    //svg.setAttribute("class", "func");

    var rect = document.createElementNS(SVG_NAME_SPACE, "rect");
    rect.setAttribute("id", rectId);
    rect.setAttribute("x", 0);
    rect.setAttribute("y", CIRCLE_R);
    rect.setAttribute("rx", 5);
    rect.setAttribute("ry", 5);
    rect.setAttribute("width", RECT_WIDTH);
    rect.setAttribute("height", RECT_HEIGHT);
    rect.setAttribute("class", "myRect");

    svg.appendChild(rect);

    // to remove svg
    var close = document.createElementNS(SVG_NAME_SPACE, "circle");
    close.setAttribute("cx", CIRCLE_R);
    close.setAttribute("cy", CIRCLE_R);
    close.setAttribute("r", CIRCLE_R);
    close.setAttribute("id", closeId);
    close.setAttribute("fill", "black");
    close.style["z-index"] = "99";
    close.style.display = "none";

    svg.appendChild(close);

    // endpoints
    /*    var epBottom = document.createElementNS(SVG_NAME_SPACE, "circle");
     epBottom.setAttribute("cx", (RECT_WIDTH / 2));
     epBottom.setAttribute("cy", RECT_HEIGHT + CIRCLE_R);
     epBottom.setAttribute("r", CIRCLE_R);
     epBottom.setAttribute("id", endpointId + "_bottom");
     epBottom.setAttribute("fill", "white");
     epBottom.setAttribute("stroke", "black");
     epBottom.style["z-index"] = "99";
     epBottom.style.display = "none";

     svg.appendChild(epBottom);*/

    // text on rect
    var text = document.createElementNS(SVG_NAME_SPACE, "text");
    text.setAttribute("x", 0);
    text.setAttribute("y", (RECT_HEIGHT / 2 + 11));
    text.setAttribute("id", textId);
    //text.setAttribute("text-anchor", "middle");
    //text.setAttribute("alignment-baseline", "middle");
    text.innerHTML = "TEXT HERE";

    svg.appendChild(text);

    // events begin
    close.onclick = function () {
        this.parentNode.parentNode.removeChild(this.parentNode);
    };

    text.ondblclick = function (event) {
        textDblClick.call(this, event, textId);
    }

    /*    epBottom.onmousedown = function (event) {

     var id = event.target.id;
     g_endpoint_id = id;

     event.target.addEventListener("mousemove", endpointMouseMove);
     //document.getElementById("drawArea").addEventListener("mousemove", function(event) {
     //    console.log(event.clientX);
     //});
     document.getElementById("drawArea").addEventListener("mouseup", function (event) {
     g_line_mode = false;
     console.log("MOUSEUP mode=" + g_line_mode);
     if (g_endpoint_id != "") {
     document.getElementById(g_endpoint_id).removeEventListener("mousemove", endpointMouseMove);
     g_endpoint_id = "";
     }
     });

     }*/

    svg.onmouseover = function (event) {
        var x = document.getElementById(closeId);
        if (x) {
            x.style.display = "";
        }

        $("circle[id^=" + endpointId + "]").show();

        if (g_line_mode) {

            var srcEl = getTargetSvg(g_endpoint_id);
            var destEl = getTargetSvg(event.target.id);
            if (srcEl !== destEl) {
                makeConnection($(srcEl), $(destEl));
            }

            g_line_mode = false;
            document.getElementById(g_endpoint_id).removeEventListener("mousemove", endpointMouseMove);
            g_endpoint_id = "";
        }

    };
    svg.onmouseout = function (event) {
        var x = document.getElementById(closeId);
        if (x) {
            x.style.display = "none";
        }

        $("circle[id^=" + endpointId + "]").hide();
    };

    svg.onmousedown = svgMouseDown;
    // events end

    g_rect_serial++;

    g_draw_aera.appendChild(svg);

}

function getTargetSvg(id) {

    var ary = id.split("_");

    var sn = ary[1];
    var svgId = "svg_" + sn;
    var target = document.getElementById(svgId);

    return target;
}

function textDblClick(event, textId) {

    g_text_id = textId;
    var textEl = document.getElementById(textId);

    textEl.style["display"] = "none";

    var input = document.getElementById("rectText");
    input.value = textEl.innerHTML;
    input.style["left"] = event.clientX + "px";
    input.style["top"] = event.clientY - 9 + "px";
    input.style["display"] = "";
    input.focus();

    input.addEventListener("blur", inputBlur);
}

function inputBlur(event) {

    var textId = g_text_id;

    var textEl = document.getElementById(textId);
    if (this.value != "") {
        textEl.innerHTML = this.value;
    } else {
        textEl.innerHTML = "Not Entered";
    }
    textEl.style["display"] = "";
    this.style["display"] = "none";

    g_text_id = "";
    this.removeEventListener("blur", inputBlur);
}

function endpointMouseMove(event) {

    g_line_mode = true;
    //console.log(event.clientX + ", mode=" + g_line_mode);

}


function svgMouseDown(event) {

    var id = event.target.id;
    if (id.indexOf("svg") < 0 && id.indexOf("rect") < 0) {
        return;
    }

    var target = getTargetSvg(id);

    target.setAttribute('data-x', event.clientX);
    target.setAttribute('data-y', event.clientY);

    target.addEventListener("mousemove", dragMove);
    target.addEventListener("mouseup", svgMouseUp);
}

function dragMove(event) {

    var id = event.target.id;
    if (id.indexOf("svg") < 0 && id.indexOf("rect") < 0) {
        return;
    }

    var target = getTargetSvg(event.target.id);

    x = (parseFloat(target.getAttribute('data-x')) || 0);
    y = (parseFloat(target.getAttribute('data-y')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;
    //console.log(event.clientX +":"+event.clientY + ", " + target.style["left"] +":" +target.style["top"] +" & " +dx+":"+dy);
    target.style["transform"] = "translate(" + dx + "px, " + dy + "px)";

}

function svgMouseUp(event) {

    var target = getTargetSvg(event.target.id);

    var translate = target.style["transform"];
    translate = translate.replace(/(translate|px|\(|\))/g, "");
    var coordinates = translate.split(",");
    var x = parseInt(coordinates[0]);
    var y = parseInt(coordinates[1]);

    target.style["transform"] = "";

    var targetX = parseInt(target.style["left"]) + x;
    if (targetX < 0) {
        targetX = 0;
    } else if (targetX > CANVAS_WIDTH - RECT_WIDTH) {
        targetX = CANVAS_WIDTH - RECT_WIDTH;
    }

    var targetY = parseInt(target.style["top"]) + y;
    if (targetY < 0) {
        targetY = 0;
    }
    else if (targetY > CANVAS_HEIGHT - RECT_HEIGHT) {
        targetY = CANVAS_HEIGHT - RECT_HEIGHT;
    }

    target.style["left"] = targetX + "px";
    target.style["top"] = targetY + "px";

    target.removeEventListener("mousemove", dragMove);
    target.removeEventListener("mouseup", svgMouseUp);
}

function circleMouseDown(event) {

    var id = event.target.id;
    if (id.indexOf("circle") < 0) {
        return;
    }

    var target = event.target;

    target.setAttribute('data-x', event.clientX);
    target.setAttribute('data-y', event.clientY);

    target.addEventListener("mousemove", circleDragMove);
    target.addEventListener("mouseup", circleMouseUp);
}

function circleDragMove(event) {

    var id = event.target.id;
    if (id.indexOf("circle") < 0) {
        return;
    }

    var target = event.target;

    x = (parseFloat(target.getAttribute('data-x')) || 0);
    y = (parseFloat(target.getAttribute('data-y')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var tmpX = parseInt(target.getAttribute("cx")) + dx;
    var tmpY = parseInt(target.getAttribute("cy")) + dy;

    var svg = getTargetSvg(id);
    var currentWidth = svg.getAttribute("width");
    var currentHeight = svg.getAttribute("height");
    if (tmpX > currentWidth - CIRCLE_R * 2) {
        svg.setAttribute("width", tmpX + CIRCLE_R * 2);
    }
    if (tmpY > currentHeight - CIRCLE_R * 2) {
        svg.setAttribute("height", tmpY + CIRCLE_R * 2);
    }

    target.style["transform"] = "translate(" + dx + "px, " + dy + "px)";

}

function circleMouseUp(event) {

    var id = event.target.id;
    if (id.indexOf("circle") < 0) {
        return;
    }

    var idAry = id.split("_");
    var idx = idAry[2];

    var target = event.target;

    var translate = target.style["transform"];
    if (translate == "") {
        return;
    }
    translate = translate.replace(/(translate|px|\(|\))/g, "");
    var coordinates = translate.split(",");
    var x = parseInt(coordinates[0]);
    var y = parseInt(coordinates[1]);

    target.style["transform"] = "";

    var targetX = parseInt(target.getAttribute("cx")) + x;
    //if (targetX < 0) {
    //    targetX = 0;
    //} else if (targetX > RECT_WIDTH) {
    //    var svg = getTargetSvg(id);
    //    svg.setAttribute("width", targetX + CIRCLE_R);
    //}
    //
    var targetY = parseInt(target.getAttribute("cy")) + y;
    //if (targetY < 0) {
    //    targetY = 0;
    //} else if (targetY > CANVAS_HEIGHT - RECT_HEIGHT) {
    //    targetY = CANVAS_HEIGHT - RECT_HEIGHT;
    //}

    target.setAttribute("cx", targetX);
    target.setAttribute("cy", targetY);

    // also move path
    var pathId = "path_" + idAry[1];
    var pathEl = document.getElementById(pathId);

    var pathStr = pathEl.getAttribute("d");
    var pathStrAry = pathStr.split(" ");
    var xIdx = 3 * idx + 1;
    var yIdx = 3 * idx + 2;
    pathStrAry[xIdx] = targetX;
    pathStrAry[yIdx] = targetY;

    pathStr = pathStrAry.join(" ");
    pathEl.setAttribute("d", pathStr);

    target.removeEventListener("mousemove", circleDragMove);
    target.removeEventListener("mouseup", circleMouseUp);
}


document.addEventListener("DOMContentLoaded", function (event) {

     g_draw_aera = document.getElementById("drawArea");
     g_start_x = $(g_draw_aera).position().left +20;
     g_start_y = $(g_draw_aera).position().top + 20;

    // do things after dom ready
    document.getElementById("component").style["height"] = CANVAS_HEIGHT + "px";
    g_draw_aera.style["height"] = CANVAS_HEIGHT + "px";


});

