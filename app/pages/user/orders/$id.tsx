import React from "react";
import { useResolveData } from "mfr-router";

export function OrdersId() {
    const d = useResolveData();
    return (
        <div>
            <h3>order id: {d.data.params.id} </h3>
        </div>
    );
}

export default OrdersId;
