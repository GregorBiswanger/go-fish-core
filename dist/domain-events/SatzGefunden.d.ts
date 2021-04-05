import Karte from "../value-types/Karte";
export default class SatzGefunden {
    readonly satz: ReadonlyArray<Karte>;
    constructor(satz: ReadonlyArray<Karte>);
}
