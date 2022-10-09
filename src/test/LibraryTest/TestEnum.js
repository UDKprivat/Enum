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
 * Test der Enum-Klasse wie:
 * 
 * Autor: Ulf Kornblum 2022 
 *
 * **************************************/

'use strict';

QUnit.module(`Enum-Klasse testen`, hooks => {

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
        tmpl({ countType: Enum.COUNT }),// Enum.<AUTO|COUNT> 
        // tmpl({ idType: Enum.HASH })// Enum.<HASH|UUID|UID> 
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

  const EnumType = 'Galaxy';
  const CountType = Enum.BINARY;
  const StartIndex = 2;
  const GalaxyOptions = {
    enumType: EnumType, 
    countType: CountType, 
    startNumber: StartIndex
  };

  const Galaxy = new Enum('option', GalaxyOptions, expectedNames);
  const AndromedaOptions = {option: true, ...GalaxyOptions};
  const Andromeda = new Enum(AndromedaOptions, expectedNames);
  console.dir(Andromeda);

  const {Enterprise, Yamato, Odyssey} = Galaxy;
  const constObj = [Enterprise, Yamato, Odyssey];

  const IndexTypes = new Enum([['auto', 0], ['binary', 1], ['count', 2]])
  console.log(IndexTypes);
  console.log ('Enterprise === Enterprise',  Enterprise === Andromeda.Enterprise);

  QUnit.test('Anlegen und Überprüfen der Enum-Funktionen', function (assert) {
        
    for(const obj of constObj) {
      assert.ok(constObj.includes(obj), 
          `Das Destukurieren mit Konstanten '${obj.name}' hat funktioniert`);
    }

    assert.equal(Galaxy.Enterprise.name, expectedNames[0],
      `enumEntry ${expectedNames[0]} angelegt!`);
    assert.propContains(Galaxy.Enterprise, 
      {name: expectedNames[0], index: 2 ** StartIndex, enumType: "Galaxy"}, 
      `Name und Index ist korrekt vorhanden`);

    assert.equal(Galaxy[expectedNames[1]].name, expectedNames[1],
      `enumEntry ${expectedNames[1]} angelegt!`);
    assert.equal(Galaxy[expectedNames[2]].name, expectedNames[2],
      `enumEntry ${expectedNames[2]} angelegt!`);

    assert.ok(([...Galaxy] instanceof Array), 'Iterator ist OK!');
    assert.equal([...Galaxy].length, expectedNames.length * 2, 'Array-Anzahl ist OK!');

    var uuidTmp = window.crypto.randomUUID();
    Enterprise.value = uuidTmp;
    assert.equal(Enterprise.value, uuidTmp, 
      `Die UUID <${uuidTmp}> ist in Enterprise.value gespeichert`);
    
    uuidTmp = window.crypto.randomUUID();
    Yamato.value = uuidTmp;
    assert.equal(Yamato.value, uuidTmp, 
      `Die UUID <${uuidTmp}> ist in Yamato.value gespeichert`);

    assert.notEqual(Enterprise.value, Yamato.value,
      'Beide oberen Konstanten haben undterschiedliche Values');

    assert.equal(Yamato.enumType, EnumType, 
      'In dem Enum-Objekt ist der korrekte enumType gesichert!');
    assert.deepEqual(Yamato.enumObject, Galaxy,
      'In dem Enum-Objekt ist das erstellte Enum-Objekt gesichert!');
  
    assert.throws(function () { Galaxy.Enterprise = 1000; }, 
      'Der Enum-Entry kann nicht mit einem neuem Wert überschrieben werden.');
    assert.throws(function () { Enterprise = 1000; },
      'Der Enum-Entry als Konstante kann nicht mit einem neuem Wert überschrieben werden.');
  });

  QUnit.test('Überprüfen der EnumEntries als Konstanten', function (assert) {

    let ConstantFunc = {
      [Enterprise]() {
        assert.ok(true, `[${Enterprise.name}]() as [${Enterprise}]()`);
      },
      [Yamato]() {
        assert.ok(true, `[${Yamato.name}]() as  [${Yamato}]()`);
      },
      [Odyssey]() {
        assert.ok(true, `[${Odyssey.name}]() as [${Odyssey}]()`);
      }
    };

    for(const obj of constObj) {
      ConstantFunc[obj]();
    }

    assert.ok((Galaxy.Enterprise < Galaxy.Yamato), 
      `Galaxy.Enterprise(${+Galaxy.Enterprise}) < Galaxy.Yamato(${+Galaxy.Yamato}) OK`);
    assert.ok((Galaxy.Odyssey > Galaxy.Yamato), 
      `Galaxy.Odyssey(${Galaxy.Odyssey*1}) > Galaxy.Yamato(${+Galaxy.Yamato}) OK`);
    assert.ok((Enterprise < Galaxy.Yamato), 
      `const Enterprise(${+Enterprise}) < Galaxy.Yamato(${+Galaxy.Yamato}) OK`);    
    assert.ok((Odyssey > Galaxy.Yamato), 
      `const Odyssey(${+Odyssey}) > Galaxy.Yamato(${+Galaxy.Yamato}) OK`);
    assert.ok((Odyssey === Galaxy.Odyssey), 
      `const Odyssey(${+Odyssey}) === Galaxy.Odyssey(${1*Galaxy.Odyssey}) OK`);

    assert.ok((Galaxy.Enterprise.uid < Galaxy.Yamato.uid), 
      `Galaxy.Enterprise.uid(${Galaxy.Enterprise.uid}) < Galaxy.Yamato.uid(${Galaxy.Yamato}) OK`);
    assert.ok((Galaxy.Odyssey.uid > Galaxy.Yamato.uid), 
      `Galaxy.Odyssey.uid(${Galaxy.Odyssey.uid}) > Galaxy.Yamato.uid(${Galaxy.Yamato}) OK`);
    assert.ok((Enterprise.uid < Galaxy.Yamato.uid), 
      `const Enterprise.uid(${Enterprise.uid}) < Galaxy.Yamato.uid(${Galaxy.Yamato}) OK`);    
    assert.ok((Odyssey.uid > Galaxy.Yamato.uid), 
      `const Odyssey.uid(${Odyssey.uid}) > Galaxy.Yamato.uid(${Galaxy.Yamato}) OK`);
    assert.ok((Odyssey.uid === Galaxy.Odyssey.uid), 
      `const Odyssey.uid(${Odyssey.uid}) === Galaxy.Odyssey.uid(${Galaxy.Odyssey}) OK`);
    
    assert.equal((Enterprise | Yamato), 12, 
      `${Enterprise.name}.index: ${+Enterprise} | ${Yamato.name}.index: ${+Yamato} korrekt 12`);
    
  });
});
