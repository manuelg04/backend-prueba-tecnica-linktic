import { Product } from './product.model';

export interface Order {
  id: number;
  products: Product[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: number;
}