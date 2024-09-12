import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
    Flex,
    Text,
    Dialog,
    TextField,
    Table,
    Inset,
    Strong,
    Spinner,
    Select,
    Grid, Radio, Badge, Code
} from "@radix-ui/themes";
import {
    createFile,
    getChildFiles,
    removeFileStore, updateFileStore
} from "@/hooks/useFileStore.ts";
import {
    checkFolderIsExist,
    createFolder,
    getChildFolders,
    getCurrentFolder, getFolderPWD,
    removeFolderStore
} from "@/hooks/useFolderStore.ts";
import dayjs from "dayjs";
import copy from "copy-to-clipboard";

import type {FolderOnStore} from "@/types/FolderOnStore.ts";
import type {FileOnStore} from "@/types/FileOnStore.ts";
import Detail from "@/components/explorer/detail.tsx";

import {humanFileSize} from "@/utils/formatSize.ts";
import {getSetting} from "@/hooks/useLocalStore.ts";
import {useWalrusShare} from "@/hooks/useWalrusShare.ts";


export default function Explorer(
    {
        folders,
        files,
        removeFolder,
        removeFile,
        reFetch,
    }) {
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [folderList, setFolderList] = useState<FolderOnStore[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [shareType, setShareType] = useState(0);
    const [shareFee, setShareFee] = useState("");
    const [currentFile, setCurrentFile] = useState<FileOnStore>({});
    const [shareDescritioin, setShareDescritioin] = useState('');

    const {handleCreateManager} = useWalrusShare();
    const SUI_COIN = 1_000_000_000;

    const paySUI = async () => {
        // return console.log('pay sui', currentFile)
        setIsLoading(true);

        try {
            const objectId = await handleCreateManager(
                currentFile.name,
                currentFile.mediaType,
                currentFile.password,
                currentFile.salt,
                currentFile.blobId,
                currentFile.share,
                currentFile.fee,
                currentFile.code,
            )
            // console.log('create manager', objectId);
            currentFile.objectId = objectId;
            await updateFileStore(currentFile);
            reFetch();

            showShareLink(currentFile)
        } catch (e) {
            alert(e)
        }
        setIsLoading(false)
    }

    const showShareLink = (fileInfo: FileOnStore) => {
        // console.log('share', fileInfo)

        switch (fileInfo.share) {
            case 0:
                setShareDescritioin("It's Free. Anyone can view the files you share.");
                break;
            case 1:
                setShareDescritioin("Users use the sharing code to view the files you share.");
                break;
            case 2:
                setShareDescritioin("Users need to pay SUI coin to view the files you share.");
                break;
        }
        setCurrentFile(fileInfo)
        setStep(2)
    }

    useEffect(() => {
        setFolderList(folders)

    }, [folders]);

    useEffect(() => {
        setFileList(files)

    }, [files]);

    return (
        <>
            <Flex gap="3" direction="column">
                <Card style={{background: 'var(--gray-a6)'}}>
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Create</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {folderList.map((item, index) => (
                                <Table.Row key={index} align="center">
                                    <Table.RowHeaderCell>
                                        <Flex align="center">
                                            <img src='@images/folder.png' alt="" style={{height: '32px'}}/>
                                        </Flex>
                                    </Table.RowHeaderCell>
                                    <Table.Cell>
                                        {dayjs(item.createAt).format('YYYY/MM/DD')}
                                    </Table.Cell>
                                    <Table.Cell></Table.Cell>
                                    <Table.Cell>
                                        <Dialog.Root>
                                            <Dialog.Trigger>
                                                <Button color="red">Delete</Button>
                                            </Dialog.Trigger>

                                            <Dialog.Content maxWidth="450px">
                                                <Dialog.Title>Delete Folder</Dialog.Title>
                                                <Dialog.Description size="2" mb="4">
                                                </Dialog.Description>

                                                <Flex direction="column" gap="3">
                                                    <Text size="3">
                                                        Are you sure you want to delete the folder:
                                                    </Text>
                                                    <Text size="3" mb="1" weight="bold">
                                                        <Strong>{item.name}</Strong>
                                                    </Text>

                                                </Flex>

                                                <Flex gap="3" mt="4" justify="end">
                                                    <Dialog.Close>
                                                        <Button variant="soft" color="gray">
                                                            Cancel
                                                        </Button>
                                                    </Dialog.Close>
                                                    <Dialog.Close>
                                                        <Button color="red"
                                                                onClick={() => removeFolder(item)}>
                                                            Delete
                                                        </Button>
                                                    </Dialog.Close>
                                                </Flex>
                                            </Dialog.Content>
                                        </Dialog.Root>

                                    </Table.Cell>
                                </Table.Row>
                            ))}

                            {fileList.map((item, index) => (
                                <Table.Row key={index}>
                                    <Table.RowHeaderCell>
                                        <Flex align="center" gap="2">
                                            <img src={`/images/${item.icon}`} alt="" style={{height: '32px'}}/>
                                            {item.name}
                                        </Flex>
                                    </Table.RowHeaderCell>
                                    <Table.Cell
                                        style={{width: 250}}>{dayjs(item.createAt).format('YYYY/MM/DD HH:mm:ss')}</Table.Cell>
                                    <Table.Cell style={{width: 150}}>{humanFileSize(item.size)}</Table.Cell>
                                    <Table.Cell style={{width: 100}}>
                                        <Flex gap="3">
                                            <Dialog.Root>
                                                <Dialog.Trigger>
                                                    <Button color="red" style={{width: 75}}>Delete</Button>
                                                </Dialog.Trigger>

                                                <Dialog.Content maxWidth="450px">
                                                    <Dialog.Title>Delete File</Dialog.Title>
                                                    <Dialog.Description size="2" mb="4">
                                                    </Dialog.Description>

                                                    <Flex direction="column" gap="3">
                                                        <Text size="3">
                                                            Are you sure you want to delete the file:
                                                        </Text>
                                                        <Text size="3" mb="1" weight="bold">
                                                            <Strong>{item.name}</Strong>
                                                        </Text>

                                                    </Flex>

                                                    <Flex gap="3" mt="4" justify="end">
                                                        <Dialog.Close>
                                                            <Button variant="soft" color="gray">
                                                                Cancel
                                                            </Button>
                                                        </Dialog.Close>
                                                        <Dialog.Close>
                                                            <Button color="red"
                                                                    onClick={() => removeFile(item)}>
                                                                Delete
                                                            </Button>
                                                        </Dialog.Close>
                                                    </Flex>
                                                </Dialog.Content>
                                            </Dialog.Root>

                                            <Detail
                                                walrusFile={item}
                                            />

                                            {item.objectId == "" ?
                                                <Button color="blue" style={{width: 75}}
                                                        onClick={() => {
                                                            // 因为是初始化文件，所以所有file的share=0
                                                            setCurrentFile(item);
                                                            setShareType(0);
                                                            setStep(1);
                                                        }}>Protect
                                                </Button> :
                                                <Button color="green" style={{width: 75}}
                                                        onClick={() => showShareLink(item)}>Link
                                                </Button>}

                                        </Flex>


                                    </Table.Cell>
                                </Table.Row>
                            ))}

                        </Table.Body>
                    </Table.Root>

                </Card>
            </Flex>

            <Dialog.Root open={step == 1}>
                <Dialog.Content maxWidth="500px">
                    <Dialog.Title>Protect file with Walrus-Share Contract</Dialog.Title>
                    <Dialog.Description>
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        <Text>
                            You need to pay <Badge color="orange" size="3">1 SUI</Badge> coin to create a contract.
                        </Text>
                        <Text>
                            After you pay, you can share your files through the Walrus Share application.
                        </Text>
                        <Text>
                            When a user views the file you shared, the user will pay or unlock it according to the
                            sharing method you set.
                        </Text>
                        <Text size="4" weight="bold">Select share method</Text>
                        <Card>
                            <Grid columns="2" gap="3">
                                <Flex gap="2" align="center">
                                    <Radio name="shareType" value="0" defaultChecked
                                           onChange={event => {
                                               currentFile.share = parseInt(event.target.value);
                                               currentFile.code = '';
                                               currentFile.fee = 0;
                                               setShareFee("");
                                               setShareType(currentFile.share);
                                               setCurrentFile(currentFile);
                                           }}/>
                                    <Text as="label" size="2">Free</Text>
                                </Flex>
                                <Flex>
                                </Flex>

                                <Flex gap="2" align="center">
                                    <Radio name="shareType" value="1"
                                           onChange={event => {
                                               currentFile.share = parseInt(event.target.value);
                                               currentFile.code = Math.random().toString(36).substring(2, 6);
                                               currentFile.fee = 0;
                                               setShareFee("");
                                               setShareType(currentFile.share);
                                               setCurrentFile(currentFile)
                                           }}/>
                                    <Text as="label" size="2">Code</Text>
                                </Flex>
                                <Flex>
                                    <TextField.Root
                                        disabled={shareType != 0}
                                        defaultValue={currentFile.code}
                                        onChange={event => {
                                            currentFile.code = event.target.value
                                        }}
                                    />
                                </Flex>

                                <Flex gap="2" align="center">
                                    <Radio name="shareType" value="2"
                                           onChange={event => {
                                               currentFile.share = parseInt(event.target.value);
                                               currentFile.code = '';
                                               currentFile.fee = 0.1 * SUI_COIN;
                                               setShareFee("0.1");
                                               setShareType(currentFile.share);
                                               setCurrentFile(currentFile);
                                           }}
                                    />
                                    <Text as="label" size="2">Pay</Text>
                                </Flex>
                                <Flex align="center" gap="2">
                                    <TextField.Root
                                        disabled={shareType != 2}
                                        defaultValue={shareFee}
                                        onChange={event => {
                                            currentFile.code = ''
                                            currentFile.fee = parseFloat(event.target.value) * SUI_COIN
                                        }}
                                    />SUI
                                </Flex>
                            </Grid>


                        </Card>

                        {isLoading ?
                            <Button>
                                <Spinner loading></Spinner> Waiting SUI NET response.
                            </Button> :
                            <Flex gap="3" mt="4" justify="end">
                                <Button onClick={() => {
                                    setStep(0)
                                }}>Close</Button>
                                <Button onClick={() => paySUI()} color="red" style={{width: 70}}>Pay</Button>
                            </Flex>
                        }
                    </Flex>

                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root open={step == 2}>
                <Dialog.Content maxWidth="550px">
                    <Dialog.Title>Share info of "{currentFile.name}"</Dialog.Title>
                    <Dialog.Description>
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        <Flex gap="3"></Flex>
                        <Text>Share URL</Text>
                        <Card>
                            {`${window.location.href}view/${currentFile.objectId}`}
                        </Card>
                        <Text>Share Type</Text>
                        <Text>{shareDescritioin}</Text>
                        {currentFile.share==1?
                            <Flex align="center" gap="3">
                                <Text>Share Code</Text>
                                <Button>{currentFile.code}</Button>
                            </Flex>:null
                        }
                        {currentFile.share==2?
                            <Flex align="center" gap="3">
                                <Text>Payment</Text>
                                <Button>{(currentFile.fee / SUI_COIN).toString()}</Button>
                                <Text>SUI</Text>
                            </Flex>:null
                        }
                        <Flex gap="3"></Flex>
                        <Flex direction="column">
                            <Button
                                onClick={() => {
                                    copy(`${window.location.href}view/${currentFile.objectId}`)
                                    setStep(0)
                                }}
                            >Copy link</Button>
                        </Flex>
                    </Flex>

                </Dialog.Content>
            </Dialog.Root>

        </>
    );
}

