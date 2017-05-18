var function_use = require('./RunJob.js');

function LiveScore(id, connection, callback) {

    // process.env.TZ = 'Asia/Ho_Chi_Minh';
    //
    // var date1 = new Date(Date.now() - 900000);
    // var date2 = new Date(Date.now() + 10800000);
    //
    // var date_botton = date1.getFullYear()+'-'+(date1.getMonth()+1)+'-'+date1.getDate()+' '+date1.getHours()+':'+date1.getMinutes()+':'+date1.getSeconds();
    // var date_top = date2.getFullYear()+'-'+(date2.getMonth()+1)+'-'+date2.getDate()+' '+date2.getHours()+':'+date2.getMinutes()+':'+date2.getSeconds();
    //

    var queryString = "SELECT*FROM ketqua WHERE id = " + id + " LIMIT 1";
    connection.query(queryString, function (error, result) {
        if (!error) {
            if (typeof result[0] != 'undefined') {
                var data = {};
                data.id = result[0].id;
                data.home_club_name = result[0].home_club_name;
                data.away_club_name = result[0].away_club_name;
                data.home_goal = result[0].home_goal;
                data.away_goal = result[0].away_goal;
                data.time_start = result[0].time_start;
                data.LeagueID = result[0].LeagueID;
                data.is_finish = result[0].is_finish;
                data.link_match = result[0].link_match;
                callback(null, data);
            } else {
                callback(null, null);
            }
        } else {
            callback(error, null);
        }
    });
}

function GetLineup(link, request, cheerio, check_team, callback) {
    request(link, function (err, request, body) {
        if (!err && request.statusCode == 200) {
            var $ = cheerio.load(body);
            var list_lineup = [];
            var list_seperate = [];
            var check = 0;
            var name_team = '';
            $('.squad_table > table > tr').each(function () {

                if (check === 1) {
                    var number = $(this).children().eq(0).text();
                    var name = $(this).children().eq(1).text();
                    list_lineup.push({number: number, name: name});
                }

                if (check === 2) {
                    var number = $(this).children().eq(0).text();
                    var name = $(this).children().eq(1).text();
                    if (number.trim() != '' && name.trim() != '') {
                        list_seperate.push({number: number, name: name});
                    }
                }

                if ($(this).attr('class') === 'tbl_title') {
                    name_team = $(this).children().text();
                    check = 1;
                }

                if ($(this).attr('class') === 'fixture_separator') {
                    check = 2;
                }

            });

            if (check_team === 'home') {
                var data = {home: {list_lineup: list_lineup, list_seperate: list_seperate}}
            } else {
                var data = {away: {list_lineup: list_lineup, list_seperate: list_seperate}}
            }

            callback(null, data);
        } else {
            callback(err, null);
        }
    });
}

function GetCauThu(link, request, cheerio, callback) {
    request(link, function (err, request, body) {
        if (!err && request.statusCode == 200) {
            var $ = cheerio.load(body);

            var list_player = [];
            var check = 0;
            var name_team = '';
            $('.xtip .boxBody > table > tr').each(function () {
                var thumbnail = $(this).children('td').eq(0).children('img').attr('src');
                var name = $(this).children('td').eq(1).children('table').children('tr').eq(0).children().children().text();
                var position = $(this).children('td').eq(1).children('table').children('tr').eq(6).children('td').eq(1).text();
                var date_of_birth = $(this).children('td').eq(1).children('table').children('tr').eq(1).children('td').eq(1).text();
                var height = $(this).children('td').eq(1).children('table').children('tr').eq(4).children('td').eq(1).text();
                height = height.replace(' m', '');
                var weight = $(this).children('td').eq(1).children('table').children('tr').eq(5).children('td').eq(1).text();
                weight = weight.replace(' kg', '');

                var nation_tag = $(this).children('td').eq(1).children('table').children('tr').eq(3).children('td').eq(1).text();

                var value = {
                    name: name,
                    thumbnail: thumbnail,
                    position: position,
                    date_of_birth: date_of_birth,
                    height: height,
                    weight: weight,
                    nation_tag: nation_tag
                };
                list_player.push(value);
            });

            var data = {list_player: list_player}

            callback(null, data);
        } else {
            callback(err, null);
        }
    });
}

function UpdateDienBienTranDauDangDienRa(request, cheerio, connection, callback) {

    process.env.TZ = 'Asia/Ho_Chi_Minh';

    var date1 = new Date(Date.now() - 3600000);
    var date2 = new Date(Date.now() + 7200000);

    var date_botton = date1.getFullYear() + '-' + (date1.getMonth() + 1) + '-' + date1.getDate() + ' ' + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds();
    var date_top = date2.getFullYear() + '-' + (date2.getMonth() + 1) + '-' + date2.getDate() + ' ' + date2.getHours() + ':' + date2.getMinutes() + ':' + date2.getSeconds();

    var queryString = "SELECT*FROM ketqua WHERE time_start BETWEEN '" + date_botton + "' AND '" + date_top + "'";

    connection.query(queryString, function (error, result) {
        if (!error) {
            if (result.length > 0) {
                for ($i = 0; $i < result.length; $i++) {
                    function_use.LuuDienBienTranDau(result[$i].id, 'lineup', request, cheerio, connection);
                    function_use.LuuDienBienTranDau(result[$i].id, 'casting', request, cheerio, connection);
                }
            }
        } else {
        }
    });
}


module.exports.LiveScore = LiveScore;
module.exports.GetLineup = GetLineup;
module.exports.UpdateDienBienTranDauDangDienRa = UpdateDienBienTranDauDangDienRa;
module.exports.GetCauThu = GetCauThu;