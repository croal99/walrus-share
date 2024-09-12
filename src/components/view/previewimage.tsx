import React, {useEffect, useState} from "react";
import {Button, Flex, Spinner} from "@radix-ui/themes";

export default function PreViewImage(
    {
        imageUrl,
        isDownload,
    }) {

    useEffect(() => {
    }, []);

    return (
        <>
            {imageUrl.length > 0 ?
                <Flex justify="center">
                    <img src={imageUrl} alt="" style={{maxHeight: '70vh'}}/>
                </Flex> :
                <Button>
                    <Spinner loading={isDownload}></Spinner> Loading...
                </Button>
            }
        </>
    )
}