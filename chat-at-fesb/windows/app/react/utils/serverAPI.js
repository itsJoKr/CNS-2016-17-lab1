import ServerBaseAPI from './serverBaseAPI.js'
import ServerActionCreator from '../actions/server.actioncreator.js'
import {Constants} from '../dispatcher/app.dispatcher.js'
import Utils from './utils.js'
import ClientsStore from '../stores/clients.store.js';

const Sekjuriti = require('./securityEPI').Sekjuriti;

const security = new Sekjuriti(Sekjuriti.CEASAR);

/** 
 * Control message processing functions. 
 */
function init(msg) {    
    ServerActionCreator.serverCtrMsg({
        type: Constants.TYPE_INIT,
        payload: msg
    })
}

function clientJoined(msg) {
    ServerActionCreator.serverCtrMsg({
        type: Constants.TYPE_CLIENT_JOINED,
        payload: msg
    })
}

function clientLeft(msg) {
    ServerActionCreator.serverCtrMsg({
        type: Constants.TYPE_CLIENT_LEFT,
        payload: msg
    })
}

function keyAgreeProt(msg) {
}

/** 
 * Regular message processing function. 
 */
function regular(msg) {
    let message = msg.content;

    if (ClientsStore.getState().clients[msg.clientID].secret === undefined) {
        ServerActionCreator.serverNewMsg(msg);
    } else {
        const secret = ClientsStore.getState().clients[msg.clientID].secret;
        security.decrypt({
            cipher: message,
            key: parseInt(secret)
        }).then(result => {
            msg.content = result;
            ServerActionCreator.serverNewMsg(msg)
        });
    }
}

const Process = {
    0: init,
    1: clientJoined,
    2: clientLeft,
    3: keyAgreeProt
}

class ServerAPI extends ServerBaseAPI {

    _processMessage(msg) {
        Process.hasOwnProperty(msg.type) ? (            
            Process[msg.type](msg) 
        ) : (                
            regular(msg)
        )
    }    

    onConnect(options) {
        const nickname = {
            nickname: options.nickname || Utils.getRandomName()
        }
        ServerActionCreator.serverConnected(nickname)                         
        ServerBaseAPI.write(nickname)
    }    

    onData(msg) {
        this._processMessage(msg)
    }

    write(data) {
        // Enkripicija ide ode
        console.log('Server sending: ', data);
        let msg = data.content;
        const { secret } = ClientsStore.getState()

        if (secret === null) {
            console.log('secret is null');
            ServerBaseAPI.write(data)
        } else {

            let params = {
                plaintext: msg,
                key: parseInt(secret)
            };

            security.encrypt(params)
                .then(result => {
                    data.content = result;
                    ServerBaseAPI.write(data);
                })
                .catch(err => console.log(err));
        }
    }    
}

const serverAPI = new ServerAPI()

export default serverAPI