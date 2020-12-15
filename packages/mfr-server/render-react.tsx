import React from "react";
import { App } from "../../app/app";
import { BaseRouter } from "mfr-router";
import { createLocation } from "history";

export function render() {
    return (
        <BaseRouter location={createLocation("/")}>
            <App />
        </BaseRouter>
    );
}
