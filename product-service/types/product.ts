import { Stocks } from './stocks';

export interface Product {
  id: string;
  price: number;
  title: string;
  description: string;
}

export type FullProduct = Product & Pick<Stocks, 'count'>;

export interface ProductsRecord {
  id: {
    S: string;
  };
  price: {
    N: string;
  };
  title: {
    S: string;
  };
  description: {
    S: string;
  };
}
