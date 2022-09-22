//    abc_graphelements.js: All the drawable and layoutable datastructures to be printed by ABCXJS.write.Printer
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

/*global window, ABCXJS */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.write)
    window.ABCXJS.write = {};

ABCXJS.write.StaffGroupElement = function() {
    this.voices = [];
};

ABCXJS.write.StaffGroupElement.prototype.addVoice = function( voice ) {
    this.voices[this.voices.length] = voice;
};

ABCXJS.write.StaffGroupElement.prototype.finished = function() {
    for (var i = 0; i < this.voices.length; i++) {
        if (!this.voices[i].layoutEnded())
            return false;
    }
    return true;
};

ABCXJS.write.StaffGroupElement.prototype.layout = function(spacing, printer, debug) {
    this.spacingunits = 0; // number of times we will have ended up using the spacing distance (as opposed to fixed width distances)
    this.minspace = 1000; // a big number to start off with - used to find out what the smallest space between two notes is -- GD 2014.1.7
    var x = printer.paddingleft;

    // find out how much space will be taken up by voice headers
    var voiceheaderw = 0;
    for (var i = 0; i < this.voices.length; i++) {
        if (this.voices[i].header) {
            //FLAVIO fixme: obter a largura real do texto - text.getBBox().width
            voiceheaderw = Math.max(voiceheaderw, this.voices[i].header.length *5+10);
        }
    }
    x += voiceheaderw + (voiceheaderw? printer.paddingleft:0); // 10% of 0 is 0
    this.startx = x;

    var currentduration = 0;
    if (debug)
        waterbug.log("init layout");
    for (i = 0; i < this.voices.length; i++) {
        this.voices[i].beginLayout(x);
        for (b = 0; b < this.voices[i].beams.length; b++) {
            for (be = 0; be < this.voices[i].beams[b].elems.length; be++) {
                var elem = this.voices[i].beams[b].elems[be];
                this.voices[i].stave.highest = Math.max(elem.top, this.voices[i].stave.highest);
                this.voices[i].stave.lowest = Math.min(elem.bottom-2, this.voices[i].stave.lowest);
            }
        }
    }

    var c = 0;
    while (!this.finished()) {
        
        if( c++ > 1000 ) {
            alert( 'não termina!' );
        }
        
        // find first duration level to be laid out among candidates across voices

        currentduration = null; // candidate smallest duration level
        for (i = 0; i < this.voices.length; i++) {
            if (!this.voices[i].layoutEnded() && (!currentduration || this.voices[i].getDurationIndex() < currentduration))
                currentduration = this.voices[i].getDurationIndex();
        }
        if (debug)
            waterbug.log("currentduration: ", currentduration);


        // isolate voices at current duration level
        var currentvoices = [];
        var othervoices = [];
        for (i = 0; i < this.voices.length; i++) {
            if (this.voices[i].getDurationIndex() !== currentduration) {
                othervoices.push(this.voices[i]);
                //waterbug.log("out: voice ",i);
            } else {
                currentvoices.push(this.voices[i]);
                if (debug)
                    waterbug.log("in: voice ", i);
            }
        }

        // among the current duration level find the one which needs starting furthest right
        var spacingunit = 0; // number of spacingunits coming from the previously laid out element to this one
        var spacingduration = 0;
        for (i = 0; i < currentvoices.length; i++) {
            if (currentvoices[i].getNextX() > x) {
                x = currentvoices[i].getNextX();
                var sd = currentvoices[i].spacingduration;
                spacingunit = currentvoices[i].getSpacingUnits();
                // arredonda para zero os numeros muito pequenos - evita erros de NaN em operações posteriores
                spacingduration = Math.abs(sd) < 0.001 ? Math.round(sd) : sd;
            }
        }
        this.spacingunits += spacingunit;
        this.minspace = Math.min(this.minspace, spacingunit);

        for (i = 0; i < currentvoices.length; i++) {
            var voicechildx = currentvoices[i].layoutOneItem(x, spacing );
            var dx = voicechildx - x;
            if (dx > 0) {
                x = voicechildx; //update x
                for (var j = 0; j < i; j++) { // shift over all previously laid out elements
                    currentvoices[j].shiftRight(dx);
                }
            }
        }

        // remove the value of already counted spacing units in other voices (e.g. if a voice had planned to use up 5 spacing units but is not in line to be laid out at this duration level - where we've used 2 spacing units - then we must use up 3 spacing units, not 5)
        for (i = 0; i < othervoices.length; i++) {
            othervoices[i].spacingduration -= spacingduration;
            othervoices[i].updateNextX(x, spacing); // adjust other voices expectations
        }

        // update indexes of currently laid out elems
        for (i = 0; i < currentvoices.length; i++) {
            var voice = currentvoices[i];
            voice.updateIndices();
        }
    } // finished laying out


    // find the greatest remaining x as a base for the width
    for (i = 0; i < this.voices.length; i++) {
        if (this.voices[i].getNextX() > x) {
            x = this.voices[i].getNextX();
            spacingunit = this.voices[i].getSpacingUnits();
        }
    }
    this.spacingunits += spacingunit;
    this.w = x;

    for (i = 0; i < this.voices.length; i++) {
        this.voices[i].w = this.w;
    }
};

