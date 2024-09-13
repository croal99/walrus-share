import {Blockquote, Box, Button, Card, Dialog, Flex, Progress, Spinner, Strong, Text} from "@radix-ui/themes";
import {Form} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {getSetting} from "@/hooks/useLocalStore.ts";
import {BlobOnWalrus, NewBlobOnWalrus} from "@/types/BlobOnWalrus.ts";
import {FileOnStore} from "@/types/FileOnStore.ts";
import {createFile} from "@/hooks/useFileStore.ts";
import axios from 'axios';
import {toast, Toaster} from "react-hot-toast";

import "@/styles/toast.css";

export default function UploadFile(
    {
        root,
        reFetchDir,
        uploadStep,
    }) {
    const [file, setFile] = useState();
    const [step, setStep] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isError, setIsError] = React.useState(false);
    const [isWarning, setIsWarning] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const readfile = (file) => {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => {
                resolve(fr.result)
            };
            fr.readAsArrayBuffer(file);
        });
    }

    const handleSubmit = async (event) => {
        // event.preventDefault()
        const setting = await getSetting();

        if (file.type.indexOf('image') == -1) {
            toast.error('Walrus Share can only share image files', {
                duration: 5000
            });
            setStep(0);
            return
        }

        setUploadProgress(0);
        setIsWarning(setting.publisher === "https://publisher-devnet.walrus.space");

        const blob = await readfile(file).catch(function (err) {
            console.error(err);
        });
        // return

        const plaintextbytes = new Uint8Array(blob);

        const pbkdf2iterations = 10000;
        const passphrasebytes = new TextEncoder("utf-8").encode(setting.walrusHash);
        const pbkdf2salt = new TextEncoder("utf-8").encode(setting.walrusSalt);

        const passphrasekey = await window.crypto.subtle.importKey(
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
            passphrasekey as CryptoKey,
            384
        ).catch(function (err) {
            console.error(err);
        });
        pbkdf2bytes = new Uint8Array(pbkdf2bytes);

        let keybytes = pbkdf2bytes.slice(0, 32);
        let ivbytes = pbkdf2bytes.slice(32);

        const key = await window.crypto.subtle.importKey(
            'raw',
            keybytes,
            {
                name: 'AES-CBC',
                length: 256
            },
            false,
            ['encrypt']
        ).catch(function (err) {
            console.error(err);
        });

        let cipherbytes = await window.crypto.subtle.encrypt(
            {
                name: "AES-CBC",
                iv: ivbytes
            },
            key as CryptoKey,
            plaintextbytes
        ).catch(function (err) {
            console.error(err);
        });

        cipherbytes = new Uint8Array(cipherbytes);

        const resultbytes = new Uint8Array(cipherbytes.length + 16);
        resultbytes.set(new TextEncoder("utf-8").encode('Salted__'));
        resultbytes.set(pbkdf2salt, 8);
        resultbytes.set(cipherbytes, 16);

        // 准备上传
        setStep(2);
        const publisherUrl = `${setting.publisher}/v1/store?epochs=1`;
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
            onUploadProgress: function (progressEvent) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        };
        axios.put(publisherUrl, resultbytes, config).then(response => {
            // console.log('store', response)
            setUploadProgress(0);
            let blobId: string;

            if (response.data.alreadyCertified) {
                blobId = (response.data.alreadyCertified as BlobOnWalrus).blobId
                toast.success("This file has already been uploaded")
            } else if (response.data.newlyCreated) {
                blobId = (response.data.newlyCreated as NewBlobOnWalrus).blobObject.blobId
                toast.success("Walrus file created successfully")
            } else {
                setUploadProgress(0);
                setStep(0);
                setMessage("Walrus's response is error.");
                setIsError(true);
                return;
            }

            const fileInfo: FileOnStore = {
                id: "",
                name: file.name,
                parentId: root.id,
                objectId: "",
                blobId: blobId,
                mediaType: file.type,
                icon: "",
                size: file.size,
                createAt: 0,
                password: setting.walrusHash,
                salt: setting.walrusSalt,
                share: 0,
                fee: 0,
                code: '',
            }

            // console.log('new file', fileInfo);
            createFile(fileInfo).then(() => {
                reFetchDir()
                setStep(0);
            });
        }).catch(error => {
            console.log('store error', error)
            setUploadProgress(0);
            setStep(0);
            setMessage('Please check your network configuration and make sure the Walrus service address is correct.');
            setIsError(true)
        })

    }

    useEffect(() => {
        setStep(uploadStep)

        return () => {
        }
    }, [uploadStep]);

    return (
        <>
            <Button onClick={() => {
                setStep(1)
            }}>Upload File</Button>

            <Dialog.Root open={step == 1}>
                <Dialog.Content maxWidth="550px">
                    <Dialog.Title>Step 1: ENCRYPT file</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        <Text>
                            Walrus Share uses javascript running within your web browser to encrypt and decrypt
                            files client-side, in-browser. This App makes no network connections during
                            this
                            process, to ensure that your keys never leave the web browser during
                            the
                            process.
                        </Text>
                        <Text>
                            All client-side cryptography is implemented using the Web Crypto API. Files
                            are encrypted using AES-CBC 256-bit symmetric encryption. The encryption key is
                            derived from the password and a random salt using PBKDF2 derivation with 10000
                            iterations of SHA256 hashing.

                        </Text>
                        <input type="file" onChange={(e) => {
                            setFile(e.target.files[0])
                        }}/>
                        <Button onClick={handleSubmit}>ENCRYPT</Button>
                        <Button variant="soft" onClick={()=>{setStep(0)}}>Cancel</Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root open={step == 2}>
                <Dialog.Content maxWidth="550px">
                    <Dialog.Title>Step 2: Upload encrypted files to Walrus Disk</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        {isWarning ?
                            <Card style={{background: 'var(--gray-a6)'}}>
                                <Flex direction="column" gap="3">
                                    <Text>
                                        The Walrus system provides an interface that can be used for public testing. For
                                        your
                                        convenience, walrus provide these at the following hosts:
                                    </Text>
                                    <Text>
                                        <Text weight="bold">Aggregator:</Text> https://aggregator-devnet.walrus.space
                                    </Text>
                                    <Text>
                                        <Text weight="bold">Publisher:</Text> https://publisher-devnet.walrus.space
                                    </Text>
                                    <Text color="red">
                                        Walrus publisher is currently limiting requests to <Strong>10 MiB</Strong>. If
                                        you want
                                        to upload larger
                                        files, you need to run your own publisher.
                                    </Text>
                                </Flex>
                            </Card> : null}
                        {uploadProgress < 100 ?
                            <Progress value={uploadProgress} style={{height:'32px'}}></Progress> :
                            <Button>
                                <Spinner loading></Spinner> Waiting Walrus response.
                            </Button>}
                    </Flex>

                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root open={isError}>
                <Dialog.Content maxWidth="450px">
                    <Dialog.Title>Network Error</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        <Text>
                            {message}
                        </Text>

                        <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                                <Button onClick={() => {
                                    setIsError(false)
                                }}>Close</Button>
                            </Dialog.Close>
                        </Flex>

                    </Flex>

                </Dialog.Content>
            </Dialog.Root>
        </>
    )
}