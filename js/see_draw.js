var SVG_NAME_SPACE = "http://www.w3.org/2000/svg";
var XML_NAME_SPACE = "http://www.w3.org/1999/xhtml";

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;

var SEPARATOR = "_";
var GROUP_PREFIX = "group_";

var RECT_WIDTH = 120;
var RECT_HEIGHT = 60;
var RECT_HEIGHT_HALF = RECT_HEIGHT / 2;
var CIRCLE_R = 5;
var CIRCLE_R_HALF = CIRCLE_R / 2;

var g_line_mode = false;
var g_endpoint_id = "";
var g_text_id = "";

var g_serial = 0;

var g_draw_aera;
var g_svg;
var g_start_x;
var g_start_y;
var g_curr_grp;

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
        circle.setAttribute("id", circleId + SEPARATOR + i);
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
        var idAry = id.split(SEPARATOR);
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

            var circleEl = document.getElementById(circleId + SEPARATOR + i);
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
        var idAry = id.split(SEPARATOR);
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


function getElementXYofRect(rectX, rectY, elName) {

    var xy = [];

    if ("close" == elName) {
        xy.push(rectX + RECT_WIDTH - CIRCLE_R_HALF);
        xy.push(rectY + CIRCLE_R_HALF);
    } else if ("text" == elName) {
        xy.push(rectX + 10);
        xy.push(rectY + RECT_HEIGHT_HALF + 5);
    }

    return xy;

}

function addRect() {

    var grp = getGroupPrefix(g_serial);
    var rectId = grp + "rect";
    var newRect = g_svg.rect(10, 10, RECT_WIDTH, RECT_HEIGHT, 5, 5);
    newRect.addClass("myRect");
    newRect.attr("id", rectId);

    newRect.mouseover(rectMouseOver);
    newRect.mouseout(rectMouseOut);
    newRect.mousedown(rectMouseDown);

    var bBoxRect = newRect.getBBox();

    var closeId = grp + "close";
    var closeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "close");
    var close = g_svg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    close.mouseover(rectMouseOver);
    close.mouseout(rectMouseOut);
    close.click(closeClick);

    var textId = grp + "text";
    var textXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "text");
    var text = g_svg.text(textXY[0], textXY[1], "TEXT HERE");
    text.attr("id", textId);

    text.dblclick(textDblClick);

    //var endpointId = "endpoint_" + g_rect_serial;


    ///*    epBottom.onmousedown = function (event) {
    //
    // var id = event.target.id;
    // g_endpoint_id = id;
    //
    // event.target.addEventListener("mousemove", endpointMouseMove);
    // //document.getElementById("drawArea").addEventListener("mousemove", function(event) {
    // //    console.log(event.clientX);
    // //});
    // document.getElementById("drawArea").addEventListener("mouseup", function (event) {
    // g_line_mode = false;
    // console.log("MOUSEUP mode=" + g_line_mode);
    // if (g_endpoint_id != "") {
    // document.getElementById(g_endpoint_id).removeEventListener("mousemove", endpointMouseMove);
    // g_endpoint_id = "";
    // }
    // });
    //
    // }*/
    //

    g_serial++;

}

function rectMouseOver() {
    var grp = getGroupPrefix(this.attr("id"));
    g_svg.select("#" + grp + "close").removeClass("hide");
}

function rectMouseOut() {
    var grp = getGroupPrefix(this.attr("id"));
    g_svg.select("#" + grp + "close").addClass("hide");

    var rect = g_svg.select("#" + grp + "rect");

    rect.unmousemove(rectMouseMove);
    rect.unmouseup(rectMouseUp);

    g_curr_grp = "";
}

function closeClick() {
    var grp = getGroupPrefix(this.attr("id"));
    g_svg.selectAll("[id^=" + grp).remove();
    //this.parentNode.parentNode.removeChild(this.parentNode);
}

function getTargetSvg(id) {

    var ary = id.split(SEPARATOR);

    var sn = ary[1];
    var svgId = "svg_" + sn;
    var target = document.getElementById(svgId);

    return target;
}

