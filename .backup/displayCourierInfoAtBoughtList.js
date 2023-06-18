// ==UserScript==
// @name        直接显示物流 @淘宝已买到的宝贝列表
// @namespace   leizingyiu.net
// @match       http*://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm
// @grant       none
// @version     2023/2/2 11:44:59
// @author      leizingyiu
// @description 2023/2/2 11:44:59
// ==/UserScript==






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
                            console.log(p);

                            if (p.length > 0) {
                                p = p.replace(/[\]）】，。]/g, '\n').replace(/\n{2}/g, '\n');
                                let span = document.createElement('span'); span.innerText = p; span.style.cssText = '    margin-top: 1em;display: block;';
                                table
                                    .querySelector('tbody:nth-child(3) > tr:nth-child(1) > td:nth-child(6) > div')
                                    .appendChild(span);
                            }

                        }
                        reader.readAsText(data, 'GBK');
                        return reader.result;
                    }
                )
        }
    })

