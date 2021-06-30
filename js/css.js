// 26 / 06 / 2021 | 10:01
// CSS Shorcuts JS File
// Author : Elias Faisal

function qs(s) {
    return document.querySelector(s);
}
function qsa(s) {
    return document.querySelectorAll(s);
}

function ce(t) {
    return document.createElement(t);
}

//==============
onresize = ()=>{
    qs("#textContentHolder").style.height = (innerHeight - 50) + "px";
}
onresize()
