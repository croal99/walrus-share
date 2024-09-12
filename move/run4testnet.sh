CLIENT_ADDRESS="0x167b61dcef37260fc8335e15a16cbad0a2f3ddc8a511169820f0c013396f205b"
PACKAGE_ID="0xa80d0a2e68e39ad7c2ec16b8ac7d195b5d585e0cccabf28901dfd97071aa6eaa"

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
