// ==UserScript==
// @name        updateZcoolImgAlt
// @namespace   leizingyiu.net
// @match       http*://www.zcool.com.cn/work/*
// @grant       none
// @version     1.0
// @author      -
// @description 2022/9/26 22:59:11
// ==/UserScript==


window.onload = function () {
    setTimeout(
        function () {
            link = window.location.href.replace(/(?<=\?).*/g).replace(/\//g, '_');

            author = document.querySelector('section > div > div:nth-child(1) > div.sc-hKwDye.igMvVB > div.sc-hKwDye.cSRiKZ > a > span').innerText;
            title = document.title;
            console.log( author, title,link);

            [...document.querySelectorAll('img[alt]')].map(i => {
                i.setAttribute('alt', [ title,author,link].join(' ') + ' ' + i.getAttribute('alt'));
            });
        }, 1000);
}