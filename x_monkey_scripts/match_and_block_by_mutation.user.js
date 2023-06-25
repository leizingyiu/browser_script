// ==UserScript==
// @name        匹配关键字=>屏蔽图片视频 @淘宝、京东、微博、什么值得买、必应……
// @namespace   leizingyiu.net
// @version     2023.04.22
// @description 按照个人喜好，在【数据】中填写关键字，用中文或者英文逗号隔开，就可以根据这些关键字，把对应的图片，替换成 replacement 的火，或者自行填写 replacement 的内容
// @icon        https://www.leizingyiu.net/animated_favicon.gif
// @author      Leizingyiu
// @include     *://*.taobao.com/*
// @include     *://*.jd.com/*
// @include     *://*.weibo.com/*
// @include     *://weibo.com/*
// @include     *://*.smzdm.com/*
// @include     *://*.bing.com/*
// @grant       GM_setValue
// @grant       GM_getValue
// @license     GNU AGPLv3
// ==/UserScript==
// source file name: match_and_block_by_mutation.js

// Created: "2022/7/15 00:00:00"
// Last modified: "2023/02/09 19:31:14"

/** readme.md:

按照个人喜好，在【数据】中填写关键字，用中文或者英文逗号隔开，就可以根据这些关键字，把对应的图片视频内容，替换成 replacement 的🔥，或者自行填写 replacement 的内容；
如使用的脚本插件无【数据】一栏，请在下方 my_block_keywords 中填写。

---

请在 “ 代码 ｜ 设置 ｜ 数据 ” 的 “数据” 中填写关键字，前后保留英文双引号，中间用中文或者英文逗号隔开， 譬如：
```
"牛奶，刀具，消毒液，口香糖，咖啡，巧克力，自热米饭，速溶，麦片，扫地机"
```

---

如您了解 CSS 选择器，可在 “ 代码 ｜ 设置 ｜ 数据 ” 的 “数据” 中，修改 选择器 ，结构如下：
```JSON
    '需要识别的域名，如 www.baidu.com 可填写 baidu.com；填写后请根据通配符规则，在 @include 新增一行添加': {
        '需要检查的包含一个图一个文的容器，填写 CSS 选择器': {
            'detect': '需要检测innerHTML的子节点，填写 CSS 选择器，需为上述容器的子节点',
            'hide': '需要屏蔽的图或者视频，填写 CSS 选择器'
        },
        '可以添加多个选择器，这个是第二个选择器': {
            'detect': '检测选择器2',
            'hide': '屏蔽选择器2'
        }
    }
```

请务必符合 JSON 规范，如使用双引号、最后一项后不可带有逗号等

---

*/

const my_block_keywords = '蒙牛，双立人，滴露，益达，usmile，gucci，GUCCI，开小灶，隅田川，德芙，石头科技，欧扎克，心相印，陈情令，开小灶';

const replacement = '🔥',
  fireSize = 1.08,
  delayTime = 1000;

function gm_checkAndSetLocalValue(key, value, stringSplitter) {
  // @grant       GM_setValue GM_getValue
  const checking_local_reagent = "___",
    prefix = "z_备份_";
  if (GM_getValue(key, checking_local_reagent) == checking_local_reagent) {
    GM_setValue(key, value);
  } else {
    const currentValue = GM_getValue(key),
      backupValue = GM_getValue(prefix + key, checking_local_reagent);
    if ((typeof stringSplitter == 'undefined') || backupValue == checking_local_reagent || typeof currentValue != 'string') {
      GM_setValue(prefix + key, GM_getValue(key));
    } else if (typeof currentValue == 'object' && typeof backupValue == 'object') {
      const newValue = Object.assign(backupValue, currentValue);
      GM_setValue(prefix + key, newValue);
    } else {
      let splitter = currentValue.match(stringSplitter);
      if (splitter) {
        splitter = splitter[0];
      } else {
        splitter = ' ';
      }
      const newValueGroup = ((currentValue + splitter + backupValue).split(stringSplitter));
      const newValue = [...new Set(newValueGroup)].join(splitter);
      GM_setValue(prefix + key, newValue);
    }
  }
}

const keywords_spliter = /[\s,，]{1,}/;

