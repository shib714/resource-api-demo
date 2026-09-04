import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductResponse } from '../product';
import { HttpClient } from '@angular/common/http';

export interface RxProductQueryParams {
  searchTerm: string;
  pageIndex: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class RxProductService {
  private readonly baseUrl = 'https://dummyjson.com/products';

  private readonly http = inject(HttpClient);

  /**
   * Returns a cancelable RxJS Observable stream for rxResource().
   *
   * Teardown Behavior:
   * When rxResource() cancels a previous request (e.g. user changes page,
   * types in search, or navigates away), it unsubscribes from this Observable,
   * automatically executing the teardown function which calls controller.abort().
   
  getProducts$(params: RxProductQueryParams): Observable<ProductResponse> {
    return new Observable<ProductResponse>((subscriber) => {
      const controller = new AbortController();
      const query = params.searchTerm.trim();
      const limit = params.pageSize;
      const skip = params.pageIndex * params.pageSize;

      const endpoint = query
        ? `${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`
        : `${this.baseUrl}?limit=${limit}&skip=${skip}`;

      fetch(endpoint, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) {
            throw new Error(
              `Failed to fetch products: ${res.status} ${res.statusText}`,
            );
          }
          return res.json();
        })
        .then((data: ProductResponse) => {
          subscriber.next(data);
          subscriber.complete();
        })
        .catch((err) => {
          // Ignore manual abort cancellations
          if (err.name !== 'AbortError') {
            subscriber.error(err);
          }
        });

      // Teardown callback triggered automatically on unsubscription:
      return () => {
        controller.abort();
      };
    });
  }
    */
   // HTTP Observables are cold and automatically abort on unsubscribe, which makes them perfect for conversion into signals using Angular’s built‑in interop
  getProducts$(params: RxProductQueryParams) {
    const { searchTerm, pageSize, pageIndex } = params;

    const query = searchTerm.trim();
    const limit = pageSize;
    const skip = pageIndex * pageSize;

    const endpoint = query ? `${this.baseUrl}/search` : this.baseUrl;

    return this.http.get<ProductResponse>(endpoint, {
      params: {
        ...(query && { q: query }),
        limit,
        skip,
      },
    });
  }
}
