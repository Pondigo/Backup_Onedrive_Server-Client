import { Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface tokenGraph {
  token: string,
  uses: number
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<tokenGraph>({
    token: { type: String, required: true },
    uses: { type: Number, default: 0 }
  });


// 3. Create a Model.
const tokenModel = model<tokenGraph>('token', schema);

// saveFileMetadata save a model of folderData
async function saveToken(token : string): Promise<void> {

    const doc = new tokenModel({
    token
  });

  await doc.save();

  console.log("Se ha agregado un Token");
}

// getToken returns a tokenModel less unused (with the lowest number in uses) and add one on uses field
async function getToken(): Promise<any> {
  const token = await tokenModel.findOneAndUpdate({}, { $inc: { uses: 1 } }, { new: true }).sort({ uses: 1 });
  return token;
}

// setObsoleteToken receibe a token and deletes the corespondent tokenModel
async function setObsoleteToken(token: string): Promise<void> {
    await tokenModel.deleteOne({token});
    console.log("Se ha eliminado un Token");
}

export { saveToken, getToken, setObsoleteToken };

