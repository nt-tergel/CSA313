/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.43225762585098, "KoPercent": 0.5677423741490238};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.924663646639866, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9384980755056916, 500, 1500, "Monkeytype Homepage"], "isController": false}, {"data": [0.9247917135780229, 500, 1500, "Monkeytype Leaderboard"], "isController": false}, {"data": [0.919370033587286, 500, 1500, "Monkeytype Test Page"], "isController": false}, {"data": [0.9170149131432317, 500, 1500, "Monkeytype Settings"], "isController": false}, {"data": [0.9235479513732553, 500, 1500, "Monkeytype Profile"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 117659, 668, 0.5677423741490238, 563.8550812092601, 0, 117945, 309.0, 5005.9000000000015, 9335.750000000004, 26125.31000000027, 2.436525900359988, 354.8917339481659, 0.2888190255666446], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Monkeytype Homepage", 24422, 133, 0.5445909425927442, 440.9804274834166, 0, 103317, 47.0, 388.0, 1472.9000000000015, 9782.460000000247, 0.5057609259281004, 73.682263891053, 0.05698121614959125], "isController": false}, {"data": ["Monkeytype Leaderboard", 22205, 128, 0.5764467462283269, 587.0125197027717, 0, 117945, 220.0, 518.0, 1095.9500000000007, 8265.730000000043, 0.45992123530390616, 66.9842206159251, 0.05715875428847295], "isController": false}, {"data": ["Monkeytype Test Page", 24414, 141, 0.577537478495945, 608.5264602277392, 0, 60211, 222.0, 565.0, 1700.800000000003, 10327.44000000009, 0.5056379647912442, 73.64184337492927, 0.0589122323483286], "isController": false}, {"data": ["Monkeytype Settings", 24408, 145, 0.59406751884628, 613.2589314978703, 0, 84475, 222.0, 578.9000000000015, 1768.8500000000022, 10133.700000000048, 0.5055819180971792, 73.62159918069133, 0.060859105563901256], "isController": false}, {"data": ["Monkeytype Profile", 22210, 121, 0.5447996398018911, 572.4177847816311, 0, 80209, 221.0, 522.0, 1113.0, 8608.44000000009, 0.45993996427047196, 67.00784355947295, 0.05494571113205473], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: monkeytype.com:443 failed to respond", 16, 2.395209580838323, 0.013598619740096381], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: monkeytype.com", 370, 55.38922155688623, 0.31446808148972877], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 137, 20.508982035928145, 0.11643818152457526], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: monkeytype.com: nodename nor servname provided, or not known", 6, 0.8982035928143712, 0.005099482402536142], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 112, 16.766467065868262, 0.09519033818067466], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 27, 4.041916167664671, 0.022947670811412642], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 117659, 668, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: monkeytype.com", 370, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 137, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 112, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 27, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: monkeytype.com:443 failed to respond", 16], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Monkeytype Homepage", 24422, 133, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: monkeytype.com", 75, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 31, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 17, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 7, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: monkeytype.com:443 failed to respond", 2], "isController": false}, {"data": ["Monkeytype Leaderboard", 22205, 128, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: monkeytype.com", 68, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 32, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 15, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 6, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: monkeytype.com:443 failed to respond", 5], "isController": false}, {"data": ["Monkeytype Test Page", 24414, 141, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: monkeytype.com", 75, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 35, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 23, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: monkeytype.com:443 failed to respond", 3], "isController": false}, {"data": ["Monkeytype Settings", 24408, 145, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: monkeytype.com", 78, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 29, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 28, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 7, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: monkeytype.com:443 failed to respond", 2], "isController": false}, {"data": ["Monkeytype Profile", 22210, 121, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: monkeytype.com", 74, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 27, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 12, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: monkeytype.com:443 failed to respond", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 3], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
