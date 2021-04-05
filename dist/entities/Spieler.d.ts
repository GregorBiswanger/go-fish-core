import Karte from '../value-types/Karte';
import SatzGefunden from '../domain-events/SatzGefunden';
import { SpielerTyp } from '../value-types/SpielerTyp';
export default class Spieler {
    readonly name: string;
    readonly spielerTyp: SpielerTyp;
    get id(): string;
    private readonly _id;
    get karten(): readonly Karte[];
    private _karten;
    get saetze(): readonly Karte[];
    private _saetze;
    get satzGefunden(): import("rxjs").Observable<SatzGefunden>;
    private readonly _saetzeGefundenSubject;
    constructor(name: string, spielerTyp: SpielerTyp);
    private aufSaetzePruefen;
}
