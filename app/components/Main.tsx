import React, { PropsWithChildren } from "react";

export function Main(props: PropsWithChildren<any>) {
    return (
        <div className={"page page--inbox page--full-width@large"}>
            <div className="page__content">{props.children}</div>
        </div>
    );
}
