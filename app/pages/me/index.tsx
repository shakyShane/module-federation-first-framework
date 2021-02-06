import React, { useContext } from "react";
import { StylesContext } from "../../shared/Styles";

function Me() {
    const { setBodyClass } = useContext(StylesContext);
    setBodyClass("training-wheels");
    return <p>Shane Osbourne is here and is great</p>;
}

export default Me;
