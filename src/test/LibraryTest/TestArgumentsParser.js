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
 * Test der ArgumentsParser-Klasse
 * 
 * Autor: Ulf Kornblum 2022 
 *
 * **************************************/

'use strict';

QUnit.module(`ArgumentsParser testen`, hooks => {

  const [EnumTTmpl, EnterpriseTmpl, YamatoTmpl, OdysseyTmpl] = [
    'Galaxy', 'Enterprise', 'Yamato', 'Odyssey'];

  const tmpl = (optBbj) => {
    return [optBbj, Object.entries(optBbj)[0]];
  };
  const desc = (tmpl) => {
    return `${tmpl[1][0]}: '${tmpl[1][1]}'`;
  };
  const [OptionDefaultTmpl, OptionTmpl, CountTypeAutoTmpl, CountTypeBinaryTmpl] =
    [
      tmpl({ cause: 'default', }),
      tmpl({ cause: 'type', }),
      tmpl({ indexType: 'AUTO' }), // |AUTO 
      tmpl({ indexType: 'BINARY' }),
    ];

  const ToBuildOptions = [ //  immer ...ToBuildConstants[x]
    {
      desc: `Ohne Option`,
      template: null,
      expected: { ...OptionDefaultTmpl[0], ...CountTypeAutoTmpl[0] }
    },
    {
      desc: `{ ${desc(OptionTmpl)}, ${desc(CountTypeBinaryTmpl)} }`,
      template: [{ ...OptionTmpl[0], ...CountTypeBinaryTmpl[0] }],
      expected: { ...OptionTmpl[0], ...CountTypeBinaryTmpl[0] }
    },
  ];

  const ToBuildConstants = [ // immer ...ToBuildConstants[x].template
    {
      desc: `' ${EnumTTmpl}, <Falsche StringListe> ${EnterpriseTmpl}', ...  === TypeError`,
      template: [EnumTTmpl, EnterpriseTmpl],
      expected: TypeError
    },
    {
      desc: `' ${EnumTTmpl}, <Falsche StringListe> ${EnterpriseTmpl}', ...  === TypeError`,
      template: [EnumTTmpl, EnterpriseTmpl, YamatoTmpl, OdysseyTmpl],
      expected: TypeError
    },
    {
      desc: `' ${EnumTTmpl}, <Falscher Map-Key> new Map([[{${EnterpriseTmpl}: 1}, 3]', ...  === TypeError`,
      template: [EnumTTmpl, new Map([
        [{ EnterpriseTmpl: 1 }, 3], [{ YamatoTmpl: 2 }, 5], [{ OdysseyTmpl: 3 }, 7]])],
      expected: TypeError
    },
    {
      desc: `' ${EnumTTmpl}, <Falsche ListType> [{${EnterpriseTmpl}: function}]', ...  === TypeError`,
      template: [EnumTTmpl, [() => 4, () => 8, () => 16]],
      expected: TypeError
    },
    {
      desc: `'[ <ohne enumType> { ${EnterpriseTmpl}: 23 , ... }] === TypeError`,
      template: [{ [EnterpriseTmpl]: 23, [YamatoTmpl]: 29, [OdysseyTmpl]: 31 }],
      expected: RangeError
    },
    {
      desc: `' ${EnumTTmpl},  [${EnterpriseTmpl}', ... ]`,
      template: [EnumTTmpl, [EnterpriseTmpl, YamatoTmpl, OdysseyTmpl]],
      expected: [[EnterpriseTmpl, 0], [YamatoTmpl, 1], [OdysseyTmpl, 2]]
    },
    {
      desc: ` ${EnumTTmpl},  Set(['${EnterpriseTmpl}', ... ]) `,
      template: [EnumTTmpl, new Set([EnterpriseTmpl, YamatoTmpl, OdysseyTmpl])],
      expected: [[EnterpriseTmpl, 0], [YamatoTmpl, 1], [OdysseyTmpl, 2]]
    },
    {
      desc: ` ${EnumTTmpl},  [['${EnterpriseTmpl}', 3], ...] `,
      template: [EnumTTmpl, [[[EnterpriseTmpl, 3], [YamatoTmpl, 5], [OdysseyTmpl, 7]]]],
      expected: [[EnterpriseTmpl, 3], [YamatoTmpl, 5], [OdysseyTmpl, 7]]
    },
    {
      desc: ` ${EnumTTmpl}, '[ { ${EnterpriseTmpl}: 23 , ... }]`,
      template: [EnumTTmpl, { [EnterpriseTmpl]: 23, [YamatoTmpl]: 29, [OdysseyTmpl]: 31 }],
      expected: [[EnterpriseTmpl, 23], [YamatoTmpl, 29], [OdysseyTmpl, 31]]
    },
    {
      desc: ` ${EnumTTmpl},  Map([['${EnterpriseTmpl}', 3], ...] `,
      template: [EnumTTmpl, new Map([[EnterpriseTmpl, 3], [YamatoTmpl, 5], [OdysseyTmpl, 7]])],
      expected: [[EnterpriseTmpl, 3], [YamatoTmpl, 5], [OdysseyTmpl, 7]]
    },
  ];

  const optNames = [
    'cause', 'indexType', 'startIndex', 'startIndex'
  ];

  QUnit.test('Optionen und Const-Parameter trennen', function (assert) {

    ToBuildOptions.forEach((opt, i) => {
      ToBuildConstants.forEach((val, j) => {
        const descCombi = `test ${(i) * 100 + j}: [ ${opt.desc}, ${val.desc} ]`;
        const param = [];
        if (opt?.template) {
          param.push(...opt.template);
        }
        param.push(...val.template);
        // const param = [...opt.template,  ...val.template];
        // console.debug('param %o', param);
        ArgumentsParser.DefaultOption.indexType = CountTypeAutoTmpl[1][1];
        ArgumentsParser.DefaultOption.cause = OptionDefaultTmpl[1][1];
        const catchError = () => {
  
          assert.ok(true, descCombi);
          const optionNames = ArgumentsParser.separate(param, optNames);

          assert.ok(optionNames, 'ArgumentsParser.separate(param) erfolgreich!');
          const [option, enumType, labelObj] = optionNames;
          // console.debug('option %o, expected %o',option, EnumTypeTmpl[0]);
          delete option.separateIndex;

          assert.deepEqual(option, opt.expected,
            `Option => {indexType: ${opt.expected.indexType}} erkannt!`);
          // console.debug(`labelObj %o, val.expected %o`, labelObj, [val.expected]);

          assert.deepEqual(enumType, EnumTTmpl, `EnumType ${EnumTTmpl} erkannt!`);
          // console.debug(`labelObj %o, val.expected %o`, labelObj, [val.expected]);

          assert.deepEqual(labelObj, val.expected, `${val.expected} erkannt!`);
          
        };
        try {
          catchError();
        }
        catch (error) {
          assert.throws(() => { throw error }, val.expected, 
            `${error.name}("${error.message}") erkannt!`);
        }
      })
    });
  
    const AnalyseDatas = [
      {
        Desc: "labelList", data: [['i', 0], ['i', 1], ['i', 2], ['i', 4]], callBack: ([, i]) => i,
        expected: { expStartIndex: 0, expIndexType: 'BINARY' }
      },
      {
        Desc:"stetigBinary", data: [0, 1, 2, 4, 8, 16], callBack: (i) => i,
        expected: { expStartIndex: 0, expIndexType: 'BINARY' }
      }, // 2**(x+n+y), y = 1, offset x = 0, binär
      {
        Desc:"stetigBinary2", data: [1, 2, 4, 8, 16], callBack: (i) => i,
        expected: { expStartIndex: 0, expIndexType: 'BINARY' }
      }, // 2**(x+n+y), y = 1, offset x = 0, binär
      {
        Desc:"stetigBinaryBase", data: [4, 8, 16, 32, 64], callBack: (i) => i,
        expected: { expStartIndex: 2, expIndexType: 'BINARY' }
      }, // 2**(x+n+y), y=1, offset = 2, binär
      {
        Desc:"stetigSeriel", data: [0, 1, 2, 3, 4, 5, 6], callBack: (i) => i,
        expected: { expStartIndex: 0, expIndexType: 'SERIEL' }
      }, // n+y, y = 1, offset x = 0, seriel 
      {
        Desc:"stetigSerielBase", data: [5, 6, 7, 8, 9, 10], callBack: (i) => i,
        expected: { expStartIndex: 5, expIndexType: 'SERIEL' }
      }, // x + n + y, y = 1, offset x = 4, seriel
      {
        Desc:"stetigSerielBase2", data: [4, 6, 8, 10, 12, 14], callBack: (i) => i,
        expected: { expStartIndex: 0, expIndexType: 'AUTO' }
      }, // x + n + y, offset = 4, y = 2, seriel
      {
        Desc:"stetigSteigend", data: [0, 2, 3, 40], callBack: (i) => i,
        expected: { expStartIndex: 0, expIndexType: 'AUTO' }
      }, // RND, Auto
      {
        Desc:"unstetig", data: [0, 1, 2, 1, 3], callBack: (i) => i,
        expected: { expStartIndex: 0, expIndexType: 'AUTO' }
      }, // RND, Auto
      {
        Desc:"unstetig2", data: [-3, 4, 2, 3, 5], callBack: (i) => i,
        expected: { expStartIndex: 0, expIndexType: 'AUTO' }
      },// RND, Auto  
    ];
  
    QUnit.test('Listen mit Indices analysieren', function (assert) { 
      AnalyseDatas.forEach(({data, callBack, Desc, 
          expected: {expStartIndex, expIndexType}}) => {
            var {startIndex, indexType}= ArgumentsParser.indexAnalyse(data, callBack);
            assert.equal(startIndex, expStartIndex, `${data} hat einen startIndex = ${expStartIndex}!`);
            assert.equal(indexType, expIndexType, `${data} hat einen indexType = ${expIndexType}!` );
      });
    });
  
  });
});
