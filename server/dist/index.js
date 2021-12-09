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
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
// env
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// simplyGrAPH
const simplyGraph_1 = require("./simplyGraph/simplyGraph");
// mapFolderManager
const mapFolderManager_1 = require("./mapFolder/mapFolderManager");
// database
const fileData_1 = require("./database/fileData");
require('./database/database');
// Download manager
const downloadManager_1 = require("./downloadSec/downloadManager");
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 3001); // port to listen
// middlewares express
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Security
if (process.env.NODE_ENV === 'production') {
    app.use((0, helmet_1.default)());
}
// import cors
const cors_1 = __importDefault(require("cors"));
// May be is important!!!!!!!
// require('isomorphic-fetch');
require("isomorphic-fetch");
app.use((0, cors_1.default)());
// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
app.get('/getAuthURL', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const URLauth = yield (0, simplyGraph_1.getURL)();
        res.header("Access-Control-Allow-Origin", "*");
        res.send({ url: yield URLauth });
        // console.log(process.env.OAUTH_APP_ID)
        console.log(yield URLauth);
    });
});
app.post('/mapFilesOnedrive', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.body.address !== undefined) {
            try {
                res.header("Access-Control-Allow-Origin", "*");
                const address = req.body.address;
                const status = yield (0, mapFolderManager_1.startSyncDir)(address);
                res.send({ state: status });
            }
            catch (error) {
                console.log("Error on /mapFilesOnedrive-----------------------");
                console.log(error.code);
                console.log("------------------------[end error]-------------------");
            }
            // mapFiles(address)
        }
        else {
            res.send({ type: "req sin req.body.address", evidence: req });
        }
    });
});
app.post('/startDownload', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.body.address !== undefined) {
            try {
                res.header("Access-Control-Allow-Origin", "*");
                const address = req.body.address;
                const velocity = req.body.velocity;
                const test = yield (0, downloadManager_1.downloadFiles)(address, velocity);
                res.send({ state: yield test });
            }
            catch (error) {
                console.log("Error on /startDownload-----------------------");
                console.log(error);
                console.log("------------------------[end error]-------------------");
            }
        }
        else {
            res.send({ type: "req sin req.body.address", evidence: req });
        }
    });
});
app.post('/deleteLastOne', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, fileData_1.deleteLastFileMetadata)();
            res.send({ state: "ok" });
        }
        catch (error) {
            res.send({ state: "Error" });
        }
    });
});
app.get('/auth/callback', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, simplyGraph_1.saveAccessToken)(req.query.code);
        res.redirect('http://google.com');
    });
});
//# sourceMappingURL=index.js.map