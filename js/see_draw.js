var SVG_NAME_SPACE = "http://www.w3.org/2000/svg";
var XML_NAME_SPACE = "http://www.w3.org/1999/xhtml";

var __DEBUG_OUTPUT = false;

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;

var SEPARATOR = "_";
var GROUP_PREFIX = "group";

var RECT_WIDTH = 120;
var RECT_WIDTH_HALF = RECT_WIDTH / 2;
var RECT_HEIGHT = 60;
var RECT_HEIGHT_HALF = RECT_HEIGHT / 2;

var RECT_WIDTH_SM = 80;
var RECT_HEIGHT_SM = 40;

var CIRCLE_R = 5;
var CIRCLE_R_HALF = CIRCLE_R / 2;

var ELLIPSE_RX = 90;
var ELLIPSE_RY = 40;

var CIRCLE_RX = 40;
var CIRCLE_RY = 40;

var XS_CIRCLE_RX = 20;
var XS_CIRCLE_RY = 20;

var LINE_WIDTH = 80;

var BRACE_WIDTH = 20;
var BRACE_Q = 0.6;

var PATH_BBOX_ADD = 10;

var REMOVE_CONFIRM_MSG = "Are you sure to remove this?";

var REMOVE_CONNECTOR_MSG = "Remove this connection ?";
var REMOVE_ENDOPOINT_MSG = "Remove this node ?";

var REMOVE_LINE_MSG = "Remove this boundary ?";
//var REMOVE_ELLIPSE_MSG = "Remove this ellipse ?";
//var REMOVE_BREAK_MSG = "Remove this breakdown ?";
//var REMOVE_BRACE_MSG = "Remove this brace ?";
//var REMOVE_IMAGE_MSG = "Remove this image ?";

var gSerialNo = 0;

var gDrawArea;
var gSvg;
var gStartX;
var gStartY;
var gCurrent;
var gDragType;
var gTextEditing;
var gGrpTmp;

var gMenuWidth;
var gMenuHeight;

var gRatioAry = [];

var gContextMenu;

"use strict";

//region Rect
function getElementXYofRect(bBoxX, bBoxY, elName, rectId) {

    var xy = [];
    var rect = gSvg.select("#" + rectId);

    var width = (rect == null) ? 0 : rect.getBBox().width;// parseInt(rect.attr("width"), 10);
    var height = (rect == null) ? 0 : rect.getBBox().height;//parseInt(rect.attr("height"), 10);

    if ("close" == elName) {

        xy.push(bBoxX + width - CIRCLE_R_HALF);
        xy.push(bBoxY + CIRCLE_R_HALF);

    } else if ("text" == elName) {

        xy.push(bBoxX + 10);
        xy.push(bBoxY + height / 2 + 5);

    } else if ("nResize" == elName) {

        xy.push(bBoxX + width / 2);
        xy.push(bBoxY);

    } else if ("sResize" == elName) {

        xy.push(bBoxX + width / 2);
        xy.push(bBoxY + height);

    } else if ("wResize" == elName) {

        xy.push(bBoxX);
        xy.push(bBoxY + height / 2);

    } else if ("eResize" == elName) {

        xy.push(bBoxX + width);
        xy.push(bBoxY + height / 2);

    } else if ("selected" == elName) {

        xy.push(bBoxX);
        xy.push(bBoxY);

    }

    return xy;

}

function addRect(type) {

    var grp = getGroupPrefix(gSerialNo);
    var grpId = grp + "g";
    var rectId = grp + "rect";
    if ('small' == type) {
        var newRect = gSvg.rect(10, 10, RECT_WIDTH_SM, RECT_HEIGHT_SM, 5, 5);
        newRect.addClass("myRect2");
    } else if ('noLabel' == type) {
        var newRect = gSvg.rect(10, 10, RECT_WIDTH, RECT_HEIGHT, 5, 5);
        newRect.addClass("myRect3");
    } else {
        var newRect = gSvg.rect(10, 10, RECT_WIDTH, RECT_HEIGHT, 5, 5);
        newRect.addClass("myRect");
    }
    if ("dash" == type) {
        newRect.addClass("myRectDash");
    } else if ("light" == type) {
        newRect.addClass("myRectLight");
    }
    newRect.attr("id", rectId);

    //newRect.mouseover(rectMouseOver);
    //newRect.mouseout(rectMouseOut);
    newRect.mousedown(svgElMouseDown);

    newRect.node.addEventListener("contextmenu", showContextMenu);

    var bBoxRect = newRect.getBBox();
    var selected = generateSelectedMark(bBoxRect, grp);

    var closeId = grp + "close";
    var closeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "close", rectId);
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    //close.mouseover(rectMouseOver);
    //close.mouseout(rectMouseOut);
    close.mousedown(closeClick);

    var nResizeId = grp + "nResize";
    var nResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "nResize", rectId);
    var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
    nResize.addClass("myNResize");
    nResize.addClass("hide");
    nResize.attr("id", nResizeId);

    //nResize.mouseover(rectMouseOver);
    //nResize.mouseout(rectMouseOut);
    nResize.mousedown(nResizeMouseDown);

    var sResizeId = grp + "sResize";
    var sResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "sResize", rectId);
    var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
    sResize.addClass("mySResize");
    sResize.addClass("hide");
    sResize.attr("id", sResizeId);

    //sResize.mouseover(rectMouseOver);
    //sResize.mouseout(rectMouseOut);
    sResize.mousedown(sResizeMouseDown);

    var wResizeId = grp + "wResize";
    var wResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "wResize", rectId);
    var wResize = gSvg.circle(wResizeXY[0], wResizeXY[1], CIRCLE_R);
    wResize.addClass("myWResize");
    wResize.addClass("hide");
    wResize.attr("id", wResizeId);

    //wResize.mouseover(rectMouseOver);
    //wResize.mouseout(rectMouseOut);
    wResize.mousedown(wResizeMouseDown);

    var eResizeId = grp + "eResize";
    var eResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "eResize", rectId);
    var eResize = gSvg.circle(eResizeXY[0], eResizeXY[1], CIRCLE_R);
    eResize.addClass("myEResize");
    eResize.addClass("hide");
    eResize.attr("id", eResizeId);

    //eResize.mouseover(rectMouseOver);
    //eResize.mouseout(rectMouseOut);
    eResize.mousedown(eResizeMouseDown);

    var textId = grp + "text";
    var textXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "text", rectId);
    var text = gSvg.text(textXY[0], textXY[1], "Label");
    text.attr("id", textId);
    text.addClass("myLabel");
    if ("noLabel" == type) {
        text.addClass("hide");
    }

    newRect.dblclick(textDblClick);

    var g = gSvg.g(newRect, close, nResize, sResize, wResize, eResize, text, selected);
    g.attr("id", grpId);

    gSerialNo++;

    setSelected(grp);
    gCurrent = grp;

}

function rectMouseOver() {

    var grp = getGroupPrefix(this.attr("id"));

    showElementById(grp + "close");
    showElementById(grp + "nResize");
    showElementById(grp + "sResize");
    showElementById(grp + "wResize");
    showElementById(grp + "eResize");

}

function rectMouseOut() {

    var grp = getGroupPrefix(this.attr("id"));

    hideElementById(grp + "close");
    hideElementById(grp + "nResize");
    hideElementById(grp + "sResize");
    hideElementById(grp + "wResize");
    hideElementById(grp + "eResize");

}

function closeClick(e) {
    log("closeClick");
    e.stopPropagation();

    var r = confirm(REMOVE_CONFIRM_MSG);
    if (!r) {
        return;
    }

    var grp = getGroupPrefix(this.attr("id"));
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();

}

function textDblClick(event) {
    log("textDblClick, id=" + this.attr("id"));
    log("gCurrent=" + gCurrent);
    gTextEditing = true;
    event.stopPropagation();
    //
    //var grp = getGroupPrefix(this.attr("id"));
    //gCurrent = grp;
    var text = gSvg.select("#" + gCurrent + "text");

    var textBBox = text.node.getBoundingClientRect();
    text.addClass("hide");

    var input = document.getElementById("rectText");
    input.value = text.innerSVG();
    input.style["left"] = (textBBox.left - gMenuWidth) + "px";
    input.style["top"] = (textBBox.top - gMenuHeight) + "px";
    input.style["display"] = "";
    input.focus();

    input.addEventListener("blur", inputBlur);
}

function inputBlur(event) {
    log("inputBlur");
    log("gCurrent=" + gCurrent);
    gTextEditing = false;
    event.stopPropagation();

    var grp = gCurrent;
    var textId = grp + "text";
    var text = gSvg.select("#" + textId);

    if (this.value != "") {
        text.attr("text", this.value);
    } else {
        text.attr("text", "N/A");
    }
    text.removeClass("hide");
    this.style["display"] = "none";

    //gCurrent = "";
    this.removeEventListener("blur", inputBlur);

    var grp = getGroupPrefix(textId);
    var line = gSvg.select("#" + grp + "line");
    if (line) {

        var textBBox = text.getBBox();
        var textWidth = textBBox.width;

        text.attr("x", parseInt(line.attr("x1"), 10) - textWidth - 10);
        //text.attr("y", textXY[1]);

    }

}

function correctRectXY(grp, rect) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    var rectId = grp + "rect";

    var nowX = parseInt(rect.attr("x"), 10);
    var nowY = parseInt(rect.attr("y"), 10);

    if (tStrAry.length != 0) {

        var x = parseInt(tStrAry[0][1], 10);
        var y = parseInt(tStrAry[0][2], 10);

        x += nowX;
        y += nowY;

        g.transform("translate(0 0)");

        rect.transform("translate(0 0)");
        rect.attr("x", x);
        rect.attr("y", y);

    }

    var bBox = rect.getBBox();
    var bBoxX = bBox.x;
    var bBoxY = bBox.y;

    var close = gSvg.select("#" + grp + "close");
    var closeXY = getElementXYofRect(bBoxX, bBoxY, "close", rectId);

    close.transform("translate(0 0)");
    close.attr("cx", closeXY[0]);
    close.attr("cy", closeXY[1]);

    var nResize = gSvg.select("#" + grp + "nResize");
    var nResizeXY = getElementXYofRect(bBoxX, bBoxY, "nResize", rectId);

    nResize.transform("translate(0 0)");
    nResize.attr("cx", nResizeXY[0]);
    nResize.attr("cy", nResizeXY[1]);

    var sResize = gSvg.select("#" + grp + "sResize");
    var sResizeXY = getElementXYofRect(bBoxX, bBoxY, "sResize", rectId);

    sResize.transform("translate(0 0)");
    sResize.attr("cx", sResizeXY[0]);
    sResize.attr("cy", sResizeXY[1]);

    var wResize = gSvg.select("#" + grp + "wResize");
    var wResizeXY = getElementXYofRect(bBoxX, bBoxY, "wResize", rectId);

    wResize.transform("translate(0 0)");
    wResize.attr("cx", wResizeXY[0]);
    wResize.attr("cy", wResizeXY[1]);

    var eResize = gSvg.select("#" + grp + "eResize");
    var eResizeXY = getElementXYofRect(bBoxX, bBoxY, "eResize", rectId);

    eResize.transform("translate(0 0)");
    eResize.attr("cx", eResizeXY[0]);
    eResize.attr("cy", eResizeXY[1]);

    var text = gSvg.select("#" + grp + "text");
    var textXY = getElementXYofRect(bBoxX, bBoxY, "text", rectId);

    text.transform("translate(0 0)");
    text.attr("x", textXY[0]);
    text.attr("y", textXY[1]);

    var selected = gSvg.select("#" + grp + "selected");
    var selectedXY = getElementXYofRect(bBoxX, bBoxY, "selected", rectId);
    selected.transform("translate(0 0)");
    selected.attr("x", selectedXY[0]);
    selected.attr("y", selectedXY[1]);

}

function nResizeMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "nResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var rect = gSvg.select("#" + grp + "rect");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(rect.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(rect.attr("width"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = nResizeMouseMove;
    gDrawArea.onmouseup = nResizeMouseUp;
}

function nResizeMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newHeight = h - dy;
    if (newHeight < RECT_HEIGHT) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var rect = gSvg.select("#" + gCurrent + "rect");
    rect.attr("y", event.clientY - gStartY);
    rect.attr("height", newHeight);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("y", event.clientY - gStartY);
    selected.attr("height", newHeight);

}

function nResizeMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var rect = gSvg.select("#" + gCurrent + "rect");
        correctXY(grp, rect, "rect");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function sResizeMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "sResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var rect = gSvg.select("#" + grp + "rect");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(rect.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(rect.attr("width"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = sResizeMouseMove;
    gDrawArea.onmouseup = sResizeMouseUp;
}

function sResizeMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newHeight = h + dy;
    if (newHeight < RECT_HEIGHT) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var rect = gSvg.select("#" + gCurrent + "rect");
    rect.attr("height", newHeight);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("height", newHeight);

}

function sResizeMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var rect = gSvg.select("#" + gCurrent + "rect");
        correctXY(grp, rect, "rect");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function wResizeMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "wResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var rect = gSvg.select("#" + grp + "rect");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(rect.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(rect.attr("width"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = wResizeMouseMove;
    gDrawArea.onmouseup = wResizeMouseUp;
}

function wResizeMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newWidth = w - dx;
    if (newWidth < RECT_WIDTH) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var rect = gSvg.select("#" + gCurrent + "rect");
    rect.attr("x", event.clientX - gStartX);
    rect.attr("width", newWidth);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("x", event.clientX - gStartX);
    selected.attr("width", newWidth);

}

function wResizeMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var rect = gSvg.select("#" + gCurrent + "rect");
        correctXY(grp, rect, "rect");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function eResizeMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "eResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var rect = gSvg.select("#" + grp + "rect");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(rect.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(rect.attr("width"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = eResizeMouseMove;
    gDrawArea.onmouseup = eResizeMouseUp;
}

function eResizeMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newWidth = w + dx;
    if (newWidth < RECT_WIDTH) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var rect = gSvg.select("#" + gCurrent + "rect");
    rect.attr("width", newWidth);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("width", newWidth);

}

function eResizeMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var rect = gSvg.select("#" + gCurrent + "rect");
        correctXY(grp, rect, "rect");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}


//endregion

//region Ellipse
function addEllipse(type) {

    var grp = getGroupPrefix(gSerialNo);
    var grpId = grp + "g";
    var ellipseId = grp + "ellipse";
    if (type === 'circle') {
        var newEllipse = gSvg.ellipse(CIRCLE_RX + 10, CIRCLE_RY + 10, CIRCLE_RX, CIRCLE_RY);
    } else if (type === 'xs-circle') {
        var newEllipse = gSvg.ellipse(XS_CIRCLE_RX + 10, XS_CIRCLE_RY + 10, XS_CIRCLE_RX, XS_CIRCLE_RY);
    } else {
        var newEllipse = gSvg.ellipse(ELLIPSE_RX + 10, ELLIPSE_RY + 10, ELLIPSE_RX, ELLIPSE_RY);
    }
    newEllipse.addClass("myEllipse");
    newEllipse.attr("id", ellipseId);

    //newEllipse.mouseover(rectMouseOver);
    //newEllipse.mouseout(rectMouseOut);
    newEllipse.mousedown(svgElMouseDown);

    newEllipse.node.addEventListener("contextmenu", showContextMenu);

    var bBoxEllipse = newEllipse.getBBox();
    var selected = generateSelectedMark(bBoxEllipse, grp);

    var closeId = grp + "close";
    var closeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "close", ellipseId);
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    //close.mouseover(rectMouseOver);
    //close.mouseout(rectMouseOut);
    close.mousedown(closeClick);

    var nResizeId = grp + "nResize";
    var nResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "nResize", ellipseId);
    var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
    nResize.addClass("myNResize");
    nResize.addClass("hide");
    nResize.attr("id", nResizeId);

    //nResize.mouseover(rectMouseOver);
    //nResize.mouseout(rectMouseOut);
    nResize.mousedown(nResizeEllipseMouseDown);

    var sResizeId = grp + "sResize";
    var sResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "sResize", ellipseId);
    var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
    sResize.addClass("mySResize");
    sResize.addClass("hide");
    sResize.attr("id", sResizeId);

    //sResize.mouseover(rectMouseOver);
    //sResize.mouseout(rectMouseOut);
    sResize.mousedown(sResizeEllipseMouseDown);

    var wResizeId = grp + "wResize";
    var wResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "wResize", ellipseId);
    var wResize = gSvg.circle(wResizeXY[0], wResizeXY[1], CIRCLE_R);
    wResize.addClass("myWResize");
    wResize.addClass("hide");
    wResize.attr("id", wResizeId);

    //wResize.mouseover(rectMouseOver);
    //wResize.mouseout(rectMouseOut);
    wResize.mousedown(wResizeEllipseMouseDown);

    var eResizeId = grp + "eResize";
    var eResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "eResize", ellipseId);
    var eResize = gSvg.circle(eResizeXY[0], eResizeXY[1], CIRCLE_R);
    eResize.addClass("myEResize");
    eResize.addClass("hide");
    eResize.attr("id", eResizeId);

    //eResize.mouseover(rectMouseOver);
    //eResize.mouseout(rectMouseOut);
    eResize.mousedown(eResizeEllipseMouseDown);


    var textId = grp + "text";
    var textXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "text", ellipseId);
    var text = gSvg.text(textXY[0], textXY[1], "Label");
    text.attr("id", textId);
    text.addClass("myLabel");

    newEllipse.dblclick(textDblClick);

    var g = gSvg.g(newEllipse, close, nResize, sResize, wResize, eResize, text, selected);
    g.attr("id", grpId);

    gSerialNo++;

    setSelected(grp);
    gCurrent = grp;

}

function getElementXYofEllipse(bBoxX, bBoxY, elName, ellipseId) {

    var xy = [];
    var ellipse = gSvg.select("#" + ellipseId);

    var rx = (ellipse == null) ? 0 : parseInt(ellipse.attr("rx"), 10);
    var ry = (ellipse == null) ? 0 : parseInt(ellipse.attr("ry"), 10);

    if ("close" == elName) {

        xy.push(bBoxX + rx * 2 - CIRCLE_R_HALF);
        xy.push(bBoxY + CIRCLE_R_HALF);

    } else if ("text" == elName) {

        xy.push(bBoxX + 10);
        xy.push(bBoxY + ry + 5);

    } else if ("nResize" == elName) {

        xy.push(bBoxX + rx);
        xy.push(bBoxY);

    } else if ("sResize" == elName) {

        xy.push(bBoxX + rx);
        xy.push(bBoxY + ry * 2);

    } else if ("wResize" == elName) {

        xy.push(bBoxX);
        xy.push(bBoxY + ry);

    } else if ("eResize" == elName) {

        xy.push(bBoxX + rx * 2);
        xy.push(bBoxY + ry);

    } else if ("selected" == elName) {

        xy.push(bBoxX);
        xy.push(bBoxY);

    }

    return xy;

}

function correctEllipseXY(grp, ellipse) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    var ellipseId = grp + "ellipse";
    if (tStrAry.length != 0) {

        var cx = parseInt(tStrAry[0][1], 10);
        var cy = parseInt(tStrAry[0][2], 10);

        var nowX = parseInt(ellipse.attr("cx"), 10);
        var nowY = parseInt(ellipse.attr("cy"), 10);

        cx += nowX;
        cy += nowY;

        g.transform("translate(0 0)");

        ellipse.transform("translate(0 0)");
        ellipse.attr("cx", cx);
        ellipse.attr("cy", cy);

    }

    var bBoxEllipse = ellipse.getBBox();

    var close = gSvg.select("#" + grp + "close");
    var closeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "close", ellipseId);

    close.transform("translate(0 0)");
    close.attr("cx", closeXY[0]);
    close.attr("cy", closeXY[1]);

    var nResize = gSvg.select("#" + grp + "nResize");
    var nResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "nResize", ellipseId);

    nResize.transform("translate(0 0)");
    nResize.attr("cx", nResizeXY[0]);
    nResize.attr("cy", nResizeXY[1]);

    var sResize = gSvg.select("#" + grp + "sResize");
    var sResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "sResize", ellipseId);

    sResize.transform("translate(0 0)");
    sResize.attr("cx", sResizeXY[0]);
    sResize.attr("cy", sResizeXY[1]);

    var wResize = gSvg.select("#" + grp + "wResize");
    var wResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "wResize", ellipseId);

    wResize.transform("translate(0 0)");
    wResize.attr("cx", wResizeXY[0]);
    wResize.attr("cy", wResizeXY[1]);

    var eResize = gSvg.select("#" + grp + "eResize");
    var eResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "eResize", ellipseId);

    eResize.transform("translate(0 0)");
    eResize.attr("cx", eResizeXY[0]);
    eResize.attr("cy", eResizeXY[1]);

    var text = gSvg.select("#" + grp + "text");
    var textXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "text", ellipseId);

    text.transform("translate(0 0)");
    text.attr("x", textXY[0]);
    text.attr("y", textXY[1]);

    var selected = gSvg.select("#" + grp + "selected");
    var selectedXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "selected", ellipseId);
    selected.transform("translate(0 0)");
    selected.attr("x", selectedXY[0]);
    selected.attr("y", selectedXY[1]);

}

