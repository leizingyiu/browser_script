// ==UserScript==
// @name        什么值得买 自动计算单价
// @namespace   leizingyiu.net
// @version     2022-07-24
// @description 在什么值得买搜索页面、首页及关注动态页面，自动计算单价
// @icon        https://www.smzdm.com/favicon.ico
// @author      Leizingyiu
// @include     *://search.smzdm.com/*
// @include     *://www.smzdm.com/
// @include     *://www.smzdm.com/#follow
// @grant       GM_setValue
// @grant       GM_getValue
// @license     GNU AGPLv3 
// 
// ==/UserScript==


const checking_local_reagent = "___",

    local_words_key = "请填写需要计算的关键字",
    default_words = '包 条 个 袋 杯 枚 颗 罐 公斤 斤 两 盒 桶';


if (GM_getValue(local_words_key, checking_local_reagent) == checking_local_reagent) {
    GM_setValue(local_words_key, default_words);
} else {
    GM_setValue('备份_' + local_words_key, GM_getValue(local_words_key));
};



var words = GM_getValue(local_words_key, default_words).split(/\s{1,}/).filter(a => Boolean(a)),//需要额外计算的量词请在这里添加，空格分隔
    wordsReg = new RegExp('\\d[\\d\\.]*\s*(' + (words.map(word => `(${word})`).join('|') + ')\\s*(\\*\\d{1,})*')),
    textReplaceReg = /(\([^\)]*\))|(\[[^\]]*\])|(「[^」]*」)|(（[^）]*）)/g,
    priceReg = /\d[\d.]*\s*(?=元)/,
    gramReg = /\d[\d.]*\s*(([千克]{1,})|(((kg)|(KG)|(Kg)|(g)|(G)){1,}))\s*(\*\d{1,})*/,
    volReg = /\d[\d.]*\s*(([毫升]{1,})|((L)|(ml)|(ML){1,}))\s*(\*\d{1,})*/,
    delayTime = 1000;//延迟时间，单位千分之一秒，1000为1秒，可自行设置

function debounce(fn, delay) {
    //https://juejin.cn/post/6978307821502726157?utm_source=gold_browser_extension
    let timer = null
    return (...args) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}

// setTimeout(smzdm_totalPrice, delayTime);
['hashchange', 'load', 'scroll'].map(ev => {
    window.addEventListener(ev, debounce(smzdm_unitPrice, delayTime));
});

if (document.querySelector('#J_column_tab_box li')) {
    [...document.querySelectorAll('#J_column_tab_box li')].map(li => {
        li.addEventListener('click', debounce(smzdm_unitPrice, delayTime));
    });
};

function smzdm_unitPrice() {

    var isFollow = window.location.href.indexOf('#follow') != -1,
        isHomePage = window.location.hostname == 'www.smzdm.com' && window.location.href.indexOf('#follow') == -1,
        isSearch = window.location.hostname.indexOf('search') != -1;

    var selector = '';

    switch (true) {
        case isHomePage:
            selector = '#feed-main-list .has-price';
            break;
        case isSearch:
            selector = '#feed-main-list h5.feed-block-title';
            break;
        case isFollow:
            selector = '#follow-list h5.feed-block-title';
            break;
        default:
            selector = 'h5.feed-block-title';

    }


    [...document.querySelectorAll(selector)]
        .filter(dom => !dom.hasAttribute('yiu_price_calculated'))
        .map(function (dom) {

            var priceDom = isHomePage ? dom.parentElement.querySelector('.z-highlight') : dom.querySelector('.z-highlight'),
                pre_text = isHomePage ? dom.innerText + '\n' + priceDom.innerText : dom.innerText,
                text = pre_text.replace(textReplaceReg, ''),
                price = text.match(priceReg),
                gram = text.match(gramReg),
                vol = text.match(volReg);


            var otherUnit = text.match(wordsReg);

            var unit = '', num = 0, priceText = '', priceKg, priceL, priceU;

            if (price == null || (gram == null && vol == null && otherUnit == null)) {
                priceText = '--';

            } else {
                price = Number(price[0]);

                if (gram != null) {
                    gram = Number(eval(gram[0].replace(/[克gG]/g, '').replace(/[kK千]/, '*1000')));
                    priceKg = price / gram * 1000;
                    priceText += priceKg.toFixed(2) + '/kg';

                }
                if (vol != null) {
                    vol = Number(eval(vol[0].replace(/[升lL]/g, '').replace(/[毫mM]/, '/1000')));
                    priceL = price / vol;
                    priceText = (gram != null ? ' | ' : '') + priceL.toFixed(2) + '/L';

                }
                if (otherUnit != null) {
                    num = Number(otherUnit[0].match(/\d*/));
                    unit = otherUnit[0].replace(/\d*/, '');
                    priceU = price / num;
                    priceText += (gram != null || vol != null ? ' | ' : '') + priceU.toFixed(2) + '/' + unit;

                    if (unit == '斤') {
                        priceText += ' | ' + (priceU * 2).toFixed(2) + '/kg';
                    }

                    if (unit == '两') {
                        priceText += ' | ' + (priceU * 20).toFixed(2) + '/kg';
                    }
                }

                if (priceText == '') {
                    priceText += '___';
                }

            }

            priceDom.style.display = 'block';
            if (isSearch) {
                priceDom.parentElement.style.width = '100%';
            }

            var span = document.createElement('span');
            span.innerText = priceText;
            span.style.float = 'right';

            priceDom.appendChild(span);

            dom.setAttribute('yiu_price_calculated', true);
        });
};