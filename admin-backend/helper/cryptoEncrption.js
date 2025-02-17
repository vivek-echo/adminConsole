const crypto = require('crypto');

// Ensure consistent key derivation
const encryptionKey = crypto.createHash('sha256').update('vivekJhaCrypto').digest();
const algorithm = 'aes-256-cbc';

function decryptCryptoJsString(encryptedData) {
    try {
        const encString = encryptedData.s;
        const ct = encryptedData.ct;
        const iv = encryptedData.iv;
        // Decode the provided inputs
        const salt = Buffer.from(encString, 'hex');
        const ciphertext = Buffer.from(ct, 'base64');
        const initVector = Buffer.from(iv, 'hex');

        // Derive the key using a method equivalent to the Laravel implementation
        const concatedPassphrase = Buffer.concat([Buffer.from('vivekJhaCrypto', 'utf8'), salt]);
        let md5 = crypto.createHash('md5').update(concatedPassphrase).digest();
        const md5Array = [md5];
        
        for (let i = 1; i < 3; i++) {
            md5 = crypto.createHash('md5').update(Buffer.concat([md5, concatedPassphrase])).digest();
            md5Array.push(md5);
        }

        const key = Buffer.concat(md5Array).slice(0, 32);

        // Perform the decryption
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, initVector);
        let decrypted = decipher.update(ciphertext);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return JSON.parse(decrypted.toString('utf8')); // Parse decrypted JSON
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Decryption failed. Invalid data or key.');
    }
}

module.exports = { decryptCryptoJsString };