ABCXJS.write.StaffGroupElement.prototype.calcShiftAbove = function(voz) {
  var abv = Math.max( voz.stave.highest, ABCXJS.write.spacing.TOPNOTE) - ABCXJS.write.spacing.TOPNOTE;
  return (abv+2) * ABCXJS.write.spacing.STEP;
};

ABCXJS.write.StaffGroupElement.prototype.calcHeight = function(voz, hideLyrics) {
    // calculo da altura da pauta + uma pequena folga
    var h = (3+voz.stave.highest-voz.stave.lowest) * ABCXJS.write.spacing.STEP;

    // inclui espaço para as linhas de texto - se existirem e estiverem visiveis
    if( ! hideLyrics )
        h += 15 * voz.stave.lyricsRows;

    return h;
};

ABCXJS.write.StaffGroupElement.prototype.draw = function(printer, groupNumber) {
    
    var height = 0;
    var shiftabove = 0;
    var y =  printer.y;
    var yi = printer.y;
    
    // posiciona cada pauta do grupo e determina a altura final da impressão
    for (var i = 0; i < this.voices.length; i++) {

        var h = 0;
        
        if( this.voices[i].stave.lyricsRows === 0 )
            this.voices[i].stave.lowest -=2;
        
        shiftabove = this.calcShiftAbove( this.voices[i] );
        
        if( this.voices[i].duplicate ) {
            
            var above = this.voices[i-1].stave.y - this.voices[i-1].stave.top;
            var lastH = this.voices[i-1].stave.bottom - this.voices[i-1].stave.top;

            this.voices[i].stave.top = this.voices[i-1].stave.top;
            
            if( shiftabove > above ) {
                this.voices[i-1].stave.y += (shiftabove-above);
            }

            this.voices[i].stave.y = this.voices[i-1].stave.y;
            
            var x = Math.min(this.voices[i].stave.lowest,this.voices[i-1].stave.lowest);
            this.voices[i].stave.lowest = x;
            this.voices[i-1].stave.lowest = x;

            var x = Math.max(this.voices[i].stave.highest,this.voices[i-1].stave.highest);
            this.voices[i].stave.highest = x;
            this.voices[i-1].stave.highest = x;
            
            h = this.calcHeight(this.voices[i]);

            if( h > lastH ) {
                height += (h-lastH);
                y += (h-lastH);
            }
            
            this.voices[i-1].stave.bottom = y;
            this.voices[i].stave.bottom = y;
           
        } else {
            
            if (groupNumber > 0 && i === 0 && this.voices[i].stave.subtitle) {
                y += 5 ;
            }

            h = this.calcHeight(this.voices[i], printer.currentTune.formatting.hideLyrics);

            this.voices[i].stave.top = y;
            this.voices[i].stave.y = y + shiftabove;

            height += h;
            y += h;
            
            this.voices[i].stave.bottom = y;
        }
    }
    
    // verifica se deve iniciar nova pagina
    var nexty = printer.y + height + printer.staffsep ; 
    if( nexty >= printer.estimatedPageLength )  {
        printer.skipPage();
    } else  if (groupNumber > 0) {
     // ou espaco entre os grupos de pautas
      printer.y += printer.staffsep; 
    }
    
    var delta = printer.y - yi; 

    // ajusta a grupo para a nova posição
    if( delta !== 0 ) {
        for (var i = 0; i < this.voices.length; i++) {
            this.voices[i].stave.bottom += delta;
            this.voices[i].stave.top += delta;
            this.voices[i].stave.y += delta;
        }    
    }
    
    // imprime a pauta
    for (i = 0; i < this.voices.length; i++) {
        if (this.voices[i].stave.numLines === 0 || this.voices[i].duplicate)
            continue;
        printer.y = this.voices[i].stave.y;
        if( typeof(debug) !== 'undefined' && debug ) {
          printer.printDebugLine(this.startx, this.w, this.voices[i].stave.y, "#ff0000"); 
          printer.printDebugMsg( this.startx-5, this.voices[i].stave.y, 'y' );
          printer.printDebugLine(this.startx, this.w, this.voices[i].stave.top, "#00ff00"); 
          printer.printDebugMsg( this.startx-5, this.voices[i].stave.top, 'top' );
          printer.printDebugLine(this.startx, this.w, this.voices[i].stave.bottom, "#00ff00"); 
          printer.printDebugMsg( this.startx+50, this.voices[i].stave.bottom, 'bottom' );
          printer.printDebugLine(this.startx, this.w, printer.calcY(this.voices[i].stave.highest), "#0000ff"); 
          printer.printDebugMsg( this.w-50, printer.calcY(this.voices[i].stave.highest), 'highest' );
          printer.printDebugLine(this.startx, this.w, printer.calcY(this.voices[i].stave.lowest), "#0000ff"); 
          printer.printDebugMsg( this.w-50, printer.calcY(this.voices[i].stave.lowest), 'lowest' );
        }  
        printer.printStave(this.startx, this.w-1, this.voices[i].stave);
    }
    
    for (i = 0; i < this.voices.length; i++) {
        if (groupNumber > 0 && i === 0 && this.voices[i].stave.subtitle) {
            printer.y = this.voices[i].stave.top - 18;
            printer.printSubtitleLine(this.voices[i].stave.subtitle);
        }
        //if(this.voices[i].stave.clef.type === 'accordionTab') // flavio - implementar impressão seletiva da pauta
        this.voices[i].draw(printer);
    }

    if (this.voices.length > 0) {
        var top = this.voices[0].stave.y;
        var clef = this.voices[this.voices.length - 1].stave.clef.type;
        var bottom = printer.calcY(clef==="accordionTab"?0:2);
        printer.printBar(this.startx, 0.6, top, bottom, false);
        printer.printBar(this.w-1, 0.6, top, bottom, false);
        if (this.voices.length > 1)  {
            printer.paper.printBrace(this.startx-10, top-10, bottom+10);  
        }
    }
    // registra a posição do staffgroup e sua altura para uso posterior, fazendo scroll durante a execução do MIDI.
    this.top = yi+delta +printer.totalY;
    this.height = height;
    
    // nova posição da impressora
    printer.y = yi+ delta + height; 
    
};

