import { Farbe } from "../value-types/Farbe";
import Karte from "../value-types/Karte";
import { Wert } from "../value-types/Wert";

export default class SpielkartenFactory {
    erzeugen(): Karte[] {
        const karten: Karte[] = [];

        for (const farbe in Farbe) {
            for (const wert in Wert) {
                karten.push(new Karte(farbe as Farbe, wert as Wert));
            }
        }

        return karten;
    }
}