/* abc_editor.js
 ABCXJS.Editor is the interface class for the area that contains the ABC text. It is responsible for
 holding the text of the tune and calling the parser and the rendering engines.
*/


// ABCXJS.Editor:
//
// constructor(editarea, params)
//		if editarea is a string, then it is an HTML id of a textarea control.
//		Otherwise, it should be an instantiation of an object that expresses the EditArea interface.
//
//		params is a hash of:
//		canvas_id: or paper_id: HTML id to draw in. If not present, then the drawing happens just below the editor.
//		generate_midi: if present, then midi is generated.
//		midi_id: if present, the HTML id to place the midi control. Otherwise it is placed in the same div as the paper.
//		generate_warnings: if present, then parser warnings are displayed on the page.
//		warnings_id: if present, the HTML id to place the warnings. Otherwise they are placed in the same div as the paper.
//		onchange: if present, the callback function to call whenever there has been a change.
//		parser_options: options to send to the parser engine.
//		midi_options: options to send to the midi engine.
//		render_options: options to send to the render engine.
//		indicate_changed: the dirty flag is set if this is true.
//
// - renderTune(abc, parserparams, div)
//		Immediately renders the tune. (Useful for creating the SVG output behind the scenes, if div is hidden)
//		string abc: the ABC text
//		parserparams: params to send to the parser
//		div: the HTML id to render to.
// - parseABC()
//		Called internally by fireChanged()
//		returns true if there has been a change since last call.
// - updateSelection()
//		Called when the user has changed the selection. This calls the printer to show the selection.
// - highlight(abcelem)
//		Called by the printer to highlight an area.
// - fireChanged()
//		Called by the textarea object when the user has changed something.
// - paramChanged(printerparams)
//		Called to signal that the printer params have changed, so re-rendering should occur.

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!ABCXJS.edit)
	ABCXJS.edit = {};

