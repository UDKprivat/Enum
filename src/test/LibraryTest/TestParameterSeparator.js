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

/* ***************************************
 * Test der ParameterSeparator-Klasse
 * 
 * Autor: Ulf Kornblum 2022 
 *
 * **************************************/

'use strict';

QUnit.module(`ParameterSeparator testen`, hooks => {

    const [EnterpriseTmpl, YamatoTmpl, OdysseyTmpl] = [
      'Enterprise', 'Yamato', 'Odyssey'];
  
      const tmpl = (optBbj) => {
        return [optBbj, Object.entries(optBbj)[0]];
      };
      const desc = (tmpl) => {
          return `${tmpl[1][0]}: '${tmpl[1][1]}'`;  
      };
      const [OptionTmpl, EnumTypeTmpl, cryptoTmpl, countTypTmpl, IDTypeTmpl] =
        [
          tmpl({ option: 'option' }), // {!== null} dummy  
          tmpl({ enumType: 'Galaxy' }), // {string} typeName 
          tmpl({ crypto: true }), // |false 
        ];
  
        const ToBuildOptions = [ //  immer ...ToBuildConstants[x]
        {
          desc: `'${OptionTmpl[0].option}', {${desc(EnumTypeTmpl)}}`,
          template: [OptionTmpl[0].option, { ...EnumTypeTmpl[0] }]
        },
        {
          desc: `{ ${desc(OptionTmpl)}, ${desc(EnumTypeTmpl)} }`,
          template: [{...OptionTmpl[0], ...EnumTypeTmpl[0]}]
        },
      ];
  
      const ToBuildConstants = [ // immer ...ToBuildConstants[x].template
        {
          desc: `' ${EnterpriseTmpl}', ... `,
          template: [EnterpriseTmpl, YamatoTmpl, OdysseyTmpl],
          expected: [[EnterpriseTmpl, 0], [YamatoTmpl, 1], [OdysseyTmpl, 2]]
        },
        {
          desc: `'[ { ${EnterpriseTmpl}: 23 , ... }]`,
          template: [{ [EnterpriseTmpl]: 23, [YamatoTmpl]: 29, [OdysseyTmpl]: 31 }],
          expected: [[EnterpriseTmpl, 23], [YamatoTmpl, 29], [OdysseyTmpl, 31]]
        },
        {
          desc: `[ '${EnterpriseTmpl}', ... ], `,
          template: [[EnterpriseTmpl, YamatoTmpl, OdysseyTmpl]],
          expected: [[EnterpriseTmpl, 0], [YamatoTmpl, 1], [OdysseyTmpl, 2]]
        },
        {
          desc: ` Set(['${EnterpriseTmpl}', ... ]) `,
          template: [new Set([EnterpriseTmpl, YamatoTmpl, OdysseyTmpl])],
          expected: [[EnterpriseTmpl, 0], [YamatoTmpl, 1], [OdysseyTmpl, 2]]
        },
        {
          desc: ` [['${EnterpriseTmpl}', 3], ...] `,
          template: [[[[EnterpriseTmpl, 3], [YamatoTmpl, 5], [OdysseyTmpl, 7]]]],
          expected: [[EnterpriseTmpl, 3], [YamatoTmpl, 5], [OdysseyTmpl, 7]]
        },
        {
          desc: ` Map([['${EnterpriseTmpl}', 3], ...] `,
          template: [new Map([[EnterpriseTmpl, 3], [YamatoTmpl, 5], [OdysseyTmpl, 7]])],
          expected: [[EnterpriseTmpl, 3], [YamatoTmpl, 5], [OdysseyTmpl, 7]]
        },
      ];
  
    QUnit.test('Optionen und Const-Parameter trennen', function (assert) {
  
      ToBuildOptions.forEach((opt, i) => {
        ToBuildConstants.forEach((val, j) => {
          const descCombi = `test ${(i)*10 + j}: [ ${opt.desc}, ${val.desc} ]`;
          const param = [...opt.template,  ...val.template];
          // console.debug('param %o', param);
          const parSep = new ParameterSeparator();
          const optionNames = parSep.separateOption(param);
          // console.dir(optionNames);
          
          assert.ok(optionNames, descCombi);
          const [option, ...names] = optionNames;
          // console.debug('option %o, expected %o',option, EnumTypeTmpl[0]);
          
          assert.deepEqual(option, EnumTypeTmpl[0], `Option => {enumType: ${option.enumType}} erkannt!`);
          // console.debug(`names %o, val.expected %o`, names, [val.expected]);
          
          assert.deepEqual(names, [val.expected], `[${val.expected}] erkannt!`);
        })
      });
  
    });
});