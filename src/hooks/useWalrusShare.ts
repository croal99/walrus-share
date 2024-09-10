import {useCurrentAccount, useSignAndExecuteTransaction} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";

export const useWalrusShare = () => {
    const account = useCurrentAccount();

    const {mutate: signAndExecuteTransaction} = useSignAndExecuteTransaction();

    // 配置信息
    const env = import.meta.env;
    const MARKET_PACKAGE_ID = env.VITE_MARKET_PACKAGE_ID;       // 合约
    const PLAYGROUND_ID = env.VITE_PLAYGROUND_ID;
    console.log(env)

    const handleCreateManager = (handleSuccess, handleError) => {
        const tb = new Transaction();
        tb.setSender(account?.address);
        const payment = tb.splitCoins(tb.gas, [1000000000]);

        tb.moveCall({
            target: `${MARKET_PACKAGE_ID}::manage::create_manager`,
            arguments: [
                tb.object(PLAYGROUND_ID),
                payment,
            ],
        })

        // 将PTB签名上链
        signAndExecuteTransaction(
            {
                transaction: tb,
            },
            {
                onSuccess: (result) => {
                    handleSuccess(result);
                },
                onError: (result) => {
                    handleError(result);
                }
            },
        );

    }

    return {
        handleCreateManager,
    }
}