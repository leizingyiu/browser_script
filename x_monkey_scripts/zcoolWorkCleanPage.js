// ==UserScript==
// @name        zcoolWorkCleanPage - 站酷 work 页面简化
// @namespace   leizingyiu.net
// @match       http*://www.zcool.com.cn/work/*
// @grant       none
// @version     2022.10.10
// @author      -
// @description 站酷 work 页面简化 ，快捷键 ctrl shift alt + c
// @license     GNU AGPLv3
// ==/UserScript==

var shortKeysArr = ['control', 'shift', 'alt', 'c'];
var searchName = 'yiu_zcoolWorkClean';
var url = new URL(window.location),
    search = new URLSearchParams(url.search),
    cleanBoo = eval(search.get(searchName));

function zcoolClean(doc) {
    doc = doc ? doc : document;
    let main = [...doc.querySelectorAll('main>div>section>div')].filter(div => div.classList.length == 0).pop();
    let title = doc.querySelector('.titleBox').parentElement;

    let style = doc.createElement('style');
    style.innerHTML = `
        .ReactModalPortal {
            display: none;
        }
        html,body{
            overflow-y: auto!important;
        }
        *{max-width:100vw;}
`

    doc.body.innerHTML = title.innerHTML + main.innerHTML;
    doc.body.appendChild(style);
}

function updateClean() {
    url = new URL(window.location),
        search = new URLSearchParams(url.search),
        cleanBoo = eval(search.get(searchName));

    console.log(cleanBoo, search.get(searchName));
    cleanBoo = !cleanBoo;
    console.log(cleanBoo);

    search.set(searchName, cleanBoo);
    url.search = search.toString();

    var _url = url.href;
    window.history.pushState(null, null, _url);

    if (cleanBoo == true) {
        zcoolClean(document);
    } else {
        window.location = _url;
    }
}

function multKeys(keysArr, callback) {
    keysArr = [...new Set(keysArr)];
    console.log(keysArr);

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

    window.addEventListener('keydown', function (ev) {
        let k = ev.key.length == 1 ? ev.code.toLowerCase().replace('key', '').replace('digit', '') : ev.key.toLowerCase();
        keys.push(k);
        keys = [...new Set(keys)];
        console.log(ev, keys);

        let hitKeys = keys.filter(key => keysArr.includes(key)),
            hitToken = tokenFn(hitKeys);
        if (hitToken == keysToken) {
            callback(ev);
            keys = [];
        }
    })
    window.addEventListener('keyup', function (ev) {
        let k = ev.key.length == 1 ? ev.code.toLowerCase().replace('key', '').replace('digit', '') : ev.key.toLowerCase();
        keys = keys.filter(_k => _k != k);
        console.log(ev, keys);
    })
}


if (cleanBoo == true) {
    zcoolClean(document);
}

multKeys(shortKeysArr, updateClean);