import { Farbe } from "./Farbe";
import { Wert } from "./Wert";

export default class Karte {
    constructor(public readonly farbe: Farbe, public readonly wert: Wert) {
        Object.freeze(this);
    }
}