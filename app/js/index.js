/**
 * Created by jihad.kherfan on 9/25/2016.
 */

/* TODO

    1- empty customer list checked attribute in new issue btn
    2- make search use like.
    3- update customer database on click
    4- make english and dutch for summary and description
    5- make file upload
    6- make new and history action

 */
var electron = require('electron');
var ipc = electron.ipcRenderer;
var mysql = require('mysql');
var PDFDocument = require('pdfkit');


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
        conn.query('SELECT id,project_name,cpf_doc_id FROM projects', function (error, data) { // select project_name , cpf_doc_id and ID from project
            if(error){
                showNotification('Error :'+error,'danger','glyphicon glyphicon-tasks');
            } else {
                var project_list = '';   // variable to carry the options for the select
                data.forEach(function (data) {
                    project_list += '<option value="' + data.id + '">' + data.project_name + '</option>'; //make an option for every project
                });

                $('#project_name').html(project_list).selectpicker('refresh'); // put them in the select div and refresh the select to show the new values

            }
        });
        conn.release(); // release the connection to be use in other query
    });

});

//======================================================================================================================
//new project btn clicked

$('.project_new').click(function(e){
    e.preventDefault();
    ipc.send('show-project-win');
});

//======================================================================================================================
//selected project submit button

$('#project_submit').click(function(){
    var issueID;
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    document.getElementById('projectID').value = project_ID;
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT issues.id , issues.dbid ,issues.work,issues.date,issues.area,issues.key,issues.defect,issues.charm,issues.status,issues.no_further_action,issues.baseline,issues.reproducible,issues.priority,issues.messenger,issues.summary,issues.description,issues.solution,issues.solution_baseline,issues.c2c, projects.cpf_doc_id FROM issues ' +
            ' INNER JOIN projects ON projects.id = issues.project_id ' +
            ' WHERE ? ORDER BY id DESC LIMIT  1 ',[{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                issueID = data[0].id;
                document.getElementById('cpf-doc-id').textContent = data[0].cpf_doc_id;
                document.getElementById('cpf-all').textContent = data[0].issues_num;
                document.getElementById('issueID').value = data[0].id;
                document.getElementById('form_type').value = 'update';
                document.getElementById('DBID').value = data[0].dbid;
                document.getElementById('work').value = data[0].work;
                document.getElementById('date').value = data[0].date;
                $('#area').val(data[0].area).selectpicker('refresh');
                document.getElementById('key').value = data[0].key;
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


            //for customers list
            conn.query('SELECT id,name FROM customers ' +
                ' INNER JOIN projects_customers as pc ON customers.id = pc.customer_id' +
                ' WHERE  ? ',[{project_id: project_ID}], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var html='';
                    data.forEach(function(data){
                        html += '<li>';
                        html += '<input type="checkbox" class="customers" data-id="'+data.id+'" id="'+data.name+'" ' +
                                '"name="customer" value="'+data.name+'"><label for="'+data.name+'">  '+data.name+'</label>';
                        html += '</li>';
                    });
                    $('.customer_list').append(html);
                }
            });
            // to check the selected customers
            conn.query('SELECT id,name FROM customers ' +
                ' INNER JOIN issues_customers as ic ON customers.id = ic.customer_id' +
                ' WHERE  ? ',[{issue_id: document.getElementById('issueID').value}], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    data.forEach(function(data){
                        if(document.getElementById(data.name).dataset.id == data.id){
                            document.getElementById(data.name).setAttribute('checked','');
                        }
                    });

                }
            });
        });

        //for cpf all
        conn.query('SELECT COUNT(issues.id) AS issues_all FROM issues ' +
            ' WHERE  ? ',[{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                document.getElementById('cpf-all').textContent = data[0].issues_all;
            }
        });

        //for cpf open
        console.log(conn.query('SELECT COUNT(issues.id) AS issues_open FROM issues ' +
            ' WHERE  ? AND no_further_action = ? ',[{project_id: project_ID},'0']));
        conn.query('SELECT COUNT(issues.id) AS issues_open FROM issues ' +
            ' WHERE  ? AND no_further_action = ? ',[{project_id: project_ID},'0'], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                document.getElementById('cpf-open').textContent = data[0].issues_open;
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
    var key = document.getElementById('key').value;
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
    document.getElementById('key').value = '';
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
    $('.customer_list').empty();
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT id,name FROM customers ' +
            ' INNER JOIN projects_customers as pc ON customers.id = pc.customer_id' +
            ' WHERE  ? ', [{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                var html = '';
                data.forEach(function (data) {
                    html += '<li>';
                    html += '<input type="checkbox" data-id="' + data.id + '" id="' + data.name + '" "name="customer" value="' + data.name + '"><label for="' + data.name + '">' + data.name + '</label>';
                    html += '</li>';
                });
                $('.customer_list').append(html);
            }
        });
    });
});

//======================================================================================================================
//update customer database on click

