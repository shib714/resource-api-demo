import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../product';

@Component({
  selector: 'product-card',
  imports: [MatCardModule, MatButtonModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="product-card" appearance="outlined">
      @if (product().thumbnail) {
        <img mat-card-image [src]="product().thumbnail" [alt]="product().title" class="product-image" />
      }
      <mat-card-header>
        <mat-card-title>{{ product().title }}</mat-card-title>
        @if (product().category) {
          <mat-card-subtitle>{{ product().category }}</mat-card-subtitle>
        }
      </mat-card-header>

      <mat-card-content>
        <p class="description">{{ product().description }}</p>
        <p class="rating-row">
          @if (product().rating) {
            <span class="rating">Rating: {{ product().rating }}</span>
            
          }
        </p>
        <p class="price-row">
          <span class="current-price">{{ product().price | currency }}</span>
          @if (product().discountPercentage) {
            <span class="sale-badge">{{ product().discountPercentage }}% OFF</span>
          }
          <span class="availability">Availability: {{ product().availabilityStatus }}</span>
        </p>
      </mat-card-content>

      <mat-card-actions>
        <button mat-button>{{ addButtonLabel() }}</button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly addButtonLabel = input('Add to Cart');
}