function nResizeEllipseMouseDown() {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "nResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var ellipse = gSvg.select("#" + grp + "ellipse");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-cx", parseInt(ellipse.attr("cx"), 10));
    svgEl.data("mousedown-cy", parseInt(ellipse.attr("cy"), 10));
    svgEl.data("mousedown-rx", parseInt(ellipse.attr("rx"), 10));
    svgEl.data("mousedown-ry", parseInt(ellipse.attr("ry"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = nResizeEllipseMouseMove;
    gDrawArea.onmouseup = nResizeEllipseMouseUp;
}

function nResizeEllipseMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var cx = (parseInt(svgEl.data('mousedown-cx')) || 0);
    var cy = (parseInt(svgEl.data('mousedown-cy')) || 0);
    var rx = (parseInt(svgEl.data('mousedown-rx')) || 0);
    var ry = (parseInt(svgEl.data('mousedown-ry')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newRy = ry - dy / 2;
    if (newRy < ELLIPSE_RY) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    dy /= 2;
    var ellipse = gSvg.select("#" + gCurrent + "ellipse");
    ellipse.attr("cy", cy + dy);
    ellipse.attr("ry", newRy);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("y", ellipse.getBBox().y);
    selected.attr("height", ellipse.getBBox().height);

}

function nResizeEllipseMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var ellipse = gSvg.select("#" + gCurrent + "ellipse");
        correctXY(grp, ellipse, "ellipse");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function sResizeEllipseMouseDown() {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "sResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var ellipse = gSvg.select("#" + grp + "ellipse");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-cx", parseInt(ellipse.attr("cx"), 10));
    svgEl.data("mousedown-cy", parseInt(ellipse.attr("cy"), 10));
    svgEl.data("mousedown-rx", parseInt(ellipse.attr("rx"), 10));
    svgEl.data("mousedown-ry", parseInt(ellipse.attr("ry"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = sResizeEllipseMouseMove;
    gDrawArea.onmouseup = sResizeEllipseMouseUp;
}

function sResizeEllipseMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var cx = (parseInt(svgEl.data('mousedown-cx')) || 0);
    var cy = (parseInt(svgEl.data('mousedown-cy')) || 0);
    var rx = (parseInt(svgEl.data('mousedown-rx')) || 0);
    var ry = (parseInt(svgEl.data('mousedown-ry')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newRy = ry + dy / 2;
    if (newRy < ELLIPSE_RY) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    dy /= 2;
    var ellipse = gSvg.select("#" + gCurrent + "ellipse");
    ellipse.attr("cy", cy + dy);
    ellipse.attr("ry", newRy);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("height", ellipse.getBBox().height);

}

function sResizeEllipseMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var ellipse = gSvg.select("#" + gCurrent + "ellipse");
        correctXY(grp, ellipse, "ellipse");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function wResizeEllipseMouseDown() {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "wResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var ellipse = gSvg.select("#" + grp + "ellipse");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-cx", parseInt(ellipse.attr("cx"), 10));
    svgEl.data("mousedown-cy", parseInt(ellipse.attr("cy"), 10));
    svgEl.data("mousedown-rx", parseInt(ellipse.attr("rx"), 10));
    svgEl.data("mousedown-ry", parseInt(ellipse.attr("ry"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = wResizeEllipseMouseMove;
    gDrawArea.onmouseup = wResizeEllipseMouseUp;
}

function wResizeEllipseMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var cx = (parseInt(svgEl.data('mousedown-cx')) || 0);
    var cy = (parseInt(svgEl.data('mousedown-cy')) || 0);
    var rx = (parseInt(svgEl.data('mousedown-rx')) || 0);
    var ry = (parseInt(svgEl.data('mousedown-ry')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newRx = rx - dx / 2;
    if (newRx < ELLIPSE_RX) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    dx /= 2;
    var ellipse = gSvg.select("#" + gCurrent + "ellipse");
    ellipse.attr("cx", cx + dx);
    ellipse.attr("rx", newRx);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("x", ellipse.getBBox().x);
    selected.attr("width", ellipse.getBBox().width);

}

function wResizeEllipseMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var ellipse = gSvg.select("#" + gCurrent + "ellipse");
        correctXY(grp, ellipse, "ellipse");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function eResizeEllipseMouseDown() {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "eResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var ellipse = gSvg.select("#" + grp + "ellipse");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-cx", parseInt(ellipse.attr("cx"), 10));
    svgEl.data("mousedown-cy", parseInt(ellipse.attr("cy"), 10));
    svgEl.data("mousedown-rx", parseInt(ellipse.attr("rx"), 10));
    svgEl.data("mousedown-ry", parseInt(ellipse.attr("ry"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = eResizeEllipseMouseMove;
    gDrawArea.onmouseup = eResizeEllipseMouseUp;
}

function eResizeEllipseMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var cx = (parseInt(svgEl.data('mousedown-cx')) || 0);
    var cy = (parseInt(svgEl.data('mousedown-cy')) || 0);
    var rx = (parseInt(svgEl.data('mousedown-rx')) || 0);
    var ry = (parseInt(svgEl.data('mousedown-ry')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newRx = rx + dx / 2;
    if (newRx < ELLIPSE_RX) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    dx /= 2;
    var ellipse = gSvg.select("#" + gCurrent + "ellipse");
    ellipse.attr("cx", cx + dx);
    ellipse.attr("rx", newRx);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("width", ellipse.getBBox().width);

}

function eResizeEllipseMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var ellipse = gSvg.select("#" + gCurrent + "ellipse");
        correctXY(grp, ellipse, "ellipse");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}
//endregion

//region Boundary
function getElementXYofLine(bBoxX, bBoxY, elName, lineId) {

    var xy = [];
    var line = gSvg.select("#" + lineId);

    var width = (line == null) ? 0 : parseInt(line.attr("x1"), 10) - parseInt(line.attr("x2"), 10);
    width = Math.abs(width);

    if ("text" == elName) {

        var grp = getGroupPrefix(lineId);
        var text = gSvg.select("#" + grp + "text");
        var textWidth = 70;
        if (text) {
            var textBBox = text.getBBox();
            textWidth = textBBox.width;
        }

        xy.push(bBoxX - textWidth - 10);
        xy.push(bBoxY);

    } else if ("wResize" == elName) {

        xy.push(bBoxX - CIRCLE_R);
        xy.push(bBoxY);

    } else if ("eResize" == elName) {

        xy.push(bBoxX + width - CIRCLE_R);
        xy.push(bBoxY);

    }

    return xy;

}

function addLine() {

    var grp = getGroupPrefix(gSerialNo);
    var grpId = grp + "g";
    var lineId = grp + "line";
    var newLine = gSvg.line(10, 60, 110, 60);
    newLine.addClass("myLine");
    newLine.attr("id", lineId);

    newLine.mouseover(rectMouseOver);
    newLine.mouseout(rectMouseOut);
    newLine.mousedown(svgElMouseDown);

    newLine.node.addEventListener("contextmenu", lineContextMenu);

    var bBoxLine = newLine.getBBox();

    var wResizeId = grp + "wResize";
    var wResizeXY = getElementXYofLine(bBoxLine.x, bBoxLine.y, "wResize", lineId);
    var wResize = gSvg.circle(wResizeXY[0], wResizeXY[1], CIRCLE_R);
    wResize.addClass("myWResize");
    wResize.addClass("hide");
    wResize.attr("id", wResizeId);

    wResize.mouseover(rectMouseOver);
    wResize.mouseout(rectMouseOut);
    wResize.mousedown(wResizeLineMouseDown);

    var eResizeId = grp + "eResize";
    var eResizeXY = getElementXYofLine(bBoxLine.x, bBoxLine.y, "eResize", lineId);
    var eResize = gSvg.circle(eResizeXY[0], eResizeXY[1], CIRCLE_R);
    eResize.addClass("myEResize");
    eResize.addClass("hide");
    eResize.attr("id", eResizeId);

    eResize.mouseover(rectMouseOver);
    eResize.mouseout(rectMouseOut);
    eResize.mousedown(eResizeLineMouseDown);


    var textId = grp + "text";
    var textXY = getElementXYofLine(bBoxLine.x, bBoxLine.y, "text", lineId);
    var text = gSvg.text(textXY[0], textXY[1], "Label");
    text.attr("id", textId);
    text.addClass("myLabel");

    text.dblclick(textDblClick);

    var g = gSvg.g(newLine, wResize, eResize, text);
    g.attr("id", grpId);

    gSerialNo++;

}

function lineContextMenu(e) {

    e.preventDefault();

    var r = confirm(REMOVE_LINE_MSG);
    if (!r) {
        return;
    }

    var grp = getGroupPrefix(this.id);
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();

    return false;

}

function correctLineXY(grp, line) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    // FIXME: re-init bug
    if (tStrAry.length == 0) {
        return;
    }

    var x = parseInt(tStrAry[0][1], 10);
    var y = parseInt(tStrAry[0][2], 10);

    var nowX1 = parseInt(line.attr("x1"), 10);
    var nowY1 = parseInt(line.attr("y1"), 10);
    var nowX2 = parseInt(line.attr("x2"), 10);
    var nowY2 = parseInt(line.attr("y2"), 10);

    var x1 = x + nowX1;
    var y1 = y + nowY1;
    var x2 = x + nowX2;
    var y2 = y + nowY2;

    //g.attr("transform", "");
    g.transform("translate(0 0)");

    //rect.attr("transform", "");
    var lineId = grp + "line";
    line.transform("translate(0 0)");
    line.attr("x1", x1);
    line.attr("y1", y1);
    line.attr("x2", x2);
    line.attr("y2", y2);

    var wResize = gSvg.select("#" + grp + "wResize");
    var wResizeXY = getElementXYofLine(x1, y1, "wResize", lineId);

    wResize.transform("translate(0 0)");
    wResize.attr("cx", wResizeXY[0]);
    wResize.attr("cy", wResizeXY[1]);

    var eResize = gSvg.select("#" + grp + "eResize");
    var eResizeXY = getElementXYofLine(x1, y1, "eResize", lineId);

    eResize.transform("translate(0 0)");
    eResize.attr("cx", eResizeXY[0]);
    eResize.attr("cy", eResizeXY[1]);

    var text = gSvg.select("#" + grp + "text");
    var textXY = getElementXYofLine(x1, y1, "text", lineId);

    //text.attr("transform", "");
    text.transform("translate(0 0)");
    text.attr("x", textXY[0]);
    text.attr("y", textXY[1]);

}

function wResizeLineMouseDown() {

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "wResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var line = gSvg.select("#" + grp + "line");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-x1", parseInt(line.attr("x1"), 10));
    svgEl.data("mousedown-y1", parseInt(line.attr("y1"), 10));
    svgEl.data("mousedown-x2", parseInt(line.attr("x2"), 10));
    svgEl.data("mousedown-y2", parseInt(line.attr("y2"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = wResizeLineMouseMove;
    gDrawArea.onmouseup = wResizeLineMouseUp;
}

function wResizeLineMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var x1 = (parseInt(svgEl.data('mousedown-x1')) || 0);
    var y1 = (parseInt(svgEl.data('mousedown-y1')) || 0);
    var x2 = (parseInt(svgEl.data('mousedown-x2')) || 0);
    var y2 = (parseInt(svgEl.data('mousedown-y2')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newX1 = x1 + dx;
    //if (Math.abs(newX1 - x1) < LINE_WIDTH) {
    //    return;
    //}

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var line = gSvg.select("#" + gCurrent + "line");
    line.attr("x1", newX1);

}

function wResizeLineMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var line = gSvg.select("#" + gCurrent + "line");
        correctXY(grp, line, "line");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrent = "";
    gDragType = "";
}

function eResizeLineMouseDown() {

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "eResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var line = gSvg.select("#" + grp + "line");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-x1", parseInt(line.attr("x1"), 10));
    svgEl.data("mousedown-y1", parseInt(line.attr("y1"), 10));
    svgEl.data("mousedown-x2", parseInt(line.attr("x2"), 10));
    svgEl.data("mousedown-y2", parseInt(line.attr("y2"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = eResizeLineMouseMove;
    gDrawArea.onmouseup = eResizeLineMouseUp;
}

function eResizeLineMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var x1 = (parseInt(svgEl.data('mousedown-x1')) || 0);
    var y1 = (parseInt(svgEl.data('mousedown-y1')) || 0);
    var x2 = (parseInt(svgEl.data('mousedown-x2')) || 0);
    var y2 = (parseInt(svgEl.data('mousedown-y2')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newX2 = x2 + dx;
    //if (Math.abs(newX2 - x2) < LINE_WIDTH) {
    //    return;
    //}

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var line = gSvg.select("#" + gCurrent + "line");
    line.attr("x2", newX2);

}

function eResizeLineMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var line = gSvg.select("#" + gCurrent + "line");
        correctXY(grp, line, "line");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrent = "";
    gDragType = "";
}
//endregion

//region Brace
// refer: http://bl.ocks.org/alexhornbake/6005176
//returns path string d for <path d="This string">
//a curly brace between x1,y1 and x2,y2, w pixels wide
//and q factor, .5 is normal, higher q = more expressive bracket
function makeCurlyBrace(x1, y1, x2, y2, w, q) {

    //Calculate unit vector
    var dx = x1 - x2;
    var dy = y1 - y2;
    var len = Math.sqrt(dx * dx + dy * dy);
    dx = dx / len;
    dy = dy / len;

    //Calculate Control Points of path,
    var qx1 = x1 + q * w * dy;
    var qy1 = y1 - q * w * dx;
    var qx2 = (x1 - .25 * len * dx) + (1 - q) * w * dy;
    var qy2 = (y1 - .25 * len * dy) - (1 - q) * w * dx;
    var tx1 = (x1 - .5 * len * dx) + w * dy;
    var ty1 = (y1 - .5 * len * dy) - w * dx;
    var qx3 = x2 + q * w * dy;
    var qy3 = y2 - q * w * dx;
    var qx4 = (x1 - .75 * len * dx) + (1 - q) * w * dy;
    var qy4 = (y1 - .75 * len * dy) - (1 - q) * w * dx;

    return ( "M " + x1 + " " + y1 +
    " Q " + qx1 + " " + qy1 + " " + qx2 + " " + qy2 +
    " T " + tx1 + " " + ty1 +
    " M " + x2 + " " + y2 +
    " Q " + qx3 + " " + qy3 + " " + qx4 + " " + qy4 +
    " T " + tx1 + " " + ty1 );
}

function addBrace(dir) {

    var grp = getGroupPrefix(gSerialNo);
    var grpId = grp + "g";
    var braceId = grp + "brace";

    var pathStr = "";
    if ("left" == dir) {
        pathStr = makeCurlyBrace(20, 20, 20, 60, BRACE_WIDTH, BRACE_Q);
    } else if ("right" == dir) {
        pathStr = makeCurlyBrace(20, 60, 20, 20, BRACE_WIDTH, BRACE_Q);
    } else {
        return;
    }

    var newBrace = gSvg.path(pathStr);
    newBrace.addClass("myBrace");
    newBrace.attr("id", braceId);
    newBrace.attr("dir", dir);

    //newBrace.mouseover(rectMouseOver);
    //newBrace.mouseout(rectMouseOut);
    newBrace.mousedown(svgElMouseDown);

    newBrace.node.addEventListener("contextmenu", showContextMenu);

    var bBoxBrace = newBrace.getBBox();
    var selected = generateSelectedMark(bBoxBrace, grp);

    var closeId = grp + "close";
    var closeXY = getElementXYofBrace(bBoxBrace.x, bBoxBrace.y, "close", braceId);
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    close.mousedown(closeClick);

    var nResizeId = grp + "nResize";
    var nResizeXY = getElementXYofBrace(bBoxBrace.x, bBoxBrace.y, "nResize", braceId);
    var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
    nResize.addClass("myNResize");
    nResize.addClass("hide");
    nResize.attr("id", nResizeId);

    //nResize.mouseover(rectMouseOver);
    //nResize.mouseout(rectMouseOut);
    nResize.mousedown(nResizeBraceMouseDown);

    var sResizeId = grp + "sResize";
    var sResizeXY = getElementXYofBrace(bBoxBrace.x, bBoxBrace.y, "sResize", braceId);
    var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
    sResize.addClass("mySResize");
    sResize.addClass("hide");
    sResize.attr("id", sResizeId);

    //sResize.mouseover(rectMouseOver);
    //sResize.mouseout(rectMouseOut);
    sResize.mousedown(sResizeBraceMouseDown);

    var g = gSvg.g(newBrace, nResize, sResize, selected, close);
    g.attr("id", grpId);

    gSerialNo++;

    setSelected(grp);
    gCurrent = grp;

}

function getElementXYofBrace(bBoxX, bBoxY, elName, braceId) {

    var xy = [];
    var brace = gSvg.select("#" + braceId);
    var bBox = brace.getBBox();

    if ("nResize" == elName) {

        xy.push(bBoxX + (bBox.width ) / 2);
        xy.push(bBoxY);

    } else if ("sResize" == elName) {

        xy.push(bBoxX + (bBox.width ) / 2);
        xy.push(bBoxY + bBox.height);

    } else if ("selected" == elName) {

        xy.push(bBoxX);
        xy.push(bBoxY);

    } else if ("close" == elName) {

        xy.push(bBoxX + bBox.width - CIRCLE_R_HALF);
        xy.push(bBoxY + bBox.height / 2);

    }

    return xy;

}

function correctBraceXY(grp, brace) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    var braceId = grp + "brace";
    if (tStrAry.length != 0) {

        var dx = parseInt(tStrAry[0][1], 10);
        var dy = parseInt(tStrAry[0][2], 10);

        var pathStr = brace.attr("d");
        var pathAry = Snap.parsePathString(pathStr);

        var nowX = parseInt(pathAry[0][1], 10);
        var nowY = parseInt(pathAry[0][2], 10);

        var x = dx + nowX;
        var y = dy + nowY;

        var dir = brace.attr("dir");
        var newPath = "";
        if ("left" == dir) {
            newPath = makeCurlyBrace(x, y, x, y + brace.getBBox().height, BRACE_WIDTH, BRACE_Q);
        } else if ("right" == dir) {
            newPath = makeCurlyBrace(x, y, x, y - brace.getBBox().height, BRACE_WIDTH, BRACE_Q);
        } else {
            return;
        }

        g.transform("translate(0 0)");

        brace.transform("translate(0 0)");
        brace.attr("d", newPath);

    }

    var bBox = brace.getBBox();

    var close = gSvg.select("#" + grp + "close");
    var closeXY = getElementXYofBrace(bBox.x, bBox.y, "close", braceId);

    close.transform("translate(0 0)");
    close.attr("cx", closeXY[0]);
    close.attr("cy", closeXY[1]);

    var nResize = gSvg.select("#" + grp + "nResize");
    var nResizeXY = getElementXYofBrace(bBox.x, bBox.y, "nResize", braceId);

    nResize.transform("translate(0 0)");
    nResize.attr("cx", nResizeXY[0]);
    nResize.attr("cy", nResizeXY[1]);

    var sResize = gSvg.select("#" + grp + "sResize");
    var sResizeXY = getElementXYofBrace(bBox.x, bBox.y, "sResize", braceId);

    sResize.transform("translate(0 0)");
    sResize.attr("cx", sResizeXY[0]);
    sResize.attr("cy", sResizeXY[1]);

    var selected = gSvg.select("#" + grp + "selected");
    var selectedXY = getElementXYofRect(bBox.x, bBox.y, "selected", braceId);
    selected.transform("translate(0 0)");
    selected.attr("x", selectedXY[0]);
    selected.attr("y", selectedXY[1]);

}

function nResizeBraceMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "nResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var brace = gSvg.select("#" + grp + "brace");
    var bBox = brace.getBBox();

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-x1", parseInt(bBox.x, 10));
    svgEl.data("mousedown-y1", parseInt(bBox.y, 10));
    svgEl.data("mousedown-x2", parseInt(bBox.x, 10));
    svgEl.data("mousedown-y2", parseInt(bBox.y + bBox.height, 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = nResizeBraceMouseMove;
    gDrawArea.onmouseup = nResizeBraceMouseUp;
}

function nResizeBraceMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var x1 = (parseInt(svgEl.data('mousedown-x1')) || 0);
    var y1 = (parseInt(svgEl.data('mousedown-y1')) || 0);
    var x2 = (parseInt(svgEl.data('mousedown-x2')) || 0);
    var y2 = (parseInt(svgEl.data('mousedown-y2')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var brace = gSvg.select("#" + gCurrent + "brace");

    var dir = brace.attr("dir");
    var newPath = "";
    if ("left" == dir) {
        newPath = makeCurlyBrace(x1 + BRACE_WIDTH, y1 + dy, x2 + BRACE_WIDTH, y2, BRACE_WIDTH, BRACE_Q);
    } else if ("right" == dir) {
        newPath = makeCurlyBrace(x1, y2, x2, y1 + dy, BRACE_WIDTH, BRACE_Q);
    } else {
        return;
    }

    brace.attr("d", newPath);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("y", event.clientY - gStartY);
    selected.attr("height", brace.getBBox().height);

}

function nResizeBraceMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var brace = gSvg.select("#" + gCurrent + "brace");
        correctXY(grp, brace, "brace");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function sResizeBraceMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "sResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var brace = gSvg.select("#" + grp + "brace");
    var bBox = brace.getBBox();

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-x1", parseInt(bBox.x, 10));
    svgEl.data("mousedown-y1", parseInt(bBox.y, 10));
    svgEl.data("mousedown-x2", parseInt(bBox.x, 10));
    svgEl.data("mousedown-y2", parseInt(bBox.y + bBox.height, 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = sResizeBraceMouseMove;
    gDrawArea.onmouseup = sResizeBraceMouseUp;
}

function sResizeBraceMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var x1 = (parseInt(svgEl.data('mousedown-x1')) || 0);
    var y1 = (parseInt(svgEl.data('mousedown-y1')) || 0);
    var x2 = (parseInt(svgEl.data('mousedown-x2')) || 0);
    var y2 = (parseInt(svgEl.data('mousedown-y2')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var brace = gSvg.select("#" + gCurrent + "brace");

    var dir = brace.attr("dir");
    var newPath = "";
    if ("left" == dir) {
        newPath = makeCurlyBrace(x1 + BRACE_WIDTH, y1, x2 + BRACE_WIDTH, y2 + dy, BRACE_WIDTH, BRACE_Q);
    } else if ("right" == dir) {
        newPath = makeCurlyBrace(x1, y2 + dy, x2, y1, BRACE_WIDTH, BRACE_Q);
    } else {
        return;
    }

    brace.attr("d", newPath);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("height", brace.getBBox().height);


}

function sResizeBraceMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var brace = gSvg.select("#" + gCurrent + "brace");
        correctXY(grp, brace, "brace");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}
//endregion

//region BreakDown
function addBreak() {

    var grp = getGroupPrefix(gSerialNo);
    var breakId = grp + "break";

    var pathStr = "M0 0 L50 50 L30 50 L90 100 L40 50 Z";
    var newBreak = gSvg.path(pathStr);
    newBreak.addClass("myBreak");
    newBreak.attr("id", breakId);

    //newBreak.mouseover(connectorMouseOver);
    //newBreak.mouseout(connectorMouseOut);
    newBreak.mousedown(svgElMouseDown);

    newBreak.node.addEventListener("contextmenu", showContextMenu);

    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;
    var ratioStr = "0,0";

    var bBoxBreak = newBreak.getBBox();

    for (var i = 1; i < pathLen; i++) {

        var action = pathAry[i][0];

        if ("Z" == action.toUpperCase()) {
            break;
        }

        var lineToX = pathAry[i][1];
        var lineToY = pathAry[i][2];

        var ratioX = (lineToX - bBoxBreak.x) / bBoxBreak.width;
        var ratioY = (lineToY - bBoxBreak.y) / bBoxBreak.height;

        ratioStr += "|" + roundByDigits(ratioX, 2) + "," + roundByDigits(ratioY, 2);

    }
    newBreak.attr("_ratio", ratioStr);

    var selected = generateSelectedMark(bBoxBreak, grp);

    var closeId = grp + "close";
    var closeXY = getElementXYofBBox(bBoxBreak, "close");
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    close.mousedown(closeClick);

    var nResizeId = grp + "nResize";
    var nResizeXY = getElementXYofBBox(bBoxBreak, "nResize");
    var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
    nResize.addClass("myNResize");
    nResize.addClass("hide");
    nResize.attr("id", nResizeId);

    nResize.mousedown(nResizeBreakMouseDown);

    var sResizeId = grp + "sResize";
    var sResizeXY = getElementXYofBBox(bBoxBreak, "sResize");
    var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
    sResize.addClass("mySResize");
    sResize.addClass("hide");
    sResize.attr("id", sResizeId);

    sResize.mousedown(sResizeBreakMouseDown);

    var wResizeId = grp + "wResize";
    var wResizeXY = getElementXYofBBox(bBoxBreak, "wResize");
    var wResize = gSvg.circle(wResizeXY[0], wResizeXY[1], CIRCLE_R);
    wResize.addClass("myWResize");
    wResize.addClass("hide");
    wResize.attr("id", wResizeId);

    wResize.mousedown(wResizeBreakMouseDown);

    var eResizeId = grp + "eResize";
    var eResizeXY = getElementXYofBBox(bBoxBreak, "eResize");
    var eResize = gSvg.circle(eResizeXY[0], eResizeXY[1], CIRCLE_R);
    eResize.addClass("myEResize");
    eResize.addClass("hide");
    eResize.attr("id", eResizeId);

    eResize.mousedown(eResizeBreakMouseDown);

    var g = gSvg.g(newBreak, close, nResize, sResize, wResize, eResize, selected);
    var grpId = grp + "g";
    g.attr("id", grpId);

    gSerialNo++;

    setSelected(grp);
    gCurrent = grp;

}

function correctBreakXY(grp, conn) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    if (tStrAry.length != 0) {

        var x = parseInt(tStrAry[0][1], 10);
        var y = parseInt(tStrAry[0][2], 10);

        //g.attr("transform", "");
        g.transform("translate(0 0)");

        var pathStr = conn.attr("d");
        pathStr = pathStr.substring(0, pathStr.length - 1);
        var pathAry = Snap.parsePathString(pathStr);
        var pathLen = pathAry.length;

        pathAry.forEach(function (p) {
            p[1] = parseInt(p[1]) + x;
            p[2] = parseInt(p[2]) + y;
        });

        var newPath = "";
        var lastSubPath = [];
        for (var i = 0; i < pathLen; i++) {

            var act = pathAry[i][0];
            var cx = pathAry[i][1];
            var cy = pathAry[i][2];

            newPath += act + " ";
            newPath += cx + " ";
            newPath += cy + " ";

            if (i >= pathLen - 2) {
                lastSubPath.push(cx);
                lastSubPath.push(cy);
            }
        }

        newPath = newPath + "Z";
        //conn.attr("transform", "");
        conn.transform("translate(0 0)");
        conn.attr("d", newPath);

        var bBoxConn = conn.getBBox();
        var close = gSvg.select("#" + grp + "close");
        var closeXY = getElementXYofBBox(bBoxConn, "close");

        close.transform("translate(0 0)");
        close.attr("cx", closeXY[0]);
        close.attr("cy", closeXY[1]);

        var nResize = gSvg.select("#" + grp + "nResize");
        var nResizeXY = getElementXYofBBox(bBoxConn, "nResize");

        nResize.transform("translate(0 0)");
        nResize.attr("cx", nResizeXY[0]);
        nResize.attr("cy", nResizeXY[1]);

        var sResize = gSvg.select("#" + grp + "sResize");
        var sResizeXY = getElementXYofBBox(bBoxConn, "sResize");

        sResize.transform("translate(0 0)");
        sResize.attr("cx", sResizeXY[0]);
        sResize.attr("cy", sResizeXY[1]);

        var wResize = gSvg.select("#" + grp + "wResize");
        var wResizeXY = getElementXYofBBox(bBoxConn, "wResize");

        wResize.transform("translate(0 0)");
        wResize.attr("cx", wResizeXY[0]);
        wResize.attr("cy", wResizeXY[1]);

        var eResize = gSvg.select("#" + grp + "eResize");
        var eResizeXY = getElementXYofBBox(bBoxConn, "eResize");

        eResize.transform("translate(0 0)");
        eResize.attr("cx", eResizeXY[0]);
        eResize.attr("cy", eResizeXY[1]);

        var selected = gSvg.select("#" + grp + "selected");
        var selectedXY = getElementXYofBBox(bBoxConn, "selected");
        selected.transform("translate(0 0)");
        selected.attr("x", selectedXY[0]);
        selected.attr("y", selectedXY[1]);

    }

}

function setBreakRatioAry(grp) {

    var breakDown = gSvg.select("#" + grp + "break");
    var ratio = breakDown.attr("_ratio");
    var ratios = ratio.split("|");
    gRatioAry = [];
    ratios.forEach(function (r) {
        gRatioAry.push(r.split(","));
    });

}

function nResizeBreakMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "nResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var selected = gSvg.select("#" + grp + "selected");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(selected.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(selected.attr("width"), 10));

    svgEl.addClass("toFront");

    setBreakRatioAry(grp);

    gDrawArea.onmousemove = nResizeBreakMouseMove;
    gDrawArea.onmouseup = nResizeBreakMouseUp;
}

function nResizeBreakMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newHeight = h - dy;
    if (newHeight < RECT_HEIGHT) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var newY = event.clientY - gStartY;
    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("y", newY);
    selected.attr("height", newHeight);

    var breakDown = gSvg.select("#" + gCurrent + "break");
    var pathStr = breakDown.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;

    var newPath = "";
    for (var i = 0; i < pathLen; i++) {

        var act = pathAry[i][0];

        if ("Z" != act.toUpperCase()) {
            var lineToX = pathAry[i][1];
            //var lineToY = pathAry[i][2];

            newPath += act + " ";
            newPath += lineToX + " ";
            newPath += newY + (gRatioAry[i][1] * newHeight) + " ";
        } else {
            newPath += act;
        }

    }

    breakDown.attr("d", newPath);

}

function nResizeBreakMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var breakDown = gSvg.select("#" + gCurrent + "break");
        correctBreakXY(grp, breakDown);

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gDragType = "";
}

function sResizeBreakMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "sResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var selected = gSvg.select("#" + grp + "selected");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(selected.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(selected.attr("width"), 10));

    svgEl.addClass("toFront");

    setBreakRatioAry(grp);

    gDrawArea.onmousemove = sResizeBreakMouseMove;
    gDrawArea.onmouseup = sResizeBreakMouseUp;
}

function sResizeBreakMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newHeight = h + dy;
    if (newHeight < RECT_HEIGHT) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var newY;
    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("height", newHeight);
    newY = selected.getBBox().y;

    var breakDown = gSvg.select("#" + gCurrent + "break");
    var pathStr = breakDown.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;

    var newPath = "";
    for (var i = 0; i < pathLen; i++) {

        var act = pathAry[i][0];

        if ("Z" != act.toUpperCase()) {
            var lineToX = pathAry[i][1];
            //var lineToY = pathAry[i][2];

            newPath += act + " ";
            newPath += lineToX + " ";
            newPath += newY + (gRatioAry[i][1] * newHeight) + " ";
        } else {
            newPath += act;
        }

    }

    breakDown.attr("d", newPath);

}

function sResizeBreakMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var breakDown = gSvg.select("#" + gCurrent + "break");
        correctBreakXY(grp, breakDown);

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gDragType = "";
}

function wResizeBreakMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "wResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var selected = gSvg.select("#" + grp + "selected");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(selected.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(selected.attr("width"), 10));

    svgEl.addClass("toFront");

    setBreakRatioAry(grp);

    gDrawArea.onmousemove = wResizeBreakMouseMove;
    gDrawArea.onmouseup = wResizeBreakMouseUp;
}

function wResizeBreakMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newWidth = w - dx;
    if (newWidth < RECT_WIDTH) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var newX = event.clientX - gStartX;
    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("x", newX);
    selected.attr("width", newWidth);

    var breakDown = gSvg.select("#" + gCurrent + "break");
    var pathStr = breakDown.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;

    var newPath = "";
    for (var i = 0; i < pathLen; i++) {

        var act = pathAry[i][0];

        if ("Z" != act.toUpperCase()) {
            //var lineToX = pathAry[i][1];
            var lineToY = pathAry[i][2];

            newPath += act + " ";
            newPath += newX + (gRatioAry[i][0] * newWidth) + " ";
            newPath += lineToY + " ";
        } else {
            newPath += act;
        }

    }

    breakDown.attr("d", newPath);

}

function wResizeBreakMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var breakDown = gSvg.select("#" + gCurrent + "break");
        correctBreakXY(grp, breakDown);

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gDragType = "";
}

function eResizeBreakMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "eResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var selected = gSvg.select("#" + grp + "selected");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(selected.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(selected.attr("width"), 10));

    svgEl.addClass("toFront");

    setBreakRatioAry(grp);

    gDrawArea.onmousemove = eResizeBreakMouseMove;
    gDrawArea.onmouseup = eResizeBreakMouseUp;
}

function eResizeBreakMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newWidth = w + dx;
    if (newWidth < RECT_WIDTH) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var newX;
    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("width", newWidth);
    newX = selected.getBBox().x;

    var breakDown = gSvg.select("#" + gCurrent + "break");
    var pathStr = breakDown.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;

    var newPath = "";
    for (var i = 0; i < pathLen; i++) {

        var act = pathAry[i][0];

        if ("Z" != act.toUpperCase()) {
            //var lineToX = pathAry[i][1];
            var lineToY = pathAry[i][2];

            newPath += act + " ";
            newPath += newX + (gRatioAry[i][0] * newWidth) + " ";
            newPath += lineToY + " ";
        } else {
            newPath += act;
        }

    }

    breakDown.attr("d", newPath);

}

function eResizeBreakMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var breakDown = gSvg.select("#" + gCurrent + "break");
        correctBreakXY(grp, breakDown);

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gDragType = "";
}

//endregion

//region Image
function insertImage() {
    document.getElementById("insertImg").click();
}

function addImage() {

    var file = document.getElementById("insertImg").files[0];

    if (!file) {
        return;
    }

    var textType = /image.*/;
    if (!file.type.match(textType)) {
        alert("File not supported!");
        document.getElementById("insertImg").value = "";
        return;
    }

    var fReader = new FileReader();
    fReader.onload = function (event) {

        var grp = getGroupPrefix(gSerialNo);
        var grpId = grp + "g";
        var imageId = grp + "image";

        var newImage = gSvg.image(event.target.result);
        newImage.addClass("myImage");
        newImage.attr("id", imageId);
        newImage.attr("x", 10);
        newImage.attr("y", 10);

        //newImage.mouseover(rectMouseOver);
        //newImage.mouseout(rectMouseOut);
        newImage.mousedown(svgElMouseDown);

        newImage.node.addEventListener("contextmenu", showContextMenu);
        newImage.node.addEventListener("load",

            function () {

                var bBoxImage = newImage.getBBox();
                var selected = generateSelectedMark(bBoxImage, grp);

                var closeId = grp + "close";
                var closeXY = getElementXYofImage("close", imageId);
                var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
                close.addClass("myClose");
                close.addClass("hide");
                close.attr("id", closeId);

                close.mousedown(closeClick);

                var nResizeId = grp + "nResize";
                var nResizeXY = getElementXYofImage("nResize", imageId);
                var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
                nResize.addClass("myNResize");
                nResize.addClass("hide");
                nResize.attr("id", nResizeId);

                //nResize.mouseover(rectMouseOver);
                //nResize.mouseout(rectMouseOut);
                nResize.mousedown(nResizeImageMouseDown);

                var sResizeId = grp + "sResize";
                var sResizeXY = getElementXYofImage("sResize", imageId);
                var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
                sResize.addClass("mySResize");
                sResize.addClass("hide");
                sResize.attr("id", sResizeId);

                //sResize.mouseover(rectMouseOver);
                //sResize.mouseout(rectMouseOut);
                sResize.mousedown(sResizeImageMouseDown);

                var wResizeId = grp + "wResize";
                var wResizeXY = getElementXYofImage("wResize", imageId);
                var wResize = gSvg.circle(wResizeXY[0], wResizeXY[1], CIRCLE_R);
                wResize.addClass("myWResize");
                wResize.addClass("hide");
                wResize.attr("id", wResizeId);

                //wResize.mouseover(rectMouseOver);
                //wResize.mouseout(rectMouseOut);
                wResize.mousedown(wResizeImageMouseDown);

                var eResizeId = grp + "eResize";
                var eResizeXY = getElementXYofImage("eResize", imageId);
                var eResize = gSvg.circle(eResizeXY[0], eResizeXY[1], CIRCLE_R);
                eResize.addClass("myEResize");
                eResize.addClass("hide");
                eResize.attr("id", eResizeId);

                //eResize.mouseover(rectMouseOver);
                //eResize.mouseout(rectMouseOut);
                eResize.mousedown(eResizeImageMouseDown);

                var g = gSvg.g(newImage, nResize, sResize, wResize, eResize, close, selected);
                var grpId = grp + "g";
                g.attr("id", grpId);

                setSelected(grp);
                gCurrent = grp;

            });

        gSerialNo++;

    };
    fReader.readAsDataURL(file);

}

function getElementXYofImage(elName, imageId) {

    var xy = [];
    var image = gSvg.select("#" + imageId);

    var bBox = image.getBBox();

    if ("nResize" == elName) {

        xy.push(bBox.x + bBox.width / 2);
        xy.push(bBox.y);

    } else if ("sResize" == elName) {

        xy.push(bBox.x + bBox.width / 2);
        xy.push(bBox.y + bBox.height);

    } else if ("wResize" == elName) {

        xy.push(bBox.x);
        xy.push(bBox.y + bBox.height / 2);

    } else if ("eResize" == elName) {

        xy.push(bBox.x + bBox.width);
        xy.push(bBox.y + bBox.height / 2);

    } else if ("close" == elName) {

        xy.push(bBox.x + bBox.width - CIRCLE_R_HALF);
        xy.push(bBox.y + CIRCLE_R_HALF);

    } else if ("selected" == elName) {

        xy.push(bBox.x);
        xy.push(bBox.y);

    }

    return xy;

}

function correctImageXY(grp, image) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    var imageId = grp + "image";
    if (tStrAry.length != 0) {

        var x = parseInt(tStrAry[0][1], 10);
        var y = parseInt(tStrAry[0][2], 10);

        var nowX = parseInt(image.attr("x"), 10);
        var nowY = parseInt(image.attr("y"), 10);

        x += nowX;
        y += nowY;

        g.transform("translate(0 0)");

        image.transform("translate(0 0)");
        image.attr("x", x);
        image.attr("y", y);

    }

    var close = gSvg.select("#" + grp + "close");
    var closeXY = getElementXYofImage("close", imageId);

    close.transform("translate(0 0)");
    close.attr("cx", closeXY[0]);
    close.attr("cy", closeXY[1]);

    var nResize = gSvg.select("#" + grp + "nResize");
    var nResizeXY = getElementXYofImage("nResize", imageId);

    nResize.transform("translate(0 0)");
    nResize.attr("cx", nResizeXY[0]);
    nResize.attr("cy", nResizeXY[1]);

    var sResize = gSvg.select("#" + grp + "sResize");
    var sResizeXY = getElementXYofImage("sResize", imageId);

    sResize.transform("translate(0 0)");
    sResize.attr("cx", sResizeXY[0]);
    sResize.attr("cy", sResizeXY[1]);

    var wResize = gSvg.select("#" + grp + "wResize");
    var wResizeXY = getElementXYofImage("wResize", imageId);

    wResize.transform("translate(0 0)");
    wResize.attr("cx", wResizeXY[0]);
    wResize.attr("cy", wResizeXY[1]);

    var eResize = gSvg.select("#" + grp + "eResize");
    var eResizeXY = getElementXYofImage("eResize", imageId);

    eResize.transform("translate(0 0)");
    eResize.attr("cx", eResizeXY[0]);
    eResize.attr("cy", eResizeXY[1]);

    var selected = gSvg.select("#" + grp + "selected");
    var selectedXY = getElementXYofImage("selected", imageId);
    selected.transform("translate(0 0)");
    selected.attr("x", selectedXY[0]);
    selected.attr("y", selectedXY[1]);

}

function nResizeImageMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "nResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var image = gSvg.select("#" + grp + "image");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(image.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(image.attr("width"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = nResizeImageMouseMove;
    gDrawArea.onmouseup = nResizeImageMouseUp;
}

function nResizeImageMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newHeight = h - dy;
    if (newHeight < RECT_HEIGHT) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var image = gSvg.select("#" + gCurrent + "image");
    image.attr("y", event.clientY - gStartY);
    image.attr("height", newHeight);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("y", event.clientY - gStartY);
    selected.attr("height", image.getBBox().height);

}

function nResizeImageMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var image = gSvg.select("#" + gCurrent + "image");
        correctXY(grp, image, "image");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function sResizeImageMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "sResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var image = gSvg.select("#" + grp + "image");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(image.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(image.attr("width"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = sResizeImageMouseMove;
    gDrawArea.onmouseup = sResizeImageMouseUp;
}

function sResizeImageMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newHeight = h + dy;
    if (newHeight < RECT_HEIGHT) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var image = gSvg.select("#" + gCurrent + "image");
    image.attr("height", newHeight);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("height", image.getBBox().height);

}

function sResizeImageMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var image = gSvg.select("#" + gCurrent + "image");
        correctXY(grp, image, "image");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function wResizeImageMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "wResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var image = gSvg.select("#" + grp + "image");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(image.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(image.attr("width"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = wResizeImageMouseMove;
    gDrawArea.onmouseup = wResizeImageMouseUp;
}

function wResizeImageMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newWidth = w - dx;
    if (newWidth < RECT_WIDTH) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var image = gSvg.select("#" + gCurrent + "image");
    image.attr("x", event.clientX - gStartX);
    image.attr("width", newWidth);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("x", event.clientX - gStartX);
    selected.attr("width", image.getBBox().width);

}

function wResizeImageMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var image = gSvg.select("#" + gCurrent + "image");
        correctXY(grp, image, "image");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function eResizeImageMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "eResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var image = gSvg.select("#" + grp + "image");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(image.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(image.attr("width"), 10));

    svgEl.addClass("toFront");

    gDrawArea.onmousemove = eResizeImageMouseMove;
    gDrawArea.onmouseup = eResizeImageMouseUp;
}

function eResizeImageMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newWidth = w + dx;
    if (newWidth < RECT_WIDTH) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var image = gSvg.select("#" + gCurrent + "image");
    image.attr("width", newWidth);

    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("width", image.getBBox().width);

}

function eResizeImageMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var image = gSvg.select("#" + gCurrent + "image");
        correctXY(grp, image, "image");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}
// endregion

//region Custom
var CUSTOM_DEF = {
    "ClippingSquare": {path: "M 143 47 L 243 47 L 243 107 L 123 107 L 123 67 Z", clsName: "myClippingSquare"}
};

function addCustom(customDef) {

    var grp = getGroupPrefix(gSerialNo);
    var customId = grp + "custom";

    var pathStr = CUSTOM_DEF[customDef].path;
    var newCustom = gSvg.path(pathStr);
    newCustom.addClass(CUSTOM_DEF[customDef].clsName);
    newCustom.attr("id", customId);

    newCustom.mousedown(svgElMouseDown);

    newCustom.node.addEventListener("contextmenu", showContextMenu);

    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;
    var ratioStr = "";

    var bBoxCustom = newCustom.getBBox();

    for (var i = 0; i < pathLen; i++) {

        var action = pathAry[i][0];

        if ("Z" == action.toUpperCase()) {
            break;
        }

        var lineToX = pathAry[i][1];
        var lineToY = pathAry[i][2];

        var ratioX = (lineToX - bBoxCustom.x) / bBoxCustom.width;
        var ratioY = (lineToY - bBoxCustom.y) / bBoxCustom.height;

        ratioStr += ((i > 0) ? "|" : "") + roundByDigits(ratioX, 2) + "," + roundByDigits(ratioY, 2);

    }
    newCustom.attr("_ratio", ratioStr);

    var selected = generateSelectedMark(bBoxCustom, grp);

    var closeId = grp + "close";
    var closeXY = getElementXYofBBox(bBoxCustom, "close");
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    close.mousedown(closeClick);

    var nResizeId = grp + "nResize";
    var nResizeXY = getElementXYofBBox(bBoxCustom, "nResize");
    var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
    nResize.addClass("myNResize");
    nResize.addClass("hide");
    nResize.attr("id", nResizeId);

    nResize.mousedown(nResizeCustomMouseDown);

    var sResizeId = grp + "sResize";
    var sResizeXY = getElementXYofBBox(bBoxCustom, "sResize");
    var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
    sResize.addClass("mySResize");
    sResize.addClass("hide");
    sResize.attr("id", sResizeId);

    sResize.mousedown(sResizeCustomMouseDown);

    var wResizeId = grp + "wResize";
    var wResizeXY = getElementXYofBBox(bBoxCustom, "wResize");
    var wResize = gSvg.circle(wResizeXY[0], wResizeXY[1], CIRCLE_R);
    wResize.addClass("myWResize");
    wResize.addClass("hide");
    wResize.attr("id", wResizeId);

    wResize.mousedown(wResizeCustomMouseDown);

    var eResizeId = grp + "eResize";
    var eResizeXY = getElementXYofBBox(bBoxCustom, "eResize");
    var eResize = gSvg.circle(eResizeXY[0], eResizeXY[1], CIRCLE_R);
    eResize.addClass("myEResize");
    eResize.addClass("hide");
    eResize.attr("id", eResizeId);

    eResize.mousedown(eResizeCustomMouseDown);

    var g = gSvg.g(newCustom, close, nResize, sResize, wResize, eResize, selected);
    var grpId = grp + "g";
    g.attr("id", grpId);

    gSerialNo++;

    setSelected(grp);
    gCurrent = grp;

}

