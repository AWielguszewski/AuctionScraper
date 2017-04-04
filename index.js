'use strict';

const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

let win

/**
 * Creating the main window.
 * 800x600
 */
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#1f1f1f',
        webPreferences: {
            devTools: true
        },
        autoHideMenuBar: true
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
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