/* ---------TODOS----------*/

// A nice landing page is to be added. --done
//finding a way to render css and js files in node--done
//login and signup using hausura auth api--done
// printing logged in user's name.
// adding all pages ejs.
//adding a user in hasura db and inserting a snipcode using hasura data api

/* ------------------------ */

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const app = express();

//setting static files location
app.use(express.static(path.join(__dirname, 'static')));

// for the love of cookies :P
app.use(cookieParser());

//setting the view engine
app.set("view engine", 'ejs');


/* body parser is used for handling post request.
Previous versions of express includes this but from version 4 it comes as an external package */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

/* root defining is required to sendFile in routes and addressing
them from root project directory.
In this case we are defining the root as /home/sroy/snipcode/app/src i.e current directory.*/
const root = process.cwd();


//home page route
app.get('/' ,function (req, res) {
    console.log(req.cookies.userName);
    const user = req.cookies.userName;
    res.render("index.ejs", {user: user});
});

// login page route
app.get('/login', function (req, res) {
	res.render("login");
});

//post request for login using hasura auth api
app.post('/login', function(req, res) {
	const authUrl = 'http://auth.c100.hasura.me/login';
    const username = req.body.username;
	const options = {
	  method: 'POST',
      headers: {
	      'Content-Type':'application/json'
      },
        body: JSON.stringify({
            username: username,
            password: req.body.password
        })
    };
	fetch(authUrl, options, {credentials: 'include'})
        .then(function (res) {
            console.log('status: '+res.status);
            return res.json();
        }).then(function (json) {
        // console.log(json);
        res.cookie("userId", json['hasura_id']);
        res.cookie("userName",username);
        res.cookie("Authorization" , json['auth_token']);
        // console.log(res.cookie);
        res.redirect("/");
    }).catch(function (err){
       // console.error(err);
       res.redirect("/login");
    });
});

//register/signup route
app.get('/register', isLoggedIn , function(req, res) {
	res.render("register");
});

//post route for register/signup
app.post('/register', function (req, res) {
    const authUrl = 'http://auth.c100.hasura.me/signup';
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
    fetch(authUrl, options)
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