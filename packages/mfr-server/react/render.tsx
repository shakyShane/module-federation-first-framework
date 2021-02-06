import { Result, ResultKind } from "../result";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { Context } from "mfr-router/router";
import { pageLoader } from "mfr-router/page-loader";

type Params = {
    mod: any;
    req: Request;
    res: Response;
};

export async function render(params: Params): Promise<Result> {
    const { mod, req, res } = params;
    const todo = null;
    let renderCount = 0;
    let registerCount = 0;
    const ctx = {
        routers: {},
        register: (incoming: Context) => {
            console.log("register--->", incoming.depth);
            registerCount += 1;
            ctx.routers[incoming.depth] = incoming;
        },
    };
    const html = renderToStaticMarkup(mod.default(req, res, ctx));
    console.log("--~~>", ctx.routers['0']);
    // async function renderOnce() {
    //     renderCount += 1;
    //     const keys = Object.keys(ctx.routers);
    //     const filtered = keys.filter(
    //         (depth) => !ctx.routers[String(depth)].component
    //     );
    //     if (filtered.length > 0) {
    //         console.log("|||ctx.routers|||", keys);
    //         await Promise.all(
    //             keys.map(async (depth) => {
    //                 const curr = ctx.routers[depth];
    //                 console.log("curr", curr);
    //                 await resolve(curr);
    //             })
    //         );
    //         const html = await renderOnce();
    //         // keys.forEach((key) => delete ctx.routers[key]);
    //         console.log("ctx.routers", ctx.routers);
    //         return html;
    //     }
    //     return html;
    // }
    // const html = await renderOnce();
    // console.log("render count", renderCount);
    // console.log("register count", registerCount);
    // console.log("html=%O", html);
    return {
        kind: ResultKind.Response,
        html: "oops!",
        status: 200,
    };
}

async function resolve(ctx: Context) {
    ctx.component = function HelloWorld() {
        return <p>Hello world!</p>;
    };
}
