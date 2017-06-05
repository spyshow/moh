/*
    TODO
*/

const electron = require('electron');
const {dialog} = require('electron').remote;
const {app} = require('electron').remote;
const ipc = electron.ipcRenderer;
const sql = require('mssql');
const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');
const pdf = require('html-pdf');
const async = require('async');
const Chart = require("chart.js");
const FileSaver = require('file-saver');
const htmlTo = require('html2xlsx');
var base64Img = require('base64-img');
var xl = require('excel4node');
var toBuffer = require('blob-to-buffer');
$('#baselines').selectpicker('hide');
$('#customers').selectpicker('hide');

//======================================================================================================================
//notification
function showNotification(msg, type, icon) {
    $.notify({
        icon: icon,
        message: msg
    }, {
        type: type,
        placement: {
          from: "bottom",
          align: "right"
        },
        delay: 3000,
        animate: {
          enter: 'animated fadeInUp',
          exit: 'animated fadeOutDown'
        }
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
//load project name
ipc.on('show-evaluation', function (event, project_id) {
    var conn = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting for selecting project: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn);
            request
                .input('project_id',  project_id)
                .query('SELECT [project_name],[id] FROM [projects] WHERE [id] = @project_id')
                .then(function (data) {
                    document.getElementById('projectID').value = data[0].project_name;
                    document.getElementById('projectID').dataset.id = data[0].id;
                    
                }).catch(function (error) {
                    showNotification('Error on selecting project:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });

    $('#area-and-label').on('click', function () {
        $('#baselines').selectpicker('show');
    });
    $('#area-and-customers').on('click', function () {
        $('#customers').selectpicker('show');
    });
    $("input[name=chart-type]").on('click', function () {
        if (!document.getElementById('area-and-label').checked) {
            $('#baselines').selectpicker('hide');
        }
        if (!document.getElementById('area-and-customers').checked) {
            $('#customers').selectpicker('hide');
        }
    });

    var option = {};
    var html = '';
    //get customers and baseline and put them in the select menu
    var conn2 = new sql.Connection(config, function (err) {
        if (err) {
            showNotification('error connecting for selecting customers and baselines: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            $('#customers').empty().selectpicker('refresh');
            $('#baselines').empty().selectpicker('refresh');
            //get customers and put them in the select menu
            var request = new sql.Request(conn2);
            request
                .input('project_id', sql.Int, project_id)
                .query('SELECT [id],[name] FROM [customers] ' +
                    ' INNER JOIN [projects_customers] as pc ON [customers].[id] = pc.[customer_id]' +
                    ' WHERE pc.[project_id] = @project_id')
                .then(function (data) {
                    data.forEach(function (data) {
                        html += '<option value="' + data.id + '">' + data.name + '</option>';
                    });
                    $('#customers').append(html).selectpicker('refresh');
                    $('#both-customers').append(html).selectpicker('refresh');
                    html = '';
                }).catch(function (error) {
                    showNotification('Error on selecting customers:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
            //get baseline and put them in the select menu
            var request2 = new sql.Request(conn2);
            request2
                .input('project_id', sql.Int, project_id)
                .query('SELECT [id],[name] FROM [baselines] ' +
                    ' INNER JOIN [projects_baselines] as pb ON [baselines].[id] = pb.[baseline_id]' +
                    ' WHERE pb.[project_id] = @project_id')
                .then(function (data) {
                    data.forEach(function (data) {
                        html += '<option value="' + data.id + '">' + data.name + '</option>';
                    });
                    $('#baselines').append(html).selectpicker('refresh');
                    $('#both-baselines').append(html).selectpicker('refresh');
                    html = '';
                }).catch(function (error) {
                    showNotification('Error on selecting baselines:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                });
        }
    });
    //update chart on baseline update
    $('#baselines').on('changed.bs.select', function (e) {
        $('#area-and-label').click();
    });
    $('#customers').on('changed.bs.select', function (e) {
        $('#area-and-customers').click();
    });
    setTimeout(function(){
        $('#date').click();
    },500);
    
});

//======================================================================================================================
//create MsSQL connection

var config = {
    user: 'test',
    password: '123456',
  server: 'ENG-03',
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

//======================================================================================================================
//Charts

//prepare chart 

$('#date').on('click', function (e) {

    var project_id = document.getElementById('projectID').dataset.id;
    $('.canvas').html('<canvas id="myChart" width="548" height="274" style="display: block; width: 548px; height: 274px;"></canvas>');
    var ctx = document.getElementById("myChart").getContext("2d");
    //var myChart = new Chart(ctx);
    var chartData = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: "Issue / Date",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }]
        },
        options: {
            // Edit: correction typo: from 'animated' to 'animation'
            layout: {
                padding: 10
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    },
                    color: '#f39c12',
                    ticks: {
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Issues'
                    },
                    color: '#f39c12',
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for chart by date:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn1);
            request
                .input('project_id', sql.Int, project_id)
                .query('SELECT [date] from [issues] WHERE [project_id] = @project_id GROUP BY [date] ORDER BY [date] ')
                .then(function (data) {
                    var num = data.length ;
                    async.timesSeries(num, function (n,callback) {                        
                      var conn2 = new sql.Connection(config, function (err) {
                        if (err) {
                          showNotification('error connecting for selecting actions for ALL issues: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                        } else {
                          var request = new sql.Request(conn2);
                          request
                          .input('project_id', sql.Int, project_id)
                          .input('date', data[n].date)
                          .query('SELECT COUNT(*) AS counts FROM [issues] WHERE [date] = @date AND project_id = @project_id;')
                          .then(function (data2) {
                            chartData.data.labels.push(data[n].date);
                            chartData.data.datasets[0].data.push(data2[0].counts);
                            callback();
                          }).catch(function (error) {
                              showNotification('Error on selecting actions for ALL issues:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                          });
                        }
                      });                      
                    });
                }).then(function () {
                    setTimeout(function () {
                        var myLineChart = new Chart(ctx, chartData);
                    }, 250);

                });
        }
    });
});

$('#area').on('click', function (e) {
    var project_id = document.getElementById('projectID').dataset.id;
    $('.canvas').html('<canvas id="myChart" width="548" height="274" style="display: block; width: 548px; height: 274px;"></canvas>');
    var ctx = document.getElementById("myChart").getContext("2d");
    //var myChart = new Chart(ctx);
    var chartData = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: "Issue / area",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }]
        },
        options: {
            // Edit: correction typo: from 'animated' to 'animation'
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'area'
                    },
                    color: '#f39c12',
                    ticks: {
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Issues'
                    },
                    color: '#f39c12',
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for chart by date:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn1);
            request
            .input('project_id', sql.Int, project_id)
            .query('SELECT [area] from [issues] WHERE [project_id] = @project_id AND [area] IS NOT NULL GROUP BY [area] ORDER BY [area] ')
            .then(function (data) {
                async.eachOfSeries(data, function (data1, i, callback) {
                    var conn2 = new sql.Connection(config, function (err) {
                        if (err) {
                            showNotification('error connecting for selecting area for chart: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                        } else {
                            var request = new sql.Request(conn2);
                            request.multiple = true;
                            request
                            .input('project_id', sql.Int, project_id)
                            .input('area', data1.area)
                            .query('SELECT COUNT(*) FROM [issues] WHERE [area] = @area AND project_id = @project_id;')
                            .then(function (data2) {
                                switch(data1.area){
                                    case 1:
                                        chartData.data.labels.push('Application');
                                        break;
                                    case 2:
                                        chartData.data.labels.push('Software');
                                        break;
                                    case 3:
                                        chartData.data.labels.push('Hardware');
                                        break;
                                    case 4:
                                        chartData.data.labels.push('Documentation');
                                        break;
                                    case 5:
                                        chartData.data.labels.push('Wish');
                                        break;
                                    case 6:
                                        chartData.data.labels.push('Training');
                                        break;
                                }
                                chartData.data.datasets[0].data.push(data2[0][0]['']);

                            }).catch(function (error) {
                                showNotification('Error on selecting area for chart:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                            });
                            callback();
                        }
                    });
                });

            }).then(function () {
                setTimeout(function () {
                    var myLineChart = new Chart(ctx, chartData);
                    /**/
                }, 250);
            });
        }
    });
});

$('#area-and-label').on('click', function (e) {
    var project_id = document.getElementById('projectID').dataset.id;
    var baseline = $('#baselines').find("option:selected").val();
    $('.canvas').html('<canvas id="myChart" width="548" height="274" style="display: block; width: 548px; height: 274px;"></canvas>');
    var ctx = document.getElementById("myChart").getContext("2d");
    //var myChart = new Chart(ctx);
    var chartData = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: "",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }]
        },
        options: {
            // Edit: correction typo: from 'animated' to 'animation'
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'area'
                    },
                    color: '#f39c12',
                    ticks: {
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Issues'
                    },
                    color: '#f39c12',
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for chart by baseline:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn1);

            request
                .input('project_id', sql.Int, project_id)
                .input('baseline', baseline)
                .query('SELECT [area] from [issues] ' +
                    'INNER JOIN [issues_baselines] as ib ON [issues].[id] = ib.[issue_id]' +
                    ' WHERE [project_id] = @project_id AND  ib.[baseline_id] = @baseline GROUP BY [area] ORDER BY [area] ')
                .then(function (data) {
                    chartData.data.datasets[0].label = 'issue / area of label: ' + document.getElementById('baselines').options[document.getElementById('baselines').selectedIndex].innerText;
                    async.eachOfSeries(data, function (data1, i, callback) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting area for chart by baseline: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                .input('project_id', sql.Int, project_id)
                                .input('area', data1.area)
                                .input('baseline', baseline)
                                .query('SELECT COUNT(*) FROM [issues] ' +
                                        'INNER JOIN [issues_baselines] as ib ON [issues].[id] = ib.[issue_id] ' + 
                                        'WHERE [area] = @area AND ib.[baseline_id] = @baseline AND [project_id] = @project_id;')
                                .then(function (data2) {
                                    switch(data1.area){
                                        case 1:
                                            chartData.data.labels.push('Application');
                                            break;
                                        case 2:
                                            chartData.data.labels.push('Software');
                                        break;
                                        case 3:
                                            chartData.data.labels.push('Hardware');
                                        break;
                                        case 4:
                                            chartData.data.labels.push('Documentation');
                                        break;
                                        case 5:
                                            chartData.data.labels.push('Wish');
                                        break;
                                        case 6:
                                            chartData.data.labels.push('Training');
                                        break;
                                    }
                                    chartData.data.datasets[0].data.push(data2[0][0]['']);

                                }).catch(function (error) {
                                    showNotification('Error on selecting area for chart by baseline:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                });
                                callback();
                            }
                        });
                    });

                }).then(function () {
                    setTimeout(function () {
                        var myLineChart = new Chart(ctx, chartData);
                        /**/
                    }, 250);

                });

        }
    });
});

