import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFaucetHost, requestSuiFromFaucetV1 } from '@mysten/sui/faucet';
import { MIST_PER_SUI } from '@mysten/sui/utils';

// replace <YOUR_SUI_ADDRESS> with your actual address, which is in the form 0x123...
const MY_ADDRESS = '0x6f25929f026483a440f5f16e03661087eb41604528050b989f48624b049c4b78';

// create a new SuiClient object pointing to the network you want to use
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

// Convert MIST to Sui
const balance = (balance) => {
    return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
};

// store the JSON representation for the SUI the address owns before using faucet
const suiBefore = await suiClient.getBalance({
    owner: MY_ADDRESS,
});

await requestSuiFromFaucetV1({
    // use getFaucetHost to make sure you're using correct faucet address
    // you can also just use the address (see Sui TypeScript SDK Quick Start for values)
    host: getFaucetHost('testnet'),
    recipient: MY_ADDRESS,
});

// store the JSON representation for the SUI the address owns after using faucet
const suiAfter = await suiClient.getBalance({
    owner: MY_ADDRESS,
});

// Output result to console.
console.log(
    `Balance before faucet: ${balance(suiBefore)} SUI. Balance after: ${balance(
        suiAfter,
    )} SUI. Hello, SUI!`,
);