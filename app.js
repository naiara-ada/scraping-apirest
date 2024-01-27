const express = require('express');
const app = express();
const scrapingRouter = require('./scraping');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', scrapingRouter);

app.listen(3000, () => {
    console.log('Express a la escucha del puerto http://localhost:3000');
});