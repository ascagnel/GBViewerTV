'use strict';
const express = require('express');
const port = process.env.port || 9001;

const app = express();
app.use('/', express.static(`${__dirname}/dist`));
app.get('*', (req, res)=> res.redirect('/'));

app.listen(port, ()=> {
    console.log(`Rollup Sample listening on port ${port}`);
});
