/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

ABCXJS.midi.Player = function( options ) {
    
    this.reset(options);
   
    this.playableClefs = "TB"; // indica que baixo (B) e melodia (T) serao executadas.
    this.ticksPerInterval = 1;
    
    this.callbackOnStart = null;
    this.callbackOnEnd = null;
    this.callbackOnPlay = null;
    this.callbackOnScroll = null;
    this.callbackOnChangeBar = null;
    
};

ABCXJS.midi.Player.prototype.setPlayableClefs = function(letters) {
    this.playableClefs = letters;
};

ABCXJS.midi.Player.prototype.playClef = function(letter) {
    return this.playableClefs.indexOf( letter.toUpperCase() )>=0;
};

ABCXJS.midi.Player.prototype.reset = function(options) {
    
    options = options || {};
    
    this.i = 0;
    this.tempo = 250;
    this.playing = false;
    this.playlist = [];
    this.playInterval = null;
    this.currentAndamento = 1;
    
    this.onError = null;
    this.warnings = [];
    
    this.printer = {};
    this.currentTime = 0;
    this.currentMeasure = 1;
    
    this.currAbsElem = null;   
};

ABCXJS.midi.Player.prototype.addWarning = function(str) {
    this.warnings.push(str);
};

ABCXJS.midi.Player.prototype.getWarnings = function() {
    return this.warnings.length>0?this.warnings:null;    
};

