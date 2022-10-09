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

class ParameterSeparator {

    DefaultOption = {};

    _entryFilter_ = (key, value, swap = false) => {
        [key, value] = swap ? [value, key] : [key, value];
        if (/^[^\s\d]/.test(key) && /^\d+$/.test(value)) {
            return [key, (value | 0)];
        }
        return false;
    };
    entryFilter = ([key, value], index) => {
        return this._entryFilter_(key, value);
    };
    entryFilter = ([key, value], index) => {
        return this._entryFilter_(key, value);
    };
    swapEntryFilter = ([key, value], index) => {
        return this._entryFilter_(key, value, true);
    };
    valueArrayToKeyFilter = ([key, value], index) => {
        [key, value] = value;
        return this._entryFilter_(key, value);
    };
    MapEntryFilter = ([oKey, [key, value]], index) => {
        return this._entryFilter_(key, value);
    };

    reduceArrayLevel = (nestedArray) => {
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
     * Erzeugt aus jeweils aus den übergebenen ParameterTypen ein Array
     * mit Schlüssel, Wert Paaren
     * 
     * @param {any} argument 
     *  1. Parameterliste aus Strings:  'foo', 'bar', ...
     *  2. Array mit Schlüssel, Wert Paaren: [['foo', 1], ['bar', 3], ...]
     *  3. Array mit Strings: ['foo', 'bar', ...]
     *  4. Set mit Strings: Set(['foo', 'bar', ...])
     *  5. Map mit Schlüssel, Wert Paaren: Map([['foo', 1], ['bar', 3], ...])
     *  6. Object mit Properties: {foo: 2, bar: 4, ...}
     * @returns {Array} [['foo', 1], ['bar', 3], ...]
     */
    NormalForm(argument) {
        return (function (...names) {
            var usedArray;
            switch (typeof names[0]) {
                case 'string': {// 'foo', 'bar', ...
                    names = [names];
                    // und weiter mit ['foo', 'bar', ...] -> kein break;
                }
                case 'object': {
                    if (names.length === 1) {
                        if (Array.isArray(names)) {
                            names = this.reduceArrayLevel(names);
                        }
                        switch (true) {
                            case (names[0] instanceof Set): {
                                // Set(['foo', 'bar', ...])
                                usedArray = Object.entries([...names[0]]).map(this.swapEntryFilter);
                                break;
                            }
                            case (names[0] instanceof Map): {
                                // Map([['foo', 1], ['bar', 3], ...])
                                usedArray = Object.entries([...names[0]]).map(this.MapEntryFilter);
                                break;
                            }
                            case (Array.isArray(names[0]) && typeof names[0]?.[1] === 'number' &&
                                typeof names[0]?.[0] === 'string'): {
                                    // ['foo', 'bar', ...]
                                    usedArray = Object.entries(names).map(this.valueArrayToKeyFilter);
                                    break;
                                }
                            case (Array.isArray(names[0]) && typeof names[0][0] === 'string'): {
                                // ['foo', 'bar', ...]
                                usedArray = Object.entries(names[0]).map(this.swapEntryFilter);
                                break;
                            }
                            case (names[0] instanceof Object): {
                                // {foo: 2, bar: 4, ... }
                                usedArray = Object.entries(names[0]).map(this.entryFilter);
                                break;
                            }
                        }
                    }
                    break;
                }
                default:
                    throw new TypeError(`The arguments 'names' has not correct Type!`);
            }
            usedArray = usedArray.filter((entry) => {
                return Array.isArray(entry);
            });
            return usedArray;
        }).apply(this, argument);
    }

    separateOption(parameter) {
        let optionsObj, option, labelObjects, keyWort;
        [optionsObj, option, ...labelObjects] = parameter;
        keyWort = (typeof optionsObj === 'string' &&
            optionsObj.toUpperCase() === 'OPTION') ? 'OPTION' : '';
        if ((optionsObj?.option)) {
            [{ option: optionsObj, ...option }, ...labelObjects] = parameter;
            keyWort = 'OPTION';
        }
        if ((keyWort === 'OPTION' && typeof option === 'object')) {
            option = Object.assign(this.DefaultOption, option);
            parameter = labelObjects;
            labelObjects = null
        }
        labelObjects = this.NormalForm(parameter);
        return [(option ?? this.DefaultOption), labelObjects];
    }

    constructor() {
        this.DefaultOption = { ...this.constructor.DefaultOption };
    }
}
