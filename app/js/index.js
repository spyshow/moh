/**
 * Created by jihad.kherfan on 9/25/2016.
 */

/* TODO


    3- make new project button take us to new project page .

 */

var mysql = require('mysql');

//======================================================================================================================
//Tabs
$('#myTabs').find('a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
});

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


$(document).ready(function(){

    // select all project names for the first screen
    $('#project_select').modal({show: true, backdrop : "static" , keyboard: false}); // show modal which cannot escape
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT id,project_name FROM projects', function (error, data) { // select project_name and ID from project
            if(error){
                showNotification('Error :'+error,'danger','glyphicon glyphicon-tasks');
            }
            var project_list='';   // variable to carry the options for the select
            data.forEach(function(data){
                project_list += '<option value="'+data.id+'">'+data.project_name+'</option>'; //make an option for every project
            });

            $('#project_name').html(project_list).selectpicker('refresh'); // put them in the select div and refresh the select to show the new values
        });
        conn.release(); // release the connection to be use in other query
    });

});

//======================================================================================================================
//selected project submit button

$('#project_submit').click(function(){
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT * FROM issues WHERE  ? ORDER BY id DESC',[{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {

                document.getElementById('issueID').value = data[0].id;
                document.getElementById('form_type').value = 'update';
                document.getElementById('DBID').value = data[0].dbid;
                document.getElementById('work').value = data[0].work;
                document.getElementById('date').value = data[0].date;
                $('#area').val(data[0].area).selectpicker('refresh');
                $('#key').val(data[0].key).selectpicker('refresh');
                document.getElementById('defect').value = data[0].defect;
                document.getElementById('charm').value = data[0].charm;
                document.getElementById('status').value = data[0].status;
                document.getElementById('no_further_action').checked = data[0].no_further_action;
                document.getElementById('baseline').value = data[0].baseline;
                $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
                $('#priority').val(data[0].priority).selectpicker('refresh');
                $('#messenger').val(data[0].messenger).selectpicker('refresh');
                document.getElementById('summary').value = data[0].summary;
                document.getElementById('description').value = data[0].description;
                document.getElementById('solution').value = data[0].solution;
                document.getElementById('solution_baseline').value = data[0].solution_baseline;
                document.getElementById('c2c').value = data[0].c2c;
                $('#project_select').modal({show: false});
            }
        });
    });
});
//======================================================================================================================
//submit or update issue button

$('#submit').click(function (e) {
    e.preventDefault();
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    var issueID = document.getElementById('issueID').value;
    var dbid = document.getElementById('DBID').value;
    var work = document.getElementById('work').value;
    var date = document.getElementById('date').value;
    var area = $('#area').val();
    var key = $('#key').val();
    var defect = document.getElementById('defect').value;
    var charm = document.getElementById('charm').value;
    var status = document.getElementById('status').value;
    var no_further_action = document.getElementById('no_further_action').checked;
    var baseline =  document.getElementById('baseline').value;
    var reproducible = $('#reproducible').val();
    var priority = $('#priority').val();
    var messenger = $('#messenger').val();
    var summary = document.getElementById('summary').value;
    var description = document.getElementById('description').value;
    var solution = document.getElementById('solution').value;
    var solution_baseline = document.getElementById('solution_baseline').value;
    var c2c = document.getElementById('c2c').value;

    if(document.getElementById('form_type').value === 'update'){

        connection.getConnection(function(err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                return;
            }

            conn.query('UPDATE issues SET ? Where ?',
                [{dbid: dbid, work: work ,date: date,area: area, key: key, defect: defect, charm: charm , status: status , no_further_action: no_further_action , baseline: baseline,reproducible: reproducible, priority: priority, messenger: messenger , summary:summary,description: description,solution: solution,solution_baseline:solution_baseline,c2c: c2c  },{id: issueID}],
                function (error) {
                    if(error){
                        showNotification(error,'danger','glyphicon glyphicon-tasks');
                    } else {
                        showNotification('Data updated in the database', 'success', 'glyphicon glyphicon-tasks');
                    }
                });

            conn.release();
        });

    } else {


        connection.getConnection(function(err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                return;
            }
            conn.query('INSERT INTO issues SET ?',
                [{project_id: project_ID,dbid: dbid, work: work ,date: date,area: area, key: key, defect: defect, charm: charm , status: status , no_further_action: no_further_action , baseline: baseline,reproducible: reproducible, priority: priority, messenger: messenger , summary:summary,description: description,solution: solution,solution_baseline:solution_baseline,c2c: c2c  }],
                function (error) {
                    if(error){
                        showNotification(error,'danger','glyphicon glyphicon-tasks');
                    }
                    else {
                        showNotification('Data saved to the database','success','glyphicon glyphicon-tasks');
                    }
                });
            conn.release();
        });
    }
    document.getElementById('form_type').value = 'update';

});

//======================================================================================================================
//new issue button

$('#new_issue').click(function(e){
    e.preventDefault();
    document.getElementById('issueID').value = '';
    document.getElementById('form_type').value = 'insert';
    document.getElementById('DBID').value = '';
    document.getElementById('work').value = '';
    document.getElementById('date').value = getDate();

    $('#area').val(1).selectpicker('refresh');
    $('#key').val(1).selectpicker('refresh');
    document.getElementById('defect').value = '';
    document.getElementById('charm').value = '';
    document.getElementById('status').value = '';
    document.getElementById('no_further_action').checked = 0;
    document.getElementById('baseline').value = '';
    $('#reproducible').val(1).selectpicker('refresh');
    $('#priority').val(1).selectpicker('refresh');
    $('#messenger').val(1).selectpicker('refresh');
    document.getElementById('summary').value = '';
    document.getElementById('description').value = '';
    document.getElementById('solution').value = '';
    document.getElementById('solution_baseline').value = '';
    document.getElementById('c2c').value = '';
});

//======================================================================================================================
//new project button

//======================================================================================================================
//delete button
$('#delete_btn').click(function(e){
    e.preventDefault();
    $('#confirm').modal({ show: true ,backdrop: 'static', keyboard: false });
});

$('#delete_issue').click(function(e){
    e.preventDefault();
    var issueID = document.getElementById('issueID').value;

    if(issueID){
        connection.getConnection(function(err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                return;
            }
            conn.query('DELETE FROM issues WHERE ?', [{id: issueID }],
                function (error) {
                    if(error){
                        showNotification(error,'danger','glyphicon glyphicon-tasks');
                    }
                    else {
                        showNotification('Issue Deleted from the database','success','glyphicon glyphicon-tasks');
                    }
                });
            conn.release();
        });
    }

    $('#project_submit').click();
});

//======================================================================================================================
