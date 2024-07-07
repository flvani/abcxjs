/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *   - BUG: não há mais informação sobre o início de cada compasso.
 *   - implementar: segno, coda, capo e fine
 *     Nota: aparentemente o ABC não implementa simbolos como D.S al fine
 *   - Ok - imprimir endings somente no compasso onde ocorrem
 *   - Ok - tratar endings em compassos com repeat bar (tratar adequadamente endings/skippings)
 *   - Ok - tratar notas longas - tanto quganto possível, as notas longas serão reiniciadas
 *          porém a qualidade não é boa pois o reinício é perceptível
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

ABCXJS.midi.Parse = function( options ) {
    options = options || {};
    this.vars = { warnings: [] };
    this.scale = [0, 2, 4, 5, 7, 9, 11];
    
    this.wholeNote = 32;
    this.minNote = 1 / this.wholeNote;
    this.oneMinute = 60000;
    
    this.reset();
    
    this.addWarning = function(str) {
        this.vars.warnings.push(str);
    };
    
    this.getWarnings = function() {
        return this.vars.warnings;    
    };
};

ABCXJS.midi.Parse.prototype.reset = function() {
    
    this.vars = { warnings: [] };
    this.globalJumps = [];
    
    this.addingBarNumbers = -1;
    this.channel = -1;
    this.timecount = 0;
    this.playlistpos = 0;
    this.maxPass = 2;
    this.countBar = 0;
    this.next = null;
    this.restart = {line: 0, staff: 0, voice: 0, pos: 0};
    
    
    this.multiplier = 1;
    this.alertedMin = false;
    
    this.startTieInterval = [];
    this.lastTabElem = [];
    this.baraccidentals = [];
    this.parsedElements = [];
    
    this.pass = [];
    
    this.midiTune = { 
        tempo: this.oneMinute/640 // duração de cada intervalo em mili
       ,playlist: [] // nova strutura, usando 2 elementos de array por intervalo de tempo (um para ends e outro para starts) 
       ,measures: [] // marks the start time for each measure - used for learning mode playing
    }; 
};

ABCXJS.midi.Parse.prototype.parse = function(tune, keyboard) {
    
    var self = this;
    var currBar = 0; // marcador do compasso corrente - não conta os compassos repetidos por ritornellos

    this.reset();

    this.abctune = tune;
    
    this.transposeTab = 0;
    if(tune.hasTablature){
        this.transposeTab = tune.lines[0].staffs[tune.tabStaffPos].clef.transpose || 0;
    }
    
    this.midiTune.keyboard = keyboard;

    if ( tune.metaText && tune.metaText.tempo) {
        var bpm = tune.metaText.tempo.bpm || 80;
        var duration = tune.metaText.tempo.duration[0] || 0.25;
        this.midiTune.tempo = this.oneMinute / (bpm * duration * this.wholeNote);
    }

    //faz o parse dos elementos abcx 
    this.staffcount = 1;
    for (this.staff = 0; this.staff < this.staffcount; this.staff++) {
        this.voicecount = 1;
        for (this.voice = 0; this.voice < this.voicecount; this.voice++) {
            this.startTrack();
            for (this.line = 0; !this.endTrack && this.line < this.abctune.lines.length; this.line++) {
                if ( this.getStaff() ) {
                    this.pos = 0;
                    if(!this.capo){
                        this.capo = this.restart = this.getMark();
                    }    
                    this.next = null;
                    this.staffcount = this.getLine().staffs.length;
                    this.voicecount = this.getStaff().voices.length;
                    this.setKeySignature(this.getStaff().key);
                    while (!this.endTrack && this.pos < this.getVoice().length ) {
                        var elem = this.getElem();

                        switch (elem.el_type) {
                            case "note":
                                if( this.skipping ) break;
                                if (this.getStaff().clef.type !== "accordionTab") {
                                  this.writeNote(elem);
                                } else {
                                  this.selectButtons(elem);
                                }
                                break;
                            case "key":
                                if( this.skipping ) break;
                                this.setKeySignature(elem);
                                break;
                            case "bar":
                                if(!this.handleBar(elem)) {
                                    return null;
                                }
                                break;
                            case "meter":
                            case "clef":
                                break;
                            default:
                        }
                        if (this.next) {
                            this.line = this.next.line;
                            this.staff = this.next.staff;
                            this.voice = this.next.voice;
                            this.pos = this.next.pos;
                            this.next = null;
                        } else {
                            this.pos++;
                        }
                    }
                }
            }
        }
    }
    
    if(this.lookingForCoda ){
        this.addWarning('Simbolo não encontrado: "Coda"!');
    }
    
    //cria a playlist a partir dos elementos obtidos acima  
    this.parsedElements.forEach( function( item, time ) {
        
        if( item.end.pitches.length + item.end.abcelems.length /* fka + item.end.buttons.length > 0*/ ) {
            self.midiTune.playlist.push( {item: item.end, time: time, start: false } );
        }
        
        if( item.start.pitches.length + item.start.abcelems.length + item.start.buttons.length > 0 ) {
            var pl = {item: null, time: time, start: true };
            if( item.start.barNumber ) {
                this.lastBar = null; // identifica o compasso onde os botões da tablatura não condizem com a partitura
                if( item.start.barNumber > currBar ) {
                    currBar = this.lastBar = item.start.barNumber;
                    self.midiTune.measures[currBar] = self.midiTune.playlist.length;
                }
                pl.barNumber = item.start.barNumber;
            } 
            delete item.start.barNumber;
            self.handleButtons(item.start.pitches, item.start.buttons );
            delete item.start.buttons; 
            pl.item = item.start;
            self.midiTune.playlist.push( pl );
        }
    });
    
    
    tune.midi = this.midiTune;
    
    return this.midiTune;
};

