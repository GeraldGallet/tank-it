// index.js
const http = require('http');
const log = require('better-logs')('server');
const fs = require('fs');
const path = require('path');

const urls = ['/index.html', '/js/p5.min.js', '/js/sketch.js'];
const handleRequest = function (req, res) {
    // What did we request?
    let pathname = req.url;

    // If blank let's ask for index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    log.info(`\x1b[42m\x1b[30mRequest for page '${pathname}'\x1b[0m`);

    // Ok what's our file extension
    let ext = path.extname(pathname);

    // Map extension to file type
    const typeExt = {
        '.html': 'text/html',
        '.js':   'text/javascript',
        '.css':  'text/css'
    };

    // What is it?  Default to plain text
    let contentType = typeExt[ext] || 'text/plain';

    // Now read and write back the file with the appropriate content type
    fs.readFile(`${__dirname}/src${pathname}`,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                log.error(`\x1b[41m\x1b[37mError while getting page '${pathname}'\x1b[0m`)
                return res.end('Error loading page');
            }
            // Dynamically setting content type
            res.writeHead(200,{ 'Content-Type': contentType });
            res.end(data);
        }
    );
};

// Create a server with the handleRequest callback
let server = http.createServer(handleRequest);
// Listen on port 8080
const port = process.env.PORT || 8080;
server.listen(port);

log.info(`\x1b[42m\x1b[30mServer started on port ${port}\x1b[0m`);
