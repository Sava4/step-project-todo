import App from './App';
import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);
const bodyParser = require("body-parser");

const server = express();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

(async function() {
  // Connection URL
  const url = process.env.MONGODB_URI;
  // Database Name
  const dbName = 'testdb';
  const client = new MongoClient(url, { useNewUrlParser: true });

  try {
    // Use connect method to connect to the Server
    await client.connect();
    console.log("Connected correctly to server");

    const db = client.db(dbName);
    const col = db.collection('inserts');
    
    const r = await col.insertMany([{a:1}, {a:1}, {a:1}]);
    assert.equal(3, r.insertedCount);

    // Get the cursor
    const cursor = col.find({a:1}).limit(2);

    // Iterate over the cursor
    while(await cursor.hasNext()) {
      const doc = await cursor.next();
      console.dir(doc);
    }

  } catch (err) {
    console.log(err.stack);
  }



  client.close();
})();

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const markup = renderToString(<App />);
    res.send(
      // prettier-ignore
      `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        <title>Welcome to Razzle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${
          assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''
        } 
    </head>
    <body>
        <div id="root">${markup}</div>    
        <script src="${assets.client.js}" defer crossorigin></script>
    </body>
</html>`
    );
  });

export default server;
