import { getDirByFF } from "../simplyGraph/simplyGraph"
// import fs
import fs from 'fs';
// import saveFolderMetadata
import { saveFolderMetadata, getLastFolderMetadata, alreadySyncFolderMetadata } from "../database/folderData";
// import saveFileMetadata
import { saveFileMetadata } from "../database/fileData";

// saveError declare a function that add a log (the log is an input string) in a txt named "errorLog", if the file not exist this create the file    //
const saveError = function (log: string) {
    fs.appendFile('errorLog.txt', log + '\n', (err) => {
        if (err) throw err;
    });
}

// createAllFolders recibe an JSON array named "folders" and a string named "path", and create a local folder (using fs for linux and windows) by each one of the element in the array "folders" with the name of the atribute on the path spesified on the strign "path"
const createAllFolders = async function (folders: any[], path: string) {
    for (let i = 0; i < folders.length; i++) {
        if (folders[i].parentReference.path !== undefined) {

            if (folders[i].name !== undefined) {

                let childCount: number;
                if (folders[i].folder === undefined) {
                    childCount = 0

                } else {
                    if (folders[i].folder.childCount === undefined) {
                        childCount = 0
                    } else {
                        childCount = folders[i].folder.childCount
                    }
                }
                saveFolderMetadata(folders[i].parentReference.path, childCount, folders[i].name)
                const newPath = path + '/' + folders[i].name;
                if (!fs.existsSync(newPath)) {
                    fs.mkdirSync(newPath, { recursive: true });
                }
            } else {
                console.log("!- name is undefined")
                console.log(folders[i])
            }

        } else {
            console.log("!- parentReference.path is undefined")
            console.log(folders[i])
        }

    }
}

const saveFiles = async function (dirs: any[]) {
    for (const file of dirs) {
        if (file.id !== undefined) {
            if (file.name !== undefined) {
                if (file.parentReference !== undefined) {
                    if (file.parentReference.path !== undefined) {
                        const id = file.id;
                        const name = file.name;
                        const path = file.parentReference.path;
                        saveFileMetadata(name, id, path)
                    } else {
                        saveError("file.parentReference.path is undefined in " + file.name)
                    }
                } else {
                    saveError("file.parentReference is undefined in " + file.name)
                }
            } else {
                console.log("file.name is undefined")
            }
        } else {
            console.log("file.id is undefined")
        }
    }
}

// getRelativePath receibe a string and returns the same string without "/drive/root:"
const getRelativePath = (path: string) => {
    if (path.includes('/drive/root:')) {
        return path.replace('/drive/root:', '')
    } else {
        return path
    }
}


const syncFolder = async function (f: any, vLimit: number, path: string, trys?:number) {
    const d = new Date();
    const fyf = await getDirByFF(getRelativePath(f.root) + "/" + f.name)
    if (typeof fyf !== "string") {
        if (fyf.files.length + fyf.folders.length >= f.childcount || (trys !== undefined && trys > 10)) {
            await saveFiles(fyf.files)
            await createAllFolders(fyf.folders, path)
            await alreadySyncFolderMetadata(f._id)
            const d2 = new Date();
            const time = d2.getTime() - d.getTime();
            if (time > 0) {
                setTimeout(function () {
                    startNestedSync(vLimit, path)

                }, vLimit);
            } else {
                startNestedSync(vLimit, path)
            }



        } else {
            saveError("syncFolder recursive error by fyf.files.length + fyf.folders.length !== f.childcount in " + f.name)
            // console.log(fyf.files.length)
            const d2 = new Date();
            const time = d2.getTime() - d.getTime();
            if (time > 0) {
                setTimeout(function () {
                    syncFolder(f, vLimit, path, trys?trys + 1:1)
                }, vLimit);
            } else {
                syncFolder(f, vLimit, path, trys?trys + 1:1)
            }
        }
    } else {
        console.log(fyf)
    }
}


const startNestedSync = async function (vLimit: number, path: string) {
    const f = await getLastFolderMetadata()
    if (f !== undefined && f !== null) {
        syncFolder(f, vLimit, path)
    } else {
        console.log("Ya no hay")
    }
}



const startSyncDir = async function (path: string, vLimit?: number) {
    const d = new Date()
    const fyf = await getDirByFF()
    if (typeof fyf !== "string") {
        await createAllFolders(fyf.folders, path)
        await saveFiles(fyf.files)
        if (vLimit !== undefined) {
            setTimeout(function () {
                startNestedSync(vLimit, path)

            }, vLimit);
        } else {
            setTimeout(function () {
                startNestedSync(10, path)
            }, 10);

        }

        return "Starting..."
    } else {
        return fyf
    }
}

export {
    startSyncDir
}