function correctCustomXY(grp, conn) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    if (tStrAry.length != 0) {

        var x = parseInt(tStrAry[0][1], 10);
        var y = parseInt(tStrAry[0][2], 10);

        g.transform("translate(0 0)");

        var pathStr = conn.attr("d");
        pathStr = pathStr.substring(0, pathStr.length - 1);
        var pathAry = Snap.parsePathString(pathStr);
        var pathLen = pathAry.length;

        pathAry.forEach(function (p) {
            p[1] = parseInt(p[1]) + x;
            p[2] = parseInt(p[2]) + y;
        });

        var newPath = "";
        for (var i = 0; i < pathLen; i++) {

            var act = pathAry[i][0];
            var cx = pathAry[i][1];
            var cy = pathAry[i][2];

            newPath += act + " ";
            newPath += cx + " ";
            newPath += cy + " ";

        }

        newPath = newPath + "Z";

        conn.transform("translate(0 0)");
        conn.attr("d", newPath);

    }

    var bBoxConn = conn.getBBox();
    var close = gSvg.select("#" + grp + "close");
    var closeXY = getElementXYofBBox(bBoxConn, "close");

    close.transform("translate(0 0)");
    close.attr("cx", closeXY[0]);
    close.attr("cy", closeXY[1]);

    var nResize = gSvg.select("#" + grp + "nResize");
    var nResizeXY = getElementXYofBBox(bBoxConn, "nResize");

    nResize.transform("translate(0 0)");
    nResize.attr("cx", nResizeXY[0]);
    nResize.attr("cy", nResizeXY[1]);

    var sResize = gSvg.select("#" + grp + "sResize");
    var sResizeXY = getElementXYofBBox(bBoxConn, "sResize");

    sResize.transform("translate(0 0)");
    sResize.attr("cx", sResizeXY[0]);
    sResize.attr("cy", sResizeXY[1]);

    var wResize = gSvg.select("#" + grp + "wResize");
    var wResizeXY = getElementXYofBBox(bBoxConn, "wResize");

    wResize.transform("translate(0 0)");
    wResize.attr("cx", wResizeXY[0]);
    wResize.attr("cy", wResizeXY[1]);

    var eResize = gSvg.select("#" + grp + "eResize");
    var eResizeXY = getElementXYofBBox(bBoxConn, "eResize");

    eResize.transform("translate(0 0)");
    eResize.attr("cx", eResizeXY[0]);
    eResize.attr("cy", eResizeXY[1]);

    var selected = gSvg.select("#" + grp + "selected");
    var selectedXY = getElementXYofBBox(bBoxConn, "selected");
    selected.transform("translate(0 0)");
    selected.attr("x", selectedXY[0]);
    selected.attr("y", selectedXY[1]);

}

