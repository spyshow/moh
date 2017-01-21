/*
  TODO

  1- email
*/


"use strict";

const electron = require('electron');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const  {dialog} = require('electron');
const ipc = electron.ipcMain;
const path = require('path');
const {shell} = require('electron');
const pdf = require('html-pdf');
const fs = require('fs');
const {Menu} = require('electron');
const async = require('async');
const sql = require('mssql');


//======================================================================================================================
//create MsSQL connection

var config = {
  user: 'test',
  password: '123456',
  server: 'ENG3',
  port: 1433,
  database: 'test',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    instanceName: 'SQLEXPRESS'
  }
};

var charm = {
  user: 'test',
  password: '123456',
  server: 'ENG3',
  port: 1433,
  database: 'CharmNT_MR_User',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    instanceName: 'SQLEXPRESS'
  }
};

//======================================================================================================================
//notification



//======================================================================================================================
// Managing windows

var mainWindow = null;
var newProject = null;
var newEvaluation = null;
var report = null;

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function () {

  //Main window
  const mainWindowPath = path.join('file://'+__dirname+'/app/index.html');
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 700,
    minWidth: 1280,
    minHeight: 700,
    maximizable: true
  });
  mainWindow.loadURL(mainWindowPath);
  mainWindow.center();
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  //mainWindow.openDevTools();
  mainWindow.on('closed', function () {
    newProject.close();
    newProject = null;
    newEvaluation.close();
    newEvaluation = null;
    report.close();
    report = null;
    mainWindow = null;
    //if(newProject === null && newEvaluation === null && mainWindow === null && report === null){
      app.quit();
    //}
    
  });

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
    //New project window
  const newProjectPath = path.join('file://' + __dirname + '/project/project.html');
  newProject = new BrowserWindow({
    width: 1280,
    height: 700,
    minWidth: 1280,
    minHeight: 700,
    maximizable: true,
    show: false
  });
  newProject.setMenu(null);
  newProject.loadURL(newProjectPath);
  newProject.on('close', function (event) {
    newProject.hide();
    event.preventDefault();
  });



  //New Evaluation window
  const newEvaluationPath = path.join('file://' + __dirname + '/evaluations/evaluations.html');
  newEvaluation = new BrowserWindow({
    width: 1280,
    height: 737,
    minWidth: 1280,
    minHeight: 737,
    maxWidth: 1280,
    maxHeight: 737,
    maximizable: false,
    show: false
  });
  //newEvaluation.openDevTools();
  newEvaluation.setMenu(null);
  newEvaluation.loadURL(newEvaluationPath);
  newEvaluation.on('close', function (event) {
    newEvaluation.hide();
    event.preventDefault();
  });



  //report page
  const reportPath = path.join('file://' + __dirname + '/report/report.html');
  report = new BrowserWindow({
    width: 1140,
    height: 514,
    minWidth: 1140,
    minHeight: 514,
    maxWidth: 1140,
    maxHeight: 514,
    maximizable: false,
    show: false
  });
  //report.openDevTools();
  report.setMenu(null);
  report.loadURL(reportPath);
  report.on('close', function (event) {
    report.hide();
    event.preventDefault();
  });




});

ipc.on('reload-projects',function(){
  mainWindow.webContents.send('refresh-projects');
});

ipc.on('show-new-project', function () {
  newProject.show();
  newProject.center();
  newProject.webContents.send('show-new-project');
});

ipc.on('show-edit-project', function (event, project_id) {
  newProject.show();
  newProject.center();
  newProject.webContents.send('show-edit-project', project_id);
});

ipc.on('show-evaluation', function (event, project_id) {
  newEvaluation.show();
  newEvaluation.center();
  newEvaluation.webContents.send('show-evaluation', project_id);
});

ipc.on('show-report-win', function (event, project_id) {
  report.show();
  report.center();
  report.webContents.send('show-report',project_id);
});

//============================================================================================================================
// Mail

ipc.on('mail', function (event,issueID,project_title) {
  sendMail(issueID,project_title);

});

