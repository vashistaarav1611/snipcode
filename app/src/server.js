var express = require('express');
var app = express();
var root = process.cwd();

//your routes here
app.get('/', function (req, res) {
    res.send("Hello World!");
});

app.get('/login', function (req, res) {
    res.sendFile("html/login.html", {root});
});


app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});