'use strict'

const {ipcRenderer} = require('electron')

document.getElementById("btn1").addEventListener("click", (e) => {
    e.preventDefault();
    ipcRenderer.send('loadURL','http://google.com');
});