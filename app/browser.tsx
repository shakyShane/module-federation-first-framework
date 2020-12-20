import ReactDom from "react-dom";
import React from "react"; // <- this is a shared module, but used as usual
import { App } from "./app";
import { BaseRouter } from "mfr-router";
import { createLocation } from "history";

// load app
const el = document.getElementsByTagName("main")[0];
ReactDom.hydrate(
    <BaseRouter location={createLocation(window.location.pathname)}>
        <App />
    </BaseRouter>,
    el
);
