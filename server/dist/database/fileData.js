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
exports.deleteLastFileMetadata = exports.deleteFileMetadata = exports.getLastFileMetadata = exports.saveFileMetadata = void 0;
const mongoose_1 = require("mongoose");
// 2. Create a Schema corresponding to the document interface.
const schema = new mongoose_1.Schema({
    name: { type: String, required: true },
    id: { type: String, required: true },
    root: { type: String, required: true }
});
// 3. Create a Model.
const userModel = (0, mongoose_1.model)('fileData', schema);
// saveFileMetadata save a model of fileData
function saveFileMetadata(name, id, root) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = new userModel({
            name,
            id,
            root
        });
        yield doc.save();
        console.log("Se ha agregado " + doc.name);
    });
}
exports.saveFileMetadata = saveFileMetadata;
// getLastFileMetadata returns the last "userModel" saved
function getLastFileMetadata() {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = yield userModel.findOne({}).sort({ $natural: -1 });
        return doc;
    });
}
exports.getLastFileMetadata = getLastFileMetadata;
// deleteFileMetadata deletes the "userModel" with the "_id" receibed
function deleteFileMetadata(id, tryNum) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tryNum === undefined) {
            try {
                yield userModel.deleteOne({ _id: id });
                console.log("Se ha eliminado " + id);
            }
            catch (error) {
                console.log("Error al eliminar " + id + "\n Reintentando...");
                deleteFileMetadata(id, 1);
            }
        }
        else if (tryNum < 10) {
            try {
                yield userModel.deleteOne({ _id: id });
                console.log("Se ha eliminado " + id);
            }
            catch (error) {
                console.log("Error al eliminar " + id + "\n Reintentando (" + tryNum + "/10) ...");
                deleteFileMetadata(id, tryNum + 1);
            }
        }
        else {
            console.log("error al eliminar el fileMetadata con id:" + id);
        }
    });
}
exports.deleteFileMetadata = deleteFileMetadata;
// deleteLastFileMetadata deletes the last "userModel" saved
function deleteLastFileMetadata() {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = yield getLastFileMetadata();
        if (doc) {
            yield deleteFileMetadata(doc._id);
        }
    });
}
exports.deleteLastFileMetadata = deleteLastFileMetadata;
//# sourceMappingURL=fileData.js.map