function textDblClick() {

    var grp = getGroupPrefix(this.attr("id"));
    g_curr_grp = grp;
    var text = g_svg.select("#" + grp + "text");

    var textBBox = text.getBBox();
    text.addClass("hide");

    var input = document.getElementById("rectText");
    input.value = text.innerSVG();
    input.style["left"] = (g_start_x + textBBox.x) + "px";
    input.style["top"] = (g_start_y + textBBox.y) + "px";
    input.style["display"] = "";
    input.focus();

    input.addEventListener("blur", inputBlur);
}

function inputBlur() {

    var grp = g_curr_grp;
    var text = g_svg.select("#" + grp + "text");

    if (this.value != "") {
        text.attr("text", this.value);
    } else {
        text.attr("text", "Not Entered");
    }
    text.removeClass("hide");
    this.style["display"] = "none";

    g_curr_grp = "";
    this.removeEventListener("blur", inputBlur);

}

function rectMouseDown(event) {

    var grp = getGroupPrefix(this.attr("id"));
    g_curr_grp = grp;

    var rect = g_svg.select("#" + grp + "rect");

    rect.data("mousedown-x", event.clientX);
    rect.data("mousedown-y", event.clientY);

    rect.mousemove(rectMouseMove);
    rect.mouseup(rectMouseUp);

}

function rectMouseMove(event) {

    var grp;
    if ("" != g_curr_grp) {
        grp = g_curr_grp;
    } else {
        grp = getGroupPrefix(this.attr("id"));
    }

    var rect = g_svg.select("#" + grp + "rect");

    x = (parseInt(rect.data('mousedown-x')) || 0);
    y = (parseInt(rect.data('mousedown-y')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    g_svg.selectAll("[id^=" + grp).forEach(function (element) {
        element.transform(myMatrix);
    });

}

function rectMouseUp(event) {

    var grp;
    if ("" != g_curr_grp) {
        grp = g_curr_grp;
    } else {
        grp = getGroupPrefix(this.attr("id"));
    }

    var rect = g_svg.select("#" + grp + "rect");

    var transform = rect.transform();
    var matrix = transform.localMatrix;
    var splitMatrix = matrix.split();
    var dx = splitMatrix.dx;
    var dy = splitMatrix.dy;

    var x = (parseInt(rect.attr("x")) || 0) + dx;
    var y = (parseInt(rect.attr("y")) || 0) + dy;

    rect.attr("transform", "");
    rect.attr("x", x);
    rect.attr("y", y);

    var close = g_svg.select("#" + grp + "close");
    var closeXY = getElementXYofRect(x, y, "close");

    close.attr("transform", "");
    close.attr("cx", closeXY[0]);
    close.attr("cy", closeXY[1]);

    var text = g_svg.select("#" + grp + "text");
    var textXY = getElementXYofRect(x, y, "text");

    text.attr("transform", "");
    text.attr("x", textXY[0]);
    text.attr("y", textXY[1]);

    rect.unmousemove(rectMouseMove);
    rect.unmouseup(rectMouseUp);

    g_curr_grp = "";
}


/*
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

    var idAry = id.split(SEPARATOR);
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

function getGroupPrefix(id) {

    if (isNaN(id) && id.indexOf(SEPARATOR) > 0) {
        var idAry = id.split(SEPARATOR);
        return idAry[0] + SEPARATOR + idAry[1] + SEPARATOR;
    }

    var pad = "0000";
    var newSn = (pad + id).slice(-pad.length);
    return "group_" + newSn + SEPARATOR;

}*/

document.addEventListener("DOMContentLoaded", function (event) {
    // do things after dom ready
    g_draw_aera = document.getElementById("drawArea");
    g_svg = Snap(CANVAS_WIDTH, CANVAS_HEIGHT);
    g_svg.appendTo(g_draw_aera);

    var svgBBox = g_svg.getBBox();
    g_start_x = $(g_svg.node).position().left;
    g_start_y = $(g_svg.node).position().top;

});