ABCXJS.midi.Parse.prototype.handleButtons = function(pitches, buttons ) {
    var note, midipitch, key, pitch;
    var self = this;
    buttons.forEach( function( item ) {
        if(!item.button.button) {
            //waterbug.log( 'ABCXJS.midi.Parse.prototype.handleButtons: botão não encontrado.');
            return;
        }
        if( item.button.closing )  {
            note = ABCXJS.parse.clone(item.button.button.closeNote);
        } else {
            note = ABCXJS.parse.clone(item.button.button.openNote);
        }
        if(note.isBass) {
            if(note.isChord){
                key = note.key.toUpperCase();
            } else{
                key = note.key;
            }
        } else {
            
            if( self.transposeTab ) {
                switch(self.transposeTab){
                    case 8: note.octave --; break;
                    case -8: note.octave ++; break;
                    default:
                        this.addWarning('Possível transpor a tablatura uma oitava acima ou abaixo +/-8. Ignorando transpose.') ;
                }
            }
            
            midipitch = 12 + 12 * note.octave + ABCXJS.parse.key2number[ note.key ];
        }
        
        // TODO:  no caso dos baixos, quando houver o baixo e o acorde simultaneamente
        // preciso garantir que estou atribuindo o botão à nota certa, visto que  podem ter tempos diferentes
        // por hora, procuro a primeira nota que corresponda e não esteja com botão associado (! pitches[r].button)
        var hasBass=false, hasTreble=false;
        for( var r = 0; r < pitches.length; r ++ ) {
            if(note.isBass && pitches[r].midipitch.clef === 'bass') {
                pitch = pitches[r].midipitch.midipitch % 12;
                hasBass=true;
                if( pitch === ABCXJS.parse.key2number[ key ] && ! pitches[r].button ){
                    pitches[r].button = item.button;
                    item.button = null;
                    return;
                }
            } else if(!note.isBass && pitches[r].midipitch.clef !== 'bass') { 
                hasTreble=true;
                if( pitches[r].midipitch.midipitch === midipitch ) {
                    pitches[r].button = item.button;
                    item.button = null;
                    return;
                }
            }
        }
        if(this.lastBar && ((note.isBass && hasBass) || (!note.isBass && hasTreble /* flavio && this.lastBar */))) {
            var b = item.button.button;
            self.addWarning( 'Compasso '+this.lastBar+': Botao '+b.tabButton+' ('+b.closeNote.key+'/'+b.openNote.key+') não corresponde a nenhuma nota em execução.');
        }    
    });
};
            
