// ==UserScript==
// @name        云相册优化器 - 图片大小调整[alt +/-]、视频筛选[alt v/i]、右侧列表最大化显示[alt f]、切换是否分组[alt g]
// @namespace   leizingyiu.net
// @include     http*://photo.baidu.com/*
// @include     http*://pm.qq.com/*
// @grant       none
// @version     2023/2/14
// @author      leizingyiu
// @description 图片大小调整： 放大['alt','+'] , 缩小['alt','-']  ； 视频筛选： 查看视频['alt','v'] , 查看图片['alt','i'] , 再次点击则取消筛选；右侧列表最大化显示： ['alt','f'], 点击切换全屏视图； 切换是否按照日期分组： ['alt','g']
// ==/UserScript==

// Created: "2023/1/5 17:53:35"
// Last modified: "2023/02/14 15:05:08"

/* // global functions */
function log() { console.log(...arguments); }
function addStyle(style_sheet_id, style_text) {
    if (document.getElementById(style_sheet_id)) {
        document.getElementById(style_sheet_id).innerText = style_text;
        if (typeof log != 'undefined') { log(`#${style_sheet_id}.innerText has been replace; `); }
    } else {
        let style = document.createElement('style');
        style.innerText = style_text;
        style.id = style_sheet_id;
        document.body.appendChild(style);
    }
}
function removeStyle() {
    let result = false;
    [...arguments].map(selector => {
        if (document.querySelectorAll(selector).length > 0) {
            [...document.querySelectorAll(selector)].map(d => {
                d.parentElement.removeChild(d);
            });
            result = true;
        }
    });
    return result;
}
function throttle(func, wait, must_run) {
    var time_out,
        start_time = new Date();

    return function () {
        var that = this,
            args = arguments,
            cur_time = new Date();

        clearTimeout(time_out);
        if (cur_time - start_time >= must_run) {
            func.apply(that, args);
            start_time = cur_time;
        } else {
            time_out = setTimeout(func, wait);
        }
    };
};
class multKeysObj {
    constructor() {
        var that = this;

        this.ignore = false;
        this.ignoreList = [];
        this.ignoreDict = [];

        this.console = function () {
            //  console.log(...arguments);
        };
        this.registration = {};
        this.allKeysArr = [];
        this.keys = [];
        this.waterKeys = [];

        this.tokenJoining = '_';
        this.tokenSortFunction = (_a, _b) => {
            let a = String(_a),
                b = String(_b);
            if (a.length != b.length) {
                return a.length - b.length;
            } else {
                return a.localeCompare(b);
            }
        };
        this.tokenFn = (arr) => arr.sort(this.tokenSortFunction).join(this.tokenJoining);
        this.evKey = (ev) => {
            that.console(ev, ev.key);

            let result = ev.key.length == 1 || ev.key.toLowerCase() == 'dead' ?
                ev.code.toLowerCase().replace('key', '').replace('digit', '') :
                ev.key.toLowerCase();
            that.console(ev.type, ev, result);
            return result;
        };

        window.addEventListener('keydown', function (ev) {
            if (typeof ev.key == 'undefined') { return false; }
            let k = that.evKey(ev);

            /*ignore start */
            if (that.ignoreDict.includes(k)) {
                that.console('ignore ' + k);
                that.ignore = true;
                that.ignoreList.push(k);
                that.ignoreList = [...new Set(that.ignoreList)];
                return false;
            }

            if (that.ignore == true) {
                that.console('ignore true: ', that.ignoreList);
                return false;
            }
            /*ignore end */


            that.keys.push(k);
            that.keys = [...new Set(that.keys)];

            let hitKeys = that.keys.filter((key) => that.allKeysArr.includes(key)),
                hitToken = that.tokenFn(hitKeys);

            that.console('keydown', '\n\t',
                ev, k, '\n\t',
                hitKeys, hitToken, '\n\t',
                that);

            Object.entries(that.registration).map(o => {
                let [token, setting] = o;
                if (hitToken == token && (!that.waterKeys.includes(k))) {
                    setting.callback(that.keys, ev);
                    that.console('down', token, ' run callback ');
                    if (setting.fireBoolean == false) {
                        // that.keys = that.keys.filter(key => key != k);
                        that.waterKeys.push(k);
                        that.waterKeys = [... new Set(that.waterKeys)];
                        that.console('down, add ', k, ' to ', that.waterKeys, that);
                    }
                }
            });

        });

        window.addEventListener("keyup", function (ev) {
            if (typeof ev.key == 'undefined') { return false; }

            let hitKeys_before = [...that.keys.filter((key) => that.allKeysArr.includes(key))],
                hitToken_before = String(that.tokenFn(hitKeys_before));

            let k = that.evKey(ev);
            that.keys = that.keys.filter((_k) => _k != k);

            /*ignore start */
            if (that.ignoreDict.includes(k)) {
                that.console('ignore release :' + k);

                that.ignoreList = that.ignoreList.filter((_k) => _k != k);

                if (that.ignoreList.length == 0) {
                    that.ignore = false;
                }

                return false;
            }

            if (that.ignore == true) {
                that.console('ignore true: ', that.ignoreList);
                return false;
            }
            /*ignore end */


            let hitKeys_after = [...that.keys.filter((key) => that.allKeysArr.includes(key))],
                hitToken_after = String(that.tokenFn(hitKeys_after));

            that.console('keyup', '\n\t',
                ev, k, '\n\t',
                hitKeys_before, hitToken_before, '\n\t',
                hitKeys_after, hitToken_after, '\n\t',
                that);


            Object.entries(that.registration).map(o => {

                let [token, setting] = o;

                if (hitToken_before == token &&
                    hitKeys_before != hitToken_after
                ) {

                    if (typeof setting.releaseCallback === 'function') {
                        that.console('up', token, 'run release callback');
                        setting.releaseCallback(that.keys, ev);
                    }



                }

                if (setting.fireBoolean == false &&
                    that.waterKeys.includes(k) &&
                    setting.keysArr.includes(k)
                ) {
                    that.waterKeys = that.waterKeys.filter(key => key != k);
                    that.console('up, remove ', k, ' from ', that.waterKeys, that);
                }

            });
        });
    }

