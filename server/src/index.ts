import express from "express";
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';


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


import request from 'request';

const progress = require('request-progress')

// import fs
import fs from 'fs';

// import cors
import cors from 'cors';

// May be is important!!!!!!!
// require('isomorphic-fetch');
import 'isomorphic-fetch';


import dotenv from "dotenv";
dotenv.config();


// Graph imports
import { AuthenticationResult } from "@azure/msal-common";
import { Client } from "@microsoft/microsoft-graph-client"
import { ConfidentialClientApplication } from "@azure/msal-node"
import { Configuration } from "@azure/msal-node/dist/config/Configuration"


// token var
let currentToken = '';

// functionality
const getURL = async function () {
    if (typeof process.env.OAUTH_APP_ID === 'undefined' || typeof process.env.OAUTH_APP_SECRET === 'undefined' || typeof process.env.OAUTH_AUTHORITY === 'undefined' || typeof process.env.OAUTH_SCOPES === 'undefined') {
        console.log('Esta vacio el archivo de config')
        return undefined
    }
    const msalConfig: Configuration = {
        auth: {
            clientId: process.env.OAUTH_APP_ID,
            authority: process.env.OAUTH_AUTHORITY,
            clientSecret: process.env.OAUTH_APP_SECRET
        },

    };
    const msalClient = new ConfidentialClientApplication(msalConfig);
    const urlParameters = {
        scopes: process.env.OAUTH_SCOPES.split(','),
        state: 'My backup is loading',
        redirectUri: (process.env.OAUTH_REDIRECT_URI as string)
    };

    return await msalClient.getAuthCodeUrl(urlParameters);

}

const getAccessTokenCB = async function (queryCodeResCB: string) {
    if (typeof process.env.OAUTH_APP_ID === 'undefined' || typeof process.env.OAUTH_APP_SECRET === 'undefined' || typeof process.env.OAUTH_AUTHORITY === 'undefined' || typeof process.env.OAUTH_SCOPES === 'undefined') {
        console.log('Esta vacio el archivo de config')
        return undefined
    }
    const msalConfig: Configuration = {
        auth: {
            clientId: process.env.OAUTH_APP_ID,
            authority: process.env.OAUTH_AUTHORITY,
            clientSecret: process.env.OAUTH_APP_SECRET
        },

    };
    const msalClient = new ConfidentialClientApplication(msalConfig);

    const tokenRequest = {
        code: queryCodeResCB,
        scopes: process.env.OAUTH_SCOPES.split(','),
        redirectUri: process.env.OAUTH_REDIRECT_URI as string
    };
    const accessTokn = await msalClient.acquireTokenByCode(tokenRequest)
    if (accessTokn !== null) {
        console.log('sale bien')
        console.log(accessTokn.accessToken as string)
        currentToken = accessTokn.accessToken
        return await accessTokn.accessToken;
    } else {
        console.log('sale mal')
        return undefined
    }
}
const getAuthClient = async function () {

    try {
        // access token no longer valid ***ONLY FOR TEST**
        // let expiredToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6IjFXM0dOUlFobmVia09QR05aM05sTzRDTTVaaGV3QkpoS1BTLTIyeXZUQ1kiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.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.WoXhIYRT0-9YkQPLZwPDX4hwU2wLr64slqICCAryMCnqw8oHh_vgBxBh3ATI4As47p3zc8uQua9whojQAnJztdyYcrJV4_Eyb4B-BsyEXvSpcQQvT6-GrRieibWHqclaP7rS4mCqll2_a1BDpOCLZj66sYNGWexS6js3C0qiVn2C8TrRTMv5GHb6fMtq2EzFm8f8ysf0_DToqviKPdWcPvL6-zeFMjFNdwkgHLucO_OrnOVItjRdJzoecxI796rq1Qg1EQFIb285oLnH1KcQ2CrPzjW_7k_dZPjX3YfgPjvP7yEWsc3VqhReKyXbXvjNgQDxljhF_IcYAAhumuDLmDBw"

        const authuserClient: Client = Client.init({
            // Use the provided access token to authenticate
            // requests
            authProvider: (done) => {
                // Corresponder request
                done(null, currentToken);
                // Test request with expiredToken ****ONLY DEV, access token expired****
                // done(null, expiredToken)
            }

        })
        await authuserClient.api('/me').get();

        return authuserClient;

    } catch (error) {
        return 'The access token is no longer valid.'

    }


}

