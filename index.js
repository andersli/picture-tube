var getPixels = require('get-pixels');
var fileType = require('file-type');
var charm = require('charm');
var x256 = require('x256');
var buffers = require('buffers');
var es = require('event-stream');

var Stream = require('stream').Stream;

module.exports = function (opts) {
    if (!opts) opts = {};
    if (!opts.cols) opts.cols = 80;

    var c = charm();
    var bufs = buffers();

    var ws = es.writeArray(function (err, bufs) {
        var data = buffers(bufs).slice();

        getPixels(data, fileType(data).mime, function (err, pixels) {
          if (err) {
              console.error(err);
          }
          else {
            var width = pixels.shape[0];
            var height = pixels.shape[1];
            var dx = width / opts.cols;
            var dy = 2 * dx;

            for (var y = 0; y < height; y += dy) {
                for (var x = 0; x < width; x += dx) {
                    var i = (Math.floor(y) * width + Math.floor(x)) * 4;

                    var ix = x256([ pixels.data[i], pixels.data[i+1], pixels.data[i+2] ]);
                    if (pixels.data[i+3] > 0) {
                        c.background(ix).write(' ');
                    }
                    else {
                        c.display('reset').write(' ');
                    }
                }
                c.display('reset').write('\r\n');
            }
            
            c.display('reset').end();
          }
        });
    });

    return es.duplex(ws, c);
};
