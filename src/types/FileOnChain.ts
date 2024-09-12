export interface FileOnChain {
  id: {
    id: string;
  };
  filename: string;
  media: string;
  blobId: string;
  hash: string;
  salt: string;
  share: number;
  fee: number;
  code: string;
}
