/**
 * Created by jihad.kherfan on 10/21/2016.
 */
var electron = require('electron');
var ipc = electron.ipcRenderer;
var mysql = require('mysql');
var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var project_ID = 1;

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
//notification
function showNotification(msg,type,icon){
    $.notify({
        icon: icon,
        message: msg}, {
        type: type
    });
}

//======================================================================================================================
//prepare docx file
var content = fs.readFileSync(__dirname + "/../template/input.docx", "binary");
var doc = new Docxtemplater(content);

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
// when page ready
$(document).ready(function(){
    var option= {};
    var html  ='';
    //get customers and put them in the select menu
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT name,id FROM customers WHERE ? ',[{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                data.forEach(function(data){
                    html += '<option value="'+data.id+'">'+data.name+'</option>';
                });
                $('#customers').append(html).selectpicker('refresh');
                $('#both-customers').append(html).selectpicker('refresh');
                html = '';
            }
        });
    });

    //get baseline and put them in the select menu
   /* connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT name,id FROM baselines WHERE ? ',[{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                data.forEach(function(data){
                    html += '<option value="'+data.id+'">'+data.name+'</option>';
                });
                $('#baselines').append(html).selectpicker('refresh');
                $('#both-baselines').append(html).selectpicker('refresh');
            }
        });
    }); */

    //create docx file
    $('#word').on('click',function(e){
        e.preventDefault();
        var result = [];
        var fileName;
        var customer = document.getElementById('customers').options[document.getElementById('customers').selectedIndex].value;
        switch($("input[name=report-type]:checked").val()){
            case 'all-issues':
                option = {project_id: project_ID};
                break;

            case  'all-issues-customer':
                option = {project_id: project_ID, customer: customer};
                break;
        }

        connection.getConnection(function(err,conn) { //make connection to DB
            if (err) { //error handling
                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                return;
            }
            conn.query('SELECT id, dbid , date, charm , defect , status, summary, description from issues WHERE ?',[option], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var res = [],i=-1;
                    data.forEach(function(data){
                        i++;
                        connection.getConnection(function(err,conn2) { //make connection to DB
                            if (err) { //error handling
                                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                                return;
                            }
                            conn2.query('SELECT date, action FROM actions WHERE ?',[{issue_id: data.id}], function (error, data2) {
                                if (error) {
                                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                                } else {
                                    console.log('data2('+data.id+'):', data2);
                                    data2.forEach(function(data21){
                                        res.push({"date" : data21.date,"description" : data21.action});
                                        console.log(res);
                                    });
                                }
                            });
                        });
                        console.log(res);
                        result.push(
                            {
                                "id": data.id,
                                "DBID": data.dbid,
                                "date": data.date,
                                "charm": data.charm,
                                "defect": data.defect,
                                "status": data.status,
                                "summary": data.summary,
                                "description": data.description

                            }
                        );
                        console.log(res);
                        result[i].actions= res[0];
                        res=[];
                    });
                    //console.log(result[0].actions);
                    fileName = 'Report_'+project_ID+'_'+getDate()+'.docx';
                    var final = {};
                    final.issues = result;
                    doc.setData(final);
                    doc.render();
                    var buf =doc.getZip().generate({type:"nodebuffer"});
                    fs.writeFileSync(__dirname+"/../"+fileName,buf);
                    result = [];
                }
            });
        });
    });
});