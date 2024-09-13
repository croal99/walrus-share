import {Outlet, useLoaderData} from "react-router-dom";
import {getFileByID} from "@/hooks/useFileStore.ts";
import {getSetting} from "@/hooks/useLocalStore.ts";
import React, {useEffect, useState} from "react";
import {getCurrentFolder} from "@/hooks/useFolderStore.ts";
import {useWalrusShare} from "@/hooks/useWalrusShare.ts";
import {FileOnChain} from "@/types/FileOnChain.ts";
import {Box, Button, Card, Flex, Grid, Heading, Spinner, Text, TextField, Dialog} from "@radix-ui/themes";
import BlobImage from "@/components/explorer/blobImage.tsx";
import PreViewImage from "@/components/view/previewimage.tsx";
import {ConnectButton} from "@mysten/dapp-kit";
import CodeView from "@/components/view/codeview.tsx";
import PayView from "@/components/view/payview.tsx";

export async function loader({params}) {
    const id = params.id;
    return {id};
}

export default function View() {
    const [shareFile, setShareFile] = useState<FileOnChain>({share: 3});

    const {id} = useLoaderData();
    const {handleGetShareFileObject} = useWalrusShare();

    const fetchData = async () => {
        // console.log('fetch data');
        const fileObject = await handleGetShareFileObject(id);
        fileObject.share = parseInt(String(fileObject.share))
        // console.log('share file', fileObject.share)
        setShareFile(fileObject);
    };

    useEffect(() => {
        fetchData().then(() => {
            // console.log('end fetch');
        });

        return () => {
        }
    }, []);

    switch (shareFile.share) {
        case 0:
            return (
                <PreViewImage
                    shareFile={shareFile}
                />
            )

        case 1:
            return (
                <CodeView
                    shareFile={shareFile}
                />
            )

        case 2:
            return (
                <PayView
                    shareFile={shareFile}
                />
            )
    }


    return (
        <>
            <Flex className="preview-container" gap="4">
                <Button>
                    <Spinner loading></Spinner> Loading...
                </Button>
            </Flex>
        </>
    )
}