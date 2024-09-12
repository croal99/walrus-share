#[allow(unused_use, unused_const, unused_field, unused_variable)]
module store::filestore {
    use std::debug;
    use std::string::{Self, String};
    use sui::url::{Self, Url, new_unsafe_from_bytes};
    use sui::event;

    const EMapData: u64 = 0;

    public struct ShareFile has key, store {
        id: UID,
        filename: String,
        media: String,
        hash: String,       // password 1
        salt: String,       // password 2
        blobId: String,     // walrus blobId
        share: u64,         // 共享类型 0-free 1-code 2-sui
        fee: u64,
        code: String,
        count: u64,
        owner: address,
        share_list: vector<address>,                    // file列表
    }

    public fun initialize_file(
        filename: vector<u8>,
        media: vector<u8>,
        hash: vector<u8>,
        salt: vector<u8>,
        blobId: vector<u8>,
        share: u64,
        fee: u64,
        code: vector<u8>,
        ctx: &mut TxContext
    ): ShareFile {
        let file = ShareFile {
            id: sui::object::new(ctx),
            filename: string::utf8(filename),
            media: string::utf8(media),
            blobId: string::utf8(blobId),
            hash: string::utf8(hash),
            salt: string::utf8(salt),
            share,
            fee,
            code: string::utf8(code),
            count: 0,
            owner: tx_context::sender(ctx),
            share_list: vector<address>[],
        };

        file
    }

    public entry fun update_file(
        sharefile: &mut ShareFile,
        filename: vector<u8>,
        media: vector<u8>,
        salt: vector<u8>,
        _: &mut TxContext
    ) {
        sharefile.filename = string::utf8(filename);
        sharefile.media = string::utf8(media);
        sharefile.salt = string::utf8(salt);
    }

    public fun update_pay(
        sharefile: &mut ShareFile,
        ctx: &mut TxContext
    ) {
        sharefile.count = sharefile.count + 1;
        sharefile.share_list.push_back(tx_context::sender(ctx));
    }

    public fun owner(sharefile: &ShareFile): &address {
        &sharefile.owner
    }

    public fun fee(sharefile: &ShareFile): u64 {
        sharefile.fee
    }

}
