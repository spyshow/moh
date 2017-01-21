

var electron = require('electron');
var ipc = electron.ipcRenderer;
var sql = require('mssql');
//======================================================================================================================
//Tooltips
$('[data-toggle="tooltip"]').tooltip();

//======================================================================================================================
//Tabs
$('#myTabs').find('a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
});

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

var charm = {
  user: 'test',
  password: '123456',
  server: 'ENG3',
  port: 1433,
  database: 'CharmNT_MR_User',
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
//customers [ok]

function getCustomersList(project_id) {
  var getCustomersList = new sql.Connection(config, function (error) {
    if (error) {
      showNotification('Error on connecting to get the list of customers:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(getCustomersList);
      request
        .input('project_id', sql.Int, project_id)
        .query('SELECT id,name FROM customers ' +
          ' INNER JOIN projects_customers as pc ON customers.id = pc.customer_id' +
          ' WHERE project_id = @project_id')
        .then(function (data) {
          var html = '';
          $('.customer_list').empty();
          data.forEach(function (data) {
            html += '<li>';
            html += '<input type="checkbox" class="customers" data-id="' + data.id + '" id="' + data.name + '" ' +
              '"name="customers" value="' + data.name + '"><label for="' + data.name + '">  ' + data.name + '</label>';
            html += '</li>';
          });
          $('.customer_list').append(html);
        }).catch(function (error) {
          showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
  });
}

function checkCustomers(issue_id) {
  // to check the selected customers
  var checkCustomers = new sql.Connection(config, function (error) {
    if (error) {
      showNotification('Error on connecting to check the customers:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(checkCustomers);
      request
        .input('issue_id', sql.Int, issue_id)
        .query('SELECT [id],[name] FROM [customers] ' +
               ' INNER JOIN issues_customers as ic ON customers.id = ic.customer_id' +
               ' WHERE issue_id = @issue_id ')
        .then(function (data) {
          data.forEach(function (data) {
            if (document.getElementById(data.name).dataset.id == data.id) {
              document.getElementById(data.name).setAttribute('checked', '');
            }
          });
        }).catch(function (error) {
          showNotification('Error selected customers :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
  });
}

//======================================================================================================================
//baseline [ok]

function getIssueBaseline(issue_id, project_id) {
  var name = '';
  var cd = '';

  var conn1 = new sql.Connection(config, function (err) {
    if (err) {
      showNotification('Error on connecting:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(conn1);
      request
        .input('issue_id', sql.Int, issue_id)
        .query('SELECT TOP 1 [id],[name],[cd] FROM [baselines] ' +
          'INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id]' +
          ' WHERE ib.[issue_id] = @issue_id ORDER BY ib.[baseline_id] DESC')
        .then(function (data) {
          if (data.length > 0) {
            console.log('found baseline');
            if (data[0].name === null) {
              name = ' ';
            } else {
              document.getElementById('baseline').value = data[0].name;
            }
            if (data[0].cd === null) {
              cd = ' ';
            } else {
              document.getElementById('cd').value = data[0].cd;
            }
            document.getElementById('baseline').dataset.id = data[0].id;
          } else {
            getNewBaseline(project_id);
          }
        }).catch(function (error) {
          showNotification('Error on baseline:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
  });
}

function getNewBaseline(project_id) {
  var name = '';
  var cd = '';
  var id = '';
  var conn2 = new sql.Connection(config, function (err) {
    if (err) {
      showNotification('error connecting for baseline: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(conn2);
      request
        .input('project_id', sql.VarChar, project_id)
        .query('SELECT TOP 1 [id],[name],[cd] FROM [baselines] ' +
          ' INNER JOIN [projects_baselines] as pb ON [baselines].[id] = pb.[baseline_id] ' +
          ' WHERE pb.[project_id] = @project_id ORDER BY pb.[baseline_id] DESC ')
        .then(function (data) {
          if (data === undefined) {
            name = '';
            cd = '';
            id = '';
          } else {
            name = data[0].name;
            cd = data[0].cd;
            id = data[0].id;
          }
          
          document.getElementById('baseline').value = name;
          document.getElementById('cd').value = cd;
          document.getElementById('baseline').dataset.id = id;
        }).catch(function (error) {
          showNotification('Error on baseline:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
  });
}

function deleteBaseline(issue_id, pre_id) {
  if(pre_id){
    var conn3 = new sql.Connection(config, function (err) {
      if (err) {
        showNotification('error connecting for baseline: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      } else {
        var request = new sql.Request(conn3);
        request
          .input('issue_id', sql.Int, issue_id)
          .input('pre_id', sql.Int, pre_id)
          .query('DELETE FROM [issues_baselines] WHERE [issues_baselines].[issue_id] = @issue_id AND [issues_baselines].[baseline_id] = @pre_id ')
          .then(function () {}).catch(function (error) {
            showNotification('Error on issues_baselines:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
          });
      }
    });
  }
}

function setBaseline(pre_id, name, cd, project_id, issue_id) {
  console.log('pre_id='+pre_id+' , name = '+name+', cd = '+cd+', pro_id = '+project_id+', issue_id = '+issue_id+'');
  if(name){
    var conn5 = new sql.Connection(config, function (err) {
      if (err) {
        showNotification('error connecting for baseline: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      } else {
        var request = new sql.Request(conn5);
        request
        .input('project_id',  project_id)
        .input('name', sql.NVarChar(100), name)
        .input('cd', sql.NVarChar(10), cd)
        .query('SELECT id,cd,name FROM baselines  '+
        ' INNER JOIN [projects_baselines] as pb ON [baselines].[id] = pb.[baseline_id] ' +
        ' WHERE pb.[project_id] = @project_id AND cd = @cd AND name = @name ORDER BY pb.[baseline_id] DESC ')
        .then(function (data) {
          console.log(data);
          if(data[0] !== undefined){
            if(pre_id){
              deleteBaseline(issue_id, pre_id);
            }
            var request2 = new sql.Request(conn5);
            request2
            .input('issue_id', sql.Int, issue_id)
            .input('baseline_id', sql.Int, data[0].id)
            .query('INSERT INTO [issues_baselines] ([issue_id],[baseline_id]) VALUES (@issue_id, @baseline_id);')
            .then(function (data) {
              showNotification('Baseline Updated', 'info', 'glyphicon glyphicon-tasks');
            }).catch(function (error) {
              showNotification('Error on issues_baselines: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
            });
          } else {
            var conn4 = new sql.Connection(config, function (err) {
              if (err) {
                showNotification('error connecting for baseline: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
              } else {

                var request = new sql.Request(conn4);
                request
                  .input('name', sql.NVarChar(100), name)
                  .input('cd', sql.NVarChar(10), cd)
                  .query('INSERT INTO [baselines] ([name],[cd]) VALUES (@name, @cd);SELECT SCOPE_IDENTITY() AS id;')
                  .then(function (data) {
                    var id = data[0].id;
                    if(pre_id){
                      deleteBaseline(issue_id, pre_id);
                    }
                    var request2 = new sql.Request(conn4);
                    request2
                    .input('issue_id', sql.Int, issue_id)
                    .input('baseline_id', sql.Int, id)
                    .query('INSERT INTO [issues_baselines] ([issue_id],[baseline_id]) VALUES (@issue_id, @baseline_id);')
                    .then(function (data) {
                      showNotification('Baseline Updated', 'info', 'glyphicon glyphicon-tasks');
                    }).catch(function (error) {
                      showNotification('Error on issues_baselines: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                    });
                    var request3 = new sql.Request(conn4);
                    request3
                      .input('project_id', sql.Int, project_id)
                      .input('baseline_id', sql.Int, id)
                      .query('INSERT INTO [projects_baselines] ([project_id], [baseline_id]) VALUES (@project_id, @baseline_id);')
                      .then(function (data) {
                        getIssueBaseline(issue_id, project_id);
                      }).catch(function (error) {
                        showNotification('Error on issues_baselines: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                      });
                  }).catch(function (error) {
                    showNotification('Error on baseline:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                  });
              }
            });
          }
        });
       } 
    });
  }
}

$('#baseline-submit').on("mousedown", function (e) {
  e.preventDefault();
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  var pre_id;
  if(document.getElementById('baseline').dataset.id){pre_id = document.getElementById('baseline').dataset.id;} else {pre_id = null;}
  var name = document.getElementById('baseline').value;
  var cd = document.getElementById('cd').value;
  var issue_id = document.getElementById('issueID').value;
  setBaseline(pre_id, name, cd, project_ID, issue_id);
  $('#baseline-submit,#baseline-cancel,#baseline-div').addClass('hidden');
  $('#baseline , #cd').blur();
  getIssueBaseline(issue_id, project_ID);
});

$('#baseline-cancel').on("mousedown", function (e) {
  e.preventDefault();
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  var issue_id = document.getElementById('issueID').value;
  getIssueBaseline(issue_id, project_ID);
  $('#baseline-submit,#baseline-cancel,#baseline-div').addClass('hidden');
  $('#baseline , #cd').blur();
});

$('#baseline , #cd').focus(function (e) {
  e.preventDefault();
  $('#baseline-submit,#baseline-cancel,#baseline-div').removeClass('hidden');

});

$('#baseline , #cd').blur(function (e) {
  setTimeout(function(){
    if($('#baseline').is(":focus")){

    } else if ($('#cd').is(":focus")){

    } else {
      e.preventDefault();
      var project_name = document.getElementById('project_name');
      var project_ID = project_name.options[project_name.selectedIndex].value;
      var issue_id = document.getElementById('issueID').value;
      getIssueBaseline(issue_id, project_ID);
      $('#baseline-submit,#baseline-cancel,#baseline-div').addClass('hidden');
    }
  },50);
  
});


//======================================================================================================================
//when page ready [ok]

$(document).ready(function () {
  var html = '<option> Loading... </option>';
  $('#project_name').html(html).selectpicker('refresh');
  $('#project_submit').addClass('disabled');
  // select all project names for the first screen
  $('#project_select').modal({
    show: true,
    backdrop: "static",
    keyboard: false
  }); // show modal which cannot escape

  sql.connect(config).then(function () {
    new sql.Request()
      .query('SELECT id,project_name,cpf_doc_id FROM projects')
      .then(function (data) {
        var project_list = ''; // variable to carry the options for the select
        data.forEach(function (data) {
          project_list += '<option value="' + data.id + '">' + data.project_name + '</option>'; //make an option for every project
        });
        $('#project_submit').removeClass('disabled');
        $('#project_name').html(project_list).selectpicker('refresh'); // put them in the select div and refresh the select to show the new values

      }).catch(function (error) {
        showNotification('Error on project:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });


  }).catch(function (error) {
    showNotification('error connecting: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });

  //change status , work and vsn when charm field changes.
  $('#charm').change(function(){
    sql.connect(charm).then(function () {
    new sql.Request()
      .input('id','MR_00'+document.getElementById('charm').value)
      .query('SELECT state_num as status,remain_name as work,real_version as vsn FROM Defect where id=@id')
      .then(function (data) {
        document.getElementById('work').value = data[0].work;
        document.getElementById('status').value = data[0].status;
        document.getElementById('vsn').value = data[0].vsn;
        $('#work').attr("disabled", "disabled");
        $('#status').attr("disabled", "disabled");
        $('#vsn').attr("disabled", "disabled");
      }).catch(function (error) {
        showNotification('Charm Number Error: Wrong Charm Number', 'danger', 'glyphicon glyphicon-tasks');
      });
    }).catch(function (error) {
      showNotification('error connecting: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    });
  });
});

ipc.on('load-project',function(){
  $('#project_select').modal('show');
});

ipc.on('refresh-projects', function () {
  var html = '<option> Loading... </option>';
  $('#project_name').html(html).selectpicker('refresh');
  $('#project_submit').addClass('disabled');
  // select all project names for the first screen
  $('#project_select').modal({
    show: true,
    backdrop: "static",
    keyboard: false
  }); // show modal which cannot escape

  sql.connect(config).then(function () {
    new sql.Request()
      .query('SELECT id,project_name,cpf_doc_id FROM projects')
      .then(function (data) {
        var project_list = ''; // variable to carry the options for the select
        data.forEach(function (data) {
          project_list += '<option value="' + data.id + '">' + data.project_name + '</option>'; //make an option for every project
        });
        $('#project_submit').removeClass('disabled');
        $('#project_name').html(project_list).selectpicker('refresh'); // put them in the select div and refresh the select to show the new values

      }).catch(function (error) {
        showNotification('Error on project:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });


  }).catch(function (error) {
    showNotification('error connecting: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });
});

//======================================================================================================================
//new and edit project [ok]

$('.project_new').click(function (e) {
  e.preventDefault();
  ipc.send('show-new-project');
});

$('#project_edit').click(function (e) {
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  e.preventDefault();
  ipc.send('show-edit-project', project_ID);
});

//======================================================================================================================
//selected project submit button [ok]

$('#project_submit').click(function () {
  setTimeout(function(){
      btn.prop('disabled', false);
    }, 1000);
  var issueID;
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  var project_title = project_name.options[project_name.selectedIndex].text;
  document.getElementById('projectID').value = project_title;
  getCustomersList(project_ID);
  var connection1 = new sql.Connection(config, function (err) {
    if (err) {
      showNotification('error connecting: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(connection1);
      request
        .input('project_id', sql.Int, project_ID)
        .query('SELECT TOP 1 [issues].[id],[issues].[dbid],[issues].[vsn],[issues].[project_id],[issues].[date],[issues].[work],[issues].[area],[issues].[key], ' +
          '[issues].[defect],[issues].[charm],[issues].[status],[issues].[no_further_action],' +
          '[issues].[cd],[issues].[reproducible],[issues].[priority],[issues].[messenger],[issues].[summary],' +
          '[issues].[description],[issues].[description_de],[issues].[solution],[issues].[solution_de],[issues].[c2c],[projects].[cpf_doc_id]' +
          ' FROM [issues] ' +
          ' INNER JOIN [test].[dbo].[projects] ON [projects].[id] = [issues].[project_id] ' +
          ' WHERE [issues].[project_id] = @project_id ORDER BY [issues].[id] DESC')
        .then(function (data) {
          if (data[0] === undefined) {
            console.log('new issue');
            $('#new_issue').click();
          } else {
            issueID = data[0].id;

            document.getElementById('cpf-doc-id').textContent = data[0].cpf_doc_id;
            document.getElementById('issueID').value = data[0].id;
            document.getElementById('form_type').value = 'update';
            document.getElementById('dbid').value = data[0].dbid;
            document.getElementById('vsn').value = data[0].vsn;
            document.getElementById('work').value = data[0].work;
            document.getElementById('date').value = data[0].date;
            $('#area').val(data[0].area).selectpicker('refresh');
            document.getElementById('key').value = data[0].key;
            document.getElementById('defect').value = data[0].defect;
            document.getElementById('charm').value = data[0].charm;
            document.getElementById('status').value = data[0].status;
            document.getElementById('no_further_action').checked = data[0].no_further_action;
            getIssueBaseline(data[0].id, project_ID);
            $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
            $('#priority').val(data[0].priority).selectpicker('refresh');
            $('#messenger').val(data[0].messenger).selectpicker('refresh');
            document.getElementById('summary').value = data[0].summary;
            document.getElementById('description').value = data[0].description;
            document.getElementById('description_de').value = data[0].description_de;
            document.getElementById('solution').value = data[0].solution;
            document.getElementById('solution_de').value = data[0].solution_de;
            document.getElementById('c2c').value = data[0].c2c;
            if($('#charm').val().length !== 0){
              $('#work,#vsn,#status').prop('disabled', true);
            } else {
              $('#work,#vsn,#status').prop('disabled', false);
            }

          }
          // customer list
        }).then(function () {
          checkCustomers(issueID);
          // action current + history
          updateAction(issueID);
          refreshFiles(issueID);
          $('.add-file').prop('disabled', false);
        }).catch(function (error) {
          showNotification('Error :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
  });
  //for cpf all
  var conn2 = new sql.Connection(config, function (error) {
    if (error) {
        showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(conn2);
      request
      .input('project_id', sql.Int, project_ID)
      .query('SELECT COUNT(issues.id) AS issues_all FROM issues ' +
        ' WHERE  project_id = @project_id')
      .then(function (data) {
        $('#cpf-all').text(data[0].issues_all);
      }).catch(function (error) {
        showNotification('Error :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
    }
  });
  //for cpf open
  var conn1 = new sql.Connection(config, function (error) {
    if (error) {
        showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(conn1);
      request
      .input('project_id', sql.Int, project_ID)
      .input('no_further_action', sql.SmallInt, 0)
      .query('SELECT COUNT(issues.id) AS issues_open FROM issues ' +
        ' WHERE project_id = @project_id AND no_further_action = @no_further_action ')
      .then(function (data) {
        document.getElementById('cpf-open').textContent = data[0].issues_open;
      }).catch(function (error) {
        showNotification('Error :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
    }
  });
  
    

  $('#cancel').addClass('disabled');
  $('#last_issue').addClass('disabled');
  $('#next_issue').addClass('disabled');
});

//======================================================================================================================
//submit or update issue button [ok]

$('#submit').on('click',function (e) {
  setTimeout(function(){
      btn.prop('disabled', false);
    }, 1000);
  e.preventDefault();
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  var issueID = document.getElementById('issueID').value;
  var dbid = document.getElementById('dbid').value;
  var work = (document.getElementById('work').value ? document.getElementById('work').value : '');
  var date = document.getElementById('date').value;
  var area = $('#area').find("option:selected").val();
  var key = (document.getElementById('key').value ? document.getElementById('key').value : null);
  var defect = (document.getElementById('defect').value ? document.getElementById('defect').value : null);
  var charm = (document.getElementById('charm').value ? document.getElementById('charm').value : null);
  var status = (document.getElementById('status').value ? document.getElementById('status').value : null);
  if (!document.getElementById('no_further_action').checked) {
    var no_further_action = 0;
  } else {
    var no_further_action = 1;
  }
  var reproducible = $('#reproducible').find("option:selected").val();
  var priority = $('#priority').find("option:selected").val();
  var messenger = $('#messenger').find("option:selected").val();
  var summary = (document.getElementById('summary').value ? document.getElementById('summary').value : '');
  var description = (document.getElementById('description').value ? document.getElementById('description').value : '');
  var description_de = (document.getElementById('description_de').value ? document.getElementById('description_de').value : '');
  var solution = (document.getElementById('solution').value ? document.getElementById('solution').value : '');
  var solution_de = (document.getElementById('solution_de').value ? document.getElementById('solution_de').value : '');
  var c2c = (document.getElementById('c2c').value ? document.getElementById('c2c').value : '');
  var vsn = (document.getElementById('vsn').value ? document.getElementById('vsn').value : '');
  

    sql.connect(config).then(function () {
      new sql.Request()
        .input('work',  work)
        .input('area',  area)
        .input('key',  key)
        .input('dbid',  dbid)
        .input('vsn',  vsn)
        .input('defect',  defect)
        .input('charm',  charm)
        .input('status',  status)
        .input('no_further_action', no_further_action)
        .input('reproducible',  reproducible)
        .input('priority',  priority)
        .input('messenger', messenger)
        .input('summary',  summary)
        .input('description', description)
        .input('description_de', description_de)
        .input('solution', solution)
        .input('solution_de', solution_de)
        .input('c2c',  c2c)
        .input('id', issueID)
        .query('UPDATE issues SET work = @work ,dbid = @dbid, area = @area, [key] = @key, defect= @defect,charm =@charm,' +
          'status = @status,no_further_action = @no_further_action,reproducible = @reproducible,priority = @priority,' +
          'messenger = @messenger,summary = @summary, vsn = @vsn , description = @description, description_de = @description_de,' +
          'solution = @solution , solution_de = @solution_de, c2c = @c2c WHERE id = @id')
        .then(function (data) {
          showNotification('Data updated in the database', 'success', 'glyphicon glyphicon-tasks');
          $('.nav-btn').removeClass('disabled');
          $('#cancel').addClass('disabled');
          $('#new_issue').removeClass('disabled');

        }).catch(function (error) {
          showNotification('Error on updating:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });


    }).catch(function (error) {
      showNotification('error connecting for update: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    });

    var conn2 = new sql.Connection(config, function (error) {
    if (error) {
        showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(conn2);
      request
      .input('project_id', sql.Int, project_ID)
      .query('SELECT COUNT(issues.id) AS issues_all FROM issues ' +
        ' WHERE  project_id = @project_id')
      .then(function (data) {
        $('#cpf-all').text(data[0].issues_all);
      }).catch(function (error) {
        showNotification('Error :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
    }
  });
  //for cpf open
  var conn1 = new sql.Connection(config, function (error) {
    if (error) {
        showNotification('error connecting for selecting ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(conn1);
      request
      .input('project_id', sql.Int, project_ID)
      .input('no_further_action', sql.SmallInt, 0)
      .query('SELECT COUNT(issues.id) AS issues_open FROM issues ' +
        ' WHERE project_id = @project_id AND no_further_action = @no_further_action ')
      .then(function (data) {
        document.getElementById('cpf-open').textContent = data[0].issues_open;
      }).catch(function (error) {
        showNotification('Error :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
    }
  });
});

//======================================================================================================================
//new issue button [ok]

$('#new_issue').click(function (e) {
  setTimeout(function(){
      btn.prop('disabled', false);
    }, 1000);
  e.preventDefault();
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  $('#work,#vsn,#status').prop('disabled', false);
  var conn4 = new sql.Connection(config, function (err) {
    if (err) {
      showNotification('error connecting for inserting issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(conn4);
      request.multiple = true;
      request
        .input('date', sql.NVarChar(10), getDate())
        .input('project_id', sql.Int, project_ID)
        .query('SELECT TOP 1 dbid From issues WHERE project_id = @project_id ORDER BY id desc;'+
               ' INSERT INTO [issues] ([date],[project_id]) VALUES (@date , @project_id);SELECT SCOPE_IDENTITY() AS id;')
        .then(function (data) {
          if(data[0][0] !== undefined){
            document.getElementById('dbid').value = data[0][0].dbid+1;
          } else {
            document.getElementById('dbid').value = 1;
          } 
          document.getElementById('issueID').value = data[1][0].id;
        }).catch(function (error) {
          showNotification('Error on inseting issue:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
  });
  //for customers list
  getCustomersList(project_ID);
  $('#action-current').empty();
  $('#action-history').empty();
  $('#new-action').val(" ").attr('disabled', false);
  $('#new-action-btn').removeClass("disabled");
  $('.add-file').removeClass('disabled');
  document.getElementById('form_type').value = 'insert';
  document.getElementById('work').value = 'CUT-Team';
  document.getElementById('date').value = getDate();
  $('#area').val(1).selectpicker('refresh');
  document.getElementById('key').value = '';
  document.getElementById('vsn').value = '';
  document.getElementById('defect').value = '';
  document.getElementById('charm').value = '';
  document.getElementById('status').value = '';
  document.getElementById('no_further_action').checked = 0;
  getNewBaseline(project_ID);
  $('#reproducible').val(1).selectpicker('refresh');
  $('#priority').val(1).selectpicker('refresh');
  $('#messenger').val(1).selectpicker('refresh');
  document.getElementById('summary').value = '';
  document.getElementById('description').value = '';
  document.getElementById('description_de').value = '';
  document.getElementById('solution').value = '';
  document.getElementById('solution_de').value = '';
  document.getElementById('c2c').value = '';
  $('#action-history').empty();
  $('#action-current').text('No Action Yet!');
  $('.add-file').prop('disabled', false);
  $('.nav-btn').addClass('disabled');
  $('#new_issue').addClass('disabled');
  $('#cancel').removeClass('disabled');
  $('#files-table-body').empty();
});

//======================================================================================================================
//cancel btn [ok]

$('#cancel').on('click', function (e) {

  e.preventDefault();
  var issueID = document.getElementById('issueID').value;

  if (issueID) {
    $('#files-table-body').empty();
    $('.nav-btn').removeClass('disabled');
    $('#new_issue').removeClass('disabled');
    $('#cancel').addClass('disabled');
    $('#action-history').empty();
    $('#new-action').val(" ").attr('disabled', false);
    $('#new-action-btn').removeClass("disabled");
    $('.customer_list').empty();
    $('.add-file').prop('disabled', false);
    sql.connect(config).then(function () {
      new sql.Request()
        .input('issue_id', sql.Int, issueID)
        .query('DELETE FROM issues WHERE id = @issue_id')
        .then(function () {
          $('#project_submit').click();
        }).catch(function (error) {
          showNotification('Error on deleting issue:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }).catch(function (error) {
      showNotification('error connecting for deleting issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    });
  }
});

//======================================================================================================================
//update customer database on click [ok]

$('.customer_list').delegate('.customers', 'click', function () {

  if ($(this).is(":checked") === true) {
    let id = this.dataset.id;
    let checkbox = this;

    sql.connect(config).then(function () {
      new sql.Request()
        .input('issue_id', sql.Int, document.getElementById('issueID').value)
        .input('customer_id', sql.Int, checkbox.dataset.id)
        .query('INSERT INTO [issues_customers] ([issue_id], [customer_id]) VALUES (@issue_id , @customer_id)')
        .then(function () {
          showNotification('customer ' + checkbox.value + ' has the issue', 'info', 'glyphicon glyphicon-tasks');
        }).catch(function (error) {
          showNotification('can\'t link the customer to the issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }).catch(function (error) {
      showNotification('error connecting for customer update: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    });

  } else if ($(this).is(":checked") === false) {

    let checkbox = this;

    sql.connect(config).then(function () {
      new sql.Request()
        .input('issue_id', sql.Int, document.getElementById('issueID').value)
        .input('customer_id', sql.Int, checkbox.dataset.id)
        .query('DELETE FROM [issues_customers] WHERE [issue_id] = @issue_id AND [customer_ID] = @customer_id')
        .then(function () {
          showNotification('customer ' + checkbox.value + ' doesn\'t has the issue', 'info', 'glyphicon glyphicon-tasks');
        }).catch(function (error) {
          showNotification('can\'t unlink the customer from the issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }).catch(function (error) {
      showNotification('error connecting for customer update: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    });
  }
});

//======================================================================================================================
//files table [ok]

$('.add-file').on('click', function (e) {
  e.preventDefault();
  let type = document.getElementById('file-type').options[document.getElementById('file-type').selectedIndex].value;
  let path = document.getElementById('file-path').value;

  sql.connect(config).then(function () {
    new sql.Request()
      .input('issue_id', sql.Int, document.getElementById('issueID').value)
      .input('type', type)
      .input('path', path)
      .query('INSERT INTO files ([issue_id],[type],[path] ) VALUES (@issue_id,@type,@path)')
      .then(function (data) {
        showNotification('File has been Added', 'info', 'glyphicon glyphicon-tasks');
        refreshFiles(document.getElementById('issueID').value);
      }).catch(function (error) {
        showNotification('can\'t add file: ' + error, 'danger', 'glyphicon glyphicon-tasks');
      });
  }).catch(function (error) {
    showNotification('error connecting for inserting issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });

  document.getElementById('file-path').value = '';
  $('#file-type').val('Savelog').selectpicker('refresh');
});

function refreshFiles(issueID) {

  var conn4 = new sql.Connection(config, function (err) {
    if (err) {
      showNotification('error connecting for geting files: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {

      var request = new sql.Request(conn4);
      request
        .input('issue_id', issueID)
        .query('SELECT [id],[type],[path] FROM [files] WHERE [issue_id] = @issue_id')
        .then(function (data) {
          let html = '';
          $('#files-table-body').empty();
          data.forEach(function (data) {
            html += '<tr><td>' + data.type + '</td>' +
              '<td>' + data.path + '</td>' +
              '<td class="delete-td text-center"><button type="button" class="btn btn-danger file-delete btn-xs" data-id="' + data.id + '" aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></td></tr>';
          });
          $('#files-table-body').append(html);
        }).catch(function (error) {
          showNotification('can\'t get files: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
  });
}

$('#files-table').delegate('.file-delete', 'click', function (e) {
  e.preventDefault();
  let id = this.dataset.id;

  sql.connect(config).then(function () {
    new sql.Request()
      .input('id', sql.Int, id)
      .query('DELETE FROM [files] WHERE [id] = @id')
      .then(function (data) {
        showNotification('File deleted ', 'success', 'glyphicon glyphicon-tasks');
        refreshFiles(document.getElementById('issueID').value);
      }).catch(function (error) {
        showNotification('can\'t delete file: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
  }).catch(function (error) {
    showNotification('error connecting for deleting files: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });
});

//======================================================================================================================
//delete button

$('#delete_btn').click(function (e) {
  e.preventDefault();
  $('#confirm').modal({
    show: true,
    backdrop: 'static',
    keyboard: false
  });
});

$('#delete_issue').click(function (e) {
  e.preventDefault();
  var issueID = document.getElementById('issueID').value;

  if (issueID) {

    sql.connect(config).then(function () {
      new sql.Request()
        .input('issue_id', sql.Int, issueID)
        .query('DELETE FROM issues WHERE id = @issue_id')
        .then(function (data) {
          showNotification('Issue Deleted from the database', 'success', 'glyphicon glyphicon-tasks');
          $('#project_submit').click();
        }).catch(function (error) {
          showNotification('can\'t delete the issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }).catch(function (error) {
      showNotification('error connecting for delete issue : ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    });
  }
});

//======================================================================================================================
//issues navigation buttons [ok]

//first issue
$('#first_issue').click(function () {
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  
  getCustomersList(project_ID);
  sql.connect(config).then(function () {
    new sql.Request()
      .input('project_id', sql.Int, project_ID)
      .query('SELECT TOP 1 * FROM [issues] WHERE project_id = @project_id ORDER BY id ASC')
      .then(function (data) {
        issueID = data[0].id;
        document.getElementById('issueID').value = data[0].id;
        document.getElementById('form_type').value = 'update';
        document.getElementById('dbid').value = data[0].dbid;
        document.getElementById('work').value = data[0].work;
        document.getElementById('vsn').value = data[0].vsn;
        document.getElementById('date').value = data[0].date;
        $('#area').val(data[0].area).selectpicker('refresh');
        document.getElementById('key').value = data[0].key;
        document.getElementById('defect').value = data[0].defect;
        document.getElementById('charm').value = data[0].charm;
        document.getElementById('status').value = data[0].status;
        document.getElementById('no_further_action').checked = data[0].no_further_action;
        getIssueBaseline(data[0].id, project_ID);
        $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
        $('#priority').val(data[0].priority).selectpicker('refresh');
        $('#messenger').val(data[0].messenger).selectpicker('refresh');
        document.getElementById('summary').value = data[0].summary;
        document.getElementById('description').value = data[0].description;
        document.getElementById('description_de').value = data[0].description_de;
        document.getElementById('solution').value = data[0].solution;
        document.getElementById('solution_de').value = data[0].solution_de;
        document.getElementById('c2c').value = data[0].c2c;
        if($('#charm').val().length !== 0){
            $('#work,#vsn,#status').prop('disabled', true);
          } else {
            $('#work,#vsn,#status').prop('disabled', false);
          }
        // customer list
        checkCustomers(issueID);
        // action current + history
        updateAction(document.getElementById('issueID').value);
        // update file list 
        $('#files-table-body').empty();
        refreshFiles(document.getElementById('issueID').value);
      });
  }).catch(function (error) {
    showNotification('Error connecting for first issue :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });

  $('#first_issue').addClass('disabled');
  $('#previous_issue').addClass('disabled');
  $('#last_issue').removeClass('disabled');
  $('#next_issue').removeClass('disabled');
});

//last issue
$('#last_issue').click(function () {
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  getCustomersList(project_ID);
  sql.connect(config).then(function () {
    new sql.Request()
      .input('project_id', sql.Int, project_ID)
      .query('SELECT TOP 1 * FROM [issues] WHERE project_id = @project_id ORDER BY id DESC')
      .then(function (data) {
        issueID = data[0].id;
        document.getElementById('issueID').value = data[0].id;
        document.getElementById('form_type').value = 'update';
        document.getElementById('dbid').value = data[0].dbid;
        document.getElementById('work').value = data[0].work;
        document.getElementById('vsn').value = data[0].vsn;
        document.getElementById('date').value = data[0].date;
        $('#area').val(data[0].area).selectpicker('refresh');
        document.getElementById('key').value = data[0].key;
        document.getElementById('defect').value = data[0].defect;
        document.getElementById('charm').value = data[0].charm;
        document.getElementById('status').value = data[0].status;
        document.getElementById('no_further_action').checked = data[0].no_further_action;
        getIssueBaseline(data[0].id, project_ID);
        $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
        $('#priority').val(data[0].priority).selectpicker('refresh');
        $('#messenger').val(data[0].messenger).selectpicker('refresh');
        document.getElementById('summary').value = data[0].summary;
        document.getElementById('description').value = data[0].description;
        document.getElementById('description_de').value = data[0].description_de;
        document.getElementById('solution').value = data[0].solution;
        document.getElementById('solution_de').value = data[0].solution_de;
        document.getElementById('c2c').value = data[0].c2c;
        if($('#charm').val().length !== 0){
            $('#work,#vsn,#status').prop('disabled', true);
          } else {
            $('#work,#vsn,#status').prop('disabled', false);
          }
        // customer list
        checkCustomers(issueID);
        // action current + history
        updateAction(document.getElementById('issueID').value);
        // update file list 
        $('#files-table-body').empty();
        refreshFiles(document.getElementById('issueID').value);
      });
  }).catch(function (error) {
    showNotification('Error connecting for first issue :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });
  $('#files-table-body').empty();
  refreshFiles(document.getElementById('issueID').value);
  $('#last_issue').addClass('disabled');
  $('#next_issue').addClass('disabled');
  $('#first_issue').removeClass('disabled');
  $('#previous_issue').removeClass('disabled');
});

//next issue
$('#next_issue').click(function () {
  var issueID = document.getElementById('issueID').value;
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  getCustomersList(project_ID);
  var connect1 = new sql.Connection(config, function (err) {
    if (err) {
      showNotification('error connecting for next issue : ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(connect1);
      request.input('issue_id', sql.Int, issueID)
        .input('project_id', sql.Int, project_ID)
        .query('SELECT TOP 1 * FROM [issues] WHERE [id] = (SELECT min([id]) FROM [issues] WHERE [id] > @issue_id AND project_id = @project_id )')
        .then(function (data) {
          issueID = data[0].id;
          document.getElementById('issueID').value = data[0].id;
          document.getElementById('form_type').value = 'update';
          document.getElementById('dbid').value = data[0].dbid;
          document.getElementById('work').value = data[0].work;
          document.getElementById('vsn').value = data[0].vsn;
          document.getElementById('date').value = data[0].date;
          $('#area').val(data[0].area).selectpicker('refresh');
          document.getElementById('key').value = data[0].key;
          document.getElementById('defect').value = data[0].defect;
          document.getElementById('charm').value = data[0].charm;
          document.getElementById('status').value = data[0].status;
          document.getElementById('no_further_action').checked = data[0].no_further_action;
          getIssueBaseline(data[0].id, project_ID);
          $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
          $('#priority').val(data[0].priority).selectpicker('refresh');
          $('#messenger').val(data[0].messenger).selectpicker('refresh');
          document.getElementById('summary').value = data[0].summary;
          document.getElementById('description').value = data[0].description;
          document.getElementById('description_de').value = data[0].description_de;
          document.getElementById('solution').value = data[0].solution;
          document.getElementById('solution_de').value = data[0].solution_de;
          document.getElementById('c2c').value = data[0].c2c;
          if($('#charm').val().length !== 0){
            $('#work,#vsn,#status').prop('disabled', true);
          } else {
            $('#work,#vsn,#status').prop('disabled', false);
          }
          // customer list
          checkCustomers(issueID);
          // action current + history
          updateAction(document.getElementById('issueID').value);
          // update file list 
          $('#files-table-body').empty();
          refreshFiles(document.getElementById('issueID').value);
        }).catch(function (error) {
          showNotification('can\'t move to the next issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
    // check if issue is the last issue
    var request = new sql.Request(connect1);
    request
      .input('project_id', sql.Int, project_ID)
      .query('select MIN(id) AS min_id, MAX(id) AS max_id from issues where project_id = @project_id')
      .then(function (data) {
        if (document.getElementById('issueID').value == data[0].max_id) {

          $('#last_issue').addClass('disabled');
          $('#next_issue').addClass('disabled');
        }
      }).catch(function (error) {
        showNotification('error checking if issue is the last issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });

  });

  $('#first_issue').removeClass('disabled');
  $('#previous_issue').removeClass('disabled');
});

//previous issue
$('#previous_issue').click(function () {
  var issueID = document.getElementById('issueID').value;
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  getCustomersList(project_ID);
  var connect1 = new sql.Connection(config, function (err) {
    if (err) {
      showNotification('error connecting for next issue : ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(connect1);
      request.input('issue_id', sql.Int, issueID)
        .input('project_id', sql.Int, project_ID)
        .query('SELECT TOP 1 * FROM [issues] WHERE [id] = (SELECT max([id]) FROM [issues] WHERE [id] < @issue_id AND [project_id] = @project_id )')
        .then(function (data) {
          issueID = data[0].id;
          document.getElementById('issueID').value = data[0].id;
          document.getElementById('form_type').value = 'update';
          document.getElementById('dbid').value = data[0].dbid;
          document.getElementById('work').value = data[0].work;
          document.getElementById('vsn').value = data[0].vsn;
          document.getElementById('date').value = data[0].date;
          $('#area').val(data[0].area).selectpicker('refresh');
          document.getElementById('key').value = data[0].key;
          document.getElementById('defect').value = data[0].defect;
          document.getElementById('charm').value = data[0].charm;
          document.getElementById('status').value = data[0].status;
          document.getElementById('no_further_action').checked = data[0].no_further_action;
          getIssueBaseline(data[0].id, project_ID);
          $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
          $('#priority').val(data[0].priority).selectpicker('refresh');
          $('#messenger').val(data[0].messenger).selectpicker('refresh');
          document.getElementById('summary').value = data[0].summary;
          document.getElementById('description').value = data[0].description;
          document.getElementById('description_de').value = data[0].description_de;
          document.getElementById('solution').value = data[0].solution;
          document.getElementById('solution_de').value = data[0].solution_de;
          document.getElementById('c2c').value = data[0].c2c;
          if($('#charm').val().length !== 0){
            $('#work,#vsn,#status').prop('disabled', true);
          } else {
            $('#work,#vsn,#status').prop('disabled', false);
          }
          // customer list
          checkCustomers(issueID);
          // action current + history
          updateAction(document.getElementById('issueID').value);
          $('#files-table-body').empty();
          refreshFiles(document.getElementById('issueID').value);
        }).catch(function (error) {
          showNotification('can\'t move to the next issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
      // check if issue is the last issue
      var request = new sql.Request(connect1);
      request
        .input('project_id', sql.Int, project_ID)
        .query('select MIN(id) AS min_id, MAX(id) AS max_id from issues where project_id = @project_id')
        .then(function (data) {
          if (document.getElementById('issueID').value == data[0].min_id) {
            $('#first_issue').addClass('disabled');
            $('#previous_issue').addClass('disabled');
          }
        }).catch(function (error) {
          showNotification('error checking if issue is the last issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
  });

  $('#last_issue').removeClass('disabled');
  $('#next_issue').removeClass('disabled');
});

//======================================================================================================================
//search [ok]

//search btn
$('.search-btn').click(function (e) {
  e.preventDefault();
  $('.search-div').empty();
  var dbid = document.getElementById('s_dbid').value;
  var defect = document.getElementById('s_defect').value;
  var charm = document.getElementById('s_charm').value;
  var desc = document.getElementById('s_desc').value;
  var desc_de = document.getElementById('s_desc_de').value;
  var customer = document.getElementById('s_customer').value;
  var summary = document.getElementById('s_summary').value;
  var status = document.getElementById('s_status').value;
  var open_issue = 0;
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  if (document.getElementById('s_open_issues').checked === false) {
    open_issue = 1;
  }

  sql.connect(config).then(function () {
    var req = new sql.Request();
    //making the sql statment

    var final_sql = 'SELECT [issues].[id],[issues].[dbid],[issues].[summary],[issues].[no_further_action],[issues].[charm],[issues].[defect] FROM [issues]';
    if (customer) {
      final_sql += ' JOIN [issues_customers] ON [issues].[id]= [issues_customers].[issue_id] JOIN [customers] on [customers].[id] = [issues_customers].[customer_id] WHERE [customers].[name] LIKE @customer AND ';
      req.input('customer', sql.VarChar(50), '%' + customer + '%');
    } else {
      final_sql += ' WHERE ';
    }
    if (dbid) {
      final_sql += ' [issues].[dbid] = @dbid AND ';
      req.input('dbid', dbid);
    }
    if (defect) {
      final_sql += ' [issues].[defect] = @defect AND ';
      req.input('defect', defect );
    }
    if (charm) {
      final_sql += ' [issues].[charm] = @charm AND ';
      req.input('charm', charm);
    }

    if (desc) {
      final_sql += '  [issues].[description] LIKE @desc AND ';
      req.input('desc', sql.NVarChar(sql.MAX), '%' + desc + '%');
    }
    if (desc_de) {
      final_sql += '  [issues].[description_de] LIKE @desc_de AND ';
      req.input('desc_de', sql.NVarChar(sql.MAX), '%' + desc_de + '%');
    }

    if (status) {
      final_sql += '  [issues].[status] LIKE @status AND ';
      req.input('status', '%' + status + '%');
    }
    if (summary) {
      final_sql += '  [issues].[summary] LIKE @summary AND';
      req.input('summary', sql.NVarChar(sql.MAX), '%' + summary + '%');
    }
    if (open_issue === 0) {
      final_sql += ' [issues].[no_further_action] = @no_further_action AND ';
      req.input('no_further_action', sql.Int, 0);
    }

    final_sql += ' project_id = @project_id ';
    req.input('project_id', sql.Int, project_ID);

    if (!dbid && !status && !summary && !defect && !charm && !customer && !desc && !desc_de) {
      $('.search-ph').removeClass('hidden').addClass('show');

    } else {
      
      req.query(final_sql)
        .then(function (data) {
          
          if (data.length == 0) {
            $('.search-ph').removeClass('hidden').addClass('show');
            $('#search-ph-msg').text('No Result returned from DataBase  ').addClass('text-danger');
          } else {
            $('.search-ph').removeClass('show').addClass('hidden');
            for (let i = 0; i < data.length; i++) {
              var charm = (data[i].charm) ? data[i].charm : 'null';
              var defect =   (data[i].defect) ? data[i].defect : 'null';
              var summary = (data[i].summary) ? data[i].summary : 'null';
              $('.search-div').append('<a class="search-result" data-nfa="' + data[i].no_further_action + '"' +
                ' data-charm="' + charm + '" data-defect="' + defect + '" href="' + data[i].id + '"><li class="list-group-item animated fadeInDown"><h4 class="list-group-item-heading">' + data[i].dbid + '</h4> <p class="list-group-item-text">' + summary + '</p></li></a>');
            }

            $('.search-result').each(function (index, value) {
              var nfa = $(this).data("nfa");
              var charm = $(this).data("charm");
              var defect = $(this).data("defect");
              var el = $(this);
              var id = $(this).attr('href');
              var conn4 = new sql.Connection(config, function (err) {
                if (err) {
                  showNotification('error connecting for geting files: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                  var request = new sql.Request(conn4);
                  request
                    .input('issue_id', sql.Int, id)
                    .query('SELECT * FROM actions WHERE issue_id = @issue_id')
                    .then(function (data2) {
                      if (nfa == 1) {
                        el.find(">:first-child").addClass('list-group-item-success');
                      } else if (data2.length < 1) {
                        el.find(">:first-child").addClass('list-group-item-danger');
                      } else if (charm !== null || defect !== null) {
                        el.find(">:first-child").addClass('list-group-item-info');
                      } else {
                        el.find(">:first-child").addClass('list-group-item-warning');
                      }
                    }).catch(function (error) {
                      showNotification('can\'t select from action: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                    });
                }
              });


            });
          }
        }).catch(function (error) {
          showNotification('can\'t search: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
  }).catch(function (error) {
    showNotification('error connecting for search : ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });

});

//search result links
$('.s_list').delegate('.search-result', 'click', function (e) {
  e.preventDefault();
  var id = parseInt($(this).attr('href'));
  var project_name = document.getElementById('project_name');
  var project_ID = parseInt(project_name.options[project_name.selectedIndex].value);
  getCustomersList(project_ID);
  sql.connect(config).then(function () {
    new sql.Request()
      .input('id', sql.Int, id)
      .input('project_id', sql.Int, project_ID)
      .query('SELECT * FROM issues WHERE id = @id; ')
      .then(function (data) {
        var issueID = data[0].id;
        document.getElementById('issueID').value = data[0].id;
        document.getElementById('form_type').value = 'update';
        document.getElementById('dbid').value = data[0].dbid;
        document.getElementById('work').value = data[0].work;
        document.getElementById('date').value = data[0].date;
        $('#area').val(data[0].area).selectpicker('refresh');
        document.getElementById('key').value = data[0].key;
        document.getElementById('vsn').value = data[0].vsn;
        document.getElementById('defect').value = data[0].defect;
        document.getElementById('charm').value = data[0].charm;
        document.getElementById('status').value = data[0].status;
        document.getElementById('no_further_action').checked = data[0].no_further_action;
        getIssueBaseline(data[0].id, project_ID);
        $('#reproducible').val(data[0].reproducible).selectpicker('refresh');
        $('#priority').val(data[0].priority).selectpicker('refresh');
        $('#messenger').val(data[0].messenger).selectpicker('refresh');
        document.getElementById('summary').value = data[0].summary;
        document.getElementById('description').value = data[0].description;
        document.getElementById('description_de').value = data[0].description_de;
        document.getElementById('solution').value = data[0].solution;
        document.getElementById('solution_de').value = data[0].solution_de;
        document.getElementById('c2c').value = data[0].c2c;
        // customer list
        checkCustomers(issueID);
        if($('#charm').val().length !== 0){
          $('#work,#vsn,#status').prop('disabled', true);
        } else {
          $('#work,#vsn,#status').prop('disabled', false);
        }
        // action current + history
        updateAction(document.getElementById('issueID').value);
        $('#files-table-body').empty();
        refreshFiles(document.getElementById('issueID').value);
      }).catch(function (error) {
        showNotification('Error getting the searched issue :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
    // check if issue is the last issue
    new sql.Request()
      .input('project_id', sql.Int, project_ID)
      .query('select MIN(id) AS min_id, MAX(id) AS max_id from issues where project_id = @project_id')
      .then(function (data) {
        if (document.getElementById('issueID').value == data[0].max_id) {

          $('#last_issue').addClass('disabled');
          $('#next_issue').addClass('disabled');
          $('#first_issue').removeClass('disabled');
          $('#previous_issue').removeClass('disabled');
        }
      }).catch(function (error) {
        showNotification('error checking if issue is the last issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
    // check if issue is the last issue
    new sql.Request()
      .input('project_id', sql.Int, project_ID)
      .query('select MIN(id) AS min_id, MAX(id) AS max_id from issues where project_id = @project_id')
      .then(function (data) {
        if (document.getElementById('issueID').value == data[0].min_id) {
          $('#last_issue').removeClass('disabled');
          $('#next_issue').removeClass('disabled');
          $('#first_issue').addClass('disabled');
          $('#previous_issue').addClass('disabled');
        }
      }).catch(function (error) {
        showNotification('error checking if issue is the last issue: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });

  }).catch(function (error) {
    showNotification('Error connecting for getting the searched issue :' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });


});

//search reset btn
$('.search-reset-btn').click(function (e) {
  e.preventDefault();
  document.getElementById('s_defect').value = '';
  document.getElementById('s_charm').value = '';
  document.getElementById('s_desc').value = '';
  document.getElementById('s_customer').value = '';
  document.getElementById('s_summary').value = '';
  document.getElementById('s_status').value = '';
  $('.search-ph').removeClass('hidden').addClass('show');
  $('#search-ph-msg').text(' Search result will be shown here  ').removeClass('text-danger');
  $('.search-result').remove();
});

$('#s-success').on('click', function (e) {
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  e.preventDefault();
  $('.search-div').empty();

  sql.connect(config).then(function () {
    new sql.Request()
      .input('project_id', sql.Int, project_ID)
      .query('SELECT [issues].[id],[issues].[dbid],[issues].[summary],[issues].[no_further_action],[issues].[charm],[issues].[defect] FROM [issues] WHERE [issues].[no_further_action] = 1 AND [issues].[project_id] = @project_id')
      .then(function (data) {
        if (data.length == 0) {
          $('.search-ph').removeClass('hidden').addClass('show');
          $('#search-ph-msg').text('No Result returned from DataBase  ').addClass('text-danger');
        } else {
          $('.search-ph').removeClass('show').addClass('hidden');
          for (let i = 0; i < data.length; i++) {
            $('.search-div').append('<a class="search-result" data-nfa="' + data[i].no_further_action + '"' +
              ' data-charm="' + data[i].charm + '" data-defect="' + data[i].defect + '" href="' + data[i].id + '"><li class="list-group-item list-group-item-success animated fadeInDown"><h4 class="list-group-item-heading">' + data[i].dbid + '</h4> <p class="list-group-item-text">' + data[i].summary + '</p></li></a>');
          }
        }
      }).catch(function (error) {
        showNotification('can\'t search the issues: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
  }).catch(function (error) {
    showNotification('error connecting for searching the issues : ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });

});

$('#s-danger').on('click', function (e) {
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  e.preventDefault();
  $('.search-div').empty();

  sql.connect(config).then(function () {
    new sql.Request()
      .input('project_id', sql.Int, project_ID)
      .query('SELECT [issues].[id],[issues].[dbid],[issues].[no_further_action],[issues].[charm] ,[issues].[defect],[issues].[summary] FROM [issues] LEFT JOIN [actions] ON [actions].[issue_id] = [issues].[id] WHERE [actions].[issue_id] IS NULL AND [issues].[project_id] = @project_id')
      .then(function (data) {
        if (data.length == 0) {
          $('.search-ph').removeClass('hidden').addClass('show');
          $('#search-ph-msg').text('No Result returned from DataBase  ').addClass('text-danger');
        } else {
          $('.search-ph').removeClass('show').addClass('hidden');
          for (let i = 0; i < data.length; i++) {
            $('.search-div').append('<a class="search-result" data-nfa="' + data[i].no_further_action + '"' +
              ' data-charm="' + data[i].charm + '" data-defect="' + data[i].defect + '" href="' + data[i].id +
              '"><li class="list-group-item list-group-item-danger animated fadeInDown"><h4 class="list-group-item-heading">' +
              data[i].dbid + '</h4> <p class="list-group-item-text">' + data[i].summary + '</p></li></a>');
          }
        }
      }).catch(function (error) {
        showNotification('can\'t search the issues: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
  }).catch(function (error) {
    showNotification('error connecting for searching the issues : ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });
});

$('#s-info').on('click', function (e) {
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  e.preventDefault();
  $('.search-div').empty();

  sql.connect(config).then(function () {
    new sql.Request()
      .input('project_id', sql.Int, project_ID)
      .query('SELECT [issues].[id],[issues].[dbid],[issues].[summary],[issues].[charm] , [issues].[defect] , [issues].[no_further_action] FROM [issues] ' +
        'LEFT JOIN [actions] ON [actions].[issue_id] = [issues].[id]' +
        ' WHERE [actions].[issue_id] IS NOT NULL AND [issues].[no_further_action] = 0 ' +
        'AND ([issues].[charm] IS NOT NULL OR [issues].[defect] IS NOT NULL ) AND [issues].[project_id] = @project_id ' +
        'GROUP BY [issues].[summary],[issues].[dbid],[issues].[id],[issues].[charm], [issues].[defect], [issues].[no_further_action] ')
      .then(function (data) {
        if (data.length == 0) {
          $('.search-ph').removeClass('hidden').addClass('show');
          $('#search-ph-msg').text('No Result returned from DataBase  ').addClass('text-danger');
        } else {
          $('.search-ph').removeClass('show').addClass('hidden');
          for (let i = 0; i < data.length; i++) {
            $('.search-div').append('<a class="search-result" data-nfa="' + data[i].no_further_action + '"' +
              ' data-charm="' + data[i].charm + '" data-defect="' + data[i].defect + '" href="' + data[i].id + '"><li class="list-group-item list-group-item-info animated fadeInDown"><h4 class="list-group-item-heading">' + data[i].dbid + '</h4> <p class="list-group-item-text">' + data[i].summary + '</p></li></a>');
          }
        }
      }).catch(function (error) {
        showNotification('can\'t search the issues: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
  }).catch(function (error) {
    showNotification('error connecting for searching the issues : ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });
});

$('#s-warning').on('click', function (e) {
  e.preventDefault();
  var project_name = document.getElementById('project_name');
  var project_ID = project_name.options[project_name.selectedIndex].value;
  $('.search-div').empty();

  sql.connect(config).then(function () {
    new sql.Request()
      .input('project_id', sql.Int, project_ID)
      .query('SELECT [issues].[id],[issues].[dbid],[issues].[summary],[issues].[charm],[issues].[defect],[issues].[no_further_action] FROM [issues] ' +
        'LEFT JOIN [actions] ON [actions].[issue_id] = [issues].[id]' +
        ' WHERE [actions].[issue_id] IS NOT NULL AND [issues].[no_further_action] = 0 ' +
        'AND ([issues].[charm] IS NULL AND [issues].[defect] IS NULL ) AND [issues].[project_id] = @project_id ' +
        'GROUP BY [issues].[summary],[issues].[dbid],[issues].[id],[issues].[charm], [issues].[defect], [issues].[no_further_action] ')
      .then(function (data) {
        if (data.length == 0) {
          $('.search-ph').removeClass('hidden').addClass('show');
          $('#search-ph-msg').text('No Result returned from DataBase  ').addClass('text-danger');
        } else {
          $('.search-ph').removeClass('show').addClass('hidden');
          for (let i = 0; i < data.length; i++) {
            $('.search-div').append('<a class="search-result" data-nfa="' + data[i].no_further_action + '"' +
              ' data-charm="' + data[i].charm + '" data-defect="' + data[i].defect + '" href="' + data[i].id + '"><li class="list-group-item list-group-item-warning animated fadeInDown"><h4 class="list-group-item-heading">' + data[i].dbid + '</h4> <p class="list-group-item-text">' + data[i].summary + '</p></li></a>');
          }
        }
      }).catch(function (error) {
        showNotification('can\'t search the issues: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });
  }).catch(function (error) {
    showNotification('error connecting for searching the issues : ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });
});

//======================================================================================================================
//action [ok]

$('#new-action-btn').on('click', function (e) {
  e.preventDefault();
  let issueID = document.getElementById('issueID').value;
  let desc = document.getElementById('new-action').value;
  let date = getDate();


  sql.connect(config).then(function () {
    new sql.Request()
      .input('desc', sql.NVarChar(sql.MAX), desc)
      .input('issue_id', sql.Int, issueID)
      .input('date', sql.NVarChar(10), date)
      .query('INSERT INTO actions (issue_id,description,date) VALUES (@issue_id ,@desc,@date)')
      .then(function (data) {
        showNotification('Action inserted successfully', 'success', 'glyphicon glyphicon-tasks');
        updateAction(issueID);
      }).catch(function (error) {
        showNotification('can\'t add new action: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
      });

    $('#new-action').val(' ');

    

  }).catch(function (error) {
    showNotification('error connecting for creating new action: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
  });
});

function updateAction(issue_id) {
  var connection3 = new sql.Connection(config, function (err) {
    if (err) {
      showNotification('error connecting for updating actions: ' + error.message, 'danger', 'glyphicon glyphicon-tasks');
    } else {
      var request = new sql.Request(connection3);
      request.input('issue_id', issue_id)
        .query('SELECT description,date FROM actions WHERE issue_id = @issue_id ORDER BY id DESC')
        .then(function (data) {
          $('#action-current').empty();
          if (data.length > 0) {
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
        }).catch(function (error) {
          showNotification('Error on updating actions:' + error, 'danger', 'glyphicon glyphicon-tasks');
        });
    }
  });
}