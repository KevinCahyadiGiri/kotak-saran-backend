const express = require('express');
const router = express.Router();
// const dotenv = require('dotenv')
const {OAuth2Client} = require('google-auth-library');
const { Client } = require('pg');

// dotenv.config({path: '../../.env'});

const pgClient = new Client({
    // connectionString: 'postgres://rbtkrlxjnzaeuq:4cb9d21bbce937f8af1ba57fa852862e6694dc15a2f23165adc23f05bf07619b@ec2-75-101-212-64.compute-1.amazonaws.com:5432/d68fbtjjo9ii71',
    connectionString: process.env.DATABASE_URL || 'postgres://rbtkrlxjnzaeuq:4cb9d21bbce937f8af1ba57fa852862e6694dc15a2f23165adc23f05bf07619b@ec2-75-101-212-64.compute-1.amazonaws.com:5432/d68fbtjjo9ii71',
    // connectionString: process.env.DATABASE_URL,
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
    res.status(201).json({
        uid: uid,
        name: name,
        email: email
    })
    pgClient.connect();
    pgClient.query(`insert into users values('${uid}', '${name}', '${email}') on conflict do nothing;`, (err, res) => {
        if (err) throw err;
        if (res) {};
    })
})

module.exports = router;