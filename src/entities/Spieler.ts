import Karte from '../value-types/Karte';
import SatzGefunden from '../domain-events/SatzGefunden';
import { v4 as uuidv4 } from 'uuid';
import { Subject } from 'rxjs';
import { SpielerTyp } from '../value-types/SpielerTyp';
import { Wert } from '../value-types/Wert';

export default class Spieler {
    get id() { return this._id; }
    private readonly _id: string = uuidv4();

    get karten() { return this._karten; }
    private _karten: ReadonlyArray<Karte> = [];

    get saetze() { return this._saetze; }
    private _saetze: ReadonlyArray<Karte> = [];

    get satzGefunden() { return this._saetzeGefundenSubject.asObservable(); }
    private readonly _saetzeGefundenSubject = new Subject<SatzGefunden>();

    constructor(public readonly name: string,
        public readonly spielerTyp: SpielerTyp) {
    }

    /** @internal */
    kartenNehmen(karten: Karte[]) {
        this._karten = [...this.karten, ...karten];

        this.aufSaetzePruefen();
    }

    private aufSaetzePruefen() {
        const kartenProWert = new Map<Wert, Karte[]>();

        this.karten.forEach(karte => {
            const karten = kartenProWert.get(karte.wert) ?? [];
            karten.push(karte);

            kartenProWert.set(karte.wert, karten);
        });

        kartenProWert.forEach((karten: Karte[]) => {
            if (karten.length === 4) {
                this._saetze = [...this.saetze, ...karten];
                this._karten = this.karten.filter(karte => !karten.includes(karte));

                this._saetzeGefundenSubject.next(new SatzGefunden([...karten] as ReadonlyArray<Karte>));
            }
        });
    }

    /** @internal */
    gebeKarten(kartenWert: Wert) {
        const karten = this.karten.filter(karte => karte.wert === kartenWert);
        this._karten = this.karten.filter(karte => karte.wert !== kartenWert);

        return [...karten];
    }
}