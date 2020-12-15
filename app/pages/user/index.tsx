import React from "react";
import { Link, RouterProvider } from "mfr-router";

const children = [{ key: "user/orders", as: "orders" }];

export function User() {
    return (
        <div>
            <h1>User</h1>
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
