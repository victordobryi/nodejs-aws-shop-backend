import { Stocks } from './stocks';

export interface Product {
  id: string;
  price: number;
  title: string;
  description: string;
}

export type FullProduct = Product & Pick<Stocks, 'count'>;
