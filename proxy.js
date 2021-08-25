require('dotenv').config();
var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
var cors = require('cors');

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors());

app.use('/', function (clientRequest, clientResponse) {
  var url;
  console.log(clientRequest.originalUrl);
  url = process.env.REACT_APP_BASE_API_URL;
  var parsedHost = url.split('/').splice(2).splice(0, 1).join('/');
  var parsedPort;
  var parsedSSL;
  if (url.startsWith('https://')) {
    parsedPort = 443;
    parsedSSL = https;
  } else if (url.startsWith('http://')) {
    parsedPort = 80;
    parsedSSL = http;
  }
  var options = {
    hostname: parsedHost,
    port: parsedPort,
    path: clientRequest.url,
    method: clientRequest.method,
    headers: {
      'User-Agent': clientRequest.headers['user-agent'],
      ...(clientRequest.headers['authorization'] && {
        Authorization: clientRequest.headers['authorization'],
      }),
      ...(clientRequest.headers['content-type'] && {
        'Content-Type': clientRequest.headers['content-type'],
      }),
    },
  };

  console.log('\n');
  console.log(
    clientRequest.method + ' - ' + process.env.REACT_APP_BASE_API_URL + clientRequest.path
  );
  console.log('>>> BODY >>>', clientRequest.body);
  console.log('>>> HEADERS >>>', clientRequest.headers);

  var serverRequest = parsedSSL.request(options, function (serverResponse) {
    var body = '';
    if (String(serverResponse.headers['content-type']).indexOf('text/html') !== -1) {
      serverResponse.on('data', function (chunk) {
        body += chunk;
      });

      serverResponse.on('end', function () {
        // Make changes to HTML files when they're done being read.
        body = body.replace(`example`, `Cat!`);

        clientResponse.writeHead(serverResponse.statusCode, serverResponse.headers);
        clientResponse.end(body);
      });
    } else {
      serverResponse.pipe(clientResponse, {
        end: true,
      });
      const contentType = serverResponse.headers['content-type'] || 'type';
      clientResponse.status(serverResponse.statusCode);
      clientResponse.contentType(contentType);
    }
  });

  serverRequest.write(JSON.stringify(clientRequest.body));
  serverRequest.end();
});

app.listen(3001);
console.log('Running on 0.0.0.0:3001', process.env.REACT_APP_BASE_API_URL);
