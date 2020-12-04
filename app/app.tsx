import * as React from "react"
import { BaseRouter, RouterProvider } from "../src/router";
import { inspect } from "@xstate/inspect";

inspect({iframe: false});

const children = [
    {key: "index_tsx", seg: "/"},
    {key: "user_index_tsx", seg: "user"},
]

export function App() {
    console.log('APP');
    return (
        <BaseRouter>
            <div>
                <p>App Wrapper Greetings!</p>
            </div>
            <RouterProvider segs={children} />
            <b>belo</b>
        </BaseRouter>
    )
}
