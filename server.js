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

async function handleGetRequest(res, cacheFilePath) {
    try {
        const data = await fs.readFile(cacheFilePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        } else {
            throw error;
        }
    }
}



const requestListener = async function (req, res) {
    const urlPath = req.url.slice(1);
    const cacheFilePath = path.join('cache', `${urlPath}.jpg`);

    try {
        if (req.method === 'GET') {
            await handleGetRequest(res, cacheFilePath);
        } else if (req.method === 'PUT') {
            await handlePutRequest(req, res, cacheFilePath);
        } else if (req.method === 'DELETE') {
            await handleDeleteRequest(res, cacheFilePath);
        } else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
        }
    } catch (error) {
        console.error('Error handling request:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

const server = http.createServer(requestListener);

server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
});

