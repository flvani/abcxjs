/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
  * Implements: 
*   - DRAGGABLE.ui.Window
*   - DRAGGABLE.ui.PushButton
*/

if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, slideId: 0, oneTimeCloseFunction : null, lastOpen: null };
        
DRAGGABLE.ui.Window = function( parent, aButtons, options, callback, aToolBarButtons ) {
    
    var self = this;
    var opts = options || {};

    this.id = ++ DRAGGABLE.ui.windowId;
    
    this.title = opts.title || '';
    this.top = opts.top || 0;
    this.left = opts.left || 0;
    this.width = opts.width || '';
    this.height = opts.height || '';
    this.minWidth = opts.minWidth ||  160;
    this.minHeight = opts.minHeight ||  (24+(aToolBarButtons?76:0));
    this.hasStatusBar = opts.statusbar || false;
    this.alternativeResize = opts.alternativeResize || false;
    this.translator = opts.translator || null;
    this.zIndex  = opts.zIndex? opts.zIndex : 100;
    this.draggable = typeof opts.draggable !== 'undefined' ? opts.draggable : true;
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "draggableWindow" +  this.id ); 
    div.setAttribute("class", "draggableWindow" + (this.draggable? "" : " noShadow") ); 
    this.topDiv = div;
    
    this.topDiv.style.zIndex = this.zIndex;
    
    if(!parent) {
        document.body.appendChild(this.topDiv);
    } else {
        if(typeof parent === 'string') {
            this.parent = document.getElementById(parent);
        } else {
            this.parent = parent;
        }
        this.parent.appendChild(this.topDiv);
    }
    
