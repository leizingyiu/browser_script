// ==UserScript==
// @name        match_and_block_by_mutation // 描述匹配正则，屏蔽图片 _ mutation
// @namespace   leizingyiu.net
// @version     2022.08.09
// @description 按照个人喜好，在block_keywords填写关键字，用中文或者英文逗号隔开，就可以根据这些关键字，把对应的图片，替换成 replacement 的火，或者自行填写 replacement 的内容
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


//请在 “ 代码 ｜ 设置 ｜ 数据 ” 的 “数据” 中填写关键字，前后保留英文双引号，中间用中文或者英文逗号隔开

const checking_local_reagent = "___",
  local_keywords_key = "请填写需要屏蔽的关键字",
  default_block_keywords = '请修改关键字譬如，开小灶，隅田川，德芙，石头科技，欧扎克，双立人，滴露，益达,usmile,gucci,GUCCI,开小灶，隅田川，德芙，石头科技，欧扎克',

  local_selectors_key = '请填写自定义选择器',
  default_web_selectors = {
    '需要识别的域名': {
      '需要检查的包含一个图一个文的容器，填写css selector，填写后请添加 @include': {
        'detect': '需要检测innerHTML的子节点，填写css selector',
        'hide': '需要屏蔽的图或者视频，填写css selector'
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
      }

    },
    'weibo.com': {
      '.vue-recycle-scroller__item-view': {//微博 全部关注 
        'detect': 'article',
        'hide': 'div[class*=content_row]'
      }
    },
    'smzdm.com': {
      '.feed-row-wide': {
        'detect': '.feed-block',
        'hide': '.z-feed-img'
      }
    }
  };

const replacement = '🔥',
  fireSize = 1.08,
  delayTime = 1000;



const block_keywords = "心相印，蒙牛，X玖少年团肖战DAYTOY，陈情令，肖战，开小灶，隅田川，德芙，石头科技，欧扎克，双立人，滴露，益达".split(/[\s,，]{1,}/).filter(a => Boolean(a)),
  wordsReg = new RegExp('(' + (block_keywords.map(word => `(${word})`).join('|') + ')'), 'i'),
  webSelectors = {
    "需要识别的域名": {
      "需要检查的包含一个图一个文的容器，填写css selector，填写后请添加 @include": {
        "detect": "需要检测innerHTML的子节点，填写css selector",
        "hide": "需要屏蔽的图或者视频，填写css selector"
      },
      "可以添加多个选择器，这个是第二个选择器": {
        "detect": "检测选择器2",
        "hide": "屏蔽选择器2"
      }
    },
    "taobao.com": {
      ".item": {
        "detect": ".ctx-box",
        "hide": ".pic-box"
      },
      "li[class^=c2018],li.oneline": {
        "detect": "a[class$=red],div[class$=line2]",
        "hide": "div[class$=imgwrap]"
      },
      ".tb-recommend-content-item": {
        "detect": ".info-wrapper",
        "hide": ".img-wrapper"
      },
      "a.item": {
        "detect": "div.item-title",
        "hide": "div.item-image-wrap"
      },
      "ul.ald-switchable-content>li": {
        "detect": "div.img",
        "hide": "div.img"
      },
      ".tuijian-bd-window li": {
        "detect": ".tuijian-img",
        "hide": ".tuijian-img"
      }
    },
    "jd.com": {
      ".gl-i-wrap": {
        "detect": ".p-name",
        "hide": ".p-img"
      },
      "div.mc li[id^=ad]": {
        "detect": ".p-name",
        "hide": ".p-img"
      }
    },
    "weibo.com": {
      ".vue-recycle-scroller__item-view": {
        "detect": "article",
        "hide": "div[class*=content_row]"
      },
      ".card-feed": {
        "detect": ".content",
        "hide": "div[node-type=feed_list_media_prev]"
      }
    },
    "smzdm.com": {
      ".feed-row-wide": {
        "detect": ".feed-block",
        "hide": ".z-feed-img"
      }
    }
  };


let web = Object.keys(webSelectors).filter(k => window.location.host.indexOf(k) != -1);
const fireRandomClass = `fire_${String(Math.random()).replace('.', '')}`;

if (Boolean(web.length)) {
  web = web[0];

  const selectors = webSelectors[web];

  const blockThem = function (target) {
    if (!Boolean(target)) { return }
    // target =target&&Boolean( target) ? target.parentElement : document;
    // if(!Object.keys(selectors).some(selector=>target.querySelector(selector))){return}
    if (!target.querySelector(Object.keys(selectors).join(' , '))) { return }


    if (!document.querySelector(`#${fireRandomClass}`)) {
      let fireStyle = document.createElement('style');
      fireStyle.innerHTML = `
      .${fireRandomClass}{
        overflow:hidden!important;
        position:absolute!important;
        width:100%!important; height:100%!important;
        left:50%!important;top:0!important;
        transform:translate(-50%,0)!important;
        line-height:1em!important;
        opacity:1;
      }
    
      .${fireRandomClass}_parent *{
        opacity:0;
        transition:opacity 0.5s ease;
      }
      .${fireRandomClass}_parent:hover *{
        opacity:1;
        transition:opacity 5s ease;
      }

      .${fireRandomClass}_parent  .${fireRandomClass}{
        opacity:1;
        transition:opacity 0.5s ease;
      }
      .${fireRandomClass}_parent:hover .${fireRandomClass}{
        pointer-events: none;
        opacity:0;
        transition:opacity 5s ease;
      }

      `;
      document.body.appendChild(fireStyle);
    }

    console.log(target, selectors);

    let checker = 'block-checked';
    let fireChecker = '__fire__'
    // console.log( selectors);

    Object.keys(selectors).map(selector => {
      // console.log(selector, document.querySelectorAll(selector));
      //.filter(dom => !dom.hasAttribute(checker))
      [...target.querySelectorAll(selector)].filter(dom => !dom.querySelector(`[${fireChecker}]`)).filter(Boolean).map(dom => {
        console.log(dom);
        dom.setAttribute(checker, true);
        let detectDom = dom.querySelector(selectors[selector]['detect']),
          hideDom = dom.querySelector(selectors[selector]['hide']);

        console.log(detectDom)
        if (detectDom) {
          console.log(dom, detectDom, detectDom.innerHTML.match(wordsReg), hideDom);
        }

        if (detectDom && detectDom.innerHTML.match(wordsReg)) {
          console.log(dom, detectDom, hideDom, detectDom.innerHTML.match(wordsReg));

          if (hideDom) {
            [...hideDom.children].map(h => {
              // h.style.opacity = '0';
              // h.classList.add(`${fireRandomClass}_behind`);

              //    [...h.attributes].map(i=>{
              //   h.removeAttribute(i);
              // });
              /*h.style.display = 'none';*/
            });
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

  blockThem(document.body);


} else { throw ('没有此网站的设置，请检查数据') }
