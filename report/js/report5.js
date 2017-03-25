const electron = require('electron');
const {dialog} = require('electron').remote;
const {app} = require('electron').remote;
const ipc = electron.ipcRenderer;
const sql = require('mssql');
const fs = require('fs');
const JSZip = require('jszip');
const pdf = require('html-pdf');
const path = require('path');
const async = require('async');
const FileSaver = require('file-saver');
var toBuffer = require('blob-to-buffer');


//======================================================================================================================
//notification
function showNotification(msg, type, icon) {
    $.notify({
        icon: icon,
        message: msg
    }, {
        type: type
    });
}

//======================================================================================================================
//getDate
function getDate() {
    var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    var day = currentTime.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    var year = currentTime.getFullYear();
    return year + '-' + month + '-' + day;
}

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

//======================================================================================================================
//load project name
ipc.on('show-report', function (event, project_id) {
    var conn = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting for selecting Project ID: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn);
            request
                .input('project_id', sql.Int, project_id)
                .query('SELECT [project_name],[id] FROM [projects] WHERE [id] = @project_id')
                .then(function (data) {
                    document.getElementById('projectID').value = data[0].project_name;
                    document.getElementById('projectID').dataset.id = data[0].id;
                }).catch(function (error) {
                    showNotification('Error on selecting Project ID:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });
    var option = {};
    var html = '';
    //get customers and baseline and put them in the select menu
    var conn2 = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting for selecting customers and baselines: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            $('#customers').empty().selectpicker('refresh');
            $('#both-customers').empty().selectpicker('refresh');
            $('#baselines').empty().selectpicker('refresh');
            $('#both-baselines').empty().selectpicker('refresh');
            //get customers and put them in the select menu
            var request = new sql.Request(conn2);
            request
                .input('project_id', sql.Int, project_id)
                .query('SELECT [id],[name] FROM [customers] ' +
                    ' INNER JOIN [projects_customers] as pc ON [customers].[id] = pc.[customer_id]' +
                    ' WHERE pc.[project_id] = @project_id')
                .then(function (data) {
                    data.forEach(function (data) {
                        html += '<option value="' + data.id + '">' + data.name + '</option>';
                    });
                    $('#customers').append(html).selectpicker('refresh');
                    $('#both-customers').append(html).selectpicker('refresh');
                    html = '';
                }).catch(function (error) {
                    showNotification('Error on selecting customers:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
            //get baseline and put them in the select menu
            var request2 = new sql.Request(conn2);
            request2
                .input('project_id', sql.Int, project_id)
                .query('SELECT [id],[name] FROM [baselines] ' +
                    ' INNER JOIN [projects_baselines] as pb ON [baselines].[id] = pb.[baseline_id]' +
                    ' WHERE pb.[project_id] = @project_id')
                .then(function (data) {
                    data.forEach(function (data) {
                        html += '<option value="' + data.id + '">' + data.name + '</option>';
                    });
                    $('#baselines').append(html).selectpicker('refresh');
                    $('#both-baselines').append(html).selectpicker('refresh');
                    html = '';
                }).catch(function (error) {
                    showNotification('Error on selecting baselines:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });
});

//create docx file
$('#word').on('click', function (e) {
    var project_id = document.getElementById('projectID').dataset.id;
    e.preventDefault();
    var customer_id = document.getElementById('customers').options[document.getElementById('customers').selectedIndex].value;
    var baseline_id = document.getElementById('baselines').options[document.getElementById('baselines').selectedIndex].value;
    var both_customer = $('#both-customers').find("option:selected").val();
    var both_baseline = $('#both-baselines').find("option:selected").val();
    switch ($("input[name=report-type]:checked").val()) {
        case 'all-issues':
            allIssues(project_id);
            break;

        case 'all-issues-customer':
            allIssuesCustomer(project_id, customer_id);
            break;

        case 'all-issues-baseline':
            allIssuesBaseline(project_id, baseline_id);
            break;

        case 'all-issues-both':
            allIssueBoth(project_id, both_customer, both_baseline);
            break;
    }


});

function allIssues(project_id) {
    //======================================================================================================================
    //prepare docx file
    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var docx = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
                '<style>' +
                '.bold {' +
                'text-align: left;' +
                'font-weight: bold;' +
                'width: 20%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>';
            if (document.getElementById('first-page').checked === true) {
                docx += '<br style="page-break-before: always; clear: both" />';
            }
            docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Project ID: ' + document.getElementById('projectID').value +'<br style="page-break-before: always; clear: both" />';
            if (document.getElementById('doc-id').checked === true) {
                docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Doc ID: ' + document.getElementById('doc-id-name').value + '</p><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>';
            }


            var request = new sql.Request(conn1);

            request
            .input('project_id', sql.Int, project_id)
            .query('SELECT [id],[dbid],[date], [charm] , [defect] , [status], [summary], [description] from [issues] WHERE [project_id] = @project_id ORDER BY [id] ')
            .then(function (data) {
                async.eachOfSeries(data, function (data1, i, callback) {
                    var conn2 = new sql.Connection(config, function (err) {
                        if (err) {
                            showNotification('error connecting for selecting actions for ALL issues: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                        } else {
                            var request = new sql.Request(conn2);
                            request.multiple = true;
                            request
                                .input('issue_id', sql.Int, data1.id)
                                .query('SELECT [date], [description] FROM [actions] WHERE [issue_id] = @issue_id;' +
                                    'SELECT [name],[sn] FROM [customers] INNER JOIN [issues_customers] as ic ON [customers].[id] = ic.[customer_id] WHERE [issue_id] = @issue_id;' +
                                    'SELECT [name],[cd] FROM [baselines] INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id] WHERE [issue_id] = @issue_id')
                                .then(function (data2) {
                                    var status = (data1.status) ? data1.status : 'No Status';
                                    var summary = (data1.summary) ? data1.summary : 'No Summary';
                                    var description = (data1.description) ? data1.description : 'No Description';
                                    var arr1 = '';
                                    arr1 += '<table style="table-layout: fixed; width: 100%;">' +
                                        '<tbody>' +
                                        '<tr>' +
                                        '<td class="bold">DB ID:</td>' +
                                        '<td>' + data1.dbid + '</td>' +
                                        '</tr>' +
                                        '<tr>' +
                                        '<td class="bold">Date:</td>' +
                                        '<td>' + data1.date + '</td>' +
                                        '</tr>' +
                                        '<tr>' +
                                        '<td class="bold">Customers:</td><td>';
                                    for (let s = 0; s < data2[1].length; s++) {
                                        if (s === (data2[1].length - 1)) {
                                            arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ')';
                                        } else {
                                            arr1 += data2[1][s].name +' ('+data2[1][s].sn+') , ';
                                        }
                                    }

                                    arr1 += '</td></tr>' +
                                        '<tr>' +
                                        '<td class="bold">Baseline:</td>' ;
                                    if(data2[2][0]){
                                        arr1 += '<td>' + data2[2][0].name + '</td></tr>' ;
                                    } else {
                                        arr1 += '<td> No Baseline </td></tr>' ;
                                    }
                                    if (data1.charm && data1.defect) {
                                        arr1 += '<tr>' +
                                            '<td class="bold">Charm/Defect:   </td>' +
                                            '<td>' + data1.charm + '/' + data1.defect + '</td>';
                                    } else if (data1.charm) {
                                        arr1 += '<tr>' +
                                            '<td class="bold">Charm:          </td>' +
                                            '<td>' + data1.charm + '</td>';
                                    } else if (data1.defect) {
                                        arr1 += '<tr>' +
                                            '<td class="bold">Defect:         </td>' +
                                            '<td>' + data1.defect + '</td>';
                                    } else {
                                        arr1 += '<tr>' +
                                            '<td class="bold">Charm/Defect:   </td>' +
                                            '<td>No Number</td>';
                                    }
                                    arr1 += '<td style="vertical-align: top;" class="bold">Stauts:</td>' +
                                        '<td>' + status + '</td>' +
                                        '</tr>' +
                                        '</tbody>' +
                                        '</table>' +
                                        '<table style="table-layout: fixed; width: 100%;">' +
                                        '<tbody>' +
                                        '<tr>' +
                                        '<td style="vertical-align: top;" class="bold">Summary:</td>' +
                                        '<td style="vertical-align: top;">' + summary + '</td>' +
                                        '</tr>' +
                                        '<tr>' +
                                        '<td style="vertical-align: top;" class="bold">Description:</td>' +
                                        '<td style="vertical-align: top;">' + description + '</td>' +
                                        '</tr>' +
                                        '<tr>' +
                                        '<td style="vertical-align: top;" class="bold">action:</td>' +
                                        '<td style="vertical-align: top;">' +
                                        '<table style="table-layout: fixed; width: 100%;">';
                                    data2[0].forEach(function (data21) {
                                        arr1 += '<tr>' +
                                            '<td style="vertical-align: top;width: 100px; padding-top:10px;">' + data21.date + '</td>' +
                                            '<td style="vertical-align: top; padding-top:10px;">' + data21.description + '</td>' +
                                            '</tr>';

                                    });
                                    arr1 += '</table>' +
                                        '</td>' +
                                        '</tr>' +
                                        '</tbody>' +
                                        '</table>' +
                                        '<br style="page-break-after: always; clear: both" />';


                                    docx += arr1;

                    });/*.catch(function (error) {
                                    showNotification('Error on selecting actions for ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                });*/
                            callback();
                        }
                    });
                });

            }).then(function () {
                
                setTimeout(function () {
                    var converted = htmlDocx.asBlob(docx);
                    var buffer = toBuffer(converted, function (err, buffer) {
                        if (err) throw err;
                        dialog.showSaveDialog({
                        filters: [{
                            name: 'Word',
                            extensions: ['docx']
                        }],
                        title: 'Save the Table as Word',
                        defaultPath: path.join(app.getPath('desktop'), 'Report')
                        }, function (filename) {
                            fs.writeFileSync(filename, buffer);
                        });                                
                    });
                    //FileSaver.saveAs(converted, 'Report.docx');
                }, 500);

            });

        }
    });


}

function allIssuesCustomer(project_id, customer_id) {
    //======================================================================================================================
    //prepare docx file

    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var docx = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
                '<style>' +
                '.bold {' +
                'text-align: left;' +
                'font-weight: bold;' +
                'width: 20%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>';
            if (document.getElementById('first-page').checked === true) {
                docx += '<br style="page-break-before: always; clear: both" />';
            }
            docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Project ID: ' + document.getElementById('projectID').value +'<br style="page-break-before: always; clear: both" />';
            if (document.getElementById('doc-id').checked === true) {
                docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Doc ID: ' + document.getElementById('doc-id-name').value + '</p><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>';
            }


            var request = new sql.Request(conn1);

            request
                .input('project_id', sql.Int, project_id)
                .input('customer_id', sql.Int, customer_id)
                .query('SELECT [id],[dbid],[date], [charm] , [defect] , [status], [summary], [description] from [issues] ' +
                    'INNER JOIN [issues_customers] as ic ON [issues].[id] = ic.[issue_id] ' +
                    'WHERE [customer_id] = @customer_id and [issues].[project_id] = @project_id ORDER BY [id] ;')
                .then(function (data) {
                    async.eachOfSeries(data, function (data1, i, callback) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting actions for ALL issues: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                    .input('issue_id', sql.Int, data1.id)
                                    .query('SELECT [date], [description] FROM [actions] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name],[sn]  FROM [customers] INNER JOIN [issues_customers] as ic ON [customers].[id] = ic.[customer_id] WHERE ic.[issue_id] = @issue_id;' +
                                        'SELECT [name],[cd] FROM [baselines] INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id] WHERE [issue_id] = @issue_id')
                                    .then(function (data2) {
                                        var status = (data1.status) ? data1.status : 'No Status';
                                        var summary = (data1) ? data1.summary : 'No Summary';
                                        var description = (data1) ? data1.description : 'No Description';
                                        var arr1 = '';
                                        arr1 += '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold">DB ID:</td>' +
                                            '<td>' + data1.dbid + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Date:</td>' +
                                            '<td>' + data1.date + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Customers:</td><td>';
                                        for (let s = 0; s < data2[1].length; s++) {
                                            if (s === (data2[1].length - 1)) {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ')';
                                            } else {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ') , ';
                                            }
                                        }

                                        arr1 += '</td></tr>' +
                                                '<tr>' +
                                                '<td class="bold">Baseline:</td>' ;
                                        if(data2[2][0]){
                                            arr1 += '<td>' + data2[2][0].name + '</td></tr>' ;
                                        } else {
                                            arr1 += '<td> No Baseline </td></tr>' ;
                                        }
                                        if (data1.charm && data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td>' + data1.charm + '/' + data1.defect + '</td>';
                                        } else if (data1.charm) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm:          </td>' +
                                                '<td>' + data1.charm + '</td>';
                                        } else if (data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Defect:         </td>' +
                                                '<td>' + data1.defect + '</td>';
                                        } else {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td>No Number</td>';
                                        }
                                        arr1 += '<td class="bold">Stauts:</td>' +
                                            '<td>' + status + '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">Summary:</td>' +
                                            '<td style="vertical-align: top;  padding-top:10px;">' +summary+ '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">Description:</td>' +
                                            '<td style="vertical-align: top;  padding-top:10px;">' +description+ '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">action:</td>' +
                                            '<td>' +
                                            '<table style="table-layout: fixed; width: 100%;">';
                                        data2[0].forEach(function (data21) {
                                            arr1 += '<tr>' +
                                                '<td style="vertical-align: top;width:100px;  padding-top:10px;">' + data21.date + '</td>' +
                                                '<td style="vertical-align: top;  padding-top:10px;">' + data21.description + '</td>' +
                                                '</tr>';

                                        });
                                        arr1 += '</table>' +
                                            '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<br style="page-break-after: always; clear: both" />';


                                        docx += arr1;

                                    }).catch(function (error) {
                                        showNotification('Error on selecting actions for ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                    });
                                callback();
                            }
                        });
                    });

                }).then(function () {
                    setTimeout(function () {
                        var converted = htmlDocx.asBlob(docx);
                        var buffer = toBuffer(converted, function (err, buffer) {
                          if (err) throw err;
                          dialog.showSaveDialog({
                            filters: [{
                                name: 'Word',
                                extensions: ['docx']
                            }],
                            title: 'Save the Table as Word',
                            defaultPath: path.join(app.getPath('desktop'), 'Report')
                          }, function (filename) {
                              fs.writeFileSync(filename, buffer);
                          });                                
                        });
                        //FileSaver.saveAs(converted, 'Report.docx');
                    }, 500);

                });
        }
    });
}

function allIssuesBaseline(project_id, baseline_id) {
    //======================================================================================================================
    //prepare docx file

    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var docx = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
                '<style>' +
                '.bold {' +
                'text-align: left;' +
                'font-weight: bold;' +
                'width: 20%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>';
            if (document.getElementById('first-page').checked === true) {
                docx += '<br style="page-break-before: always; clear: both" />';
            }
            docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Project ID: ' + document.getElementById('projectID').value +'<br style="page-break-before: always; clear: both" />';
            if (document.getElementById('doc-id').checked === true) {
                docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Doc ID: ' + document.getElementById('doc-id-name').value + '</p><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>';
            }


            var request = new sql.Request(conn1);

            request
                .input('project_id', sql.Int, project_id)
                .input('baseline_id', sql.Int, baseline_id)
                .query('SELECT [id],[dbid],[date],[charm],[defect],[status],[summary],[description] from [issues] ' +
                    'INNER JOIN [issues_baselines] as ib ON [issues].[id] = ib.[issue_id] ' +
                    'WHERE [baseline_id] = @baseline_id and [issues].[project_id] = @project_id ORDER BY [id] ;')
                .then(function (data) {
                    async.eachOfSeries(data, function (data1, i, callback) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting actions for ALL issues: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                    .input('issue_id', sql.Int, data1.id)
                                    .query('SELECT [date], [description] FROM [actions] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name], [sn] FROM [customers] INNER JOIN [issues_customers] as ic ON [customers].[id] = ic.[customer_id] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name],[cd] FROM [baselines] INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id] WHERE [issue_id] = @issue_id')
                                    .then(function (data2) {
                                        var status = (data1.status) ? data1.status : 'No Status';
                                        var summary = (data1) ? data1.summary : 'No Summary';
                                        var description = (data1) ? data1.description : 'No Description';
                                        var arr1 = '';
                                        arr1 += '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold">DB ID:</td>' +
                                            '<td>' + data1.dbid + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Date:</td>' +
                                            '<td>' + data1.date + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Customers:</td><td>';
                                        for (let s = 0; s < data2[1].length; s++) {
                                            if (s === (data2[1].length - 1)) {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ')';
                                            } else {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ') , ';
                                            }
                                        }

                                        arr1 += '</td></tr>' +
                                                '<tr>' +
                                                '<td class="bold">Baseline:</td>' ;
                                        if(data2[2][0]){
                                            arr1 += '<td>' + data2[2][0].name + '</td></tr>' ;
                                        } else {
                                            arr1 += '<td> No Baseline </td></tr>' ;
                                        }
                                        if (data1.charm && data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td>' + data1.charm + '/' + data1.defect + '</td>';
                                        } else if (data1.charm) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm:          </td>' +
                                                '<td>' + data1.charm + '</td>';
                                        } else if (data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Defect:         </td>' +
                                                '<td>' + data1.defect + '</td>';
                                        } else {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td>No Number</td>';
                                        }
                                        arr1 += '<td class="bold">Stauts:</td>' +
                                            '<td>' + status+ '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">Summary:</td>' +
                                            '<td style="vertical-align: top;  padding-top:10px;">' +summary + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">Description:</td>' +
                                            '<td style="vertical-align: top;  padding-top:10px;">' + description + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">action:</td>' +
                                            '<td>' +
                                            '<table style="table-layout: fixed; width: 100%;">';
                                        data2[0].forEach(function (data21) {
                                            arr1 += '<tr>' +
                                                '<td style="vertical-align: top;width:100px;  padding-top:10px;">' + data21.date + '</td>' +
                                                '<td style="vertical-align: top;  padding-top:10px;"> ' + data21.description + '</td>' +
                                                '</tr>';

                                        });
                                        arr1 += '</table>' +
                                            '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<br style="page-break-after: always; clear: both" />';


                                        docx += arr1;

                        })/*.catch(function (error) {
                                        showNotification('Error on selecting actions for ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                    });*/
                                callback();
                            }
                        });
                    });

                }).then(function () {
                    setTimeout(function () {
                        var converted = htmlDocx.asBlob(docx);
                        var buffer = toBuffer(converted, function (err, buffer) {
                          if (err) throw err;
                          dialog.showSaveDialog({
                            filters: [{
                                name: 'Word',
                                extensions: ['docx']
                            }],
                            title: 'Save the Table as Word',
                            defaultPath: path.join(app.getPath('desktop'), 'Report')
                          }, function (filename) {
                              fs.writeFileSync(filename, buffer);
                          });                                
                        });
                        //FileSaver.saveAs(converted, 'Report.docx');
                    }, 500);

                });
        }
    });
}

