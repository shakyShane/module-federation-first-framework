import React from "react";
import { useResolveData } from "mfr-router";

export function OrdersId() {
    const d = useResolveData();
    return (
        <div>
            <h3>
                Order - <code>param.id</code>: {d.data.params.id}{" "}
            </h3>
            <pre>
                <code>{JSON.stringify(d, null, 4)}</code>
            </pre>
        </div>
    );
}

export default OrdersId;
