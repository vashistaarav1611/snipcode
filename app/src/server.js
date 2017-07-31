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
// search page like wikipedia search --done
// search api for everyone --done
// adding all pages ejs. --done
// adding a user in hasura db and inserting a snipcode using hasura data api --done
// redirecting logged in user's to dashboard and registered user to new snip --done
// segregating header and footer. --done
// dynamic dropdown. --done
// adding user in search result --done
// random snippet --done
// restricting users --done
// hover effect in panel of snippets
// most used language --done
// total snippets --done
// beautyfying last_updated in dashboard --done
// profile image handler --delay
// aesthetic design issues --done
// adding more signup options (social login)
// notify in login, register page.
// user can see last update changes of thier code

// session based login and logout
// failing conditions check:-
// 1.search fail due to database failure resultTuples: notokay
/* ------------------------ */

/*------- Aesthetic ---------*/
// language name in bold in search page
// anon dashboard changes:-
// 1. Name in bold
// 2. I'm is bio
// 3. favourite language in bold
// 4. total snippet in bold
//done

// login button animation
// register button animation


/* ----------- Bug Report ----------*/
// private not showing in dashboard --resolved
// new snip codemirror edit not working --resolved
// confirm password not working

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const app = express();

//setting static files location
app.use(express.static(path.join(__dirname, 'static')));

// for the love of cookies :P
app.use(cookieParser());
app.use(compression());

//setting the view engine
app.set("view engine", 'ejs');


/* body parser is used for handling post request.
Previous versions of express includes this but from version 4 it comes as an external package */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// app.use(function (req, res, next) {
//
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
//
//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);
//
//     // Pass to next layer of middleware
//     next();
// });


/* root defining is required to sendFile in routes and addressing
them from root project directory.
In this case we are defining the root as /home/sroy/snipcode/app/src i.e current directory.*/
const root = process.cwd();

const authUrl = "http://auth.c100.hasura.me/";
const dataUrl = "http://data.c100.hasura.me/v1/query";

//restricting users from some webpage
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.cookies.Authorization)
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

//home page route
app.get('/', function (req, res) {
    // console.log(req.cookies.userName);
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
    res.render("login", {user: null, rstatus: null});
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
            res.redirect("/profile/" + json['hasura_id']);
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
            res.redirect("/login");
        }).catch(function (err) {
        console.error(err);
        res.redirect("/");
    });
    // res.redirect("/")
});

//register/signup route
app.get('/register', function (req, res) {
    res.render("register", {user: null, rstatus: null});
});

//post route for register/signup
app.post('/register', function (req, res) {
    const url = authUrl + 'signup';
    const username = req.body.username;
    const fullname = req.body.fullname;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    if (password === cpassword) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: req.body.password,
                fullname: fullname
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
                                'user_id': json['hasura_id'],
                                'full_name': fullname
                            }]
                        }
                    })
                };
                fetch(dataUrl, options2)
                    .then(function (res2) {
                        return res2.json();
                    })
                    .then(function (json2) {
                    // console.log(json2);
                    res.redirect("/newsnip");
                    })
                    .catch(function (err) {
                        console.error(err);
                        res.render("register", {rstatus: "Host Unreachable"});
                    });
            }

        });
    }
    else {
        res.render("register", {rstatus: "Password didn't matched"});
    }
});

