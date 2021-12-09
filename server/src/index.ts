import express from "express";
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';



// env
import dotenv from "dotenv";
dotenv.config();

// simplyGrAPH
import { getURL, saveAccessToken } from './simplyGraph/simplyGraph'
// mapFolderManager
import { startSyncDir } from "./mapFolder/mapFolderManager";

// database
import { saveFileMetadata, deleteLastFileMetadata } from "./database/fileData"
require('./database/database')

// Download manager
import { downloadFiles } from "./downloadSec/downloadManager"

const app = express();
const port = Number(process.env.PORT || 3001); // port to listen


// middlewares express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}



// import fs
import fs from 'fs';

// import cors
import cors from 'cors';

// May be is important!!!!!!!
// require('isomorphic-fetch');
import 'isomorphic-fetch';






app.use(cors());


// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

app.get('/getAuthURL', async function (req, res) {
    const URLauth = await getURL() as string;
    res.header("Access-Control-Allow-Origin", "*");
    res.send({ url: await URLauth })
    // console.log(process.env.OAUTH_APP_ID)
    console.log(await URLauth)
});

app.post('/mapFilesOnedrive', async function (req, res) {
    if (req.body.address !== undefined) {
        try {
            res.header("Access-Control-Allow-Origin", "*");
            const address = req.body.address;

            const status = await startSyncDir(address)

            res.send({ state: status })
        } catch (error:unknown) {

            console.log("Error on /mapFilesOnedrive-----------------------")
            if (error instanceof Error) {
                console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)))
              }
            console.log("------------------------[end error]-------------------")

        }

        // mapFiles(address)
    } else {
        res.send({ type: "req sin req.body.address", evidence: req })
    }


});

app.post('/startDownload', async function (req, res) {
    if (req.body.address !== undefined) {
        try {
            res.header("Access-Control-Allow-Origin", "*");
            const address = req.body.address;
            const velocity = req.body.velocity as number
            const test = await downloadFiles(address, velocity)
            res.send({ state: await test })
        } catch (error) {
            console.log("Error on /startDownload-----------------------")
            console.log(error)
            console.log("------------------------[end error]-------------------")

        }
    } else {
        res.send({ type: "req sin req.body.address", evidence: req })
    }

});

app.post('/deleteLastOne', async function (req, res) {
    try {
        await deleteLastFileMetadata()
        res.send({ state: "ok" })
    } catch (error) {
        res.send({ state: "Error" })
    }
});



app.get('/auth/callback',
    async function (req, res) {
        saveAccessToken(req.query.code as string)
        res.redirect('http://google.com')
    })