import React, { PropsWithChildren, useContext, useEffect } from "react";
import { StylesContext } from "../shared/Styles";
// import { useRouteData } from "mfr-router";
const HOME =
    "body--inbox body--shortcuts body--shortcuts-inbox training-wheels";
const NONE_HOME = "training-wheels";

export function Body(props: PropsWithChildren<any>) {
    const { bodyClass } = useContext(StylesContext);
    return <div className={bodyClass}>{props.children}</div>;
}
