/**
 * Created by jihad.kherfan on 9/25/2016.
 */

/* TODO


 */
var electron = require('electron');
var ipc = electron.ipcRenderer;
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
    database: 'test',
    multipleStatements: true
});

//======================================================================================================================
//baseline

function getIssueBaseline(issue_id,project_id){
    var name = '';
    var cd = '';
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting for baseline: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT id,name,cd FROM baselines ' +
                   'INNER JOIN issues_baselines as ib ON baselines.id = ib.baseline_id' +
                   ' WHERE ib.issue_id = ? ORDER BY ib.baseline_id DESC LIMIT 1 ', [issue_id], function (error, data) {
            if (error) {
                showNotification('Error on baseline:' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                if(data.length > 0){
                    if(data[0].name === null){
                        name = ' '
                    } else {
                        document.getElementById('baseline').value = data[0].name;
                        
                    }
                    if(data[0].cd === null){
                         cd = ' '
                    } else {
                         document.getElementById('cd').value = data[0].cd;
                         
                    }    
                    document.getElementById('baseline').dataset.id = data[0].id;
                } else {
                   getNewBaseline(project_id)
                }
            }
        });
        conn.release();
    });
}

function getNewBaseline(project_id){
    var name = '';
    var cd = '';
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting for baseline: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT id,name,cd FROM baselines ' +
                   ' INNER JOIN projects_baselines as pb ON baselines.id = pb.baseline_id ' +
                   ' WHERE pb.project_id = ? ORDER BY pb.baseline_id DESC LIMIT 1 ', [project_id], function (error, data) {
            if (error) {
                showNotification('Error on baseline:' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                if(data[0].name === null){
                    name = ' '
                } else {
                    name = data[0].name;
                }
                if(data[0].cd === null){
                    cd = ' '
                } else {
                    cd = data[0].cd;
                }
                document.getElementById('baseline').value = name;
                document.getElementById('cd').value = cd;
                document.getElementById('baseline').dataset.id = data[0].id;
            }
        });
        conn.release();
    });
}

function deleteBaseline(issue_id, pre_id) {
     connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting for baseline: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('DELETE FROM `issues_baselines` WHERE `issues_baselines`.`issue_id` = ? AND `issues_baselines`.`baseline_id` = ? ', [issue_id, pre_id], function (error, data) {
                    if (error) {
                        showNotification('Error on issues_baselines:' + error, 'danger', 'glyphicon glyphicon-tasks');
                    } else {
                        showNotification('old Baseline deleted', 'info', 'glyphicon glyphicon-tasks');
                    }
                });
        conn.release();
     });
}

