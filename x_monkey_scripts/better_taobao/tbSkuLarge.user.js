// ==UserScript==
// @name        淘宝放大商品选项
// @namespace   leizingyiu.net
// @version     2023.02.01
// @description 简单说就是淘宝sku的老人机，图片太小给发大一点
// @icon        https://img.alicdn.com/favicon.ico
// @author      Leizingyiu
// @include     *://item.taobao.com/*
// @include     *://detail.tmall.com/*
// @run-at      document-idle
// @grant       none
// @license     GNU AGPLv3
// ==/UserScript==

// 电脑端的淘宝商品详情页面的sku图片太太太小了，于是弄了这个。<br>
// <img src="https://pic.rmb.bdstatic.com/bjh/88b57fef1b41431800aa37072291baa09604.gif" width=500><span>  </span><img src="https://pic.rmb.bdstatic.com/bjh/e5b762662272233415b76572663f1c0d1223.gif"   width=500 ></br>

const loadingDelay = 3000;
let skuWidth = '23%';//'30%'' 或者设置成'23%';

function tbSkuLargeMain() {
    console.log(`
tbSkuLarge.js by leizingyiu
last modified: "2022/09/27 14:12:52"
`);
    [...document.querySelectorAll('.J_TSaleProp a')].map(function (a) {
        if (a.style.backgroundImage != "") {
            a.style.backgroundImage = a.style.backgroundImage.replace(/(.+)((png|jpg).+jpg)(.?)/, "$1$3$4");
        } else {
            a.style.cssText = `display: inline-block;   padding: 3px 6px !important;`;
        }
    });
    [...document.querySelectorAll('.skuIcon')].map(img => {
        img.setAttribute('src', img.getAttribute('src').replace(/(.+)((png|jpg).+jpg)(.?)/, "$1$3$4"));
    });

    var s = document.createElement("style");
    s.id = 'yiu_taobaoTmallBiggerSku';
    s.innerText = `
    #detail .tb-key .tb-prop li a,
     .tb-prop .tb-img li a {
          box-sizing: content-box;
        background-size: cover!important;
        min-width: 100%!important;max-width:130px;
         display: block;padding-top: 100%!important;
        background-size: contain!important;background-position: top center!important;
        height: 100%!important;}
        #detail .tb-key .tb-prop li a span,
    .tb-prop .tb-img li a span {
            display: block!important;
            background: rgba(255,255,255,0.7);
            padding: 0 6px;line-height: 1.5em;text-indent: 0;
            white-space: break-spaces;height: 100%;
            padding: .5em;letter-spacing:0.1em}

    #detail .tb-key .tb-prop li ,
    .tb-prop .tb-img li {
        float: none !important;display: inline-block !important;
        vertical-align: top !important;
        padding-bottom: 6px;
        display: inline-block;
        width: ${skuWidth};}

        .tb-prop dd{
        width:100%;
        }
    #detail .tb-key .tb-prop li {
    margin-right:1%!important;
    }

        .skuValueName {
        //tmall new ui text
    max-width: 100%;
    white-space: normal;
    line-height: 1.55em;
    padding: 0.5em 0.1em;
}
`;

    document.getElementsByTagName("html")[0].appendChild(s);
    if (document.getElementById("J_ImgBooth")) {
        document.getElementById("J_ImgBooth").style.cssText = `
      width:100%;
      height:100%;
      object-fit: contain;`;

    }
    void 0;
    if (!CSS.supports("position", "sticky")) {
        function scroll() {
            var price = document.querySelector(".tb-promo-meta , .tm-fcs-panel");
            var priceRect = price.getBoundingClientRect();
            title = document.querySelector("#J_Title ,.tm-fcs-panel");
            titleRect = title.getBoundingClientRect();
            var c = document.querySelector(".tb-item-info-l,.tb-gallery");
            var cRect = c.getBoundingClientRect();
            var p = c.parentElement;
            var pRect = p.getBoundingClientRect();
            var pTop = pRect.top;
            var pBottom = pTop + p.clientHeight;
            if (pTop < 0 && pBottom > c.clientHeight - Number(c.style.paddingTop.replace('px', ''))) {
                c.style.paddingTop = (20 - pTop) + 'px'
            } else if (pTop < 0 && pBottom < c.clientHeight - Number(c.style.paddingTop.replace('px', ''))) {
                c.style.paddingTop = p.clientHeight - c.clientHeight + -Number(c.style.paddingTop.replace('px', '')) + 'px'
            } else {
                c.style.paddingTop = '20px';
            }
            if (pTop < -titleRect.height && pTop > -p.clientHeight) {
                price.style.position = 'fixed';
                price.style.top = 0;
                document.getElementById("J_logistic").style.marginTop = priceRect.height + "px";
            } else {
                price.style.position = 'relative';
                price.style.top = 'auto';
                document.getElementById("J_logistic").style.marginTop = 0;
            }
            void 0;
            return null
        }
        var scrollFunc = function (e) {
            e = e || window.event;
            if (e.wheelDelta) {
                scroll()
            }
        };
        document.body.onscroll = scrollFunc;
        scroll();
        if (document.addEventListener) {
            document.addEventListener('DOMMouseScroll', scrollFunc, false)
        }
        window.onmousewheel = document.onmousewheel = scrollFunc;
    } else {
        let S = document.createElement('style');
        S.innerText = `#bd {
            overflow: visible!important;
        }

        .tb-gallery, .tb-meta.tb-promo-meta, .tb-meta, .tb-title, #J_Title {
            position: sticky!important;
            top: 0px;
            z-index: 100;
        }
        .tb-meta.tb-promo-meta,.tb-meta{
            top:4em!important;
        }
        .tb-meta:before{
            content:'';
            display:block;
            position:absolute;
            bottom:100%;
            left:0;
            width:100%;
            height:1em;
            background:linear-gradient(#ffffff00, #ffffffff);;
        }
        #detail .tb-summary .tb-item-info .tb-item-info-l {
            float: none!important;
        }

        #detail .tb-summary .tb-item-info {
            display: flex;
        }

        #J_Social {
            position: sticky!important;
            top: 100%;
            transform: translate(0,100%);
        }

        #detail .tb-wrap {
            margin: 0!important;
        }

        #detail .tb-property {
            float: none!important;
            width: auto!important;
        }

        .tm-fcs-panel {
            position: sticky!important;
            top: 0;
        }

        .tb-gallery .tb-booth {
            position: sticky!important;
            display: table;
            table-layout: fixed;
            top:20px;
            z-index: 1;
            width: 420px;
            height: 420px;
        }

        .tb-gallery {
            margin-left: 0!important;
            margin-right: 40px;
        }

        .tb-gallery .tb-thumb-warp {
            position: sticky!important;
            top: 430px;
        }

        #J_UlThumb{  padding-top:1em;  }
        #J_ZoomIcon{  display:none;  }

        .tb-gallery .tm-action {
            padding: 38px 40px 25px;
            color: #999;
            position: sticky!important;
            top: 500px;
        }

        #J_DetailMeta>.tm-clear {
            display: flex;
            flex-direction: row-reverse;
        }

        .skuIcon {
    width: 100%;
    height: auto;
}

        .skuItem {
          width:   23.9%;
          padding: 0;
          margin: 0 1% 1% 0;
        }
        [class*=Price--root],[class*=BasicContent--mainPic],[class*=ItemHeader--root]{
            position: sticky;
            top: 10px;
            background: #ffffffaa;
            padding: 0.5em 0;
        }
        [class*=Price--root]{
            top:72px!important;
        }

        `;
        S.setAttribute('id', 'yiu_tbSkuLarge_styling');
        if (!document.getElementById('yiu_tbSkuLarge_styling')) {
            document.getElementsByTagName("html")[0].appendChild(S);
        }
    }
    return void 0;
};
tbSkuLargeMain();
window.addEventListener('load', tbSkuLargeMain);
setTimeout(tbSkuLargeMain, loadingDelay);