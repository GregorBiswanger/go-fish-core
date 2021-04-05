"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpielkartenFactory = exports.SpielerTyp = exports.Wert = exports.Farbe = exports.Karte = exports.Spiel = void 0;
const Spiel_1 = __importDefault(require("./Spiel"));
exports.Spiel = Spiel_1.default;
const Karte_1 = __importDefault(require("./value-types/Karte"));
exports.Karte = Karte_1.default;
const Farbe_1 = require("./value-types/Farbe");
Object.defineProperty(exports, "Farbe", { enumerable: true, get: function () { return Farbe_1.Farbe; } });
const Wert_1 = require("./value-types/Wert");
Object.defineProperty(exports, "Wert", { enumerable: true, get: function () { return Wert_1.Wert; } });
const SpielerTyp_1 = require("./value-types/SpielerTyp");
Object.defineProperty(exports, "SpielerTyp", { enumerable: true, get: function () { return SpielerTyp_1.SpielerTyp; } });
const SpielkartenFactory_1 = __importDefault(require("./factories/SpielkartenFactory"));
exports.SpielkartenFactory = SpielkartenFactory_1.default;
