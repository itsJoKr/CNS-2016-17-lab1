'use strict'

var $ = require('jquery'),
    Handlebars = require('handlebars'),
    ipc = require('electron').ipcRenderer,
    net = require('net'),
    crypto = require('crypto');

// Import our own moduels.
var Bind = require('./binder'),
    Utils = require('./utils'),
    utils = new Utils({usernameLength: 8}),
    Clients = require('./controllers/clientCredentials.js'),
    clients; // A reference to a new clients object    

// Crypto
var Cipher_AES_128_CBC = require('./security/cbc_AESv1.js'), // CBC mode
    iv = new Buffer(''); // Initialization vector (IV)

// Default server info.
var SERVER = {    
    server: 'localhost',
    port: '6968',
    nickname: utils.getRandomName()},
    msg = {},
    date = new Date(),
    username = null,
    clientID = null,
    clientSocket = null,
    TIMEOUT = 2000; // Wait at most 2sec after requesting connection to the server.

// Init RNG.
crypto.randomBytes(0); 

// Bind serverModel to the corresponding input fields.
var serverModel = Bind(SERVER);

// Load and compile Handlebar msg template/s.
var msgTmpl, msgTmplCompiled;
try {
    msgTmpl = require('fs').readFileSync('./view/msg.handlebars', 'utf-8');
} catch (err) {
    // Handle an error (e.g., file-not-found error)
    msgTmpl = '<div>' + err.message + '</div>'; // TODO: Inform the user...
} finally {
    msgTmplCompiled = Handlebars.compile(msgTmpl);  
}

// Close TCP sockets.
$(window).bind('beforeunload', function(){
	if (typeof clientSocket !== 'undefined' && username)
        clientSocket.destroy();
});

