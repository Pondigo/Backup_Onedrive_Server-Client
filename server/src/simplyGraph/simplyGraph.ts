// Graph imports
import { AuthenticationResult } from "@azure/msal-common";
import { Client } from "@microsoft/microsoft-graph-client"
import { ConfidentialClientApplication } from "@azure/msal-node"
import { Configuration } from "@azure/msal-node/dist/config/Configuration"
import { saveToken, getToken, setObsoleteToken } from "../database/token"

// env
import dotenv from "dotenv";
dotenv.config();

const currentToken ="";

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

// saveAccessToken save token
const saveAccessToken = async function (queryCodeResCB: string) {
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
        saveToken(accessTokn.accessToken)
    } else {
        console.log('sale mal')
        return undefined
    }
}


// getAuthClient returns a Client authentified
const getAuthClientB = async function () {
    const tokenToUse = await getToken()

    if(tokenToUse !== null){
        try {
            const authuserClient: Client = Client.init({
                // Use the provided access token to authenticate
                authProvider: (done) => {
                    done(null, tokenToUse.token);
                }
            })
            await authuserClient.api('/me').get();
            return authuserClient;
        } catch (error) {
            setObsoleteToken(tokenToUse.token)
            return 'The access token is no longer valid.'

        }

    }else{
        return 'There are no more tokens.'
    }

}

// getAuthClientFinal try to get a Client and returns this with getAuthClient() while returns 'The access token is no longer valid.' and until getAuthClient returns 'There are no more tokens.' (recursive)
const getAuthClient = async function () {
    let stillTokens = true;
    while(stillTokens){
        const client = await getAuthClientB()
        if(typeof client !== "string"){
            return client
            stillTokens = false
        }else if (client === 'There are no more tokens.'){
            stillTokens = false
        }
    }
    return 'There are no more tokens.'
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


export { getURL, saveAccessToken, getDirByFF }