ABCXJS.write.VoiceElement = function(voicenumber, staffnumber, abcstaff) {
    this.children = [];
    this.fingers = [];
    this.bassfingers = [];
    this.beams = [];
    this.otherchildren = []; // ties, slurs, triplets
    this.w = 0;
    this.duplicate = false;
    this.voicenumber = voicenumber; //number of the voice on a given stave (not staffgroup)
    this.staffnumber = staffnumber; // number of the staff in the staffgroup
    this.voicetotal = abcstaff.voices.length;
    this.stem = abcstaff.stem[voicenumber];
    this.stave = {
        y: 0
       ,top: 0
       ,bottom: 0
       ,clef: abcstaff.clef
       ,subtitle: abcstaff.subtitle
       ,lyricsRows: abcstaff.lyricsRows
       ,lowest: (abcstaff.clef.type === "accordionTab" ) ? -2 : 0
       ,highest: (abcstaff.clef.type === "accordionTab" ) ? 21.5 : 10
       ,numLines: (abcstaff.clef.type === "accordionTab" ) ? 4 : abcstaff.clef.staffLines || 5
    };
};

ABCXJS.write.VoiceElement.prototype.addChild = function(child) {
    this.children[this.children.length] = child;
    // FINGERS - Parte I
    // o parse do dedilhado foi feito nos moldes da letra (lyrics)
    // porém agora, removo os elementos de dedilhados do padrão original e crio uma estrutura separada da voz
    for (i=0; i<child.children.length; i++) {
        if(child.children[i].type === 'fingering'){
            var relativeChild =  child.children[i] ;
            this.fingers[this.fingers.length] = relativeChild ;
            child.children.splice(i,1);
        } else  if(child.children[i].type === 'bassfingering'){
            var relativeChild =  child.children[i] ;
            this.bassfingers[this.bassfingers.length] = relativeChild ;
            child.children.splice(i,1);
        }
    }
};

ABCXJS.write.VoiceElement.prototype.addOther = function(child) {
    if (child instanceof ABCXJS.write.BeamElem) {
        this.beams.push(child);
    } else {
        this.otherchildren.push(child);
    }
};

ABCXJS.write.VoiceElement.prototype.updateIndices = function() {
    if (!this.layoutEnded()) {
        this.durationindex += this.children[this.i].duration;
        if (this.children[this.i].duration === 0)
            this.durationindex = Math.round(this.durationindex * 64) / 64; // everytime we meet a barline, do rounding to nearest 64th
        this.i++;
    }
};

ABCXJS.write.VoiceElement.prototype.layoutEnded = function() {
    return (this.i >= this.children.length);
};

ABCXJS.write.VoiceElement.prototype.getDurationIndex = function() {
    return this.durationindex - (this.children[this.i] && (this.children[this.i].duration > 0) ? 0 : 0.0000005); // if the ith element doesn't have a duration (is not a note), its duration index is fractionally before. This enables CLEF KEYSIG TIMESIG PART, etc. to be laid out before we get to the first note of other voices
};

// number of spacing units expected for next positioning
ABCXJS.write.VoiceElement.prototype.getSpacingUnits = function() {
    return (this.minx < this.nextx) ? Math.sqrt(this.spacingduration * 8) : 0; // we haven't used any spacing units if we end up using minx
};

//
ABCXJS.write.VoiceElement.prototype.getNextX = function() {
    return Math.max(this.minx, this.nextx);
};

ABCXJS.write.VoiceElement.prototype.beginLayout = function(startx) {
    this.i = 0;
    this.durationindex = 0;
    this.ii = this.children.length;
    this.startx = startx;
    this.minx = startx; // furthest left to where negatively positioned elements are allowed to go
    this.nextx = startx; // x position where the next element of this voice should be placed assuming no other voices and no fixed width constraints
    this.spacingduration = 0; // duration left to be laid out in current iteration (omitting additional spacing due to other aspects, such as bars, dots, sharps and flats)
};

// Try to layout the element at index this.i
// x - position to try to layout the element at
// spacing - base spacing
// can't call this function more than once per iteration
ABCXJS.write.VoiceElement.prototype.layoutOneItem = function(x, spacing) {
    var child = this.children[this.i];
    if (!child)
        return 0;
    var er = x - this.minx; // available extrawidth to the left
    if (er < child.getExtraWidth()) { // shift right by needed amount
        x += child.getExtraWidth() - er;
    }
    child.x = x; // place child at x

    this.spacingduration = child.duration;
    //update minx
    this.minx = x + child.getMinWidth(); // add necessary layout space
    if (this.i !== this.ii - 1)
        this.minx += child.minspacing; // add minimumspacing except on last elem

    this.updateNextX(x, spacing);

    // contribute to staff y position
    this.stave.highest = Math.max(child.top, this.stave.highest);
    this.stave.lowest = Math.min(child.bottom, this.stave.lowest);

    return x; // where we end up having placed the child
};