/*     if( ! this.draggable ) {
        //this.topDiv.style.position = "relative";  // pq assume isso quando nao dragavel?
        //this.topDiv.style.margin = "1px";
    } else {
 */ 
    if( this.draggable ) {       
        if(this.parent) {
            this.topDiv.style.position = "absolute";
        }
        this.minTop = 1;
        this.minLeft = 1;
    }
    
    if(callback) {
        this.defineCallback(callback);
    }
    
    if(this.topDiv.style.top === "" ) this.topDiv.style.top = this.top;
    if(this.topDiv.style.left === "" ) this.topDiv.style.left = this.left;
    if(this.topDiv.style.height === "" ) this.topDiv.style.height = this.height;
    if(this.topDiv.style.width === "" ) this.topDiv.style.width = this.width;
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "dMenu" +  this.id ); 
    div.setAttribute("class", "draggableMenu gradiente" ); 
    this.topDiv.appendChild( div );
    this.menuDiv = div;

    if( aToolBarButtons ) {
        var div = document.createElement("DIV");
        div.setAttribute("id", "dToolBar" +  this.id ); 
        div.setAttribute("class", "draggableToolBar" ); 
        this.topDiv.appendChild( div );
        this.toolBar = div;
    }
    
    div = document.createElement("DIV");
    div.setAttribute("id", "draggableData" + this.id ); 
    div.setAttribute("class", "draggableData" ); 
    this.topDiv.appendChild( div );
    this.dataDiv = div;
    
    if(this.alternativeResize) {
        this.hasStatusBar = false;
        this.topDiv.style.overflow = 'visible';

        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatusResizeTop" + this.id ); 
        div.setAttribute("class", "draggableAlternativeResizeTop" ); 
        this.topDiv.appendChild( div );
        this.resizeCornerTop = div;
        this.resizeCornerTop.innerHTML = '<img src="images/corner_resize.top.gif">';

        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatusResize" + this.id ); 
        div.setAttribute("class", "draggableAlternativeResize" ); 
        this.topDiv.appendChild( div );
        this.resizeCorner = div;
        this.resizeCorner.innerHTML = '<img src="images/corner_resize.gif">';

    } else if( this.hasStatusBar ) {
        
        this.dataDiv.setAttribute("class", "draggableData withStatusBar" ); ;
        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatus" + this.id ); 
        div.setAttribute("class", "draggableStatus" ); 
        this.topDiv.appendChild( div );
        this.bottomBar = div;

        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatusMsgLine" + this.id ); 
        div.setAttribute("class", "draggableStatusMsgLine" ); 
        this.bottomBar.appendChild( div );
        this.messageLine = div;

        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatusResize" + this.id ); 
        div.setAttribute("class", "draggableStatusResize" ); 
        this.bottomBar.appendChild( div );
        this.resizeCorner = div;
        this.resizeCorner.innerHTML = '<img src="images/statusbar_resize.gif">';
    }
    
    this.calcMinHeight = function () {
        this.minHeight = (this.menuDiv && this.menuDiv.style.display !== 'none' ? this.menuDiv.clientHeight : 0 ) 
           + (this.toolBar && this.toolBar.style.display !== 'none' ? this.toolBar.clientHeight : 0 ) 
           + (this.bottomBar && this.bottomBar.style.display !== 'none' ? this.bottomBar.clientHeight+3 : 0 );
    };
    
    //trata resize tanto do canto superior esquerdo quanto do canto inferior direito
    if( this.alternativeResize || this.hasStatusBar ) {

        //top resizer - só existe no modo alternativo
        if( this.resizeCornerTop ) {
            this.divResizeTop = function (e) {
                e.stopPropagation();
                e.preventDefault();
                var touches = e.changedTouches;
                var p = {x: e.clientX, y: e.clientY};
    
                if (touches) {
                    var l = touches.length - 1;
                    p.x = touches[l].clientX;
                    p.y = touches[l].clientY;
                }
                e.preventDefault();
                
                self.calcMinHeight();
                
                var w = (self.topDiv.clientWidth + self.x - p.x);
                var h = (self.topDiv.clientHeight + self.y - p.y );
                self.topDiv.style.width = ( w < self.minWidth ? self.minWidth : w ) + 'px';
                self.topDiv.style.height = ( h < self.minHeight ? self.minHeight : h ) + 'px';
                self.topDiv.style.left = ( self.topDiv.offsetLeft - 1 + (p.x - self.x) ) + 'px';
                self.topDiv.style.top = ( self.topDiv.offsetTop - 1 + (p.y - self.y) ) + 'px';
    
                self.x = p.x;
                self.y = p.y;
                self.eventsCentral('RESIZE');
            };
    
            this.mouseEndResizeTop = function (e) {
                e.stopPropagation();
                e.preventDefault();
                window.removeEventListener('mouseup', self.mouseEndResizeTop, false);
                window.removeEventListener('touchend', self.mouseEndResizeTop, false);
                window.removeEventListener('touchmove', self.divResizeTop, false);
                window.removeEventListener('touchleave', self.divResizeTop, false);
                window.removeEventListener('mousemove', self.divResizeTop, false);
                window.removeEventListener('mouseout', self.divResizeTop, false);
                self.dataDiv.style.pointerEvents = "auto";
                self.eventsCentral('RESIZE');
            };
    
            this.mouseResizeTop = function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.dataDiv.style.pointerEvents = "none";
                window.addEventListener('mouseup', self.mouseEndResizeTop, false);
                window.addEventListener('touchend', self.mouseEndResizeTop, false);
                window.addEventListener('touchmove', self.divResizeTop, false);
                window.addEventListener('touchleave', self.divResizeTop, false);
                window.addEventListener('mousemove', self.divResizeTop, false);
                window.addEventListener('mouseout', self.divResizeTop, false);
                self.x = e.clientX;
                self.y = e.clientY;
            };
    
            this.resizeCornerTop.addEventListener( 'mouseover', function() { self.resizeCornerTop.style.cursor='nwse-resize'; }, false);
            this.resizeCornerTop.addEventListener( 'mousedown', this.mouseResizeTop, false);
            this.resizeCornerTop.addEventListener('touchstart', this.mouseResizeTop, {passive:true});
        }

        //bottom resizer - existe em ambos os modos: alternativo e statusbar
        this.mouseResize = function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.dataDiv.style.pointerEvents = "none";
            window.addEventListener('mouseup', self.mouseEndResize, false);
            window.addEventListener('touchend', self.mouseEndResize, false);
            window.addEventListener('touchmove', self.divResize, false);
            window.addEventListener('touchleave', self.divResize, false);
            window.addEventListener('mousemove', self.divResize, false);
            window.addEventListener('mouseout', self.divResize, false);
            self.x = e.clientX;
            self.y = e.clientY;
        };

        this.mouseEndResize = function (e) {
            e.stopPropagation();
            e.preventDefault();
            window.removeEventListener('mouseup', self.mouseEndResize, false);
            window.removeEventListener('touchend', self.mouseEndResize, false);
            window.removeEventListener('touchmove', self.divResize, false);
            window.removeEventListener('touchleave', self.divResize, false);
            window.removeEventListener('mousemove', self.divResize, false);
            window.removeEventListener('mouseout', self.divResize, false);
            self.dataDiv.style.pointerEvents = "auto";
            self.eventsCentral('RESIZE');
        };

        this.divResize = function (e) {
            e.stopPropagation();
            e.preventDefault();
            var touches = e.changedTouches;
            var p = {x: e.clientX, y: e.clientY};

            if (touches) {
                var l = touches.length - 1;
                p.x = touches[l].clientX;
                p.y = touches[l].clientY;
            }
            e.preventDefault();
            
            self.calcMinHeight();
            
            var w = (self.topDiv.clientWidth + p.x - self.x);
            var h = (self.topDiv.clientHeight + p.y - self.y);
            self.topDiv.style.width = ( w < self.minWidth ? self.minWidth : w ) + 'px';
            self.topDiv.style.height = ( h < self.minHeight ? self.minHeight : h ) + 'px';

            self.x = p.x;
            self.y = p.y;
            self.eventsCentral('RESIZE');
        };

        this.resizeCorner.addEventListener( 'mouseover',  function() { self.resizeCorner.style.cursor='nwse-resize'; }, false);
        this.resizeCorner.addEventListener( 'mousedown',  this.mouseResize, false);
        this.resizeCorner.addEventListener( 'touchstart', this.mouseResize, {passive:true});

    }
    
    this.divMove = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var touches = e.changedTouches;
        var p = {x: e.clientX, y: e.clientY};

        if (touches) {
            var l = touches.length - 1;
            p.x = touches[l].clientX;
            p.y = touches[l].clientY;
        }
        e.preventDefault();
        var y = ((p.y - self.y) + parseInt(self.topDiv.style.top));
        var x = ((p.x - self.x) + parseInt(self.topDiv.style.left));
        self.topDiv.style.top = (self.minTop && y < self.minTop ? self.minTop: y) + "px"; //hardcoded top of window
        self.topDiv.style.left = (self.minLeft && x < self.minLeft ? self.minLeft: x) + "px";
        self.x = p.x;
        self.y = p.y;
    };

    this.mouseEndMove = function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.removeEventListener('mouseup', self.mouseEndMove, false);
        window.removeEventListener('touchend', self.mouseEndMove, false);
        window.removeEventListener('touchmove', self.divMove, false);
        window.removeEventListener('touchleave', self.divMove, false);
        window.removeEventListener('mousemove', self.divMove, false);
        window.removeEventListener('mouseout', self.divMove, false);
        self.dataDiv.style.pointerEvents = "auto";
        self.eventsCentral('MOVE');
    };
    
    this.mouseMove = function (e) {
//        e.preventDefault();
//        e.stopPropagation();
//        if(!self.draggable) return;

        if(!self.draggable) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
       
        self.dataDiv.style.pointerEvents = "none";
        window.addEventListener('mouseup', self.mouseEndMove, false);
        window.addEventListener('touchend', self.mouseEndMove, false);
        window.addEventListener('touchmove', self.divMove, false);
        window.addEventListener('touchleave', self.divMove, false);
        window.addEventListener('mousemove', self.divMove, false);
        window.addEventListener('mouseout', self.divMove, false);
        self.x = e.clientX;
        self.y = e.clientY;
    };

    this.close = function(e) {
        self.topDiv.style.display='none';
    };
    
    this.focus = function(e) {
        if(self.draggable)
            self.topDiv.style.zIndex = self.zIndex+1000;
        //waterbug.log(self.topDiv.id + ' ' + self.topDiv.style.zIndex);
        //waterbug.show();
    };
    
    this.blur = function(e) {
        self.topDiv.style.zIndex = self.zIndex;
        //waterbug.log(self.topDiv.id + ' ' + self.topDiv.style.zIndex);
        //waterbug.show();
    };
    
    this.addButtons( this.id, aButtons );
    this.addToolButtons( this.id, aToolBarButtons );
    this.addTitle( this.id, this.title );
    
    this.topDiv.tabIndex = this.id;

    this.topDiv.addEventListener( 'focus', function (e) {
        e.stopPropagation();
        e.preventDefault();
        self.focus();
    }, false );
    
    this.topDiv.addEventListener( 'blur', function (e) {
        e.stopPropagation();
        e.preventDefault();
        self.blur();
    }, false );
    
};

