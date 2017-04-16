'use strict'

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

let win

/**
 * Creating the main window.
 * 800x600 (minimum width set to 800 px)
 * Loaded page: search-screen.html
 * Window is printed on screen when 'ready-to-show' event fires
 */
function createWindow() {
    win = new BrowserWindow({
        minWidth: 800,
        width: 800,
        height: 600,
        backgroundColor: '#FFFFFF',
        webPreferences: {
            devTools: true
        },
        autoHideMenuBar: true
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'search-screen.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.on('closed', () => {
        win = null
    })

    win.once('ready-to-show', () => {
        win.show()
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

/**
 * (not used in this application)
 * Event for Inter Process Communication
 * Loads provided URL into the main window
 * @param {string} url URL to load
 */
ipcMain.on('loadURL', (e, url) => {
    console.log('got msg');
    win.loadURL('file:///' +__dirname + url);
})

