"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpielerHatKartenErhalten {
    constructor(spielerId, erhalteneKarten) {
        this.spielerId = spielerId;
        this.erhalteneKarten = erhalteneKarten;
        Object.freeze(this);
    }
}
exports.default = SpielerHatKartenErhalten;
