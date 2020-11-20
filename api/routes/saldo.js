const express = require('express');
const router = express.Router();
const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const creds = require('./client_secret.json');

router.get('/', (req, res, next) => {
    var dataSend = [];

    async function accessSpreadsheet() {
        const doc = new GoogleSpreadsheet('1L3bcBB3_1hGXIG7CoBxWnDB98CcTo2dNmQnN6Kuo6vc');
        await promisify(doc.useServiceAccountAuth)(creds);
        const info = await promisify(doc.getInfo)();
        const sheet = info.worksheets[1];
        const rows = await promisify(sheet.getRows)({
            offset: 1
        })
        rows.forEach(row => {
            var rowJSON = {};
            rowJSON['nim'] = row.nim;
            rowJSON['namamahasiswa'] = row.namamahasiswa;
            rowJSON['saldo'] = row.saldo;
            dataSend.push(rowJSON)
        })
        res.status(201).json({
            message: 'Mengambil data saldo mahasiswa',
            data: dataSend
        })
    }
    accessSpreadsheet()
})

router.get('/:nim', (req, res, next) => {
    var dataSend = null;
    const nim = req.params.nim;

    async function accessSpreadsheet() {
        const doc = new GoogleSpreadsheet('1L3bcBB3_1hGXIG7CoBxWnDB98CcTo2dNmQnN6Kuo6vc');
        await promisify(doc.useServiceAccountAuth)(creds);
        const info = await promisify(doc.getInfo)();
        const sheet = info.worksheets[1];
        const rows = await promisify(sheet.getRows)({
            query: `nim = ${nim}`
        })
        rows.forEach(row => {
            var rowJSON = {};
            rowJSON['nim'] = row.nim;
            rowJSON['namamahasiswa'] = row.namamahasiswa;
            rowJSON['saldo'] = row.saldo;
            dataSend = rowJSON
        })
        res.status(201).json({
            message: `Mengambil data saldo mahasiswa dengan nim ${nim}`,
            data: dataSend
        })
    }
    accessSpreadsheet()
})

router.post('/:nim', (req, res, next) => {
    const nim = req.params.nim;

    async function accessSpreadsheet() {
        const doc = new GoogleSpreadsheet('1L3bcBB3_1hGXIG7CoBxWnDB98CcTo2dNmQnN6Kuo6vc');
        await promisify(doc.useServiceAccountAuth)(creds);
        const info = await promisify(doc.getInfo)();
        const sheet = info.worksheets[1];
        const rows = await promisify(sheet.getRows)({
            query: `nim = ${nim}`
        })
        rows.forEach(row => {
            row.saldo = parseInt(row.saldo) + parseInt(req.body.topup);
            row.save();
        })
        res.status(201).json({
            message: `Menambah saldo mahasiswa dengan nim ${nim} sebesar ${req.body.topup}`
        })
    }
    accessSpreadsheet()
})

module.exports = router;