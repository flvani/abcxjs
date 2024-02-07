/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 * - Verificar porque no caso de slur a ordem dos elementos não está sendo respeitada
*/

/*
 
            Definição da sintaxe para tablatura
        
           " |: G+5'2g-6>-5 | G-3'2d-5d-[678]1/2 | G+5d-5d-> | G-xd-5d-6 | +{786'}2 | +11/2 | c+ac+b |"
        
           Linha de tablatura ::= { <comentario> | <barra> | <coluna> }*
        
           comentario := "%[texto]"

           barra ::=  "|", "||", ":|", "|:", ":|:", ":||:", "::", ":||", ":||", "[|", "|]", "|[|", "|]|" [endings]
        
           coluna ::=  ["("<triplet>][<bassNote>]<bellows><note>[<duration>] [")"] 
        
           bassNote ::=  { "abcdefgABCDEFG>xz" }*
          
           bellows ::= "-"|"+" 
        
           note ::= <button>[<row>] | chord 
        
           chord ::= "[" {<button>[<row>]}* "]" 
        
           button ::=  {hexDigit} | "x" | "z" | ">"
        
           row ::= { "'" }*

           duration ::=  number|fracao 

 */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.tablature)
    window.ABCXJS.tablature = {};

ABCXJS.tablature.Parse = function (accordion, str, vars) {
    this.accordion = accordion;
    this.invalid = false;
    this.finished = false;
    this.line = str;
    this.vars = vars || {};
    this.bassNoteSyms = "abcdefgABCDEFG>xz";
    this.trebNoteSyms = "0123456789abcdefABCDEF>xz";
    this.durSyms = "0123456789/.";
    this.variantSyms = "¹²³";
    this.belSyms = "+-";
    this.barSyms = ":]|[";
    this.accSyms = "♭♯m7"; // neste caso, "m" representa o acorde-baixo-menor
    this.i = 0;
    this.xi = 0;
    this.offset = 8.9;

    this.warn = function (str) {
        var bad_char = this.line.charAt(this.i);
        if (bad_char === ' ')
            bad_char = "SPACE";
        var clean_line = this.encode(this.line.substring(0, this.i)) +
            '<span style="text-decoration:underline;font-size:1.3em;font-weight:bold;">' + bad_char + '</span>' +
            this.encode(this.line.substring(this.i + 1));
        this.addWarning("Music Line:" + /*line*/ 0 + ":" + /*column*/(this.i + 1) + ': ' + str + ": " + clean_line);
    };

    this.addWarning = function (str) {
        if (!this.vars.warnings) this.vars.warnings = [];
        this.vars.warnings.push(str);
    };

    this.encode = function (str) {
        var ret = window.ABCXJS.parse.gsub(str, '\x12', ' ');
        ret = window.ABCXJS.parse.gsub(ret, '&', '&amp;');
        ret = window.ABCXJS.parse.gsub(ret, '<', '&lt;');
        return window.ABCXJS.parse.gsub(ret, '>', '&gt;');
    };

};

ABCXJS.tablature.Parse.prototype.parseTabVoice = function () {
    var voice = [];
    this.i = 0;
    var token = { el_type: "unrecognized" };

    while (this.i < this.line.length && !this.finished) {
        token = this.getToken();
        switch (token.el_type) {
            case "bar":
                token.startChar = this.xi;
                token.endChar = this.i - 1;
                if (!this.invalid)
                    voice[voice.length] = token;
                this.vars.lastBarElem = token;
                break;
            case "note":
                if (this.vars.lastBarElem && this.vars.lastBarElem.barNumber === undefined)
                    this.vars.lastBarElem.barNumber = this.vars.currentVoice.currBarNumber++;
                if (!this.invalid)
                    voice[voice.length] = this.formatChild(token);
                break;
            case "comment":
            case "unrecognized":
            default:
                break;
        }
    }
    return voice;
};