    registerIgnore() {
        [...arguments].map(k => {
            if (typeof k != 'string') {
                console.error('register ignore dict error: ', k, ' is not a string');
                return false;
            }
            this.ignoreDict.push(k);
        });
        this.ignoreDict = [...new Set(this.ignoreDict)];
    };

    register(keysArr, callback, releaseCallback = () => { }, fireBoolean = false) {
        keysArr = [...new Set(keysArr)];
        const keyToken = this.tokenFn(keysArr);
        this.allKeysArr.push(...keysArr);
        this.allKeysArr = [...new Set(this.allKeysArr)];

        this.registration[this.tokenFn(keysArr)] = {
            'keysArr': keysArr,
            'callback': callback,
            'releaseCallback': releaseCallback,
            'fireBoolean': fireBoolean
        };
    };

}
/* global functions // */

const img_scale_up_shortKeysArr = ['alt', 'equal'],
    img_scale_down_shortKeysArr = ['alt', 'minus'],
    img_scale_ori_shortKeysArr = ['alt', '0'],

    videoFilterShortKeysArr = ['alt', 'v'],
    imgFilterShortKeysArr = ['alt', 'i'],

    fullScreenShortKeysArr = ['alt', 'f'],

    ungroupShortKeysArr = ['alt', 'g'];

const m = new multKeysObj();
m.registerIgnore('control', 'meta');

