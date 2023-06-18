// ==UserScript==
// @name        downloadImageBtn
// @namespace   leizingyiu.net
// @include     *://*.*/*
// @grant       none
// @version     2023/2/5 02:13:01
// @author      leizingyiu
// @description 2023/2/5 02:13:01
// ==/UserScript==

// Created: "2023/2/5 02:13:01"
// Last modified: "2023/02/21 12:07:22"

// 20230221 todo: 只插入一个下载按钮，hover image 才飘过去
// 另外添加一个div，用来装着<a>，hover image之后，div占据img的位置；
// 但是div的pointevent为none

window.yiuDownloadRestule = false;

function setOnBeforeUnload(boo = false) {

    if (typeof window.originOnBeforeUnload == 'undefined') {
        window.originOnBeforeUnload = () => { };
    }

    if (typeof window.onbeforeunload != 'undefined' && boo == true) {
        window.originOnBeforeUnload = window.onbeforeunload;
    }
    if (boo == true) {
        window.onbeforeunload = function () {
            window.yiuDownloadRestule = false;

            setTimeout(() => { window.onbeforeunload = window.originOnBeforeUnload; }, 100);
            return false;
        }
    } else {
        window.onbeforeunload = window.originOnBeforeUnload;
    }
    console.log(window.originOnBeforeUnload, window.onbeforeunload);
}

function download1(link, filename) {
    let img = new Image()
    img.setAttribute('crossOrigin', 'Anonymous')
    img.onload = function () {
        try {

            setOnBeforeUnload(true);


            let canvas = document.createElement('canvas')
            let context = canvas.getContext('2d')
            canvas.width = img.width
            canvas.height = img.height
            context.drawImage(img, 0, 0, img.width, img.height)
            let url = canvas.toDataURL('images/png')
            let a = document.createElement('a');
            let event = new MouseEvent('click');
            a.download = filename || 'default.png'
            a.href = url
            a.dispatchEvent(event);

            showDosnloadResult(`download success`);
            setOnBeforeUnload(false);

        } catch (err) {
            console.log(`download ${link} ${filename} by canvas failed`)
            download2(link, filename);
        }
    }
    img.src = link;
    return false;
}

function download2(link, filename) {

    setOnBeforeUnload(true);

    const url = link + (link.indexOf('?') == -1 ? '?' : '&') + 'response-content-type=application/octet-stream';
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || url.replace(/(\.[^\s?]*).*$/, '$1');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.downloadResult = true;

    setTimeout(() => {
        if (window.yiuDownloadRestule == true) {
            console.log('download2', window.yiuDownloadRestule);
            showDosnloadResult(`download success`);
        } else {
            console.log('download2', window.yiuDownloadRestule);
            showDosnloadResult(`download ${link} error`);
        }
        setOnBeforeUnload(false);

    }, 1000);
    return false;
}

function showDosnloadResult(text) {
    document.body.style.setProperty('--download-result', `"${text}"`);
    document.body.classList.add('yiu_download_image_show_result');
    setTimeout(() => {
        document.body.classList.remove('yiu_download_image_show_result');
        document.body.style.setProperty('--download-result', '"-"')
    },
        2000);
}


let div = document.createElement('div');
div.classList.add('yiu_download_image_result');
document.body.appendChild(div);