DRAGGABLE.ui.Window.prototype.formatStyleParam = function ( p ) {
    p = (isNaN(p)===false) ? ''+p : p;
    return (p === ''+parseInt(p)? p + 'px' : p );
};

DRAGGABLE.ui.Window.prototype.move = function( left, top ) {
    this.topDiv.style.left = this.formatStyleParam( left );
    this.topDiv.style.top = this.formatStyleParam( top );
};

DRAGGABLE.ui.Window.prototype.setSize = function( width, height ) {
    this.topDiv.style.width = this.formatStyleParam( width ); 
    this.topDiv.style.height = this.formatStyleParam( height ); 
};


DRAGGABLE.ui.Window.prototype.setVisible = function( visible ) {
    this.topDiv.style.display=(visible? 'block':'none');
    (visible) && this.focus();
};

DRAGGABLE.ui.Window.prototype.setMenuVisible = function( visible ) {
    this.menuDiv.style.display=(visible? 'block':'none');
    (visible) && this.focus();
}

DRAGGABLE.ui.Window.prototype.setToolBarVisible = function (visible) {
    if( this.toolBar ) {
        this.toolBar.style.display = visible ? 'block' : 'none';
        this.resize();
    }
};

DRAGGABLE.ui.Window.prototype.setStatusBarVisible = function (visible) {
    if( this.bottomBar ) {
        this.bottomBar.style.display = visible ? 'block' : 'none';
        this.resize();
    }
};

