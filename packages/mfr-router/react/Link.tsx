import React, { PropsWithChildren, useCallback, useContext } from "react";
import { BaseRouterContext } from "./BaseRouterProvider";

export function Link(props: PropsWithChildren<any>) {
    const { history } = useContext(BaseRouterContext);
    const onClick = useCallback(
        (evt) => {
            evt.preventDefault();
            history.push(evt.target.pathname);
        },
        [history]
    );
    return (
        <a href={props.to} onClick={onClick}>
            {props.children}
        </a>
    );
}
