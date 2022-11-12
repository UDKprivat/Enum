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

  const [EnumTypeTmpl, EnterpriseTmpl, YamatoTmpl, OdysseyTmpl] = [
    'Galaxy', 'Enterprise', 'Yamato', 'Odyssey'];

  const tmpl = (optBbj) => {
    return [optBbj, Object.entries(optBbj)[0]];
  };
  const [OptionTmpl] =
    [
      tmpl({ cause: 'param' }), // {!== null} dummy  
      tmpl({ indexType: Enum.AUTO }),// Enum.<AUTO|SERIES|BINARY> 
      tmpl({ indexType: Enum.BINARY }),// Enum.<AUTO|SERIES|BINARY> 
    ];

  const EnumType = EnumTypeTmpl;
  const CountType = Enum.BINARY;
  const StartIndex = 2;
  const GalaxyOptions = {
    ...OptionTmpl[0],
    indexType: CountType,
    startIndex: StartIndex
  };

  const expectedNames = [EnterpriseTmpl, YamatoTmpl, OdysseyTmpl];

  const jsonTestStr = '{"Enum":[{"cause":"json","indexType":"BINARY"},"jsonTest",[{"Enterprise":[1,"22D5-7DA5-5C66-4FCA-6C42-0DBE"]},{"Yamato":[2,"546D-7135-4BD6-40EF-6856-BC42"]},{"Odyssey":[4,"688C-7BB5-D776-49A0-6F97-6A19"]}]]}';

  const AndromedaOptions = { ...OptionTmpl[0], ...GalaxyOptions };
  const Andromeda = new Enum(AndromedaOptions, 'Andromeda', expectedNames);

  const Galaxy = new Enum(GalaxyOptions, EnumTypeTmpl, expectedNames);

  const { Enterprise, Yamato, Odyssey } = Galaxy;
  const GalaxyItems = [Enterprise, Yamato, Odyssey];

  QUnit.test('Anlegen und Überprüfen der Enum-Funktionen', function (assert) {

    assert.equal(Enum.getConst('Foo')?.name, 'AUTO', 'Unbekannter Konstantenname \'Foo\' ergibt "Enum.AUTO"');
    assert.equal(Enum.getConst(Enum.SERIES)?.name, 'SERIES', 'ENUM.SERIES ergibt "Enum.SERIES"');
    assert.equal(Enum.getConst('BINARY')?.name, 'BINARY', '"BINARY" ergibt "Enum.BINARY"');

    assert.ok(Enum['Andromeda'], 'Der EnumType ist als statische Konstante angelegt.');

    assert.deepEqual(JSON.stringify(Enum.parse(jsonTestStr)), jsonTestStr,
      'JSON-Testobjekt korrekt eingelesen und wieder zum JSON-String gewandelt.');
    
    for (const obj of GalaxyItems) {
      assert.ok(Galaxy[obj.name], `Das Destrukturieren mit Konstanten '${obj.name}' hat funktioniert`);
    }

    assert.equal(Galaxy.Enterprise.name, expectedNames[0],
      `enumEntry ${expectedNames[0]} angelegt!`);

    assert.propContains(Galaxy.Enterprise,
      { name: expectedNames[0], index: 2 ** StartIndex, enumType: "Galaxy" },
      `Name und Index ist korrekt vorhanden`);

    assert.equal(Galaxy[expectedNames[1]].name, expectedNames[1],
      `enumEntry ${expectedNames[1]} angelegt!`);
    assert.equal(Galaxy[expectedNames[2]].name, expectedNames[2],
      `enumEntry ${expectedNames[2]} angelegt!`);

    assert.ok(Array.isArray([...Galaxy]), 'Iterator ist OK!');
    assert.equal([...Galaxy].length, expectedNames.length, 'Array-Anzahl ist OK!');

    var uuidTmp = window.crypto.randomUUID();
    Enterprise.store = uuidTmp;
    assert.equal(Enterprise.store, uuidTmp,
      `Die UUID <${uuidTmp}> ist in Enterprise.store gespeichert`);

    uuidTmp = window.crypto.randomUUID();
    Yamato.store = uuidTmp;
    assert.equal(Yamato.store, uuidTmp,
      `Die UUID <${uuidTmp}> ist in Yamato.store gespeichert`);

    assert.notEqual(Enterprise.store, Yamato.store,
      'Enterprise und Yamato haben unterschiedliche Values');
;
    assert.equal(Yamato.enumType, EnumType,
      'In dem Enum-Objekt ist der korrekte enumType gesichert!');
    assert.deepEqual(Yamato.enumObject, Galaxy,
      'In dem Enum-Objekt ist das erstellte Enum-Objekt gesichert!');

    assert.throws(function () { Galaxy.Enterprise = 1000; },
      'Der Enum-Entry kann nicht mit einem neuem Wert überschrieben werden.');
    assert.throws(function () { Enterprise = 1000; },
      'Der Enum-Entry als Konstante kann nicht mit einem neuem Wert überschrieben werden.');
  });

  QUnit.test('Überprüfen der EnumItem als Konstanten', function (assert) {

    let ConstantFunc = {
      [Enterprise]() {
        assert.ok(true, `[${Enterprise.name}]() as [${Enterprise}]()`);
      },
      [Yamato]() {
        assert.ok(true, `[${Yamato.name}]() as [${Yamato}]()`);
      },
      [Odyssey]() {
        assert.ok(true, `[${Odyssey.name}]() as [${Odyssey}]()`);
      }
    };

    for (const obj of GalaxyItems) {
      ConstantFunc[obj]();
    }

    assert.ok((Galaxy.Enterprise < Galaxy.Yamato),
      `Galaxy.Enterprise(${+Galaxy.Enterprise}) < Galaxy.Yamato(${+Galaxy.Yamato}) OK`);
    assert.ok((Galaxy.Odyssey > Galaxy.Yamato),
      `Galaxy.Odyssey(${Galaxy.Odyssey * 1}) > Galaxy.Yamato(${+Galaxy.Yamato}) OK`);
    assert.ok((Enterprise < Galaxy.Yamato),
      `const Enterprise(${+Enterprise}) < Galaxy.Yamato(${+Galaxy.Yamato}) OK`);
    assert.ok((Odyssey > Galaxy.Yamato),
      `const Odyssey(${+Odyssey}) > Galaxy.Yamato(${+Galaxy.Yamato}) OK`);
    assert.ok((Odyssey === Galaxy.Odyssey),
      `const Odyssey(${+Odyssey}) === Galaxy.Odyssey(${1 * Galaxy.Odyssey}) OK`);

    assert.ok((Galaxy.Enterprise.esid < Galaxy.Yamato.esid),
      `Galaxy.Enterprise.esid(${Galaxy.Enterprise.esid}) < Galaxy.Yamato.esid(${Galaxy.Yamato.esid}) OK`);
    assert.ok((Galaxy.Odyssey.esid > Galaxy.Yamato.esid),
      `Galaxy.Odyssey.esid(${Galaxy.Odyssey.esid}) > Galaxy.Yamato.esid(${Galaxy.Yamato.esid}) OK`);
    assert.ok((Enterprise.esid < Galaxy.Yamato.esid),
      `const Enterprise.esid(${Enterprise.esid}) < Galaxy.Yamato.esid(${Galaxy.Yamato.esid}) OK`);
    assert.ok((Odyssey.esid > Galaxy.Yamato.esid),
      `const Odyssey.esid(${Odyssey.esid}) > Galaxy.Yamato.esid(${Galaxy.Yamato.esid}) OK`);
    assert.ok((Odyssey === Galaxy.Odyssey),
      `const Odyssey.esid(${Odyssey}) === Galaxy.Odyssey.esid(${Galaxy.Odyssey}) OK`);

    assert.equal(Andromeda.toString(), '[object Enum]',
      `die Methode 'Andromeda.toString()' arbeitet korrekt.`);
    assert.equal(Andromeda.Enterprise.toString(), '[object EnumItem]',
      `die Methode 'Andromeda.Enterprise.toString()' arbeitet korrekt.`);

    assert.equal(`${Andromeda}`, 'Andromeda', `Enum als String ergibt den EnumTyp als String.`);
    assert.equal((+Andromeda), 0, `Enum als Zahl ergibt immer 0.`);
    assert.equal(Object.prototype.toString.call(Andromeda), '[object Enum]');  

    assert.equal((Enterprise | Yamato), 12,
      `${Enterprise.name}.index: ${+Enterprise} | ${Yamato.name}.index: ${+Yamato} korrekt 12`);

  });

});
