import SpielerGewechselt from './domain-events/SpielerGewechselt';
import SpielerHatKartenErhalten from './domain-events/SpielerHatKartenErhalten';
import SpielEnde from './domain-events/SpielEnde';
import Spieler from './entities/Spieler';
import Karte from './value-types/Karte';
import { Subject } from 'rxjs';
import { NIL as NIL_UUID, v4 as uuidv4 } from 'uuid';
import { Wert } from './value-types/Wert';
import { SpielerTyp } from './value-types/SpielerTyp';

export default class Spiel {
    get id() { return this._id; }
    private readonly _id: string = uuidv4();

    get deck() { return this._deck; }
    private _deck: ReadonlyArray<Karte> = [];

    get spieler() { return this._spieler; }
    private _spieler: ReadonlyArray<Spieler> = [];

    get aktuellerSpielerId() { return this._aktuellerSpielerId; }
    private _aktuellerSpielerId: string = NIL_UUID;

    get gestartet() {
        return this.gestartetSubject.asObservable();
    }
    private readonly gestartetSubject = new Subject();

    get spielerGewechselt() {
        return this.spielerGewechseltSubject.asObservable();
    }
    private readonly spielerGewechseltSubject = new Subject<SpielerGewechselt>();

    get spielerHatKartenErhalten() {
        return this.spielerHatKartenErhaltenSubject.asObservable();
    }
    private readonly spielerHatKartenErhaltenSubject = new Subject<SpielerHatKartenErhalten>();

    get spielerIstFischenGegangen() {
        return this.spielerIstFischenGegangenSubject.asObservable();
    }
    private readonly spielerIstFischenGegangenSubject = new Subject<SpielerHatKartenErhalten>();

    get spielEnde() {
        return this.spielEndeSubject.asObservable();
    }
    private readonly spielEndeSubject = new Subject<SpielEnde>();

    get gleicherSpielerNochmal() {
        return this.gleicherSpielerNochmalSubject.asObservable();
    }
    private readonly gleicherSpielerNochmalSubject = new Subject();

    starten(spielkarten: Karte[], spieler: Spielerliste) {
        this._deck = [...spielkarten];
        this._spieler = [...spieler];

        this.verteileFuenfKartenAnSpieler();
        this.gestartetSubject.next();
        this.naechsterSpieler();
    }

    private verteileFuenfKartenAnSpieler() {
        this.spieler.forEach(spieler => {
            for (let index = 0; index < 5; index++) {
                const randomIndex = Math.floor(Math.random() * this.deck.length);
                const deck = [...this.deck];
                const karte: Karte[] = deck.splice(randomIndex, 1);

                spieler.kartenNehmen(karte);
                this._deck = [...deck];
            }
        });
    }

    private naechsterSpieler() {
        if (this.istErsteSpielrunde()) {
            this._aktuellerSpielerId = this.spieler[0].id;
        } else {
            const aktuellerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
            const aktuellerSpielerIndex = this.spieler.indexOf(aktuellerSpieler);

            const naechsterSpielerIndex = (aktuellerSpielerIndex + 1) % this.spieler.length;

            this._aktuellerSpielerId = this.spieler[naechsterSpielerIndex].id;
        }

        this.spielerGewechseltSubject.next(new SpielerGewechselt(this.aktuellerSpielerId));

        const neuerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
        if (neuerSpieler.spielerTyp === SpielerTyp.Computer) {
            this.fordereKarteFuerComputerSpieler(neuerSpieler);
        }
    }

    private istErsteSpielrunde() {
        return this.aktuellerSpielerId === NIL_UUID;
    }

    private fordereKarteFuerComputerSpieler(computerSpieler: Spieler) {
        const kartenwert = this.gebeMeistVorhandenenKartenwert(computerSpieler);
        const mitspieler = this.gebeZufaelligAnderenSpieler(computerSpieler);

        this.spielerFragtNachKarten(mitspieler.id, kartenwert);
    }

