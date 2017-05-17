function LiveScore(id, connection,callback) {

    // process.env.TZ = 'Asia/Ho_Chi_Minh';
    //
    // var date1 = new Date(Date.now() - 900000);
    // var date2 = new Date(Date.now() + 10800000);
    //
    // var date_botton = date1.getFullYear()+'-'+(date1.getMonth()+1)+'-'+date1.getDate()+' '+date1.getHours()+':'+date1.getMinutes()+':'+date1.getSeconds();
    // var date_top = date2.getFullYear()+'-'+(date1.getMonth()+1)+'-'+date2.getDate()+' '+date2.getHours()+':'+date2.getMinutes()+':'+date2.getSeconds();
    //

    var queryString = "SELECT*FROM ketqua WHERE id = " + id + " LIMIT 1";
    connection.query(queryString, function (error, result) {
        if (!error) {
            if(typeof result[0] != 'undefined') {
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
            }else {
                callback(null, null);
            }
        } else {
            callback(error, null);
        }
    });
}

function GetLineup(link,request,cheerio,callback) {
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
                    list_lineup.push({number:number,name:name});
                }

                if (check === 2) {
                    var number = $(this).children().eq(0).text();
                    var name = $(this).children().eq(1).text();
                    list_seperate.push({number:number,name:name});
                }

                if ($(this).attr('class') === 'tbl_title') {
                    name_team = $(this).children().text();
                    check = 1;
                }

                if ($(this).attr('class') === 'fixture_separator') {
                    check = 2;
                }

            });

            var data = {name_team:name_team, list_lineup:list_lineup,list_seperate:list_seperate}

            callback(null,data);
        } else {
            callback(err, null);
        }
    });
}

module.exports.LiveScore =  LiveScore;
module.exports.GetLineup =  GetLineup;