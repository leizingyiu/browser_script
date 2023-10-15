// ==UserScript==
// @name        testing - 简易标签休眠/simpleTagSleeper - 标签被切换到非活动状态时减少活动
// @namespace   leizingyiu.net
// @match       *://*/*
// @grant       none
// @version     2023/10/12 01:50:47
// @author      leizingyiu
// @description 2023/10/12 01:50:47
// ==/UserScript==

// Created: "2023/10/12 01:50:47"
// Last modified: "2023/10/16 00:40:39" 


//default_settings;
let settings = {
    video: {
        autoPause: true,
        autoRePlay: true
    },

    popAnAlert: true,
    waitBeforeAlertJsSleep: 5,

    tryStopCssAnimation: true
};

let website_settings = {
    "bilibili.com": {
        popAnAlert: false
    }
}

let website = Object.keys(website_settings).filter(k => location.hostname.indexOf(k) != -1);
website = website ? website[0] : false;
if (website) {
    settings = Object.assign(settings, website_settings[website]);
}

console.log(website, settings);

const alertPauseClass = 'yiu_tagSleep_jsAlert',
    videoClass = 'yiu_tagSleep_video_pause';


function videoSleep(autoRePlay = settings.video.autoRePlay,
    autoPause = settings.video.autoPause) {

    if (document.hidden) {
        if (autoPause) {
            [...document.querySelectorAll('video')].map(video => {
                if (!video.paused) {
                    video.classList.add(videoClass);
                    video.pause();
                };
            })
        }
    } else {
        if (document.documentElement.classList.contains(alertPauseClass)) {
            return false;
        }
        if (autoRePlay) {
            [...document.querySelectorAll('video')].map(video => {
                if (video.classList.contains(videoClass)) {
                    video.classList.remove(videoClass);
                    video.play();
                };
            });
        }
    }
}

alertSleeper = null;
document.documentElement.classList.remove(alertPauseClass);
function alertToPauseJs(boo = settings.popAnAlert, waitTime = settings.waitBeforeAlertJsSleep * 1000) {
    console.log(boo);
    if (!Boolean(boo)) { return; }

    let oldSleeper = Boolean(alertSleeper);
    if (document.hidden && Boolean(!alertSleeper)) {
        alertSleeper = setTimeout(function () {
            document.documentElement.classList.toggle(alertPauseClass);


            document.removeEventListener("visibilitychange", main);

            let _boo = confirm('休眠中，点击确定继续播放/浏览⬇️');
            if (_boo) { videoSleep(); }
            document.addEventListener("visibilitychange", main);

        }, waitTime);
    } else {
        clearTimeout(alertSleeper);
        alertSleeper = null;
    }

    if (oldSleeper != Boolean(alertSleeper)) {
        document.documentElement.classList.toggle(alertPauseClass);

        if (document.documentElement.classList.contains(alertPauseClass)) {
            document.removeEventListener("visibilitychange", main);
        } else {
            document.addEventListener("visibilitychange", main);
        }

        videoSleep();
    }
}

function main() {
    videoSleep();

    alertToPauseJs();
}
document.addEventListener("visibilitychange", main);