function setBaseline(pre_id,name,cd,project_id,issue_id){
    var id = '';
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting for baseline: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('INSERT INTO `baselines` (`name`, `cd`) VALUES (?, ?); ', [name,cd], function (error, data) {
            if (error) {
                showNotification('Error on baseline:' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                id = data.insertId;
                
            }
            deleteBaseline(issue_id , pre_id);
            conn.query('INSERT INTO `issues_baselines` (`issue_id`, `baseline_id`) VALUES (?, ?); ', [issue_id,id], function (error, data) {
            if (error) {
                showNotification('Error on issues_baselines:' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                showNotification('Baseline Updated', 'info', 'glyphicon glyphicon-tasks');
            }});
            conn.query('INSERT INTO `projects_baselines` (`project_id`, `baseline_id`) VALUES (?, ?); ', [project_id,id], function (error, data) {
            if (error) {
                showNotification('Error on baseline:' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                getIssueBaseline(issue_id,project_id)
            }});
        });
        conn.release();
    });
}

$('#baseline-submit').click(function(e){
    e.preventDefault();
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    var pre_id = document.getElementById('baseline').dataset.id ;
    var name = document.getElementById('baseline').value ;
    var cd = document.getElementById('cd').value ;
    var issue_id = document.getElementById('DBID').value;
    setBaseline(pre_id,name,cd,project_ID,issue_id);
    getIssueBaseline(issue_id,project_id);
    $('#baseline-submit,#baseline-cancel').addClass('hidden');
    $('#baseline , #cd').blur();
});

$('#baseline-cancel').click(function(e){
    e.preventDefault();
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    var issue_id = document.getElementById('DBID').value;
    getIssueBaseline(issue_id,project_ID);
    $('#baseline-submit,#baseline-cancel').addClass('hidden');
    $('#baseline , #cd').blur();
});

$('#baseline , #cd').focus(function(e){
    e.preventDefault();
    $('#baseline-submit,#baseline-cancel').removeClass('hidden');
    
});

$('#baseline , #cd').blur(function(e){
    e.preventDefault();
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    var issue_id = document.getElementById('DBID').value;
    getIssueBaseline(issue_id,project_ID);
    $('#baseline-submit,#baseline-cancel').addClass('hidden');
});

//======================================================================================================================
//when page ready

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
    var project_title = project_name.options[project_name.selectedIndex].text;
    document.getElementById('projectID').value = project_title;
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT issues.id  ,issues.work,issues.date,issues.area,issues.description_de,issues.key,issues.defect,issues.charm,issues.status,issues.no_further_action,issues.reproducible,issues.priority,issues.messenger,issues.summary,issues.description,issues.solution,issues.solution_de,issues.c2c, projects.cpf_doc_id FROM issues ' +
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
                document.getElementById('DBID').value = data[0].id;
                document.getElementById('work').value = data[0].work;
                document.getElementById('date').value = data[0].date;
                $('#area').val(data[0].area).selectpicker('refresh');
                document.getElementById('key').value = data[0].key;
                document.getElementById('defect').value = data[0].defect;
                document.getElementById('charm').value = data[0].charm;
                document.getElementById('status').value = data[0].status;
                document.getElementById('no_further_action').checked = data[0].no_further_action;
                getIssueBaseline(data[0].id,project_ID);
                $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
                $('#priority').val(data[0].priority).selectpicker('refresh');
                $('#messenger').val(data[0].messenger).selectpicker('refresh');
                document.getElementById('summary').value = data[0].summary;
                document.getElementById('description').value = data[0].description;
                document.getElementById('description_de').value = data[0].description_de;
                document.getElementById('solution').value = data[0].solution;
                document.getElementById('solution_de').value = data[0].solution_de;
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
                    $('.customer_list').empty();
                    data.forEach(function(data){
                        html += '<li>';
                        html += '<input type="checkbox" class="customers" data-id="'+data.id+'" id="'+data.name+'" ' +
                                '"name="customers" value="'+data.name+'"><label for="'+data.name+'">  '+data.name+'</label>';
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
            // action current + history
            updateAction(document.getElementById('issueID').value);
            refreshFiles(document.getElementById('issueID').value);
            $('.add-file').prop('disabled',false);
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
    $('#cancel').addClass('disabled');
    $('#last_issue').addClass('disabled');
    $('#next_issue').addClass('disabled');
});

//======================================================================================================================
//submit or update issue button

$('#submit').click(function (e) {
    e.preventDefault();
    var project_name = document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    var issueID = document.getElementById('issueID').value;
    var work = (document.getElementById('work').value ?  document.getElementById('work').value : '');
    var date = document.getElementById('date').value;
    var area = $('#area').val();
    var key = (document.getElementById('key').value ?  document.getElementById('key').value : null);
    var defect = (document.getElementById('defect').value ?  document.getElementById('defect').value : null);
    var charm = (document.getElementById('charm').value ?  document.getElementById('charm').value : null);
    var status = (document.getElementById('status').value ?  document.getElementById('status').value : null);
    var no_further_action = document.getElementById('no_further_action').checked;
    var reproducible = $('#reproducible').val();
    var priority = $('#priority').val();
    var messenger = $('#messenger').val();
    var summary = (document.getElementById('summary').value ?  document.getElementById('summary').value : '');
    var description = (document.getElementById('description').value ?  document.getElementById('description').value : '');
    var description_de = (document.getElementById('description_de').value ?  document.getElementById('description_de').value : '');
    var solution = (document.getElementById('solution').value ?  document.getElementById('solution').value : '');
    var solution_de = (document.getElementById('solution_de').value ?  document.getElementById('solution_de').value : '');
    var c2c = (document.getElementById('c2c').value ?  document.getElementById('c2c').value : '');

    if (document.getElementById('form_type').value === 'update') {

        connection.getConnection(function (err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
                return;
            }
            conn.query('UPDATE issues SET ? Where ?',
                [{
                    work: work,
                    date: date,
                    area: area,
                    key: key,
                    defect: defect,
                    charm: charm,
                    status: status,
                    no_further_action: no_further_action,
                    reproducible: reproducible,
                    priority: priority,
                    messenger: messenger,
                    summary: summary,
                    description: description,
                    description_de: description_de,
                    solution: solution,
                    solution_de: solution_de,
                    c2c: c2c
                }, {id: issueID}],
                function (error) {
                    if (error) {
                        showNotification(error, 'danger', 'glyphicon glyphicon-tasks');
                    } else {
                        showNotification('Data updated in the database', 'success', 'glyphicon glyphicon-tasks');
                        $('.nav-btn').removeClass('disabled');;
                        $('#cancel').addClass('disabled');;
                        $('#new_issue').removeClass('disabled');;
                    }
                }
            );
            conn.release();
        });


    }

    document.getElementById('form_type').value = 'update';
});

