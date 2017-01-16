var Handlebars = require('handlebars');
var $ = require('jquery');
var Bind = require('../binder');
var crypto = require('crypto');
const fs = require('fs')
const ipc = require('electron').ipcRenderer;
const exec = require('child_process').exec;
const async = require('async');
const assert = require('assert');

var source,
    partial, 
    template,
    socket,
    container,
    INITIATOR_STATE = 0,
    RESPONDER_STATE = 0,
    localClientID,
    clients = {},
    clientsSecrets = {},
    clientsKeys = {},
    private_key,
    public_key,
    table;

// Load and compile Handlebar msg templates.    
try {
    source = require('fs').readFileSync('./view/clientCredentials.handlebars', 'utf-8');
    partial = require('fs').readFileSync('./view/clientCredentialsPartial.handlebars', 'utf-8');
} catch (err) {    
    source = '<div>' + err + '</div>';
} finally {    
    template = Handlebars.compile(source);
    templatePartial = Handlebars.compile(partial);
    Handlebars.registerPartial("client", partial);  
}

var Clients = function(_socket, _container, _clients) {
    socket = _socket;
    container = _container;      
    clients = _clients;
    localClientID = _clients.clientID;
    initClientsView(); 
    clientsSecrets = bindModelView(clients);     
    if ( $.isEmptyObject(clientsSecrets) ) table.hide();
    console.log(clientsSecrets);
};

Clients.prototype.addClient = function(client) {   
    var tmpModel = {};
    table.append($( templatePartial(client) ));
    
    $('#' + client.clientID).blur(function() { //Trigger 'GENERATE SYMMETRIC KEY FROM A SECRET' with focusout.
        generateSymmetricForClient(this.id);        
    });

    tmpModel[client.clientID] = ''; 
    clientsSecrets = Bind(tmpModel, clientsSecrets);
    table.show();
}

Clients.prototype.removeClient = function(client) {
    $("." + client.clientID).remove();
    delete clientsSecrets[client.clientID];
    delete clientsKeys[client.clientID];
    if ( $.isEmptyObject(clientsSecrets) ) table.hide();
}

Clients.prototype.getSecretOf = function(clientID) {
    return clientsSecrets[clientID];
}

Clients.prototype.getKeyOf = function(clientID) {
    console.log(clientsKeys);
    return clientsKeys[clientID];
}

Clients.prototype.keyAgreementProtocol = keyAgreementProtocol;

function generateSymmetricForClient(id) {
    // GENERATE SECRET KEY using pbkdf2 ASYNC version (salt value = unique clientID)
    if ( clientsSecrets[id] !== '' ) {
        crypto.pbkdf2(clientsSecrets[id], id , 60000, 16, 'sha256', function(err, key) {
            if (err) throw err;
            console.log(id, "KEY:", key);
            clientsKeys[id] = key; 
        });
    } else {
        delete clientsSecrets[id];
        delete clientsKeys[id]; 
    }        
}

function initClientsView() {
    container.append($( template(clients) ));
    table = $('#clients_table');

    table.keypress(function (event) { //Trigger 'GENERATE SYMMETRIC KEY FROM A SECRET' with keypress.
        if (event.keyCode == 13) {            
            event.target.blur();
            return false;
        }
    }).on('click', ':button', sendPubKeyRequest); // INIT KEY AGREEMENT PROTOCOL    

    $('#clients_table td.secret').blur(function() { //Trigger 'GENERATE SYMMETRIC KEY FROM A SECRET' with focusout.
        generateSymmetricForClient(this.id);        
    });
}

function bindModelView(model) {
    var tmpModel = {};
    for (var i=0, len = model.clients.length; i<len; i++) {
        tmpModel[model.clients[i].clientID] = '';
    }    
    return Bind(tmpModel);    
}

function sendPubKeyRequest(event) {    
    var $tr = $( $(event.target).closest('tr') );
    var _username = $.trim($tr.children()[0].textContent);
    var _clientID = $tr.children()[1].id;                
    console.log("handleKeyAgreement:", _clientID, _username);   
    
    var _request = {
        type: 3, // 3 = public key agreement protocol
        INITIATOR: 0, // 0 = send request for the public key                               
        from: localClientID,
        to: _clientID 
    };
                    
    keyAgreementProtocol(_request);                       
}

