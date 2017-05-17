/**
 * Created by User on 5/16/2017.
 */
var common = require('./common.js');
var live = require('./live.js');

function getKetQuaThiDau(url, request, cheerio, connection, callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);

            try {
                $('.played_box .fixture_list tr.ls:first-child').each(function () {

                    var id_tour = common.getParameterByName('LeagueID', url);
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

                                    var tag_home_name = '';
                                    var tag_away_name = '';

                                    var nn = common.ChangeToSlug(home);
                                    nn = nn.trim();
                                    nn = nn.replace(' ', '_');
                                    tag_home_name = nn + '_fc';

                                    var nn = common.ChangeToSlug(guest);
                                    nn = nn.trim();
                                    nn = nn.replace(' ', '_');
                                    tag_away_name = nn + '_fc';

                                    var metadata = {
                                        home_club_name: home,
                                        away_club_name: guest,
                                        tag_home_name: tag_home_name,
                                        tag_away_name: tag_away_name,
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
                                    UpdateKetQua(queryString, connection, metadata);
                                }
                            }
                        }
                    });
                });
            } catch (err) {
                console.log('co loi xay ra');
            }
        } else {
            console.log('co loi xay ra');
        }
    });
}

function getLichThiDau(url, request, cheerio, connection, callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);
            try {
                $('.coming_box .fx_coming tr.ls').each(function () {
                    var id_tour = common.getParameterByName('LeagueID', url);

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

                                    var tag_home_name = '';
                                    var tag_away_name = '';

                                    var nn = common.ChangeToSlug(home);
                                    nn = nn.trim();
                                    nn = nn.replace(' ', '_');
                                    tag_home_name = nn + '_fc';

                                    var nn = common.ChangeToSlug(guest);
                                    nn = nn.trim();
                                    nn = nn.replace(' ', '_');
                                    tag_away_name = nn + '_fc';

                                    var metadata = {
                                        home_club_name: home,
                                        away_club_name: guest,
                                        tag_home_name: tag_home_name,
                                        tag_away_name: tag_away_name,
                                        home_goal: 0,
                                        away_goal: 0,
                                        is_postponed: 2,
                                        time_start: time_start1,
                                        LeagueID: id_tour,
                                        date_query: time_start2,
                                        link_match: link_match
                                    }
                                    var queryString = 'SELECT*FROM ketqua WHERE LeagueID = ' + id_tour + ' AND time_start = ' + '"' + time_start1 + '"' + ' AND home_club_name = ' + '"' + metadata.home_club_name + '"' + ' LIMIT 1';
                                    UpdateKetQua(queryString, connection, metadata);
                                }
                            }
                        }
                    });
                });
            } catch (err) {
                console.log('co loi xay ra');
            }
        } else {
            console.log('co loi xay ra');
        }
    });
}

function getBangXepHang(url, request, cheerio, connection, callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);
            try {
                var season_time_name = $('.season_list table td[class="ctbl_selected"]').text();
                var season_time_name = season_time_name.replace("Mùa bóng", "");
                season_time_name = season_time_name.trim();
                var season_id = 0;
                var list_seasons = [];
                var table = [];
                var stt = 0;
                var round = 0;

                var seasion_current = common.getParameterByName('SeasonID', url);

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

                var LeagueID = common.getParameterByName('LeagueID', url);
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
                UpdateBangXepHang(queryString, connection, data);
            } catch (err) {
                console.log('co loi xay ra');
            }
        } else {
            console.log('co loi xay ra');
        }
    });
}

function UpdateKetQua(queryString, connection, metadata, callback) {
    connection.query(queryString, function (err, rows, fields) {
        if (rows.length > 0) {
            if ((rows[0]['is_finish'] == 2) && (rows[0]['home_goal'] != 0) && ((rows[0]['away_goal'] != 0))) {
                connection.query('UPDATE ketqua SET ? WHERE LeagueID = ' + metadata.LeagueID + ' AND time_start=' + "'" + metadata.time_start + "'" + ' AND home_club_name = ' + "'" + metadata.home_club_name + "'" + " LIMIT 1", metadata, function (error, result) {
                    if (!error) {
                        console.log('update ketqua success');
                    } else {

                    }
                });
            }
        } else {
            connection.query('INSERT INTO ketqua SET ?', metadata, function (error, result) {
                if (!error) {
                    console.log('insert ketqua success');
                } else {

                }
            });
        }
    });
}

