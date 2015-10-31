var SVG_NAME_SPACE = "http://www.w3.org/2000/svg";
var XML_NAME_SPACE = "http://www.w3.org/1999/xhtml";

//var __DEBUG = true;

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

var gSerialNo = 0;

var gDrawArea;
var gSvg;
var gStartX;
var gStartY;
var gCurrent;

function getElementXYofRect(bboxX, bboxY, elName) {

    var xy = [];

    if ("close" == elName) {
        xy.push(bboxX + RECT_WIDTH - CIRCLE_R_HALF);
        xy.push(bboxY + CIRCLE_R_HALF);
    } else if ("text" == elName) {
        xy.push(bboxX + 10);
        xy.push(bboxY + RECT_HEIGHT_HALF + 5);
    }
    //else if ("port" == elName) {
    //    xy.push(rectX + RECT_WIDTH_HALF);
    //    xy.push(rectY + RECT_HEIGHT);
    //}

    return xy;

}

function addRect() {

    var grp = getGroupPrefix(gSerialNo);
    var grpId = grp + "g";
    var rectId = grp + "rect";
    var newRect = gSvg.rect(10, 10, RECT_WIDTH, RECT_HEIGHT, 5, 5);
    newRect.addClass("myRect");
    newRect.attr("id", rectId);

    newRect.mouseover(rectMouseOver);
    newRect.mouseout(rectMouseOut);
    newRect.mousedown(rectMouseDown);

    var bBoxRect = newRect.getBBox();

    var closeId = grp + "close";
    var closeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "close");
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    close.mouseover(rectMouseOver);
    close.mouseout(rectMouseOut);
    close.click(closeClick);

    var textId = grp + "text";
    var textXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "text");
    var text = gSvg.text(textXY[0], textXY[1], "TEXT HERE");
    text.attr("id", textId);

    text.dblclick(textDblClick);

    var g = gSvg.g(newRect, close, text);
    g.attr("id", grpId);

    gSerialNo++;

}

function rectMouseOver() {

    var grp = getGroupPrefix(this.attr("id"));

    gSvg.select("#" + grp + "close").removeClass("hide");
}

function rectMouseOut() {

    var grp = getGroupPrefix(this.attr("id"));

    gSvg.select("#" + grp + "close").addClass("hide");
    //gSvg.select("#" + grp + "port").addClass("hide");

    console.log(grp + ":move out, z=" + this.node.style["z-index"]);

}

function closeClick() {
    var grp = getGroupPrefix(this.attr("id"));
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();
    //gSvg.selectAll("[id^=" + grp).remove();
}

function textDblClick() {

    var grp = getGroupPrefix(this.attr("id"));
    gCurrent = grp;
    var text = gSvg.select("#" + grp + "text");

    var textBBox = text.getBBox();
    text.addClass("hide");

    var input = document.getElementById("rectText");
    input.value = text.innerSVG();
    input.style["left"] = (gStartX + textBBox.x) + "px";
    input.style["top"] = (gStartY + textBBox.y) + "px";
    input.style["display"] = "";
    input.focus();

    input.addEventListener("blur", inputBlur);
}

function inputBlur() {

    var grp = gCurrent;
    var text = gSvg.select("#" + grp + "text");

    if (this.value != "") {
        text.attr("text", this.value);
    } else {
        text.attr("text", "Not Entered");
    }
    text.removeClass("hide");
    this.style["display"] = "none";

    gCurrent = "";
    this.removeEventListener("blur", inputBlur);

}

function rectMouseDown(event) {

    var grp = getGroupPrefix(this.attr("id"));
    gCurrent = grp;

    var rect = gSvg.select("#" + grp + "rect");

    rect.data("mousedown-x", event.clientX);
    rect.data("mousedown-y", event.clientY);

    rect.addClass("toFront");
    //rect.node.style["z-index"] = 99;

    correctRectXY(grp, rect);

    gDrawArea.onmousemove = rectMouseMove;
    gDrawArea.onmouseup = rectMouseUp;

}

function rectMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
       return;
    }

    var rect = gSvg.select("#" + grp + "rect");

    x = (parseInt(rect.data('mousedown-x')) || 0);
    y = (parseInt(rect.data('mousedown-y')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    var grpId = grp + "g";
    gSvg.select("#" + grpId).transform(myMatrix);
    //gSvg.selectAll("[id^=" + grp).forEach(function (element) {
    //    element.transform(myMatrix);
    //});

}

function correctRectXY(grp, rect) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    if (tStrAry.length == 0) {
        return;
    }

    var x = parseInt(tStrAry[0][1], 10);
    var y = parseInt(tStrAry[0][2], 10);

    var nowX = parseInt(rect.attr("x"), 10);
    var nowY = parseInt(rect.attr("y"), 10);

    x += nowX;
    y += nowY;

    g.attr("transform", "");

    rect.attr("transform", "");
    rect.attr("x", x);
    rect.attr("y", y);

    var close = gSvg.select("#" + grp + "close");
    var closeXY = getElementXYofRect(x, y, "close");

    close.attr("transform", "");
    close.attr("cx", closeXY[0]);
    close.attr("cy", closeXY[1]);

    var text = gSvg.select("#" + grp + "text");
    var textXY = getElementXYofRect(x, y, "text");

    text.attr("transform", "");
    text.attr("x", textXY[0]);
    text.attr("y", textXY[1]);

}

function rectMouseUp() {

    if ("" != gCurrent) {
        var rect = gSvg.select("#" + gCurrent + "rect");
        rect.removeClass("toFront");
    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrent = "";
}

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
    gDrawArea = document.getElementById("drawArea");
    gSvg = Snap(CANVAS_WIDTH, CANVAS_HEIGHT);
    gSvg.appendTo(gDrawArea);

    gStartX = gSvg.node.offsetLeft;//gSvg.node).position().left;
    gStartY = gSvg.node.offsetTop;//$(gSvg.node).position().top;

});