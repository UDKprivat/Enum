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

/*
 * ASCII-ART
 * https://patorjk.com/software/taag/#p=display&c=c&f=ANSI%20Shadow
 * Basic
 */

'use strict';

class Enum extends ParameterSeparator {

    static EnumItem = class EnumItem {

        [Symbol.toPrimitive](hint) {
            switch (hint) {
                case 'number':
                    return this.index;
                case 'string':
                    return this.uuid;
                default:
                    return true;
            }
        };

        /**
         * Erzeugt ein Eintrag vom Typ EnumItem für das Enum-Objekt.
         * 
         * @param {String} name der Name des EnumItem
         * @param {String} ouid ein String mit der OUID
         * @param {Integer} index der Index der als Zahl den EnumItem repräsentiert
         * @param {String} enumType der Name des Types
         * @param {Enum} enumObject Das HerkunftsObjekt des EnumTypes
         * @returns {EnumItem} Das geschützte Objekt
         */
        constructor(name, ouid, index, initValue = false) {
            const parentClass = this.constructor.parentClass;
            parentClass.GetProperty(this, 'name', name, false);
            parentClass.GetProperty(this, 'index', index, false);
            parentClass.GetProperty(this, 'ouid', ouid, false);
            parentClass.GetProperty(this,
                'uuid', parentClass.generateUUID(), false);

            var privValue = initValue;
            Object.defineProperty(this, 'value', {
                get() {
                    return privValue;
                },
                set(newValue) {
                    privValue = newValue;
                },
                enumerable: false,
                configurable: false
            });
        }
    }

    /**
     * @static generateOUID(template)
     * erstellt die OUID nach dem übergebenen Template
     * 
     * @param {type} template
     * @returns {String} OUID
     * */
    static generateOUID(template = 'xxxxxxx-xx7xx5-xxx6-4xxxxx-6xxb-xxxxxxxx') {
        var r = 0x5;
        const array = new Uint8Array(60);
        window.crypto.getRandomValues(array);
        const iterator = array[Symbol.iterator]();
        return (template.replace(/[xy]/g, function (c) {
            var r = iterator.next().value;
            var v = c === 'x' ? r : (r & 0x7 | 0xa);
            return v.toString(16);
        })).toUpperCase();
    }

    /**
     * Erzeugt eine UUID mit der Hilfe der Javascript-Bibiothek
     * Web Crypto API 
     * @returns {String} UUID
     */
    static generateUUID() {
        return window.crypto.randomUUID();
    }

    static generateHash(message) {
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
    }

    static shortID(name) {
        return `${this.generateHash(name)}-${name}`;
    }

    /**
     * der Generator erzeugt alphabetische aufsteigende UUIDs
     * 
     * @param {Object} option 
     *  die aktuelle Option/Einstellung
     * @returns {String} eine OUID nach der Vorlage 
     */
    static getOUID(option) {
        const staticSelf = this;
        option ??= staticSelf.DefaultOption;
        const tmpl = option.ouidTemplate;
        var nUid = staticSelf.generateOUID(tmpl);
        return (function* (ouid) {
            while (true) {
                while (ouid >= nUid) {
                    nUid = staticSelf.generateOUID(tmpl);
                }
                ouid = nUid;
                yield nUid;
            }
        })(nUid);
    }

    static DefaultOption = {
        option: 'OPTION',
        enumType: this.shortID('anonym'),
        countType: undefined,
        startNumber: 0,
        ouidTemplate: 'yxxxx-xxxU-ENUM-Dxxx-Kxxx'
    };

    static {
        // init Class EnumItem
        this.EnumItem.parentClass = this;
        const IndexType = new Enum(
            { option: 'option', enumType: 'IndexType' },
            'AUTO', 'BINARY', 'COUNT');
        this.AUTO = IndexType.AUTO;
        this.BINARY = IndexType.BINARY;
        this.COUNT = IndexType.COUNT;
        this.DefaultOption.countType = IndexType.AUTO;
    }

    static GetProperty(staticSelf, PropName, value, enumerable = true) {
        Object.defineProperty(staticSelf, PropName, {
            get() {
                return value;
            },
            enumerable: enumerable,
            configurable: false
        });
    }

