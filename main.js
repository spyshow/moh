/**
 * Created by jihad.kherfan on 9/29/2016.
 */
'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipc = electron.ipcMain;
var mainWindow = null;


app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }

});

app.on('ready', function() {
    mainWindow = new BrowserWindow({width: 1280, height: 700,minWidth:1280, minHeight: 700 ,maximizable : true});
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');


    var newProject = new BrowserWindow({width: 1000, height: 700 ,minWidth: 1000, minHeight: 700 ,maximizable : true,show: false})
    newProject.loadURL('file://'+ __dirname +'/project/index.html');


    ipc.on('show-project-win', function(){
       newProject.show();
    });

    newProject.on('close', function (event) {
        newProject.hide();
        event.preventDefault();
    })

    /* mainWindow.on('closed', function() {
        connection.end();
        mainWindow = null;
    }); */
});