//================================================= 
// Simple (insecure) key agreement protocol based
// on public key cryptography. 
//=================================================
function keyAgreementProtocol(_msg) {
    console.log(localClientID, _msg);
    
    if (_msg !== undefined) {
        
        //===========================
        // RESPONDER's state machine
        //===========================
        if ( _msg.INITIATOR !== undefined && (_msg.from !== localClientID) ) { // Msg from INITIATOR            
            switch (_msg.INITIATOR) {
                case 0: // 0 = got a request for the public key                    
                    if (RESPONDER_STATE === 0 && public_key !== undefined) {                        
                        var _response = {
                            type: 3, // 3 = public key agreement protocol,
                            RESPONDER: 1, // 1 = respond with the public key          
                            from: localClientID,
                            to: _msg.from,
                            content: JSON.stringify(public_key) 
                        };
                        
                        socket.write( JSON.stringify(_response) );
                        RESPONDER_STATE = 1;
                        
                        setTimeout(function() { // Reseting the state after a timeout
                            RESPONDER_STATE = 0;
                        }, 4000);                                             
                    }
                    break;
                    
                case 1: // 1 = got an encrypted secret key
                    if (RESPONDER_STATE === 1) {
                        var _response = {
                            type: 3, // 3 = public key agreement protocol
                            RESPONDER: 2, // 2 = send RESPONDER finished   
                            from: localClientID,
                            to: _msg.from,
                            content: "RESPONDER FINISHED" 
                        };
                                         
                        socket.write( JSON.stringify(_response) );                                         
                        RESPONDER_STATE = 2;                                         
                    }
                    break;
                    
                case 2: // 2 = got INITIATOR finished
                    if (RESPONDER_STATE === 2) {
                        RESPONDER_STATE = 0;                                         
                    }
                    break;
                    
                default:            
            }
        }    
        //===========================
        // INITIATOR's state machine
        //===========================
        if ( (_msg.INITIATOR !== undefined) && (_msg.from === localClientID) ) { // The very first msg from INITIATOR
            
            switch (_msg.INITIATOR) {
                case 0: //  0 = send request for the public key (the first msg from INITIATOR!) 
                    if (INITIATOR_STATE === 0) {
                        socket.write( JSON.stringify(_msg) );
                        INITIATOR_STATE = 1;
                        
                        setTimeout(function() { // Reseting the state after a timeout
                            INITIATOR_STATE = 0;
                        }, 4000);                        
                    }
                    break;
                      
                default:     
            }     
        }
                                                        
        if (_msg.RESPONDER !== undefined) { // Msg from RESPONDER  
            
            switch (_msg.RESPONDER) {
                case 1: // 1 = got a public key
                    if (INITIATOR_STATE === 1) {
                        var _response = {
                            type: 3, // 3 = public key agreement protocol
                            INITIATOR: 1, // 1 = respond with encrypted secret key
                            from: localClientID,
                            to: _msg.from,
                            content: "ASYMM-ENCRYPTED SYMM-KEY" 
                        };
                        
                        socket.write( JSON.stringify(_response) );
                        INITIATOR_STATE = 2;     
                    }
                    break;
                    
                case 2: // 2 = got RESPONDER finished
                    if (INITIATOR_STATE === 2) {
                        var _response = {
                            type: 3, // 3 = public key agreement protocol
                            INITIATOR: 2, // 2 = send INITIATOR finished   
                            from: localClientID,
                            to: _msg.from,
                            content: "INITIATOR FINISHED" 
                        };
                        
                        socket.write( JSON.stringify(_response) );
                        INITIATOR_STATE = 0;                        
                    }
                    break;
                    
                default:            
            }            
        }
    }
} 

//===================================== 
// Handles loading of assymetric keys.
//=====================================
function loadPrivateKey(path, password, callback) {    
    var open_private_key = exec('openssl pkey -inform PEM -in ' + path + ' -passin pass:' + password, function(err, _private_key, stderr) {            
        if (err !== null) {            
            ipc.send('alert', "ERROR while loading your PRIVATE KEY\n\nPlease check your password or a path to the key.\n\n" + err.toString());
            return callback(err);
        }  
        password = "";              
        return callback(null, _private_key);                       
    });                                
}

function loadPublicKey(path, callback) {
    fs.readFile(path, function(err, data) {
        if (err !== null) {
            ipc.send('alert', "ERROR while loading your PUBLIC KEY\n\nPlease check your path to the key.\n\n" + err.toString());
            return callback(err);
        }        
        return callback(null, data);                
    });    
}

ipc.on('loadAsymmKeys', function(event, password) {
    const keysPath = __dirname + '/../security/keys/'; // TODO: Read these from config...
    const privateKeyPath = keysPath + 'private_key.pem';
    const publicKeyPath = keysPath + 'public_key.pem';
    var asyncTasks = [];
    
    var privateKeyTask = function(callback) {
       loadPrivateKey(privateKeyPath, password, callback); 
    };
    
    var publicKeyTask = function(callback) {
       loadPublicKey(publicKeyPath, callback); 
    };    
        
    asyncTasks.push(privateKeyTask);    
    asyncTasks.push(publicKeyTask);
    
    async.parallel(asyncTasks, function(err, results) {
        if (!err) {
            private_key = results[0];
            public_key = results[1];             
            ipc.send('asymmKeysLoaded', "SUCCESS: Public and private keys loaded!\n");            
        }
    });    
});

module.exports = Clients;