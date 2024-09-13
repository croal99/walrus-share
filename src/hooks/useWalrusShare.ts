import {useCurrentAccount, useSignAndExecuteTransaction} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {SuiClient, getFullnodeUrl} from "@mysten/sui/client"
import {FileOnChain} from "@/types/FileOnChain.ts";

export const useWalrusShare = () => {
    const account = useCurrentAccount();
    const {mutateAsync: signAndExecuteTransaction} = useSignAndExecuteTransaction();

    const SUI_COIN = 1_00_000_000;

    // 配置信息
    const env = import.meta.env;
    const MARKET_PACKAGE_ID = env.VITE_MARKET_PACKAGE_ID;       // 合约
    const PLAYGROUND_ID = env.VITE_PLAYGROUND_ID;
    const SUI_NETWORK = env.VITE_PUBLIC_SUI_NETWORK;

    // console.log(env)

    const FULL_NODE = getFullnodeUrl(SUI_NETWORK);
    const suiClient = new SuiClient({url: FULL_NODE});
    const waitForTransaction = suiClient.waitForTransaction;

    const handleCreateManager = async (filename, media, hash, salt, blobId, share, fee, code) => {
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
                tb.pure.string(hash),
                tb.pure.string(salt),
                tb.pure.string(blobId),
                tb.pure.u64(share),
                tb.pure.u64(fee),
                tb.pure.string(code),
            ],
        })

        // 将PTB签名上链
        const {digest} = await signAndExecuteTransaction({
            transaction: tb,
        });
        // console.log('signAndExecuteTransaction', digest)

        const result = await suiClient.waitForTransaction({
            digest,
            timeout: 10_000,
            options: {
                showObjectChanges: true,
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

    const handlePayShareView = async (shareFile:FileOnChain) => {
        const tb = new Transaction();
        tb.setSender(account?.address);
        const payment = tb.splitCoins(tb.gas, [shareFile.fee]);

        tb.moveCall({
            target: `${MARKET_PACKAGE_ID}::manage::pay_share_view`,
            arguments: [
                payment,
                tb.pure.address(shareFile.owner),
            ],
        })

        // 将PTB签名上链
        const {digest} = await signAndExecuteTransaction({
            transaction: tb,
        });
        // console.log('signAndExecuteTransaction', digest)

        return digest;
    }

    return {
        account,
        SUI_COIN,
        handleCreateManager,
        handleGetShareFileObject,
        handlePayShareView,
        waitForTransaction,
    }
}