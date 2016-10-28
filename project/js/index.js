/**
 * Created by jihad.kherfan on 9/25/2016.
 */

/* TODO

1- try $('parent').delegate('child','click',function(e){});
 */
var electron = require('electron');
var ipc = electron.ipcRenderer;
var mysql = require('mysql');



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
function refreshTable(tableName, projectID) {
    connection.getConnection(function (err, conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT * FROM '+tableName+
                   ' INNER JOIN projects_customers AS pc ON customers.id = pc.customer_id '+
                   ' WHERE  pc.project_id = ?',[projectID],function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                var html = '';
                console.log(data);
                data.forEach(function(data){
                    html += '<tr>';
                    html += '<td class="td" data-type="name" data-pk="'+data.id+'">'+data.name+'</td>';
                    html += '<td class="td" data-type="system" data-pk="'+data.id+'">'+data.system+'</td>';
                    html += '<td class="td" data-type="sn" data-pk="'+data.id+'">'+data.sn+'</td>';
                    html += '<td class="delete-td text-center"><button type="button" class="btn btn-danger customer-delete btn-xs" data-pk="'+data.id+' aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></td>';
                    html += '</tr>';
                });
                $('tbody').append(html);
                html='';
            }
        });
conn.release();
});
}


$(document).ready(function(){
    refreshTable('customers',1);
    $('td').editable(function(newValue) {
        var el=$(this)[0];
        connection.getConnection(function (err, conn) { //make connection to DB
            if (err) { //error handling
                showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
                return;
            }console.log(conn.query('UPDATE customers SET '+el.dataset.type+' = ? WHERE id = ? ',[newValue , el.dataset.pk]));
            conn.query('UPDATE customers SET '+el.dataset.type+' = ? WHERE id = ? ',[newValue , el.dataset.pk], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {

                }
            });
            conn.release();
        });
        return(newValue);
    }, {
        type    : 'text',
        submit  : 'OK'
    });

});