// call when spacingduration has been updated
ABCXJS.write.VoiceElement.prototype.updateNextX = function(x, spacing) {
    var temp = x + (spacing * Math.sqrt(this.spacingduration * 8));
    // isso resolve um problema que apareceu no chrome 71.0.3578.98, mas não sei o impacto de retornar 0.
    this.nextx = isNaN(temp)? 0: temp;
};

ABCXJS.write.VoiceElement.prototype.shiftRight = function(dx) {
    var child = this.children[this.i];
    if (!child)
        return;
    child.x += dx;
    this.minx += dx;
    this.nextx += dx;
};

ABCXJS.write.VoiceElement.prototype.draw = function(printer) {
    var ve = this;
    var width = ve.w - 1;
    printer.y = ve.stave.y;
    
    if (this.header) { // print voice name
        var headerY = (ve.stave.clef.type!=='accordionTab'? printer.calcY(6) : ve.stave.y ) +3;
        var headerX = printer.paddingleft;
        printer.printText(headerX, headerY,  this.header, 'abc_voice_header', 'start' );
    }
    
    // beams must be drawn first for proper printing of triplets, slurs and ties.
    for (var i = 0; i < this.beams.length; i++) {
        this.beams[i].draw(printer ); 
    };

    // bars, notes, stems, etc
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].draw(printer, ve.stave);
    }
    
    // tie arcs, endings, decorations, etc..
    for (var i = 0; i < this.otherchildren.length; i++) {
        this.otherchildren[i].draw(printer, ve.startx + 10, width, ve.stave, ve.staffnumber, ve.voicenumber );
    };

};

// duration - actual musical duration - different from notehead duration in triplets. 
// refer to abcelem to get the notehead duration
// minspacing - spacing which must be taken on top of the width defined by the duration
ABCXJS.write.AbsoluteElement = function(abcelem, duration, minspacing) {
    this.abcelem = abcelem;
    this.duration = duration;
    this.minspacing = minspacing || 0;
    this.x = 0;
    this.children = [];
    this.heads = [];
    this.extra = [];
    this.extraw = 0;
    this.decs = [];
    this.w = 0;
    this.right = [];
    this.invisible = false;
    this.bottom = 7;
    this.top = 7;
};

ABCXJS.write.AbsoluteElement.prototype.getMinWidth = function() {
    // absolute space taken to the right of the note
    return this.w;
};

ABCXJS.write.AbsoluteElement.prototype.getExtraWidth = function() {
    // space needed to the left of the note
    return -this.extraw;
};

ABCXJS.write.AbsoluteElement.prototype.addExtra = function(extra) {
    if (extra.dx < this.extraw)
        this.extraw = extra.dx;
    this.extra[this.extra.length] = extra;
    this.addChild(extra);
};

ABCXJS.write.AbsoluteElement.prototype.addHead = function(head) {
    if (head.dx < this.extraw)
        this.extraw = head.dx;
    this.heads[this.heads.length] = head;
    this.addRight(head);
};

ABCXJS.write.AbsoluteElement.prototype.addRight = function(right) {
    if (right.dx + right.w > this.w)
        this.w = right.dx + right.w;
    this.right[this.right.length] = right;
    this.addChild(right);
};

ABCXJS.write.AbsoluteElement.prototype.addChild = function(child) {
    child.parent = this;
    this.children[this.children.length] = child;
    this.pushTop(child.top);
    this.pushBottom(child.bottom);
};

ABCXJS.write.AbsoluteElement.prototype.pushTop = function(top) {
    this.top = Math.max(top, this.top);
};

ABCXJS.write.AbsoluteElement.prototype.pushBottom = function(bottom) {
    this.bottom = Math.min(bottom, this.bottom);
};

ABCXJS.write.AbsoluteElement.prototype.draw = function(printer, staveInfo ) {
    
    if (this.invisible) return;

    var l = 0;
    
    this.elemset = {};// printer.paper.set();
    
    // imprimir primeiro ledger e mante-los fora do grupo de selecionaveis
    for (var i = 0; i < this.children.length; i++) {
        //this.elemset.push(this.children[i].draw(printer, this.x, staveInfo ));
        if ( this.children[i].type === 'ledger' || this.children[i].type === 'part' ) {
            this.children[i].draw(printer, this.x, staveInfo );
        } else {
            l++; // count notes, bars, etc
        }
    }
    
    if( l > 0 ){
        printer.beginGroup(this);
    }
    
    for (var i = 0; i < this.children.length; i++) {
        if ( this.children[i].type !== 'ledger' && this.children[i].type !== 'part' ) {
            this.children[i].draw(printer, this.x, staveInfo );
        }
    }
    
    if( l > 0 ){
        printer.endGroup();
    }
    
    this.abcelem.parent = this; 
    this.abcelem.parent.staffGroup = printer.staffgroups.length; // indica em qual staff group este abc elem vai estar
                                                                 // lembrando que o staffgroup sera incluido mais adiante.
    
};
/*
var svgns = "http://www.w3.org/2000/svg";
for (var x = 0; x < 5000; x += 50) {
    for (var y = 0; y < 3000; y += 50) {
        var rect = document.createElementNS(svgns, 'rect');
        rect.setAttributeNS(null, 'x', x);
        rect.setAttributeNS(null, 'y', y);
        rect.setAttributeNS(null, 'height', '50');
        rect.setAttributeNS(null, 'width', '50');
        rect.setAttributeNS(null, 'fill', '#'+Math.round(0xffffff * Math.random()).toString(16));
        document.getElementById('svgOne').appendChild(rect);

  var translate = d3.transform(d3.select(this.parentNode).attr("transform")).translate;
        var dataset = [1,2,3,4]                                    // HERE
        vis.selectAll("line")                                      // HERE
            .data(dataset)                                 // HERE
            .enter()                                       // HERE
            .append("line")                                // HERE
            .attr("x1", translate[0])                            // HERE'S THE PROBLEM FOR PERRY
            .attr("y1", translate[1])   

 */

