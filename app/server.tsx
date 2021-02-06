import React from "react";
import { createLocation } from "history";
import { App } from "./app";
import { BaseRouterProvider } from "mfr-router";

/**
 * SSR entry point
 */
export default function ssrServerEntry(req, res, ctx) {
    console.log("ctx is here", ctx);
    return (
        <BaseRouterProvider
            location={createLocation(req.url)}
            routers={ctx.routers}
            register={ctx.register}
        >
            <App />
        </BaseRouterProvider>
    );
}
