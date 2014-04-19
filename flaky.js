"use strict";

var Flaky = require('./index');

var max = parseInt(process.argv[2]);

if(isNaN(max)) { 
  console.log('usage: node flaky {servers}');
  process.exit(-1);
}

var opts = { 
  configFileName: 'flaky.json'    // output file for server config dump
};

var f = new Flaky(max, opts);

f.startServers(9300);             // start unreliable http servers starting at {port}
f.startClientChannel(9013);       // client WSS
f.startChaos(10000);              // can be stopped with f.stopChaos();
