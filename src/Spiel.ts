import { v4 as uuidv4 } from 'uuid';
import Spieler from './entities/Spieler';
import Karte from './value-types/Karte';

export default class Spiel {
    get id() { return this._id; }
    private readonly _id: string = uuidv4();

    get deck() { return this._deck; }
    private _deck: ReadonlyArray<Karte> = [];

    get spieler() { return this._spieler; }
    private _spieler: ReadonlyArray<Spieler> = [];

    starten(spielkarten: Karte[], spieler: Spielerliste) {
        this._deck = [...spielkarten];
        this._spieler = [...spieler];

        this.verteileFuenfKartenAnSpieler();
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
}

export type Spielerliste = [Spieler, Spieler] |
[Spieler, Spieler, Spieler] |
[Spieler, Spieler, Spieler, Spieler] |
[Spieler, Spieler, Spieler, Spieler, Spieler] | 
[Spieler, Spieler, Spieler, Spieler, Spieler, Spieler];