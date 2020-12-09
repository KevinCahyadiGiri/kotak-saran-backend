const express = require('express');
const router = express.Router();
const {OAuth2Client} = require('google-auth-library');


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
})

module.exports = router;