ABCXJS.Editor = function (params) {

    var self = this;
    this.fireTime = 0;
    this.printTimeStart = 0;
    this.printTimeEnd = 0;
    this.endTime = 0;
    this.showingABC = true;
    
    this.player = new ABCXJS.midi.Player();

    this.bReentry = false;
    this.accordion = null;
    this.accordionSelector = null;
    this.keySelector = null;
    this.indicate_changed = params.indicate_changed;

    this.parserparams = params.parser_options || {};
    this.printerparams = params.render_options || {};

    if (params.onchange)
        this.onchangeCallback = params.onchange;


    this.menu = new DRAGGABLE.ui.DropdownMenu(
         params.menu_id
        ,{ listener:this, method:'menuCallback' /*, label:'Menu'*/ }
        ,[{title: 'Acordeons', ddmId: 'menuGaitas',
                itens: [
                    'Acordeon 1',
                    'Acordeon 2',
                    '----',
                    'Salvar mapa corrente',
                    'Carregar mapa do disco local'
                ]},
            {title: 'Repertório', ddmId: 'menuRepertorio',
                itens: [
                    'Restaurar o original',
                    'Carregar do drive local|LOADLOC',
                    'Exportar para drive local',
                    'Partitura <i class="ico-play" /> Tablatura',
                    'Tablatura <i class="ico-play" /> Partitura',
                    '---',
                    'A canoa virou|T10',
                    'Boi Barroso|T20',
                    'Bugiu da Serra|T30',
                    'Xote 1|T40',
                    'Xote 2|T50',
                    'Xote Laranjeira|T1',
                    'Zyliana|T2',
                ]},
                {title: 'Informações', ddmId: 'menuInformacoes',
                    itens: [
                     'Tutoriais&#160;&#160;<img src="images/novo.png" />|TUTORIAL',
                     'Partitura&#160;&#160;<i class="ico-open-right"></i>&#160;Tablatura|PART2TAB',
                     'Tablatura&#160;&#160;<i class="ico-open-right"></i>&#160;Partitura|TAB2PART',
                     'Sobre|ABOUT'
                ]},
                {title: 'Teste', ddmId: 'menuTeste',
                    itens: [
                        'A canoa virou|T10',
                        'Boi Barroso|T20',
                        '---',
                        'Bugiu da Serra|T30',
                        'Cenoura',
                        'Couve-flor',
                        'Melao',
                        'Pepino',
                        '---',
                        'Xote 1|T40',
                        'Xote 2|T50',
                        'Xote Laranjeira|T1',
                        'Zyliana|T2'
                    ]}
        ]
    );

    this.studio = new DRAGGABLE.ui.Window(
            params.studio_id
            , null
            , {translate: false, statusbar: false, draggable: false, top: "3px", left: "1px", width: '100%', height: "100%", title: 'Estúdio ABCX'}
            , {listener: this, method: 'studioCallback'}
    );
    
    this.studio.setVisible(true);

    this.editarea = new ABCXJS.edit.EditArea(
          this.studio.dataDiv
        , {listener : this, method: 'editorCallback' }
        , {draggable:false, toolbar: true, alternativeResize:true, translator:SITE.translator, width: "100%", height: "200px"
            , compileOnChange: false
            , title: 'EstudioEditorTitle' }
    );

    this.keyboardWindow = new DRAGGABLE.ui.Window( 
          this.studio.dataDiv
        , [ 'move|Mover', 'rotate|Rotacionar', 'zoom|Zoom','globe|Mudar Notação']
        , {title: 'Keyb', draggable: true, translate: false, statusbar: false, top: "100px", left: "1100px" } 
        , {listener: this, method: 'keyboardCallback'}
    );
    
    this.editarea.setVisible(true);
    this.editarea.setToolBarVisible(false);
    this.editarea.setStatusBarVisible(false);
    
    this.controldiv = document.createElement("DIV");
    this.controldiv.setAttribute("id", 'internalControlDiv');
    this.studio.dataDiv.appendChild(this.controldiv);
    this.controldiv.innerHTML = document.getElementById(params.control_id).innerHTML;
    document.getElementById(params.control_id).innerHTML = "";

   this.slider = new DRAGGABLE.ui.Slider( 'slider01',
        {
            min: 25, max: 200, start:100, step:25, speed:100, color: 'white', bgcolor:'black', size:{w:150, h:23, tw:48},
            callback: function(v) { self.player.setAndamento(v); } 
        } 
    );

    if (params.generate_warnings) {
        var warnings_id = 'warningsDiv';
        if (params.warnings_id) {
            warnings_id = params.warnings_id;
        }
        this.warningsdiv = document.createElement("DIV");
        this.warningsdiv.setAttribute("id", warnings_id);
        this.studio.dataDiv.appendChild(this.warningsdiv);
    }

    var canvas_id = 'canvasDiv';
    if (params.canvas_id) {
        canvas_id = params.canvas_id;
    } else if (params.paper_id) {
        canvas_id = params.paper_id;
    }

    this.canvasContainer = document.createElement("DIV");
    this.canvasContainer.id = 'canvasContainer';
    this.canvasContainer.className =  'canvas';
    
    this.canvasDiv = document.createElement("DIV");
    this.canvasDiv.id = canvas_id;
    this.canvasContainer.appendChild(this.canvasDiv);
    this.studio.dataDiv.appendChild(this.canvasContainer);
    
    this.resize();

    this.globalPautaNumerica     = 1
    this.globalPautaNumericaMini = true;
    this.globalHideLyrics        = false;
    this.globalHideFingering     = false;
    this.globalIlheirasNumeradas = true;

    this.parserparams.hideLyrics = this.globalhideLyrics ;
    this.parserparams.hideFingering = this.globalHideFingering ;
    this.parserparams.ilheirasNumeradas = this.globalIlheirasNumeradas ;
        
    if (params.refreshController_id)
        this.refreshController = document.getElementById(params.refreshController_id );

    if (params.generate_tablature) {
        if (params.generate_tablature === 'accordion') {
            this.accordion = new ABCXJS.tablature.Accordion(params.accordion_options, this.globalPautaNumerica, this.globalPautaNumericaMini );

            if (params.accordionSelector_id) {
                this.accordionSelector = new ABCXJS.edit.AccordionSelector( 
                        'sel1', params.accordionSelector_id, 
                        { listener:this, method: 'studioCallback'/*, label:"Gaititas"*/ }, 
                        [
                            '---',
                            'Salvar mapa corrente|SAVEMAP',
                            'Carregar mapa do disco local|LOADMAP'
                        ]
                );
        
                this.accordionSelector.populate(true);
                
            } else {
                if (params.accordionNameSpan) {
                    this.accordionNameSpan = document.getElementById(params.accordionNameSpan);
                    this.accordionNameSpan.innerHTML = this.accordion.getName();
                }
            }

            //this.accordion.printKeyboard(this.keyboardWindow.dataDiv , {fillColor:'yellow', openColor:'navy', closeColor:'purple', backgroundColor:'red' } );
            this.accordion.printKeyboard(this.keyboardWindow.dataDiv );
            this.switchMap();


        } else {
            throw new Error('Tablatura para ' + params.generate_tablature + ' não suportada!');
        }
    }
        
    if (params.keySelector_id) {
        this.keySelector = new ABCXJS.edit.KeySelector( 'k1', params.keySelector_id, { listener:this, method: 'keyCallback' } );
    }

    if (params.generate_midi) {
        this.midiParser = new ABCXJS.midi.Parse(params.midi_options);
    }
    
    this.settingsMenu = document.getElementById(params.settingsMenu);
    
    this.settingsMenu.addEventListener("click", function(evt) {
        evt.preventDefault();
        this.blur();
        self.showSettings();
    }, false );

    printButton = document.getElementById("buttonPrint");
    playButton = document.getElementById("buttonPlay");
    pauseButton = document.getElementById("buttonPause");
    stopButton = document.getElementById("buttonStop");
    showMapButton = document.getElementById("showMapBtn");
    showEditButton = document.getElementById("showEditBtn");
    switchSourceButton = document.getElementById("switch_source");
    cpt = document.getElementById("currentPlayTimeLabel");




    switchSourceButton.addEventListener("click", function () {
        self.showingABC =  ! self.showingABC;
        if( self.showingABC )
            self.editarea.setString(  self.abcText );
        else {
            self.abcText = self.editarea.getString();
            self.editarea.setString( self.canvasDiv.innerHTML );
            
        }
    }, false);

    printButton.addEventListener("click", function (e) {
        e.preventDefault();

        //document.getElementById("keyboardDiv").style.display = 'none';
        document.getElementById("editorDiv").style.display = "none";
        document.getElementById("warningsDiv").style.display = "none";
        document.body.style.paddingTop = '0px';

        window.print();

        document.body.style.paddingTop = '240px';
        document.getElementById("warningsDiv").style.display = "inline";
        document.getElementById("editorDiv").style.display = "inline";
        //document.getElementById("keyboardDiv").style.display = kd;
    }, false);

    playButton.addEventListener("click", function (e) {
        e.preventDefault();
        self.accordion.clearKeyboard();
        self.editarea.setReadOnly(true);
        document.body.classList.add("home");
        
        self.editarea.setEditorHighLightStyle();
        //self.slider.disable();
        self.player.startPlay(self.tunes[0].midi);
        
        //self.player.startDidacticPlay(myEditor.tunes[0].midi, 'note');
        //self.player.startDidacticPlay(myEditor.tunes[0].midi, 'measure', 2 );
        //self.player.startDidacticPlay(myEditor.tunes[0].midi, 'repeat', 1, 4);
    }, false);

    pauseButton.addEventListener("click", function (e) {
        e.preventDefault();
        self.editarea.clearEditorHighLightStyle();
        self.player.pausePlay();
        //self.slider.enable();
    }, false);
    
    stopButton.addEventListener("click", function (e) {
        e.preventDefault();
        self.accordion.clearKeyboard();
        self.editarea.setReadOnly(false);
        self.editarea.clearEditorHighLightStyle();
        self.player.stopPlay();
        //self.slider.enable();
    }, false);
    
    showMapButton.addEventListener("click", function (e) {
        e.preventDefault();
        self.switchMap();
        //this.value = myEditor.accordion.loadedKeyboard.render_opts.show ? 'Hide Map' : 'Show Map';
    }, false);
    
    showEditButton.addEventListener("click", function (e) {
        e.preventDefault();
        self.editarea.setVisible(true);
        self.editarea.resize();
    }, false);

    this.player.defineCallbackOnPlay(function( player ) {
        cpt.innerHTML = player.getTime().cTime;
    });
    
    this.player.defineCallbackOnScroll(function( player ) {
        if( player.currAbsElem.staffGroup === lastStaffGroup )  return;

        lastStaffGroup = player.currAbsElem.staffGroup;

        var fixedTop = document.getElementById('editorDiv').clientHeight;

        var wtop = self.canvasDiv.offsetTop - fixedTop;

        var wh = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;                   

        var vp = wh - fixedTop;

        var top = player.printer.staffgroups[player.currAbsElem.staffGroup].top;
        var bottom = top + player.printer.staffgroups[player.currAbsElem.staffGroup].height;

        if( wtop+bottom > vp+window.ypos || window.ypos-wtop > top ) {
            window.ypos = wtop + top;
            window.scrollTo( 0, window.ypos );    
        }
    });    
    
    this.player.defineCallbackOnEnd( function( player ) {
        cpt.innerHTML = "00:00.00";
        this.printer.clearSelection();
        var warns = player.getWarnings();
        window.scrollTo( 0, 0 );
        if( warns ) {
            var txt = "";
            warns.forEach(function(msg){ txt += msg + '<br>'; });
            document.getElementById("warningsDiv").innerHTML = '<hr>'+txt;
        }
    });
    
};