ABCXJS.write.AbsoluteElement.prototype.setMouse = function(printer) {
    var self = this;
    this.svgElem = document.getElementById(self.gid);
    
    if(ABCXJS.write.color.useTransparency) {
        try {
            var svgns = "http://www.w3.org/2000/svg";

            var bounds = this.svgElem.getBBox();
            var rect = document.createElementNS(svgns, 'rect');
                rect.setAttributeNS(null, 'x', bounds.x.toFixed(1)-1);
                rect.setAttributeNS(null, 'y', bounds.y.toFixed(1)-1);
                rect.setAttributeNS(null, 'height', bounds.height.toFixed(1)+2);
                rect.setAttributeNS(null, 'width', bounds.width.toFixed(1)+2);
                rect.setAttributeNS(null, 'fill', 'none' );

            this.svgElem.appendChild(rect);
            this.svgArea = rect;
        } catch( e ) {
            // Firefox dies if svgElem is not Visible
        }
    }    
    
    this.svgElem.onmouseover =  function() {self.highlight(true);};
    this.svgElem.onmouseout =  function() {self.unhighlight(true);};
    this.svgElem.onclick =  function() {printer.notifyClearNSelect(self, true);};
 };

ABCXJS.write.AbsoluteElement.prototype.highlight = function(keepState) {
    if(!this.svgElem) return;
    if(keepState) this.svgElem.prevFill = this.svgElem.style.fill;
    this.svgElem.style.setProperty( 'fill', ABCXJS.write.color.highLight );
    (this.svgArea) && this.svgArea.style.setProperty( 'fill', ABCXJS.write.color.highLight );
    (this.svgArea) && this.svgArea.style.setProperty( 'fill-opacity', '0.15' );
};

ABCXJS.write.AbsoluteElement.prototype.unhighlight = function(keepState) {
    if(!this.svgElem) return;
    var fill = (keepState && this.svgElem.prevFill ) ? this.svgElem.prevFill : ABCXJS.write.color.unhighLight;
    this.svgElem.style.setProperty( 'fill', fill );
    (this.svgArea) && this.svgArea.style.setProperty( 'fill-opacity', '0' );
};


ABCXJS.write.RelativeElement = function(c, dx, w, pitch, opt) {
    opt = opt || {};
    this.x = 0;
    this.c = c;      // character or path or string
    this.dx = dx;    // relative x position
    this.w = w;      // minimum width taken up by this element (can include gratuitous space)
    this.pitch = pitch; // relative y position by pitch
    this.type = opt.type || "symbol"; // cheap types.
    this.pitch2 = opt.pitch2;
    this.linewidth = opt.linewidth;
    this.attributes = opt.attributes; // only present on textual elements
    this.top = pitch + ((opt.extreme === "above") ? 7 : 0);
    this.bottom = pitch - ((opt.extreme === "below") ? 7 : 0);
};

ABCXJS.write.RelativeElement.prototype.draw = function(printer, x, staveInfo ) {

    this.x = x + this.dx;

    switch (this.type) {
      
        case "symbol":
            if (this.c === null)
                return null;
            this.graphelem = printer.printSymbol(this.x, this.pitch, this.c);
            break;
        case "debug":
            this.graphelem = printer.printDebugMsg(this.x, staveInfo.highest+2, this.c);
            break;
        case "fingering":
            this.graphelem = printer.printFingering(this.x, staveInfo, this.c);
            break;
        case "bassfingering":
            this.graphelem = printer.printBassFingering(this.x, staveInfo, this.c);
            break;
        case "lyrics":
            this.graphelem = printer.printLyrics(this.x, staveInfo, this.c);
            break;
        case "barnumber":
            this.graphelem = printer.printText(this.x, this.pitch, this.c, 'abc_ending', 'middle');
            break
        case "part":
            this.graphelem = printer.printText(this.x, this.pitch, this.c, 'abc_subtitle');
            break;
        case "text":
            this.graphelem = printer.printText(this.x, this.pitch, this.c, 'abc_text');
            break;
        case "tabText":
            this.graphelem = printer.printTabText(this.x, this.pitch, this.c);
            break;
        case "tabText2":
            this.graphelem = printer.printTabText2(this.x, this.pitch, this.c);
            break;
        case "tabText3":
            this.graphelem = printer.printTabText3(this.x, this.pitch, this.c);
            break;
        case "bar":
            this.graphelem = printer.printBar(this.x, this.linewidth, printer.calcY(this.pitch), printer.calcY(this.pitch2), true);
            break;
        case "stem":
            this.drawStem(printer);
            //this.graphelem = printer.printStem(this.x, this.linewidth, printer.calcY(this.pitch), printer.calcY(this.pitch2));
            break;
        case "ledger":
            this.graphelem = printer.printLedger(this.x, this.x + this.w, this.pitch);
            break;
    }
    
    return this.graphelem;
};