ABCXJS.midi.Parse.prototype.writeNote = function(elem) {
    
    if (elem.startTriplet) {
        this.multiplier = (elem.startTriplet.num === 2) ? 3 / 2 : (elem.startTriplet.num - 1) / elem.startTriplet.num;
    }

    var mididuration = this.checkMinNote(elem.duration * this.wholeNote * this.multiplier);

    if (elem.pitches) {
        var midipitch;
        for (var i = 0; i < elem.pitches.length; i++) {
            var note = elem.pitches[i];
            var pitch = note.pitch;
            if (note.accidental) {
                // change that pitch (not other octaves) for the rest of the bar
                this.baraccidentals[pitch] = this.getAccOffset(note.accidental);
            }

            midipitch = 60 + 12 * this.extractOctave(pitch) + this.scale[this.extractNote(pitch)];

            if (this.baraccidentals[pitch] !== undefined) {
                midipitch += this.baraccidentals[pitch];
            } else { // use normal accidentals
                midipitch += this.accidentals[this.extractNote(pitch)];
            }

            if (note.tie) {
                this.handleTie( elem, note, midipitch, mididuration );
            } else {
                if (this.startTieInterval[midipitch] && this.startTieInterval[midipitch][0]) {
                    // ligadura do tipo slur - nota contida
                    this.addWarning( 'Linha '+(elem.line+1)+': Nota sendo ignorada porque já está contida na ligadura!' );
                    // apenas informa o inicio e o fim do elemento na playlist (sem som)
                    this.addStart( this.timecount, null, elem, null );
                    this.addEnd( this.timecount + mididuration, null, elem );
                } else { // o básico - inicia e termina a nota
                    var mp = {channel: this.channel, midipitch: midipitch, mididuration: mididuration};
                    // elemento completo + som: inicia e termina no seu próprio tempo
                    this.addStart( this.timecount, mp, elem, null );
                    this.addEnd( this.timecount + mididuration, mp, elem );
                }
            }
        }
    } else {
        // rest
        this.addStart( this.timecount, null, elem, null );
        this.addEnd( this.timecount + mididuration, null, elem );
        
    }

    this.setTimeCount( mididuration );
    
    if (elem.endTriplet) {
        this.multiplier = 1;
    }
};

ABCXJS.midi.Parse.prototype.handleTie = function ( elem, note, midipitch, mididuration ) {
    
    if (note.tie && note.tie.id_end) { // termina
        
        var startInterval = this.startTieInterval[midipitch];
        
        if( note.tie.id_start ) { // termina ligadura e recomeça
            //inclui o inicio do elemento (sem som na playlist), mas não o seu fim
            this.addStart( this.timecount, null, elem, null );
            // guarda junto com o elemento que iniciou a ligadura, também, este elemento
            startInterval.otrElems.push( elem );
            
         }  else {
            
            // adiciona o ínicio e o fim do último elemento da ligadura, sem som
            this.addStart( this.timecount, null, elem, null );
            this.addEnd( this.timecount+mididuration, null, elem );
            
            if(!startInterval ) {
               this.addWarning( 'Verifique as ligaduras: possivel ligacao de notas com alturas diferentes');
               return;
            }
            
            // para todos os elementos intermediários, adiciona o fim sem som
            for(var i=0; i < startInterval.otrElems.length; i++ ) {
                this.addEnd( this.timecount+mididuration, null, startInterval.otrElems[i] );
            }
            
            // trata a duração total da ligadura
            var duration = this.timecount-startInterval.startTime + mididuration;
            // atualiza a informação de tempo do elemento inicial
            startInterval.midipitch.mididuration = duration;
            // insere o final do som e do elemento inicial da ligadura
            this.addEnd( this.timecount+mididuration, startInterval.midipitch, startInterval.elem  );
            
            // zera a informação de ligadura para esta nota
            this.startTieInterval[midipitch] = null;
            
        }
    } else if (note.tie && note.tie.id_start ) { // só inicia
        var mp = {channel:this.channel, midipitch:midipitch, mididuration: mididuration};
        // informa o inicio do midi (e elemento) na playlist, mas nao o seu final 
        this.addStart( this.timecount, mp, elem, null );
        // registra dados do elemento que iniciou a ligadura 
        this.startTieInterval[midipitch] = { elem:elem, startTime: this.timecount, midipitch:mp, otrElems:[] };
    } 
};

