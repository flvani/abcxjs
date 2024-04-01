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
               bassText += element.substring(0,commentX);
            } else if( inTreble){
               trebleText += element.substring(0,commentX);
            }
        }
    }

    // remove the blank lines at the end.
    while( window.ABCXJS.parse.last(lines).length === 0 )	
        lines.pop();
    
    return lines;
    
};
