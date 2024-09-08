import {Button, Dialog, Flex, IconButton, Spinner, Strong, Text} from "@radix-ui/themes";
import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import {FileOnStore} from "@/types/FileOnStore.ts";
import {getSetting} from "@/hooks/useLocalStore.ts";
import axios from "axios";
import BlobImage from "@/components/explorer/blobImage.tsx";
import {humanFileSize} from "@/utils/formatSize.ts";

export default function Detail({walrusFile}) {
    const [isDownload, setIsDownload] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isError, setIsError] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const handleDownload = async (view: boolean) => {
        // console.log('download', walrusFile);
        const setting = await getSetting();

        setIsDownload(true);
        // await new Promise((r) => setTimeout(r, 500)); // fake delay

        const txUrl = `${setting.aggregator}/v1/${walrusFile.blobId}`;
        axios.get(txUrl, { responseType: 'arraybuffer' }).then(async (res) => {
            let cipherbytes = new Uint8Array(res.data);

            let pbkdf2iterations = 10000;
            let passphrasebytes = new TextEncoder("utf-8").encode(setting.walrusHash);
            let pbkdf2salt = cipherbytes.slice(8, 16);

            let passphrasekey = await window.crypto.subtle.importKey('raw', passphrasebytes, {name: 'PBKDF2'}, false, ['deriveBits'])
                .catch(function (err) {
                    console.error(err);
                });

            let pbkdf2bytes = await window.crypto.subtle.deriveBits({
                "name": 'PBKDF2',
                "salt": pbkdf2salt,
                "iterations": pbkdf2iterations,
                "hash": 'SHA-256'
            }, passphrasekey, 384)
                .catch(function (err) {
                    console.error(err);
                });
            pbkdf2bytes = new Uint8Array(pbkdf2bytes);

            let keybytes = pbkdf2bytes.slice(0, 32);
            let ivbytes = pbkdf2bytes.slice(32);
            cipherbytes = cipherbytes.slice(16);

            let key = await window.crypto.subtle.importKey('raw', keybytes, {
                name: 'AES-CBC',
                length: 256
            }, false, ['decrypt'])
                .catch(function (err) {
                    console.error(err);
                });

            let plaintextbytes = await window.crypto.subtle.decrypt({
                name: "AES-CBC",
                iv: ivbytes
            }, key, cipherbytes)
                .catch(function (err) {
                    console.error(err);
                });

            plaintextbytes = new Uint8Array(plaintextbytes);

            const blob = new Blob([plaintextbytes], {type: walrusFile.mediaType});
            const blobUrl = URL.createObjectURL(blob);

            if (!view) {
                const tempLink = document.createElement("a");
                tempLink.href = blobUrl;
                tempLink.setAttribute(
                    "download",
                    walrusFile.name,
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

    useEffect(() => {
        // console.log('detail');
        setIsDownload(false);
        setImageUrl("");

    }, [walrusFile]);

    return (
        <>
            <Dialog.Root>
                <Dialog.Trigger>
                    <Button>Detail</Button>
                </Dialog.Trigger>

                <Dialog.Content maxWidth="600px">
                    <Dialog.Title>{walrusFile.name}</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                    </Dialog.Description>


                    <Flex direction="column" gap="3">
                        <Text><Strong>type: </Strong>{walrusFile.mediaType}</Text>
                        <Text><Strong>blobId: </Strong>{walrusFile.blobId}</Text>
                        <Text><Strong>size: </Strong>{humanFileSize(walrusFile.size)}</Text>
                        <Text><Strong>create at: </Strong>{dayjs(walrusFile.createAt).format('YYYY/MM/DD HH:mm:ss')}
                        </Text>
                        {walrusFile.mediaType.indexOf("image") != -1 ?
                            <BlobImage
                                imageUrl={imageUrl}
                                isDownload={isDownload}
                                handleDownload={handleDownload}
                            />
                            : null}
                        <Button disabled={isDownload} onClick={() => handleDownload(false)}>
                            <Spinner loading={isDownload}></Spinner> Download
                        </Button>
                        <Dialog.Close>
                            <Button>Close</Button>
                        </Dialog.Close>
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