function allIssueBoth(project_id, customer_id, baseline_id) {
    //======================================================================================================================
    //prepare docx file

    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var docx = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
                '<style>' +
                '.bold {' +
                'text-align: left;' +
                'font-weight: bold;' +
                'width: 20%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>';
            if (document.getElementById('first-page').checked === true) {
                docx += '<br style="page-break-before: always; clear: both" />';
            }
            docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Project ID: ' + document.getElementById('projectID').value +'<br style="page-break-before: always; clear: both" />';
            if (document.getElementById('doc-id').checked === true) {
                docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Doc ID: ' + document.getElementById('doc-id-name').value + '</p><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>';
            }


            var request = new sql.Request(conn1);

            request
                .input('project_id', sql.Int, project_id)
                .input('customer_id', sql.Int, customer_id)
                .input('baseline_id', sql.Int, baseline_id)
                .query('SELECT [id],[dbid],[date], [charm] , [defect] , [status], [summary], [description] from [issues] ' +
                    'INNER JOIN [issues_customers] as ic ON [issues].[id] = ic.[issue_id] ' +
                    'INNER JOIN [issues_baselines] as ib ON [issues].[id] = ib.[issue_id] ' +
                    'WHERE ic.[customer_id] = @customer_id AND ib.[baseline_id] = @baseline_id and [issues].[project_id] = @project_id ORDER BY [id] ;')
                .then(function (data) {
                    async.eachOfSeries(data, function (data1, i, callback) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting actions for ALL issues: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                    .input('issue_id', sql.Int, data1.id)
                                    .query('SELECT [date], [description] FROM [actions] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name], [sn] FROM [customers] INNER JOIN [issues_customers] as ic ON [customers].[id] = ic.[customer_id] WHERE ic.[issue_id] = @issue_id;' +
                                        'SELECT [name],[cd] FROM [baselines] INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id] WHERE ib.[issue_id] = @issue_id')
                                    .then(function (data2) {
                                        var status = (data1.status) ? data1.status : 'No Status';
                                        var summary = (data1) ? data1.summary : 'No Summary';
                                        var description = (data1) ? data1.description : 'No Description';
                                        var arr1 = '';
                                        arr1 += '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold">DB ID:</td>' +
                                            '<td>' + data1.dbid + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Date:</td>' +
                                            '<td>' + data1.date + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Customers:</td><td>';
                                        for (let s = 0; s < data2[1].length; s++) {
                                            if (s === (data2[1].length - 1)) {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ')';
                                            } else {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ') , ';
                                            }
                                        }

                                        arr1 += '</td></tr>' +
                                                '<tr>' +
                                                '<td class="bold">Baseline:</td>' ;
                                        if(data2[2][0]){
                                            arr1 += '<td>' + data2[2][0].name + '</td></tr>' ;
                                        } else {
                                            arr1 += '<td> No Baseline </td></tr>' ;
                                        }
                                        if (data1.charm && data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td>' + data1.charm + '/' + data1.defect + '</td>';
                                        } else if (data1.charm) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm:          </td>' +
                                                '<td>' + data1.charm + '</td>';
                                        } else if (data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Defect:         </td>' +
                                                '<td>' + data1.defect + '</td>';
                                        } else {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td>No Number</td>';
                                        }
                                        arr1 += '<td class="bold">Stauts:</td>' +
                                            '<td>' + status + '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">Summary:</td>' +
                                            '<td style="vertical-align: top;  padding-top:10px;">' +summary+ '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">Description:</td>' +
                                            '<td style="vertical-align: top; padding-top:10px;">' + description+ '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">action:</td>' +
                                            '<td>' +
                                            '<table style="table-layout: fixed; width: 100%;">';
                                        data2[0].forEach(function (data21) {
                                            arr1 += '<tr>' +
                                                '<td style="vertical-align: top;width:100px; padding-top:10px;">' + data21.date + '</td>' +
                                                '<td style="vertical-align: top;  padding-top:10px;">' + data21.description + '</td>' +
                                                '</tr>';

                                        });
                                        arr1 += '</table>' +
                                            '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<br style="page-break-after: always; clear: both" />';


                                        docx += arr1;

                        });/*.catch(function (error) {
                                        showNotification('Error on selecting actions for ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                    });*/
                                callback();
                            }
                        });
                    });

                }).then(function () {
                    setTimeout(function () {
                        var converted = htmlDocx.asBlob(docx);
                        var buffer = toBuffer(converted, function (err, buffer) {
                          if (err) throw err;
                          dialog.showSaveDialog({
                            filters: [{
                                name: 'Word',
                                extensions: ['docx']
                            }],
                            title: 'Save the Table as Word',
                            defaultPath: path.join(app.getPath('desktop'), 'Report')
                          }, function (filename) {
                              fs.writeFileSync(filename, buffer);
                          });                                
                        });
                        //FileSaver.saveAs(converted, 'Report.docx');
                    }, 500);

                });
        }
    });
}

