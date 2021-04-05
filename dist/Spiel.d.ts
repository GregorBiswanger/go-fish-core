import SpielerGewechselt from './domain-events/SpielerGewechselt';
import SpielerHatKartenErhalten from './domain-events/SpielerHatKartenErhalten';
import SpielEnde from './domain-events/SpielEnde';
import Spieler from './entities/Spieler';
import Karte from './value-types/Karte';
import { Wert } from './value-types/Wert';
export default class Spiel {
    get id(): string;
    private readonly _id;
    get deck(): readonly Karte[];
    private _deck;
    get spieler(): readonly Spieler[];
    private _spieler;
    get aktuellerSpielerId(): string;
    private _aktuellerSpielerId;
    get gestartet(): import("rxjs").Observable<unknown>;
    private readonly gestartetSubject;
    get spielerGewechselt(): import("rxjs").Observable<SpielerGewechselt>;
    private readonly spielerGewechseltSubject;
    get spielerHatKartenErhalten(): import("rxjs").Observable<SpielerHatKartenErhalten>;
    private readonly spielerHatKartenErhaltenSubject;
    get spielerIstFischenGegangen(): import("rxjs").Observable<SpielerHatKartenErhalten>;
    private readonly spielerIstFischenGegangenSubject;
    get spielEnde(): import("rxjs").Observable<SpielEnde>;
    private readonly spielEndeSubject;
    get gleicherSpielerNochmal(): import("rxjs").Observable<unknown>;
    private readonly gleicherSpielerNochmalSubject;
    starten(spielkarten: Karte[], spieler: Spielerliste): void;
    private verteileFuenfKartenAnSpieler;
    private naechsterSpieler;
    private istErsteSpielrunde;
    private fordereKarteFuerComputerSpieler;
    private gebeZufaelligAnderenSpieler;
    private gebeMeistVorhandenenKartenwert;
    spielerFragtNachKarten(mitspieler: string, kartenWert: Wert): void;
    private beendeZugNachErhaltenerKarte;
    private aktuellenSpielerErneutZiehenLassen;
    private habenAlleSpielerNochKarten;
    private gewinnerBekanntGeben;
    private spielerGehtFischen;
    private istKartenstapelLeer;
    private zieheZufaelligeKarteVomStapel;
    private gebeSpieler;
}
export declare type Spielerliste = [Spieler, Spieler] | [
    Spieler,
    Spieler,
    Spieler
] | [
    Spieler,
    Spieler,
    Spieler,
    Spieler
] | [
    Spieler,
    Spieler,
    Spieler,
    Spieler,
    Spieler
] | [
    Spieler,
    Spieler,
    Spieler,
    Spieler,
    Spieler,
    Spieler
];
