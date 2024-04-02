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
    var trebleText ='';
    var bassText ='';
    var regularLine = true;
    var liTreble = -1;
    var lfTreble = -1;
    var liBass = -1;
    var lfBass = -1;
    var regex = /[:\]\|[\[]+(?![\]:\[\|])/;

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
               var liBass =  index;
               //liBass = liBass === -1? index : liBass;
               lfBass = index;
               bassText += element.substring(0,commentX);
            } 
            if( inTreble){
               liTreble = liTreble === -1? index : liTreble;
               lfTreble = index;
               trebleText += element.substring(0,commentX);
            }
        }
    }

    var split = function( text, regex, maxbars ) {
        var xi = 0;
        var x0 = 0;
        var x1 = 0;
        var cnt = 0;
        var newLines = [];
        var bar = text.substring(xi).match(regex);
        while (bar) {
            bar = text.substring(xi).match(regex);
            if(bar) {
               xi += (bar.index+bar[0].length);
               if( bar[0] !== '[' && bar[0] !== ']' && bar[0] !== ']['){
                    //somente conta se for uma barra válida - melhorar a expresão de procura
                    cnt += 1;
               }
            } else {
                // força a saida
                xi = text.length;
                cnt = maxbars;
            }
            if ( cnt === maxbars ) {
                cnt = 0;
                x1 = xi;
                newLines.push( text.substring(x0, x1) )
                x0=x1;
            }
        }
        return newLines;
    }

    var newTrebleLines = split( trebleText, regex, barsperstaff );
    var newBassLines = split( bassText, regex, barsperstaff );

    // Interrompe A em n1 e insere elementos de B
    var nl = lines.splice(0, liTreble)
                .concat(newTrebleLines)
                .concat( lines.splice(lfTreble,liBass) )
                .concat(newBassLines)
                .concat( lines.splice(lfBass ) );
    
    return lines;
    
};