function setRatioAry(grp) {

    var custom = gSvg.select("#" + grp + "custom");
    var ratio = custom.attr("_ratio");
    var ratios = ratio.split("|");
    gRatioAry = [];
    ratios.forEach(function (r) {
        gRatioAry.push(r.split(","));
    });

}

function nResizeCustomMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "nResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var selected = gSvg.select("#" + grp + "selected");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(selected.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(selected.attr("width"), 10));

    svgEl.addClass("toFront");

    setRatioAry(grp);

    gDrawArea.onmousemove = nResizeCustomMouseMove;
    gDrawArea.onmouseup = nResizeCustomMouseUp;
}

function nResizeCustomMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newHeight = h - dy;
    if (newHeight < RECT_HEIGHT) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var newY = event.clientY - gStartY;
    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("y", newY);
    selected.attr("height", newHeight);

    var custom = gSvg.select("#" + gCurrent + "custom");
    var pathStr = custom.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;

    var newPath = "";
    for (var i = 0; i < pathLen; i++) {

        var act = pathAry[i][0];

        if ("Z" != act.toUpperCase()) {
            var lineToX = pathAry[i][1];
            //var lineToY = pathAry[i][2];

            newPath += act + " ";
            newPath += lineToX + " ";
            newPath += newY + (gRatioAry[i][1] * newHeight) + " ";
        } else {
            newPath += act;
        }

    }

    custom.attr("d", newPath);

}

function nResizeCustomMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var custom = gSvg.select("#" + gCurrent + "custom");
        correctCustomXY(grp, custom);

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gDragType = "";
}

function sResizeCustomMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "sResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var selected = gSvg.select("#" + grp + "selected");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(selected.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(selected.attr("width"), 10));

    svgEl.addClass("toFront");

    setRatioAry(grp);

    gDrawArea.onmousemove = sResizeCustomMouseMove;
    gDrawArea.onmouseup = sResizeCustomMouseUp;
}

function sResizeCustomMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newHeight = h + dy;
    if (newHeight < RECT_HEIGHT) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var newY;
    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("height", newHeight);
    newY = selected.getBBox().y;

    var custom = gSvg.select("#" + gCurrent + "custom");
    var pathStr = custom.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;

    var newPath = "";
    for (var i = 0; i < pathLen; i++) {

        var act = pathAry[i][0];

        if ("Z" != act.toUpperCase()) {
            var lineToX = pathAry[i][1];
            //var lineToY = pathAry[i][2];

            newPath += act + " ";
            newPath += lineToX + " ";
            newPath += newY + (gRatioAry[i][1] * newHeight) + " ";
        } else {
            newPath += act;
        }

    }

    custom.attr("d", newPath);

}

function sResizeCustomMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var custom = gSvg.select("#" + gCurrent + "custom");
        correctCustomXY(grp, custom);

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gDragType = "";
}

function wResizeCustomMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "wResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var selected = gSvg.select("#" + grp + "selected");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(selected.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(selected.attr("width"), 10));

    svgEl.addClass("toFront");

    setRatioAry(grp);

    gDrawArea.onmousemove = wResizeCustomMouseMove;
    gDrawArea.onmouseup = wResizeCustomMouseUp;
}

function wResizeCustomMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newWidth = w - dx;
    if (newWidth < RECT_WIDTH) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var newX = event.clientX - gStartX;
    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("x", newX);
    selected.attr("width", newWidth);

    var custom = gSvg.select("#" + gCurrent + "custom");
    var pathStr = custom.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;

    var newPath = "";
    for (var i = 0; i < pathLen; i++) {

        var act = pathAry[i][0];

        if ("Z" != act.toUpperCase()) {
            //var lineToX = pathAry[i][1];
            var lineToY = pathAry[i][2];

            newPath += act + " ";
            newPath += newX + (gRatioAry[i][0] * newWidth) + " ";
            newPath += lineToY + " ";
        } else {
            newPath += act;
        }

    }

    custom.attr("d", newPath);

}

function wResizeCustomMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var custom = gSvg.select("#" + gCurrent + "custom");
        correctCustomXY(grp, custom);

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gDragType = "";
}

function eResizeCustomMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    gDragType = "eResize";
    var svgEl = gSvg.select("#" + grp + gDragType);

    var selected = gSvg.select("#" + grp + "selected");

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);
    svgEl.data("mousedown-h", parseInt(selected.attr("height"), 10));
    svgEl.data("mousedown-w", parseInt(selected.attr("width"), 10));

    svgEl.addClass("toFront");

    setRatioAry(grp);

    gDrawArea.onmousemove = eResizeCustomMouseMove;
    gDrawArea.onmouseup = eResizeCustomMouseUp;
}

function eResizeCustomMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);
    var h = (parseInt(svgEl.data('mousedown-h')) || 0);
    var w = (parseInt(svgEl.data('mousedown-w')) || 0);


    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var newWidth = w + dx;
    if (newWidth < RECT_WIDTH) {
        return;
    }

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    svgEl.transform(myMatrix);

    var newX;
    var selected = gSvg.select("#" + gCurrent + "selected");
    selected.attr("width", newWidth);
    newX = selected.getBBox().x;

    var custom = gSvg.select("#" + gCurrent + "custom");
    var pathStr = custom.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;

    var newPath = "";
    for (var i = 0; i < pathLen; i++) {

        var act = pathAry[i][0];

        if ("Z" != act.toUpperCase()) {
            //var lineToX = pathAry[i][1];
            var lineToY = pathAry[i][2];

            newPath += act + " ";
            newPath += newX + (gRatioAry[i][0] * newWidth) + " ";
            newPath += lineToY + " ";
        } else {
            newPath += act;
        }

    }

    custom.attr("d", newPath);

}

function eResizeCustomMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        var custom = gSvg.select("#" + gCurrent + "custom");
        correctCustomXY(grp, custom);

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gDragType = "";
}

//endregion


// region Common
function svgElMouseDown(event) {
    log("svgElMouseDown");
    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);

    setSelected(grp, gCurrent);
    gCurrent = grp;

    if (id.indexOf("rect") > 0) {
        gDragType = "rect";
    } else if (id.indexOf("connector") > 0) {
        gDragType = "connector";
    } else if (id.indexOf("ellipse") > 0) {
        gDragType = "ellipse";
    } else if (id.indexOf("line") > 0) {
        gDragType = "line";
    } else if (id.indexOf("break") > 0) {
        gDragType = "break";
    } else if (id.indexOf("brace") > 0) {
        gDragType = "brace";
    } else if (id.indexOf("image") > 0) {
        gDragType = "image";
    } else if (id.indexOf("custom") > 0) {
        gDragType = "custom";
    } else {
        gDragType = "unknown";
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    svgEl.data("mousedown-x", event.clientX);
    svgEl.data("mousedown-y", event.clientY);

    svgEl.addClass("toFront");
    //correctRectXY(grp, rect);

    gDrawArea.onmousemove = svgElMouseMove;
    gDrawArea.onmouseup = svgElMouseUp;

}

