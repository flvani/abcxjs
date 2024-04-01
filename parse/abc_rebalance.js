/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict"

/*global window */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};
    
window.ABCXJS.parse.rebalance = function ( text ) {
    var strTune = text;
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
    
    // take care of line continuations right away, but keep the same number of characters
    strTune = strTune.replace(/\\([ \t]*)(%.*)*\n/g, continuationReplacement);	
    
    var lines = strTune.split('\n');

    var barsperstaff = 6;
    var linebreak ='$'
    var inTreble = false;
    var inBass= false;
    var trebleText =''
    var bassText =''
    var regularLine = true;
    var liTreble = -1;
    var lfTreble = -1;
    var liBass = -1;
    var lfBass = -1;

    for (let index = 0; index < lines.length; index++){
        const element = lines[index];
        if (element.match(/^[V]:.*/)){
            if( element.includes('bass') ){
                inBass = true;
                inTreble = false;
            } else {
                inBass = false;
                inTreble = true;
            }
            // antes de continuar, verificar se V inline
            continue;
        }
        if(regularLine && (inBass || inTreble)){
            var commentX = element.indexOf('%');

            commentX = commentX === -1? element.length : commentX;

            if(inBass) {
               liBass = liBass === -1? index : liBass;
               lfBass = index;
               bassText += element.substring(0,commentX);
            } else if( inTreble){
               liTreble = liTreble === -1? index : liTreble;
               lfTreble = index;
               trebleText += element.substring(0,commentX);
            }
        }
    }

    var bar = trebleText.match(/[:\]\|[\[]+(?![\]:\[\|])/)
    var xi = 0;
    while (bar) {
        var i = trebleText.indexOf(bar);
        xi += (i+bar.length);
        bar = trebleText.substring(xi).match(/[:\]\|[\[]+(?![\]:\[\|])/)
    }


/*

ABCXJS.tablature.Parse.prototype.parseMultiCharToken = function (syms) {
    while (this.i < this.line.length && syms.indexOf(this.line.charAt(this.i)) >= 0) {
        this.i++;
    }
};
    this.parseMultiCharToken(this.barSyms);

 this.barSyms = ":]|[";

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


    // remove the blank lines at the end.

    while( window.ABCXJS.parse.last(lines).length === 0 )	
        lines.pop();
*/    
    return lines;
    
};
