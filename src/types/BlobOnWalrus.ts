// "newlyCreated": {
//     "blobObject": {
//       "id": "0xd765d11848cbac5b1f6eec2fbeb343d4558cbe8a484a00587f9ef5385d64d235",
//       "storedEpoch": 0,
//       "blobId": "Cmh2LQEGJwBYfmIC8duzK8FUE2UipCCrshAYjiUheZM",
//       "size": 17,
//       "erasureCodeType": "RedStuff",
//       "certifiedEpoch": 0,
//       "storage": {
//         "id": "0x28cc75b33e31b3e672646eacf1a7c7a2e5d638644651beddf7ed4c7e21e9cb8e",
//         "startEpoch": 0,
//         "endEpoch": 1,
//         "storageSize": 4747680
//       }
//     },
//     "encodedSize": 4747680,
//     "cost": 231850
export interface NewBlobOnWalrus {
    blobObject: {
        id: string,
        storedEpoch: number,
        blobId: string,
        size: number,
        erasureCodeType: string,
        certifiedEpoch: number,
        storage: {
            id: string,
            startEpoch: number,
            endEpoch: number,
            storageSize: number,
        }
    }
}

// "alreadyCertified": {
//     "blobId": "Cmh2LQEGJwBYfmIC8duzK8FUE2UipCCrshAYjiUheZM",
//     "event": {
//       "txDigest": "CLE41JTPR2CgZRC1gyKK6P3xpQRHCetQMsmtEgqGjwst",
//       "eventSeq": "0"
//     },
//     "endEpoch": 1
//   }
export interface BlobOnWalrus {
    blobId: string,
    event: {
        txDigest: string,
        eventSeq: string,
    }
    endEpoch: number,
}
