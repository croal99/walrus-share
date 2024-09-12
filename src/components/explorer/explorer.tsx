import React, {useEffect, useState} from "react";
import {Box, Button, Card, Flex, Text, Dialog, TextField, Table, Inset, Strong, Spinner} from "@radix-ui/themes";
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
import CryptoJS from "crypto-js"

import type {FolderOnStore} from "@/types/FolderOnStore.ts";
import type {FileOnStore} from "@/types/FileOnStore.ts";
import Detail from "@/components/explorer/detail.tsx";

import {humanFileSize} from "@/utils/formatSize.ts";
import {getSetting} from "@/hooks/useLocalStore.ts";
import {useWalrusShare} from "@/hooks/useWalrusShare.ts";
import copy from "copy-to-clipboard";


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
    const [currentFile, setCurrentFile] = useState<FileOnStore>({});

    const {handleCreateManager} = useWalrusShare();

    const paySUI = async () => {
        console.log('pay sui', currentFile)
        setIsLoading(true);

        try {
            const objectId = await handleCreateManager(currentFile.name, currentFile.mediaType, currentFile.password, currentFile.blobId)
            console.log('create manager', objectId);
            currentFile.objectId = objectId;
            await updateFileStore(currentFile);
            reFetch();

            setStep(2)
        } catch (e) {
            alert(e)
        }
        setIsLoading(false)
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
                                                <Button color="blue" style={{width: 75}} onClick={() => {
                                                    setCurrentFile(item)
                                                    setStep(1)
                                                }}>Protect</Button> :
                                                <Button color="green" style={{width: 75}} onClick={() => {
                                                    setCurrentFile(item)
                                                    setStep(2)
                                                }}>Link</Button>}

                                        </Flex>


                                    </Table.Cell>
                                </Table.Row>
                            ))}

                        </Table.Body>
                    </Table.Root>

                </Card>
            </Flex>

            <Dialog.Root open={step == 1}>
                <Dialog.Content maxWidth="450px">
                    <Dialog.Title>Protect file with Walrus-Share Contract</Dialog.Title>
                    <Dialog.Description>
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        <Text>
                            You need to pay 1 SUI coin to create a contract.
                        </Text>
                        <Text>
                            After you pay, you can share your files through the Walrus Share application.
                        </Text>
                        <Text>
                            When users download your shared files, you will receive the SUI coin paid by the user.
                        </Text>
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
                    <Dialog.Title>Share file "{currentFile.name}"</Dialog.Title>
                    <Dialog.Description>
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        <Flex align="center" gap="3">

                        </Flex>
                        <Text>
                            Share URL
                        </Text>
                        <TextField.Root style={{width: "100%"}}
                                        defaultValue={`${window.location.href}view/${currentFile.objectId}`}
                        />
                        <Text>
                            When users download your shared files, you will receive the SUI coin paid by the user.
                        </Text>
                        <Flex gap="3" mt="4" justify="end">
                            <Button onClick={() => {
                                setStep(0)
                            }}>Close</Button>
                            <Button onClick={() => {
                                copy(`${window.location.href}view/${currentFile.objectId}`)
                            }} color="red">Copy link</Button>
                        </Flex>
                    </Flex>

                </Dialog.Content>
            </Dialog.Root>

        </>
    );
}

