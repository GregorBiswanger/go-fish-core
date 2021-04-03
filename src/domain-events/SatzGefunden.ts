import Karte from "../value-types/Karte";

export default class SatzGefunden {
    constructor(public readonly satz: ReadonlyArray<Karte>) { 
        Object.freeze(this);
    }
}