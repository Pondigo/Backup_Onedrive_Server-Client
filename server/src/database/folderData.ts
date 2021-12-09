import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface fileData {
  root: string;
  childcount: number;
  name: string;
  isSync: boolean;
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<fileData>({
    root: { type: String, required: true },
    childcount: { type: Number, required: true },
    name: { type: String, required: true },
    isSync: { type: Boolean, default: false }
  });


// 3. Create a Model.
const folderModel = model<fileData>('folderData', schema);

// saveFileMetadata save a model of folderData
async function saveFolderMetadata(root : string, childcount: number, name: string): Promise<void> {

    const doc = new folderModel({
    root,
    childcount,
    name
  });

  await doc.save();

  console.log("Se ha agregado " + doc.name);
}

// getUnsyncFolder returns a folderModel unsync
async function getUnsyncFolder(): Promise<any> {
    const unsync = await folderModel.findOne({ isSync: false });
    return unsync;
}

// getLastFolderMetadata returns the last "folderModel" saved that have isSync: false
async function getLastFolderMetadata(): Promise<any> {
  const last = await folderModel.findOne({ isSync: false }).sort({ $natural: -1 });
  return last;
}

// alreadySyncFolderMetadata updates a isSync to true of the folderModel specified by _id
async function alreadySyncFolderMetadata(_id: string): Promise<void> {
  try {
    await folderModel.updateOne({ _id }, { isSync: true });
  } catch (error) {
    console.log("error in alreadySyncFolderMetadata")
    console.log(error)

  }

}

export
{
    saveFolderMetadata,
    getUnsyncFolder,
    getLastFolderMetadata,
    alreadySyncFolderMetadata
}