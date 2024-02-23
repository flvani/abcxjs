/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * Implements: 
*   - DRAGGABLE.ui.DropdownMenu
*/

if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, slideId: 0, oneTimeCloseFunction : null, lastOpen: null };
        
DRAGGABLE.ui.DropdownMenu = function (topDiv, options, menu) {
    var self = this;
    var opts = options || {};
    this.headers = {};
    
    this.id = ++ DRAGGABLE.ui.menuId;
    
    this.Lastkey = { time: 0, key: 0, label: "" }; // controla última pesquisa feita no menu.

    this.container = ( typeof topDiv === 'object' ) ? topDiv : document.getElementById(topDiv);
    this.listener = opts.listener || null;
    this.method = opts.method || null;
    this.translate = opts.translate || false;
    this.menuLabel = opts.label || null;
    this.menuBorder = opts.border || false
    this.menuBorderClass = opts.borderClass || 'rounded-corners'

    if (!this.container) {
        waterbug.log('Elemento ' + topDiv + ' não existe!');
        return;
    } else {
        this.container.innerHTML = "";
    }

  
    for ( var m = 0; m < menu.length; m++ ) {
        
        var ddmId = menu[m].ddmId || ('ddm' +this.id +m );
        
        var e1 = document.createElement("div");
        e1.setAttribute( "class", 'dropdown' );
        this.container.appendChild(e1);

        //assumo por hora que, se tem label, tem borda
        if( this.menuLabel ) {
            var h = document.createElement("H1");
            h.setAttribute( "data-translate", this.menuLabel );
            h.appendChild(document.createTextNode(this.menuLabel));
            e1.appendChild(h);
            this.menuBorder = true;
        }

        if(this.menuBorder){
            e1.className += " " + this.menuBorderClass;
        }
        
        var e2 = document.createElement("input");
        e2.setAttribute( "type", "checkbox" );
        e1.appendChild(e2);
        this.headers[ddmId] = { div: null, chk: e2, btn: null, list: null, actionList: {}, labelList: {} };
        
        e2 = document.createElement("button");
        
        if( menu[m].tip ) {
            e2.setAttribute( "data-translate", ddmId );
            e2.setAttribute( "title", menu[m].tip );
        }
        
        e2.setAttribute( "data-ddm", ddmId );
        var spn = this.translate ? '<span data-translate="'+ddmId+'" >' :'<span>';
        e2.innerHTML = spn + (menu[m].title || '' ) + '</span>' + '&#160;'+'<i class="ico-open-down" data-toggle="toggle"></i>';
        
        e2.addEventListener( 'click', function(e) { 
            e.stopPropagation(); 
            e.preventDefault(); 
            self.eventsCentral(this.getAttribute("data-ddm")); 
        }, false);
        
        e2.addEventListener( 'touchstart', function(e) { 
            e.stopPropagation(); 
            e.preventDefault(); 
            self.eventsCentral(this.getAttribute("data-ddm")); 
        }, {passive:false});
 
        e2.addEventListener("keydown",function(e) {
            e.stopPropagation(); 
            e.preventDefault(); 
        });
            
        e2.addEventListener("keyup",function(e) {
            e.stopPropagation(); 
            e.preventDefault(); 
            var ddm = this.getAttribute("data-ddm");
            switch( e.keyCode ) {
                case 27:
                    if(DRAGGABLE.ui.oneTimeCloseFunction) {
                        DRAGGABLE.ui.oneTimeCloseFunction();
                    }
                    break;
                case 13:
                    if( DRAGGABLE.ui.lastOpen && self.headers[DRAGGABLE.ui.lastOpen].highlightItem ) {
                       //alert(DRAGGABLE.ui.lastOpen+','+self.headers[DRAGGABLE.ui.lastOpen].highlightItem);
                       self.eventsCentral( DRAGGABLE.ui.lastOpen, self.headers[DRAGGABLE.ui.lastOpen].highlightItem ) ;  
                    }
                    break;
                case 33: // PgUp
                case 34: // PgDn
                    var cnt = 7;
                    while( self.highlightItem( DRAGGABLE.ui.lastOpen, e.keyCode === 33 ) && cnt > 0 )  cnt --;  
                    break;
                case 36: // Home
                case 35: // End
                    while( self.highlightItem( DRAGGABLE.ui.lastOpen, e.keyCode === 36 ) ) ;  
                    break;
                case 38: // Up
                case 40: // Down
                    if( DRAGGABLE.ui.lastOpen )
                        self.highlightItem( DRAGGABLE.ui.lastOpen, e.keyCode === 38 ) ;  
                    break;
                case 37: // Left
                case 39: // Right
                    if( DRAGGABLE.ui.lastOpen )
                        self.openMenu(DRAGGABLE.ui.lastOpen, e.keyCode === 37 ); 
                    break;
                default:
                    if(e.keyCode >=65 && e.keyCode <=122  ) {
                        self.searchInMenu(DRAGGABLE.ui.lastOpen, e.keyCode ); 
                    }
                    break;    
            }
        });
        
        e1.appendChild(e2);
        this.headers[ddmId].btn = e2;
        
        var e3 = document.createElement("div");
        e3.setAttribute( "class", "dropdown-menu ps--active-y" );
        e3.setAttribute( "data-toggle", "toggle-menu" );
        e1.appendChild(e3);

        this.sbar = new PerfectScrollbar( e3, {
             handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch']
            ,wheelSpeed: 1
            ,wheelPropagation: false
            ,suppressScrollX: true
            ,minScrollbarLength: 100
            ,swipeEasing: true
            ,scrollingThreshold: 500
            ,margin: "4px 0 2px 0"
        });
        
        this.headers[ddmId].div = e3;
        
        e3.addEventListener( 'transitionend', function(e) {
            var v = this.scrollTop;
            this.scrollTop=10000;
            this.scrollTop=v;
            self.sbar.update();
        }, false);

        var e4 = document.createElement("ul");
        e3.appendChild(e4);
        this.headers[ddmId].list = e4;
        
        for ( var i = 0; i < menu[m].itens.length; i++ ) {
            this.addItemSubMenu(ddmId, menu[m].itens[i]);
        }
    }
};

