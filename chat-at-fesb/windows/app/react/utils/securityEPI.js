// import Crypto from 'crypto'
import Debug from 'debug'
const debug = Debug('crypto')

// Basic alphabet.
const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';

const isNum = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

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

        // let encryptedText = params.cipher;
        // let key = params.key;
        //
        // return new Promise((resolve, reject) => {
        //     let text = encryptedText
        //         .split('')
        //         // turn letter to numbers, exclude other chars
        //         .map(letter => {
        //             if (CHARACTERS.indexOf(letter) >= 0)
        //                 return CHARACTERS.indexOf(letter);
        //             else
        //                 return letter;
        //         })
        //         // unshift number for key, exclude other chars
        //         .map(num => {
        //             if (!isNum(num))
        //                 return num;
        //             else
        //                 return (num - key) >= 0 ? (num - key) : (num + (26-key));
        //         })
        //         // return all to chars and join to string
        //         .map(shiftedNum => {
        //             if (!isNum(shiftedNum)) return shiftedNum;
        //             else return CHARACTERS.charAt(shiftedNum);
        //         }).join('');
        //
        //     resolve(text);
        // })
    }
}

class SubCipher {
    static encrypt(params) {}
    static decrypt(params) {}
}

class AES {
    static encrypt(params) {}
    static decrypt(params) {}
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