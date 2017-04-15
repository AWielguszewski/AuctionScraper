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
                if (!searchObj.amazon.checked) return Promise.resolve('skip');
                const options = {
                    method: 'GET',
                    uri: `https://www.amazon.com/s/field-keywords=${searchObj.searchVal}`,
                    headers: {
                        'User-Agent': 'request-promise'
                    },
                    resolveWithFullResponse: true,
                    transform: body => cheerio.load(body)
                }
                return request(options)
            })
            .then((response) => {
                if (response !== 'skip') scrapeAmazon(response);
                buildList()
                loadingScreen();
                //fade in content
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


function scrapeAmazon($) {
    $('#s-results-list-atf').children('li').each((index, element) => {
        const item = {
            link: '',
            img: '',
            title: '',
            price: ''
        }
        item.link = $('.a-link-normal', element).attr('href');
        item.img = $('img', element).attr('src');
        item.title = $('h2', element).data('attribute');
        item.price += $('.sx-price-currency', element).text();
        item.price += $('.sx-price-whole', element).text();
        item.price += '.';
        item.price += $('.sx-price-fractional', element).text();

        searchObj.amazon.list.push(item);
    })
}

function buildList() {
    const listContainer = document.getElementById('list-container');
    if (searchObj.amazon.checked) {
        searchObj.amazon.list.forEach((value, index) => {
            const listItemContainer = document.createElement('div');
            listItemContainer.setAttribute('id', `amazon-list-item-${index}`);
            listItemContainer.setAttribute('class', `amazon-list-item-container list-item-container`);

            const listItemWrapper = document.createElement('div');
            listItemWrapper.setAttribute('class', `amazon-list-item-wrapper list-item-wrapper`);

            const listitemImgWrapper = document.createElement('div');
            listitemImgWrapper.setAttribute('class', 'list-item-img-wrapper');

            const listitemImg = document.createElement('img');
            listitemImg.setAttribute('class', 'list-item-img');
            listitemImg.setAttribute('src', value.img);
            listitemImgWrapper.appendChild(listitemImg);

            const listItemPrice = document.createElement('div');
            listItemPrice.setAttribute('class', 'list-item-price');
            listItemPrice.appendChild(document.createTextNode(value.price));

            const listItemTitle = document.createElement('div');
            listItemTitle.setAttribute('class', 'list-item-title');
            listItemTitle.appendChild(document.createTextNode(value.title));

            const listitemLogo = document.createElement('div');
            listitemLogo.setAttribute('class', 'list-item-logo list-item-amazon-logo');

            listItemWrapper.appendChild(listitemImgWrapper);
            listItemWrapper.appendChild(listItemTitle);
            listItemWrapper.appendChild(listItemPrice);
            listItemWrapper.appendChild(listitemLogo);

            listItemContainer.appendChild(listItemWrapper);
            listContainer.appendChild(listItemContainer);

            document.getElementById(`amazon-list-item-${index}`).addEventListener('click', (e) => {
                e.preventDefault();
                //open new window
            })
        })
    }
    if (searchObj.ebay.checked) {
        searchObj.ebay.list.forEach((value, index) => {
            const listItemContainer = document.createElement('div');
            listItemContainer.setAttribute('id', `ebay-list-item-${index}`);
            listItemContainer.setAttribute('class', `ebay-list-item-container list-item-container`);

            const listItemWrapper = document.createElement('div');
            listItemWrapper.setAttribute('id', `ebay-list-item-${index}`);
            listItemWrapper.setAttribute('class', `ebay-list-item-wrapper list-item-wrapper`);

            const listitemImgWrapper = document.createElement('div');
            listitemImgWrapper.setAttribute('class', 'list-item-img-wrapper');

            const listitemImg = document.createElement('img');
            listitemImg.setAttribute('class', 'list-item-img');
            listitemImg.setAttribute('src', value.img);
            listitemImgWrapper.appendChild(listitemImg);

            const listItemPrice = document.createElement('div');
            listItemPrice.setAttribute('class', 'list-item-price');
            listItemPrice.appendChild(document.createTextNode(value.price));

            const listItemTitle = document.createElement('div');
            listItemTitle.setAttribute('class', 'list-item-title');
            listItemTitle.appendChild(document.createTextNode(value.title));

            const listitemLogo = document.createElement('div');
            listitemLogo.setAttribute('class', 'list-item-logo list-item-ebay-logo');

            listItemWrapper.appendChild(listitemImgWrapper);
            listItemWrapper.appendChild(listItemTitle);
            listItemWrapper.appendChild(listItemPrice);
            listItemWrapper.appendChild(listitemLogo);

            listItemContainer.appendChild(listItemWrapper);
            listContainer.appendChild(listItemContainer);

            document.getElementById(`ebay-list-item-${index}`).addEventListener('click', (e) => {
                e.preventDefault();
                //open new window
            })
        })
    }
}

function errorHandler(error) {
    //handle errors
    console.log(`ERROR: ${error}`);
}


/* TODO
DONE    1.txt box, przycisk szukaj, checkboxy do osobno allegro,amazon,ebay
DONE    2.wciskam przycisk, sprawdzam czy pole txt nie jest puste
DONE    3.dajemy loading spinner
SKIPPED (to complicated)    4.pobieramy allegro, scrapujemy, wyscrapowane dodajemy do tablicy
DONE    5.pobieramy amazon ...
DONE    6.pobieramy ebay...
7.budujemy html z lista
8.spinner fade out
9.dodajemy html z listą
10.lista fade in
*/