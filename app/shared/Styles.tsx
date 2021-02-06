import React, { PropsWithChildren, useMemo, useState } from "react";

export const StylesContext = React.createContext<{
    bodyClass: string;
    setBodyClass: (input: string) => void;
}>({
    bodyClass: "",
    setBodyClass: () => {
        console.log("unimplmented setBodyClass");
    },
});
export function StylesProvider(props: PropsWithChildren<any>) {
    const [bodyClass, setBodyClass] = useState("");
    const api = useMemo(() => {
        return { bodyClass, setBodyClass };
    }, [bodyClass, setBodyClass]);
    return (
        <StylesContext.Provider value={api}>
            {props.children}
        </StylesContext.Provider>
    );
}