$(document).ready(function() {    
    var introPage = $(".intro"),
        mainPage =  $(".main"),
	    sendBtn = $("#botun"),
        joinBtn = $("#join"),
	    contentBox = $("#content"),
	    inputBox = $("#inputBox"),
        loadAsymmKeysBtn = $("#loadKeysBtn");                
    
    // Make the intro page visible at the start of the app.
    introPage.addClass('visible');
    loadAsymmKeysBtn.hide();
    
    //=========================================================
    // Handles TCP socket communication and incoming messages.
    //=========================================================
    if ( joinBtn.length ) { // Check if DOM elements actually exist.
        var timer;
        joinBtn.on("click", function() {
            var loader = showLoader(introPage, "Connecting to " + serverModel.server + ':' + serverModel.port); 

            try {
                clientSocket = net.connect({port: serverModel.port, host: serverModel.server
                }).on('connect', function() {
                        clearTimeout(timer);
                        username = serverModel.nickname;                                        

                        clientSocket.write( JSON.stringify({username: username}) ); // nickname selected by the user
                                                    
                        // Hide intro then show main.
                        hide(introPage, 500, show(mainPage)); 
                        inputBox.focus();                
                        
                }).on('data', function(msg) {
                        clearTimeout(timer);      
                        try {
                            var _msg = JSON.parse(msg);
                            
                            //==================================
                            // Here we handle CONTROL messages.
                            //==================================
                            switch (_msg.type) {
                                case 0: // INIT message
                                    clients = new Clients(clientSocket, mainPage, _msg.clients); 
                                                                                                                                
                                    clientID = _msg.clients.clientID;
                                    _msg.direction = 'incoming';

                                    addMsg(msgTmplCompiled, contentBox, _msg);
                                    
                                    // Show priv key button and attach a listener to it.
                                    loadAsymmKeysBtn.show();                                    
                                    loadAsymmKeysBtn.on('click', function(event) {
                                        event.preventDefault();
                                        ipc.send('toggle-insert-view'); // Show password window. 
                                    });                      
                                                                                      
                                    break;
                                
                                case 1: // NEW CLIENT joined
                                    if (_msg.clientID && _msg.username) { 
                                        clients.addClient(_msg);
                                    }
                                    break;
                                    
                                case 2: // CLIENT LEFT
                                    if (_msg.clientID ) { 
                                        clients.removeClient(_msg);
                                    }
                                    break;
                                    
                                case 3: // KEY AGREEMENT PROTOCOL
                                    clients.keyAgreementProtocol(_msg);
                                    break;
                                
                                //======================================================
                                // Here we handle REGULAR messages (shown to the user).
                                //======================================================    
                                default: // Most likely a REGULAR MESSAGE                                                                                                           
                                    if (_msg.clientID && _msg.username && _msg.timestamp && _msg.content) {
                                        _msg.direction = 'incoming';

                                        var key =  clients.getKeyOf(_msg.clientID);
                                        
                                        // CBC encryption
                                        if ( key !== undefined ) {
                                            Cipher_AES_128_CBC.decrypt(key, _msg.content, function done(err, plaintext) {
                                                if (err) {
                                                    console.log("ERROR: Cipher_AES_128_CBC.decrypt()\n\n" + err.message);
                                                } else {
                                                    _msg.content = plaintext;
                                                }                                                
                                            });
                                        }                                        
                                        addMsg(msgTmplCompiled, contentBox, _msg);                                        
                                    }
                            }                                                                                                                   
                        } catch(err) {
                            console.log(err);
                            console.log(msg);
                            addMsg(msgTmplCompiled, contentBox, _msg); 
                        }
                        
                }).on('error', function(err) {
                    clearTimeout(timer);
                    
                    hide(loader, 400); 
                    
                    // Hide main, show intro.
                    hide(mainPage, 250);
                    show(introPage, 250);
                                    
                    setTimeout(function(){ // Give some time to the mainPage to dissapear (alert blocks it).
                        alert(err.message);
                        location.reload();
                    }, 500);                
                });     
            
                timer = setTimeout(function() {
                    clientSocket.destroy();
                    hide(loader, 500);
                    setTimeout(function(){
                        alert('Connection to server "' + serverModel.server + ':' + serverModel.port + '" timed out!');
                    }, 50);        
                }, (TIMEOUT || 5000));
                
            } catch(err) {
                clearTimeout(timer);
                hide(loader, 500);
                alert(err.message);
            }      
        });   
    }

    //============================
    // Handles outgoing messages.
    //============================
	if (sendBtn.length && contentBox.length ) { // Check if DOM elements actually exist.
		var _plaintext,
            _msg;
        sendBtn.on("click", function(){                                   
			_plaintext = $.trim(inputBox.text());

			if ( _plaintext != '' ) {
                var key =  clients.getKeyOf(clientID);                
                Cipher_AES_128_CBC.encrypt(key, _plaintext, function done(err, ciphertext) {
                    
                    if (err) {
                        console.log("ERROR: Cipher_AES_128_CBC.encrypt()\n\n" + err.message);                        
                        _msg = _plaintext;                            
                    } else {
                        _msg = ciphertext;
                    }
                    
                    _msg = {clientID: clientID,
                            username: username,
                            timestamp: date.getHours() + ":" + ('0' + date.getMinutes()).slice(-2),
                            content: _msg};
                            
                    clientSocket.write( JSON.stringify(_msg), function() {
                        _msg.content = _plaintext;
                        addMsg(msgTmplCompiled, contentBox, _msg);
                    });                    
                });                                    
			}
            inputBox.text('');
		});
	}

	$(document).keypress(function(e) {
		if(e.which == 13) {
            if ( mainPage.is('.visible') && sendBtn ) {                
                sendBtn.trigger("click");
                e.preventDefault();
                return;
            }
            if ( introPage.is('.visible') && joinBtn ) joinBtn.trigger("click");
		}
	});    
    
    // Display asymm crypto-related window.
    ipc.on('asymmKeysLoaded', function(event, arg) {    
        alert(arg);
        loadAsymmKeysBtn.unbind( "click" );
        loadAsymmKeysBtn.html('Public/private keys loaded.');           
        loadAsymmKeysBtn[0].style.setProperty('background-color', '#990000', 'important');
        loadAsymmKeysBtn[0].style.setProperty('color', '#ccc', 'important'); 
    });    

    // Alert
    ipc.on('alert', function(event, arg){
        alert(arg);
    });        
});

function addMsg(template, container, msg) {        
	msg.msg_cloud = 'out-msg-cloud';
    
    switch (msg.direction) {
        case 'incoming':
            msg.text_align ='left';
            msg.msg_cloud = (msg.username === 'SERVER@FESB') ? 'in-msg-srv-cloud' : 'in-msg-cloud';          
            break;
    
        default:
            msg.text_align ='right';
            break;
    }            
    
	container.append($(template(msg)));
	container.animate({ scrollTop: container[0].scrollHeight }, 'slow');
}

function showLoader(div, text) {
    var $divLoader = div.find('.loader-overlay');
    if ($divLoader.is('.visible')) return;
    $divLoader.find('p').text(text);
    $divLoader.addClass('visible');
    return $divLoader;
}

// Smooth transision from visible to hidden states.
function hide(page, duration, callback) {
    if ( page ) {
        page.addClass('visuallyhidden');
        setTimeout(function(){ 
            page.removeClass('visuallyhidden');
            page.removeClass('visible');
            
            if ( callback && typeof(callback) == 'function' ) {
                callback();
                return;
            }                      
        }, (duration || 1000));
    }
    return;
}

// Smooth transision from hidden to visible states.
function show(page, duration, callback) {
    if ( page ) {        
        page.addClass('visuallyhidden');
        page.addClass('visible');
        setTimeout(function(){ 
            page.removeClass('visuallyhidden');
            
            if ( callback && typeof(callback) == 'function' ) {
                callback();
                return;
            }
            
        }, (duration || 10));
    } 
    return;
}