//dashboard route
app.get("/profile/:id", function (req, res) {
    const url = dataUrl;
    const id = req.params.id;
    const today = new Date();
    const options = {
        method: 'POST',
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
                            table: "user_info",
                            columns: ["name", "full_name", "bio", "website"],
                            where: {"user_id": id}
                        }
                    },
                    {
                        type: "select",
                        args: {
                            table: "code_lang",
                            columns: ["heading", "id", "lang", "last_updated", "private"],
                            where: {"user_id": id}
                        }
                    },
                    {
                        type: "run_sql",
                        args: {
                            sql: "SELECT lang, COUNT(*) as cnt\n" +
                            "FROM code_lang\n" +
                            "where user_id=" + id + "\n" +
                            "GROUP BY lang\n" +
                            "order by cnt desc\n" +
                            "limit 1"
                        }
                    },
                    {
                        type: "count",
                        args: {
                            table: "code_lang",
                            where: {"user_id": id}
                        }
                    }
                ]
            })
    };

    fetch(url, options)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            // console.log(json);
            const name = json[0][0];
            const codes = json[1];
            const count = json[3]['count'];
            var lang = null;
            if (count !== 0)
                lang = json[2]['result'][1][0];

            // console.log(json[1]);
            for (var i = 0; i < codes.length; i++) {
                var d = new Date(codes[i].last_updated);
                if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear())
                    codes[i].last_updated = "today";
                else
                    codes[i].last_updated = d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();

                // console.log(d.getFullYear());
            }
            if (req.cookies.userName)
                res.render('dashboard', {
                    user: req.cookies.userName,
                    name: name,
                    codes: codes,
                    lang: lang,
                    count: count
                });
            else
                res.render('dashboard', {user: null, name: name, codes: codes, lang: lang, count: count});
        })
        .catch(function (err) {
            console.log(err);
            res.redirect("/");
        });
});

// editprofile route

app.get("/editprofile", isLoggedIn, function (req, res) {
    if (req.cookies.userId)
        res.redirect("/profile/" + req.cookies.userId);
    else
        res.redirect("/login");
});

// app.get('/editprofile', isLoggedIn, function (req, res) {
//     const url = dataUrl;
//     const today = new Date();
//     const options = {
//         method: 'POST',
//         headers: {
//             "Content-Type": 'application/json',
//             "Authorization": 'Bearer ' + req.cookies.Authorization
//         },
//         body: JSON.stringify(
//             {
//                 type: "bulk",
//                 args: [
//                     {
//                         type: "select",
//                         args: {
//                             table: "user_info",
//                             columns: ["name", "full_name", "bio", "website"],
//                             where: {"user_id": req.cookies.userId}
//                         }
//                     },
//                     {
//                         type: "select",
//                         args: {
//                             table: "code_lang",
//                             columns: ["heading", "id", "lang", "last_updated", "private"],
//                             where: {"user_id": req.cookies.userId}
//                         }
//                     },
//                     {
//                         type: "run_sql",
//                         args: {
//                             sql: "SELECT lang, COUNT(*) as cnt\n" +
//                             "FROM code_lang\n" +
//                             "where user_id="+ req.cookies.userId +"\n" +
//                             "GROUP BY lang\n" +
//                             "order by cnt desc\n" +
//                             "limit 1"
//                         }
//                     },
//                     {
//                         type: "count",
//                         args: {
//                             table: "code_lang",
//                             columns: ["heading", "id", "lang", "last_updated", "private"],
//                             where: {"user_id": req.cookies.userId}
//                         }
//                     }
//                     ]
//             })
//     };
//
//     fetch(url, options)
//         .then(function (res) {
//             return res.json()
//         })
//         .then(function (json) {
//             // console.log(json);
//             const name = json[0][0];
//             const codes = json[1];
//             const count = json[3]['count'];
//             var lang = null;
//             if(count!==0)
//                 lang = json[2]['result'][1][0];
//             for (var i=0; i<codes.length; i++){
//                 var d = new Date(codes[i].last_updated);
//                 if (d.getDate() === today.getDate() && d.getMonth()=== today.getMonth() && d.getFullYear()=== today.getFullYear())
//                     codes[i].last_updated = "today";
//                 else
//                     codes[i].last_updated = d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear();
//
//                 // console.log(d.getFullYear());
//             }
//             // console.log(req.cookies.userName, name);
//             res.render('dashboard', {user: req.cookies.userName, name: name, codes: codes, lang:lang, count:count})
//         })
//         .catch(function (err) {
//             console.log(err);
//             res.redirect("/");
//         });
// });


