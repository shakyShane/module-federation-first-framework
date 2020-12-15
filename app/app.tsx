import * as React from "react";
import { RouterProvider } from "mfr-router";

if (process.env.NODE_ENV === "development") {
    if (typeof window !== "undefined") {
        const { inspect } = require("@xstate/inspect");
        inspect({ iframe: false });
    }
}

const children = [
    { key: "index", as: "/" },
    { key: "user", as: "user" },
];

export function App() {
    return (
        <div style={{ position: "relative" }}>
            <header style={{ padding: "20px", background: "orange" }}>
                <strong>MFR Router is here</strong>{" "}
                <small>Module Federation</small>
            </header>
            <RouterProvider segs={children} />
            <footer style={{ padding: "20px", background: "#a4a4d8" }}>
                <strong>MFR Router</strong>
            </footer>
        </div>
    );
}
