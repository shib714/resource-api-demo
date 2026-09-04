import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RxProductService } from '../rx-product.service';
import { RxProductCard } from '../rx-product-card/rx-product-card';

@Component({
  selector: 'rx-product-list',
  imports: [
    RxProductCard,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rx-product-list.html',
  styleUrl: './rx-product-list.scss',
})
export class RxProductList {
  protected readonly store = inject(RxProductService);

  protected onPageChange(event: PageEvent): void {
    this.store.setPage(event.pageIndex, event.pageSize);
  }
}