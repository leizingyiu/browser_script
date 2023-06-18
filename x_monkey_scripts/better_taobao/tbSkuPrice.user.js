// ==UserScript==
// @name        淘宝天猫商品选项计算单价
// @namespace   leizingyiu.net
// @version     2023.01.12
// @description 点击sku后自动计算单价，并填充到sku中
// @icon        https://img.alicdn.com/favicon.ico
// @author      Leizingyiu
// @include     *://item.taobao.com/*
// @include     *://detail.tmall.com/*
// @run-at      document-idle
// @grant       none
// @license     GNU AGPLv3

// ==/UserScript==

// todo 多选项sku 做list到unit price


/* setting */
var specialPriceSelector = ['#J_PromoPriceNum.tb-rmb-num',
    '#J_PromoPrice.tm-promo-cur > dd > div.tm-promo-price > span.tm-price',
    '[class^=Price--extraPrice] [class^=Price--priceText]'].join(','),
    // 淘宝优惠价： #J_PromoPriceNum.tb-rmb-num
    // tm 优惠价： #J_PromoPrice.tm-promo-cur > dd > div.tm-promo-price > span.tm-price
    // tm new : [class^=Price--extraPrice] [class^=Price--priceText]


    originalPriceSelector = [' #J_StrPrice > em.tb-rmb-num ',
        ' #J_StrPriceModBox > dd > span.tm-price',
        '[class^=Price--originPrice] [class^=Price--priceText]'].join(' , '),

    // 淘宝原价:  #J_StrPrice > em.tb-rmb-num
    // tm 原价: #J_StrPriceModBox > dd > span.tm-price
    // tm new : [class^=Price--originPrice] [class^=Price--priceText]

    skuSelector = ['.tb-prop dd ul li a',
        '.skuItemWrapper .skuItem'].join(' , '),
    // tm new : .skuItemWrapper.skuItem

    skuSelectedSelector = ['.tb-selected', '.current'].join(' , ');

const loadingWaitTime = 1000,
    activateGapTime = 50,
    maxActivateTime = 1000;

/* style */
let style = document.createElement('style');
{
    style.id = 'yiu_taobaoTmallUnitPrice';
    style.innerText = `
.tb-prop li a:after ,
#detail .tb-key .tb-prop li:after ,
.skuItemWrapper .skuItem:after {
    content: attr(price);
    display:content;
    white-space: break-spaces;
    line-height: 1.5em;
    word-break: break-word;
}

.tb-prop li a ,
#detail .tb-key .tb-prop li ,
#detail .tb-key .tb-prop .tb-img li a,
.skuItemWrapper .skuItem {
    line-height: 1.5em;
}

.tb-prop li a ,
#detail .tb-key .tb-prop li,
.skuItemWrapper .skuItem  {
  white-space:break-all;
  line-height:1.5em;
}


`;
    document.body.appendChild(style);
}

/* main function */
function fn() {
    let that = this;
    const beforeResult = that.getAttribute('price');


    let priceBox = document.querySelector(specialPriceSelector) ? document.querySelector(specialPriceSelector) : document.querySelector(originalPriceSelector);
    if (!priceBox) {
        let errorText = '很抱歉，找不到价格。请反馈本页面链接，谢谢。';
        console.error(errorText); return false;
    }
    let beforePriceText = priceBox.innerText;
    // console.log('before price :',beforePriceText);


    that.setAttribute('price', '..');
    var loading = setInterval(function () {
        that.setAttribute('price', that.getAttribute('price') + '.');
        if (that.getAttribute('price').length >= 6) {
            that.setAttribute('price', '.');
        }
    }, loadingWaitTime / 10);



    var timer = setInterval(gettingPrice, activateGapTime);
    var runingtime = 0;

    function gettingPrice() {
        runingtime += activateGapTime;

        if (!that.parentElement.parentElement.querySelector(skuSelectedSelector)) {
            that.setAttribute('price', beforeResult);
            clearInterval(loading);
            clearInterval(timer);
            return false;
        };

        let priceBox = document.querySelector(specialPriceSelector) ? document.querySelector(specialPriceSelector) : document.querySelector(originalPriceSelector);
        let price = priceBox.innerText;
        // console.log(beforePriceText,price);

        const setPrice = () => { that.setAttribute('price', '¥' + price + ' | ' + unitPrice(that.innerText, price)) }

        if (price == beforePriceText) {
            if (runingtime > maxActivateTime) {
                clearInterval(loading);
                clearInterval(timer);
                if (price.indexOf('-') != -1) {
                    that.setAttribute('price', 'plsRetry');
                } else {
                    setPrice();
                }
            } else {
                return false;
            }
        } else {
            setPrice();
            clearInterval(loading);
            clearInterval(timer);

        }


    }
}