ABCXJS.tablature.Parse.prototype.formatChild = function (token) {
    var child = {
        el_type: token.el_type
        , startChar: this.xi
        , endChar: this.i - 1
        , pitches: []
        , duration: token.duration * this.vars.default_length
        , bellows: token.bellows
    };

    var pitchBase = 18;
    var tt = "tabText";

    if (token.bassNote.length > 1) {
        pitchBase = 21.3;
        tt = "tabText2";
    }


    for (var b = 0; b < token.bassNote.length; ++b) {

        if (token.bassNote[b] === "x") {
            this.registerMissingNote(this.vars.lastBarElem.barNumber);
        }

        if (!this.checkBassButton(token.bellows, token.bassNote[b])) {
            this.registerInvalidBass(this.vars.lastBarElem.barNumber);
        }

        if (token.bassNote[b] === "z") {
            child.pitches[b] = { bass: true, type: "rest", variant: 0, c: 'scripts.tabrest', pitch: 0.7 + pitchBase - (b * 3) };
        } else {
            child.pitches[b] = { bass: true, type: tt, variant: token.variant[b], c: this.getTabSymbol(token.bassNote[b]), pitch: pitchBase - (b * 3) - 0.5 };
        }
    }

    var qtd = token.buttons.length;

    for (var i = 0; i < token.buttons.length; i++) {
        var n = child.pitches.length;

        if (token.buttons[i] === "x") {
            this.registerMissingNote(this.vars.lastBarElem.barNumber);
        }

        if (token.buttons[i] === "z")
            child.pitches[n] = { type: "rest", c: "scripts.tabrest", pitch: token.bellows === "+" ? 13.2 : 13.2 - this.offset };
        else {
            var offset = (qtd >= 3 ? -(this.offset - (2.8 * (qtd - 2))) : -this.offset);
            var p = (qtd === 1 ? 11.7 : 13.4 - (i * 2.8)) + (token.bellows === "+" ? 0 : offset);
            child.pitches[n] = { c: this.getTabSymbol(token.buttons[i]), type: "tabText" + (qtd > 1 ? "2" : ""), pitch: p };
        }

    }

    if (token.startTriplet) {
        child.startTriplet = token.startTriplet;
    }

    if (token.endTriplet) {
        child.endTriplet = token.endTriplet;
    }


    return child;
};

ABCXJS.tablature.Parse.prototype.getTabSymbol = function (text) {
    switch (text) {
        case '>': return 'scripts.rarrow';
        default: return text;
    }
};

ABCXJS.tablature.Parse.prototype.getToken = function () {
    this.invalid = false;
    this.parseMultiCharToken(' \t');
    this.xi = this.i;
    switch (this.line.charAt(this.i)) {
        case '%':
            this.finished = true;
            return { el_type: "comment", token: this.line.substr(this.i + 1) };
        case '|':
        case ':':
            return this.getBarLine();

        case '[': // se o proximo caracter não for um pipe, deve ser tratado como uma coluna de notas
            if (this.line.charAt(this.i + 1) === '|') {
                return this.getBarLine();
            }
        default:
            return this.getColumn();
    }

};

ABCXJS.tablature.Parse.prototype.parseMultiCharToken = function (syms) {
    while (this.i < this.line.length && syms.indexOf(this.line.charAt(this.i)) >= 0) {
        this.i++;
    }
};

