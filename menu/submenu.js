const {Menu} = require('electron')
const electron = require('electron')
const app = electron.app

const template = [
  {
    label: 'Page',
    submenu: [
      {
        label: 'Quit',
        accelerator:'CmdOrCtrl+Q',
        click(){
          app.quit();
        }
      }
    ] 
  }
];

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)