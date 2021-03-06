/**
 * Created by User on 5/16/2017.
 */

var common = require('./common.js');
var function_user = require('./RunJob.js');

function getBangXepHangCacNam(url,request,cheerio,connection ,callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);
            var list_year = [];
            $('.season_list table td a').each(function () {
                var sesionID = $(this).attr('href');
                if (typeof sesionID != 'undefined') {
                    function_user.getBangXepHang('http://bongdaso.com/' + sesionID,request,cheerio,connection);
                }
            });
        }
    });
}

function genListDoiBong(url,connection,request,cheerio,callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);
            $('.menu_tab_box .club_list a h4').each(function () {
                var name = $(this).text().trim();

                var link_team = $(this).parent('a').attr('href');
                link_team = 'http://bongdaso.com/'+link_team;

                var nn = common.ChangeToSlug(name);
                nn = nn.trim();
                nn = nn.replace(' ', '_');
                name1 = nn + '_fc';

                var data = {
                    name: name,
                    tag: name1,
                    link_team:link_team
                }
                connection.query('INSERT INTO doi_bong SET ?', data, function (error, result) {
                    if (!error) {

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

function getLinkCralerPlayer(id,url,connection,request,cheerio,callback) {
    request(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body);
            var link_player = $('.clubdata .menu_tab UL li:nth-child(3)').children('a').attr('href');
            if(typeof link_player != 'undefined') {
                link_player = 'http://bongdaso.com/' + link_player;
                var data = {link_player: link_player};
            }else {
                var link_player = $('.clubdata .menu_tab UL li:nth-child(2)').children('a').attr('href');
                if(typeof link_player != 'undefined') {
                    link_player = 'http://bongdaso.com/' + link_player;
                    var data = {link_player: link_player};

                }else {
                    var data = {link_player: ''};
                }
            }

            connection.query('UPDATE doi_bong SET ? WHERE id ='+id, data, function (error, result) {
                if (!error) {

                } else {
                    console.log(error);
                }
            });

        } else {
            console.log(err);
        }
    });
}

function getListTeam(connection,list_doi_bong,callback) {

    connection.query('TRUNCATE danh_sach_giai_dau', function (error, result) {
        if (!error) {

        } else {
            console.log(error);
        }
    });

    for (var $i = 0; $i < list_doi_bong.length; $i++) {
        connection.query('INSERT INTO danh_sach_giai_dau SET ?', list_doi_bong[$i], function (error, result) {
            if (!error) {

            } else {
                console.log(error);
            }
        });
    }

}

module.exports.getBangXepHangCacNam = getBangXepHangCacNam;
module.exports.genListDoiBong = genListDoiBong;
module.exports.getListTeam = getListTeam;
module.exports.getLinkCralerPlayer = getLinkCralerPlayer;
