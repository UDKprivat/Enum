/*
  * Copyright (C) 2022 Ulf-Diethelm Kornblum <ulf@kornblum.de>
  *
  * This program is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  */

'use strict';

const KeyFactory = (function BuildKeyFactory() {

    const formatHex = (l, m, r) => {
        var n = (r & m | 0).toString(16);
        return '0'.repeat(l - n.length) + n;
    }
    const Nibble = (r) => formatHex(1, 0xF, r);
    const Byte = (r) => formatHex(2, 0xFF, r);
    const Word = (r) => formatHex(4, 0xFFFF, r);
    const ESID_TEMPLATE = 'w-7b5-bn6-4bn-6bb-w';
    const DefaultOption = { esidTemplate: ESID_TEMPLATE};

    /** ESID: Enum Service Identifier 
     * ------------------------------
     * Der *Enum Service Identifier* ist die lokale nicht genormte Bezeichnung
     * für die parametrierbaren *IDs* gesteuert werden. Die erzeugten *ESID* 
     * einer EnumType sind aufsteigend sortierbar, wie die automatisch
     * erzeugten Indezies. In diesen Methoden wird die Erzeugung der 
     * notwendigen Zufallszahlen der *ESID* durch die Javascript-Bibliothek
     * **Crypto** erledigt.
     */

    /**
     * @static generateESID(template)
     * erstellt die ESID nach dem übergebenen Template
     * 
     * @param {type} template 
     *  Example: 'b-SbS-nnb-ENUM/8-w-w-b-n'
     *  Result: '55-SAES-45FD-ENUM/8-633B-7055-5E-8'
     *      Hex-Zeichen:
     *          w: zufällige 16Bit-Zahl (word)
     *          b: zufällige  8Bit-Zahl (byte)
     *          n: zufällige  4Bit-Zahl (nibble)
     *          [0-9A-Z/-]: Fest eingestellte Zeichen
     * @returns {String} ESID
     * */
    function generateESID(template = 'w-7b5-bn6-4bn-6bb-w') {
        const array = new Uint16Array(60);
        window.crypto.getRandomValues(array);
        const iterator = array[Symbol.iterator]();
        return (template.replace(/[nbw]/g, function (c) {
            var v = 0, r = iterator.next().value;
            switch (c) {
                case 'n': v = Nibble(r);
                    break;
                case 'b': v = Byte(r);
                    break;
                case 'w':
                default:  
                    v = Word(r);
            }
            return v;
        })).toUpperCase();
    };


    /**
     * Erzeugt eine UUID mit der Hilfe der Javascript-Bibiothek
     * Web Crypto API 
     * @returns {String} UUID
     */
    function generateUUID() {
        return window.crypto.randomUUID();
    };

    /** Convert the possibly negative integer hash code into 
     * an 8 character hex string, which isn't strictly 
     * necessary but increases user understanding 
     * that the id is a SHA-like hash 
     * */
    function generateHash(message) {
        // hash copiert aus QUnit
        var str = message;
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        var hex = (0x10000000000 + hash).toString(16);
        if (hex.length < 8) {
            hex = '000000000000000' + hex;
        }
        return hex.slice(-8);
    };
    
    /**
     * der Generator erzeugt alphabetische aufsteigende ESIDs
     * 
     * @param {Integer} labelCount Anzahl der Label, die eine ESID erhalten
     * @param {Object} option {esidTemplate: {String}}
     *  die aktuelle Option/Einstellung
     * @returns {String} eine ESID nach der Vorlage `${16BitCount}-${esid}`
     *      `${'F9AB'}-${'55-SAES-45FD-ENUM/8-633B-7055-5E-8'}`
     *      Example: 'F9AB-55-SAES-45FD-ENUM/8-633B-7055-5E-8'
     */
    function getESID(labelCount, option) {
        option ??= DefaultOption;
        const tmpl = option?.esidTemplate ?? ESID_TEMPLATE;
        return (function* esidGenerator(labelCount = 1, tmpl) {
            const array = new Uint16Array(labelCount * 4.2);
            window.crypto.getRandomValues(array);
            const SortedSet = new Set([...array[Symbol.iterator]()].sort((a, b) => a - b));
            const Sorted = [...SortedSet];
            const Summand = (Sorted.length - 1) / labelCount | 0;
            for (let k = 0, i = 0; i < labelCount; i++, k += Summand) {
                var nextRndNumber = Sorted[k].toString(16);
                nextRndNumber = '0'.repeat(4 - nextRndNumber.length) + nextRndNumber;
                nextRndNumber = nextRndNumber.toUpperCase();
                const esid = generateESID(tmpl);
                // console.log(i, k, nextRndNumber + '-' + esid);
                yield nextRndNumber + '-' + esid;
            }
        })(labelCount, tmpl);
    };


    return {
        DefaultOption: DefaultOption,
        generateESID: generateESID,
        generateUUID: generateUUID,
        generateHash: generateHash,
        getESID: getESID
    }
})();