ABCXJS.Editor.prototype.resize = function( ) {
    
    // redimensiona a workspace
    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;

    var winW = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    // -paddingTop 75
    var h = Math.max((winH -75 -10 ),200); 
    var w =  Math.max((winW - 6 ),400); 
    
    this.studio.topDiv.style.left = "1px";
    this.studio.topDiv.style.top = "75px";
    this.studio.topDiv.style.height = h +"px";
    this.studio.topDiv.style.width = w +"px";
    
    
    this.canvasContainer.style.height =  (h - this.canvasContainer.offsetTop - 25) + "px";
    this.canvasContainer.style.overflowY = 'auto';
    this.canvasContainer.style.maxHeight = 'none';
    
    this.editarea.resize();
  
};

ABCXJS.Editor.prototype.menuCallback = function( action ) {
  waterbug.log(action);
};

ABCXJS.Editor.prototype.getString = function() {
    return this.editarea.getString();
};

ABCXJS.Editor.prototype.setString = function( text ) {
    this.editarea.setString( text );
};

ABCXJS.Editor.prototype.renderTune = function (abc, params, div) {

    var tunebook = new ABCXJS.TuneBook(abc);
    var abcParser = new ABCXJS.parse.Parse(this.transposer, this.accordion);
    abcParser.parse(tunebook.tunes[0].abc, params); //TODO handle multiple tunes
    var tune = abcParser.getTune();
    var paper = Raphael(div, 800, 400);
    var printer = new ABCXJS.write.Printer(paper, {}, this.accordion.loadedKeyboard);// TODO: handle printer params
    //printer.printABC(tune, {color:'green'} );
    printer.printABC(tune);

};

