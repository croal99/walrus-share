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

export default function App() {
    const account = useCurrentAccount();
    const address = account?.address;
    const [isSignin, setIsSignIn] = useState(false);
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [folderList, setFolderList] = useState<FolderOnStore[]>([]);
    const [root, setRoot] = useState<FolderOnStore>();

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

    if (!isSignin) {
        return (
            <>
                <Box className="login-container">
                    <Flex direction="column" gap="3">
                        <Card className="login-form">
                            <Flex direction="column" gap="3">
                                <Text as="div" weight="bold" size="3" mb="1" align={'center'}>
                                    Walrus Share
                                </Text>
                                <Text>
                                    Walrus Share is a file sharing app based on the Walrus protocol. Walrus Share app
                                    can not only
                                    provide Walrus-based distributed storage, but also verify the sharing permissions of
                                    files. This ensures that the original file owner can gain benefits from file
                                    sharing.
                                </Text>

                                <Text size="1" mb="1" align={'center'}>
                                    Version (20240904.test)
                                </Text>
                            </Flex>
                        </Card>
                        {account ?
                            <Grid columns="1" gap="2">
                                <Button onClick={() => {
                                    setIsSignIn(true)
                                }}>Let's Share</Button>
                            </Grid>
                            : <ConnectButton/>}
                    </Flex>
                </Box>
            </>
        )

    }

    return (
        <>
            <Grid columns="1" p="4">
                <Heading align="center">Walrus Share</Heading>
                <Box>
                    <Grid columns="2" align="center">
                        <Box>
                            <UploadFile
                                root={root}
                                reFetchDir={fetchData}
                            />
                        </Box>
                        <Flex justify="end" p="4">
                            <ConnectButton/>
                        </Flex>
                    </Grid>
                </Box>
                <Flex direction="column" gap="3">
                    <Flex>
                    </Flex>
                    <Explorer
                        folders={folderList}
                        files={fileList}
                        removeFolder={removeFolder}
                        removeFile={removeFile}
                    />
                </Flex>

            </Grid>
        </>
    )
}
