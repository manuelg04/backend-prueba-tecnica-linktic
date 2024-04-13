import { Product } from './product.model';

export interface Order {
  id: string;
  products: Product[];
  totalPrice: number;
  createdAt: Date;
}