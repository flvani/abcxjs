//    abc_write.js: Prints an abc file parsed by abc_parse.js
//    Copyright (C) 2010 Gregory Dyke (gregdyke at gmail dot com)
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


/*global window, ABCXJS, Math */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.write)
	window.ABCXJS.write = {};

ABCXJS.write.spacing = {};
ABCXJS.write.spacing.FONTEM = 360;
ABCXJS.write.spacing.FONTSIZE = 30;
ABCXJS.write.spacing.STEP = ABCXJS.write.spacing.FONTSIZE*(93)/720;
ABCXJS.write.spacing.SPACEX = 30;
ABCXJS.write.spacing.TOPNOTE = 10; 

ABCXJS.write.color = {};
ABCXJS.write.color.highLight = "#5151ff";
ABCXJS.write.color.highLight = "#ff0000";
ABCXJS.write.color.unhighLight = 'black';
ABCXJS.write.color.useTransparency = true;

//--------------------------------------------------------------------PRINTER

ABCXJS.write.Printer = function (paper, params, loadedKeyboard) {

    params = params || {};
    this.y = 0;
    this.pageNumber = 1;
    this.estimatedPageLength = 0;
    this.paper = paper;
    this.glyphs = new ABCXJS.write.Glyphs();
    this.listeners = [];
    this.selected = [];
    this.scale = params.scale || 1;
    this.paddingtop = params.paddingtop || 15;
    this.paddingbottom = params.paddingbottom || 15;
    this.paddingleft = params.paddingleft || 15;
    this.paddingright = params.paddingright || 30;
    this.editable = params.editable || false;
    this.loadedKeyboard = loadedKeyboard || null; // preciso disso para gerar a pauta númerica (se houver)
    this.staffgroups = [];
};

ABCXJS.write.Printer.prototype.printABC = function (abctunes, options) {
    if (abctunes[0] === undefined) {
        abctunes = [abctunes];
    }
    this.y = 0;
    this.totalY = 0; // screen position of an element

    for (var i = 0; i < abctunes.length; i++) {
        this.printTune(abctunes[i], options);
    }

};

