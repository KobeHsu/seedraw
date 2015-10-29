function addConnector() {

    var grp = getGroupPrefix(g_serial);
    var connectorId = grp + "connector";

    var newConn = g_svg.path("M 10 60 L 90 60");
    newConn.addClass("myConnector");
    newConn.attr("id", connectorId);

    newConn.mouseover(connectorMouseOver);
    newConn.mouseout(connectorMouseOut);
    newConn.mousedown(connectorMouseDown);

    var len = newConn.getTotalLength();

    var pointId = grp + "point_1";
    var mid = Snap.path.getPointAtLength(newConn, len / 2);
    var midPoint = g_svg.circle(mid.x, mid.y, CIRCLE_R);
    midPoint.attr("id", pointId);
    midPoint.addClass("myMidPoint");
    midPoint.addClass("hide");

    midPoint.mouseover(connectorMouseOver);
    midPoint.mouseout(connectorMouseOut);

    pointId = grp + "point_0";
    var start = Snap.path.getPointAtLength(newConn, 0);
    var startPoint = g_svg.circle(start.x, start.y, CIRCLE_R);
    startPoint.attr("id", pointId);
    startPoint.addClass("myEndPoint");
    startPoint.addClass("hide");

    startPoint.mouseover(connectorMouseOver);
    startPoint.mouseout(connectorMouseOut);

    pointId = grp + "point_2";
    var end = Snap.path.getPointAtLength(newConn, len);
    var endPoint = g_svg.circle(end.x, end.y, CIRCLE_R);
    endPoint.attr("id", pointId);
    endPoint.addClass("myEndPoint");
    endPoint.addClass("hide");

    endPoint.mouseover(connectorMouseOver);
    endPoint.mouseout(connectorMouseOut);

    //var grpId = grp + "g";
    //var g = g_svg.g(newConn, midPoint, startPoint, endPoint);
    //g.attr("id", grpId);

}

function connectorMouseOver() {

    var grp = getGroupPrefix(this.attr("id"));

    g_svg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
        element.removeClass("hide");
    });

    var conn = g_svg.select("#" + grp + "connector");
    conn.unmousemove(connectorMouseMove);
    conn.unmouseup(connectorMouseUp);

}

function connectorMouseOut() {

    var grp = getGroupPrefix(this.attr("id"));

    g_svg.selectAll("[id^='" + grp + "point']").forEach(function (element) {
        element.addClass("hide");
    });

}

function connectorMouseDown(event) {

    var grp = getGroupPrefix(this.attr("id"));
    g_curr_grp = grp;

    var conn = g_svg.select("#" + grp + "connector");

    conn.data("mousedown-x", event.clientX);
    conn.data("mousedown-y", event.clientY);

    conn.node.style["z-index"] = 99;

    correctConnectorXY(grp, conn);

    conn.mousemove(connectorMouseMove);
    conn.mouseup(connectorMouseUp);

}

function correctConnectorXY(grp, conn) {

    var tStrAry = Snap.parseTransformString(conn.attr("transform"));

    if (tStrAry.length == 0) {
        return;
    }

    var x = parseInt(tStrAry[0][1], 10);
    var y = parseInt(tStrAry[0][2], 10);

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

}

function connectorMouseMove() {

    var grp;
    if ("" != g_curr_grp) {
        grp = g_curr_grp;
    } else {
        grp = getGroupPrefix(this.attr("id"));
    }

    var conn = g_svg.select("#" + grp + "connector");

    x = (parseInt(conn.data('mousedown-x')) || 0);
    y = (parseInt(conn.data('mousedown-y')) || 0);

    var dx = event.clientX - x;
    var dy = event.clientY - y;

    var myMatrix = new Snap.Matrix();
    myMatrix.translate(dx, dy);

    conn.transform(myMatrix);

}

function connectorMouseUp() {

    var grp;
    if ("" != g_curr_grp) {
        grp = g_curr_grp;
    } else {
        grp = getGroupPrefix(this.attr("id"));
    }

    var conn = g_svg.select("#" + grp + "connector");

    conn.unmousemove(connectorMouseMove);
    conn.unmouseup(connectorMouseUp);


}