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
/**
 */
const ArgumentsParser = (() => {

    const DefaultOption = {
        separateIndex: (([, index]) => index),
        // analyseId: 'indicesAnalyse',
    };

    const keyValueFilter = (key, value) => {
        if (typeof key === 'string' && /^[^\s\d]/.test(key) && /^\d+$/.test(value)) {
            return [key, (value | 0)];
        }
        return false;
    };
    const entryFilter = ([key, value]) => {
        return keyValueFilter(key, value);
    };
    const swapEntryFilter = ([key, value]) => {
        return keyValueFilter(value, key);
    };
    const valueArrayToKeyFilter = ([key, value]) => {
        [key, value] = value;
        return keyValueFilter(key, value);
    };
    const valueJsonToKeyFilter = ([key, value]) => {
        var index, id;
        [key, [index, id]] = Object.entries(value)?.[0];
        if (typeof key === 'string' && /^[^\s\d]/.test(key) &&
            /^\d+$/.test(index) && typeof id === 'string') {
            return [key, (index | 0), id];
        }
        return false;
    };
    const MapEntryFilter = ([oKey, [key, value]]) => {
        return keyValueFilter(key, value);
    };

    /**
     * Reduziert die geschachtelten Arrays
     * @param {Array} nestedArray - Array, das ein Array beinhaltet [[[data]]]
     *
     * @return {Array} [data]
     */
    const reduceArrayLevel = (nestedArray) => {
        while (Array.isArray(nestedArray[0]) && (typeof nestedArray[0]?.[0] !== 'string')) {
            nestedArray = nestedArray[0];
        }
        return nestedArray.map((entry) => {
            let test = (Array.isArray(entry) && (
                (typeof entry[0] === 'string' && entry.length == 1) ||
                typeof entry[1] === 'object'));
            return test ? entry[0] : entry;
        });
    };

    /**
     * Wandelt das Untersuchungsergebnis um.
     * 
     * @param {Array} param0 die Rohdaten der Untersuchung
     * @returns {Object}
     */
    function indexPresenter([increasing, start, binary, stepping]) {
        var type = 'AUTO', startIndex = 0;
        switch (true) {
            case (increasing && binary && !stepping):
                type = 'BINARY';
                startIndex = start[binary];
                break;
            case (increasing && !binary && stepping):
                type = 'SERIEL';
                startIndex = start[binary];
                break;
            case (!increasing || (increasing && !stepping)):
            default:
                break;
        }
        return { startIndex: startIndex, indexType: type };
    }
    /**
     * Untersucht die Indizes des übergebenen Array. es wird festgestellt ob die mitgegebenen
     * Indizes aufsteigend sind, welches der Startindex ist, mit einem Abstand von 1 gezählt werden, ob es eine binäre 
     * Zählweise ist oder ob sie nicht diesen Kriterien entsprechen.
     * Daraus wird das Ergebnis abgeleitet.
     * 
     * @param {Array} ObjectToAnalyse Array dessen Indizes untersucht werden sollen.
     * @param {function} separateIndex Die Callbackfunktion separiert die Indizes aus dem Array
     * @returns {Object} Untersuchungsergebnis
     */
    function indexAnalyse(ObjectToAnalyse, separateIndex = DefaultOption.separateIndex) {
        const indices = separateIndex ? ObjectToAnalyse.map(separateIndex) : ObjectToAnalyse;

        var oldIndex = undefined, start = { false: 0, true: 1 },
            stepping = true, increasing = true, binary = true,
            mask = 1, exponent = 0;
        const maxExponent = 31, maxPower = mask << (maxExponent - 1);
        indices.forEach((index, i, list) => {
             if (increasing) {
                if (binary) {
                    if (i === 0) {
                        oldIndex = index;
                        while (binary && index && !(index & mask) && mask < maxPower) {
                            exponent++;
                            mask <<= 1;
                        }
                        binary &&= (index & mask) === index;
                        start = { false: index, true: exponent };
                        return;
                    } 
                    else {
                        mask <<= oldIndex == 0 ? 0 : 1;
                        binary &&= (index & mask) === index;
                    }
                }
                stepping &&= (index - oldIndex) === 1;
                increasing &&= oldIndex < index;
                oldIndex = index;
            }
        });
        return indexPresenter([increasing, start, binary, stepping]);
    }

    /**
     * Erzeugt aus jeweils aus den übergebenen ParameterTypen ein Array
     * mit Schlüssel-, Wertpaaren
     * 
     * @param {Array|Set|Array[Key,Index]|Object|Map} label:  
     *  @type {Array}:              ['foo', 'bar', ...]
     *  @type {Set}:                Set(['foo', 'bar', ...])
     *  @type {Array[Key,Index]}:   [['foo', 1], ['bar', 3], ...]
     *  @type {Object}:             {foo: 2, bar: 4, ...}
     *  @type {Object}:             {foo: [2, '55-SAES-...'], bar: [4, '...], ...}
     *  @type {Map}:                Map([['foo', 1], ['bar', 3], ...])   
     * @returns {Array}             [[Key, Index], ...]
     * @throws {RangeError|TypeError}
     */
    function NormalForm(label) {
        var usedArray;
        switch (typeof label[0]) {
            case 'string': {// 'foo', 'bar', ...
                if (typeof label[1] === 'string' || (typeof label[1] === 'undefined')) {
                    throw new TypeError(`The argument 'label' is not an Array or Object!`);
                }
                break;
            }
            case 'object': {
                if (label.length === 1) {
                    if (Array.isArray(label)) {
                        label = reduceArrayLevel(label);
                    }
                    switch (true) {
                        case (label[0] instanceof Set): {
                            // console.debug("Set(['foo', 'bar', ...])");
                            usedArray = Object.entries([...label[0]]).map(swapEntryFilter);
                            break;
                        }
                        case (label[0] instanceof Map): {
                            // console.debug("Map([['foo', 1], ['bar', 3], ...])");
                            const entries = Object.entries([...label[0]]);
                            if (typeof entries[0][1][0] !== 'string') {
                                throw new TypeError(
                                    `The key of Map-entry is not not a String!`);
                            }
                            usedArray = entries.map(MapEntryFilter);
                            break;
                        }
                        case (Array.isArray(label[0]) && typeof label[0]?.[1] === 'number' &&
                            typeof label[0]?.[0] === 'string'): {
                                // console.debug("[['foo', 0], ['bar', 1], ...]");
                                usedArray = Object.entries(label).map(valueArrayToKeyFilter);
                                break;
                            }
                        case (Array.isArray(label[0]) && typeof label[0][0] === 'string'): {
                            // console.debug("['foo', 'bar', ...]");
                            usedArray = Object.entries(label[0]).map(swapEntryFilter);
                            break;
                        }
                        case (Array.isArray(Object.entries(label[0])?.[0]?.[1])):
                            // console.debug("{label: [index, 'id']}")
                            usedArray = Object.entries(label).map(valueJsonToKeyFilter);
                            break;
                        case (label[0] instanceof Object && typeof label[0] === 'object'): {
                            // console.debug("{foo: 2, bar: 4, ... }");
                            usedArray = Object.entries(label[0]).map(entryFilter);
                            break;
                        }
                        case (Array.isArray(label) && typeof label[0] === 'string'):
                            usedArray = Object.entries(label).map(swapEntryFilter);
                            break;
                        default:
                            throw new TypeError(
                                `Can't find a Methode to handle the type of "${typeof label[0]}" [label]!`);
                    }
                }
                break;
            }
            default:
                throw new TypeError(
                    `Can't find a Methode to handle the type of "${typeof label[0]}" [label]!`);
        }
        usedArray = usedArray.filter((entry) => {
            return Array.isArray(entry);
        });
        return usedArray;
    }

    /** 
     * @param {[Object,] String, any[]} parameter: [option, enumType, label] 
     *    @optional {Object} option: Überschreibt temporär die DefaultOption
     *      @pattern {cause: ['default'|'param'|'json'][, properties...]} 
     *    @requires {String} enumType: Name des Enum-Types
     *    @requires {Array||Set||Object||Map} label:  
     *      @type {String[]}:           ['foo', 'bar', ...]
     *      @type {Set}:                Set(['foo', 'bar', ...])
     *      @type {[[Key,Index]]}:      [['foo', 1], ['bar', 3], ...]
     *      @type {Object}:             {foo: 2, bar: 4, ...}
     *      @type {Object}:             {foo: [2, '55-SAES-...'], bar: [4, '...], ...}
     *      @type {Map}:                Map([['foo', 1], ['bar', 3], ...])
     *    
     * @returns {Array} [Option, enumType, label] 
     * @throws {RangeError|TypeError}
     */
    function separate(parameter, optionNames) {
        try {
            let optionsObj, option, optType, enumType, ListWithIndices, keyWort;
            [optionsObj, ...ListWithIndices] = parameter;
            if (optionNames?.some(proName => optionsObj?.[proName])) { 
                // property 'cause' ist nicht undefined
                [{ cause: optType, ...option }, ...ListWithIndices] = parameter;
            }
            if (typeof option === 'object') {
                option = {
                    ...(DefaultOption ?? { cause: 'empty' }), // DefaultOption
                    ...option, // die optionale Option aus den Parameter
                    ...{ cause: optType }
                }; // Hinweis wer die Option breit stellt    
                [enumType, ...parameter] = ListWithIndices;
                ListWithIndices = null
            } else {
                [enumType, ...parameter] = parameter;
                option = undefined;
                optionsObj = undefined;
            }
            if (typeof enumType !== 'string') {
                throw new RangeError(`The argument 'enumType' is undefined!`);
            }
            ([...ListWithIndices] = NormalForm(parameter));
            return [(option ?? DefaultOption), enumType, ListWithIndices];
        }
        catch (err) {
            throw err;
        }
    }

    return {
        get DefaultOption() {
             return DefaultOption;
            },
        set DefaultOption(option) {
            Object.assign(DefaultOption,  option);
        },
        separate: separate,
        NormalForm: NormalForm,
        indexAnalyse: indexAnalyse,
    };
})();


