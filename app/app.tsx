import * as React from "react";
import { BaseRouter, RouterProvider } from "mfr-router";

if (process.env.NODE_ENV === "development") {
    const { inspect } = require("@xstate/inspect");
    inspect({ iframe: false });
}

const children = [
    { key: "index", as: "/" },
    { key: "user_user", as: "user" },
];

export function App() {
    return (
        <BaseRouter>
            <div>
                <p>App Wrapper Greetings!</p>
            </div>
            <RouterProvider segs={children} />
            <b>belo</b>
        </BaseRouter>
    );
}
