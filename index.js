var blessed = require('blessed');
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

var TNT_CONSIGNMENT = 'APK5436042'
var DATE_FORMAT = 'DD/MM/YYYY HH:mm:SS';

var tntUrl = 'http://www.tntexpress.com.au/InterAction/ASPs/CnmHxAS.asp?' + TNT_CONSIGNMENT;
var $b = {};

var track = function() {
    request.get(tntUrl, function(err, resp) {
        var $ = cheerio.load(resp.body);
        var steps = [];

        $('[bgcolor="#ffcc99"] tr').each(function(index, el){
            if (index === 0) { return }

            var $el = $(el);
            var date = $el.find('td:nth-child(2)').text();
            var time = $el.find('td:nth-child(3)').text();
            var timestamp = moment(date + ' ' + time, DATE_FORMAT);
            steps.push({
                action: $el.find('td:nth-child(1)').text(),
                // timestamp: timestamp,
                ago: timestamp.fromNow(),
            })
        });

        updateTable(steps);
    });
}

var renderTable = function(steps) {
    // Create a screen object.
    $b.screen = blessed.screen({
      smartCSR: true
    });

    $b.screen.title = 'TNT Status';

    // Create a box perfectly centered horizontally and vertically.
    $b.table = blessed.table({
      top: 0,
      left: 0,
      width: '100%',
      align: 'left',
      height: '100%',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        // header: {bg: 'magenta'}
      }
    });

    // Append our table to the screen.
    $b.screen.append($b.table);

    // Quit on Escape, q, or Control-C.
    $b.screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });

    // Render the screen.
    $b.screen.render();
}

var updateTable = function(steps) {
    var tableRows = [
        ['{bold}Event{/bold}', '{bold}Time{/bold}']
    ];

    if (steps) {
        for (var i = steps.length - 1; i >= 0; i--) {
            var event = steps[i];
            tableRows.push([event.action, event.ago]);
        };
    } else {
        tableRows = [['Loading data...']];
    }

    $b.table.setData(tableRows)
    $b.screen.render();
}


renderTable();
updateTable();
track()
setInterval(track, 5 * 1000);
