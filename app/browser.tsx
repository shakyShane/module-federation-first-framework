import ReactDom from "react-dom";
import React from "react"; // <- this is a shared module, but used as usual
import { App } from "./app";
import { createLocation } from "history";
import { BaseRouterProvider } from "mfr-router";

// load app
const el = document.getElementsByTagName("main")[0];
ReactDom.hydrate(
    <BaseRouterProvider
        location={createLocation(window.location.pathname)}
        routers={{}}
        register={() => console.log("register")}
    >
        <App />
    </BaseRouterProvider>,
    el
);
