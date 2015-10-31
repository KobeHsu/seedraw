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

    var newConn = gSvg.path("M 10 60 L 90 60");
    newConn.addClass("myConnector");
    newConn.attr("id", connectorId);

    newConn.mouseover(connectorMouseOver);
    newConn.mouseout(connectorMouseOut);
    newConn.mousedown(connectorMouseDown);
    newConn.node.addEventListener("contextmenu", connectorContextMenu);

    var len = newConn.getTotalLength();

    var pointId = grp + "point_1";
    var mid = Snap.path.getPointAtLength(newConn, len / 2);
    var midPoint = gSvg.circle(mid.x, mid.y, CIRCLE_R);
    midPoint.attr("id", pointId);
    midPoint.addClass("myMidPoint");
    midPoint.addClass("hide");

    midPoint.mouseover(connectorMouseOver);
    midPoint.mouseout(connectorMouseOut);

    pointId = grp + "point_0";
    var start = Snap.path.getPointAtLength(newConn, 0);
    var startPoint = gSvg.circle(start.x, start.y, CIRCLE_R);
    startPoint.attr("id", pointId);
    startPoint.addClass("myEndPoint");
    startPoint.addClass("hide");

    startPoint.mouseover(connectorMouseOver);
    startPoint.mouseout(connectorMouseOut);
    startPoint.mousedown(midPointMouseDown);

    pointId = grp + "point_2";
    var end = Snap.path.getPointAtLength(newConn, len);
    var endPoint = gSvg.circle(end.x, end.y, CIRCLE_R);
    endPoint.attr("id", pointId);
    endPoint.addClass("myEndPoint");
    endPoint.addClass("hide");

    endPoint.mouseover(connectorMouseOver);
    endPoint.mouseout(connectorMouseOut);

    var bBox = newConn.getBBox();
    var closeId = grp + "close";
    var closeXY = getElementXYofConn(bBox, "close");
    var close = gSvg.circle(closeXY[0], closeXY[1], CIRCLE_R);
    close.addClass("myClose");
    close.addClass("hide");
    close.attr("id", closeId);

    var grpId = grp + "g";
    var g = gSvg.g(newConn, midPoint, startPoint, endPoint);
    g.attr("id", grpId);

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

    //gSvg.select("[id^='" + grp + "close']").removeClass("hide");

}

function connectorMouseOut() {

    var grp = getGroupPrefix(this.attr("id"));

    gSvg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
        element.addClass("hide");
    });

    //gSvg.select("[id^='" + grp + "close']").addClass("hide");

}

function connectorMouseDown(event) {

    var grp = getGroupPrefix(this.attr("id"));
    gCurrGrp = grp;

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
    if ("" != gCurrGrp) {
        grp = gCurrGrp;
    } else {
        return;
    }

    var conn = gSvg.select("#" + grp + "connector");

    x = (parseInt(conn.data('mousedown-x')) || 0);
    y = (parseInt(conn.data('mousedown-y')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    var grpId = grp + "g";
    gSvg.select("#" + grpId).transform(myMatrix);
    //conn.transform(myMatrix);

}

function connectorMouseUp() {

    if ("" != gCurrGrp) {

        var grp = getGroupPrefix(gCurrGrp);
        var conn = gSvg.select("#" + gCurrGrp + "connector");

        correctConnectorXY(grp, conn);
        conn.removeClass("toFront");

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrGrp = "";

}

function midPointMouseDown(event) {

    gCurrGrp = this.attr("id");

    var midPoint = gSvg.select("#" + gCurrGrp);

    midPoint.data("mousedown-x", event.clientX);
    midPoint.data("mousedown-y", event.clientY);

    var grp = getGroupPrefix(gCurrGrp);
    var conn = gSvg.select("#" + grp + "connector");
    conn.unmouseout(connectorMouseOut);
    midPoint.unmouseout(connectorMouseOut);
    midPoint.addClass("toFront");

    gDrawArea.onmousemove = midPointMouseMove;
    gDrawArea.onmouseup = midPointMouseUp;

}

function midPointMouseMove() {

    if ("" == gCurrGrp) {
        return;
    }

    var midPoint = gSvg.select("#" + gCurrGrp);

    var x = event.clientX - gStartX;
    var y = event.clientY - gStartY;

    midPoint.attr("cx", x);
    midPoint.attr("cy", y);

    //x = (parseInt(midPoint.data('mousedown-x')) || 0);
    //y = (parseInt(midPoint.data('mousedown-y')) || 0);
    //
    //var dx = event.clientX - x;
    //var dy = event.clientY - y;
    //
    var idx = parseInt(gCurrGrp.substr(gCurrGrp.lastIndexOf(SEPARATOR) + 1), 10);
    //
    //var myMatrix = new Snap.Matrix();
    //myMatrix.translate(dx, dy);
    //
    //midPoint.transform(myMatrix);
    //
    var grp = getGroupPrefix(gCurrGrp);
    var conn = gSvg.select("#" + grp + "connector");
    var pathStr = conn.attr("d");
    var pathAry = Snap.parsePathString(pathStr);

    //var cx = parseInt(midPoint.attr("cx"), 10);
    //var cy = parseInt(midPoint.attr("cy"), 10);
    pathAry[idx][1] = x;
    pathAry[idx][2] = y;

    var newPath = "";
    pathAry.forEach(function (p) {
        newPath += p[0] + " ";
        newPath += p[1] + " ";
        newPath += p[2] + " ";
    });

    conn.attr("d", newPath);
    //
    //var virtualPointId = gCurrGrp.substr(0, gCurrGrp.lastIndexOf(SEPARATOR) + 1) + "" + (idx + 1);
    //var virtualPoint = gSvg.select("#" + virtualPointId);
    //
    //var totalPaths = (gSvg.selectAll("[id^='" + grp + "point'").length - 1) / 2;
    //
    //
    //var mid = Snap.path.getPointAtLength(conn, conn.getTotalLength() / totalPaths / 2);
    //virtualPoint.attr("cx", mid.x);
    //virtualPoint.attr("cy", mid.y);

}

function midPointMouseUp() {

    if ("" != gCurrGrp) {

        var midPoint = gSvg.select("#" + gCurrGrp);
        midPoint.removeClass("toFront");

        var grp = getGroupPrefix(gCurrGrp);
        var conn = gSvg.select("#" + grp + "connector");
        conn.mouseout(connectorMouseOut);
        midPoint.mouseout(connectorMouseOut);

        //var tStrAry = Snap.parseTransformString(midPoint.attr("transform"));
        //
        //if (tStrAry.length != 0) {
        //
        //    var x = parseInt(tStrAry[0][1], 10);
        //    var y = parseInt(tStrAry[0][2], 10);
        //
        //    var cx = parseInt(midPoint.attr("cx"), 10);
        //    var cy = parseInt(midPoint.attr("cy"), 10);
        //    midPoint.attr("transform", "");
        //    midPoint.attr("cx", cx + x);
        //    midPoint.attr("cy", cy + y);
        //
        //}

    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrGrp = "";

}
