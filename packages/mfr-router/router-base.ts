import { History } from "history";
import { assign, Machine, send } from "xstate";
import { pure } from "xstate/lib/actions";
import debugpkg from "debug";
import matchPath from "./match-path";
const trace = debugpkg("router:trace");

export interface Matcher {
    path: string;
    depth: number;
}

export interface SelectParams {
    inputs: Matcher[];
    pathname: string;
    exact: boolean;
}

type BaseContext = {
    matchers: Matcher[];
};

//prettier-ignore
export type BaseEvt =
    | {
    type: '@external.TRIGGER_RESOLVE';
    depth: number;
    exact: boolean;
    location: History['location'];
    action: History['action'];
    matchData: any
}
    | { type: 'REGISTER'; matchers: Matcher[] }
    | { type: 'UNREGISTER'; depth: number }
    | { type: 'HISTORY_EVT'; location: History['location']; action: History['action'] };

export const baseMachine = Machine<BaseContext, Record<string, any>, BaseEvt>(
    {
        id: "base-router",
        initial: "idle",
        context: {
            matchers: [],
        },
        states: {
            idle: {},
        },
        on: {
            HISTORY_EVT: { actions: "notifyRouters" },
            REGISTER: { actions: "assignMatchers" },
            UNREGISTER: { actions: "removeMatchers" },
        },
    },
    {
        actions: {
            assignMatchers: assign({
                matchers: (ctx, evt) => {
                    switch (evt.type) {
                        case "REGISTER": {
                            const matches = ctx.matchers.concat(evt.matchers);
                            return matches;
                        }
                        default:
                            return ctx.matchers;
                    }
                },
            }),
            removeMatchers: assign({
                matchers: (ctx, evt) => {
                    switch (evt.type) {
                        case "UNREGISTER": {
                            return ctx.matchers.filter(
                                (ctxM) => ctxM.depth !== evt.depth
                            );
                        }
                        default:
                            return ctx.matchers;
                    }
                },
            }),
            notifyRouters: pure((ctx, evt) => {
                switch (evt.type) {
                    case "HISTORY_EVT": {
                        const location = evt.location;
                        const action = evt.action;
                        const segLength = location.pathname.slice(1).split("/")
                            .length;

                        const depthFirstSorted = ctx.matchers
                            .filter((x) => x.depth + 1 <= segLength)
                            .sort((a, b) => b.depth - a.depth);

                        const exactMatch = select({
                            inputs: depthFirstSorted,
                            pathname: location.pathname,
                            exact: true,
                        });

                        if (exactMatch.match) {
                            const output = {
                                type: "@external.TRIGGER_RESOLVE",
                                depth: exactMatch.match.depth,
                                exact: true,
                                location,
                                action,
                                matchData: exactMatch.matchData,
                            };
                            trace("exact match = %o", output);
                            return send(output);
                        }

                        const noneExact = select({
                            inputs: depthFirstSorted,
                            pathname: location.pathname,
                            exact: false,
                        });

                        if (noneExact.match) {
                            const output = {
                                type: "@external.TRIGGER_RESOLVE",
                                depth: noneExact.match.depth,
                                exact: false,
                                location,
                                action,
                                matchData: noneExact.matchData,
                            };
                            trace("none-exact match %o", output);
                            return send(output);
                        }

                        console.warn("no matching route found");
                    }
                }
                return undefined;
            }),
        },
    }
);

export function select(inputs: SelectParams) {
    trace("considering %o", inputs);
    let matchData;
    let match = inputs.inputs.find((m) => {
        const input = { path: m.path, exact: inputs.exact };
        trace("[select] ? pathname=%o vs %o", inputs.pathname, input);
        const res = matchPath(inputs.pathname, input);
        trace("[select] = %o", res);
        if (res) {
            matchData = res;
        }
        return res;
    });
    return { match, matchData };
}
