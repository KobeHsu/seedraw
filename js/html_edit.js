var gContainer;
var gSerialNo = 0;
var gInitDisable = false;

document.addEventListener("DOMContentLoaded", function (ev) {

    gContainer = document.getElementById("container");

});

function allowDrop(ev) {

    ev.preventDefault();

}

function dragStart(ev, type) {

    ev.dataTransfer.setData("elType", type);
    ev.dataTransfer.setData("elId", ev.target.id);

}

function dropDown(ev) {

    ev.preventDefault();
    var elType = ev.dataTransfer.getData("elType");
    var elId = ev.dataTransfer.getData("elId");

    //console.log(ev.clientX + ":" + ev.clientY);

    const ADJ_X = 50;
    const ADJ_Y = 20;

    if ("span" == elType) {

        var span = document.createElement("span");

        span.setAttribute("draggable", "true");
        span.setAttribute("id", elType + "_" + gSerialNo);

        span.innerHTML = "LABEL";
        span.style.position = "absolute";
        span.style.left = ev.clientX - ADJ_X + "px";
        span.style.top = ev.clientY - ADJ_Y + "px";

        span.addEventListener("dragstart", function () {
            dragStart(event, 'move');
        });

        gContainer.appendChild(span);

        gSerialNo++;

    } else if ("text" == elType) {

        var text = document.createElement("input");

        text.setAttribute("type", "text");
        text.setAttribute("placeholder", "TextField");
        if (gInitDisable) {
            text.setAttribute("disabled", "disabled");
        }
        text.setAttribute("draggable", "true");
        text.setAttribute("id", elType + "_" + gSerialNo);

        text.innerHTML = "LABEL";
        text.style.position = "absolute";
        text.style.left = ev.clientX - ADJ_X + "px";
        text.style.top = ev.clientY - ADJ_Y + "px";

        text.addEventListener("dragstart", function () {
            dragStart(event, 'move');
        });

        gContainer.appendChild(text);

        gSerialNo++;

    } else if ("list" == elType) {

        var list = document.createElement("input");

        list.setAttribute("list", "newList");
        if (gInitDisable) {
            list.setAttribute("disabled", "disabled");
        }
        list.setAttribute("draggable", "true");
        list.setAttribute("id", elType + "_" + gSerialNo);

        list.style.position = "absolute";
        list.style.left = ev.clientX - ADJ_X + "px";
        list.style.top = ev.clientY - ADJ_Y + "px";

        list.addEventListener("dragstart", function () {
            dragStart(event, 'move');
        });

        gContainer.appendChild(list);

        gSerialNo++;

    } else if ("button" == elType) {

        var button = document.createElement("input");

        button.setAttribute("type", "button");
        button.setAttribute("value", "Button");
        button.setAttribute("draggable", "true");
        button.setAttribute("id", elType + "_" + gSerialNo);

        button.innerHTML = "LABEL";
        button.style.position = "absolute";
        button.style.left = ev.clientX - ADJ_X + "px";
        button.style.top = ev.clientY - ADJ_Y + "px";

        button.addEventListener("dragstart", function () {
            dragStart(event, 'move');
        });

        gContainer.appendChild(button);

        gSerialNo++;

    } else if ("radio" == elType || "checkbox" == elType) {

        var radio = document.createElement("input");

        radio.setAttribute("type", elType);
        radio.setAttribute("draggable", "true");
        radio.setAttribute("id", elType + "_" + gSerialNo);

        radio.style.position = "absolute";
        radio.style.left = ev.clientX + "px";
        radio.style.top = ev.clientY + "px";

        radio.addEventListener("dragstart", function () {
            dragStart(event, 'move');
        });

        gContainer.appendChild(radio);

        gSerialNo++;

    } else if ("textarea" == elType) {

        var textarea = document.createElement("textarea");

        textarea.setAttribute("placeholder", "Textarea");
        if (gInitDisable) {
            textarea.setAttribute("disabled", "disabled");
        }
        textarea.setAttribute("draggable", "true");
        textarea.setAttribute("id", elType + "_" + gSerialNo);

        textarea.style.position = "absolute";
        textarea.style.left = ev.clientX - ADJ_X + "px";
        textarea.style.top = ev.clientY - ADJ_Y + "px";

        textarea.addEventListener("dragstart", function () {
            dragStart(event, 'move');
        });

        gContainer.appendChild(textarea);

        gSerialNo++;

    } else if ("move" == elType) {
        var el = document.getElementById(elId);
        if (el.getAttribute("type") != "radio" && el.getAttribute("type") != "checkbox") {
            el.style.left = ev.clientX - ADJ_X + "px";
            el.style.top = ev.clientY - ADJ_Y + "px";
        } else {
            el.style.left = ev.clientX + "px";
            el.style.top = ev.clientY + "px";
        }
    }

}
