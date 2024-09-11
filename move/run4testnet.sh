CLIENT_ADDRESS="0x167b61dcef37260fc8335e15a16cbad0a2f3ddc8a511169820f0c013396f205b"
PACKAGE_ID="0x31ba344aa05b23bb21bf90e64fd9e4a039a6526a5bd834bd6870653547973199"

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
