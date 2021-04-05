"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SatzGefunden_1 = __importDefault(require("../domain-events/SatzGefunden"));
const uuid_1 = require("uuid");
const rxjs_1 = require("rxjs");
class Spieler {
    constructor(name, spielerTyp) {
        this.name = name;
        this.spielerTyp = spielerTyp;
        this._id = uuid_1.v4();
        this._karten = [];
        this._saetze = [];
        this._saetzeGefundenSubject = new rxjs_1.Subject();
    }
    get id() { return this._id; }
    get karten() { return this._karten; }
    get saetze() { return this._saetze; }
    get satzGefunden() { return this._saetzeGefundenSubject.asObservable(); }
    /** @internal */
    kartenNehmen(karten) {
        this._karten = [...this.karten, ...karten];
        this.aufSaetzePruefen();
    }
    aufSaetzePruefen() {
        const kartenProWert = new Map();
        this.karten.forEach(karte => {
            var _a;
            const karten = (_a = kartenProWert.get(karte.wert)) !== null && _a !== void 0 ? _a : [];
            karten.push(karte);
            kartenProWert.set(karte.wert, karten);
        });
        kartenProWert.forEach((karten) => {
            if (karten.length === 4) {
                this._saetze = [...this.saetze, ...karten];
                this._karten = this.karten.filter(karte => !karten.includes(karte));
                this._saetzeGefundenSubject.next(new SatzGefunden_1.default([...karten]));
            }
        });
    }
    /** @internal */
    gebeKarten(kartenWert) {
        const karten = this.karten.filter(karte => karte.wert === kartenWert);
        this._karten = this.karten.filter(karte => karte.wert !== kartenWert);
        return [...karten];
    }
}
exports.default = Spieler;