ABCXJS.Editor.prototype.printWarnings = function()  {
    this.endTime = new Date();
    this.warnings.push('Tempo total: ' + ( (this.endTime.getTime() -this.fireTime.getTime()) /1000).toFixed(2)  + 's');
    
    if (this.warningsdiv) {
        this.warningsdiv.style.color = this.warnings.length > 0 ? "red" : "green";
        this.warningsdiv.innerHTML = '<hr>' + (this.warnings.length > 0 ? this.warnings.join("<br>") : "No warnings or errors.") + '<hr>';
    }
};

ABCXJS.Editor.prototype.startLoader = function(id, start, stop) {

    var loader = new window.widgets.Loader({
         id: id
        ,bars: 0
        ,radius: 0
        ,lineWidth: 20
        ,lineHeight: 70
        ,timeout: 1 // maximum timeout in seconds.
        ,background: "rgba(0,0,0,0.5)"
        ,container: document.body
        ,oncomplete: stop // call function once loader has started	
        ,onstart: start // call function once loader has started	
    });
    return loader;
};


// Call this to reparse in response to the printing parameters changing
ABCXJS.Editor.prototype.paramChanged = function(printerparams) {
	this.printerparams = printerparams;
	this.fireChanged( 0, {force: true} );
};

// return true if the model has changed
// o código abaixo não está totalmente preparado para trabalhar com várias canções de uma unica vez
ABCXJS.Editor.prototype.parseABC = function (transpose, force) {

    var text = this.getString();

    if (text === "") {
        this.initialText = this.tunes = undefined;
        return true;
    }

    if (text === this.initialText && !force) {
        this.updateSelection();
        return false;
    }

    this.warnings = [];
    this.tunes = [];

    var tunebook = new ABCXJS.TuneBook(text);

    if (typeof transpose !== "undefined") {
        if (this.transposer)
            this.transposer.reset(transpose);
        else
            this.transposer = new ABCXJS.parse.Transposer(transpose);
    }

    for (var i = 0; i < tunebook.tunes.length; i++) {
        
        try {
            var abcParser = new ABCXJS.parse.Parse(this.transposer, this.accordion);
            abcParser.parse(tunebook.tunes[i].abc, this.parserparams); //TODO handle multiple tunes
            this.tunes[i] = abcParser.getTune();
            this.initialText = abcParser.getStrTune();

            // transposição e geracao de tablatura podem ter alterado o texto ABC
            this.setString(abcParser.getStrTune());

            if (this.transposer && this.keySelector) {
                this.keySelector.populate(this.transposer.keyToNumber(this.transposer.getKeyVoice(0)));
                this.editarea.keySelector.populate(this.transposer.keyToNumber(this.transposer.getKeyVoice(0)));
            }

            var warnings = abcParser.getWarnings() || [];
            for (var j = 0; j < warnings.length; j++) {
                this.warnings.push(warnings[j]);
            }
            if (this.midiParser) {
                this.midiParser.parse(this.tunes[i], this.accordion.loadedKeyboard);
                var warnings = this.midiParser.getWarnings();
                for (var j = 0; j < warnings.length; j++) {
                    this.warnings.push(warnings[j]);
                }
            }
        } catch(e) {
            waterbug.log('Could not parse ABC');
            waterbug.show();
            return false;
        }
    }
    return true;
};