DRAGGABLE.ui.DropdownMenu.prototype.dispatchAction = function( ddm, action ) {
    this.headers[ddm].actionList[action].getElementsByTagName('a')[0].click();
};

DRAGGABLE.ui.DropdownMenu.prototype.setVisible = function (visible) {
    this.container.style.display = visible? '' : 'none' ;
};

DRAGGABLE.ui.DropdownMenu.prototype.getSubMenu = function (ddm) {
    if( ! this.headers[ddm] ) {
        waterbug.log( 'Menu não encontrado!' );
        return false;
    }
    return this.headers[ddm];
};

DRAGGABLE.ui.DropdownMenu.prototype.getSubItem = function (ddm, item) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    
    var toSel = item;
    if(  typeof item === "string" ) {
        toSel = this.headers[ddm].actionList[item];
    } 
    
    return (toSel ?  toSel: false );
};

DRAGGABLE.ui.DropdownMenu.prototype.disableSubItem = function (ddm, action) {
    var item = this.getSubItem(ddm,action);
    
    if( ! item ) {
        return false;
    }
    
    item.style.pointerEvents = 'none';
    item.style.opacity = '0.5';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.enableSubItem = function (ddm, action) {
    
    var item = this.getSubItem(ddm,action);
    
    if( ! item ) {
        return false;
    }
    
    item.style.pointerEvents = '';
    item.style.opacity = '';
};

DRAGGABLE.ui.DropdownMenu.prototype.disableSubMenu = function (ddm) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    
    this.headers[ddm].chk.checked = false;
    this.headers[ddm].btn.style.pointerEvents = 'none';
    this.headers[ddm].btn.style.opacity = '0.5';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.enableSubMenu = function (ddm) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    
    this.headers[ddm].chk.checked = false;
    this.headers[ddm].btn.style.pointerEvents = '';
    this.headers[ddm].btn.style.opacity = '';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.emptySubMenu = function (ddm) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    this.headers[ddm].list.innerHTML = "";
    
};

DRAGGABLE.ui.DropdownMenu.prototype.openMenu = function (ddm, previous ) {
    var toSel, next = false, prev;
    for( var item in this.headers ) {
        if(next) {
            toSel = item;
            break;
        }
        if( !previous && item === ddm) {
            next = true;
        } else if (previous && prev && item === ddm ){
            toSel = prev;
            break;
        }
        prev = item;
    }
    if( ! toSel ) return false;
    this.eventsCentral(toSel);
    
};

