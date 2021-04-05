"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Farbe_1 = require("../value-types/Farbe");
const Karte_1 = __importDefault(require("../value-types/Karte"));
const Wert_1 = require("../value-types/Wert");
class SpielkartenFactory {
    erzeugen() {
        const karten = [];
        for (const farbe in Farbe_1.Farbe) {
            for (const wert in Wert_1.Wert) {
                karten.push(new Karte_1.default(farbe, wert));
            }
        }
        return karten;
    }
}
exports.default = SpielkartenFactory;