const checking_local_reagent = "___",

  local_wait_time_key = '请填写等待时间',
  default_wait_time = 5,

  local_keywords_key = "请填写需要屏蔽的关键字",
  default_block_keywords = my_block_keywords.length > 0 ? my_block_keywords : "游戏，作弊，迟到，早退",

  local_selectors_key = '请填写自定义选择器',
  default_web_selectors = {
    "需要识别的域名，填写后请添加 @include ": {
      "需要检查的包含一个图一个文的容器，填写 CSS selector": {
        "detect": "需要检测innerHTML的子节点，填写 CSS selector",
        "hide": "需要屏蔽的图或者视频，填写 CSS selector"
      },
      "可以添加多个选择器，这个是第二个选择器": {
        "detect": "检测选择器2",
        "hide": "屏蔽选择器2"
      }
    },
    "taobao.com": {
      ".item": {
        "description": "淘宝搜索列表",
        "detect": ".ctx-box",
        "hide": ".pic-box"
      },
      "li[class^=c2018],li.oneline": {
        "description": "淘宝搜索页右侧,以及搜索页下方",
        "detect": "a[class$=red],div[class$=line2]",
        "hide": "div[class$=imgwrap]"
      },
      ".tb-recommend-content-item": {
        "description": "淘宝首页推荐内容",
        "detect": ".info-wrapper",
        "hide": ".img-wrapper"
      },
      "a.item": {
        "description": "淘宝 ",
        "detect": "div.item-title",
        "hide": "div.item-image-wrap"
      },
      "ul.ald-switchable-content>li": {
        "description": "天猫详情页右侧 看了又看",
        "detect": "div.img",
        "hide": "div.img"
      },
      ".tuijian-bd-window li": {
        "description": "淘宝详情页右侧 看了又看",
        "detect": ".tuijian-img",
        "hide": ".tuijian-img"
      },
      "div[class*='GoodsItem_goodsItem']": {
        "description": "千牛卖家中心",
        "detect": "div[class*='GoodsItem_title']",
        "hide": "[class*='LazyLoad_lazyBox'],[class*='GoodsItem_picBox']"
      }
    },
    "jd.com": {
      ".gl-i-wrap": {
        "description": "京东搜索列表",
        "detect": ".p-name",
        "hide": ".p-img"
      },
      "div.mc li[id^=ad]": {
        "description": "京东搜索列表 左侧推荐",
        "detect": ".p-name",
        "hide": ".p-img"
      }
    },
    "weibo.com": {
      ".vue-recycle-scroller__item-view": {
        "description": "微博 全部关注",
        "detect": "article",
        "hide": "div[class*=content_row]"
      },
      ".card-feed": {
        "description": "微博 搜索页下方信息流的卡片",
        "detect": ".content",
        "hide": "div[node-type=feed_list_media_prev]"
      },
      ".WB_feed_detail": {
        "detect": ".WB_detail",
        "hide": ".WB_media_wrap"
      },
      "[class*='UG_list']": {
        "description": "微博登录首页",
        "detect": ".list_des",
        "hide": "div"
      }
    },
    "smzdm.com": {
      "description": "什么值得买",
      ".feed-row-wide": {
        "detect": ".feed-block",
        "hide": ".z-feed-img"
      }
    },
    "bing.com": {
      "ul li[data-idx]>div ": {
        "description": "必应图片搜索",
        "detect": ".infopt",
        "hide": ".imgpt"
      }
    },
    "baidu.com": {
      ".san-card": {
        "description": "首页推荐",
        "detect": ".s-news-item-title ,.s-block-container ,.c-span8 ,.c-span-last,.c-link ,.c-font-big ,.title-clamp-2 ,.has-tts",
        "hide": ".item-img-wrap ,.c-span4, .s-pic-content  ,.s-pic-content-tpl2 "
      },
      ".result,[class*=result]": {
        "description": "搜索结果",
        "detect": "h3,div",
        "hide": ".c-img,[class*='image-wrapper'],[class*='left-image']"
      },
      ".c-span3": {
        "description": "搜索结果推荐商品",
        "detect": "[class*='desc']", "hide": "a"
      }
    }
  };


gm_checkAndSetLocalValue(local_wait_time_key, default_wait_time);

gm_checkAndSetLocalValue(local_keywords_key, default_block_keywords, keywords_spliter);

gm_checkAndSetLocalValue(local_selectors_key, default_web_selectors, keywords_spliter);


const block_keywords = GM_getValue(local_keywords_key, default_block_keywords).split(keywords_spliter).filter(a => Boolean(a)),
  wordsReg = new RegExp('(' + (block_keywords.map(word => `(${word})`).join('|') + ')'), 'i'),
  webSelectors = GM_getValue(local_selectors_key, default_web_selectors),
  waitTime = GM_getValue(local_wait_time_key, default_wait_time);



let web = Object.keys(webSelectors).filter(k => window.location.host.indexOf(k) != -1);
const fireRandomClass = `fire_${String(Math.random()).replace('.', '')}`;
const mosaicRandomClass = `mosaic_${String(Math.random()).replace('.', '')}`;