// getDir returns a JSON array that represent a directory of customDir or the origin if customDir is undefided
const getDir = async function (customDir?: string) {
    const authClient = await getAuthClient();

    let routeToReq: string;
    if (customDir !== undefined) {
        routeToReq = '/me/drive/root:' + customDir + ':/children';
    } else {
        routeToReq = '/me/drive/root/children';
    }

    if (typeof authClient !== 'string') {
        const dirs = await authClient.api(routeToReq)
            .get();
        console.log('getDir: ', dirs)
        console.log(typeof dirs)
        return await dirs;

    }

    return authClient


}

// getDirByFF divided by folders and files call getdir and divides this arrays acording if each element in the array returned have a atrribute "file" or "folder"
const getDirByFF = async function (customDir?: string) {
    const authClient = await getAuthClient();
    let routeToReq: string;
    if (customDir !== undefined) {
        routeToReq = '/me/drive/root:' + customDir + ':/children';
    } else {
        routeToReq = '/me/drive/root/children';
    }
    if (typeof authClient !== 'string') {
        const dirs = await authClient.api(routeToReq)
            .get();
        const files: any[] = [];
        const folders: any[] = [];
        for (let i = 0; i < dirs.value.length; i++) {
            if (dirs.value[i].file !== undefined) {
                files.push(dirs.value[i])
            } else {
                folders.push(dirs.value[i])
            }
        }
        console.log('getDirByFF: ', files, folders)
        return { files, folders }

    }

    return authClient

}

/*
// allHaveDownloadUrl recibe an JSON arry and check if all of they elements have an atribute "microsoft.graph.downloadUrl" and return an boolean true if all have the atribute and false if not
const allHaveDownloadUrl = async function (dirs: any[]) {
    const authClient = await getAuthClient();
    if (typeof authClient !=='string') {
        let allHaveDownloadUrl = true;
        for (let i = 0; i < dirs.length; i++) {
            if (dirs[i].microsoft.graph.downloadUrl === undefined) {
                allHaveDownloadUrl = false;
            }
        }
        return allHaveDownloadUrl;
    }
    return authClient
}
 */
// createAllFolders recibe an JSON array named "folders" and a string named "path", and create a local folder (using fs for linux and windows) by each one of the element in the array "folders" with the name of the atribute on the path spesified on the strign "path"
const createAllFolders = async function (folders: any[], path: string) {


    for (let i = 0; i < folders.length; i++) {
        const newPath = path + '/' + folders[i].name;
        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath, { recursive: true });
        }
    }


}
// resumeDir returns a array JSON that contains the same elements of the JSON array introduced but only with the attributes of "microsoft.graph.downloadUrl", "id", "name" and add a atribute named "path" that contains the customdir introduced (if is undefined the value is "./") and the name of the folder. It also returns a boolean true if the desired attributes were found and could be returned correctly and a boolean false if any attribute is missing or there was an error.
const resumeDir = async function (dirs: any[], customDir?: string) {
    const newDirs = [{}];
    let allOk = true;
    for (const filen in dirs) {
        if (Object.prototype.hasOwnProperty.call(dirs, filen)) {
            const file = dirs[filen];
            let microsoftGraphDownloadUrltmp: string;
            let ID_TMP: string;
            let NAME_TMP: string;
            let PATH_TMP: string;

            try {
                microsoftGraphDownloadUrltmp = file["@microsoft.graph.downloadUrl"];
                ID_TMP = file.id;
                NAME_TMP = file.name;
                PATH_TMP = file.parentReference.path;
                const FILEINFO_TMP = {
                    microsoftGraphDownloadUrl: microsoftGraphDownloadUrltmp,
                    id: ID_TMP,
                    name: NAME_TMP,
                    path: PATH_TMP
                }
                newDirs.push(FILEINFO_TMP)
                saveFileMetadata(NAME_TMP, ID_TMP, PATH_TMP)



            } catch (error) {
                allOk = false
                console.log("Falta informacion en las indexacion de los archivos #resumeDir")

            }

        }
    }
    newDirs.shift()

    return ({ resumeDir: newDirs, allOk })
}
// Declare a function that returns an array that indexes the OneDrive directories using the getDirByFF functions, with which it will first index the root directory (using the function without input arguments) and then index the contents of the folders in the root folder, using the getDirByFF function for each element of the folders array I return. In the same way, it will index the folders within these and their subsequent ones.
const getAllDirs = async function (customDir?: string) {
    const authClient = await getAuthClient();
    let routeToReq: string;
    if (customDir !== undefined) {
        routeToReq = '/me/drive/root:' + customDir + ':/children';
    } else {
        routeToReq = '/me/drive/root/children';
    }
    if (typeof authClient !== 'string') {
        const mainDir = await getDirByFF()
        // Files
        // Obtains a array JSON that contains the same elements but only with the attributes of "microsoft.graph.downloadUrl", "id", "name" and add a atribute named "path" that contains the customdir introduced (if is undefined the value is "./")
        if (typeof mainDir !== "string") {
            const resumedDir = await resumeDir(mainDir.files)
            return (await resumedDir).resumeDir;
        } else {
            return ("The access token is no longer valid.")
        }


    }
    return authClient
}
// downAfile Download a File

