//Приєднав модулі
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');
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
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

async function handlePutRequest(req, res, imagePath, httpCode) {
    try {
        const response = await superagent.get(`https://http.cat/${httpCode}`);
        const image = response.body;
        console.log("false")

        await fs.writeFile(imagePath, image);

        res.writeHead(201, { 'Content-Type': 'image/jpeg' });
        res.end(image);
    }
    catch (error) {
        console.error('Error saving image:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error saving image');
    }
}



const requestListener = async function (req, res) {
    const urlPath = req.url.slice(1);
    const cacheFilePath = path.join(options.cache, `${urlPath}.jpg`);

    try {
        if (req.method === 'GET') {
            await handleGetRequest(res, cacheFilePath);
        } else if (req.method === 'PUT') {
            await handlePutRequest(req, res, cacheFilePath, urlPath);
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

