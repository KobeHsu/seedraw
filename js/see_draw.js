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

var ELLIPSE_RX = 20;
var ELLIPSE_RY = 20;

var REMOVE_CONNECTOR_MSG = "Remove this connection ?";
var REMOVE_ENDOPOINT_MSG = "Remove this node ?";
var REMOVE_RECT_MSG = "Remove this rect ?";
var REMOVE_ELLIPSE_MSG = "Remove this ellipse ?";

var gSerialNo = 0;

var gDrawArea;
var gSvg;
var gStartX;
var gStartY;
var gCurrent;
var gDragType;

//region Rect
function getElementXYofRect(bBoxX, bBoxY, elName, rectId) {

    var xy = [];
    var rect = gSvg.select("#" + rectId);

    var width = (rect == null) ? 0 : parseInt(rect.attr("width"), 10);
    var height = (rect == null) ? 0 : parseInt(rect.attr("height"), 10);

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
    newRect.mousedown(svgElMouseDown);

    newRect.node.addEventListener("contextmenu", rectContextMenu);

    var bBoxRect = newRect.getBBox();

    var closeId = grp + "close";
    var closeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "close", rectId);
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    close.mouseover(rectMouseOver);
    close.mouseout(rectMouseOut);
    close.click(closeClick);

    var nResizeId = grp + "nResize";
    var nResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "nResize", rectId);
    var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
    nResize.addClass("myNResize");
    nResize.addClass("hide");
    nResize.attr("id", nResizeId);

    nResize.mouseover(rectMouseOver);
    nResize.mouseout(rectMouseOut);
    nResize.mousedown(nResizeMouseDown);

    var sResizeId = grp + "sResize";
    var sResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "sResize", rectId);
    var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
    sResize.addClass("mySResize");
    sResize.addClass("hide");
    sResize.attr("id", sResizeId);

    sResize.mouseover(rectMouseOver);
    sResize.mouseout(rectMouseOut);
    sResize.mousedown(sResizeMouseDown);

    var wResizeId = grp + "wResize";
    var wResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "wResize", rectId);
    var wResize = gSvg.circle(wResizeXY[0], wResizeXY[1], CIRCLE_R);
    wResize.addClass("myWResize");
    wResize.addClass("hide");
    wResize.attr("id", wResizeId);

    wResize.mouseover(rectMouseOver);
    wResize.mouseout(rectMouseOut);
    wResize.mousedown(wResizeMouseDown);

    var eResizeId = grp + "eResize";
    var eResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "eResize", rectId);
    var eResize = gSvg.circle(eResizeXY[0], eResizeXY[1], CIRCLE_R);
    eResize.addClass("myEResize");
    eResize.addClass("hide");
    eResize.attr("id", eResizeId);

    eResize.mouseover(rectMouseOver);
    eResize.mouseout(rectMouseOut);
    eResize.mousedown(eResizeMouseDown);


    var textId = grp + "text";
    var textXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "text", rectId);
    var text = gSvg.text(textXY[0], textXY[1], "TEXT HERE");
    text.attr("id", textId);
    text.addClass("myLabel");

    text.dblclick(textDblClick);

    var g = gSvg.g(newRect, close, nResize, sResize, wResize, eResize, text);
    g.attr("id", grpId);

    gSerialNo++;

}

function rectContextMenu(e) {

    e.preventDefault();

    var r = confirm(REMOVE_RECT_MSG);
    if (!r) {
        return;
    }

    var grp = getGroupPrefix(this.id);
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();

    return false;

}

function rectMouseOver() {

    var grp = getGroupPrefix(this.attr("id"));

    gSvg.select("#" + grp + "close").removeClass("hide");
    gSvg.select("#" + grp + "nResize").removeClass("hide");
    gSvg.select("#" + grp + "sResize").removeClass("hide");
    gSvg.select("#" + grp + "wResize").removeClass("hide");
    gSvg.select("#" + grp + "eResize").removeClass("hide");
}

