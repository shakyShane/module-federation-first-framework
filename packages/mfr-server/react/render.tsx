import { Result, ResultKind } from "../result";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { Context } from "mfr-router/router";

type Params = {
    mod: any;
    req: Request;
    res: Response;
};

export async function render(params: Params): Promise<Result> {
    const { mod, req, res } = params;
    const todo = null;
    const ctx = {
        routers: {},
    };
    const register = (incoming: Context) =>
        (ctx.routers[incoming.depth] = incoming);
    let renderCount = 0;
    async function renderOnce() {
        const html = renderToStaticMarkup(mod.default(req, res, ctx));
        renderCount += 1;
        if (Object.keys(ctx.routers).length > 0) {
            await resolve(ctx);
            return await renderOnce();
        }
        return html;
    }
    const html = await renderOnce();
    console.log("render count", renderCount);
    return {
        kind: ResultKind.Response,
        html,
        status: 200,
    };
}

async function resolve(ctx) {
    console.log("incoming ctx", ctx);
}
