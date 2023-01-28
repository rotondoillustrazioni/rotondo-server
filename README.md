# Rotondo server

This repository provides a `docker-compose.yml` that let you build the Rotondo server and a MongoDB database.
Please check the [Rotondo client repository](https://github.com/rotondoillustrazioni/rotondoillustrazioni.github.io/tree/asw) for the client side.

In order to build the docker you have to provide in the `.env` file:
```bash
MONGODB_URI

TOKEN_TTL
TOKEN_SECRET

ACCESS_KEY_ID
SECRET_ACCESS_KEY
REGION
BUCKET_NAME
```

In order to deploy it you have to clone the repository and run the following commands:

```bash
docker-compose up --build
```