function sendMail(issue_id,project_title) {
  //makeing a temp folder if not exist
  if (!fs.existsSync(app.getPath('userData')+'\\temp\\')){
    fs.mkdirSync(app.getPath('userData')+'\\temp\\');
  }

  // building the PDF

  
  var conn2 = new sql.Connection(config, function (err) {
      if (err) {
          console.log(err);
      } else {
          var docx = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<style>' +
                'body {' +
                'padding: 0 20px;' +
                '}' +
                '.td {' +
                'width: 40%;' +
                'text-align: left;' +
                '}' +
                '.bold {' +
                'vertical-align: top;' +
                'padding-top:10px;' +
                'text-align: left;' +
                'font-weight: bold;' +
                'width: 20%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>'+
                '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Project ID: ' + project_title + '</p><div style="page-break-after:always;"></div>';
          var request = new sql.Request(conn2);
          request.multiple = true;
          request
              .input('issue_id', issue_id)
              .query('SELECT * FROM [issues] WHERE id = @issue_id; '+
                  'SELECT [date], [description] FROM [actions] WHERE [issue_id] = @issue_id; ' +
                  'SELECT [name] FROM [customers] INNER JOIN [issues_customers] as ic ON [customers].[id] = ic.[customer_id] WHERE [issue_id] = @issue_id; ' +
                  'SELECT [name],[cd] FROM [baselines] INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id] WHERE [issue_id] = @issue_id; '+
                  'SELECT type,path FROM files WHERE issue_id = @issue_id;')
              .then(function (data2) {
                  var baseline = (data2[3][0])? data2[3][0].name : 'No Baseline';
                  var arr = '';
                  arr += '<table style="table-layout: fixed; width: 100%;">' +
                      '<tbody>' +
                      '<tr>' +
                      '<td class="bold">DB ID:</td>' +
                      '<td class="td">' + data2[0][0].dbid + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">Date:</td>' +
                      '<td class="td">' + data2[0][0].date + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">Work:</td>' +
                      '<td class="td">' + data2[0][0].work +'</td>' +
                      '</tr>' +
                      '<tr>' ;
                  switch(data2[0][0].area){
                    case 1:
                      arr +='<td class="bold">Area:</td>' +
                            '<td class="td">Application</td>' ;
                      break;
                    case 2:
                      arr +='<td class="bold">Area:</td>' +
                            '<td class="td">Software</td>' ;
                      break;
                    case 3:
                      arr +='<td class="bold">Area:</td>' +
                            '<td class="td">Hardware</td>' ;
                      break;
                    case 4:
                      arr +='<td class="bold">Area:</td>' +
                            '<td class="td">Documentation</td>' ;
                      break;
                    case 5:
                      arr +='<td class="bold">Area:</td>' +
                            '<td class="td">Wish</td>' ;
                      break;
                    case 6:
                      arr +='<td class="bold">Area:</td>' +
                            '<td class="td">Training</td>' ;
                      break;
                  }    
                  arr +='</tr>' +
                      '<tr>' +
                      '<td class="bold">Key:</td>' +
                      '<td class="td">' + data2[0][0].key + '</td>' +
                      '</tr>' +
                      '<tr>' ;
                  switch(data2[0][0].priority){
                    case 1:
                      arr +='<td class="bold">Priority:</td>' +
                            '<td class="td">High</td>' +
                            '</tr>';
                      break;
                    case 2:
                      arr +='<td class="bold">Priority:</td>' +
                            '<td class="td">Medium</td>'  +
                            '</tr>';
                      break;
                    case 3:
                      arr +='<td class="bold">Priority:</td>' +
                            '<td class="td">Low</td>' +
                            '</tr>';
                      break;
                  } 
                  switch(data2[0][0].reproducible){
                    case 1:
                      arr +='<tr>'+
                            '<td class="bold">Reproducible:</td>' +
                            '<td class="td">Yes</td>' +
                            '</tr>';
                      break;
                    case 2:
                      arr +='<tr>'+
                            '<td class="bold">Reproducible:</td>' +
                            '<td class="td">No</td>' +
                            '</tr>';
                      break;
                    case 3:
                      arr +='<tr>'+
                            '<td class="bold">Reproducible:</td>' +
                            '<td class="td">Sporadic</td>' +
                            '</tr>';
                      break;
                  }
                  switch(data2[0][0].messenger){
                    case 1:
                      arr +='<tr>'+
                            '<td class="bold">Messenger:</td>' +
                            '<td class="td">Customer</td>' +
                            '</tr>';
                      break;
                    case 2:
                      arr +='<tr>'+
                            '<td class="bold">Messenger:</td>' +
                            '<td class="td">Application</td>' +
                            '</tr>';
                      break;
                    case 3:
                      arr +='<tr>'+
                            '<td class="bold">Messenger:</td>' +
                            '<td class="td">monitoring</td>' +
                            '</tr>';
                      break;
                    case 4:
                      arr +='<tr>'+
                            '<td class="bold">Messenger:</td>' +
                            '<td class="td">installation</td>' +
                            '</tr>';
                      break;
                  }
                  switch(data2[0][0].no_further_action){
                    case '0':
                      arr +='<tr>'+
                            '<td class="bold">No further action:</td>' +
                            '<td class="td">No</td>' +
                            '</tr>';
                      break;
                    case '1':
                      arr +='<tr>'+
                            '<td class="bold">No further action:</td>' +
                            '<td class="td">Yes</td>' +
                            '</tr>';
                      break;
                  }
                  arr +='<tr>' +
                      '<td class="bold">Customers:</td><td  class="td">';
                  for (let s = 0; s < data2[2].length; s++) {
                      if (s === (data2[2].length - 1)) {
                          arr += data2[2][s].name;
                      } else {
                          arr += data2[2][s].name + ', ';
                      }
                  }
                  
                  arr += '</td></tr>' +
                      '<tr>' +
                      '<td class="bold">Baseline:</td>' +
                      '<td  class="td">' + baseline + '</td>' +
                      '</tr>';

                  if (data2[0][0].charm && data2[0][0].defect) {
                      arr += '<tr>' +
                          '<td class="bold">Charm/Defect:   </td>' +
                          '<td  class="td">' + data2[0][0].charm + '/' + data2[0][0].defect + '</td>';
                  } else if (data2[0][0].charm) {
                      arr += '<tr>' +
                          '<td class="bold">Charm:          </td>' +
                          '<td  class="td">' + data2[0][0].charm + '</td>';
                  } else if (data2[0][0].defect) {
                      arr += '<tr>' +
                          '<td class="bold">Defect:         </td>' +
                          '<td  class="td">' + data2[0][0].defect + '</td>';
                  } else {
                      arr += '<tr>' +
                          '<td class="bold">Charm/Defect:   </td>' +
                          '<td  class="td">No Number</td>';
                  }
                  arr += '<td></td>' +
                      '<td class="bold" style="vertical-align: top;">Stauts: ' + data2[0][0].status + '</td>' +
                      '</tr>' +
                      '</tbody>' +
                      '</table>' +
                      '<table style="margin-top:20px;">' +
                      '<tbody>' +
                      '<tr>' +
                      '<td class="bold" style="vertical-align: top;" >Summary:</td>' +
                      '<td style="vertical-align: top; padding-top:10px;">' +data2[0][0].summary+ '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold" style="vertical-align: top;" >Description:</td>' +
                      '<td style="vertical-align: top; padding-top:10px;">' +data2[0][0].description + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold" style="vertical-align: top;" >Description [Dutch]:</td>' +
                      '<td style="vertical-align: top; padding-top:10px;">' +data2[0][0].description_de + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold" style="vertical-align: top;" >Solution:</td>' +
                      '<td style="vertical-align: top; padding-top:10px;">' +data2[0][0].solution + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold" style="vertical-align: top;" >Solution [Dutch]:</td>' +
                      '<td style="vertical-align: top; padding-top:10px;">' +data2[0][0].solution_de + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold" style="vertical-align: top;" >Communication to  customer:</td>' +
                      '<td style="vertical-align: top; padding-top:10px;">' +data2[0][0].c2c + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td style="vertical-align: top;" class="bold">action:</td>' +
                      '<td>' +
                      '<table style="table-layout: fixed; width: 100%;">';
                      
                  data2[1].forEach(function (data21) {
                    console.log(data21.date , data21.description);
                      arr += '<tr>' +
                          '<td style="vertical-align: top;width: 100px; padding-top:10px;">' + data21.date + '</td>' +
                          '<td style="vertical-align: top; padding-top:10px;">' + data21.description + '</td>' +
                          '</tr>';

                  });
                  arr += '</table>' +
                         '</td>' +
                         '</tr>' +
                         '<tr>' +
                         '<td  class="bold">Files:</td>' +
                         '<td>' +
                         '<table style="table-layout: fixed; width: 100%;">';
                  data2[4].forEach(function (data22) {
                      arr += '<tr>' +
                          '<td style="vertical-align: top;width: 100px; padding-top:10px;">' + data22.type + '</td>' +
                          '<td style="vertical-align: top; padding-top:10px;">' + data22.path + '</td>' +
                          '</tr>';

                  });
                  arr += '</table>' +
                      '</td>' +
                      '</tr>' +
                      '</tbody>' +
                      '</table>' +
                      '</body></html>';
                  docx += arr;
                  var conf = {
                      "format": "A4",
                      "header": {
                          "height": "20mm"
                      }
                  };
                  pdf.create(docx, conf).toBuffer(function(err, buffer) {
                      if (err) {
                          console.log(err);
                      }
                      var email = 'cc: im.mr.cpf.healthcare@siemens.com\r\n'+
                                  'X-Unsent: 1\r\n'+
                                  'Subject: '+project_title+':'+data2[0][0].summary+':'+data2[0][0].dbid+'\r\n'+
                                  'Mime-Version: 1.0\r\n'+
                                  'Content-Type: multipart/mixed; boundary="----=_Part_2192_32400445.1115745999735"\r\n\r\n'+
                                  '------=_Part_2192_32400445.1115745999735\r\n'+
                                  'Content-Type: text/plain; charset=UTF-8\r\n'+
                                  'Content-Transfer-Encoding: quoted-printable\r\n'+
                                  '\r\n'+
                                  'Dear colleague,\r\n\r\n'+
                                  'please find an issue from '+project_title+' in the .pdf file attached\r\n'+
                                  'Please reply.\r\n\r\n'+
                                  'Best regards\r\n'+
                                  'Your CUT team\r\n\r\n'+
                                  '***************************************************************************\r\n\r\n'+
                                  'Liebe Kollegin, lieber Kollege,\r\n\r\n'+
                                  'Anbei eine Rückmeldung aus dem '+project_title+' als .pdf im Anhang dieser E-Mail.\r\n'+
                                  'Wir bitten um Antwort.\r\n\r\n'+
                                  'Viele Grüße\r\n'+
                                  'CUT team\r\n\r\n'+
                                  '------=_Part_2192_32400445.1115745999735\r\n'+
                                  '--6a82fb459dcaacd40ab3404529e808dc\r\n'+
                                  'Content-Type: application/pdf; name="'+project_title+'-'+data2[0][0].dbid+'.pdf"\r\n'+
                                  'Content-Transfer-Encoding: base64\r\n'+
                                  'Content-Disposition: attachment; filename="'+project_title+'-'+data2[0][0].dbid+'.pdf"\r\n'+
                                  '\r\n'+
                                  ''+buffer.toString('base64')+'\r\n\r\n'+
                                  '------=_Part_2192_32400445.1115745999735--';
                      console.log(email);
                      fs.writeFile(app.getPath('userData')+'\\temp\\1.eml', email, (err) => {
                        if (err) throw err;
                        shell.openItem(app.getPath('userData')+'\\temp\\1.eml');
                        setTimeout(function(){
                          shell.moveItemToTrash(app.getPath('userData')+'\\temp\\1.eml');
                        },2000);
                      });                                
                  });
              }).catch(function (error) {
                  console.log(error);
              });
      }
  });
}

