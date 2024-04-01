//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 * TODO:
 * implementar macros como esta m: ~C1 = C,, [C,E,G,] [C,E,G,]
 * 
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};
    
window.ABCXJS.parse.Parse = function(transposer_, accordion_) {

    this.tieCnt = 1;
    this.slurCnt = 1;
    
    var legalAccents = 
    [
        "trill", "lowermordent", "uppermordent", "mordent", "pralltriller", "accent",
        "fermata", "invertedfermata", "tenuto", "0", "1", "2", "3", "4", "5", "+", "wedge",
        "open", "thumb", "snap", "turn", "roll", "breath", "shortphrase", "mediumphrase", "longphrase",
        "segno", "coda", "fine", "dacapo", "dasegno", "dacoda", "dcalfine", "dcalcoda", "dsalfine", "dsalcoda",
        "crescendo(", "crescendo)", "diminuendo(", "diminuendo)",
        "p", "pp", "f", "ff", "mf", "mp", "ppp", "pppp", "fff", "ffff", "sfz", "repeatbar", "repeatbar2", "slide",
        "upbow", "downbow", "/", "//", "///", "////", "trem1", "trem2", "trem3", "trem4",
        "turnx", "invertedturn", "invertedturnx", "trill(", "trill)", "arpeggio", "xstem", "mark", "umarcato",
        "style=normal", "style=harmonic", "style=rhythm", "style=x"
    ];
    
    var accentPsuedonyms = [
        ["D.C.", "dacapo"], ["D.S.", "dasegno"],
        ["<", "accent"],[">", "accent"], ["tr", "trill"], 
        ["<(", "crescendo("], ["<)", "crescendo)"],
        [">(", "diminuendo("], [">)", "diminuendo)"], 
        ["plus", "+"], ["emphasis", "accent"]
    ];
    
//   segno    - barra anterior - em cima - ponto de retorno
//   coda     - barra anterior - em cima - ponto de retorno
//   
//   fine     - barra posterior - em cima - ponto de parada
//   dacoda   - barra posterior - em cima - salta ao coda (se existir e flag dacoda)
//   dasegno  - barra posterior - em cima - salta ao segno (se existir) - flag dasegno  
//   dacapo   - barra posterior - em cima - volta ao começo - flag dacapo
//   
//   dcalfine - barra anterior - em baixo - ao final do compasso volta ao começo - flag fine
//   dcalcoda - barra anterior - em baixo - ao final do compasso volta ao começo - flag dacoda
//   dsalfine - barra anterior - em baixo - ao final do compasso volta ao ponto de retorno (se existir) - flag fine
//   dsalcoda - barra anterior - em baixo - ao final do compasso volta ao ponto de retorno (se existir) - flag dacoda

    var jumpMarkers  = {
         segno:    {decorationNextBar:false, jumpNextBar: false, upper:true  } // desenhado na barra prévia,  efetivo na barra prévia
        ,coda:     {decorationNextBar:true,  jumpNextBar: true,  upper:true  } // desenhado na próxima barra, efetivo na próxima barra
        ,fine:     {decorationNextBar:true,  jumpNextBar: true,  upper:true  } // desenhado na próxima barra, efetivo na próxima barra
        ,dacoda:   {decorationNextBar:true,  jumpNextBar: true,  upper:true  } // desenhado na próxima barra, efetivo na próxima barra
        ,dacapo:   {decorationNextBar:true,  jumpNextBar: true,  upper:true  } // desenhado na próxima barra, efetivo na próxima barra
        ,dasegno:  {decorationNextBar:true,  jumpNextBar: true,  upper:true  } // desenhado na próxima barra, efetivo na próxima barra
        ,dcalfine: {decorationNextBar:false, jumpNextBar: true,  upper:false } // desenhado após a barra, efetivo na próxima barra.
        ,dcalcoda: {decorationNextBar:false, jumpNextBar: true,  upper:false } // desenhado após a barra, efetivo na próxima barra.
        ,dsalfine: {decorationNextBar:false, jumpNextBar: true,  upper:false } // desenhado após a barra, efetivo na próxima barra.
        ,dsalcoda: {decorationNextBar:false, jumpNextBar: true,  upper:false } // desenhado após a barra, efetivo na próxima barra.
    };
    

    if (transposer_)
        this.transposer = transposer_;
    
    if (accordion_)
        this.accordion = accordion_;

    var tune;
    var tokenizer;
    var header;
    var strTune = '';

    this.getTune = function() {
        return tune;
    };
    this.getStrTune = function() {
        return strTune;
    };

    var multilineVars = {
        reset: function() {
            for (var property in this) {
                if (this.hasOwnProperty(property) && typeof this[property] !== "function") {
                    delete this[property];
                }
            }
            this.iChar = 0;
            this.key = {accidentals: [], root: 'none', acc: '', mode: ''};
            this.meter = {type: 'specified', value: [{num: '4', den: '4'}]};	// if no meter is specified, there is an implied one.
            this.origMeter = {type: 'specified', value: [{num: '4', den: '4'}]};	// this is for new voices that are created after we set the meter.
            this.hasMainTitle = false;
            this.default_length = 0.125;
            this.clef = {type: 'treble', verticalPos: 0};
            this.subtitle = "";
            this.next_note_duration = 0;
            this.start_new_line = true;
            this.is_in_header = true;
            this.is_in_history = false;
            this.partForNextLine = "";
            this.havent_set_length = true;
            this.voices = {};
            this.staves = [];
            this.macros = {};
            //this.currBarNumber = 1;
            //this.currTabBarNumber = 1;
            this.inTextBlock = false;
            this.inPsBlock = false;
            this.ignoredDecorations = [];
            this.textBlock = "";
            this.score_is_present = false;	// Can't have original V: lines when there is the score directive
            this.currentVoice = undefined ; // { index:0, staffNum:0, currBarNumber: 1}; 

        }
    };

    this.getMultilineVars = function() {
        return multilineVars;
    };

    var addWarning = function(str) {
        if (!multilineVars.warnings)
            multilineVars.warnings = [];
        multilineVars.warnings.push(str);
    };

    var encode = function(str) {
        var ret = window.ABCXJS.parse.gsub(str, '\x12', ' ');
        ret = window.ABCXJS.parse.gsub(ret, '&', '&amp;');
        ret = window.ABCXJS.parse.gsub(ret, '<', '&lt;');
        return window.ABCXJS.parse.gsub(ret, '>', '&gt;');
    };

    var warn = function(str, line, col_num) {
        var bad_char = line.charAt(col_num);
        if (bad_char === ' ')
            bad_char = "SPACE";
        var clean_line = encode(line.substring(0, col_num)) +
                '<span style="text-decoration:underline;font-size:1.3em;font-weight:bold;">' + bad_char + '</span>' +
                encode(line.substring(col_num + 1));
        addWarning("Music Line:" + tune.getNumLines() + ":" + (col_num + 1) + ': ' + str + ":  " + clean_line);
    };
    
    this.getWarnings = function() {
        return multilineVars.warnings;
    };
    
    this.addTuneElement = function(type, startOfLine, xi, xf, elem, line) {
        switch(type) {
            case 'bar':
                multilineVars.measureNotEmpty = false;
                
                if(multilineVars.addJumpPointNextBar) {
                    elem.jumpPoint = ABCXJS.parse.clone( multilineVars.addJumpPointNextBar );
                    delete multilineVars.addJumpPointNextBar;
                }
                if(multilineVars.addJumpInfoNextBar) {
                    elem.jumpInfo = ABCXJS.parse.clone( multilineVars.addJumpInfoNextBar );
                    delete multilineVars.addJumpInfoNextBar;
                }
                if(multilineVars.addJumpDecorationNextBar) {
                    elem.jumpDecoration = ABCXJS.parse.clone( multilineVars.addJumpDecorationNextBar );
                    delete multilineVars.addJumpDecorationNextBar;
                }
                
                //restart bar accidentals
                multilineVars.barAccidentals = [];  
                
                //records the last bar elem
                multilineVars.lastBarElem = elem;
                break;
            case 'note':
                multilineVars.measureNotEmpty = true;
                
                // coloca informação de numeracao na previa barra de compasso, já que o compasso não está vazio 
                if (multilineVars.barNumOnNextNote ) {
                    var mc = multilineVars.currentVoice; 
                    if(multilineVars.lastBarElem) {
                        multilineVars.lastBarElem.barNumber = multilineVars.barNumOnNextNote;
                        multilineVars.lastBarElem.barNumberVisible = ( multilineVars.barNumOnNextNoteVisible && ( mc === undefined || (mc.staffNum === 0 && mc.index === 0 )));
                    }
                    
                    multilineVars.barNumOnNextNote = null;
                    multilineVars.barNumOnNextNoteVisible = null;
                }
               
                if( elem.pitches )  {
                    elem.pitches.forEach( function( p ) { 
                        if(p.accidental === undefined && multilineVars.barAccidentals[p.pitch]!==undefined ) {
                            p.barAccidental = multilineVars.barAccidentals[p.pitch]; // apenas um marcador para instruir o tratamento de slur e tie abaixo
                        }
                    });
                }
                break;
        }
        try {
            this.handleTie( elem );
            this.handleSlur( elem, line, xi );
            tune.appendElement(type, multilineVars.currTexLineNum, xi, xf, elem, multilineVars.currentVoice); // flavio -startOfLine
        } catch(e) {
             warn("Unknown character ignored", line, xi);
        }
    };
    

    this.handleTie = function(elem) {
        var self = this;
        if( ! elem.pitches ) return;
        if( this.anyTieEnd(elem) )  {
            var tieCnt = this.tieCnt;
            var startEl = this.aTies.pop();
            if( startEl && startEl.pitches ) {
                // o parse trouxe todos ties para todas as notas, mesmo que no start haja apenas uma
                // começo tornando false todos os endTies.
                if(elem.pitches) { 
                    elem.pitches.forEach( function( pitch ) { 
                        pitch.endTie = false;
                    });
                }
                // itera sobre as notas iniciais, criando os ties para sa notas finais (se forem iguais)
                startEl.pitches.forEach( function( startPitch ) {
                    if(elem.pitches) { 
                        elem.pitches.forEach( function( pitch ) { 
                            if(self.equalsPitch( pitch, startPitch )  ) {
                                
                                if(! startPitch.tie) {
                                    startPitch.tie = {};
                                }
                                // para ligaduras encadeadas ja existira obj tie
                                startPitch.tie.id_start = tieCnt;
                                
                                pitch.tie =  { id_end: tieCnt };
                                pitch.endTie = true;
                                tieCnt ++;
                            } else {

                            }
                        });
                    }
                });
            }
            this.tieCnt = tieCnt;
        }
        if( this.anyTieStart(elem) )  {
            if( !this.aTies ) this.aTies = [];
            this.aTies.push(elem);
        }
    };
    
    this.handleSlur = function(elem, line, i) {
        var self = this;
        if( !elem.pitches ) return;
        var ss = this.anySlurEnd(elem);
        while( ss )  {
            var tieCnt = this.tieCnt;
            var el = this.aSlurs.pop();
            if( el === undefined ) {
                //throw "Slur not open";
                warn("Slur not open", line, i);
                return;
            }
            if(el.qtd > 1 ) {
                el.qtd--;
                this.aSlurs.push(el);
            }
            var startEl = el.el;
            if( startEl && startEl.pitches ) {
                startEl.pitches.forEach( function( startPitch ) {
                    if(elem.pitches) { 
                        elem.pitches.forEach( function( pitch ) { 
                            if( self.equalsPitch( pitch, startPitch )  ) {
                                
                                if(startPitch.tie) {
                                    startPitch.tie.id_start = tieCnt;
                                } else 
                                    startPitch.tie = { id_start: tieCnt, slur:true };
                                if(pitch.tie) {
                                    startPitch.tie.id_end = tieCnt;
                                } else
                                    pitch.tie =  { id_end: tieCnt, slur:true };
                                    
                                tieCnt ++;
                            }
                        });
                    }
                });
            }
            this.tieCnt = tieCnt;
            ss--;
        }
        ss = this.anySlurStart(elem);
        if( ss )  {
            if( !this.aSlurs ) this.aSlurs = [];
            this.aSlurs.push( { el: elem, qtd:ss, cnt: ++this.slurCnt });
        }
    };
    
    this.anySlurEnd = function(elem) {
        var found = 0;
        if( elem.endSlur ) return elem.endSlur;
        if( elem.pitches ) {
            elem.pitches.forEach( function( pitch ) {
                if( pitch.endSlur ) found = pitch.endSlur;
            });
        }
        return found;
    };
    
    this.equalsPitch = function(p1, p2) {
        var p1acc='natural', p2acc = 'natural';
        if( p1.accidental !== undefined ) {
            p1acc= p1.accidental;
        } else if ( p1.barAccidental !== undefined ) {
            p1acc= p1.barAccidental;
        } 
        if( p2.accidental !== undefined ) {
            p2acc= p2.accidental;
        } else if ( p2.barAccidental !== undefined ) {
            p2acc= p2.barAccidental;
        } 
        
        return ( p1.pitch === p2.pitch && p1acc === p2acc );
        
    };
    
    this.anySlurStart = function(elem) {
        var found = 0;
        if( elem.startSlur ) return elem.startSlur;
        if( elem.pitches) {
            elem.pitches.forEach( function( pitch ) {
                if(pitch.startSlur ) found = pitch.startSlur;
            });
        }
        return found;
    };
    
    this.anyTieEnd = function(elem) {
        var found = false;
        if( elem.endTie ) return true;
        if(elem.pitches) {
            elem.pitches.forEach( function( pitch ) {
                if( pitch.endTie ) found = true;;
            });
        }
        return found;
    };
    
    this.anyTieStart = function(elem) {
        var found = false;
        if( elem.startTie ) return true;
        if(elem.pitches) {
            elem.pitches.forEach( function( pitch ) {
                if(pitch.startTie ) found = true;
            });
        }
        return found;
    };
    
    var letter_to_chord = function(line, i)
    {
        if (line.charAt(i) === '"')
        {
            var chord = tokenizer.getBrackettedSubstring(line, i, 5);
            if (!chord[2])
                warn("Missing the closing quote while parsing the chord symbol", line, i);
            // If it starts with ^, then the chord appears above.
            // If it starts with _ then the chord appears below.
            // (note that the 2.0 draft standard defines them as not chords, but annotations and also defines @.)
            if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '^') {
                chord[1] = chord[1].substring(1);
                chord[2] = 'above';
            } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '_') {
                chord[1] = chord[1].substring(1);
                chord[2] = 'below';
            } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '<') {
                chord[1] = chord[1].substring(1);
                chord[2] = 'left';
            } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '>') {
                chord[1] = chord[1].substring(1);
                chord[2] = 'right';
            } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '@') {
                // @-15,5.7
                chord[1] = chord[1].substring(1);
                var x = tokenizer.getFloat(chord[1]);
                if (x.digits === 0)
                    warn("Missing first position in absolutely positioned annotation.", line, i);
                chord[1] = chord[1].substring(x.digits);
                if (chord[1][0] !== ',')
                    warn("Missing comma absolutely positioned annotation.", line, i);
                chord[1] = chord[1].substring(1);
                var y = tokenizer.getFloat(chord[1]);
                if (y.digits === 0)
                    warn("Missing second position in absolutely positioned annotation.", line, i);
                chord[1] = chord[1].substring(y.digits);
                var ws = tokenizer.skipWhiteSpace(chord[1]);
                chord[1] = chord[1].substring(ws);
                chord[2] = null;
                chord[3] = {x: x.value, y: y.value};
            } else {
                //chord[1] = chord[1].replace(/([ABCDEFG])b/g, "$1?");
                //chord[1] = chord[1].replace(/([ABCDEFG])#/g, "$1?");
                chord[1] = ABCXJS.parse.normalizeAcc(chord[1]);
                chord[2] = 'default';
            }
            return chord;
        }
        return [0, ""];
    };

    var letter_to_accent = function(line, i)
    {
        var macro = multilineVars.macros[line.charAt(i)];

        if (macro !== undefined) {
            if (macro.charAt(0) === '!' || macro.charAt(0) === '+')
                macro = macro.substring(1);
            if (macro.charAt(macro.length - 1) === '!' || macro.charAt(macro.length - 1) === '+')
                macro = macro.substring(0, macro.length - 1);
            if (window.ABCXJS.parse.detect(legalAccents, function(acc) {
                return (macro === acc);
            }))
                return [1, macro];
            else {
                if (!window.ABCXJS.parse.detect(multilineVars.ignoredDecorations, function(dec) {
                    return (macro === dec);
                }))
                    warn("Unknown macro: " + macro, line, i);
                return [1, ''];
            }
        }
        switch (line.charAt(i))
        {
            case '.':
                return [1, 'staccato'];
            case 'u':
                return [1, 'upbow'];
            case 'v':
                return [1, 'downbow'];
            case '~':
                return [1, 'irishroll'];
            case 'H':
                return [1, 'fermata'];
            case 'J':
                return [1, 'slide'];
            case 'L':
                return [1, 'accent'];
            case 'M':
                return [1, 'mordent'];
            case 'O':
                return[1, 'coda'];
            case 'P':
                return[1, 'pralltriller'];
            case 'R':
                return [1, 'roll'];
            case 'S':
                return [1, 'segno'];
            case 'T':
                return [1, 'trill'];
            case '!':
            case '+':
               var ret = tokenizer.getBrackettedSubstring(line, i, 5);
                // Be sure that the accent is recognizable.
                if (ret[1].length > 0 && (ret[1].charAt(0) === '^' || ret[1].charAt(0) === '_'))
                    ret[1] = ret[1].substring(1);	// TODO-PER: The test files have indicators forcing the ornament to the top or bottom, but that isn't in the standard. We'll just ignore them.
                
                if (window.ABCXJS.parse.detect(legalAccents, function(acc) {
                    return (ret[1] === acc);
                }))
                    return ret;

                if (window.ABCXJS.parse.detect(accentPsuedonyms, function(acc) {
                    if (ret[1] === acc[0]) {
                        ret[1] = acc[1];
                        return true;
                    } else
                        return false;
                }))
                    return ret;

                // We didn't find the accent in the list, so consume the space, but don't return an accent.
                // Although it is possible that ! was used as a line break, so accept that.
                if (line.charAt(i) === '!' && (ret[0] === 1 /* flavio || line.charAt(i + ret[0] - 1) !== '!') */ ) )
                    return [1, null];
                
                warn("Unknown decoration: " + ret[1], line, i);
                ret[1] = "";
                return ret;
        }
        return [0, 0];
    };

    var letter_to_spacer = function(line, i)
    {
        var start = i;
        while (tokenizer.isWhiteSpace(line.charAt(i)))
            i++;
        return [i - start];
    };

    // returns the class of the bar line
    // the number of the repeat
    // and the number of characters used up
    // if 0 is returned, then the next element was not a bar line
    var letter_to_bar = function(line, curr_pos)
    {
        var ret = tokenizer.getBarLine(line, curr_pos);
        if (ret.len === 0)
            return [0, ""];
        if (ret.warn) {
            warn(ret.warn, line, curr_pos);
            return [ret.len, ""];
        }

        // Now see if this is a repeated ending
        // A repeated ending is all of the characters 1,2,3,4,5,6,7,8,9,0,-, and comma
        // It can also optionally start with '[', which is ignored.
        // Also, it can have white space before the '['.
        for (var ws = 0; ws < line.length; ws++)
            if (line.charAt(curr_pos + ret.len + ws) !== ' ')
                break;
        var orig_bar_len = ret.len;
        if (line.charAt(curr_pos + ret.len + ws) === '[') {
            ret.len += ws + 1;
        }

        // It can also be a quoted string. It is unclear whether that construct requires '[', but it seems like it would. otherwise it would be confused with a regular chord.
        if (line.charAt(curr_pos + ret.len) === '"' && line.charAt(curr_pos + ret.len - 1) === '[') {
            var ending = tokenizer.getBrackettedSubstring(line, curr_pos + ret.len, 5);
            return [ret.len + ending[0], ret.token, ret.repeat, ending[1]];
        }
        var retRep = tokenizer.getTokenOf(line.substring(curr_pos + ret.len), "1234567890-,");
        if (retRep.len === 0 || retRep.token[0] === '-')
            return [orig_bar_len, ret.token, ret.repeat];

        return [ret.len + retRep.len, ret.token, ret.repeat, retRep.token];
    };

    var letter_to_open_slurs_and_triplets = function(line, i) {
        // consume spaces, and look for all the open parens. If there is a number after the open paren,
        // that is a triplet. Otherwise that is a slur. Collect all the slurs and the first triplet.
        var ret = {};
        var start = i;
        while (line.charAt(i) === '(' || tokenizer.isWhiteSpace(line.charAt(i))) {
            if (line.charAt(i) === '(') {
                if (i + 1 < line.length && (line.charAt(i + 1) >= '2' && line.charAt(i + 1) <= '9')) {
                    if (ret.triplet !== undefined)
                        warn("Can't nest triplets", line, i);
                    else {
                        ret.triplet = line.charAt(i + 1) - '0';
                        if (i + 2 < line.length && line.charAt(i + 2) === ':') {
                            // We are expecting "(p:q:r" or "(p:q" or "(p::r" we are only interested in the first number (p) and the number of notes (r)
                            // if r is missing, then it is equal to p.
                            if (i + 3 < line.length && line.charAt(i + 3) === ':') {
                                if (i + 4 < line.length && (line.charAt(i + 4) >= '1' && line.charAt(i + 4) <= '9')) {
                                    ret.num_notes = line.charAt(i + 4) - '0';
                                    i += 3;
                                } else
                                    warn("expected number after the two colons after the triplet to mark the duration", line, i);
                            } else if (i + 3 < line.length && (line.charAt(i + 3) >= '1' && line.charAt(i + 3) <= '9')) {
                                // ignore this middle number
                                if (i + 4 < line.length && line.charAt(i + 4) === ':') {
                                    if (i + 5 < line.length && (line.charAt(i + 5) >= '1' && line.charAt(i + 5) <= '9')) {
                                        ret.num_notes = line.charAt(i + 5) - '0';
                                        i += 4;
                                    }
                                } else {
                                    ret.num_notes = ret.triplet;
                                    i += 3;
                                }
                            } else
                                warn("expected number after the triplet to mark the duration", line, i);
                        }
                    }
                    i++;
                }
                else {
                    if (ret.startSlur === undefined)
                        ret.startSlur = 1;
                    else
                        ret.startSlur++;
                }
            }
            i++;
        }
        ret.consumed = i - start;
        return ret;
    };

    var addWords = function(staff, line, words, fingers, bassfingers) {
//        este bloco parece não fazer sentido        
//        if (!line) {
//            warn("Can't add words before the first line of music", words, 0);
//            return;
//        }
        words = window.ABCXJS.parse.strip(words);
        if (words.charAt(words.length - 1) !== '-')
            words = words + ' ';	// Just makes it easier to parse below, since every word has a divider after it.
        var word_list = [];

        if(!(fingers || bassfingers))
            staff.lyricsRows++;

        // first make a list of words from the string we are passed. A word is divided on either a space or dash.
        var last_divider = 0;
        var replace = false;
        var addWord = function(i) {
            var word = window.ABCXJS.parse.strip(words.substring(last_divider, i));
            
            if (fingers && word.trim() !== "" && ".1.2.3.4.5.23.24.25.34.35.45.234.235.245.345.2345.*.".indexOf("."+word.trim()+".") < 0 ) {
                warn( "Alien fingering detected", words, i-word.trim().length );
            }

            if (bassfingers && word.trim() !== "" && ".1.2.3.4.5.23.24.25.34.35.45.234.235.245.345.2345.*.".indexOf("."+word.trim()+".") < 0 ) {
                warn( "Alien bass-fingering detected", words, i-word.trim().length );
            }
            
            last_divider = i + 1;
            if (word.length > 0) {
                if (replace)
                    word = window.ABCXJS.parse.gsub(word, '~', ' ');
                var div = words.charAt(i);
                if (div !== '_' && div !== '-')
                    div = ' ';
                word_list.push({syllable: tokenizer.translateString(word), divider: div});
                replace = false;
                return true;
            }
            return false;
        };
        for (var i = 0; i < words.length; i++) {
            switch (words.charAt(i)) {
                case ' ':
                case '\x12':
                    addWord(i);
                    break;
                case '-':
                    if (!addWord(i) && word_list.length > 0) {
                        window.ABCXJS.parse.last(word_list).divider = '-';
                        word_list.push({skip: true, to: 'next'});
                    }
                    break;
                case '_':
                    addWord(i);
                    word_list.push({skip: true, to: 'slur'});
                    break;
                case '*':
                    if(!(fingers || bassfingers)) {
                        addWord(i);
                        word_list.push({skip: true, to: 'next'});
                    } else {
                        addWord(i);
                        word_list.push({syllable: '*', divider: ' ' });
                    }
                    break;
                case '|':
                    addWord(i);
                    word_list.push({skip: true, to: 'bar'});
                    break;
                case '~':
                    replace = true;
                    break;
            }
        }

        var inSlur = false;
        window.ABCXJS.parse.each(line, function(el) {
            if (word_list.length !== 0) {
                if (word_list[0].skip) {
                    switch (word_list[0].to) {
                        case 'next':
                            if (el.el_type === 'note' && el.pitches !== null && !inSlur)
                                word_list.shift();
                            break;
                        case 'slur':
                            if (el.el_type === 'note' && el.pitches !== null)
                                word_list.shift();
                            break;
                        case 'bar':
                            if (el.el_type === 'bar')
                                word_list.shift();
                            break;
                    }
                } else {
                    if (el.el_type === 'note' && el.rest === undefined && !inSlur) {
                        var word = word_list.shift();
                        if( bassfingers ){
                            if (el.bassfingering === undefined)
                                el.bassfingering = [word];
                            else
                                el.bassfingering.push(word);
                        } else if( fingers ) {
                            if (el.fingering === undefined)
                                el.fingering = [word];
                            else
                                el.fingering.push(word);
                        } else {
                            if (el.lyric === undefined)
                                el.lyric = [word];
                            else
                                el.lyric.push(word);
                            
                        }
                    }
                }
            }
        });
    };

    var addSymbols = function(line, words) {
        // TODO-PER: Currently copied from w: line. This needs to be read as symbols instead.
        if (!line) {
            warn("Can't add symbols before the first line of mulsic", line, 0);
            return;
        }
        words = window.ABCXJS.parse.strip(words);
        if (words.charAt(words.length - 1) !== '-')
            words = words + ' ';	// Just makes it easier to parse below, since every word has a divider after it.
        var word_list = [];
        // first make a list of words from the string we are passed. A word is divided on either a space or dash.
        var last_divider = 0;
        var replace = false;
        var addWord = function(i) {
            var word = window.ABCXJS.parse.strip(words.substring(last_divider, i));
            last_divider = i + 1;
            if (word.length > 0) {
                if (replace)
                    word = window.ABCXJS.parse.gsub(word, '~', ' ');
                var div = words.charAt(i);
                if (div !== '_' && div !== '-')
                    div = ' ';
                word_list.push({syllable: tokenizer.translateString(word), divider: div});
                replace = false;
                return true;
            }
            return false;
        };
        for (var i = 0; i < words.length; i++) {
            switch (words.charAt(i)) {
                case ' ':
                case '\x12':
                    addWord(i);
                    break;
                case '-':
                    if (!addWord(i) && word_list.length > 0) {
                        window.ABCXJS.parse.last(word_list).divider = '-';
                        word_list.push({skip: true, to: 'next'});
                    }
                    break;
                case '_':
                    addWord(i);
                    word_list.push({skip: true, to: 'slur'});
                    break;
                case '*':
                    addWord(i);
                    word_list.push({skip: true, to: 'next'});
                    break;
                case '|':
                    addWord(i);
                    word_list.push({skip: true, to: 'bar'});
                    break;
                case '~':
                    replace = true;
                    break;
            }
        }

        var inSlur = false;
        window.ABCXJS.each(line, function(el) {
            if (word_list.length !== 0) {
                if (word_list[0].skip) {
                    switch (word_list[0].to) {
                        case 'next':
                            if (el.el_type === 'note' && el.pitches !== null && !inSlur)
                                word_list.shift();
                            break;
                        case 'slur':
                            if (el.el_type === 'note' && el.pitches !== null)
                                word_list.shift();
                            break;
                        case 'bar':
                            if (el.el_type === 'bar')
                                word_list.shift();
                            break;
                    }
                } else {
                    if (el.el_type === 'note' && el.rest === undefined && !inSlur) {
                        var lyric = word_list.shift();
                        if (el.lyric === undefined)
                            el.lyric = [lyric];
                        else
                            el.lyric.push(lyric);
                    }
                }
            }
        });
    };

    var getBrokenRhythm = function(line, index) {
        switch (line.charAt(index)) {
            case '>':
                if (index < line.length - 1 && line.charAt(index + 1) === '>')	// double >>
                    return [2, 1.75, 0.25];
                else
                    return [1, 1.5, 0.5];
                break;
            case '<':
                if (index < line.length - 1 && line.charAt(index + 1) === '<')	// double <<
                    return [2, 0.25, 1.75];
                else
                    return [1, 0.5, 1.5];
                break;
        }
        return null;
    };

    // TODO-PER: make this a method in el.
    // Flavio - 0.25 inclusive.
    var addEndBeam = function(el) {
        if (el.duration !== undefined && el.duration <= 0.25)
            el.end_beam = true;
        return el;
    };

    var pitches = ABCXJS.parse.pitches;
    var rests = {x: 'invisible', y: 'spacer', z: 'rest', Z: 'multimeasure'};
    var getCoreNote = function(line, index, el, canHaveBrokenRhythm) {
        //var el = { startChar: index };
        var isComplete = function(state) {
            return (state === 'octave' || state === 'duration' || state === 'Zduration' || state === 'broken_rhythm' || state === 'end_slur');
        };
        var state = 'startSlur';
        var durationSetByPreviousNote = false;
        while (1) {
            switch (line.charAt(index)) {
                case '(':
                    if (state === 'startSlur') {
                        if (el.startSlur === undefined)
                            el.startSlur = 1;
                        else
                            el.startSlur++;
                    } else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case ')':
                    if (isComplete(state)) {
                        if (el.endSlur === undefined)
                            el.endSlur = 1;
                        else
                            el.endSlur++;
                    } else
                        return null;
                    break;
                case '^':
                    if (state === 'startSlur') {
                        el.accidental = 'sharp';
                        state = 'sharp2';
                    }
                    else if (state === 'sharp2') {
                        el.accidental = 'dblsharp';
                        state = 'pitch';
                    }
                    else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case '_':
                    if (state === 'startSlur') {
                        el.accidental = 'flat';
                        state = 'flat2';
                    }
                    else if (state === 'flat2') {
                        el.accidental = 'dblflat';
                        state = 'pitch';
                    }
                    else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case '=':
                    if (state === 'startSlur') {
                        el.accidental = 'natural';
                        state = 'pitch';
                    }
                    else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case 'A':
                case 'B':
                case 'C':
                case 'D':
                case 'E':
                case 'F':
                case 'G':
                case 'a':
                case 'b':
                case 'c':
                case 'd':
                case 'e':
                case 'f':
                case 'g':
                    if (state === 'startSlur' || state === 'sharp2' || state === 'flat2' || state === 'pitch') {
                        el.pitch = pitches[line.charAt(index)];
                        state = 'octave';
                        // At this point we have a valid note. The rest is optional. Set the duration in case we don't get one below
                        if (canHaveBrokenRhythm && multilineVars.next_note_duration !== 0) {
                            el.duration = multilineVars.next_note_duration; 
                            multilineVars.next_note_duration = 0;
                            durationSetByPreviousNote = true;
                        } else
                            el.duration = multilineVars.default_length;
                    } else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case ',':
                    if (state === 'octave') {
                        el.pitch -= 7;
                    }
                    else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case '\'':
                    if (state === 'octave') {
                        el.pitch += 7;
                    }
                    else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case 'x':
                case 'y':
                case 'z':
                case 'Z':
                    if (state === 'startSlur') {
                        el.rest = {type: rests[line.charAt(index)]};
                        // There shouldn't be some of the properties that notes have. If some sneak in due to bad syntax in the abc file,
                        // just nix them here.
                        delete el.accidental;
                        delete el.startSlur;
                        delete el.startTie;
                        delete el.endSlur;
                        delete el.endTie;
                        delete el.end_beam;
                        delete el.grace_notes;
                        // At this point we have a valid note. The rest is optional. Set the duration in case we don't get one below
                        if (el.rest.type === 'multimeasure') {
                            el.duration = 1;
                            state = 'Zduration';
                        } else {
                            if (canHaveBrokenRhythm && multilineVars.next_note_duration !== 0) {
                                el.duration = multilineVars.next_note_duration;
                                multilineVars.next_note_duration = 0;
                                durationSetByPreviousNote = true;
                            } else
                                el.duration = multilineVars.default_length;
                            state = 'duration';
                        }
                    } else if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                case '0':
                case '/':
                case '.':
                    if (state === 'octave' || state === 'duration') {
                        var fraction = tokenizer.getFraction(line, index);
                        if (!durationSetByPreviousNote)
                            el.duration = el.duration * fraction.value;
                        // TODO-PER: We can test the returned duration here and give a warning if it isn't the one expected.
                        el.endChar = fraction.index;
                        while (fraction.index < line.length && (tokenizer.isWhiteSpace(line.charAt(fraction.index)) || line.charAt(fraction.index) === '-')) {
                            if (line.charAt(fraction.index) === '-')
                                el.startTie = {};
                            else
                                el = addEndBeam(el);
                            fraction.index++;
                        }
                        index = fraction.index - 1;
                        state = 'broken_rhythm';
                    } else if (state === 'sharp2') {
                        el.accidental = 'quartersharp';
                        state = 'pitch';
                    } else if (state === 'flat2') {
                        el.accidental = 'quarterflat';
                        state = 'pitch';
                    } else if (state === 'Zduration') {
                        var num = tokenizer.getNumber(line, index);
                        el.duration = num.num;
                        el.endChar = num.index;
                        return el;
                    } else
                        return null;
                    break;
                case '-':
                    if (state === 'startSlur') {
                        // This is the first character, so it must have been meant for the previous note. Correct that here.
                        tune.addTieToLastNote();
                        el.endTie = true;
                    } else if (state === 'octave' || state === 'duration' || state === 'end_slur') {
                        el.startTie = {};
                        if (!durationSetByPreviousNote && canHaveBrokenRhythm)
                            state = 'broken_rhythm';
                        else {
                            // Peek ahead to the next character. If it is a space, then we have an end beam.
                            if (tokenizer.isWhiteSpace(line.charAt(index + 1)))
                                addEndBeam(el);
                            el.endChar = index + 1;
                            return el;
                        }
                    } else if (state === 'broken_rhythm') {
                        el.endChar = index;
                        return el;
                    }
                    else
                        return null;
                    break;
                case ' ':
                case '\t':
                    if (isComplete(state)) {
                        el.end_beam = true;
                        // look ahead to see if there is a tie
                        do {
                            if (line.charAt(index) === '-')
                                el.startTie = {};
                            index++;
                        } while (index < line.length && (tokenizer.isWhiteSpace(line.charAt(index)) || line.charAt(index) === '-'));
                        el.endChar = index;
                        if (!durationSetByPreviousNote && canHaveBrokenRhythm && (line.charAt(index) === '<' || line.charAt(index) === '>')) {	// TODO-PER: Don't need the test for < and >, but that makes the endChar work out for the regression test.
                            index--;
                            state = 'broken_rhythm';
                        } else
                            return el;
                    }
                    else
                        return null;
                    break;
                case '>':
                case '<':
                    if (isComplete(state)) {
                        if (canHaveBrokenRhythm) {
                            var br2 = getBrokenRhythm(line, index);
                            index += br2[0] - 1;	// index gets incremented below, so we'll let that happen
                            multilineVars.next_note_duration = br2[2] * el.duration;
                            el.duration = br2[1] * el.duration;
                            state = 'end_slur';
                        } else {
                            el.endChar = index;
                            return el;
                        }
                    } else
                        return null;
                    break;
                default:
                    if (isComplete(state)) {
                        el.endChar = index;
                        return el;
                    }
                    return null;
            }
            index++;
            if (index === line.length) {
                if (isComplete(state)) {
                    el.endChar = index;
                    return el;
                }
                else
                    return null;
            }
        }
        return null;
    };

    function startNewLine() {
        var params = {startChar: -1, endChar: -1};
        if (multilineVars.partForNextLine.length)
            params.part = multilineVars.partForNextLine;
        
        var mc = multilineVars.currentVoice;
        
        params.clef = window.ABCXJS.parse.clone( mc && mc.clef !== undefined ? mc.clef : multilineVars.clef);
        
        params.key = window.ABCXJS.parse.parseKeyVoice.deepCopyKey(multilineVars.key);
        
        window.ABCXJS.parse.parseKeyVoice.addPosToKey(params.clef, params.key);
        if (multilineVars.meter !== null) {
            if (multilineVars.currentVoice) {
                window.ABCXJS.parse.each(multilineVars.staves, function(st) {
                    st.meter = multilineVars.meter;
                });
                params.meter = multilineVars.staves[multilineVars.currentVoice.staffNum].meter;
                multilineVars.staves[multilineVars.currentVoice.staffNum].meter = null;
            } else
                params.meter = multilineVars.meter;
            multilineVars.meter = null;
        } else if (multilineVars.currentVoice && multilineVars.staves[multilineVars.currentVoice.staffNum].meter) {
            // Make sure that each voice gets the meter marking.
            params.meter = multilineVars.staves[multilineVars.currentVoice.staffNum].meter;
            multilineVars.staves[multilineVars.currentVoice.staffNum].meter = null;
        }
        if (multilineVars.currentVoice && multilineVars.currentVoice.name)
            params.name = multilineVars.currentVoice.name;
        if (multilineVars.vocalfont)
            params.vocalfont = multilineVars.vocalfont;
        if (multilineVars.style)
            params.style = multilineVars.style;
        if (multilineVars.currentVoice) {
            var staff = multilineVars.staves[multilineVars.currentVoice.staffNum];
            if (staff.brace)
                params.brace = staff.brace;
            if (staff.bracket)
                params.bracket = staff.bracket;
            if (staff.connectBarLines)
                params.connectBarLines = staff.connectBarLines;
            if (staff.name)
                params.name = staff.name[multilineVars.currentVoice.index];
            if (staff.subname)
                params.subname = staff.subname[multilineVars.currentVoice.index];
            if (multilineVars.subtitle) {
                params.subtitle = multilineVars.subtitle;
                multilineVars.subtitle = "";
            }
            if (multilineVars.currentVoice.stem)
                params.stem = multilineVars.currentVoice.stem;
            if (multilineVars.currentVoice.scale)
                params.scale = multilineVars.currentVoice.scale;
            if (multilineVars.currentVoice.style)
                params.style = multilineVars.currentVoice.style;
            if (multilineVars.currentVoice.transpose)
                params.transpose = multilineVars.currentVoice.transpose;
        }
        tune.startNewLine(params);

        multilineVars.partForNextLine = "";
        var mc = multilineVars.currentVoice;
        if( mc ) {
            if ( multilineVars.measureNotEmpty ) mc.currBarNumber++;
            multilineVars.barNumOnNextNote = mc.currBarNumber;
            
            if (multilineVars.barNumbers === 1 || ( multilineVars.barNumbers === 0 && multilineVars.barsperstaff === undefined && mc.currBarNumber > 1 ))
                multilineVars.barNumOnNextNoteVisible = true;
        }
    }
    
    var handleTriplet = function ( el, parsingTriplet ) {
        var m = 0;
        
        if( el.pitches ) {
            for(var ii=0; ii < el.pitches.length; ++ii ) m += el.pitches[ii].pitch;
            parsingTriplet.triplet.avgPitch += (m/el.pitches.length);
        } else {
            parsingTriplet.triplet.avgPitch += 6.0;
        }
        
        parsingTriplet.notesLeft--;
        
        if (parsingTriplet.notesLeft === 0) {
            el.endTriplet = true;
            parsingTriplet.triplet.avgPitch = (parsingTriplet.triplet.avgPitch/parsingTriplet.triplet.notes);
            parsingTriplet.triplet = false;
        }
    };
    

    var letter_to_grace = function(line, i) {
        // Grace notes are an array of: startslur, note, endslur, space; where note is accidental, pitch, duration
        if (line.charAt(i) === '{') {
            // fetch the gracenotes string and consume that into the array
            var gra = tokenizer.getBrackettedSubstring(line, i, 1, '}');
            if (!gra[2])
                warn("Missing the closing '}' while parsing grace note", line, i);
            // If there is a slur after the grace construction, then move it to the last note inside the grace construction
            if (line[i + gra[0]] === ')') {
                gra[0]++;
                gra[1] += ')';
            }

            var gracenotes = [];
            var ii = 0;
            var inTie = false;
            while (ii < gra[1].length) {
                var acciaccatura = false;
                if (gra[1].charAt(ii) === '/') {
                    acciaccatura = true;
                    ii++;
                }
                var note = getCoreNote(gra[1], ii, {}, false);
                if (note !== null) {
                    if (acciaccatura)
                        note.acciaccatura = true;
                    gracenotes.push(note);

                    if (inTie) {
                        note.endTie = true;
                        inTie = false;
                    }
                    if (note.startTie)
                        inTie = true;

                    ii = note.endChar;
                    delete note.endChar;
                }
                else {
                    // We shouldn't get anything but notes or a space here, so report an error
                    if (gra[1].charAt(ii) === ' ') {
                        if (gracenotes.length > 0)
                            gracenotes[gracenotes.length - 1].end_beam = true;
                    } else
                        warn("Unknown character '" + gra[1].charAt(ii) + "' while parsing grace note", line, i);
                    ii++;
                }
            }
            if (gracenotes.length)
                return [gra[0], gracenotes];
        }
        return [0];
    };
    
    //
    // Parse line of music
    //
    // This is a stream of <(bar-marking|header|note-group)...> in any order, with optional spaces between each element
    // core-note is <open-slur, accidental, pitch:required, octave, duration, close-slur&|tie> with no spaces within that
    // chord is <open-bracket:required, core-note:required... close-bracket:required duration> with no spaces within that
    // grace-notes is <open-brace:required, (open-slur|core-note:required|close-slur)..., close-brace:required> spaces are allowed
    // note-group is <grace-notes, chord symbols&|decorations..., grace-notes, slur&|triplet, chord|core-note, end-slur|tie> spaces are allowed between items
    // bar-marking is <ampersand> or <chord symbols&|decorations..., bar:required> spaces allowed
    // header is <open-bracket:required, K|M|L|V:required, colon:required, field:required, close-bracket:required> spaces can occur between the colon, in the field, and before the close bracket
    // header can also be the only thing on a line. This is true even if it is a continuation line. In this case the brackets are not required.
    // a space is a back-tick, a space, or a tab. If it is a back-tick, then there is no end-beam.

    // Line preprocessing: anything after a % is ignored (the double %% should have been taken care of before this)
    // Then, all leading and trailing spaces are ignored.
    // If there was a line continuation, the \n was replaced by a \r and the \ was replaced by a space. This allows the construct
    // of having a header mid-line conceptually, but actually be at the start of the line. This is equivolent to putting the header in [ ].

    // TODO-PER: How to handle ! for line break?
    // TODO-PER: dots before bar, dots before slur
    // TODO-PER: U: redefinable symbols.

    // Ambiguous symbols:
    // "[" can be the start of a chord, the start of a header element or part of a bar line.
    // --- if it is immediately followed by "|", it is a bar line
    // --- if it is immediately followed by K: L: M: V: it is a header (note: there are other headers mentioned in the standard, but I'm not sure how they would be used.)
    // --- otherwise it is the beginning of a chord
    // "(" can be the start of a slur or a triplet
    // --- if it is followed by a number from 2-9, then it is a triplet
    // --- otherwise it is a slur
    // "]"
    // --- if there is a chord open, then this is the close
    // --- if it is after a [|, then it is an invisible bar line
    // --- otherwise, it is par of a bar
    // "." can be a bar modifier or a slur modifier, or a decoration
    // --- if it comes immediately before a bar, it is a bar modifier
    // --- if it comes immediately before a slur, it is a slur modifier
    // --- otherwise it is a decoration for the next note.
    // number:
    // --- if it is after a bar, with no space, it is an ending marker
    // --- if it is after a ( with no space, it is a triplet count
    // --- if it is after a pitch or octave or slash, then it is a duration

    // Unambiguous symbols (except inside quoted strings):
    // vertical-bar, colon: part of a bar
    // ABCDEFGabcdefg: pitch
    // xyzZ: rest
    // comma, prime: octave
    // close-paren: end-slur
    // hyphen: tie
    // tilde, v, u, bang, plus, THLMPSO: decoration
    // carat, underscore, equal: accidental
    // ampersand: time reset
    // open-curly, close-curly: grace notes
    // double-quote: chord symbol
    // less-than, greater-than, slash: duration
    // back-tick, space, tab: space
    var nonDecorations = "ABCDEFGabcdefgxyzZ[]|^_{";	// use this to prescreen so we don't have to look for a decoration at every note.

    this.handleJump = function (name, jump, line, i) {
        if( jump.decorationNextBar ) {
            if( ! multilineVars.addJumpDecorationNextBar ) {
                multilineVars.addJumpDecorationNextBar = [];
            }
            multilineVars.addJumpDecorationNextBar.push({ type: name, upper: jump.upper });
        } else {
            if( multilineVars.lastBarElem ) {
                if( ! multilineVars.lastBarElem.jumpDecoration ) {
                    multilineVars.lastBarElem.jumpDecoration = [];
                }
                multilineVars.lastBarElem.jumpDecoration.push( { type: name, upper: jump.upper } ) ;
            } else {
                warn("Ignoring jump decoration marker before the first bar.", line, i);
            }
        }
        
        if( ('.segno.coda.fine.').indexOf(name) > 0 ) {
            if( jump.jumpNextBar ) {
                if( multilineVars.addJumpPointNextBar ) {
                    warn("Overriding previous jump point", line, i);
                }
                multilineVars.addJumpPointNextBar = { type: name };
            } else {
                if( multilineVars.lastBarElem ) {
                    if( multilineVars.lastBarElem.jumpPoint ) {
                        warn("Overriding previous jump point", line, i);
                    }
                    multilineVars.lastBarElem.jumpPoint = { type: name };
                } else {
                    warn("Ignoring jump point marker before the first bar.", line, i);
                }
            }
        } else {
            if( jump.jumpNextBar ) {
                if( multilineVars.addJumpInfoNextBar ) {
                    warn("Overriding previous jump information", line, i);
                }
                multilineVars.addJumpInfoNextBar = { type: name };
            } else {
                if( multilineVars.lastBarElem ) {
                    if( multilineVars.lastBarElem.jumpInfo ) {
                        warn("Overriding previous jump information", line, i);
                    }
                    multilineVars.lastBarElem.jumpInfo = { type: name };
                } else {
                    warn("Ignoring jump info marker before the first bar.", line, i);
                }
            }
        }
    };
    
    this.parseRegularMusicLine = function(line) {
        
        if( ! multilineVars.voices[0] ) {
            // se nenhuma voz foi declarada, força uma voz zero 
            if(!multilineVars.clef) {
                multilineVars.clef = {type:'treble', verticalPos:0};
            }
            multilineVars.voices[0] = {clef: multilineVars.clef, index:0, staffNum:0, currBarNumber:1 };
            multilineVars.staves[0] = {clef: multilineVars.clef, index:0, meter: null, numVoices:1, inTie:[false], inTieChord:[false], inEnding:[false] };
            multilineVars.currentVoice = multilineVars.voices[0];
            
        }
        
        multilineVars.barAccidentals = [];
        
        header.resolveTempo();
        
        multilineVars.is_in_header = false;	// We should have gotten a key header by now, but just in case, this is definitely out of the header.

        var i = 0;
        var startOfLine = multilineVars.iChar;
        
        // see if there is nothing but a comment on this line. If so, just ignore it. A full line comment is optional white space followed by %
        while (tokenizer.isWhiteSpace(line.charAt(i)) && i < line.length)
            i++;
        if (i === line.length || line.charAt(i) === '%')
            return;

        // Start with the standard staff, clef and key symbols on each line
        var delayStartNewLine = multilineVars.start_new_line;
        
        multilineVars.start_new_line = (multilineVars.continueall === undefined);
        
        var parsingTriplet = { notesLeft:0, triplet: false };
        
        // See if the line starts with a header field
        var retHeader = header.letter_to_body_header(line, i);
        if (retHeader[0] > 0) {
            i += retHeader[0];
            // TODO-PER: Handle inline headers
        }
        var el = {};

        while (i < line.length)
        {
            var startI = i;
            if (line.charAt(i) === '%')
                break;

            var retInlineHeader = header.letter_to_inline_header(line, i);
            if (retInlineHeader[0] > 0) {
                i += retInlineHeader[0];
            } else {
                // Wait until here to actually start the line because we know we're past the inline statements.
                if (delayStartNewLine) {
                    startNewLine();
                    delayStartNewLine = false;
                }

                // We need to decide if the following characters are a bar-marking or a note-group.
                // Unfortunately, that is ambiguous. Both can contain chord symbols and decorations.
                // If there is a grace note either before or after the chord symbols and decorations, then it is definitely a note-group.
                // If there is a bar marker, it is definitely a bar-marking.
                // If there is either a core-note or chord, it is definitely a note-group.
                // So, loop while we find grace-notes, chords-symbols, or decorations. 
                // [It is an error to have more than one grace-note group in a row; the others can be multiple]
                // Then, if there is a grace-note, we know where to go.
                // Else see if we have a chord, core-note, slur, triplet, or bar.

                var ret;
                while (1) {
                    ret = tokenizer.eatWhiteSpace(line, i);
                    if (ret > 0) {
                        i += ret;
                    }
                    if (i > 0 && line.charAt(i - 1) === '\x12') {
                        // there is one case where a line continuation isn't the same as being on the same line, and that is if the next character after it is a header.
                        ret = header.letter_to_body_header(line, i);
                        if (ret[0] > 0) {
                            // TODO: insert header here
                            i = ret[0];
                            multilineVars.start_new_line = false;
                        }
                    }
                    // gather all the grace notes, chord symbols and decorations
                    ret = letter_to_spacer(line, i);
                    if (ret[0] > 0) {
                        i += ret[0];
                    }

                    ret = letter_to_chord(line, i);
                    if (ret[0] > 0) {
                        // There could be more than one chord here if they have different positions.
                        // If two chords have the same position, then connect them with newline.
                        if (!el.chord)
                            el.chord = [];
                        var chordName = tokenizer.translateString(ret[1]);
                        chordName = chordName.replace(/;/g, "\n");
                        var addedChord = false;
                        for (var ci = 0; ci < el.chord.length; ci++) {
                            if (el.chord[ci].position === ret[2]) {
                                addedChord = true;
                                el.chord[ci].name += "\n" + chordName;
                            }
                        }
                        if (addedChord === false) {
                            if (ret[2] === null && ret[3])
                                el.chord.push({name: chordName, rel_position: ret[3]});
                            else
                                el.chord.push({name: chordName, position: ret[2]});
                        }

                        i += ret[0];
                        var ii = tokenizer.skipWhiteSpace(line.substring(i));
                        if (ii > 0)
                            el.force_end_beam_last = true;
                        i += ii;
                    } else {
                        if (nonDecorations.indexOf(line.charAt(i)) === -1)
                            ret = letter_to_accent(line, i);
                        else
                            ret = [0];
                        if (ret[0] > 0) {
                            if (ret[1] === null) {
                                if (i + 1 < line.length)
                                    startNewLine();	// There was a ! in the middle of the line. Start a new line if there is anything after it.
                            } else if (ret[1].length > 0) {
                                var jump = jumpMarkers[ ret[1] ];
                                if( jump ) {
                                    this.handleJump(ret[1], jump, line, i ); 
                                } else {
                                    if (el.decoration === undefined)
                                        el.decoration = [];
                                    el.decoration.push(ret[1]);
                                }
                            }
                            i += ret[0];
                        } else {
                            ret = letter_to_grace(line, i);
                            // TODO-PER: Be sure there aren't already grace notes defined. That is an error.
                            if (ret[0] > 0) {
                                el.gracenotes = ret[1];
                                i += ret[0];
                            } else
                                break;
                        }
                    }
                }

                ret = letter_to_bar(line, i);
                if (ret[0] > 0) {
                    // This is definitely a bar
                    if (el.gracenotes !== undefined) {
                        // Attach the grace note to an invisible note
                        el.rest = {type: 'spacer'};
                        el.duration = 0.125; // TODO-PER: I don't think the duration of this matters much, but figure out if it does.
                        this.addTuneElement('note', startOfLine, i, i + ret[0], el);
                        el = {};
                    }
                    var bar = {type: ret[1], repeat: ret[2]};
                    if (bar.type.length === 0)
                        warn("Unknown bar type", line, i);
                    else {
                        if (multilineVars.staves[multilineVars.currentVoice.staffNum].inEnding[multilineVars.currentVoice.index] ) {
                            bar.endDrawEnding = true;
                            if(  bar.type !== 'bar_thin') {
                                bar.endEnding = true;
                                multilineVars.staves[multilineVars.currentVoice.staffNum].inEnding[multilineVars.currentVoice.index] = false;
                            }
                        }
                        if (ret[3]) {
                            bar.startEnding = ret[3];
                            if (multilineVars.staves[multilineVars.currentVoice.staffNum].inEnding[multilineVars.currentVoice.index]) {
                                bar.endDrawEnding = true;
                                bar.endEnding = true;
                            }
                            multilineVars.staves[multilineVars.currentVoice.staffNum].inEnding[multilineVars.currentVoice.index] = true;
                        }
                        if (el.decoration !== undefined)
                            bar.decoration = el.decoration;
                        if (el.chord !== undefined)
                            bar.chord = el.chord;
                        var mc = multilineVars.currentVoice; 
                        if (bar.type !== 'bar_invisible' 
                                && multilineVars.measureNotEmpty 
                                /*&& ( mc === undefined || ( mc.staffNum === 0 && mc.index === 0) )*/ ) {
                            mc.currBarNumber++;
                            multilineVars.barNumOnNextNote = mc.currBarNumber;
                            if 
                            (
                                (multilineVars.barNumbers && (mc.currBarNumber % multilineVars.barNumbers === 0))
                            || 
                                (multilineVars.barsperstaff !== undefined && mc.currBarNumber && ((mc.currBarNumber-1) % multilineVars.barsperstaff) === 0) 
                            ) 
                                multilineVars.barNumOnNextNoteVisible = true;
                        }
                        this.addTuneElement('bar', startOfLine, i, i + ret[0], bar);
                        el = {};
                    }
                    i += ret[0];
                } else if (line[i] === '&') {	// backtrack to beginning of measure
                    warn("Overlay not yet supported", line, i);
                    i++;

                } else {
                    // This is definitely a note group
                    //
                    // Look for as many open slurs and triplets as there are. (Note: only the first triplet is valid.)
                    ret = letter_to_open_slurs_and_triplets(line, i);
                    if (ret.consumed > 0) {
                        if (ret.startSlur !== undefined) 
                            el.startSlur = ret.startSlur;
                        if (ret.triplet !== undefined) {
                            if (parsingTriplet.notesLeft > 0)
                                warn("Can't nest triplets", line, i);
                            else {
                                parsingTriplet.notesLeft = ret.num_notes === undefined ? ret.triplet : ret.num_notes;
                                parsingTriplet.triplet = {num: ret.triplet, notes: parsingTriplet.notesLeft, avgPitch: 0};
                                el.startTriplet = parsingTriplet.triplet;
                            }
                        }
                        i += ret.consumed;
                    }

                    // handle chords.
                    if (line.charAt(i) === '[') {
                        i++;
                        var chordDuration = null;    
                        var done = false;
                        while (!done) {
                            var chordNote = getCoreNote(line, i, {}, true); //brokenR: um acorde não pode ter broken rhythm
                            if (chordNote !== null ) { 
                                if (chordNote.end_beam) {
                                    el.end_beam = true;
                                    delete chordNote.end_beam;
                                }
                                if( chordNote.rest) {
                                  //warn("Rests among notes are not considered in chords", line, i);
                                }  else {
                                    if (el.pitches === undefined) {
                                        el.duration = chordNote.duration;
                                        el.pitches = [chordNote];
                                    } else	// Just ignore the note lengths of all but the first note. The standard isn't clear here, but this seems less confusing.
                                        el.pitches.push(chordNote);

                                    if (multilineVars.staves[multilineVars.currentVoice.staffNum].inTieChord[multilineVars.currentVoice.index][el.pitches.length]) {
                                        chordNote.endTie = true;
                                        multilineVars.staves[multilineVars.currentVoice.staffNum].inTieChord[multilineVars.currentVoice.index][el.pitches.length] = undefined;
                                    }
                                    if (chordNote.startTie)
                                        multilineVars.staves[multilineVars.currentVoice.staffNum].inTieChord[multilineVars.currentVoice.index][el.pitches.length] = true;

                                }
                                i = chordNote.endChar;
                                delete chordNote.endChar;
                                delete chordNote.duration;
                            } else if (line.charAt(i) === ' ') {
                                // Spaces are not allowed in chords, but we can recover from it by ignoring it.
                                warn("Spaces are not allowed in chords", line, i);
                                i++;
                            } else {
                                if (i < line.length && line.charAt(i) === ']') {
                                    // consume the close bracket
                                    i++;

                                    if (multilineVars.next_note_duration !== 0) {
                                        el.duration = el.duration * multilineVars.next_note_duration;
                                        //  window.ABCXJS.parse.each(el.pitches, function(p) {
                                        //      p.duration = p.duration * multilineVars.next_note_duration;
                                        //  });
                                        multilineVars.next_note_duration = 0;
                                    }

                                    if (multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index]) {
                                        window.ABCXJS.parse.each(el.pitches, function(pitch) {
                                            pitch.endTie = true;
                                        });
                                        multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index] = false;
                                    }

                                    if (parsingTriplet.notesLeft > 0) {
                                        handleTriplet( el, parsingTriplet );
                                    }

                                    var postChordDone = false;
                                    while (i < line.length && !postChordDone) {
                                        switch (line.charAt(i)) {
                                            case ' ':
                                            case '\t':
                                                addEndBeam(el);
                                                break;
                                            case ')':
                                                if (el.endSlur === undefined)
                                                    el.endSlur = 1;
                                                else
                                                    el.endSlur++;
                                                //window.ABCXJS.parse.each(el.pitches, function(pitch) { if (pitch.endSlur === undefined) pitch.endSlur = 1; else pitch.endSlur++; });
                                                break;
                                            case '-':
                                                window.ABCXJS.parse.each(el.pitches, function(pitch) {
                                                    pitch.startTie = {};
                                                });
                                                multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index] = true;
                                                break;
                                            case '>':
                                            case '<':
                                                var br2 = getBrokenRhythm(line, i);
                                                i += br2[0] - 1; // index gets incremented below, so we'll let that happen
                                                multilineVars.next_note_duration = br2[2] * el.duration;
                                                //multilineVars.next_note_duration = br2[2]; //bug: acorde antes do broken rhythm
                                                chordDuration = br2[1];
                                                break;
                                            case '1':
                                            case '2':
                                            case '3':
                                            case '4':
                                            case '5':
                                            case '6':
                                            case '7':
                                            case '8':
                                            case '9':
                                            case '0':
                                            case '/':
                                            case '.':
                                                var fraction = tokenizer.getFraction(line, i);
                                                chordDuration = fraction.value;
                                                i = fraction.index;
                                                // flavio - garantindo que o final do acorde seja bem tratado
                                                if( line.charAt(i).match(/[-\s\)]/g) )
                                                    i--; // Subtracting one because one is automatically added below
                                                //if (line.charAt(i) === '-' || line.charAt(i) === ')')
                                                //    i--; // Subtracting one because one is automatically added below
                                                 else 
                                                    postChordDone = true;
                                                break;
                                            default:
                                                postChordDone = true;
                                                break;
                                        }
                                        if (!postChordDone) {
                                            i++;
                                        }
                                    }
                                } else
                                    warn("Expected ']' to end the chords", line, i);

                                if (el.pitches !== undefined) {
                                    if (chordDuration !== null) {
                                        el.duration = el.duration * chordDuration;
                                        //window.ABCXJS.parse.each(el.pitches, function(p) {
                                        //    p.duration = p.duration * chordDuration;
                                        //});
                                    }
                                    this.addTuneElement('note', startOfLine, startI, i, el);
                                    el = {};
                                }
                                done = true;
                            }
                        }

                    } else {
                        // Single pitch
                        var el2 = {};
                        var core = getCoreNote(line, i, el2, true);
                        if (el2.endTie !== undefined) 
                            multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index] = true;
                        if (core !== null) {
                            if (core.pitch !== undefined) {
                                el.pitches = [{}];
                                // TODO-PER: straighten this out so there is not so much copying: getCoreNote shouldn't change e'
                                el.pitches[0].pitch = core.pitch;
                                if (core.accidental !== undefined) {
                                    el.pitches[0].accidental = core.accidental;
                                    multilineVars.barAccidentals[core.pitch] = core.accidental;
                                }    
                                if (core.endSlur !== undefined)
                                    el.pitches[0].endSlur = core.endSlur;
                                if (core.endTie !== undefined)
                                    el.pitches[0].endTie = core.endTie;
                                if (core.startSlur !== undefined)
                                    el.pitches[0].startSlur = core.startSlur;
                                if (el.startSlur !== undefined)
                                    el.pitches[0].startSlur = el.startSlur;
                                if (core.startTie !== undefined)
                                    el.pitches[0].startTie = core.startTie;
                                if (el.startTie !== undefined)
                                    el.pitches[0].startTie = el.startTie;
                            } else {
                                el.rest = core.rest;
                                if (core.endSlur !== undefined)
                                    el.endSlur = core.endSlur;
                                if (core.endTie !== undefined)
                                    el.rest.endTie = core.endTie;
                                if (core.startSlur !== undefined)
                                    el.startSlur = core.startSlur;
                                //if (el.startSlur !== undefined) el.startSlur = el.startSlur;
                                if (core.startTie !== undefined)
                                    el.rest.startTie = core.startTie;
                                if (el.startTie !== undefined)
                                    el.rest.startTie = el.startTie;
                            }

                            if (core.chord !== undefined)
                                el.chord = core.chord;
                            if (core.duration !== undefined)
                                el.duration = core.duration;
                            if (core.decoration !== undefined)
                                el.decoration = core.decoration;
                            if (core.graceNotes !== undefined)
                                el.graceNotes = core.graceNotes;
                            delete el.startSlur;
                            if(multilineVars.staves.length){
                                if (multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index]) {
                                    if (el.pitches !== undefined)
                                        el.pitches[0].endTie = true;
                                    else
                                        el.rest.endTie = true;
                                    multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index] = false;
                                }
                                if (core.startTie || el.startTie)
                                    multilineVars.staves[multilineVars.currentVoice.staffNum].inTie[multilineVars.currentVoice.index] = true;
                            }    
                            i = core.endChar;

                            if (parsingTriplet.notesLeft > 0) {
                                handleTriplet( el, parsingTriplet );
                            }
                            
                            if (core.end_beam)
                                addEndBeam(el);

                            this.addTuneElement('note', startOfLine, startI, i, el, line);
                            el = {};
                        }
                    }

                    if (i === startI) {	// don't know what this is, so ignore it.
                        if (line.charAt(i) !== ' ' && line.charAt(i) !== '`'){
                            if (line.charAt(i) === '$') {
                                // silenciosamente ignora o $ (linebreak)
                                //warn("Character ignored", line, i);
                            } else{
                                warn("Unknown character ignored", line, i);
                            }
                        }
                        i++;
                    }
                }
            }
        }
    };

    this.parseLine = function(line, lineNumber) {
        var ret = header.parseHeader(line, lineNumber);
        if (ret.regular) {
            // TODO: verificar porque no parabens crioulo a voz v3 nao tem clef definida
            if (multilineVars.clef && multilineVars.clef.type === "accordionTab") {
                //var startOfLine = this.getMultilineVars().iChar;
                if (this.accordion) {
                    var deletada = false;
                    if( this.transposer && this.transposer.offSet !== 0) {
                        if( false /* se true o comportamento será eliminar a tablatura para que uma nova seja inferida */ ) {
                            this.transposer.deleteTabLine(lineNumber);
                            deletada = true;
                        } else {
                            /* senao o comportamento será transpor os baixos, sem alterar a tablatura */
                            ret.str = this.transposer.transposeTabVoiceLine(line, lineNumber, multilineVars);
                        }
                    } 
                    if(!deletada) {
                        var voice = this.accordion.parseTabVoice(ret.str, this.getMultilineVars(), this.getTune());
                        if (voice.length > 0) {
                            startNewLine();
                            for (var i = 0; i < voice.length; i++) {
                                tune.appendElement(voice[i].el_type, multilineVars.currTexLineNum, voice[i].startChar, voice[i].endChar, voice[i], multilineVars.currentVoice); // flavio - startOfline
                            }
                        }
                    }
                } else {
                    addWarning("+Warn: Cannot parse tablature line: no accordion defined!");
                }
            } else {
                if (this.transposer && this.transposer.offSet !== 0) {
                    ret.str = this.transposer.transposeRegularMusicLine(line, lineNumber, multilineVars);
                }
                this.parseRegularMusicLine(ret.str);
            }
        }
        if (ret.newline && multilineVars.continueall === undefined)
            startNewLine();
        if (ret.bassfingering)
            addWords(tune.getCurrentStaff(), tune.getCurrentVoice(), line.substring(2), false, true);
        if (ret.fingering)
            addWords(tune.getCurrentStaff(), tune.getCurrentVoice(), line.substring(2), true, false);
        if (ret.words)
            addWords(tune.getCurrentStaff(), tune.getCurrentVoice(), line.substring(2), false, false);
        if (ret.symbols)
            addSymbols(tune.getCurrentVoice(), line.substring(2));
        if (ret.recurse)
            this.parseLine(ret.str);
    };

    this.strTuneHouseKeeping = function() {
        // Take care of whatever line endings come our way
        strTune = window.ABCXJS.parse.gsub(strTune, '\r\n', '\n');
        strTune = window.ABCXJS.parse.gsub(strTune, '\r', '\n');
        strTune += strTune.charAt(strTune.length-1) === '\n' ? '' : '\n';
        strTune = strTune.replace(/\n\\.*\n/g, "\n");	// get rid of latex commands.
        
        var continuationReplacement = function(all, backslash, comment) {
            var spaces = "                                                                                                                                                                                                     ";
            var padding = comment ? spaces.substring(0, comment.length) : "";
            return backslash + " \x12" + padding;
        };
        
        strTune = strTune.replace(/\\([ \t]*)(%.*)*\n/g, continuationReplacement);	// take care of line continuations right away, but keep the same number of characters
        var lines = strTune.split('\n');
        
        while( window.ABCXJS.parse.last(lines).length === 0 )	// remove the blank lines at the end.
            lines.pop();
        
        return lines;

    };
    
