// import Crypto from 'crypto'
import Debug from 'debug'
const debug = Debug('crypto');
const crypto = require('crypto');

// Basic alphabet.
const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';

const isNum = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

const algorithm = 'aes-128-ctr';

//-----------------------
//  Key generator
//-----------------------
class Key {
    static substitution(params) {}
    static pbkdf2(params) {}
    static random(params) {}
}

Key.SUBSTITUTION = 'substitution';
Key.PBKDF2 = 'pbkdf2';
Key.RANDOM = 'random';

class Caesar {
    static encrypt(params) {
        let text = params.plaintext.toLowerCase();
        let key = params.key;

        return new Promise((resolve, reject) => {
            let encryptedText = text
                .split('')
                // turn letters to number, exclude other chars
                .map(letter => {
                    if (CHARACTERS.indexOf(letter) >= 0)
                        return CHARACTERS.indexOf(letter);
                    else
                        return letter;
                })
                // shift numbers for key, exclude other chars
                .map(num => {
                    if (!isNum(num))
                        return num;
                    else
                        return (num + key) % 26;
                })
                // return all to chars and join to string
                .map(shiftedNum => {
                    if (!isNum(shiftedNum)) return shiftedNum;
                    else return CHARACTERS.charAt(shiftedNum);
                }).join('');

            resolve(encryptedText);
        })
    }

    static decrypt(params) {
        let encryptedText = params.cipher;

        console.log('DECRYPT KEY ' + params.key + 1);

        let params2 = {
            plaintext: encryptedText,
            key: (26-params.key)
        };

        return this.encrypt(params2);
    }
}

class SubCipher {
    static encrypt(params) {}
    static decrypt(params) {}
}

class AES {
    static encrypt(params) {
        return new Promise((resolve, reject) => {
            let text = params.plaintext;
            let key = params.key;
            // let iv = new Buffer('');
            let iv = params.iv;

            console.log('IV', iv);

            let cipher = crypto.createCipheriv(algorithm, key, iv);
            let ciphertext = cipher.update(text, 'utf8', 'hex');
            ciphertext += cipher.final('hex');

            resolve(ciphertext);
            // console.log(crypto);
        });
    }

    static decrypt(params) {
        return new Promise((resolve, reject) => {
            let encryptedText = params.cipher;
            let key = params.key;
            // let iv = new Buffer('');
            let iv = params.iv;


            let cipher = crypto.createDecipheriv(algorithm, key, iv);
            let plaintext = cipher.update(encryptedText, 'hex', 'utf8');
            plaintext += cipher.final('utf8');

            resolve(plaintext);
        });
    }
}


//-----------------------
//  Generic wrapper
//-----------------------
class SecurityAPI {


    constructor(cipher) {
        this.cipher = cipher;
    }

    generateKey(type, params) {
        if (type == Key.SUBSTITUTION) {
            return Key.substitution(params);
        } else if (type == Key.PBKDF2) {
            return Key.pbkdf2(params);
        } else if (type == Key.RANDOM) {
            return Key.random(params);
        } else {
            debug(`ERROR: ${type} unknown type for key!`)
        }
    }

    encrypt(params) {
        if (this.cipher == SecurityAPI.CEASAR) {
            return Caesar.encrypt(params);
        } else if (this.cipher == SecurityAPI.SUB_CIPHER) {
            return SubCipher.encrypt(params);
        } else if (this.cipher == SecurityAPI.AES) {
            return AES.encrypt(params);
        } else {
            debug(`ERROR: ${this.cipher} unknown cipher!`)
        }
    }

    decrypt(params) {
        if (this.cipher == SecurityAPI.CEASAR) {
            return Caesar.decrypt(params);
        } else if (this.cipher == SecurityAPI.SUB_CIPHER) {
            return SubCipher.decrypt(params);
        } else if (this.cipher == SecurityAPI.AES) {
            return AES.decrypt(params);
        } else {
            debug(`ERROR: ${this.cipher} unknown cipher!`)
        }
    }
}

SecurityAPI.CEASAR = 'Ceasar';
SecurityAPI.SUB_CIPHER = 'SubCipher';
SecurityAPI.AES = 'AES';

export { SecurityAPI as Sekjuriti }