$('#area-and-customers').on('click', function (e) {
    var project_id = document.getElementById('projectID').dataset.id;
    var customer = $('#customers').find("option:selected").val();
    $('.canvas').html('<canvas id="myChart" width="548" height="274" style="display: block; width: 548px; height: 274px;"></canvas>');
    var ctx = document.getElementById("myChart").getContext("2d");
    //var myChart = new Chart(ctx);
    var chartData = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: "",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false,
            }]
        },
        options: {
            // Edit: correction typo: from 'animated' to 'animation'
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Area'
                    },
                    color: '#f39c12',
                    ticks: {
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Issues'
                    },
                    color: '#f39c12',
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for chart by customers:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            var request = new sql.Request(conn1);

            request
                .input('project_id', sql.Int, project_id)
                .input('customer', customer)
                .query('SELECT [area] from [issues] ' +
                    'INNER JOIN [issues_customers] as ic ON [issues].[id] = ic.[issue_id]' +
                    ' WHERE [project_id] = @project_id AND  ic.[customer_id] = @customer GROUP BY [area] ORDER BY [area] ')
                .then(function (data) {
                    chartData.data.datasets[0].label = 'issue / area of Customer: ' + document.getElementById('customers').options[document.getElementById('customers').selectedIndex].innerText;
                    async.eachOfSeries(data, function (data1, i, callback) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting area for chart by customer: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                .input('project_id', sql.Int, project_id)
                                .input('area', data1.area)
                                .input('customer', customer)
                                .query('SELECT COUNT(*) FROM [issues] ' +
                                        'INNER JOIN [issues_customers] as ic ON [issues].[id] = ic.[issue_id] ' + 
                                        'WHERE [area] = @area AND ic.[customer_id] = @customer AND [project_id] = @project_id;')
                                .then(function (data2) {
                                    switch(data1.area){
                                        case 1:
                                            chartData.data.labels.push('Application');
                                            break;
                                        case 2:
                                            chartData.data.labels.push('Software');
                                        break;
                                        case 3:
                                            chartData.data.labels.push('Hardware');
                                        break;
                                        case 4:
                                            chartData.data.labels.push('Documentation');
                                        break;
                                        case 5:
                                            chartData.data.labels.push('Wish');
                                        break;
                                        case 6:
                                            chartData.data.labels.push('Training');
                                        break;
                                    }
                                    chartData.data.datasets[0].data.push(data2[0][0]['']);

                                }).catch(function (error) {
                                    showNotification('Error on selecting area for chart by customer:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                                });
                                callback();
                            }
                        });
                    });

                }).then(function () {
                    setTimeout(function () {
                        var myLineChart = new Chart(ctx, chartData);
                        /**/
                    }, 250);

                });

        }
    });
});

