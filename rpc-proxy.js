const axios = require('axios');

const rpcProxy = (options) => {
    return async (request, reply) => {
        try {
          const rpcResponse = await axios.post(options.url, request.body, {
            responseType: 'stream',
            timeout: 10000
          });
          reply.statusCode = rpcResponse.status;
          reply.send(rpcResponse.data)
        } catch (e) {
          if (e.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            reply.statusCode = e.response.status;
            reply.send(e.response.data);
          } else if (e.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            res.statusCode = 500;
            reply.send({
              "error": {
                "code": -123456,
                "message": "GATEWAY_ERROR: Gateway did not receive a response from the node."
              },
              "id": request.body ? request.body.id : "",
              "jsonrpc": "2.0"
            })
          } else {
            // Something happened in setting up the request that triggered an Error
            res.statusCode = 500;
            reply.send({
              "error": {
                "code": -123456,
                "message": "GATEWAY_ERROR: There was an error while processing the request."
              },
              "id": request.body ? request.body.id : "",
              "jsonrpc": "2.0"
            })
          }
        }
    }
}

module.exports = {
    rpcProxy
}