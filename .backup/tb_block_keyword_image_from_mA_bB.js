// ==UserScript==
// @name        淘宝按关键字屏蔽图片
// @namespace   leizingyiu.net
// @version     2022-07-15
// @description 按照个人喜好，在block_keywords填写关键字，用中文或者英文逗号隔开，就可以根据这些关键字，把对应的图片，替换成 replacement 的火，或者自行填写 replacement 的内容
// @icon        https://www.taobao.com/favicon.ico
// @author      Leizingyiu
// @include     *://s.taobao.com/*
// @grant       none
// @license     GNU AGPLv3 
// ==/UserScript==

//在这里填写关键字，用中文或者英文逗号隔开
var block_keywords='肖战，双立人，滴露，益达，usmile,gucci,GUCCI,开小灶，隅田川，德芙，石头科技，欧扎克'.split(/[\s,，]{1,}/).filter(a => Boolean(a)),
    wordsReg = new RegExp('(' + (block_keywords.map(word => `(${word})`).join('|') + ')')),
    replacement='🔥',
    selectors={
        '.item':{
            'detect':'.ctx-box',
            'hide':'.pic-box'
        }
    },
    delayTime=1000;
// console.log(wordsReg);
function blockThem(){
Object.keys(selectors).map(selector=>{
    [...document.querySelectorAll(selector)].map(dom=>{
        let detectDom=dom.querySelector(selectors[selector]['detect']),
            hideDom=dom.querySelector(selectors[selector]['hide']);
        if(detectDom && detectDom.innerText.match(wordsReg)){
            // console.log(dom,detectDom,hideDom,detectDom.innerText.match(wordsReg)); 
            if(hideDom){
              [...hideDom.children].map(h=>{console.log(h);h.style.opacity='0';h.style.display='none';});
                let fire=document.createElement('i');
                fire.innerText=replacement;
                fire.style.cssText=`overflow:hidden;position:absolute;width:100%;height:100%;left:0;right:0;top:0;bottom:0;`;
                fire.style.fontSize=hideDom.clientHeight+'px';
                hideDom.appendChild(fire);
            }
        }

    });    
});
}

setTimeout(blockThem,delayTime);