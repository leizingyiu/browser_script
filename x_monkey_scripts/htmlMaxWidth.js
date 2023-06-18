// ==UserScript==
// @name        htmlMaxWidth
// @namespace   leizingyiu.net
// @match       *leizingyiu.net*
// @grant       none
// @version     1.0
// @author      -
// @description 2022/10/10 16:42:26
// ==/UserScript==


function multKeys(keysArr, callback) {
    keysArr = [...new Set(keysArr)];
    console.log(keysArr);

    const tokenJoining = '_',
        tokenSortFunction = (_a, _b) => {
            let a = String(_a),
                b = String(_b);
            if (a.length != b.length) {
                return a.length - b.length;
            } else {
                return a.localeCompare(b);
            }
        },
        tokenFn = arr => arr.sort(tokenSortFunction).join(tokenJoining),
        keysToken = tokenFn(keysArr);
    let keys = [];

    window.addEventListener('keydown', function (ev) {
        let k = ev.key.length == 1 ? ev.code.toLowerCase().replace('key', '').replace('digit', '') : ev.key.toLowerCase();
        keys.push(k);
        keys = [...new Set(keys)];
        console.log(ev, keys);

        let hitKeys = keys.filter(key => keysArr.includes(key)),
            hitToken = tokenFn(hitKeys);
        if (hitToken == keysToken) {
            callback(ev);
            keys = [];
        }
    })
    window.addEventListener('keyup', function (ev) {
        let k = ev.key.length == 1 ? ev.code.toLowerCase().replace('key', '').replace('digit', '') : ev.key.toLowerCase();
        keys = keys.filter(_k => _k != k);
        console.log(ev, keys);
    })
}

function htmlMaxWidth_x(n) {
    console.trace()
    let maxW, num, unit;
    maxW = document.querySelector('html').style.maxWidth;
    if (maxW) {
        num = maxW.match(/[\d\.]+/);
        if (num) {
            num = Number(num[0]);
            unit = maxW.replace(num, '');
        } else {
            num = 100;
            unit = 'vw';
        }
    } else {
        num = 100;
        unit = 'vw';
    }
    if (isFinite(n)) {
        if (n == 0) {
            console.log(`n:${n} is 0, the <html> width will be 0.`);
        }
        num = n * num;
        let maxWidth = num + unit;
        console.log(num, unit, maxWidth);
        document.querySelector('html').style.maxWidth = maxWidth;
        document.querySelector('html').style.margin = '0 auto';

        document.querySelector('body').style.minWidth = '0';
    } else {
        console.error(`n:${n} is not finite`);
    }
}



multKeys(['control', '1'], () => {
    console.log(1);
    htmlMaxWidth_x((1 / 0.9))
});
multKeys(['control', '2'], () => {
    console.log(2);
    htmlMaxWidth_x(0.9)
})