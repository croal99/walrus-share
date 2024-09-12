import {Outlet, useLoaderData} from "react-router-dom";
import {getFileByID} from "@/hooks/useFileStore.ts";
import {getSetting} from "@/hooks/useLocalStore.ts";
import axios from "axios";
import React, {useEffect, useState} from "react";
import {getCurrentFolder} from "@/hooks/useFolderStore.ts";
import {useWalrusShare} from "@/hooks/useWalrusShare.ts";
import {FileOnChain} from "@/types/FileOnChain.ts";
import {Box, Button, Card, Flex, Grid, Heading, Spinner, Text, TextField, Dialog} from "@radix-ui/themes";
import BlobImage from "@/components/explorer/blobImage.tsx";
import PreViewImage from "@/components/view/previewimage.tsx";
import {ConnectButton} from "@mysten/dapp-kit";

export async function loader({params}) {
    const id = params.id;
    return {id};
}

export default function View() {
    const [isDownload, setIsDownload] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isConfirm, setIsConfirm] = useState(false);
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState("");
    const [shareCode, setShareCode] = useState("");
    const [shareFile, setShareFile] = useState<FileOnChain>({});

    const {id} = useLoaderData();
    const {handleGetShareFileObject} = useWalrusShare();
    const aggregatorURL = "https://aggregator-devnet.walrus.space"

    const handlePaySUI = async () => {
        setIsDownload(true)
        await new Promise((r) => setTimeout(r, 5000)); // fake delay
        setIsDownload(false)
        console.log('download')
    }
    const handleDownload = async (walrusFile: FileOnChain, view: boolean) => {
        // return console.log('download', walrusFile, view);
        if (!walrusFile) {
            return
        }

        setIsDownload(true);
        await new Promise((r) => setTimeout(r, 500)); // fake delay

        const txUrl = `${aggregatorURL}/v1/${walrusFile.blobId}`;
        axios.get(txUrl, {responseType: 'arraybuffer'}).then(async (res) => {
            let cipherbytes = new Uint8Array(res.data);

            let pbkdf2iterations = 10000;
            let passphrasebytes = new TextEncoder("utf-8").encode(walrusFile.salt);
            let pbkdf2salt = cipherbytes.slice(8, 16);

            let passphrasekey = await window.crypto.subtle.importKey(
                'raw',
                passphrasebytes,
                {name: 'PBKDF2'},
                false,
                ['deriveBits']
            ).catch(function (err) {
                console.error(err);
            });

            let pbkdf2bytes = await window.crypto.subtle.deriveBits(
                {
                    "name": 'PBKDF2',
                    "salt": pbkdf2salt,
                    "iterations": pbkdf2iterations,
                    "hash": 'SHA-256'
                },
                passphrasekey,
                384
            ).catch(function (err) {
                console.error(err);
            });
            pbkdf2bytes = new Uint8Array(pbkdf2bytes);

            let keybytes = pbkdf2bytes.slice(0, 32);
            let ivbytes = pbkdf2bytes.slice(32);
            cipherbytes = cipherbytes.slice(16);

            let key = await window.crypto.subtle.importKey(
                'raw',
                keybytes,
                {
                    name: 'AES-CBC',
                    length: 256
                },
                false,
                ['decrypt']
            ).catch(function (err) {
                console.error(err);
            });

            let plaintextbytes = await window.crypto.subtle.decrypt(
                {
                    name: "AES-CBC",
                    iv: ivbytes
                },
                key,
                cipherbytes
            ).catch(function (err) {
                console.error(err);
            });

            plaintextbytes = new Uint8Array(plaintextbytes);

            const blob = new Blob([plaintextbytes], {type: shareFile.media});
            const blobUrl = URL.createObjectURL(blob);

            if (!view) {
                const tempLink = document.createElement("a");
                tempLink.href = blobUrl;
                tempLink.setAttribute(
                    "download",
                    shareFile.filename,
                )
                document.body.appendChild(tempLink);
                tempLink.click();

                document.body.removeChild(tempLink);
                URL.revokeObjectURL(blobUrl);
            } else {
                setImageUrl(blobUrl);
            }

            setIsDownload(false);
        }).catch(error => {
            console.log('store error', error)
            setMessage('Please check your network configuration and make sure the Walrus service address is correct.');
            setIsError(true)
            setIsDownload(false);
        })
    }

    const checkShareCode = async () => {
        if (shareCode == "aaa") {
            setIsConfirm(true)
            await handleDownload(shareFile, true)
        }
    }

    const fetchData = async () => {
        console.log('fetch data');
        const fileObject = await handleGetShareFileObject(id);
        setShareFile(fileObject);
    };

    useEffect(() => {
        fetchData().then(() => {
            console.log('end fetch');
        });

        return () => {
        }
    }, []);


    return (
        <>
            <Flex direction="column" gap="4" p="4">
                <Box>
                    <Grid columns="2" align="center">
                        <Heading>Walrus Share</Heading>
                        <Flex justify="end" className="header">
                            <ConnectButton/>
                        </Flex>
                    </Grid>
                </Box>
                {isConfirm ?
                    <>
                        <Flex>
                            {/*<Button disabled={isDownload} onClick={() => handleDownload(shareFile, false)}>*/}
                            {/*    <Spinner loading={isDownload}></Spinner> Download*/}
                            {/*</Button>*/}
                            <Dialog.Root>
                                <Dialog.Trigger>
                                    <Button>Download</Button>
                                </Dialog.Trigger>

                                <Dialog.Content maxWidth="450px">
                                    <Dialog.Title>Download {shareFile.filename}</Dialog.Title>
                                    <Dialog.Description size="2" mb="4">
                                    </Dialog.Description>

                                    <Flex direction="column" gap="4">
                                        <Text>
                                            In order to better support the author in sharing his wonderful works, please
                                            pay 1SUI to download the pictures.
                                        </Text>
                                        {isDownload ?
                                            <Button>
                                                <Spinner loading></Spinner> Waiting SUI NET response.
                                            </Button> :
                                            <Button onClick={handlePaySUI} color="red">
                                                Pay for download
                                            </Button>
                                        }
                                    </Flex>

                                    <Flex gap="3" mt="4" direction="column">
                                        <Dialog.Close>
                                            <Button>
                                                Close
                                            </Button>
                                        </Dialog.Close>
                                    </Flex>
                                </Dialog.Content>
                            </Dialog.Root>
                        </Flex>


                        <Flex className="preview-container">
                            <PreViewImage
                                imageUrl={imageUrl}
                            />
                        </Flex>
                    </> :
                    <Box className="login-container">
                        <Flex direction="column" gap="3">
                            <Card className="preview-form">
                                <Flex direction="column" gap="3">
                                    <Text as="div" weight="bold" size="3" mb="1" align={'center'}>
                                        Walrus Share
                                    </Text>
                                    <Text>
                                        Please enter the share code
                                    </Text>
                                    <TextField.Root
                                        style={{width: "100%"}}
                                        onChange={event => {
                                            setShareCode(event.target.value)
                                        }}
                                    />
                                    <Button onClick={checkShareCode}>View</Button>
                                    <Text size="1" align={'center'}>
                                        Version (20240904.test)
                                    </Text>

                                </Flex>
                            </Card>
                        </Flex>
                    </Box>
                }
            </Flex>
        </>
    )
}