const featureBasicSettingFns = {
    'img_video_filter': function (itemClass, videoItemFilterFn) {

        /* 视频筛选函数 */
        const imgClassName = 'yiu_album_filter_img',
            videoClassName = 'yiu_album_filter_video',
            imgStyleText = 'border-bottom:4px solid #e214cc;',
            videoStyleText = 'border-bottom:4px solid #6f20f2;',
            videoFilterStyleId = 'yiu_album_filter_video_style',
            imgFilterStyleId = 'yiu_album_filter_img_style';

        const yiu_album_filter_itemAddClass = function (
            itemSelector, videoFilterFunc, imgClassName, videoClassName) {
            if (typeof log != 'undefined') { log('yiu_album_filter addingClass run'); }
            [...document.querySelectorAll(itemSelector)].map(i => {
                if (!videoFilterFunc(i)) {
                    i.classList.add(imgClassName);
                } else {
                    i.classList.add(videoClassName);
                }
            });
        },
            yiu_album_filter_bodyAddStyle = function (
                styleId1, class1, styleContent1, styleId2, class2) {
                if (typeof log != 'undefined') { log('yiu_album_filter addingStyle run'); }
                if (removeStyle(`#${styleId1}`) == false) {
                    removeStyle(`#${styleId2}`);
                    addStyle(styleId1, `
    .${class1}{
      ${styleContent1}
    }
    .${class2}{display:none!important;}
    .${class1}, .${class2}{
    }
  `);
                }
            }
        img_video_filter_fn = function (tf) {
            if (Boolean(tf) == true) {
                yiu_album_filter_setupFn();
                yiu_album_filter_bodyAddStyle(
                    videoFilterStyleId, videoClassName, videoStyleText,
                    imgFilterStyleId, imgClassName);
            } else {
                yiu_album_filter_setupFn();
                yiu_album_filter_bodyAddStyle(
                    imgFilterStyleId, imgClassName, imgStyleText,
                    videoFilterStyleId, videoClassName);
            }
        }

        const yiu_album_filter_setupFn = function () {
            yiu_album_filter_itemAddClass(
                itemClass,
                videoItemFilterFn,
                imgClassName, videoClassName);
        },
            album_filter_setup = function () {
                window.addEventListener('wheel',
                    throttle((realFunc) => {
                        yiu_album_filter_setupFn();
                    }, 500, 1000)
                );
            };

        album_filter_setup();

    }
}

let img_scale_fn, img_video_filter_fn, full_screen_fn, ungroup_fn;

