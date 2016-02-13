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

var REMOVE_CONNECTOR_MSG = "Remove this connection ?";
var REMOVE_ENDOPOINT_MSG = "Remove this node ?";
var REMOVE_RECT_MSG = "Remove this rect ?";
var REMOVE_ELLIPSE_MSG = "Remove this ellipse ?";
var REMOVE_LINE_MSG = "Remove this boundary ?";
var REMOVE_BREAK_MSG = "Remove this breakdown ?";
var REMOVE_BRACE_MSG = "Remove this brace ?";
var REMOVE_IMAGE_MSG = "Remove this image ?";

var gSerialNo = 0;

var gDrawArea;
var gSvg;
var gStartX;
var gStartY;
var gCurrent;
var gDragType;

var gMenuWidth;
var gMenuHeight;

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

    } else if ("selected" == elName) {

        xy.push(bBoxX);
        xy.push(bBoxY);

    }

    return xy;

}

function setSelectedMark(bBox, grp) {

    var selectedId = grp + "selected";

    //var pathStr = "M " + bBox.x + " " + bBox.+ " L " + bBox.x + " " + bBox.y2 + " L " + bBox.x2 + " " + bBox.y2 + " L " + bBox.x2 + " " + bBox.y + " Z";
    //var selected = gSvg.path(pathStr);

    var selected = gSvg.rect(bBox.x, bBox.y, bBox.width, bBox.height);

    selected.attr("id", selectedId);
    selected.addClass("mySelected");
    hideElement(selectedId);

    return selected;

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

    newRect.node.addEventListener("contextmenu", rectContextMenu);

    var bBoxRect = newRect.getBBox();
    var selected = setSelectedMark(bBoxRect, grp);

    selected.mouseover(rectMouseOver);
    selected.mouseout(rectMouseOut);
    selected.mousedown(function (e) {
        e.stopPropagation();
        var event = new MouseEvent('mousedown', {
                'clientX': e.clientX,
                'clientY': e.clientY
            })
            ;
        newRect.node.dispatchEvent(event);
    });

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
    var text = gSvg.text(textXY[0], textXY[1], "Label");
    text.attr("id", textId);
    text.addClass("myLabel");
    if ("noLabel" == type) {
        text.addClass("hide");
    }

    text.dblclick(textDblClick);

    var g = gSvg.g(newRect, close, nResize, sResize, wResize, eResize, text, selected);
    g.attr("id", grpId);

    gSerialNo++;

    clearSelected();
    showElement(selected.attr("id"));
    gCurrent = grp;

}

function rectContextMenu(e) {

    //e.preventDefault();
    //
    //var r = confirm(REMOVE_RECT_MSG);
    //if (!r) {
    //    return;
    //}
    //
    //var grp = getGroupPrefix(this.id);
    //var grpId = grp + "g";
    //gSvg.select("#" + grpId).remove();

    return false;

}

function rectMouseOver() {

    var grp = getGroupPrefix(this.attr("id"));

    showElement(grp + "close");
    showElement(grp + "nResize");
    showElement(grp + "sResize");
    showElement(grp + "wResize");
    showElement(grp + "eResize");

}

function rectMouseOut() {

    var grp = getGroupPrefix(this.attr("id"));

    hideElement(grp + "close");
    hideElement(grp + "nResize");
    hideElement(grp + "sResize");
    hideElement(grp + "wResize");
    hideElement(grp + "eResize");

}

function closeClick(e) {

    e.stopPropagation();

    var r = confirm(REMOVE_RECT_MSG);
    if (!r) {
        return;
    }

    var grp = getGroupPrefix(this.attr("id"));
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();

}

function textDblClick(event) {

    event.stopPropagation();

    var grp = getGroupPrefix(this.attr("id"));
    gCurrent = grp;
    var text = gSvg.select("#" + grp + "text");

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
        textWidth = textBBox.width;

        text.attr("x", parseInt(line.attr("x1"), 10) - textWidth - 10);
        //text.attr("y", textXY[1]);

    }

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

    newEllipse.node.addEventListener("contextmenu", ellipseContextMenu);

    var bBoxEllipse = newEllipse.getBBox();
    var selected = setSelectedMark(bBoxEllipse, grp);

    selected.mouseover(rectMouseOver);
    selected.mouseout(rectMouseOut);
    selected.mousedown(function (e) {
        e.stopPropagation();
        var event = new MouseEvent('mousedown', {
                'clientX': e.clientX,
                'clientY': e.clientY
            })
            ;
        newEllipse.node.dispatchEvent(event);
    });

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
    var text = gSvg.text(textXY[0], textXY[1], "Label");
    text.attr("id", textId);
    text.addClass("myLabel");

    text.dblclick(textDblClick);

    var g = gSvg.g(newEllipse, close, nResize, sResize, wResize, eResize, text, selected);
    g.attr("id", grpId);

    gSerialNo++;

}