ABCXJS.Editor.prototype.updateSelection = function (force) {
    var that = this;
    if( force ) {
        var selection = that.editarea.getSelection();
        try {
            that.printer.rangeHighlight(selection);
        } catch (e) {
        } // maybe printer isn't defined yet?
        delete this.updating;
    } else {
        if( this.updating ) return;
        this.updating = true;
        setTimeout( that.updateSelection(true), 300 );
    }
};

ABCXJS.Editor.prototype.switchMap = function() {
    this.accordion.render_opts.show = ! this.accordion.render_opts.show;
    this.keyboardWindow.topDiv.style.display = this.accordion.render_opts.show? 'block': 'none';
    this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
};

ABCXJS.Editor.prototype.highlight = function(abcelem) {
  try {
        if(this.accordion.render_opts.show && !this.player.playing) {
            this.editarea.setSelection(abcelem);
            this.accordion.clearKeyboard(true);
            this.midiParser.setSelection(abcelem);
        }    
  } catch( e ) {
      // Firefox: aborta se a area não estiver visivel
  } 
};

// limpa apenas a janela de texto. Os demais elementos são controlados por tempo 
ABCXJS.Editor.prototype.unhighlight = function(abcelem) {
  try {
        this.editarea.clearSelection(abcelem);
  } catch( e ) {
      // Firefox: aborta se a area não estiver visivel
  } 
};

// call when abc text is changed and needs re-parsing
ABCXJS.Editor.prototype.fireChanged = function (transpose, _opts) {
    
// flavio debug    if( this.changing ) return;
this.parserparams.hideFingering = !this.parserparams.hideFingering;
this.parserparams.hideLyrics = !this.parserparams.hideLyrics;
    
    this.changing = true;
    var opts = _opts || {};
    var force = opts.force || false;
    var showProgress = opts.showProgress || false;

    if (this.parseABC(transpose, force)) {
        this.modelChanged(showProgress);
    } else {
        delete this.changing;
    }
};

