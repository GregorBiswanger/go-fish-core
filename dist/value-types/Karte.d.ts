import { Farbe } from "./Farbe";
import { Wert } from "./Wert";
export default class Karte {
    readonly farbe: Farbe;
    readonly wert: Wert;
    constructor(farbe: Farbe, wert: Wert);
}
