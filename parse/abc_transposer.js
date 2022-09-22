/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*global window */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};
    
window.ABCXJS.parse.Transposer = function ( offSet ) {
    
    this.pitches           = ABCXJS.parse.pitches;
    
    this.tokenizer         = new ABCXJS.parse.tokenizer();
    
    this.reset( offSet );
    
};

window.ABCXJS.parse.Transposer.prototype.reset = function( offSet ) {
    this.offSet          = offSet;
    this.currKey         = [];
    this.newKeyAcc       = [];
    this.oldKeyAcc       = [];
    this.changedLines    = [];
    this.deletedLines    = [];
    this.newX            =  0;
    this.workingX        =  0;
    this.workingLine     = -1;
    this.workingLineIdx  = -1;
};

window.ABCXJS.parse.Transposer.prototype.numberToStaff = function(number, newKacc) {
    var s ;
    if(newKacc.length > 0 && newKacc[0].acc === 'flat')
        s = ABCXJS.parse.number2staff[number];
    else
        s = ABCXJS.parse.number2staffSharp[number];
    
    // octave can be altered below
    s.octVar = 0;
    
    if(s.acc === "" && ("EFBC").indexOf(s.note) >= 0 ) {
        var o ;
        switch(s.note) {
            case 'E':
                //procurar Fflat
                o = {note:'F',acc:'flat', octVar:0};
                break;
            case 'F':
                //procurar Esharp
                o = {note:'E',acc:'sharp', octVar:0};
                break;
            case 'B':
                //procurar Cflat
                o = {note:'C',acc:'flat', octVar:1};
                break;
            case 'C':
                //procurar Bsharp
                o = {note:'B',acc:'sharp', octVar:-1};
                break;
        }
        for( var a = 0; a < newKacc.length; a ++ ) {
            if( newKacc[a].note.toUpperCase() === o.note && newKacc[a].acc === o.acc ){
                s = o;
                break;
            }
        }
    }
    return s;
};

window.ABCXJS.parse.Transposer.prototype.transposeRegularMusicLine = function(line, lineNumber, multilineVars) {

    var index = 0;
    var found = false;
    var inside = false;
    var state = 0;
    var lastState = 0;
    var xi = -1;
    var xf = -1;
    var accSyms = "^_=";  // state 1
    var pitSyms = "ABCDEFGabcdefg"; // state 2
    var octSyms = ",\'"; // state 3
    var exclusionSyms = '"!+'; 
    
    this.workingLine = line;
    this.vars = multilineVars;
    this.isBass = (this.vars.currentVoice.clef.type==='bass') || false;
    this.isChord = false;
    this.workingLineIdx = this.changedLines.length;
    this.changedLines[ this.workingLineIdx ] = { line:lineNumber, text: line };
    this.workingX = 0;
    this.newX =0;
    this.baraccidentals = [];
    this.baraccidentalsNew = [];
    
    while (index < line.length) {
        found = false;
        inside = false;
        lastState = 0;
        while (index < line.length && !found && line.charAt(index) !== '%') {
            
            // ignora o conteúdo de accents
            if( !inside && exclusionSyms.indexOf(line.charAt(index)) >= 0 ) {
                var nextPos = line.substr( index+1 ).indexOf(line.charAt(index));
                if( nextPos < 0 ) {
                    index = line.length;
                } else {
                    if(line.charAt(index)==='"') {
                        this.transposeChord( index+1, nextPos ); 
                    }    
                    index += nextPos + 2;
                }
                continue;
            }
            
            if(line.charAt(index) === '|'){
                this.baraccidentals = [];
                this.baraccidentalsNew = [];
            }
            
            state = 
              accSyms.indexOf(line.charAt(index)) >= 0 ? 1 : 
              pitSyms.indexOf(line.charAt(index)) >= 0 ? 2 :
              octSyms.indexOf(line.charAt(index)) >= 0 ? 3 : 0;
            
            if( ( state < lastState && inside ) || (lastState === 2 && state === 2 && inside ) ) {
               found = true;
               xf = index;
            } else if( state > lastState && !inside) {
              inside = true;
              xi = index;
            }
            
            lastState = state;
            state = 0;
            
            if (found) {
              this.transposeNote(xi, xf - xi);
            } else {
                if( line.charAt(index) === '[' ) {
                    index = this.checkForInlineFields( index );
                } else {
                    if(line.charAt(index) === ']' ) {
                        this.isChord = false;
                        delete this.lastPitch ;
                    }
                    index++;
                }
            }   
            
        }
        
        if(inside && !found) {
            this.transposeNote(xi, index - xi);
        }
        
        if(line.charAt(index) === '%' ){
            index = line.length;
        }
      
    }
    return this.changedLines[ this.workingLineIdx ].text;
};