//======================================================================================================================
//new issue button

$('#new_issue').click(function(e){
    e.preventDefault();
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;

    connection.getConnection(function(err, conn) {
        if (err) {
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('INSERT INTO issues SET ?',
            [{date: getDate,project_id: project_ID }],
            function (error, result) {
                if(error){
                    showNotification(error,'danger','glyphicon glyphicon-tasks');
                    return;
                }
                else {
                    document.getElementById('DBID').value = result.insertId;
                    document.getElementById('issueID').value = result.insertId;
                }
            });
        //for customers list
        conn.query('SELECT id,name FROM customers ' +
            ' INNER JOIN projects_customers as pc ON customers.id = pc.customer_id' +
            ' WHERE  ? ',[{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                var html='';
                $('.customer_list').empty();
                data.forEach(function(data){
                    html += '<li>';
                    html += '<input type="checkbox" class="customers" data-id="'+data.id+'" id="'+data.name+'" ' +
                        '"name="customers" value="'+data.name+'"><label for="'+data.name+'">  '+data.name+'</label>';
                    html += '</li>';
                });
                $('.customer_list').append(html);
            }
        });


        $('#action-current').empty();
        $('#action-history').empty();
        $('#new-action').val(" ").attr('disabled',false);
        $('#new-action-btn').removeClass("disabled");
        refreshFiles(document.getElementById('issueID').value);
        $('.add-file').removeClass('disabled');
        conn.release();
    });
    document.getElementById('form_type').value = 'insert';
    document.getElementById('work').value = 'CUT-Team';
    document.getElementById('date').value = getDate();
    $('#area').val(1).selectpicker('refresh');
    document.getElementById('key').value = '';
    document.getElementById('defect').value = '';
    document.getElementById('charm').value = '';
    document.getElementById('status').value = '';
    document.getElementById('no_further_action').checked = 0;
    getNewBaseline(project_ID)
    $('#reproducible').val(1).selectpicker('refresh');
    $('#priority').val(1).selectpicker('refresh');
    $('#messenger').val(1).selectpicker('refresh');
    document.getElementById('summary').value = '';
    document.getElementById('description').value = '';
    document.getElementById('description_de').value = '';
    document.getElementById('solution').value = '';
    document.getElementById('solution_de').value = '';
    document.getElementById('c2c').value = '';
    $('.customer_list').empty();
    $('#action-history').empty();
    $('#action-current').text('No Action Yet!');
    $('#new-action').val("Can't Add new Actions untill submitting the Issue !").attr('disabled','');
    $('#new-action-btn').addClass("disabled");

    refreshFiles(document.getElementById('issueID').value);
    $('.add-file').prop('disabled',false);
    $('.nav-btn').addClass('disabled');;
    $('#new_issue').addClass('disabled');
    $('#cancel').removeClass('disabled');;
    $('#files-table-body').empty();
    $('.add-file').prop('disabled',true);
});
    

//======================================================================================================================
//cancel btn

$('#cancel').on('click',function(e){

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
                        $('#project_submit').click();
                    }
                });
            conn.release();
        });
    }

    $('#files-table-body').empty();
    $('.nav-btn').removeClass('disabled');;
    $('#new_issue').removeClass('disabled');;
    $('#cancel').addClass('disabled');;
    $('#new-action').val(" ").attr('disabled',false);
    $('#new-action-btn').removeClass("disabled");
    $('.customer_list').empty();
    $('.add-file').prop('disabled',false);

});

