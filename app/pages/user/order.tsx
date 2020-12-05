import React from "react";
import { useResolveData } from "mfr-router";

export function Order() {
    const d = useResolveData();
    console.log(d.data);
    return (
        <div>
            <h3>order id: </h3>
        </div>
    );
}

export default Order;