//prepare word file
$('#word-chart').on('click', function (e) {
    e.preventDefault();
    var project_id = document.getElementById('projectID').dataset.id;
    var docx = '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<style>' +
        'html, body, #wrapper {' +
        'height:100%;' +
        'width: 100%;' +
        'margin: 0;' +
        'padding: 0;' +
        'border: 0;}' +
        '#wrapper td {' +
        'vertical-align: middle;' +
        'text-align: center;}' +
        '</style>' +
        '</head>' +
        '<body>';
    docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Project ID: ' + document.getElementById('projectID').value +'<br style="page-break-before: always; clear: both" />';
    if (document.getElementById('chart-doc-id').checked === true) {
        docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Doc ID: ' + document.getElementById('chart-doc-id-name').value + '</p><br><br><br><br><br>';
    }
    docx += '<table id="wrapper">' +
        '<tr>' +
        '<td><img class="center" src="' + document.getElementById('myChart').toDataURL() + '"></td>' +
        '</tr>' +
        '</table>' +
        '</body>' +
        '</html>';
    var converted = htmlDocx.asBlob(docx);
    var buffer = toBuffer(converted, function (err, buffer) {
      if (err) throw err;
      dialog.showSaveDialog({
        filters: [{
            name: 'Word',
            extensions: ['docx']
        }],
        title: 'Save the Table as Word',
        defaultPath: path.join(app.getPath('desktop'), 'Chart')
      }, function (filename) {
          fs.writeFileSync(filename, buffer);
      });                                
    });
    //FileSaver.saveAs(converted, 'chart.docx');
});

//prepare PDF file
$('#pdf-chart').on('click', function (e) {
    e.preventDefault();
    var project_id = document.getElementById('projectID').dataset.id;
    var docx = '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<style>' +
        'html, body, #wrapper {' +
        'width: 100%;' +
        'margin: 0;' +
        'padding: 0;' +
        'border: 0;}' +
        '#wrapper td {' +
        'vertical-align: middle;' +
        'text-align: center;}' +
        '</style>' +
        '</head>' +
        '<body>';
    docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Project ID: ' + document.getElementById('projectID').value +'<div style="page-break-after:always;"></div>';
    if (document.getElementById('chart-doc-id').checked === true) {
        docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Doc ID: ' + document.getElementById('chart-doc-id-name').value + '</p><br><br><br><br>';
    }
    docx += '<table id="wrapper">' +
        '<tr>' +
        '<td><img class="center" src="' + document.getElementById('myChart').toDataURL() + '"></td>' +
        '</tr>' +
        '</table>' +
        '</body>' +
        '</html>';
    var conf = {
        "format": "A4",
        "header": {
            "height": "20mm"
        }
    };
    dialog.showSaveDialog({
        filters: [{
            name: 'PDFs',
            extensions: ['pdf']
        }],
        title: 'Save the Chart as PDF',
        defaultPath: path.join(app.getPath('desktop'), 'Chart.pdf')
    }, function (filename) {
        pdf.create(docx, conf).toFile(filename, function (err, res) {
            if (err) {
                showNotification('file is not saved', 'danger', 'glyphicon glyphicon-tasks');
            }
        });

    });


});

//prepare XLSX file
function canvasToImage(backgroundColor) {
    //cache height and width        
    var w = document.getElementById('myChart').width;
    var h = document.getElementById('myChart').height;
    var context = document.getElementById('myChart').getContext("2d");
    var data;

    if (backgroundColor) {
        //get the current ImageData for the canvas.
        data = context.getImageData(0, 0, w, h);

        //store the current globalCompositeOperation
        var compositeOperation = context.globalCompositeOperation;

        //set to draw behind current content
        context.globalCompositeOperation = "destination-over";

        //set background color
        context.fillStyle = backgroundColor;

        //draw background / rect on entire canvas
        context.fillRect(0, 0, w, h);
    }

    //get the image data from the canvas
    var imageData = document.getElementById('myChart').toDataURL("image/png");

    if (backgroundColor) {
        //clear the canvas
        context.clearRect(0, 0, w, h);

        //restore it with original / cached ImageData
        context.putImageData(data, 0, 0);

        //reset the globalCompositeOperation to what it was
        context.globalCompositeOperation = compositeOperation;
    }

    //return the Base64 encoded data url string
    return imageData;
}

$('#excel-chart').on('click', function (e) {
    var imgPath = '';
    e.preventDefault();
    var project_id = document.getElementById('projectID').dataset.id;
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Chart');
    var style = wb.createStyle({
        font: {
            bold: true,
            size: 24
        }
    });
    ws.cell(2, 2).string('Project ID: ' + document.getElementById('projectID').value).style(style);
    if (document.getElementById('chart-doc-id').checked === true) {
        ws.cell(6, 2).string('Doc ID: ' + document.getElementById('chart-doc-id-name').value).style(style);
    }



    var url_base64 = canvasToImage('#fff');
    base64Img.imgSync(url_base64, app.getPath('userData')+'\\temp\\', '1', function (err, filepath) {
        if (err) throw err;
        imgPath = filepath;
    });
    /*var bitmap = new Buffer(url_base64 , 'base64');
    fs.writeFileSync(app.getPath('userData')+'\\1.jpeg', bitmap,'binary');*/
    ws.addImage({
        path: app.getPath('userData')+'\\temp\\1.png',
        type: 'picture',
        position: {
            type: 'oneCellAnchor',
            from: {
                col: 1,
                colOff: '0.5in',
                row: 9,
                rowOff: 0
            }
        }
    });
    dialog.showSaveDialog({
        filters: [{
            name: 'Xlsx',
            extensions: ['xlsx']
        }],
        title: 'Save the Chart as Excel',
        defaultPath: path.join(app.getPath('desktop'), 'Chart.xlsx')
    }, function (filename) {
        wb.write(filename, function (err, stats) {
            if (err) {
            }
            fs.unlinkSync(app.getPath('userData') + '\\1.png');
        });

    });

});

//======================================================================================================================
//Tables



$('#word-table').on('click', function (e) {
    e.preventDefault();
    var project_id = document.getElementById('projectID').dataset.id;
    switch ($("input[name=table-type]:checked").val()) {
        case '0':
            distWord(project_id);
            break;

        case '1':
            fragWord(project_id);
            break;
    }
});

$('#pdf-table').on('click', function (e) {
    e.preventDefault();
    var project_id = document.getElementById('projectID').dataset.id;
    switch ($("input[name=table-type]:checked").val()) {
        case '0':
            distPdf(project_id);
            break;

        case '1':
            fragPdf(project_id);
            break;
    }
});

$('#excel-table').on('click', function (e) {
    e.preventDefault();
    var project_id = document.getElementById('projectID').dataset.id;
    switch ($("input[name=table-type]:checked").val()) {
        case '0':
            distExcel(project_id);
            break;

        case '1':
            fragExcel(project_id);
            break;
    }
});

