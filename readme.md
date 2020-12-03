## Module Federation First Framework

A file-system based application builder & nested router with first-class support for Module Federation throughout.

- Every page & each level of routing can be it's own federated module
- Each level of routing can both 'resolve' it's component to use, + load it's own data

`/user/index.tsx`
```tsx
// given the structure /user/orders/:id
export function User() {
    const { data } = useRouteData();
    return (
        <div>
            <h1>Welcome {data.name}</h1>        
            <Outlet />
        </div>    
    )
}
```

`/user/orders/index.tsx`
```tsx
export function Orders() {
    const { data } = useRouteData();
    return (
        <div>
            <ul>{data.orders.map(order => <li key={order.id}>{order.product.name}</li>)}</ul>
            <Outlet />
        </div>    
    )
}
```

`/user/orders/[id].tsx`
```tsx
export function Order() {
    const { data } = useRouteData();
    return (
        <div>
            <h1>{order.id}</h1>
        </div>    
    )
}
```
