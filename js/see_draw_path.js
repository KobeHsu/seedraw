//function getElementXYofConn(bBox, elName) {
//
//    var xy = [];
//
//    if ("close" == elName) {
//        xy.push(bBox.x2);
//        xy.push(bBox.y2 - 3 * CIRCLE_R);
//    }
//
//    return xy;
//
//}

function addConnector(type) {

    var grp = getGroupPrefix(gSerialNo);
    var connectorId = grp + "connector";

    var newConn = gSvg.path("M 10 60 L 110 60");
    if ('route' == type) {
        newConn.addClass("myConnector2");
    } else {
        newConn.addClass("myConnector");
    }
    newConn.attr("id", connectorId);

    //newConn.mouseover(connectorMouseOver);
    //newConn.mouseout(connectorMouseOut);
    //newConn.mousedown(svgElMouseDown);
    //newConn.node.addEventListener("contextmenu", showContextMenu);

    var bBoxConn = newConn.getBBox();
    var selected = generateSelectedMark(bBoxConn, grp, true);

    var closeId = grp + "close";
    var closeXY = getElementXYofConn(selected.getBBox(), "close");
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    //close.mousedown(closeClick);

    var len = newConn.getTotalLength();
    var targetPoint = newConn.getPointAtLength(len / 2);
    //var textId = grp + "text";
    //var textXY = getElementXYofConn(selected.getBBox(), "text", targetPoint.x - 20, targetPoint.y - 20);
    //var text = gSvg.text(textXY[0], textXY[1], "Label");
    //text.attr("id", textId);
    //text.addClass("myLabel");
    var labelXY = getElementXYofConn(selected.getBBox(), "text", targetPoint.x - 20, targetPoint.y - 20);
    var label = initLabelForElement(bBoxConn, grp, labelXY[0], labelXY[1]);

    //newConn.dblclick(textDblClick);

    var g = gSvg.g(newConn, close, selected, label);
    var grpId = grp + "g";
    g.attr("id", grpId);
    g.attr("type", type);

    reDrawPointByPath(grp, newConn, g);

    registerListener(connectorId);

    gSerialNo++;

    setSelected(grp);
    gCurrent = grp;
}

function getElementXYofConn(bBox, elName) {

    var xy = [];

    var width = (bBox == null) ? 0 : bBox.width;
    var height = (bBox == null) ? 0 : bBox.height;

    if ("close" == elName) {

        xy.push(bBox.x + width - CIRCLE_R_HALF);
        xy.push(bBox.y + CIRCLE_R_HALF);

    } else if ("text" == elName) {

        xy.push(bBox.x + 10);
        xy.push(bBox.y + height / 2 + 5);

    }

    return xy;

}

//function connectorMouseOver(grp) {
//
//    //var grp = getGroupPrefix(this.attr("id"));
//
//    gSvg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
//        element.removeClass("hide");
//    });
//
//    gSvg.selectAll("[id^='" + grp + "arrow']").forEach(function (element) {
//        element.addClass("hide");
//    });
//
//}
//
//function connectorMouseOut(grp) {
//
//    //var grp = getGroupPrefix(this.attr("id"));
//
//    gSvg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
//        element.addClass("hide");
//    });
//
//    gSvg.selectAll("[id^='" + grp + "arrow']").forEach(function (element) {
//        element.removeClass("hide");
//    });
//
//}

