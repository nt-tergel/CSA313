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

    var data = {"OkPercent": 52.221481086761294, "KoPercent": 47.778518913238706};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4041929221149439, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7655025655304085, 500, 1500, "Google Maps-0"], "isController": false}, {"data": [0.0, 500, 1500, "Google Search"], "isController": false}, {"data": [0.7881040892193308, 500, 1500, "Google Maps-2"], "isController": false}, {"data": [0.010421224294976333, 500, 1500, "Google Maps-1"], "isController": false}, {"data": [0.0, 500, 1500, "Google Maps-3"], "isController": false}, {"data": [0.8931840910839295, 500, 1500, "Google Homepage"], "isController": false}, {"data": [0.25, 500, 1500, "Monkeytype Profile"], "isController": false}, {"data": [0.9742921902338159, 500, 1500, "Google News-0"], "isController": false}, {"data": [0.6738508032447909, 500, 1500, "Google News-1"], "isController": false}, {"data": [0.0, 500, 1500, "Google Images"], "isController": false}, {"data": [0.006395533027086963, 500, 1500, "Google Maps"], "isController": false}, {"data": [0.5, 500, 1500, "Monkeytype Homepage"], "isController": false}, {"data": [0.875, 500, 1500, "Monkeytype Leaderboard"], "isController": false}, {"data": [1.0, 500, 1500, "Monkeytype Test Page"], "isController": false}, {"data": [0.75, 500, 1500, "Monkeytype Settings"], "isController": false}, {"data": [0.4871464786500832, 500, 1500, "Google News"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 268357, 128217, 47.778518913238706, 742.7392130631941, 0, 928303, 777.0, 5273.800000000003, 9216.800000000003, 24296.01000000016, 5.460799482516517, 1790.7469251161478, 2.984368809290404], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Google Maps-0", 25141, 0, 0.0, 595.3081420786755, 81, 29488, 481.0, 678.0, 869.0, 3421.75000000004, 0.5116838273046629, 0.6192922886147529, 0.2046183643414153], "isController": false}, {"data": ["Google Search", 38992, 38992, 100.0, 295.42049651210425, 0, 60004, 173.0, 364.0, 808.9500000000007, 4570.950000000008, 0.7935051425002307, 1.3285969820219252, 0.37905091029210886], "isController": false}, {"data": ["Google Maps-2", 269, 4, 1.486988847583643, 1293.1933085501857, 83, 30617, 301.0, 1378.0, 10640.5, 30182.100000000006, 0.005483621025360891, 0.9377162360967528, 0.002188284422814334], "isController": false}, {"data": ["Google Maps-1", 25141, 24872, 98.93003460482876, 270.1808997255493, 76, 68803, 94.0, 269.0, 515.0, 3180.9600000000064, 0.5116529618389436, 1.8886592187341036, 0.2713613281537383], "isController": false}, {"data": ["Google Maps-3", 23, 23, 100.0, 625.3478260869565, 91, 4898, 142.0, 2720.000000000001, 4499.199999999994, 4898.0, 4.7519017627365535E-4, 0.0017595272118067651, 2.583362354368157E-4], "isController": false}, {"data": ["Google Homepage", 38997, 173, 0.44362386850270535, 686.1917326973887, 0, 76164, 359.0, 1027.0, 2328.0, 10213.980000000003, 0.7935812813066462, 13.86263799144419, 0.31531340641839717], "isController": false}, {"data": ["Monkeytype Profile", 4, 0, 0.0, 3350.5, 614, 7524, 2632.0, 7524.0, 7524.0, 7524.0, 0.24084778420038536, 35.27890831978564, 0.028929958453757225], "isController": false}, {"data": ["Google News-0", 25148, 0, 0.0, 224.29131541275797, 101, 17372, 117.0, 434.0, 475.0, 1606.9900000000016, 0.5120568747198735, 0.6677291280294289, 0.23125785164352378], "isController": false}, {"data": ["Google News-1", 25148, 30, 0.11929378081756005, 995.0423890567812, 270, 165138, 559.0, 1455.9000000000015, 2534.9500000000007, 10157.900000000016, 0.5119238063257155, 883.2964119703001, 0.24592080977855488], "isController": false}, {"data": ["Google Images", 38985, 38985, 100.0, 613.5873284596629, 0, 65125, 330.0, 852.0, 2029.8500000000022, 8875.660000000054, 0.7934302308009881, 1.3286788857182152, 0.37947418469370614], "isController": false}, {"data": ["Google Maps", 25252, 25010, 99.04166006652939, 1542.140780928245, 0, 927244, 600.0, 944.0, 1630.0, 8649.800000000032, 0.5139066263082136, 3.451094827824236, 0.4784015038764519], "isController": false}, {"data": ["Monkeytype Homepage", 3, 0, 0.0, 1145.6666666666665, 85, 2084, 1268.0, 2084.0, 2084.0, 2084.0, 0.17372169784006022, 25.44389513000174, 0.019679411083444325], "isController": false}, {"data": ["Monkeytype Leaderboard", 4, 0, 0.0, 412.0, 251, 773, 312.0, 773.0, 773.0, 773.0, 0.37030179596371043, 54.24053416034068, 0.046287724495463804], "isController": false}, {"data": ["Monkeytype Test Page", 2, 0, 0.0, 375.5, 274, 477, 375.5, 477.0, 477.0, 477.0, 0.7659900421294523, 112.19771818747606, 0.08976445806204518], "isController": false}, {"data": ["Monkeytype Settings", 2, 0, 0.0, 558.0, 490, 626, 558.0, 626.0, 626.0, 626.0, 0.7064641469445425, 103.48595902507948, 0.0855483927940657], "isController": false}, {"data": ["Google News", 25246, 128, 0.5070110116454092, 1797.2075180226566, 0, 928303, 684.0, 1755.9000000000015, 3106.850000000002, 12717.600000000064, 0.5139136638479854, 883.9597051719654, 0.47711385388036676], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: maps.google.com", 66, 0.05147523339338777, 0.024594104122493545], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to www.google.com:443 [www.google.com/142.250.198.196, www.google.com/2404:6800:4005:804:0:0:0:2004] failed: Read timed out", 7, 0.005459494450813855, 0.0026084655887493153], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to www.google.com:443 [www.google.com/142.250.198.132, www.google.com/2404:6800:4005:823:0:0:0:2004] failed: Read timed out", 1, 7.799277786876936E-4, 3.726379412499022E-4], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: maps.google.com:443 failed to respond", 5, 0.0038996388934384677, 0.0018631897062495108], "isController": false}, {"data": ["429/Too Many Requests", 49762, 38.81076612305701, 18.543209232477633], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: news.google.com", 69, 0.053815016729450854, 0.02571201794624325], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: maps.google.com: nodename nor servname provided, or not known", 4, 0.0031197111147507743, 0.0014905517649996087], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to www.google.com:443 [www.google.com/142.250.198.196, www.google.com/2404:6800:4005:80a:0:0:0:2004] failed: Read timed out", 4, 0.0031197111147507743, 0.0014905517649996087], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: news.google.com: nodename nor servname provided, or not known", 4, 0.0031197111147507743, 0.0014905517649996087], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to news.google.com:443 [news.google.com/142.250.66.46, news.google.com/2404:6800:4005:813:0:0:0:200e] failed: Read timed out", 2, 0.0015598555573753871, 7.452758824998043E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Operation timed out", 1, 7.799277786876936E-4, 3.726379412499022E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host", 28, 0.02183797780325542, 0.010433862354997261], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: www.google.com: nodename nor servname provided, or not known", 3, 0.0023397833360630804, 0.0011179138237497066], "isController": false}, {"data": ["400/Bad Request", 77677, 60.58245006512397, 28.94539736246865], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 9, 0.0070193500081892415, 0.0033537414712491195], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to www.google.com:443 [www.google.com/142.250.198.196, www.google.com/2404:6800:4005:80a:0:0:0:2004] failed: Connect timed out", 2, 0.0015598555573753871, 7.452758824998043E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: www.google.com", 196, 0.15286584462278793, 0.07303703648498083], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to www.google.com:443 [www.google.com/142.250.198.132] failed: Read timed out", 1, 7.799277786876936E-4, 3.726379412499022E-4], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to www.google.com:443 [www.google.com/142.250.198.132, www.google.com/2404:6800:4005:80a:0:0:0:2004] failed: Read timed out", 1, 7.799277786876936E-4, 3.726379412499022E-4], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: news.google.com:443 failed to respond", 5, 0.0038996388934384677, 0.0018631897062495108], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.google.com:443 failed to respond", 80, 0.06239422229501548, 0.029811035299992173], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 182, 0.14194685572116023, 0.0678201053074822], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 108, 0.0842322000982709, 0.04024489765498943], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 268357, 128217, "400/Bad Request", 77677, "429/Too Many Requests", 49762, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: www.google.com", 196, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 182, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 108], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["Google Search", 38992, 38992, "400/Bad Request", 38858, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: www.google.com", 64, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 27, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 26, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host", 9], "isController": false}, {"data": ["Google Maps-2", 269, 4, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 3, "429/Too Many Requests", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Google Maps-1", 25141, 24872, "429/Too Many Requests", 24857, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 12, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.google.com:443 failed to respond", 3, "", "", "", ""], "isController": false}, {"data": ["Google Maps-3", 23, 23, "429/Too Many Requests", 23, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Google Homepage", 38997, 173, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: www.google.com", 69, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.google.com:443 failed to respond", 33, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 32, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 21, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host", 5], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Google News-1", 25148, 30, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 29, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Google Images", 38985, 38985, "400/Bad Request", 38819, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: www.google.com", 63, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.google.com:443 failed to respond", 35, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 35, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 16], "isController": false}, {"data": ["Google Maps", 25252, 25010, "429/Too Many Requests", 24881, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: maps.google.com", 66, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 39, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 11, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: maps.google.com:443 failed to respond", 5], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Google News", 25246, 128, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: news.google.com", 69, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 35, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host", 7, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: news.google.com:443 failed to respond", 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable", 4], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
