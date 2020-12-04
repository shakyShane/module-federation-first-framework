import React from "react";
import {Link, RouterProvider} from "../../../src/router";

const children = [
    {key: "user_dashboard_tsx", seg: "dashboard"},
]

export function User() {
    return (
        <div>
            <h1>User</h1>
            <p><Link to={"/"}>Home</Link></p>
            <p><Link to={"/user/dashboard"}>Dashboard</Link></p>
            <RouterProvider segs={children} />
        </div>
    )
}

export default User;