/* addEventListener */
let settingEvent = setInterval(addingEvent, 500);

function addingEvent() {
    // console.log(document.querySelectorAll(skuSelector));
    [...document.querySelectorAll(skuSelector)]
        .map(li => {
            // console.log(li);
            li.addEventListener('click', fn);
            // li.setAttribute('price', '_click2calc_');
        })
        .filter((d, idx) => idx == 0).map(d => {
            clearInterval(settingEvent);
        });
}


// /* activate */
// [...document.querySelectorAll(skuSelector)].map((li, idx) => {
//     setTimeout(
//         () => {
//             li.click()
//         },
//         idx * loadingWaitTime + activateGapTime
//     );
// });

var words = "包 条 个 袋 杯 枚 颗 罐 公斤 斤 两 盒 桶 只 支"
    .split(/\s{1,}/)
    .filter((a) => Boolean(a)),
    wordsRegStr = words.map((word) => `${word}`).join("|"),
    wordsReg = new RegExp(
        "\\d[\\d\\.]*s*(" +
        wordsRegStr + ")\\s*([\\*x]\\d{1,})*(" + wordsRegStr + ')*', 'g'
    ),
    textReplaceReg = /(\([^\)]*\))|(\[[^\]]*\])|(「[^」]*」)|(（[^）]*）)/g,
    priceReg = /\d[\d.]*\s*(?=元)/,
    gramReg = /\d[\d.]*\s*(((千*克){1,})|(((kg)|(KG)|(Kg)|(g)|(G)){1,}))\s*([\*x]\d{1,})*/,
    volReg = /\d[\d.]*\s*(((毫*升){1,})|((L)|(ml)|(ML){1,}))\s[*x]([\*x]\d{1,})*/;


function unitPrice(text, price) {
    let nonResult = '--';
    text = typeof text == 'undefined' ? '' : text, price = typeof price == 'undefined' ? 0 : price;
    if (text == '' || price == 0) { return nonResult; }

    let gram = text.match(gramReg), vol = text.match(volReg),
        otherUnit = text.match(wordsReg), priceText = "";

    console.log(price, gram, vol, otherUnit, wordsReg);

    if (price == 0 || (gram == null && vol == null && otherUnit == null)) {
        priceText = nonResult;
    } else {
        price = Number(price);


        [gram, vol].filter(u => u != null).map(u => {
            let _unit = '';
            let _u = Number(eval(u[0]
                .replace(/x/, '*')
                .replace(/[克gG升lL]/g, function () {
                    _unit = arguments[0]; return '';
                })
                .replace(/[毫mM]/, "/1000")
                .replace(/[kK千]/, "*1000")));
            let _price = price / _u;
            priceText += (priceText.length > 1 ? '|' : '') + _price.toFixed(2) + '/' + _unit;
        })


        if (otherUnit != null) {
            otherUnit.map(un => {
                console.log(un, wordsReg);
                let splitReg = new RegExp('(\\d*[\\d.]*)\\s*(' + wordsRegStr + ')\\s*([\*x]\\d*[\d.]*)(' + wordsRegStr + '*)', 'g');
                let n1 = '', n2 = '', u1 = '', u2 = '';
                un.replace(splitReg, function () {
                    console.log('unite---', arguments);
                    n1 = arguments[1], n2 = arguments.length >= 3 ? arguments[3] : '1',
                        n2 = n2.replace(/[\*x]/g, '');
                    n1 = Number(n1), n2 = Number(n2);

                    u1 = arguments.length >= 2 ? arguments[2] : '',
                        u2 = arguments.length >= 4 ? arguments[4] : '';

                    console.log(n1, u1, n2, u2);
                    return true;
                });

                [u1, u2].filter(u => '斤两'.indexOf(u) != -1).map(u => {
                    let k = 1; if (u == '两') { k = 10; }
                    priceText += (priceText == '' ? '' : '|') + (price / (n1 * n2) * 2 * k).toFixed(2) + '/kg';
                });

                priceText += (priceText == '' ? '' : '|') + (price / (n1 * n2)).toFixed(2) + '/' + u1;
                priceText += (priceText == '' ? '' : '|') + (price / (n2)).toFixed(2) + '/' + u2;
                console.log(n1, n2, u1, u2);

            });
        }

        if (priceText == "") {
            priceText += "___";
        }
    }
    console.log(priceText);
    return priceText;
}