    /**
     * Gibt ein Enum-Objekt zurück
     * 
     * 
     * @param  {...any} parameter 
     *  [
     *    <@optional @param option 
     *      <@type {String} Key == 'option', Options {hubble: any, ...}> | 
     *      <@type {Object} Options  {option: [any], hubble: any, ...}>,
     *    @param {String,... || Array || Set || Map || Array[Array] || Object} names Parameterliste
     *      @type {String, ...} aus Strings:        'foo', 'bar', ...
     *      @type {Array} aus Strings:              ['foo', 'bar', ...]
     *      @type {Set} aus einem Set-Objekt:       Set(['foo', 'bar', ...])
     *      @type {Array[Array]} aus Key, Value Paaren:   [['foo', 1], ['bar', 3], ...]
     *      @type {Map} aus einem Map-Objekt:       Map([['foo', 1], ['bar', 3], ...])
     *      @type {Object} aus einem Objekt:        {foo: 2, bar: 4, ...}
     *  ]
     * @returns Enum
     */
    constructor(...parameter) {
        super();
        const [option, [...names]] = this.separateOption(parameter);
        const stat = this.constructor;
        const { enumType, /* idType, */ countType, startNumber } =
            { ...option };

        const hashMsg = stat.name + ':' + option.enumType + '.' +
            stat.EnumItem.name + ':';

        const ouidGen = stat.getOUID(option);

        stat.GetProperty(this, 'countType', countType, false);
        stat.GetProperty(this, 'enumType', enumType);

        const getIndex = (type, givenIndex, nr) => {
            return ((type) => {
                switch (type) {
                    case stat?.AUTO: return givenIndex;
                    case stat?.BINARY: return (2 ** (nr + startNumber));
                    case stat?.COUNT: return (nr + startNumber);
                    default: return givenIndex;
                }
            })(type);
        };
        names.forEach(([name, givenIndex], nr) => {
            const index = getIndex(countType, givenIndex, nr);
            const ouid = ouidGen.next().value;
            const enumEntry = new stat.EnumItem(name, ouid, index);
            stat.GetProperty(enumEntry, 'countType', countType, false);
            stat.GetProperty(enumEntry, 'enumType', enumType, false);
            stat.GetProperty(enumEntry, 'enumObject', this, false);
            stat.GetProperty(enumEntry, 'hash', stat.generateHash(hashMsg + name), false);

            // var id = idType == this.OUID ? enumEntry?.ouid
            //     : idType == this.UUID   ? enumEntry?.uuid
            //     : enumEntry?.hash;

            // stat.GetProperty(enumEntry, 'id', id, false);

            stat.GetProperty(this, name, enumEntry);
            stat.GetProperty(this, index, enumEntry);

            Object.freeze(enumEntry);
        });

        return Object.freeze(this);
    }

    *[Symbol.iterator]() {
        for (const [key, value] of Object.entries(this)) {
            if (value instanceof this.constructor.EnumItem) {
                yield { key: key, value: value };
            }
        }
    }

    /**
     * Die Methode forEach ruft für jeden Wert des Enum-Object eine 
     * Callback-Funktion auf, der es die Werte 'key' und 'value' übergibt.
     * 
     * @param {function} callback
     *   @param {any} key 
     *    Enthält den Namen oder den Index des EnumItem  
     *   @param {EnumItem} value
     *    Object der Klasse EnumItem 
     *   @param {Integer} index 
     *    Index des Elements aus dem Array, über welches 
     *    gerade iteriert wird, entspricht nicht dem Index des EnumItem.
     *   @param {Enum} Enum
     *    Referenz auf die Aufzählung, die gerade iteriert wird
     * @optional {Object} thisArg 
     *  Kontext-Parameter, der als this genutzt wird bei 
     *  der Ausführung der callback-Funktion.
     */
    forEach(callback, thisArg) {
        let i = 0;
        for (const [key, value] of Object.entries(this)) {
            if (value instanceof this.constructor.EnumItem) {
                callback.call(thisArg, key, value, i, this)
                i++;
            }
        }
    }
}
