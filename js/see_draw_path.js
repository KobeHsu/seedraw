function addConnector() {

    var grp = getGroupPrefix(g_serial);
    var connectorId = grp + "connector";

    var newConn = g_svg.path("M 10 60 L 90 60");
    newConn.addClass("myConnector");
    newConn.attr("id", connectorId);

    var len = newConn.getTotalLength();

    var mid = Snap.path.getPointAtLength(newConn, len / 2);
    var midPoint = g_svg.circle(mid.x, mid.y, CIRCLE_R);
    midPoint.addClass("myMidPoint");

    var start = Snap.path.getPointAtLength(newConn, 0);
    var startPoint = g_svg.circle(start.x, start.y, CIRCLE_R);
    startPoint.addClass("myEndPoint");

    var end = Snap.path.getPointAtLength(newConn, len);
    var endPoint = g_svg.circle(end.x, end.y, CIRCLE_R);
    endPoint.addClass("myEndPoint");

}