ABCXJS.midi.Parse.prototype.clearTies = function() {
    // esta função é usada em caso de ritornellos em que haja alguma ligadura em aberto.
    var self = this;
    self.startTieInterval.forEach( function ( obj, index ) {
        if( ! obj ) return; 
        self.addEnd( self.timecount, obj.midipitch, obj.elem ); 
        self.startTieInterval[index] = null;
    });
};

ABCXJS.midi.Parse.prototype.setTimeCount = function(dur) {
    this.timecount += dur;
    // corrigir erro de arredondamento
    if( this.timecount%1.0 > 0.9999 ) {
        this.timecount = Math.round( this.timecount );
    }
};

ABCXJS.midi.Parse.prototype.checkMinNote = function(dur) {
    if( dur < 0.99 ) {
        dur = 1;
        if( !this.alertedMin ) {
            this.addWarning( 'Nota(s) com duração menor que o mínimo suportado: 1/' + this.wholeNote + '.');
            this.alertedMin = true;
        }    
    }
    
    return dur;
    
};

ABCXJS.midi.Parse.prototype.selectButtons = function(elem) {
    
    if (elem.startTriplet) {
        this.multiplier = (elem.startTriplet.num === 2) ? 3 / 2 : (elem.startTriplet.num - 1) / elem.startTriplet.num;
    }
    
    var mididuration = elem.duration * this.wholeNote * this.multiplier;
    
    if (elem.pitches) {
        
        var button;
        var bassCounter = 0; // gato para resolver o problema de agora ter um ou dois botões de baixos
        for (var i = 0; i < elem.pitches.length; i++) {
            var tie = false;
            if (elem.pitches[i].bass ) 
                bassCounter++;
            
            if (elem.pitches[i].type === "rest") 
                continue;
            
            if (elem.pitches[i].bass) {
                if (elem.pitches[i].c === 'scripts.rarrow') {
                    button = this.lastTabElem[i];
                    elem.pitches[i].lastButton = (button? button.tabButton: 'x');
                    tie = true;
                } else {
                    button = this.getBassButton(elem.bellows, elem.pitches[i].c, elem.pitches[i].variant);
                    this.lastTabElem[i] = button;
                }
            } else {
                if ( elem.pitches[i].c === 'scripts.rarrow') {
                    button = this.lastTabElem[10+i-bassCounter];
                    elem.pitches[i].lastButton = (button? button.tabButton: 'x');
                    tie = true;
                } else {
                    button = this.getButton(elem.pitches[i].c);
                    this.lastTabElem[10+i-bassCounter] = button;
                }
            }
            if( ! tie ) {
                this.addStart( this.timecount, null, null, { button: button, closing: (elem.bellows === '+'), duration: elem.duration } );
            }    
        }
    }
    
    this.addStart( this.timecount, null, elem, null );
    this.addEnd( this.timecount+mididuration, null, elem );
    
    this.setTimeCount( mididuration );
    
    if (elem.endTriplet) {
        this.multiplier = 1;
    }
    
};