ABCXJS.write.Printer.prototype.printTune = function(abctune, options) {
    
    if( abctune.lines.length === 0 ) return;

    this.currentTune = abctune; // substituir toda ocorrencia de abctune por this.currentTune
    
    options = options || {};
    options.color = options.color ||'black';
    options.backgroundColor = options.backgroundColor ||'none';
    
    ABCXJS.write.color.unhighLight = options.color;
    
    var estilo = 
'\n\
   .abc_link { font-weight: normal;  text-decoration: none; }\n\
   .abc_link:hover { stroke: blue;  font-weight: normal;  text-decoration: none; }\n\
   .abc_title {\n\
        font-size: 18px;\n\
        font-weight: bold;\n\
        font-family: Merienda, serif;\n\
    }\n\
    \n\
    .abc_subtitle {\n\
        font-size: 16px;\n\
        font-family: Merienda, serif;\n\
        font-style: italic;\n\
    }\n\
    \n\
    .abc_author {\n\
        font-size: 14px;\n\
        font-family: Merienda, serif;\n\
        font-style: italic;\n\
        font-weight: bold;\n\
    }\n\
    \n\
    .abc_rhythm {\n\
        font-size: 12px;\n\
        font-family: Merienda, serif;\n\
        font-style: italic;\n\
    }\n\
    \n\
    .abc_voice_header {\n\
        font-size: 12px;\n\
        font-family: Merienda, serif;\n\
        font-style: italic;\n\
        font-weight: bold;\n\
    }\n\
    \n\
    .abc_tempo {\n\
        font-size: 12px;\n\
        font-family: Merienda, serif;\n\
        font-weight: bold;\n\
    }\n\
    \n\
    .abc_text {\n\
        font-size: 12px;\n\
        font-family: arial, serif;\n\
    }\n\
    \n\
    .abc_lyrics {\n\
        font-size: 13px;\n\
        font-family: Merienda, serif;\n\
        font-weight: normal;\n\
    }\n\
    \n\
    .abc_ending {\n\
        font-size: 10px;\n\
        font-family: Merienda, serif;\n\
    }\n\
    \n\
    .abc_tabtext\n\
    ,.abc_tabtext2\n\
    ,.abc_tabtext3 {\n\
        font-family: arial;\n\
        font-weight: bold;\n\
        text-anchor:middle;\n\
        font-size: 14px;\n\
    }\n\
    .abc_tabtext2 {\n\
        font-size: 12px;\n\
    }\n\
    \n\
    .abc_tabtext3 {\n\
        font-size: 10px;\n\
    }';
    
    var svg_title = 'Partitura ' + abctune.metaText.title + ' criada por ABCXJS.';
    
    if( abctune.midi) {
        abctune.midi.printer = this;
    }
    this.pageratio = abctune.formatting.pageratio;
    this.pagenumbering = abctune.formatting.pagenumbering;
    this.staffsep = abctune.formatting.staffsep ||  ABCXJS.write.spacing.STEP*8;
    this.paddingtop = abctune.formatting.landscape? 15 : 15;
    this.scale = abctune.formatting.scale ? abctune.formatting.scale: this.scale;
    this.width = Math.min( abctune.formatting.staffwidth, abctune.formatting.usablewidth) - this.paddingright;
    this.maxwidth = this.width;
    
    this.y = this.paddingtop;
    this.totalY = 0;
    
    this.layouter = new ABCXJS.write.Layout( this, abctune.formatting.bagpipes );
    
    this.calcPageLength();
    
    this.paper.initDoc( 'tune', svg_title, estilo, options );
    this.paper.initPage( this.scale );

    if (abctune.metaText.title) {
        this.paper.text(this.width/2, this.y+5, abctune.metaText.title, "abc_title", "middle" );
        this.y += 20;
    }    

    if (abctune.lines[0].staffs[0].subtitle) {
        this.printSubtitleLine(abctune.lines[0].staffs[0].subtitle);
    }
    
    var composerLine = "";
    
    if (abctune.metaText.composer)
        composerLine += abctune.metaText.composer;
    if (abctune.metaText.origin)
        composerLine += ' (' + abctune.metaText.origin + ')';
    if (abctune.metaText.author) 
        composerLine += (composerLine.length> 0?'\n':'') + abctune.metaText.author;

    if (composerLine.length > 0) {
        var n = composerLine.split('\n').length;
        var dy = (n>1?(n>2?0:5):30);
        this.paper.text(this.width, dy, composerLine, 'abc_author', 'end' );
    } 
    
    var xtempo ;
    if (abctune.metaText.tempo && !abctune.metaText.tempo.suppress) {
        xtempo = this.printTempo(this.paddingleft*2, abctune.metaText.tempo );
    }
    if (abctune.metaText.rhythm) {
        this.paper.text( xtempo || this.paddingleft*3+5, this.y, abctune.metaText.rhythm, 'abc_rhythm', 'start');
    }
    
    this.y += 20;

    // impressão dos grupos de pautas
    for (var line = 0; line < abctune.lines.length; line++) {
        var abcline = abctune.lines[line];
        if(abcline.newpage) {
            this.skipPage();
            continue;
        }
        if(abcline.staffs) {
            var staffgroup =  this.layouter.layoutABCLine(abctune, line, this.width);
            staffgroup.draw( this, line );
            this.staffgroups.push(staffgroup);
            this.maxwidth = Math.max(staffgroup.w, this.maxwidth);
            this.calcPageLength();
        }
    }

    var extraText1 = "", extraText2 = "",  height = 0, h1=0, h2=0;
    
    if (abctune.metaText.unalignedWords) {
        for (var j = 0; j < abctune.metaText.unalignedWords.length; j++) {
            if (typeof abctune.metaText.unalignedWords[j] === 'string') {
                extraText1 += abctune.metaText.unalignedWords[j] + "\n";
                h1 ++;
            }
        }
    }
    if (abctune.metaText.book) {
         h2 ++;
         extraText2 += "Livro: " + abctune.metaText.book + "\n";
    }    
    if (abctune.metaText.source) {
         h2 ++;
        extraText2+= "Fonte: " + abctune.metaText.source + "\n";
    }    
    if (abctune.metaText.discography) {
         h2 ++;
        extraText2 += "Discografia: " + abctune.metaText.discography + "\n";
    }    
    if (abctune.metaText.notes) {
         h2 ++;
        extraText2 += abctune.metaText.notes + "\n";
    }    
    if (abctune.metaText.transcription) {
         h2 ++;
        extraText2 += "Transcrito por " + abctune.metaText.transcription + "\n";
    }    
    if (abctune.metaText.history) {
         h2 ++;
        extraText2+= "Histórico: " + abctune.metaText.history + "\n";
    }    
    
    if(h1> 0) {
        height = ABCXJS.write.spacing.STEP*3 + h1*1.5*16; 
        if( ( this.pageNumber - ((this.y+height)/this.estimatedPageLength) ) < 0 ) {
           this.skipPage();
        } else {
            this.y += ABCXJS.write.spacing.STEP*3; 
        }
        this.printExtraText( extraText1, this.paddingleft+50);
        this.y += height; 
    }

    if(h2> 0) {
        height = ABCXJS.write.spacing.STEP*3 + h2*1.5*16;
        if( ( this.pageNumber - ((this.y+height)/this.estimatedPageLength) ) < 0 ) {
           this.skipPage();
        } else {
            this.y += ABCXJS.write.spacing.STEP*3; 
        }
        this.printExtraText( extraText2, this.paddingleft);
        this.y += height; 
    }
    
//    for(var r=0; r < 10; r++) // para debug: testar a posição do número ao final da página
//        this.skipPage();
    
    this.skipPage(true); 
    
    this.paper.endDoc(abctune);
    
    this.formatPage();
    
    //binds SVG elements
    var lines = abctune.lines;
    for(var l=0; l<lines.length;l++){
        for(var s=0; lines[l].staffs && s <lines[l].staffs.length;s++){
            for(var v=0; v <lines[l].staffs[s].voices.length;v++){
                for(var a=0; a <lines[l].staffs[s].voices[v].length;a++){
                   var abs = lines[l].staffs[s].voices[v][a].parent;
                   if( !abs || !abs.gid ) continue;
                   abs.setMouse(this);
                }
            }
        }
    }
    
    //this.paper.topDiv.style.width = "" +  (this.maxwidth + this.paddingright) + "px";
    this.paper.topDiv.style.width = "auto";

};

