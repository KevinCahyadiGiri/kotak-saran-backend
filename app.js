const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { Client } = require('pg');

const loginRoutes = require('./api/routes/login');
const saranRoutes = require('./api/routes/saran');

const pgClient = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://rbtkrlxjnzaeuq:4cb9d21bbce937f8af1ba57fa852862e6694dc15a2f23165adc23f05bf07619b@ec2-75-101-212-64.compute-1.amazonaws.com:5432/d68fbtjjo9ii71',
    ssl: {
        rejectUnauthorized: false
    }
})

app.use(morgan(function (tokens, req, res) {
    var status = tokens.status(req, res);
    var url = tokens.url(req, res);
    var method = tokens.method(req, res);
    var resTime = tokens['response-time'](req, res);
    if (method != 'OPTIONS' && url != '/login' && status != 403) {
        var uid = req.header('Authorization').split(' ')[1];
        // console.log(`url ${url}`);
        // console.log(`method ${method}`);
        // console.log(`statuscode ${status}`);
        // console.log(`responsetime ${Math.floor(resTime)}`);
        // console.log(`uid ${uid}`);
        // // pgClient.connect();
        pgClient.query(`insert into log(url, method, statuscode, responsetime, uid) values('${url}', '${method}', ${status}, ${Math.floor(resTime)}, '${uid}');`, (err, response) => {
            if (err) {
                console.log(err);
                throw err;
            };
            if (response) {
                console.log('berhasil dicatat')
            }
        })
        
    }
    return [
        method, url, status, resTime
    ].join(' ')
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({})
    };
    console.log(req.path);
    if (req.path !== '/login') {
        var uid = req.header('Authorization').split(' ')[1];
        console.log(uid)
        pgClient.connect();
        pgClient.query(`select * from users where uid = '${uid}';`, (err, response) => {
            if (err) throw err;
            if (response) {
                if (response.rows.length === 0) {
                    console.log('Forbidden Access')
                    res.status(403).send()
                }
                else {
                    next()
                }
            }
        })
    }
    else {
        next();
    }
})

app.use('/login', loginRoutes);
app.use('/saran', saranRoutes);

app.use((req,res,next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error)
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;
