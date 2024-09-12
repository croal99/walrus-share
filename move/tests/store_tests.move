#[test_only]
#[allow(unused_use, unused_variable, unused_const, unused_let_mut)]
module store::store_tests {
    // uncomment this line to import the module
    use std::debug;
    use std::ascii::string;
    use std::string::{Self, String};
    use sui::test_scenario as ts;
    use sui::table::{Self, Table};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::sui::SUI;
    use store::manage::{Self, Playground, Manage};
    use store::filestore::{Self, ShareFile};

    const ENotImplemented: u64 = 0;

    #[test]
    fun test_playground() {
        let admin = @0xA;
        let user = @0xB;
        let mut scenario = ts::begin(admin);
        let mut playground: Playground;
        let mut sharefile: ShareFile;

        // init
        ts::next_tx(&mut scenario, admin);
        {
            manage::test_for_init(scenario.ctx());
        };

        // create playground
        ts::next_tx(&mut scenario, admin);
        {
            manage::create_playground(b"playground", scenario.ctx());
        };
        ts::next_tx(&mut scenario, admin);
        {
            playground = ts::take_shared<Playground>(&scenario);
            debug::print(&playground);
        };

        // create manager with user
        ts::next_tx(&mut scenario, user);
        {
            let pay = coin::mint_for_testing<SUI>(1_000_000_000, scenario.ctx());
            manage::create_manager(
                &mut playground,
                pay,
                b"filename",
                b"media",
                b"hash",
                b"salt",
                b"blobId",
                1,
                1_000_000_000,
                b"code",
                scenario.ctx()
            );
        };

        // print ShareFile
        ts::next_tx(&mut scenario, user);
        {
            sharefile = ts::take_from_sender<ShareFile>(&scenario);
            debug::print(&sharefile);
        };

        // update ShareFile
        ts::next_tx(&mut scenario, user);
        {
            // filestore::update_file(&mut sharefile, b"filename", b"media", b"salt", scenario.ctx());
            // debug::print(&sharefile);
            ts::return_to_sender<ShareFile>(&scenario, sharefile);
        };

        ts::next_tx(&mut scenario, admin);
        {
            ts::return_shared<Playground>(playground);
        };

        ts::end(scenario);
    }
}