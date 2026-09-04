import { Injectable } from '@angular/core';
import { ProductResponse } from './product';

export interface ProductQueryParams {
  searchTerm: string;
  pageIndex: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = 'https://dummyjson.com/products';

  /**
   * Fetches paginated products with optional search query from the API.
   *
   * @param params - Search term and pagination options (pageIndex, pageSize).
   * @param abortSignal - Standard AbortSignal forwarded from Angular's resource() for auto-cancellation.
   */
  async getProducts(params: ProductQueryParams,abortSignal?: AbortSignal,): Promise<ProductResponse> {
    const query = params.searchTerm.trim();
    const limit = params.pageSize;
    const skip = params.pageIndex * params.pageSize;

    const endpoint = query
      ? `${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`
      : `${this.baseUrl}?limit=${limit}&skip=${skip}`;

    const response = await fetch(endpoint, { signal: abortSignal });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch products: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }
}

