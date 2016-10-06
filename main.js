/**
 * Created by jihad.kherfan on 9/29/2016.
 */
'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const mysql      = require('mysql');
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database: 'test'
});
var mainWindow = null;
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
    mainWindow = new BrowserWindow({width: 1280, height: 700,minWidth:1280, minHeight: 700 ,maximizable : true});
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    mainWindow.on('closed', function() {
        connection.end();
        mainWindow = null;
    });
});