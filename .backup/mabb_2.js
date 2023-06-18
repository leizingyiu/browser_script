// ==UserScript==
// @name        描述匹配正则，屏蔽图片
// @namespace   leizingyiu.net
// @version     2022-07-17
// @description 按照个人喜好，在block_keywords填写关键字，用中文或者英文逗号隔开，就可以根据这些关键字，把对应的图片，替换成 replacement 的火，或者自行填写 replacement 的内容
// @icon        https://www.leizingyiu.net/animated_favicon.gif
// @author      Leizingyiu
// @include     *://*.taobao.com/*
// @include     *://*.jd.com/*
// @include     *://*.weibo.com/*
// @include     *://weibo.com/*
// @grant       none
// @license     GNU AGPLv3 
// ==/UserScript==

//在这里填写关键字，用中文或者英文逗号隔开
var block_keywords = '美女，图片，视频，转发，分享，肖战，双立人，滴露，益达，usmile,gucci,GUCCI,开小灶，隅田川，德芙，石头科技，欧扎克'.split(/[\s,，]{1,}/).filter(a => Boolean(a)),
    wordsReg = new RegExp('(' + (block_keywords.map(word => `(${word})`).join('|') + ')'), 'i'),
    replacement = '🔥',
    delayTime = 500,
    webSelectors = {
        'taobao.com': {
            '.item': { //淘宝搜索列表
                'detect': '.ctx-box',
                'hide': '.pic-box'
            },
            'li[class^=c2018],li.oneline': {// 淘宝搜索页右侧,以及搜索页下方
                'detect': 'a[class$=red],div[class$=line2]',
                'hide': 'div[class$=imgwrap]'
            },

            '.tb-recommend-content-item': { //淘宝首页推荐内容
                'detect': '.info-wrapper',
                'hide': '.img-wrapper'
            },
            'a.item': {
                'detect': 'div.item-title',
                'hide': 'div.item-image-wrap'
            },

            'ul.ald-switchable-content>li': {//天猫详情页右侧 看了又看
                'detect': 'div.img',
                'hide': 'div.img'
            },
            '.tuijian-bd-window li': { //淘宝详情页右侧 看了又看
                'detect': '.tuijian-img',
                'hide': '.tuijian-img'
            }
        },
        'jd.com': {
            '.gl-i-wrap': { //京东搜索列表
                'detect': '.p-name',
                'hide': '.p-img'
            },
            'div.mc li[id^=ad]': { //京东搜索列表 左侧推荐
                'detect': '.p-name',
                'hide': '.p-img'
            },
            'weibo.com': {
                '.vue-recycle-scroller__item-view': {//微博 全部关注 
                    'detect': 'article',
                    'hide': 'div[class^=content_row]'
                }
            }
        }
    };
// console.log(wordsReg);
function blockThem() {
    let checker = 'block-checked';
    Object.keys(webSelectors).map(host => {
        if (window.location.host.indexOf(host) != -1) {
            let selectors = webSelectors[host];

            Object.keys(selectors).map(selector => {
                // console.log(selector, document.querySelectorAll(selector));

                [...document.querySelectorAll(selector)].filter(dom => !dom.hasAttribute(checker)).map(dom => {
                    dom.setAttribute(checker, true);
                    let detectDom = dom.querySelector(selectors[selector]['detect']),
                        hideDom = dom.querySelector(selectors[selector]['hide']);

                    if (detectDom) {
                        console.log(dom, detectDom, detectDom.innerText, detectDom.innerHTML, hideDom);
                    }

                    if (detectDom && detectDom.innerHTML.match(wordsReg)) {
                        // console.log(dom, detectDom, hideDom, detectDom.innerHTML.match(wordsReg));

                        if (hideDom) {
                            [...hideDom.children].map(h => { h.style.opacity = '0'; /*h.style.display = 'none';*/ });
                            let fire = document.createElement('i');
                            fire.innerText = replacement;
                            fire.style.cssText = `pointer-events: none; overflow:hidden;
                            position:absolute;width:100%;height:100%;
                            left:0;right:0;top:0;bottom:0;
                            line-height:1em;`;
                            fire.style.fontSize = hideDom.clientHeight + 'px';
                            hideDom.style.overflow = 'hidden';
                            hideDom.style.position = 'relative';
                            hideDom.appendChild(fire);
                        }


                    }

                });
            });

        }
    });
}
blockThem();



window.onload = function () {
    setTimeout(blockThem, delayTime);
}


let timer = null, blockFn = null;
let observer = new MutationObserver(mutations => {
    // console.log(mutations) 




    if (blockFn) {
        return
    } else {
        blockFn = function () {
            setTimeout(blockThem, delayTime);
            setTimeout(() => {
                blockFn = null;
            }, delayTime + 100);
        };
    }

    if (timer) { clearTimeout(timer); }

    timer = setTimeout(function () {
        console.log('run blockFn');
        blockFn();
    }, delayTime);

})

observer.observe(document.querySelector('body'),
    { attributes: false, childList: true, subtree: true }
)

