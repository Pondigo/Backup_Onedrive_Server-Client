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
Object.defineProperty(exports, "__esModule", { value: true });
exports.alreadySyncFolderMetadata = exports.getLastFolderMetadata = exports.getUnsyncFolder = exports.saveFolderMetadata = void 0;
const mongoose_1 = require("mongoose");
// 2. Create a Schema corresponding to the document interface.
const schema = new mongoose_1.Schema({
    root: { type: String, required: true },
    childcount: { type: Number, required: true },
    name: { type: String, required: true },
    isSync: { type: Boolean, default: false }
});
// 3. Create a Model.
const folderModel = (0, mongoose_1.model)('folderData', schema);
// saveFileMetadata save a model of folderData
function saveFolderMetadata(root, childcount, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = new folderModel({
            root,
            childcount,
            name
        });
        yield doc.save();
        console.log("Se ha agregado " + doc.name);
    });
}
exports.saveFolderMetadata = saveFolderMetadata;
// getUnsyncFolder returns a folderModel unsync
function getUnsyncFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        const unsync = yield folderModel.findOne({ isSync: false });
        return unsync;
    });
}
exports.getUnsyncFolder = getUnsyncFolder;
// getLastFolderMetadata returns the last "folderModel" saved that have isSync: false
function getLastFolderMetadata() {
    return __awaiter(this, void 0, void 0, function* () {
        const last = yield folderModel.findOne({ isSync: false }).sort({ $natural: -1 });
        return last;
    });
}
exports.getLastFolderMetadata = getLastFolderMetadata;
// alreadySyncFolderMetadata updates a isSync to true of the folderModel specified by _id
function alreadySyncFolderMetadata(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield folderModel.updateOne({ _id }, { isSync: true });
        }
        catch (error) {
            console.log("error in alreadySyncFolderMetadata");
            console.log(error);
        }
    });
}
exports.alreadySyncFolderMetadata = alreadySyncFolderMetadata;
//# sourceMappingURL=folderData.js.map