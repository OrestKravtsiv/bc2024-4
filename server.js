//Приєднав модулі
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');

//Налаштував потрібні аргументи
program
    .requiredOption('-h, --host <host>', 'address of the server')
    .requiredOption('-p, --port <port>', 'port of the server')
    .requiredOption('-c, --cache <path>', 'cache directory path')
    .parse(process.argv);
//створив змінні для параметрів аргументів
const options = program.opts();

const requestListener = function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, world!');
}

const server = http.createServer(requestListener);

server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});