ABCXJS.write.RelativeElement.prototype.drawStem = function( printer ) {
    var beam = this.parent.beam;
    var abcelem = this.parent.abcelem;
    if( beam ) { // under the beam, calculate new size for the stem
        if (abcelem.rest) return;
        var i = this.parent.beamId; 
        var furthesthead = beam.elems[i].heads[(beam.asc) ? 0 : beam.elems[i].heads.length - 1];
        var ovaldelta = (beam.isgrace) ? 1 / 3 : 1 / 5;
        var pitch = furthesthead.pitch + ((beam.asc) ? ovaldelta : -ovaldelta);
        var y = printer.calcY(pitch);
        var x = furthesthead.x + ((beam.asc) ? furthesthead.w : 0);
        var bary = beam.getBarYAt(x);
        var dx = (beam.asc) ? -0.6 : 0.6;
        printer.printStem(x, dx, y, bary);        
    } else {
        this.graphelem = printer.printStem(this.x, 0.6*this.linewidth/*fixme: mudar linew para 0.6*/, printer.calcY(this.pitch), printer.calcY(this.pitch2));
    }
};

ABCXJS.write.TieElem = function(anchor1, anchor2, above, forceandshift) {
    this.anchor1 = anchor1; // must have a .x and a .pitch, and a .parent property or be null (means starts at the "beginning" of the line - after keysig)
    this.anchor2 = anchor2; // must have a .x and a .pitch property or be null (means ends at the end of the line)
    this.above = above; // true if the arc curves above
    this.force = forceandshift; // force the arc curve, regardless of beaming if true
    // move by +7 "up" by -7 if "down"
};

ABCXJS.write.TieElem.prototype.draw = function(printer, linestartx, lineendx, staveInfo) {

    var startpitch;
    var endpitch;

    if (this.startlimitelem) {
        linestartx = this.startlimitelem.x + this.startlimitelem.w;
    }

    if (this.endlimitelem) {
        lineendx = this.endlimitelem.x;
    }
    // PER: We might have to override the natural slur direction if the first and last notes are not in the
    // save direction. We always put the slur up in this case. The one case that works out wrong is that we always
    // want the slur to be up when the last note is stem down. We can tell the stem direction if the top is
    // equal to the pitch: if so, there is no stem above it.
    if (!this.force && this.anchor2 && this.anchor2.pitch === this.anchor2.top)
        this.above = true;

    if (this.anchor1) {
        linestartx = this.anchor1.x;
        startpitch = this.above ? this.anchor1.highestVert : this.anchor1.pitch;
        if (!this.anchor2) {
            endpitch = this.above ? this.anchor1.highestVert : this.anchor1.pitch;
        }
    }

    if (this.anchor2) {
        lineendx = this.anchor2.x;
        endpitch = this.above ? this.anchor2.highestVert : this.anchor2.pitch;
        if (!this.anchor1) {
            startpitch = this.above ? this.anchor2.highestVert : this.anchor2.pitch;
        }
    }

    printer.printTieArc(linestartx, lineendx, startpitch, endpitch, this.above);

};

ABCXJS.write.DynamicDecoration = function(anchor, dec) {
    this.anchor = anchor;
    this.dec = dec;
};

ABCXJS.write.DynamicDecoration.prototype.draw = function(printer, linestartx, lineendx, staveInfo) {
    var ypos = staveInfo.lowest-1;
    for( var r=0; r < this.dec.length; r ++ ) {
        printer.printSymbol(this.anchor.x+r*10, ypos, this.dec[r]);
    }    
};

ABCXJS.write.EndingElem = function(text, anchor1, anchor2) {
    this.text = text; // text to be displayed top left
    this.anchor1 = anchor1; // must have a .x property or be null (means starts at the "beginning" of the line - after keysig)
    this.anchor2 = anchor2; // must have a .x property or be null (means ends at the end of the line)
};

ABCXJS.write.EndingElem.prototype.draw = function(printer, linestartx, lineendx, staveInfo, staffnumber, voicenumber) {
    if(staffnumber > 0  || voicenumber > 0)  return;

    var y = printer.calcY(staveInfo.highest + 5); // fixme: era 4

    if (this.anchor1) {
        linestartx = this.anchor1.x + this.anchor1.w;
        printer.paper.printLine( linestartx, y, linestartx, y + 10 );
        printer.paper.text( linestartx + 3, y + 9, this.text, 'abc_ending', 'start' );
    }

    if (this.anchor2) {
        lineendx = this.anchor2.x;
    }   
    
    printer.paper.printLine(linestartx, y, lineendx-5, y);  
};

ABCXJS.write.CrescendoElem = function(anchor1, anchor2, dir) {
    this.anchor1 = anchor1; // must have a .x and a .parent property or be null (means starts at the "beginning" of the line - after keysig)
    this.anchor2 = anchor2; // must have a .x property or be null (means ends at the end of the line)
    this.dir = dir; // either "<" or ">"
};