const downAfile = function (url: string, fileName: string) {
    progress(request(url), {
        // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
        // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
        // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
    })
        .on('progress', function (state: any) {
            // The state is an object that looks like this:
            // {
            //     percent: 0.5,               // Overall percent (between 0 to 1)
            //     speed: 554732,              // The download speed in bytes/sec
            //     size: {
            //         total: 90044871,        // The total payload size in bytes
            //         transferred: 27610959   // The transferred payload size in bytes
            //     },
            //     time: {
            //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
            //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
            //     }
            // }
            console.log('progress', state);
        })
        .on('error', function (err: any) {
            // Do something with err
            console.log('an error ocurred with the download of ' + fileName)
        })
        .on('end', function () {
            // Do something after request finishes
            console.log('The download of ' + fileName + ' has been sucessfully')
        })
        .pipe(fs.createWriteStream(fileName));
};

// downloadAllFiles recibe a array of JSON named "files" and download the content in the URL (with fetch) of the atribute "@microsoft.graph.downloadUrl" by each element of the array JSON receibed
const downloadAllFiles = async function (files: any[], customDir?: string) {

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = file.microsoftGraphDownloadUrl;
        let fileName = file.name;
        if (customDir) {
            fileName = customDir + "/" + fileName
        }
        console.log('Se va a descargar: ' + fileName)
        downAfile(url, fileName);
    }

}
// syncAdir download a dir and set the folders
const syncAdir = async function (filesAndFolders: any, customDir?: string) {
    const folders = filesAndFolders.folders
    const files = await resumeDir(filesAndFolders.files)
    createAllFolders(folders, customDir ? customDir : '.')

    downloadAllFiles(files.resumeDir, customDir)
    if (!files.allOk) {
        saveError("Hay un archivo que no se del folder raiz")
        console.log("Heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeelp\n------------------\n------------------\n------------------\n------------------\n------------------\n------------------\n------------------\n------------------Something happends wrong \n------------------\n------------------A file has not backup")
    }

    nestedSyncDir(folders, undefined, customDir)



}
const nestedSyncDir = async function (folders: any, upFolder?: string, customDir?: string) {
    console.log(customDir)
    for (const folder of folders) {
        let folderName = folder.name
        if (upFolder) {
            folderName = "/" + upFolder + "/" + folderName
        } else {
            folderName = "/" + folderName
        }
        const filesNested = await getDirByFF(folderName)
        let currentPath: string;
        if (customDir !== undefined) {
            currentPath = customDir + "/" + folderName
        } else {
            currentPath = "./" + folderName
        }


        if (typeof filesNested !== "string") {
            createAllFolders(filesNested.folders, currentPath)
            nestedSyncDir(filesNested.folders, folderName, customDir)
            const files = await resumeDir(filesNested.files)
            downloadAllFiles(files.resumeDir, currentPath)
            if (!files.allOk) {
                saveError("Hay un archivo que no se del folder: " + folderName)
                console.log("Heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeelp\n------------------\n------------------\n------------------\n------------------\n------------------\n------------------\n------------------\n------------------Something happends wrong \n------------------\n------------------A file has not backup")
            }
        } else {
            saveError("Error al sincronizar con 'nestedSyncDir' el folder llamado: " + folderName)
            console.log("Heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeelp\n------------------\n------------------\n------------------\n------------------\n------------------\n------------------\n------------------\n------------------Something happends wrong \n------------------\n------------------A file has not backup")
        }

    }
}
// saveError declare a function that add a log (the log is an input string) in a txt named "errorLog", if the file not exist this create the file    //
const saveError = function (log: string) {
    fs.appendFile('errorLog.txt', log + '\n', (err) => {
        if (err) throw err;
    });
}

