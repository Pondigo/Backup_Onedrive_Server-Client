import { Schema, model, connect } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface fileData {
  name: string;
  id: string;
  root: string;
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<fileData>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  root: { type: String, required: true }
});

// 3. Create a Model.
const userModel = model<fileData>('fileData', schema);

// saveFileMetadata save a model of fileData
async function saveFileMetadata(name:string,id:string,root:string): Promise<void> {

    const doc = new userModel({
        name,
        id,
        root
      });

      await doc.save();

      console.log("Se ha agregado " + doc.name);

}

export { saveFileMetadata }