ABCXJS.write.CrescendoElem.prototype.draw = function(printer, linestartx, lineendx, staveInfo) {
    var ypos = printer.calcY(staveInfo.lowest - 1);

    if (this.dir === "<") {
        printer.paper.printLine(this.anchor1.x, ypos, this.anchor2.x, ypos-4);
        printer.paper.printLine(this.anchor1.x, ypos, this.anchor2.x, ypos+4);
    } else {
        printer.paper.printLine(this.anchor1.x, ypos-4, this.anchor2.x, ypos);
        printer.paper.printLine(this.anchor1.x, ypos+4, this.anchor2.x, ypos);
    }
};

ABCXJS.write.TripletElem = function(tripletInfo, anchor1, anchor2, stemDir ) {
    this.anchor1 = anchor1; // must have a .x and a .parent property or be null (means starts at the "beginning" of the line - after keysig)
    this.anchor2 = anchor2; // must have a .x property or be null (means ends at the end of the line)
    this.forceUp = stemDir==='up';
    this.forceDown = stemDir==='down';
    this.number = tripletInfo.num;
    this.qtd_notes = tripletInfo.notes;
    this.avgPitch = tripletInfo.avgPitch;
    this.minPitch = 100;
    this.maxPitch = -100;
    this.asc = ! ( (this.forceUp || this.avgPitch <= 6 ) && (!this.forceDown) ); // hardcoded 6 is B
    this.multiplier = tripletInfo.num === 2 ? 1.5 : (tripletInfo.num-1)/tripletInfo.num;
    
};

ABCXJS.write.TripletElem.prototype.draw = function(printer, linestartx, lineendx, staveInfo) {
    
    if (this.anchor1 && this.anchor2) {

        var maxslant = (this.qtd_notes? this.qtd_notes: this.number) / 2;
        var slant = this.anchor1.parent.abcelem.averagepitch - this.anchor2.parent.abcelem.averagepitch;
        var isFlat = true;
        
        if (isFlat ) {
            slant = 0;
        } else  {
            slant = Math.min(slant,maxslant);
            slant = Math.max(slant,-maxslant);
        }

        var ypos = Math.max( this.forceUp ? this.maxPitch+9 : (this.maxPitch >= 10 ? this.maxPitch + 3 : 13), 13) ;
        var starty = printer.calcY(ypos + Math.floor(slant / 2));
        var endy = printer.calcY(ypos + Math.floor(-slant / 2));

        if (this.anchor1.parent.beam &&
                this.anchor1.parent.beam === this.anchor2.parent.beam) {
            var beam = this.anchor1.parent.beam;
            this.asc = beam.asc;
            ypos = beam.pos;
        } else {
            var y = printer.calcY(ypos);
            var linestartx = this.anchor1.x -2;
            var lineendx = this.anchor2.x + this.anchor2.w;
            
            //printer.paper.printLine(linestartx, starty+ (!this.asc? 0 : -5), linestartx, starty + (!this.asc? 5 : 0) );
            //printer.paper.printLine(lineendx, endy+ (!this.asc? 0 : -5), lineendx, endy + (!this.asc? 5 : 0));

            printer.paper.printLine(linestartx, starty+ (true? 0 : -5), linestartx, starty + (true? 5 : 0) );
            printer.paper.printLine(lineendx, endy+ (true? 0 : -5), lineendx, endy + (true? 5 : 0));
            
            
            //printer.paper.printLine(linestartx, y, (linestartx + lineendx) / 2 - 5, y);
            //printer.paper.printLine((linestartx + lineendx) / 2 + 5, y, lineendx, y);
            
            printer.paper.printBeam( linestartx, starty, (linestartx + lineendx) / 2 - 5, y, (linestartx + lineendx) / 2 - 5, y+1, linestartx, starty+1 );
            printer.paper.printBeam( (linestartx + lineendx) / 2 + 5, y, lineendx, endy, lineendx, endy+1, (linestartx + lineendx) / 2 + 5, y+1 );
        }
        
        var ydelta = ypos + (beam ? ( this.asc ? 2 : -3.5 ) : -1 );
        var xdelta = ( this.anchor1.x + this.anchor2.x + this.anchor1.w + (beam && this.asc ? this.anchor2.w : 0 ) - 2 ) / 2;
        
        printer.printText( xdelta, ydelta, this.number, 'abc_ending', "middle");

    } else {
        waterbug.log( 'Incomplete triplet' );
    }
};

ABCXJS.write.BeamElem = function(type, flat) {
    this.isflat = (flat);
    this.isgrace = (type && type === "grace");
    this.forceup = (type && type === "up");
    this.forcedown = (type && type === "down");
    this.elems = []; // all the ABCXJS.write.AbsoluteElements
    this.total = 0;
    this.dy = (this.asc) ? ABCXJS.write.spacing.STEP * 1.2 : -ABCXJS.write.spacing.STEP * 1.2;
    if (this.isgrace)
        this.dy = this.dy * 0.4;
    this.allrests = true;
};

