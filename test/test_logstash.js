const net = require('net');

const messageObj = {
    message: 'KUKU',
    value: 'PUPU'
};

const client = new net.Socket();

client.on('error', function(e) {
    console.log('error', e);
});

client.connect(5000, '127.0.0.1', function(e) {
    console.log('Connected', e);

    const message = JSON.stringify(messageObj);
	client.write(message+'\n', (e) => {
        console.log('Oooops!!!', e);
    });
});

client.on('ready', function(e) {
    console.log('ready', e);
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});


client.on('close', function() {
	console.log('Connection closed');
});