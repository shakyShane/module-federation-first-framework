import React from "react";
import { createLocation } from "history";
import { App } from "./app";
import { BaseRouterProvider } from "mfr-router";

/**
 * SSR entry point
 */
export default function ssr(req, res, ctx) {
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
