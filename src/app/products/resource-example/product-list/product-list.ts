import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductStore } from '../../product.store';
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
          [ngModel]="store.searchTerm()"
          (ngModelChange)="store.setSearchTerm($event)"
          placeholder="e.g. mascara, phone, perfume"
        />
        @if (store.searchTerm()) {
          <button
            mat-icon-button
            matSuffix
            (click)="store.clearSearch()"
            aria-label="Clear search"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <!-- 1. Loading State -->
      @if (store.isLoading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Loading products...</p>
        </div>
      }

      <!-- 2. Error State -->
      @else if (store.error()) {
        <div class="error-state">
          <mat-icon>error_outline</mat-icon>
          <p>Failed to load products</p>
          <button mat-flat-button (click)="store.reload()">Retry</button>
        </div>
      }

      <!-- 3. Resolved Products Grid & Paginator -->
      @else {
        <div class="products-grid">
          @for (product of store.products(); track product.id) {
            <product-card [product]="product" />
          } @empty {
            <div class="empty-state">
              <mat-icon>inventory_2</mat-icon>
              <p>No products match your search</p>
            </div>
          }
        </div>

        @if (store.total() > 0) {
          <mat-paginator
            [length]="store.total()"
            [pageSize]="store.pageSize()"
            [pageIndex]="store.pageIndex()"
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
  // Inject the ProductStore facade
  protected readonly store = inject(ProductStore);

  protected onPageChange(event: PageEvent) {
    this.store.setPage(event.pageIndex, event.pageSize);
  }
}
