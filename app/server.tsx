import React from "react";
import { createLocation } from "history";
import { BaseRouter } from "mfr-router";
import { App } from "./app";

/**
 * SSR entry point
 */
export default function ssr(pathname: string) {
    console.log("SSR only %O", pathname);
    return (
        <BaseRouter location={createLocation(pathname)}>
            <App />
        </BaseRouter>
    );
}
