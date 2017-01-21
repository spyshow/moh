/* TODO

    1-add realvsn
     
 */
var electron = require('electron');
var ipc = electron.ipcRenderer;
var sql = require('mssql');
var currentValue = '';
var haveError = false;


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
//customer table

//draw table
function refreshCustomer(projectID) {
    $('#customerTable-body').empty();

    var conn = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting on refreshing customer: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn);
            request
                .input('project_id', sql.Int, projectID)
                .query('SELECT * FROM customers' +
                    ' INNER JOIN projects_customers AS pc ON customers.id = pc.customer_id ' +
                    ' WHERE  pc.project_id = @project_id')
                .then(function (data) {
                    var html = '';
                    data.forEach(function (data) {
                        html += '<tr>';
                        html += '<td class="td editablecustomers" data-type="name" data-pk="' + data.id + '" contenteditable>' + data.name + '</td>';
                        html += '<td class="td editablecustomers" data-type="system" data-pk="' + data.id + '" contenteditable>' + data.system + '</td>';
                        html += '<td class="td editablecustomers" data-type="sn" data-pk="' + data.id + '" contenteditable>' + data.sn + '</td>';
                        html += '<td class="delete-td text-center"><button type="button" class="btn btn-danger customer-delete btn-xs" data-pk="' + data.id + '" aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></td>';
                        html += '</tr>';
                    });
                    $('#customerTable-body').append(html);
                    html = '';
                }).catch(function (error) {
                    showNotification('Error on refreshing customer:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });
}

function refreshBaseline(projectID) {
    $('#baselineTable-body').empty();

    var conn = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting on refreshing baseline: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn);
            request
                .input('project_id', sql.Int, projectID)
                .query('SELECT * FROM baselines' +
                    ' INNER JOIN projects_baselines AS pb ON baselines.id = pb.baseline_id ' +
                    ' WHERE  pb.project_id = @project_id')
                .then(function (data) {
                    var html = '';
                    data.forEach(function (data) {
                        html += '<tr>';
                        html += '<td class="td editablebaselines" data-type="name" data-pk="' + data.id + '" contenteditable>' + data.name + '</td>';
                        html += '<td class="td editablebaselines" data-type="cd" data-pk="' + data.id + '" contenteditable>' + data.cd + '</td>';
                        html += '<td class="delete-td text-center"><button type="button" class="btn btn-danger baseline-delete btn-xs" data-pk="' + data.id + '" aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></td>';
                        html += '</tr>';
                    });
                    $('#baselineTable-body').append(html);
                    html = '';
                }).catch(function (error) {
                    showNotification('Error on refreshing baseline:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });
}

function edit_data(id, type, newValue, table, el) {
    if (currentValue !== newValue) {

        var conn = new sql.Connection(config, function (err) {
            if (err) {
                showNotification('error connecting for editing data: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                haveError = true;
                if (haveError === true) {
                    el.text(currentValue);
                    haveError = false;
                }
            } else {
                var request = new sql.Request(conn);
                request
                    .input('newValue', newValue)
                    .input('id', sql.Int, id)
                    .query('UPDATE ' + table + ' SET ' + type + ' = @newValue WHERE id = @id')
                    .then(function (data) {
                        showNotification(table + ' Updated successfully', 'success', 'glyphicon glyphicon-tasks');
                    }).catch(function (error) {
                        showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                        haveError = true;
                        if (haveError === true) {
                            el.text(currentValue);
                            haveError = false;
                        }
                    });
            }
        });
    }
}

$(document).ready(function () {
    //customers table 
    $(document).on('focus', '.editablecustomers', function () {
        currentValue = $(this).text();
    });
    $(document).on('blur', '.editablecustomers', function () {
        var el = $(this);
        var id = $(this).data("pk");
        var type = $(this).data("type");
        var newValue = $(this).text();
        edit_data(id, type, newValue, 'customers', el);
    });

    //baseline table 
    $(document).on('focus', '.editablebaselines', function () {
        currentValue = $(this).text();
    });
    $(document).on('blur', '.editablebaselines', function () {
        var el = $(this);
        var id = $(this).data("pk");
        var type = $(this).data("type");
        var newValue = $(this).text();
        edit_data(id, type, newValue, 'baselines', el);
    });

});


//============================================================================================================================
//add or update project

ipc.on('show-edit-project', function (event, project_id) {
    $(document).prop('title', 'Edit Project');
    var conn = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting for selecting project: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn);
            request
                .input('project_id', sql.Int, project_id)
                .query('SELECT * FROM projects WHERE id = @project_id')
                .then(function (data) {
                    document.getElementById('project_id').value = data[0].id;
                    document.getElementById('project_name').value = data[0].project_name;
                    $(document).prop('title', 'Edit Project: '+document.getElementById('project_name').value);
                    document.getElementById('cpf-doc-id').value = data[0].cpf_doc_id;
                    if (data[0].project_type == 0) {
                        document.getElementById('syngo').checked = true;
                    } else {
                        document.getElementById('mr').checked = true;
                    }
                    if (data[0].db_type == 0) {
                        document.getElementById('charm').checked = true;
                    } else {
                        document.getElementById('TFS').checked = true;
                    }
                    document.getElementById('type').value = 'update';
                    refreshCustomer(data[0].id);
                    refreshBaseline(data[0].id);
                }).catch(function (error) {
                    showNotification('Error on selecting project:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });
});

ipc.on('show-new-project', function (event) {
    $(document).prop('title', 'New Project');
    document.getElementById('project_id').value = '';
    document.getElementById('project_name').value = '';
    document.getElementById('cpf-doc-id').value = '';
    document.getElementById('syngo').checked = true;
    document.getElementById('charm').checked = true;
    document.getElementById('type').value = '';
    $('#customerTable-body').empty();
    $('#baselineTable-body').empty();
});

$('#projectSubmit').on('click', function (e) {
    e.preventDefault();
    btn = $(this);
    btn.prop('disabled', true);
    setTimeout(function(){
      btn.prop('disabled', false);
    }, 1000);
    var project_id = document.getElementById('project_id').value;
    var project_name = document.getElementById('project_name').value;
    var cpf_doc_id = document.getElementById('cpf-doc-id').value;
    var project_type = 0;
    if (!project_name || !cpf_doc_id) {
        showNotification('You Have to enter all the information!', 'danger', 'glyphicon glyphicon-tasks');
    } else {
        if ($('#syngo').is(':checked')) {
            project_type = 0;
        } else {
            project_type = 1;
        }
        var db_type = 0;
        if ($('#charm').is(':checked')) {
            db_type = 0;
        } else {
            db_type = 1;
        }
        if (document.getElementById('type').value === 'update') {

            var conn = new sql.Connection(config, function (err) {
                if (err) {
                    showNotification('error connecting on updating project: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var request = new sql.Request(conn);
                    request
                        .input('project_name', project_name)
                        .input('cpf_doc_id', cpf_doc_id)
                        .input('project_type', project_type)
                        .input('db_type', db_type)
                        .input('id', sql.Int, project_id)
                        .query('UPDATE projects SET [project_name] = @project_name,[project_type] = @project_type,[db_type] = @db_type,' +
                            '[cpf_doc_id] = @cpf_doc_id Where id = @id ')
                        .then(function (data) {
                            showNotification('Data updated in the database', 'success', 'glyphicon glyphicon-tasks');
                        }).catch(function (error) {
                            showNotification('Error on updating project:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                        });
                }
            });
        } else {

            var conn2 = new sql.Connection(config, function (err) {
                if (err) {
                    showNotification('error connecting on insert project: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var request = new sql.Request(conn2);
                    request
                        .input('project_name', project_name)
                        .input('cpf_doc_id', cpf_doc_id)
                        .input('project_type', project_type)
                        .input('db_type', db_type)
                        .query('INSERT INTO projects ([project_name],[project_type],[db_type],[cpf_doc_id]) VALUES (@project_name,@project_type,@db_type,@cpf_doc_id); SELECT SCOPE_IDENTITY() AS id;')
                        .then(function (data) {
                            document.getElementById('project_id').value = data[0].id;
                            showNotification('Project Created', 'success', 'glyphicon glyphicon-tasks');
                            document.getElementById('type').value = 'update';
                            ipc.send('reload-projects');
                        }).catch(function (error) {
                            showNotification('Error on insert project:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                        });
                }
            });
        }
    }

});

//============================================================================================================================
//add and remove customers

$('#add-customer').on('click', function (e) {
    e.preventDefault();
    var customerName = document.getElementById('customer-name').value;
    var system = document.getElementById('system').value;
    var sn = document.getElementById('sn').value;

    var conn = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting for adding customer: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {

            var request = new sql.Request(conn);
            request
                .input('name', customerName)
                .input('system', system)
                .input('sn', sn)
                .query('INSERT INTO [customers] ([name], [system], [sn] ) VALUES (@name,@system,@sn); SELECT SCOPE_IDENTITY() AS id;')
                .then(function (data) {
                    var conn2 = new sql.Connection(config, function (err) {
                        if (err) {
                            showNotification('error connecting for adding customer to project: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                        } else {
                            var request = new sql.Request(conn2);
                            request
                                .input('project_id', document.getElementById('project_id').value)
                                .input('customer_id', data[0].id)
                                .query('INSERT INTO projects_customers (project_id,customer_id) VALUES (@project_id ,@customer_id)')
                                .then(function () {
                                    showNotification('Customer ' + customerName + ' Added', 'success', 'glyphicon glyphicon-tasks');
                                    refreshCustomer(document.getElementById('project_id').value);
                                }).catch(function (error) {
                                    showNotification('Error adding customer to project :' + error.message, 'danger', 'glyphicon glyphicon-tasks');

                                });
                        }
                    });
                }).catch(function (error) {
                    showNotification('Error adding customer :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });
});

$('#customerTable-body').delegate('.customer-delete', 'click', function (e) {
    e.preventDefault();
    var id = this.dataset.pk;
    var conn = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting for deleting customer: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn);
            request
                .input('id', sql.Int, id)
                .query('DELETE FROM customers WHERE id = @id')
                .then(function (data) {
                    showNotification('customer Deleted from the database', 'success', 'glyphicon glyphicon-tasks');
                    refreshCustomer(document.getElementById('project_id').value);
                    document.getElementById('customer-name').value = '';
                    document.getElementById('system').value = '';
                    document.getElementById('sn').value = '';
                }).catch(function (error) {
                    showNotification('Error on deleting customer:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });
});

//============================================================================================================================
//add and remove baseline

$('#add-baseline').on('click', function (e) {
    e.preventDefault();
    var baseline = document.getElementById('baseline').value;
    var cd = document.getElementById('cd').value;
    var conn = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting for adding baseline: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn);
            request
                .input('baseline', baseline)
                .input('cd', cd)
                .query('INSERT INTO [baselines] ([name] , [cd]) VALUES (@baseline, @cd); SELECT SCOPE_IDENTITY() AS id;')
                .then(function (data) {
                    var conn2 = new sql.Connection(config, function (err) {
                        if (err) {
                            showNotification('error connecting for adding baseline to project: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                        } else {
                            var request = new sql.Request(conn2);
                            request
                                .input('project_id', document.getElementById('project_id').value)
                                .input('baseline_id', data[0].id)
                                .query('INSERT INTO projects_baselines (project_id,baseline_id) VALUES (@project_id ,  @baseline_id)')
                                .then(function () {
                                    showNotification('Baseline Added', 'success', 'glyphicon glyphicon-tasks');
                                    refreshBaseline(document.getElementById('project_id').value);
                                }).catch(function (error) {
                                    showNotification('Error adding baseline to project :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                });
                        }
                    });
                }).catch(function (error) {
                    showNotification('Error adding baseline :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });
});

$('#baselineTable-body').delegate('.baseline-delete', 'click', function (e) {
    e.preventDefault();
    var id = this.dataset.pk;

    var conn = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting for deleting Baselines: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn);
            request
                .input('id', sql.Int, id)
                .query('DELETE FROM baselines WHERE id = @id')
                .then(function (data) {
                    showNotification('Baseline Deleted from the database', 'success', 'glyphicon glyphicon-tasks');
                    refreshBaseline(document.getElementById('project_id').value);
                    document.getElementById('baseline').value = '';
                    document.getElementById('cd').value = '';
                }).catch(function (error) {
                    showNotification('Error on deleting Baselines:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });
});