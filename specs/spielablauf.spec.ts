import Spieler from "../src/entities/Spieler";
import SpielkartenFactory from "../src/factories/SpielkartenFactory";
import Spiel, { Spielerliste } from "../src/Spiel";
import Karte from "../src/value-types/Karte";
import { SpielerTyp } from "../src/value-types/SpielerTyp";

describe('Spielablauf vom Go Fish Spiel', () => {
    let _spielkarten: Karte[];
    let _spieler: Spielerliste;

    beforeEach(() => {
        const spielkartenFactory = new SpielkartenFactory();

        _spielkarten = spielkartenFactory.erzeugen();

        _spieler = [new Spieler('Gregor', SpielerTyp.Mensch),
        new Spieler('Lorum', SpielerTyp.Computer)];
    })

    it('52 Spielkarten vorbereiten', () => {
        const spielkartenFactory = new SpielkartenFactory();

        const karten: Karte[] = spielkartenFactory.erzeugen();

        expect(karten.length).toBe(52);
    });

    it('Spiel hat 52 Spielkarten und zwei Spieler erhalten', () => {       
        const spiel = new Spiel();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(spiel, 'verteileFuenfKartenAnSpieler').mockImplementation();

        spiel.starten(_spielkarten, _spieler);

        expect(spiel.deck.length).toBe(52);
    });

    it('Jedem Spieler 5 zufällige Karten vom Deck geben', () => {
        const spiel = new Spiel();

        spiel.starten(_spielkarten, _spieler);

        expect(spiel.deck.length).toBe(42);
        expect(spiel.spieler[0].karten.length).toBe(5);
        expect(spiel.spieler[1].karten.length).toBe(5);
    });

});