const fns = {
    "photo.baidu.com": {
        "img_scale": {
            "setup": function () {
                /* 图片缩放函数 */
                const img_scale_element_fn = function (img) {
                    const num = (s) => s.match(/[\d\.]+/g).length > 0 ? s.match(/[\d\.]+/g)[0] : 0;
                    img.style.setProperty('--k', num(img.style.width) / num(img.style.height));
                    img.style.setProperty('width', 'calc( var(--height) * var(--k) * var(--scale)  )');
                    img.style.setProperty('height', 'calc( var(--height) * var(--scale)   )')
                },
                    mainSetup = function (defaultHeight) {
                        setTimeout(
                            () => {
                                document.body.style.setProperty('--scale', 1);
                                if (document.querySelector('.img-container')) {
                                    document.body.style.setProperty('--height', document.querySelector('.img-container').style.height);
                                } else {
                                    document.body.style.setProperty('--height', defaultHeight ? defaultHeight + 'px' : '200px');
                                }

                                [...document.querySelectorAll('.img-container')]
                                    .map(img => { img_scale_element_fn(img); });
                            }, 1000);
                    };
                img_scale_fn = function (k) {
                    if (arguments.length == 0) { document.body.style.setProperty('--scale', 1); }
                    document.body.style.setProperty('--scale', Number(document.body.style.getPropertyValue('--scale')) + k);
                    [...document.querySelectorAll('.img-container')]
                        .filter(img => Boolean(img.style.width.match(/\d/)))
                        .map(img => { img_scale_element_fn(img); });

                }
                mainSetup();
            },
            "keyRegisters": [
                {
                    "keysArr": img_scale_up_shortKeysArr,
                    "fn": () => { img_scale_fn(0.1); },
                    "releaseFn": null,
                    "fire": true
                }, {
                    "keysArr": img_scale_down_shortKeysArr,
                    "fn": () => { img_scale_fn(-0.1); },
                    "releaseFn": null,
                    "fire": true
                }, {
                    "keysArr": img_scale_ori_shortKeysArr,
                    "fn": () => { img_scale_fn(); },
                    "releaseFn": null,
                    "fire": true
                }
            ]
        },
        "img_video_filter": {
            "setup": function () {
                /* 视频筛选函数 */
                featureBasicSettingFns.img_video_filter('.photo-item',
                    item => item.querySelector('.video-duration'));
            },
            "keyRegisters": [
                {
                    "keysArr": videoFilterShortKeysArr,
                    "fn": () => { img_video_filter_fn(true) },
                    "releaseFn": null,
                    "fire": false
                },
                {
                    "keysArr": imgFilterShortKeysArr,
                    "fn": () => { img_video_filter_fn(false) },
                    "releaseFn": null,
                    "fire": false
                }
            ]
        },
        "full_screen": {
            "setup": function () {
                /* 全屏视图函数 */
                const full_screen_classname = 'yiu_yike_display_big',
                    full_screen_setup = function (classname) {
                        addStyle('yiu_album_fullScreen_style', `
    body.${classname}{
    --left:0px;
    --top:0px;
    }
    
    body{
    --left:210px;
    --top:60px;
    }
    
    body.${classname} .yk-side{
    width:var(--left);
    overflow:hidden;
    transition:width 1s ease;
    }
    
    body.${classname} .yk-header{
    height:var(--top);
    overflow:hidden;
    transition: highte 1s ease;
    }
    
    
    body.${classname} .yk-container__main,
    body .yk-container__main{
    width: calc(100% - var(--left));
    /*height: calc(100% - var(--top));*/
    height:100% ;
    
    top: var(--top);
    left: var(--left);
    transition: width 1s ease,
                height 1s ease,
                top 1s ease,
                left 1s ease;
    }
    body.${classname} .yk-index{
    height:100vh;
    transition: highte 1s ease;
    }
    
    
    body.${classname} .global-top{
    top: calc( 0- var(--top));
    transition: top 1s ease;
    
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    place-content: space-between;
    }
    
    body.${classname}  .global-top * {
        align-items: baseline;
    }
    
    body.${classname}  .global-top .album-mess {
        flex-direction: column;
        flex-grow: 2;
        padding:0 1em;
    }
    
    body.${classname} .yk-index .album-box{
    padding:0;
    }
    
    body.${classname}  .yk-index .album-detail{
    margin-top:0;
    }
    
    body.${classname}  .date-list .date-item .time{
        position: inherit;
        top:0!important;
        transition: top 1s ease;
    
    }
    `)
                    };
                full_screen_setup(full_screen_classname);

                full_screen_fn = () => { document.body.classList.toggle(full_screen_classname); };
            },
            "keyRegisters": [{
                "keysArr": fullScreenShortKeysArr,
                "fn": () => { full_screen_fn(); },
                "releaseFn": null,
                "fire": false
            }]
        },
        "ungroup": {
            "setup": function () {
                /* 相册解组函数 */
                const ungroup_classname = 'yiu_yike_ungroup',
                    ungroup_setting = function (classname) {
                        addStyle('yiu_album_ungroup_style', `
                    body.${classname} .time{display: none;}
                    body.${classname} .photo-list{float: left;}
                    body.${classname} .photo-item{float:left;}
                    
                    body.${classname} .date-list ,
                    body.${classname}  .date-item,
                    body.${classname} .photo-list{display: contents!important;}
                    
                    body.${classname}  .yk-index>.global-top+div{height: auto; overflow: hidden;}
                    `);
                    };
                ungroup_setting(ungroup_classname);
                ungroup_fn = () => {
                    document.body.classList.toggle(ungroup_classname);
                    img_scale_fn(0);
                }
            },
            "keyRegisters": [{
                "keysArr": ungroupShortKeysArr,
                "fn": () => { ungroup_fn() },
                "releaseFn": null,
                "fire": false
            }]
        }
    },
    "pm.qq.com": {
        "img_video_filter": {
            "setup": function () {
                /* 视频筛选函数 */
                featureBasicSettingFns.img_video_filter('.img-item',
                    item => item.querySelector('.play'));
            },
            "keyRegisters": [
                {
                    "keysArr": videoFilterShortKeysArr,
                    "fn": () => { img_video_filter_fn(true) },
                    "releaseFn": null,
                    "fire": false
                },
                {
                    "keysArr": imgFilterShortKeysArr,
                    "fn": () => { img_video_filter_fn(false) },
                    "releaseFn": null,
                    "fire": false
                }
            ]
        },
        "full_screen": {
            "setup": function () {
                /* 全屏视图函数 */
                const full_screen_classname = 'yiu_pmQQ_display_big',
                    full_screen_setup = function (classname) {
                        addStyle('yiu_pmQQ_fullScreen_style', `

                        body.${classname} section header.el-header[data-v-bbbb8a2e]{
                            height: 0!important;    overflow: hidden;
                        }
                        body.${classname}  section aside.el-aside-customed[data-v-bbbb8a2e]{
                            width: 0!important;     overflow: hidden;
                        }

                        body section header.el-header[data-v-bbbb8a2e],
                        body section aside.el-aside-customed[data-v-bbbb8a2e]{
                            transition:height 0.4s ease,width 0.5s ease;
                        }
                        body.${classname}  section aside.el-aside-customed[data-v-bbbb8a2e] *{
                            position: relative;
                        }
                        body.${classname}  section main.el-main{
                            height: 100vh;
                            margin: 0;
                            position: fixed;
                            left: 0;right: 0;top: 0;bottom: 0;
                            padding: 0;
                            overflow: scroll;
                        }
                        body  section main.el-main{
                            transition:margin 0.6s ease,
                                    padding 0.8s ease,
                                    height 0.6s ease;
                        }
                        
                        body.${classname} section .file-box{
                            padding:1em 2em 0;
                        }
                        
                        body.${classname} section .tool-box[data-v-42a50602]{
                            position: sticky;
                            top:0px;
                        }
                        
                        `);
                    };
                full_screen_setup(full_screen_classname);

                full_screen_fn = () => { document.body.classList.toggle(full_screen_classname); };
            },
            "keyRegisters": [{
                "keysArr": fullScreenShortKeysArr,
                "fn": () => { full_screen_fn(); },
                "releaseFn": null,
                "fire": false
            }]
        },
        "ungroup": {
            "setup": function () {
                /* 相册解组函数 */


                var status = 0;

                const ungroup_classname = 'yiu_pmQQ_ungroup'
                showMonth_classname = 'yiu_pmQQ_month',
                    ungroup_setting = function (classname) {

                        addStyle('yiu_album_ungroup_style', `
                    body.${classname} main span.month-box[data-v-42a50602]{
                        width: 0;height: 0;opacity: 0; overflow:hidden;
                    }

                    body.${classname} .file-box , 
                    body.${classname} .file-box .img-box[data-v-42a50602],
                    body.${classname} .file-box .img-item[data-v-42a50602]{
                        display: contents;float: left;
                    }
                    body.${classname} .file-box .img-item[data-v-42a50602]{
                        display: inline-block;
                    }

                    .month_br{
                        display:none;
                    }  
                    body.${classname}.${showMonth_classname} .month_br{
                        display:inherit;
                    }

                    body.${classname}.${showMonth_classname} main span.month-box[data-v-42a50602]{
                        display: inline-block; float: left; width: auto; height: auto; opacity: 1; overflow: auto; margin-right: 1em; }

                    `);
                    };
                ungroup_setting(ungroup_classname);
                ungroup_fn = () => {
                    switch (status % 3) {
                        case 0:
                            document.body.classList.add(ungroup_classname);
                            break;
                        case 1:
                            [...document.querySelectorAll('.month')]
                                .filter(span => !span.querySelector('.month_br'))
                                .map(span => {
                                    span.innerHTML = span.innerHTML.replace(/([^\d]+)/g, "$1<i class='month_br'><br></i>")
                                });
                            document.body.classList.add(showMonth_classname);
                            break;
                        case 2:
                        default:
                            document.body.classList.remove(ungroup_classname, showMonth_classname);
                    };
                    // document.body.classList.toggle(ungroup_classname);
                    status++;

                    if (img_scale_fn) { img_scale_fn(0) };
                }
            },
            "keyRegisters": [{
                "keysArr": ungroupShortKeysArr,
                "fn": () => { ungroup_fn() },
                "releaseFn": null,
                "fire": false
            }]
        }
    }
};

const fn = fns[window.location.hostname];

Object.keys(fn).map(k => {
    if (typeof fn[k].setup != 'undefined') {
        fn[k].setup();
    }
    if (typeof fn[k].keyRegisters != 'undefined') {
        fn[k].keyRegisters.map(arg => {
            m.register(...Object.values(arg));
        });
    }
});

