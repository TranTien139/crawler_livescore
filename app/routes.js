var live = require('./functions/live.js');
var common = require('./functions/common.js');

var request = require('request');
var cheerio = require('cheerio');

module.exports = function (app, connection, server) {

    app.get('/live', function (req, res) {
        var id_match = req.query.query;
        if (typeof id_match != 'undefined') {
            live.LiveScore(id_match, connection, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end();
                } else {
                    if (data != null) {
                        var link = data.link_match;
                        var check_link = req.query.Data;

                        if (typeof check_link != 'undefined') {
                            var result_link = link + '&Data=casting';
                        } else {
                            var result_link = link + '&Data=' + check_link;
                        }

                        var LeagueID = common.getParameterByName('LeagueID', result_link);
                        var SeasonID = common.getParameterByName('SeasonID', result_link);
                        var slug = result_link.match(/[^/]*(?=(\/)?$)/)[0];
                        slug = slug.split('?');

                        var ls = slug[0].split('-');
                        var home = ls[0];
                        var away = ls[1];
                        var fix = ls[3].replace('.aspx.aspx', '').replace('_Fix_', '').replace('.aspx', '');
                        var link = "http://bongdaso.com/_CastingInfo.aspx?FixtureID=" + fix + "&SeasonID=" + LeagueID + "&Flags=&Home=" + home + "&Away=" + away;

                        var list_casting  =[];
                        request(link, function (err, request, body) {
                            if (!err && request.statusCode == 200) {
                                var $ = cheerio.load(body);

                                $('.fixture_casting > table > tr').each(function () {
                                    var time = $(this).children().eq(0).text();
                                    var image = $(this).children().eq(1).html();
                                    var score = $(this).children().eq(2).text();
                                    var comment = $(this).children().eq(3).text();
                                    var data = {time:time,image:image,score:score,comment:comment};
                                    list_casting.push(data);
                                });
                                data.casting = list_casting;
                                res.json(data);
                            } else {
                                console.log(err);
                            }
                        });

                    } else {
                        res.end();
                    }
                }
            });
        } else {
            res.end();
        }
    });

};