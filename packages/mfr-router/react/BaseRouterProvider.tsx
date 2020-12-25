import React, {
    createContext,
    PropsWithChildren,
    useEffect,
    useMemo,
} from "react";
import { createBrowserHistory, History } from "history";
import { Interpreter } from "xstate";
import { useMachine } from "@xstate/react";
import useConstant from "@xstate/react/lib/useConstant";
import { BaseEvt, baseMachine } from "../router-base";
import { Context } from "../router";

export const BaseRouterContext = createContext<{
    history: History;
    send: Interpreter<any, any, BaseEvt>["send"];
    service: any;
    routers: Record<number, Context>;
    register(ctx: Context);
}>({
    send: null as any,
    service: null,
    history: null as any,
    routers: {},
    register: (ctx: Context) => {
        console.error("implementation of register missing");
    },
});

const noop = () => {
    /* noop */
};

type BaseRouterProps = {
    location: History["location"];
    resolvers?: { add() };
    dataLoaders?: { add() };
    routers: Record<number, Context>;
    register(ctx: Context);
};

export function BaseRouterProvider(props: PropsWithChildren<BaseRouterProps>) {
    const { routers, register } = props;
    const [state, send, service] = useMachine(baseMachine, { devTools: true });
    const bh = useConstant(() => {
        if (typeof window === "undefined") {
            return { location: props.location, listen: noop } as any;
        } else {
            return createBrowserHistory();
        }
    });
    useEffect(() => {
        const unlisten = bh.listen((location, action) => {
            send({ type: "HISTORY_EVT", location, action });
        });
        return () => {
            if (typeof unlisten === "function") {
                unlisten();
            }
        };
    }, [send]);
    const api = useMemo(() => {
        return { history: bh, send, service, routers, register };
    }, [send, service, routers, register]);
    return (
        <BaseRouterContext.Provider value={api}>
            {props.children}
        </BaseRouterContext.Provider>
    );
}
