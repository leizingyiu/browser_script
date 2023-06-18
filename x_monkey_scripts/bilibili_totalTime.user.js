// ==UserScript==
// @name        bilibili 选集总时长
// @namespace   leizingyiu.net
// @version     2022.10.18 wip

// @description 在bilibili看教程之类，有选集的，自动算一下总时长，大概知道整个教程多久看完，还有多少没看
// @icon        https://www.bilibili.com/favicon.ico
// @author      Leizingyiu
// @match       http*://www.bilibili.com/video/*
// @run-at      document-idle
// @grant       none
// @license     GNU AGPLv3 
// ==/UserScript==

const notyet = 'data-yiu-notyet', played = 'data-yiu-played', playing = 'data-yiu-playing', domIdx = 'data-yiu-idx',

    liSelector = '.video-episode-card, .cur-list .list-box li',
    liTimeSelector = '.video-episode-card__info-duration , .duration',
    liPlayingSelector = '.video-episode-card__info-playing , .on ',
    liObserverSelector = '#multi_page .cur-list, .base-video-sections .video-sections-item',

    playerObserverSelector = '.bpx-player-ctrl-btn bpx-player-ctrl-time , .bpx-player-primary-area',
    playerCurrentTimeSelector = '.bpx-player-ctrl-time-current',
    playerDurationTimeSelector = '.bpx-player-ctrl-time-duration',

    totalShowName = '总共:', beforeShowName = '已播:', afterShowName = '剩余:',

    yiu_bilibiliTimeClass = 'yiu_bilibili_time';

var playedSeconds, notyetSeconds, totalSeconds;

function __0(a) { return String(a).length < 2 ? '0' + a : a; }

function secondsToTimdcode(seconds) {
    let h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = Math.floor(seconds % 60);
    h = __0(h), m = __0(m), s = __0(s);
    return `${h}:${m}:${s}`;
}

function timecodeToSeconds(timecode) {
    let t = (timecode.split(':').length == 2 ? '0:' + timecode : timecode).split(':');
    if (t.length == 1 && isFinite(Number(t)) == true) { return Number(t) }
    if (t.length > 3) { console.log('timecode', timecode); throw ('timecode error') }
    let [h, m, s] = [...t.map(Number)], seconds = h * 3600 + m * 60 + s;
    if (isFinite(seconds) == false) { console.log('timecode', timecode); throw ('timecode error') }
    return seconds;
}

function _totalTimeFn(domArray, timeSelector) {
    return function () {
        var h = 0, m = 0, s = 0;
        domArray
            .map(function (dom) {
                if (dom.querySelector(timeSelector)) {
                    return dom.querySelector(timeSelector).innerText
                } else { return false; }
            })
            .filter(Boolean)
            .map(function (t) {
                return (t.split(':').length == 2 ? '0:' + t : t).split(':');
            })
            .map(function (a) {
                var [_h, _m, _s] = [...a];
                h = h + _h * 1;
                m = m + _m * 1;
                s = s + _s * 1
            });

        h = Math.floor((m + Math.floor(s / 60)) / 60), m = (m + Math.floor(s / 60)) % 60, s = s % 60;


        h = __0(h), m = __0(m), s = __0(s);

        return `${h}:${m}:${s}`;
    }
}
function main() {
    if (!(window.location.host.indexOf('bilibili') >= 0 && document.querySelector('.cur-page'))) { return false; }

    const domArray = [...document.querySelectorAll(liSelector)]; let nowIdx = 0;
    domArray.map((dom, idx) => {
        dom.setAttribute(domIdx, idx);
        if (dom.querySelector(liPlayingSelector) || dom.parentElement.querySelector(liPlayingSelector) == dom) {
            nowIdx = idx;
        }
    });

    domArray.map((dom, idx) => {
        [notyet, played, playing].map(state => { dom.removeAttribute(state) });
        if (idx < nowIdx) { dom.setAttribute(played, true); } else if (idx == nowIdx) { dom.setAttribute(playing, true); } else { dom.setAttribute(notyet, true); }
    });


    let beforeDom = domArray.filter(d => d.hasAttribute(played)), afterDom = domArray.filter(d => d.hasAttribute(notyet));
    let totalTime = _totalTimeFn(domArray, liTimeSelector), beforeTime = _totalTimeFn(beforeDom, liTimeSelector), afterTime = _totalTimeFn(afterDom, liTimeSelector);

    totalSeconds = timecodeToSeconds(totalTime()), playedSeconds = timecodeToSeconds(beforeTime()), notyetSeconds = timecodeToSeconds(afterTime());

    let curentParentDom = document.querySelector('.cur-page').parentElement;

    let span = document.createElement('span');
    span.style.display = 'block', span.classList.add(yiu_bilibiliTimeClass);

    [{ fn: totalTime, name: totalShowName }, { fn: beforeTime, name: beforeShowName }, { fn: afterTime, name: afterShowName }].map(obj => {
        let fn = obj.fn;
        let s = document.createElement('span');
        s.style.marginRight = '1em',
            s.innerText = obj.name + fn() + ' ',
            span.appendChild(s);
    });

    if (curentParentDom.querySelector('.' + yiu_bilibiliTimeClass)) {
        curentParentDom.querySelector('.' + yiu_bilibiliTimeClass).innerHTML = span.innerHTML;
    } else {
        document.querySelector('.cur-page').parentElement.appendChild(span);

        let style = document.createElement('style');
        style.innerHTML = `
        .${yiu_bilibiliTimeClass}{    display: block;
            float: left;
            word-break: keep-all;
            white-space: break-spaces;
        }
        .${yiu_bilibiliTimeClass} * {
            margin-right: 1em;
            word-break: keep-all;
        }`;
        document.body.appendChild(style);
    }

    curentParentDom.style.display = 'block';
    [...curentParentDom.children].map(dom => dom.style.float = 'left');
}

