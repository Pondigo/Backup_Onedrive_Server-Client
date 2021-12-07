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
async function saveFileMetadata(name: string, id: string, root: string): Promise<void> {

  const doc = new userModel({
    name,
    id,
    root
  });

  await doc.save();

  console.log("Se ha agregado " + doc.name);

}

// getLastFileMetadata returns the last "userModel" saved
async function getLastFileMetadata(): Promise<any | null> {
  const doc = await userModel.findOne({}).sort({ $natural: -1 });
  return doc;
}


// deleteFileMetadata deletes the "userModel" with the "_id" receibed

async function deleteFileMetadata(id: string, tryNum?: number) {
  if (tryNum === undefined) {
    try {
      await userModel.deleteOne({ _id:id });
      console.log("Se ha eliminado " + id);
    } catch (error) {
      console.log("Error al eliminar " + id + "\n Reintentando...")
      deleteFileMetadata(id,1)
    }
  }else if(tryNum<10){
    try {
      await userModel.deleteOne({ _id:id });
      console.log("Se ha eliminado " + id);
    } catch (error) {
      console.log("Error al eliminar " + id + "\n Reintentando ("+ tryNum + "/10) ...")
      deleteFileMetadata(id,tryNum+1)
    }
  }else{
    console.log("error al eliminar el fileMetadata con id:" + id)
  }


}

// deleteLastFileMetadata deletes the last "userModel" saved
async function deleteLastFileMetadata() {
  const doc = await getLastFileMetadata();
  if (doc) {
    await deleteFileMetadata(doc._id);
  }
}


export { saveFileMetadata, getLastFileMetadata, deleteFileMetadata, deleteLastFileMetadata };