function rectMouseOut() {

    var grp = getGroupPrefix(this.attr("id"));

    gSvg.select("#" + grp + "close").addClass("hide");
    gSvg.select("#" + grp + "nResize").addClass("hide");
    gSvg.select("#" + grp + "sResize").addClass("hide");
    gSvg.select("#" + grp + "wResize").addClass("hide");
    gSvg.select("#" + grp + "eResize").addClass("hide");


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

    //var textBBox = text.getBBox();
    var textBBoxX = parseInt(text.attr("x"), 10);
    var textBBoxY = parseInt(text.attr("y"), 10);
    text.addClass("hide");

    var input = document.getElementById("rectText");
    input.value = text.innerSVG();
    input.style["left"] = (gStartX + textBBoxX) + "px";
    input.style["top"] = (gStartY + textBBoxY) + "px";
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

function nResizeMouseDown() {

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
    //correctRectXY(grp, rect);

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

    gCurrent = "";
    gDragType = "";
}

function sResizeMouseDown() {

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
    //correctRectXY(grp, rect);

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
    //rect.attr("y", event.clientY-gStartY);
    rect.attr("height", newHeight);

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

    gCurrent = "";
    gDragType = "";
}

function wResizeMouseDown() {

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
    //correctRectXY(grp, rect);

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

    gCurrent = "";
    gDragType = "";
}

function eResizeMouseDown() {

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
    //correctRectXY(grp, rect);

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
    //rect.attr("x", event.clientX-gStartX);
    rect.attr("width", newWidth);

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

    gCurrent = "";
    gDragType = "";
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

    //g.attr("transform", "");
    g.transform("translate(0 0)");

    //rect.attr("transform", "");
    var rectId = grp + "rect";
    rect.transform("translate(0 0)");
    rect.attr("x", x);
    rect.attr("y", y);

    var close = gSvg.select("#" + grp + "close");
    var closeXY = getElementXYofRect(x, y, "close", rectId);

    //close.attr("transform", "");
    close.transform("translate(0 0)");
    close.attr("cx", closeXY[0]);
    close.attr("cy", closeXY[1]);

    var nResize = gSvg.select("#" + grp + "nResize");
    var nResizeXY = getElementXYofRect(x, y, "nResize", rectId);

    nResize.transform("translate(0 0)");
    nResize.attr("cx", nResizeXY[0]);
    nResize.attr("cy", nResizeXY[1]);

    var sResize = gSvg.select("#" + grp + "sResize");
    var sResizeXY = getElementXYofRect(x, y, "sResize", rectId);

    sResize.transform("translate(0 0)");
    sResize.attr("cx", sResizeXY[0]);
    sResize.attr("cy", sResizeXY[1]);

    var wResize = gSvg.select("#" + grp + "wResize");
    var wResizeXY = getElementXYofRect(x, y, "wResize", rectId);

    wResize.transform("translate(0 0)");
    wResize.attr("cx", wResizeXY[0]);
    wResize.attr("cy", wResizeXY[1]);

    var eResize = gSvg.select("#" + grp + "eResize");
    var eResizeXY = getElementXYofRect(x, y, "eResize", rectId);

    eResize.transform("translate(0 0)");
    eResize.attr("cx", eResizeXY[0]);
    eResize.attr("cy", eResizeXY[1]);

    var text = gSvg.select("#" + grp + "text");
    var textXY = getElementXYofRect(x, y, "text", rectId);

    //text.attr("transform", "");
    text.transform("translate(0 0)");
    text.attr("x", textXY[0]);
    text.attr("y", textXY[1]);

}


//endregion


//region Ellipse
function addEllipse() {

    var grp = getGroupPrefix(gSerialNo);
    var grpId = grp + "g";
    var ellipseId = grp + "ellipse";
    var newEllipse = gSvg.ellipse(30, 30, ELLIPSE_RX, ELLIPSE_RY);
    newEllipse.addClass("myEllipse");
    newEllipse.attr("id", ellipseId);

    newEllipse.mouseover(rectMouseOver);
    newEllipse.mouseout(rectMouseOut);
    newEllipse.mousedown(svgElMouseDown);

    newEllipse.node.addEventListener("contextmenu", ellipseContextMenu);

    var bBoxEllipse = newEllipse.getBBox();

    var closeId = grp + "close";
    var closeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "close", ellipseId);
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    close.mouseover(rectMouseOver);
    close.mouseout(rectMouseOut);
    close.click(closeClick);

    var nResizeId = grp + "nResize";
    var nResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "nResize", ellipseId);
    var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
    nResize.addClass("myNResize");
    nResize.addClass("hide");
    nResize.attr("id", nResizeId);

    nResize.mouseover(rectMouseOver);
    nResize.mouseout(rectMouseOut);
    nResize.mousedown(nResizeEllipseMouseDown);

    var sResizeId = grp + "sResize";
    var sResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "sResize", ellipseId);
    var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
    sResize.addClass("mySResize");
    sResize.addClass("hide");
    sResize.attr("id", sResizeId);

    sResize.mouseover(rectMouseOver);
    sResize.mouseout(rectMouseOut);
    sResize.mousedown(sResizeEllipseMouseDown);

    var wResizeId = grp + "wResize";
    var wResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "wResize", ellipseId);
    var wResize = gSvg.circle(wResizeXY[0], wResizeXY[1], CIRCLE_R);
    wResize.addClass("myWResize");
    wResize.addClass("hide");
    wResize.attr("id", wResizeId);

    wResize.mouseover(rectMouseOver);
    wResize.mouseout(rectMouseOut);
    wResize.mousedown(wResizeEllipseMouseDown);

    var eResizeId = grp + "eResize";
    var eResizeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "eResize", ellipseId);
    var eResize = gSvg.circle(eResizeXY[0], eResizeXY[1], CIRCLE_R);
    eResize.addClass("myEResize");
    eResize.addClass("hide");
    eResize.attr("id", eResizeId);

    eResize.mouseover(rectMouseOver);
    eResize.mouseout(rectMouseOut);
    eResize.mousedown(eResizeEllipseMouseDown);


    var textId = grp + "text";
    var textXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "text", ellipseId);
    var text = gSvg.text(textXY[0], textXY[1], "TEXT HERE");
    text.attr("id", textId);
    text.addClass("myLabel");

    text.dblclick(textDblClick);

    var g = gSvg.g(newEllipse, close, nResize, sResize, wResize, eResize, text);
    g.attr("id", grpId);

    gSerialNo++;

}

