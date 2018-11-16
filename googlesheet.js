/**
 * @author maizy
 * @dated 16/11/18
 * @description This is the wrapper for implementing the google sheet crud
 */

var fs = require('fs');
var readline = require('readline');
var { google } = require("googleapis")
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = "./TOKEN_DIR";
var TOKEN_PATH = './.credentials/token.json'; // first time if you run the sample code this file will generate,
var SPREADSHEET_JSON_FILE = './client_secret_429153927181-fi3rrdva7kscipt9o728f4i2gkncnbov.apps.googleusercontent.com.json'; //use the download the credentials file here
var Default_SpreadSheet_ID ="1FFUJxJj5t9ZOoz2zN4p0ToOO2RhF7r83q7W4v7QEtTc";
// Store token to disk be used in later program executions.
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

// Get and store new token after prompting for user authorization, and then
// execute the given callback with the authorized OAuth2 client.
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            // oauth2Client.credentials = token;
            oauth2Client.setCredentials(token);
            storeToken(token);
            callback(oauth2Client);
        });
    });
}
// Create an OAuth2 client with the given credentials, and then execute the given callback function.
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new googleAuth.OAuth2Client(clientId, clientSecret, redirectUrl);
// Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            console.log(JSON.parse(token));
            oauth2Client.setCredentials(JSON.parse(token));
            callback(oauth2Client);
        }
    });
}


function readLocalJSON(filePath,callback){
    fs.readFile(filePath, function (err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            callback(err,null);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Google Sheets API.
        callback(null,content);
    });
}

var Read = function (options, callback) {
    if(typeof options != "object"){
        options = {

        };
    }
    function listMajors(auth,callback) {
        const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
            spreadsheetId: options.spreadsheetId || Default_SpreadSheet_ID,
            range: options.range ||'!A:B',
            majorDimension: 'ROWS'
        }, (err, res) => {
            if (err) {
                console.log('The API returned an error: ' + err);
                (callback && typeof callback == "function")?callback(err,null):function(){};
            }

            console.log(res);
            const rows = res.data.values;
            if (rows.length) {
                // Print columns A and E, which correspond to indices 0 and 4.
                rows.map((row) => {
                    console.log(row);
                });
            } else {
                console.log('No data found.');
            }
            (callback && typeof callback == "function")?callback(null,rows):function(){};
        });
    }
// Load client secrets from a local file.
    fs.readFile(SPREADSHEET_JSON_FILE, function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
// Authorize a client with the loaded credentials, then call the
// Google Sheets API.
        authorize(JSON.parse(content), function (auth) {
            listMajors(auth,callback); // without callback if you want callback pass as a second parameter.
        }); // listMajors is the callback action for authorize function.
    });
    return null;
}

var Create = function (options,callback) {
    if(typeof options != "object"){
        options = {

        };
    }

    function listMajors(auth,callback) {
        var sheets = google.sheets('v4');
        var SPREADSHEET_ID = options.spreadsheetId || Default_SpreadSheet_ID;
        var range = options.range ||"A1:B1";
        var requestInsert = {
            auth: auth,
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'RAW',
            resource : {
                range: range,
                'majorDimension': 'ROWS',
                'values': options.data || [["name","list"]]
            }
        };
        sheets.spreadsheets.values.update(requestInsert, function(err, response) {
            if (err) {
                 console.log("Error on create record in spread sheet " + err );
                (callback && typeof callback == "function")?callback(err,null):function(){};
            }
            console.log(response,' record Inserted.');
            (callback && typeof callback == "function")?callback(null,response):function(){};
        });
    }
// Load client secrets from a local file.
    fs.readFile(SPREADSHEET_JSON_FILE, function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
// Authorize a client with the loaded credentials, then call the
// Google Sheets API.
        authorize(JSON.parse(content), function (auth) {
            listMajors(auth,callback); // without callback if you want callback pass as a second parameter.
        }); // listMajors is the callback action for authorize function.
    });
};

var Delete = function (options,callback) {
    // configurable options for the delete
    if(typeof options != "object"){
        options = {

        };
    }
    // Print the names and majors of students in a sample spreadsheet:
    function listMajors(auth,callback) {
        var sheets = google.sheets('v4');
        var SPREADSHEET_ID = options.spreadsheetId || Default_SpreadSheet_ID;
        var range = options.range || 0; // Range in numbers for delete default = 0
        var sheetId = options.sheetId || 0; // SpreadSheet sheed id like sheet1 is == 0 set by Default
        var deleteRequest = {
            auth: auth,
            spreadsheetId: SPREADSHEET_ID,
            resource : {
                'requests': [
                    {
                        'deleteDimension': {
                            'range': {
                                'sheetId': sheetId,
                                'dimension': 'ROWS',
                                'startIndex': range,
                                'endIndex': range+1
                            }
                        }
                    }
                ]
            },
        };
        sheets.spreadsheets.batchUpdate(deleteRequest, function(err, response) {
            if (err) {
                console.log(err);
                //safe check if callback provided else anonymous functions
                (callback && typeof callback == "function")?callback(err,null):function(){};
            }
            (callback && typeof callback == "function")?callback(null,response):function(){};
        });
    }
// Load client secrets from a local file.
    fs.readFile(SPREADSHEET_JSON_FILE, function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Google Sheets API.
        authorize(JSON.parse(content), function (auth) {
            listMajors(auth,callback); // without callback if you want callback pass as a second parameter.
        }); // listMajors is the callback action for authorize function.
    });
};

module.exports = (function(){
    // Passing explicitly the JS engine to parse this in strict mode to avoid the unexpected errors
    "use strict";
    readLocalJSON(SPREADSHEET_JSON_FILE,function (err, content) {
        if(!err){

        }else{
            var credentials = JSON.parse(content);
            authorize(credentials, function (oauth2Client) {
                //async callback
                // TODO Task if any
            });
        }
    });
    return {
        read: Read,
        create : Create,
        del : Delete
    }

}.call({}));