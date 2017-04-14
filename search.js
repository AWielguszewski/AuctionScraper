'use strict'

const { ipcRenderer } = require('electron')
const request = require('request-promise')
const cheerio = require('cheerio')

const searchObj = {
    searchVal: '',
    amazon: { checked: true, list: [] },
    ebay: { checked: true, list: [] }
}

document.getElementById("search_btn").addEventListener("click", (e) => {
    e.preventDefault();
    searchObj.searchVal = document.getElementById('txt_box').value;
    searchObj.amazon.checked = document.getElementById('amazonCheck').checked;
    searchObj.ebay.checked = document.getElementById('ebayCheck').checked;

    if (!searchObj.amazon.checked && !searchObj.ebay.checked) { errorHandler('nothingChecked'); }
    else if (searchObj.searchVal) {
        fadeOutSearchScreen()
            .then((response) => {
                console.log(response);
                return loadingScreen();
            })
            .then((response) => {
                console.log(response);
                if (!searchObj.ebay.checked) return Promise.resolve('skip');
                const options = {
                    method: 'GET',
                    uri: `http://www.ebay.com/sch/i.html?_nkw=${searchObj.searchVal}`,
                    resolveWithFullResponse: true,
                    transform: body => cheerio.load(body)
                }
                return request(options)
            })
            .then((response) => {
                if (response !== 'skip') scrapeEbay(response);
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

function scrapeEbay($) {
    $('#ListViewInner').children('li').each((index, element) => {
        const item = {
            link: '',
            img: '',
            title: '',
            price: ''
        }
        item.link = $('.vip', element).attr('href');
        item.img = $('img', element).attr('src');
        item.title = $('.lvtitle', element).text();
        item.price = $('.lvprice', element).text();

        searchObj.ebay.list.push(item);
    })
}

function errorHandler(error) {
    //handle errors
    console.log(`ERROR: ${error}`);
}


/* TODO
DONE    1.txt box, przycisk szukaj, checkboxy do osobno allegro,amazon,ebay
DONE    2.wciskam przycisk, sprawdzam czy pole txt nie jest puste
DONE    3.dajemy loading spinner
4.pobieramy allegro, scrapujemy, wyscrapowane dodajemy do tablicy
5.pobieramy amazon ...
6.pobieramy ebay...
7.tworzymy liste elementow, dodajemy do niej na przemian po jednym z kazdego
8.spinner fade out
9.dodajemy html z listą
10.lista fade in
*/