ABCXJS.Editor.prototype.modelChanged = function(showProgress) {
    var self = this;
    if(showProgress) {
        var loader = this.startLoader( "ModelChanged" );
        loader.start(  function() { self.onModelChanged(loader); }, '<br>&nbsp;&nbsp;&nbsp;Gerando partitura...<br><br>' );
    } else {
        self.onModelChanged();
    }    
};

ABCXJS.Editor.prototype.onModelChanged = function(loader) {
    var self = this;
    
    this.fireTime = new Date();
    
    if (this.tunes === undefined) {
        this.canvasDiv.innerHTML = "";
        delete this.changing;
        if( loader ) {
            loader.stop();
        }
        return;
    }

    if (this.bReentry) {
        if( loader ) {
            loader.stop();
        }
        return; // TODO is this likely? maybe, if we rewrite abc immediately w/ abc2abc
    }
    
    this.bReentry = true;
    this.timerId = null;
    this.canvasDiv.innerHTML = "";
    var paper = new SVG.Printer( this.canvasDiv );
    this.printer = new ABCXJS.write.Printer(paper, this.printerparams, this.accordion.loadedKeyboard );
    this.printTimeStart = new Date();
    //this.printer.printABC(this.tunes, {color:'red', baseColor:'green'} );
    this.printer.printABC(this.tunes);
    this.printTimeEnd = new Date();
    this.warnings.push('Tempo da impressão: ' + ( (this.printTimeEnd.getTime() -this.printTimeStart.getTime()) /1000).toFixed(2)  + 's');
    
    this.printer.addSelectListener(this);
    this.updateSelection();
    this.bReentry = false;
    
    if (this.onchangeCallback)
        this.onchangeCallback(this);
    
    if( loader ) {
        loader.update( false, '<br>&nbsp;&nbsp;&nbsp;Gerando tablatura...<br><br>' );
        loader.stop();
    }
    
    delete this.changing;
    
    window.setTimeout(function() {
        self.printWarnings();
        self.resize();
    }, 1);
    
};

ABCXJS.Editor.prototype.keyCallback = function (action) {
    var a = parseInt(action);
    if( a !== 0 )
        this.fireChanged( a, {force: true} );

};
    
ABCXJS.Editor.prototype.studioCallback = function (action) {
    switch(action) {
        case 'CLOSE':
            //this.studio.setVisible(false);
            break;
        case 'RESTORE':
            break;
        case 'SAVEMAP':
        case 'LOADMAP':
            alert(action);
            break;
        default:
            if( this.accordion.getId() !== action ) {
                this.accordion.loadById(action);
                this.accordionSelector.populate(true);
                this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
                this.fireChanged( 0, {force: true} );
            }    
    }
};

ABCXJS.Editor.prototype.keyboardCallback = function (action, elem) {
    switch(action) {
        case 'MOVE':
            break;
        case 'CLOSE':
            this.switchMap();
            break;
        case 'ROTATE':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'ZOOM':
            this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'GLOBE':
            this.accordion.changeNotation();
            break;
        case 'RESIZE':
            //this.accordion.changeNotation();
            break;
        default:
            alert(action);
    }
};
            
