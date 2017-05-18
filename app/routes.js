var live = require('./functions/live.js');
var common = require('./functions/common.js');

module.exports = function (app, connection,request,cheerio,server) {

    app.get('/live', function (req, res) {
        var id_match = req.query.query;
        if (typeof id_match != 'undefined') {
            try {
                live.LiveScore(id_match, connection, function (err, data) {
                    if (err) {
                        console.log(err);
                        res.end();
                    } else {
                        if (data != null) {
                            var link = data.link_match;
                            var check_link = req.query.Data;

                            if (typeof check_link === 'undefined') {
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

                                            live.GetLineup(link1, request, cheerio,'home',function (err, data) {
                                                final.push(data);
                                                live.GetLineup(link2, request, cheerio,'away',function (err, data1) {
                                                    final.push(data1);
                                                    res.json(final);
                                                });
                                            });
                                        } catch (err) {
                                            res.json(final);
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

                                        data.casting = list_casting;
                                        res.json(list_casting);
                                    } else {
                                        console.log(err);
                                    }
                                });
                                }catch (err){
                                    res.end();
                                }
                            }

                        } else {
                            res.end();
                        }
                    }
                });
            }catch (err){
                console.log(err);
                res.end();
            }
        } else {
            res.end();
        }
    });

    app.get('/listcauthu', function (req, res) {
        var id_match = req.query.query;
        if (typeof id_match != 'undefined') {
            try {
                live.LiveScore(id_match, connection, function (err, data) {
                    if (err) {
                        console.log(err);
                        res.end();
                    } else {
                        if (data != null) {
                            var link = data.link_match;
                            var check_link = req.query.Data;

                                var result_link = link + '&Data=lineup';

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

                                            live.GetCauThu(link1, request, cheerio, function (err, data) {
                                                final.push(data);
                                                res.json(final);
                                            });

                                        } catch (err) {
                                            res.json(final);
                                        }

                                    } else {
                                        console.log(err);
                                    }
                                });

                        } else {
                            res.end();
                        }
                    }
                });
            }catch (err){
                console.log(err);
                res.end();
            }
        } else {
            res.end();
        }
    });

};