//create PDF file
$('#pdf').on('click', function (e) {
    var project_id = document.getElementById('projectID').dataset.id;
    e.preventDefault();
    var customer_id = $('#customers').find("option:selected").val();
    var baseline_id = $('#baselines').find("option:selected").val();
    var both_customer = $('#both-customers').find("option:selected").val();
    var both_baseline = $('#both-baselines').find("option:selected").val();
    switch ($("input[name=report-type]:checked").val()) {
        case 'all-issues':
            allIssuespdf(project_id);
            break;

        case 'all-issues-customer':
            allIssuesCustomerpdf(project_id, customer_id);
            break;

        case 'all-issues-baseline':
            allIssuesBaselinepdf(project_id, baseline_id);
            break;

        case 'all-issues-both':
            allIssueBothpdf(project_id, both_customer, both_baseline);
            break;
    }
});

function allIssuespdf(project_id) {
    //======================================================================================================================
    //prepare pdf file

    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
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
                'width: 18%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>';
            if (document.getElementById('first-page').checked === true) {
                docx += '<div style="page-break-after:always;"></div>';
            }
            docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Project ID: ' + document.getElementById('projectID').value +'<div style="page-break-after:always;"></div>';
            if (document.getElementById('doc-id').checked === true) {
                docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Doc ID: ' + document.getElementById('doc-id-name').value + '</p><div style="page-break-after:always;"></div>';
            }


            var request = new sql.Request(conn1);

            request
                .input('project_id', sql.Int, project_id)
                .query('SELECT [id],[dbid],[date], [charm] , [defect] , [status], [summary], [description] from [issues] WHERE [project_id] = @project_id ORDER BY [id] ')
                .then(function (data) {

                    async.eachOfSeries(data, function (data1, i, callback) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting actions for ALL issues: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                    .input('issue_id', sql.Int, data1.id)
                                    .query('SELECT [date], [description] FROM [actions] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name], [sn] FROM [customers] INNER JOIN [issues_customers] as ic ON [customers].[id] = ic.[customer_id] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name],[cd] FROM [baselines] INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id] WHERE [issue_id] = @issue_id')
                                    .then(function (data2) {
                                        var status = (data1.status) ? data1.status : 'No Status';
                                        var summary = (data1) ? data1.summary : 'No Summary';
                                        var description = (data1) ? data1.description : 'No Description';
                                        var arr1 = '';
                                        arr1 += '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold">DB ID:</td>' +
                                            '<td class="td">' + data1.dbid + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Date:</td>' +
                                            '<td class="td">' + data1.date + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Customers:</td><td  class="td">';
                                        for (let s = 0; s < data2[1].length; s++) {
                                            if (s === (data2[1].length - 1)) {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ')';
                                            } else {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ') , ';
                                            }
                                        }
                                        arr1 += '</td></tr>' +
                                                '<tr>' +
                                                '<td class="bold">Baseline:</td>' ;
                                        if(data2[2][0]){
                                            arr1 += '<td  class="td">' + data2[2][0].name + '</td></tr>' ;
                                        } else {
                                            arr1 += '<td  class="td"> No Baseline </td></tr>' ;
                                        }

                                        if (data1.charm && data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td  class="td">' + data1.charm + '/' + data1.defect + '</td>';
                                        } else if (data1.charm) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm:          </td>' +
                                                '<td  class="td">' + data1.charm + '</td>';
                                        } else if (data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Defect:         </td>' +
                                                '<td  class="td">' + data1.defect + '</td>';
                                        } else {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td  class="td">No Number</td>';
                                        }
                                        arr1 += '<td></td>' +
                                            '<td class="bold" style="vertical-align: top;">Stauts: ' +status+ '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold" style="vertical-align: top;" >Summary:</td>' +
                                            '<td style="vertical-align: top; padding-top:10px;">' +summary+ '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold" style="vertical-align: top;" >Description:</td>' +
                                            '<td style="vertical-align: top; padding-top:10px;">' +description + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">action:</td>' +
                                            '<td>' +
                                            '<table style="table-layout: fixed; width: 100%;">';
                                        data2[0].forEach(function (data21) {
                                            arr1 += '<tr>' +
                                                '<td style="vertical-align: top;width: 100px; padding-top:10px;">' + data21.date + '</td>' +
                                                '<td style="vertical-align: top; padding-top:10px;">' + data21.description + '</td>' +
                                                '</tr>';

                                        });
                                        arr1 += '</table>' +
                                            '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<br><div style="page-break-after:always;"></div>';

                                        docx += arr1;

                                    }).catch(function (error) {
                                        showNotification('Error on selecting actions for ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                    });
                                callback();
                            }
                        });

                    });

                }).then(function () {
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
                            title: 'Save the Report as PDF',
                            defaultPath: path.join(app.getPath('desktop'), 'Report' + '.pdf')
                        }, function (filename) {
                            pdf.create(docx, conf).toFile(filename, function (err, res) {

                            });

                        });
                    }, 100);

                });

        }
    });


}

