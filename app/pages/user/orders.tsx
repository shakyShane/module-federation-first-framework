import React from "react";
import { RouterProvider } from "mfr-router";

const children = [{ key: "user_order_tsx", as: ":id" }];

export function Orders() {
    return (
        <div>
            <h3>Orders</h3>
            <RouterProvider segs={children} />
        </div>
    );
}

export default Orders;
