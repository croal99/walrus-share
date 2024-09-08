import React, {useEffect, useState} from "react";
import {Button, Flex, Spinner} from "@radix-ui/themes";

export default function BlobImage(
    {
        imageUrl,
        isDownload,
        handleDownload,
    }) {
    useEffect(() => {
        // console.log('BlobImage', isDownload);
    }, []);

    if (imageUrl.length>0) {
        return (
            <>
                <Flex justify="center">
                    <img src={imageUrl} alt="" style={{maxWidth: 320}}/>
                </Flex>
            </>
        )
    }

    return (
        <>
            <Button disabled={isDownload} onClick={()=>handleDownload(true)}>
                <Spinner loading={isDownload}></Spinner> View
            </Button>
        </>
    )
}