DRAGGABLE.ui.Window.prototype.setStatusMessage = function (msg) {
    if(this.messageLine)
        this.messageLine.innerHTML = msg;
};        

DRAGGABLE.ui.Window.prototype.setButtonVisible = function( action, visible ) {
    var b = this.actionList[action.toUpperCase()];
    if( b ) {
        b.style.display = visible? '' : 'none';
    }
};

DRAGGABLE.ui.Window.prototype.setFloating = function (floating) {
    this.draggable = floating;
    
    if( this.draggable ) {
        if( this.alternativeResize )
            this.resizeCorner.style.display = 'block';
        
        this.topDiv.className = "draggableWindow";
        if(this.parent) {
            this.topDiv.style.position = "absolute";
        }
        this.minTop = 1; // ver isso
        this.minLeft = 1; // ver isso
        this.focus();
    } else {
        if( this.alternativeResize )
            this.resizeCorner.style.display='none';
        
        this.topDiv.className = "draggableWindow noShadow";
        this.topDiv.style.position = "relative"; // pq assume isso quando nao dragavel?
        this.topDiv.style.margin = "1px";
        this.blur();
    }
};

DRAGGABLE.ui.Window.prototype.resize = function() {
    this.calcMinHeight();
    this.dataDiv.style.height =  (this.topDiv.clientHeight - this.minHeight) + 'px';
};

DRAGGABLE.ui.Window.prototype.defineCallback = function( cb ) {
    this.callback = cb;
};

DRAGGABLE.ui.Window.prototype.eventsCentral = function (action, elem) {
    if (this.callback) {
        this.callback.listener[this.callback.method]( action, elem);
    } else {
        if (action === 'CLOSE') {
            this.close();
        }
    }
};

DRAGGABLE.ui.Window.prototype.setTitle = function( title, translator ) {
    var translated_title = "";
    if( translator && title !== "" ) {
        translated_title = translator.getResource(title);
        this.titleSpan.setAttribute('data-translate', title);
    } else {
        this.titleSpan.removeAttribute('data-translate');
        translated_title = (title? title : translated_title);
    }
    this.titleSpan.innerHTML = translated_title;
};

