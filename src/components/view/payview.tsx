import {Badge, Box, Button, Card, Flex, Spinner, Text, TextField} from "@radix-ui/themes";
import React, {useState} from "react";
import PreViewImage from "@/components/view/previewimage.tsx";
import {useWalrusShare} from "@/hooks/useWalrusShare.ts";
import {ConnectButton} from "@mysten/dapp-kit";

export default function PayView(
    {
        shareFile,
    }) {
    const [isConfirm, setIsConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [digest, setDigest] = useState('');

    const {account, SUI_COIN, handlePayShareView, waitForTransaction} = useWalrusShare();

    const paySUI = async () => {
        // return console.log(shareFile)

        setIsLoading(true)

        try {
            const digest =  await handlePayShareView(shareFile.owner);
            setDigest(digest)
            setIsConfirm(true)

        } catch (e) {
            alert(e)
        }

        setIsLoading(false)
    }
    return (
        <>
            {!isConfirm ?
                <Box className="login-container">
                    <Flex direction="column" gap="3">
                        <Card className="preview-form">
                            <Flex direction="column" gap="3">
                                <Text as="div" weight="bold" size="3" mb="1" align={'center'}>
                                    <img src="/images/logo.png" alt="" style={{height: '50px'}}/>
                                </Text>
                                <Text>
                                    In order to support the author in sharing his wonderful works, please
                                    pay <Badge variant="solid" color="orange"
                                               size="3">{(shareFile.fee / SUI_COIN).toString()} SUI</Badge> to view the
                                    pictures.
                                </Text>
                                <ConnectButton/>
                                {account ?
                                    <>
                                        {isLoading ?
                                            <Button>
                                                <Spinner loading></Spinner> Waiting SUI NET response.
                                            </Button> : <Button onClick={paySUI}>Pay for view</Button>
                                        }
                                    </>
                                    : null}
                                <Text size="1" align={'center'}>
                                    Version (20240904.test)
                                </Text>

                            </Flex>
                        </Card>
                    </Flex>
                </Box> :
                <PreViewImage
                    shareFile={shareFile}
                />
            }
        </>
    )
}