function ellipseContextMenu(e) {

    //e.preventDefault();
    //
    //var r = confirm(REMOVE_ELLIPSE_MSG);
    //if (!r) {
    //    return;
    //}
    //
    //var grp = getGroupPrefix(this.id);
    //var grpId = grp + "g";
    //gSvg.select("#" + grpId).remove();

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

    newBrace.mouseover(rectMouseOver);
    newBrace.mouseout(rectMouseOut);
    newBrace.mousedown(svgElMouseDown);

    newBrace.node.addEventListener("contextmenu", braceContextMenu);

    var bBoxBrace = newBrace.getBBox();

    var nResizeId = grp + "nResize";
    var nResizeXY = getElementXYofBrace(bBoxBrace.x, bBoxBrace.y, "nResize", braceId);
    var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
    nResize.addClass("myNResize");
    nResize.addClass("hide");
    nResize.attr("id", nResizeId);

    nResize.mouseover(rectMouseOver);
    nResize.mouseout(rectMouseOut);
    nResize.mousedown(nResizeBraceMouseDown);

    var sResizeId = grp + "sResize";
    var sResizeXY = getElementXYofBrace(bBoxBrace.x, bBoxBrace.y, "sResize", braceId);
    var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
    sResize.addClass("mySResize");
    sResize.addClass("hide");
    sResize.attr("id", sResizeId);

    sResize.mouseover(rectMouseOver);
    sResize.mouseout(rectMouseOut);
    sResize.mousedown(sResizeBraceMouseDown);

    var g = gSvg.g(newBrace, nResize, sResize);
    g.attr("id", grpId);

    gSerialNo++;

}

function braceContextMenu(e) {

    e.preventDefault();

    var r = confirm(REMOVE_BRACE_MSG);
    if (!r) {
        return;
    }

    var grp = getGroupPrefix(this.id);
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();

    return false;

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

}

function nResizeBraceMouseDown() {

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

    gCurrent = "";
    gDragType = "";
}

function sResizeBraceMouseDown() {

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

    gCurrent = "";
    gDragType = "";
}
//endregion

//region BreakDown
function addBreak() {

    var grp = getGroupPrefix(gSerialNo);
    var breakId = grp + "break";

    var newBreak = gSvg.path("M0 0 L50 50 L30 50 L90 100 L40 50 Z");
    newBreak.addClass("myBreak");
    newBreak.attr("id", breakId);

    newBreak.mouseover(connectorMouseOver);
    newBreak.mouseout(connectorMouseOut);
    newBreak.mousedown(svgElMouseDown);
    newBreak.node.addEventListener("contextmenu", breakContextMenu);

    var g = gSvg.g(newBreak);
    var grpId = grp + "g";
    g.attr("id", grpId);

    gSerialNo++;
}

function breakContextMenu(e) {

    e.preventDefault();

    var r = confirm(REMOVE_BREAK_MSG);
    if (!r) {
        return;
    }

    var grp = getGroupPrefix(this.id);
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();

    return false;

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

    }

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

        newImage.mouseover(rectMouseOver);
        newImage.mouseout(rectMouseOut);
        newImage.mousedown(svgElMouseDown);

        newImage.node.addEventListener("contextmenu", imageContextMenu);
        newImage.node.addEventListener("load",

            function () {

                var nResizeId = grp + "nResize";
                var nResizeXY = getElementXYofImage("nResize", imageId);
                var nResize = gSvg.circle(nResizeXY[0], nResizeXY[1], CIRCLE_R);
                nResize.addClass("myNResize");
                nResize.addClass("hide");
                nResize.attr("id", nResizeId);

                nResize.mouseover(rectMouseOver);
                nResize.mouseout(rectMouseOut);
                nResize.mousedown(nResizeImageMouseDown);

                var sResizeId = grp + "sResize";
                var sResizeXY = getElementXYofImage("sResize", imageId);
                var sResize = gSvg.circle(sResizeXY[0], sResizeXY[1], CIRCLE_R);
                sResize.addClass("mySResize");
                sResize.addClass("hide");
                sResize.attr("id", sResizeId);

                sResize.mouseover(rectMouseOver);
                sResize.mouseout(rectMouseOut);
                sResize.mousedown(sResizeImageMouseDown);

                var wResizeId = grp + "wResize";
                var wResizeXY = getElementXYofImage("wResize", imageId);
                var wResize = gSvg.circle(wResizeXY[0], wResizeXY[1], CIRCLE_R);
                wResize.addClass("myWResize");
                wResize.addClass("hide");
                wResize.attr("id", wResizeId);

                wResize.mouseover(rectMouseOver);
                wResize.mouseout(rectMouseOut);
                wResize.mousedown(wResizeImageMouseDown);

                var eResizeId = grp + "eResize";
                var eResizeXY = getElementXYofImage("eResize", imageId);
                var eResize = gSvg.circle(eResizeXY[0], eResizeXY[1], CIRCLE_R);
                eResize.addClass("myEResize");
                eResize.addClass("hide");
                eResize.attr("id", eResizeId);

                eResize.mouseover(rectMouseOver);
                eResize.mouseout(rectMouseOut);
                eResize.mousedown(eResizeImageMouseDown);

                var g = gSvg.g(newImage, nResize, sResize, wResize, eResize);
                var grpId = grp + "g";
                g.attr("id", grpId);

            });

        gSerialNo++;

    };
    fReader.readAsDataURL(file);

}