function playingRefresh() {

    let curentParentDom = document.querySelector('.cur-page').parentElement;
    if (!document.querySelector(playerCurrentTimeSelector)) { main(); }
    if (curentParentDom) {
        let playerCurrentSeconds = timecodeToSeconds(document.querySelector(playerCurrentTimeSelector).innerHTML),
            playerDurationSeconds = timecodeToSeconds(document.querySelector(playerDurationTimeSelector).innerHTML);

        let span = document.createElement('span');
        span.style.display = 'block', span.classList.add(yiu_bilibiliTimeClass);
        [{ t: totalSeconds, n: totalShowName },
        { t: playedSeconds + playerCurrentSeconds, n: beforeShowName },
        { t: notyetSeconds + playerDurationSeconds - playerCurrentSeconds, n: afterShowName }].map(obj => {
            let s = document.createElement('span');
            s.style.marginRight = '1em',
                s.innerText = obj.n + secondsToTimdcode(obj.t) + ' ',
                span.appendChild(s);
        });
        curentParentDom.querySelector('.' + yiu_bilibiliTimeClass).innerHTML = span.innerHTML;
    }
}

function promiseIt(fn) {
    return new Promise((resolve, reject) => {
        fn();
        resolve();
    })
};


var timerFn = null, delayTime = 1000,
    playerTimer = null, playerDelayTime = 1000;


// let playerCallback = function () {
//     playerObserver.disconnect();
//     playingRefresh();
//     playerTimer = playerTimer ? null : setTimeout(
//         () => {
//             playerObserver.disconnect();
//             playerTimer = null;

//             playerNode = document.querySelector(playerObserverSelector);
//             if (playerNode) { playerObserver.observe(playerNode, config); }
//         }, playerDelayTime);
// },
//     playerObserver = new MutationObserver(playerCallback);

setTimeout(
    function () {
        main();
    }, delayTime);

function updateVideoPlayer() {

    main();
    let videoPlayer = document.querySelector("video");
    videoPlayer.ontimeupdate = function () {
        playingRefresh();
    };

    ["seeking", "play", "seeked"].map(ev => {
        videoPlayer.addEventListener(ev, function () {
            observer.disconnect();
        })
    });
    ["ended", "pause"].map(ev => {
        videoPlayer.addEventListener(ev, function () {

            observer.observe(targetNode, config);
        })
    });
}
updateVideoPlayer();
let targetNode = document.querySelector(liObserverSelector) || document.body,
    config = { attributes: true, childList: true, subtree: true },
    callback = function (mutationsList, observer) {
        observer.disconnect();
        playerObserver.disconnect();
        promiseIt(() => { main(); });
        timerFn = timerFn ? null : setTimeout(
            () => {
                observer.disconnect();
                promiseIt(() => { main(); });
                updateVideoPlayer();


                timerFn = null;
                targetNode = document.querySelector(liObserverSelector) || document.body;

                observer.observe(targetNode, config);
                playerNode = document.querySelector(playerObserverSelector);
                if (playerNode) { playerObserver.observe(playerNode, config); }

            }, delayTime);
    },
    observer = new MutationObserver(callback);
observer.observe(targetNode, config);

