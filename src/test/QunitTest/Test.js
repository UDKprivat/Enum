/* ***************************************
 * QUnit kennenlernen 
 * - einige Test kopiert und zum laufen gebracht
 * Autor: Ulf Kornblum 2022 
 *
 * **************************************/

'use strict';

class Maker {
  // dummy
  parts = [];
  typ = '';
  build(typ, parts) {
    this.parts = parts;
    this.typ = typ;
    return typ;
  }

  log() {
    return this.parts;
  }

  duplicate() {
    var copy = new Maker();
    copy.build(this.typ, this.parts);
    return copy;
  }
};

const { test } = QUnit;

const makerExpected = new Maker();
makerExpected.parts = [];
makerExpected.typ = '';

QUnit.module('Module Machine Maker - Using the test context', hooks => {
  var maker;
  var parts;    

  hooks.before(assert => {
    assert.deepEqual(new Maker(), makerExpected, 'hooks.before: Maker() ist ok!');
  });

  hooks.beforeEach(assert => {
    parts = ['wheels', 'motor', 'chassis'];
    maker = new Maker(parts);
    assert.equal(maker.build('robot', parts), 'robot', `hooks.beforeEach: 
    Es ist wieder ein "robot" -- Dieser Text ist eine HereDoc und 
    ist ganz lang --`);
  }); 

  test('makes a robot', assert => {
    parts.push('arduino');
    assert.deepEqual(maker.log(), parts, 'test: deepEqual funktioniert');
  });

  test('makes a car', assert => {
    assert.equal(maker.build('car', parts), 'car', 'Maker.build funktioniert');
    var copy = maker.duplicate();
    assert.deepEqual(copy.log(), parts, 'test: Maker.log() ausprobiert ');
    assert.strictEqual(copy.log, maker.log, 'test: function maker.' + maker.log.name + '() vorhanden');
    var mdummy = { log: function () { } };
    assert.notStrictEqual(copy.log, mdummy.log, 'test: function mdummy.' + mdummy.log.name + '() vorhanden');
  });

  function isEven(x) {
    return x % 2 === 0;
  }

  QUnit.test.each('isEven()', [2, 4, 6], (assert, data) => {
    assert.true(isEven(data), `test.Each: ${data} is even`);
  });
});


QUnit.module('Module My Group - Hooks on nested modules',
  hooks => {
    // ******************
    // It is valid to call the same hook methods more than once.

    var comment = {
      comment: 'object on nested modules'
    };

    hooks.beforeEach(assert => {
      assert.ok(true, '(My Group) beforeEach called');
    });

    hooks.before(assert => {
      assert.ok(true, '(My Group) before called');
    });

    hooks.afterEach(assert => {
      assert.ok(true, '(My Group) afterEach called');
    });

    hooks.after(assert => {
      assert.ok(true, '(My Group) after called');
    });

    test('with hooks', assert => {
      // 1 x beforeEach
      // 1 x afterEach
      assert.ok(comment, "option vorhanden");
      assert.ok(true, 'the parent Test called');
    });


    QUnit.module('Nested Group', hooks => {
      // ++++++++++++++++
      // This will run after the parent module's beforeEach hook
      hooks.before(assert => {
        assert.ok(true, '(Nested Group) nested before called');
      });

      hooks.beforeEach(assert => {
        assert.ok(true, '(Nested Group) nested beforeEach called');
      });

      // This will run before the parent module's afterEach
      hooks.afterEach(assert => {
        assert.ok(true, '(Nested Group) nested afterEach called');
      });

      test('with nested hooks', assert => {
        // 2 x beforeEach (parent, current)
        // 2 x afterEach (current, parent)
        assert.ok(true, 'the nested Test called');
      });
      // nested Group ende
      // +++++++++++++++++
    });
    // my Group ende
    // ******************
  });

QUnit.module('Robot', hooks => {
  var robot;
  hooks.beforeEach(() => {
    robot = new Robot();
  });

  // Robot is not yet finished, expect this is a todo test
  QUnit.test.todo('fireLazer', assert => {
    const result = robot.fireLazer();
    assert.equal(result, "I'm firing my lazer!");
  });
});

