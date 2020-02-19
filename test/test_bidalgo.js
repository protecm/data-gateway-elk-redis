const { Client } = require('@elastic/elasticsearch');

const client = new Client({ 
        node: {
            url: new URL('https://dataflowes.bidalgo.com'),
            ssl: {
                rejectUnauthorized: false
            }
        }
    });

async function run () {
    const { body } = await client.search({
      index: 'stats*',
      body: {
        size: 10,
        query: {
            match_all: {}
        }
      }
    });
  
    console.log(body.hits);
  }
  
  run().catch(console.log);