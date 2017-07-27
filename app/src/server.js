/* ---------TODOS----------*/

// A nice landing page is to be added. --done
// finding a way to render css and js files in node--done
// login and signup using hausura auth api--done
// logout using hasura auth api.--done
// adding user in user_info table to store more info. --done
// printing logged in user's name.--done
// showing errors of login and registration --done
// getting the dashboard page --done
// edit snip page --done
// new snip page --done
// search page like wikipedia search
// search api for everyone
// adding all pages ejs. --done
// adding a user in hasura db and inserting a snipcode using hasura data api --done
// redirecting logged in user's to dashboard and registered user to new snip
// dynamic dropdown.
// segregating header and footer.
// edit profile page
// last_updated update while editing snip.
// user can see last update changes of thier code
// most used language
// total snippets
// heatmap
// beautyfying last_updated in dashboard
// profile image handler
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
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


/* root defining is required to sendFile in routes and addressing
them from root project directory.
In this case we are defining the root as /home/sroy/snipcode/app/src i.e current directory.*/
const root = process.cwd();

const authUrl = "http://auth.c100.hasura.me/";
const dataUrl = "http://data.c100.hasura.me/v1/query";

//home page route
app.get('/', function (req, res) {
    // console.log(req.cookies.userName);
    var user = "guest";
    const title = "SNIPCODE";
    // console.log(req.cookies);
    // console.log(req.headers);
    if (req.cookies.userName !== "")
        user = req.cookies.userName;

    res.render("index", {user: user, title: title});
});

// login page route
app.get('/login', function (req, res) {
    // console.log(req.cookies);
    res.render("login", {rstatus: null});
});

//post request for login using hasura auth api
app.post('/login', function (req, res) {
    const url = authUrl + 'login';
    const username = req.body.username;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: req.body.password
        })
    };

    fetch(url, options)
        .then(function (res) {
            // console.log('status: ' + res.status);
            return res.json();
        }).then(function (json) {
        // console.log(json);
        if (json['message'])
            res.render("login", {rstatus: json['message']});
        else {
            res.cookie("userId", json['hasura_id']);
            res.cookie("userName", username);
            res.cookie("Authorization", json['auth_token']);
            // console.log(res.cookie);
            res.redirect("/");
        }

    }).catch(function (err) {
        console.error(err);
        res.render("login", {rstatus: "Host Unreachable"});
    });
    // console.log();
});

app.get('/logout', function (req, res) {
    const url = authUrl + 'user/logout';
    const options = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + req.cookies.Authorization
        }
    };

    fetch(url, options)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            // console.log(json);
            res.clearCookie('Authorization');
            res.clearCookie('userName');
            res.clearCookie('userId');
            res.render("login", {rstatus: json['message']});
        }).catch(function (err) {
        console.error(err);
        res.redirect("/");
    });
    // res.redirect("/")
});

//register/signup route
app.get('/register', function (req, res) {
    res.render("register", {rstatus: null});
});

//post route for register/signup
app.post('/register', function (req, res) {
    const url = authUrl + 'signup';
    const username = req.body.username;
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
    fetch(url, options, {credentials: 'include'})
        .then(function (res) {
            return res.json();
        }).then(function (json) {
        // console.log(json);
        if (json['message'])
            res.render('register', {rstatus: json['message']});
        else {
            res.cookie("userId", json['hasura_id']);
            res.cookie("userName", username);
            res.cookie("Authorization", json['auth_token']);
            const options2 = {
                method: 'POST',
                headers: {
                    "Authorization": "Bearer " + json['auth_token']
                },
                body: JSON.stringify({
                    type: 'insert',
                    args: {
                        table: 'user_info',
                        objects: [{
                            'name': username,
                            'user_id': json['hasura_id']
                        }]
                    }
                })
            };
            fetch(dataUrl, options2)
                .then(function (res2) {
                    return res2.json();
                }).then(function (json2) {
                // console.log(json2);
                res.redirect("/");
            })
                .catch(function (err) {
                    console.error(err);
                    res.redirect("/");
                });
        }

    });
});


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.cookies.Authorization)
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

