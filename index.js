
var http = require('http');
var content = require('node-static');
var fs = require('fs');
var sio = require('socket.io');

function Flaky(numberOfServers, config) { 

    var flaky = this;
    this.numberOfServers = numberOfServers;
    this.baseHttpPort = null;
    this.config = config;
    this.servers = [];
    this.chaosTimer = null;
    this.webSocketConnection = null;

    this.handler = function(request, response) { 
        var file = new(content.Server)(__dirname + '/client');
        file.serve(request, response, function (err, res) { 
            if (err) { 
                console.error("ERROR: Problem serving " + request.url + " - " + err.message);
                response.writeHead(err.status, err.headers);
                response.end();
            }
            else { 
                // console.log("> " + request.url + " - " + res.message);
            }
        });
    };

    /**
     *  kick-off a number of dodgy unreliable web servers
    **/

    this.startServers = function(port) { 
        this.baseHttpPort = port;
        for(var i=0; i < this.numberOfServers; i++) { 
          var obj = startFlakyHttpServer(port + i);
          this.servers.push({ id: i, port: port + i, running: true, process: obj });
        };
        writeServerConfigToFile(this.servers);
        console.log('started %s servers', this.numberOfServers);
    };

    this.startClientChannel = function(port) { 
        var app = http.createServer(this.handler);
        app.listen(port);
        this.webSocketConnection = sio.listen(app, { log: false });
        console.log('started client channel web socket on %s', port);
        console.log('open browser at http://127.0.0.1:%s', port);
        this.webSocketConnection.sockets.on('connection', function (socket) { 
          console.log('got web client connection');
          var state = [];
          flaky.servers.forEach(function(server) { state.push({ port: server.port, running: server.running }); });
          socket.emit('flaky-init', { servers: state });
        });
    }

    this.startChaos = function(interval) { 
        this.chaosTimer = setInterval( 
          function() { 
            var server = flaky.servers[Math.floor(Math.random()*flaky.servers.length)];
            if(server.running) { 
              console.log('%s: stopping server at %s', new Date(), server.port);
              server.process.close();
              server.running = false;
              updateClients(flaky.webSocketConnection.sockets.clients(), server);
            }
            else { 
              console.log('%s: starting server at %s', new Date(), server.port);
              server.process.listen(server.port);
              server.running = true;
              updateClients(flaky.webSocketConnection.sockets.clients(), server);
            }
          },
          interval
        );
    };

    this.stopChaos = function() {
        clearInterval(this.chaosTimer);
    };

    function startFlakyHttpServer(port) { 
      return new Server().listen(port, listenerStarted(port));
    };

    function Server() { 
      return http.createServer(function(request, response) { 
        response.setHeader("Content-Type", "application/json");
        response.writeHead(200);
        response.write(JSON.stringify({'hello':'world'}));
        response.end();
      });
    };

    function updateClients(clients, server) { 
      clients.forEach(function(socket, index) { 
        socket.emit('flaky-stat', { port: server.port, running: server.running });
      });
    };

    function listenerStarted(port) { 
      return function() { 
        // console.log('listening on %j', port);
      }
    };

    function writeServerConfigToFile(servers) { 
        var config = [];
        servers.forEach(function(server) { config.push({ hostname: '127.0.0.1', port: server.port }); });
        fs.writeFile("flaky.json", JSON.stringify(config), function(error) { 
            if(error) { 
                console.error(error);
            }
        });
    };

};

module.exports = Flaky;