$('.customers').on('click', function (e) {
    console.log($(this));
    if($(this).checked === true){
        connection.getConnection(function(err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                return;
            }
            console.log(conn.query('INSERT INTO issues_customers (`issue_id`, `customer_id`) VALUES (?,?)',[document.getElementById('issueID').value,$(this).dataset.id ]));
            conn.query('INSERT INTO issues_customers (`issue_id`, `customer_id`) VALUES (?,?)',
                [document.getElementById('issueID').value,$(this).dataset.id ],
                function (error) {
                    if(error){
                        showNotification('can\'t link the customer to the issue: '+error,'danger','glyphicon glyphicon-tasks');
                    } else {
                        showNotification('customer '+$(this).value()+' has the issue', 'info', 'glyphicon glyphicon-tasks');
                    }
                });
            conn.release();
        });
    }else if($(this).checked === false){
        connection.getConnection(function(err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                return;
            }
            console.log(conn.query('DELETE FROM issues_customers WHERE issue_id = ? AND customer_ID = ? ',[document.getElementById('issueID').value,$(this).dataset.id ]));
            conn.query('DELETE FROM issues_customers WHERE issue_id = ? AND customer_ID = ? ',
                [document.getElementById('issueID').value,$(this).dataset.id ],
                function (error) {
                    if(error){
                        showNotification('can\'t unlink the customer from the issue: '+error,'danger','glyphicon glyphicon-tasks');
                    } else {
                        showNotification('customer '+$(this).value()+' doesn\'t have the issue', 'info', 'glyphicon glyphicon-tasks');
                    }
                });
            conn.release();
        });
    }
});

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
                document.getElementById('key').value = data[0].key;
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
                document.getElementById('key').value = data[0].key;
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
$('#next_issue').click(function(){
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
                document.getElementById('key').value = data[0].key;
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
                document.getElementById('key').value = data[0].key;
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

//search btn
$('.search-btn').click(function(e){
    e.preventDefault();
    $('.search-result').addClass('hidden');

    var defect = document.getElementById('s_defect').value ;
    //var customer = document.getElementById('s_customer').value;
    var summary = document.getElementById('s_summary').value;
    var status = document.getElementById('s_status').value;
    var open_issue = 0;
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    var sql = [];
    if(document.getElementById('s_open_issues').checked === false) {
        open_issue = 1;
    }


    var final_sql = 'SELECT id,summary,dbid FROM issues WHERE ';
    if(defect){
        final_sql += ' defect LIKE ? AND ';
        sql.push('%'+defect+'%');
    }
   /* if(customer){
        final_sql += '  customer REGEXP ? AND ';
        sql.push(customer);
    }
    */
    if(status){
        final_sql += '  status LIKE %?% AND ';
        sql.push('%'+status+'%');
    }
    if(summary){
        final_sql += '  MATCH(summary) AGAINST(? IN NATURAL LANGUAGE MODE ) AND' ;
        sql.push('%'+summary+'%');
    }
    console.log(open_issue);
    if(open_issue === 0){
        final_sql += ' ?  AND ';
        sql.push({no_further_action: '0'});
    }

    final_sql += ' ? ';
    sql.push({project_id: project_ID});

    if(!status && !summary && !defect) {
        $('.search-ph').removeClass('hidden').addClass('show');

    } else {

        connection.getConnection(function (err, conn) { //make connection to DB
            if (err) { //error handling
                showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
                return;
            }
            console.log(conn.query(final_sql, sql));
            conn.query(final_sql, sql, function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {

                    if (data.length === 0) {
                        $('.search-ph').removeClass('hidden').addClass('show');
                        $('#search-ph-msg').text('No Result returned from DataBase  ').addClass('text-danger');
                    } else {
                        $('.search-ph').removeClass('show').addClass('hidden');
                        for (var i = 0; i < data.length; i++) {
                            $('.s_list').append('<a class="search-result" href="'+data[i].id+'"><li class="list-group-item list-group-item-success"><h4 class="list-group-item-heading">' + data[i].dbid + '</h4> <p class="list-group-item-text">' + data[i].summary + '</p></li></a>');
                        }
                    }
                }
            });

            conn.release();
        });
    }
});

//search result links
$('.s_list').delegate('.search-result','click',function(e){
    e.preventDefault();
    var id= $(this).attr('href');
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT * FROM issues WHERE  ?  AND ?',[{project_id: project_ID},{id: id}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {

                document.getElementById('issueID').value = data[0].id;
                document.getElementById('form_type').value = 'update';
                document.getElementById('DBID').value = data[0].dbid;
                document.getElementById('work').value = data[0].work;
                document.getElementById('date').value = data[0].date;
                $('#area').val(data[0].area).selectpicker('refresh');
                document.getElementById('key').value = data[0].key;
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
                showNotification('Issue loaded','success','glyphicon glyphicon-ok');
            }
        });
        conn.release();
    });

});

//search reset btn
$('.search-reset-btn').click(function(e){
    e.preventDefault();
    document.getElementById('s_defect').value ='';
    document.getElementById('s_customer').value ='';
    document.getElementById('s_summary').value ='';
    document.getElementById('s_status').value ='';
    $('.search-ph').removeClass('hidden').addClass('show');
    $('#search-ph-msg').text(' Search result will be shown here  ').removeClass('text-danger');
    $('.search-result').remove();
});

//======================================================================================================================
//create PDF
