import {Link, Outlet, redirect, useLoaderData, useLocation, useRouteLoaderData} from "react-router-dom";
import {Box, Button, Container, Flex, Grid, Heading, Text, TextField} from "@radix-ui/themes";
import {HomeIcon, MagnifyingGlassIcon} from "@radix-ui/react-icons";
import {apiAuthProvider} from "@/hooks/useAuthStatus.ts";
import {getSetting} from "@/hooks/useLocalStore.ts";
import {ConnectButton, useCurrentAccount} from "@mysten/dapp-kit";
import SignIn from "@/components/user/signin.tsx";
import {useEffect} from "react";

import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";

export default function Layout() {
    const account = useCurrentAccount();

    useEffect(() => {
        getSetting().then(setting => {
            // console.log(setting);
        });

        return () => {
        }
    }, []);


    if (!account) {
        return <SignIn/>
    }

    return (
        <>
            <Flex direction="column" gap="3" p="4">
                <Box>
                    <Grid columns="2" align="center">
                        <Heading>Walrus Share</Heading>
                        <Flex justify="end" className="header">
                            <ConnectButton/>
                        </Flex>
                    </Grid>
                </Box>
                <Box>
                    <Outlet/>
                </Box>
            </Flex>
        </>
    );
}
