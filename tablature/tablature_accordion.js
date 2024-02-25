/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.tablature)
	window.ABCXJS.tablature = {};

ABCXJS.tablature.Accordion = function( params, pautaNumerica, pautaNumericaMini, rowsNumbered ) {
    
    this.loaded        = undefined;
    this.tabLines      = [];
    this.accordions    = params.accordionMaps || [] ;
    this.translator    = params.translator || null;
    this.transposer    = new window.ABCXJS.parse.Transposer();
    this.rowsNumbered  = rowsNumbered || false;
    this.pautaNumerica = pautaNumerica || 0;
    this.pautaNumericaMini = pautaNumericaMini || (pautaNumericaMini===undefined);
    
    if( this.accordions.length === 0 ) {
        throw new Error( 'No accordionMap found!');
    }
    
    this.render_opts = {};
    this.setRenderOptions( params.render_keyboard_opts, true );

    if( params.id )
        this.loadById( params.id );
    else
        this.load( 0 );
    
};

ABCXJS.tablature.Accordion.prototype.setRenderOptions = function ( options, initial ) {
    
    var opt = options || {};

    this.render_opts.transpose = (typeof opt.transpose === 'undefined'? (initial? false : this.render_opts.transpose ): opt.transpose) ;
    this.render_opts.mirror = (typeof opt.mirror === 'undefined'? (initial? false : this.render_opts.mirror ): opt.mirror) ;
    this.render_opts.draggable = (typeof opt.draggable === 'undefined'? (initial? false : this.render_opts.draggable ): opt.draggable) ;
    this.render_opts.show = (typeof opt.show === 'undefined'? (initial? false : this.render_opts.show ): opt.show) ;
    this.render_opts.label = (typeof opt.label === 'undefined'? (initial? false : this.render_opts.label ): opt.label) ;
    
    this.render_opts.scale = (typeof opt.scale === 'undefined'? (initial? 1 : this.render_opts.scale ): opt.scale) ;
    
    if( ! initial ) {
        DIATONIC.map.color.fill = (typeof opt.fillColor === 'undefined'? DIATONIC.map.color.fill : opt.fillColor) ;
        DIATONIC.map.color.background = (typeof opt.backgroundColor === 'undefined'? DIATONIC.map.color.background : opt.backgroundColor) ;
        DIATONIC.map.color.open = (typeof opt.openColor === 'undefined'? DIATONIC.map.color.open : opt.openColor) ;
        DIATONIC.map.color.close = (typeof opt.closeColor === 'undefined'? DIATONIC.map.color.close : opt.closeColor) ;
    }    
};


ABCXJS.tablature.Accordion.prototype.loadById = function (id) {
    for (var g = 0; g < this.accordions.length; g ++)
        if (this.accordions[g].id === id) {
            return this.load(g);
        }
        waterbug.log( 'Accordion not found. Loading the first one.');
        return this.load(0);
};

ABCXJS.tablature.Accordion.prototype.load = function (sel) {
    this.loaded = this.accordions[sel];
    this.loadedKeyboard = this.loaded.keyboard;
    this.loadedKeyboard.setFormatoTab(this.pautaNumerica,this.pautaNumericaMini, this.rowsNumbered)

    return this.loaded;
};

ABCXJS.tablature.Accordion.prototype.accordionExists = function(id) {
    var ret = false;
    for(var a = 0; a < this.accordions.length; a++ ) {
        if( this.accordions[a].id === id) ret  = true;
    }
    return ret;
};

ABCXJS.tablature.Accordion.prototype.accordionIsCurrent = function(id) {
    return (this.accordions.loaded && this.accordions.loaded.id === id);
};

ABCXJS.tablature.Accordion.prototype.clearKeyboard = function(full) {
    this.loadedKeyboard.clear(full);
};

ABCXJS.tablature.Accordion.prototype.changeNotation = function() {
    this.render_opts.label = ! this.render_opts.label;
    this.loadedKeyboard.redraw(this.render_opts);
};

ABCXJS.tablature.Accordion.prototype.rotateKeyboard = function(div_id) {
    var o = this.render_opts;
    
    if( o.transpose ) {
        o.mirror=!o.mirror;
    }
    
    o.transpose=!o.transpose;
    
    this.printKeyboard(div_id);
};

ABCXJS.tablature.Accordion.prototype.scaleKeyboard = function(div_id) {
    if( this.render_opts.scale < 1.2 ) {
        this.render_opts.scale += 0.2;
    } else {
        this.render_opts.scale = 0.8;
    }
    this.printKeyboard(div_id);
};

