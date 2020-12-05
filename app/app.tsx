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
            <div style={{ position: "relative" }}>
                <header style={{ padding: "20px", background: "orange" }}>
                    <strong>MFR Router</strong>{" "}
                    <small>Module Federation Ready Router</small>
                </header>
                <RouterProvider segs={children} />
                <footer style={{ padding: "20px", background: "#a4a4d8" }}>
                    <strong>MFR Router</strong>
                </footer>
            </div>
        </BaseRouter>
    );
}
