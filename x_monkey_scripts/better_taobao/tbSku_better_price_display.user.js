// ==UserScript==
// @name        taobao.com get price when loading testing
// @namespace   leizingyiu.net
// @include     http*://item.taobao.com/item.htm*
// @include     http*://detail.tmall.com/item_o.htm*
// @include     http*://detail.tmall.com/item.htm*
// @grant       none
// @version     1.0
// @author      leizingyiu
// @description 2022/9/28 01:41:32
// ==/UserScript==

// Created: "2022/9/28 01:41:32"
// Last modified: "2023/02/20 01:26:16"

function log() { console.log(...arguments); }

function queryAll() {
  return [...arguments]
    .map(arg => [...document.querySelectorAll(arg)])
    .flat(Infinity);
}
function query() {
  return document.querySelector(...arguments);
}

const selectedItemSelector = '.tb-selected ',
  liSelector = '.J_TSaleProp li';


/** style */


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

/**style  */


window.priceFn = () => { };
log('taobao price testing')
const multiTypeItemCheckRegExp = /[\d:]+(;[\d:]+)+/;

const originSibRequestSuccess = typeof window.onSibRequestSuccess == 'undefined' ? () => { } : window.onSibRequestSuccess;
window.onSibRequestSuccess = function (argv) {
  // log('onSibRequestSuccess:  taobao price testing:  : ', argv);

  if (argv.code.message === 'SUCCESS') {
    originalPrice = argv.data.originalPrice; // 商品原始价格
    promoData = argv.data.promotion.promoData; // 商品促销价格
    // log('1___ originalPrice: ', originalPrice);
    // log('2___ promoData：', promoData);
    // 判断是否是多选择项商品，淘宝的接口返回了一个比较特殊的值 def，表示的是商品的价格区间
    isMultiTypeItem = Object.keys(originalPrice).every((key) => multiTypeItemCheckRegExp.test(key) || key === 'def');
    // log('3___ 是否是多种类商品', isMultiTypeItem);

    // log(argv);
    // log(argv.data.promotion.promoData);
    // log(Boolean(Object.keys(argv.data.promotion.promoData).length));


    let priceContainer, pricePicker;
    let propertysNames = {};

    if (Boolean(Object.keys(argv.data.promotion.promoData).length)) {
      priceContainer = argv.data.promotion.promoData;
      pricePicker = (k) => priceContainer[k][0].price;
    } else {
      priceContainer = argv.data.originalPrice;
      pricePicker = (k) => priceContainer[k].price;
    }


    log(Object.keys(priceContainer).filter(k => k.split(';').filter(_k => _k.length >= 1).length > 1));

    if (Object.keys(priceContainer).filter(k => k.split(';').filter(_k => _k.length >= 1).length > 1).length < 1) {
      Object.keys(priceContainer).map(k => {

        if (query(`[data-value="${k.replace(/;/g, '')}"] a`)) {
          query(`[data-value="${k.replace(/;/g, '')}"] a`).setAttribute('price', `¥${pricePicker(k)}`);
        }

      });
    } else {

      pricePicker = (k) => typeof priceContainer[k][0] != 'undefined' ? priceContainer[k][0].price : priceContainer[k].price;

      window.priceFn = function () {
        let result = [];
        let arg = [...arguments].filter(a => Boolean(a));
        Object.keys(priceContainer).map(k => {
          if ([...arg].map(a => k.indexOf(a) != -1).filter(a => a == false).length == 0) {
            result.push(pricePicker(k));

            // console.log(k, arg);

          }
        });

        console.trace(result, priceContainer, arguments);
        result = [...new Set(result)].sort((a, b) => Number(a) - Number(b));
        result = result.length == 1 ? result[0] : [result[0], result[result.length - 1]].join(' ~ ')
        console.log(result);
        return result;
      }
      window.writePrices = () => {
        var selectedProps = [];
        queryAll(selectedItemSelector).map(li => {
          selectedProps.push(li.getAttribute('data-value'));
        });

        queryAll(liSelector).map(li => {
          let prop = li.getAttribute('data-value');
          let subSelectedProps = selectedProps.filter(p => !li.parentElement.querySelector(`[data-value="${p}"]`));
          console.log(prop, subSelectedProps);
          let result = window.priceFn(prop, ...subSelectedProps);
          li.querySelector('a').setAttribute('price', result);
        });
      }

      queryAll(liSelector).map(li => {
        li.addEventListener('click', function () {
          setTimeout(() => {
            window.writePrices();
          }, 500);
        });
      });

      window.writePrices();

    }
    // {

    //   let propertysGroup = {};
    //   Object.keys(priceContainer).map(k => {
    //     let propertys = k.split(';').filter(_k => _k.length >= 1);
    //     propertys.map((prop, idx) => {
    //       if (typeof propertysGroup[idx] == 'undefined') {
    //         propertysGroup[idx] = {}
    //       }
    //       propertysGroup[idx][prop] = '';

    //     });
    //   })

    //   Object.keys(priceContainer).map(k => {
    //     log(k, priceContainer[k]);
    //     let propertys = k.split(';').filter(_k => _k.length >= 1);
    //     if (typeof writeUlIdx == 'undefined') {
    //       writeUlIdx = propertys.map((p, idx) => {
    //         return {
    //           num: document.querySelector(`li[data-value="${p}"]`).parentElement.children.length,
    //           i: idx
    //         };
    //       }).reduce((a, b) => (a.i > b.i) ? a : b, -Infinity);
    //       log(writeUlIdx);
    //     }


    //     let priceIntervals = {};

    //     propertys.map((prop, idx) => {
    //       if (document.querySelector(`li[data-value="${prop}"] span`) != null) {
    //         propertysNames[prop] = document.querySelector(`li[data-value="${prop}"] span`).innerText;
    //       }

    //       // document.querySelector(`li[data-value="${prop}"]`).parentElement.setAttribute('data-ul-idx', idx);
    //       log(prop in priceIntervals);

    //       if (typeof priceIntervals[prop] == 'undefined') {
    //         priceIntervals[prop] = {};
    //         priceIntervals[prop].min = Infinity, priceIntervals[prop].max = -Infinity;
    //       }
    //       priceIntervals[prop].min = Math.min(pricePicker(k), typeof priceIntervals[prop].min == 'undefined' ? Infinity : priceIntervals[prop].min),
    //         priceIntervals[prop].max = Math.max(pricePicker(k), typeof priceIntervals[prop].max == 'undefined' ? -Infinity : priceIntervals[prop].max);
    //     });

    //     log(priceIntervals);
    //     log(propertysNames);
    //     {
    //       //          document.querySelector(`li[data-value="${prop}"]`).setAttribute('')
    //     }


    //   });
    // }

    log('final names ------------ ', propertysNames);



  }
  // 执行原代码
  originSibRequestSuccess(argv);
}

