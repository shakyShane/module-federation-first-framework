import { useContext } from "react";
import { useService } from "@xstate/react";
import { RouterContext } from "./RouterProvider";

export function useRouteData() {
    const { service } = useContext(RouterContext);
    const [state] = useService(service);
    return (state as any).context.routeData;
}

export function useResolveData() {
    const { service } = useContext(RouterContext);
    const [state] = useService(service);
    return (state as any).context.resolveData;
}
