import { Subject } from 'rxjs';
import { NIL as NIL_UUID, v4 as uuidv4 } from 'uuid';
import SpielerGewechselt from './domain-events/SpielerGewechselt';
import SpielerHatKartenErhalten from './domain-events/SpielerHatKartenErhalten';
import SpielEnde from './domain-events/SpielEnde';
import Spieler from './entities/Spieler';
import Karte from './value-types/Karte';
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
        if (this.aktuellerSpielerId === NIL_UUID) {
            this._aktuellerSpielerId = this.spieler[0].id;
        } else {
            const aktuellerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
            const aktuellerSpielerIndex = this.spieler.indexOf(aktuellerSpieler);

            const naechsterSpielerIndex = (aktuellerSpielerIndex + 1) % this.spieler.length; 
            this._aktuellerSpielerId = this.spieler[naechsterSpielerIndex].id;
        }

        this.spielerGewechseltSubject.next(new SpielerGewechselt(this.aktuellerSpielerId));

        const neuerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
        if (neuerSpieler?.spielerTyp === SpielerTyp.Computer) {
            this.computerSpielerSollKarteFordern(neuerSpieler);
        }
    }

    private computerSpielerSollKarteFordern(computerSpieler: Spieler) {
        const kartenWert = computerSpieler.frageNachKartenwert();
        if (!kartenWert) {
            // FIXME: Computer will nix :D
            return;
        }

        const aktuellerSpielerIndex = this.spieler.indexOf(computerSpieler);
        let zufallsIndex = -1;
        do {
            zufallsIndex = Math.floor(Math.random() * this.spieler.length);
        } while (zufallsIndex != aktuellerSpielerIndex); 

        this.spielerFragtNachKarten(this.spieler[zufallsIndex].id, kartenWert);
    }

    private spielerNochmal() {
        this.gleicherSpielerNochmalSubject.next();
    }

    spielerFragtNachKarten(gefragterSpielerId: string, kartenWert: Wert) {
        const gefragterSpieler = this.gebeSpieler(gefragterSpielerId);
        const aktuellerSpieler = this.gebeSpieler(this.aktuellerSpielerId);
        const erhalteneKarten = gefragterSpieler.gebeKarten(kartenWert);

        if (erhalteneKarten.length) {
            aktuellerSpieler.kartenNehmen(erhalteneKarten);

            this.spielerHatKartenErhaltenSubject.next(new SpielerHatKartenErhalten(
                this.aktuellerSpielerId,
                [...erhalteneKarten]));

            this.habenAlleSpielerNochKarten();
        } else {
            this.spielerGehtFischen(kartenWert);
        }
    }

    private habenAlleSpielerNochKarten() {
        if (this.spieler.some(spieler => spieler.karten.length === 0)) {
            this.gewinnerBekanntGeben();
        } else {
            this.spielerNochmal();
        }
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
        const karte = this.zieheZufälligeKarteVomStapel();

        aktuellerSpieler.kartenNehmen([karte]);
        this.spielerIstFischenGegangenSubject.next(new SpielerHatKartenErhalten(
            aktuellerSpieler.id,
            [karte]
        ));

        if (this.istKartenstapelLeer()) {
            this.gewinnerBekanntGeben();
        }
        else if (karte.wert === erhoffterKartenWert) {
            this.spielerNochmal();
        }
        else {
            this.naechsterSpieler();
        }
    }

    private zieheZufälligeKarteVomStapel() {
        const deck = [...this.deck];
        const karte = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
        this._deck = [...deck];

        return karte;
    }

    private istKartenstapelLeer() {
        return this.deck.length === 0;
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