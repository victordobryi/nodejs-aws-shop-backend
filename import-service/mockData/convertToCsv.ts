import { writeFile } from 'fs';
import { products } from './products';

export const convertToCsv = (products: any[]) => {
  const headers = Object.keys(products[0]);
  const csvRows = [
    headers.join(','),
    ...products.map((product) => headers.map((header) => product[header]).join(',')),
  ].join('\n');

  writeFile('./mockData/products.csv', csvRows, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
};

convertToCsv(products);
