/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.tablature)
	window.ABCXJS.tablature = {};
    
ABCXJS.tablature.Layout = function( tuneCurrVoice, tuneCurrStaff, abcstaff, glyphs, restsInTab  ) {
   this.pos = 0;
   this.voice = {};
   this.currvoice = [];
   this.tuneCurrVoice = tuneCurrVoice;
   this.tuneCurrStaff = tuneCurrStaff;
   this.abcstaff = abcstaff;
   this.glyphs = glyphs;
   this.restsInTab = restsInTab;
   this.tripletmultiplier = 1;
};

ABCXJS.tablature.Layout.prototype.getElem = function() {
    if (this.currVoice.length <= this.pos)
        return null;
    return this.currVoice[this.pos];
};

ABCXJS.tablature.Layout.prototype.isFirstVoice = function() {
    return this.currVoice.firstVoice || false;
};

ABCXJS.tablature.Layout.prototype.isLastVoice = function() {
    return this.currVoice.lastVoice || false;
};

ABCXJS.tablature.Layout.prototype.printTABVoice = function(layoutJumpDecorationItem) {
    this.layoutJumpDecorationItem = layoutJumpDecorationItem;
    this.currVoice = this.abcstaff.voices[this.tuneCurrVoice];
    this.voice = new ABCXJS.write.VoiceElement(this.tuneCurrVoice, this.tuneCurrStaff, this.abcstaff);

    this.voice.addChild(this.printClef(this.abcstaff.clef));
    this.voice.addChild(new ABCXJS.write.AbsoluteElement(this.abcstaff.key, 0, 10));
    (this.abcstaff.meter) && this.voice.addChild(this.printTablatureSignature(this.abcstaff.meter));
    for (this.pos = 0; this.pos < this.currVoice.length; this.pos++) {
        var abselems = this.printTABElement();
        for (i = 0; i < abselems.length; i++) {
            this.voice.addChild(abselems[i]);
        }
    }
    return this.voice;
};

// return an array of ABCXJS.write.AbsoluteElement
ABCXJS.tablature.Layout.prototype.printTABElement = function() {
  var elemset = [];
  var elem = this.getElem();
  
  switch (elem.el_type) {
  case "note":
    elemset[0] = this.printTabNote(elem);
    break;
  case "bar":
    elemset[0] = this.printBarLine(elem);
    if (this.voice.duplicate) elemset[0].invisible = true;
    break;
  default: 
    var abselem = new ABCXJS.write.AbsoluteElement(elem,0,0);
    abselem.addChild(new ABCXJS.write.RelativeElement("element type "+elem.el_type, 0, 0, 0, {type:"debug"}));
    elemset[0] = abselem;
  }

  return elemset;
};

ABCXJS.tablature.Layout.prototype.printTabNote = function(elem) {
    var p, pp;
    
    if (elem.startTriplet)  {
        this.tripletmultiplier = elem.startTriplet.num === 2 ? 1.5 : (elem.startTriplet.num-1)/elem.startTriplet.num;
    }
    
    var duration = ABCXJS.write.getDuration(elem);
    if (duration === 0) {
        duration = 0.25;
    }   // PER: zero duration will draw a quarter note head.
    var durlog = ABCXJS.write.getDurlog(duration);
    var abselem = new ABCXJS.write.AbsoluteElement(elem, duration*this.tripletmultiplier, 1);

    // determine averagepitch, minpitch, maxpitch and stem direction
    var sum = 0;
    var allRests = true;
    
    for (p = 0, pp = elem.pitches.length; p < pp; p++) {
        sum += elem.pitches[p].verticalPos;
        allRests = (elem.pitches[p].type === 'rest' && allRests);
    }

    elem.averagepitch = sum / elem.pitches.length;
    elem.minpitch = elem.pitches[0].verticalPos;
    elem.maxpitch = elem.pitches[elem.pitches.length - 1].verticalPos;

    for (p = 0; p < elem.pitches.length; p++) {
        var curr = elem.pitches[p];
        var rel = new ABCXJS.write.RelativeElement(null, 0, 0, curr.pitch);
        if (curr.type === "rest" ) {
            rel.type = "symbol";
            if(this.restsInTab || (allRests && p === (elem.pitches.length-1))) {
                rel.c = 'scripts.tabrest';
            } else {
                rel.c = '';
            }
        } else {
            rel.c = curr.c.replace('m', '-');
            rel.note = curr.note;
            rel.type = curr.type;
        }
        abselem.addHead(rel);
    }
    
    if( elem.endTriplet ) {
        this.tripletmultiplier =1;
    }

    return abselem;
};

