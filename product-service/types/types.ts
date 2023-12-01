import { QueryCommandOutput, ScanCommandOutput } from '@aws-sdk/client-dynamodb';

export type TypedScanCommandOutput<T> = Omit<ScanCommandOutput, 'Items'> & {
  Items?: T;
};

export type TypedQueryOutput<T> = Omit<QueryCommandOutput, 'Items'> & {
  Items?: T;
};
