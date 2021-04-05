"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Karte {
    constructor(farbe, wert) {
        this.farbe = farbe;
        this.wert = wert;
        Object.freeze(this);
    }
}
exports.default = Karte;
