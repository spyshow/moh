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

    //New project window
    const newProjectPath = path.join('file://'+ __dirname +'/project/project.html');
    var newProject = new BrowserWindow({width: 1280, height: 700 ,minWidth: 1280, minHeight: 700 ,maximizable : true,show: false})
    newProject.loadURL(newProjectPath);

    newProject.on('close', function (event) {
        newProject.hide();
    });

    ipc.on('show-project-win', function(){
        newProject.show();
    });

    //report page
    const reportPath = path.join('file://'+ __dirname +'/report/report.html');
    var report = new BrowserWindow({width: 1140, height: 584 ,minWidth: 1140, minHeight: 584,maxWidth: 1140, maxHeight: 584 ,maximizable : false,show: true})
    report.loadURL(reportPath);

    report.on('close', function (event) {
        report.hide();
    });

    ipc.on('show-report-win', function(){
        report.show();
    });

});