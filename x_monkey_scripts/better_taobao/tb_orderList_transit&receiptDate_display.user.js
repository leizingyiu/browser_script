// ==UserScript==
// @name        淘宝订单页优化：显示物流 + 显示自动收货时间
// @namespace   leizingyiu.net
// @match       http*://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm
// @grant       none
// @version     2023/2/2 11:44:59
// @author      leizingyiu
// @description 2023/2/2 11:44:59
// ==/UserScript==

// Created: "2023/2/2 11:44:59"
// Last modified: "2023/02/09 15:41:19"


function addStyle(style_sheet_id, style_text) {
    if (document.getElementById(style_sheet_id)) {
        document.getElementById(style_sheet_id).innerText = style_text;
    } else {
        let style = document.createElement('style');
        style.innerText = style_text;
        style.id = style_sheet_id;
        document.body.appendChild(style);
    }
}

function addStyleWithParentClass(style_sheet_id, style_text_class, style_text) {

    const styleText = style_text.replace(/([^\}]+)(?=\{)/g, function () {
        let l = arguments[0].split(/[,\n\r]/);
        l = !l ? [arguments[0]] : l.filter(_l => _l.length > 0);
        return l.map(_l => `.${style_text_class} ` + _l).join(',\n');
    }).replace(/ +/g, ' ');
    addStyle(style_sheet_id, styleText);

}

//直接显示物流信息
function yiu_showTransit() {
    const showTransitClass = 'yiu_showTransit';
    addStyle(showTransitClass + '_style',
        `.${showTransitClass}{margin-top: 1em;position:relative; display: flex;    flex-direction: column;}
  
            .${showTransitClass}::before{ content:attr(data-transit-preview);         opacity:1;max-height:100vh;max-width:100vw; }
            .${showTransitClass}::after{  content:attr(data-transit-detail);          opacity:0;max-height:0vh;max-width:0vw;     }
  
            /*.${showTransitClass}:hover::before{ opacity:0;max-height:0vh;max-width:0vw; }*/
            .${showTransitClass}:hover::after{  opacity:1;max-height:100vh;max-width:100vw; }
  
            .${showTransitClass}::before,.${showTransitClass}::after{  display:inline-block;     position:relative;top:0;left:0;   overflow:hidden;    transition:max-width 0.6s ease, max-height 0.3s ease, opacity 0.6s ease; }
  `);

    [...document.querySelectorAll('table[class^=bought-table]')]
        .map(table => {
            if (table.innerText.indexOf('查看物流') != -1) {
                fetch(`https://buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId=${table.querySelector('tbody > tr > td > span > span:nth-child(3)').innerText}`)
                    .then(
                        res => res.blob()
                    ).then(
                        (data) => {
                            let reader = new FileReader();

                            reader.onload = () => {
                                var text = reader.result;
                                let j = JSON.parse(text),
                                    p = Boolean(j.address) && j.address.length > 0 ? j.address[0].place : '';

                                if (p.length > 0) {
                                    p = p.replace(/([\]）】，。]{1,})/g, '$1\n').replace(/\n{2}/g, '\n');
                                    let span = document.createElement('span');
                                    let pList = p.split(/[。]/);
                                    let preview = pList ? pList[0] + '。' : p;
                                    pList.shift();
                                    let detail = pList.length > 0 ? pList.join('。') : '';
                                    if (detail.match(/\S/)) { preview = preview + ' ▾'; }

                                    span.setAttribute('data-transit-preview', preview);
                                    span.setAttribute('data-transit-detail', detail);

                                    span.innerText = ' ';
                                    span.classList.add(showTransitClass);
                                    table
                                        .querySelector('tbody:nth-child(3) > tr:nth-child(1) > td:nth-child(6) > div')
                                        .appendChild(span);

                                    let a = [...table.querySelectorAll('a')].filter(_a => _a.innerText.indexOf('查看物流') != -1);
                                    a = a.length > 0 ? a[0] : false;
                                    if (a) { a.innerText = a.innerText + ' :'; }

                                }

                            }
                            reader.readAsText(data, 'GBK');
                            return reader.result;
                        }
                    );
            }
        });
}

//直接显示自动确认订单时间
function yiu_showAutoReceipt() {
    const autoReceiptClass = 'yiu_autoReceipt';
    addStyle(autoReceiptClass + '_Style', `.${autoReceiptClass}{        display:inline-block;        padding-top:0.5em;        line-height:1.5em;        font-style: normal;    }`);

    [...document.querySelectorAll('.js-order-container tbody:nth-child(3) > tr:nth-child(1) > td:nth-child(7) > div > p:nth-child(1) > span > span')]
        .map(span => {
            let s = span.innerText;
            let d = s.match(/\d*(?=天)/), h = s.match(/\d*(?=时)/), m = s.match(/\d*(?=分)/);
            d = d && isFinite(d[0]) ? Number(d[0]) : 0, h = h && isFinite(h[0]) ? Number(h[0]) : 0, m = m && isFinite(m[0]) ? Number(m[0]) : 0;

            let [[year, month, day], [hour, min, sec]] = (new Date(Date.now() + ((d * 24 + h) * 60 + m) * 60 * 1000))
                .toLocaleString()
                .split(' ')
                .map(a => {
                    return a.split(a.match(/\D/).toString());
                });
            let result = `预计自动收货:\n${year == (new Date).getFullYear() ? '' : ` ${year} 年 \n`} ${month} 月 ${day} 日${m ? '\n' : ''} ${hour} 时 ${m ? `${min}分` : ``}`,
                rDom = document.createElement('span'); rDom.innerText = result;
            rDom.innerHTML = rDom.innerHTML.replace(/(\d+)/g, '\<b\>$1\</b\>');

            if (span.querySelector('.' + autoReceiptClass)) {
                span.querySelector('.' + autoReceiptClass).innerHTML = rDom.innerHTML;
            } else {
                let i = document.createElement('i');
                i.innerHTML = rDom.innerHTML;
                i.classList.add(autoReceiptClass);
                span.appendChild(i);
            }
        });
}
window.addEventListener('load', () => { yiu_showTransit(); yiu_showAutoReceipt(); })