if (!document.querySelector(`#${fireRandomClass}`)) {
  let fireStyle = document.createElement('style');
  fireStyle.setAttribute('id', fireRandomClass);
  fireStyle.innerHTML = `
  .${fireRandomClass}{
    overflow:hidden!important;
    position:absolute!important;
    width:100%!important; height:100%!important;
    left:50%!important;top:0!important;
    transform:translate(-50%,0)!important;
    line-height:1em!important;
    display: flex;
    flex-direction: row;
    place-content: center;
    opacity:1;
  }

  .${fireRandomClass}_parent *{
    opacity:0;
    transition:opacity  0.1s ease;
  }
  .${fireRandomClass}_parent:hover *{
    opacity:1;
    transition:opacity ${waitTime}s ease;
  }

  .${fireRandomClass}_parent  .${fireRandomClass}{
    opacity:1;
    transition:opacity 0.5s ease;
  }
  .${fireRandomClass}_parent:hover .${fireRandomClass}{
    pointer-events: none;
    opacity:0;
    transition:opacity ${waitTime}s ease;
  }

  .${fireRandomClass}:hover .${fireRandomClass}{
    pointer-events: none;
    opacity:0;
    transition:opacity ${waitTime * 2}s ease  ${waitTime * 1.5}s;
  }

  `;
  document.body.appendChild(fireStyle);
}
function fireTheHideDom(hideDom) {
  let fire = document.createElement('i');
  fire.innerText = replacement;
  fire.classList.add(fireRandomClass);
  fire.style.fontSize = Number(hideDom.clientHeight) * fireSize + 'px';
  fire.style.lineHeight = '1em';
  fire.setAttribute(fireChecker, true);

  hideDom.classList.add(`${fireRandomClass}_parent`);
  hideDom.style.overflow = 'hidden';
  hideDom.style.position = 'relative';
  hideDom.appendChild(fire);
}

if (!document.querySelector(`#${mosaicRandomClass}`)) {
  let mosaicSvg = document.createElement('div');
  mosaicSvg.setAttribute('id', mosaicRandomClass + '_svg');
  mosaicSvg.innerHTML = `
  <svg width=0 height=0 >
    <filter id="mosaic" x="0" y="0">
      <feFlood x="4" y="4" height="2" width="2"/>
      <feComposite width="8" height="8"/>
      <feTile result="a"/>
      <feComposite in="SourceGraphic" in2="a" operator="in"/>
      <feMorphology operator="dilate"radius="5"/>
    </filter>
  </svg>
  <svg width="0" height="0">
  <filter id="mosaicOff" x="0" y="0">
    <feFlood x="0" y="0" height="0" width="0"></feFlood>
    <feComposite width="1" height="1"></feComposite>
    <feTile result="a"></feTile>
    <feComposite in="SourceGraphic" in2="a" operator="in"></feComposite>
    <feMorphology operator="dilate" radius="0"></feMorphology>
  </filter>
</svg>
`;
  document.body.appendChild(mosaicSvg);
  let mosaicStyle = document.createElement('style');
  mosaicStyle.setAttribute('id', mosaicRandomClass);
  mosaicStyle.innerHTML = `
  .${mosaicRandomClass}{
    filter: url(#mosaic);
  }

  .${mosaicRandomClass}_parent *{
    opacity:0;
    transition:opacity  0.1s ease;
  }
  .${mosaicRandomClass}_parent:hover *{
    opacity:1;
    transition:opacity ${waitTime}s ease;
  }

  .${mosaicRandomClass}_parent  .${mosaicRandomClass}{
    opacity:1;
    transition:opacity 0.5s ease;
  }
  .${mosaicRandomClass}_parent:hover .${mosaicRandomClass}{
    pointer-events: none;
    opacity:0;
    transition:opacity ${waitTime}s ease;
  }

  .${mosaicRandomClass}:hover .${mosaicRandomClass}{
    pointer-events: none;
    opacity:0;
    transition:opacity ${waitTime * 2}s ease  ${waitTime * 1.5}s;
  }

  `;
  document.body.appendChild(mosaicStyle);
}



