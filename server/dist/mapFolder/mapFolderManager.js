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
exports.startSyncDir = void 0;
const simplyGraph_1 = require("../simplyGraph/simplyGraph");
// import fs
const fs_1 = __importDefault(require("fs"));
// import saveFolderMetadata
const folderData_1 = require("../database/folderData");
// import saveFileMetadata
const fileData_1 = require("../database/fileData");
// saveError declare a function that add a log (the log is an input string) in a txt named "errorLog", if the file not exist this create the file    //
const saveError = function (log) {
    fs_1.default.appendFile('errorLog.txt', log + '\n', (err) => {
        if (err)
            throw err;
    });
};
// createAllFolders recibe an JSON array named "folders" and a string named "path", and create a local folder (using fs for linux and windows) by each one of the element in the array "folders" with the name of the atribute on the path spesified on the strign "path"
const createAllFolders = function (folders, path) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < folders.length; i++) {
            if (folders[i].parentReference.path !== undefined) {
                if (folders[i].name !== undefined) {
                    let childCount;
                    if (folders[i].folder === undefined) {
                        childCount = 0;
                    }
                    else {
                        if (folders[i].folder.childCount === undefined) {
                            childCount = 0;
                        }
                        else {
                            childCount = folders[i].folder.childCount;
                        }
                    }
                    (0, folderData_1.saveFolderMetadata)(folders[i].parentReference.path, childCount, folders[i].name);
                    const newPath = path + '/' + folders[i].name;
                    if (!fs_1.default.existsSync(newPath)) {
                        fs_1.default.mkdirSync(newPath, { recursive: true });
                    }
                }
                else {
                    console.log("!- name is undefined");
                    console.log(folders[i]);
                }
            }
            else {
                console.log("!- parentReference.path is undefined");
                console.log(folders[i]);
            }
        }
    });
};
const saveFiles = function (dirs) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const file of dirs) {
            if (file.id !== undefined) {
                if (file.name !== undefined) {
                    if (file.parentReference !== undefined) {
                        if (file.parentReference.path !== undefined) {
                            const id = file.id;
                            const name = file.name;
                            const path = file.parentReference.path;
                            (0, fileData_1.saveFileMetadata)(name, id, path);
                        }
                        else {
                            saveError("file.parentReference.path is undefined in " + file.name);
                        }
                    }
                    else {
                        saveError("file.parentReference is undefined in " + file.name);
                    }
                }
                else {
                    console.log("file.name is undefined");
                }
            }
            else {
                console.log("file.id is undefined");
            }
        }
    });
};
// getRelativePath receibe a string and returns the same string without "/drive/root:"
const getRelativePath = (path) => {
    if (path.includes('/drive/root:')) {
        return path.replace('/drive/root:', '');
    }
    else {
        return path;
    }
};
const syncFolder = function (f, vLimit, path, trys) {
    return __awaiter(this, void 0, void 0, function* () {
        const d = new Date();
        const fyf = yield (0, simplyGraph_1.getDirByFF)(getRelativePath(f.root) + "/" + f.name);
        if (typeof fyf !== "string") {
            if (fyf.files.length + fyf.folders.length >= f.childcount || (trys !== undefined && trys > 10)) {
                yield saveFiles(fyf.files);
                yield createAllFolders(fyf.folders, path);
                yield (0, folderData_1.alreadySyncFolderMetadata)(f._id);
                const d2 = new Date();
                const time = d2.getTime() - d.getTime();
                if (time > 0) {
                    setTimeout(function () {
                        startNestedSync(vLimit, path);
                    }, vLimit);
                }
                else {
                    startNestedSync(vLimit, path);
                }
            }
            else {
                saveError("syncFolder recursive error by fyf.files.length + fyf.folders.length !== f.childcount in " + f.name);
                // console.log(fyf.files.length)
                const d2 = new Date();
                const time = d2.getTime() - d.getTime();
                if (time > 0) {
                    setTimeout(function () {
                        syncFolder(f, vLimit, path, trys ? trys + 1 : 1);
                    }, vLimit);
                }
                else {
                    syncFolder(f, vLimit, path, trys ? trys + 1 : 1);
                }
            }
        }
        else {
            console.log(fyf);
        }
    });
};
const startNestedSync = function (vLimit, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const f = yield (0, folderData_1.getLastFolderMetadata)();
        if (f !== undefined && f !== null) {
            syncFolder(f, vLimit, path);
        }
        else {
            console.log("Ya no hay");
        }
    });
};
const startSyncDir = function (path, vLimit) {
    return __awaiter(this, void 0, void 0, function* () {
        const fyf = yield (0, simplyGraph_1.getDirByFF)();
        if (typeof fyf !== "string") {
            yield createAllFolders(fyf.folders, path);
            yield saveFiles(fyf.files);
            if (vLimit !== undefined) {
                startNestedSync(vLimit, path);
            }
            else {
                startNestedSync(10, path);
            }
            return "Starting...";
        }
        else {
            return fyf;
        }
    });
};
exports.startSyncDir = startSyncDir;
//# sourceMappingURL=mapFolderManager.js.map