var express = require('express')
var app = express();
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var server = require('http').createServer(app);
var port = process.env.PORT || 8080;

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'livescore',
    charset: 'utf8'
});

connection.connect();

var list_doi_bong = [{
    "LeagueID": 1,
    "name": "Bóng Đá Anh",
    "flag": "http://img.kenhthethao.vn/2017/05/flag-Anh2.png",
    "order_giai_dau": 0
    },
    {
        "LeagueID": 4,
        "name": "Bóng Đá Tây Ban Nha",
        "flag": "http://img.kenhthethao.vn/2017/05/flag-tayBanNha.png",
        "order_giai_dau": 0
    },
    {
        "LeagueID": 6,
        "name": "Bóng Đá Pháp",
        "flag": "http://img.kenhthethao.vn/2017/05/flag-Phap.png",
        "order_giai_dau": 0
    },
    {
        "LeagueID": 5,
        "name": "Bóng Đá Đức",
        "flag": "http://img.kenhthethao.vn/2017/05/flag-Duc.png",
        "order_giai_dau": 0
    },
    {
        "LeagueID": 3,
        "name": "Bóng Đá Ý",
        "flag": "http://img.kenhthethao.vn/2017/05/flag-Y2.png",
        "order_giai_dau": 0
    },
    {
        "LeagueID": 2,
        "name": "Champion League",
        "flag": "http://img.kenhthethao.vn/2017/05/football_icon.png",
        "order_giai_dau": 0
    },
    {
        "LeagueID": 9,
        "name": "Euro Paleague",
        "flag": "http://img.kenhthethao.vn/2017/05/football_icon.png",
        "order_giai_dau": 0
    },
    {
        "LeagueID": 31,
        "name": "V-League",
        "flag": "http://img.kenhthethao.vn/2017/05/flag-Vietnam.png",
        "order_giai_dau": 0
    }];

