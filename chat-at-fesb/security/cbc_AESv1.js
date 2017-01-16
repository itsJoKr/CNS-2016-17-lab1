const crypto = require('crypto');
const iv_length_bytes = 16;
const iv_length_hex = 32;
var Cipher = require('./ecb_AES.js');
Cipher.setAlgorithm('aes-128-cbc');

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt 
};

function encrypt(key, plaintext, callback) {
    if ( key && plaintext ) {
        crypto.randomBytes(iv_length_bytes, function(err, iv) { // Generate random IV
            if (err) {                
                if (callback) callback(err);
                callback = null;                
                return;
            }                                                        
            Cipher.encrypt(key, iv, plaintext, function done(err, ciphertext) {
                if (err) { 
                    if (callback) callback(err);
                    callback = null;                    
                    return;
                }
                // Everything is OK, so prepend IV to the ciphertext & callback().                 
                if (callback) callback(null, iv.toString('hex') + ciphertext);
                callback = null;
                return;                
            });                                           
        });
        return;                                     
    }
    
    if (callback) callback(new Error("Missing 'key' and/or 'plaintext'."));
    callback = null;
    return;   
}

function decrypt(key, ciphertext, callback) {
    if ( key && ciphertext ) {
        try {
            var iv = ciphertext.slice(0, iv_length_hex); // Get IV (assuming HEX encoding).        
            iv = new Buffer(iv, 'hex');                                                                                                                                                      
            Cipher.decrypt(key, iv, ciphertext.slice(iv_length_hex), function done(err, plaintext) {
                if (err) { 
                    if (callback) callback(err);
                    iv = null; 
                    callback = null;                    
                    return;
                }
                // Everything is OK, so callback().                 
                if (callback) callback(null, plaintext);
                iv = null; 
                callback = null;
                return;            
            });        
            return;
        } catch(err) { // E.g., IV might not be HEX encoded.
            if (callback) callback(err);
            iv = null; 
            callback = null;            
        }                                     
    }
    
    if (callback) callback(new Error("Missing 'key' and/or 'ciphertext'."));
    iv = null; 
    callback = null;
    return;   
}
