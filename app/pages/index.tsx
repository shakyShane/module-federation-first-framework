import React from "react";
import {Link} from "../../src/router";

export function Home() {
    return (
        <div>
            <h1>Home</h1>
            <p><Link to={"/user"}>User</Link></p>
        </div>
    )
}

export default Home;
