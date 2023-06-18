// ==UserScript==
// @name        匹配关键字=>屏蔽图片
// @namespace   leizingyiu.net
// @version     2022.08.23
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

//请在 “ 代码 ｜ 设置 ｜ 数据 ” 的 “数据” 中填写关键字，前后保留英文双引号，中间用中文或者英文逗号隔开， 如：
//“蒙牛，双立人，滴露，益达，usmile,gucci,GUCCI,开小灶，隅田川，德芙，石头科技，欧扎克”

//如了解 css 选择器，可在 “ 代码 ｜ 设置 ｜ 数据 ” 的 “数据” 中，修改 选择器，结构如下：
/**
 *   '需要识别的域名，如 www.baidu.com 可填写 baidu.com；填写后请根据通配符规则，在 @include 新增一行添加': {
      '需要检查的包含一个图一个文的容器，填写 css 选择器': {
        'detect': '需要检测innerHTML的子节点，填写 css 选择器，需为上述容器的子节点',
        'hide': '需要屏蔽的图或者视频，填写 css 选择器'
      },
      '可以添加多个选择器，这个是第二个选择器': {
        'detect': '检测选择器2',
        'hide': '屏蔽选择器2'
      },
    }
 */

function checkAndSetLocalValue(key, value, stringSplitter) {
  const checking_local_reagent = "___";
  if (GM_getValue(key, checking_local_reagent) == checking_local_reagent) {
    GM_setValue(key, value);
  } else {
    const currentValue = GM_getValue(key), backupValue = GM_getValue("备份_" + key, checking_local_reagent);
    if ((typeof stringSplitter == 'undefined') || backupValue == checking_local_reagent || typeof currentValue != 'string') {
      GM_setValue("备份_" + key, GM_getValue(key));
    } else if (typeof currentValue == 'object' && typeof backupValue == 'object') {
      const newValue = Object.assign(backupValue, currentValue);
      GM_setValue("备份_" + key, newValue);
    } else {
      let splitter = currentValue.match(stringSplitter);
      if (splitter) { splitter = splitter[0]; } else { splitter = ' '; }
      const newValueGroup = ((currentValue + splitter + backupValue).split(stringSplitter));
      const newValue = [...new Set(newValueGroup)].join(splitter);
      GM_setValue("备份_" + key, newValue);
    }
  }
}


const keywords_spliter = /[\s,，]{1,}/;

const checking_local_reagent = "___",

  local_wait_time_key = '请填写等待时间',
  default_wait_time = 5,

  local_keywords_key = "请填写需要屏蔽的关键字",
  default_block_keywords = '蒙牛，双立人，滴露，益达，usmile,gucci,GUCCI,开小灶，隅田川，德芙，石头科技，欧扎克',

  local_selectors_key = '请填写自定义选择器',
  default_web_selectors = {

    '需要识别的域名，填写后请添加 @include ': {
      '需要检查的包含一个图一个文的容器，填写 css selector': {
        'detect': '需要检测innerHTML的子节点，填写 css selector',
        'hide': '需要屏蔽的图或者视频，填写 css selector'
      },
      '可以添加多个选择器，这个是第二个选择器': {
        'detect': '检测选择器2',
        'hide': '屏蔽选择器2'
      },
    },

    'taobao.com': {
      '.item': { //淘宝搜索列表
        'detect': '.ctx-box',
        'hide': '.pic-box'
      },
      'li[class^=c2018],li.oneline': {
        // 淘宝搜索页右侧,以及搜索页下方
        'detect': 'a[class$=red],div[class$=line2]',
        'hide': 'div[class$=imgwrap]'
      },

      '.tb-recommend-content-item': { //淘宝首页推荐内容
        'detect': '.info-wrapper',
        'hide': '.img-wrapper'
      },
      'a.item': { //淘宝 
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
      }
    },

    'weibo.com': {
      '.vue-recycle-scroller__item-view': {//微博 全部关注 
        'detect': 'article',
        'hide': 'div[class*=content_row]'
      },
      ".card-feed": { // 微博 搜索页下方信息流的卡片
        "detect": ".content",
        "hide": "div[node-type=feed_list_media_prev]"
      }
    },

    'smzdm.com': { // 什么值得买
      '.feed-row-wide': {
        'detect': '.feed-block',
        'hide': '.z-feed-img'
      }
    },

    'bing.com': {//必应图片搜索
      'ul li[data-idx]>div ': {
        'detect': '.infopt',
        'hide': '.imgpt'
      }
    }

  };


checkAndSetLocalValue(local_wait_time_key, default_wait_time);

checkAndSetLocalValue(local_keywords_key, default_block_keywords, keywords_spliter);

checkAndSetLocalValue(local_selectors_key, default_web_selectors, keywords_spliter);

const block_keywords = GM_getValue(local_keywords_key, default_block_keywords).split(keywords_spliter).filter(a => Boolean(a)),
  wordsReg = new RegExp('(' + (block_keywords.map(word => `(${word})`).join('|') + ')'), 'i'),
  webSelectors = GM_getValue(local_selectors_key, default_web_selectors),
  waitTime = GM_getValue(local_wait_time_key, default_wait_time);

const replacement = '🔥',
  fireSize = 1.08,
  delayTime = 1000;

let web = Object.keys(webSelectors).filter(k => window.location.host.indexOf(k) != -1);
const fireRandomClass = `fire_${String(Math.random()).replace('.', '')}`;

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
    transition:opacity 0.5s ease;
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

  `;
  document.body.appendChild(fireStyle);
}

if (Boolean(web.length)) {
  web = web[0];

  const selectors = webSelectors[web];


  const style = document.createElement('style');
  style.innerHTML = `
  `;
  document.body.appendChild(style);


  const blockThem = function (target) {
    if (!Boolean(target)) { return }
    // target =target&&Boolean( target) ? target.parentElement : document;
    // if(!Object.keys(selectors).some(selector=>target.querySelector(selector))){return}
    if (!target.querySelector(Object.keys(selectors).join(' , '))) { return }



    let checker = 'block-checked';
    let fireChecker = '__fire__'
    // console.log( selectors);

    Object.keys(selectors).map(selector => {
      // console.log(selector, document.querySelectorAll(selector));
      //.filter(dom => !dom.hasAttribute(checker))
      [...target.querySelectorAll(selector)].filter(dom => !dom.querySelector(`[${fireChecker}]`)).map(dom => {
        dom.setAttribute(checker, true);
        let detectDom = dom.querySelector(selectors[selector]['detect']),
          hideDom = dom.querySelector(selectors[selector]['hide']);

        // if (detectDom) {
        //     console.log(dom,detectDom,detectDom.innerHTML.match(wordsReg),hideDom); 
        // }

        if (detectDom && detectDom.innerHTML.match(wordsReg)) {
          // console.log(dom, detectDom, hideDom, detectDom.innerHTML.match(wordsReg));

          if (hideDom) {
            // [...hideDom.children].map(h => {
            //   h.style.opacity = '0';

            //   //    [...h.attributes].map(i=>{
            //   //   h.removeAttribute(i);
            //   // });
            //   /*h.style.display = 'none';*/
            // });
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

            // [...hideDom.classList].map(i=>{hideDom.classList.remove(i)});
            // hideDom.removeAttribute('id');

          }
        }
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
    config = { attributes: true, childList: true, subtree: true },
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


} else { throw ('没有此网站的设置，请检查数据') }
