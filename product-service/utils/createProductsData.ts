import { Product } from '../types/product';
import { v4 as uuidv4 } from 'uuid';

export const createProductsData = (): Product[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: uuidv4(),
    title: `Title ${i + 1}`,
    price: Math.floor(Math.random() * 100),
    description: `Description ${i + 1}`,
  }));
};
