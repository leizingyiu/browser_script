"use strict";
/* eslint-disable func-names */
/* eslint-disable no-nested-ternary */
// ==UserScript==
// @name         淘宝天猫多商品列表展示
// @version      2.3
// @author       Einskang
// @description  淘宝天猫商品页面多个商品与价格列表显示效果
// @match        http*://item.taobao.com/item.htm?*
// @match        http*://detail.tmall.com/item.htm?*
// @match        http*://chaoshi.detail.tmall.com/item.htm?*
// @grant        none
// @run-at       document-start
// @namespace    https://greasyfork.org/users/206059
// ==/UserScript==
(function main() {
    // 设置调试模式
    const debug = false;
    // 输出调试信息
    function log(information, ...others) {
        if (debug) {
            // eslint-disable-next-line no-console
            console.log(information, ...others);
        }
    }
    // 定义站点类型
    let SiteType;
    (function (SiteType) {
        SiteType[SiteType["TaoBao"] = 0] = "TaoBao";
        SiteType[SiteType["TianMao"] = 1] = "TianMao";
    })(SiteType || (SiteType = {}));
    // 站点类型
    const siteType = window.location.host.includes('item.taobao.com') ?
        SiteType.TaoBao :
        SiteType.TianMao;
    // /**
    //  * 描述商品原价和商品详细信息ID的对象数组
    //  * 属性名的命名规则是，都以“;”开始和结尾，中间是各种分类ID组成的用来在页面上唯一标识某一个商品的ID
    //  * @type {Object.<String, Object>}
    //  * @property {Number} default.priceCent 以分作为单位的商品原价格
    //  * @property {String} default.price 用来直接显示给用户看的商品原价格
    //  * @property {Number} default.stock 当前库存
    //  * @property {String} default.skuId 商品详细信息ID
    //  */
    // type SkuMap = {
    //   [key: string]: {
    //     priceCent: number
    //     price: string
    //     stock: number
    //     skuId: string
    //   }
    // }
    /**
     * 重复执行
     * @param {() => boolean} callback 回调函数，当返回 true 时停止继续执行，否则继续执行
     * @param {number} [counter=25] 执行次数限制，默认执行 25 次
     * @param {number} [interval=200] 每次执行间隔，默认 200 毫秒
     */
    function doUntilStop(callback, counter = 100, interval = 50) {
        window.setTimeout(function F(_counter) {
            if (_counter >= 0 && !callback()) {
                window.setTimeout(F, interval, _counter - 1);
            }
        }, interval, counter - 1);
    }
    // 增加额外的样式表，使商品展示形式由块状变为列表式
    function addStyleSheet() {
        document.addEventListener('DOMContentLoaded', () => {
            const styleElement = document.createElement('style');
            styleElement.setAttribute('type', 'text/css');
            if (siteType === SiteType.TaoBao) {
                // 淘宝页面插入的样式代码
                styleElement.innerHTML = `
          .J_TSaleProp > li {
            float: none !important;
            margin: 0 !important;
          }

          .J_TSaleProp > li > a {
            background-position-x: left !important;
            text-align: left !important;
            display: block !important;
          }

          .J_TSaleProp > li > a > span {
            display: inline !important;
            margin-left: 40px;
            text-align: left !important;
            font-size: 18px;
            font-weight: 800;
          }

          .J_TSaleProp > li > a > p {
            text-indent: 0 !important;
            padding: 0;
            text-align: right !important;
            position: absolute;
            top: 2px;
            right: 5px;
            z-index: 200;
            width: auto;
            height: auto;
            float: right;
            font-size: 30px;
            color: #FF0036;
            font-weight: bolder;
            font-family: Arial;
          }
        `;
            }
            else if (siteType === SiteType.TianMao) {
                // 天猫页面插入的样式代码
                // 包含 tm-relate-list 类的商品，类似于京东多种类商品，每次切换商品种类都会刷新
                // 整个页面
                styleElement.innerHTML = `
          .tm-relate-list > li {
            float: none !important;
            margin: 0 !important;
          }

          .tm-relate-list > li > a {
            padding-left: 50px !important;
            text-align: left !important;
            font-size: 18px;
            font-weight: 800;
          }

          .tm-relate-list > li > span {
            padding-left: 50px !important;
            text-align: left !important;
            font-size: 18px;
            font-weight: 800;
          }

          .J_TSaleProp > li {
            float: none !important;
            margin: 0 !important;
          }

          .J_TSaleProp > li > a[href='#'] {
            width: auto !important;
            float: none;
            display: block;
            background-position-x: left !important;
            text-align: left;
          }

          .J_TSaleProp > li > a > span {
            text-indent: 0 !important;
            padding-left: 50px;
            text-align: left;
            font-size: 18px;
            font-weight: 800;
            position: relative;
            z-index: 100;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
          }

          .J_TSaleProp > li > a > p {
            text-indent: 0 !important;
            padding: 0;
            text-align: right !important;
            position: absolute;
            top: 2px;
            right: 5px;
            z-index: 200;
            width: auto;
            height: auto;
            float: right;
            font-size: 30px;
            color: #FF0036;
            font-weight: bolder;
            font-family: Arial;
          }
        `;
            }
            document.head.appendChild(styleElement);
        });
    }
    // 当前商品是否是多选择项商品
    let isMultiTypeItem;
    // 当前商品种类选择区域在商品列表区域的第几个位置，一般是第一个位置，
    // 但有时候商家会将两者正好反过来，因此将判断逻辑更换为哪个选择列表
    // 的数量少，就指定为谁是商品种类选择列表，从而使商品价格尽可能地展
    // 示在列表更多的区域，方便比价
    let itemTypeIndex;
    function refreshPrice(option) {
        // 商品种类选择器中的一个关键元素，淘宝为 div.tb-skin，天猫为 div.tb-sku
        const itemTypeSelectorKey = siteType === SiteType.TaoBao ? 'div.tb-skin' : 'div.tb-sku';
        // 只有在商品有不同种类可供选择的时候才会有商品种类 ID
        let selectedItemTypeId;
        if (isMultiTypeItem) {
            log('多种类商品');
            // 商品种类
            const itemList = Array.from(document.querySelectorAll(`${itemTypeSelectorKey} > dl:nth-of-type(${itemTypeIndex}) > dd > ul > li`));
            // 已选中的商品种类，如果没有默认第一个
            const selectedItemType = itemList.find((itemType) => itemType.classList.contains('tb-selected')) || itemList.find((itemType) => itemType.innerText.includes('已选中')) || itemList[0];
            // 多种类商品未获取到商品种类 ID 就直接退出
            let _temp;
            if (!selectedItemType || !(_temp = selectedItemType.getAttribute('data-value')))
                return;
            selectedItemTypeId = _temp;
        }
        log('将商品实际销售价格对应显示到商品列表中');
        // 将商品实际销售价格对应显示到商品列表中
        document
            .querySelectorAll(`${itemTypeSelectorKey} > dl:nth-of-type(${isMultiTypeItem ? (itemTypeIndex === 1 ? 2 : 1) : 1}) > dd > ul > li`)
            .forEach((commodity) => {
            var _a;
            // 获取商品 ID，如果未获取到就直接退出
            let _temp;
            log('获取到的商品 ID：', commodity.getAttribute('data-value'));
            if (!(_temp = commodity.getAttribute('data-value')))
                return;
            const commodityId = _temp;
            // 商品价格信息，包含促销价格和正常价格
            // 如果是多种类商品，则需要同时满足商品种类 ID 和商品 ID 相同
            let itemPriceInformation;
            if (siteType === SiteType.TaoBao) {
                const promotionPriceId = Object.keys(option.promoData).find((item) => (isMultiTypeItem ?
                    item.includes(selectedItemTypeId) && item.includes(commodityId) :
                    item.includes(commodityId)));
                log('promotionPriceId', promotionPriceId);
                const originalPriceId = Object.keys(option.originalPrice).find((item) => (isMultiTypeItem ?
                    item.includes(selectedItemTypeId) && item.includes(commodityId) :
                    item.includes(commodityId)));
                log('originalPriceId: ', originalPriceId);
                itemPriceInformation = {
                    promotionList: promotionPriceId ? option.promoData[promotionPriceId] : undefined,
                    price: originalPriceId ? option.originalPrice[originalPriceId].price : undefined,
                };
            }
            else if (siteType === SiteType.TianMao) {
                const priceInfo = option.skuList.find((item) => (isMultiTypeItem ?
                    item.pvs.includes(selectedItemTypeId) &&
                        item.pvs.includes(commodityId) :
                    item.pvs.includes(commodityId)));
                if (!priceInfo)
                    return;
                itemPriceInformation = {
                    promotionList: option.priceInfo[priceInfo.skuId].promotionList,
                    price: option.priceInfo[priceInfo.skuId].price,
                };
            }
            if (!itemPriceInformation)
                return;
            // 有促销活动时，真实价格等于促销价格，没有促销活动时，真实价格等于正常价格
            const itemReallyPrice = ((itemPriceInformation.promotionList &&
                itemPriceInformation.promotionList[0]) ||
                itemPriceInformation).price;
            if (!itemReallyPrice)
                return;
            // 在商品列表的一侧显示真实价格
            const priceSpanElement = document.createElement('p');
            priceSpanElement.innerHTML = itemReallyPrice;
            priceSpanElement.classList.add('einskang-show-price-list');
            if (!(_temp = commodity.firstElementChild))
                return;
            // 删除原来添加进去的元素
            (_a = commodity.querySelector('.einskang-show-price-list')) === null || _a === void 0 ? void 0 : _a.remove();
            _temp.appendChild(priceSpanElement);
        });
    }
    // 获取商品价格信息
    function getPriceInformation() {
        // 判断是否是多选择项商品的正则表达式
        const multiTypeItemCheckRegExp = /[\d:]+(;[\d:]+)+/;
        // 淘宝商品价格截取
        if (siteType === SiteType.TaoBao) {
            let originalPrice;
            let promoData;
            // 截获数据获取函数
            doUntilStop(() => {
                if (!window.onSibRequestSuccess) {
                    return false;
                }
                const originFunction = window.onSibRequestSuccess;
                window.onSibRequestSuccess = function (argv) {
                    if (argv.code.message === 'SUCCESS') {
                        originalPrice = argv.data.originalPrice; // 商品原始价格
                        promoData = argv.data.promotion.promoData; // 商品促销价格
                        log('originalPrice: ', originalPrice);
                        log('promoData：', promoData);
                        // 判断是否是多选择项商品，淘宝的接口返回了一个比较特殊的值 def，表示的是商品的价格区间
                        isMultiTypeItem = Object.keys(originalPrice).every((key) => multiTypeItemCheckRegExp.test(key) || key === 'def');
                        log('是否是多种类商品', isMultiTypeItem);
                    }
                    // 执行原代码
                    originFunction(argv);
                };
                return true;
            });
            // 等待数据和页面结构准备好，显示商品价格
            doUntilStop(() => {
                if (!originalPrice && !promoData) {
                    log('数据没有准备好');
                    return false;
                }
                if (!document.querySelector('div.tb-skin')) {
                    log('页面结构没有准备好');
                    return false;
                }
                log('数据已经准备好');
                // 如果当前商品存在多个种类，则为种类选择增加点击事件侦听，当发生点击时
                // 更新替换了价格数据，淘宝以 div.tb-skin 为商品选择列表区域，天猫以
                // div.tb-sku 为商品选择列表区域
                if (isMultiTypeItem) {
                    itemTypeIndex =
                        document.querySelectorAll('div.tb-skin > dl:nth-of-type(1) > dd > ul > li').length <
                            document.querySelectorAll('div.tb-skin > dl:nth-of-type(2) > dd > ul > li').length ?
                            1 :
                            2;
                    // 用户选择其他种类时，刷新商品价格
                    let _temp;
                    if ((_temp = document.querySelector(`div.tb-skin > dl:nth-of-type(${itemTypeIndex}) > dd > ul`))) {
                        _temp.addEventListener('click', () => {
                            window.setTimeout(() => {
                                refreshPrice({
                                    originalPrice,
                                    promoData,
                                });
                            }, 500);
                        });
                    }
                    else {
                        return false;
                    }
                }
                // 更新商品价格
                refreshPrice({
                    originalPrice,
                    promoData,
                });
                return true;
            });
        }
        else if (siteType === SiteType.TianMao) {
            let skuList;
            let priceInfo;
            // 获取商品信息与标识 ID 之间的对应关系
            doUntilStop(() => {
                if (!window.TShop || !window.TShop.Setup) {
                    return false;
                }
                const originFunction = window.TShop.Setup;
                window.TShop.Setup = function (argv) {
                    // 有些商品（处方类药品）没有下列属性，即没有多种类可供选择，因此跳过这类商品
                    if (argv.valItemInfo) {
                        skuList = argv.valItemInfo.skuList;
                        isMultiTypeItem = skuList.every((sku) => multiTypeItemCheckRegExp.test(sku.pvs)); // 判断是否是多选择项商品
                        log('skuList', skuList);
                    }
                    // 继续执行原来的函数
                    originFunction(argv);
                };
                return true;
            });
            // 获取每个商品子类的价格
            doUntilStop(() => {
                if (!window.setMdskip) {
                    return false;
                }
                const originFunction = window.setMdskip;
                window.setMdskip = function (argv) {
                    priceInfo = argv.defaultModel.itemPriceResultDO.priceInfo;
                    log('priceInfo', priceInfo);
                    // 继续执行原来的函数
                    originFunction(argv);
                };
                return true;
            });
            // 尝试将价格信息显示在商品列表中，每隔一秒尝试一次，失败 20 次后停止
            doUntilStop(() => {
                if (!priceInfo || !skuList) {
                    log('数据没有准备好');
                    return false;
                }
                if (!document.querySelector('div.tb-sku')) {
                    log('页面结构没有准备好');
                    return false;
                }
                log('数据已经准备好');
                log('是否是多种类商品', isMultiTypeItem);
                // 如果当前商品存在多个种类，则为种类选择增加点击事件侦听，当发生点击时更新替换了价格数据
                if (isMultiTypeItem) {
                    itemTypeIndex =
                        document.querySelectorAll('div.tb-sku > dl:nth-of-type(1) > dd > ul > li').length <
                            document.querySelectorAll('div.tb-sku > dl:nth-of-type(2) > dd > ul > li').length ?
                            1 :
                            2;
                    // 用户选择其他种类时，刷新商品价格
                    let _temp;
                    if ((_temp = document.querySelector(`div.tb-sku > dl:nth-of-type(${itemTypeIndex}) > dd > ul`))) {
                        _temp.addEventListener('click', () => {
                            window.setTimeout(() => {
                                refreshPrice({
                                    priceInfo,
                                    skuList,
                                });
                            }, 500);
                        });
                    }
                }
                // 更新商品价格
                refreshPrice({
                    priceInfo,
                    skuList,
                });
                return true;
            });
        }
    }
    // 执行
    addStyleSheet();
    getPriceInformation();
}());