function ellipseContextMenu(e) {

    e.preventDefault();

    var r = confirm(REMOVE_ELLIPSE_MSG);
    if (!r) {
        return;
    }

    var grp = getGroupPrefix(this.id);
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();

    return false;

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

    }
    //else if ("port" == elName) {
    //    xy.push(rectX + RECT_WIDTH_HALF);
    //    xy.push(rectY + RECT_HEIGHT);
    //}

    return xy;

}

function correctEllipseXY(grp, ellipse) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    if (tStrAry.length == 0) {
        return;
    }

    var cx = parseInt(tStrAry[0][1], 10);
    var cy = parseInt(tStrAry[0][2], 10);

    var nowX = parseInt(ellipse.attr("cx"), 10);
    var nowY = parseInt(ellipse.attr("cy"), 10);

    cx += nowX;
    cy += nowY;

    //g.attr("transform", "");
    g.transform("translate(0 0)");

    //rect.attr("transform", "");
    var ellipseId = grp + "ellipse";
    ellipse.transform("translate(0 0)");
    ellipse.attr("cx", cx);
    ellipse.attr("cy", cy);

    var bBoxEllipse = ellipse.getBBox();

    var close = gSvg.select("#" + grp + "close");
    var closeXY = getElementXYofEllipse(bBoxEllipse.x, bBoxEllipse.y, "close", ellipseId);

    //close.attr("transform", "");
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

    //text.attr("transform", "");
    text.transform("translate(0 0)");
    text.attr("x", textXY[0]);
    text.attr("y", textXY[1]);

}