function getdataTable(baselines, customer_id, callback) {
    var text = '';
    var data = [];
    var cd = [];
    async.eachOfSeries(baselines, function (data3, key, callback1) {
        var conn4 = new sql.Connection(config, function (error) {
            if (error) {
                showNotification('error connecting for selecting customers for distribution of issue Table:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                var request = new sql.Request(conn4);
                request
                    .input('customer_id', customer_id)
                    .input('baseline', data3.cd)
                    .query('SELECT SUM( CASE WHEN [issues].[area] = 1 THEN 1 ELSE 0 END ) AS app,' +
                        'SUM( CASE WHEN [issues].[area] = 2 THEN 1 ELSE 0 END ) as software,' +
                        'SUM( CASE WHEN [issues].[area] = 3 THEN 1 ELSE 0 END ) as hardware,' +
                        'SUM( CASE WHEN [issues].[area] = 4 THEN 1 ELSE 0 END ) as doc,' +
                        'SUM( CASE WHEN [issues].[area] = 5 THEN 1 ELSE 0 END ) as wish,' +
                        'SUM( CASE WHEN [issues].[area] = 6 THEN 1 ELSE 0 END ) as training ' +
                        'FROM [issues] ' +
                        'INNER JOIN [issues_baselines] AS ib ON issues.id = ib.[issue_id] ' +
                        'INNER JOIN [baselines] ON [baselines].[id] = ib.[baseline_id] ' +
                        'INNER JOIN [issues_customers] AS ic ON ic.[issue_id] = [issues].[id] ' +
                        'WHERE [baselines].[cd] = @baseline AND customer_id = @customer_id  ;')
                    .then(function (row) {
                        data[key] = row;
                        cd[key] = data3.cd;
                        callback1();
                    });
            }
        });
    }, function () {
        for (let i = 0; i < data.length; i++) {
            text += '<tr>' +
                '<td>' + cd[i] + '</td>' +
                '<td>' + data[i][0].app + '</td>' +
                '<td>' + data[i][0].software + '</td>' +
                '<td>' + data[i][0].hardware + '</td>' +
                '<td>' + data[i][0].doc + '</td>' +
                '<td>' + data[i][0].wish + '</td>' +
                '<td>' + data[i][0].training + '</td>' +
                '</tr>';
        }
        callback(text);
    });
}
// word doc for dist Table 
function distWord(project_id) {
    var docx = '';
    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting customers for distribution of issue Table:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            docx = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
                '<style>' +
                'table{' +
                'width: 100%;' +
                'border-collapse: collapse;' +
                '}' +
                'th {' +
                '   background-color: #a2d8f2;' +
                '   color: white;' +
                '}' +
                'table, th, td{' +
                'padding: 5px;' +
                'border: 1px solid black;' +
                'text-align: center;' +
                '}' +
                '.bold {' +
                'text-align: left;' +
                'font-weight: bold;' +
                'width: 20%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>';
            docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Project ID: ' + document.getElementById('projectID').value +'<br style="page-break-before: always; clear: both" />';
            if (document.getElementById('table-doc-id').checked === true) {
                docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Doc ID: ' + document.getElementById('table-doc-id-name').value + '</p><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>';
            }
            docx += '<table>' +
                '<thead>' +
                '<tr>' +
                '<th>Customer</th>' +
                '<th>Total</th>' +
                '<th>CD</th>' +
                '<th>Application</th>' +
                '<th>Software</th>' +
                '<th>Hardware</th>' +
                '<th>Documentation</th>' +
                '<th>Wish</th>' +
                '<th>Training</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>';


            var request = new sql.Request(conn1);
            request
                .input('project_id', sql.Int, project_id)
                .query('SELECT [id],[name] from [customers] ' +
                    'INNER JOIN [projects_customers] AS pc ON [customers].[id] = pc.[customer_id]' +
                    'WHERE [project_id] = @project_id ORDER BY [id];')
                .then(function (data) {
                    var baselines = [];
                    var issueCount = [];
                    var customers = [];
                    var tableData = [];
                    //for each customer
                    async.eachOfSeries(data, function (data1, i, callback2) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting issues of customers for distribution of issue Table: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                    .input('project_id', sql.Int, project_id)
                                    .input('customer_id', sql.Int, data1.id)
                                    .query('SELECT COUNT([issues].[id]) AS total FROM [issues] ' + //for selecting total number of issues
                                        'INNER JOIN [issues_customers] as ic ON [issues].[id] = ic.[issue_id] ' +
                                        'INNER JOIN [customers] ON customers.[id] = ic.[customer_id] ' +
                                        'WHERE [customers].id = @customer_id AND [issues].[project_id] = @project_id; ' +
                                        'SELECT [baselines].[cd] from [baselines] ' + //for selecting  baselines
                                        'INNER JOIN [issues_baselines] AS ib ON [baselines].id = ib.[baseline_id] ' +
                                        'INNER JOIN [issues] ON ib.issue_id = [issues].[id] ' +
                                        'INNER JOIN [issues_customers] AS ic ON ic.[issue_id] = [issues].[id] ' +
                                        'INNER JOIN [customers] ON [customers].[id] = ic.[customer_id] ' +
                                        'WHERE [issues].[project_id] = @project_id AND [customers].[id] = @customer_id GROUP BY [baselines].[cd]; ')
                                    .then(function (data21) {
                                        issueCount[i] = data21[0];
                                        baselines[i] = data21[1];
                                        customers[i] = data1;
                                        callback2();
                                    });
                            }
                        });
                    }, function () {

                        async.timesSeries(issueCount.length, function (n, callback3) {
                            getdataTable(baselines[n], customers[n].id, function (result) {
                                docx += '<tr>' +
                                    '<td rowspan="' + (baselines[n].length + 1) + '">' + customers[n].name + '</td>' +
                                    '<td rowspan="' + (baselines[n].length + 1) + '">' + issueCount[n][0].total + '</td>';
                                docx += result + '</tr>';
                            });
                            callback3();
                        }, function () {
                            setTimeout(function () {
                                docx += '</tbody>' +
                                    '</table>' +
                                    '</body>' +
                                    '</html>';
                                var converted = htmlDocx.asBlob(docx);
                                /*dialog.showSaveDialog({
                                filters: [{ name: 'DOCX', extensions: ['docx']}],
                                title: 'Save the Table as Word file',
                                defaultPath: path.join(app.getPath('desktop'), 'Table.docx')}
                            , function(filename) {
                                fs.writeFile(filename, converted,'utf8',  function(err) {
                                    if (err) throw err;
                                });
                            
                      });*/ 
                              var buffer = toBuffer(converted, function (err, buffer) {
                                if (err) throw err;
                                dialog.showSaveDialog({
                                  filters: [{
                                      name: 'Word',
                                      extensions: ['docx']
                                  }],
                                  title: 'Save the Table as Word',
                                  defaultPath: path.join(app.getPath('desktop'), 'Table')
                                }, function (filename) {
                                    fs.writeFileSync(filename, buffer);
                                });                                
                              });
                              //FileSaver.saveAs(converted, 'table.docx', true);
                            }, 1500);
                        });


                    });
                });
        }
    });
}
// pdf doc for dist Table 
function distPdf(project_id) {
    var docx = '';
    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting customers for distribution of issue Table:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            docx = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<style>' +
                'table{' +
                'width: 100%;' +
                'border-collapse: collapse;' +
                '}' +
                'th {' +
                '   background-color: #a2d8f2;' +
                '   color: white;' +
                '}' +
                'table, th, td{' +
                'padding: 5px;' +
                'border: 1px solid black;' +
                'text-align: center;' +
                '}' +
                '.bold {' +
                'text-align: left;' +
                'font-weight: bold;' +
                'width: 20%;' +
                '}' +
                '.table-cell{'+
                'position: relative;'+
                '}'+
                '.table-cell:before{'+
                'position: absolute;'+
                'content: "";'+
                'top: 0;'+
                'left: -1px;'+
                'background-color: black;'+
                'width: 1px;'+
                'height: 100%;'+
                '}'+
                '</style>' +
                '</head>' +
                '<body>';
            docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Project ID: ' + document.getElementById('projectID').value +'<div style="page-break-after:always;"></div>';
            if (document.getElementById('table-doc-id').checked === true) {
                docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Doc ID: ' + document.getElementById('table-doc-id-name').value + '</p><div style="page-break-after:always;"></div>';
            }
            docx += '<table>' +
                '<thead>' +
                '<tr>' +
                '<th>Customer</th>' +
                '<th>Total</th>' +
                '<th>CD</th>' +
                '<th>Application</th>' +
                '<th>Software</th>' +
                '<th>Hardware</th>' +
                '<th>Documentation</th>' +
                '<th>Wish</th>' +
                '<th>Training</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>';


            var request = new sql.Request(conn1);
            request
                .input('project_id', sql.Int, project_id)
                .query('SELECT [id],[name] from [customers] ' +
                    'INNER JOIN [projects_customers] AS pc ON [customers].[id] = pc.[customer_id]' +
                    'WHERE [project_id] = @project_id ORDER BY [id];')
                .then(function (data) {
                    var baselines = [];
                    var issueCount = [];
                    var customers = [];
                    var tableData = [];
                    //for each customer
                    async.eachOfSeries(data, function (data1, i, callback2) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting issues of customers for distribution of issue Table: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                    .input('project_id', sql.Int, project_id)
                                    .input('customer_id', sql.Int, data1.id)
                                    .query('SELECT COUNT([issues].[id]) AS total FROM [issues] ' + //for selecting total number of issues
                                        'INNER JOIN [issues_customers] as ic ON [issues].[id] = ic.[issue_id] ' +
                                        'INNER JOIN [customers] ON customers.[id] = ic.[customer_id] ' +
                                        'WHERE [customers].id = @customer_id AND project_id = @project_id; ' +
                                        'SELECT [baselines].[cd] from [baselines] ' + //for selecting  baselines
                                        'INNER JOIN [issues_baselines] AS ib ON [baselines].id = ib.[baseline_id] ' +
                                        'INNER JOIN [issues] ON ib.issue_id = [issues].[id] ' +
                                        'INNER JOIN [issues_customers] AS ic ON ic.[issue_id] = [issues].[id] ' +
                                        'INNER JOIN [customers] ON [customers].[id] = ic.[customer_id] ' +
                                        'WHERE [issues].[project_id] = @project_id AND [customers].[id] = @customer_id GROUP BY [baselines].[cd]; ')
                                    .then(function (data21) {
                                        issueCount[i] = data21[0];
                                        baselines[i] = data21[1];
                                        customers[i] = data1;
                                        callback2();
                                    });
                            }
                        });
                    }, function () {
                        async.timesSeries(issueCount.length, function (n, callback3) {
                            getdataTable(baselines[n], customers[n].id, function (result) {
                                docx += '<tr>' +
                                    '<td class="table-cell" rowspan="' + (baselines[n].length + 1) + '">' + customers[n].name + '</td>' +
                                    '<td class="table-cell" rowspan="' + (baselines[n].length + 1) + '">' + issueCount[n][0].total + '</td>';
                                docx += result + '</tr>';
                            });
                            callback3();
                        }, function () {
                            setTimeout(function () {
                                docx += '</tbody>' +
                                    '</table>' +
                                    '</body>' +
                                    '</html>';
                                var conf = {
                                    "format": "A4",
                                    "header": {
                                        "height": "20mm"
                                    }
                                };
                                dialog.showSaveDialog({
                                    filters: [{
                                        name: 'PDFs',
                                        extensions: ['pdf']
                                    }],
                                    title: 'Save the Table as PDF',
                                    defaultPath: path.join(app.getPath('desktop'), 'Table.pdf')
                                }, function (filename) {
                                    pdf.create(docx, conf).toFile(filename, function (err, res) {});
                                });
                            }, 1500);
                        });
                    });
                });
        }
    });
}
// excel doc for dist Table 
function distExcel(project_id) {
    var docx = '';
    var conn1 = new sql.Connection(config, function (error) {
        if (error) {
            showNotification('error connecting for selecting customers for distribution of issue Table:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
        } else {
            docx = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
                '<style>' +
                'table{' +
                'width: 100%;' +
                'border-collapse: collapse;' +
                '}' +
                'th {' +
                '   background-color: #a2d8f2;' +
                '   color: white;' +
                '}' +
                'table, th, td{' +
                'padding: 5px;' +
                'border: 1px solid black;' +
                'text-align: center;' +
                'width:auto;' +
                'height:auto;' +
                'vertical-align:middle;' +
                '}' +
                '.doc-id {' +
                'border: 0px solid black;' +
                'font-weight: bold;' +
                'font-size: 36px;' +
                'height: 38px;' +
                '}' +
                '.bold {' +
                'text-align: left;' +
                'font-weight: bold;' +
                'width: 20%;' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>' +
                '<table>';
            docx += '<tr><td class="doc-id"></td></tr><tr><td class="doc-id"></td><td class="doc-id">Doc ID: ' + document.getElementById('projectID').value + '</td></tr><tr><td class="doc-id"></td></tr><tr><td class="doc-id"></td></tr>';            
            if (document.getElementById('table-doc-id').checked === true) {
                docx += '<tr><td class="doc-id"></td></tr><tr><td class="doc-id"></td><td class="doc-id">Doc ID: ' + document.getElementById('table-doc-id-name').value + '</td></tr><tr><td class="doc-id"></td></tr><tr><td class="doc-id"></td></tr>';
            }
            docx += '<thead>' +
                '<tr>' +
                '<th>Customer</th>' +
                '<th>Total</th>' +
                '<th>CD</th>' +
                '<th>Application</th>' +
                '<th>Software</th>' +
                '<th>Hardware</th>' +
                '<th>Documentation</th>' +
                '<th>Wish</th>' +
                '<th>Training</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>';


            var request = new sql.Request(conn1);
            request
                .input('project_id', sql.Int, project_id)
                .query('SELECT [id],[name] from [customers] ' +
                    'INNER JOIN [projects_customers] AS pc ON [customers].[id] = pc.[customer_id]' +
                    'WHERE [project_id] = @project_id ORDER BY [id];')
                .then(function (data) {
                    var baselines = [];
                    var issueCount = [];
                    var customers = [];
                    var tableData = [];
                    //for each customer
                    async.eachOfSeries(data, function (data1, i, callback2) {
                        var conn2 = new sql.Connection(config, function (err) {
                            if (err) {
                                showNotification('error connecting for selecting issues of customers for distribution of issue Table: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
                            } else {
                                var request = new sql.Request(conn2);
                                request.multiple = true;
                                request
                                    .input('project_id', sql.Int, project_id)
                                    .input('customer_id', sql.Int, data1.id)
                                    .query('SELECT COUNT([issues].[id]) AS total FROM [issues] ' + //for selecting total number of issues
                                        'INNER JOIN [issues_customers] as ic ON [issues].[id] = ic.[issue_id] ' +
                                        'INNER JOIN [customers] ON customers.[id] = ic.[customer_id] ' +
                                        'WHERE [customers].id = @customer_id AND [issues].[project_id] = @project_id; ' +
                                        'SELECT [baselines].[cd] from [baselines] ' + //for selecting  baselines
                                        'INNER JOIN [issues_baselines] AS ib ON [baselines].id = ib.[baseline_id] ' +
                                        'INNER JOIN [issues] ON ib.issue_id = [issues].[id] ' +
                                        'INNER JOIN [issues_customers] AS ic ON ic.[issue_id] = [issues].[id] ' +
                                        'INNER JOIN [customers] ON [customers].[id] = ic.[customer_id] ' +
                                        'WHERE [issues].[project_id] = @project_id AND [customers].[id] = @customer_id GROUP BY [baselines].[cd]; ')
                                    .then(function (data21) {
                                        issueCount[i] = data21[0];
                                        baselines[i] = data21[1];
                                        customers[i] = data1;
                                        callback2();
                                    });
                            }
                        });
                    }, function () {

                        async.timesSeries(issueCount.length, function (n, callback3) {
                            getdataTable(baselines[n], customers[n].id, function (result) {
                                docx += '<tr>' +
                                    '<td rowspan="' + (baselines[n].length + 1) + '">' + customers[n].name + '</td>' +
                                    '<td rowspan="' + (baselines[n].length + 1) + '">' + issueCount[n][0].total + '</td>';
                                docx += result + '</tr>';
                            });
                            callback3();
                        }, function () {
                            setTimeout(function () {
                                docx += '</tbody>' +
                                    '</table>' +
                                    '</body>' +
                                    '</html>';
                                dialog.showSaveDialog({
                                    filters: [{
                                        name: 'Xlsx',
                                        extensions: ['xlsx']
                                    }],
                                    title: 'Save the Table as Excel',
                                    defaultPath: path.join(app.getPath('desktop'), 'Table.xlsx')
                                }, function (filename) {
                                    htmlTo(docx, (err, file) => {
                                        file.saveAs()
                                            .pipe(fs.createWriteStream(filename))
                                            .on('finish', () => console.log('Done.'));
                                    });
                                });

                            }, 1500);
                        });


                    });
                });
        }
    });
}


function getbasedata(area, key, baselines, project_id, callback) {
    var row = [];
    var keys = [];
    async.eachOfSeries(key, function (data1, i, callback2) {

        var conn2 = new sql.Connection(config, function (err) {
            if (err) {
                showNotification('error connecting for selecting issues of customers for distribution of issue Table: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');
            } else {
                var request = new sql.Request(conn2);
                var query = 'SELECT DISTINCT ';
                for (let s = 0; s < baselines.length; s++) {
                    request.input('baseline' + s, baselines[s].cd);
                    query += ' (SELECT COUNT(*) FROM issues ' +
                        'INNER JOIN issues_baselines AS ib ON ib.issue_id = issues.id ' +
                        'INNER JOIN baselines ON ib.baseline_id = baselines.id ' +
                        'INNER JOIN issues_keys AS ik ON ik.issue_id = issues.id ' +
                        'INNER JOIN keys ON ik.key_id = keys.id ' +
                        'WHERE [keys].[name] = @key AND [keys].[name] IS NOT NULL AND area = @area AND project_id = @project_id AND baselines.cd = @baseline' + s + ') AS ' + baselines[s].cd + ' ';
                    if (s !== (baselines.length - 1)) {
                        query += ' , ';
                    }
                }
                query += ' FROM issues';

                request
                    .input('area', area)
                    .input('project_id', sql.Int, project_id)
                    .input('key', data1.name)
                    .query(query)
                    .then(function (data21) {
                        row[i] = data21;
                        keys[i] = data1.name;
                        callback2();
                    });
            }
        });
    }, function () {
        var text = '';
        if (row.length === 0) {
            text += '<td colspan="' + (baselines.length + 2) + '">No Data</td>';
        } else if (row.length === 1) {
            text += '<td>' + keys[0] + '</td>';
            var total = 0;
            for (let r = 0; r < baselines.length; r++) {
                var o = baselines[r].cd;
                text += '<td>' + row[0][0][o] + '</td>';
                total += row[0][0][o];
            }
            text += '<td>' + total + '</td>';
        } else {
            for (let i = 0; i < row.length; i++) {
                text += '<tr>' +
                    '<td>' + keys[i] + '</td>';
                var total = 0;
                for (let r = 0; r < baselines.length; r++) {
                    var o = baselines[r].cd;
                    text += '<td>' + row[i][0][o] + '</td>';
                    total += row[i][0][o];
                }
                text += '<td>' + total + '</td></tr>';
            }
        }

        callback(text);
    });
}

// word doc for frag Table 
function fragWord(project_id) {

    async.waterfall([
        function (callback) {
            var conn1 = new sql.Connection(config, function (error) {
                if (error) {
                    showNotification('error connecting for selecting CD baselines Table:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var request = new sql.Request(conn1);
                    request
                        .input('project_id', project_id)
                        .query('SELECT DISTINCT cd FROM baselines ' +
                            'INNER JOIN projects_baselines AS pb ON pb.baseline_id = baselines.id ' +
                            'WHERE project_id = @project_id ORDER BY cd ')
                        .then(function (data) {
                            var docx = '<!DOCTYPE html>' +
                                '<html>' +
                                '<head>' +
                                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
                                '<style>' +
                                'table{' +
                                'width: 100%;' +
                                'border-collapse: collapse;' +
                                '}' +
                                'th {' +
                                '   background-color: #a2d8f2;' +
                                '   color: white;' +
                                '}' +
                                'table, th, td{' +
                                'padding: 5px;' +
                                'border: 1px solid black;' +
                                'text-align: center;' +
                                '}' +
                                '.bold {' +
                                'text-align: left;' +
                                'font-weight: bold;' +
                                'width: 20%;' +
                                '}' +
                                '</style>' +
                                '</head>' +
                                '<body>';
                            docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Project ID: ' + document.getElementById('projectID').value +'<br style="page-break-before: always; clear: both" />';
                            if (document.getElementById('table-doc-id').checked === true) {
                                docx += '<br><br><br><p style="text-align:center;font-size: 36px;" class="bold">Doc ID: ' + document.getElementById('table-doc-id-name').value + '</p><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>';
                            }
                            docx += '<table>' +
                                '<thead>' +
                                '<tr>' +
                                '<th>Area</th>' +
                                '<th>Key</th>';
                            for (let i = 0; i < data.length; i++) {
                                docx += '<th>' + data[i].cd + '</th>';
                            }
                            docx += '<th>Total</th>' +
                                '</tr>' +
                                '</thead>' +
                                '<tbody>';
                            callback(null, docx, data);
                        });
                }
            });

        },
        function (docx, baselines, callback) {
            var keyArr = [];
            var area = {
                application: {
                    name: 'Application',
                    id: 1
                },
                software: {
                    name: 'Software',
                    id: 2
                },
                hardware: {
                    name: 'Hardware',
                    id: 3
                },
                documentation: {
                    name: 'Documentation',
                    id: 4
                },
                wish: {
                    name: 'Wish',
                    id: 5
                },
                training: {
                    name: 'Training',
                    id: 6
                }
            };
            var num = [1,2,3,4,5,6];
            var areaArr = ['application', 'software', 'hardware', 'documentation', 'wish', 'training'];
            async.eachOfSeries(num, function (d, n, callback3) {
                var conn1 = new sql.Connection(config, function (error) {
                    if (error) {
                        showNotification('error connecting for selecting CD baselines Table:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                    } else {
                        var request = new sql.Request(conn1);
                        request
                            .input('project_id', project_id)
                            .input('area', d)
                            .query('SELECT DISTINCT [name] FROM keys '+
                            'INNER JOIN projects_keys AS pk ON pk.key_id = keys.id '+
                            'INNER JOIN issues_keys AS ik ON ik.key_id = [keys].[id] ' +
                            'INNER JOIN issues ON ik.issue_id = [issues].[id] ' +
                            ' WHERE [pk].[project_id] = @project_id AND area = @area AND [keys].[name] IS NOT NULL  ORDER BY [keys].[name]')
                            .then(function (data) {
                                keyArr[n] = data;
                                callback3();
                            });
                    }
                });

            }, function () {
                
                async.timesSeries(keyArr.length, function (n, callback3) {
                    var rowSpan = 0;
                    if (keyArr[n].length === 0 || keyArr[n].length === 1) {
                        rowSpan = 1;
                    } else {
                        rowSpan = keyArr[n].length + 1;
                    }
                    getbasedata(n+1, keyArr[n], baselines, project_id, function (result) {
                        docx += '<tr>' +
                            '<td rowspan="' + rowSpan + '">' + areaArr[n] + '</td>';
                        docx += result + '</tr>';
                    });
                    callback3();
                }, function () {
                    setTimeout(function () {

                        docx += '</tbody>' +
                            '</table>' +
                            '</body>' +
                            '</html>';
                        var converted = htmlDocx.asBlob(docx);
                        var buffer = toBuffer(converted, function (err, buffer) {
                          if (err) throw err;
                          dialog.showSaveDialog({
                            filters: [{
                                name: 'Word',
                                extensions: ['docx']
                            }],
                            title: 'Save the Table as Word',
                            defaultPath: path.join(app.getPath('desktop'), 'Table')
                          }, function (filename) {
                              fs.writeFileSync(filename, buffer);
                          });                                
                        });
                        //FileSaver.saveAs(converted, 'table.docx');
                    }, 1500);
                });
                callback(null, docx);
            });
        }
    ]);
}

// pdf doc for frag Table 
function fragPdf(project_id) {

    async.waterfall([
        function (callback) {
            var conn1 = new sql.Connection(config, function (error) {
                if (error) {
                    showNotification('error connecting for selecting CD baselines Table:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var request = new sql.Request(conn1);
                    request
                        .input('project_id', project_id)
                        .query('SELECT DISTINCT cd FROM baselines ' +
                            'INNER JOIN projects_baselines AS pb ON pb.baseline_id = baselines.id ' +
                            'WHERE project_id = @project_id ORDER BY cd ')
                        .then(function (data) {
                            var docx = '<!DOCTYPE html>' +
                                '<html>' +
                                '<head>' +
                                '<style>' +
                                'table{' +
                                'width: 100%;' +
                                'border-collapse: collapse;' +
                                '}' +
                                'th {' +
                                '   background-color: #a2d8f2;' +
                                '   color: white;' +
                                '}' +
                                'table, th, td{' +
                                'padding: 5px;' +
                                'border: 1px solid black;' +
                                'text-align: center;' +
                                '}' +
                                '.bold {' +
                                'text-align: left;' +
                                'font-weight: bold;' +
                                'width: 20%;' +
                                '}' +
                                '.table-cell{'+
                                'position: relative;'+
                                '}'+
                                '.table-cell:before{'+
                                'position: absolute;'+
                                'content: "";'+
                                'top: 0;'+
                                'left: -1px;'+
                                'background-color: black;'+
                                'width: 1px;'+
                                'height: 100%;'+
                                '}'+
                                '</style>' +
                                '</head>' +
                                '<body>';
                            docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Project ID: ' + document.getElementById('projectID').value +'<div style="page-break-after:always;"></div>';
                            if (document.getElementById('table-doc-id').checked === true) {
                                docx += '<br><br><br><p style="text-align:center;font-size: 36px;font-weight: bold;">Doc ID: ' + document.getElementById('table-doc-id-name').value + '</p><div style="page-break-after:always;"></div>';
                            }
                            docx += '<table>' +
                                '<thead>' +
                                '<tr>' +
                                '<th>Area</th>' +
                                '<th>Key</th>';
                            for (let i = 0; i < data.length; i++) {
                                docx += '<th>' + data[i].cd + '</th>';
                            }
                            docx += '<th>Total</th>' +
                                '</tr>' +
                                '</thead>' +
                                '<tbody>';
                            callback(null, docx, data);
                        });
                }
            });

        },
        function (docx, baselines, callback) {
            var keyArr = [];
            var area = {
                application: {
                    name: 'Application',
                    id: 1
                },
                software: {
                    name: 'Software',
                    id: 2
                },
                hardware: {
                    name: 'Hardware',
                    id: 3
                },
                documentation: {
                    name: 'Documentation',
                    id: 4
                },
                wish: {
                    name: 'Wish',
                    id: 5
                },
                training: {
                    name: 'Training',
                    id: 6
                }
            };
            var num = [1,2,3,4,5,6];
            var areaArr = ['application', 'software', 'hardware', 'documentation', 'wish', 'training'];
            async.eachOfSeries(num, function (d, n, callback3) {
                var conn1 = new sql.Connection(config, function (error) {
                    if (error) {
                        showNotification('error connecting for selecting CD baselines Table:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                    } else {
                        var request = new sql.Request(conn1);
                        request
                            .input('project_id', project_id)
                            .input('area', d)
                            .query('SELECT DISTINCT [name] FROM keys '+
                            'INNER JOIN projects_keys AS pk ON pk.key_id = keys.id '+
                            'INNER JOIN issues_keys AS ik ON ik.key_id = [keys].[id] ' +
                            'INNER JOIN issues ON ik.issue_id = issues.id ' +
                            ' WHERE [pk].[project_id] = @project_id AND area = @area AND [keys].[name] IS NOT NULL  ORDER BY [keys].[name]')
                            .then(function (data) {
                                keyArr[n] = data;
                                callback3();
                            });
                    }
                });

            }, function () {
                async.timesSeries(keyArr.length, function (n, callback3) {
                    var rowSpan = 0;
                    if (keyArr[n].length === 0 || keyArr[n].length === 1) {
                        rowSpan = 1;
                    } else {
                        rowSpan = keyArr[n].length + 1;
                    }
                    getbasedata(n+1, keyArr[n], baselines, project_id, function (result) {
                        docx += '<tr>' +
                            '<td class="table-cell" rowspan="' + rowSpan + '">' + areaArr[n] + '</td>';
                        docx += result + '</tr>';
                    });
                    callback3();
                }, function () {
                    setTimeout(function () {
                        docx += '</tbody>' +
                            '</table>' +
                            '</body>' +
                            '</html>';
                        var conf = {
                            "format": "A4",
                            "header": {
                                "height": "20mm"
                            }
                        };
                        dialog.showSaveDialog({
                            filters: [{
                                name: 'PDFs',
                                extensions: ['pdf']
                            }],
                            title: 'Save the Table as PDF',
                            defaultPath: path.join(app.getPath('desktop'), 'Table.pdf')
                        }, function (filename) {
                            pdf.create(docx, conf).toFile(filename, function (err, res) {});
                        });
                    }, 1500);
                });
                callback(null, docx);
            });
        }
    ]);
}

// excel doc for frag Table 
function fragExcel(project_id) {

    async.waterfall([
        function (callback) {
            var conn1 = new sql.Connection(config, function (error) {
                if (error) {
                    showNotification('error connecting for selecting CD baselines Table:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var request = new sql.Request(conn1);
                    request
                        .input('project_id', project_id)
                        .query('SELECT DISTINCT cd FROM baselines ' +
                            'INNER JOIN projects_baselines AS pb ON pb.baseline_id = baselines.id ' +
                            'WHERE project_id = @project_id ORDER BY cd ')
                        .then(function (data) {
                            var docx = '<!DOCTYPE html>' +
                                '<html>' +
                                '<head>' +
                                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
                                '<style>' +
                                'table{' +
                                'width: 100%;' +
                                'border-collapse: collapse;' +
                                '}' +
                                'th {' +
                                '   background-color: #a2d8f2;' +
                                '   color: white;' +
                                '}' +
                                'table, th, td{' +
                                'padding: 5px;' +
                                'border: 1px solid black;' +
                                'text-align: center;' +
                                'width:auto;' +
                                'height:auto;' +
                                'vertical-align:middle;' +
                                '}' +
                                '.doc-id {' +
                                'border: 0px solid black;' +
                                'font-weight: bold;' +
                                'font-size: 36px;' +
                                'height: 38px;' +
                                '}' +
                                '.bold {' +
                                'text-align: left;' +
                                'font-weight: bold;' +
                                'width: 20%;' +
                                '}' +
                                '</style>' +
                                '</head>' +
                                '<body>' +
                                '<body>' +
                                '<table id="table">';
                            docx += '<tr><td class="doc-id"></td></tr><tr><td class="doc-id"></td><td class="doc-id">Doc ID: ' + document.getElementById('projectID').value + '</td></tr><tr><td class="doc-id"></td></tr><tr><td class="doc-id"></td></tr>';
                            if (document.getElementById('table-doc-id').checked === true) {
                                docx += '<tr><td class="doc-id"></td></tr><tr><td class="doc-id"></td><td class="doc-id">Doc ID: ' + document.getElementById('table-doc-id-name').value + '</td></tr><tr><td class="doc-id"></td></tr><tr><td class="doc-id"></td></tr>';
                            }
                            docx += '<thead>' +
                                '<tr>' +
                                '<th>Area</th>' +
                                '<th>Key</th>';
                            for (let i = 0; i < data.length; i++) {
                                docx += '<th>' + data[i].cd + '</th>';
                            }
                            docx += '<th>Total</th>' +
                                '</tr>' +
                                '</thead>' +
                                '<tbody>';
                            callback(null, docx, data);
                        });
                }
            });

        },
        function (docx, baselines, callback) {
            var keyArr = [];
            var area = {
                application: {
                    name: 'Application',
                    id: 1
                },
                software: {
                    name: 'Software',
                    id: 2
                },
                hardware: {
                    name: 'Hardware',
                    id: 3
                },
                documentation: {
                    name: 'Documentation',
                    id: 4
                },
                wish: {
                    name: 'Wish',
                    id: 5
                },
                training: {
                    name: 'Training',
                    id: 6
                }
            };
            var num = [1,2,3,4,5,6];
            var areaArr = ['application', 'software', 'hardware', 'documentation', 'wish', 'training'];
            async.eachOfSeries(num, function (d, n, callback3) {
                var conn1 = new sql.Connection(config, function (error) {
                    if (error) {
                        showNotification('error connecting for selecting CD baselines Table:' + error.message, 'danger', 'glyphicon glyphicon-tasks');
                    } else {
                        var request = new sql.Request(conn1);
                        request
                            .input('project_id', project_id)
                            .input('area', d)
                            .query('SELECT DISTINCT [name] FROM keys '+
                            'INNER JOIN [projects_keys] AS pk ON pk.key_id = keys.[id] '+
                            'INNER JOIN [issues_keys] AS ik ON ik.key_id = [keys].[id] ' +
                            'INNER JOIN [issues] ON [ik].[issue_id] = [issues].[id] ' +
                            ' WHERE [pk].[project_id] = @project_id AND area = @area AND [keys].[name] IS NOT NULL  ORDER BY [keys].[name]')
                            .then(function (data) {
                                keyArr[n] = data;
                                callback3();
                            });
                    }
                });

            }, function () {
                async.timesSeries(keyArr.length, function (n, callback3) {
                    var rowSpan = 0;
                    if (keyArr[n].length === 0 || keyArr[n].length === 1) {
                        rowSpan = 1;
                    } else {
                        rowSpan = keyArr[n].length + 1;
                    }
                    getbasedata(n+1, keyArr[n], baselines, project_id, function (result) {
                        docx += '<tr>' +
                            '<td rowspan="' + rowSpan + '">' + areaArr[n] + '</td>';
                        docx += result + '</tr>';
                    });
                    callback3();
                }, function () {
                    setTimeout(function () {
                        docx += '</tbody>' +
                            '</table>' +
                            '</body>' +
                            '</html>';
                        dialog.showSaveDialog({
                            filters: [{
                                name: 'Xlsx',
                                extensions: ['xlsx']
                            }],
                            title: 'Save the Table as Excel',
                            defaultPath: path.join(app.getPath('desktop'), 'Table.xlsx')
                        }, function (filename) {
                            htmlTo(docx, (err, file) => {
                                if (err) showNotification('Error on saveing file: ' + err.message, 'danger', 'glyphicon glyphicon-tasks');

                                file.saveAs()
                                    .pipe(fs.createWriteStream(filename))
                                    .on('finish', () => console.log('Done.'));
                            });
                        });

                    }, 1500);
                });
                callback(null, docx);
            });
        }
    ]);
}