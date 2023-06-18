// ==UserScript==
// @name        local_preview
// @namespace   Violentmonkey Scripts
// @match       file://*/*
// @grant       none
// @version     2023_01_29
// @author      leizingyiu
// @description View file://...  thumbnails in your browser  
// ==/UserScript==

// todo   popup layer
// Created: "2023/1/28 01:02:39"
// Last modified: "2023/02/09 19:31:14"

const videoDict = ['webm', 'mp4', 'ogg', 'ogv'],
  imgDict = ['webp', 'jpg', 'jpeg', 'gif', 'png', 'bmp'],
  audioDict = ['mp3', 'ogg', 'wav'],
  objectDict = ['pdf', 'svg', 'txt'],
  cols = 5;

/* style */
(() => {
  if (!document.body) { return false; }
  let style = document.createElement('style');
  style.id = 'yiu_preview';
  style.innerText = `
  body{
  --cols:${cols};
  --w:calc( ( (100 / var(--cols) ) - 1.6 ) * 1vw );
  }

table {
    width: 100%;
    position: relative;
}

thead {
    display: none;
}

tbody#tbody{
    display:flex!important;    flex-wrap: wrap  ;
}

#tbody tr{

    width:var(--w);
    display:flex!important;    flex-direction: column ;
    margin: 0 1vw 1.6vw 0;
    position:relative;
    padding-top:1em;
    padding-bottom: 2em;
}
#tbody td{
    width: 100%;
    display: flex;    place-content: space-around;    justify-content: flex-start;
    /* padding-left: 1.5em; */
    /* padding-inline-start: 1.5em; */
    text-align: start;
    white-space: pre-wrap;
}
#tbody td:nth-of-type(1){
display: flex; justify-content: center;
align-items: center;
}
#tbody td.detailsColumn {
    padding-inline-start: 3em;

    bottom: 1.5em;
    position: absolute;
    font-size: 0.5em;
    color: #999;
    }
  #tbody  tr td:last-child{
  bottom:0;
  }

#tbody td *, #tbody td a{
display:inline-block;
width: auto;
word-break: break-word;
max-height: calc( var(--w) *2 ) ;    max-width: 100%;
cursor: pointer;
}
#tbody td a.dir_icon,#tbody td a.file_icon{
         width:80%; height:80%;        background-size: contain;    background-position: center;
 }
#tbody td.dir_td,#tbody td.file_td{
height:calc( var(--w)*0.5 );
}
#tbody  .yiu_preview{
cursor:pointer;
transition:opacity 0.5s ease;
display:block; height:var(--h)
}

#tbody  .yiu_preview.hide{
opacity:0;
height:var(--h)
}
 `;
  document.body.appendChild(style);
})();

function lazyloading_a_dom(dom, change) {
  if (typeof change == 'undefined') { var change = { intersectionRatio: 1 }; }

  if (change.intersectionRatio <= 0) {
    dom.removeAttribute(dom.getAttribute('data-lazyloading-target'));
    dom.classList.add('hide');
  }

  if (change.intersectionRatio > 0.01) {
    dom.setAttribute(dom.getAttribute('data-lazyloading-target'), dom.getAttribute('data-lazyloading-src'));
    dom.classList.remove('hide');
    dom.onload = function () {
      console.log(dom.clientHeight);
      dom.style.setProperty('--h', dom.clientHeight + 'px');
    }
    dom.addEventListener('canplay', function (e) {
      console.log(dom.clientHeight);
      dom.style.setProperty('--h', dom.clientHeight + 'px');
    });
  }
}
var observer = new IntersectionObserver(
  function (changes) {

    console.log(arguments);
    changes.forEach(function (change) {
      var d = change.target;
      var doms = []; doms.push(d);
      if (d.previousElementSibling) {
        doms.push(d.previousElementSibling);
      }
      if (d.nextElementSibling) {
        doms.push(d.nextElementSibling);
      }
      doms.map(dom => { lazyloading_a_dom(dom, change); });
    });
  }
);