ABCXJS.write.BeamElem.prototype.add = function(abselem) {
    var pitch = abselem.abcelem.averagepitch;
    if (pitch === undefined)
        return; // don't include elements like spacers in beams
    this.allrests = this.allrests && abselem.abcelem.rest;
    abselem.beam = this;
    this.elems.push(abselem);
    //var pitch = abselem.abcelem.averagepitch;
    this.total += pitch; // TODO CHORD (get pitches from abselem.heads)
    if (!this.min || abselem.abcelem.minpitch < this.min) {
        this.min = abselem.abcelem.minpitch;
    }
    if (!this.max || abselem.abcelem.maxpitch > this.max) {
        this.max = abselem.abcelem.maxpitch;
    }
};

ABCXJS.write.BeamElem.prototype.average = function() {
    try {
        return this.total / this.elems.length;
    } catch (e) {
        return 0;
    }
};

ABCXJS.write.BeamElem.prototype.calcDir = function() {
    var average = this.average();
    this.asc = (this.forceup || this.isgrace || average < 6) && (!this.forcedown); // hardcoded 6 is B
    return this.asc;
};

ABCXJS.write.BeamElem.prototype.getBarYAt = function(x) {
    return this.starty + (this.endy - this.starty) / (this.endx - this.startx) * (x - this.startx);
};

ABCXJS.write.BeamElem.prototype.draw = function(printer) {

    if (this.elems.length === 0 || this.allrests)
        return;
    
    var average = this.average();
    var barpos = (this.isgrace) ? 5 : 7;
    this.calcDir();

    //PER: I just bumped up the minimum height for notes with descending stems to clear a rest in the middle of them.
    var barminpos = this.asc ? 5 : 8;	
    
    this.pos = Math.round(this.asc ? Math.max(average + barpos, this.max + barminpos) : Math.min(average - barpos, this.min - barminpos));
    
    var maxslant = this.elems.length / 2;
    var slant = this.elems[0].abcelem.averagepitch - this.elems[this.elems.length - 1].abcelem.averagepitch;
    
    if (this.isflat ) {
        slant = 0;
    } else  {
        slant = Math.min(slant,maxslant);
        slant = Math.max(slant,-maxslant);
    }

    this.starty = printer.calcY(this.pos + Math.floor(slant / 2));
    this.endy = printer.calcY(this.pos + Math.floor(-slant / 2));
   
    var starthead = this.elems[0].heads[(this.asc) ? 0 : this.elems[0].heads.length - 1];
    var endhead = this.elems[this.elems.length - 1].heads[(this.asc) ? 0 : this.elems[this.elems.length - 1].heads.length - 1];
    this.startx = this.elems[0].x;
    
    if (this.asc)
        this.startx += starthead.w - 0.6;
    
    this.endx = this.elems[this.elems.length - 1].x;
    
    if (this.asc)
        this.endx += endhead.w;

    // PER: if the notes are too high or too low, make the beam go down to the middle
    if ( (this.asc && this.pos < 6) || (!this.asc && this.pos > 6) ){
        this.pos = 6;
        this.starty = printer.calcY(this.pos);
        this.endy = printer.calcY(this.pos);
    }
    
    printer.paper.printBeam(
        this.startx, this.starty
       ,this.startx, (this.starty + this.dy) 
       ,this.endx, (this.endy + this.dy)
       ,this.endx, this.endy
       
    );

    
    this.drawAuxBeams(printer);
};

ABCXJS.write.BeamElem.prototype.drawAuxBeams = function(printer) {
    var auxbeams = [];  // auxbeam will be {x, y, durlog, single} auxbeam[0] should match with durlog=-4 (16th) (j=-4-durlog)
    for (var i = 0, ii = this.elems.length; i < ii; i++) {
        if (this.elems[i].abcelem.rest) continue;
        var furthesthead = this.elems[i].heads[(this.asc) ? 0 : this.elems[i].heads.length - 1];
        var x = this.elems[i].x + ((this.asc) ? furthesthead.w : 0);
        var bary = this.getBarYAt(x);

        var sy = (this.asc) ? 1.5 * ABCXJS.write.spacing.STEP : -1.5 * ABCXJS.write.spacing.STEP;
        if (this.isgrace)
            sy = sy * 2 / 3;
        for (var durlog = ABCXJS.write.getDurlog(this.elems[i].abcelem.duration); durlog < -3; durlog++) { // get the duration via abcelem because of triplets
            if (auxbeams[-4 - durlog]) {
                auxbeams[-4 - durlog].single = false;
            } else {
                auxbeams[-4 - durlog] = {x: x + ((this.asc) ? -0.6 : 0), y: bary + sy * (-4 - durlog + 1),
                    durlog: durlog, single: true};
            }
        }

        for (var j = auxbeams.length - 1; j >= 0; j--) {
            if (i === ii - 1 || ABCXJS.write.getDurlog(this.elems[i + 1].abcelem.duration) > (-j - 4)) {

                var auxbeamendx = x;
                var auxbeamendy = bary + sy * (j + 1);


                if (auxbeams[j].single) {
                    auxbeamendx = (i === 0) ? x + 5 : x - 5;
                    auxbeamendy = this.getBarYAt(auxbeamendx) + sy * (j + 1);
                }
                // TODO I think they are drawn from front to back, hence the small x difference with the main beam
                printer.paper.printBeam(auxbeams[j].x,auxbeams[j].y, auxbeamendx,auxbeamendy,auxbeamendx,(auxbeamendy + this.dy), auxbeams[j].x,(auxbeams[j].y + this.dy));
                auxbeams = auxbeams.slice(0, j);
            }
        }
    }
};
