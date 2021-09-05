const axios = require('axios');

const delay = (n) => new Promise(r => setTimeout(r, n));

const randmElement = (items) => items[Math.floor(Math.random()*items.length)];

const rpcProxy = (options) => {
    const {fastify, logBody} = options;

    const makeRequest = async (request, url) => {
        let reply = {};
        try {
          if (request && request.body && request.body.method === "GetTransactionStatus") {
            url = "https://api.zilliqa.com";
          }

          const rpcResponse = await axios.post(url, request.body, {
            responseType: 'stream',
            timeout: 10000
          });
          reply.statusCode = rpcResponse.status;
          reply.body = rpcResponse.data;
        } catch (e) {
          if (e.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            reply.statusCode = e.response.status;
            reply.body = e.response.data;
          } else if (e.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            reply.statusCode = 500;
            reply.body = ({
              "error": {
                "code": -123456,
                "message": "GATEWAY_ERROR: Gateway did not receive a response from the node."
              },
              "id": request.body ? request.body.id : "",
              "jsonrpc": "2.0"
            })
          } else {
            // Something happened in setting up the request that triggered an Error
            reply.statusCode = 500;
            reply.body = ({
              "error": {
                "code": -123456,
                "message": "GATEWAY_ERROR: There was an error while processing the request."
              },
              "id": request.body ? request.body.id : "",
              "jsonrpc": "2.0"
            })
          }
        }

        return reply;
    }

    return async (request, reply) => {

      let res = await makeRequest(request, options.url);
      let tries = 1;
      while(res.statusCode !== 200 && tries < 5) {
        await delay(100);
        console.log(tries);
        res = await makeRequest(request, options.url);
        tries++;
      }

      tries = 1;
      while(res.statusCode !== 200 && tries < 5) {
        res = await makeRequest(request, randmElement(options.backupUrl));
        tries++;
      }

      reply.statusCode = res.statusCode;
      reply.send(res.body);

      if (logBody) {
          fastify.log.info(`Rpc-Proxy response: ${reply.statusCode}, requestBody:${JSON.stringify(request.body)}`);
      }
    }
}

module.exports = {
    rpcProxy
}