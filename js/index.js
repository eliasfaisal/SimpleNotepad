openedMenu = "";
fileInfo = "";
lastURL = "";
for (var event of ["keyup", "keydown", "input", "change", "click", "context", "select", "mouseup", "mousedown", "mousemove"]) {
    qs('#textContent').addEventListener(event, (e)=>{
        var me = e.target;
        getCursorPos(me);
        getSelectLength(me);
        getFileSize();
    }
    );

    /* Dialog Holder Global Events */
    if (event == "keydown") {
        addEventListener("keydown", (e)=>{
            if (e.keyCode == 27) {
                for (var child of qs("#dialogsHolder").children) {
                    child.hidden = 1;
                }
                qs("#dialogsHolder").hidden = 1;
            }
        }
        )

    }
}

function getCursorPos(me) {
    if (me.selectionEnd == me.value.length) {
        qs('#cursor').innerHTML = me.selectionEnd + " (End)";
    } else if (me.selectionEnd == 0) {
        qs('#cursor').innerHTML = me.selectionEnd + " (Begin)";
    } else if (me.selectionEnd == parseInt(me.value.length / 2)) {
        qs('#cursor').innerHTML = me.selectionEnd + " (Middle)";
    } else {
        qs('#cursor').innerHTML = me.selectionEnd;
    }

}

function getSelectLength(me) {
    var len = me.selectionStart - me.selectionEnd;
    if (len < 0) {
        len = -(len);
    }
    qs('#length').innerHTML = len;
}

function getFileSize() {
    var me = qs("#textContent");
    var size = Number((qs('#textContent').value.length / 1024).toFixed(1));
    if (size < 1024) {
        qs("#fileSize").innerHTML = "( " + size + "KB )";
    } else {
        qs("#fileSize").innerHTML = "( " + ((size / 1024).toFixed(1)) + "MB )";
    }
}

for (var mBtn of ["mFile", "mEdit", "mInfo"]) {
    Function(`qs('${"#" + mBtn}').addEventListener("click", (e)=>{\n\
        closeAllMenus();\n\
        openMenu("${"#" + (mBtn.slice(1).toLowerCase() + "Menu")}", e.clientX);\n\
    }\
    );`)()
}

/* Global Click */

addEventListener("click", (e)=>{
    var me = e.target;
    if (!(me.className in {
        "menuItem": "menuItem",
        "menu": "menu",
        "btn": "btn"
    })) {
        if (openedMenu.length > 0) {
            qs(openedMenu).hidden = 1;
            openedMenu = "";
        }
    }
}
);

/* Menus */

function openMenu(id, posX) {
    qs(id).style.top = "35px";
    qs(id).style.left = posX + "px";
    qs(id).hidden = 0;
    openedMenu = id;
}

function closeAllMenus() {
    for (var menu of qs("#menusHolder").children) {
        menu.hidden = 1;
    }
}

/* File Menu Actions */

// New Button
qs("#fileMenuNew").onclick = ()=>{
    closeAllMenus();
    fileInfo = '';
    qs("#textContent").value = "";
    document.title = "Simple Notepad";
    URL.revokeObjectURL(lastURL);
}

// Open Button

function writeFromBuffer(data) {
    qs("#textContent").value = data;
    getFileSize();

}

qs("#fileMenuOpen").onclick = ()=>{
    closeAllMenus();
    var file = ce('input');
    file.type = "file";
    file.onchange = (e)=>{
        var me = e.target;
        fileInfo = me.files[0].name;
        document.title = "Simple Notepad - " + me.files[0].name;
        me.files[0].text().then((data)=>{
            writeFromBuffer(data);
        }
        );
    }
    file.click();
}

qs("#saveCopy").onclick = ()=>{
    closeAllMenus();
    qs("#dialogsHolder").hidden = 0;
    qs("#saveCopyBox").hidden = 0;
    if (fileInfo.length > 0) {
        var before = fileInfo.slice(0, fileInfo.indexOf("."))
        var after = fileInfo.slice(fileInfo.indexOf(".") + 1)
        qs("#saveCopyBox #fname").value = before;
        qs("#saveCopyBox #exten").value = after;
    } else {
        qs("#saveCopyBox #fname").value = "untitled";
        qs("#saveCopyBox #exten").value = "txt";
    }
}

/* File Menu */

qs("#fileMenuView").onclick = ()=>{
    closeAllMenus();
    var blob = new Blob([qs("#textContent").value],{
        type: "text/plain"
    });
    if (lastURL.length > 0) {
        URL.revokeObjectURL(lastURL);
    }
    var urlHost = URL.createObjectURL(blob);
    lastURL = urlHost;
    window.open(urlHost);
}

/* SaveCopy Box */

