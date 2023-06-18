// ==UserScript==
// @name        fullPageThumbnailNavigator
// @namespace   leizingyiu.net
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      -
// @description 2022/9/24 23:54:32
// @require     https://unpkg.com/html2canvas
// ==/UserScript==

let container = document.createElement('div'),
    slider = document.createElement('span');

container.id = 'yiu_fullPageThumbnailNavigator';
container.style.cssText = `
height:100%;
max-width:150px;
position:fixed;
top:0;bottom:0;
left:0;
background:#aaa;
min-width: 100px;
z-index: 999999999;
`;

document.querySelector('html').appendChild(container);


let w = window.innnerWidth, h = window.innerHeight;
slider.style.cssText = `
width:100%;
border:#ff000099;
background:#ff000033;
`;

container.appendChild(slider);


function updateThumbnail0() {
    html2canvas(document.querySelector("body")).then(canvas => {
        let oImg = new Image();
        if (container.querySelector('img')) {
            oImg = container.querySelector('img');
        }

        oImg.src = canvas.toDataURL();
        oImg.style.width = '100%';

        if (!container.querySelector('img')) {
            container.appendChild(oImg);
        }
    });
}

function updateThumbnail() {
    let frag = document.createDocumentFragment();
    frag.appendChild(document.body.cloneNode(true));
    let main;
    if (container.querySelector('main')) {
        main = container.querySelector('main');
    } else {
        main = document.createElement('main');
        container.appendChild(main);
    }
    main.innerHTML = '';
    main.appendChild(frag);
}

const loadingWaitTime = 200;
const promiseIt = function (fn) {
    return new Promise((resolve, reject) => {
        fn();
        resolve();
    });
};
var timer = null;
const targetNode = document.querySelector("body"),
    config = { attributes: false, childList: true, subtree: true },
    callback = function (mutationsList, observer) {
        observer.disconnect();
        updateThumbnail();

        timer = timer
            ? null
            : setTimeout(() => {
                observer.disconnect();

                updateThumbnail();

                timer = null;
                observer.observe(targetNode, config);
            }, loadingWaitTime);
    },
    observer = new MutationObserver(callback);
observer.observe(targetNode, config);

