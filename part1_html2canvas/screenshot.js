console.log(document.body);

var makeOverlay = function() {
    var h = document.body.clientHeight;
    var w = document.body.clientWidth;
    var overlay = document.createElement("div");
    overlay.id = "tabnab-overlay"
    overlay.style.position = "absolute";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.right = 0;
    overlay.style.bottom = 0;
    overlay.style.zIndex = 99999;
    // overlay.style.height = h + "px";
    // overlay.style.width = w + "px";
    overlay.style.height = "100%";
    overlay.style.width = "100%";
    for(var i = 0; i < h/10 + 1; i++) {
        var row = document.createElement("div");
        row.style.height = 10 + "px";
        row.style.display = "flex";
        row.style.flexDirection = "wrap";
        for(var j = 0; j < w/10 + 1; j++) {
            var box = document.createElement("div");
            box.id = i + " " + j;
            box.style.position = "relative";
            box.style.height = "10px";
            box.style.width = "10px";
            box.style.marginBottom = "0";
            row.appendChild(box);
        }
        overlay.appendChild(row);
    }
    // document.body.appendChild(overlay);
}

// chrome.runtime.sendMessage({msg: "capture"}, function(response) {
//     // console.log(response.imgSrc);
//     var img = new Image;
//     img.src = response.imgSrc;
//     document.body.appendChild(img);
// });