function allIssuesCustomerpdf(project_id, customer_id) {
    //======================================================================================================================
    //prepare docx file

    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
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
                'width: 18%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>';
            if (document.getElementById('first-page').checked === true) {
                docx += '<div style="page-break-after:always;"></div>';
            }
            docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Project ID: ' + document.getElementById('projectID').value +'<div style="page-break-after:always;"></div>';
            if (document.getElementById('doc-id').checked === true) {
                docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Doc ID: ' + document.getElementById('doc-id-name').value + '</p><div style="page-break-after:always;"></div>';
            }


            var request = new sql.Request(conn1);

            request
                .input('project_id', sql.Int, project_id)
                .input('customer_id', sql.Int, customer_id)
                .query('SELECT [id],[dbid],[date], [charm] , [defect] , [status], [summary], [description] from [issues] ' +
                    'INNER JOIN [issues_customers] as ic ON [issues].[id] = ic.[issue_id] ' +
                    'WHERE [customer_id] = @customer_id and [issues].[project_id] = @project_id ORDER BY [id] ;')
                .then(function (data) {

                    async.eachOfSeries(data, function (data1, i, callback) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting actions for ALL issues: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                    .input('issue_id', sql.Int, data1.id)
                                    .query('SELECT [date], [description] FROM [actions] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name], [sn] FROM [customers] INNER JOIN [issues_customers] as ic ON [customers].[id] = ic.[customer_id] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name],[cd] FROM [baselines] INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id] WHERE [issue_id] = @issue_id')
                                    .then(function (data2) {
                                        var status = (data1.status) ? data1.status : 'No Status';
                                        var summary = (data1) ? data1.summary : 'No Summary';
                                        var description = (data1) ? data1.description : 'No Description';
                                        var arr1 = '';
                                        arr1 += '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold">DB ID:</td>' +
                                            '<td class="td">' + data1.dbid + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Date:</td>' +
                                            '<td class="td">' + data1.date + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Customers:</td><td  class="td">';
                                        for (let s = 0; s < data2[1].length; s++) {
                                            if (s === (data2[1].length - 1)) {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ')';
                                            } else {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ') , ';
                                            }
                                        }

                                        arr1 += '</td></tr>' +
                                                '<tr>' +
                                                '<td class="bold">Baseline:</td>' ;
                                        if(data2[2][0]){
                                            arr1 += '<td  class="td">' + data2[2][0].name + '</td></tr>' ;
                                        } else {
                                            arr1 += '<td  class="td"> No Baseline </td></tr>' ;
                                        }

                                        if (data1.charm && data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td  class="td">' + data1.charm + '/' + data1.defect + '</td>';
                                        } else if (data1.charm) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm:          </td>' +
                                                '<td  class="td">' + data1.charm + '</td>';
                                        } else if (data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Defect:         </td>' +
                                                '<td  class="td">' + data1.defect + '</td>';
                                        } else {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td  class="td">No Number</td>';
                                        }
                                        arr1 += '<td></td>' +
                                            '<td class="bold">Stauts: ' +status+ '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<table style="margin-top:20px;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold" style="vertical-align: top;" >Summary:</td>' +
                                            '<td style="vertical-align: top; padding-top:10px;">' +summary+ '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold" style="vertical-align: top;" >Description:</td>' +
                                            '<td style="vertical-align: top; padding-top:10px;">' +description+ '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">action:</td>' +
                                            '<td>' +
                                            '<table style="table-layout: fixed; width: 100%;">';
                                        data2[0].forEach(function (data21) {
                                            arr1 += '<tr>' +
                                                '<td style="vertical-align: top;width:100px; padding-top:10px;">' + data21.date + '</td>' +
                                                '<td style="vertical-align: top; padding-top:10px;">' + data21.description + '</td>' +
                                                '</tr>';

                                        });
                                        arr1 += '</table>' +
                                            '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<br><div style="page-break-after:always;"></div>';

                                        docx += arr1;

                                    }).catch(function (error) {
                                        showNotification('Error on selecting actions for ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                    });
                                callback();
                            }
                        });

                    });

                }).then(function () {
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
                            title: 'Save the Report as PDF',
                            defaultPath: path.join(app.getPath('desktop'), 'Report' + '.pdf')
                        }, function (filename) {
                            pdf.create(docx, conf).toFile(filename, function (err, res) {

                            });

                        });
                    }, 100);

                });
        }
    });
}