DRAGGABLE.ui.DropdownMenu.prototype.searchInMenu = function (ddm, key ) {

    if( this.headers[ddm] === undefined ) return;

    var toSel = "";
    var acts = this.headers[ddm].labelList;
    var chr = String.fromCharCode(key).toUpperCase();
    var agora = new Date().getTime();
    var validade  = 3000; // 3 segundos

    // tecla repetida, dentro da validade, então busque o próximo da mesma letra inicial
    var findNext = ( this.Lastkey.key === key && this.Lastkey.time > ( agora - validade ) );

    if( findNext ) {
        var next = false;
        for( var item in acts ) {
            if(  next ) {
                if( item.startsWith(chr) ) {
                    toSel = item;
                    break;
                }
            } else if( this.headers[ddm].highlightItem && item === this.Lastkey.label ) {
                next = true;
            }
        }
    } else {
        var previo = "";
        //tenta encontrar um que comece com a letra procurada
        for( var item in acts ) {
            if( previo === "" ) previo = item; // registra o primeiro item para usar abaixo
            if( item.startsWith(chr) ){
               toSel = item;
               break;
            }
        }
        //se não encontrar, para no último menor que a letra procurada
        if( toSel === "" ) {
            for( var item in acts ) {
                if( item.charAt(0) >= chr ){
                    toSel = previo;
                    break;
                }
                previo = item;
            }
        }
    }

    if( toSel !== "" ) {
        this.highlightItem(ddm, this.headers[ddm].labelList[toSel]);
        this.Lastkey = { time: agora, key: key, label: toSel }
    }

};


DRAGGABLE.ui.DropdownMenu.prototype.unhighlightItem = function (menu) {
    var acts = menu.actionlList;

    for( var item in acts ) {
         menu.actionList[item].className = '';
    }

    if( menu.highlightItem && (!menu.selectedItem || menu.selectedItem !== menu.actionList[menu.highlightItem]) ) {
        menu.actionList[menu.highlightItem].className = '';
        delete menu.highlightItem;
    }
};

DRAGGABLE.ui.DropdownMenu.prototype.highlightItem = function (ddm, up) {
    // up can be true or false (indicating direction) or it can be a string indicating an item
    var toSel = up, next = false, prev;
    var menu = this.headers[ddm];

    if( menu === undefined ) return;

    var acts = menu.actionList;
    if( typeof up === "boolean" ) {
        toSel = false;
        for( var item in acts ) {
            if(  acts[item].style.pointerEvents === 'none' ){
                continue;
            }
            if( (! menu.highlightItem) || next ) {
                toSel = item;
                break;
            } else if( !up && menu.highlightItem && menu.highlightItem === item ) {
                next = true;
            } else if (up && prev && menu.highlightItem && menu.highlightItem === item ){
                toSel = prev;
                break;
            }
            prev = item;
        }
    }
    
    if(!toSel) return false;
    
    // sempre limpa e registra o item que seria destacado, mesmo que não veja a marcar (item já selecionado).
    this.unhighlightItem( menu );
    menu.highlightItem = toSel;
    
    if( !menu.selectedItem || menu.selectedItem !== acts[menu.highlightItem] ) {
        acts[toSel].className = 'hover';
    }
        
    if( acts[toSel].offsetTop+acts[toSel].clientHeight >=  menu.div.scrollTop + menu.div.clientHeight ) {
        menu.div.scrollTop = acts[toSel].offsetTop+(1.9*acts[toSel].clientHeight)-menu.div.clientHeight;
    }
    if( acts[toSel].offsetTop <  menu.div.scrollTop ) {
        menu.div.scrollTop = acts[toSel].offsetTop;
    }    
    return true;
};

DRAGGABLE.ui.DropdownMenu.prototype.selectItem = function (ddm, item) {
    var toSel = item;

    var menu = this.headers[ddm];
    this.unhighlightItem( menu );

    if(  typeof item === "string" ) {
        toSel = this.headers[ddm].actionList[item];
    } 
    
    if( ! toSel ) return false;
    
    if( this.headers[ddm].selectedItem ) {
        this.headers[ddm].selectedItem.className = '';
    }
    
    toSel.className = 'selected';
    this.headers[ddm].selectedItem = toSel;
    return toSel;
};
    
DRAGGABLE.ui.DropdownMenu.prototype.setSubMenuTitle = function (ddm, newTitle) {
    
    if( ! this.headers[ddm] ) {
        waterbug.log( 'Menu não encontrado!' );
        return;
    }
    
    var title = newTitle;
    if(  typeof title !== "string" ) {
        title = newTitle.getElementsByTagName('a')[0].innerHTML;
    } 
    
    if( ! title ) {
        waterbug.log( 'Título não encontrado!' );
        return false;
    }
        
    this.headers[ddm].btn.innerHTML = (title || '' ) +'&#160;<i class="ico-open-down" data-toggle="toggle"></i>';
    
};
    
