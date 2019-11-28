// MAKING THE OVERLAY THAT WILL HIGHLIGHT PARTS OF THE WEBPAGE THAT HAVE CHANGED
var changes = [] // ARRAY OF COORDS WHERE CHANGES WERE DETECTED

var makeOverlay = function() {
    var overlay = document.createElement("div");
    overlay.id = "tabnab-overlay"
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.right = 0;
    overlay.style.bottom = 0;
    overlay.style.zIndex = 99998;
    overlay.style.height = "100%";
    overlay.style.width = "100%";
    overlay.style.background = "rgba(0, 0, 0, 0.3)";
    for(var i = 0; i < window.innerHeight/10; i++) {
        var row = document.createElement("div");
        row.style.height = 10 + "px";
        row.style.display = "flex";
        row.style.flexDirection = "wrap";
        for(var j = 0; j < (window.innerWidth - 17)/10 + 1; j++) {
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
    return overlay;
}

var makeDialog = function() {
    var dialog = document.createElement("div");
    dialog.id = "tabnab-dialog"
    dialog.style.position = "fixed";
    dialog.style.right = 0;
    dialog.style.bottom = 0;
    dialog.style.background = "rgba(255, 255, 255, 0.7)";
    dialog.style.width = "200px";
    dialog.style.height = "100px";
    dialog.style.zIndex = 99999;
    dialog.style.display = "flex";
    dialog.style.flexDirection = "column";
    dialog.style.alignItems = "center";
    dialog.style.justifyContent = "center";
    dialog.style.borderTopLeftRadius = "3px";
    dialog.style.borderTopRightRadius = "3px";
    dialog.style.fontFamily = "Calibri";
    dialog.style.fontSize = "11px";
    dialog.style.textAlign = "center";
    dialog.innerHTML = "CacheMoney detected changes in <br> this tab which are highlighted in red <br> Would you like to report this website?";

    var buttonsContainer = document.createElement("div");
    var closeButton = document.createElement("button");
    closeButton.innerHTML = "Close"
    closeButton.onclick = () => {
        enableScroll();
        document.body.removeChild(document.getElementById('tabnab-overlay'));
        document.body.removeChild(document.getElementById('tabnab-dialog'));
    }
    var submitButton = document.createElement("button");
    submitButton.innerHTML = "Report"
    submitButton.onclick = () => {
        enableScroll();
        document.body.removeChild(document.getElementById('tabnab-overlay'));
        document.body.removeChild(document.getElementById('tabnab-dialog'));

        // THIS IS WHERE STORING THE URL COMES IN
        var url = window.location.href;
        console.log("URL of tab is: ", url)
    }
    buttonsContainer.style.padding = "3px";
    buttonsContainer.appendChild(closeButton);
    buttonsContainer.appendChild(submitButton);

    dialog.appendChild(buttonsContainer);

    return dialog;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse({handshake: "Coords received"});
    
    disableScroll();
    
    var { coords } = request;
    changes = [];
    changes = [ ...coords ];
    console.log("detected changes: ", changes);

    if(!document.getElementById("tabnab-overlay"))
        var overlay = makeOverlay();
        var dialog = makeDialog();
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

    // COLORING IN THE BOXES THAT WE DETECTED CHANGE IN
    changes.forEach((coord) => {
        var id = coord[0] + " " + coord[1];
        document.getElementById(id).style.background = "rgba(224, 0, 0, 0.37)";
    })
});

// CODE FROM: https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;  
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', preventDefault, false);
    document.addEventListener('wheel', preventDefault, {passive: false}); // Disable scrolling in Chrome
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove  = preventDefault; // mobile
    document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    document.removeEventListener('wheel', preventDefault, {passive: false}); // Enable scrolling in Chrome
    window.onmousewheel = document.onmousewheel = null; 
    window.onwheel = null; 
    window.ontouchmove = null;  
    document.onkeydown = null;  
}