function UpdateBangXepHang(queryString, connection, data, callback) {
    connection.query(queryString, function (err, rows, fields) {
        if (err) throw err;
        if (rows.length > 0) {
            connection.query('UPDATE bang_xep_hang SET ? WHERE LeagueID = ' + data.LeagueID + ' AND seasion = ' + '"' + data.seasion + '"', data, function (error, result) {
                if (!error) {
                    console.log('update bang_xep_hang success');
                } else {

                }
            });
        } else {
            connection.query('INSERT INTO bang_xep_hang SET ?', data, function (error, result) {
                if (!error) {
                    console.log('insert bang_xep_hang success');
                } else {

                }
            });
        }
    });
}


function LuuDienBienTranDau(id_match, check_link, request, cheerio, connection, callback) {

    if (typeof id_match != 'undefined' && typeof check_link != 'undefined') {
        try {
            live.LiveScore(id_match, connection, function (err, data) {
                if (!err) {
                    if (data != null) {

                        var link = data.link_match;

                        if (typeof check_link === 'undefined' && check_link === '') {
                            var result_link = link + '&Data=casting';
                        } else {
                            var result_link = link + '&Data=' + check_link;
                        }

                        if (check_link === 'lineup') {
                            var final = [];
                            request(result_link, function (err, reques, body) {
                                if (!err && reques.statusCode == 200) {
                                    var $ = cheerio.load(body);
                                    var html = $.html();
                                    try {
                                        var result = html.replace(/<\/?[^>]+(>|$)/g, "");
                                        var a = result.split("new AJAXObject('_HomeLineup_','");
                                        var b = a[1].split("',0),new AJAXObject('_AwayLineup_','");
                                        var c = b[1].split("',0),new AJAXObject('_OtherMatches_','");

                                        var link1 = "http://bongdaso.com/" + b[0].trim();
                                        var link2 = "http://bongdaso.com/" + c[0].trim();

                                        live.GetLineup(link1, request, cheerio, function (err, data) {
                                            final.push(data);
                                            live.GetLineup(link2, request, cheerio, function (err, data1) {
                                                final.push(data1);
                                                final = JSON.stringify(final);
                                                var metadata = {lineup:final};
                                                connection.query('UPDATE ketqua SET ? WHERE id='+id_match+' LIMIT 1', metadata, function (error, result) {
                                                    if (!error) {
                                                        console.log('update ketqua success');
                                                    }
                                                });

                                            });
                                        });
                                    } catch (err) {

                                    }
                                } else {
                                    console.log(err);
                                }
                            });
                        } else {
                            try {
                                var LeagueID = common.getParameterByName('LeagueID', result_link);
                                var SeasonID = common.getParameterByName('SeasonID', result_link);
                                var slug = result_link.match(/[^/]*(?=(\/)?$)/)[0];
                                slug = slug.split('?');

                                var ls = slug[0].split('-');
                                var home = ls[0];
                                var away = ls[1];
                                var fix = ls[3].replace('.aspx.aspx', '').replace('_Fix_', '').replace('.aspx', '');
                                var link = "http://bongdaso.com/_CastingInfo.aspx?FixtureID=" + fix + "&SeasonID=" + LeagueID + "&Flags=&Home=" + home + "&Away=" + away;

                                var list_casting = [];
                                request(link, function (err, request, body) {
                                    if (!err && request.statusCode == 200) {
                                        var $ = cheerio.load(body);

                                        $('.fixture_casting > table > tr').each(function () {
                                            var time = $(this).children().eq(0).text();
                                            var image = $(this).children().eq(1).children('img').attr('src');
                                            var score = $(this).children().eq(2).text();
                                            var comment = $(this).children().eq(3).text();
                                            var data = {time: time, image: image, score: score, comment: comment};
                                            list_casting.push(data);
                                        });
                                        list_casting = JSON.stringify(list_casting);
                                        var metadata = {casting:list_casting};
                                        connection.query('UPDATE ketqua SET ? WHERE id ='+id_match+' LIMIT 1', metadata, function (error, result) {
                                            if (!error) {
                                                console.log('update ketqua success');
                                            }else {
                                                console.log(error);
                                            }
                                        });

                                    } else {
                                        console.log(err);
                                    }
                                });
                            } catch (err) {

                            }
                        }

                    } else {
                    }
                }

            });
        } catch (err) {
            console.log(err);
        }
    }
}


module.exports.getKetQuaThiDau = getKetQuaThiDau;
module.exports.getLichThiDau = getLichThiDau;
module.exports.getBangXepHang = getBangXepHang;
module.exports.LuuDienBienTranDau = LuuDienBienTranDau;