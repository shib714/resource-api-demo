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
        './products/rxresource-example/rx-product-list'
      ).then((m) => m.ProductList),
    title: 'Resource: Product List',
  },

];
