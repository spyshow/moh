/**
 * Created by jihad.kherfan on 9/25/2016.
 */

/* TODO

    1-add realvsn
     
 */
var electron = require('electron');
var ipc = electron.ipcRenderer;
var mysql = require('mysql');
var currentValue ='';
var haveError = false;


//======================================================================================================================
//notification
function showNotification(msg,type,icon){
    $.notify({
        icon: icon,
        message: msg}, {
        type: type
    });
}

//======================================================================================================================
//getDate
function getDate(){
    var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    return year+'-'+month+'-'+day;
}

//======================================================================================================================
//create Mysql connection
var connection = mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : '',
    database: 'test'
});

//======================================================================================================================
//customer table

//draw table
function refreshCustomer(projectID) {
    $('#customerTable-body').empty();
    connection.getConnection(function (err, conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT * FROM customers'+
                   ' INNER JOIN projects_customers AS pc ON customers.id = pc.customer_id '+
                   ' WHERE  pc.project_id = ?',[projectID],function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                var html = '';
                data.forEach(function(data){
                    html += '<tr>';
                    html += '<td class="td editablecustomers" data-type="name" data-pk="'+data.id+'" contenteditable>'+data.name+'</td>';
                    html += '<td class="td editablecustomers" data-type="system" data-pk="'+data.id+'" contenteditable>'+data.system+'</td>';
                    html += '<td class="td editablecustomers" data-type="sn" data-pk="'+data.id+'" contenteditable>'+data.sn+'</td>';
                    html += '<td class="delete-td text-center"><button type="button" class="btn btn-danger customer-delete btn-xs" data-pk="'+data.id+'" aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></td>';
                    html += '</tr>';
                });
                $('#customerTable-body').append(html);
                html='';
            }
        });
        conn.release();
    });
}

function refreshBaseline(projectID) {
    $('#baselineTable-body').empty();
    connection.getConnection(function (err, conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT * FROM baselines'+
                   ' INNER JOIN projects_baselines AS pb ON baselines.id = pb.baseline_id '+
                   ' WHERE  pb.project_id = ?',[projectID],function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                var html = '';
                data.forEach(function(data){
                    html += '<tr>';
                    html += '<td class="td editablebaselines" data-type="name" data-pk="'+data.id+'" contenteditable>'+data.name+'</td>';
                    html += '<td class="td editablebaselines" data-type="cd" data-pk="'+data.id+'" contenteditable>'+data.cd+'</td>';
                    html += '<td class="delete-td text-center"><button type="button" class="btn btn-danger baseline-delete btn-xs" data-pk="'+data.id+'" aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></td>';
                    html += '</tr>';
                });
                $('#baselineTable-body').append(html);
                html='';
            }
        });
        conn.release();
    });
}

function edit_data(id, type, newValue,table,el) {
    if(currentValue !== newValue) {
        connection.getConnection(function (err, conn) { //make connection to DB
            if (err) { //error handling
                showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
                haveError = true;
                if(haveError === true){
                    el.text(currentValue) ;
                    haveError = false;
                }
            }
            conn.query('UPDATE '+table+' SET ' + type + ' = ? WHERE id = ? ', [newValue, id], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                    haveError = true;
                    if(haveError === true){
                        el.text(currentValue) ;
                        haveError = false;
                    }
                } else {
                    showNotification(table+' Updated successfully', 'success', 'glyphicon glyphicon-tasks');

                }
            });
            conn.release();
        });
    }
}

$(document).ready(function(){
    //customers table 
    $(document).on('focus', '.editablecustomers', function(){
        currentValue = $(this).text();
    });
    $(document).on('blur', '.editablecustomers', function(){
        var el = $(this);
        var id = $(this).data("pk");
        var type = $(this).data("type");
        var newValue = $(this).text();
        edit_data(id,type, newValue,'customers',el);
    });

    //baseline table 
    $(document).on('focus', '.editablebaselines', function(){
        currentValue = $(this).text();
    });
    $(document).on('blur', '.editablebaselines', function(){
        var el = $(this);
        var id = $(this).data("pk");
        var type = $(this).data("type");
        var newValue = $(this).text();
        edit_data(id,type, newValue,'baselines',el);
    });

});


//============================================================================================================================
//add or update project

ipc.on('show-edit-project', function(event , project_id){
    connection.getConnection(function (err, conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT * FROM projects WHERE id = ?',[project_id],function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                document.getElementById('project_id').value = data[0].id;
                document.getElementById('project_name').value = data[0].project_name;
                document.getElementById('cpf-doc-id').value = data[0].cpf_doc_id;
                if(data[0].project_type == 0){
                    document.getElementById('syngo').checked = true;
                } else {
                    document.getElementById('mr').checked = true;
                }
                if(data[0].db_type == 0){
                    document.getElementById('charm').checked = true;
                } else {
                    document.getElementById('TFS').checked = true;
                }
                document.getElementById('type').value = 'update';
                refreshCustomer(data[0].id);
                refreshBaseline(data[0].id);
            }
        });
        conn.release();
    });
});

