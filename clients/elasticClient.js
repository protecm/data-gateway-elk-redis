const { Client } = require('@elastic/elasticsearch');

const ELASTIC_SERVER = 'localhost';

const elasticClient = new Client({ 
    node: {
        url: new URL(ELASTIC_SERVER),
        ssl: {
            rejectUnauthorized: false
        }
    }
});


module.exports = {
    elasticClient
};