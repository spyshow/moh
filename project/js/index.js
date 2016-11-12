/**
 * Created by jihad.kherfan on 9/25/2016.
 */

/* TODO

    1-add realvsn
     2-figure how to send project id from page to other
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
                    html += '<td class="delete-td text-center"><button type="button" class="btn btn-danger customer-delete btn-xs" data-pk="'+data.id+' aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></td>';
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
                    html += '<td class="delete-td text-center"><button type="button" class="btn btn-danger customer-delete btn-xs" data-pk="'+data.id+' aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></td>';
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
    refreshCustomer(1);
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
    refreshBaseline(1);
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
