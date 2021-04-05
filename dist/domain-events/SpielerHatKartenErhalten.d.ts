import Karte from '../value-types/Karte';
export default class SpielerHatKartenErhalten {
    readonly spielerId: string;
    readonly erhalteneKarten: ReadonlyArray<Karte>;
    constructor(spielerId: string, erhalteneKarten: ReadonlyArray<Karte>);
}