//============================================================================================================================
// import Charm

ipc.on('importCharm', function (event,project_ID,project_title) {
  
      var connection1 = new sql.Connection(config, function (err) {
      if (err) {
        //showNotification('error connecting: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      } else {
        let docx = '<!DOCTYPE html>' +
                  '<html>' +
                  '<head>' +
                  '<style>' +
                  'body {' +
                  'padding: 0 20px;' +
                  '}' +
                  '.bold {' +
                  'text-align: left;' +
                  'font-weight: bold;' +
                  'width: 20%;' +
                  '}' +
                  '</style>' +
                  '</head>' +
                  '<body>'+
                  '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Project: ' + project_title + '</p><div style="page-break-after:always;"></div>';
        var request = new sql.Request(connection1);
        request
          .input('project_id', sql.Int, project_ID)
          .query('SELECT [issues].[id],[issues].[charm],[issues].[work],[issues].[status],[issues].[vsn]'+
            ' FROM [issues] ' +
            ' WHERE [issues].[project_id] = @project_id AND [issues].[charm] IS NOT NULL  ORDER BY [issues].[id] DESC')
          .then(function (data) {
            async.timesSeries(data.length, function (n, callback) {
                var conn2 = new sql.Connection(charm, function (err) {
                if (err) {
                   // showNotification('error connecting for selecting actions for ALL issues: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                  var request = new sql.Request(conn2);
                  request
                   .input('id','MR_00'+data[n].charm)
                  .query('SELECT state_num as status,remain_name as work,real_version as vsn FROM Defect where id=@id')
                  .then(function (data2) {
                    if(data[n].work != data2[0].work){ docx += '<p>in Charm number MR_00'+data[n].charm+' the work changed from "'+data[n].work+'" to "'+data2[0].work+'"</p>';}
                    if(data[n].status  != data2[0].status ){ docx += '<p>in Charm number  MR_00'+data[n].charm+' the status  changed from "'+data[n].status +'" to "'+data2[0].status+'"</p>' ;}
                    if(data[n].vsn != data2[0].vsn){ docx += '<p>in Charm number  MR_00'+data[n].charm+' the vsn changed from "'+data[n].vsn+'" to "'+data2[0].vsn+'"</p>';}
                    console.log(docx);
                  }).catch(function (error) {
                   // showNotification('Charm Number Error: Wrong Charm Number', 'danger', 'glyphicon glyphicon-tasks');
                  });
                  callback();
                }
              });
            }, function () {
               setTimeout(function () {
                var conf = {
                        "format": "A4",
                        "header": {
                            "height": "20mm"
                        }
                    };
                dialog.showSaveDialog({
                    filters: [{
                        name: 'PDFs',
                        extensions: ['pdf']
                    }],
                    title: 'Save the Import Charm as PDF',
                    defaultPath: path.join(app.getPath('desktop'), 'Import Charm.pdf')
                }, function (filename) {
                    pdf.create(docx, conf).toFile(filename, function (err, res) {
                    });
                });
              }, 100);
            });
          });
      }
    });
  
});

