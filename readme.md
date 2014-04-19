# Flaky

Flaky starts a predtermined number of HTTP servers and then proceeds to randomly kill them off and restart them, a bit like a poor man's [chaos monkey](http://techblog.netflix.com/2012/07/chaos-monkey-released-into-wild.html).

Flaky also emits status messages on a web socket for interested browsers. There's an interested client page in the 'client' directory.

## Bundled Example

    git clone 

    cd 

    node flaky {number_of_servers}

## Install (NPM)

    npm install git+https://github.com/julianbrowne/flaky.git

## Usage

    var Flaky = require('flaky');

    var f = new Flaky(5);             // 5 servers in pool

    f.startServers(9300);             // start unreliable http servers starting at {port}
    f.startClientChannel(9013);       // start console at http://127.0.0.1:9013
    f.startChaos(10000);              // can be stopped with f.stopChaos();