ABCXJS.tablature.Parse.prototype.getBarLine = function () {
    var endings = '1234567890,'; // due syntax conflict I will not consider the  dash '-'.
    var validBars = {
        "|": "bar_thin"
        , "||": "bar_thin_thin"
        , "[|": "bar_thick_thin"
        , "|]": "bar_thin_thick"
        , ":|:": "bar_dbl_repeat"
        , ":||:": "bar_dbl_repeat"
        , "::": "bar_dbl_repeat"
        , "|:": "bar_left_repeat"
        , "||:": "bar_left_repeat"
        , "[|:": "bar_left_repeat"
        , ":|": "bar_right_repeat"
        , ":||": "bar_right_repeat"
        , ":|]": "bar_right_repeat"
    };

    if (this.triplet) {
        this.triplet = false;
        this.warn("Expected triplet end but found " + this.line.charAt(this.i));
    }

    var token = { el_type: "bar", type: "bar", token: undefined };
    var p = this.i;

    this.parseMultiCharToken(this.barSyms);

    token.token = this.line.substr(p, this.i - p);
    this.finished = this.i >= this.line.length;

    //tratar multiplos ":" -- para efeito de tipo de barra, somente um ":" de cada lado é considerado
    var i = 0; f = token.token.length;
    while (token.token.charAt(i) === ':') ++i;
    while (token.token.charAt(f - 1) === ':') --f;

    token.repeat = (i > f) ? 2 : i + 1;
    token.type = validBars[(i > f) ? token.token : token.token.substring(i - 1, f + 1)];

    this.invalid = !token.type;

    if (!this.invalid) {
        this.parseMultiCharToken(' \t');
        if (this.vars.inEnding) {
            token.endDrawEnding = true;
            if (token.type !== 'bar_thin') {
                token.endEnding = true;
                this.vars.inEnding = false;
            }
        }
        if ((!this.finished) && endings.indexOf(this.line.charAt(this.i)) >= 0) {
            token.startEnding = this.line.charAt(this.i);
            if (this.vars.inEnding) {
                token.endDrawEnding = true;
                token.endEnding = true;
            }
            this.vars.inEnding = true;
            this.i++;
        }
    }
    return token;
};

ABCXJS.tablature.Parse.prototype.getColumn = function () {
    var token = { el_type: "note", type: "note", bassNote: [], variant: [], bellows: "", buttons: [], duration: 1 };
    //token.bassNote = [];

    if (this.line.charAt(this.i) === "(") {
        var t = this.getTripletDef();
        if (t) {
            token.startTriplet = t;
            this.triplet = true;
        }
    }

    while (this.belSyms.indexOf(this.line.charAt(this.i)) < 0) {
        n = this.getBassNote();
        token.bassNote[token.bassNote.length] = n.note;
        token.variant[token.variant.length] = n.variant;
    }

    token.bellows = this.getBelows();
    token.buttons = this.getNote();
    token.duration = this.getDuration();


    if (this.isTripletEnd()) {
        token.endTriplet = true;
    }

    this.finished = this.i >= this.line.length;
    return token;

};

ABCXJS.tablature.Parse.prototype.checkBassButton = function (bellows, b) {
    var kb = this.accordion.loadedKeyboard;

    if (!kb || b === undefined || ('.>.x.z.').indexOf(b) > 0) return true;

    // há uma pequena conversão: na tablatura registramos os acordes menores com "m"
    // no mapeamento da gaita, escrevemos a1:m, por exemplo.
    // então trocar "m" por ":m"
    var nota = kb.parseNote(b.replace("m", ":m"), true);
    for (var j = kb.keyMap.length; j > kb.keyMap.length - 2; j--) {
        for (var i = 0; i < kb.keyMap[j - 1].length; i++) {
            var tecla = kb.keyMap[j - 1][i];
            if (bellows === '+') {
                if (tecla.closeNote.key === nota.key) return tecla;
            } else {
                if (tecla.openNote.key === nota.key) return tecla;
            }
        }
    }
    return false;
};


ABCXJS.tablature.Parse.prototype.getTripletDef = function () {

    var i = ++this.i;

    while (this.i < this.line.length && this.bassNoteSyms.indexOf(this.line.charAt(this.i)) < 0 && this.belSyms.indexOf(this.line.charAt(this.i)) < 0) {
        this.i++;
    }

    if (this.i >= this.line.length) {
        this.warn("Triplet definition not found at " + this.line.substr(i));
        return null;
    }

    var t = this.line.substr(i, this.i - i).trim();

    //validate the triplet expression
    var e = /\[([0-9])(:{1,2}([0-9]){0,1})*\]/;
    var r = ('[' + t + ']').match(e);

    if (!r || !r[1]) {
        this.warn("Invalid triplet definition at " + this.line.substr(i));
        return null;
    }

    return { num: r[1], notes: r[3] ? r[3] : r[1] };

};

ABCXJS.tablature.Parse.prototype.isTripletEnd = function () {
    this.parseMultiCharToken(' \t');
    if (this.line.charAt(this.i) === ')') {
        this.i++;
        if (this.triplet) {
            this.triplet = false;
            return true;
        } else {
            this.warn("Found triplet end with no beginning." + this.line.substr(this.i - 1));
            return false;
        }
    }
    return false;
};


