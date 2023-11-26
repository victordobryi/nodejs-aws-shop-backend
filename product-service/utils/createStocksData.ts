import { Stocks } from '../types/stocks';
import { Product } from '../types/product';

export const createStocksData = (products: Product[]): Stocks[] => {
  const stocks: Stocks[] = products.map(({ id }) => ({
    product_id: id,
    count: Math.floor(Math.random() * products.length) + 1,
  }));

  return stocks;
};
