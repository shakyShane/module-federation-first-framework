import React from "react";
import { createLocation } from "history";
import { BaseRouter } from "mfr-router";
import { App } from "./app";

/**
 * SSR entry point
 */
export default function ssr(req, res) {
    console.log("SSR only here please");
    return (
        <BaseRouter location={createLocation(req.url)} >
            <App />
        </BaseRouter>
    );
}
