function getElementXYofConn(bBox, elName) {

    var xy = [];

    if ("close" == elName) {
        xy.push(bBox.x2);
        xy.push(bBox.y2 - 3*CIRCLE_R);
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

    //var grpId = grp + "g";
    //var g = gSvg.g(newConn, midPoint, startPoint, endPoint);
    //g.attr("id", grpId);

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

    correctConnectorXY(conn);

    gDrawArea.onmousemove = connectorMouseMove;
    gDrawArea.onmouseup = connectorMouseUp;

}

function correctConnectorXY(conn) {

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

    conn.transform(myMatrix);

}

function connectorMouseUp() {

    if ("" != gCurrGrp) {
        var conn = gSvg.select("#" + gCurrGrp + "connector");
        conn.removeClass("toFront");
    }

    gDrawArea.onmousemove = null;
    gDrawArea.onmouseup = null;

    gCurrGrp = "";

}