import React from "react";
import { Link, RouterProvider } from "mfr-router";

const children = [{ key: "user_orders_orders", as: "orders" }];

export function User() {
    return (
        <div>
            <p>
                <strong>User</strong>
            </p>
            <p>
                <Link to={"/"}>Home</Link>
            </p>
            <p>
                <Link to={"/user/orders"}>Orders</Link>
            </p>
            <RouterProvider segs={children} />
        </div>
    );
}

export default User;
