import ServerBaseAPI from './serverBaseAPI.js'
import ServerActionCreator from '../actions/server.actioncreator.js'
import {Constants} from '../dispatcher/app.dispatcher.js'
import Utils from './utils.js'

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
    //console.log(msg)
}

/** 
 * Regular message processing function. 
 */
function regular(msg) {
    //console.log(msg)
    ServerActionCreator.serverNewMsg(msg)
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
        ServerBaseAPI.write(data)
    }    
}

const serverAPI = new ServerAPI()

export default serverAPI