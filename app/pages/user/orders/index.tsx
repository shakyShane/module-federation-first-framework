import React, { useEffect, useState } from "react";
import { Link, RouterProvider, useRouteData } from "mfr-router";

// todo: make these relative also
const children = [{ key: "user/orders/$id", as: ":id" }];

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
            <p>
                <strong>Orders</strong>
            </p>
            <p>
                <b>tick: {count}</b>
            </p>
            <p>
                <Link to={"/user/orders/1?kitten=here"}>Order 1</Link>{" "}
                <Link to={"/user/orders/2"}>Order 2</Link>
                <Link to={"/user/orders/3"}>Order 3</Link>
                <Link to={"/user/orders/4"}>Order 4</Link>
                <Link to={"/user/orders/5"}>Order 5</Link>
            </p>
            <RouterProvider segs={children} />
        </div>
    );
}

export default Orders;
