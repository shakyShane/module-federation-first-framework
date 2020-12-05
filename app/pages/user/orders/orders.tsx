import React, { useEffect, useState } from "react";
import { Link, RouterProvider, useRouteData } from "mfr-router";

// todo: make these relative also
const children = [{ key: "user_orders_$id", as: ":id" }];

export function Orders() {
    const d = useRouteData();
    const [count, ticker] = useState(0);
    useEffect(() => {
        const int = setInterval(() => {
            ticker((x) => x + 1);
        }, 1000);
        return () => {
            clearInterval(int);
        };
    }, []);
    return (
        <div>
            <h3>Orders</h3>
            <h4>tick: {count}</h4>
            <p>
                <Link to={"/user/orders/1?kitten=here"}>Order 1</Link>
            </p>
            <p>
                <Link to={"/user/orders/2"}>Order 2</Link>
            </p>
            <RouterProvider segs={children} />
        </div>
    );
}

export default Orders;