function correctConnectorXY(grp, conn) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    if (tStrAry.length == 0) {
        return;
    }

    var x = parseInt(tStrAry[0][1], 10);
    var y = parseInt(tStrAry[0][2], 10);

    //g.attr("transform", "");
    g.transform("translate(0 0)");

    var pathStr = conn.attr("d");
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
    //pathAry.forEach(function (p) {
    //    newPath += p[0] + " ";
    //    newPath += p[1] + " ";
    //    newPath += p[2] + " ";
    //});

    var deg = Snap.angle(lastSubPath[2], lastSubPath[3], lastSubPath[0], lastSubPath[1]);
    var m = Snap.matrix();
    m.rotate(deg, lastSubPath[2], lastSubPath[3]);

    //conn.attr("transform", "");
    conn.transform("translate(0 0)");
    conn.attr("d", newPath);

    var len = conn.getTotalLength();
    var targetPoint = conn.getPointAtLength(len / 2);
    //var text = gSvg.select("[id^='" + grp + "text']");
    //var textXY = getElementXYofRect(targetPoint.x - 20, targetPoint.y - 20, "text");
    //text.attr("x", textXY[0]);
    //text.attr("y", textXY[1]);
    var labelXY = getElementXYofRect(targetPoint.x - 20, targetPoint.y - 20, "text");
    var label = gSvg.select("[id^='" + grp + "label']");
    label.attr("x", labelXY[0]);
    label.attr("y", labelXY[1]);
    //text.dblclick(textDblClick);

    // handle arrow
    if ("undirected" !== g.attr("type")) {

        var arrow = gSvg.select("[id^='" + grp + "arrow']");

        var _pathStr = arrow.attr("d");
        var _pathAry = Snap.parsePathString(_pathStr);

        _pathAry.forEach(function (p) {
            p[1] = parseInt(p[1]) + x;
            p[2] = parseInt(p[2]) + y;
        });

        var _newPath = "";
        _pathAry.forEach(function (p) {
            _newPath += p[0] + " ";
            if ("Z" != p[0]) {
                _newPath += p[1] + " ";
                _newPath += p[2] + " ";
            }
        });

        //element.attr("transform", "");
        arrow.attr("d", _newPath);
        arrow.transform(m);

    }

    gSvg.selectAll("[id^='" + grp + "point'").forEach(function (element) {
        var cx = parseInt(element.attr("cx"), 10);
        var cy = parseInt(element.attr("cy"), 10);
        //element.attr("transform", "");
        element.transform("translate(0 0)");
        element.attr("cx", cx + x);
        element.attr("cy", cy + y);
    });

    var selected = gSvg.select("#" + grp + "selected");
    var bBoxConn = conn.getBBox();

    selected.transform("translate(0 0)");
    selected.attr("x", bBoxConn.x - PATH_BBOX_ADD);
    selected.attr("y", bBoxConn.y - PATH_BBOX_ADD);
    selected.attr("width", bBoxConn.width + PATH_BBOX_ADD * 2);
    selected.attr("height", bBoxConn.height + PATH_BBOX_ADD * 2);

    var close = gSvg.select("#" + grp + "close");
    var closeXY = getElementXYofConn(selected.getBBox(), "close");

    close.transform("translate(0 0)");
    close.attr("cx", closeXY[0]);
    close.attr("cy", closeXY[1]);

}

function endPointMouseDown(event) {

    log("endPointMouseDown");

    event.stopPropagation();

    gGrpTmp = gCurrent;
    gCurrent = this.attr("id");

    var midPoint = gSvg.select("#" + gCurrent);

    midPoint.data("mousedown-x", event.clientX);
    midPoint.data("mousedown-y", event.clientY);

    //var grp = getGroupPrefix(gCurrent);
    //var conn = gSvg.select("#" + grp + "connector");
    //conn.unmouseout(connectorMouseOut);
    //midPoint.unmouseout(connectorMouseOut);
    midPoint.addClass("toFront");

    //gSvg.selectAll("[id^='" + grp + "point_mid']").forEach(function (element) {
    //    element.remove();
    //});

    gDrawArea.onmousemove = endPointMouseMove;
    gDrawArea.onmouseup = endPointMouseUp;

}

function endPointMouseMove() {

    log("endPointMouseMove");

    if ("" == gCurrent) {
        return;
    }

    var midPoint = gSvg.select("#" + gCurrent);

    var x = event.clientX - gStartX;
    var y = event.clientY - gStartY;

    midPoint.attr("cx", x);
    midPoint.attr("cy", y);

    var idx = parseInt(gCurrent.substr(gCurrent.lastIndexOf(SEPARATOR) + 1), 10);


    var grp = getGroupPrefix(gCurrent);
    var conn = gSvg.select("#" + grp + "connector");
    var pathStr = conn.attr("d");
    var pathAry = Snap.parsePathString(pathStr);

    var isMidPoint = (gCurrent.indexOf("_mid_") > 0);
    if (!isMidPoint) {
        pathAry[idx][1] = x;
        pathAry[idx][2] = y;
    } else {

        gSvg.selectAll("[id^='" + grp + "point_end']").forEach(function (element) {
            var id = element.attr("id");
            var _idx = parseInt(id.substr(id.lastIndexOf(SEPARATOR) + 1), 10);
            if (_idx > idx) {
                element.attr("id", grp + "point_end_" + (_idx + 1));
            }
        });
        var newId = grp + "point_end_" + (idx + 1);
        midPoint.attr("id", newId);
        gCurrent = newId;
    }

    var newPath = "";

    for (var i = 0; i < pathAry.length; i++) {

        newPath += pathAry[i][0] + " ";
        newPath += pathAry[i][1] + " ";
        newPath += pathAry[i][2] + " ";

        if (isMidPoint && i == idx) {
            newPath += "L" + " ";
            newPath += x + " ";
            newPath += y + " ";
        }

    }

    //pathAry.forEach(function (p) {
    //    newPath += p[0] + " ";
    //    newPath += p[1] + " ";
    //    newPath += p[2] + " ";
    //});

    conn.attr("d", newPath);

}

