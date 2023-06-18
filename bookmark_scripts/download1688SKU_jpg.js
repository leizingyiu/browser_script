function downloadImg(url, name) {
    fetch(url).then(function (response) {
        response.arrayBuffer().then(res => {
            let type = "image/*";
            /* 常见资源类型
              1.excel: type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              2.图片: type = "image/*"
              3.视频: type = "video/*"
              4.音频: type = "audio/*"
            */
            let blob = new Blob([res], { type: type });

            var objectUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.download = name ||
                String(window.location.host).replace(/\./g, '_') + '_' + (new Date()).toString().slice(0, 24);

            a.href = objectUrl;
            console.log(a);
            a.click();
            document.body.removeChild(a);
        });
    });
}


const shopComponent = String(document.querySelector('#shop-container-header #hd_0_container_0>div>div').id),
    shopName = window.__STORE_DATA.components[shopComponent]['moduleData']['companyName'],
    itemName = document.querySelector('.title-content .title-text').innerText;


[...document.querySelectorAll(".sku-item-wrapper , .prop-item")].map(dom => {

    if (dom.querySelector('.sku-item-image , .prop-img')) {
        let url = dom.querySelector('.sku-item-image , .prop-img').style.backgroundImage.split("(\"")[1].split("\")")[0],
            name = shopName + "_" +
                itemName + "_" +
                dom.querySelector('.sku-item-name , .prop-name').innerText +
                url.match(/\.[^.]+$/);

        downloadImg(url, name);

        return { [name]: url }
    }
})