/* list => preview thumb */
(() => {
  [...document.querySelectorAll('#tbody tr')].reduce(function (previousValue, tr, idx, arr) {

    return new Promise((resolve, reject) => {

      let td = document.createElement('td');
      if (tr.querySelector('.dir')) {
        let a = document.createElement('a');
        a.classList.add('dir', 'dir_icon');
        td.appendChild(a);
        td.classList.add('dir_td');
        a.setAttribute('path', tr.querySelector('.dir').href);
        a.setAttribute('title', 'dbClick to open ' + tr.querySelector('.dir').href);
        a.ondblclick = function (event) {
          console.log(this);
          window.location.href = this.getAttribute('path');
        };
      } else {
        let a = tr.querySelector('td a');
        let imgBoo = false, videoBoo = false, audioBoo = false, objectBoo = false;
        try {
          let lastName = a.href.split('/').pop().indexOf('.') == -1 || !a.href.split('/').pop().match(/\.[0-9a-zA-Z]+$/) ?
            '' :
            a.href.split('/').pop().match(/\.[0-9a-zA-Z]+$/)[0].replace(/\./g, '').toLowerCase();

          if (videoDict.includes(lastName)) { videoBoo = true; }
          if (imgDict.includes(lastName)) { imgBoo = true; }
          if (audioDict.includes(lastName)) { audioBoo = true }
          if (objectDict.includes(lastName)) { objectBoo = true; }

          let dom;
          switch (true) {
            case imgBoo:
              dom = document.createElement('img');
              // dom.src = a.href;
              dom.setAttribute('data-lazyloading-target', 'src');
              tr.classList.add('is_image');
              break;

            case videoBoo:
              dom = document.createElement('video');
              // dom.src = a.href;
              dom.setAttribute('data-lazyloading-target', 'src');
              dom.autoplay = 'false'; dom.muted = 'true';
              dom.addEventListener('mouseenter', function () {
                console.log(dom);
                dom.setAttribute('controls', 'true');
              });
              dom.addEventListener('mouseleave', function () {
                console.log(dom);
                dom.removeAttribute('controls');
              });

              tr.classList.add('is_video');
              break;

            case audioBoo:
              dom = document.createElement('video');
              // dom.src = a.href;
              dom.setAttribute('data-lazyloading-target', 'src');
              dom.autoplay = 'false', dom.muted = 'true', dom.controls = 'true';

              tr.classList.add('is_audio');
              break;

            case objectBoo:
              dom = document.createElement('object');
              // dom.data = a.href;
              dom.setAttribute('data-lazyloading-target', 'data');
              break;

            default:
              dom = document.createElement('a');
              dom.setAttribute('data-lazyloading-target', 's-r-c');
              dom.classList.add('file', 'file_icon');
              td.classList.add('file_td');
          }
          if (typeof dom != 'undefined') {
            observer.observe(dom);

            dom.setAttribute('data-lazyloading-src', a.href);
            dom.setAttribute('title', 'dbClick to open ' + a.href);

            dom.classList.add('yiu_preview');
            dom.ondblclick = function () {
              console.log(dom, a.href);
              window.open(a.href, "_blank"); return false;
            };
            dom.onmouseover = function () {
              if (!dom.getAttribute('src')) { lazyloading_a_dom(dom); }
            }
            dom.style.objectFit = 'contain';
            td.appendChild(dom);
          }

        } catch (err) { console.error(a, err); }
      }
      tr.insertBefore(td, tr.children[0]);
    });

  }, Promise.resolve())
})();

/* h1 title path link */
(() => {
  let h1 = document.querySelector('h1#header');
  if (!h1) { return false; }
  let h1text = h1.innerText, h1arr = h1text.split('/');

  h1arr.pop(); h1arr.shift(); h1.innerHTML = '';

  let span = document.createElement('span');
  span.innerText = '/'; h1.appendChild(span);

  h1arr.map((l, idx) => {
    let a = document.createElement('a');
    a.innerText = l; a.href = window.location.origin + '/' + h1arr.slice(0, idx + 1).join('/') + '/';
    h1.appendChild(a);
    let span = document.createElement('span');
    span.innerText = '/'; h1.appendChild(span);
  });
})();