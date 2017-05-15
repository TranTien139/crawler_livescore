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

module.exports.LiveScore =  LiveScore;