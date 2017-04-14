'use strict'

const { ipcRenderer } = require('electron')
const req = require('tinyreq')
const cheerio = require('cheerio')

document.getElementById("search_btn").addEventListener("click", (e) => {
    e.preventDefault();
    const search_value = document.getElementById('txt_box').value;
    if (search_value) {
        fadeOutSearchScreen()
            .then((response) => {
                console.log(response);
                return loadingScreen();
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log('Rejection: ' + error);
            });
    }
    else { errorHandler('emptyvalue') }
});

function fadeOutSearchScreen() {
    return new Promise((resolve, reject) => {
        const searchGroup = document.getElementById('search-group-wrapper');
        searchGroup.className = 'fadeout';
        setTimeout(() => {
            searchGroup.className = 'hidden'
            resolve('search screen faded out');
        }, 500);
    })
}

function loadingScreen() {
    return new Promise((resolve, reject) => {
        const loadingDiv = document.getElementById('loading-container');
        if (loadingDiv.classList.contains('hidden')) {
            loadingDiv.classList.remove('hidden');
            loadingDiv.classList.add('visible');
            resolve('loading screen loaded');
        }
        else if (loadingDiv.classList.contains('visible')) {
            loadingDiv.classList.remove('visible');
            loadingDiv.classList.add('hidden');
            resolve('loading screen hidden');
        }
    })
}

function scrape(url) {
    return new Promise((resolve, reject) => {
        req(url, (err, requestedPage) => {
            function searchNodes(node) {
                if ($(node).children().length) {
                    console.log(`Children of '${$.html(node)}' :\n`);
                    $(node).children().each((i, elem) => {
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
    console.log(`ERROR: ${error}`);
}


/* TODO
1.txt box, przycisk szukaj, checkboxy do osobno allegro,amazon,ebay
2.wciskam przycisk, sprawdzam czy pole txt nie jest puste
3.jezeli txt niepuste to przesuwamy logo + wszystkielementy na gore, zaciemniamy oraz dajemy loading spinner
4.pobieramy allegro, scrapujemy, wyscrapowane dodajemy do tablicy
5.pobieramy amazon ...
6.pobieramy ebay...
7.tworzymy liste elementow, dodajemy do niej na przemian po jednym z kazdego
8.spinner fade out
9.dodajemy html z listą
10.lista fade in
*/