// getRelativePath receibe a string and returns the same string without "/drive/root:"
const getRelativePath = (path: string) => {
    if (path.includes('/drive/root:')) {
        return path.replace('/drive/root:', '')
    } else {
        return path
    }
}

// mapRecursiveFiles
const mapRecursiveFiles = async function (folders: any, customDir?: string) {
    if (folders.length) {
        for (const folder of folders) {
            let TRYS_TIME_TMP = 0;
            let IS_FINALIZED_TMP = false;
            while (!IS_FINALIZED_TMP) {
                try {
                    const CLOUD_PATH_TMP = folder.parentReference.path;
                    const RELATIVE_PATH_TMP = getRelativePath(CLOUD_PATH_TMP);
                    const FILESMAIN_TMP = await getDirByFF(RELATIVE_PATH_TMP + "/" + folder.name)

                    if (typeof FILESMAIN_TMP !== "string") {
                        await resumeDir(FILESMAIN_TMP.files)
                        createAllFolders(folders, customDir ? customDir + RELATIVE_PATH_TMP : '.')
                        mapRecursiveFiles(FILESMAIN_TMP.folders, customDir)
                        IS_FINALIZED_TMP = true;
                        if (TRYS_TIME_TMP !== 0) {
                            saveError("El folder " + folder.name + " ya se ha mapeado correctamente (listo)")
                        }

                    } else {
                        saveError("El folder " + folder.name + " no se ha mapeado correctamente")
                        TRYS_TIME_TMP = TRYS_TIME_TMP + 1;
                        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60*TRYS_TIME_TMP);
                    }

                } catch (error) {
                    saveError("El folder " + folder.name + " no se ha mapeado correctamente")
                    TRYS_TIME_TMP = TRYS_TIME_TMP + 1;
                    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60*TRYS_TIME_TMP);
                }

            }



        }
    }

}

// mapFiles save all metadata of the files and create the folders
const mapFiles = async function (customDir?: string) {
    const filesMain = await getDirByFF();
    if (typeof filesMain !== "string") {
        const folders = filesMain.folders
        await resumeDir(filesMain.files)
        createAllFolders(folders, customDir ? customDir : '.')
        mapRecursiveFiles(folders, customDir)
    } else {
        saveError("El folder principal no se ha mapeado correctamente")
    }
}



app.use(cors());

// define a route handler for the default home page
app.get("/", (req: any, res: any) => {
    res.send("Hello world!");
});

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
        res.header("Access-Control-Allow-Origin", "*");
        const address = req.body.address;
        res.send({ state: 'Starting' })
        mapFiles(address)
    } else {
        res.send({ type: "req sin req.body.address", evidence: req })
    }


});

app.post('/startDownload', async function (req, res) {
    if (req.body.address !== undefined) {
        res.header("Access-Control-Allow-Origin", "*");
        const address = req.body.address;
        const velocity = req.body.velocity as number
        const test = await downloadFiles(address, currentToken, velocity)
        res.send({ state: await test })

    } else {
        res.send({ type: "req sin req.body.address", evidence: req })
    }

});

app.post('/deleteLastOne', async function (req, res) {
    try {
        await deleteLastFileMetadata()
        res.send({state:"ok"})
    } catch (error) {
        res.send({state:"Error"})
    }
});



app.get('/auth/callback',
    async function (req, res) {
        console.log(req.query.state as string)
        currentToken = await getAccessTokenCB(req.query.code as string) as string
        console.log('new curretToken' + currentToken)
        res.redirect('http://google.com')

    })