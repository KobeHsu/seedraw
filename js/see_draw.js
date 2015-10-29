var SVG_NAME_SPACE = "http://www.w3.org/2000/svg";
var XML_NAME_SPACE = "http://www.w3.org/1999/xhtml";

var __DEBUG = true;

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;

var SEPARATOR = "_";
var GROUP_PREFIX = "group";

var RECT_WIDTH = 120;
var RECT_WIDTH_HALF = RECT_WIDTH / 2;
var RECT_HEIGHT = 60;
var RECT_HEIGHT_HALF = RECT_HEIGHT / 2;
var CIRCLE_R = 5;
var CIRCLE_R_HALF = CIRCLE_R / 2;

var g_line_mode = false;
var g_endpoint_id = "";
var g_text_id = "";

var g_serial = 0;

var g_draw_area;
var g_svg;
var g_start_x;
var g_start_y;
var g_curr_grp;


function getElementXYofRect(rectX, rectY, elName) {

    var xy = [];

    if ("close" == elName) {
        xy.push(rectX + RECT_WIDTH - CIRCLE_R_HALF);
        xy.push(rectY + CIRCLE_R_HALF);
    } else if ("text" == elName) {
        xy.push(rectX + 10);
        xy.push(rectY + RECT_HEIGHT_HALF + 5);
    } else if ("port" == elName) {
        xy.push(rectX + RECT_WIDTH_HALF);
        xy.push(rectY + RECT_HEIGHT);
    }

    return xy;

}

function addRect() {

    var grp = getGroupPrefix(g_serial);
    var grpId = grp + "g";
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

    var g = g_svg.g(newRect, close, text);
    g.attr("id", grpId);

    g_serial++;

}

function rectMouseOver() {

    var grp = getGroupPrefix(this.attr("id"));

    g_svg.select("#" + grp + "close").removeClass("hide");
    //g_svg.select("#" + grp + "port").removeClass("hide");

    var rect = g_svg.select("#" + grp + "rect");
    rect.unmousemove(rectMouseMove);
    rect.unmouseup(rectMouseUp);

    console.log(grp + ":move in, z=" + this.node.style["z-index"]);
}

function rectMouseOut() {

    var grp = getGroupPrefix(this.attr("id"));

    g_svg.select("#" + grp + "close").addClass("hide");
    //g_svg.select("#" + grp + "port").addClass("hide");

    console.log(grp + ":move out, z=" + this.node.style["z-index"]);

}

function closeClick() {
    var grp = getGroupPrefix(this.attr("id"));
    var grpId = grp + "g";
    g_svg.select("#" + grpId).remove();
    //g_svg.selectAll("[id^=" + grp).remove();
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

    //rect.addClass("toFront");
    rect.node.style["z-index"] = 99;

    correctRectXY(grp, rect);

    rect.mousemove(rectMouseMove);
    rect.mouseup(rectMouseUp);

    if (__DEBUG) {
        var bBoxRect = rect.getBBox();
        console.log(grp + ":mouse down, x=" + bBoxRect.x + ", y=" + bBoxRect.y + ", z=" + rect.node.style["z-index"]);
    }

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

    var grpId = grp + "g";
    g_svg.select("#" + grpId).transform(myMatrix);
    //g_svg.selectAll("[id^=" + grp).forEach(function (element) {
    //    element.transform(myMatrix);
    //});

}

function correctRectXY(grp, rect) {

    var g = g_svg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    if (tStrAry.length==0) {
        return;
    }

    var x = parseInt(tStrAry[0][1],10);
    var y =  parseInt(tStrAry[0][2],10);

    var nowX = parseInt(rect.attr("x"),10);
    var nowY = parseInt(rect.attr("y"),10);

    x += nowX;
    y += nowY;

    g.attr("transform", "");

    rect.attr("transform", "");
    rect.attr("x", x);
    rect.attr("y", y);

    //rect.removeClass("toFront");
    rect.node.style["z-index"] = 10;

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

}

function rectMouseUp() {

    var grp;
    if ("" != g_curr_grp) {
        grp = g_curr_grp;
    } else {
        grp = getGroupPrefix(this.attr("id"));
    }

    var rect = g_svg.select("#" + grp + "rect");

    rect.unmousemove(rectMouseMove);
    rect.unmouseup(rectMouseUp);

    g_curr_grp = "";

    if (__DEBUG) {
        var bBoxRect = rect.getBBox();
        console.log(grp + ":mouse up, x=" + bBoxRect.x + ", y=" + bBoxRect.y + ", z=" + rect.node.style["z-index"]);
    }
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
 */
function getGroupPrefix(id) {

    if (isNaN(id) && id.indexOf(SEPARATOR) > 0) {
        var idAry = id.split(SEPARATOR);
        return idAry[0] + SEPARATOR + idAry[1] + SEPARATOR;
    }

    var pad = "0000";
    var newSn = (pad + id).slice(-pad.length);
    return GROUP_PREFIX + SEPARATOR + newSn + SEPARATOR;

}

document.addEventListener("DOMContentLoaded", function (event) {
    // do things after dom ready
    g_draw_area = document.getElementById("drawArea");
    g_svg = Snap(CANVAS_WIDTH, CANVAS_HEIGHT);
    g_svg.appendTo(g_draw_area);

    //var svgBBox = g_svg.getBBox();
    g_start_x = $(g_svg.node).position().left;
    g_start_y = $(g_svg.node).position().top;

});