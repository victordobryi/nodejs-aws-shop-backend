export interface Stocks {
  product_id: string;
  count: number;
}

export interface StocksRecord {
  product_id: {
    S: string;
  };
  count: {
    N: string;
  };
}
