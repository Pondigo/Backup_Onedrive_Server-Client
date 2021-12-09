"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirByFF = exports.saveAccessToken = exports.getURL = void 0;
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const msal_node_1 = require("@azure/msal-node");
const token_1 = require("../database/token");
// env
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const currentToken = "";
const getURL = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof process.env.OAUTH_APP_ID === 'undefined' || typeof process.env.OAUTH_APP_SECRET === 'undefined' || typeof process.env.OAUTH_AUTHORITY === 'undefined' || typeof process.env.OAUTH_SCOPES === 'undefined') {
            console.log('Esta vacio el archivo de config');
            return undefined;
        }
        const msalConfig = {
            auth: {
                clientId: process.env.OAUTH_APP_ID,
                authority: process.env.OAUTH_AUTHORITY,
                clientSecret: process.env.OAUTH_APP_SECRET
            },
        };
        const msalClient = new msal_node_1.ConfidentialClientApplication(msalConfig);
        const urlParameters = {
            scopes: process.env.OAUTH_SCOPES.split(','),
            state: 'My backup is loading',
            redirectUri: process.env.OAUTH_REDIRECT_URI
        };
        return yield msalClient.getAuthCodeUrl(urlParameters);
    });
};
exports.getURL = getURL;
// saveAccessToken save token
const saveAccessToken = function (queryCodeResCB) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof process.env.OAUTH_APP_ID === 'undefined' || typeof process.env.OAUTH_APP_SECRET === 'undefined' || typeof process.env.OAUTH_AUTHORITY === 'undefined' || typeof process.env.OAUTH_SCOPES === 'undefined') {
            console.log('Esta vacio el archivo de config');
            return undefined;
        }
        const msalConfig = {
            auth: {
                clientId: process.env.OAUTH_APP_ID,
                authority: process.env.OAUTH_AUTHORITY,
                clientSecret: process.env.OAUTH_APP_SECRET
            },
        };
        const msalClient = new msal_node_1.ConfidentialClientApplication(msalConfig);
        const tokenRequest = {
            code: queryCodeResCB,
            scopes: process.env.OAUTH_SCOPES.split(','),
            redirectUri: process.env.OAUTH_REDIRECT_URI
        };
        const accessTokn = yield msalClient.acquireTokenByCode(tokenRequest);
        if (accessTokn !== null) {
            console.log('sale bien');
            console.log(accessTokn.accessToken);
            (0, token_1.saveToken)(accessTokn.accessToken);
        }
        else {
            console.log('sale mal');
            return undefined;
        }
    });
};
exports.saveAccessToken = saveAccessToken;
// getAuthClient returns a Client authentified
const getAuthClientB = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenToUse = yield (0, token_1.getToken)();
        if (tokenToUse !== null) {
            try {
                const authuserClient = microsoft_graph_client_1.Client.init({
                    // Use the provided access token to authenticate
                    authProvider: (done) => {
                        done(null, tokenToUse.token);
                    }
                });
                yield authuserClient.api('/me').get();
                return authuserClient;
            }
            catch (error) {
                (0, token_1.setObsoleteToken)(tokenToUse.token);
                return 'The access token is no longer valid.';
            }
        }
        else {
            return 'There are no more tokens.';
        }
    });
};
// getAuthClientFinal try to get a Client and returns this with getAuthClient() while returns 'The access token is no longer valid.' and until getAuthClient returns 'There are no more tokens.' (recursive)
const getAuthClient = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let stillTokens = true;
        while (stillTokens) {
            const client = yield getAuthClientB();
            if (typeof client !== "string") {
                return client;
                stillTokens = false;
            }
            else if (client === 'There are no more tokens.') {
                stillTokens = false;
            }
        }
        return 'There are no more tokens.';
    });
};
// getDirByFF divided by folders and files call getdir and divides this arrays acording if each element in the array returned have a atrribute "file" or "folder"
const getDirByFF = function (customDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const authClient = yield getAuthClient();
        let routeToReq;
        if (customDir !== undefined) {
            routeToReq = '/me/drive/root:' + customDir + ':/children';
        }
        else {
            routeToReq = '/me/drive/root/children';
        }
        if (typeof authClient !== 'string') {
            const dirs = yield authClient.api(routeToReq)
                .get();
            const files = [];
            const folders = [];
            for (let i = 0; i < dirs.value.length; i++) {
                if (dirs.value[i].file !== undefined) {
                    files.push(dirs.value[i]);
                }
                else {
                    folders.push(dirs.value[i]);
                }
            }
            // console.log('getDirByFF: ', files, folders)
            return { files, folders };
        }
        return authClient;
    });
};
exports.getDirByFF = getDirByFF;
//# sourceMappingURL=simplyGraph.js.map