/// Module: store
#[allow(unused_use, unused_const, unused_field, unused_variable)]
module store::manage {
    use std::ascii::string;
    use std::debug;
    use std::string::{Self, String};
    use sui::url::{Self, Url, new_unsafe_from_bytes};
    use sui::event;
    use sui::table::{Self, Table};
    use sui::coin::{Self, TreasuryCap, Coin};
    use sui::object_table::{Self, ObjectTable};
    use sui::balance::{Self, Balance};
    use sui::token::{Self, Token};
    use sui::sui::SUI;
    use sui::transfer::transfer;
    use sui::tx_context::sender;
    use store::filestore::{Self, ShareFile};

    const EIncorrectAmount: u64 = 0;

    /// manage fee (1 Sui)
    const CREATE_MANAGER_PRICE: u64 = 1_000_000;

    public struct Playground has key, store {
        id: UID,
        name: String,
        owner: address,                                     // owner
        manager_list: ObjectTable<address, Manage>,         // 管理者列表
        sharefile_list: vector<address>,                    // file列表
    }

    public struct Manage has key, store {
        id: UID,
        enable: bool,                                   // 是否启用
        total: u64,                                     // 总数
        balance: Balance<SUI>,
        fee: u64,                                       // 费用
        owner: address,                                 // owner
        config_id: ID,                                  // config object id
    }

    // 创建playground对象，保存可以使用的管理者
    public entry fun create_playground(
        name: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // create manager
        let playground = Playground {
            id: sui::object::new(ctx),
            name: string::utf8(name),
            owner: sender,
            manager_list: object_table::new<address, Manage>(ctx),
            sharefile_list: vector<address>[],
        };

        // share object
        transfer::public_share_object(playground);
    }

    // 创建管理者
    public entry fun create_manager(
        playground: &mut Playground,
        payment: Coin<SUI>,
        filename: vector<u8>,
        media: vector<u8>,
        salt: vector<u8>,
        blobId: vector<u8>,
        fee: u64,
        code: vector<u8>,
        ctx: &mut TxContext
    ) {
        // assert!(coin::value(&payment) == CREATE_MANAGER_PRICE, EIncorrectAmount);

        let manager_address = tx_context::sender(ctx);

        // 查询是否存在玩家数据
        if (playground.manager_list.contains(manager_address)) {
            debug::print(&string::utf8(b"manager is exist."));

            // 退回Coin
            transfer::public_transfer(payment, manager_address);
        } else {
            debug::print(&string::utf8(b"create manager"));

            // 支付给创建者
            transfer::public_transfer(payment, playground.owner);

            let sender = tx_context::sender(ctx);

            // create config item
            let sharefile = filestore::initialize_file(
                filename,
                media,
                salt,
                blobId,
                fee,
                code,
                ctx);

            // create manager
            let manager = Manage {
                id: sui::object::new(ctx),
                enable: true,
                total:0,
                balance: balance::zero(),
                fee: CREATE_MANAGER_PRICE,
                owner: sender,
                config_id: object::id(&sharefile),
            };

            // 添加到管理列表
            playground.manager_list.add(object::id_address(&manager), manager);
            playground.sharefile_list.push_back(object::id_address(&sharefile));

            // transfer object
            // transfer::public_transfer(manager, manager_address);
            transfer::public_transfer(sharefile, manager_address);
        }

    }

    #[allow(unused_function)]
    fun init(_ctx: &mut TxContext) {
    }

    // ===== Tests =====

    #[test_only]
    public fun test_for_init(
        ctx: &mut TxContext
    ) {
        init(ctx);
    }

}

