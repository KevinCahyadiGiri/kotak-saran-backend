const express = require('express');
const router = express.Router();
// const dotenv = require('dotenv')
const {OAuth2Client} = require('google-auth-library');
const { Client } = require('pg');

// dotenv.config({path: '../../.env'});

const pgClient = new Client({
    connectionString: `${process.env.DATABASE_URL}`,
    ssl: {
        rejectUnauthorized: false
    }
})

router.post('/', async (req, res, next) => {   
    const token = req.body.idToken;
    const CLIENT_ID = "330024727316-juvqj3610umqh8c27p6ntduh2bd5ra16.apps.googleusercontent.com"
    const client = new OAuth2Client(CLIENT_ID);
    var payload = null;
    var uid = null;
    var name = null;
    var email = null;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    payload = ticket.getPayload();
    uid = payload['sub'];
    name = payload['name'];
    email = payload['email'];
    pgClient.connect();
    pgClient.query('select * from users;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            console.log(JSON.stringify(row))
        }
        pgClient.end();
    })
    res.status(201).json({
        uid: uid,
        name: name,
        email: email
    })
})

module.exports = router;