//add new snip
app.get('/newsnip', isLoggedIn, function (req, res) {
    res.render("newsnip", {user: req.cookies.userName});
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
            // console.log(code);
            if (json['message']!=="invalid authorization token") {
                const tags = json[1];
                const code = json[0][0];
                console.log(code);
                res.render('editsnip', {user: req.cookies.userName, code: code, tags: tags, save: true});
            }
            else
                res.redirect("/viewsnip/" + id);
        })
        .catch(function (err) {
            console.log(err);
            res.redirect("/viewsnip/" + id);
        });
});


app.post("/editsnip/:id", function (req, res) {
    const userId = req.cookies.userId;
    const url = dataUrl;
    const id = req.params.id;
    const codeSnip = req.body.codeSnip;
    const isPrivate = req.body.isPrivate;
    const lastUpdate = new Date();
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
                                "code_text": codeSnip,
                                "private": isPrivate,
                                "last_updated": lastUpdate
                            },
                            where: {"user_id": userId, "id": id},
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
            res.send({redirect: '/profile/' + userId});
        })
        .catch(function (err) {
            console.log(err);
            res.send(err);
        });
});


//view snip
app.get("/viewsnip/:id", function (req, res) {
    const id = req.params.id;
    const user = req.cookies.userName;
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
            // console.log(json[0][0]);
            const code = json[0][0];
            const tags = json[1];
            // console.log(code);
            res.render('editsnip', {user: user, code: code, tags: tags, save: false})
        })
        .catch(function (err) {
            console.log(err);
        });

});

// search api goes here

app.get('/searchroute/:id', function (req, res) {
    const id = req.params.id;
    if (id === "random") {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "count",
                args: {
                    table: "code_lang"
                }
            })
        };
        fetch(dataUrl, options)
            .then(function (res) {
                return res.json();
            })
            .then(function (json) {
                var count = json['count'];
                console.log(count);
                const options2 = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        type: "run_sql",
                        args: {
                            sql: "SELECT id FROM code_lang OFFSET floor(random()*" + count + ") LIMIT 1;"
                        }
                    })
                };
                fetch(dataUrl, options2)
                    .then(function (res) {
                        return res.json();
                    })
                    .then(function (json) {
                        // console.log(json);
                        const rand = json['result'][1];
                        res.redirect("/viewsnip/" + rand);
                    })
            })
            .catch(function (err) {
                console.log(err);
            });
    }
    else {
        if (req.cookies.Authorization)
            res.redirect("/editsnip/" + id);
        else
            res.redirect("/viewsnip/" + id);
    }

});

app.get("/search", function (req, res) {
    if (req.cookies.userName)
        res.render("search", {user: req.cookies.userName});
    else
        res.render("search", {user: null});
});

app.post("/search", function (req, res) {
    const key = req.body.key;
    const option = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            {
                type: "bulk",
                args: [
                    {
                        "type": "run_sql",
                        "args":
                            {
                                "sql": "SELECT id, heading, code_text, lang, last_updated, name, user_id " +
                                "FROM code_lang " +
                                "WHERE to_tsvector('english', heading) @@ " +
                                "to_tsquery('english'," + "'" + key + "') and private=false;"
                            }
                    },
                    {
                        type: "select",
                        args: {
                            table: "tag",
                            columns: ["tag"],
                            where: {"id": 4}//dummy need to be changed
                        }
                    }
                ]
            }
        )
    };

    fetch(dataUrl, option)
        .then(function (res) {
            return res.json();
        })
        .then(function (json) {
            // console.log(json[0]['result']);
            res.send(json[0]['result']);
        })
        .catch(function (err) {
            console.log(err);
            res.send(err);
        })
});

app.get("*", function (req, res) {
    res.render("error");
});

//server starts here
app.listen(8080, function () {
    console.log('Example app listening on port 8080! ' + root);
});