function allIssuesBaselinepdf(project_id, baseline_id) {
    //======================================================================================================================
    //prepare pdf file

    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
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
                'width: 18%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>';
            if (document.getElementById('first-page').checked === true) {
                docx += '<div style="page-break-after:always;"></div>';
            }
            docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Project ID: ' + document.getElementById('projectID').value +'<div style="page-break-after:always;"></div>';
            if (document.getElementById('doc-id').checked === true) {
                docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Doc ID: ' + document.getElementById('doc-id-name').value + '</p><div style="page-break-after:always;"></div>';
            }


            var request = new sql.Request(conn1);

            request
                .input('project_id', sql.Int, project_id)
                .input('baseline_id', sql.Int, baseline_id)
                .query('SELECT [id],[dbid],[date],[charm],[defect],[status],[summary],[description] from [issues] ' +
                    'INNER JOIN [issues_baselines] as ib ON [issues].[id] = ib.[issue_id] ' +
                    'WHERE [baseline_id] = @baseline_id and [issues].[project_id] = @project_id ORDER BY [id] ;')
                .then(function (data) {
                    async.eachOfSeries(data, function (data1, i, callback) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting actions for ALL issues: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                    .input('issue_id', sql.Int, data1.id)
                                    .query('SELECT [date], [description] FROM [actions] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name], [sn] FROM [customers] INNER JOIN [issues_customers] as ic ON [customers].[id] = ic.[customer_id] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name],[cd] FROM [baselines] INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id] WHERE [issue_id] = @issue_id')
                                    .then(function (data2) {
                                        var status = (data1.status) ? data1.status : 'No Status';
                                        var summary = (data1) ? data1.summary : 'No Summary';
                                        var description = (data1) ? data1.description : 'No Description';
                                        var arr1 = '';
                                        arr1 += '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold">DB ID:</td>' +
                                            '<td class="td">' + data1.dbid + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Date:</td>' +
                                            '<td class="td">' + data1.date + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Customers:</td><td  class="td">';
                                        for (let s = 0; s < data2[1].length; s++) {
                                            if (s === (data2[1].length - 1)) {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ')';
                                            } else {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ') , ';
                                            }
                                        }

                                        arr1 += '</td></tr>' +
                                                '<tr>' +
                                                '<td class="bold">Baseline:</td>' ;
                                        if(data2[2][0]){
                                            arr1 += '<td  class="td">' + data2[2][0].name + '</td></tr>' ;
                                        } else {
                                            arr1 += '<td  class="td"> No Baseline </td></tr>' ;
                                        }

                                        if (data1.charm && data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td  class="td">' + data1.charm + '/' + data1.defect + '</td>';
                                        } else if (data1.charm) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm:          </td>' +
                                                '<td  class="td">' + data1.charm + '</td>';
                                        } else if (data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Defect:         </td>' +
                                                '<td  class="td">' + data1.defect + '</td>';
                                        } else {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td  class="td">No Number</td>';
                                        }
                                        arr1 += '<td></td>' +
                                            '<td class="bold">Stauts: ' +status+ '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<table style="margin-top:20px;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold" style="vertical-align: top;" >Summary:</td>' +
                                            '<td style="vertical-align: top; padding-top:10px;">' + summary+ '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold" style="vertical-align: top;" >Description:</td>' +
                                            '<td style="vertical-align: top; padding-top:10px;">' + description + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">action:</td>' +
                                            '<td>' +
                                            '<table style="table-layout: fixed; width: 100%;">';
                                        data2[0].forEach(function (data21) {
                                            arr1 += '<tr>' +
                                                '<td style="vertical-align: top;width:100px; padding-top:10px;">' + data21.date + '</td>' +
                                                '<td style="vertical-align: top; padding-top:10px;">' + data21.description + '</td>' +
                                                '</tr>';

                                        });
                                        arr1 += '</table>' +
                                            '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<br><div style="page-break-after:always;"></div>';

                                        docx += arr1;

                                    }).catch(function (error) {
                                        showNotification('Error on selecting actions for ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                    });
                                callback();
                            }
                        });

                    });

                }).then(function () {
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
                            title: 'Save the Report as PDF',
                            defaultPath: path.join(app.getPath('desktop'), 'Report' + '.pdf')
                        }, function (filename) {
                            pdf.create(docx, conf).toFile(filename, function (err, res) {

                            });

                        });
                    }, 100);

                });
        }
    });
}