function endPointMouseUp() {

    log("endPointMouseUp");

    if ("" != gCurrent) {

        var midPoint = gSvg.select("#" + gCurrent);

        var x = midPoint.data("mousedown-x");
        var y = midPoint.data("mousedown-y");

        //if (x != event.clientX || y != event.clientY) {
        //    //endPointRemove(midPoint.attr("id"));
        //    if (gCurrent.indexOf("_mid_")>0) {
        //        midPointMouseDown(gCurrent);
        //    }
        //}

        midPoint.removeClass("toFront");

        var grp = getGroupPrefix(gCurrent);
        var conn = gSvg.select("#" + grp + "connector");
        //conn.mouseout(connectorMouseOut);
        //midPoint.mouseout(connectorMouseOut);
        reDrawPointByPath(grp, conn);
    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrent = gGrpTmp;
    setSelected(gCurrent);

}

function endPointRemove() {

    var id = targetMidPointId;

    if (id.indexOf("point") < 0) {
        return;
    }

    var r = confirm(REMOVE_ENDOPOINT_MSG);
    if (!r) {
        return;
    }

    var idx = parseInt(id.substr(id.lastIndexOf(SEPARATOR) + 1), 10);

    var grp = getGroupPrefix(id);

    var totalEndPoints = gSvg.selectAll("[id^='" + grp + "point_end']").length;
    if (totalEndPoints == 2) {
        alert("At lease 2 points");
        return;
    }

    var conn = gSvg.select("#" + grp + "connector");

    var pathStr = conn.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var newPath = "";

    var first = true;
    for (var i = 0; i < pathAry.length; i++) {

        if (idx != i) {

            if (idx == 0 && first) {
                newPath += "M ";
                first = false;
            } else {
                newPath += pathAry[i][0] + " ";
            }
            newPath += pathAry[i][1] + " ";
            newPath += pathAry[i][2] + " ";
        }

    }

    conn.attr("d", newPath);

    reDrawPointByPath(grp, conn);

    gConnectorContextMenu.classList.remove("context-menu--active");
    gGrpTmp = "";
    //gCurrent = "";
    targetMidPointId = "";

}

function reDrawPointByPath(grp, conn, g) {

    if (!g) {
        var gId = grp + "g";
        g = gSvg.select("#" + gId);
    }

    var type = g.attr("type");

    gSvg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
        element.remove();
    });

    gSvg.selectAll("[id^='" + grp + "arrow']").forEach(function (element) {
        element.remove();
    });


    var pathStr = conn.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var pathLen = pathAry.length;
    var totalLen = 0;

    var lastSubPath = [];

    for (var i = 0; i < pathLen; i++) {

        var cx = pathAry[i][1];
        var cy = pathAry[i][2];

        var endPointId = grp + "point_end_" + i;
        var endPoint = gSvg.circle(cx, cy, CIRCLE_R);
        endPoint.attr("id", endPointId);
        endPoint.addClass("myEndPoint");
        endPoint.addClass("hide");

        endPoint.mousedown(endPointMouseDown);
        endPoint.node.addEventListener("contextmenu", showConnectorContextMenu);

        g.append(endPoint);

        var len = 0;

        if (i > 0) {

            var dx = pathAry[i][1] - pathAry[i - 1][1];
            var dy = pathAry[i][2] - pathAry[i - 1][2];
            len = Math.sqrt(dx * dx + dy * dy);

            var midPointId = grp + "point_mid_" + (i - 1);
            var mid = Snap.path.getPointAtLength(conn, totalLen + (len / 2));
            var midPoint = gSvg.circle(mid.x, mid.y, CIRCLE_R);
            midPoint.attr("id", midPointId);
            midPoint.addClass("myMidPoint");
            midPoint.addClass("hide");

            midPoint.mousedown(endPointMouseDown);

            g.append(midPoint);

        }

        totalLen += len;

        if (i >= pathLen - 2) {
            lastSubPath.push(cx);
            lastSubPath.push(cy);
        }
    }

    // draw arrow
    if (lastSubPath.length == 4 && type !== "undirected") {

        var arrowId = grp + "arrow";

        var fx = parseInt(lastSubPath[2], 10);
        var fy = parseInt(lastSubPath[3], 10);

        var arrowPath = "M " + (fx - 5) + " " + fy;
        arrowPath += " L " + (fx - 5) + " " + (fy - 3);
        arrowPath += " L " + fx + " " + fy;
        arrowPath += " L " + fx + " " + (fy + 1);
        arrowPath += " L " + (fx - 5) + " " + (fy + 3);
        arrowPath += " Z";

        var arrow = gSvg.path(arrowPath);
        if ('route' == g.attr("type")) {
            arrow.addClass("myConnector2");
        } else {
            arrow.addClass("myConnector");
        }
        arrow.attr("id", arrowId);
        //arrow.node.style["zIndex"] = -10;

        var fx1 = parseInt(lastSubPath[0], 10);
        var fy1 = parseInt(lastSubPath[1], 10);

        var deg = Snap.angle(fx, fy, fx1, fy1);//Math.atan(arc)*180/Math.PI;

        var m = Snap.matrix();
        m.rotate(deg, fx, fy);
        arrow.transform(m);

        g.append(arrow);

    }

    var connLen = conn.getTotalLength();
    var targetPoint = conn.getPointAtLength(connLen / 2);
    //var text = gSvg.select("[id^='" + grp + "text']");
    //var textXY = getElementXYofRect(targetPoint.x - 20, targetPoint.y - 20, "text");
    //text.attr("x", textXY[0]);
    //text.attr("y", textXY[1]);
    var labelXY = getElementXYofRect(targetPoint.x - 20, targetPoint.y - 20, "text");
    var label = gSvg.select("[id^='" + grp + "label']");

    if (label) {
        label.attr("x", labelXY[0]);
        label.attr("y", labelXY[1]);
    }

    var selected = gSvg.select("#" + grp + "selected");
    var bBoxConn = conn.getBBox();

    if (selected) {
        selected.transform("translate(0 0)");
        selected.attr("x", bBoxConn.x - PATH_BBOX_ADD);
        selected.attr("y", bBoxConn.y - PATH_BBOX_ADD);
        selected.attr("width", bBoxConn.width + PATH_BBOX_ADD * 2);
        selected.attr("height", bBoxConn.height + PATH_BBOX_ADD * 2);

        var close = gSvg.select("#" + grp + "close");
        var closeXY = getElementXYofConn(selected.getBBox(), "close");

        if (close) {
            close.transform("translate(0 0)");
            close.attr("cx", closeXY[0]);
            close.attr("cy", closeXY[1]);
        }
    }


}

