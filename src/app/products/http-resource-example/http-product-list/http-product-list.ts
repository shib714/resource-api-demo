import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpProductService } from '../http-product.service';
import { HttpProductCard } from '../http-product-card/http-product-card';

@Component({
  selector: 'http-product-list',
  imports: [
    HttpProductCard,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './http-product-list.html',
  styleUrl: './http-product-list.scss',
})
export class HttpProductList {
  protected readonly store = inject(HttpProductService);

  protected onPageChange(event: PageEvent): void {
    this.store.setPage(event.pageIndex, event.pageSize);
  }
}