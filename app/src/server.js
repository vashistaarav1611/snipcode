const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

//setting static files location
app.use(express.static(path.join(__dirname, 'static')));

//setting the view engine
app.set("view engine", 'ejs');


// A nice landing page is to be added.
//finding a way to render css and js files in node--done
//login and signup using hausura auth api--done
//adding a user in hasura db and inserting a snipcode using hasura data api


/* body parser is used for handling post request.
Previous versions of express includes this but from version 4 it comes as an external package */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

/* root defining is required to sendFile in routes and addressing
them from root project directory.
In this case we are defining the root as /home/sroy/snipcode/app/src i.e current directory.*/
const root = process.cwd();

//home page route
app.get('/', function (req, res) {
    res.render("index.ejs");
});

// login page route
app.get('/login', function (req, res) {
	res.render("login");
});

//post request for login using hasura auth api
app.post('/login', function(req, res) {
	const schemaFetchUrl = 'http://auth.c100.hasura.me/login';
	const options = {
	  method: 'POST',
      headers: {
	      'Content-Type':'application/json'
      },
        body: JSON.stringify({
            username: req.body.username,
            password: req.body.password
        })
    };
	fetch(schemaFetchUrl, options)
        .then(function (res) {
            console.log('status: '+res.status);
            return res.json();
        }).then(function (json) {
        console.log(json);
        headers.Authorization = 'Bearer'+ json['auth_token'];
        headers['X-Hasura-User-Id'] = json['hasura_id'];
        headers['X-Hasura-Role'] = json['hasura_roles'][0];
        console.log(headers);
    });
	res.redirect('/login');
	console.log();
});

//register/signup route
app.get('/register', function(req, res) {
	res.render("register");
});

//post route for register/signup
app.post('/register', function (req, res) {
    const schemaFetchUrl = 'http://auth.c100.hasura.me/signup';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: req.body.username,
            password: req.body.password
            //wil add this after email verification in hasura console
            // email: req.body.email
        })
    };
    fetch(schemaFetchUrl, options)
        .then(function(res) {
            return res.json();
        }).then(function(json) {
        console.log(json);
        //
        headers.Authorization = 'Bearer ' + json['auth_token'];
        const options2 = {
            method: 'POST',
            headers,
            body: JSON.stringify({
                type: 'insert',
                args: {
                    table: 'profile',
                    objects: [{
                        'name': newuser['username'],
                        'user_id': json['hasura_id']
                    }]
                }
            })
        };
        fetch('http://data.c100.hasura.me/', options2)
            .then(function(res2) {
                return res2.json();
            }).then(function(json2) {
            console.log(json2);
        })
    });
    res.redirect("/");
    console.log();
});


//server starts here
app.listen(8080, function () {
  console.log('Example app listening on port 8080! '+root);
});