import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductResponse } from '../../product';
import { ProductQueryParams, ProductService } from '../../product.service';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'product-list',
  imports: [
    ProductCard,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="products-container">
      <!-- Search Input -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search Products</mat-label>
        <input
          matInput
          [ngModel]="searchTerm()"
          (ngModelChange)="onSearchChange($event)"
          placeholder="e.g. mascara, phone, perfume"
        />
        @if (searchTerm()) {
          <button
            mat-icon-button
            matSuffix
            (click)="clearSearch()"
            aria-label="Clear search"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <!-- 1. Loading State -->
      @if (products.isLoading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Loading products...</p>
        </div>
      }

      <!-- 2. Error State -->
      @else if (products.error()) {
        <div class="error-state">
          <mat-icon>error_outline</mat-icon>
          <p>Failed to load products</p>
          <button mat-flat-button (click)="products.reload()">Retry</button>
        </div>
      }

      <!-- 3. Resolved Products Grid & Paginator -->
      @else {
        <div class="products-grid">
          @for (product of products.value()?.products; track product.id) {
            <product-card [product]="product" />
          } @empty {
            <div class="empty-state">
              <mat-icon>inventory_2</mat-icon>
              <p>No products match your search</p>
            </div>
          }
        </div>

        @if ((products.value()?.total ?? 0) > 0) {
          <mat-paginator
            [length]="products.value()?.total ?? 0"
            [pageSize]="pageSize()"
            [pageIndex]="pageIndex()"
            [pageSizeOptions]="[5, 10, 15, 20]"
            [showFirstLastButtons]="true"
            (page)="onPageChange($event)"
            aria-label="Select page of products"
            class="products-paginator"
          >
          </mat-paginator>
        }
      }
    </div>
  `,
  styleUrl: './product-list.scss',
})
export class ProductList {
  protected readonly url = 'https://dummyjson.com/products';
  private readonly productService = inject(ProductService);

  /**
   * Reactive state signals for filtering and pagination.
   */
  protected readonly searchTerm = signal('');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  /**
   * Resource coordinating async data fetching with pagination and search parameters.
   */
  products = resource<
    ProductResponse,
    { searchTerm: string; pageIndex: number; pageSize: number }
  >({
  products = resource<ProductResponse, ProductQueryParams>({
    // Automatically re-evaluates and triggers the loader whenever any of these signals change:
    params: () => ({
      searchTerm: this.searchTerm(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    }),

    loader: async ({ params, abortSignal }) => {
      const query = params.searchTerm.trim();
      const limit = params.pageSize;
      const skip = params.pageIndex * params.pageSize;

      const endpoint = query
        ? `${this.url}/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`
        : `${this.url}?limit=${limit}&skip=${skip}`;

      const response = await fetch(endpoint, { signal: abortSignal });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    },
    loader: ({ params, abortSignal }) =>
      this.productService.getProducts(params, abortSignal),
  });

  protected onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.pageIndex.set(0); // Reset to first page on search query changes
  }

  protected onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected clearSearch() {
    this.searchTerm.set('');
    this.pageIndex.set(0);
  }
}
