var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    cache = {};

/**
 * Отправляет код ошибки 404 если запрашиваемый файл отстутсвует
 */
function send404 (response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

/**
 * Отправка содержимого файла
 */
function sendFile (response, filePath, fileContents) {
    response.writeHead(
        200,
        {'content-type': mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents)
}

/**
 * Работа со статическими файлами
 */
function serverStatic (response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.access(absPath, function (err) {
            if (err) {
                send404(response);
            } else {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                })

            }
        });
    }
}

/**
 * Создание http сервера
 */
var server = http.createServer(function (request, response) {
    var filePath = false,
        absPath = false;

    if (request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }

    absPath = './' + filePath;
    serverStatic(response, cache, absPath);
});

server.listen(3000, function () {
   console.log('Server listening on port 3000.');
});