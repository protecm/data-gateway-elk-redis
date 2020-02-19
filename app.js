const express = require('express');
const bodyParser = require('body-parser');
const {dataSourceService} = require('./data_sources');

const app = express();
app.use(bodyParser.json());
app.post('/', async function (req, res) {
    const rsponse = await processRequest(req);
    res.send(rsponse);
});

async function processRequest(httpRequest) {
    const requestData = httpRequest.body;
    const dataSource = dataSourceService.getDataSourceByContext(requestData);

    return await dataSource.getData(requestData);
}

module.exports = {
    app
};