DRAGGABLE.ui.Window.prototype.setSubTitle = function( title, translator ) {
    var translated_title = "";
    if( translator && title !== "" ) {
        var t = translator.getResource(title);
        translated_title = (t? '- ' + t : translated_title); 
        this.subTitleSpan.setAttribute('data-translate', title);
    } else {
        this.subTitleSpan.removeAttribute('data-translate');
        translated_title = (title? title : translated_title);
    }
    this.subTitleSpan.innerHTML = translated_title;
};

DRAGGABLE.ui.Window.prototype.addTitle = function( id, title  ) {
    var self = this, translated_title, spn = "";
    
    var div = document.createElement("DIV");
    div.setAttribute("class", "dTitle" ); 
    
    if( title && this.translator ) {
        translated_title = this.translator.getResource(title);
        spn = 'data-translate="'+title+'"';
    }
    
    div.innerHTML = '<span id="dSpanTitle'+id+'" '+spn+' style="padding-left: 6px; float:left; white-space: nowrap;">'+(translated_title?translated_title:title)+'</span>'+
                        '<span id="dSpanSubTitle'+id+'" style="padding-left: 6px; float:left; white-space: nowrap;"></span>';
    
    self.menuDiv.appendChild(div);
    
    self.titleSpan = document.getElementById("dSpanTitle"+id);
    self.subTitleSpan = document.getElementById("dSpanSubTitle"+id);
    
    if(self.draggable && self.menuDiv) {
        self.menuDiv.addEventListener( 'mouseover', function() { self.menuDiv.style.cursor='move'; }, false);
    }
    self.menuDiv.addEventListener( 'mousedown', self.mouseMove, false);
    self.menuDiv.addEventListener('touchstart', self.mouseMove, {passive:true});
    
};

DRAGGABLE.ui.Window.prototype.addButtons = function( id,  aButtons ) {
    var defaultButtons = ['close'];
    var self = this;
    
    var buttonMap = { CLOSE: 'close', MOVE: 'move', ROTATE: 'rotate', GLOBE: 'world', ZOOM:'zoom-in', HELP:'circle-question', 
                        POPIN: 'popin', POPOUT: 'popout', RESTORE:'restore', MAXIMIZE:'full-screen', APPLY:'tick', PRINT:'printer'  };
    
    if(aButtons)
        defaultButtons = defaultButtons.concat(aButtons);
    
    defaultButtons.forEach( function (label) {
        
        label = label.split('|');
        
        var spn = "";
        var action = label[0].toUpperCase();
        var rotulo = label.length > 1 ? label[1] : "";
        var ico = 'ico-' + (buttonMap[action] ? buttonMap[action] : action.toLowerCase());
        var translateId = label.length > 1 ? label[1] : label[0];
        
        if( self.translator ) {
            rotulo = self.translator.getResource(translateId);
            spn = 'data-translate="'+translateId+'"';
        }
        
        var html = '<i class="'+ ico +' ico-white" title="'+ rotulo +'" '+spn+' ></i>';
        
        var div = document.createElement("DIV");
        div.setAttribute("id", 'd'+ action +'Button'+id ); 
        div.setAttribute("class", "dButton" ); 
        div.innerHTML = action === 'MOVE' ? html : '<a href="">'+html+'</a>' ;
        
        self.addAction( action, div, self );
        self.menuDiv.appendChild(div);
        
    });
};

DRAGGABLE.ui.Window.prototype.addAction = function( action, div, self ) {
        
    if(! this.actionList ) {
        this.actionList = {};
    }
    
    this.actionList[action] = div; // salva a lista de acões 
    
    if( action === 'MOVE' ) return; // apenas registra na lista de ações 
    
    var f = function(e) {
        e.preventDefault(); 
        e.stopPropagation(); 
        self.eventsCentral(action, div);
    };
    
    div.addEventListener( 'click', f, false);
    div.addEventListener( 'touchstart', f, {passive:true});
    div.addEventListener( 'mousedown', function(e) { e.preventDefault(); e.stopPropagation(); }, false);
};

