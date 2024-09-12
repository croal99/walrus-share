import {Box, Button, Card, Flex, Grid, Text} from "@radix-ui/themes";
import {ConnectButton} from "@mysten/dapp-kit";

export default function SignIn() {
    return (
        <>
            <Box className="login-container">
                <Flex direction="column" gap="3">
                    <Card className="login-form">
                        <Flex direction="column" gap="3">
                            <Text as="div" weight="bold" size="3" mb="1" align={'center'}>
                                Walrus Share
                            </Text>
                            <Text>
                                Walrus Share is a file sharing app based on the Walrus protocol. Walrus Share app
                                can not only
                                provide Walrus-based distributed storage, but also verify the sharing permissions of
                                files. This ensures that the original file owner can gain benefits from file
                                sharing.
                            </Text>

                            <Text size="1" mb="1" align={'center'}>
                                Version (20240904.test)
                            </Text>
                        </Flex>
                    </Card>
                    <ConnectButton className="login-form-button"/>
                </Flex>
            </Box>
        </>
    )

}