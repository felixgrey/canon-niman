const http = require('http');
const Ajax = require('./../../src/Ajax/AxiosAjax.js');

async function getRequestData(req) {

  if (req.method === 'GET') {
    const [, query = ''] = req.url.split('?');
    const mySearchParams = new URLSearchParams(query);
    const data = {};
    for (const [key, value] of mySearchParams) {
      data[key] = value;
    }
    return data;
  }

  let chunks = [];
  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  return new Promise((resolve) => {
    req.on('end', () => {
      resolve(Buffer.concat(chunks))
    });
  });
}

const port = 3001;

http.createServer(async (req, res) => {
  const data = await getRequestData(req);
  console.log('请求地址：', req.url, '\n');
  console.log('请求数据：', JSON.stringify(data), '\n');

  res.writeHead(200, {
    'Content-Type': 'application/json'
  });

  if (req.url.indexOf('/timeout') === 0) {
    setTimeout(() => {
      res.end(JSON.stringify(data));
    }, 1000);
    return;
  }

  res.end(JSON.stringify(data));

}).listen(port, 'localhost');


setTimeout(async function() {
  console.log('提出请求：', '\n');

  const ajax = new Ajax({
    getTimeout: {
      baseUrl: 'http://localhost:' + port,
      url: '/timeout',
      data: {
        name: 123
      },
      onError: (e) => {
        console.log('请求错误：', e, '\n');
      }
    }
  });

  const result = await ajax.getTimeout();
  console.log('请求结果：', result, '\n');


}, 100);
