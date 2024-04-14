"use strict"

/*global window */
if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};
    
window.ABCXJS.parse.rebalance = function ( strTune ) {

    alert( 'A função rebalance é experimental!\n' +
            'O objetivo é alinhar a quantidade de compassos de\n' +
            'melodia e baixos por linha.\n' +
            'A diretiva %%barsperstaff é considerada\n' + 
            'e, na sua ausência, são distribuídos 6 compassos por linha.\n' + 
            'Linebreaks são removidos.\n' + 
            'Espera-se que as vozes V:1 e V:2 bass sejam bem definidas.'
        );

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
    var lines = [];

    var continuationReplacement = function(all, backslash, comment) {
        var spaces = "                                                                                                                                                                                                     ";
        var padding = comment ? spaces.substring(0, comment.length) : "";
        return backslash + " \x12" + padding;
    };

    var split = function( text, maxbars, lineBreak ) {

        var x0 = 0;
        var xi = 0;
        var cnt = 0;
        var bar = true;
        var newLines = [];

        // identifica as barras de compasso
        var barRegex = /(?:[\:\|]|\[\|)+[\:\|\]]{0,}/; 

        // esta variável não interfere na primeira linha retornada, mas a partir do final da primeira linha, 
        // observamos a barra de compasso e projetamos a barra inicial da linha seguinte
        var nextLineBar = '';

        text = text
            // remover lineBreaks do texto
            .replace(new RegExp('(\\'+lineBreak+')', 'gi'), '')
            // substituir '::' por ':|:'
            .replace( /::/g, ':|:'); 

        while (bar) {
            bar = text.substring(xi).match(barRegex);
            if(bar) {
               xi += (bar.index+bar[0].length);
               cnt += 1;
            } else {
                // força a saida
                xi = text.length;
                cnt = maxbars;
            }

            // hora de fazer o split?
            if ( cnt === maxbars ) {
                var bi = '|'; // será a barra inicial da proxima linha
                var bf = ''; // barra final da linha corrente
                var bfl = 0; // comprimento da barra final (antes de qualquer modificação)

                cnt = 0; // reseta a contagem

                // verifica se precisa fazer o split da barra final também.
                if (bar){
                    bf = bar[0];
                    bfl = bf.length;
                    if( bf[bfl-1] === ':' ) { // caso em que faz o split da barra final
                       bi = '|:'
                       bf = bar[0].substring(0,bfl-1);
                    }
                }

                newLines.push( nextLineBar + text.substring(x0, xi-bfl ) + bf );

                x0 = xi;
                nextLineBar = bi;
            }
        }
        return newLines;
    }

    strTune = strTune
        // Take care of whatever line endings come our way
        .replace( /\r\n/g, '\n' )	
        .replace( /\r/g, '\n' )
        // get rid of latex commands.
        .replace(/\n\\.*\n/g, "\n")	
        // take care of line continuations right away, but keep the same number of characters
        .replace(/\\([ \t]*)(%.*)*\n/g, continuationReplacement);	
    
    // garante uma linha em branco no final
    strTune += strTune.charAt(strTune.length-1) === '\n' ? '' : '\n';

    lines = strTune.split('\n');

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
        if (element.includes('linebreak')){
            linebreak = element.substring(element.indexOf(' ')+1);
        }
        if (element.includes('%%barsperstaff')){
            barsperstaff = parseInt( element.substring(element.indexOf(' ')+1));
        }
        if(regularLine && (inBass || inTreble)){
            var commentX = element.indexOf('%');

            commentX = commentX === -1? element.length : commentX;

            if(inBass) {
               liBass = liBass === -1? index : liBass;
               lfBass = index;
               bassText += element.substring(0,commentX);
            } 
            if(inTreble) {
               liTreble = liTreble === -1? index : liTreble;
               lfTreble = index;
               trebleText += element.substring(0,commentX);
            }
        }
    }

    var newTrebleLines = split( trebleText, barsperstaff, linebreak );
    var newBassLines = split( bassText, barsperstaff, linebreak );

    let newText = [
        ...lines.slice(0, liTreble),
        ...newTrebleLines,
        ...lines.slice(lfTreble + 1, liBass),
        ...newBassLines,
        ...lines.slice(lfBass + 1)
    ];

    return newText.join('\n')
    
};