ABCXJS.tablature.Layout.prototype.printClef = function(elem) {
  var clef = "clefs.tab";
  var dx = 8;
  var abselem = new ABCXJS.write.AbsoluteElement(elem,0,10);
  abselem.addRight(new ABCXJS.write.RelativeElement(clef, dx, this.glyphs.getSymbolWidth(clef), elem.clefPos)); 
  return abselem;
};

ABCXJS.tablature.Layout.prototype.printTablatureSignature= function(elem) {
  var abselem = new ABCXJS.write.AbsoluteElement(elem,0,20);
  var dx = 2;
  
  abselem.addRight(new ABCXJS.write.RelativeElement('Bass', dx, 15, 17.5, {type:"tabText"} ) );
  abselem.addRight(new ABCXJS.write.RelativeElement('>><<', dx, 15, 10.8, {type:"tabText"} ) );
  abselem.addRight(new ABCXJS.write.RelativeElement('<<>>', dx, 15,  3.7, {type:"tabText"} ) );
  
  this.startlimitelem = abselem; // limit ties here
  return abselem;
};

ABCXJS.tablature.Layout.prototype.printBarLine = function (elem) {
// bar_thin, bar_thin_thick, bar_thin_thin, bar_thick_thin, bar_right_repeat, bar_left_repeat, bar_double_repeat

    var topbar = 19.5;
    var yDot = 10.5;

    var abselem = new ABCXJS.write.AbsoluteElement(elem, 0, 10);
    var anchor = null; // place to attach part lines
    var dx = 0;


    var firstdots = (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat");
    var firstthin = (elem.type !== "bar_left_repeat" && elem.type !== "bar_thick_thin" && elem.type !== "bar_invisible");
    var thick = (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat" || elem.type === "bar_left_repeat" ||
            elem.type === "bar_thin_thick" || elem.type === "bar_thick_thin");
    var secondthin = (elem.type === "bar_left_repeat" || elem.type === "bar_thick_thin" || elem.type === "bar_thin_thin" || elem.type === "bar_dbl_repeat");
    var seconddots = (elem.type === "bar_left_repeat" || elem.type === "bar_dbl_repeat");

    // limit positioning of slurs
    if (firstdots || seconddots) {
        for (var slur in this.slurs) {
            if (this.slurs.hasOwnProperty(slur)) {
                this.slurs[slur].endlimitelem = abselem;
            }
        }
        this.startlimitelem = abselem;
    }

    if (firstdots) {
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot + 2));
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot));
        dx += 6; //2 hardcoded, twice;
    }

    if (firstthin) {
        anchor = new ABCXJS.write.RelativeElement(null, dx, 1, 0, {"type": "bar", "pitch2": topbar, linewidth: 0.6});
        abselem.addRight(anchor);
    }

    if (elem.type === "bar_invisible" || elem.endDrawEnding) {
        anchor = new ABCXJS.write.RelativeElement(null, dx, 1, 0, {"type": "none", "pitch2": topbar, linewidth: 0.6});
        abselem.addRight(anchor);
    }

    if (elem.decoration) {
        // não há decorations na tablatura
        //this.printDecoration(elem.decoration, 12, (thick)?3:1, abselem, 0, "down", 2);
    }
    
    if (elem.jumpDecoration) {
        for(var j=0; j< elem.jumpDecoration.length; j++ ) {
            if(( elem.jumpDecoration[j].upper && this.isFirstVoice() ) || ( !elem.jumpDecoration[j].upper && this.isLastVoice() ) ) {
                var pitch = elem.jumpDecoration[j].upper ? 12 : -4;
                abselem.addRight( this.layoutJumpDecorationItem(elem.jumpDecoration[j], pitch) );
            }
        }
    }
                
    if (thick) {
        dx += 4; //3 hardcoded;    
        anchor = new ABCXJS.write.RelativeElement(null, dx, 4, 0, {"type": "bar", "pitch2": topbar, linewidth: 4});
        abselem.addRight(anchor);
        dx += 5;
    }

    if (this.partstartelem && elem.endDrawEnding) {
        if (elem.endDrawEnding)
            this.partstartelem.anchor2 = anchor;
        if (elem.endEnding)
            this.partstartelem = null;
    }

    if (secondthin) {
        dx += 3; //3 hardcoded;
        anchor = new ABCXJS.write.RelativeElement(null, dx, 1, 0, {"type": "bar", "pitch2": topbar, linewidth: 0.6});
        abselem.addRight(anchor); // 3 is hardcoded
    }

    if (seconddots) {
        dx += 3; //3 hardcoded;
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot + 2));
        abselem.addRight(new ABCXJS.write.RelativeElement("dots.dot", dx, 1, yDot));
    } // 2 is hardcoded

    if (elem.startEnding) {
        this.partstartelem = new ABCXJS.write.EndingElem(elem.startEnding, anchor, null);
        this.voice.addOther(this.partstartelem);
    }

    return abselem;

};
