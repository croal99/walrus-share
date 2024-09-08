import localforage from "localforage";
import {matchSorter} from "match-sorter";
import {FolderOnStore} from "@/types/FolderOnStore.ts";
import {FileOnStore} from "@/types/FileOnStore.ts";

const KEY_FOLDER = "folders";

const root: FolderOnStore = {
    id: '0',
    name: 'root',
    createAt: 0,
    parentId: "",
}

// ------ Folder Api ------
export async function getAllFolders() {
    // console.log('current folder', folderId);
    const folders: FolderOnStore[] | null = await localforage.getItem(KEY_FOLDER);
    if (folders) {
        return folders
    } else {
        return [root];
    }
}

export async function getCurrentFolder(folderId) {
    // console.log('current folder', folderId);
    const folders: FolderOnStore[] | null = await localforage.getItem(KEY_FOLDER);
    if (!folders) {
        return root
    }

    // 查询目录
    if (!folderId) {
        return root
    }
    for (const key in folders) {
        // console.log(key, folders[key])
        if (folders[key].id === folderId) {
            return folders[key]
        }
    }

    // 都没有找到
    return root;
}

export async function getChildFolders(parentId) {
    // console.log('current child folders', folderId);
    const folders: FolderOnStore[] | null = await localforage.getItem(KEY_FOLDER);
    if (!folders) {
        return []
    }

    if (parentId) {
        return matchSorter(folders, parentId, {keys: ["parentId"]});
    }
    return [];
}

export async function checkFolderIsExist(newFolder: FolderOnStore) {
    const folders = await getChildFolders(newFolder.parentId);

    // 检查是否已经创建
    return matchSorter(folders, newFolder.name, {keys: ["name"]}).length > 0
}

export async function createFolder(newFolder: FolderOnStore) {
    // 检查是否已经创建
    if (await checkFolderIsExist(newFolder)) {
        return false;
    }

    console.log('create folder')
    newFolder.id = Math.random().toString(36).substring(2, 12);
    newFolder.createAt = Date.now();
    const folders = await getAllFolders();
    // folders.unshift(newFolder);
    folders.push(newFolder);
    await setFolders(folders);

    return newFolder;
}

export async function removeFolderStore(folderInfo: FolderOnStore) {
    const folders = await getAllFolders();

    for (let i = 0; i < folders.length; i++) {
        if (folders[i].id === folderInfo.id ) {
            folders.splice(i, 1);
            break;
        }
    }
    await setFolders(folders);

    return folders
}

export async function getFolderPWD(folderInfo: FolderOnStore) {
    if (folderInfo.id === '0') {
        return [folderInfo]
        // return []
    }

    const pwd = [folderInfo]

    const folders = await getAllFolders();
    for (let i = 0; i < folders.length; i++) {
        if (folders[i].id === folderInfo.parentId ) {
            const parent = await getFolderPWD(folders[i]);
            return parent.concat(pwd);
        }
    }

    return pwd;
}

function setFolders(items) {
    return localforage.setItem(KEY_FOLDER, items);
}
