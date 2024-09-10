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
        salt: String,
    }

    public fun initialize_file(
        filename: vector<u8>,
        media: vector<u8>,
        salt: vector<u8>,
        ctx: &mut TxContext
    ): ShareFile {
        let file = ShareFile {
            id: sui::object::new(ctx),
            filename: string::utf8(filename),
            media: string::utf8(media),
            salt: string::utf8(salt),
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


}