window.originTShopSetup = () => { }, window.originMdskip = () => { };
if (typeof window.TShop != 'undefined') {
  log(window.TShop);
  window.originTShopSetup =
    typeof window.TShop == 'undefined' || typeof window.TShop.Setup == 'undefined' ?
      () => { } : window.TShop.Setup;
  // window.TShop.Setup = function (argv) {
  //   log('TShop.Setup :  ', argv);
  //   originTShopSetup(argv);
  // }
}

if (typeof window.setMdskip != 'undefined') {
  log(window.setMdskip);
  window.originMdskip = typeof window.setMdskip == 'undefined' ? () => { } : window.setMdskip;
  // window.setMdskip = function (argv) {
  //   log("setMdskip : ", argv);
  //   originMdskip(argv);
  // }
}

tm_itemSelector = '.skuItem';
tm_currentItemSelector = '.skuItem.current'
window.addEventListener('message', function (event) {
  log(event);

  if (typeof event.data.data != 'undefined' && typeof event.data.data.skuCore != 'undefined') {
    let data = event.data;
    let priceDict = data.skuBase,
      priceContainer = data.skuCore.sku2info,
      pricePicker = () => { };
    data.skuBase.props.map(prop => {
      prop.values.map(value => {

        let items = queryAll(tm_itemSelector)
          .filter(li => li.innerText.indexOf(value.name) != -1),
          item = items.length > 1 ?
            items.sort((a, b) => a.replace(value.name).length - b.replace(value.name))[0] :
            items[0];
        item.setAttribute('skuId', data.skuBase.skus.filter(sku => sku.propPath == `${prop.pid}:${value.vid}`));
        log(prop, value, item);
      });

    })
    // log(data.data.skuBase.props[0].values)
    // log(data.data.skuBase.props[1].values);

    // log(data.data.skuBase.skus);

    // log(data.data.skuCore.sku2info)
    // window.postMessage({
    //     topic: 'set_jsonp_data',
    //     data: data.find(d => d.api == event.data.api)
    // })

  }

})