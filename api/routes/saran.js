const express = require('express');
const router = express.Router();
const { Client } = require('pg');

const pgClient = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://rbtkrlxjnzaeuq:4cb9d21bbce937f8af1ba57fa852862e6694dc15a2f23165adc23f05bf07619b@ec2-75-101-212-64.compute-1.amazonaws.com:5432/d68fbtjjo9ii71',
    ssl: {
        rejectUnauthorized: false
    }
})

router.get('/', (req, res, next) => {
    pgClient.connect();
    pgClient.query('select * from saran;', (err, response) => {
        if (err) throw err
        if (response) {
            res.status(200).json({
                message: 'berhasil',
                dataSaran: response.rows
            })
        }
    })
})

router.post('/', (req, res, next) => {
    var title = req.body.title;
    var description = req.body.description;
    var date = Date.now() / 1000.0;
    var uid = req.header('Authorization').split(' ')[1];
    pgClient.connect();
    pgClient.query(`insert into saran(title, description, date, uid) values('${title}', '${description}', to_timestamp(${date}), '${uid}');`, (err, response) => {
        if (err) throw err;
        if (response) {
            res.status(201).json({
                message: 'Saran telah diterima. Terima kasih telah menyampaikan aspirasi'
            })
        }
    })
})

router.put('/:saranId', (req, res, next) => {
    var saranId = req.params.saranId;
    pgClient.connect();
    pgClient.query(`update saran set title = '${req.body.title}', description = '${req.body.description}' where saranid = '${saranId}';`, (err, response) => {
        if (err) throw err;
        if (response) {
            res.status(204).send();
        }
    })
}) 

router.delete('/:saranId', (req, res, next) => {
    var saranId = req.params.saranId;
    pgClient.connect();
    pgClient.query(`delete from saran where saranid = ${saranId};`, (err, response) => {
        if (err) throw err;
        if (response) {
            res.status(204).send();
        }
    })
})

module.exports = router;