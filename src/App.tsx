import {ConnectButton, useCurrentAccount} from "@mysten/dapp-kit";

import '@mysten/dapp-kit/dist/index.css';
import {Box, Button, Card, Flex, Grid, Heading, Text} from "@radix-ui/themes";
import {Theme} from "@radix-ui/themes";
import {useEffect, useState} from "react";
import {FolderOnStore} from "@/types/FolderOnStore.ts";
import {FileOnStore} from "@/types/FileOnStore.ts";
import {getChildFiles, getFilesByType, removeFileStore} from "@/hooks/useFileStore.ts";
import Explorer from "@/components/explorer/explorer.tsx";
import {getCurrentFolder} from "@/hooks/useFolderStore.ts";
import UploadFile from "@/components/explorer/uploadFile.tsx";
import {useWalrusShare} from "@/hooks/useWalrusShare.ts";

export default function App() {
    const account = useCurrentAccount();
    // console.log('app address', account?.address)

    const [isSignin, setIsSignIn] = useState(false);
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [folderList, setFolderList] = useState<FolderOnStore[]>([]);
    const [root, setRoot] = useState<FolderOnStore>();

    const {handleCreateManager} = useWalrusShare();

    const debug = () => {
        handleCreateManager(handleSuccess, handleError)
    }

    const handleSuccess = (result) => {
        console.log('success', result)
    }

    const handleError = (result) => {
        console.log('error', result)
    }

    const removeFolder = async (folderInfo: FolderOnStore) => {
    }

    const removeFile = async (fileInfo: FileOnStore) => {
        await removeFileStore(fileInfo);
        await fetchFiles("0");
    }

    const fetchFiles = async (parentId) => {
        const list = await getChildFiles(parentId)
        setFileList(list);
    }

    const fetchData = async () => {
        console.log('fetch data');
        const path = await getCurrentFolder("");
        await fetchFiles("0")
        setRoot(path)
    };

    useEffect(() => {
        if (!account) {
            setIsSignIn(false)
            return () => {
            }
        }
        fetchData().then(() => {
            console.log('end fetch');
        });

        return () => {
        }
    }, [account]);

    return (
        <>
            <Flex direction="column" gap="3">
                <Flex gap="3">
                    <UploadFile
                        root={root}
                        reFetchDir={fetchData}
                    />
                    <Button onClick={debug}>Debug</Button>
                </Flex>
                <Explorer
                    folders={folderList}
                    files={fileList}
                    removeFolder={removeFolder}
                    removeFile={removeFile}
                />
            </Flex>
        </>
    )
}