//======================================================================================================================
//update customer database on click

$('.customer_list').delegate('.customers','click',function() {

    if($(this).is(":checked") === true){
        let id = this.dataset.id;
        let checkbox = this ;
        connection.getConnection(function(err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                return;
            }
            conn.query('INSERT INTO issues_customers (`issue_id`, `customer_id`) VALUES (?,?)',
                [document.getElementById('issueID').value,checkbox.dataset.id ],
                function (error) {
                    if(error){
                        showNotification('can\'t link the customer to the issue: '+error,'danger','glyphicon glyphicon-tasks');
                    } else {
                        showNotification('customer '+checkbox.value+' has the issue', 'info', 'glyphicon glyphicon-tasks');
                    }
                });
            conn.release();
        });
    }else if($(this).is(":checked")  === false){

        let checkbox = this ;

        connection.getConnection(function(err, conn) {
            if (err) {
                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                return;
            }
            conn.query('DELETE FROM issues_customers WHERE issue_id = ? AND customer_ID = ? ',
                [document.getElementById('issueID').value,checkbox.dataset.id ],
                function (error) {
                    if(error){
                        showNotification('can\'t unlink the customer from the issue: '+error,'danger','glyphicon glyphicon-tasks');
                    } else {
                        showNotification('customer '+checkbox.value+' doesn\'t has the issue', 'info', 'glyphicon glyphicon-tasks');
                    }
                });
            conn.release();
        });
    }
});

//======================================================================================================================
//files table

