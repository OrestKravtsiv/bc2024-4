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

// Функція для опрацювання GET
async function handleGetRequest(res, imagePath, httpCode) {
    try {//Витягає дані з кешу
        const data = await fs.readFile(imagePath); // витягує з кешу
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
    } catch {// Частина 3 якщо даних в кеші нема, то надсилає запит на сайт
        try {
            const response = await superagent.get(`https://http.cat/${httpCode}`); //запит
            const image = response.body; // бере тіло відповіді
            await fs.writeFile(imagePath, image); // записує в кеш
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(image);
        } catch (error) {
            // якщо не знайшло на сайті, 404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    }
}

// Функція для опрацювання PUT
async function handlePutRequest(req, res, imagePath, httpCode) {
    try {// надсилає запит на сайт та записує в кеш
        const response = await superagent.get(`https://http.cat/${httpCode}`);
        const image = response.body;
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

// Функція для опрацювання DELETE
async function handleDeleteRequest(res, imagePath) {
    try {
        await fs.unlink(imagePath);//Видалення
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Image deleted');
    } catch (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Image not found');
    }
}

//Callback для запиту
const requestListener = async function (req, res) {
    // з посилання бере останнє число  http://127.0.0.1:8080/201 перетворює в 200
    const urlPath = req.url.slice(1);
    // посилання на файл в директорії кеш
    const cacheFilePath = path.join(options.cache, `${urlPath}.jpg`);
    try {
        if (req.method === 'GET') {
            await handleGetRequest(res, cacheFilePath, urlPath);
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

// Створнення сервера
const server = http.createServer(requestListener);

// Задаємо адресу і порт якиі прослуховує сервер та виводимо в консоль 
server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
});

