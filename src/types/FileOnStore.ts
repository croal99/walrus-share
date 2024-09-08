export interface FileOnStore {
    id: string;
    name: string;
    blobId: string;
    mediaType: string;
    icon: string;
    size: number;
    parentId: string;
    password: string;
    salt: string;
    createAt: number;
}