function allIssueBothpdf(project_id, customer_id, baseline_id) {
    //======================================================================================================================
    //prepare docx file

    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
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
                'width: 18%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>';
            if (document.getElementById('first-page').checked === true) {
                docx += '<div style="page-break-after:always;"></div>';
            }
            docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Project ID: ' + document.getElementById('projectID').value +'<div style="page-break-after:always;"></div>';
            if (document.getElementById('doc-id').checked === true) {
                docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Doc ID: ' + document.getElementById('doc-id-name').value + '</p><div style="page-break-after:always;"></div>';
            }


            var request = new sql.Request(conn1);

            request
                .input('project_id', sql.Int, project_id)
                .input('customer_id', sql.Int, customer_id)
                .input('baseline_id', sql.Int, baseline_id)
                .query('SELECT [id],[dbid],[date], [charm] , [defect] , [status], [summary], [description] from [issues] ' +
                    'INNER JOIN [issues_customers] as ic ON [issues].[id] = ic.[issue_id] ' +
                    'INNER JOIN [issues_baselines] as ib ON [issues].[id] = ib.[issue_id] ' +
                    'WHERE ic.[customer_id] = @customer_id AND ib.[baseline_id] = @baseline_id and [issues].[project_id] = @project_id ORDER BY [id] ;')
                .then(function (data) {
                    async.eachOfSeries(data, function (data1, i, callback) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting actions for ALL issues: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                    .input('issue_id', sql.Int, data1.id)
                                    .query('SELECT [date], [description] FROM [actions] WHERE [issue_id] = @issue_id;' +
                                        'SELECT [name], [sn] FROM [customers] INNER JOIN [issues_customers] as ic ON [customers].[id] = ic.[customer_id] WHERE [issue_id] = @issue_id;'+
                                        'SELECT [name],[cd] FROM [baselines] INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id] WHERE ib.[issue_id] = @issue_id')
                                    .then(function (data2) {
                                        var status = (data1.status) ? data1.status : 'No Status';
                                        var summary = (data1) ? data1.summary : 'No Summary';
                                        var description = (data1) ? data1.description : 'No Description';
                                        var arr1 = '';
                                        arr1 += '<table style="table-layout: fixed; width: 100%;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold">DB ID:</td>' +
                                            '<td class="td">' + data1.dbid + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Date:</td>' +
                                            '<td class="td">' + data1.date + '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold">Customers:</td><td  class="td">';
                                        for (let s = 0; s < data2[1].length; s++) {
                                            if (s === (data2[1].length - 1)) {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ')';
                                            } else {
                                                arr1 += data2[1][s].name + ' (' + data2[1][s].sn + ') , ';
                                            }
                                        }

                                        arr1 += '</td></tr>' +
                                                '<tr>' +
                                                '<td class="bold">Baseline:</td>' ;
                                        if(data2[2][0]){
                                            arr1 += '<td  class="td">' + data2[2][0].name + '</td></tr>' ;
                                        } else {
                                            arr1 += '<td  class="td"> No Baseline </td></tr>' ;
                                        }

                                        if (data1.charm && data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td  class="td">' + data1.charm + '/' + data1.defect + '</td>';
                                        } else if (data1.charm) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm:          </td>' +
                                                '<td  class="td">' + data1.charm + '</td>';
                                        } else if (data1.defect) {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Defect:         </td>' +
                                                '<td  class="td">' + data1.defect + '</td>';
                                        } else {
                                            arr1 += '<tr>' +
                                                '<td class="bold">Charm/Defect:   </td>' +
                                                '<td  class="td">No Number</td>';
                                        }
                                        arr1 += '<td></td>' +
                                            '<td class="bold">Stauts: ' +status+ '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<table style="margin-top:20px;">' +
                                            '<tbody>' +
                                            '<tr>' +
                                            '<td class="bold" style="vertical-align: top;" >Summary:</td>' +
                                            '<td style="vertical-align: top; padding-top:10px;">' + summary+ '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td class="bold" style="vertical-align: top;" >Description:</td>' +
                                            '<td style="vertical-align: top; padding-top:10px;">' + description+ '</td>' +
                                            '</tr>' +
                                            '<tr>' +
                                            '<td style="vertical-align: top;" class="bold">action:</td>' +
                                            '<td>' +
                                            '<table style="table-layout: fixed; width: 100%;">';
                                        data2[0].forEach(function (data21) {
                                            arr1 += '<tr>' +
                                                '<td style="vertical-align: top;width:100px; padding-top:10px;">' + data21.date + '</td>' +
                                                '<td style="vertical-align: top; padding-top:10px;">' + data21.description + '</td>' +
                                                '</tr>';

                                        });
                                        arr1 += '</table>' +
                                            '</td>' +
                                            '</tr>' +
                                            '</tbody>' +
                                            '</table>' +
                                            '<br><div style="page-break-after:always;"></div>';

                                        docx += arr1;

                        });/*.catch(function (error) {
                                        showNotification('Error on selecting actions for ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                    });*/
                                callback();
                            }
                        });

                    });

                }).then(function () {
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
                            title: 'Save the Report as PDF',
                            defaultPath: path.join(app.getPath('desktop'), 'Report' + '.pdf')
                        }, function (filename) {
                            pdf.create(docx, conf).toFile(filename, function (err, res) {

                            });

                        });
                    }, 100);

                });
        }
    });
}