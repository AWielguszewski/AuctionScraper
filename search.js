'use strict'

const { ipcRenderer } = require('electron')
const req = require('tinyreq')

document.getElementById("search_btn").addEventListener("click", (e) => {
    e.preventDefault();
    const pattern = /(\b(https?):\/\/)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/i;
    const url = document.getElementById('txt_box').value;
    if (pattern.test(url)) {
        req(url, (err, body) => {
            console.log(err || body);
        });
    }
    else {
        alert('inproper URL');
    }
});