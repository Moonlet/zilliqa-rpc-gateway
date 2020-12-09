docker kill rpc
docker rm rpc

docker run -tid \
    --name rpc \
    -p 8080:8080 \
    -p 8081:8081 \
    -v $PWD/config.json:/etc/config.json \
    docker.pkg.github.com/moonlet/zilliqa-rpc-gateway/rpc-gateway:v0.2.0 \
        node /app/index.js /etc/config.json

docker logs rpc -f