var targetMidPointId;
function showConnectorContextMenu(e) {

    e.preventDefault();

    targetMidPointId = e.target.id;

    gConnectorContextMenu.classList.add("context-menu--active");
    gConnectorContextMenu.style["left"] = (e.clientX - gMenuWidth ) + "px";
    gConnectorContextMenu.style["top"] = (e.clientY - gMenuHeight) + "px";
    gGrpTmp = gCurrent;

}

//function midPointMouseDown(id) {
//
//    log("midPointMouseDown");
//
//    //var id = this.attr("id");
//    var midPoint = gSvg.select("#" + id);
//    var idx = parseInt(id.substr(id.lastIndexOf(SEPARATOR) + 1), 10);
//
//    var grp = getGroupPrefix(id);
//    var conn = gSvg.select("#" + grp + "connector");
//
//    var pathStr = conn.attr("d");
//    var pathAry = Snap.parsePathString(pathStr);
//    var newPath = "";
//
//    for (var i = 0; i < pathAry.length; i++) {
//
//        newPath += pathAry[i][0] + " ";
//        newPath += pathAry[i][1] + " ";
//        newPath += pathAry[i][2] + " ";
//
//        if (idx == i) {
//            newPath += "L ";
//            newPath += midPoint.attr("cx") + " ";
//            newPath += midPoint.attr("cy") + " ";
//        }
//
//    }
//
//    conn.attr("d", newPath);
//
//    gSvg.selectAll("[id^='" + grp + "point_mid']").forEach(function (element) {
//        element.remove();
//    });
//
//    reDrawPointByPath(grp, conn);
//
//}