ABCXJS.tablature.Parse.prototype.getBassNote = function () {
    var note = "";
    var variant = 0;
    if (this.bassNoteSyms.indexOf(this.line.charAt(this.i)) < 0) {
        this.warn("Expected Bass Note but found " + this.line.charAt(this.i));
        this.i++;
    } else {
        note = this.line.charAt(this.i);
        this.i++;
        if (this.accSyms.indexOf(this.line.charAt(this.i)) >= 0) {
            note += this.line.charAt(this.i);
            this.i++;
        }
        if (this.accSyms.indexOf(this.line.charAt(this.i)) >= 0) {
            note += this.line.charAt(this.i);
            this.i++;
        }
        if (this.accSyms.indexOf(this.line.charAt(this.i)) >= 0) {
            note += this.line.charAt(this.i);
            this.i++;
        }
        if (this.variantSyms.indexOf(this.line.charAt(this.i)) >= 0) {
            variant = this.accordion.loadedKeyboard.getVariant( this.line.charAt(this.i) )
            this.i++;
        }
    }
    return { "note": note, "variant": variant };
};

ABCXJS.tablature.Parse.prototype.getDuration = function () {
    var dur = 1;
    var p = this.i;

    this.parseMultiCharToken(this.durSyms);

    if (p !== this.i) {
        dur = this.line.substr(p, this.i - p);
        if (isNaN(eval(dur))) {
            this.warn("Expected numeric or fractional note duration, but found " + dur);
        } else {
            dur = eval(dur);
        }
    }
    return dur;
};

ABCXJS.tablature.Parse.prototype.getBelows = function () {
    if (this.belSyms.indexOf(this.line.charAt(this.i)) < 0) {
        this.warn("Expected belows information, but found " + this.line.charAt(this.i));
        this.invalid = true;
        return '+';
    } else {
        this.i++;
        return this.line.charAt(this.i - 1);
    }
};

ABCXJS.tablature.Parse.prototype.getNote = function () {
    var b = [];
    switch (this.line.charAt(this.i)) {
        case '[':
            this.i++;
            b = this.getChord();
            break;
        default:
            b[b.length] = this.getButton();
    }
    return b;
};

ABCXJS.tablature.Parse.prototype.getChord = function (token) {
    var b = [];
    while (this.i < this.line.length && this.line.charAt(this.i) !== ']') {
        b[b.length] = this.getButton();
    }
    if (this.line.charAt(this.i) !== ']') {
        this.warn("Expected end of chord - ']'");
        this.invalid = true;
    } else {
        this.i++;
    }
    return b;
};

ABCXJS.tablature.Parse.prototype.getButton = function () {
    var c = "x";
    var row = "";

    if (this.trebNoteSyms.indexOf(this.line.charAt(this.i)) < 0) {
        this.warn("Expected button number, but found " + this.line.charAt(this.i));
    } else {
        c = this.line.charAt(this.i);
        switch (c) {
            case '>':
            case 'x':
            case 'z':
                break;
            default:
                c = isNaN(parseInt(c, 16)) ? 'x' : parseInt(c, 16).toString();
        }
    }
    this.i++;

    var p = this.i;

    this.parseMultiCharToken("'");

    if (p !== this.i)
        row = this.line.substr(p, this.i - p);

    return c + row;
};

ABCXJS.tablature.Parse.prototype.registerMissingNote = function (barNumber) {
    if (!this.vars.missingNotes) this.vars.missingNotes = ',';

    if (this.vars.missingNotes.indexOf('' + barNumber) < 0) {
        this.vars.missingNotes += barNumber + ',';
    }
};

ABCXJS.tablature.Parse.prototype.registerInvalidBass = function (barNumber) {
    if (!this.vars.InvalidBass) this.vars.InvalidBass = ',';

    if (this.vars.InvalidBass.indexOf('' + barNumber) < 0) {
        this.vars.InvalidBass += barNumber + ',';
    }
};
