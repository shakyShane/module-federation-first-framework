import * as React from "react";
import { Outlet } from "mfr-router";
import "./styles.css";
import { Nav } from "./components/Nav/Nav";
import { Main } from "./components/Main";
import { Body } from "./components/Body";
import { StylesProvider } from "./shared/Styles";

if (process.env.NODE_ENV === "development") {
    if (typeof window !== "undefined") {
        const { inspect } = require("@xstate/inspect");
        inspect({ iframe: false });
    }
}

const children = [
    { key: "index", as: "/" },
    { key: "me", as: "me" },
];

export function App() {
    return (
        <StylesProvider>
            <Body>
                <Nav />
                <Main>
                    <Outlet segs={children} />
                </Main>
            </Body>
        </StylesProvider>
    );
}
