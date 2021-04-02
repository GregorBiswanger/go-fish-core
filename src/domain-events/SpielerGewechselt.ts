export default class SpielerGewechselt {
    constructor(public readonly neuerSpielerId: string) {
        Object.freeze(this);
    }
}