$('.add-file').on('click',function(e){
    e.preventDefault();
    let type = document.getElementById('file-type').options[document.getElementById('file-type').selectedIndex].value;
    let path = document.getElementById('file-path').value;
    connection.getConnection(function(err, conn) {
        if (err) {
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('INSERT INTO files (`issue_id`, `type`,`path` ) VALUES (?,?,?)',
            [document.getElementById('issueID').value,type,path],
            function (error) {
                if(error){
                    showNotification('can\'t add file: '+error,'danger','glyphicon glyphicon-tasks');
                } else {
                    showNotification('File has been Added', 'info', 'glyphicon glyphicon-tasks');
                    refreshFiles(document.getElementById('issueID').value);
                }
            });
        conn.release();
    });
    document.getElementById('file-path').value = '';
    $('#file-type').val('Savelog').selectpicker('refresh');
});

function refreshFiles(issueID){
    connection.getConnection(function(err, conn) {
        if (err) {
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT id,type,path FROM files WHERE issue_id = ?',[issueID],
            function (error,data) {
                if(error){
                    showNotification('can\'t get files: '+error,'danger','glyphicon glyphicon-tasks');
                } else {
                    let html= '';
                    $('#files-table-body').empty();
                    data.forEach(function(data){
                        html += '<tr><td>'+data.type+'</td>' +
                                '<td>'+data.path+'</td>' +
                                '<td class="delete-td text-center"><button type="button" class="btn btn-danger file-delete btn-xs" data-id="'+data.id+'" aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></td></tr>'
                    });
                    $('#files-table-body').append(html);
                }
            });
        conn.release();
    });
}


$('#files-table').delegate('.file-delete','click',function(e){
    e.preventDefault();
    let id = this.dataset.id;
    connection.getConnection(function(err, conn) {
        if (err) {
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('DELETE FROM files WHERE id = ? ',[id],
            function (error) {
                if(error){
                    showNotification('can\'t delete file: '+error,'danger','glyphicon glyphicon-tasks');
                } else {
                    showNotification('File deleted ','success','glyphicon glyphicon-tasks');
                    refreshFiles(document.getElementById('issueID').value);
                }
            });
        conn.release();
    });
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
                        $('#project_submit').click();
                    }
                });
            conn.release();
        });
    }


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
                document.getElementById('DBID').value = data[0].id;
                document.getElementById('work').value = data[0].work;
                document.getElementById('date').value = data[0].date;
                $('#area').val(data[0].area).selectpicker('refresh');
                document.getElementById('key').value = data[0].key;
                document.getElementById('defect').value = data[0].defect;
                document.getElementById('charm').value = data[0].charm;
                document.getElementById('status').value = data[0].status;
                document.getElementById('no_further_action').checked = data[0].no_further_action;
                getIssueBaseline(data[0].id,project_ID);
                $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
                $('#priority').val(data[0].priority).selectpicker('refresh');
                $('#messenger').val(data[0].messenger).selectpicker('refresh');
                document.getElementById('summary').value = data[0].summary;
                document.getElementById('description').value = data[0].description;
                document.getElementById('description_de').value = data[0].description_de;
                document.getElementById('solution').value = data[0].solution;
                document.getElementById('solution_de').value = data[0].solution_de;
                document.getElementById('c2c').value = data[0].c2c;
                $('#files-table-body').empty();
                refreshFiles(document.getElementById('issueID').value);
            }
            //for customers list
            conn.query('SELECT id,name FROM customers ' +
                ' INNER JOIN projects_customers as pc ON customers.id = pc.customer_id' +
                ' WHERE  ? ',[{project_id: project_ID}], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var html='';
                    $('.customer_list').empty();
                    data.forEach(function(data){
                        html += '<li>';
                        html += '<input type="checkbox" class="customers" data-id="'+data.id+'" id="'+data.name+'" ' +
                            '"name="customers" value="'+data.name+'"><label for="'+data.name+'">  '+data.name+'</label>';
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
            // action current + history
            updateAction(document.getElementById('issueID').value);

        });
        conn.release();
    });

    $('#first_issue').addClass('disabled');
    $('#previous_issue').addClass('disabled');
    $('#last_issue').removeClass('disabled');
    $('#next_issue').removeClass('disabled');
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
                document.getElementById('DBID').value = data[0].id;
                document.getElementById('work').value = data[0].work;
                document.getElementById('date').value = data[0].date;
                $('#area').val(data[0].area).selectpicker('refresh');
                document.getElementById('key').value = data[0].key;
                document.getElementById('defect').value = data[0].defect;
                document.getElementById('charm').value = data[0].charm;
                document.getElementById('status').value = data[0].status;
                document.getElementById('no_further_action').checked = data[0].no_further_action;
                getIssueBaseline(data[0].id,project_ID);
                $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
                $('#priority').val(data[0].priority).selectpicker('refresh');
                $('#messenger').val(data[0].messenger).selectpicker('refresh');
                document.getElementById('summary').value = data[0].summary;
                document.getElementById('description').value = data[0].description;
                document.getElementById('description_de').value = data[0].description_de;
                document.getElementById('solution').value = data[0].solution;
                document.getElementById('solution_de').value = data[0].solution_de;
                document.getElementById('c2c').value = data[0].c2c;
                $('#files-table-body').empty();
                refreshFiles(document.getElementById('issueID').value);
            }

            //for customers list
            conn.query('SELECT id,name FROM customers ' +
                ' INNER JOIN projects_customers as pc ON customers.id = pc.customer_id' +
                ' WHERE  ? ',[{project_id: project_ID}], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var html='';
                    $('.customer_list').empty();
                    data.forEach(function(data){
                        html += '<li>';
                        html += '<input type="checkbox" class="customers" data-id="'+data.id+'" id="'+data.name+'" ' +
                            '"name="customers" value="'+data.name+'"><label for="'+data.name+'">  '+data.name+'</label>';
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
            // action current + history
            updateAction(document.getElementById('issueID').value);

        });
        conn.release();
    });

    $('#last_issue').addClass('disabled');
    $('#next_issue').addClass('disabled');
    $('#first_issue').removeClass('disabled');
    $('#previous_issue').removeClass('disabled');
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
        conn.query('select * from issues where id = (select min(id) from issues where id > ? AND ? )LIMIT  1',[issueID,{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {

                document.getElementById('issueID').value = data[0].id;
                document.getElementById('form_type').value = 'update';
                document.getElementById('DBID').value = data[0].id;
                document.getElementById('work').value = data[0].work;
                document.getElementById('date').value = data[0].date;
                $('#area').val(data[0].area).selectpicker('refresh');
                document.getElementById('key').value = data[0].key;
                document.getElementById('defect').value = data[0].defect;
                document.getElementById('charm').value = data[0].charm;
                document.getElementById('status').value = data[0].status;
                document.getElementById('no_further_action').checked = data[0].no_further_action;
                getIssueBaseline(data[0].id,project_ID);
                $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
                $('#priority').val(data[0].priority).selectpicker('refresh');
                $('#messenger').val(data[0].messenger).selectpicker('refresh');
                document.getElementById('summary').value = data[0].summary;
                document.getElementById('description').value = data[0].description;
                document.getElementById('description_de').value = data[0].description_de;
                document.getElementById('solution').value = data[0].solution;
                document.getElementById('solution_de').value = data[0].solution_de;
                document.getElementById('c2c').value = data[0].c2c;
                $('#files-table-body').empty();
                refreshFiles(document.getElementById('issueID').value);
            }

            //for customers list
            conn.query('SELECT id,name FROM customers ' +
                ' INNER JOIN projects_customers as pc ON customers.id = pc.customer_id' +
                ' WHERE  ? ',[{project_id: project_ID}], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var html='';
                    $('.customer_list').empty();
                    data.forEach(function(data){
                        html += '<li>';
                        html += '<input type="checkbox" class="customers" data-id="'+data.id+'" id="'+data.name+'" ' +
                            '"name="customers" value="'+data.name+'"><label for="'+data.name+'">  '+data.name+'</label>';
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
            // action current + history
            updateAction(document.getElementById('issueID').value);
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
                if(document.getElementById('issueID').value == data[0].max_id){

                    $('#last_issue').addClass('disabled');
                    $('#next_issue').addClass('disabled');
                }
            }
        });

        conn.release();
    });

    $('#files-table-body').empty();
    refreshFiles(document.getElementById('issueID').value);
    $('#first_issue').removeClass('disabled');
    $('#previous_issue').removeClass('disabled');
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
        conn.query('select * from issues where id = (select max(id) from issues where id < ? AND ?) LIMIT  1',[issueID,{project_id: project_ID}], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {

                document.getElementById('issueID').value = data[0].id;
                document.getElementById('form_type').value = 'update';
                document.getElementById('DBID').value = data[0].id;
                document.getElementById('work').value = data[0].work;
                document.getElementById('date').value = data[0].date;
                $('#area').val(data[0].area).selectpicker('refresh');
                document.getElementById('key').value = data[0].key;
                document.getElementById('defect').value = data[0].defect;
                document.getElementById('charm').value = data[0].charm;
                document.getElementById('status').value = data[0].status;
                document.getElementById('no_further_action').checked = data[0].no_further_action;
                getIssueBaseline(data[0].id,project_ID);
                $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
                $('#priority').val(data[0].priority).selectpicker('refresh');
                $('#messenger').val(data[0].messenger).selectpicker('refresh');
                document.getElementById('summary').value = data[0].summary;
                document.getElementById('description').value = data[0].description;
                document.getElementById('description_de').value = data[0].description_de;
                document.getElementById('solution').value = data[0].solution;
                document.getElementById('solution_de').value = data[0].solution_de;
                document.getElementById('c2c').value = data[0].c2c;
                $('#files-table-body').empty();
                refreshFiles(document.getElementById('issueID').value);
            }
            //for customers list
            conn.query('SELECT id,name FROM customers ' +
                ' INNER JOIN projects_customers as pc ON customers.id = pc.customer_id' +
                ' WHERE  ? ',[{project_id: project_ID}], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var html='';
                    $('.customer_list').empty();
                    data.forEach(function(data){
                        html += '<li>';
                        html += '<input type="checkbox" class="customers" data-id="'+data.id+'" id="'+data.name+'" ' +
                            '"name="customers" value="'+data.name+'"><label for="'+data.name+'">  '+data.name+'</label>';
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
            // action current + history
            updateAction(document.getElementById('issueID').value);

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
                if(document.getElementById('issueID').value == data[0].min_id){
                    $('#first_issue').addClass('disabled');
                    $('#previous_issue').addClass('disabled');
                }
            }
        });
        conn.release();
    });


    $('#last_issue').removeClass('disabled');
    $('#next_issue').removeClass('disabled');
});