function nResizeEllipseMouseDown() {

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

    gCurrent = "";
    gDragType = "";
}

function sResizeEllipseMouseDown() {

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

    gCurrent = "";
    gDragType = "";
}

function wResizeEllipseMouseDown() {

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

    gCurrent = "";
    gDragType = "";
}

function eResizeEllipseMouseDown() {

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
    //correctRectXY(grp, rect);

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

    gCurrent = "";
    gDragType = "";
}

//endregion

//region Boundary
function getElementXYofLine(bBoxX, bBoxY, elName, rectId) {

    var xy = [];
    var rect = gSvg.select("#" + rectId);

    var width = (rect == null) ? 0 : parseInt(rect.attr("width"), 10);
    var height = (rect == null) ? 0 : parseInt(rect.attr("height"), 10);

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

    }
    //else if ("port" == elName) {
    //    xy.push(rectX + RECT_WIDTH_HALF);
    //    xy.push(rectY + RECT_HEIGHT);
    //}

    return xy;

}

function addLine() {

    var grp = getGroupPrefix(gSerialNo);
    var grpId = grp + "g";
    var rectId = grp + "rect";
    var newRect = gSvg.rect(10, 10, RECT_WIDTH, RECT_HEIGHT, 5, 5);
    newRect.addClass("myRect");
    newRect.attr("id", rectId);

    newRect.mouseover(rectMouseOver);
    newRect.mouseout(rectMouseOut);
    newRect.mousedown(svgElMouseDown);

    newRect.node.addEventListener("contextmenu", rectContextMenu);

    var bBoxRect = newRect.getBBox();

    var closeId = grp + "close";
    var closeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "close", rectId);
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    close.mouseover(rectMouseOver);
    close.mouseout(rectMouseOut);
    close.click(closeClick);

    var nResizeId = grp + "nResize";
    var nResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "nResize", rectId);
    var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
    nResize.addClass("myNResize");
    nResize.addClass("hide");
    nResize.attr("id", nResizeId);

    nResize.mouseover(rectMouseOver);
    nResize.mouseout(rectMouseOut);
    nResize.mousedown(nResizeMouseDown);

    var sResizeId = grp + "sResize";
    var sResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "sResize", rectId);
    var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
    sResize.addClass("mySResize");
    sResize.addClass("hide");
    sResize.attr("id", sResizeId);

    sResize.mouseover(rectMouseOver);
    sResize.mouseout(rectMouseOut);
    sResize.mousedown(sResizeMouseDown);

    var wResizeId = grp + "wResize";
    var wResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "wResize", rectId);
    var wResize = gSvg.circle(wResizeXY[0], wResizeXY[1], CIRCLE_R);
    wResize.addClass("myWResize");
    wResize.addClass("hide");
    wResize.attr("id", wResizeId);

    wResize.mouseover(rectMouseOver);
    wResize.mouseout(rectMouseOut);
    wResize.mousedown(wResizeMouseDown);

    var eResizeId = grp + "eResize";
    var eResizeXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "eResize", rectId);
    var eResize = gSvg.circle(eResizeXY[0], eResizeXY[1], CIRCLE_R);
    eResize.addClass("myEResize");
    eResize.addClass("hide");
    eResize.attr("id", eResizeId);

    eResize.mouseover(rectMouseOver);
    eResize.mouseout(rectMouseOut);
    eResize.mousedown(eResizeMouseDown);


    var textId = grp + "text";
    var textXY = getElementXYofRect(bBoxRect.x, bBoxRect.y, "text", rectId);
    var text = gSvg.text(textXY[0], textXY[1], "TEXT HERE");
    text.attr("id", textId);
    text.addClass("myLabel");

    text.dblclick(textDblClick);

    var g = gSvg.g(newRect, close, nResize, sResize, wResize, eResize, text);
    g.attr("id", grpId);

    gSerialNo++;

}

