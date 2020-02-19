const fs = require('fs');

function logToFile(filePrefix, data) {
    const jsonData = JSON.stringify(data);
    fs.writeFileSync(`.\\data\\${filePrefix}-${Date.now()}.json`, jsonData);
}

module.exports = {
    logToFile
};