CLIENT_ADDRESS="0x167b61dcef37260fc8335e15a16cbad0a2f3ddc8a511169820f0c013396f205b"
PACKAGE_ID="0x0142d2ebd2486f8fc6eb4fdc99a74c1f32b59ea5058d67c4c66132c2900768d7"

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