ABCXJS.Editor.prototype.editorCallback = function (action, elem) {
    // chamadas a partir de menu dropdown não tem valor para elem
    switch(action) {
        case '0': 
            break;
        case  '1':  case  '2':  case  '3':  case   '4': case   '5': case '6': 
        case  '7':  case  '8':  case  '9':  case  '10': case  '11': 
        case '-1':  case '-2':  case '-3':  case  '-4': case  '-5': case '-6': 
        case '-7':  case '-8':  case '-9':  case '-10': case '-11': 
            this.fireChanged( parseInt(action), {force: true} );
           break;
        case 'OCTAVEUP': 
           this.fireChanged(12, {force: true} );
           break;
        case 'OCTAVEDOWN': 
           this.fireChanged(-12, {force: true} );
           break;
        case 'MAXIMIZE': 
            this.editarea.setMaximized(true);
            break;
        case 'RESTORE': 
            this.editarea.setMaximized(false);
            break;
        case 'POPIN':
            this.editarea.setFloating(false);
            this.editarea.setToolBarVisible(false);
            this.editarea.setStatusBarVisible(false);
            this.editarea.container.move(0,0);
            this.editarea.container.setSize("calc(100% -5px)","200px");
            this.editarea.resize();
            break;
        case 'POPOUT':
            this.editarea.setFloating(true);
            this.editarea.setToolBarVisible(true);
            this.editarea.setStatusBarVisible(true);
            this.editarea.container.move(100,100);
            this.editarea.container.setSize("700px","480px");
            this.editarea.resize();
            break;
        case 'RESIZE':
            //alert(action);
            break;
        case 'MOVE':
            //alert(action);
            break;
        case 'CLOSE':
            this.editarea.setVisible(false);
            this.resize();
            break;
        default:
            alert(action);
    }
};

ABCXJS.Editor.prototype.settingsCallback = function(action, elem ) {
    switch(action) {
        case 'MOVE': 
            break;
        case 'CLOSE': 
        case 'CANCEL':
/*            
            this.settingsWindow.move( 100, 100);
            alert( '100 100');
            this.settingsWindow.move( '200', '200');
            alert( '200 aspas ');
            this.settingsWindow.move( '400px', '400px');
            alert( '400px');
            this.settingsWindow.move( 0, 0 );
            this.settingsWindow.setSize( '100%', '100%');
            alert( '100%');
            this.settingsWindow.setSize( 'calc(100% - 100px)', 'calc(100% - 100px)');
            alert( 'calc(100% - 100px)');
*/            
            this.settingsWindow.setVisible(false);
            break;
        case 'APPLY':
           ABCXJS.write.color.highLight = this.p1.value;
           DIATONIC.map.color.close = this.p2.value;
           DIATONIC.map.color.open = this.p3.value;
           this.accordion.loadedKeyboard.legenda.setOpen();
           this.accordion.loadedKeyboard.legenda.setClose();
           this.settingsWindow.setVisible(false);
           break;
        case 'RESET':
            this.alert = new DRAGGABLE.ui.Alert( 
                this.settingsWindow, action, 
                '<br>Você deseja redefinir todos os itens?',
                '<br>Isto fará com que todos os itens retornem para suas configurações iniciais, \
                 isto inclui posicionamento e cores, entre outras coisas.');
            break;
        case 'RESET-YES':
            break;
        case 'RESET-NO':
            this.alert.close();
            this.alert = null;
            break;
   }
};

