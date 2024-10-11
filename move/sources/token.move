// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// This is a simple example of a permissionless module for an imaginary game
/// that sells swords for Gems. Gems are an in-game currency that can be bought
/// with SUI.
module store::sword {
    use sui::token::{Self, Token, ActionRequest};
    use store::gem::GEM;

    /// Trying to purchase a sword with an incorrect amount.
    const EWrongAmount: u64 = 0;

    /// The price of a sword in Gems.
    const SWORD_PRICE: u64 = 10;

    /// A game item that can be purchased with Gems.
    public struct Sword has key, store { id: UID }

    /// Purchase a sword with Gems.
    public fun buy_sword(
        gems: Token<GEM>, ctx: &mut TxContext
    ): (Sword, ActionRequest<GEM>) {
        assert!(SWORD_PRICE == token::value(&gems), EWrongAmount);
        (
            Sword { id: object::new(ctx) },
            token::spend(gems, ctx)
        )
    }
}

/// Module that defines the in-game currency: GEMs which can be purchased with
/// SUI and used to buy swords (in the `sword` module).
module store::gem {
    use std::option::none;
    use std::string::{Self, String};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::tx_context::{sender};
    use sui::coin::{Self, Coin, TreasuryCap};

    use sui::token::{Self, Token, ActionRequest};

    /// Trying to purchase Gems with an unexpected amount.
    const EUnknownAmount: u64 = 0;

    /// 0.01 SUI is the price of a small bundle of Gems.
    const SMALL_BUNDLE: u64 = 10_000_000;
    const SMALL_AMOUNT: u64 = 100;

    /// 0.1 SUI is the price of a medium bundle of Gems.
    const MEDIUM_BUNDLE: u64 = 100_000_000;
    const MEDIUM_AMOUNT: u64 = 5_000;

    /// 1 SUI is the price of a large bundle of Gems.
    /// This is the best deal.
    const LARGE_BUNDLE: u64 = 1_000_000_000;
    const LARGE_AMOUNT: u64 = 100_000;

    #[allow(lint(coin_field))]
    /// Gems can be purchased through the `Store`.
    public struct GemStore has key {
        id: UID,
        /// Profits from selling Gems.
        profits: Balance<SUI>,
        /// The Treasury Cap for the in-game currency.
        gem_treasury: TreasuryCap<GEM>,
    }

    /// The OTW to create the in-game currency.
    public struct GEM has drop {}

    // In the module initializer we create the in-game currency and define the
    // rules for different types of actions.
    fun init(otw: GEM, ctx: &mut TxContext) {
        let (treasury_cap, coin_metadata) = coin::create_currency(
            otw, 0, b"GEM", b"Capy Gems", // otw, decimal, symbol, name
            b"In-game currency for Capy Miners", none(), // description, url
            ctx
        );

        // create a `TokenPolicy` for GEMs
        let (mut policy, cap) = token::new_policy(&treasury_cap, ctx);

        token::allow(&mut policy, &cap, buy_action(), ctx);
        token::allow(&mut policy, &cap, token::spend_action(), ctx);

        // create and share the GemStore
        transfer::share_object(GemStore {
            id: object::new(ctx),
            gem_treasury: treasury_cap,
            profits: balance::zero()
        });

        // deal with `TokenPolicy`, `CoinMetadata` and `TokenPolicyCap`
        transfer::public_freeze_object(coin_metadata);
        transfer::public_transfer(cap, ctx.sender());
        token::share_policy(policy);
    }

    /// Purchase Gems from the GemStore. Very silly value matching against module
    /// constants...
    public fun buy_gems(
        self: &mut GemStore, payment: Coin<SUI>, ctx: &mut TxContext
    ): (Token<GEM>, ActionRequest<GEM>) {
        let amount = coin::value(&payment);
        let purchased = if (amount == SMALL_BUNDLE) {
            SMALL_AMOUNT
        } else if (amount == MEDIUM_BUNDLE) {
            MEDIUM_AMOUNT
        } else if (amount == LARGE_BUNDLE) {
            LARGE_AMOUNT
        } else {
            abort EUnknownAmount
        };

        coin::put(&mut self.profits, payment);

        // create custom request and mint some Gems
        let gems = token::mint(&mut self.gem_treasury, purchased, ctx);
        let req = token::new_request(buy_action(), purchased, none(), none(), ctx);

        (gems, req)
    }

    /// The name of the `buy` action in the `GemStore`.
    public fun buy_action(): String { string::utf8(b"buy") }
}

// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// This module illustrates a Closed Loop Loyalty Token. The `Token` is sent to
/// users as a reward for their loyalty by the application Admin. The `Token`
/// can be used to buy a `Gift` in the shop.
///
/// Actions:
/// - spend - spend the token in the shop
module store::loyalty {
    use sui::coin::{Self, TreasuryCap};
    use sui::token::{Self, ActionRequest, Token};

    /// Token amount does not match the `GIFT_PRICE`.
    const EIncorrectAmount: u64 = 0;

    /// The price for the `Gift`.
    const GIFT_PRICE: u64 = 10;

    /// The OTW for the Token / Coin.
    public struct LOYALTY has drop {}

    /// This is the Rule requirement for the `GiftShop`. The Rules don't need
    /// to be separate applications, some rules make sense to be part of the
    /// application itself, like this one.
    public struct GiftShop has drop {}

    /// The Gift object - can be purchased for 10 tokens.
    public struct Gift has key, store {
        id: UID
    }

    // Create a new LOYALTY currency, create a `TokenPolicy` for it and allow
    // everyone to spend `Token`s if they were `reward`ed.
    fun init(otw: LOYALTY, ctx: &mut TxContext) {
        let (treasury_cap, coin_metadata) = coin::create_currency(
            otw,
            0, // no decimals
            b"LOY", // symbol
            b"Loyalty Token", // name
            b"Token for Loyalty", // description
            option::none(), // url
            ctx
        );

        let (mut policy, policy_cap) = token::new_policy(&treasury_cap, ctx);

        // but we constrain spend by this shop:
        token::add_rule_for_action<LOYALTY, GiftShop>(
            &mut policy,
            &policy_cap,
            token::spend_action(),
            ctx
        );

        token::share_policy(policy);

        transfer::public_freeze_object(coin_metadata);
        transfer::public_transfer(policy_cap, tx_context::sender(ctx));
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    /// Handy function to reward users. Can be called by the application admin
    /// to reward users for their loyalty :)
    ///
    /// `Mint` is available to the holder of the `TreasuryCap` by default and
    /// hence does not need to be confirmed; however, the `transfer` action
    /// does require a confirmation and can be confirmed with `TreasuryCap`.
    public fun reward_user(
        cap: &mut TreasuryCap<LOYALTY>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let token = token::mint(cap, amount, ctx);
        let req = token::transfer(token, recipient, ctx);

        token::confirm_with_treasury_cap(cap, req, ctx);
    }

    /// Buy a gift for 10 tokens. The `Gift` is received, and the `Token` is
    /// spent (stored in the `ActionRequest`'s `burned_balance` field).
    public fun buy_a_gift(
        token: Token<LOYALTY>,
        ctx: &mut TxContext
    ): (Gift, ActionRequest<LOYALTY>) {
        assert!(token::value(&token) == GIFT_PRICE, EIncorrectAmount);

        let gift = Gift { id: object::new(ctx) };
        let mut req = token::spend(token, ctx);

        // only required because we've set this rule
        token::add_approval(GiftShop {}, &mut req, ctx);

        (gift, req)
    }
}