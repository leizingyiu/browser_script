javascript:

/* setting */
priceSelector = '.tm-promo-price .tm-price , #J_PromoPriceNum , .tb-rmb-num';
skuSelector = '.tb-prop dd ul li a';
loadingWaitTime = 100;
activateGapTime = 50;

/* style */
let style = document.createElement('style');
style.innerText = '.tb-prop li a:after , #detail .tb-key .tb-prop li:after {content: attr(price);}';
document.body.appendChild(style);

/* main function */
function fn() {
    let that = this;
    setTimeout(
        function () {
            that.setAttribute('price', '¥' + document.querySelector(priceSelector).innerText);
            that.removeEventListener('click', fn);
        }, loadingWaitTime
    );
}

/* addEventListener */
[...document.querySelectorAll(skuSelector)].map(li => {
    li.addEventListener('click', fn);
});

/* activate */
[...document.querySelectorAll(skuSelector)].map((li, idx) => {
    setTimeout(
        () => {
            li.click()
        },
        idx * loadingWaitTime + activateGapTime
    );
});