//    this.joinStrings = function(original, newLines) {
//        while( original.charAt(original.length-1) === '\n' ) {
//            original = original.substr(0,original.length-1);
//        }
//        while( newLines.charAt(newLines.length-1) === '\n' ) {
//            newLines = newLines.substr(0,newLines.length-1);
//        }
//        return original + newLines + '\n';
//    };
    

    this.parse = function(tuneTxt, switches) {
        // the switches are optional and cause a difference in the way the tune is parsed.
        // switches.header_only : stop parsing when the header is finished
        // switches.stop_on_warning : stop at the first warning encountered.
        // switches.print: format for the page instead of the browser.
        //window.ABCXJS.parse.transpose = transpose;
        
        strTune = tuneTxt;
        
        tune = new window.ABCXJS.data.Tune();
        tokenizer = new window.ABCXJS.parse.tokenizer();
        header = new window.ABCXJS.parse.ParseHeader(tokenizer, warn, multilineVars, tune, this.transposer);

        //tune.reset();
        
        if (switches && switches.print)
            tune.media = 'print';
        multilineVars.reset();
        header.reset(tokenizer, warn, multilineVars, tune);

        var lines = this.strTuneHouseKeeping();
        try {
            for (var lineNumber = 0; lineNumber < lines.length; lineNumber++) {
                multilineVars.currTexLineNum = lineNumber;
                var line = lines[lineNumber];
                if (switches) {
                    if (switches.header_only && multilineVars.is_in_header === false)
                        throw "normal_abort";
                    if (switches.stop_on_warning && multilineVars.warnings)
                        throw "normal_abort";
                }
                if (multilineVars.is_in_history) {
                    if (line.charAt(1) === ':') {
                        multilineVars.is_in_history = false;
                        this.parseLine(line);
                    } else
                        tune.addMetaText("history", tokenizer.translateString(tokenizer.stripComment(line)));
                } else if (multilineVars.inTextBlock) {
                    if (window.ABCXJS.parse.startsWith(line, "%%endtext")) {
                        tune.addText(multilineVars.textBlock);
                        multilineVars.inTextBlock = false;
                    }
                    else {
                        if (window.ABCXJS.parse.startsWith(line, "%%"))
                            multilineVars.textBlock += ' ' + line.substring(2);
                        else
                            multilineVars.textBlock += ' ' + line;
                    }
                } else if (multilineVars.inPsBlock) {
                    if (window.ABCXJS.parse.startsWith(line, "%%endps")) {
                        // Just ignore postscript
                        multilineVars.inPsBlock = false;
                    }
                    else
                        multilineVars.textBlock += ' ' + line;
                } else
                    this.parseLine(line, lineNumber);
                multilineVars.iChar += line.length + 1;
            }
            
            if( this.transposer && this.transposer.offSet !== 0 ) {
                // substitui strTune com os valores transpostos
                strTune = this.transposer.updateEditor( lines );
            }
            
            if (tune.hasTablature) {
                // necessário inferir a tablatura
                if (tune.lines[0].staffs[tune.tabStaffPos].voices[0].length === 0) {
                    // para a tablatura de accordion, sempre se esperam 3 vozes (staffs): uma para melodia, uma para o baixo e a terceira para a tablatura
                    // opcionalmente, a linha de baixo, não precisa existir
                    (tune.tabStaffPos === 0) && addWarning("AccordionTab não deve ser a primeira voz!");
                    for (var t = 1; t < tune.lines.length; t++) {
                        //se for necessário inferir a tablatura, garante que todas as linhas tenham uma staff apropriada
                        if (tune.lines[t].staffs && !tune.lines[t].staffs[tune.tabStaffPos]) {
                            tune.lines[t].staffs[tune.tabStaffPos] = window.ABCXJS.parse.clone(tune.lines[0].staffs[tune.tabStaffPos]);
                            tune.lines[t].staffs[tune.tabStaffPos].meter = null;
                            tune.lines[t].staffs[tune.tabStaffPos].subtitle = "";
                        }
                    }
                    if (this.accordion) {
                        
                        //inferir a nova tablatura
                        this.accordion.inferTablature(tune, multilineVars, addWarning );
                        
                        // obtem possiveis linhas inferidas para tablatura
                        strTune += this.accordion.getTabLines();
                        
                    } else {
                        addWarning("Impossível inferir a tablatura: acordeon não definido!");
                    }
                } else {
                    // como parse da tablatura foi feito, incluir possiveis warnings
                    if(multilineVars.InvalidBass) {
                        addWarning("Baixo incompatível com movimento do fole no(s) compasso(s): "+ multilineVars.InvalidBass.substring(1,multilineVars.InvalidBass.length-1) +".");
                        delete multilineVars.InvalidBass;
                    } 
                    if(multilineVars.missingNotes) {
                        addWarning("Notas não encontradas no(s) compasso(s): "+ multilineVars.missingNotes.substring(1,multilineVars.missingNotes.length-1) +".");
                        delete multilineVars.missingNotes;
                    } 
                    
                }
            }
            if( switches !== undefined ) {
                if(switches.hideLyrics !== undefined){
                    multilineVars.hideLyrics = switches.hideLyrics
                }
                if(switches.hideFingering !== undefined){
                    multilineVars.hideFingering = switches.hideFingering
                }
                /*
                if(switches.ilheirasNumeradas !== undefined){
                    multilineVars.ilheirasNumeradas = switches.ilheirasNumeradas
                } */
            }
            
            tune.setFormat(multilineVars);
            
            tune.handleBarsPerStaff();
            
            tune.checkJumpMarkers(addWarning);

            tune.cleanUp();
            
        } catch (err) {
            if (err !== "normal_abort")
                throw err;
        }
    };
};
