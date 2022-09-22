/* abc_selectors.js
   Implenta alguns objetos para controle de tela, tais como o um seletor de acordeons e um seletor de tonalidades
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!ABCXJS.edit)
	ABCXJS.edit = {};

ABCXJS.edit.AccordionSelector = function (id, divId, callBack, extraItems ) {
    
    this.extraItems = extraItems || [];
    this.ddmId = id;
    
    if (divId instanceof DRAGGABLE.ui.DropdownMenu) {
        this.menu = divId;   
    } else {
        this.menu = new DRAGGABLE.ui.DropdownMenu(
               divId
            ,  callBack
            ,  [{title: 'Acordeons', ddmId: this.ddmId, itens: []}]
        );
    }
    
    // tratar os casos os o listener não possui um acordeon definido
    if (callBack && callBack.listener && callBack.listener.accordion) {
        this.accordion = callBack.listener.accordion;
    }
};
    
ABCXJS.edit.AccordionSelector.prototype.populate = function(changeTitle, selectId ) {
    var m, selectItem, title;

    this.menu.emptySubMenu( this.ddmId );    
    
    for (var i = 0; i < this.accordion.accordions.length; i++) {
        m = this.menu.addItemSubMenu( 
            this.ddmId, 
            this.accordion.accordions[i].getFullName() + '|' 
                + this.accordion.accordions[i].getId() );
        
        // identifica o item a ser selecionado
        if( typeof selectId === "undefined"  ) {
            if( this.accordion.getId() === this.accordion.accordions[i].getId() ) {
                selectItem = m;
                title = this.accordion.getFullName();
            }
        } else {
            if( selectId === this.accordion.accordions[i].getId() ) {
                selectItem = m;
                title = this.accordion.accordions[i].getFullName();
            }
        }
    }
    
    // adiciona os itens extra
    for (var i = 0; i < this.extraItems.length; i++) {
        var m = this.menu.addItemSubMenu( this.ddmId, this.extraItems[i] );
    }
    
    if(changeTitle && title )
        this.menu.setSubMenuTitle(this.ddmId, title );
    
    if( selectItem )
        this.menu.selectItem(this.ddmId, selectItem );
    
};

ABCXJS.edit.KeySelector = function(id, divId, callBack ) {
    
    this.ddmId = id;
    if (divId instanceof DRAGGABLE.ui.DropdownMenu) {
        this.menu = divId;   
    } else {
        this.menu = new DRAGGABLE.ui.DropdownMenu(
               divId
            ,  callBack
            ,  [{title: 'Keys', ddmId: this.ddmId, itens: []}]
        );
    }
};

ABCXJS.edit.KeySelector.prototype.setVisible = function (visible) {
    this.menu.setVisible(visible);
};

ABCXJS.edit.KeySelector.prototype.populate = function(offSet) {
    var cromaticSize = 12;
    this.menu.emptySubMenu( this.ddmId );    
    
    for (var i = +(cromaticSize+offSet-1); i > -(cromaticSize-offSet); i--) {
        var opt; 
        if(i > offSet) 
            opt = ABCXJS.parse.number2keysharp[(i+cromaticSize)%cromaticSize] ;
        else
            opt = ABCXJS.parse.number2keyflat[(i+cromaticSize)%cromaticSize] ;
        
        var e = this.menu.addItemSubMenu( this.ddmId, opt + '|' + (i-offSet) );
        
        if( i === offSet ) {
            this.menu.setSubMenuTitle( this.ddmId, opt );
            this.menu.selectItem( this.ddmId, e );
        }
      
    }
};

