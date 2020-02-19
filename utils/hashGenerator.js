const crypto = require('crypto');

function generateHashFromObject(algorithm, obj) {
    return crypto.createHash(algorithm).update(JSON.stringify(obj)).digest('hex');
}

module.exports = {
    generateHashFromObject
};