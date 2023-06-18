// ==UserScript==
// @name        mark@title
// @namespace   leizingyiu.net
// @match        *://*/*
// @grant       none
// @version     1.0
// @author      -
// @description 2022/9/26 00:43:49
// ==/UserScript==


var searchName = 'yiu_titleMarker', markersJoining = '; ';
var url = new URL(window.location),
    search = new URLSearchParams(url.search),
    markers = JSON.parse(search.get(searchName));
var markersToken = '';
console.log(markers);

if (markers == null) {
    markers = [];
} else {
    console.log(document.title);
    let markersToken = markers.join(markersJoining) + markersJoining;

    setTimeout(function () {
        document.title = markersToken + document.title;
    }, 1000);

}

function updateTitle() {
    var content = window.prompt('在标签标题前添加：', '');

    markers.unshift(content);
    search.set(searchName, JSON.stringify(markers));

    url.search = search.toString();

    let _url = url.href;

    markersToken = content + markersJoining + markersToken;

    observer.disconnect();
    document.title = markersToken + document.title;

    observer.observe(targetNode, config);

    window.history.pushState(null, markersToken, url);

    document.title = markersToken;
    return false;
}


const targetNode = document.querySelector('head title');

const loadingWaitTime = 200;
var timer = null;
const config = { attributes: false, childList: false, subtree: false, characterData: true },
    callback = function (mutationsList, observer) {
        observer.disconnect();
        document.title = document.title.indexOf(markersToken) != -1 ? markersToken + document.title : document.title;

        timer = timer
            ? null
            : setTimeout(() => {
                observer.disconnect();

                document.title = document.title.indexOf(markersToken) != -1 ? markersToken + document.title : document.title;


                timer = null;
                observer.observe(targetNode, config);
            }, loadingWaitTime);
    },
    observer = new MutationObserver(callback);
observer.observe(targetNode, config);



shortKeysArr = ['control', 'shift', 'alt', 'm'];



// let keys = [];
// document.onkeydown = function (ev) {
//     let k = ev.key.length == 1 ? ev.code.toLowerCase().replace('key', '') : ev.key.toLowerCase();
//     keys.push(k);
//     keys = [...new Set(keys)];
//     console.log(ev, keys);
// }
// document.onkeyup = function (ev) {
//     let k = ev.key.length == 1 ? ev.code.toLowerCase().replace('key', '') : ev.key.toLowerCase();
//     keys = keys.filter(_k => _k != k);
//     console.log(ev, keys, keys.filter(k => k != ev.key));
// }



function multKeys(keysArr, callback) {
    keysArr = [...new Set(keysArr)];
    const tokenJoining = '_',
        tokenSortFunction = (_a, _b) => {
            let a = String(_a),
                b = String(_b);
            if (a.length != b.length) {
                return a.length - b.length;
            } else {
                return a.localeCompare(b);
            }
        },
        tokenFn = arr => arr.sort(tokenSortFunction).join(tokenJoining),
        keysToken = tokenFn(keysArr);
    let keys = [];

    document.onkeydown = function (ev) {
        let k = ev.key.length == 1 ? ev.code.toLowerCase().replace('key', '') : ev.key.toLowerCase();
        keys.push(k);
        keys = [...new Set(keys)];
        console.log(ev, keys);

        let hitKeys = keys.filter(key => keysArr.includes(key)),
            hitToken = tokenFn(hitKeys);
        if (hitToken == keysToken) {
            callback(ev);
            keys = [];
        }
    }
    document.onkeyup = function (ev) {
        let k = ev.key.length == 1 ? ev.code.toLowerCase().replace('key', '') : ev.key.toLowerCase();
        keys = keys.filter(_k => _k != k);
        console.log(ev, keys);
    }
}


multKeys(shortKeysArr, updateTitle);