import {useCurrentAccount, useSignAndExecuteTransaction} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {SuiClient} from "@mysten/sui/client"
import {toast} from 'react-hot-toast';

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
    console.log(env)

    const suiClient = new SuiClient({url: FULL_NODE});

    const handleCreateManager = (handleSuccess, handleError) => {
        const tb = new Transaction();
        tb.setSender(account?.address);
        const payment = tb.splitCoins(tb.gas, [1000000]);

        tb.moveCall({
            target: `${MARKET_PACKAGE_ID}::manage::create_manager`,
            arguments: [
                tb.object(PLAYGROUND_ID),
                payment,
            ],
        })

        // 将PTB签名上链
        signAndExecuteTransaction({
            transaction: tb,
        }).then(async (resp) => {
            console.log('signAndExecuteTransaction', resp.digest)
            const res = await suiClient.waitForTransaction({
                digest: resp.digest,
                timeout: 10_000,
                options: {
                    showInput: true,
                    showEvents: true,
                    showObjectChanges: true,
                    showEffects: true,
                },
            });
            console.log('waitForTransaction', res, resp)
        })
        //     ,
        //     {
        //         onSuccess: (result: SuiTransactionBlockResponse) => {
        //             toast.success("success");
        //             reportTransactionEffects(result).then(resp=>{
        //                 console.log('effects', resp)
        //             })
        //             // result.objectChanges?.some((objCh) => {
        //             //     if (
        //             //         objCh.type === "created" &&
        //             //         objCh.objectType === `${PACKAGE_ID}::house_data::HouseData`
        //             //     ) {
        //             //         houseDataObjId = objCh.objectId;
        //             //         return true;
        //             //     }
        //             // });
        //             handleSuccess(result);
        //         },
        //         onError: (result) => {
        //             handleError(result);
        //         }
        //     },
        // );

    }

    return {
        handleCreateManager,
    }
}