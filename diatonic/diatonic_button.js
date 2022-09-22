/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.Button = function( kb, x, y, options ) {

    var opt = options || {};
    
    this.kb = kb;
    this.x = x;
    this.y = y;
    
    this.openNote = null;
    this.closeNote = null;
    this.tabButton = null;
    
    this.SVG  = {gid: 0}; // futuro identificador
    
    this.radius = opt.radius;
    this.isPedal  = opt.isPedal || false;
    this.borderWidth = opt.borderWidth || (this.isPedal?2:1);
    this.borderColor = opt.borderColor || (this.isPedal?'red':'black');

};

DIATONIC.map.Button.prototype.draw = function( id, printer, limits, options ) {
    
    var currX, currY;

    if( options.transpose ) {
        //horizontal
        currX = this.y;
        currY = options.mirror ? this.x : limits.maxX - this.radius*2 - (this.x - limits.minX);
    } else {
        //vertical
        currX = options.mirror ? limits.maxX - this.radius*2 - (this.x - limits.minX): this.x;
        currY = this.y;
    }
    
    options = options || {};
    options.radius = this.radius;
    options.borderColor = this.borderColor;
    options.borderWidth = this.borderWidth;
    options.fillColor = (options.kls && options.kls === 'blegenda'? 'none' : DIATONIC.map.color.fill );
    options.openColor = (options.kls && options.kls === 'blegenda'? DIATONIC.map.color.open : 'none' );
    options.closeColor = (options.kls && options.kls === 'blegenda'? DIATONIC.map.color.close : 'none' );
    
    if(this.closeNote && this.closeNote.isBass)
        options.pautaNumerica = false;

    this.isNumerica = options.pautaNumerica; 

    this.SVG.gid = printer.printButton( id, currX, currY, options );

};

DIATONIC.map.Button.prototype.clear = function(delay) {
    if(!this.SVG.button ) return;
    var that = this;
    if(delay) {
        window.setTimeout(function(){ that.clear(); }, delay*1000);
        return;
    }    
    this.SVG.closeArc.style.setProperty( 'fill', 'none' );
    this.SVG.openArc.style.setProperty( 'fill', 'none' );
};

DIATONIC.map.Button.prototype.setOpen = function(delay) {
    if(!this.SVG.button ) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.setOpen();}, delay*1000 );
        return;
    } 
    this.SVG.openArc.style.setProperty( 'fill', DIATONIC.map.color.open );
};

DIATONIC.map.Button.prototype.setClose = function(delay) {
    if(!this.SVG.button ) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.setClose();}, delay*1000);
        return;
    } 
    this.SVG.closeArc.style.setProperty( 'fill', DIATONIC.map.color.close );
};

DIATONIC.map.Button.prototype.setSVG = function( showLabel, opts ) {
    var b = this.SVG;
    var n = 0;
    var pull = opts.pull || null;
    var push = opts.push || null;
    var translator = opts.translator || null ;
    var formato = opts.formatoNumerico || null;
    var isMini = opts.mini;

    this.SVG.button = document.getElementById(b.gid);
    this.SVG.openArc = document.getElementById(b.gid + '_ao');
    this.SVG.closeArc = document.getElementById(b.gid + '_ac');
    this.SVG.openText = document.getElementById(b.gid+'_to');
    this.SVG.closeText = document.getElementById(b.gid+'_tc');
    this.SVG.numericText = document.getElementById(b.gid + '_tn');
    this.SVG.numericTextMini = document.getElementById(b.gid + '_tm');

    if( this.isNumerica ){
        if (formato.overrides[this.tabButton]) {
            n = formato.overrides[this.tabButton];
        } else {
            var i = parseInt(this.tabButton);
            var j = (this.tabButton.match(/'/g) || []).length
            n = i + formato.rule[j];
        }
        if (isMini)
            this.SVG.numericTextMini.textContent = n;
        else
            this.SVG.numericText.textContent = n;
    }

    if ( !this.isNumerica || isMini ) {
        if( translator ) {
            this.SVG.openText.setAttribute( 'data-translate', pull );
            this.SVG.closeText.setAttribute( 'data-translate', push );
            this.setText(showLabel, translator.getResource(pull), translator.getResource(push) ); 
        } else {
            this.setText(showLabel, pull, push ); 
        }
    }
}

DIATONIC.map.Button.prototype.setText = function( showLabel, open, close ) {
    if(this.SVG.openText) {
        this.SVG.openText.textContent = open ? open : this.getLabel( this.openNote, showLabel );
        this.SVG.closeText.textContent = close ? close : this.getLabel( this.closeNote, showLabel );
    }    
};

DIATONIC.map.Button.prototype.getLabel = function(nota, showLabel) {
    var l = nota.key;
    
    if (showLabel) {
        l = l.toUpperCase() + '';
        l = ABCXJS.parse.key2br[l].toUpperCase();
    }
    
    if ( nota.isChord ) {
       l = l.toLowerCase() + '';
    }    
    
    if( nota.isMinor ) {
        l+='-';
    }
    return l;
};

