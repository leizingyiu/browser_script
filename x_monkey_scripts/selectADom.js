{
    let s = document.createElement('style');
    s.innerText = `.hB{border:solid 2px #f00;}`; document.body.appendChild(s);
}

const useCapture = false;
function clickFn(dom) {
    console.log('click: ', dom, dom.classList, document.querySelector('.hB'));
    dom.removeEventListener('click', clickFn);
}
function addingFn(dom) {
    dom.classList.add('hB');
    dom.addEventListener('click', function (event) {
        clickFn(dom);
        preventIt(event);
        return false;
    }, useCapture);

}
function removeFn(dom) {
    dom.removeEventListener('click', clickFn);
    dom.removeEventListener('mouseout', outFn)
    dom.classList.remove('hB');
}
function removeAllFn() {
    [...document.querySelectorAll('.hB')].map(_d => {
        removeFn(_d)
    });
}
function preventIt(event) {
    event.preventDefault(); event.stopPropagation();
}

function outFn(event) {

    removeFn(event.target);
    removeAllFn();

    console.log('out: ', event, event.target);

    preventIt(event);
    return false;
}
function overFn(event) {

    removeAllFn();
    addingFn(event.target);
    console.log('over: ', event, event.target);

    preventIt(event);
    return false;
}

[...document.querySelectorAll('*')].map(d => {
    d.addEventListener('mouseover', overFn, useCapture);
    d.addEventListener('mouseout', outFn, useCapture);

})