ABCXJS.tablature.Accordion.prototype.printKeyboard = function(div_id, options) {
    
    this.setRenderOptions( options );
    
    var div =( typeof(div_id) === "string" ? document.getElementById(div_id) : div_id );

    if( this.render_opts.show ) {
        div.style.display="inline-block";
        this.loadedKeyboard.print(div,this);
    } else {
        div.style.display="none";
    }
};

ABCXJS.tablature.Accordion.prototype.getFormatoTab = function () {
    return this.pautaNumerica;
};

ABCXJS.tablature.Accordion.prototype.setFormatoTab = function (val, mini, rowsNumbered) {
    this.pautaNumerica = val;
    this.pautaNumericaMini = mini;
    this.rowsNumbered = rowsNumbered;
    this.loadedKeyboard.setFormatoTab(this.pautaNumerica, mini, this.rowsNumbered);
};

ABCXJS.tablature.Accordion.prototype.getId = function () {
    return this.loaded.getId();
}
ABCXJS.tablature.Accordion.prototype.getFullName = function () {
    return this.loaded.getFullName();
};

ABCXJS.tablature.Accordion.prototype.getTxtModel = function () {
    return this.loaded.getTxtModel();
};

ABCXJS.tablature.Accordion.prototype.getTxtNumButtons = function () {
    return this.loaded.getTxtNumButtons();
};

ABCXJS.tablature.Accordion.prototype.getTxtTuning = function () {
    return this.loaded.getTxtTuning();
};

ABCXJS.tablature.Accordion.prototype.getNoteName = function( item, keyAcc, barAcc, bass ) {
    
    // mapeia 
    //  de: nota da pauta + acidentes (tanto da clave, quanto locais)
    //  para: valor da nota cromatica (com oitava)

    var n = this.transposer.staffNoteToCromatic(this.transposer.extractStaffNote(item.pitch));
    var oitava = this.transposer.extractStaffOctave(item.pitch);
    var staffNote = this.transposer.numberToKey(n);
    
    if(item.accidental) {
        barAcc[item.pitch] = this.transposer.getAccOffset(item.accidental);
        n += barAcc[item.pitch];
    } else {
        if(typeof(barAcc[item.pitch]) !== "undefined") {
          n += barAcc[item.pitch];
        } else {
          n += this.transposer.getKeyAccOffset(staffNote, keyAcc);
        }
    }
    
    oitava   += (n < 0 ? -1 : (n > 11 ? 1 : 0 ));
    n         = (n < 0 ? 12+n : (n > 11 ? n%12 : n ) );
    
    var key   = this.transposer.numberToKey(n);
    var value = n;
    
    if (item.chord) key = key.toLowerCase();    
    
    return { key: key, octave:oitava, isBass:bass, isChord: item.chord, isMinor: item.minor, value:value };
};

ABCXJS.tablature.Accordion.prototype.inferTablature = function(tune, vars, addWarning ) {

    var inferer = new ABCXJS.tablature.Infer( this, tune, vars );
    
    vars.missingButtons = {};
    vars.invalidBasses = '';
    
    for (var t = 0; t < tune.lines.length; t++) {
       if (tune.lines[t].staffs ) {
          var voice = inferer.inferTabVoice( t );
          if (voice.length > 0) {
              tune.lines[t].staffs[tune.tabStaffPos].voices[0] = voice;
          }
       }  
    }
    
    if(vars.invalidBasses.length > 0){
        addWarning('Baixo incompatível com o movimento do fole no(s) compasso(s): ' + vars.invalidBasses.substring(1,vars.invalidBasses.length-1) + '.' ) ;
    }
    
    if(vars.missingButtons){
        for( var m in vars.missingButtons ) {
            addWarning('Nota "' + m + '" não disponível no(s) compasso(s): ' + vars.missingButtons[m].join(", ") + '.' ) ;
        }
    }
    
    delete vars.missingButtons;
    delete vars.invalidBasses;
   
    
};

ABCXJS.tablature.Accordion.prototype.parseTabVoice = function(str, vars ) {
    var p = new ABCXJS.tablature.Parse( this,  str, vars);
    return p.parseTabVoice();
};

ABCXJS.tablature.Accordion.prototype.setTabLine = function (line) {
    this.tabLines[this.tabLines.length] = line.trim();
};

ABCXJS.tablature.Accordion.prototype.getTabLines = function () {
    var ret = "";
    if(this.tabLines.length === 0) return ret;
    for(var l = 0; l < this.tabLines.length; l ++ ) {
        if(this.tabLines[l].length>0){
            ret += this.tabLines[l]+"\n";
        }
    }
    this.tabLines = [];
    return ret;
};
