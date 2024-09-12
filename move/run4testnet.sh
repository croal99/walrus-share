CLIENT_ADDRESS="0x167b61dcef37260fc8335e15a16cbad0a2f3ddc8a511169820f0c013396f205b"
PACKAGE_ID="0x0cf45cf51a7e35f91a174a76cf9502b92543e6c60e127b7648085371b9025661"

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