DRAGGABLE.ui.DropdownMenu.prototype.addItemSubMenu = function (ddm, newItem, pos) {
    
    var self = this, e4;
    var tags = newItem.split('|'); 
    
    if( ! self.headers[ddm] ) {
        waterbug.log( 'Menu não encontrado!' );
        return;
    }
    
    if( tags[0].substring(0, 3) ===  '---' ) {
        e4 = document.createElement("hr");
    } else {
        e4 = document.createElement("li"); 
        var action = tags.length > 1 ? tags[1] : tags[0];
        e4.setAttribute( "id",  action );
        
        var e5 = document.createElement("a");
        var spn = this.translate ? '<span data-translate="'+action+'" >' :'<span>';
        
        e5.innerHTML = spn + tags[0] + '</span>';
        e4.appendChild(e5);
        
        this.addAction( ddm, action, e4, this, tags[0]);
        
    }
    
    if(pos>=0) {
        self.headers[ddm].list.insertBefore(e4, self.headers[ddm].list.children[pos]);
    } else {
        self.headers[ddm].list.appendChild(e4);
    }  
    
    // added element
    return e4;
};

DRAGGABLE.ui.DropdownMenu.prototype.setListener = function (listener, method) {
    this.listener = listener || null;
    this.method = method || 'callback';
};

DRAGGABLE.ui.DropdownMenu.prototype.eventsCentral = function (ddm, event) {
    var self = this;
    var e = this.headers[ddm];
    e.chk.checked = ! e.chk.checked;
      
    // close any previously opened menu
    if(DRAGGABLE.ui.oneTimeCloseFunction) {
        DRAGGABLE.ui.oneTimeCloseFunction();
    }

    if( e.chk.checked ) {
        DRAGGABLE.ui.oneTimeCloseFunction = function () { 
            e.chk.checked = false; 
            DRAGGABLE.ui.lastOpen = null;
            self.unhighlightItem( e );
            document.removeEventListener('click', DRAGGABLE.ui.oneTimeCloseFunction, false );
            DRAGGABLE.ui.oneTimeCloseFunction = null;
        };

        document.addEventListener( 'click', DRAGGABLE.ui.oneTimeCloseFunction  );
        DRAGGABLE.ui.lastOpen = ddm;

        if( e.selectedItem )
             e.div.scrollTop = e.selectedItem.offsetTop-115;
    }
    
    if(event && this.listener){
        this.listener[this.method](event);
    }
};

DRAGGABLE.ui.DropdownMenu.prototype.addAction = function( ddm, action, div, self, label ) {
    
    self.headers[ddm].actionList[action]=div; 
    self.headers[ddm].labelList[label]=action; 
    
    div.setAttribute( "data-ddm", ddm );
    div.setAttribute( "data-value", action );
    
    div.addEventListener( 'click', function (e) {
       e.preventDefault(); 
       e.stopPropagation(); 
       self.eventsCentral(this.getAttribute("data-ddm"), this.getAttribute("data-value") );
    }, false);
    
    var swiping = function(e) {
        e.preventDefault(); 
        e.stopPropagation(); 
        self.mouseMovido = true;
        var newY = e.changedTouches[0].pageY;
        var delta = self.startY - newY;
        
        var m = self.headers[ddm].div; 
        
        if( Math.abs(delta) > 10) {
           var v = m.scrollTop + delta;
           if( v < 0 )
               m.scrollTop = 0;
           else if ( v > ( m.scrollHeight - m.ClientHeight ) ) {
               m.scrollTop = ( m.scrollHeight - m.ClientHeight );
           } else {
               m.scrollTop = v;
           }
           self.startY = newY;
           self.moved = true;
        }
    };
    
    div.addEventListener( 'touchstart', function (e) {
       self.startY = e.changedTouches[0].pageY;
       self.moved = false;
       div.addEventListener( 'touchmove', swiping, false );
       //e.preventDefault(); 
       e.stopPropagation(); 
    }, {passive:true});
    
    div.addEventListener( 'touchend', function (e) {
        
        div.removeEventListener( 'touchmove', swiping, false );
        
        swiping(e);
        
        if(! self.moved ) {
            e.preventDefault(); 
            e.stopPropagation(); 
            self.eventsCentral(this.getAttribute("data-ddm"), this.getAttribute("data-value") );
        }
        
    }, false);
    
    div.addEventListener( 'mousedown', function(e) { e.preventDefault(); e.stopPropagation(); }, false);
    div.addEventListener( 'mouseout', function(e)  { e.preventDefault(); e.stopPropagation(); }, false); 
    
    div.addEventListener( 'mouseover', function(e) { 
        e.preventDefault(); 
        e.stopPropagation(); 
        if( self.mouseMovido ) 
           self.highlightItem(this.getAttribute("data-ddm"), this.getAttribute("data-value") );
        self.mouseMovido = false;
    }, false);
    
};
