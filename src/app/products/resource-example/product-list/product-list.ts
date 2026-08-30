import { ChangeDetectionStrategy, Component, resource, signal } from '@angular/core';
import { ProductCard } from '../product-card/product-card';
import { Product, ProductResponse } from '../../product';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="products-container">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search Products</mat-label>
        <input
          matInput
          [(ngModel)]="searchTerm"
          placeholder="e.g. mascara, phone"
        />
        @if (searchTerm()) {
          <button mat-icon-button matSuffix (click)="clearSearch()" aria-label="Clear search">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      @if (products.isLoading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Loading products...</p>
        </div>
      } @else if (products.error()) {
        <div class="error-state">
          <mat-icon>error_outline</mat-icon>
          <p>Failed to load products</p>
          <button mat-flat-button (click)="products.reload()">Retry</button>
        </div>
      } @else {
        <div class="products-grid">
          @for (product of products.value(); track product.id) {
            <product-card [product]="product" />
          } @empty {
            <div class="empty-state">
              <mat-icon>inventory_2</mat-icon>
              <p>No products match your search</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './product-list.scss',
})
export class ProductList {
  protected readonly url = 'https://dummyjson.com/products';
  protected readonly searchTerm = signal('');

  products = resource<Product[], { searchTerm: string }>({
    params: () => ({ searchTerm: this.searchTerm() }),
    loader: async ({ params, abortSignal }) => {
      const trimmed = params.searchTerm.trim();
      const endpoint = trimmed
        ? `${this.url}/search?q=${encodeURIComponent(trimmed)}`
        : this.url;

      const response = await fetch(endpoint, { signal: abortSignal });
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data: ProductResponse = await response.json();
      return data.products;
    },
  });

  protected clearSearch() {
    this.searchTerm.set('');
  }
}
