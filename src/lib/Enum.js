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

function GetProperty(staticSelf, PropName, value, enumerable = true) {
    Object.defineProperty(staticSelf, PropName, {
        get() {
            // const createParam = { staticSelf: staticSelf, propName: PropName, InitValue: value };
            return value;
        },
        enumerable: enumerable,
        configurable: false
    });
}

class Base {

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    get type() {
        return this.constructor.name;
    }

    [Symbol.toPrimitive](hint) {
        switch (hint) {
            case 'number':
                return this.index;
            case 'string':
                return this.id;
            default:
                return true;
        }
    };
 }

class EnumItem extends Base {

    constructor() {
        super();
        var storage = false;
        Object.defineProperty(this, 'store', {
            get() { return storage; },
            set(newValue) { storage = newValue; },
            enumerable: false,
            configurable: false
        });
    }

    get serializedItem() {
        return { [this.name]: [this.index, this.id] };
    }

    toJSON() {
        return this.serializedItem;
    }
}

class Enum extends Base {

    static Item = EnumItem;

    static #DefaultOption = {
        cause: 'default',
        indexType: 'AUTO',
        startIndex: 0,
        esidTemplate: 'b-w-w-ITEM-1nb-w-w-w'
    };

    static #OptionNames = [
        'cause', 'indexType', 'startIndex', 'startIndex'
    ];

    static get DefaultOption() {
        return this.#DefaultOption;
    }

    static set DefaultOption(option) {
        this.#DefaultOption = option;
        this.#DefaultOption.cause = 'default';
    }

    static {
        ArgumentsParser.DefaultOption = this.DefaultOption;

        const ConstType = new Enum(
            'ConstType',
            [['AUTO', 1], ['BINARY', 2], ['SERIES', 4]]);

        GetProperty(this, 'AUTO', ConstType.AUTO);
        GetProperty(this, 'BINARY', ConstType.BINARY);
        GetProperty(this, 'SERIES', ConstType.SERIES);
        GetProperty(this, 'CONSTANTS', ConstType);

        this.DefaultOption.indexType = ConstType.AUTO;
        // this.DefaultOption.idType = ConstType.AUTO;
        this.OptionsType = ConstType;
    }

    static getConst(typeOfEnum) {
        if (typeOfEnum instanceof EnumItem && this.OptionsType?.[typeOfEnum])
            return typeOfEnum;
        else
            return this.OptionsType?.[typeOfEnum.toUpperCase()] ?? Enum?.AUTO;
    }

    #getIndex(type, ordNr, nr, startIndex) {
        return ((type) => {
            switch (type ?? 'undefined') {
                case this.constructor?.BINARY: return (2 ** (ordNr + startIndex));
                case this.constructor?.SERIES: return (ordNr + startIndex);
                case this.constructor?.AUTO:
                case undefined:
                default: return nr;
            }
        })(type);
    }

    createItem(indexType, enumType, startIndex, esidGenerator) {
        return ([name, nr, esid], ordNr) => {

            const enumItem = new EnumItem();

            GetProperty(enumItem, 'name', name, false);
            GetProperty(this, name, enumItem);

            GetProperty(enumItem, 'ordNr', ordNr);
            GetProperty(this, ordNr, enumItem, false);

            var index = this.#getIndex(indexType, ordNr, nr, startIndex);
            GetProperty(enumItem, 'index', index, false);

            GetProperty(enumItem, 'indexType', indexType, false);
            GetProperty(enumItem, 'enumType', enumType, false);

            GetProperty(enumItem, 'enumObject', this, false);
            
            if (!esid) {
                esid = esidGenerator.next().value;
                GetProperty(enumItem, 'esid', esid, false);
            }
            GetProperty(enumItem, 'id', esid, false); 
                          

            // GetProperty(this.#created, esid, enumItem);
            GetProperty(this, esid, enumItem, false);
            GetProperty(this.constructor.Item, esid, enumItem, false); 

            Object.freeze(enumItem);
        }
    }

    /**
     * Gibt ein Enum-Objekt zurück
     * 
     * @param {[Object,] String, any[]} parameter: [option, enumType, label] 
     *    @optional {Object} option: Überschreibt temporär die DefaultOption
     *    @requires {String} enumType: Name des Enum-Types
     *    @requires {Array|Set|Array[Key,Index]|Object|Map} label:  
     *      @type {Array}:              ['foo', 'bar', ...]
     *      @type {Set}:                Set(['foo', 'bar', ...])
     *      @type {Array[Key,Index]}:   [['foo', 1], ['bar', 3], ...]
     *      @type {Object}:             {foo: 2, bar: 4, ...}
     *      @type {Object}:             {foo: [2, esid], bar: [4, esid], ...}
     *      @type {Map}:                Map([['foo', 1], ['bar', 3], ...])
     *    
     * @returns {Enum} Object mit den erzeugten EnumItem
     * @throws {RangeError|TypeError}
     */
    constructor(...parameter) {
        super();
        // ArgumentsParser.DefaultOption = this.constructor.DefaultOption;
        try {
            var [option, enumType, [...label]] = ArgumentsParser.separate(
                parameter, this.constructor.#OptionNames);
            if (option.indexType?.name === 'AUTO') {
                const analyseResult = ArgumentsParser.indexAnalyse(label);
                option = {...option, ...{cause: 'indicesAnalyse', ...analyseResult}};
            }
            // Fehler finden und beenden
            if (!enumType) {
                throw new RangeError(`The 'enumType' is undefined!`);
            }
            if (this?.[enumType]) {
                throw new TypeError(`Enum: Cannot redefine 'enumType': "${enumType}"`);
            }
            if (this.constructor?.[enumType.toUpperCase()]) {
                throw new TypeError(`Enum: Cannot use 'enumType': "${enumType}", it is an OptionsType or defined Enum`);
            }

            var { indexType, startIndex } = { ...option };
            // if (this.constructor.SERIES) {
                indexType = this.constructor.getConst(indexType);
            // }

            GetProperty(this, 'indexType', indexType, false);
            // GetProperty(this, 'indicesAnalyse', analyseResult, false);
            GetProperty(this, 'option', option, false);
            GetProperty(this, 'name', enumType);

            GetProperty(this.constructor, enumType, this, false);

            const esidGenerator = KeyFactory.getESID(label.length, option);
            label.forEach(
                this.createItem(indexType, enumType, startIndex, esidGenerator),
                this);

            return Object.freeze(this);
        } catch (err) {
            throw err;
        }
    }

    get serializedEnum() {
        const serializedItems = [...this].map(
            ({ key, item }) => {
                return item.serializedItem;
            });
        return {
            Enum: [
                { cause: 'json', indexType: this?.indexType?.name },
                `${this.name}`,
                [...serializedItems]
            ]
        };
    }

    toJSON() {
        return this.serializedEnum;
    }

    static parse(jsonStr) {
        const firstStep = JSON.parse(jsonStr);
        const $enum = new Enum(...firstStep.Enum);
        return $enum;
    }

    [Symbol.toPrimitive](hint) {
        switch (hint) {
            case 'string':
                return this.name;
            case 'number':
                return false;
            default:
                return this;
        }
    };

    *[Symbol.iterator]() {
        for (const [key, item] of Object.entries(this)) {
            if (item instanceof EnumItem &&
                /^[A-Za-z_]+$/.test(key)) {
                yield { key: key, item: item };
            }
        }
    }

    /**
     * Die Methode forEach ruft für jeden Wert des Enum-Object eine 
     * Callback-Funktion auf, der es die Werte 'key' und 'item', 
     * 'index' und 'enum' übergibt.
     * 
     * @param {function} callback(key, item, index, enum)
     *   @param {String} key 
     *    Enthält den Namen oder den Index des EnumItem  
     *   @param {EnumItem} item
     *    Object der Klasse EnumItem 
     *   @param {Integer} index 
     *    Index des Elements aus dem Array, über welches 
     *    gerade iteriert wird, entspricht nicht dem Index des EnumItem.
     *   @param {Enum} enum
     *    Referenz auf die Aufzählung, die gerade iteriert wird
     * @optional {Object} thisArg 
     *  Kontext-Parameter, der als this genutzt wird bei 
     *  der Ausführung der callback-Funktion.
     * @example
     * ```js
     * const newEnum = new Enum('EnumName', ['Item1', 'Item2']);
     * newEnum.forEach((key, item, index, enum) => {
     *  // do any things
     * });
     * ```
     */
    forEach(callback, thisArg) {
        let i = 0;
        for (const [key, item] of Object.entries(this)) {
            if (item instanceof EnumItem) {
                callback.call(thisArg, key, item, i, this);
                i++;
            }
        }
    }

    /**
     * 
     * @param  {...[String ||EnumItem]} item 
     * @returns Integer
     */
    bitRegister(...item) {
        var bitRegister = 0;
        item.forEach((item) => {
            if (typeof item === 'string') {
                item = this?.[item];
            } 
            if (!item instanceof EnumItem) {
                throw new TypeError("Item isn't an EnumItem!");
            }
            bitRegister |= item;
        });
        return bitRegister; 
    }

    get(bitRegister) {
        var itemArray = [...this].filter(({item}) => {
            return (bitRegister & item);
        }).map(({item}) => item);
        return itemArray; // EnumItem[]
    }
}
