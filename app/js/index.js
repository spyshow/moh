/**
 * Created by jihad.kherfan on 9/25/2016.
 */

/* TODO

    1- make new project button take us to new project page .

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
        conn.query('SELECT * FROM issues WHERE  ? ORDER BY id DESC LIMIT  1',[{project_id: project_ID}], function (error, data) {
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
        conn.release();
    });

    $('#last_issue').hide();
    $('#next_issue').hide();
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
//issues navigation buttons


//first issue
$('#first_issue').click(function(){
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT * FROM issues WHERE  ? ORDER BY id ASC LIMIT  1',[{project_id: project_ID}], function (error, data) {
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
        conn.release();
    });

    $('#first_issue').hide();
    $('#previous_issue').hide();
    $('#last_issue').show();
    $('#next_issue').show();
});


//last issue
$('#last_issue').click(function(){
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT * FROM issues WHERE  ? ORDER BY id DESC LIMIT  1',[{project_id: project_ID}], function (error, data) {
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
        conn.release();
    });

    $('#last_issue').hide();
    $('#next_issue').hide();
    $('#first_issue').show();
    $('#previous_issue').show();
});

//next issue
$('#next_issue').click(function(e){
    var issueID = document.getElementById('issueID').value;
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('select * from issues where id = (select min(id) from issues where id > ?) AND ? LIMIT  1',[issueID,{project_id: project_ID}], function (error, data) {
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

            }
        });
        conn.release();
    });

    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('select MIN(id) AS min_id, MAX(id) AS max_id from issues where ?',[{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                console.log(document.getElementById('issueID').value+' '+data[0].max_id);
                if(document.getElementById('issueID').value == data[0].max_id){

                    $('#last_issue').hide();
                    $('#next_issue').hide();
                }
            }
        });
        conn.release();
    });


    $('#first_issue').show();
    $('#previous_issue').show();
});
//previous issue

$('#previous_issue').click(function () {
    var issueID = document.getElementById('issueID').value;
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('select * from issues where id = (select max(id) from issues where id < ?) AND ? LIMIT  1',[issueID,{project_id: project_ID}], function (error, data) {
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

            }
        });
        conn.release();
    });

    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('select MIN(id) AS min_id, MAX(id) AS max_id from issues where ?',[{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                console.log(document.getElementById('issueID').value+' '+data[0].min_id);
                if(document.getElementById('issueID').value == data[0].min_id){

                    $('#first_issue').hide();
                    $('#previous_issue').hide();
                }
            }
        });
        conn.release();
    });


    $('#last_issue').show();
    $('#next_issue').show();
});


//======================================================================================================================
//search

$('.search-btn').click(function(e){
    e.preventDefault();
    var defect = document.getElementById('s_defect').value ;
    var customer = document.getElementById('s_customer').value;
    var summary = document.getElementById('s_summary').value;
    var status = document.getElementById('s_status').value;
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    var sql = [];
    var final_sql = 'SELECT id,summary,dbid FROM issues WHERE ';
    if(defect){
        final_sql += ' defect REGEXP ? AND ';
        sql.push(defect);
    }
   /* if(customer){
        final_sql += '  customer REGEXP ? AND ';
        sql.push(customer);
    }
    */
    if(status){
        final_sql += '  status REGEXP ? AND ';
        sql.push(status);
    }
    if(summary){
        final_sql += '  MATCH(summary) AGAINST(? IN NATURAL LANGUAGE MODE ) AND' ;
        sql.push(summary);
    }

    final_sql += ' ? ';
    sql.push({project_id: project_ID});



    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
            return;
        }console.log(conn.query(final_sql,sql));
        conn.query(final_sql,sql, function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                for(var i =0 ; i<data.length;i++){
                    $('.s_list').append('<li class="list-group-item list-group-item-success"><h4 class="list-group-item-heading">'+data[i].dbid+'</h4> <p class="list-group-item-text">'+data[i].summary+'</p></li>');
                }
            }
        });

        conn.release();
    });
});