function lineContextMenu(e) {

    e.preventDefault();

    var r = confirm(REMOVE_RECT_MSG);
    if (!r) {
        return;
    }

    var grp = getGroupPrefix(this.id);
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();

    return false;

}

//endregion

//region Common
function svgElMouseDown(event) {

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;

    if (id.indexOf("rect") > 0) {
        gDragType = "rect";
    } else if (id.indexOf("connector") > 0) {
        gDragType = "connector";
    } else if (id.indexOf("ellipse") > 0) {
        gDragType = "ellipse";
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

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var svgEl = gSvg.select("#" + gCurrent + gDragType);
        svgEl.removeClass("toFront");

        correctXY(grp, svgEl, gDragType);

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrent = "";
    gDragType = "";
}

function correctXY(grp, svgEl, dragType) {
    if ("rect" == dragType) {
        correctRectXY(grp, svgEl);
    } else if ("connector" == dragType) {
        correctConnectorXY(grp, svgEl);
    } else if ("ellipse" == dragType) {
        correctEllipseXY(grp, svgEl);
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

document.addEventListener("DOMContentLoaded", function () {
    // do things after dom ready

    gSvg = Snap.select("#snapSvg");
    gDrawArea = document.getElementById("drawArea");

    if (!gSvg) {
        gSvg = Snap(CANVAS_WIDTH, CANVAS_HEIGHT);
        gSvg.appendTo(gDrawArea);
    } else {

        var initGrp = "group_0000_";
        // dispatch all events
        gSvg.selectAll("rect").forEach(function (newRect) {

            newRect.mouseover(rectMouseOver);
            newRect.mouseout(rectMouseOut);
            newRect.mousedown(svgElMouseDown);

            var id = newRect.attr("id");
            var grp = getGroupPrefix(id);

            if (grp > initGrp) {
                initGrp = grp;
            }

        });

        gSvg.selectAll(".myClose").forEach(function (close) {

            close.mouseover(rectMouseOver);
            close.mouseout(rectMouseOut);
            close.click(closeClick);

        });

        gSvg.selectAll("text").forEach(function (text) {

            text.dblclick(textDblClick);

        });

        gSvg.selectAll("[id$='connector']").forEach(function (newConn) {

            newConn.mouseover(connectorMouseOver);
            newConn.mouseout(connectorMouseOut);
            newConn.mousedown(svgElMouseDown);
            newConn.node.addEventListener("contextmenu", connectorContextMenu);

            var id = newConn.attr("id");
            var grp = getGroupPrefix(id);

            if (grp > initGrp) {
                initGrp = grp;
            }

            reDrawPointByPath(grp, newConn);

        });

        var grpAry = initGrp.split(SEPARATOR);
        var sn = parseInt(grpAry[1], 10);
        gSerialNo = sn + 1;
        //gSvg.selectAll(".myEndPoint").forEach(function (newConn) {
        //
        //    endPoint.mouseover(connectorMouseOver);
        //    endPoint.mouseout(connectorMouseOut);
        //    endPoint.mousedown(endPointMouseDown);
        //
        //});
        //
        //gSvg.selectAll(".myEndPoint").forEach(function (newConn) {
        //
        //    endPoint.mouseover(connectorMouseOver);
        //    endPoint.mouseout(connectorMouseOut);
        //    endPoint.mousedown(endPointMouseDown);
        //
        //});

    }

    var bound = gSvg.node.getBoundingClientRect()
    gStartX = bound.left;//gSvg.node).position().left;
    gStartY = bound.top;
//$(gSvg.node).position().top;

})
;
//endregion

