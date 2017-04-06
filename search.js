'use strict'

const { ipcRenderer } = require('electron')
const req = require('tinyreq')
const cheerio = require('cheerio')

document.getElementById("search_btn").addEventListener("click", (e) => {
    e.preventDefault();
    const pattern = /(\b(https?):\/\/)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/i;
    const url = document.getElementById('txt_box').value;
    if (pattern.test(url)) {
        scrape(url)
            .then(page => { processPage(page); })
            .catch(error => { errorHandler(error); });
    }
    else {
        alert('inproper URL');
    }
});

function scrape(url) {
    return new Promise((resolve, reject) => {
        req(url, (err, requestedPage) => {
            function searchNodes(node) {
                if ($(node).children().length) {
                    console.log(`Children of '${$.html(node)}' :\n`);
                    $(node).children().each((i,elem)=>{
                        console.log(`#${i}: ${$.html(elem)}`);
                        searchNodes(elem);
                    })
                    return;
                }
                console.log(`${$.html(node)} has no children`);
            }

            if (err) { reject('error in an http request'); }
            const $ = cheerio.load(requestedPage);

            searchNodes($('body'));
            //resolve($.html());
        });
    })
}

function processPage(page) {
    //handle page contents
    console.log(page);
    document.getElementById('append').innerHTML = page;
}

function errorHandler(error) {
    //handle errors
}