// Esta função é fundamental pois controla todo o fluxo de execução das notas do MIDI
ABCXJS.midi.Parse.prototype.handleBar = function (elem) {
    
    this.countBar++; // para impedir loop infinito em caso de erro
    if(this.countBar > 10000) {
      this.addWarning('Impossível gerar o MIDI para esta partitura após 10.000 ciclos.') ;
      return false;
    }
    
    this.maxPass = elem.repeat;

    if( elem.barNumber ) {
        this.addBarNumber = elem.barNumber; 
    }
    
    this.baraccidentals = [];
    
    if( this.lookingForCoda ) {
        if( !elem.jumpInfo || elem.jumpInfo.type!=='coda' ) {
            return true;
        } else {
            this.codaPoint = this.getMark(); 
            this.lookingForCoda = false;
            this.skipping = false;
        }
    }
    
    //implementa jump ao final do compasso
    //if(this.nextBarJump ) {
    //    this.next = this.nextBarJump;
    //    delete this.nextBarJump;
    //}

    var pass = this.setPass();
    
    if(elem.type === "bar_left_repeat") {
        this.restart = this.getMark();   
    } 
    
    if (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat" ) {
        if( pass < this.maxPass ) {
            delete this.currEnding; // apaga qualquer ending em ação
            this.clearTies(); // limpa ties
            this.next = this.restart;// vai repetir
            return true;
        } else {
            if( elem.type === "bar_dbl_repeat" ) {
                // não vai repetir e, além de tudo, é um novo restart
                this.restart = this.getMark();   
            }
        }
    }
    
   // encerra uma chave de finalização
    if (elem.endEnding) {
        delete this.currEnding;
    }

   // inicia uma chave de finalização e faz o parse da quantidade repetições necessarias
   // a chave de finalização imediatamente  após um bloco de repetição ter sido terminado será ignorada
   // e enquanto o bloco estiver sendo repetido, também
    if (elem.startEnding ) {
        var a = elem.startEnding.split('-');
        this.currEnding = {};
        this.currEnding.min = parseInt(a[0]);
        this.currEnding.max = a.length > 1 ? parseInt(a[1]) : this.currEnding.min;
        this.currEnding.measuresInEnding = [];
        this.maxPass = Math.max(this.currEnding.max, 2);
        
        // casa "2" não precisa de semantica
        // rever isso: não precisa de semântica se a casa dois vier depois de um 
        // simbolo de repetição, seja um ritornello ou qualquer outro.
        // pergunta: casa 2 sem sinal de repetição faz sentido?
        if(this.currEnding.min > 1) delete this.currEnding;  
    }
    
    if(this.currEnding) {
        // registra os compassos debaixo deste ending
        this.currEnding.measuresInEnding.push( this.getMark() ); 
    }
    
    this.skipping = (this.currEnding && ( pass < this.currEnding.min || pass > this.currEnding.max) ) || false;

    if(elem.jumpPoint ) {
        
        switch (elem.jumpPoint.type) {
            case "coda":     
                this.codaPoint = this.getMark(); 
                break;
            case "segno":    
                this.segnoPoint = this.getMark(); 
                break;
            case "fine":     
                if(this.fineFlagged) {
                    this.endTrack = true;
                    return true;
                } 
                break;
        }
    }
    
    if(elem.jumpInfo ) {
        switch (elem.jumpInfo.type) {
            case "dacapo":   
                if(!this.daCapoFlagged) {
                    this.next = this.capo;
                    this.daCapoFlagged = true;
                    this.resetPass();
                } 
                break;
            case "dasegno":
                if( this.segnoPoint ){
                    if(!this.daSegnoFlagged){
                        this.next = this.segnoPoint;
                        this.daSegnoFlagged = true;
                        this.resetPass();
                    }
                } else {
                    this.addWarning( 'Ignorando Da segno!');
                }
                break;
            case "dcalfine": 
                if(!this.daCapoFlagged) {
                    this.next = this.capo;
                    this.daCapoFlagged = true;
                    this.fineFlagged = true;
                    this.resetPass();
                } 
                break;
            case "dsalfine": 
                if( this.segnoPoint ){
                    if(!this.daSegnoFlagged){
                        this.next = this.segnoPoint;
                        this.fineFlagged = true;
                        this.daSegnoFlagged = true;
                        this.resetPass();
                    }
                } else {
                    this.addWarning( 'Ignorando Da segno al fine!');
                }
                break;
            case "dacoda":
                if( this.codaPoint ){
                    if(pass >= this.maxPass || this.daCodaFlagged){
                        this.next = this.codaPoint;
                        this.daCodaFlagged = false;
                        this.resetPass();
                    }
                } else if(this.daCodaFlagged) {
                    this.lookingForCoda = true;
                    this.skipping = true;
                }
                break;
            case "dsalcoda": 
                if( this.segnoPoint ){
                    if(!this.daSegnoFlagged){
                        this.next = this.segnoPoint;
                        this.daSegnoFlagged = true;
                        this.daCodaFlagged = true;
                        this.resetPass();

                    }
                } else {
                    this.addWarning( 'Ignorando "D.S. al coda"!');
                }
                break;
            case "dcalcoda": 
                if(!this.daCapoFlagged) {
                    this.next = this.capo;
                    this.daCapoFlagged = true;
                    this.daCodaFlagged = true;
                    this.resetPass();
                } 
                break;
        }
    }
    return true;
};

ABCXJS.midi.Parse.prototype.getParsedElement = function(time) {
    if( ! this.parsedElements[time] ) {
        this.parsedElements[time] = {
            start:{pitches:[], abcelems:[], buttons:[], barNumber: null}
            ,end:{pitches:[], abcelems:[]}
        };
    }
    return this.parsedElements[time];
};