function getKetQuaThiDau(url, callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);
            $('.played_box .fixture_list tr.ls:first-child').each(function () {

                var id_tour = getParameterByName('LeagueID', url);
                var name_tour = $(this).children().children('a').text();
                var check = 0;
                var stt = 0;

                $('.played_box .fixture_list tr').each(function () {
                    if ($(this).attr('class') === 'ls') {
                        check = 1;
                        stt++;
                    }
                    if (check == 0 || stt == 1) {
                        if ($(this).attr('class') !== 'ls') {
                            var time_start = $(this).children().eq(0).children().text();
                            if (time_start.trim() == '') {
                                time_start = $(this).children().eq(0).text();
                            }
                            time_start = time_start.trim();
                            time_start = time_start.split(' ');
                            var date = new Date();
                            var tach_time = time_start[0].split('/');

                            var time_start1 = date.getFullYear() + '/' + tach_time[1] + '/' + tach_time[0] + ' ' + time_start[1] + ':00';

                            var time_start2 = time_start[0] + '/' + date.getFullYear();

                            var home = $(this).children().eq(1).children().text();
                            var score = $(this).children().eq(2).text();
                            score = score.split('-');
                            var guest = $(this).children().eq(3).children('a').text();
                            var link_match = $(this).children().eq(4).children('a').attr('href');
                            if (link_match != 'undefined') {
                                link_match = 'http://bongdaso.com/' + link_match;
                            }

                            if (home.trim() != '' && guest.trim() != '') {
                                var metadata = {
                                    home_club_name: home,
                                    away_club_name: guest,
                                    home_goal: score[0],
                                    away_goal: score[1],
                                    is_postponed: 2,
                                    is_finish: 1,
                                    time_start: time_start1,
                                    LeagueID: id_tour,
                                    date_query: time_start2,
                                    link_match: link_match
                                }

                                var queryString = 'SELECT*FROM ketqua WHERE LeagueID = ' + id_tour + ' AND time_start = ' + "'" + time_start1 + "'" + ' AND home_club_name = ' + "'" + metadata.home_club_name + "'" + " LIMIT 1";
                                connection.query(queryString, function (err, rows, fields) {
                                    if (err) throw err;
                                    if (rows.length > 0) {
                                        connection.query('UPDATE ketqua SET ? WHERE LeagueID = ' + id_tour + ' AND time_start=' + "'" + time_start1 + "'" + ' AND home_club_name = ' + "'" + metadata.home_club_name + "'" + " LIMIT 1", metadata, function (error, result) {
                                            if (!error) {
                                                console.log('update ketqua success');
                                            } else {
                                                console.log(error);
                                            }
                                        });
                                    } else {
                                        connection.query('INSERT INTO ketqua SET ?', metadata, function (error, result) {
                                            if (!error) {
                                                console.log('insert ketqua success');
                                            } else {
                                                console.log(error);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
            });
        } else {
            console.log(err);
        }
    });
}

function getLichThiDau(url, callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);
            $('.coming_box .fx_coming tr.ls').each(function () {
                var id_tour = getParameterByName('LeagueID', url);

                var name_tour = $(this).children().children('a').text();
                var check = 0;

                $('.coming_box .fx_coming tr').each(function () {
                    if ($(this).attr('class') === 'ls') {
                        check = 1;
                    }
                    if (check == 1) {
                        if ($(this).attr('class') !== 'ls') {
                            var time_start = $(this).children().eq(0).children().text();
                            if (time_start.trim() == '') {
                                time_start = $(this).children().eq(0).text();
                            }
                            time_start = time_start.trim();
                            time_start = time_start.split(' ');
                            var date = new Date();

                            var tach_time = time_start[0].split('/');
                            var time_start1 = date.getFullYear() + '/' + tach_time[1] + '/' + tach_time[0] + ' ' + time_start[1] + ':00';

                            var time_start2 = time_start[0] + '/' + date.getFullYear();

                            var home = $(this).children().eq(1).children().text();

                            var match = home.split('-');
                            home = match[0];
                            home = home.trim();
                            guest = match[1];

                            var link_match = $(this).children().eq(5).children('a').attr('href');
                            if (typeof link_match != 'undefined') {
                                link_match = 'http://bongdaso.com/' + link_match;
                            }
                            if (typeof  home != 'undefined' && typeof  guest != 'undefined' && typeof time_start1 != 'undefined') {
                                var metadata = {
                                    home_club_name: home,
                                    away_club_name: guest,
                                    home_goal: 0,
                                    away_goal: 0,
                                    is_postponed: 2,
                                    time_start: time_start1,
                                    LeagueID: id_tour,
                                    date_query: time_start2,
                                    link_match: link_match
                                }
                                var queryString = 'SELECT*FROM ketqua WHERE LeagueID = ' + id_tour + ' AND time_start = ' + '"' + time_start1 + '"' + ' AND home_club_name = ' + '"' + metadata.home_club_name + '"' + ' LIMIT 1';
                                connection.query(queryString, function (err, rows, fields) {
                                    if (err) throw err;
                                    if (rows.length > 0) {
                                        connection.query('UPDATE ketqua SET ? WHERE LeagueID = ' + id_tour + ' AND time_start=' + '"' + time_start1 + '"' + ' AND home_club_name = ' + '"' + metadata.home_club_name + '"' + ' LIMIT 1', metadata, function (error, result) {
                                            if (!error) {
                                                console.log('update ketqua success');
                                            } else {
                                                console.log(error);
                                            }
                                        });
                                    } else {
                                        connection.query('INSERT INTO ketqua SET ?', metadata, function (error, result) {
                                            if (!error) {
                                                console.log('insert ketqua success');
                                            } else {
                                                console.log(error);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
            });
        } else {
            console.log(err);
        }
    });
}

// anh, tay ban nha, italia, duc, phap, champion legue, europa league, bong da viet nam
//var list_doi_bong = array(1,4,3,5,6,2,9,31);

function getListTeam(callback) {
    connection.query('TRUNCATE danh_sach_giai_dau', function (error, result) {
        if (!error) {
            console.log('truncate danh_sach_giai_dau success');
        } else {
            console.log(error);
        }
    });
    for (var $i = 0; $i < list_doi_bong.length; $i++) {
        connection.query('INSERT INTO danh_sach_giai_dau SET ?', list_doi_bong[$i], function (error, result) {
            if (!error) {
                console.log('insert danh_sach_giai_dau success');
            } else {
                console.log(error);
            }
        });
    }
}

function getBangXepHang(url, callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);
            var season_time_name = $('.season_list table td[class="ctbl_selected"]').text();
            var season_time_name = season_time_name.replace("Mùa bóng", "");
            season_time_name = season_time_name.trim();
            var season_id = 0;
            var list_seasons = [];
            var table = [];
            var stt = 0;
            var round = 0;

            var seasion_current = getParameterByName('SeasonID', url);

            if (seasion_current === null) {
                seasion_current = 1;
            } else {
                seasion_current = 0;
            }

            $('.standing_table table tr[align="right"]').each(function () {
                stt++;
                var football_club_name = $(this).children().eq(1).children('a').text();
                var total_match = $(this).children().eq(2).text();

                if (round < parseInt(total_match)) {
                    round = parseInt(total_match)
                }

                var point = $(this).children().eq(14).text();
                var total_win = parseInt($(this).children().eq(3).text()) + parseInt($(this).children().eq(8).text());
                var total_draw = parseInt($(this).children().eq(4).text()) + parseInt($(this).children().eq(9).text());
                var total_lose = parseInt($(this).children().eq(5).text()) + parseInt($(this).children().eq(10).text());
                var goal = $(this).children().eq(13).text();
                goal = goal.split('-');
                goal[0] = goal[0].trim();

                var metadata = {
                    id: '"' + stt + '"',
                    football_club_name: football_club_name,
                    total_match: total_match,
                    point: point,
                    total_win: '"' + total_win + '"',
                    total_draw: '"' + total_draw + '"',
                    total_lose: '"' + total_lose + '"',
                    goal: goal[0]
                }
                table.push(metadata);
            });
            table = JSON.stringify(table);

            var LeagueID = getParameterByName('LeagueID', url);
            if (LeagueID == 31) {
                season_time_name = (parseInt(season_time_name) - 1) + '-' + season_time_name;
            }

            var data = {
                seasion: season_time_name,
                LeagueID: LeagueID,
                round: round,
                data: table,
                seasion_current: seasion_current
            }

            var queryString = 'SELECT*FROM bang_xep_hang WHERE LeagueID = ' + LeagueID + ' AND seasion = ' + '"' + season_time_name + '"';
            connection.query(queryString, function (err, rows, fields) {
                if (err) throw err;
                if (rows.length > 0) {
                    connection.query('UPDATE bang_xep_hang SET ? WHERE LeagueID = ' + LeagueID + ' AND seasion = ' + '"' + season_time_name + '"', data, function (error, result) {
                        if (!error) {
                            console.log('update success');
                        } else {
                            console.log(error);
                        }
                    });
                } else {
                    connection.query('INSERT INTO bang_xep_hang SET ?', data, function (error, result) {
                        if (!error) {
                            console.log('insert success');
                        } else {
                            console.log(error);
                        }
                    });
                }
            });
        } else {
            console.log(err);
        }
    });
}

function getBangXepHangCacNam(url, callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);
            var list_year = [];
            $('.season_list table td a').each(function () {
                var sesionID = $(this).attr('href');
                if (typeof sesionID != 'undefined') {
                    getBangXepHang('http://bongdaso.com/' + sesionID);
                }
            });
        }
    });
}

var lis_tab_laydoibong = [3, 7, 2, 5, 53, 1];

function genListDoiBong(url, callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);
            $('.menu_tab_box .club_list a h4').each(function () {
                var name = $(this).text().trim();

                var nn = ChangeToSlug(name);
                nn = nn.replace(' ', '_');
                name1 = nn + '_fc';
                var data = {
                    name: name,
                    tag: name1
                }
                connection.query('INSERT INTO doi_bong SET ?', data, function (error, result) {
                    if (!error) {
                        console.log('insert doi_bong success');
                    } else {
                        console.log(error);
                    }
                });
            });
        } else {
            console.log(err);
        }
    });
}

function ChangeToSlug(title) {
    var slug;
    slug = title.toLowerCase();
    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    return slug;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


//các hàm chạy job
// for (var $i = 0; $i < list_doi_bong.length; $i++) {
//     var leagueID = list_doi_bong[$i].LeagueID;
//     if (typeof leagueID != 'undefined') {
//         getLichThiDau('http://bongdaso.com/_ComingMatches.aspx?LeagueID=' + leagueID + '&SeasonID=-1&Period=1&Odd=1');
//         getKetQuaThiDau('http://bongdaso.com/_PlayedMatches.aspx?LeagueID=' + leagueID + '&SeasonID=-1&Period=1');
//     }
// }
//
// for (var $i = 0; $i < list_doi_bong.length; $i++) {
//     var leagueID = list_doi_bong[$i].LeagueID;
//     if (typeof leagueID != 'undefined') {
//         getBangXepHang('http://bongdaso.com/Standing.aspx?LeagueID=' + leagueID);
//     }
// }

//các hàm chạy 1 lần
// getListTeam();
// for (var $i = 0; $i < list_doi_bong.length; $i++) {
//     var leagueID = list_doi_bong[$i].LeagueID;
//     if (typeof leagueID != 'undefined') {
//         getBangXepHangCacNam('http://bongdaso.com/Standing.aspx?LeagueID=' + leagueID);
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
//  for (var $i = 0; $i < lis_tab_laydoibong.length; $i++) {
//     genListDoiBong('http://bongdaso.com/Association.aspx?FBAssID='+lis_tab_laydoibong[$i]+'&Tab=1');
//  }


app.set('view engine','ejs');
require('./app/routes.js')(app,connection,server);

server.listen(port, '127.0.0.1', function (err) {
    console.log('listen port: ', port);
});




