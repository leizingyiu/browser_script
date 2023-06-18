
let _dict = {};
[...document.querySelectorAll('.order-body')]
    .filter(shop => shop.querySelector('.cart-checkbox-checked'))
    .map(shop => {
        console.log(shop);
        let shopName = shop.querySelector('.shop-info  .J_MakePoint').innerText;
        let dict = {};
        let list = [...shop.querySelectorAll('.item-holder')]
            .filter(item => item.querySelector('.cart-checkbox-checked'))
            .map(item => {
                let name = item.querySelector('.item-basic-info').innerText;
                let price = item.querySelector('.price-now').innerText.replace(/[^0-9.]/g, '');
                dict[name] = Number(price);
                console.log(item);
            });
        console.log(dict);
        _dict[shopName] = {};
        _dict[shopName]['items'] = dict;
        return dict;
    });


console.log(_dict);