ABCXJS.midi.Parse.prototype.addStart = function( time, midipitch, abcelem, button ) {
    var delay = (time%1.0);
    time -= delay;
    
    var pE = this.getParsedElement(time);
    
    if( abcelem ) {
        pE.start.abcelems.push({abcelem:abcelem,channel:this.channel, delay:delay});
        
        // a ideia é: a primeira voz que chegar com o barNumber 1, será a única considera para numerar os compassos
        // assim depois que a var addingBarNumbers for inicializada, somente nrs. de compasso restantes daquela voz serão incluidos
        if( this.addBarNumber && ( ( this.addBarNumber === 1 && this.addingBarNumbers < 0 ) || this.addingBarNumbers === ((this.staff+1)*10 + this.voice ) ) ) {
            pE.start.barNumber = this.addBarNumber;
            this.addingBarNumbers = ((this.staff+1)*10 + this.voice );
            delete this.addBarNumber;
        }
    }    
    if( midipitch ) {
        midipitch.clef = this.getStaff().clef.type;
        pE.start.pitches.push( {midipitch: midipitch, delay:delay} );
    }
    if( button ) {
        pE.start.buttons.push({button:button, abcelem:abcelem, delay:delay});
    }
};

ABCXJS.midi.Parse.prototype.addEnd = function( time, midipitch, abcelem/*, button*/ ) {
    var delay = (time%1);
    time -= delay;
    var pE = this.getParsedElement(time);
    if( abcelem   ) pE.end.abcelems.push({abcelem:abcelem, delay:delay});
    if( midipitch ) pE.end.pitches.push({midipitch: midipitch, delay:delay});
};

ABCXJS.midi.Parse.prototype.getMark = function() {
    return {line: this.line, staff: this.staff,
        voice: this.voice, pos: this.pos};
};

ABCXJS.midi.Parse.prototype.getMarkString = function(mark) {
    mark = mark || this;
    return "line" + mark.line + "staff" + mark.staff +
           "voice" + mark.voice + "pos" + mark.pos;
};

ABCXJS.midi.Parse.prototype.getMarkValue = function(mark) {
    mark = mark || this;
    return (mark.line+1) *1e6 + mark.staff *1e4 + mark.voice *1e2 + mark.pos;
};

ABCXJS.midi.Parse.prototype.setPass = function(mark) {
    var compasso = this.getMarkValue(mark);
    //registra e retorna o número de vezes que já passou por compasso.
    //a cada (salto D.C., D.S., dacoda) deve-se zerar a contagem
    if( this.pass[compasso]){
        this.pass[compasso] = this.pass[compasso]+1;
    } else {
        this.pass[compasso] = 1;
    }
    return this.pass[compasso];
};

ABCXJS.midi.Parse.prototype.resetPass = function() {
    //limpa contadores de passagem, mas caso em ending, preserva a contagem de passagem dos compassos debaixo do ending corrente  
    this.pass = [];
    var self = this;
    if( this.currEnding ) {
        this.currEnding.measuresInEnding.forEach( function( item, index ) {
            self.setPass(item);
        });
    }
    //this.currEnding && this.setPass(); 
};

ABCXJS.midi.Parse.prototype.hasTablature = function() {
    return this.abctune.hasTablature;
};

ABCXJS.midi.Parse.prototype.getLine = function() {
    return this.abctune.lines[this.line];
};

ABCXJS.midi.Parse.prototype.getStaff = function() {
    var l = this.getLine();
    if ( !l.staffs ) return undefined;
    return l.staffs[this.staff];
};

ABCXJS.midi.Parse.prototype.getVoice = function() {
    return this.getStaff().voices[this.voice];
};

ABCXJS.midi.Parse.prototype.getElem = function() {
    return this.getVoice()[this.pos];
};

ABCXJS.midi.Parse.prototype.startTrack = function() {
    this.channel ++;
    this.timecount = 0;
    this.playlistpos = 0;
    this.maxPass = 2;
    this.countBar = 0;
    
    this.next = null;
    
    this.pass = [];
    
    this.endTrack = false;    
    
    //delete this.nextBarJump;
    delete this.codaFlagged;
    delete this.fineFlagged;
    delete this.daSegnoFlagged;
    delete this.daCapoFlagged;
    delete this.capo;
    delete this.daCodaFlagged;
    delete this.lookingForCoda;
    delete this.segnoPoint;
    delete this.codaPoint;
};

