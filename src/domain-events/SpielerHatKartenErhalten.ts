import Karte from '../value-types/Karte';

export default class SpielerHatKartenErhalten {
    constructor(public readonly spielerId: string, 
        public readonly erhalteneKarten: ReadonlyArray<Karte>) {
            Object.freeze(this);
        }
}