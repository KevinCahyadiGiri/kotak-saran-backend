const express = require('express');
const router = express.Router();
const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const creds = require('./client_secret.json');

router.get('/', (req, res, next) => {
    var dataSend = [];
    var saldoAwal = 0;

    async function accessSpreadsheet() {
        const doc = new GoogleSpreadsheet('1L3bcBB3_1hGXIG7CoBxWnDB98CcTo2dNmQnN6Kuo6vc');
        await promisify(doc.useServiceAccountAuth)(creds);
        const info = await promisify(doc.getInfo)();
        const sheet = info.worksheets[0];
        const rows = await promisify(sheet.getRows)({
            offset: 1
        })
        rows.forEach(row => {
            var rowJSON = {};
            rowJSON['nim'] = row.nim;
            rowJSON['namamahasiswa'] = row.namamahasiswa;
            rowJSON['status'] = row.status;
            rowJSON['waktu'] = row.waktu;
            rowJSON['parkiran'] = row.parkiran;
            dataSend.push(rowJSON)
        })
        res.status(201).json({
            message: 'Handling GET request to /log',
            data: dataSend
        })
    }
    accessSpreadsheet()
})

router.post('/', (req, res, next) => {
    var paymentSucces = true;

    async function accessSpreadsheet() {
        const doc = new GoogleSpreadsheet('1L3bcBB3_1hGXIG7CoBxWnDB98CcTo2dNmQnN6Kuo6vc');
        await promisify(doc.useServiceAccountAuth)(creds);
        const info = await promisify(doc.getInfo)();
        const sheet = info.worksheets[0];
        const row = {
            NIM: req.body.nim,
            NamaMahasiswa: req.body.namamahasiswa,
            Status: req.body.status,
            Waktu: new Date(),
            Parkiran: req.body.parkiran
        }
        await promisify(sheet.addRow)(row);
        res.status(201).json({
            message: `Mahasiswa dengan NIM ${req.body.nim} telah ${req.body.status} parkiran`
        })
    }

    async function pay() {
        var lastOut = null;
        const doc = new GoogleSpreadsheet('1L3bcBB3_1hGXIG7CoBxWnDB98CcTo2dNmQnN6Kuo6vc');
        await promisify(doc.useServiceAccountAuth)(creds);
        const info = await promisify(doc.getInfo)();
        var sheet = info.worksheets[0];
        var rows = await promisify(sheet.getRows)({
            query: `nim = ${req.body.nim}`
        })
        rows = rows.filter(val => {return val.status = 'masuk'});
        lastOut = rows[rows.length-1].waktu;

        sheet = info.worksheets[1];
        rows = await promisify(sheet.getRows)({
            query: `nim = ${req.body.nim}`
        })
        rows.forEach(row => {
            var biaya = 0;
            var before = new Date(lastOut);
            var after = new Date();
            var selisihBeforeAfter = after - before;
            var selisihBeforeMidnight = 86400000 - (before % 86400000);
            if (selisihBeforeAfter < selisihBeforeMidnight) {
                biaya = 2000;
            }
            else {
                var passMidnight = 1;
                var sisa = selisihBeforeAfter - selisihBeforeMidnight;
                sisa = sisa / 86400000;
                sisa = Math.floor(sisa);
                passMidnight = passMidnight + sisa;
                biaya = 2000*passMidnight;
            }

            if (row.saldo < biaya) {
                paymentSucces = false;
            } 
            else {
                row.saldo = row.saldo - biaya;
                row.save();
            }
        })
        if (paymentSucces) {
            res.status(201).json({
                message: `Mahasiswa dengan NIM ${req.body.nim} telah dikurangi saldonya`
            })
        }
        else {
            res.status(201).json({
                message: `Mahasiswa dengan NIM ${req.body.nim} tidak dapat keluar karena saldo tidak mencukupi`
            })
        }
    }
    async function operate() {
        if (req.body.status === 'keluar') {
            await pay()   
            if (paymentSucces) {
                accessSpreadsheet();
            }
        }
        else {
            accessSpreadsheet();
        }
    }

    operate();
})

router.get('/:nim', (req, res, next) => {
    var dataSend = [];
    const nim = req.params.nim;

    async function accessSpreadsheet() {
        // connect ke db
        const doc = new GoogleSpreadsheet('1L3bcBB3_1hGXIG7CoBxWnDB98CcTo2dNmQnN6Kuo6vc');
        await promisify(doc.useServiceAccountAuth)(creds);
        const info = await promisify(doc.getInfo)();
        const sheet = info.worksheets[0];
        const rows = await promisify(sheet.getRows)({
            query: `nim = ${nim}`
        })

        // iterasi setiap row
        rows.forEach(row => {
            var rowJSON = {};
            rowJSON['nim'] = row.nim;
            rowJSON['namamahasiswa'] = row.namamahasiswa;
            rowJSON['status'] = row.status;
            rowJSON['waktu'] = row.waktu;
            rowJSON['parkiran'] = row.parkiran;
            dataSend.push(rowJSON)
        })

        // kasi response
        res.status(201).json({
            message: `Hasil pencarian mahasiswa dengan nim ${nim}`,
            data: dataSend
        })
    }
    accessSpreadsheet()
})

module.exports = router;