/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * Implements: 
*   - DRAGGABLE.ui.Alert
*   - DRAGGABLE.ui.ReplaceDialog
*   - DRAGGABLE.ui.ColorPicker
*   
 */

if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, slideId: 0, oneTimeCloseFunction : null, lastOpen: null };

DRAGGABLE.ui.Alert = function( parent, action, text, description, options ) {
    
    var x, y, w, h, callback;
    
    options = options? options : {};
    this.translator = options.translator ? options.translator : null;
    
    this.callback = { listener: this, method: 'alertCallback' };
    
    if(!parent) {
        
        this.parentCallback = null;
        
        // redimensiona a workspace
        var winH = window.innerHeight
                    || document.documentElement.clientHeight
                    || document.body.clientHeight;

        var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;
        
        x = winW/2-350;
        y = winH/2-150;
        
    } else {
        this.parentCallback = parent.callback;
        x = parent.topDiv.offsetLeft + 50;
        y = parent.topDiv.offsetTop + 50;
    }
    
    var w = ( action ? "500px" : "700px" );
    var h = "auto";
    
    x = options.x !== undefined ? options.x : x;
    y = options.y !== undefined ? options.y : y;
    w = options.w !== undefined ? options.w : w;
    h = options.h !== undefined ? options.h : h;
    
    this.container = new DRAGGABLE.ui.Window(
          null
        , null
        , {title: 'AlertTitle', translator: this.translator, statusbar: false, top: y+"px", left: x+"px", width: w, height: h, zIndex: 300}
        , this.callback
    );
    
    this.container.dataDiv.innerHTML = '<div class="dialog" >\n\
        <div class="flag"><i class="ico-circle-'+(action? 'question' : 'exclamation')+'"></i></div>\n\
        <div class="text-group'+(action? '' : ' wide')+'">\n\
            <div class="title">'+text+'</div>\n\
            <div class="description">'+description+'</div>\n\
        </div>\n\
        <div id="pgAlert" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1Alert"></div>\n\
            <div id="botao2Alert"></div>\n\
        </div>\n\
    </div>';
    
    if( action ) {
    
        this.container.addPushButtons([
            'botao1Alert|'+action+'-YES|yes',
            'botao2Alert|'+action+'-NO|no'
        ]);

    } else {
        
        this.container.addPushButtons([
            'botao1Alert|CLOSE|ok'
        ]);
        
    }   
    this.modalPane = document.getElementById('modalPane');
    
    if( ! this.modalPane ) {
        
        var div = document.createElement("DIV");
        div.id = 'modalPane';
        div.style = "position:absolute; z-index:250; background-color:black; opacity:0.4; top:0; left:0; bottom:0; right:0; pointer-events: block; display:none;";
        document.body.appendChild(div);
        this.modalPane = div;
        
    }    
    
    this.modalPane.style.display = 'block';
        
    this.container.setVisible(true);

};

DRAGGABLE.ui.Alert.prototype.close = function( ) {
    this.modalPane.style.display = 'none';
    this.container.setVisible(false);
    this.container.topDiv.remove();
    this.container = null;
};

DRAGGABLE.ui.Alert.prototype.alertCallback = function ( action, elem ) {
    switch(action) {
        case 'CLOSE': 
        case 'CANCEL': 
           this.close();
           break;
        default:
            if( this.parentCallback )
                this.parentCallback.listener[this.parentCallback.method](action, elem);
    }
};

DRAGGABLE.ui.ReplaceDialog = function( parent, options ) {
    
    var x, y, st = "Localizar:", rt = "Substituir por:", cs = 'Diferenciar maiúsculas e minúsculas', ww = 'Pesquisar palavras inteiras';
    
    options = options? options : {};
    this.translator = options.translator ? options.translator : null;
    
    this.parentCallback = parent.callback;
    this.callback = { listener: this, method: 'dialogCallback' };
    x = Math.min( parent.dataDiv.clientWidth/2 - 250, 200);
    y = 20;
    
    this.container = new DRAGGABLE.ui.Window(
          parent.dataDiv
        , null
        , {title: 'ReplaceDialogTitle', translator: this.translator, statusbar: false, top: y+"px", left: x+"px", width: "500px", height:"auto", zIndex: 300}
        , this.callback
    );
    
    if( this.translator ) {
        st = this.translator.getResource( "searchTerm" );
        rt = this.translator.getResource( "replaceTerm" );
        cs = this.translator.getResource( "match_case" );
        ww = this.translator.getResource( "whole_word" );
    }
    
    this.container.dataDiv.innerHTML = '<div class="dialog" >\n\
        <div class="flag"><i class="ico-find-and-replace"></i></div>\n\
        <div class="text-group">\n\
            <br><span data-translate="searchTerm">'+st+'</span><br><input id="searchTerm" type="text" value=""></input>\n\
            <br><input id="chk_match_case" type="checkbox"><span data-translate="match_case">'+cs+'</span>\n\
            <br><input id="chk_whole_word" type="checkbox"><span data-translate="whole_word">'+ww+'</span>\n\
            <br><br><span data-translate="replaceTerm">'+rt+'</span><br><input id="replaceTerm" type="text" value=""></input>\n\
        </div>\n\
        <div id="pgAlert" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1Replace"></div>\n\
            <div id="botao2Replace"></div>\n\
            <div id="botao3Replace"></div>\n\
            <div id="botao4Replace"></div>\n\
        </div>\n\
    </div>';
    
    this.container.addPushButtons([
        'botao1Replace|search',
        'botao2Replace|replace',
        'botao3Replace|replaceall',
        'botao4Replace|cancel'
    ]);

    this.searchTerm = document.getElementById("searchTerm");
    this.replaceTerm = document.getElementById("replaceTerm");
    this.chkMatchCase = document.getElementById("chk_match_case");
    this.chkWholeWord  = document.getElementById("chk_whole_word");       
    
    this.container.setVisible(true);

};

