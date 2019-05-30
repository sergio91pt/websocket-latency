
var socket = new WebSocket('ws://' + location.host);
socket.binaryType = 'arraybuffer';

var interval = 100;
var pingCount = 100;
var wsPings = [];

var len = 100000; // 100K
var buffer = new ArrayBuffer(len);
var arrayBuffer = new Uint8Array(buffer);

for (var i = 0; i < len; i += 1) {
  arrayBuffer[i] = i;
}

socket.onmessage = function(evt) {
    const idx = Number.parseInt(evt.data, 10);
    wsPings[idx].stop = window.performance.now();
}

var displayResults = function(wsPings){

    var wsLatencies = wsPings.map(function(data){
        return data.stop - data.start;
    });

    var wsMin = wsLatencies.reduce(function(a, b) { return Math.min(a,b); });
    var wsMax = wsLatencies.reduce(function(a, b) { return Math.max(a,b); });
    var wsSum = wsLatencies.reduce(function(a, b) { return a + b; });
    var wsAvg = wsSum / wsLatencies.length;

    console.log('wsMin : ' + wsMin);
    console.log('wsMax : ' + wsMax);
    console.log('wsAvg : ' + wsAvg);

    $('#minLatency')[0].innerHTML = 'Min : ' + wsMin + 'ms';
    $('#maxLatency')[0].innerHTML = 'Max : ' + wsMax + 'ms';
    $('#avgLatency')[0].innerHTML = 'Average : ' + wsAvg + 'ms';

    var i = 1;
    var latenciesData = wsLatencies.map(function(data){
        result = [i, data];
        i++;
        return result;
    });

    g2 = new Dygraph(document.getElementById("graph"),
        latenciesData,
        {
            labels: [ "x", "Websocket latency (ms)" ]
        });

};

var runTest = function () {

    $('.btn').prop('disabled', true);
    $('#graph').addClass('hide');
    $("#knob").removeClass('hide');

    wsPings = [];
    var i = 0;

    //Send ping message every 100ms
    var pingInterval = setInterval(function () {

        if (i > pingCount) {
            clearInterval(pingInterval);

            //Wait 1 seconde to get the latest ws response
            setTimeout(function() {
                $('#knob').addClass('hide');
                $('.dial')
                    .val(0)
                    .trigger('change');

                $('#graph').removeClass('hide');

                displayResults(wsPings);

                $('.btn').prop('disabled', false);

            },1000);

        }else {

            //Update the progress bar
            var progress = i * 100 / pingCount;
            $('.dial')
                .val(progress)
                .trigger('change');

            //Send ping
            wsPings[i] = {};
            wsPings[i].start = window.performance.now();

            arrayBuffer[0] = i;
            socket.send(buffer);

            i++;
        }
    }, interval);

}
