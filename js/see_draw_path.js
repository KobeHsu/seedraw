function getElementXYofConn(bBox, elName) {

    var xy = [];

    if ("close" == elName) {
        xy.push(bBox.x2);
        xy.push(bBox.y2 - 3 * CIRCLE_R);
    }

    return xy;

}

function addConnector() {

    var grp = getGroupPrefix(gSerialNo);
    var connectorId = grp + "connector";

    var newConn = gSvg.path("M 10 60 L 110 60");
    newConn.addClass("myConnector");
    newConn.attr("id", connectorId);

    newConn.mouseover(connectorMouseOver);
    newConn.mouseout(connectorMouseOut);
    newConn.mousedown(connectorMouseDown);
    newConn.node.addEventListener("contextmenu", connectorContextMenu);

    var g = gSvg.g(newConn);
    var grpId = grp + "g";
    g.attr("id", grpId);

    reDrawPointByPath(g, grp, newConn);

    gSerialNo++;
}

function connectorContextMenu(e) {

    e.preventDefault();

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

}

function connectorMouseOut() {

    var grp = getGroupPrefix(this.attr("id"));

    gSvg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
        element.addClass("hide");
    });

}

function connectorMouseDown(event) {

    var grp = getGroupPrefix(this.attr("id"));
    gCurrent = grp;

    var conn = gSvg.select("#" + grp + "connector");

    conn.data("mousedown-x", event.clientX);
    conn.data("mousedown-y", event.clientY);

    conn.addClass("toFront");

    //correctConnectorXY(grp, conn);

    gDrawArea.onmousemove = connectorMouseMove;
    gDrawArea.onmouseup = connectorMouseUp;

}

function correctConnectorXY(grp, conn) {

    var g = gSvg.select("#" + grp + "g");

    var tStrAry = Snap.parseTransformString(g.attr("transform"));

    if (tStrAry.length == 0) {
        return;
    }

    var x = parseInt(tStrAry[0][1], 10);
    var y = parseInt(tStrAry[0][2], 10);

    g.attr("transform", "");

    var pathStr = conn.attr("d");
    var pathAry = Snap.parsePathString(pathStr);

    pathAry.forEach(function (p) {
        p[1] = parseInt(p[1]) + x;
        p[2] = parseInt(p[2]) + y;
    });

    var newPath = "";
    pathAry.forEach(function (p) {
        newPath += p[0] + " ";
        newPath += p[1] + " ";
        newPath += p[2] + " ";
    });

    conn.attr("transform", "");
    conn.attr("d", newPath);

    gSvg.selectAll("[id^='" + grp + "point'").forEach(function (element) {
        var cx = parseInt(element.attr("cx"), 10);
        var cy = parseInt(element.attr("cy"), 10);
        element.attr("transform", "");
        element.attr("cx", cx + x);
        element.attr("cy", cy + y);
    });

}

function connectorMouseMove() {

    var grp;
    if ("" != gCurrent) {
        grp = gCurrent;
    } else {
        return;
    }

    var conn = gSvg.select("#" + grp + "connector");

    var x = (parseInt(conn.data('mousedown-x')) || 0);
    var y = (parseInt(conn.data('mousedown-y')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    var grpId = grp + "g";
    gSvg.select("#" + grpId).transform(myMatrix);

}

function connectorMouseUp() {

    if ("" != gCurrent) {

        var grp = getGroupPrefix(gCurrent);
        var conn = gSvg.select("#" + gCurrent + "connector");

        correctConnectorXY(grp, conn);
        conn.removeClass("toFront");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrent = "";

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

function endPointMouseUp() {

    if ("" != gCurrent) {

        var midPoint = gSvg.select("#" + gCurrent);
        midPoint.removeClass("toFront");

        var grp = getGroupPrefix(gCurrent);
        var conn = gSvg.select("#" + grp + "connector");
        conn.mouseout(connectorMouseOut);
        midPoint.mouseout(connectorMouseOut);

    }

    var gId = grp + "g";
    var g = gSvg.select("#" + gId);
    reDrawPointByPath(g, grp, conn);

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrent = "";

}

function reDrawPointByPath(g, grp, conn) {

    gSvg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
        element.remove();
    });

    var pathStr = conn.attr("d");
    var pathAry = Snap.parsePathString(pathStr);

    var totalLen = 0;

    for (var i = 0; i < pathAry.length; i++) {

        var endPointId = grp + "point_end_" + i;
        var endPoint = gSvg.circle(pathAry[i][1], pathAry[i][2], CIRCLE_R);
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

            g.append(midPoint);

        }

        totalLen += len;
    }

}