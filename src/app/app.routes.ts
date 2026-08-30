import { Routes } from '@angular/router';

export const routes: Routes = [
    
    {
        path: '',
        pathMatch: 'full', redirectTo: 'home', title: 'Home'
    },

    {
        path: 'home',
        loadComponent: () => import('./home/home')
            .then((m) => m.Home), title: 'Home'
    },
    // {
    //     path: 'profile-form',
    //     loadComponent: () => import('./components/signal-form/profile/profile-form/profile-form')
    //         .then((m) => m.ProfileForm), title: 'Profile Signal Form'
    // },
    // {
    //     path: 'sw-app', loadComponent: () => import('./components/swapi-vehicles/vehicles/vehicle-app')
    //         .then((m) => m.VehiclesApp), title: 'SW Vehicles'
    // },
    
    {
        path: 'product-list',
        loadComponent: () => import('./products/resource-example/product-list/product-list')
            .then((m) => m.ProductList), title: 'Resource: Product List'
    },

    // {
    //     path: 'cart',
    //     loadComponent: () => import('./components/shopping-cart/cart/cart-list/cart-list')
    //         .then((m) => m.CartList), title: 'Sgopping Cart'
    // },
    
    // {
    //     path: 'composable-form', loadComponent: () => import('./components/signal-form/composable-form/composable-form')
    //         .then((m) => m.ComposableForm), title: 'Composable signal Form'
    // },
];
