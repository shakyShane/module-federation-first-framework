import * as React from "react"
import {BaseRouter, Resolver, RouterProvider} from "../src/router";
import {loadFromRemote} from "../src/loader/load-from-remote";

const resolver: Resolver = async (args, other) => {
    console.log(args, other);
    const o = await loadFromRemote({
        remote: {
            url: "/pages/app_pages_user_dashboard_tsx.js",
            name: "app_pages_user_dashboard_tsx"
        }
    });
    return {
        component: (await o()).default,
        query:{},
        params: {}
    }
};

export function App() {
    return (
        <BaseRouter>
            <div>
                <p>App Wrapper is here</p>
            </div>
            <RouterProvider segs={["/", "user"]} resolver={resolver} />
        </BaseRouter>
    )
}
