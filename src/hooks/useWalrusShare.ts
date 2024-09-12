import {useCurrentAccount, useSignAndExecuteTransaction} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {SuiClient} from "@mysten/sui/client"
import {FileOnChain} from "@/types/FileOnChain.ts";

export const useWalrusShare = () => {
    const account = useCurrentAccount();

    // const {mutate: signAndExecuteTransaction} = useSignAndExecuteTransaction();
    // const {mutate: signAndExecuteTransaction, mutateAsync: reportTransactionEffects} = useSignAndExecuteTransaction();
    const {mutateAsync: signAndExecuteTransaction} = useSignAndExecuteTransaction();

    // 配置信息
    const env = import.meta.env;
    const MARKET_PACKAGE_ID = env.VITE_MARKET_PACKAGE_ID;       // 合约
    const PLAYGROUND_ID = env.VITE_PLAYGROUND_ID;
    const FULL_NODE = env.VITE_PUBLIC_SUI_NETWORK;
    // console.log(env)

    const suiClient = new SuiClient({url: FULL_NODE});

    const handleCreateManager = async (filename, media, salt, blobId) => {
        const tb = new Transaction();
        tb.setSender(account?.address);
        const payment = tb.splitCoins(tb.gas, [1_000_000]);

        tb.moveCall({
            target: `${MARKET_PACKAGE_ID}::manage::create_manager`,
            arguments: [
                tb.object(PLAYGROUND_ID),
                payment,
                tb.pure.string(filename),
                tb.pure.string(media),
                tb.pure.string(salt),
                tb.pure.string(blobId),
            ],
        })

        // 将PTB签名上链
        const {digest} = await signAndExecuteTransaction({
            transaction: tb,
        });

        const result = await suiClient.waitForTransaction({
            digest,
            timeout: 10_000,
            options: {
                // showInput: true,
                // showEvents: true,
                showObjectChanges: true,
                // showEffects: true,
            },
        });
        // console.log('waitForTransaction', result)

        let fileObjectID = ''
        result.objectChanges?.some((objCh) => {
            if (
                objCh.type === "created" &&
                objCh.objectType === `${MARKET_PACKAGE_ID}::filestore::ShareFile`
            ) {
                fileObjectID = objCh.objectId;
                return;
            }
        });

        return fileObjectID;
    }

    const handleGetShareFileObject = async (id) => {
        const res = await suiClient.getObject({
            id,
            options: {
                showContent: true,
            }
        })

        // console.log('shareFile object', res.data.content.fields);

        return res.data.content.fields as FileOnChain;

    }

    return {
        handleCreateManager,
        handleGetShareFileObject,
    }
}