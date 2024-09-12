import React, {useEffect, useState} from "react";
import {Box, Button, Flex, Grid, Heading, Spinner} from "@radix-ui/themes";
import {ConnectButton} from "@mysten/dapp-kit";
import {FileOnChain} from "@/types/FileOnChain.ts";

import axios from "axios";
import {Link} from "react-router-dom";

export default function PreViewImage(
    {
        shareFile,
    }) {
    const [isDownload, setIsDownload] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const aggregatorURL = "https://aggregator-devnet.walrus.space"

    const handleDownload = async (walrusFile: FileOnChain, view: boolean) => {
        // return console.log('download', walrusFile, view);
        if (!walrusFile) {
            return
        }

        setIsDownload(true);
        await new Promise((r) => setTimeout(r, 5000)); // fake delay

        const txUrl = `${aggregatorURL}/v1/${walrusFile.blobId}`;
        axios.get(txUrl, {responseType: 'arraybuffer'}).then(async (res) => {
            let cipherbytes = new Uint8Array(res.data);

            let pbkdf2iterations = 10000;
            let passphrasebytes = new TextEncoder("utf-8").encode(walrusFile.hash);
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

    const fetchData = async () => {
        await handleDownload(shareFile, true)
    }

    useEffect(() => {
        fetchData().then(() => {
            // console.log('end fetch');
        });

        return () => {
        }
    }, [shareFile]);

    return (
        <>
            <Flex direction="column" gap="4" p="4">
                <Box>
                    <Grid columns="2" align="center">
                        <Heading><Link to="/" style={{textDecoration: 'none'}}>Walrus Share</Link></Heading>
                        <Flex justify="end" className="header">
                        </Flex>
                    </Grid>
                </Box>

                <Flex>
                </Flex>

                <Flex className="preview-container" gap="4">

                    {isDownload ?
                        <Button>
                            <Spinner loading={isDownload}></Spinner> Loading...
                        </Button> :
                        <>
                            <Button disabled={isDownload} onClick={() => handleDownload(shareFile, false)}>
                                <Spinner loading={isDownload}></Spinner> Download
                            </Button>
                            <Flex justify="center">
                                <img src={imageUrl} alt="" style={{maxHeight: '70vh'}}/>
                            </Flex>
                        </>
                    }
                </Flex>
            </Flex>
        </>
    )
}