ABCXJS.write.Printer.prototype.printTempo = function (x, tempo) {
    
    this.y -= 5;

    var tempopitch = 5;
    
    this.paper.beginGroup();

    if (tempo.preString) {
        this.paper.text(x, this.calcY(tempopitch-0.8), tempo.preString, 'abc_tempo', 'start');
        //fixme: obter a largura do texto
        //x += (text.getBBox().width + 20*printer.scale);
        x += tempo.preString.length*5 + 5;
    }

    if (tempo.duration) {
        var temposcale = 0.9;
        var duration = tempo.duration[0]; // TODO when multiple durations
        var abselem = new ABCXJS.write.AbsoluteElement(tempo, duration, 1);
        var durlog = ABCXJS.write.getDurlog(duration);
        var dot = 0;
        for (var tot = Math.pow(2, durlog), inc = tot / 2; tot < duration; dot++, tot += inc, inc /= 2);
        var c = ABCXJS.write.chartable.note[-durlog];
        var flag = ABCXJS.write.chartable.uflags[-durlog];
        var temponote = this.layouter.printNoteHead( abselem, c, {verticalPos:tempopitch}, "up", 0, 0, flag, dot, 0, temposcale );
        abselem.addHead(temponote);
        if (duration < 1) {
            var dx = 9.5;
            var width = -0.6;
            abselem.addExtra(new ABCXJS.write.RelativeElement(null, dx, 0, tempopitch, {type:"stem", pitch2:tempopitch+6, linewidth:width}));
        }
        abselem.x = x+4;
        abselem.draw(this, null);

        x += (abselem.w+dx );
        var tempostr = "= " + tempo.bpm;
        this.paper.text(x, this.calcY(tempopitch-0.8), tempostr, 'abc_tempo', 'start');
        //fixme: obter a largura do texto // text.getBBox().width + 10*printer.scale;
        x += tempostr.length*5 + 5;
    }

    if (tempo.postString) {
        this.paper.text( x, this.calcY(tempopitch-0.8), tempo.postString, 'abc_tempo', 'start');
    }
    this.paper.endGroup();

    this.y += 5;
    return abselem.x + abselem.w +4;
};


