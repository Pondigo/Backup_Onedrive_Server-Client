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
exports.saveFileMetadata = void 0;
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
//# sourceMappingURL=fileData.js.map