if (Boolean(web.length)) {
  web = web[0];

  const selectors = webSelectors[web];


  // const style = document.createElement('style');
  // style.innerHTML = `
  // `;
  // document.body.appendChild(style);


  const blockThem = function (target) {
    if (!Boolean(target)) {
      return
    }
    // target =target&&Boolean( target) ? target.parentElement : document;
    // if(!Object.keys(selectors).some(selector=>target.querySelector(selector))){return}
    if (!target.querySelector(Object.keys(selectors).join(' , '))) {
      return
    }



    let checker = 'block-checked';
    let fireChecker = '__fire__'
    // console.log( selectors);

    var domsFn = (dom, selector) => {
      let a = []; a[0] = dom;

      let doms = typeof selector != 'undefined' ? dom.querySelectorAll(selector) : a;


      if (typeof doms == 'null') { return a; } else {
        switch ([...doms].length) {
          case 0:
            return a;
          default:
            return [...doms];
        }
      }
    };

    Object.keys(selectors).map(selector => {
      // console.log(selector, document.querySelectorAll(selector));
      //.filter(dom => !dom.hasAttribute(checker))
      [...target.querySelectorAll(selector)].filter(dom => !dom.querySelector(`[${fireChecker}]`)).map(dom => {
        dom.setAttribute(checker, true);
        //         let detectDoms=dom,hideDoms=dom;

        //         detectDoms =typeof selectors[selector]['detect'] !='undefined'? dom.querySelectorAll(selectors[selector]['detect']):detectDoms,
        //         hideDoms =typeof selectors[selector]['detect']!='hide'? dom.querySelectorAll(selectors[selector]['hide']):hideDoms;

        let detectDoms = domsFn(dom, selectors[selector]['detect']),
          hideDoms = domsFn(dom, selectors[selector]['hide']);


        // if (detectDom) {
        //     console.log(dom,detectDom,detectDom.innerHTML.match(wordsReg),hideDom);
        // }
        //  if ((!detectDom) && dom.parentElement.querySelector(selectors[selector]['detect'])) {
        //   detectDom = dom;
        // }

        // console.log(detectDoms);
        const matchWords = detectDoms.map(d => {
          let w = d.outerHTML.match(wordsReg);
          console.log(d, w);
          if (w) {
            //d.setAttribute('data-match-blocking-word',w);

          }
          return w;
        }).filter(Boolean);



        if (matchWords.length > 0) {
          console.log(...matchWords);
          hideDoms.map(hideDom => {
            fireTheHideDom(hideDom);
          });
        }

        //         if (detectDom && detectDom.outerHTML.match(wordsReg)) {
        //           // console.log(dom, detectDom, hideDom, detectDom.innerHTML.match(wordsReg));

        //           console.log(hideDom,detectDom);

        //           // if ((!hideDom) && detectDom.parentElement.querySelector(selectors[selector]['hide'])) {
        //           //   hideDom = detectDom;
        //           // }

        //           if (hideDom) {
        //             // [...hideDom.children].map(h => {
        //             //   h.style.opacity = '0';

        //             //   //    [...h.attributes].map(i=>{
        //             //   //   h.removeAttribute(i);
        //             //   // });
        //             //   /*h.style.display = 'none';*/
        //             // });
        //             let fire = document.createElement('i');
        //             fire.innerText = replacement;
        //             fire.classList.add(fireRandomClass);
        //             fire.style.fontSize = Number(hideDom.clientHeight) * fireSize + 'px';
        //             fire.style.lineHeight = '1em';
        //             fire.setAttribute(fireChecker, true);

        //             hideDom.classList.add(`${fireRandomClass}_parent`);
        //             hideDom.style.overflow = 'hidden';
        //             hideDom.style.position = 'relative';
        //             hideDom.appendChild(fire);

        //             // [...hideDom.classList].map(i=>{hideDom.classList.remove(i)});
        //             // hideDom.removeAttribute('id');

        //           }
        //         }
      });
    });
  }

  const promiseIt = function (fn) {
    return new Promise((resolve, reject) => {
      fn();
      resolve();
    })
  };

  var timer = null;

  const targetNode = document.querySelector('body'),
    config = {
      attributes: true,
      childList: true,
      subtree: true
    },
    callback = function (mutationsList, observer) {
      observer.disconnect();
      // console.log(timer);

      for (let mutation of mutationsList) {
        // console.log(mutation);
        // if (mutation.type === 'childList' || mutation.type=='subtree') {
        //     console.log('A child node has been added or removed.');
        // }
        promiseIt(() => {
          // console.log(mutation.target);
          blockThem(mutation.target);
          // blockThem(document.querySelector('body'));
        });
      }

      timer = timer ? null : setTimeout(
        () => {
          observer.disconnect();
          promiseIt(() => {
            blockThem(document.querySelector('body'));
          });
          timer = null;
          observer.observe(targetNode, config);
          // console.log(timer);
        }, delayTime);

      // observer.observe(targetNode, config);

    },
    observer = new MutationObserver(callback);

  observer.observe(targetNode, config);


} else {
  throw ('匹配关键字=>屏蔽图片： 没有此网站的设置，请检查数据')
}