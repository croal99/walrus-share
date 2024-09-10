
import {createNetworkConfig, SuiClientProvider, WalletProvider} from '@mysten/dapp-kit';
import {getFullnodeUrl} from '@mysten/sui/client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import Home from "@/components/home/home.tsx";
import ReactDOM from "react-dom/client";
import {Box, Flex, Theme} from "@radix-ui/themes";
import React from "react";
import {useCurrentAccount} from "@mysten/dapp-kit";
import {createBrowserRouter, Link, Outlet, RouterProvider} from "react-router-dom";
import Layout from "@/layout/layout.tsx";
import App from "@/App.tsx";

// Config options for the networks you want to connect to
const {networkConfig} = createNetworkConfig({
    localnet: {url: getFullnodeUrl('localnet')},
    mainnet: {url: getFullnodeUrl('mainnet')},
});
const queryClient = new QueryClient();

const router = createBrowserRouter([
        {
            id: "root",
            path: "/",
            Component: Layout,

            children: [
                {
                    // path: "home",
                    index: true,
                    Component: App,
                },
                {
                    path: "home",
                    Component: Home,
                },
            ],
        },
    ]
);

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <Theme
        // appearance="light"
        // accentColor="grass"
        // grayColor="gray"
        appearance="light"
        accentColor="amber"
        panelBackground="solid"
        scaling="100%"
        radius="full"
    >
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="localnet">
                <WalletProvider>
                    <RouterProvider router={router} />
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>

    </Theme>
    // </React.StrictMode>
);