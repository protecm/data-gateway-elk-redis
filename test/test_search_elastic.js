const { Client } = require('@elastic/elasticsearch');

const client = new Client({ 
        node: {
            url: new URL('http://localhost:9200'),
            auth: {
                username: 'elastic',
                password: 'changeme'
            }
        }
});

async function run () {
    const { body } = await client.search({
        index: 'game-of-thrones',
        // type: '_doc', // uncomment this line if you are using {es} ≤ 6
        body: {
            query: {
            match: { quote: 'winter' }
            }
        }
    });

    console.log(body.hits.hits);

}

run().catch(console.log);