function addingDownloadBtn(target = document) {
    console.log('runing addingDownloadBtn on', target);
    if (!target.querySelector('img')) { return false }

    [...target.querySelectorAll('img')].map(img => {

        img.parentElement.style.position = 'relative';
        img.parentElement.classList.add('yiu_download_image');
        let a = document.createElement('a');


        a.innerText = 'download';
        a.classList.add('yiu_download_image_btn');
        a.href = 'javascript:void 0;';
        a.onclick = function () {
            let downloadLink = img.src,
                downloadName = document.title.replace(/(\.\S*).*/, '$1'),
                downloadLastName = img.src.match(/(?<=\.)[^?#\/:*"><|]+(?![:\/a-zA-Z0-9\.\\])/);
            downloadLastName = downloadLastName != null ? downloadLastName[0] : 'png';
            console.log(downloadLink, downloadName + '.' + downloadLastName);
            if (downloadLastName == 'gif') {
                download2(downloadLink, downloadName + '.' + downloadLastName)
            } else {
                download1(downloadLink, downloadName + '.' + downloadLastName);
            }
            return false;
        };
        a.addEventListener('mouseenter', function () {
            if (a.parentElement.hasAttribute('href')) {
                a.parentElement.setAttribute('data-href', a.parentElement.href);
                a.parentElement.removeAttribute('href');
            }
            if (a.parentElement.onclick) {
                a.parentElement.originOnclick = a.parentElement.onclick;
                a.parentElement.onclick = null;
            }
        });
        a.addEventListener('mouseleave', function () {
            if (a.parentElement.hasAttribute('data-href')) {
                a.parentElement.setAttribute('href', a.parentElement.getAttribute('data-href'));
            }
            if (typeof a.parentElement.originOnclick != 'undefined') {
                a.parentElement.onclick = a.parentElement.originOnclick;
            }
        })
        img.parentElement.appendChild(a);

    });
}
{//yiu_download_image_style
    let style = document.createElement('style');
    style.id = 'yiu_download_image_style';
    let styleText = `
  .yiu_download_image:hover a.yiu_download_image_btn{
  opacity:1;
   transition:opacity 0.5s ease;
  }
  .yiu_download_image a.yiu_download_image_btn{
  display:block;
   position: absolute;    bottom: 1em;    left: 1em;   padding: 1em;
    background: #fffb;     color: #333;
    border-radius: 0.5vh;  cursor: pointer;
    opacity:0;
  height: 1.5em;box-sizing: content-box;
  transition:opacity 0.5s ease;
  }

  .yiu_download_image_result{
  position:fixed;top:0;left:0;
    width:0%;height:0%;
  background: #00000033; opacity:0;
  transition:opacity 0.5s ease;

  }
  body.yiu_download_image_show_result .yiu_download_image_result{
      width:100%;height:100%;
    opacity:1;
  }

  body.yiu_download_image_show_result  .yiu_download_image_result:after{
    content: var(--download-result);   padding: 1em;
    position: absolute;    top: 50%;    left: 50%;    transform: translate(-50%,-50%);
    background: #ffffffdd;
    border-radius: 0.5em;
  }
  body{
  --download-result:'-';
  }
`;
    if (document.getElementById(style.id)) {
        document.getElementById(style.id).innerText = styleText
    } else {
        style.innerText = styleText;
        document.body.appendChild(style);
    }
}


addingDownloadBtn();

const mutationCallback = (mutationsList) => {
    for (let mutation of mutationsList) {
        let type = mutation.type;
        switch (type) {
            case "childList":
                console.log("A child node has been added or removed.", mutation);
                console.log(mutation.addedNodes);
                observe.disconnect();
                [...mutation.addedNodes].map(m => {
                    addingDownloadBtn(m);
                });
                observe.observe(document.body, config);
                break;
            case "attributes":
                console.log(`The ${mutation.attributeName} attribute was modified.`);
                break;
            case "subtree":
                console.log(`The subtree was modified.`);
                break;
            default:
                break;
        }
    }
};
let config = {
    attributes: false, //目标节点的属性变化
    childList: true, //目标节点的子节点的新增和删除
    characterData: false, //如果目标节点为characterData节点(一种抽象接口,具体可以为文本节点,注释节点,以及处理指令节点)时,也要观察该节点的文本内容是否发生变化
    subtree: true, //目标节点所有后代节点的attributes、childList、characterData变化
};

var observe = new MutationObserver(mutationCallback);
observe.observe(document.body, config);// 后面介绍config的配置

//observe.disconnect();
