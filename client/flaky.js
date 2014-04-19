
var Flaky = {

    consoleId: 'console',

    elementExists: function(id) { 
        return document.getElementById(id) !== null;
    },

    serverStateString: function(server) { 
        return server.running ? 'started' : 'stopped';
    },

    addServerToDisplay: function(server) { 
        var serverElem = document.createElement('span');
        serverElem.id = server.port;
        serverElem.innerHTML = JSON.stringify(server.port);
        serverElem.className = Flaky.serverStateString(server);
        document.getElementById(Flaky.consoleId).appendChild(serverElem);
    }

};