window.ABCXJS.parse.Transposer.prototype.checkForInlineFields = function ( index ) {
    var c = this.workingLine.substring(index);
    var rex = c.match(/^\[([IKLMmNPQRrUV]\:.*?)\]/g);
    var newidx = index;
    if(rex) {
        var key = rex[0].substr(1,rex[0].length-2).split(":");
        switch(key[0]) {
            case 'K': //Será que deveria me preocupar em colocar em cNewKey informação da armadura daqui para frente?
               this.transposeChord(index+3,key[1].length);
               newidx+=rex[0].length;
               break;
            case 'V':
               this.updateVoiceInfo(key[1]);
               newidx+=rex[0].length;
               break;
            default:
               newidx+=rex[0].length;
        }
    } else {
        this.isChord = 1;
        newidx+=1;
    }
    return newidx;
};

window.ABCXJS.parse.Transposer.prototype.updateVoiceInfo = function ( id ) {
    this.vars.currentVoice = this.vars.voices[id] ;
    this.isBass = (this.vars.currentVoice.clef.type==='bass') || false;
    
};

window.ABCXJS.parse.Transposer.prototype.transposeChord = function ( xi, size ) {
    
    var c = this.denormalizeAcc(this.workingLine.substring(xi,xi+size));
    var rex = c.match(/([ABCDEFG][#b]*[M+m°]*[0-9]*(\/[ABCDEFG0-9])*)/g);
    
    if( Math.abs(this.offSet)%12 === 0 || !rex || c!==rex[0]  ) return ;
    
    var newStr = c;
    
    rex = c.match(/([ABCDEFG].*(\/[ABCDEFG]).*)/g);
    c = rex===null? [c] : c.split('/');
    
    for( var t = 0; t < c.length; t++) {
        
        var cKey = this.parseKey( c[t] );
        var newKey = this.keyToNumber( cKey );
        var cNewKey = this.denormalizeAcc( this.numberToKey(newKey + this.offSet, this.offSet ));

        newStr  = newStr.replace(cKey, cNewKey );
    }
    this.updateWorkingLine( newStr, xi, size/*, cNewKey.length*/ );
    //this.workingLine = this.workingLine.substr(0, xi) + cNewKey + this.workingLine.substr(xi+size);
};

window.ABCXJS.parse.Transposer.prototype.transposeNote = function(xi, size )
{
    var abcNote = this.workingLine.substr(xi, size);
    var elem = this.makeElem(abcNote);
    var pitch = elem.pitch;
    var oct = this.extractStaffOctave(pitch);
    var crom = this.staffNoteToCromatic(this.extractStaffNote(pitch));

    var txtAcc = elem.accidental;
    var dAcc = this.getAccOffset(txtAcc);
    
    if(elem.accidental) {
        this.baraccidentals[pitch] = dAcc;
    }

    var dKi = this.getKeyAccOffset(this.numberToKey(crom, this.offSet), this.oldKeyAcc);

    var newNote = 0;
    if (this.baraccidentals[pitch] !== undefined) {
        newNote = crom + this.baraccidentals[pitch] + this.offSet;
    } else { // use normal accidentals
        newNote = crom + dKi + this.offSet;
    }

    var newOct = this.extractCromaticOctave(newNote);
    var newNote = this.extractCromaticNote(newNote);

    var newStaff = this.numberToStaff(newNote, this.newKeyAcc);
    var dKf = this.getKeyAccOffset(newStaff.note, this.newKeyAcc);
    
    var deltaOctave = newOct + newStaff.octVar; 
    
    if( this.isBass ) {
        if ( this.isChord && this.isChord > 1 ) {
            var p = this.getPitch(newStaff.note, oct + deltaOctave );

            if( this.offset > 0 ) {
                if( p < elem.pitch ) deltaOctave++;
            } else {
                if( p > elem.pitch ) deltaOctave--;
            }
            p = this.getPitch(newStaff.note, oct + deltaOctave );
            if(p < this.lastPitch ){
                // assumir que o acorde é cadastrado em ordem crescente e
                // se ao final da conversão de uma nota do acorde, esta for menor que a prévia, somar uma oitava. 
                deltaOctave++;
            }
        } else {
            deltaOctave = 0;
        }
        this.isChord && this.isChord ++; 
    }


    this.lastPitch = pitch = this.getPitch(newStaff.note, oct + deltaOctave );
    dAcc = this.getAccOffset(newStaff.acc);

    var newElem = {};
    newElem.pitch = pitch;
    if(newStaff.acc !== '' ) newElem.accidental = newStaff.acc;
    
    // se a nota sair com um acidente (inclusive natural) registrar acidente na barra para o pitch.
    var dBarAcc = this.getAccOffset( this.baraccidentalsNew[newElem.pitch] );
    if(dAcc === 0) {
        if( dBarAcc && dBarAcc !==0 || dKf !== 0) {
          newElem.accidental = 'natural';
        }
    } else {
        if( dBarAcc && dBarAcc !== 0 ) {
           if(dBarAcc === dAcc ) delete newElem.accidental;
        } else if(dKf !== 0) {
           if(dKf === dAcc ) delete newElem.accidental;
        }
    }
    
    if( newElem.accidental ) {
      this.baraccidentalsNew[newElem.pitch] = newElem.accidental;
    }

    oct = this.extractStaffOctave(pitch);
    var key = this.numberToKey(this.staffNoteToCromatic(this.extractStaffNote(pitch)), this.offSet);
    txtAcc = newElem.accidental;
    abcNote = this.getAbcNote(key, txtAcc, oct);
    this.updateWorkingLine( abcNote, xi, size/*, abcNote.length */);
    return newElem;
};

window.ABCXJS.parse.Transposer.prototype.updateWorkingLine = function( newText, xi, size/*, newSize*/ ) {
    var p0 = this.changedLines[this.workingLineIdx].text.substr(0, this.newX);
    var p1 = this.workingLine.substr(this.workingX, xi - this.workingX);
    var p2 = this.workingLine.substr(xi + size);
    this.workingX = xi + size;
    this.changedLines[this.workingLineIdx].text = p0 + p1 + newText;
    this.newX = this.changedLines[this.workingLineIdx].text.length;
    this.changedLines[this.workingLineIdx].text += p2;
};

window.ABCXJS.parse.Transposer.prototype.getAbcNote = function( key, txtAcc, oct) {
   var cOct = "";
   if( oct >= 5 ) {
       key = key.toLowerCase();  
       cOct = Array(oct-4).join("'");
   }  else {
       key = key.toUpperCase();  
       cOct = Array(4-(oct-1)).join(",");
   }
   return this.accNameToABC(txtAcc) + key + cOct;
};

window.ABCXJS.parse.Transposer.prototype.transposeKey = function ( str, line, lineNumber ) {

    var cKey = this.parseKey( str );
    
    this.currKey[this.currKey.length] = cKey;
    
    if( Math.abs(this.offSet)%12 === 0 || ! cKey ) return this.tokenizer.tokenize(str, 0, str.length);
    
    var newKey = this.keyToNumber( cKey );
    var cNewKey = this.denormalizeAcc( this.numberToKey(newKey + this.offSet, this.offSet ));
    
    this.currKey[this.currKey.length-1] = cNewKey;

    var newStr  = str.replace(cKey, cNewKey );
    var newLine = line.substr( 0, line.indexOf(str) ) + newStr;
    
    this.changedLines[ this.changedLines.length ] = { line:lineNumber, text: newLine };

    this.oldKeyAcc = ABCXJS.parse.parseKeyVoice.standardKey(this.denormalizeAcc(str));
    this.newKeyAcc = ABCXJS.parse.parseKeyVoice.standardKey(this.denormalizeAcc(newStr));
    
    return this.tokenizer.tokenize(newStr, 0, newStr.length);
};

window.ABCXJS.parse.Transposer.prototype.parseKey = function ( str ) {
    var cKey = null;
    var tokens = this.tokenizer.tokenize(str, 0, str.length);
    var retPitch = this.tokenizer.getKeyPitch(tokens[0].token);

    if (retPitch.len > 0) {
        // The accidental and mode might be attached to the pitch, so we might want to just remove the first character.
        cKey = retPitch.token;
        if (tokens[0].token.length > 1)
            tokens[0].token = tokens[0].token.substring(1);
        else
            tokens.shift();
        // We got a pitch to start with, so we might also have an accidental and a mode
        if (tokens.length > 0) {
            var retAcc = this.tokenizer.getSharpFlat(tokens[0].token);
            if (retAcc.len > 0) {
                cKey += retAcc.token;
            }
        }
    }
    
    return cKey;
};


window.ABCXJS.parse.Transposer.prototype.deleteTabLine = function ( n ) {
    this.deletedLines[n] = true;
};

window.ABCXJS.parse.Transposer.prototype.updateEditor = function ( lines ) {
    
    for( i = 0; i < this.changedLines.length; i++ ){
        lines[this.changedLines[i].line] = this.changedLines[i].text;
    }
    
    var newStr = lines[0]; // supoe q a linha zero nunca sera apagada
    
    for( var i = 1; i < lines.length; i++ ){
        if( ! this.deletedLines[i] ) {
            newStr += '\n' + lines[i];
        }
    }
    this.deletedLines = [];
    this.changedLines = [];
    return newStr+'\n';
};

window.ABCXJS.parse.Transposer.prototype.getKeyVoice = function ( idx ) {
return (this.currKey[idx]?this.currKey[idx]:"C");
};

window.ABCXJS.parse.Transposer.prototype.normalizeAcc = function ( cKey ) {
    return ABCXJS.parse.normalizeAcc(cKey);
};

window.ABCXJS.parse.Transposer.prototype.denormalizeAcc = function ( cKey ) {
    return ABCXJS.parse.denormalizeAcc(cKey);
};

window.ABCXJS.parse.Transposer.prototype.getKeyAccOffset = function(note, keyAcc)
// recupera os acidentes da clave e retorna um offset no modelo cromatico
{
  for( var a = 0; a < keyAcc.length; a ++) {
      if( keyAcc[a].note.toLowerCase() === note.toLowerCase() ) {
          return this.getAccOffset(keyAcc[a].acc);
      }
  }
  return 0;    
};
               
window.ABCXJS.parse.Transposer.prototype.staffNoteToCromatic = function (note) {
  return note*2 + (note>2?-1:0);
};

//window.ABCXJS.parse.Transposer.prototype.cromaticToStaffNote = function (note) {
//  return (note>5?note+1:note)/2;
//};

window.ABCXJS.parse.Transposer.prototype.extractStaffNote = function(pitch) {
    pitch = pitch % 7;
    return pitch<0? pitch+=7:pitch;
};

window.ABCXJS.parse.Transposer.prototype.extractCromaticOctave = function(pitch) {
    return Math.floor(pitch/12) ;
};

window.ABCXJS.parse.Transposer.prototype.extractCromaticNote = function(pitch) {
    pitch = pitch % 12;
    return pitch<0? pitch+=12:pitch;
};

window.ABCXJS.parse.Transposer.prototype.extractStaffOctave = function(pitch) {
    return Math.floor((28 + pitch) / 7);
};

window.ABCXJS.parse.Transposer.prototype.numberToKey = function(number, offset) {
    var r = number;
    r %= ABCXJS.parse.number2keysharp.length;
    
    if( r < 0 ) r += ABCXJS.parse.number2keysharp.length;
    
    if( offset > 0 ) {
        r = ABCXJS.parse.number2keysharp[r];
    } else {
        r = ABCXJS.parse.number2keyflat[r];
    }
    return r;
};

window.ABCXJS.parse.Transposer.prototype.keyToNumber = function(key) {
    key = this.normalizeAcc(key);
    return ABCXJS.parse.key2number[key];
};

window.ABCXJS.parse.Transposer.prototype.getAccOffset = function(txtAcc)
// a partir do nome do acidente, retorna o offset no modelo cromatico
{
    var ret = 0;

    switch (txtAcc) {
        case 'accidentals.dblsharp':
        case 'dblsharp':
            ret = 2;
            break;
        case 'accidentals.sharp':
        case 'sharp':
            ret = 1;
            break;
        case 'accidentals.nat':
        case 'nat':
        case 'natural':
            ret = 0;
            break;
        case 'accidentals.flat':
        case 'flat':
            ret = -1;
            break;
        case 'accidentals.dblflat':
        case 'dblflat':
            ret = -2;
            break;
    }
    return ret;
};

window.ABCXJS.parse.Transposer.prototype.accNameToABC = function(txtAcc)
// a partir do nome do acidente, retorna o offset no modelo cromatico
{
    var ret = "";

    switch (txtAcc) {
        case 'accidentals.dblsharp':
        case 'dblsharp':
            ret = "^^";
            break;
        case 'accidentals.sharp':
        case 'sharp':
            ret = '^';
            break;
        case 'accidentals.nat':
        case 'nat':
        case 'natural':
            ret = "=";
            break;
        case 'accidentals.flat':
        case 'flat':
            ret = '_';
            break;
        case 'accidentals.dblflat':
        case 'dblflat':
            ret = '__';
            break;
    }
    return ret;
};

window.ABCXJS.parse.Transposer.prototype.accAbcToName = function(abc)
// a partir do nome do acidente, retorna o offset no modelo cromatico
{
    var ret = "";

    switch (abc) {
        case '^^':
            ret = "dblsharp";
            break;
        case '^':
            ret = 'sharp';
            break;
        case '=':
            ret = "natural";
            break;
        case '_':
            ret = 'flat';
            break;
        case '__':
            ret = 'dblflat';
            break;
    }
    return ret;
};

window.ABCXJS.parse.Transposer.prototype.getAccName = function(offset)
{
    var names = ['dblflat','flat','natural','sharp','dblsharp'];
    return names[offset+2];
};

window.ABCXJS.parse.Transposer.prototype.getPitch = function( staff, octave) {
   return this.pitches[staff] + (octave - 4) * 7; 
};

window.ABCXJS.parse.Transposer.prototype.makeElem = function(abcNote){
   var pitSyms = "ABCDEFGabcdefg"; // 2
   var i = 0;
   while( pitSyms.indexOf(abcNote.charAt(i)) === -1 ) {
       i++;
   }
   var acc = this.accAbcToName(abcNote.substr(0,i));
   var pitch = this.pitches[abcNote.charAt(i)];
   while( i < abcNote.length ) {
      switch ( abcNote.charAt(i) ) {
          case "'": pitch +=7; break;
          case "," : pitch -=7; break;
      }
      i++;
   }
   return ( acc ? { pitch: pitch, accidental: acc } : { pitch: pitch } );
};
