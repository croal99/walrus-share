import React from "react";
import ReactDOM from "react-dom/client";

import {SuiClientProvider, WalletProvider} from "@mysten/dapp-kit";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Theme} from "@radix-ui/themes";
import App from "./App.tsx";
import {networkConfig} from "./hooks/networkConfig.ts";

import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";

const queryClient = new QueryClient();
console.log(import.meta.env)

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <Theme
        accentColor="mint"
        grayColor="gray"
        // panelBackground="solid"
        scaling="100%"
        radius="full"
        // appearance="dark"
        // accentColor="amber"
    >
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
                <WalletProvider autoConnect>
                    <App/>
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    </Theme>
    // </React.StrictMode>,
);