//======================================================================================================================
//search

//search btn
$('.search-btn').click(function(e){
    e.preventDefault();
    $('.search-div').empty();
    var dbid = document.getElementById('s_dbid').value;
    var defect = document.getElementById('s_defect').value ;
    var charm = document.getElementById('s_charm').value ;
    var desc = document.getElementById('s_desc').value ;
    var desc_de = document.getElementById('s_desc_de').value ;
    var customer = document.getElementById('s_customer').value;
    var summary = document.getElementById('s_summary').value;
    var status = document.getElementById('s_status').value;
    var open_issue = 0;
    var project_name =  document.getElementById('project_name');
    var project_ID = project_name.options[project_name.selectedIndex].value;
    var sql = [];
    if(document.getElementById('s_open_issues').checked === false) {
        open_issue = 1;
    }
    var final_sql = 'SELECT i.id,i.summary,i.no_further_action,i.charm,i.defect FROM issues AS i';
    if(customer){
        final_sql += ' JOIN issues_customers AS ic ON i.id = ic.issue_id JOIN customers on customers.id = ic.customer_id WHERE customers.name LIKE ? AND ';
        sql.push('%'+customer+'%');
    }else{
        final_sql += ' WHERE ';
    }
    if(dbid){
        final_sql += ' i.id = ? AND ';
        sql.push(dbid);
    }
    if(defect){
        final_sql += ' i.defect LIKE ? AND ';
        sql.push('%'+defect+'%');
    }
    if(charm){
        final_sql += ' i.charm LIKE ? AND ';
        sql.push('%'+charm+'%');
    }

    if(desc){
        final_sql += '  i.description LIKE ? AND ';
        sql.push('%'+desc+'%');
    }
    if(desc_de){
        final_sql += '  i.description_de LIKE ? AND ';
        sql.push('%'+desc_de+'%');
    }

    if(status){
        final_sql += '  i.status LIKE ? AND ';
        sql.push('%'+status+'%');
    }
    if(summary){
        final_sql += '  MATCH(i.summary) AGAINST(? IN NATURAL LANGUAGE MODE ) AND' ;
        sql.push('%'+summary+'%');
    }
    if(open_issue === 0){
        final_sql += ' ?  AND ';
        sql.push({no_further_action: '0'});
    }

    final_sql += ' ? ';
    sql.push({project_id: project_ID});

    if(!dbid && !status && !summary && !defect && !charm && !customer && !desc && !desc_de) {
        $('.search-ph').removeClass('hidden').addClass('show');

    } else {

        connection.getConnection(function (err, conn) { //make connection to DB
            if (err) { //error handling
                showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
                return;
            }
            conn.query(final_sql, sql, function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {

                    if (data.length == 0) {
                        $('.search-ph').removeClass('hidden').addClass('show');
                        $('#search-ph-msg').text('No Result returned from DataBase  ').addClass('text-danger');
                    } else {
                        $('.search-ph').removeClass('show').addClass('hidden');
                        for (let i = 0; i < data.length; i++) {
                            $('.search-div').append('<a class="search-result" data-nfa="' + data[i].no_further_action + '"' +
                                                    ' data-charm="'+data[i].charm+'" data-defect="'+data[i].defect+'" href="' + data[i].id + '"><li class="list-group-item"><h4 class="list-group-item-heading">' + data[i].id + '</h4> <p class="list-group-item-text">' + data[i].summary + '</p></li></a>');
                        }

                        $('.search-result').each(function (index, value){
                            var nfa = $(this).data("nfa");
                            var charm = $(this).data("charm");
                            var defect = $(this).data("defect");
                            var el = $(this);
                            var id = $(this).attr('href');
                            connection.getConnection(function (err, conn2) { //make connection to DB
                                if (err) { //error handling
                                    showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
                                    return;
                                }
                                conn2.query('SELECT * FROM actions WHERE issue_id = ? ', [id], function (error, data2) {
                                    if (error) {
                                        showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                                    } else {
                                        if(nfa == 1){
                                            el.find(">:first-child").addClass('list-group-item-success');
                                        } else if(data2.length < 1){
                                            el.find(">:first-child").addClass('list-group-item-danger');
                                        } else if(charm !== null || defect !== null){
                                            el.find(">:first-child").addClass('list-group-item-info');
                                        } else {
                                            el.find(">:first-child").addClass('list-group-item-warning');
                                        }
                                    }
                                });
                                conn2.release();
                            });

                        });
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
                document.getElementById('DBID').value = data[0].id;
                document.getElementById('work').value = data[0].work;
                document.getElementById('date').value = data[0].date;
                $('#area').val(data[0].area).selectpicker('refresh');
                document.getElementById('key').value = data[0].key;
                document.getElementById('defect').value = data[0].defect;
                document.getElementById('charm').value = data[0].charm;
                document.getElementById('status').value = data[0].status;
                document.getElementById('no_further_action').checked = data[0].no_further_action;
                getIssueBaseline(data[0].id,project_ID);
                $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
                $('#priority').val(data[0].priority).selectpicker('refresh');
                $('#messenger').val(data[0].messenger).selectpicker('refresh');
                document.getElementById('summary').value = data[0].summary;
                document.getElementById('description').value = data[0].description;
                document.getElementById('description_de').value = data[0].description_de;
                document.getElementById('solution').value = data[0].solution;
                document.getElementById('solution_de').value = data[0].solution_de;
                document.getElementById('c2c').value = data[0].c2c;
                showNotification('Issue loaded','success','glyphicon glyphicon-ok');
                $('#files-table-body').empty();
                refreshFiles(document.getElementById('issueID').value);
            }
            //for customers list
            conn.query('SELECT id,name FROM customers ' +
                ' INNER JOIN projects_customers as pc ON customers.id = pc.customer_id' +
                ' WHERE  ? ',[{project_id: project_ID}], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var html='';
                    $('.customer_list').empty();
                    data.forEach(function(data){
                        html += '<li>';
                        html += '<input type="checkbox" class="customers" data-id="'+data.id+'" id="'+data.name+'" ' +
                            '"name="customers" value="'+data.name+'"><label for="'+data.name+'">  '+data.name+'</label>';
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
            // action current + history
            updateAction(document.getElementById('issueID').value);
        });
        conn.release();
    });

});

//search reset btn
$('.search-reset-btn').click(function(e){
    e.preventDefault();
    document.getElementById('s_defect').value ='';
    document.getElementById('s_charm').value ='';
    document.getElementById('s_desc').value ='';
    document.getElementById('s_customer').value ='';
    document.getElementById('s_summary').value ='';
    document.getElementById('s_status').value ='';
    $('.search-ph').removeClass('hidden').addClass('show');
    $('#search-ph-msg').text(' Search result will be shown here  ').removeClass('text-danger');
    $('.search-result').remove();
});

//======================================================================================================================
//action

$('#new-action-btn').on('click',function(e){
    e.preventDefault();
    let issueID = document.getElementById('issueID').value;
    let desc = document.getElementById('new-action').value;
    let date = getDate();
    connection.getConnection(function (err, conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack, 'danger', 'glyphicon glyphicon-tasks');
            return;
        }
        conn.query("INSERT INTO actions (issue_id,description,date) VALUES (? , ? ,?)",[issueID,desc,date], function (error, data) {
            if (error) {
                showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                showNotification('Action inserted successfully', 'success', 'glyphicon glyphicon-tasks');
            }
            $('#new-action').val(' ');
        });
        conn.query('SELECT description,date FROM actions ' +
            ' WHERE ? ORDER BY id DESC',[{issue_id: document.getElementById('issueID').value}], function (error, data) {
            if (error) {
                showNotification('Error on actions:' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                document.getElementById('action-current').textContent = data[0].description;
                let list = '';
                $('#action-history').empty();
                data.forEach(function(data){
                    list += '<li class="list-group-item"><span class="badge">' + data.date + '</span>' + data.description + '</li>';
                });
                $('#action-history').append(list);
                $('#current-action').tab('show');
            }
        });
        conn.release();
    });
});


function updateAction(issue_id){
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT description,date FROM actions ' +
                    ' WHERE ? ORDER BY id DESC', [{issue_id}, '0'], function (error, data) {
            if (error) {
                showNotification('Error on actions:' + error, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                $('#action-current').empty();
                if(data.length > 0) {
                    
                    document.getElementById('action-current').textContent = data[0].description;
                } else {
                    document.getElementById('action-current').textContent = 'No Action Yet!';
                }
                let list = '';
                $('#action-history').empty();
                data.forEach(function (data) {
                    list += '<li class="list-group-item"><span class="badge">' + data.date + '</span>' + data.description + '</li>';
                });
                $('#action-history').append(list);
            }
        });
        conn.release();
    });
};

