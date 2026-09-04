import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
    title: 'Home',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home').then((m) => m.Home),
    title: 'Home',
  },
  {
    path: 'product-list',
    loadComponent: () =>
      import(
        './products/resource-example/product-list/product-list'
      ).then((m) => m.ProductList),
    title: 'Resource: Product List',
  },
    {
    path: 'rx-product-list',
    loadComponent: () =>
      import(
          './products/rx-resource-example/rx-product-list/rx-product-list'
        ).then((m) => m.RxProductList),
      title: 'RxResource: Product List',
  },
  {
    path: 'http-product-list',
    loadComponent: () =>
      import(
        './products/http-resource-example/http-product-list/http-product-list'
      ).then((m) => m.HttpProductList),
    title: 'HttpResource: Product List',
  },

];