ABCXJS.midi.Parse.prototype.getAccOffset = function(txtAcc) {
// a partir do nome do acidente, retorna o offset no modelo cromatico
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

ABCXJS.midi.Parse.prototype.setKeySignature = function(elem) {
    this.accidentals = [0, 0, 0, 0, 0, 0, 0];
    if (this.abctune.formatting.bagpipes) {
        elem.accidentals = [{acc: 'natural', note: 'g'}, {acc: 'sharp', note: 'f'}, {acc: 'sharp', note: 'c'}];
    }
    if (!elem.accidentals)  return;
    
    window.ABCXJS.parse.each(elem.accidentals, function(acc) {
        var d = (acc.acc === "sharp") ? 1 : (acc.acc === "natural") ? 0 : -1;
        var lowercase = acc.note.toLowerCase();
        var note = this.extractNote(lowercase.charCodeAt(0) - 'c'.charCodeAt(0));
        this.accidentals[note] += d;
    }, this);

};

ABCXJS.midi.Parse.prototype.extractNote = function(pitch) {
    pitch = pitch % 7;
    return (pitch < 0)? pitch+7 : pitch;
};

ABCXJS.midi.Parse.prototype.extractOctave = function(pitch) {
    return Math.floor(pitch / 7);
};

ABCXJS.midi.Parse.prototype.setSelection = function(tabElem) {
    
    if(! tabElem.bellows) return;
    
    for( var p=0; p < tabElem.pitches.length; p ++ ) {
        
        var pitch = tabElem.pitches[p];
        
        if( pitch.type === 'rest' ) continue;
        
        var button;
        var tabButton = pitch.c === 'scripts.rarrow'? pitch.lastButton : pitch.c;
        
        
        //quando o baixo não está "in Tie", label do botão é uma letra (G, g, etc)
        //de outra forma o label é número do botão (1, 1', 1'', etc)
        if(pitch.bass && pitch.c !== 'scripts.rarrow')
            // quando label é uma letra
            button = this.getBassButton(tabElem.bellows, tabButton, pitch.variant);
        else
            // quando label é número do botão
            button = this.getButton(tabButton);
        
        if(button) {
            if(tabElem.bellows === '-') {
                button.setOpen();
            } else {
                button.setClose();
            }
        }
    }
};

ABCXJS.midi.Parse.prototype.getBassButton = function( bellows, b, variant ) {
    if( b === 'x' ||  !this.midiTune.keyboard ) return null;
    var kb = this.midiTune.keyboard;
    
    var nota = kb.parseNote(b, true ); 

    // flavio melhorar
    // quando se faz busca os botoes de baixo, após inferir a tablatura, o campo variant vem undefined.
    // corrigi aqui, tratando o tipo, mas o ideal era garantir que já viesse com este campo preenchido
    //a exemplo do que acontece quando a tablatura já existe e se faz apenas o parse
    nota.variant = variant === undefined? 0 : variant;  
    
    for( var j = kb.keyMap.length; j > kb.basses.close.length; j-- ) {
      for( var i = 0; i < kb.keyMap[j-1].length; i++ ) {
          var tecla = kb.keyMap[j-1][i];
          if(bellows === '+') {
            if(tecla.closeNote.key === nota.key && nota.isMinor === tecla.closeNote.isMinor && nota.isSetima === tecla.closeNote.isSetima && nota.variant === tecla.closeNote.variant ) return tecla;
          } else {  
            if(tecla.openNote.key === nota.key && nota.isMinor === tecla.openNote.isMinor && nota.isSetima === tecla.openNote.isSetima && nota.variant === tecla.openNote.variant ) return tecla;
          }
      }   
    }
    return null;
};

ABCXJS.midi.Parse.prototype.getButton = function( b ) {
    if( b === 'x' || !this.midiTune.keyboard ) return null;
    var kb = this.midiTune.keyboard;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var button = b.substr(0, p) -1;
    var row = b.length - p;
    if(kb.keyMap[row][button]) 
        return kb.keyMap[row][button];
    return null;
};
