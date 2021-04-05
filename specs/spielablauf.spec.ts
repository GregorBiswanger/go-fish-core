import Spieler from "../src/entities/Spieler";
import SpielkartenFactory from "../src/factories/SpielkartenFactory";
import Spiel, { Spielerliste } from "../src/Spiel";
import { Farbe } from "../src/value-types/Farbe";
import Karte from "../src/value-types/Karte";
import { SpielerTyp } from "../src/value-types/SpielerTyp";
import { Wert } from "../src/value-types/Wert";
import { take, skip, filter } from "rxjs/operators";

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

    it('Jedem Spieler 5 zufällige Karten vom Deck geben', (done) => {
        const spiel = new Spiel();

        spiel.gestartet.subscribe(() => {
            expect(spiel.deck.length).toBe(42);
            expect(spiel.spieler[0].karten.length).toBe(5);
            expect(spiel.spieler[1].karten.length).toBe(5);

            done();
        });

        spiel.starten(_spielkarten, _spieler);
    });

    it('Nächster Spieler an der Reihe', (done) => {
        const spiel = new Spiel();

        spiel.spielerGewechselt.subscribe((spielerGewechselt) => {
            expect(spiel.aktuellerSpielerId).toBe(_spieler[0].id);
            expect(spielerGewechselt.neuerSpielerId).toBe(_spieler[0].id);

            done();
        });

        spiel.starten(_spielkarten, _spieler);
    });

    it('Spieler fragt Gegenspieler nach vorhandenen Karten mit Wert, dann erhält Spieler diese Karten', (done) => {
        const spiel = new Spiel();

        spiel.spielerGewechselt.subscribe(() => {
            const computerSpieler = _spieler[1];
            jest.spyOn(computerSpieler, 'karten', 'get').mockReturnValueOnce([
                new Karte(Farbe.Herz, Wert.Fünf),
                new Karte(Farbe.Karo, Wert.Fünf),
                new Karte(Farbe.Karo, Wert.Dame)
            ]);

            jest.spyOn(_spieler[0], 'karten', 'get').mockReturnValueOnce([
                new Karte(Farbe.Karo, Wert.Ass)
            ]);

            spiel.spielerFragtNachKarten(spiel.spieler[1].id, Wert.Fünf);
        });

        spiel.spielerHatKartenErhalten.pipe(take(1)).subscribe((kartenErhaltenVomSpieler) => {
            expect(kartenErhaltenVomSpieler.spielerId).toBe(_spieler[0].id);
            expect(kartenErhaltenVomSpieler.erhalteneKarten.length).toBeGreaterThanOrEqual(2);
            expect(kartenErhaltenVomSpieler.erhalteneKarten[0].wert).toBe(Wert.Fünf);
            expect(kartenErhaltenVomSpieler.erhalteneKarten[1].wert).toBe(Wert.Fünf);
            expect(spiel.spieler[0].karten.filter(karten => karten.wert === Wert.Fünf).length).toBeGreaterThanOrEqual(2);
            expect(spiel.spieler[1].karten.filter(karten => karten.wert === Wert.Fünf).length).toBe(0);

            done();
        });

        spiel.starten(_spielkarten, _spieler);
    });

    it('Spieler fragt Gegenspieler nach nicht vorhandenen Karten mit Wert, dann ist Spieler fischen gegangen', (done) => {
        const spiel = new Spiel();

        spiel.spielerGewechselt.subscribe(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jest.spyOn<any, any>(spiel.spieler[1], 'karten', 'get').mockReturnValueOnce([]);

            spiel.spielerFragtNachKarten(spiel.spieler[1].id, Wert.Fünf);
        });

        spiel.spielerIstFischenGegangen.pipe(take(1)).subscribe(karteGezogen => {
            expect(spiel.spieler[0].karten.length).toBe(6);
            expect(spiel.deck.length).toBe(41);
            expect(karteGezogen.spielerId).toBe(_spieler[0].id);
            expect(karteGezogen.erhalteneKarten).toBeTruthy();

            done();
        });

        spiel.starten(_spielkarten, _spieler);
    });

    it('Ein Satz gefunden', (done) => {
        const karten: Karte[] = [
            new Karte(Farbe.Herz, Wert.Ass),
            new Karte(Farbe.Karo, Wert.Ass),
            new Karte(Farbe.Kreuz, Wert.Ass),
            new Karte(Farbe.Pik, Wert.Ass),
            new Karte(Farbe.Herz, Wert.Drei)
        ];
        const spieler = new Spieler('Gregor', SpielerTyp.Mensch);

        spieler.satzGefunden.subscribe(satzGefunden => {
            expect(satzGefunden.satz.length).toBe(4);
            expect(spieler.saetze.length).toBe(4);
            expect(spieler.karten.length).toBe(1);

            done();
        });

        spieler.kartenNehmen(karten);
    });

    it('Kein Satz gefunden', () => {
        const karten: Karte[] = [
            new Karte(Farbe.Herz, Wert.Ass),
            new Karte(Farbe.Karo, Wert.Neun),
            new Karte(Farbe.Kreuz, Wert.Zehn),
            new Karte(Farbe.Pik, Wert.König),
            new Karte(Farbe.Herz, Wert.Drei)
        ];
        const spieler = new Spieler('Gregor', SpielerTyp.Mensch);

        spieler.kartenNehmen(karten);
        expect(spieler.saetze.length).toBe(0);
        expect(spieler.karten.length).toBe(5);
    });

    it('Computer-Spieler hat Karten abgegeben und hat dann keine mehr, dann wird Gewinner bekannt gegeben', (done) => {
        const spieler = _spieler[0];
        jest.spyOn<any, any>(spieler, 'saetze', 'get').mockReturnValue([
            new Karte(Farbe.Herz, Wert.Ass),
            new Karte(Farbe.Karo, Wert.Ass),
            new Karte(Farbe.Kreuz, Wert.Ass),
            new Karte(Farbe.Pik, Wert.Ass),
            new Karte(Farbe.Herz, Wert.Dame),
            new Karte(Farbe.Karo, Wert.Dame),
            new Karte(Farbe.Kreuz, Wert.Dame),
            new Karte(Farbe.Pik, Wert.Dame)
        ]);

        const computerSpieler = _spieler[1];
        computerSpieler.kartenNehmen([
            new Karte(Farbe.Herz, Wert.Fünf),
            new Karte(Farbe.Karo, Wert.Fünf)
        ]);
        const spiel = new Spiel();

        spiel.spielerGewechselt.subscribe(() => {
            spiel.spielerFragtNachKarten(spiel.spieler[1].id, Wert.Fünf);
        });

        spiel.spielerHatKartenErhalten.subscribe(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jest.spyOn<any, any>(computerSpieler, 'karten', 'get').mockReturnValue([]);
        });

        spiel.spielEnde.subscribe(spielEnde => {
            expect(spielEnde.gewinnerSpielerId).toBe(_spieler[0].id);
            expect(spielEnde.anzahlSaetze).toBe(2);

            done();
        });

        spiel.starten(_spielkarten, _spieler);
    });

    it('Ist Deck leer, wird das Spiel beendet', (done) => {
        const spiel = new Spiel();

        spiel.spielerGewechselt.subscribe(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jest.spyOn<any, any>(spiel.spieler[1], 'karten', 'get').mockReturnValueOnce([]);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jest.spyOn<any, any>(spiel, 'deck', 'get').mockReturnValueOnce([new Karte(Farbe.Herz, Wert.Dame)]);

            spiel.spielerFragtNachKarten(spiel.spieler[1].id, Wert.Fünf);
        });

        spiel.spielEnde.subscribe(() => {
            done();
        });

        spiel.starten(_spielkarten, _spieler);
    });

    it('Spieler fragt Gegenspieler nach vorhandenen Karten mit Wert, dann darf der Spieler nochmal fragen', (done) => {
        const computerSpieler = _spieler[1];
        computerSpieler.kartenNehmen([
            new Karte(Farbe.Herz, Wert.Fünf),
            new Karte(Farbe.Karo, Wert.Fünf)
        ]);

        const spiel = new Spiel();

        spiel.spielerGewechselt.subscribe(() => {
            spiel.spielerFragtNachKarten(spiel.spieler[1].id, Wert.Fünf);
        });

        spiel.gleicherSpielerNochmal.subscribe(() => {
            done();
        })

        spiel.starten(_spielkarten, _spieler);
    });

    it('Spieler ging nach Kartenfrage fischen und erhielt dabei Karte mit gefragtem Wert, dann darf der Spieler nochmal fragen', (done) => {
        const spiel = new Spiel();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(spiel, 'zieheZufaelligeKarteVomStapel').mockReturnValue(new Karte(Farbe.Herz, Wert.Fünf));

        // setup fishing scenario: computer player has nothing to offer
        spiel.spielerGewechselt.subscribe(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jest.spyOn<any, any>(spiel.spieler[1], 'karten', 'get').mockReturnValueOnce([]);

            spiel.spielerFragtNachKarten(spiel.spieler[1].id, Wert.Fünf);
        });

        spiel.gleicherSpielerNochmal.subscribe(() => {
            done();
        })

        spiel.starten(_spielkarten, _spieler);
    });

    it('Nach Spielrunde, soll der nächste Spieler an der Reihe sein', (done) => {
        const computerSpieler = _spieler[1];

        const spiel = new Spiel();

        // Nachdem der erste (menschliche) Spieler drankam, schauen wir, was beim nächsten Spielerwechsel passiert
        spiel.spielerGewechselt.pipe(skip(1), take(1)).subscribe((spielerGewechselt) => {
            expect(spielerGewechselt.neuerSpielerId).toBe(computerSpieler.id);
            expect(spiel.aktuellerSpielerId).toBe(computerSpieler.id);

            done();
        });

        spiel.starten(_spielkarten, _spieler);

        // Wir simulieren das Ergebnis eines Spielverlaufs:

        // Der Computerspieler hat keine Karte mit Wert Fünf
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(computerSpieler, 'karten', 'get').mockReturnValueOnce([
            new Karte(Farbe.Herz, Wert.Neun)
        ]);

        // und auf dem Stapel liegt oben auch keine Karte mit Wert Fünf
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(spiel, 'zieheZufaelligeKarteVomStapel').mockReturnValue(new Karte(Farbe.Kreuz, Wert.Drei));

        spiel.spielerFragtNachKarten(spiel.spieler[1].id, Wert.Fünf);
    });

    it('Wenn der Computerspieler an der Reihe ist, per Zufall nach Karte fragen', (done) => {
        const computerSpieler = _spieler[1];

        const spiel = new Spiel();

        spiel.spielerHatKartenErhalten.pipe(
            filter(spielerHatKartenErhalten => spielerHatKartenErhalten.spielerId === computerSpieler.id)
        ).subscribe(() => {
            done();
        });

        spiel.spielerIstFischenGegangen.pipe(
            filter(spielerHatKartenErhalten => spielerHatKartenErhalten.spielerId === computerSpieler.id)
        ).subscribe(() => {
            done();
        });

        spiel.starten(_spielkarten, _spieler);

        // Wir simulieren das Ergebnis eines Spielverlaufs:

        // Der Computerspieler hat keine Karte mit Wert Fünf
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(computerSpieler, 'karten', 'get').mockReturnValueOnce([
            new Karte(Farbe.Herz, Wert.Neun)
        ]);

        // und auf dem Stapel liegt oben auch keine Karte mit Wert Fünf
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(spiel, 'zieheZufaelligeKarteVomStapel').mockReturnValue(new Karte(Farbe.Kreuz, Wert.Drei));

        // Wenn der menschliche Spieler nun Karten anfragt, geht seine Runde zu Ende und der Computer ist dran.
        spiel.spielerFragtNachKarten(spiel.spieler[1].id, Wert.Fünf);
    });
});