ABCXJS.write.Printer.prototype.printSymbol = function (x, offset, symbol ) {
    if (!symbol) return null;
    try {
        this.paper.printSymbol(x, this.calcY(offset + this.glyphs.getYCorr(symbol)), symbol);
    } catch(e){
        this.paper.text(x, this.calcY(offset + this.glyphs.getYCorr(symbol)), e );
    }
};

ABCXJS.write.Printer.prototype.printTieArc = function(x1, x2, pitch1, pitch2, above) {

  x1 = x1 + 6;
  x2 = x2 + 4;
  pitch1 = pitch1 + ((above)?1.5:-1.5);
  pitch2 = pitch2 + ((above)?1.5:-1.5);
  var y1 = this.calcY(pitch1);
  var y2 = this.calcY(pitch2);

  this.paper.printTieArc(x1,y1,x2,y2,above);
};

ABCXJS.write.Printer.prototype.printStave = function (startx, endx, staff ) {
    if(staff.numLines === 4) {
      // startx+1 e endx-1 pq a rotina faz um deslocamento contrario para desenhar o ledger
      this.printLedger(startx+1,endx-1, 19.5); 
      
      // imprimo duas linhas para efeito
      this.paper.printStaveLine(startx,endx,this.calcY(15)-0.5 ); 
      this.paper.printStaveLine(startx,endx,this.calcY(15) ); 
      
      this.printLedger(startx+1,endx-1, 7.5 ); 
      
      this.paper.printStaveLine(startx,endx,this.calcY(0)); 
    } else {
      for (var i = 0; i < staff.numLines; i++) {
        this.paper.printStaveLine(startx,endx,this.calcY((i+1)*2));
      }
    }
};

ABCXJS.write.Printer.prototype.printDebugLine = function (x1,x2, y, fill ) {
   this.paper.printStaveLine(x1,x2, y, fill ) ; 
};

ABCXJS.write.Printer.prototype.printLedger = function (x1, x2, pitch) {
    this.paper.printLedger(x1-1, this.calcY(pitch), x2+1, this.calcY(pitch) );
};

ABCXJS.write.Printer.prototype.printText = function (x, offset, text, kls, anchor ) {
    anchor = anchor || "start";
    kls = kls || "abc_text";
    this.paper.text(x, this.calcY(offset), text, kls, anchor);
};