ABCXJS.Editor.prototype.showSettings = function() {
    
    if(!this.settingsWindow) {
    
        this.settingsWindow = new DRAGGABLE.ui.Window( 
              null 
            , null
            , {title: 'Preferências', translate: false, statusbar: false, top: "300px", left: "500px", height:'400px',  width:'600px', zIndex: 50} 
            , {listener: this, method: 'settingsCallback'}
        );

        this.settingsWindow.topDiv.style.zIndex = 101;
        
        this.settingsWindow.dataDiv.innerHTML= '\
        <div class="menu-group">\
            <table>\
              <tr>\
                <th colspan="2">Idioma:</th><th><div id="settingsLanguageMenu" class="topMenu"></div></th>\
              </tr>\
              <tr>\
                <th colspan="2">Acordeão:</th><td><div id="settingsAccordionsMenu" class="topMenu"></div></td>\
              </tr>\
              <tr>\
                <th colspan="2">Tablatura:</th><td><div id="settingsTabMenu" class="topMenu"></div></td>\
              </tr>\
              <tr>\
                <th colspan="2"><br>Cores:</th><td></td>\
              </tr>\
              <tr>\
                <td></td><td>Cor de Realce</td><td><input type="text" id="corRealce" ></td>\
              </tr>\
              <tr>\
                <td></td><td>Fole Fechando</td><td><input type="text" id="foleFechando" ></td>\
              </tr>\
              <tr>\
                <td></td><td>Fole Abrindo</td><td><input type="text" id="foleAbrindo" ></td>\
              </tr>\
              <tr>\
                <th colspan="2"><br>Propriedades:</th><td></td>\
              </tr>\
              <tr>\
                <td><input type="checkbox"> </td><td colspan="2">Mostrar avisos e erros de compilação</td>\
              </tr>\
              <tr>\
                <td><input type="checkbox"> </td><td colspan="2">Atualizar partitura automaticamente</td>\
              </tr>\
              <tr>\
                <td><input type="checkbox"> </td><td colspan="2">Mostrar linhas de debug</td>\
              </tr>\
            </table>\
        </div>\
        <div id="pg" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1"></div>\n\
            <div id="botao2"></div>\n\
            <div id="botao3"></div>\n\
        </div>';
        
        this.settingsWindow.addPushButtons([
            'botao1|APPLY|Aplicar',
            'botao2|RESET|Redefinir',
            'botao3|CANCEL|Cancelar'
        ]);
                
                
        var selector = new ABCXJS.edit.AccordionSelector( 
                'sel2', 'settingsAccordionsMenu', {listener: this, method: 'settingsCallback'} );
        
        selector.populate(true, 'GAITA_HOHNER_CLUB_IIIM_BR');

        var menu = new DRAGGABLE.ui.DropdownMenu(
            'settingsTabMenu'
         ,  { listener:this, method:'settingsCallback' }
         ,  [{title: 'Modelo Alemão', ddmId: 'menuFormato',
                 itens: [
                     '&#160;Modelo Alemão|0',
                     '&#160;Numérica 1 (se disponível)|1',
                     '&#160;Numérica 2 (se disponível)|2' 
                 ]}]
         );
        
        var menu = new DRAGGABLE.ui.DropdownMenu(
               'settingsLanguageMenu'
            ,  { listener:this, method:'settingsCallback' }
            ,  [{title: 'Idioma', ddmId: 'menuIdiomas',
                    itens: [
                        '<img src="images/pt_BR.png" alt="idiomas" />&#160;Português|pt_BR',
                        '<img src="images/en_US.png" alt="idiomas" />&#160;English|en_US',
                        '<img src="images/de_DE.png" alt="idiomas" />&#160;Deustch|de_DE' 
                    ]}]
            );
    
            menu.setSubMenuTitle('menuIdiomas', '<img src="images/pt_BR.png" alt="idiomas" />&#160;Português');
            
            this.p1 = document.getElementById( 'corRealce');
            this.p2 = document.getElementById( 'foleFechando');
            this.p3 = document.getElementById( 'foleAbrindo');
            
            this.p1.style.backgroundColor = this.p1.value = ABCXJS.write.color.highLight;
            this.p2.style.backgroundColor = this.p2.value = DIATONIC.map.color.close;
            this.p3.style.backgroundColor = this.p3.value = DIATONIC.map.color.open ;

            new DRAGGABLE.ui.ColorPicker(['corRealce', 'foleFechando', 'foleAbrindo']);

    }            
    this.settingsWindow.setVisible(true);
    
};

/*
     this.addClassName = function (element, className) {
        var hasClassName = function (element, className) {
            var elementClassName = element.className;
            return (elementClassName.length > 0 && (elementClassName === className ||
                    new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
        };

        if (!hasClassName(element, className))
            element.className += (element.className ? ' ' : '') + className;
        return element;
    };

    this.removeClassName = function (element, className) {
        element.className = ABCXJS.parse.strip(element.className.replace(
                new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
        return element;
    };


ABCXJS.Editor.prototype.selectAccordionById = function( id ) {
    if( this.accordion ) {
        this.accordion.loadById(id);
        this.doSelAccordion();
    }    
};
ABCXJS.Editor.prototype.selectAccordion = function( n ) {
    if( this.accordion ) {
        this.accordion.load(n);
        this.doSelAccordion();
    }    
};

ABCXJS.Editor.prototype.doSelAccordion = function( ) {
    if( this.accordionSelector ) {
        this.accordionSelector.set(this.accordion.selected);
    } else {
        if( this.accordionNameSpan ) {
            this.accordionNameSpan.innerHTML = this.accordion.getName();
        }
    }
};
*/