//============================================================================================================================
// template for main menu

const template = [{
    label: 'Project',
    submenu: [{
      label: 'Load Project',
      click() {
        mainWindow.webContents.send('load-project');
      }
    },{
      label: 'Import Charm',
      click() {
        mainWindow.webContents.executeJavaScript(`
          var ipcRenderer = require('electron').ipcRenderer;
          var project_name = document.getElementById('project_name');
          var project_title = project_name.options[project_name.selectedIndex].text;
          var project_ID = project_name.options[project_name.selectedIndex].value;
          ipcRenderer.send('importCharm',project_ID,project_title);
        `);
      }
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click() {
        app.quit();
      }
    }]
  }, {
    label: 'Mail',
    submenu: [{
      label: 'Send issue as PDF',
      click() {
        mainWindow.webContents.executeJavaScript(`
          var ipcRenderer = require('electron').ipcRenderer;
          var issueID = document.getElementById("issueID").value; 
          var project_name = document.getElementById('project_name');
          var project_title = project_name.options[project_name.selectedIndex].text;
          ipcRenderer.send('mail', issueID,project_title);
        `);
      }
    }]
  }, {
    label: 'Pages',
    submenu: [{
      label: 'Reports',
      click() {
        mainWindow.webContents.executeJavaScript(`
          var ipcRenderer = require('electron').ipcRenderer;
          var project_name = document.getElementById('project_name');
          var project_id = project_name.options[project_name.selectedIndex].value;
          ipcRenderer.send('show-report-win', project_id);
        `);
      }
    }, {
      label: 'Evaluations',
      click() {
        mainWindow.webContents.executeJavaScript(`
          var ipcRenderer = require('electron').ipcRenderer;
          var project_name = document.getElementById('project_name');
          var project_id = project_name.options[project_name.selectedIndex].value;
          ipcRenderer.send('show-evaluation', project_id);
        `);
      }
    }]
  }, {
    label: 'dev',
    submenu: [{
      label: 'reload',
      accelerator: 'CmdOrCtrl+R',
      click: (item, focusedWindow) => {
        if (focusedWindow) focusedWindow.reload();
      }
    }, {
      label: 'toggle Developer Tools',
      accelerator: 'Ctrl+Shift+I',
      click: (item, focusedWindow) => {
        if (focusedWindow) focusedWindow.webContents.toggleDevTools();
      }
    }]
}];