    private gebeZufaelligAnderenSpieler(aktuellerSpieler: Spieler) {
        const aktuellerSpielerIndex = this.spieler.indexOf(aktuellerSpieler);
        let andererSpielerIndex: number;
        do {
            andererSpielerIndex = Math.floor(Math.random() * this.spieler.length);
        } while (andererSpielerIndex === aktuellerSpielerIndex);

        return this.spieler[andererSpielerIndex];
    }

    private gebeMeistVorhandenenKartenwert(spieler: Spieler) {
        const kartenwertHistogramm = new Map<Wert, number>();

        spieler.karten.forEach(karte => {
            const kartenwertAnzahl = kartenwertHistogramm.get(karte.wert) ?? 0;
            kartenwertHistogramm.set(karte.wert, kartenwertAnzahl + 1);
        });

        return [...kartenwertHistogramm.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];
    }

    spielerFragtNachKarten(mitspieler: string, kartenWert: Wert) {
        const gegenSpieler = this.gebeSpieler(mitspieler);
        const aktuellerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
        const erhalteneKarten = gegenSpieler.gebeKarten(kartenWert);

        if (erhalteneKarten.length) {
            aktuellerSpieler.kartenNehmen(erhalteneKarten);

            this.spielerHatKartenErhaltenSubject.next(new SpielerHatKartenErhalten(
                this.aktuellerSpielerId,
                [...erhalteneKarten]));

            this.beendeZugNachErhaltenerKarte();
        } else {
            this.spielerGehtFischen(kartenWert);
        }
    }

    private beendeZugNachErhaltenerKarte() {
        if (this.habenAlleSpielerNochKarten()) {
            this.aktuellenSpielerErneutZiehenLassen();
        } else {
            this.gewinnerBekanntGeben();
        }
    }

    private aktuellenSpielerErneutZiehenLassen() {
        this.gleicherSpielerNochmalSubject.next();

        const neuerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
        if (neuerSpieler.spielerTyp === SpielerTyp.Computer) {
            this.fordereKarteFuerComputerSpieler(neuerSpieler);
        }
    }

    private habenAlleSpielerNochKarten() {
        return this.spieler.every(spieler => spieler.karten.length > 0);
    }

    private gewinnerBekanntGeben() {
        const spieler = [...this.spieler];
        const gewinnerSpieler = spieler.sort((a, b) => b.saetze.length - a.saetze.length)[0];
        this.spielEndeSubject.next(new SpielEnde(
            gewinnerSpieler.id,
            gewinnerSpieler.saetze.length / 4
        ));
    }

    private spielerGehtFischen(erhoffterKartenWert: Wert) {
        const aktuellerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
        const gezogeneKarte = this.zieheZufaelligeKarteVomStapel();

        aktuellerSpieler.kartenNehmen([gezogeneKarte]);
        this.spielerIstFischenGegangenSubject.next(new SpielerHatKartenErhalten(
            aktuellerSpieler.id,
            [gezogeneKarte]
        ));

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

    private istKartenstapelLeer() {
        return this.deck.length === 0;
    }

    private zieheZufaelligeKarteVomStapel() {
        const deck = [...this.deck];
        const zufaelligerIndex = Math.floor(Math.random() * deck.length);
        const gezogeneKarte = deck.splice(zufaelligerIndex, 1)[0];
        this._deck = [...deck];

        return gezogeneKarte;
    }

    private gebeSpieler(spielerId: string) {
        const spieler = this.spieler.find(spieler => spieler.id === spielerId);
        if (!spieler) {
            throw new Error(`Es gibt keinen Spieler mit der ID ${spielerId}`);
        }
        return spieler;
    }
}

export type Spielerliste = [Spieler, Spieler] |
[Spieler, Spieler, Spieler] |
[Spieler, Spieler, Spieler, Spieler] |
[Spieler, Spieler, Spieler, Spieler, Spieler] |
[Spieler, Spieler, Spieler, Spieler, Spieler, Spieler];