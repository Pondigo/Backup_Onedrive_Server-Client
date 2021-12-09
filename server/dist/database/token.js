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
exports.setObsoleteToken = exports.getToken = exports.saveToken = void 0;
const mongoose_1 = require("mongoose");
// 2. Create a Schema corresponding to the document interface.
const schema = new mongoose_1.Schema({
    token: { type: String, required: true },
    uses: { type: Number, default: 0 }
});
// 3. Create a Model.
const tokenModel = (0, mongoose_1.model)('token', schema);
// saveFileMetadata save a model of folderData
function saveToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = new tokenModel({
            token
        });
        yield doc.save();
        console.log("Se ha agregado un Token");
    });
}
exports.saveToken = saveToken;
// getToken returns a tokenModel less unused (with the lowest number in uses) and add one on uses field
function getToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield tokenModel.findOneAndUpdate({}, { $inc: { uses: 1 } }, { new: true }).sort({ uses: 1 });
        return token;
    });
}
exports.getToken = getToken;
// setObsoleteToken receibe a token and deletes the corespondent tokenModel
function setObsoleteToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        yield tokenModel.deleteOne({ token });
        console.log("Se ha eliminado un Token");
    });
}
exports.setObsoleteToken = setObsoleteToken;
//# sourceMappingURL=token.js.map