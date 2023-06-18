// ==UserScript==
// @name:cn     onetab超链接预览器
// @name        onetabLinkPreviewer
// @namespace   leizingyiu.net
// @include       http*://*.one-tab.com/page/*
// @include       http*://*.bing.com/*
// @include       /http.*:\/\/\d*\.\d*\.\d*\.\d*:*\d*.*/
// @include       file://*
// @include       http*://monsnode.com/*

// @-include      *://*/*

// @grant       none
// @version     1.111
// @author      -
// @description 2022/9/28 14:39:47
// ==/UserScript==

const iframeId = 'yiu_linkPreview_iframe', iframeClass = 'yiu_linkPreview',
    bodyClass = 'previewPage',
    aClass = 'previewing',
    oriW = 1440,
    frameW = 480,
    scaleK = frameW / oriW;




bodyCapture = false; aCapture = true;
let iframe = document.createElement('iframe');
iframe.id = iframeId;
iframe.classList.add(iframeClass);
document.body.appendChild(iframe);

let openNewKeys = ['shift', 'z'],
    openKeys = ['shift', 'x'];




let style = document.createElement('style');
style.innerHTML = `
    iframe#${iframeId}{
      width:${oriW}px; height:${100 / scaleK}vh;
      position:fixed; top:0; right:-100vw;
      transform:scale(0,${scaleK});
      transform-origin:right top;
      pointer-events: none;
      opacity:0;
      background: #fffa;
    }

    body.${bodyClass}{
      padding-right:${oriW * scaleK}px;
    }
    
    body.${bodyClass} iframe#${iframeId}.${iframeClass}{
      transform:scale(${scaleK})!important;
      right:0!important;
      pointer-events:auto;
      opacity:1;
    }


    a.${aClass}{
    background: var(--bgc);
    color: #fff;
    }
    a{transition:background 0.5s ease;}
    body{transition:padding 0.5s ease;}
    iframe{transition:transform 0.5s ease , right 0.5s ease,  opacity 0.3s ease;}
`;
document.body.appendChild(style);

let keysAttrName = 'data-keys';

window.addEventListener('keydown', function (ev) {
    let k = document.body.getAttribute(keysAttrName);
    let keys = [];
    if (k) {
        keys = JSON.parse(k);
    }
    keys.push(ev.code.match(/key/i) ? ev.code.replace(/key/i, '').toLowerCase() : ev.key.toLowerCase());

    keys = [...new Set(keys)];

    // console.log('down', ev.key, ev.code, ev.code.replace(/key/i, '').toLowerCase(), k, keys, ev);

    document.body.setAttribute(keysAttrName, JSON.stringify(keys));
});

window.addEventListener('keyup', function (ev) {
    let k = document.body.getAttribute(keysAttrName);
    let keys = [];
    if (k) {
        keys = JSON.parse(k);
    }
    keys = keys.filter(_k => !(_k == ev.key.toLowerCase() || _k == ev.code.replace(/key/i, '').toLowerCase()));


    keys = [...new Set(keys)];

    console.log('up', ev.key, ev.code, ev.code.replace(/key/i, '').toLowerCase(), k, keys, ev);

    document.body.setAttribute(keysAttrName, JSON.stringify(keys));
});
window.addEventListener('focus', (ev) => {
    document.body.setAttribute(keysAttrName, '');
});

[...document.querySelectorAll('a')].filter(a => !a.href.match(/^javascript/)).map(a => {
    a.style.setProperty('--bgc', `hsl(${360 * Math.random()}deg ${70 + 20 * Math.random()}% 50%)`);
    a.removeAttribute('target');
    a.setAttribute('data-link', a.href);
    a.setAttribute('href', 'javascript:void 0;');
    let origFn = a.onclick;
    a.addEventListener('click', function (ev) {
        console.log(ev);

        const openBoo = ev.ctrlKey || ev.metaKey, jumpBoo = ev.shiftKey;
        if (openBoo == false && jumpBoo == false) {

        } else {


        }


        let k = document.body.getAttribute(keysAttrName);
        let keys = [];
        if (k) {
            keys = JSON.parse(k);
        }

        console.log(keys, openNewKeys, openKeys,
            !openNewKeys.filter(_k => !keys.includes(_k)).length,
            !openKeys.filter(_k => !keys.includes(_k)).length
        );
        switch (true) {
            case (!openNewKeys.filter(_k => !keys.includes(_k)).length):
                if (origFn) {
                    origFn();
                }
                if (a.getAttribute('data-link')) {

                    window.open(a.getAttribute('data-link'), '_blank');

                }
                break;
            case (!openKeys.filter(_k => !keys.includes(_k)).length):
                if (origFn) {
                    origFn();
                }


                if (a.getAttribute('data-link')) {

                    window.location.href = a.getAttribute('data-link');

                }
                break;
            default:
                console.log(a.getAttribute('class'), a.classList.contains(aClass));
                if (!a.classList.contains(aClass)) {


                    setTimeout(function () {
                        a.classList.add(aClass);
                        iframe.src = a.getAttribute('data-link');

                        document.body.classList.add(bodyClass);
                    }, 200);
                }

                document.body.classList.remove(bodyClass);
                [...document.querySelectorAll(`.${aClass}`)].map(_a => {
                    _a.classList.remove(aClass);
                });
                iframe.src = null;

                return false;
        }


    }, aCapture);

    a.onmouseenter = function () {
        // console.log(a,'in');
        document.body.removeEventListener('click', bodyClickFn);
    }

    a.onmouseleave = function () {
        // console.log(a,'out');
        document.body.addEventListener('click', bodyClickFn, bodyCapture);
    }
}, false);



function bodyClickFn() {
    console.trace('bodyClick');

    document.body.classList.remove(bodyClass);
    [...document.querySelectorAll(`.${aClass}`)].map(_a => {
        _a.classList.remove(aClass);
    });
}


document.body.addEventListener('click', bodyClickFn, bodyCapture);

let titles = [...document.querySelectorAll('.tabGroupLabel')].map(t => t.innerText).join(' / ');
document.title = titles + ' | ' + document.title;

