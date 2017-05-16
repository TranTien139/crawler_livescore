var express = require('express')
var app = express();
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var CronJob = require('cron').CronJob;

var server = require('http').createServer(app);
var port = process.env.PORT || 8080;

var list_doi_bong = require('./app/constant/const.js');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'livescore',
    charset: 'utf8'
});

connection.connect();

var job_result  = require('./app/functions/RunJob.js');
var init = require('./app/functions/RunOneTime.js');
var list_doi_bong = require('./app/constant/const.js');
var lis_tab_laydoibong = [3, 7, 2, 5, 53, 1];

new CronJob('* */30 * * * *', function () {

    for (var $i = 0; $i < list_doi_bong.length; $i++) {
        var leagueID = list_doi_bong[$i].LeagueID;
        if (typeof leagueID != 'undefined') {
            job_result.getLichThiDau('http://bongdaso.com/_ComingMatches.aspx?LeagueID=' + leagueID + '&SeasonID=-1&Period=1&Odd=1',request, cheerio,connection);
            job_result.getKetQuaThiDau('http://bongdaso.com/_PlayedMatches.aspx?LeagueID=' + leagueID + '&SeasonID=-1&Period=1',request, cheerio,connection);
        }
    }
}, null, true, 'Asia/Ho_Chi_Minh');

new CronJob('* * */2 * * *', function () {
    for (var $i = 0; $i < list_doi_bong.length; $i++) {
        var leagueID = list_doi_bong[$i].LeagueID;
        if (typeof leagueID != 'undefined') {
            job_result.getBangXepHang('http://bongdaso.com/Standing.aspx?LeagueID=' + leagueID,request, cheerio,connection);
        }
    }
}, null, true, 'Asia/Ho_Chi_Minh');

//ham chay 1 lam
// init.getListTeam(connection,list_doi_bong);
//
// for (var $i = 0; $i < list_doi_bong.length; $i++) {
//     var leagueID = list_doi_bong[$i].LeagueID;
//     if (typeof leagueID != 'undefined') {
//         init.getBangXepHangCacNam('http://bongdaso.com/Standing.aspx?LeagueID=' + leagueID,request,cheerio,connection);
//     }
// }
//
// connection.query('truncate doi_bong', function (error, result) {
//     if (!error) {
//         console.log('truncate success');
//     } else {
//         console.log(error);
//     }
// });
//
// for (var $i = 0; $i < lis_tab_laydoibong.length; $i++) {
//     init.genListDoiBong('http://bongdaso.com/Association.aspx?FBAssID=' + lis_tab_laydoibong[$i] + '&Tab=1', connection,request,cheerio);
// }
//ket thuc ham chay 1 lan


app.set('view engine', 'ejs');
require('./app/routes.js')(app, connection, server);

server.listen(port, '127.0.0.1', function (err) {
    console.log('listen port: ', port);
});




