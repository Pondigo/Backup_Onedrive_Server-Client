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
exports.downloadFiles = void 0;
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
// import getLastFileMetadata
const fileData_1 = require("../database/fileData");
// import tokenManager
const token_1 = require("../database/token");
// download utilities
const request_1 = __importDefault(require("request"));
const progress = require('request-progress');
// import fs
const fs_1 = __importDefault(require("fs"));
// getRelativePath receibe a string and returns the same string without "/drive/root:"
const getRelativePath = (path) => {
    if (path.includes('/drive/root:')) {
        return path.replace('/drive/root:', '');
    }
    else {
        return path;
    }
};
const downloadFiles = function (path, timeToDownload) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentToken = yield (0, token_1.getToken)();
        if (currentToken !== null) {
            console.log("Hi from downloadManager, this will be download in " + path);
            const fileToDownload = yield (0, fileData_1.getLastFileMetadata)();
            if (fileToDownload !== null) {
                console.log(fileToDownload.name);
                const item = yield getItem(fileToDownload.root, currentToken.token, fileToDownload.name);
                downAfile(item["@microsoft.graph.downloadUrl"], fileToDownload.name, currentToken.token, fileToDownload._id, path, fileToDownload.root, timeToDownload);
                return "Starting";
            }
            else {
                return "There are no files to download";
            }
        }
        else {
            return "There are no tokens anymore";
        }
    });
};
exports.downloadFiles = downloadFiles;
const getAuthClient = function (currentToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // access token no longer valid ***ONLY FOR TEST**
            // let expiredToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6IjFXM0dOUlFobmVia09QR05aM05sTzRDTTVaaGV3QkpoS1BTLTIyeXZUQ1kiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hMzdjMjM2Ny1jZjE4LTQ0MWYtOTNlNS04NWQ3ZGIwZDQ5M2QvIiwiaWF0IjoxNjI3ODA5ODgxLCJuYmYiOjE2Mjc4MDk4ODEsImV4cCI6MTYyNzgxMzc4MSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsidXJuOnVzZXI6cmVnaXN0ZXJzZWN1cml0eWluZm8iLCJ1cm46bWljcm9zb2Z0OnJlcTEiLCJ1cm46bWljcm9zb2Z0OnJlcTIiLCJ1cm46bWljcm9zb2Z0OnJlcTMiLCJjMSIsImMyIiwiYzMiLCJjNCIsImM1IiwiYzYiLCJjNyIsImM4IiwiYzkiLCJjMTAiLCJjMTEiLCJjMTIiLCJjMTMiLCJjMTQiLCJjMTUiLCJjMTYiLCJjMTciLCJjMTgiLCJjMTkiLCJjMjAiLCJjMjEiLCJjMjIiLCJjMjMiLCJjMjQiLCJjMjUiXSwiYWlvIjoiRTJaZ1lMQjBPWjhXSnZIU3RMSjJ5N1NsemhWY2ozVDVsK1dIaGI5ZjV4VmVkdjJ0eEV3QSIsImFtciI6WyJwd2QiXSwiYXBwX2Rpc3BsYXluYW1lIjoiTm9kZS5qcyBHcmFwaCBUdXRvcmlhbCCIsImFwcGlkIjoiNTA0OGEwNDMtYjBkYS00ZmE4LTk3OTctYTc4YjE5NDQzM2MzIiwiYXBwaWRhY3IiOiIxIiwiZmFtaWx5X25hbWUiOiJQb25kaWdvIFNhbnRhbWFyaWEiLCJnaXZlbl9uYW1lIjoiQ2FybG9zIE1bhbnVlbCIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjE4OS4xNjQuMTMuNzYiLCJuYW1lIjoiQ2FybG9zIE1hbnVlbCBQb25kaWdvIFNhbnRhbWFyaWEiLCJvaWQiOiJlNmQyYzRmZi1mYWVjLTQ3YjUtOTIyMC05O0DQ0YWYyNWE1MDUiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMzQ0MjgwNTQyOS0xOTI0MDc4OTQ3LTMxNTUxNzI3ODgtMTYzNTI3IiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMwMDAwQUI2RjM1RDQiLCJyaCI6IjAZuQVZjQVp5TjhveGpQSDBTVDVZWFgydzFKUFVPZ1NGRGFzS2hQbDVlbml4bEVNOE5YQURNLiIsInNjcCI6IkNhbGVuZGFycy5SZWFkV3JpdGUgRmlsZXMuUmVhZFdyaXRlIEZpbGVzLlJlYWRXcml0ZS5BbGwgTWFpbFGJveFNldHRpbmdzLlJlYWQgb3BlbmlkIHByb2ZpbGUgU2l0ZXMuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQgZW1haWwiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJVOEgzZzFuNlI1ZWZtYkgwQTdCcmpZTaTVTZFpZclFST1pZR2NUSDJKcEh3IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiYTM3YzIzNjctY2YxOC00NDFmLTkzZTUtODVkN2RiMGQ0OTNkIiwidW5pcXVlX25hbWUiOiJjYXJsb3MucG9uZhGlnb3NhQHVkbGFwLm14IiwidXBuIjoiY2FybG9zLnBvbmRpZ29zYUB1ZGxhcC5teCIsInV0aSI6Il9GTHhvUkt2VVVpcHlGTllIY1NwQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS0c4MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfc3QiOnsic3ViIjoicS1GejFybUhIS2tPTFltLVprTUFXa0l3Tk9tTWlkQzhtRmZnVG9kY0sxOCJ9LCJ4bXNfdGNkdCI6MTM2MDg3MDk3MX0.WoXhIYRT0-9YkQPLZwPDX4hwU2wLr64slqICCAryMCnqw8oHh_vgBxBh3ATI4As47p3zc8uQua9whojQAnJztdyYcrJV4_Eyb4B-BsyEXvSpcQQvT6-GrRieibWHqclaP7rS4mCqll2_a1BDpOCLZj66sYNGWexS6js3C0qiVn2C8TrRTMv5GHb6fMtq2EzFm8f8ysf0_DToqviKPdWcPvL6-zeFMjFNdwkgHLucO_OrnOVItjRdJzoecxI796rq1Qg1EQFIb285oLnH1KcQ2CrPzjW_7k_dZPjX3YfgPjvP7yEWsc3VqhReKyXbXvjNgQDxljhF_IcYAAhumuDLmDBw"
            const authuserClient = microsoft_graph_client_1.Client.init({
                // Use the provided access token to authenticate
                // requests
                authProvider: (done) => {
                    // Corresponder request
                    done(null, currentToken);
                    // Test request with expiredToken ****ONLY DEV, access token expired****
                    // done(null, expiredToken)
                }
            });
            yield authuserClient.api('/me').get();
            return authuserClient;
        }
        catch (error) {
            return 'The access token is no longer valid.';
        }
    });
};
const getItem = function (customDir, currentToken, name) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(customDir+"\n"+currentToken+"\n"+name)
        const authClient = yield getAuthClient(currentToken);
        const routeToReq = '/me' + customDir + '/' + name + "?select=d,@microsoft.graph.downloadUrl";
        if (typeof authClient !== 'string') {
            const dirs = yield authClient.api(routeToReq)
                .get();
            return yield dirs;
        }
        return authClient;
    });
};
const downAfile = function (url, fileName, currentToken, idfile, path, root, timeToDownload) {
    return __awaiter(this, void 0, void 0, function* () {
        const d = new Date();
        try {
            progress((0, request_1.default)(url), {})
                .on('progress', function (state) {
                console.log('progress', state);
            })
                .on('error', function (err) {
                return __awaiter(this, void 0, void 0, function* () {
                    // Do something with err
                    console.log('an error ocurred with the download of ' + fileName);
                    const d2 = new Date();
                    const dif = d2.getTime() - d.getTime();
                    const newCurrentToken = yield (0, token_1.getToken)();
                    if (newCurrentToken !== null) {
                        if (dif < timeToDownload) {
                            setTimeout(function () {
                                downAfile(url, fileName, newCurrentToken.token, idfile, path, root, timeToDownload);
                            }, timeToDownload - dif);
                        }
                        else {
                            downAfile(url, fileName, newCurrentToken.token, idfile, path, root, timeToDownload);
                        }
                    }
                    else {
                        console.log('Error inside of progress error');
                    }
                });
            })
                .on('end', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // Do something after request finishes
                    console.log('The download of ' + fileName + ' has been sucessfully');
                    const d2 = new Date();
                    const dif = d2.getTime() - d.getTime();
                    yield (0, fileData_1.deleteFileMetadata)(idfile);
                    const fileToDownload = yield (0, fileData_1.getLastFileMetadata)();
                    if (fileToDownload !== null) {
                        console.log(fileToDownload.name);
                        const item = yield getItem(fileToDownload.root, currentToken, fileToDownload.name);
                        // Download the next
                        if (dif < timeToDownload) {
                            setTimeout(function () {
                                downAfile(item["@microsoft.graph.downloadUrl"], fileToDownload.name, currentToken, fileToDownload._id, path, fileToDownload.root, timeToDownload);
                            }, timeToDownload - dif);
                        }
                        else {
                            downAfile(item["@microsoft.graph.downloadUrl"], fileToDownload.name, currentToken, fileToDownload._id, path, fileToDownload.root, timeToDownload);
                        }
                    }
                });
            })
                .pipe(fs_1.default.createWriteStream(path + getRelativePath(root) + "/" + fileName));
        }
        catch (error) {
            console.log("Error try/catch downAfile");
            console.log(error);
            console.log("Verificar tipo de error si es por que no encuentra el archivo lo borra, problemas de autentificacion obtiene un nuevo token");
        }
    });
};
//# sourceMappingURL=downloadManager.js.map