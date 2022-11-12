


## ArgumentsParser
Die Methoden Bibliothek *ArgumentsParser* nimmt die Funktionsparameter an und trennt diese in die Anteile Options- und Restparameter auf. Die Restparameter werden in ein Array mit \[Schlüssel, Index]-Paaren gewandelt.

### Beschreibung
Die Bibliothek *ArgumentsParser* und ...

....übergibt dieser Klasse die Funktionsparameter und erhält die Objekte *Option* und *label* zurück.

#### Constructor 
Es wird kein Konstruktor benötigt.

### Syntax
Der *ArgumentsParser* trennt die übergebenen Funktionsparameter in die Optionsdaten und die Nutzdaten. 
```
const [Option, enumType, Label] = ArgumentsParser.separateOption(...param);
```

### Funktionsparameter
Der Funktionsparameter, enthält ein optionales Object mit den Optionen und der Liste von Namen.
Zurück gegeben wird ein Array mit Schlüssel, Index-Elementen.
```
class ArgumentsParser {
  defaultOption = {PropertyA: 'FOO', PropertyB: 'Bar'};
  /* ... */
}
ArgumentsParser.defaultOption = {PropertyA: 'FOO', PropertyB: 'Bar'};
const [Option, Label] = ArgumentsParser.separateOption(...param);
```