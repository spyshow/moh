/**
 * Created by jihad.kherfan on 10/21/2016.
 */


/**
 TODO

 1- correct the word creation

 */

var electron = require('electron');
var ipc = electron.ipcRenderer;
var mysql = require("promise-mysql");
var fs = require('fs');
var officegen = require('officegen');
var project_ID = 1;
var PDFDocument = require('pdfkit');


//======================================================================================================================
//getDate
function getDate(){
    var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    return year+'-'+month+'-'+day;
}

function convertDate(str){
    var date = new Date(str),
        mnth = ("0" + (date.getMonth()+1)).slice(-2),
        day  = ("0" + date.getDate()).slice(-2);
    return [ date.getFullYear(), mnth, day ].join("-");
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
//create Mysql connection
var connection = mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : '',
    database: 'test'
});

//======================================================================================================================
// prepair doc

var doc = officegen ({
    'type': 'docx',
    'onend': function ( written ) {
        console.log ( 'Finish to create a word file.\nTotal bytes created: ' + written + '\n' );
    },
    'onerr': function ( err ) {
        console.log ( err );
    }
});

//======================================================================================================================
// on page ready

$(document).ready(function(){
    var html  ='';
    //get customers and put them in the select menu
    connection.getConnection(function(err,conn) { //make connection to DB
        if (err) { //error handling
            showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
            return;
        }
        conn.query('SELECT name,id FROM customers ' +
            'INNER JOIN projects_customers AS pc ON customers.id = pc.customer_id ' +
            ' WHERE ? ',[{project_id: project_ID}], function (error, data) {
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
        conn.release();
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
     conn.release();
     }); */


    //get docx file ready
    $('#word').click(function(e){
        e.preventDefault();
        var option;
        var res=[];
        //get the type of report
       // var customer = document.getElementById('customers').options[document.getElementById('customers').selectedIndex].value;
        switch($("input[name=report-type]:checked").val()){
            case 'all-issues':
                option = {project_id: project_ID};
                break;

            case  'all-issues-customer':
                option = {project_id: project_ID, customer: customer};
                break;
        }

        var pObj = doc.createP();
        if(document.getElementById('first-page').checked === true ){
            pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();
            pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();
            pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();
            pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();
            pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();pObj.addLineBreak();
            pObj.addLineBreak();
        }
        if(document.getElementById('doc-id').checked === true ){
            pObj.addText('Doc ID :   '+ document.getElementById('doc-id-name').value , { bold: true, underline: true , font_size: 18});
            pObj.addLineBreak();
            pObj.addLineBreak();
        }

        connection.getConnection(function(err,conn) { //make connection to DB
            if (err) { //error handling
                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                return;
            }
            conn.query('SELECT id, dbid , date, charm , defect ,issues.key , status, summary, description FROM issues WHERE ?',[option], function (error, data) {
                if (error) {
                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                } else {
                    var out;
                    data.forEach(function(data){
                        connection.getConnection(function(err,conn2) { //make connection to DB
                            if (err) { //error handling
                                showNotification('error connecting: ' + err.stack,'danger','glyphicon glyphicon-tasks');
                                return;
                            }
                            conn2.query('SELECT date, description FROM actions WHERE ?',[{"issue_id": data.id}], function (error, action) {
                                if (error) {
                                    showNotification('Error :' + error, 'danger', 'glyphicon glyphicon-tasks');
                                } else {
                                    var pObj = doc.createP();
                                    pObj.addText('Number :                '+data.dbid);
                                    pObj.addLineBreak();
                                    pObj.addText('Date   :                    '+data.date);
                                    pObj.addLineBreak();
                                    pObj.addText('Customers :            ');
                                    pObj.addLineBreak();
                                    pObj.addText('Baseline :            ');
                                    pObj.addLineBreak();
                                    pObj.addText('Error/Wish :            '+data.key);
                                    pObj.addLineBreak();
                                    pObj.addLineBreak();
                                    pObj.addText('Charm :  '+data.charm+' / Defect :  '+data.defect+'                   Status : '+data.status);
                                    pObj.addLineBreak();
                                    pObj.addText('Summary :                '+data.summary);
                                    pObj.addLineBreak();
                                    pObj.addText('Description :            '+data.description);
                                    pObj.addLineBreak();
                                    pObj.addText('Actions/ History :');
                                    pObj.addLineBreak();
                                    var i=1;
                                    action.forEach(function(data2){
                                        pObj.addLineBreak();
                                        pObj.addText('         '+i+'- date            : '+convertDate(data2.date));
                                        pObj.addLineBreak();
                                        pObj.addText('            description : '+data2.description);
                                        pObj.addLineBreak();
                                        i++;
                                    });
                                    i=1;
                                    doc.putPageBreak ();
                                }
                                out = fs.createWriteStream ( __dirname+'/../out.docx' );
                                doc.generate (out);
                            });
                            conn2.release();
                        });
                    });
                }
            });
            conn.release();
        });


    });//.click();

    //get PDF file ready
    $('#pdf').click(function(e) {
        e.preventDefault();
        var pdf = new PDFDocument;
        pdf.pipe(fs.createWriteStream(__dirname + '/../MyFile.pdf'));
        var option;
        //get the type of report
        // var customer = document.getElementById('customers').options[document.getElementById('customers').selectedIndex].value;
        switch ($("input[name=report-type]:checked").val()) {
            case 'all-issues':
                option = {project_id: project_ID};
                break;

            case  'all-issues-customer':
                option = {project_id: project_ID, customer: customer};
                break;
        }


        if (document.getElementById('first-page').checked === true) {
            pdf.addPage();
        }
        if (document.getElementById('doc-id').checked === true) {
            pdf.fontSize(18).text('Doc ID :   ' + document.getElementById('doc-id-name').value, {align: 'center'}).moveDown();
        }


            connection.query('SELECT issues.id, issues.dbid , issues.date, issues.charm , issues.defect ,issues.key , issues.status, issues.summary, issues.description , actions.date as action_date, actions.description as action_desc FROM issues' +
                ' LEFT JOIN actions on issues.id = actions.issue_id WHERE ? ', [{project_id: 1}]).then(function (data) {

                    var lastID = -1;
                    data.forEach(function (data) {
                        if (lastID !== data.id) {
                            lastID = data.id;
                            pdf.addPage();
                            pdf.text('Number :' + data.dbid).moveDown();
                            pdf.text('Customers :            ');
                            pdf.text('Baseline :            ');
                            pdf.text('Error/Wish :            ' + data.key).moveDown();
                            pdf.text('Charm :  ' + data.charm + ' / Defect :  ' + data.defect + '               Status : ' + data.status);
                            pdf.text('Summary :                ' + data.summary);
                            pdf.text('Description :            ' + data.description).moveDown();
                            pdf.text('Actions/ History :').moveDown();
                        }
                        if(data.action_date !== '1970-1-1')pdf.text('          - date        : ' + convertDate(data.action_date));
                        if(data.action_desc)pdf.text('            description : ' + data.action_desc).moveDown();
                    });
                pdf.end();
                });



    });
});