DRAGGABLE.ui.ReplaceDialog.prototype.close = function( ) {
    //this.modalPane.style.display = 'none';
    this.container.setVisible(false);
    this.container.topDiv.remove();
    this.container = null;
};

DRAGGABLE.ui.ReplaceDialog.prototype.dialogCallback = function ( action, elem ) {
    switch(action) {
        case 'MOVE': 
           break;
        case 'CLOSE': 
        case 'CANCEL': 
           this.close();
           break;
        default:
            this.parentCallback.listener[this.parentCallback.method]('DO-'+action, elem, this.searchTerm.value, this.replaceTerm.value, this.chkMatchCase.checked, this.chkWholeWord.checked );
    }
};

DRAGGABLE.ui.ColorPicker = function( itens, options ) {
    
    options = options? options : {};
    this.translator = options.translator ? options.translator : null;
    
    this.container = new DRAGGABLE.ui.Window( 
          null
        , [ 'apply|select' ]
        , { title: 'PickerTitle', translator: this.translator, draggable:true, width: "auto", height: "auto", zIndex:"200" }
        , {listener : this, method: 'pickerCallBack' }
    );

    var txtRO = ""
    if(options.readonly) {
        txtRO='readonly'
    }

    this.container.dataDiv.innerHTML = '\
<div class="picker-group">\
    <canvas id="colorPickerCanvas"></canvas><br>\
    <input id="originalColor" '+txtRO+' ></input>\
    <input id="newColor" '+txtRO+' ></input>\
</div>'; 
   
    this.originalColor = document.getElementById( 'originalColor' );
    this.newColor = document.getElementById( 'newColor' );
    
    this.cp = new KellyColorPicker({
        place : 'colorPickerCanvas', 
        size : 190, 
        input : 'newColor'  
    });
    
    var self = this;
    
    for( var i = 0; i < itens.length; i++ ) {
        document.getElementById(itens[i]).addEventListener('click', function( e ) { self.activate(this); e.stopPropagation(); } );
    }
};

DRAGGABLE.ui.ColorPicker.prototype.pickerCallBack = function( action, elem ) {
    switch(action) {
        case 'MOVE': 
            break;
        case 'APPLY': 
            this.item.style.backgroundColor = this.item.value = this.newColor.value;
            this.close();
            break;
        case 'CLOSE': 
           this.item.style.backgroundColor = this.item.value = this.originalColor.value;
           this.close();
   }
};

DRAGGABLE.ui.ColorPicker.prototype.close = function( ) {
    this.container.setVisible(false);
};

DRAGGABLE.ui.ColorPicker.prototype.activate = function( parent ) {
    var self = this;
    
    var oneTimeCloseFunction = function () { 
        self.close(); 
        this.removeEventListener('click', oneTimeCloseFunction, false );
    };
    
    document.addEventListener( 'click', oneTimeCloseFunction  );
    
    this.item = parent;
    this.container.topDiv.addEventListener( 'click', function (e) { e.stopPropagation(); } );
    
    this.newColor.value = this.originalColor.value = this.item.value;
    this.originalColor.style.backgroundColor = this.item.value;
    this.cp.setColorByHex(this.item.value);
    
    var bounds = this.item.getBoundingClientRect();
    
    this.container.topDiv.style.top = ( bounds.top + bounds.height/2  -120 ) + "px";
    this.container.topDiv.style.left = bounds.left + bounds.width + 5 + "px";
    this.container.setVisible(true);
};
