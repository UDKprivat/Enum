# Enum
Die Bibliothek **Enum** bildet den in Javascript fehlenden Datentyp *Enum* nach. 

## Enum
Die Klasse *Enum* ist der Datentyp *Enum* als Container für die *EnumItem*.

### Beschreibung
Die erzeugten Objekt(e) *Enum* und \([EnumItem](#enumitem))
- sind geschützt (sie können nicht verändert oder überschrieben werden),
- sind eineindeutig, 
- sind indexiert (automatisch oder parametrierbar),
- sind sortierbar (die Indexe und die ESID[^esid]-Strings),
- haben eine *store*-Eigenschaft (Speichermöglichkeit für zusätzliche Daten/Objekte).

### Construktor
Erzeugt ein neues *Enum* Objekt mit den einzelnen Item-Objekten (*EnumItem*).
  
#### **Syntax**
```js 
new Enum(option, enumType, label)
```
### Parameter

#### ***option*** <sub>(Optional)</sub>
Mit den Optionen können die Enum-Elemente abweichend vom Standard erzeugt werden.

- Der Parametersatz enthält keine Option:
  ```js
  const [Option, Label] = ArgumentsParser.separateOption(
    'TypeName', ['FOO', 'Bar', 'Labelx'] );
  ```
  
- Der Parametersatz enthält ein Object mit der Eigenschaft "indexType":
  ``` js
  const [Option, Label] = ArgumentsParser.separateOption(
      {cause: 'param', indexType: Enum.BINARY}, 'TypeName', ['FOO', 'Bar', 'Labelx']);
  ```

Zur Zeit werden folgende Optionen unterstützt:
1. **indexType:** Mit den Typen kann der Index angepasst werden:<br>
   *BINARY* und *SERIES* berechnen die Indexe aus den übergebenen Positionen der Namen.

   * *Enum.AUTO*: Der Index wird aus den übergebenen Positionen der Namen im Array oder der übergebenen Indexe ermittelt.
   * *Enum.BINARY*: Die Indexe werden aus der 2er-Potenz gebildet: 1, 2, 4, 8, ...
   * *Enum.SERIES*:  Die Indexe werden aufgezählt 1, 2, 3, 4, ...

2. **startIndex:** Ist der Offset auf die laufende Nummer. Diese Nummer wird in dem *SERIES*-Modus zu einem Offset  `(n + startIndex)` und im *BINARY*-Modus zum Offset der 2er-Potenz `2^(n + startIndex)`

3. **esidTemplate:** Mit dem Template kann die Struktur der *ESID* beeinflußt werden:
   * Example: *'b-SbS-nnb-ENUM/8-w-w-b-n'* <br>
     Result: *'55-SAES-45FD-ENUM/8-633B-7055-5E-8'*
     - **Hex-Zeichen:**<br>
       w: *zufällige 16Bit-Zahl (word)*<br>
       b: *zufällige  8Bit-Zahl (byte)*<br>
       n: *zufällige  4Bit-Zahl (nibble)*<br>
       \[0-9A-Z/-]: *Fest eingestellte Zeichen*

<!-- 4. **idType:** z.Z. ungenutzt[^auto], später ggf. den Typ UUID[^uuid] und HASH[^hash] -->


#### ***enumType***
Der Enum-Name (*enumType*) ist die Bezeichnung und der Name des Enum-Objektes.

#### ***label***
Eine Liste mit den Namen für die Bezeichnung der EnumEinträgen:
Sieben Datentypen können als Liste zur Erzeugung genutzt werden: 
  - StringListe: `... ,'FOO', 'Bar', ...`
  - StringArray: `..., ['FOO', 'Bar', ...]`
  - Set: `..., Set(['FOO', 'Bar', ...]`
  - Array\[key, index]: `..., [['FOO', 1], ['Bar', 3], ...]`
  - Map: `..., Map([['FOO', 1], ['Bar', 3], ...])`
  - Object: `..., {FOO: 2, Bar: 4, ...}`
  - Object: `..., {FOO: [2, id], Bar: [4, id], ...}`<br>
    Dieses Format wird für den JSON-Import genutzt.
  
Die DatenTypen können in zwei Gruppen aufgeteilt werden:
1. der Index wird aus der Position in der Liste ermittelt:
    - **`'enumType', ['key', ...]`**: 
      ```js
      const [Option, Label] = ArgumentsParser.separateOption(
        'TypeName', ['FOO', 'Bar', 'Labelx']);
      ```
    - **`'enumType', Set('key', ...)`**:
      ```js
      const [Option, Label] = ArgumentsParser.separateOption(
        'TypeName', Set(['FOO', 'Bar', 'Labelx']));
      ```
2. Der Index wird als zweiter Wert **Value** mit gegeben: 
    - **`'enumType', [[key, Value], ...]`**: 
      ```js
      const [Option, Label] = ArgumentsParser.separateOption(
        'TypeName', [['FOO', 3], ['Bar', 5], ['Labelx', 7]]);
      ```
    - **`'enumType', Map([[Key, Value], ...])`**: 
      ```js
      const [Option, Label] = ArgumentsParser.separateOption(
        'TypeName', Map([['FOO', 13], ['Bar', 17], ['Labelx', 19]]));
      ```
    - **`'enumType', {key: Value, ...}`**:
      ```js
      const [Option, Label] = ArgumentsParser.separateOption(
        'TypeName', {FOO: 8, Bar: 16, Labelx: 32});
      ```
    - **`'enumType', {key: [Value, id], ...}`**:
      ```js
      const [Option, Label] = ArgumentsParser.separateOption(
        'TypeName', {FOO: [8, '55-SAES-...8'], Bar: [16, '64-S10S-...D'], 
            Labelx: [32, 'A3-S0CS-...1']});
      ```
      Hier wird noch zusätzlich die ID mitgegeben, diese ID muss wie eine *UUID* oder *ESID* eineindeutig sein, muss aber nicht diesem Muster entsprechen und sie braucht nicht sortierbar sein wie die *ESID*.


### Statische Methoden

`Enum.getName(id)`

Ermittelt den Namen des Enum-Elements (EnumItem) aus allen bisher erzeugten Elementen.

`Enum.getItem(id)`

Ermittelt den Namen des Enum-Elements (EnumItem) aus allen bisher erzeugten Elementen.

### Statische Eigenschaften
Der Optionstyp  
+ `Enum.AUTO` ist für das automatische Erzeugen des Index und die Auswahl des ID-Types.
+ `Enum.BINARY` ist für das Erzeugen der Indexe als 2er-Potenz \[1, 2, 4, 8, ...].
+ `Enum.SERIES` ist für das Erzeugen der Indexe als \[1, 2, 3, 4, ...].

+`const colors = Enum['colors']` gibt den Enum 'colors' zurück.

### Eigenschaften der Instanz
Eigenschaften beeinflussen die Erstellung der Enum-Objekte. Die Objekte können über die Default- oder über die Temporären-Eigenschaften beeinflusst werden.

+ `colors.indexType === Enum.AUTO`<br>
  \[AUTO|BINARY|SERIES] gibt den Typ der Indizes an.
+ `colors.option`<br>
  gibt die Parametern an, mit den Konstanten(*EnumItem*) erzeugt wurden.
+ `colors.name === 'colors'`<br>
  Name des Enum.
+ `colors.red`<br>
  gibt den EnumItem mit der Bezeichnung 'red' zurück. 
+ `colors['53F6-05-CFA0-0BB0-ITEM-1974-6A36-E193-1176']`<br>
  gibt den EnumItem mit der ID '53F6-05-CFA0-0BB0-ITEM-1974-6A36-E193-1176' zurück. 

Alle oben aufgezählten Typen können auch als Option in den Parametern übergeben werden \(siehe [Parameter](#parameter)).

### Methoden der Instanz
+ `colors.bitRegister('red', 'blue') === 3`<br>
  erzeugt aus den Indizes der benannten Item eine Zahl.
+ `console.log(colors.get(3)) // [EnumItem, EnumItem]`<br>
  gibt ein Array mit den Item zurück.

----
## EnumItem
Das Objekt *EnumItem* stellt den benannten konstanten Einträge des *Enum* dar.

### Beschreibung
Die *EnumItem* können unterschiedlich genutzt werden: als ID-String, Zahl, Objekt.
```js 
const Colors = new Enum({cause: 'param', countTyp: Enum.BINARY}, 'colors', ['red', 'blue', 'green']);
```

#### Beispiel:
* als PropertyName:
  ```js 
  const Konstant = {[Colors.red]: 0xFF00};
  console.log(Konstant); // {'55-SAES-45FD-ENUM/8-633B-7055-5E-8': 0xFF00}
  
  ```
* als Zahl:
  ```js
  console.log('%s, %s', (Colors.blue * 5),  (Colors.green * 5)); // 10, 20
  console.log('%s', (Colors.blue | Colors.green)); // 6
  ```
* als Objekt:
  ```js
  console.log([Colors.green, Colors.red, Colors.blue][1].name); // 'red'
  ```

### Eigenschaften des EnumItem

+ `console.log(Colors.green.type) // 'EnumItem'`
+ `console.log(Colors.green.name) // 'green'`
+ `console.log(Colors.blue.ordNr) // 2`<br>
  die Position des [Labelnamens](#beschreibung-1)
+ `console.log(Colors.green.index) // 2`<br>
  berechneter oder übergebener Index
+ `console.log(Colors.green.indexType.name) // 'BINARY'`<br>
  Die eingestellte oder erkannte Berechnung der Indizes .
+ `console.log(Colors.green.enumType) // 'Colors'` Name des Enum
+ `console.log(Colors.green.enumObject) // 'Colors'` Enum
+ `console.log(Colors.red.esid) // '55-SAES-45FD-ENUM/8-633B-7055-5E-8'` ESID des Items
+ `console.log(Colors.green.id) // '55-SAES-45FD-ENUM/8-633B-7055-5E-8'` ID (ESID)
+ `Colors.green.serializedEnum`<br>
  gibt das gibt das Item als ein Objekt, das für JSON.stringify vorbereitete ist, zurück.
+ `Colors.blue.store = {42: 'die Frage nach dem Leben, dem Universum und dem ganzen Rest'}`
+ `console.log(Colors.blue.store.42) // 'die Frage nach dem Leben, dem Universum und dem ganzen Rest'`<br>
gibt den Inhalt des Speichers des EnumItems zurück.

### Methoden des EnumItem
+ `Colors.green.toJSON()`<br>
  gibt das serialisierte Objekt zurück; 
  

### Example

```js
// Anlegen in eine Konstante
const Colors = new Enum({cause: 'param', countTyp: 'BINARY'}, colors', ['red', 'blue', 'green']);

// nur erzeugen
new Enum('colors', ['red', 'blue', 'green']);

// Referenz speichern
const Colors = Enum.colors;

const {colors.} = Enum;

// EnumItem als Referenz speichern
const RED = colors.red;

const {red: RED} = colors;

// EnumItem als ID-String nutzen
const FOO = { [RED]: 0xFF0000, [colors.green]: 0x00FF00, [colors['blue']: 0x0000FF] };


```
----

[^esid]: Enum Service Identifier (**ESID**)<br>
Der *Enum Service Identifier* ist die lokale nicht genormte Bezeichnung für die parametrierbare eingebaute Methode und kann durch Vorlagen gesteuert werden. Die erzeugten *ESID* einer EnumType sind aufsteigend sortierbar, wie die automatisch erzeugten Indezies. In dieser Methode wird die Erzeugung der notwendigen Zufallszahlen der *ESID* durch die Javascript-Bibliothek **Crypto** erledigt.

[^uuid]: Universally Unique Identifier (**UUID**)<br>
    Ein Universally Unique Identifier (*UUID*) ist ein Standard für Identifikatoren, der in der Softwareentwicklung verwendet wird. Er ist von der Open Software Foundation (OSF) als Teil des Distributed Computing Environment (DCE) standardisiert. Die Absicht hinter *UUID* ist, Informationen in verteilten Systemen ohne zentrale Koordination eindeutig kennzeichnen zu können.
In diesem Fall wird die *UUID* durch die Javascript-Bibliothek **Crypto** des Browsers erzeugt. 

[^hash]: Hash (HASH)<br>
Erzeugt mit einer eigenen Methode eine 32-Bit Zahl aus der Bezeichnung des EnumType und des EnumItem (Enum:"nameType".EnumItem:"name") einen Hash. 

[^auto]: z.Z. wird nur der *AUTO*-Typ unterstützt, das heißt, es wird nur der nicht genormte *ESID*-Type erzeugt und genutzt.


