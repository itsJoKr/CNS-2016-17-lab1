var crypto = require('crypto');
var algorithm = 'aes-128-ecb';

function encrypt(key, iv, plaintext, callback) {
    try {
        var cipher = crypto.createCipheriv(algorithm, key, iv);         
        var ciphertext = cipher.update(plaintext,'utf8','hex');
        ciphertext += cipher.final('hex');    
        if (callback) callback(null, ciphertext);
        return ciphertext;
    } catch(err) {
        if (callback) callback(err);
        return;
    }
}
     
function decrypt(key, iv, ciphertext, callback) {
    try {
        var decipher = crypto.createDecipheriv(algorithm, key, iv);          
        var plaintext = decipher.update(ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');
        if (callback) callback(null, plaintext);
        return plaintext;
    } catch(err) {
        if (callback) callback(err);
        return;
    }
}

function setAlgorithm(_algorithm) {
    if ( typeof _algorithm != undefined && (crypto.getCiphers().indexOf(_algorithm) !== -1) ) {
        algorithm = _algorithm;
    }    
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    setAlgorithm: setAlgorithm 
};