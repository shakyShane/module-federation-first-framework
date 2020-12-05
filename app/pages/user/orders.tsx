import React from "react";
import { Link, RouterProvider, useRouteData } from "mfr-router";

const children = [{ key: "user_order_tsx", as: ":id" }];

export function Orders() {
    const d = useRouteData();
    console.log(d);
    return (
        <div>
            <h3>Orders</h3>
            <p>
                <Link to={"/user/orders/1"}>Order 1</Link>
            </p>
            <p>
                <Link to={"/user/orders/2"}>Order 2</Link>
            </p>
            <RouterProvider segs={children} />
        </div>
    );
}

export default Orders;