function svgElMouseMove(event) {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var svgEl = gSvg.select("#" + grp + gDragType);

    var x = (parseInt(svgEl.data('mousedown-x')) || 0);
    var y = (parseInt(svgEl.data('mousedown-y')) || 0);

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

function svgElMouseUp() {
    log("svgElMouseUp");
    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        correctXY(grp, svgEl, gDragType);

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    //gCurrent = "";
    gDragType = "";
}

function correctXY(grp, svgEl, dragType) {
    if ("rect" == dragType) {
        correctRectXY(grp, svgEl);
    } else if ("connector" == dragType) {
        correctConnectorXY(grp, svgEl);
    } else if ("ellipse" == dragType) {
        correctEllipseXY(grp, svgEl);
    } else if ("line" == dragType) {
        correctLineXY(grp, svgEl);
    } else if ("break" == dragType) {
        correctBreakXY(grp, svgEl);
    } else if ("brace" == dragType) {
        correctBraceXY(grp, svgEl);
    } else if ("image" == dragType) {
        correctImageXY(grp, svgEl);
    } else if ("custom" == dragType) {
        correctCustomXY(grp, svgEl);
    }

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

function hideElementById(elId) {

    var el = gSvg.select("#" + elId);
    hideElement(el);

}

function hideElement(el) {
    if (el) {
        el.addClass("hide");
    }
}

function showElementById(elId) {

    var el = gSvg.select("#" + elId);
    showElement(el);
}

function showElement(el) {
    if (el) {
        el.removeClass("hide");
    }
}

function reloadSvg() {
    var initGrp = "group_0000_";
    // dispatch all events
    gSvg.selectAll("rect").forEach(function (newRect) {

        //newRect.mouseover(rectMouseOver);
        //newRect.mouseout(rectMouseOut);
        newRect.mousedown(svgElMouseDown);

        newRect.node.addEventListener("contextmenu", showContextMenu);

        // resize event
        newRect.parent().selectAll("[id$='nResize']").forEach(function (nResize) {
            //nResize.mouseover(rectMouseOver);
            //nResize.mouseout(rectMouseOut);
            nResize.mousedown(nResizeMouseDown);
        });
        newRect.parent().selectAll("[id$='sResize']").forEach(function (sResize) {
            //sResize.mouseover(rectMouseOver);
            //sResize.mouseout(rectMouseOut);
            sResize.mousedown(sResizeMouseDown);
        });
        newRect.parent().selectAll("[id$='wResize']").forEach(function (wResize) {
            //wResize.mouseover(rectMouseOver);
            //wResize.mouseout(rectMouseOut);
            wResize.mousedown(wResizeMouseDown);
        });
        newRect.parent().selectAll("[id$='eResize']").forEach(function (eResize) {
            //eResize.mouseover(rectMouseOver);
            //eResize.mouseout(rectMouseOut);
            eResize.mousedown(eResizeMouseDown);
        });

        var id = newRect.attr("id");
        var grp = getGroupPrefix(id);

        if (grp > initGrp) {
            initGrp = grp;
        }

    });

    gSvg.selectAll(".myClose").forEach(function (close) {

        //close.mouseover(rectMouseOver);
        //close.mouseout(rectMouseOut);
        close.click(closeClick);

    });

    gSvg.selectAll("text").forEach(function (text) {

        text.dblclick(textDblClick);

    });

    gSvg.selectAll("[id$='connector']").forEach(function (newConn) {

        //newConn.mouseover(connectorMouseOver);
        //newConn.mouseout(connectorMouseOut);
        newConn.mousedown(svgElMouseDown);
        newConn.node.addEventListener("contextmenu", connectorContextMenu);

        var id = newConn.attr("id");
        var grp = getGroupPrefix(id);

        if (grp > initGrp) {
            initGrp = grp;
        }

        if (newConn.attr('class') == 'myConnector2') {
            reDrawPointByPath(grp, newConn, null, 'route');
        } else {
            reDrawPointByPath(grp, newConn);
        }

    });

    gSvg.selectAll("ellipse").forEach(function (newEllipse) {

        //newEllipse.mouseover(rectMouseOver);
        //newEllipse.mouseout(rectMouseOut);
        newEllipse.mousedown(svgElMouseDown);

        newEllipse.node.addEventListener("contextmenu", ellipseContextMenu);

        // resize event
        newEllipse.parent().selectAll("[id$='nResize']").forEach(function (nResize) {
            //nResize.mouseover(rectMouseOver);
            //nResize.mouseout(rectMouseOut);
            nResize.mousedown(nResizeEllipseMouseDown);
        });
        newEllipse.parent().selectAll("[id$='sResize']").forEach(function (sResize) {
            //sResize.mouseover(rectMouseOver);
            //sResize.mouseout(rectMouseOut);
            sResize.mousedown(sResizeEllipseMouseDown);
        });
        newEllipse.parent().selectAll("[id$='wResize']").forEach(function (wResize) {
            //wResize.mouseover(rectMouseOver);
            //wResize.mouseout(rectMouseOut);
            wResize.mousedown(wResizeEllipseMouseDown);
        });
        newEllipse.parent().selectAll("[id$='eResize']").forEach(function (eResize) {
            //eResize.mouseover(rectMouseOver);
            //eResize.mouseout(rectMouseOut);
            eResize.mousedown(eResizeEllipseMouseDown);
        });

        var id = newEllipse.attr("id");
        var grp = getGroupPrefix(id);

        if (grp > initGrp) {
            initGrp = grp;
        }

    });

    gSvg.selectAll("[id$='_brace']").forEach(function (newBrace) {

        //newBrace.mouseover(rectMouseOver);
        //newBrace.mouseout(rectMouseOut);
        newBrace.mousedown(svgElMouseDown);

        newBrace.node.addEventListener("contextmenu", braceContextMenu);

        // resize event
        newBrace.parent().selectAll("[id$='nResize']").forEach(function (nResize) {
            //nResize.mouseover(rectMouseOver);
            //nResize.mouseout(rectMouseOut);
            nResize.mousedown(nResizeBraceMouseDown);
        });
        newBrace.parent().selectAll("[id$='sResize']").forEach(function (sResize) {
            //sResize.mouseover(rectMouseOver);
            //sResize.mouseout(rectMouseOut);
            sResize.mousedown(sResizeBraceMouseDown);
        });

        var id = newBrace.attr("id");
        var grp = getGroupPrefix(id);

        if (grp > initGrp) {
            initGrp = grp;
        }

    });

    gSvg.selectAll("[id$='_break']").forEach(function (newBreak) {

        //newBreak.mouseover(rectMouseOver);
        //newBreak.mouseout(rectMouseOut);
        newBreak.mousedown(svgElMouseDown);

        newBreak.node.addEventListener("contextmenu", breakContextMenu);

        var id = newBreak.attr("id");
        var grp = getGroupPrefix(id);

        if (grp > initGrp) {
            initGrp = grp;
        }

    });

    gSvg.selectAll("image").forEach(function (newImage) {

        //newImage.mouseover(rectMouseOver);
        //newImage.mouseout(rectMouseOut);
        newImage.mousedown(svgElMouseDown);

        newImage.node.addEventListener("contextmenu", imageContextMenu);

        // resize event
        newImage.parent().selectAll("[id$='nResize']").forEach(function (nResize) {
            //nResize.mouseover(rectMouseOver);
            //nResize.mouseout(rectMouseOut);
            nResize.mousedown(nResizeImageMouseDown);
        });
        newImage.parent().selectAll("[id$='sResize']").forEach(function (sResize) {
            //sResize.mouseover(rectMouseOver);
            //sResize.mouseout(rectMouseOut);
            sResize.mousedown(sResizeImageMouseDown);
        });
        newImage.parent().selectAll("[id$='wResize']").forEach(function (wResize) {
            //wResize.mouseover(rectMouseOver);
            //wResize.mouseout(rectMouseOut);
            wResize.mousedown(wResizeImageMouseDown);
        });
        newImage.parent().selectAll("[id$='eResize']").forEach(function (eResize) {
            //eResize.mouseover(rectMouseOver);
            //eResize.mouseout(rectMouseOut);
            eResize.mousedown(eResizeImageMouseDown);
        });

        var id = newImage.attr("id");
        var grp = getGroupPrefix(id);

        if (grp > initGrp) {
            initGrp = grp;
        }

    });

    var grpAry = initGrp.split(SEPARATOR);
    var sn = parseInt(grpAry[1], 10);
    gSerialNo = sn + 1;
}

// document ready
document.addEventListener("DOMContentLoaded", function () {
    // do things after dom ready

    gSvg = Snap.select("#snapSvg");
    gDrawArea = document.getElementById("drawArea");
    gContextMenu = document.getElementById("context-menu");
    gContextMenu.addEventListener("mouseover", function () {
        gContextMenu.classList.add("context-menu--active");
    });

    gContextMenu.addEventListener("mouseout", function () {
        gContextMenu.classList.remove("context-menu--active");
    });

    if (!gSvg) {
        gSvg = Snap(CANVAS_WIDTH, CANVAS_HEIGHT);
        gSvg.attr("id", "snapSvg");
        gSvg.appendTo(gDrawArea);
    } else {
        reloadSvg();

    }

    gDrawArea.onmousedown = function () {
        log("gDrawArea onmousedown");
        if (gContextMenu.classList.contains("context-menu--active")) {
            return;
        }
        if (gCurrent != "" && !gTextEditing) {
            clearSelected(gCurrent);
            gCurrent = "";
        }
    }

    var bound = gSvg.node.getBoundingClientRect();
    gStartX = bound.left;//gSvg.node).position().left;
    gStartY = bound.top;

    var mainAreaBound = document.getElementById("mainArea").parentNode.getBoundingClientRect();
    //var mainAreaBound = document.getElementById("drawArea").getBoundingClientRect();
    gMenuWidth = mainAreaBound.left;
    gMenuHeight = mainAreaBound.top;
    //$(gSvg.node).position().top;


});

function setSelected(grp, grpOld) {

    clearSelected(grpOld);
    showElementById(grp + "selected");
    showElementById(grp + "close");
    showElementById(grp + "nResize");
    showElementById(grp + "sResize");
    showElementById(grp + "wResize");
    showElementById(grp + "eResize");

    gSvg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
        showElement(element);
    });

    gSvg.selectAll("[id^='" + grp + "arrow']").forEach(function (element) {
        hideElement(element);
    });

}

function clearSelected(grp) {

    gSvg.selectAll("[id$='selected'").forEach(function (element) {
        hideElement(element);
    });

    gSvg.selectAll("[id$='close'").forEach(function (element) {
        hideElement(element);
    });

    gSvg.selectAll("[id$='Resize'").forEach(function (element) {
        hideElement(element);
    });

    gSvg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
        hideElement(element);
    });

    gSvg.selectAll("[id^='" + grp + "arrow']").forEach(function (element) {
        showElement(element);
    });


}

function showContextMenu(e) {

    e.preventDefault();

    gContextMenu.classList.add("context-menu--active");
    gContextMenu.style["left"] = (e.clientX - gMenuWidth ) + "px";
    gContextMenu.style["top"] = (e.clientY - gMenuHeight) + "px";
    gGrpTmp = gCurrent;

}

function svgElRemove() {

    var r = confirm(REMOVE_CONFIRM_MSG);
    if (!r) {
        return;
    }

    if ("" != gGrpTmp) {
        var grpId = gGrpTmp + "g";
        gSvg.select("#" + grpId).remove();
        gContextMenu.classList.remove("context-menu--active");
        gGrpTmp = "";
        gCurrent = "";
    }

}

function svgElDuplicate() {

    if ("" != gGrpTmp) {
        var grpId = gGrpTmp + "g";
        var svgElClone = gSvg.select("#" + grpId).clone();
        gSvg.append(svgElClone);
    }

}

function newDraw() {
    gSvg.node.innerHTML = "";
}

function loadDraw() {
    document.getElementById("loadSvg").value = "";
    document.getElementById("loadSvg").click();
}

function performLoadSvg() {

    var file = document.getElementById("loadSvg").files[0];

    if (!file) {
        return;
    }

    var url = window.location.href;
    //var textType = /image.*/;
    //if (!file.type.match(textType)) {
    //    alert("File not supported!");
    //    document.getElementById("insertImg").value = "";
    //    return;
    //}

    var fReader = new FileReader();
    fReader.onload = function (event) {

        gSvg.node.innerHTML = event.target.result;
        reloadSvg();

    };
    fReader.readAsText(file);

}

function deleteDraw() {
    gSvg.node.innerHTML = "";
}

function log(msg) {
    if (__DEBUG_OUTPUT) {
        console.log(msg);
    }
}

function roundByDigits(num, digits) {
    var d = Math.pow(10, digits);
    return Math.round(num * d) / d;
}

function generateSelectedMark(bBox, grp, isPath) {

    var selectedId = grp + "selected";

    //var pathStr = "M " + bBox.x + " " + bBox.+ " L " + bBox.x + " " + bBox.y2 + " L " + bBox.x2 + " " + bBox.y2 + " L " + bBox.x2 + " " + bBox.y + " Z";
    //var selected = gSvg.path(pathStr);
    var add = 0;
    if (isPath) {
        add = PATH_BBOX_ADD;
    }

    var selected = gSvg.rect(bBox.x - add, bBox.y - add, bBox.width + add * 2, bBox.height + add * 2);

    selected.attr("id", selectedId);
    selected.addClass("mySelected");
    hideElementById(selectedId);

    return selected;

}

function getElementXYofBBox(bBox, elName) {

    var xy = [];

    var width = 0;
    var height = 0;
    var bBoxX = 0;
    var bBoxY = 0;

    if (bBox != null) {
        width = bBox.width;
        height = bBox.height;
        bBoxX = bBox.x;
        bBoxY = bBox.y;
    }

    if ("close" == elName) {

        xy.push(bBoxX + width - CIRCLE_R_HALF);
        xy.push(bBoxY + CIRCLE_R_HALF);

    } else if ("text" == elName) {

        xy.push(bBoxX + 10);
        xy.push(bBoxY + height / 2 + 5);

    } else if ("nResize" == elName) {

        xy.push(bBoxX + width / 2);
        xy.push(bBoxY);

    } else if ("sResize" == elName) {

        xy.push(bBoxX + width / 2);
        xy.push(bBoxY + height);

    } else if ("wResize" == elName) {

        xy.push(bBoxX);
        xy.push(bBoxY + height / 2);

    } else if ("eResize" == elName) {

        xy.push(bBoxX + width);
        xy.push(bBoxY + height / 2);

    } else if ("selected" == elName) {

        xy.push(bBoxX);
        xy.push(bBoxY);

    }

    return xy;

}
//endregion

function addDiamond() {

    var grp = getGroupPrefix(gSerialNo);
    var breakId = grp + "break";

    var myDiamond = gSvg.path("M20 0 L0 20 L20 40 L40 20 Z");
    myDiamond.addClass("myDiamond");
    myDiamond.attr("id", breakId);

    myDiamond.mouseover(connectorMouseOver);
    myDiamond.mouseout(connectorMouseOut);
    myDiamond.mousedown(svgElMouseDown);
    myDiamond.node.addEventListener("contextmenu", breakContextMenu);

    var g = gSvg.g(myDiamond);
    var grpId = grp + "g";
    g.attr("id", grpId);

    gSerialNo++;
}

//function addClippingSquare() {
//
//    var grp = getGroupPrefix(gSerialNo);
//    var breakId = grp + "break";
//
//    var myDiamond = gSvg.path("M20 0 L120 0 L120 60 L0 60 L0 20 Z");
//    myDiamond.addClass("myClippingSquare");
//    myDiamond.attr("id", breakId);
//
//    myDiamond.mouseover(connectorMouseOver);
//    myDiamond.mouseout(connectorMouseOut);
//    myDiamond.mousedown(svgElMouseDown);
//    myDiamond.node.addEventListener("contextmenu", breakContextMenu);
//
//    var g = gSvg.g(myDiamond);
//    var grpId = grp + "g";
//    g.attr("id", grpId);
//
//    gSerialNo++;
//}