ipc.on('show-new-project', function(event){
    document.getElementById('project_id').value = '';
    document.getElementById('project_name').value = '';
    document.getElementById('cpf-doc-id').value = '';
    document.getElementById('syngo').checked = true;
    document.getElementById('charm').checked = true;
    $('#customerTable-body').empty();
    $('#baselineTable-body').empty();
});

$('#projectSubmit').on('click',function(e){
    e.preventDefault();
    var project_id = document.getElementById('project_id').value;
    var project_name = document.getElementById('project_name').value;
    var cpf_doc_id = document.getElementById('cpf-doc-id').value;
    var project_type = 0;
    if($('#syngo').is(':checked')) {
        project_type = 0;
    } else {
        project_type = 1;
    }
    var db_type = 0;
    if($('#charm').is(':checked')) {
        db_type = 0;
    } else {
        db_type = 1;
    }
    if (document.getElementById('type').value === 'update') {
        connection.getConnection(function (err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
                return;
            }
            conn.query('UPDATE projects SET ? Where ?',
            [{
                    project_name: project_name,
                    cpf_doc_id: cpf_doc_id,
                    project_type: project_type,
                    db_type: db_type
                }, {id: project_id}],function (error) {
                    if (error) {
                        showNotification(error, 'danger', 'glyphicon glyphicon-tasks');
                    } else {
                        showNotification('Data updated in the database', 'success', 'glyphicon glyphicon-tasks');
                    }
                }
            );
            conn.release();
        });
    } else {
        connection.getConnection(function (err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
                return;
            }
            conn.query('INSERT INTO projects SET ?',
            [{
                project_name: project_name,
                cpf_doc_id: cpf_doc_id,
                project_type: project_type,
                db_type: db_type}],function (error) {
                if (error) {
                    showNotification(error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    showNotification('Project Created', 'success', 'glyphicon glyphicon-tasks');
                }
            });
            conn.release();
        });
    }
});

//============================================================================================================================
//add and remove customers

$('#add-customer').on('click',function(e){
    e.preventDefault();
    var customerName = document.getElementById('customer-name').value;
    var system = document.getElementById('system').value;
    var sn = document.getElementById('sn').value;
    connection.getConnection(function (err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
                return;
            }
            conn.query('INSERT INTO customers SET ?',
            [{
                name: customerName,
                system: system,
                sn: sn}],function (error,data) {
                if (error) {
                    showNotification(error, 'danger', 'glyphicon glyphicon-tasks');
                }
                conn.query('INSERT INTO projects_customers SET project_id = ? , customer_id = ?',
                [document.getElementById('project_id').value,data.insertId],
                function (error) {
                if (error) {
                    showNotification(error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    showNotification('Customer '+customerName+' Added', 'success', 'glyphicon glyphicon-tasks');
                    refreshCustomer(document.getElementById('project_id').value);
                }
                
            });
            });
            conn.release();
        });
});

$('#customerTable-body').delegate('.customer-delete','click',function(e){
    e.preventDefault();
    var id = this.dataset.pk;
    console.log(id);
    connection.getConnection(function(err, conn) {
        if (err) {
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('DELETE FROM customers WHERE ?', [{id: id}],
            function (error) {
                if(error){
                    showNotification(error,'danger','glyphicon glyphicon-tasks');
                }
                else {
                    showNotification('customer Deleted from the database','success','glyphicon glyphicon-tasks');
                    refreshCustomer(document.getElementById('project_id').value);
                    document.getElementById('customer-name').value = '';
                    document.getElementById('system').value = '';
                    document.getElementById('sn').value = '';
                }
            }
        );
        conn.release();
    });
});

//============================================================================================================================
//add and remove baseline

$('#add-baseline').on('click',function(e){
    e.preventDefault();
    var baseline = document.getElementById('baseline').value;
    var cd = document.getElementById('cd').value;
    connection.getConnection(function (err, conn) {
        if (err) {
            showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
            return;
        }
        conn.query('INSERT INTO baselines SET ?',
        [{
            name: baseline,
            cd: cd}],function (error,data) {
            if (error) {
                showNotification(error, 'danger', 'glyphicon glyphicon-tasks');
            }
            conn.query('INSERT INTO projects_baselines SET project_id = ? , baseline_id = ?',
                [document.getElementById('project_id').value, data.insertId],
                function (error) {
                if (error) {
                    showNotification(error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    showNotification('Baseline Added', 'success', 'glyphicon glyphicon-tasks');
                    refreshBaseline(document.getElementById('project_id').value);
                }
        });
        conn.release();
     });
    });
});

$('#baselineTable-body').delegate('.baseline-delete','click',function(e){
    e.preventDefault();
    var id = this.dataset.pk;
    console.log(id);
    connection.getConnection(function(err, conn) {
        if (err) {
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('DELETE FROM Baselines WHERE ?', [{id: id}],
            function (error) {
                if(error){
                    showNotification(error,'danger','glyphicon glyphicon-tasks');
                }
                else {
                    showNotification('Baseline Deleted from the database','success','glyphicon glyphicon-tasks');
                    refreshBaseline(document.getElementById('project_id').value);
                    document.getElementById('baseline').value = '';
                    document.getElementById('cd').value = '';
                }
            }
        );
        conn.release();
    });
});