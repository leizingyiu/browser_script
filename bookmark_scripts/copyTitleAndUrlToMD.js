javascript:
function copyStr(str) {
    var a = document.createElement('textarea');
    a.value = str;
    document.body.appendChild(a);
    a.select();
    document.execCommand('Copy');
    a.style.display = 'none';
    a.parentElement.removeChild(a);
    window.confirm(str + '   <=内容已复制到剪贴板');
    // switch (true) {
    //     case Boolean(str.match(/http.*/g)):
    //         var resultBoo = window.confirm(str + '内容已复制到剪贴板,是否前往内容？');
    //         if (resultBoo == true) {
    //             urlReg = /[htpHTPsS]+:\/\/\S+/g;
    //             location.href = str.match(urlReg) ? str.match(urlReg)[0] : 'javascript:void 0;';
    //         };
    //         break;
    //     default:
    //         var resultBoo = window.confirm(str + '   <=内容已复制到剪贴板');
    // }
    // return resultBoo;
};

var str = `[${document.title}](${window.location.href})`;
copyStr(str);
void 0;