function imageContextMenu(e) {

    e.preventDefault();

    var r = confirm(REMOVE_IMAGE_MSG);
    if (!r) {
        return;
    }

    var grp = getGroupPrefix(this.id);
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();

    return false;

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

}

function nResizeImageMouseDown() {

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

    gCurrent = "";
    gDragType = "";
}

function sResizeImageMouseDown() {

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

    gCurrent = "";
    gDragType = "";
}

function wResizeImageMouseDown() {

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

    gCurrent = "";
    gDragType = "";
}

function eResizeImageMouseDown() {

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

    gCurrent = "";
    gDragType = "";
}
// endregion

// region Common
function svgElMouseDown(event) {

    event.stopPropagation();

    var id = this.attr("id");
    var grp = getGroupPrefix(id);
    gCurrent = grp;
    showElement(gCurrent + "selected");

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


function hideElement(elId) {

    var el = gSvg.select("#" + elId);
    if (el) {
        el.addClass("hide");
    }

}

function showElement(elId) {

    var el = gSvg.select("#" + elId);
    if (el) {
        el.removeClass("hide");
    }

}

function reloadSvg() {
    var initGrp = "group_0000_";
    // dispatch all events
    gSvg.selectAll("rect").forEach(function (newRect) {

        newRect.mouseover(rectMouseOver);
        newRect.mouseout(rectMouseOut);
        newRect.mousedown(svgElMouseDown);

        newRect.node.addEventListener("contextmenu", rectContextMenu);

        // resize event
        newRect.parent().selectAll("[id$='nResize']").forEach(function (nResize) {
            nResize.mouseover(rectMouseOver);
            nResize.mouseout(rectMouseOut);
            nResize.mousedown(nResizeMouseDown);
        });
        newRect.parent().selectAll("[id$='sResize']").forEach(function (sResize) {
            sResize.mouseover(rectMouseOver);
            sResize.mouseout(rectMouseOut);
            sResize.mousedown(sResizeMouseDown);
        });
        newRect.parent().selectAll("[id$='wResize']").forEach(function (wResize) {
            wResize.mouseover(rectMouseOver);
            wResize.mouseout(rectMouseOut);
            wResize.mousedown(wResizeMouseDown);
        });
        newRect.parent().selectAll("[id$='eResize']").forEach(function (eResize) {
            eResize.mouseover(rectMouseOver);
            eResize.mouseout(rectMouseOut);
            eResize.mousedown(eResizeMouseDown);
        });

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

        if (newConn.attr('class') == 'myConnector2') {
            reDrawPointByPath(grp, newConn, null, 'route');
        } else {
            reDrawPointByPath(grp, newConn);
        }

    });

    gSvg.selectAll("ellipse").forEach(function (newEllipse) {

        newEllipse.mouseover(rectMouseOver);
        newEllipse.mouseout(rectMouseOut);
        newEllipse.mousedown(svgElMouseDown);

        newEllipse.node.addEventListener("contextmenu", ellipseContextMenu);

        // resize event
        newEllipse.parent().selectAll("[id$='nResize']").forEach(function (nResize) {
            nResize.mouseover(rectMouseOver);
            nResize.mouseout(rectMouseOut);
            nResize.mousedown(nResizeEllipseMouseDown);
        });
        newEllipse.parent().selectAll("[id$='sResize']").forEach(function (sResize) {
            sResize.mouseover(rectMouseOver);
            sResize.mouseout(rectMouseOut);
            sResize.mousedown(sResizeEllipseMouseDown);
        });
        newEllipse.parent().selectAll("[id$='wResize']").forEach(function (wResize) {
            wResize.mouseover(rectMouseOver);
            wResize.mouseout(rectMouseOut);
            wResize.mousedown(wResizeEllipseMouseDown);
        });
        newEllipse.parent().selectAll("[id$='eResize']").forEach(function (eResize) {
            eResize.mouseover(rectMouseOver);
            eResize.mouseout(rectMouseOut);
            eResize.mousedown(eResizeEllipseMouseDown);
        });

        var id = newEllipse.attr("id");
        var grp = getGroupPrefix(id);

        if (grp > initGrp) {
            initGrp = grp;
        }

    });

    gSvg.selectAll("[id$='_brace']").forEach(function (newBrace) {

        newBrace.mouseover(rectMouseOver);
        newBrace.mouseout(rectMouseOut);
        newBrace.mousedown(svgElMouseDown);

        newBrace.node.addEventListener("contextmenu", braceContextMenu);

        // resize event
        newBrace.parent().selectAll("[id$='nResize']").forEach(function (nResize) {
            nResize.mouseover(rectMouseOver);
            nResize.mouseout(rectMouseOut);
            nResize.mousedown(nResizeBraceMouseDown);
        });
        newBrace.parent().selectAll("[id$='sResize']").forEach(function (sResize) {
            sResize.mouseover(rectMouseOver);
            sResize.mouseout(rectMouseOut);
            sResize.mousedown(sResizeBraceMouseDown);
        });

        var id = newBrace.attr("id");
        var grp = getGroupPrefix(id);

        if (grp > initGrp) {
            initGrp = grp;
        }

    });

    gSvg.selectAll("[id$='_break']").forEach(function (newBreak) {

        newBreak.mouseover(rectMouseOver);
        newBreak.mouseout(rectMouseOut);
        newBreak.mousedown(svgElMouseDown);

        newBreak.node.addEventListener("contextmenu", breakContextMenu);

        var id = newBreak.attr("id");
        var grp = getGroupPrefix(id);

        if (grp > initGrp) {
            initGrp = grp;
        }

    });

    gSvg.selectAll("image").forEach(function (newImage) {

        newImage.mouseover(rectMouseOver);
        newImage.mouseout(rectMouseOut);
        newImage.mousedown(svgElMouseDown);

        newImage.node.addEventListener("contextmenu", imageContextMenu);

        // resize event
        newImage.parent().selectAll("[id$='nResize']").forEach(function (nResize) {
            nResize.mouseover(rectMouseOver);
            nResize.mouseout(rectMouseOut);
            nResize.mousedown(nResizeImageMouseDown);
        });
        newImage.parent().selectAll("[id$='sResize']").forEach(function (sResize) {
            sResize.mouseover(rectMouseOver);
            sResize.mouseout(rectMouseOut);
            sResize.mousedown(sResizeImageMouseDown);
        });
        newImage.parent().selectAll("[id$='wResize']").forEach(function (wResize) {
            wResize.mouseover(rectMouseOver);
            wResize.mouseout(rectMouseOut);
            wResize.mousedown(wResizeImageMouseDown);
        });
        newImage.parent().selectAll("[id$='eResize']").forEach(function (eResize) {
            eResize.mouseover(rectMouseOver);
            eResize.mouseout(rectMouseOut);
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

document.addEventListener("DOMContentLoaded", function () {
    // do things after dom ready

    gSvg = Snap.select("#snapSvg");
    gDrawArea = document.getElementById("drawArea");

    if (!gSvg) {
        gSvg = Snap(CANVAS_WIDTH, CANVAS_HEIGHT);
        gSvg.attr("id", "snapSvg");
        gSvg.appendTo(gDrawArea);
    } else {
        reloadSvg();

    }

    gDrawArea.onmousedown = function () {
        if (gCurrent != "") {
            clearSelected();
            gCurrent = "";
        }
    }

    var bound = gSvg.node.getBoundingClientRect()
    gStartX = bound.left;//gSvg.node).position().left;
    gStartY = bound.top;

    var mainAreaBound = document.getElementById("mainArea").parentNode.getBoundingClientRect();
    //var mainAreaBound = document.getElementById("drawArea").getBoundingClientRect();
    gMenuWidth = mainAreaBound.left;
    gMenuHeight = mainAreaBound.top;
    //$(gSvg.node).position().top;


});

function clearSelected() {

    gSvg.selectAll("[id$='selected'").forEach(function (element) {
        hideElement(element.attr("id"));
    });


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

function addClippingSquare() {

    var grp = getGroupPrefix(gSerialNo);
    var breakId = grp + "break";

    var myDiamond = gSvg.path("M20 0 L120 0 L120 60 L0 60 L0 20 Z");
    myDiamond.addClass("myClippingSquare");
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


function addCustomPath() {

}