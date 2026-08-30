export interface Product {
  id: number;
  title: string;
  description: string;
  category?: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  availabilityStatus? : string;
  tags?: string[];
  brand?: string;
  thumbnail?: string;
  images?: string[];
  // Optional convenience field if calculating original price before discount:
  originalPrice?: number;
}

//to match DummyJSON API's wrapper ({ products, total, skip, limit }).
export interface ProductResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}