ABCXJS.midi.Player.prototype.defineCallbackOnStart = function( cb ) {
    this.callbackOnStart = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnEnd = function( cb ) {
    this.callbackOnEnd = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnPlay = function( cb ) {
    this.callbackOnPlay = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnScroll = function( cb ) {
    this.callbackOnScroll = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnChangeBar = function( cb ) {
    this.callbackOnChangeBar = cb;
};

ABCXJS.midi.Player.prototype.setAndamento = function(value) {
    var that = this;
    // aceita valores entre 10% e 200% do valor original
    if(value < 10 ) value = 10;
    if(value > 200 ) value = 200;
    
    if( this.playing ) {
        // newAndamento funciona como um flag para a rotina que 
        this.newAndamento = value/100.0; 
    } else {
        try{
            that.currentAndamento = value/100.0; 
            that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
        } catch(e){
        };
    }
};

ABCXJS.midi.Player.prototype.stopPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.pausePlay();
    if( this.callbackOnEnd ) this.callbackOnEnd(this);
    return this.getWarnings();
};

ABCXJS.midi.Player.prototype.pausePlay = function(nonStop) {
    if(!(false||nonStop)) MIDI.stopAllNotes();
    window.clearInterval(this.playInterval);
    this.playing = false;
};

ABCXJS.midi.Player.prototype.doResume = function(nonStop) {
    MIDI.stopAllNotes();
    // to be compliant with autoplay-policy-changes #webaudio
    MIDI.resume();
    // não pergunte pq: no IOS tenho que tocar uma nota para garantir que não começe com pausa.
    var lowestNote = 20;
    MIDI.noteOn(0, lowestNote, 1, 0);
    MIDI.noteOff(0, lowestNote, 0.01);
    MIDI.noteOn(1, lowestNote, 1, 0);
    MIDI.noteOff(1, lowestNote, 0.01);
    MIDI.noteOn(2, lowestNote, 1, 0);
    MIDI.noteOff(2, lowestNote, 0.01);
};

ABCXJS.midi.Player.prototype.startPlay = function(what) {

    if(this.playing || !what ) return false;
    
    if(this.currentTime === 0 ) {
        this.doResume();
    }
     
    this.playlist = what.playlist;
    this.tempo    = what.tempo;
    this.printer  = what.printer;
    this.type     = null; // definido somente para o modo didatico

    this.playing = true;
    this.onError = null;
  
    var self = this;
    
    //this.doPlay();
    this.playInterval = window.setInterval(function() { self.doPlay(); }, this.tempo);
    
    return true;
};

ABCXJS.midi.Player.prototype.clearDidacticPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.currentMeasure = 1;
    this.pausePlay(true);
};

ABCXJS.midi.Player.prototype.startDidacticPlay = function(what, type, value, valueF ) {

    if(this.playing) return false;

    if(this.currentTime === 0 ) {
        this.doResume();
    }
     
    this.playlist = what.playlist;
    this.tempo    = what.tempo;
    this.printer  = what.printer;
    this.measures = what.measures;
    this.type     = type;
    
    this.playing  = true;
    this.onError  = null;
    
    var criteria = null;
    var that = this;
    
    switch( type ) {
        case 'note': // step-by-step
            what.printer.clearSelection();
            what.keyboard.clear(true);
            if(!that.playlist[that.i]) return false;
            that.initTime = that.playlist[that.i].time;
            criteria = function () { 
                return that.initTime === that.playlist[that.i].time;
            };
            break;
        case 'goto':   //goto-measure or goto-interval
        case 'repeat': // repeat-measure or repeat-interval
            that.currentMeasure = parseInt(value)? parseInt(value): that.currentMeasure;
            that.endMeasure = parseInt(valueF)? parseInt(valueF): that.currentMeasure;
            that.initMeasure = that.currentMeasure;
            if(that.measures[that.currentMeasure] !== undefined ) {
                //flavio - era assim that.i = that.currentMeasure === 1 ? 0 : that.measures[that.currentMeasure];
                that.i = that.measures[that.currentMeasure];
                that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
                criteria = function () { 
                    return (that.initMeasure <= that.currentMeasure) && (that.currentMeasure <= that.endMeasure);
                };
            } else {
               waterbug.log('goto-measure or repeat-measure:  measure \''+value+'\' not found!');
               this.pausePlay(true);
               return;
            }   
            break;
        case 'measure': // play-measure
            that.currentMeasure = parseInt(value)? parseInt(value): that.currentMeasure;
            that.initMeasure = that.currentMeasure;
            if(that.measures[that.currentMeasure] !== undefined ) {
                //flavio - era assim that.i = that.currentMeasure === 1 ? 0 : that.measures[that.currentMeasure];
                that.i = that.measures[that.currentMeasure];
                that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
                criteria = function () { 
                    return that.initMeasure === that.currentMeasure;
                };
            } else {
               waterbug.log('play-measure: measure \''+value+'\' not found!');
               this.pausePlay(true);
               return false;
            }   
            break;
    }
  
    this.playInterval = window.setInterval(function() { that.doDidacticPlay(criteria); }, this.tempo);
    return true;
};

ABCXJS.midi.Player.prototype.handleBar = function() {
    if(this.playlist[this.i] && this.playlist[this.i].barNumber) {
        this.currentMeasure = this.playlist[this.i].barNumber;
        if( this.callbackOnChangeBar ) {
            this.callbackOnChangeBar(this);
        }
    }    
};

ABCXJS.midi.Player.prototype.doPlay = function() {
    
    if( this.callbackOnPlay ) {
        this.callbackOnPlay(this);
    }
    
    while (!this.onError && this.playlist[this.i] &&
           (this.playlist[this.i].time*(1/this.currentAndamento)) <= this.currentTime) {
        this.executa(this.playlist[this.i]);
        this.i++;
        this.handleBar();
    }
    if (!this.onError && this.playlist[this.i]) {
        this.currentTime += this.ticksPerInterval;
    } else {
        this.stopPlay();
    }
};

ABCXJS.midi.Player.prototype.doDidacticPlay = function(criteria) {
    var that = this;
    
    if( this.callbackOnPlay ) {
        this.callbackOnPlay(this);
    }

    while (!this.onError && this.playlist[this.i] && criteria() &&
    (this.playlist[this.i].time*(1/this.currentAndamento)) < this.currentTime ) {
        this.executa(this.playlist[this.i]);
        this.i++;
        this.handleBar();

        if( this.type == 'repeat' ) { // loop until external event
            if(!this.onError && !( this.playlist[this.i] && criteria() ) ) {
                this.currentMeasure = this.initMeasure;
                this.i = this.measures[this.currentMeasure];
                this.currentTime = this.playlist[this.i].time*(1/this.currentAndamento);
                this.currentTime += this.ticksPerInterval;
            }
        }
    }

    if(this.onError) {
        this.stopPlay();
    } else if( this.playlist[this.i] && criteria() ) {
        this.currentTime += this.ticksPerInterval;
    } else {
        this.pausePlay(true);
    }
};

ABCXJS.midi.Player.prototype.executa = function(pl) {
    
    var self = this;
    var loudness = 128;
    var delay = 0;
    var aqui;

    try {
        
        if( this.newAndamento ) {
            try{
                this.currentAndamento = this.newAndamento; 
                this.currentTime = this.playlist[this.i].time*(1/this.currentAndamento);
                delete this.newAndamento;
            } catch(e){
            };
        }
        
        if( pl.start ) {
            
            pl.item.pitches.forEach( function( elem ) {
                
                delay = self.calcTempo( elem.delay );
                
                if(  self.playClef( elem.midipitch.clef.charAt(0) ) ) {
                    MIDI.noteOn(elem.midipitch.channel, elem.midipitch.midipitch, loudness, delay);
                    var k = 2.38, t = k, resto = self.calcTempo( elem.midipitch.mididuration ) - k;

                    // a nota midi dura k segundos (k), então notas mais longas são reiniciadas quantas vezes forem necessárias
                    while( resto > 0 ) {
                        MIDI.noteOff(elem.midipitch.channel, elem.midipitch.midipitch,  t+delay);
                        MIDI.noteOn(elem.midipitch.channel, elem.midipitch.midipitch, loudness, t+delay);
                        t += k;
                        resto -= k;
                    }
                }
                
                if( !debug && elem.button && elem.button.button && elem.button.button.SVG && elem.button.button.SVG.button !==null) {
                    aqui=1;

                    if(elem.button.closing) {
                        elem.button.button.setClose(delay);
                    }else{
                        elem.button.button.setOpen(delay);
                    }
                    aqui=2;
                    if( self.type !== 'note' ) {
                        
                        var andamento = (1/self.currentAndamento);
                        //limpa o botão uma fração de tempo antes do fim da nota para dar ideia visual de botão pressionado/liberado antes da proxima nota
                        var delta = Math.max(elem.midipitch.mididuration * 0.1, 0.5);
                        
                        elem.button.button.clear( self.calcTempo( (elem.midipitch.mididuration-delta)*andamento ) + delay );
                    }    
                    aqui=3;
               }
                
            });
            
            var ja = '.'; // controla quais elementos absolutos foram marcados para highlight no mesmo item da playlist - evita dupla seleção do mesmo item
            pl.item.abcelems.forEach( function( elem ) {
                delay = self.calcTempo( elem.delay );
                aqui=4;
                self.currAbsElem = elem.abcelem.parent;
                if( self.callbackOnScroll ) {
                    self.callbackOnScroll(self);
                }
                aqui=5;
                if( ja.indexOf('.'+self.currAbsElem.gid+'.') < 0 ) {
                    // absElem ainda não sofreu highlight
                    ja += self.currAbsElem.gid+'.';
                    self.highlight(self.currAbsElem , true, delay);
                }
            });
            
        } else {
            pl.item.pitches.forEach( function( elem ) {
                delay = self.calcTempo( elem.delay );
                MIDI.noteOff(elem.midipitch.channel, elem.midipitch.midipitch, delay);
            });
            var ja = '.'; // controla quais elementos absolutos foram marcados para unhighlight no mesmo item da playlist - evita dupla seleção do mesmo item
            pl.item.abcelems.forEach( function( elem ) {
                delay = self.calcTempo( elem.delay );
                if( ja.indexOf('.'+elem.abcelem.parent+'.') < 0 ) {
                    // absElem ainda não sofreu unhighlight
                    ja += elem.abcelem.parent.gid+'.';
                    self.highlight(elem.abcelem.parent, false, delay);
                }
            });
        }
    } catch( err ) {
        this.onError = { erro: err.message, idx: this.i, item: pl };
        this.addWarning( 'PlayList['+this.onError.idx+'] - Erro: ' + this.onError.erro + '. DebugPoint: ' + aqui );
    }
};

ABCXJS.midi.Player.prototype.calcTempo = function( val ) {
  return  val * this.tempo / 1000;   
};

ABCXJS.midi.Player.prototype.highlight = function( abselem, select, delay ) {
    if(debug || !this.printer ) return;
    var that = this;
    
    if(delay) {
        window.setTimeout(function(){ that.highlight(abselem, select); }, delay*1000);
        return;
    }   
    
    if(select) {
       that.printer.notifySelect(abselem);
    } else {
       that.printer.notifyClear(abselem);
    }
};


ABCXJS.midi.Player.prototype.getTime = function() {
    var pad =  function(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };
    
    var time = 0;
    
    if( this.playlist && this.playlist[this.i] ) {
        time = this.playlist[this.i].time*this.tempo*(1/this.currentAndamento);
    } else {
        this.addWarning( 'PlayList['+this.i+'] não existe. DebugPoint: midi.Player.getTime' );
    }
    
    var secs  = Math.floor(time/1000);
    var cs    = Math.floor((time - secs*1000)/10);
    var mins  = Math.floor(secs/60);
    var secs  = secs - mins*60;
    var cTimeMiS  = pad(mins,2) + ':' + pad(secs,2) ;
    var cTimeMiScs  = pad(mins,2) + ':' + pad(secs,2) + '.' + pad(cs,2);
    return { cTime: cTimeMiS, cTimeMiScs: cTimeMiScs, time: time };
};

