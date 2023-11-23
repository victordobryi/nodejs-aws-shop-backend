import { products } from '../mockData';
import { Product } from '../types/product';

const findAll = async (): Promise<Product[]> => {
  return products;
};

const findOne = async (id: string): Promise<Product | undefined> => {
  const products = await findAll();
  return products.find((p) => p.id === id);
};

export { findAll, findOne };
