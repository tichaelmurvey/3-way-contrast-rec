
import chroma from "chroma-js";

//Check contrast ratio compliance for two chroma colors
export function checkCompliant (change_color, stable_color, ratio) {
    return (chroma.contrast(change_color, stable_color) >= ratio ? true : false);
}
