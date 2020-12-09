# Zilliqa RPC Gateway

Simple ratelimitation / caching for zilliqa seed nodes.

Docker run example command:

```bash
docker run -tid \
    --name rpc \
    -p 3000:3000 \
    -v $PWD/config.json:/etc/config.json \
    docker.pkg.github.com/moonlet/zilliqa-rpc-gateway/rpc-gateway:v0.2.0 \
        node /app/index.js /etc/config.json
```
