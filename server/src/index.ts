import express from "express";
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
const app = express();
const port = Number(process.env.PORT || 3001); // port to listen
let address:string;


// middlewares express
app.use(express.json());
app.use(express.urlencoded({extended: true}));
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
        // console.log('sale bien')
        // console.log(accessTokn.accessToken as string)
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
        // console.log('getDir: ', dirs)
        // console.log(typeof dirs)
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
        // console.log('getDirByFF: ', files, folders)
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

            try {
                microsoftGraphDownloadUrltmp = file["@microsoft.graph.downloadUrl"];
                ID_TMP = file.id;
                NAME_TMP = file.name;
                const FILEINFO_TMP = {
                    microsoftGraphDownloadUrl: microsoftGraphDownloadUrltmp,
                    id: ID_TMP,
                    name: NAME_TMP
                }
                newDirs.push(FILEINFO_TMP)


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

const downAfile = async function (url: string, fileName: string) {
    if(isExistentFile(fileName,getAlreadyDownload())){
        try {
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
                    regDownload(fileName)
                })
                .pipe(fs.createWriteStream(fileName));
        } catch (error) {
            console.log("Error al descargar - sleep 10000ms")
            const ms = 10000;
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms)
            syncAdir(await getDirByFF(),address)
        }

    }


};




// getAlreadyDownload recibe a path and read the txt file of these path (if dont exist this function create the file and returns a void array) and returns this in array divided by line
const getAlreadyDownload = () => {
    if (!fs.existsSync('./readyFiles.txt')) {
      fs.writeFileSync('./readyFiles.txt', '', 'utf8');
      return [];
    }
    return fs.readFileSync('./readyFiles.txt', 'utf8').split('\n');
  };
  // Register a dowload
  const regDownload = function (newFile: string) {
    fs.appendFile('./readyFiles.txt', newFile + '\n', (err) => {
        if (err) throw err;
    });
}

// isExistentFile receibe an string named "toDownload" and a array named "alreadyArray" and returns true if "toDownload" exists on "alreadyArray" else returns false
const isExistentFile = (toDownload: string, alreadyArray: any[]) => {
    let isExistent = false;
    alreadyArray.forEach(element => {
      if (element.name === toDownload) {
        isExistent = true;
      }
    });
    return isExistent;
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
    // console.log(customDir)
    for (const folder of folders) {
        let folderName = folder.name
        if (upFolder) {
            folderName = upFolder + "/" + folderName
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
    // console.log(await URLauth)
});

app.get('/dir', async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.send({ url: await getDir() })

});

app.get('/dirPro', async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.send({ url: await getDirByFF() })
});

app.get('/tryError', async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    saveError("Error de prueba")
    res.send("Ok")
});

app.get('/dirPro2', async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const filesMain = await getDirByFF()
    res.send({ url: filesMain })
    syncAdir(filesMain, 'C:/Users/CARLO/OneDrive/Escritorio/TestDown')
    /*
       if(typeof filesMain !== "string"){
           downloadAllFiles((await resumeDir(filesMain.files)).resumeDir,'C:/Users/CARLO/OneDrive/Escritorio/TestDown')
       }else{
           console.log('erroooooor')
       }
     */


    // downAfile("https://winliveudlap-my.sharepoint.com/personal/carlos_pondigosa_udlap_mx/_layouts/15/download.aspx?UniqueId=2bf3bce3-799d-48fc-9354-8a8ed2c4e98e&Translate=false&tempauth=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvd2lubGl2ZXVkbGFwLW15LnNoYXJlcG9pbnQuY29tQGEzN2MyMzY3LWNmMTgtNDQxZi05M2U1LTg1ZDdkYjBkNDkzZCIsImlzcyI6IjAwMDAwMDAzLTAwMDAtMGZmMS1jZTAwLTAwMDAwMDAwMDAwMCIsIm5iZiI6IjE2MzgzMDYyNTciLCJleHAiOiIxNjM4MzA5ODU3IiwiZW5kcG9pbnR1cmwiOiI0c2RVb0dXYkw2V1ZsN2RtMldMVFVjSXRRWFE1b3pMWlQwWER1OFZRNEswPSIsImVuZHBvaW50dXJsTGVuZ3RoIjoiMTYxIiwiaXNsb29wYmFjayI6IlRydWUiLCJjaWQiOiJZekkwTXpCaFltVXROV1ZsT0MwMU1XWTJMV1kxWWpndE16QmxZV1ppTmpjeU1qQmkiLCJ2ZXIiOiJoYXNoZWRwcm9vZnRva2VuIiwic2l0ZWlkIjoiTW1GbE1qQXhZalF0T1dNellTMDBOR1JoTFRnME9HRXRaVFUyTWpNeE1tWmpOV0k0IiwiYXBwX2Rpc3BsYXluYW1lIjoiYXBpMzY1anMiLCJnaXZlbl9uYW1lIjoiQ2FybG9zIE1hbnVlbCIsImZhbWlseV9uYW1lIjoiUG9uZGlnbyBTYW50YW1hcmlhIiwic2lnbmluX3N0YXRlIjoiW1wia21zaVwiXSIsImFwcGlkIjoiYzMxNDFmZDgtOTYxZS00ODA4LWI5NGItZmM4M2ZkZmE1YWE0IiwidGlkIjoiYTM3YzIzNjctY2YxOC00NDFmLTkzZTUtODVkN2RiMGQ0OTNkIiwidXBuIjoiY2FybG9zLnBvbmRpZ29zYUB1ZGxhcC5teCIsInB1aWQiOiIxMDAzMDAwMEFCNkYzNUQ0IiwiY2FjaGVrZXkiOiIwaC5mfG1lbWJlcnNoaXB8MTAwMzAwMDBhYjZmMzVkNEBsaXZlLmNvbSIsInNjcCI6Im15ZmlsZXMud3JpdGUgYWxsZmlsZXMud3JpdGUgYWxsc2l0ZXMud3JpdGUgYWxscHJvZmlsZXMucmVhZCIsInR0IjoiMiIsInVzZVBlcnNpc3RlbnRDb29raWUiOm51bGwsImlwYWRkciI6IjIwLjE5MC4xNTcuOTYifQ.NHlxbjBYSTdwSDA0UkZ5c09uVUVjS2ZmcGRCSmtTWURJNVpEcC9uL3Q2az0&ApiVersion=2.0", "Tarea 2.docx")
    // console.log('QuickXorHash:' + await operation("./src/Vitamina E.aep") as string)
});

app.post('/startBackUp', async function (req, res) {
    if (req.body.address !== undefined) {
        res.header("Access-Control-Allow-Origin", "*");
        const filesMain = await getDirByFF()
        address = req.body.address;
        res.send({ url: 'Starting on' + address })
        syncAdir(filesMain, address)
    }else{
        res.send({ type: "req sin req.body.address", evidence: req })
    }


});

app.get('/auth/callback',
    async function (req, res) {
        // console.log(req.query.state as string)
        currentToken = await getAccessTokenCB(req.query.code as string) as string
        // console.log('new curretToken' + currentToken)
        res.redirect('http://google.com')

    })