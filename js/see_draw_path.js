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

function addConnector() {

    var grp = getGroupPrefix(gSerialNo);
    var connectorId = grp + "connector";

    var newConn = gSvg.path("M 10 60 L 110 60");
    newConn.addClass("myConnector");
    newConn.attr("id", connectorId);

    newConn.mouseover(connectorMouseOver);
    newConn.mouseout(connectorMouseOut);
    newConn.mousedown(svgElMouseDown);
    newConn.node.addEventListener("contextmenu", connectorContextMenu);

    var len = newConn.getTotalLength();
    var targetPoint = newConn.getPointAtLength(len/2);
    var textId = grp + "text";
    var textXY = getElementXYofRect(targetPoint.x-20, targetPoint.y-20, "text");
    var text = gSvg.text(textXY[0], textXY[1], "LABEL");
    text.attr("id", textId);
    text.addClass("myLabel");

    var g = gSvg.g(newConn, text);
    var grpId = grp + "g";
    g.attr("id", grpId);

    reDrawPointByPath(grp, newConn, g);

    gSerialNo++;
}

function connectorContextMenu(e) {

    e.preventDefault();

    var r = confirm(REMOVE_CONNECTOR_MSG);
    if (!r) {
        return;
    }

    var grp = getGroupPrefix(this.id);
    var grpId = grp + "g";
    gSvg.select("#" + grpId).remove();

    return false;

}

function connectorMouseOver() {

    var grp = getGroupPrefix(this.attr("id"));

    gSvg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
        element.removeClass("hide");
    });

    gSvg.selectAll("[id^='" + grp + "arrow']").forEach(function (element) {
        element.addClass("hide");
    });

}

function connectorMouseOut() {

    var grp = getGroupPrefix(this.attr("id"));

    gSvg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
        element.addClass("hide");
    });

    gSvg.selectAll("[id^='" + grp + "arrow']").forEach(function (element) {
        element.removeClass("hide");
    });

}

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
    var text = gSvg.select("[id^='" + grp + "text']");
    var textXY = getElementXYofRect(targetPoint.x - 20, targetPoint.y - 20, "text");
    text.attr("x", textXY[0]);
    text.attr("y", textXY[1]);

    text.dblclick(textDblClick);

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

    gSvg.selectAll("[id^='" + grp + "point'").forEach(function (element) {
        var cx = parseInt(element.attr("cx"), 10);
        var cy = parseInt(element.attr("cy"), 10);
        //element.attr("transform", "");
        element.transform("translate(0 0)");
        element.attr("cx", cx + x);
        element.attr("cy", cy + y);
    });

}

function endPointMouseDown(event) {

    gCurrent = this.attr("id");

    var midPoint = gSvg.select("#" + gCurrent);

    midPoint.data("mousedown-x", event.clientX);
    midPoint.data("mousedown-y", event.clientY);

    var grp = getGroupPrefix(gCurrent);
    var conn = gSvg.select("#" + grp + "connector");
    conn.unmouseout(connectorMouseOut);
    midPoint.unmouseout(connectorMouseOut);
    midPoint.addClass("toFront");

    gSvg.selectAll("[id^='" + grp + "point_mid']").forEach(function (element) {
        element.remove();
    });

    gDrawArea.onmousemove = endPointMouseMove;
    gDrawArea.onmouseup = endPointMouseUp;

}

function endPointMouseMove() {

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

    pathAry[idx][1] = x;
    pathAry[idx][2] = y;

    var newPath = "";
    pathAry.forEach(function (p) {
        newPath += p[0] + " ";
        newPath += p[1] + " ";
        newPath += p[2] + " ";
    });

    conn.attr("d", newPath);

}

function endPointMouseUp(event) {

    if ("" != gCurrent) {

        var midPoint = gSvg.select("#" + gCurrent);

        var x = midPoint.data("mousedown-x");
        var y = midPoint.data("mousedown-y");
        if (x == event.clientX && y == event.clientY) {
            endPointRemove(midPoint.attr("id"));
        }

        midPoint.removeClass("toFront");

        var grp = getGroupPrefix(gCurrent);
        var conn = gSvg.select("#" + grp + "connector");
        conn.mouseout(connectorMouseOut);
        midPoint.mouseout(connectorMouseOut);

    }

    reDrawPointByPath(grp, conn);

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrent = "";

}

function endPointRemove(id) {

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

}

function reDrawPointByPath(grp, conn, g) {

    if (!g) {
        var gId = grp + "g";
        g = gSvg.select("#" + gId);
    }

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

        endPoint.mouseover(connectorMouseOver);
        endPoint.mouseout(connectorMouseOut);
        endPoint.mousedown(endPointMouseDown);

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

            midPoint.mouseover(connectorMouseOver);
            midPoint.mouseout(connectorMouseOut);
            midPoint.mousedown(midPointMouseDown);

            g.append(midPoint);

        }

        totalLen += len;

        if (i >= pathLen - 2) {
            lastSubPath.push(cx);
            lastSubPath.push(cy);
        }
    }

    // draw arrow
    if (lastSubPath.length == 4) {

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
        arrow.addClass("myConnector");
        arrow.attr("id", arrowId);
        //arrow.node.style["zIndex"] = -10;
        arrow.mouseover(connectorMouseOver);
        arrow.mouseout(connectorMouseOut);

        var fx1 = parseInt(lastSubPath[0], 10);
        var fy1 = parseInt(lastSubPath[1], 10);

        var deg = Snap.angle(fx, fy, fx1, fy1);//Math.atan(arc)*180/Math.PI;

        var m = Snap.matrix();
        m.rotate(deg, fx, fy);
        //arrow.attr("transform", "rotate( " + deg + " " + fx + " " + fy + " )");
        arrow.transform(m);

        g.append(arrow);

    }

    var len = conn.getTotalLength();
    var targetPoint = conn.getPointAtLength(len / 2);
    var text = gSvg.select("[id^='" + grp + "text']");
    var textXY = getElementXYofRect(targetPoint.x - 20, targetPoint.y - 20, "text");
    text.attr("x", textXY[0]);
    text.attr("y", textXY[1]);

}

function midPointMouseDown() {

    var id = this.attr("id");
    var midPoint = gSvg.select("#" + id);
    var idx = parseInt(id.substr(id.lastIndexOf(SEPARATOR) + 1), 10);

    var grp = getGroupPrefix(id);
    var conn = gSvg.select("#" + grp + "connector");

    var pathStr = conn.attr("d");
    var pathAry = Snap.parsePathString(pathStr);
    var newPath = "";

    for (var i = 0; i < pathAry.length; i++) {

        newPath += pathAry[i][0] + " ";
        newPath += pathAry[i][1] + " ";
        newPath += pathAry[i][2] + " ";

        if (idx == i) {
            newPath += "L ";
            newPath += midPoint.attr("cx") + " ";
            newPath += midPoint.attr("cy") + " ";
        }

    }

    conn.attr("d", newPath);

    reDrawPointByPath(grp, conn);

}