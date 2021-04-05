"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SpielerGewechselt_1 = __importDefault(require("./domain-events/SpielerGewechselt"));
const SpielerHatKartenErhalten_1 = __importDefault(require("./domain-events/SpielerHatKartenErhalten"));
const SpielEnde_1 = __importDefault(require("./domain-events/SpielEnde"));
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
const SpielerTyp_1 = require("./value-types/SpielerTyp");
class Spiel {
    constructor() {
        this._id = uuid_1.v4();
        this._deck = [];
        this._spieler = [];
        this._aktuellerSpielerId = uuid_1.NIL;
        this.gestartetSubject = new rxjs_1.Subject();
        this.spielerGewechseltSubject = new rxjs_1.Subject();
        this.spielerHatKartenErhaltenSubject = new rxjs_1.Subject();
        this.spielerIstFischenGegangenSubject = new rxjs_1.Subject();
        this.spielEndeSubject = new rxjs_1.Subject();
        this.gleicherSpielerNochmalSubject = new rxjs_1.Subject();
    }
    get id() { return this._id; }
    get deck() { return this._deck; }
    get spieler() { return this._spieler; }
    get aktuellerSpielerId() { return this._aktuellerSpielerId; }
    get gestartet() {
        return this.gestartetSubject.asObservable();
    }
    get spielerGewechselt() {
        return this.spielerGewechseltSubject.asObservable();
    }
    get spielerHatKartenErhalten() {
        return this.spielerHatKartenErhaltenSubject.asObservable();
    }
    get spielerIstFischenGegangen() {
        return this.spielerIstFischenGegangenSubject.asObservable();
    }
    get spielEnde() {
        return this.spielEndeSubject.asObservable();
    }
    get gleicherSpielerNochmal() {
        return this.gleicherSpielerNochmalSubject.asObservable();
    }
    starten(spielkarten, spieler) {
        this._deck = [...spielkarten];
        this._spieler = [...spieler];
        this.verteileFuenfKartenAnSpieler();
        this.gestartetSubject.next();
        this.naechsterSpieler();
    }
    verteileFuenfKartenAnSpieler() {
        this.spieler.forEach(spieler => {
            for (let index = 0; index < 5; index++) {
                const randomIndex = Math.floor(Math.random() * this.deck.length);
                const deck = [...this.deck];
                const karte = deck.splice(randomIndex, 1);
                spieler.kartenNehmen(karte);
                this._deck = [...deck];
            }
        });
    }
    naechsterSpieler() {
        if (this.istErsteSpielrunde()) {
            this._aktuellerSpielerId = this.spieler[0].id;
        }
        else {
            const aktuellerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
            const aktuellerSpielerIndex = this.spieler.indexOf(aktuellerSpieler);
            const naechsterSpielerIndex = (aktuellerSpielerIndex + 1) % this.spieler.length;
            this._aktuellerSpielerId = this.spieler[naechsterSpielerIndex].id;
        }
        this.spielerGewechseltSubject.next(new SpielerGewechselt_1.default(this.aktuellerSpielerId));
        const neuerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
        if (neuerSpieler.spielerTyp === SpielerTyp_1.SpielerTyp.Computer) {
            this.fordereKarteFuerComputerSpieler(neuerSpieler);
        }
    }
    istErsteSpielrunde() {
        return this.aktuellerSpielerId === uuid_1.NIL;
    }
    fordereKarteFuerComputerSpieler(computerSpieler) {
        const kartenwert = this.gebeMeistVorhandenenKartenwert(computerSpieler);
        const mitspieler = this.gebeZufaelligAnderenSpieler(computerSpieler);
        this.spielerFragtNachKarten(mitspieler.id, kartenwert);
    }
    gebeZufaelligAnderenSpieler(aktuellerSpieler) {
        const aktuellerSpielerIndex = this.spieler.indexOf(aktuellerSpieler);
        let andererSpielerIndex;
        do {
            andererSpielerIndex = Math.floor(Math.random() * this.spieler.length);
        } while (andererSpielerIndex != aktuellerSpielerIndex);
        return this.spieler[andererSpielerIndex];
    }
    gebeMeistVorhandenenKartenwert(spieler) {
        const kartenwertHistogramm = new Map();
        spieler.karten.forEach(karte => {
            var _a;
            const kartenwertAnzahl = (_a = kartenwertHistogramm.get(karte.wert)) !== null && _a !== void 0 ? _a : 0;
            kartenwertHistogramm.set(karte.wert, kartenwertAnzahl + 1);
        });
        return [...kartenwertHistogramm.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];
    }
    spielerFragtNachKarten(mitspieler, kartenWert) {
        const gegenSpieler = this.gebeSpieler(mitspieler);
        const aktuellerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
        const erhalteneKarten = gegenSpieler.gebeKarten(kartenWert);
        if (erhalteneKarten.length) {
            aktuellerSpieler.kartenNehmen(erhalteneKarten);
            this.spielerHatKartenErhaltenSubject.next(new SpielerHatKartenErhalten_1.default(this.aktuellerSpielerId, [...erhalteneKarten]));
            this.beendeZugNachErhaltenerKarte();
        }
        else {
            this.spielerGehtFischen(kartenWert);
        }
    }
    beendeZugNachErhaltenerKarte() {
        if (this.habenAlleSpielerNochKarten()) {
            this.aktuellenSpielerErneutZiehenLassen();
        }
        else {
            this.gewinnerBekanntGeben();
        }
    }
    aktuellenSpielerErneutZiehenLassen() {
        this.gleicherSpielerNochmalSubject.next();
    }
    habenAlleSpielerNochKarten() {
        return this.spieler.every(spieler => spieler.karten.length > 0);
    }
    gewinnerBekanntGeben() {
        const spieler = [...this.spieler];
        const gewinnerSpieler = spieler.sort((a, b) => b.saetze.length - a.saetze.length)[0];
        this.spielEndeSubject.next(new SpielEnde_1.default(gewinnerSpieler.id, gewinnerSpieler.saetze.length / 4));
    }
    spielerGehtFischen(erhoffterKartenWert) {
        const aktuellerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
        const gezogeneKarte = this.zieheZufaelligeKarteVomStapel();
        aktuellerSpieler.kartenNehmen([gezogeneKarte]);
        this.spielerIstFischenGegangenSubject.next(new SpielerHatKartenErhalten_1.default(aktuellerSpieler.id, [gezogeneKarte]));
        if (this.istKartenstapelLeer()) {
            this.gewinnerBekanntGeben();
        }
        else if (gezogeneKarte.wert === erhoffterKartenWert) {
            this.aktuellenSpielerErneutZiehenLassen();
        }
        else {
            this.naechsterSpieler();
        }
    }
    istKartenstapelLeer() {
        return this.deck.length === 0;
    }
    zieheZufaelligeKarteVomStapel() {
        const deck = [...this.deck];
        const zufaelligerIndex = Math.floor(Math.random() * deck.length);
        const gezogeneKarte = deck.splice(zufaelligerIndex, 1)[0];
        this._deck = [...deck];
        return gezogeneKarte;
    }
    gebeSpieler(spielerId) {
        const spieler = this.spieler.find(spieler => spieler.id === spielerId);
        if (!spieler) {
            throw new Error(`Es gibt keinen Spieler mit der ID ${spielerId}`);
        }
        return spieler;
    }
}
exports.default = Spiel;