DRAGGABLE.ui.Window.prototype.dispatchAction = function( action ) {
    this.eventsCentral(action, this.actionList[action] );
};

DRAGGABLE.ui.Window.prototype.addToolButtons = function( id,  aButtons ) {
    if(!aButtons) return;
    var self = this;
    
    var buttonMap = { 
        GUTTER:'list-numbered', REFRESH:'bolt', DOWNLOAD:'download', FONTSIZE: 'fontsize', 
        DROPDOWN:'open-down', OCTAVEDOWN:'octave-down', OCTAVEUP:'octave-up', 
        FINDNREPLACE:'find-and-replace', 
        UNDO:'undo', UNDOALL:'undo-all', REDO:'redo', REDOALL:'redo-all', LIGHTON:'lightbulb-on', READONLY:'lock-open' };
    
    aButtons.forEach( function (label) {
        
        label = label.split('|');
        
        var spn = "";
        var action = label[0].toUpperCase();
        var rotulo = label.length > 1 ? label[1] : "";
        var translateId = label.length > 1 ? label[1] : label[0];
        
        
        if( self.translator ) {
            rotulo = self.translator.getResource(translateId);
            spn = 'data-translate="'+translateId+'"';
        }
        
        var div = document.createElement("DIV");
        div.id =  'd'+ action +'Button'+id ; 
        self.toolBar.appendChild(div);
        
        if( action === 'DROPDOWN' ) {
            // flavio - verificar as implicações de não usar tradução aqui
            div.className = "dButton topMenu";
            
            if( typeof self.menu === "undefined" ) {
                self.menu = {};
            }
                    
            var ddmId = label[1];
            self.menu[ddmId] = new DRAGGABLE.ui.DropdownMenu(
                 div
                ,self.callback
                ,[{title: '...', ddmId: ddmId, tip: rotulo, itens: []}]
            );
    
        } else {
            
            var icon = 'ico-' + (buttonMap[action] ? buttonMap[action] : action.toLowerCase());
            
            div.className = "dButton";
            div.innerHTML = '<a href="" ><i class="'+ icon +' ico-black ico-large" title="'+ rotulo +'" '+spn+' ></i></a>';
            self.addAction( action, div, self );
            
        }
    });
};

DRAGGABLE.ui.Window.prototype.addPushButtons = function( aButtons ) {
    for( var p = 0; p < aButtons.length; p ++ ) {
        var ico, claz;
        var part = aButtons[p].split('|');
        var button = document.getElementById(part[0]);
        
        var action = part[1].split('-');

        switch( action[action.length-1].toUpperCase() ) {
            case 'SEARCH': 
                ico = 'ico-search';  
                claz = 'pushbutton';  
                break;
            case 'REPLACE': 
                ico = 'ico-redo';  
                claz = 'pushbutton';  
                break;
            case 'REPLACEALL': 
                ico = 'ico-redo-all';  
                claz = 'pushbutton';  
                break;
            case 'YES': 
            case 'APPLY': 
                ico = 'ico-circle-tick';  
                claz = 'pushbutton';  
                break;
            case 'RESET': 
                ico = 'ico-circle-r';     
                claz = 'pushbutton';  
                break;
            case 'NO': 
            case 'CLOSE': 
            case 'CANCEL':
                ico = 'ico-circle-error'; 
                claz = 'pushbutton cancel'; 
                break;
        }
        
        new DRAGGABLE.ui.PushButton(button, claz, ico, part[1], part[2], this );
        
    }
};


DRAGGABLE.ui.PushButton = function( item, claz, ico, act, text, janela) {
    var spn = "";
    var translateId = text ? text : act;
    this.item = item;
    this.item.className = claz;
    
    if( janela.translator ) {
        text = janela.translator.getResource(translateId);
        spn = 'data-translate="'+translateId+'"';
    }

    this.item.innerHTML = '<i class="'+ico+'" ></i><span '+spn+'>'+text+'</span></div>' ;
    
    this.item.addEventListener('click', function(e) {
        e.preventDefault(); 
        e.stopPropagation(); 
        janela.eventsCentral(act.toUpperCase(), item);
    }, false );
};
