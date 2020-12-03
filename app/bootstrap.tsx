import ReactDom from "react-dom";
import React from "react"; // <- this is a shared module, but used as usual
import { App } from "./app";

// load app
const el = document.getElementsByTagName("main")[0];
ReactDom.render(<App />, el);
