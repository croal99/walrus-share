CLIENT_ADDRESS="0x167b61dcef37260fc8335e15a16cbad0a2f3ddc8a511169820f0c013396f205b"
PACKAGE_ID="0x0a6d744176c3b47c0f6b6a20744469afde4c63fe76550e3367e25e2b84c4b9fb"

#sui client switch --env testnet
#sui client envs
#
#sui client switch --address ${CLIENT_ADDRESS}
#sui client addresses


sui client call \
--package ${PACKAGE_ID} \
--module manage \
--function create_playground \
--args "walrus-share"
