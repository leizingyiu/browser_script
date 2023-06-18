
var timer = null, delayTime = 1000;
const observeSelector = 'body';
const main = function () {
    const targetAttribute = 'alt', targetValue = document.title.split(' ')[0];
    [...document.querySelectorAll('img')]
        .filter(img => img.getAttribute(targetAttribute) != targetValue)
        .map(img => {
            img.setAttribute(targetAttribute,targetValue);
        });
}


const promiseIt = function (callbackFn) {
    return new Promise((resolve, reject) => {
        callbackFn();
        resolve();
    });
};

const fn = function () {
    console.log('observer fn run');
    main();
};

let targetNode = document.querySelector(observeSelector) || document.body,

    config = { attributes: true, childList: true, subtree: true },

    callback = function (mutationsList, observer) {
        observer.disconnect();

        promiseIt(() => { fn(); });

        timer = timer ? null : setTimeout(
            () => {
                observer.disconnect();
                timer = null;

                targetNode = document.querySelector(observeSelector) || document.body;
                observer.observe(targetNode, config);
            }, delayTime);
    },
    observer = new MutationObserver(callback);
observer.observe(targetNode, config);
