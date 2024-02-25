//    abc_tune.js: a computer usable internal structure representing one tune.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
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

/*global window */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.data)
    window.ABCXJS.data = {};

// This is the data for a single ABC tune. It is created and populated by the window.ABCXJS.parse.Parse class.
window.ABCXJS.data.Tune = function() {
    // The structure consists of a hash with the following two items:
    // metaText: a hash of {key, value}, where key is one of: title, author, rhythm, source, transcription, unalignedWords, etc...
    // tempo: { noteLength: number (e.g. .125), bpm: number }
    // lines: an array of elements, or one of the following:
    //      STAFFS: array of elements
    //      SUBTITLE: string - flavio removed this kind of line (it is now one of the staff's attributes)
    //
    // TODO: actually, the start and end char should modify each part of the note type
    // The elements all have a type field and a start and end char
    // field. The rest of the fields depend on the type and are listed below:
    // REST: duration=1,2,4,8; chord: string
    // NOTE: accidental=none,dbl_flat,flat,natural,sharp,dbl_sharp
    //		pitch: "C" is 0. The numbers refer to the pitch letter.
    //		duration: .5 (sixteenth), .75 (dotted sixteenth), 1 (eighth), 1.5 (dotted eighth)
    //			2 (quarter), 3 (dotted quarter), 4 (half), 6 (dotted half) 8 (whole)
    //		chord: { name:chord, position: one of 'default', 'above', 'below' }
    //		end_beam = true or undefined if this is the last note in a beam.
    //		lyric: array of { syllable: xxx, divider: one of " -_" }
    //		startTie = true|undefined
    //		endTie = true|undefined
    //		startTriplet = {num <- the number to print, notes <- total elements} 
    //		endTriplet = true|undefined (the last note of the triplet)
    // TODO: actually, decoration should be an array.
    //		decoration: upbow, downbow, accent
    // BAR: type=bar_thin, bar_thin_thick, bar_thin_thin, bar_thick_thin, bar_right_repeat, bar_left_repeat, bar_double_repeat
    //	number: 1 or 2: if it is the start of a first or second ending
    // CLEF: type=treble,bass,accordionTab
    // KEY-SIG:
    //		accidentals[]: { acc:sharp|dblsharp|natural|flat|dblflat,  note:a|b|c|d|e|f|g }
    // METER: type: common_time,cut_time,specified
    //		if specified, { num: 99, den: 99 }
    
    this.reset = function() {
        this.metaText = {};
        this.formatting = {};
        this.lines = [];
        this.media = "screen";
        this.version = "1.0.1";
        this.subtitle = "";
        this.tabStaffPos = -1;
        this.hasTablature = false;
        this.staffNum = 0;
        this.voiceNum = 0;
        this.lineNum = 0;
    };
    
    this.setFormat = function(vars) {
        var ph, pw;
        var ss = vars.staffsep|| 0;
        var ps = (vars.papersize || 'a4').toLowerCase();
        var ls = vars.landscape || false;
        var pn = vars.pagenumbering || false;
        
        // inicialmente se usava 72dpi. 
        // atualmente qualquer impressora, imprime no mínimo em 300dpi
        // como é apenas um número, vou garantir que a largura de tela de pelo menos 1024 pontos
        // considerada a largura do papel a4, menos 1cm de margem em cada lado
        var dpi = 136.8508560545; //72;
        
        var defaultMargin = 1; // cm
        var defaultMarginDPI = defaultMargin / 2.54 * dpi; // (1cm / 1 inch * dots.per.inch)
                
        switch (ps) {
            case "letter":
                ph = 11 * dpi;
                pw = 8.5 * dpi;
                break;
            case "legal":
                ph = 14 * dpi;
                pw = 8.5 * dpi;
                break;
            case "screen":
                ph = 16 * dpi;
                pw = 8 * dpi;
                break;
            case "a4":
            default:    
                ph = 11.69 * dpi;
                pw = 8.27 * dpi;
                break;
        }
        
        if (ls) { // landscape
            var x = ph;
            ph = pw;
            pw = x;
        }
        
        // para garantir que a largura da estaff nunca seja maior que a proporcao gerada por pageratio (para não forçara impressora a reduzir a impressao)
        // também garante um zoom de 20% na impressão em landscape, reduzindo o largura útil e forçando a impressora a imprimir com zoom
        this.formatting.usablewidth = (pw-(2*defaultMarginDPI)) * (ls? 0.82 : 1);

        // para estimar o comprimento da página
        this.formatting.pageratio = (ph-(2*defaultMarginDPI))/(pw-(2*defaultMarginDPI));
        
        
        if (!this.formatting.landscape)         this.formatting.landscape = ls;
        if (!this.formatting.papersize)             this.formatting.papersize = ps.toLowerCase();
        if (!this.formatting.defaultMargin)         this.formatting.defaultMargin = ''+defaultMargin+'cm';
        if (!this.formatting.pagewidth)             this.formatting.pagewidth = pw;
        if (!this.formatting.pageheight)            this.formatting.pageheight = ph;
        if (!this.formatting.pagenumbering)         this.formatting.pagenumbering = pn;
        if (!this.formatting.staffsep)              this.formatting.staffsep = ss;
        if (!this.formatting.barsperstaff)          this.formatting.barsperstaff = vars.barsperstaff;
        if (!this.formatting.staffwidth)            this.formatting.staffwidth = this.formatting.usablewidth;
        if (!this.formatting.tabInferenceOpts )     this.formatting.tabInferenceOpts = +1;
        if (!this.formatting.restsInTab )           this.formatting.restsInTab = false;

        //aqui temos diretivas que também serão opções de tela. 
        //por definição, a diretiva terá precedência sobre as opções de tela        
        if (!this.formatting.hideLyrics )           this.formatting.hideLyrics = vars.hideLyrics || false;
        if (!this.formatting.hideFingering )        this.formatting.hideFingering = vars.hideFingering || false;
        //if (!this.formatting.tabprintrowsnumbered ) this.formatting.tabprintrowsnumbered = vars.ilheirasNumeradas || false;
        
    };
    
    this.handleBarsPerStaff = function() {
        function splitBar(left, right) {
            
            // divide as decorações de jump
            if( left.jumpDecoration ) {
                var jd = window.ABCXJS.parse.clone(left.jumpDecoration);
                delete left.jumpDecoration;
                delete right.jumpDecoration;
                for(var j=0; j< jd.length; j ++ ) {
                    if( (".coda.fine.dacapo.dacoda.dasegno.").indexOf('.'+jd[j].type+'.') >= 0 ) {
                        left.jumpDecoration = left.jumpDecoration || [];
                        left.jumpDecoration.push( jd[j] ); 
                    } else {
                        right.jumpDecoration = right.jumpDecoration || [];
                        right.jumpDecoration.push( jd[j] ); 
                        
                    }
                }
            }    
                
            // todos os jumpInfo ficam a esquerda do split
            // exceto segno todos os jumpPoint ficam a esquerda do split
            if(  left.jumpPoint && left.jumpPoint.type === 'segno'  ) {
                delete left.jumpInfo;
            }
            // todos os jumpInfo ficam a esquerda do split
            if(  right.jumpInfo ) {
                delete right.jumpInfo;
            }
            // exceto segno todos os jumpPoint ficam a esquerda do split
            if(  right.jumpPoint &&  right.jumpPoint.type !== 'segno'  ) {
                delete right.jumpInfo;
            }
            
            
            delete left.startEnding;
            delete left.barNumber;
            delete left.barNumberVisible;
            switch( left.type ) {
                case 'bar_dbl_repeat': 
                case 'bar_right_repeat': 
                   left.type = 'bar_right_repeat';
                   break;
                case 'bar_thin': 
                case 'bar_left_repeat':
                  left.type = 'bar_thin'; 
            }
            
            delete right.endEnding;
            delete right.endDrawEnding;
            switch( right.type ) {
                case 'bar_dbl_repeat': 
                case 'bar_left_repeat': 
                   right.type = 'bar_left_repeat';
                   break;
                case 'bar_thin': 
                case 'bar_right_repeat':
                  right.type = 'bar_thin'; 
            }
        };
        
        function joinBar(left, right) {
            if(right === undefined ) {
                return;
            }
            
            // flavio - não verificado
            if(right.jumpPoint) {
                left.jumpPoint = right.jumpPoint;
            }
            
            // flavio - não verificado
            if(right.jumpInfo) {
                left.jumpInfo = right.jumpInfo;
            }
            
            if( right.jumpDecoration ) {
                for(var j=0; j< right.jumpDecoration.length; j ++ ) {
                    left.jumpDecoration = left.jumpDecoration || [];
                    left.jumpDecoration.push( right.jumpDecoration[j] ); 
                }
            }
            
            if(right.startEnding){
                left.startEnding = right.startEnding;
            }
            
            if(right.barNumber){
                left.barNumber = right.barNumber;
                left.barNumberVisible = right.barNumberVisible;
            }

            if( left.type === 'bar_right_repeat' ) {
                left.type  = right.type === 'bar_left_repeat'?'bar_dbl_repeat':'bar_right_repeat';
            } else {
                left.type  = right.type === 'bar_left_repeat'?'bar_left_repeat':'bar_thin';
            }
        };

        
        if (!this.formatting.barsperstaff) return;
        
        var limite = this.formatting.barsperstaff + 1; // assumir n compassos === n + 1 bars
        var split_pos = 0, original_bar;
        var nextline = 0;
                
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].staffs !== undefined) {
                nextline = (this.lines[i+1]=== undefined || this.lines[i+1].staffs !== undefined)? i+1 : i+2; // assume que não há duas linhas newpage em seguida
                for (var s = 0; s < this.lines[i].staffs.length; s++) {
                    for (var v = 0; v < this.lines[i].staffs[s].voices.length; v++) {
                        var barNumThisLine = 0;
                        for (var n = 0; n < this.lines[i].staffs[s].voices[v].length; n++) {
                            if(this.lines[i].staffs[s].voices[v][n].el_type === 'bar') {
                               barNumThisLine ++;
                               if(limite===barNumThisLine) {
                                   split_pos = n;
                                   original_bar = this.lines[i].staffs[s].voices[v][n].type;
                               }
                            }
                            if( n === this.lines[i].staffs[s].voices[v].length-1 && barNumThisLine < limite && i < this.lines.length - 1){
                                //fim da voz, quantidade de compassos inferior ao limite e existe linhas baixo = unir com a linha de baixo
                                var cp = JSON.parse(JSON.stringify(this.lines[nextline]));
                                this.lines.splice(nextline,1);
                                for (var ss = 0; ss < this.lines[i].staffs.length; ss++) {
                                    for (var vv = 0; vv < this.lines[i].staffs[ss].voices.length; vv++){
                                        var section1 = this.lines[i].staffs[ss].voices[vv];
                                        var section2 = cp.staffs[ss].voices[vv].splice(1);
                                        joinBar(section1[section1.length-1], cp.staffs[ss].voices[vv][0] );
                                        this.lines[i].staffs[ss].voices[vv] = section1.concat(section2);
                                        
                                        //trata lyricsRows, garantido que a maior quantidade prevaleça na linha previa
                                        try {
                                            var mlr = Math.max( this.lines[i].staffs[ss].lyricsRows, this.lines[nextline].staffs[ss].lyricsRows );
                                            this.lines[i].staffs[ss].lyricsRows = mlr;
                                        }catch(e){
                                          
                                        }
                                    }
                                }
                            }
                        }    
                        var excesso = barNumThisLine - limite;
                        var ultimaLinha = (i === this.lines.length - 1 );

                        // move o excesso para a proxima linha.
                        // no caso da última linha, só se sobrar mais de 1 compasso.
                        if( (!ultimaLinha && excesso > 0 ) || ( ultimaLinha && excesso > 1 )) {
                            // se necessário cria uma nova linha.
                            if ( ultimaLinha ) {
                                var cp = JSON.parse(JSON.stringify(this.lines[i]));
                                this.lines.push(window.ABCXJS.parse.clone(cp));
                                for (var ss = 0; ss < this.lines[i + 1].staffs.length; ss++) {
                                    for (var vv = 0; vv < this.lines[i + 1].staffs[ss].voices.length; vv++)
                                        this.lines[nextline].staffs[ss].voices[vv] = [];
                                }
                            }

                            var section1 = this.lines[i].staffs[s].voices[v].slice(0, split_pos+1);
                            var section2 = this.lines[i].staffs[s].voices[v].slice(split_pos);
                            var section3 = this.lines[nextline].staffs[s].voices[v].slice(1);
                            
                            section2[0] = window.ABCXJS.parse.clone(section2[0]);

                            splitBar( section1[section1.length-1], section2[0] );
                            joinBar( section2[section2.length-1], this.lines[nextline].staffs[s].voices[v][0] );

                            this.lines[i].staffs[s].voices[v] = section1;
                            this.lines[nextline].staffs[s].voices[v] = section2.concat(section3);
                            
                            //trata lyricsRows, garantido que a maior quantidade prevaleça na nova linha
                            var mlr = Math.max( this.lines[i].staffs[s].lyricsRows, this.lines[nextline].staffs[s].lyricsRows );
                            this.lines[nextline].staffs[s].lyricsRows = mlr;

                        }
                    }
                }
            }
        }
    };
    
    this.checkJumpMarkers = function (addWarning) {
        // esta rotina:
        //   cria uma estrutura de auxilio para midi parser
        //   ajuda no layout dos jump markers que devem impressos na última pauta de cada staff
        //   verifica a conformidade das barras de compasso da primeira voz com as demais;
        //
        // Note: deveria ser chamada somente depois de handleBarsPerStaff que pode alterar os arrays gerados no parse.
        
        // identifica as vozes varrendo a primeira linha com staffs
        var vozes = [];
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].staffs !== undefined) {
                for (var s = 0; s < this.lines[i].staffs.length; s++) {
                    for (var v = 0; v < this.lines[i].staffs[s].voices.length; v++) {
                        vozes.push( {el:0, sf: s, vc: v });
                    }
                }
                break;
            }
        }
        
        // voz referencial        
        var v0 = vozes[0]; // primeira
        var vn = vozes[vozes.length-1]; // última
        
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].staffs !== undefined) {

                for( var r = 0; r < vozes.length; r++){
                    vozes[r].el = 0; // sempre recomeçar a varredura dos elementos em cada nova linha
                }

                // talvez por conta da auto atualização isso acconteca - verificar problemas mais adiante
                if(!this.lines[i].staffs[v0.sf] || !this.lines[i].staffs[vn.sf] ) continue;
                
                this.lines[i].staffs[v0.sf].voices[v0.vc].firstVoice = true;
                this.lines[i].staffs[vn.sf].voices[vn.vc].lastVoice = true;
                
                if( vozes.length < 2 ) continue; // apenas marca a única voz como primeira e última, em cada linha
                
                var a0 = this.lines[i].staffs[v0.sf].voices[v0.vc];
                
                while( v0.el < a0.length ) {
                    
                    while( v0.el < a0.length && a0[v0.el].el_type !== 'bar' ) {
                        v0.el++;
                    }

                    if( ! a0[v0.el] || a0[v0.el].el_type !== 'bar' ) break;

                    var bar = a0[v0.el];
                    v0.el++; 

                    for( var v = 1; v < vozes.length; v++ ) {
                        var vi = vozes[v];
                        var ai = this.lines[i].staffs[vi.sf].voices[vi.vc];
                        
                        while( vi.el < ai.length && ai[vi.el].el_type !== 'bar' ) {
                            vi.el++;
                        }
                        if( ! ai[vi.el] || ai[vi.el].el_type !== 'bar' ) {
                            addWarning('Line: '+(i+1)+', Staff: '+(vi.sf+1)+' - Numero de barras diferente da primeira voz');
                        } else {

                            var bari = ai[vi.el];
                            vi.el++;

                            if( bar.type !== bari.type  || bar.repeat !== bari.repeat )  {
                                addWarning('Line: '+(i+1)+', Staff: '+(vi.sf+1)+' - Ajustando tipo de barra de compasso '+bar.barNumber+'.');
                                bari.type = bar.type;
                                bari.repeat = bar.repeat;
                            }

                            if( bar.startEnding && bar.startEnding !== bari.startEnding )  {
                                addWarning('Line: '+(i+1)+', Staff: '+(vi.sf+1)+' - Ajustando ending do compasso '+bar.barNumber+'.');
                                bari.startEnding = bar.startEnding;
                            }
                            
                            if( bar.endEnding && bar.endEnding !== bari.endEnding )  {
                                addWarning('Line: '+(i+1)+', Staff: '+(vi.sf+1)+' - Ajustando ending do compasso '+bar.barNumber+'.');
                                bari.endEnding = bar.endEnding;
                            }
                            
                            // todas as vozes terão a mesma informação de jump
                            bari.jumpPoint = bar.jumpPoint;
                            bari.jumpInfo = bar.jumpInfo;
                            bari.jumpDecoration = bar.jumpDecoration;
                        }
                    }
                }
            }
        }

    };


    this.cleanUp = function() {
        
        function cleanUpSlursInLine(line) {
            var currSlur = [];
            var x;

            var addEndSlur = function(obj, num, chordPos) {
                if (currSlur[chordPos] === undefined) {
                    // There isn't an exact match for note position, but we'll take any other open slur.
                    for (x = 0; x < currSlur.length; x++) {
                        if (currSlur[x] !== undefined) {
                            chordPos = x;
                            break;
                        }
                    }
                    if (currSlur[chordPos] === undefined) {
                        var offNum = chordPos * 100;
                        window.ABCXJS.parse.each(obj.endSlur, function(x) {
                            if (offNum === x)
                                --offNum;
                        });
                        currSlur[chordPos] = [offNum];
                    }
                }
                var slurNum;
                for (var i = 0; i < num; i++) {
                    slurNum = currSlur[chordPos].pop();
                    obj.endSlur.push(slurNum);
                }
                if (currSlur[chordPos].length === 0)
                    delete currSlur[chordPos];
                return slurNum;
            };

            var addStartSlur = function(obj, num, chordPos, usedNums) {
                obj.startSlur = [];
                if (currSlur[chordPos] === undefined) {
                    currSlur[chordPos] = [];
                }
                var nextNum = chordPos * 100 + 1;
                for (var i = 0; i < num; i++) {
                    if (usedNums) {
                        window.ABCXJS.parse.each(usedNums, function(x) {
                            if (nextNum === x)
                                ++nextNum;
                        });
                        window.ABCXJS.parse.each(usedNums, function(x) {
                            if (nextNum === x)
                                ++nextNum;
                        });
                        window.ABCXJS.parse.each(usedNums, function(x) {
                            if (nextNum === x)
                                ++nextNum;
                        });
                    }
                    window.ABCXJS.parse.each(currSlur[chordPos], function(x) {
                        if (nextNum === x)
                            ++nextNum;
                    });
                    window.ABCXJS.parse.each(currSlur[chordPos], function(x) {
                        if (nextNum === x)
                            ++nextNum;
                    });

                    currSlur[chordPos].push(nextNum);
                    obj.startSlur.push({label: nextNum});
                        
                    nextNum++;
                }
            };

            for (var i = 0; i < line.length; i++) {
                var el = line[i];
                if (el.el_type === 'note') {
                    if (el.gracenotes) {
                        for (var g = 0; g < el.gracenotes.length; g++) {
                            if (el.gracenotes[g].endSlur) {
                                var gg = el.gracenotes[g].endSlur;
                                el.gracenotes[g].endSlur = [];
                                for (var ggg = 0; ggg < gg; ggg++)
                                    addEndSlur(el.gracenotes[g], 1, 20);
                            }
                            if (el.gracenotes[g].startSlur) {
                                x = el.gracenotes[g].startSlur;
                                addStartSlur(el.gracenotes[g], x, 20);
                            }
                        }
                    }
                    if (el.endSlur) {
                        x = el.endSlur;
                        el.endSlur = [];
                        addEndSlur(el, x, 0);
                    }
                    if (el.startSlur) {
                        x = el.startSlur;
                        addStartSlur(el, x, 0);
                    }
                    if (el.pitches) {
                        var usedNums = [];
                        for (var p = 0; p < el.pitches.length; p++) {
                            if (el.pitches[p].endSlur) {
                                var k = el.pitches[p].endSlur;
                                el.pitches[p].endSlur = [];
                                for (var j = 0; j < k; j++) {
                                    var slurNum = addEndSlur(el.pitches[p], 1, p + 1);
                                    usedNums.push(slurNum);
                                }
                            }
                        }
                        for (p = 0; p < el.pitches.length; p++) {
                            if (el.pitches[p].startSlur) {
                                x = el.pitches[p].startSlur;
                                addStartSlur(el.pitches[p], x, p + 1, usedNums);
                            }
                        }
                        // Correct for the weird gracenote case where ({g}a) should match.
                        // The end slur was already assigned to the note, and needs to be moved to the first note of the graces.
                        if (el.gracenotes && el.pitches[0].endSlur && el.pitches[0].endSlur[0] === 100 && el.pitches[0].startSlur) {
                            if (el.gracenotes[0].endSlur)
                                el.gracenotes[0].endSlur.push(el.pitches[0].startSlur[0].label);
                            else
                                el.gracenotes[0].endSlur = [el.pitches[0].startSlur[0].label];
                            if (el.pitches[0].endSlur.length === 1)
                                delete el.pitches[0].endSlur;
                            else if (el.pitches[0].endSlur[0] === 100)
                                el.pitches[0].endSlur.shift();
                            else if (el.pitches[0].endSlur[el.pitches[0].endSlur.length - 1] === 100)
                                el.pitches[0].endSlur.pop();
                            if (currSlur[1].length === 1)
                                delete currSlur[1];
                            else
                                currSlur[1].pop();
                        }
                    }
                }
            }
        }

        // TODO-PER: This could be done faster as we go instead of as the last step.
        function fixClefPlacement(el) {
            window.ABCXJS.parse.parseKeyVoice.fixClef(el);
        }
        
        this.closeLine();	// Close the last line.

        // Remove any blank lines
        var anyDeleted = false;
        var i, s, v;
        for (i = 0; i < this.lines.length; i++) {
            if (this.lines[i].staffs !== undefined) {
                var hasAny = false;
                for (s = 0; s < this.lines[i].staffs.length; s++) {
                    if (this.lines[i].staffs[s] === undefined) {
                        anyDeleted = true;
                        this.lines[i].staffs[s] = null;
                    } else {
                        delete this.lines[i].staffs[s].workingClef; // not necessary anymore
                        for (v = 0; v < this.lines[i].staffs[s].voices.length; v++) {
                            if (this.lines[i].staffs[s].voices[v] === undefined)
                                this.lines[i].staffs[s].voices[v] = [];	// TODO-PER: There was a part missing in the abc music. How should we recover?
                            else
                            if (this.containsNotes(this.lines[i].staffs[s].voices[v]))
                                hasAny = true;
                        }
                    }
                }
                if (!hasAny) {
                    this.lines[i] = null;
                    anyDeleted = true;
                }
            }
        }
        
        if (anyDeleted) {
            this.lines = window.ABCXJS.parse.compact(this.lines);
            window.ABCXJS.parse.each(this.lines, function(line) {
                if (line.staffs)
                    line.staffs = window.ABCXJS.parse.compact(line.staffs);
            });
        }
        
        for (this.lineNum = 0; this.lineNum < this.lines.length; this.lineNum++) {
            if (this.lines[this.lineNum].staffs)
                for (this.staffNum = 0; this.staffNum < this.lines[this.lineNum].staffs.length; this.staffNum++) {
                    if (this.lines[this.lineNum].staffs[this.staffNum].clef)
                        fixClefPlacement(this.lines[this.lineNum].staffs[this.staffNum].clef);
                    for (this.voiceNum = 0; this.voiceNum < this.lines[this.lineNum].staffs[this.staffNum].voices.length; this.voiceNum++) {
                        cleanUpSlursInLine(this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum]);
                        for (var j = 0; j < this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum].length; j++)
                            if (this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum][j].el_type === 'clef')
                                fixClefPlacement(this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum][j]);
                    }
                }
        }

        // Remove temporary variables that the outside doesn't need to know about
        delete this.staffNum;
        delete this.voiceNum;
        delete this.lineNum;
        delete this.vskipPending;
        
    };

    this.getLastNote = function() {
        if (this.lines[this.lineNum] && this.lines[this.lineNum].staffs && this.lines[this.lineNum].staffs[this.staffNum] &&
                this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum]) {
            for (var i = this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum].length - 1; i >= 0; i--) {
                var el = this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum][i];
                if (el.el_type === 'note') {
                    return el;
                }
            }
        }
        return null;
    };

    this.addTieToLastNote = function() {
        // TODO-PER: if this is a chord, which note?
        var el = this.getLastNote();
        if (el && el.pitches && el.pitches.length > 0) {
            el.pitches[0].startTie = {};
            return true;
        }
        return false;
    };

    this.getDuration = function(el) {
         return el.duration?el.duration:0;
    };

    this.closeLine = function() {
        if (this.potentialStartBeam && this.potentialEndBeam) {
            this.potentialStartBeam.startBeam = true;
            this.potentialEndBeam.endBeam = true;
        }
        delete this.potentialStartBeam;
        delete this.potentialEndBeam;
    };

    this.addPosition = function(line, startChar, endChar, hashParams, currentVoice) {
        if( ABCXJS.math.isNumber(line) &&
            ABCXJS.math.isNumber(startChar) &&
            ABCXJS.math.isNumber(endChar) ) {
            hashParams.position = { anchor: {line: line, ch: startChar}, head: {line: line,ch: endChar} };     
        }
        if( currentVoice && currentVoice.staffNum === 0 && currentVoice.index === 0 ) {
            hashParams.position.selectable=true;
        }
    };
    
    this.appendElement = function(type, line, startChar, endChar, hashParams, currentVoice)
    {
        var This = this;
        var pushNote = function(hp) {
            if (hp.pitches !== undefined) {
                var mid = This.lines[This.lineNum].staffs[This.staffNum].workingClef.verticalPos;
                window.ABCXJS.parse.each(hp.pitches, function(p) {
                    p.verticalPos = p.pitch - mid;
                });
            }
            if (hp.gracenotes !== undefined) {
                var mid2 = This.lines[This.lineNum].staffs[This.staffNum].workingClef.verticalPos;
                window.ABCXJS.parse.each(hp.gracenotes, function(p) {
                    p.verticalPos = p.pitch - mid2;
                });
            }
            This.lines[This.lineNum].staffs[This.staffNum].voices[This.voiceNum].push(hp);
        };
        
        hashParams.el_type = type;
        
        this.addPosition(line, startChar, endChar, hashParams, currentVoice);
        
        var endBeamHere = function() {
            This.potentialStartBeam.startBeam = true;
            hashParams.endBeam = true;
            delete This.potentialStartBeam;
            delete This.potentialEndBeam;
        };
        var endBeamLast = function() {
            if (This.potentialStartBeam !== undefined && This.potentialEndBeam !== undefined) {	// Do we have a set of notes to beam?
                This.potentialStartBeam.startBeam = true;
                This.potentialEndBeam.endBeam = true;
            }
            delete This.potentialStartBeam;
            delete This.potentialEndBeam;
        };
        if (type === 'note') { // && (hashParams.rest !== undefined || hashParams.end_beam === undefined)) {
            // Now, add the startBeam and endBeam where it is needed.
            // end_beam is already set on the places where there is a forced end_beam. We'll remove that here after using that info.
            // this.potentialStartBeam either points to null or the start beam.
            // this.potentialEndBeam either points to null or the start beam.
            // If we have a beam break (note is longer than a quarter, or an end_beam is on this element), then set the beam if we have one.
            // reset the variables for the next notes.
            var dur = This.getDuration(hashParams);
            if (dur >= 0.25) {	// The beam ends on the note before this.
                endBeamLast();
            } else if (hashParams.force_end_beam_last && This.potentialStartBeam !== undefined) {
                endBeamLast();
            } else if (hashParams.end_beam && This.potentialStartBeam !== undefined) {	// the beam is forced to end on this note, probably because of a space in the ABC
                if (hashParams.rest === undefined)
                    endBeamHere();
                else
                    endBeamLast();
            } else if (hashParams.rest === undefined) {	// this a short note and we aren't about to end the beam
                if (This.potentialStartBeam === undefined) {	// We aren't collecting notes for a beam, so start here.
                    if (!hashParams.end_beam) {
                        This.potentialStartBeam = hashParams;
                        delete This.potentialEndBeam;
                    }
                } else {
                    This.potentialEndBeam = hashParams;	// Continue the beaming, look for the end next note.
                }
            }
        } else {	// It's not a note, so there definitely isn't beaming after it.
            endBeamLast();
        }
        delete hashParams.end_beam;	// We don't want this temporary variable hanging around.
        delete hashParams.force_end_beam_last;	// We don't want this temporary variable hanging around.
        pushNote(hashParams);
    };

    this.appendStartingElement = function(type, line, startChar, endChar, hashParams2)
    {
        // If we're in the middle of beaming, then end the beam.
        this.closeLine();

        // We only ever want implied naturals the first time.
        var impliedNaturals;
        if (type === 'key') {
            impliedNaturals = hashParams2.impliedNaturals;
            delete hashParams2.impliedNaturals;
        }

        // Clone the object because it will be sticking around for the next line and we don't want the extra fields in it.
        var hashParams = window.ABCXJS.parse.clone(hashParams2);

        // If this is a clef type, then we replace the working clef on the line. This is kept separate from
        // the clef in case there is an inline clef field. We need to know what the current position for
        // the note is.
        if (type === 'clef') {
            this.lines[this.lineNum].staffs[this.staffNum].workingClef = hashParams;
            if(hashParams.type === 'accordionTab') {
                this.hasTablature = true;
                this.tabStaffPos = this.staffNum;
            }
        }    

        // If this is the first item in this staff, then we might have to initialize the staff, first.
        if (this.lines[this.lineNum].staffs.length <= this.staffNum) {
            waterbug.log( 'o que é isso?');
            waterbug.show();
            this.lines[this.lineNum].staffs[this.staffNum] = {};
            this.lines[this.lineNum].staffs[this.staffNum].clef = window.ABCXJS.parse.clone(this.lines[this.lineNum].staffs[0].clef);
            this.lines[this.lineNum].staffs[this.staffNum].key = window.ABCXJS.parse.clone(this.lines[this.lineNum].staffs[0].key);
            this.lines[this.lineNum].staffs[this.staffNum].meter = window.ABCXJS.parse.clone(this.lines[this.lineNum].staffs[0].meter);
            this.lines[this.lineNum].staffs[this.staffNum].workingClef = window.ABCXJS.parse.clone(this.lines[this.lineNum].staffs[0].workingClef);
            this.lines[this.lineNum].staffs[this.staffNum].voices = [];
            this.lines[this.lineNum].staffs[this.staffNum].stem = [];
        }

        // These elements should not be added twice, so if the element exists on this line without a note or bar before it, just replace the staff version.
        var voice = this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum];
        for (var i = 0; i < voice.length; i++) {
            if (voice[i].el_type === 'note' || voice[i].el_type === 'bar') {
                hashParams.el_type = type;
                this.addPosition(line, startChar, endChar, hashParams);
                if (impliedNaturals)
                    hashParams.accidentals = impliedNaturals.concat(hashParams.accidentals);
                voice.push(hashParams);
                return;
            }
            if (voice[i].el_type === type) {
                hashParams.el_type = type;
                this.addPosition(line, startChar, endChar, hashParams);
                if (impliedNaturals)
                    hashParams.accidentals = impliedNaturals.concat(hashParams.accidentals);
                voice[i] = hashParams;
                return;
            }
        }
        // We didn't see either that type or a note, so replace the element to the staff.
        this.lines[this.lineNum].staffs[this.staffNum][type] = hashParams2;
    };

    this.getNumLines = function() {
        return this.lines.length;
    };

    this.pushLine = function(hash) {
        if (this.vskipPending) {
            hash.vskip = this.vskipPending;
            delete this.vskipPending;
        }
        this.lines.push(hash);
    };

    this.addSubtitle = function(str) {
        this.subtitle = str;
    };

    this.addSpacing = function(num) {
        this.vskipPending = num;
    };

    this.addNewPage = function(num) {
        this.pushLine({newpage: num});
    };

    this.addSeparator = function(spaceAbove, spaceBelow, lineLength) {
        this.pushLine({separator: {spaceAbove: spaceAbove, spaceBelow: spaceBelow, lineLength: lineLength}});
    };

    this.addText = function(str) {
        this.pushLine({text: str});
    };

    this.addCentered = function(str) {
        this.pushLine({text: [{text: str, center: true}]});
    };

    this.containsNotes = function(voice) {
        for (var i = 0; i < voice.length; i++) {
            if (voice[i].el_type === 'note' || voice[i].el_type === 'bar')
                return true;
        }
        return false;
    };

    this.containsNotesStrict = function(voice) {
        for (var i = 0; i < voice.length; i++) {
            if (voice[i].el_type === 'note' && voice[i].rest === undefined)
                return true;
        }
        return false;
    };

    this.startNewLine = function(params) {
        // If the pointed to line doesn't exist, just create that. 
        // If the line does exist, but doesn't have any music on it, just use it.
        // If it does exist and has music, then increment the line number. 
        // If the new element doesn't exist, create it.
        var This = this;
        this.closeLine();	// Close the previous line.
        var createVoice = function(params) {
            This.lines[This.lineNum].staffs[This.staffNum].voices[This.voiceNum] = [];
            if (This.isFirstLine(This.lineNum)) {
                
                if (params.stem) 
                    This.lines[This.lineNum].staffs[This.staffNum].stem[This.voiceNum] = params.stem;
                
                if (params.name) {
                    if (!This.lines[This.lineNum].staffs[This.staffNum].title)
                        This.lines[This.lineNum].staffs[This.staffNum].title = [];
                    This.lines[This.lineNum].staffs[This.staffNum].title[This.voiceNum] = params.name;
                }
            } else {
                
                This.lines[This.lineNum].staffs[This.staffNum].stem[This.voiceNum] = This.lines[0].staffs[This.staffNum].stem[This.voiceNum];
                
                if (params.subname) {
                    if (!This.lines[This.lineNum].staffs[This.staffNum].title)
                        This.lines[This.lineNum].staffs[This.staffNum].title = [];
                    This.lines[This.lineNum].staffs[This.staffNum].title[This.voiceNum] = params.subname;
                }
            }
            
            if (params.style)
                This.appendElement('style', null, null, null, {head: params.style});
            
            if (params.scale)
                This.appendElement('scale', null, null, null, {size: params.scale});
        };
        var createStaff = function(params) {
            if (params.transpose)
                params.clef.transpose = params.transpose;
            This.lines[This.lineNum].staffs[This.staffNum] =
                    {voices: [], stem: [], clef: params.clef, key: params.key, workingClef: params.clef, subtitle: params.subtitle, lyricsRows: 0};
            if (params.vocalfont)
                This.lines[This.lineNum].staffs[This.staffNum].vocalfont = params.vocalfont;
            if (params.bracket)
                This.lines[This.lineNum].staffs[This.staffNum].bracket = params.bracket;
            if (params.brace)
                This.lines[This.lineNum].staffs[This.staffNum].brace = params.brace;
            if (params.connectBarLines)
                This.lines[This.lineNum].staffs[This.staffNum].connectBarLines = params.connectBarLines;
            if(params.clef.type === 'accordionTab') {
                This.hasTablature = true;
                This.tabStaffPos = This.staffNum;
            }
            // Some stuff just happens for the first voice
            createVoice(params);
            if (params.part)
                This.appendElement('part', null, null, null, {title: params.part}); // flavio anulou
            if (params.meter !== undefined)
                This.lines[This.lineNum].staffs[This.staffNum].meter = params.meter;
        };
        var createLine = function(params) {
            This.lines[This.lineNum] = {staffs: []};
            createStaff(params);
        };
        if (this.lines[this.lineNum] === undefined)
            createLine(params);
        else if (this.lines[this.lineNum].staffs === undefined) {
            this.lineNum++;
            this.startNewLine(params);
        } else if (this.lines[this.lineNum].staffs[this.staffNum] === undefined)
            createStaff(params);
        else if (this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum] === undefined)
            createVoice(params);
        else if (!this.containsNotes(this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum]))
            return;
        else {
            this.lineNum++;
            this.startNewLine(params);
        }
    };

    this.hasBeginMusic = function() {
        return this.lines.length > 0;
    };

    this.isFirstLine = function(index) {
        for (var i = index - 1; i >= 0; i--) {
            if (this.lines[i].staffs !== undefined)
                return false;
        }
        return true;
    };

    this.getCurrentStaff = function() {
        if (this.lines[this.lineNum] !== undefined && this.lines[this.lineNum].staffs[this.staffNum] !== undefined)
            return this.lines[this.lineNum].staffs[this.staffNum];
        else
            return null;
    };

    this.getCurrentVoice = function() {
        if (this.lines[this.lineNum] !== undefined && this.lines[this.lineNum].staffs[this.staffNum] !== undefined && this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum] !== undefined)
            return this.lines[this.lineNum].staffs[this.staffNum].voices[this.voiceNum];
        else
            return null;
    };

    this.setCurrentVoice = function(staffNum, voiceNum) {
        this.staffNum = staffNum || 0;
        this.voiceNum = voiceNum || 0;
        for (var i = 0; i < this.lines.length; i++) {
            if (this.lines[i].staffs) {
                if (this.lines[i].staffs[staffNum] === undefined || this.lines[i].staffs[staffNum].voices[voiceNum] === undefined ||
                        !this.containsNotes(this.lines[i].staffs[staffNum].voices[voiceNum])) {
                    this.lineNum = i;
                    return;
                }
            }
        }
        this.lineNum = i;
    };

    this.addMetaText = function(key, value) {
        if (this.metaText[key] === undefined)
            this.metaText[key] = value;
        else
            this.metaText[key] += "\n" + value;
    };

    this.addMetaTextArray = function(key, value) {
        if (this.metaText[key] === undefined)
            this.metaText[key] = [value];
        else
            this.metaText[key].push(value);
    };
    this.addMetaTextObj = function(key, value) {
        this.metaText[key] = value;
    };
    
    this.reset();

};