ABCXJS.write.Printer.prototype.printTabText = function (x, offset, text, klass) {

    klass = klass || 'abc_tabtext';

    //if( opcao tablatura !== alemã )
    //btn.tabButton = (i + 1) + Array(j + 1).join("'");

    var i = parseInt(text);
    var j=(text.match(/'/g)||[]).length
    var n=text;

    if(this.loadedKeyboard.pautaNumerica && !isNaN(i) && this.loadedKeyboard.keyMap[j][i-1] && !this.loadedKeyboard.keyMap[j][i-1].closeNote.isBass){
        var b = this.loadedKeyboard.keyMap[j][i-1]
        var formato = this.loadedKeyboard.pautaNumericaFormato;
        if( formato.overrides[b.tabButton] ){
            n = formato.overrides[b.tabButton];
         } else{
            n =  i+formato.rule[j];
         }
    }


    this.paper.tabText(x, this.calcY(offset)+5, n, klass, 'middle');
};

ABCXJS.write.Printer.prototype.printTabText2 = function (x, offset, text) {
    return this.printTabText(x, offset, text, 'abc_tabtext2');
};

ABCXJS.write.Printer.prototype.printTabText3 = function (x, offset, text) {
    return this.printTabText(x, offset, text, 'abc_tabtext3');
};

ABCXJS.write.Printer.prototype.printBar = function (x, dx, y1, y2, real) {
    this.paper.printBar(x, dx, y1, y2, real);
};

ABCXJS.write.Printer.prototype.printStem = function (x, dx, y1, y2) {
    this.paper.printStem(x, dx, y1, y2);
};
ABCXJS.write.Printer.prototype.printDebugMsg = function(x, y, msg ) {
  return this.paper.text(x, y, msg, 'abc_ending', 'start');
};

ABCXJS.write.Printer.prototype.printLyrics = function(x, staveInfo, msg) {
    var y = this.calcY(staveInfo.lowest-(staveInfo.lyricsRows>1?0:3.7));
    
    // para manter alinhado, quando uma das linhas for vazia, imprimo 3 pontos
    var i = msg.indexOf( "\n " );
    if( i >= 0) msg = msg.substr(0, i) + "\n...";
    
    this.paper.text(x, y, msg, 'abc_lyrics', 'start');
    
};

ABCXJS.write.Printer.prototype.printFingering = function(x, staveInfo, msg) {
    var y = this.calcY(staveInfo.lowest);
    try {
        this.paper.printSymbol(x-3, y, 'cn.'+msg.trim());
    } catch(e){
        this.paper.text(x, y+12, msg.trim(), 'abc_lyrics', 'start');        
    }
};

ABCXJS.write.Printer.prototype.addSelectListener = function (listener) {
  this.listeners[this.listeners.length] = listener;
};

//// notify all listeners que o modelo mudou
//ABCXJS.write.Printer.prototype.notifyChange = function () {
//  for (var i=0; i<this.listeners.length;i++) {
//    this.listeners[i].modelChanged && this.listeners[i].modelChanged();
//  }
//};

// notify all listeners that a graphical element has been selected
ABCXJS.write.Printer.prototype.notifySelect = function (abselem, keepState) {
  this.selected[this.selected.length]=abselem;
  abselem.highlight(keepState);
  for (var i=0; i<this.listeners.length;i++) {
    this.listeners[i].highlight && this.listeners[i].highlight(abselem.abcelem);
  }
};

// notify all listeners that a graphical element has been deselected
ABCXJS.write.Printer.prototype.notifyClear = function (abselem) {
  abselem.unhighlight();
  for (var i=0; i<this.listeners.length;i++) {
    this.listeners[i].unhighlight && this.listeners[i].unhighlight(abselem.abcelem);
  }
};

// notify all listeners that a graphical element has been selected (should clear any previous selection)
ABCXJS.write.Printer.prototype.notifyClearNSelect = function (abselem, keepState) {
  this.clearSelection();
  this.notifySelect(abselem,keepState);
};

ABCXJS.write.Printer.prototype.clearSelection = function () {
  for (var i=0;i<this.selected.length;i++) {
    this.notifyClear( this.selected[i] );
  }
  this.selected = [];
};

ABCXJS.write.Printer.prototype.rangeHighlight = function(sel) {
    
    this.clearSelection();
    
    if( sel.length === 1 && sel[0].start.row === sel[0].end.row && sel[0].start.column === sel[0].end.column ) {
        return;
    }
    
    for (var line=0;line<this.staffgroups.length; line++) {
	var voices = this.staffgroups[line].voices;
	for (var voice=0;voice<voices.length;voice++) {
	    var elems = voices[voice].children;
	    for (var elem=0; elem<elems.length; elem++) {
		// Elementos estão confinados somente em uma linha
                if(! elems[elem].abcelem.position ) continue;
                var elLine = elems[elem].abcelem.position.anchor.line;
		var elStart = elems[elem].abcelem.position.anchor.ch;
		var elEnd = elems[elem].abcelem.position.head.ch;
                for(var s = 0; s < sel.length; s ++) {
                    try {
                        if( elLine >= sel[s].start.row && elLine <= sel[s].end.row ) {

                            if (  ( elLine === sel[s].start.row && elEnd < sel[s].start.column ) ||
                                  ( elLine === sel[s].end.row && elStart > sel[s].end.column   ) ) {
                                continue; //elemento fora do range
                            } else {
                                this.selected.push(elems[elem]);
                                elems[elem].highlight();
                                break;
                            }
                        }
                    } catch(e) {
                        
                    }
                }
	    }
	}
    }
    return this.selected;
};

ABCXJS.write.Printer.prototype.beginGroup = function (abselem) {
    abselem.gid = this.paper.beginGroup(abselem.abcelem.el_type); // associa o elemento absoluto com o futuro elemento sgv selecionavel
};

ABCXJS.write.Printer.prototype.endGroup = function () {
  
  this.paper.endGroup();
  return;
  
};

ABCXJS.write.Printer.prototype.calcY = function(ofs) {
  return this.y+((ABCXJS.write.spacing.TOPNOTE-ofs)*ABCXJS.write.spacing.STEP); // flavio
};

ABCXJS.write.Printer.prototype.calcPageLength = function() {
    if( this.currentTune.formatting.papersize === 'screen' ) 
        this.estimatedPageLength =  1e6; // no page breaks
    else
        this.estimatedPageLength = ((this.maxwidth+this.paddingright)*this.pageratio - this.paddingbottom)/this.scale;
};

ABCXJS.write.Printer.prototype.printPageNumber = function() {
    
    this.y = this.estimatedPageLength;
    
    if (this.pagenumbering) {
         this.paper.text(this.maxwidth+this.paddingright, this.y, "- " + this.pageNumber + " -", 'abc_tempo', 'end');
    }
};

ABCXJS.write.Printer.prototype.skipPage = function(lastPage) {
    
    // se não for a última página ou possui mais de uma página
    if( ! lastPage || this.pageNumber > 1) {
        this.printPageNumber();
    }
    
    this.totalY += this.y;
    
    this.paper.endPage({w: (this.maxwidth + this.paddingright) , h: this.y });
    
    if( ! lastPage ) {
        this.y = this.paddingtop;
        this.pageNumber++;
        this.paper.initPage( this.scale );
    }
};

ABCXJS.write.Printer.prototype.formatPage = function() {
    //prepara a página para impressão de acordo com os parâmetros da canção.
    var orientation = this.currentTune.formatting.landscape?'landscape':'portrait';
    var style = document.getElementById('page_format');
    
    var formato = 
'   @page {\n\
        margin: '+this.currentTune.formatting.defaultMargin+'; size: '+this.currentTune.formatting.papersize+' ' + orientation + ';\n\
    }\n' ; //+ pgnumber;
    
    if( ! style ) {
        style = document.createElement('style');
        style.setAttribute( "id", "page_format" ); 
        document.head.appendChild(style);
    }
    
    style.innerHTML = formato;

};

ABCXJS.write.Printer.prototype.printExtraText = function(text, x) {
    var t = this.paper.text(x, this.y , text, 'abc_title', 'start');
    var height ;//= t.getBBox().height;
    if (!height)  height = 25 ; //fixme: obter a altura do texto
    return height;
};

ABCXJS.write.Printer.prototype.printSubtitleLine = function(subtitle) {
    this.paper.text(this.width/2, this.y+2, subtitle, 'abc_subtitle', 'middle');
};
