/**
 * Created by jihad.kherfan on 9/29/2016.
 */
'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipc = electron.ipcMain;
const path = require('path');
var mainWindow = null;


app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }

});

app.on('ready', function() {

    //Main window
    const mainWindowPath = path.join('file://' + __dirname + '/app/index.html');
    mainWindow = new BrowserWindow({width: 1280, height: 700,minWidth:1280, minHeight: 700 ,maximizable : true});
    mainWindow.loadURL(mainWindowPath);
    mainWindow.on('close', function () { mainWindow = null; });
    mainWindow.on('closed', function() { mainWindow = null; });



    //New project window
    const newProjectPath = path.join('file://'+ __dirname +'/project/index.html');
    var newProject = new BrowserWindow({width: 1280, height: 700 ,minWidth: 1280, minHeight: 700 ,maximizable : true,show: false})
    newProject.loadURL(newProjectPath);

    ipc.on('show-project-win', function(){
       newProject.show();
    });

    newProject.on('close', function (event) {
        newProject.hide();
        event.preventDefault();
    });

    //
});