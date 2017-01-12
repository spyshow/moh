function sendMail(issue_id,project_title) {

  var conn2 = new sql.Connection(config, function (err) {
      if (err) {
          showNotification('error connecting for generating pdf: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
      } else {
          var docx = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<style>' +
                'body {' +
                'padding: 0 20px;' +
                '}' +
                '.td {' +
                'width: 40%;' +
                'text-align: left;' +
                '}' +
                '.bold {' +
                'vertical-align: top;' +
                'padding-top:10px;' +
                'text-align: left;' +
                'font-weight: bold;' +
                'width: 18%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>'+
                '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Project ID: ' + project_title + '</p><div style="page-break-after:always;"></div>';
          var request = new sql.Request(conn2);
          request.multiple = true;
          request
              .input('issue_id', issue_id)
              .query('SELECT * FROM [issues] WHERE id = @issue_id'+
                  'SELECT [date], [description] FROM [actions] WHERE [issue_id] = @issue_id;' +
                  'SELECT [name] FROM [customers] INNER JOIN [issues_customers] as ic ON [customers].[id] = ic.[customer_id] WHERE [issue_id] = @issue_id;' +
                  'SELECT [name],[cd] FROM [baselines] INNER JOIN [issues_baselines] as ib ON [baselines].[id] = ib.[baseline_id] WHERE [issue_id] = @issue_id')
              .then(function (data2) {
                  var arr1 = '';
                  arr1 += '<table style="table-layout: fixed; width: 100%;">' +
                      '<tbody>' +
                      '<tr>' +
                      '<td class="bold">DB ID:</td>' +
                      '<td class="td">' + data2[0].id + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">Date:</td>' +
                      '<td class="td">' + data2[0].date + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">Work:</td>' +
                      '<td class="td">' + data2[0].work + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">Area:</td>' +
                      '<td class="td">' + data1.date + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">Key:</td>' +
                      '<td class="td">' + data2[0].key + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">Priority:</td>' +
                      '<td class="td">' + data1.date + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">Reproducible:</td>' +
                      '<td class="td">' + data1.date + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">Messenger:</td>' +
                      '<td class="td">' + data1.date + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">No further action:</td>' +
                      '<td class="td">' + data1.date + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold">Customers:</td><td  class="td">';
                  for (let s = 0; s < data2[2].length; s++) {
                      if (s === (data2[2].length - 1)) {
                          arr1 += data2[2][s].name;
                      } else {
                          arr1 += data2[2][s].name + ', ';
                      }
                  }

                  arr1 += '</td></tr>' +
                      '<tr>' +
                      '<td class="bold">Baseline:</td>' +
                      '<td  class="td">' + data2[3][0].name + '</td>' +
                      '</tr>';

                  if (data1.charm && data1.defect) {
                      arr1 += '<tr>' +
                          '<td class="bold">Charm/Defect:   </td>' +
                          '<td  class="td">' + data1.charm + '/' + data1.defect + '</td>';
                  } else if (data1.charm) {
                      arr1 += '<tr>' +
                          '<td class="bold">Charm:          </td>' +
                          '<td  class="td">' + data1.charm + '</td>';
                  } else if (data1.defect) {
                      arr1 += '<tr>' +
                          '<td class="bold">Defect:         </td>' +
                          '<td  class="td">' + data1.defect + '</td>';
                  } else {
                      arr1 += '<tr>' +
                          '<td class="bold">Charm/Defect:   </td>' +
                          '<td  class="td">No Number</td>';
                  }
                  arr1 += '<td></td>' +
                      '<td class="bold">Stauts: ' + data1.status + '</td>' +
                      '</tr>' +
                      '</tbody>' +
                      '</table>' +
                      '<table style="margin-top:20px;">' +
                      '<tbody>' +
                      '<tr>' +
                      '<td class="bold" style="vertical-align: top;" >Summary:</td>' +
                      '<td>' + data1.summary + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="bold" style="vertical-align: top;" >Description:</td>' +
                      '<td>' + data1.description + '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td style="vertical-align: top;" class="bold">action:</td>' +
                      '<td>' +
                      '<table>';
                  data2[1].forEach(function (data21) {
                      arr1 += '<tr>' +
                          '<td>' + data21.date + '</td>' +
                          '<td>' + data21.description + '</td>' +
                          '</tr>';

                  });
                  arr1 += '</table>' +
                      '</td>' +
                      '</tr>' +
                      '</tbody>' +
                      '</table>' +
                      '<br><div style="page-break-after:always;"></div>';

                  docx += arr1;

              }).catch(function (error) {
                  showNotification('Error on selecting actions for ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
              });
      }
  });
}