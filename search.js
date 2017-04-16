'use strict'

const { ipcRenderer } = require('electron')
const request = require('request-promise')
const cheerio = require('cheerio')

const searchObj = {
    searchVal: '',
    amazon: { checked: true, list: [] },
    ebay: { checked: true, list: [] }
}

document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    if (keyName === 'Enter') {
        if (document.getElementById('content-wrapper').classList.contains('hidden')) { firstSearch() }
        else { anotherSearch() }
    }
}, false)

function firstSearch() {
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
                return fadeInContentScreen();
            })
            .catch((error) => {
                console.log('Rejection: ' + error);
            });
    }
    else { errorHandler('emptyvalue') }
}

function anotherSearch() {
    searchObj.searchVal = document.getElementById('fixed_txt_box').value;

    if (searchObj.searchVal) {
        fadeOutContentScreen()
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
                return fadeInContentScreen();
            })
            .catch((error) => {
                console.log('Rejection: ' + error);
            });
    }
    else { errorHandler('emptyvalue') }
}


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

function fadeInContentScreen() {
    return new Promise((resolve, reject) => {
        const content = document.getElementById('content-wrapper');
        content.className = 'fadein content-wrapper';
        setTimeout(() => {
            content.classList.add('visible');
            resolve('content screen loaded');
        }, 500);
    })
}

function fadeOutContentScreen() {
    return new Promise((resolve, reject) => {
        const content = document.getElementById('content-wrapper');
        content.className = 'fadeout content-wrapper';
        setTimeout(() => {
            content.className = 'hidden content-wrapper';
            resolve('content screen hidden');
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
    searchObj.ebay.list = [];
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
    searchObj.amazon.list = [];
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
        item.price += $('.sx-price-currency', element).first().text();
        item.price += $('.sx-price-whole', element).first().text();
        item.price += '.';
        item.price += $('.sx-price-fractional', element).first().text();

        searchObj.amazon.list.push(item);
    })
}

function buildList() {
    const listContainer = document.getElementById('list-container');
    listContainer.innerHTML = '';

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

            const listItemTitlePriceWrapper = document.createElement('div');
            listItemTitlePriceWrapper.setAttribute('class', 'list-item-title-price-wrapper ')

            const listItemPriceWrapper = document.createElement('div');
            listItemPriceWrapper.setAttribute('class', 'list-item-price-wrapper amazon-list-item-price-wrapper');
            const listItemPrice = document.createElement('span');
            listItemPrice.setAttribute('class', 'list-item-price');
            listItemPrice.appendChild(document.createTextNode(value.price.trim()));
            listItemPriceWrapper.appendChild(listItemPrice);

            const listItemTitleWrapper = document.createElement('div');
            listItemTitleWrapper.setAttribute('class', 'list-item-title-wrapper');
            const listItemTitle = document.createElement('span');
            listItemTitle.setAttribute('class', 'list-item-title');
            listItemTitle.appendChild(document.createTextNode(value.title));
            listItemTitleWrapper.appendChild(listItemTitle);

            const listitemLogoWrapper = document.createElement('div');
            listitemLogoWrapper.setAttribute('class', 'list-item-logo-wrapper list-item-amazon-logo-wrapper');
            const listitemLogo = document.createElement('img');
            listitemLogo.setAttribute('class', 'list-item-logo list-item-amazon-logo');
            listitemLogo.setAttribute('src', 'assets/amazon-logo.svg');
            listitemLogoWrapper.appendChild(listitemLogo);

            listItemTitlePriceWrapper.appendChild(listItemTitleWrapper);
            listItemTitlePriceWrapper.appendChild(listItemPriceWrapper);
            listItemWrapper.appendChild(listitemImgWrapper);
            listItemWrapper.appendChild(listItemTitlePriceWrapper);
            listItemWrapper.appendChild(listitemLogoWrapper);

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

            const listItemTitlePriceWrapper = document.createElement('div');
            listItemTitlePriceWrapper.setAttribute('class', 'list-item-title-price-wrapper')

            const listItemPriceWrapper = document.createElement('div');
            listItemPriceWrapper.setAttribute('class', 'list-item-price-wrapper ebay-list-item-price-wrapper');
            const listItemPrice = document.createElement('span');
            listItemPrice.setAttribute('class', 'list-item-price');
            listItemPrice.appendChild(document.createTextNode(value.price.trim()));
            listItemPriceWrapper.appendChild(listItemPrice);

            const listItemTitleWrapper = document.createElement('div');
            listItemTitleWrapper.setAttribute('class', 'list-item-title-wrapper');
            const listItemTitle = document.createElement('span');
            listItemTitle.setAttribute('class', 'list-item-title');
            listItemTitle.appendChild(document.createTextNode(value.title));
            listItemTitleWrapper.appendChild(listItemTitle);

            const listitemLogoWrapper = document.createElement('div');
            listitemLogoWrapper.setAttribute('class', 'list-item-logo-wrapper list-item-ebay-logo-wrapper');
            const listitemLogo = document.createElement('img');
            listitemLogo.setAttribute('class', 'list-item-logo list-item-ebay-logo');
            listitemLogo.setAttribute('src', 'assets/ebay-logo.svg');
            listitemLogoWrapper.appendChild(listitemLogo);

            listItemTitlePriceWrapper.appendChild(listItemTitleWrapper);
            listItemTitlePriceWrapper.appendChild(listItemPriceWrapper);
            listItemWrapper.appendChild(listitemImgWrapper);
            listItemWrapper.appendChild(listItemTitlePriceWrapper);
            listItemWrapper.appendChild(listitemLogoWrapper);

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