qs('#saveCopyBox #save').onclick = ()=>{
    var link = ce('a');
    link.target = "_blank";
    link.download = qs("#saveCopyBox #fname").value + "." + qs("#saveCopyBox #exten").value;
    link.href = "data:text/plain;Base64," + btoa(qs("#textContent").value);
    link.click();
    qs('#saveCopyBox #cancel').click();
}

qs('#saveCopyBox #cancel').onclick = ()=>{
    qs("#dialogsHolder").hidden = 1;
    qs("#saveCopyBox").hidden = 1;
}

//Open Method 2 (Dropping)

ondrop = (e)=>{
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    console.log(file)
    fileInfo = file.name;
    document.title = "Simple Notepad - " + file.name;
    file.text().then((data)=>{
        writeFromBuffer(data);
    }
    );
}

// Edit Menu

qs("#textReplaceAll").onclick = ()=>{
    closeAllMenus();
    qs("#dialogsHolder").hidden = 0;
    qs("#replaceAllBox").hidden = 0;
}

qs("#insertTD").onclick = ()=>{
    closeAllMenus();
    var cur = qs("#textContent").selectionEnd;
    var date = new Date();
    with (date) {
        var odate = `${getHours()}:${getMinutes()} | ${getDate()}/${getMonth() + 1}/${getFullYear()}\n`
    }
    var before = qs("#textContent").value.slice(0, cur);
    var after = qs("#textContent").value.slice(cur);
    qs("#textContent").value = before + odate + after;
}

// ReplaceAll Box

/* uMatchCase (Do Not Match Chars Cases) */

function uMatchCase(keyword, replacer, text) {
    keyword = keyword.toLowerCase()
    var textLower = text.toLowerCase()
    var xReg = "@#" + Math.random().toString(36).slice(8).toUpperCase() + "#@"

    var charPoses = [];
    for (; ; ) {
        if (charPoses.length == 0) {
            var lastIndex = 0;
        } else {
            var lastIndex = charPoses[charPoses.length - 1] + keyword.length;
        }
        var nextIndex = textLower.indexOf(keyword, lastIndex);
        if (nextIndex !== -1) {
            charPoses.push(nextIndex);
        } else {
            break;
        }
    }
    var out = [];
    var lastPos = 0;
    for (var pos of charPoses) {
        //console.log("LP:", lastPos, "P:", pos, "TEXT:", text.slice(lastPos,pos), "KEYWORD:",keyword)
        out.push(text.slice(lastPos, pos))
        lastPos = pos + keyword.length;
    }
    //add the rest of the text line
    out.push(text.slice(lastPos))

    return out.join(replacer);
}

/* End */

qs("#replaceAllBox #replace").onclick = ()=>{
    var param1 = qs("#replaceAllBox #param1").value;
    var param2 = qs("#replaceAllBox #param2").value;
    if (param1.length !== 0 && qs("#matchCase").checked == true) {
        var data = qs("#textContent").value;
        if (data.includes(param1)) {

            data = data.replaceAll(param1, param2);
            qs("#textContent").value = data;

            qs("#replaceAllBox #msg").innerHTML = "Done";
            qs("#replaceAllBox #msg").style.opacity = 1;

            setTimeout(()=>{
                qs("#replaceAllBox #msg").style.opacity = 0;
            }
            , 1500);

            delete (data);
        } else {
            qs("#replaceAllBox #msg").innerHTML = "Nothing to Replace";
            qs("#replaceAllBox #msg").style.opacity = 1;

            setTimeout(()=>{
                qs("#replaceAllBox #msg").style.opacity = 0;
            }
            , 1500);
        }
    } else if (param1.length !== 0 && qs("#matchCase").checked == false) {
        param1 = param1.toLowerCase();
        var data = qs("#textContent").value;
        var dataL = data.toLowerCase();
        if (dataL.includes(param1)) {

            qs("#textContent").value = uMatchCase(param1, param2, data);

            qs("#replaceAllBox #msg").innerHTML = "Done";
            qs("#replaceAllBox #msg").style.opacity = 1;

            setTimeout(()=>{
                qs("#replaceAllBox #msg").style.opacity = 0;
            }
            , 1500);

            delete (data);
        } else {
            qs("#replaceAllBox #msg").innerHTML = "Nothing to Replace";
            qs("#replaceAllBox #msg").style.opacity = 1;

            setTimeout(()=>{
                qs("#replaceAllBox #msg").style.opacity = 0;
            }
            , 1500);
        }
    }
}

qs("#replaceAllBox #cancel").onclick = ()=>{
    qs("#dialogsHolder").hidden = 1;
    qs("#replaceAllBox").hidden = 1;
}

/* Info Menu */

qs("#githubRepo").onclick = ()=>{
    closeAllMenus();
    window.open("https://github.com/eliasfaisal/SimpleNotepad");
}

qs("#portFolio").onclick = ()=>{
    closeAllMenus();
    window.open("https://eliasfaisal.github.io");
}