//dashboard route
app.get('/profile', isLoggedIn, function (req, res) {
    const url = dataUrl;
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + req.cookies.Authorization
        },
        body: JSON.stringify(
            {
                type: "bulk",
                args: [
                    {
                        type: "select",
                        args: {
                            table: "user_info",
                            columns: ["name"],
                            where: {"user_id": req.cookies.userId}
                        }
                    },
                    {
                        type: "select",
                        args: {
                            table: "code_lang",
                            columns: ["heading", "id", "lang", "last_updated", "private"],
                            where: {"user_id": req.cookies.userId}
                        }
                    }]
            })
    };

    fetch(url, options)
        .then(function (res) {
            return res.json()
        })
        .then(function (json) {
            // console.log(json);
            const name = json[0][0];
            const codes = json[1];
            // console.log(json[1]);
            res.render('dashboard', {user: req.cookies.userName, name: name, codes: codes})
        })
        .catch(function (err) {
            console.log(err);
            res.redirect("/");
        });
});


//add new snip
app.get('/newsnip', function (req, res) {
    res.render("newsnip");
});


//edit snip route
app.get("/editsnip/:id", function (req, res) {
    const url = dataUrl;
    const id = req.params.id;
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + req.cookies.Authorization
        },
        body: JSON.stringify(
            {
                type: "bulk",
                args: [
                    {
                        type: "select",
                        args: {
                            table: "code_lang",
                            columns: ["id", "heading", "code_text", "lang", "private"],
                            where: {"user_id": req.cookies.userId, "id": id},
                            limit: 1
                        }
                    },
                    {
                        type: "select",
                        args: {
                            table: "tag",
                            columns: ["tag"],
                            where: {"id": id}
                        }
                    }]
            })
    };

    fetch(url, options)
        .then(function (res) {
            // console.log(res.status);
            return res.json()
        })
        .then(function (json) {
            // console.log(json);
            const code = json[0][0];
            const tags = json[1];
            // console.log(code);
            if (code)
                res.render('editsnip', {code: code, tags: tags, save:true })
            else
                res.redirect("/viewsnip/"+id);
        })
        .catch(function (err) {
            console.log(err);
            res.redirect("/");
        });
});


app.post("/editsnip/:id", function (req, res) {
    const url = dataUrl;
    const id = req.params.id;
    const codeSnip = req.body.codeSnip;
    const isPrivate = req.body.isPrivate;
    // console.log(codeSnip);
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + req.cookies.Authorization
        },
        body: JSON.stringify(
            {
                type: "bulk",
                args: [
                    {
                        type: "update",
                        args: {
                            table: "code",
                            $set: {
                                "code_text":codeSnip,
                                "private":isPrivate
                            },
                            where: {"user_id":req.cookies.userId, "id":id},
                            returning: ["id", "heading", "code_text", "lang", "private"]
                        }
                    },
                    {
                        type: "select",
                        args: {
                            table: "tag",
                            columns: ["tag"],
                            where: {"id": id}
                        }
                    }
                ]
            }
        )
    };

    fetch(url, options)
        .then(function (res) {
            return res.json()
        })
        .then(function (json) {
            // console.log(json);
            // const code = json[0][0];
            // const tags = json[1];
            // console.log(code);
            res.send({redirect: '/profile'});
        })
        .catch(function (err) {
            console.log(err);
            res.redirect("/");
        });
});


//view snip
app.get("/viewsnip/:id", function (req, res) {
    const id = req.params.id;
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            {
                type: "bulk",
                args: [
                    {
                        type: "select",
                        args: {
                            table: "code_lang",
                            columns: ["id", "heading", "code_text", "lang", "private"],
                            where: {"id": id},
                            limit: 1
                        }
                    },
                    {
                        type: "select",
                        args: {
                            table: "tag",
                            columns: ["tag"],
                            where: {"id": id}
                        }
                    }]
            })
    };
    
    fetch(dataUrl, options)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            // console.log(json);
            const code = json[0][0];
            const tags = json[1];
            res.render('editsnip', {code:code, tags:tags, save:false})
        })
        .catch(function (err) {
            console.log(err);
        })

});

// search api goes here

// app.get("/search", function (data) {
//
// });


//server starts here
app.listen(8080, function () {
    console.log('Example app listening on port 8080! ' + root);
});