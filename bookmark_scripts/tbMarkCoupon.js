
couponText = '';
objs = [...document.querySelectorAll('.J_ShopCouponList  .coupon-detail')]
    .filter(coupon => coupon.querySelector('.coupon-received'))
    .map(coupon => coupon.querySelector('.coupon-title').innerText)
    .map(text => {
        let result = {};
        console.log(text.replace(/满(\d+)减(\d+)/g, function () {
            console.log(arguments);
            result['standard'] = arguments[1];
            result['subtraction'] = arguments[2];
            couponText += ' ' + arguments[0];
        }));
        return result;
    });
couponObjs = { coupons: objs };
console.log(couponText, couponObjs)

let span = document.createElement('span')
span.innerText = couponText;
span.setAttribute('data-coupon', JSON.stringify(couponObjs));

document.querySelector('.shop-coupon-trigger-hover').parentElement.appendChild(span);

