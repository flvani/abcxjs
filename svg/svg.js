/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
    Created on : 27/04/2016, 10:55:16
    Author     : flavio.vani@gmail.com
*/

/*

Main document structure:

<div style"..." >

    Header:
     Contains a title, the style definitions for the entire document and the defined symbols.
    <svg id="tune" ... >
        <title>Música criada por ABCXJS.</title><style type="text/css">
        <style type="text/css">
            @media print {
                div.nobrk {page-break-inside: avoid} 
                div.newpage {page-break-before: always} 
            }    
        </style>
        <defs>
        </defs>
    </svg>

    Page1:
      Class nobrk, an optional group to control aspects like scaling and the content of the page 
    <div class="nobrk" >
        <svg id="page1"  ... >
            <g id="gpage1" ... ></g>
        </svg>
    </div>

    Page2 and subsequents:
      Class newpage, an optional group to control aspects like scaling and the content of the page 
    <div class="newpage" >
        <svg id="page2"  ...>
            <g id="gpage2" ... ></g>
        </svg>
    </div>

</div>
*/

if (!window.SVG)
    window.SVG = {};

if (! window.SVG.misc )
    window.SVG.misc = { printerId: 0 };

if (! window.SVG.Printer )
    window.SVG.Printer = {};

SVG.Printer = function ( d ) {
    this.topDiv = d;
    this.scale = 1;
    this.gid=0;
    this.printerId = ++SVG.misc.printerId;
   
    this.title;
    this.styles = '';
    this.defines = '';
    this.defined_glyph = [];

    this.svg_pages = [];
    this.currentPage = 0;
    
    this.glyphs = new SVG.Glyphs();
    
    this.initDoc();
    
    this.svgHead = function( id, kls, size ) {
        
        var w = size? size.w*this.scale + 'px' : '0';
        var h = size? size.h*this.scale + 'px' : '0';
        var d = size? '' : 'display: none; ';
        
//        // not in use
//        id = id? 'id="'+id+'"' : '' ;
//        kls = kls? 'class="'+kls+'"' : '' ;
        
        return '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="'+d+'width:'+w+'; height: '+h+';" >\n';
    };
};

SVG.Printer.prototype.initDoc = function( docId, title, add_styles, options ) {
    options = options || {};
    this.docId = docId || 'dcto';
    this.title = title || '';
    this.backgroundColor = options.backgroundColor || 'none';
    this.color = options.color || 'black';
    this.baseColor = options.baseColor || 'black';
    this.scale = 1.0;
    this.defines = '';
    this.defined_glyph = [];

    this.svg_pages = [];
    this.currentPage = -1;
    this.gid=0;
    this.styles = 
'<style type="text/css">\n\
    @media print {\n\
        div.nobrk {page-break-inside: avoid}\n\
        div.newpage {page-break-before: always}\n\
    }\n'+(add_styles||'')+'\n</style>\n';
    
//<![CDATA[\n\
//]]>\n
    
};

SVG.Printer.prototype.endDoc = function( ) {

    var output = '<div style="display:block; margin:0; padding: 0; width: fit-content; background-color:'+this.backgroundColor+'; ">\n' + this.svgHead( this.docId );
    
    output += '<title>'+this.title+'</title>\n';
    output += this.styles;
    
    if(this.defines.length > 0 ) {
        output += '<defs>'+this.defines+'</defs>\n';
    }
    
    output += '</svg>\n';
    
    for( var p=0; p <=  this.currentPage; p++ ) {
        output += '<div class="'+(p>0?'newpage':'nobrk')+'">'+this.svg_pages[p]+'</div>\n';  
    }
    
    output +='</div>';
    
    this.topDiv.innerHTML = output;

};

SVG.Printer.prototype.initPage = function( scl ) {
    this.scale = scl || this.scale;
    this.currentPage++;
    this.svg_pages[this.currentPage] = '';
    var g = 'g' + this.docId + (this.currentPage+1);
    if( this.scale !== 1.0 ) {
        this.svg_pages[this.currentPage]  += '<g id="'+g+'" transform="scale( '+ this.scale +')">';
    }
};

SVG.Printer.prototype.endPage = function( size ) {
    if( this.scale && this.scale !== 1.0 ) {
        this.svg_pages[this.currentPage]  += '</g>';
    }
    var pg = this.docId + (this.currentPage+1);
    this.svg_pages[this.currentPage] = this.svgHead( pg, this.currentPage < 1 ? 'nobrk':'newpage', size ) + this.svg_pages[this.currentPage] + '</svg>\n';
};

SVG.Printer.prototype.beginGroup = function (el_type) {
    var id = 'p'+this.printerId+'g'+(++this.gid); 
    var kls = ' style="fill:'+this.color+'; stroke:none;" ' ;
    this.svg_pages[this.currentPage] += '<g id="'+id+'"'+kls+'>\n';  
    return id;
};

SVG.Printer.prototype.endGroup = function () {
    this.svg_pages[this.currentPage] += '</g>\n';  
};

SVG.Printer.prototype.setDefine = function (s) {
    var p =  this.glyphs.getDefinition(s);
    
    if(p.length === 0 ) return false;
    
    if(!this.defined_glyph[s]) {
        this.defines += p;
        this.defined_glyph[s] = true;
    }
    return true;
};

SVG.Printer.prototype.printLine = function (x,y,dx,dy) {
    if( x === dx ) {
        dx = ABCXJS.misc.isIE() ? 1: 0.6;
        dy -=  y;
    }
    if( y === dy ) {
        dy = ABCXJS.misc.isIE() ? 1: 0.6;
        dx -=  x;
    }
    var pathString = ABCXJS.write.sprintf('<rect style="fill:'+this.color+';"  x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>\n', x, y, dx, dy);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printLedger = function (x,y,dx,dy) {
    var pathString = ABCXJS.write.sprintf('<path style="stroke:'+this.baseColor+'; fill: white; stroke-width:0.6; stroke-dasharray: 1 1;" d="M %.1f %.1f h%.1f"/>\n', x, y, dx-x);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printBeam = function (x1,y1,x2,y2,x3,y3,x4,y4) {
    
//    this.svg_pages[this.currentPage] += ABCXJS.write.sprintf(
//        '<path style="fill:'+this.color + '; stroke:none;" ' +
//        'd="M %.1f %.1f L %.1f %.1f L %.1f %.1f L %.1f %.1f Z" />\n'
//        , x1, y1, x2, y2, x3, y3, x4, y4);
        
// Por algum motivo o path acima apresenta vazamento do preenchimento em algumas escalas de zoom.
// Resolvi usando um path diferente (e não muito eficiente para desenhar o beam
        
    this.svg_pages[this.currentPage] += ABCXJS.write.sprintf(
        '<path style="stroke:none; fill:'+ this.color + ';" ' +
        'd="M %.1f %.1f L %.1f %.1f L %.1f %.1f Z L %.1f %.1f L %.1f %.1f Z" />\n'
        , x1, y1, x2, y2, x3, y3, x3, y3, x4, y4 );
};

SVG.Printer.prototype.printStaveLine = function (x1, x2, y, debug) {
    var color = debug? debug : this.baseColor;
    var dy =0.6;   
    var pathString = ABCXJS.write.sprintf('<rect style="stroke:none; fill: %s;" x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>\n', 
                                                color, x1, y, Math.abs(x2-x1), dy );
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printBar = function (x, dx, y1, y2, real) {
    
    var x2 = x+dx;
    var kls = real?'':'style="stroke:none; fill:'+this.baseColor+'"';
    
    if (ABCXJS.misc.isIE() && dx<1) {
      dx = 1;
    }
    
    var dy = Math.abs(y2-y1);
    dx = Math.abs(dx); 
    
    var pathString = ABCXJS.write.sprintf('<rect '+kls+' x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>\n', Math.min(x,x2), Math.min(y1,y2), dx, dy );

    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printStem = function (x, dx, y1, y2) {
    
    var x2 = x+dx;
    
    if (ABCXJS.misc.isIE() && dx<1) {
      dx = 1;
    }
    
    var dy = Math.abs(y2-y1);
    dx = Math.abs(dx); 
    
    var pathString = ABCXJS.write.sprintf('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>\n', Math.min(x,x2), Math.min(y1,y2), dx, dy );

    this.svg_pages[this.currentPage] += pathString;
};


SVG.Printer.prototype.printTieArc = function (x1,y1,x2,y2,up) {
    
    //unit direction vector
    var dx = x2-x1;
    var dy = y2-y1;
    var norm= Math.sqrt(dx*dx+dy*dy);
    var ux = dx/norm;
    var uy = dy/norm;

    var flatten = norm/3.5;
    var curve = (up?-1:1)*Math.min(25, Math.max(4, flatten));

    var controlx1 = x1+flatten*ux-curve*uy;
    var controly1 = y1+flatten*uy+curve*ux;
    var controlx2 = x2-flatten*ux-curve*uy;
    var controly2 = y2-flatten*uy+curve*ux;
    var thickness = 2;
    
    var pathString = ABCXJS.write.sprintf('<path style="fill:'+this.color+'; stroke-width:0.6px; stroke:none;" d="M %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f z"/>\n', 
                            x1, y1,
                            controlx1, controly1, controlx2, controly2, x2, y2, 
                            controlx2-thickness*uy, controly2+thickness*ux, controlx1-thickness*uy, controly1+thickness*ux, x1, y1 );
    
    this.svg_pages[this.currentPage] += pathString;
};
    
SVG.Printer.prototype.printBrace = function (x, y1, y2) {
    var sz = Math.abs(y1-y2); // altura esperada
    var scale = sz / 1027; // altura real do simbolo
    this.setDefine('scripts.lbrace');
    var pathString = ABCXJS.write.sprintf('<use style="fill:'+this.baseColor+'" x="0" y="0" xlink:href="#scripts.lbrace" transform="translate(%.1f %.1f) scale(0.13 %.5f)" />\n', x, y2, scale );
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printSymbol = function (x, y, symbol) {
    if (this.setDefine(symbol)) {
        var pathString = ABCXJS.write.sprintf('<use x="%.1f" y="%.1f" xlink:href="#%s" />\n', x, y, symbol );
        this.svg_pages[this.currentPage] += pathString;
    } else {
        throw 'Undefined: ' + symbol;
    }
};

SVG.Printer.prototype.tabText = function( x, y, str, clss, anch ) {
    
   if( str === 'scripts.rarrow') {
       //fixme: deveria mudar o tipe de tabtext para symbol, adequadamente
       this.printSymbol(x, y, str );
       return;
   }
   
   str = ""+str;
   if( str.length===0) return;
   
   anch = anch || 'start';
   x = x.toFixed(2);
   y = y.toFixed(2);
   
   this.svg_pages[this.currentPage] += '<text class="'+clss+'" x="'+x+'" y="'+y+'" >'+str+'</text>\n';
};

SVG.Printer.prototype.text = function( x, y, str, clss, anch ) {
   
   str = ""+str;
   if( str.length===0 ) return;
   
   var estilo = clss === 'abc_lyrics' ? '' : 'style="stroke:none; fill: '+this.color+';"' ;
   var t = str.split('\n');
   anch = anch || 'start';
   x = x.toFixed(2);
   y = y.toFixed(2);
   
   this.svg_pages[this.currentPage] += '<g class="'+clss+'" '+estilo+' transform="translate('+x+' '+y+')">\n';
    if(t.length < 2) {
        var stl = t[0].trim() === "."? 'style="opacity:0;"':'';
        this.svg_pages[this.currentPage] += '<text text-anchor="'+anch+'" x="0" y="0" '+stl+' >'+t[0]+'</text>\n';
    } else {
       this.svg_pages[this.currentPage] += '<text text-anchor="'+anch+'" x="0" y="0">\n';
       for(var i = 0; i < t.length; i++ ){
           var stl = t[i].trim() === "."? 'style="opacity:0;"':'';
           this.svg_pages[this.currentPage] += '<tspan x="0" dy="1.2em" '+stl+' >'+(t[i].length===0 ? '&nbsp;' : t[i])+'</tspan>\n';
       }
       this.svg_pages[this.currentPage] += '</text>\n';
    }
    this.svg_pages[this.currentPage] += '</g>\n';
};

SVG.Printer.prototype.printButton = function (id, x, y, options) {
    
    var scale = options.radius/26; // 26 é o raio inicial do botão
    var gid = 'p'+this.printerId+id;
    var estilo = 'stroke:'+options.borderColor+'; stroke-width:'+options.borderWidth+'px; fill: none;';
    var estiloMini = 'stroke:'+options.borderColor+'; stroke-width:'+options.borderWidth+'px; fill: black;';

    var linha = '<path style="'+estilo+'" d="m 2 34 l 52 -12" ></path>\n';
    var circPautaNum  = '';
    
    if(options.pautaNumerica ) {
        if( options.pautaNumericaMini) {
            circPautaNum  = '<circle style="'+estiloMini+'" cx="46" cy="46" r="10"></circle>\n'
        } else {
            linha = ''
        }
    }

    var pathString = ABCXJS.write.sprintf( '<g id="%s" transform="translate(%.1f %.1f) scale(%.5f)">\n\
        <circle cx="28" cy="28" r="26" style="stroke:none; fill: %s;" ></circle>\n\
        <path id="%s_ac" style="stroke: none; fill: %s;" d="M 2 34 a26 26 0 0 1 52 -12"></path>\n\
        <path id="%s_ao" style="stroke: none; fill: %s;" d="M 54 22 a26 26 0 0 1 -52 12"></path>\n\
        <circle style="'+estilo+'" cx="28" cy="28" r="26"></circle>\n\
        '+linha+'\
        <text id="%s_tc" class="%s" style="stroke:none; fill: black;" x="27" y="22" ></text>\n\
        <text id="%s_to" class="%s" style="stroke:none; fill: black;" x="27" y="44" ></text>\n\
        <text id="%s_tn" class="%s" style="stroke:none; fill: black;" x="28" y="36" ></text>\n\
        '+circPautaNum+'\
        <text id="%s_tm" class="%s" style="stroke:none; fill: white;" x="46" y="50" ></text>\n\
        </g>\n',
        gid, x, y, scale, options.fillColor, gid, options.closeColor, gid, options.openColor, gid, options.kls, gid, options.kls, gid, options.klsN, gid, options.klsNMini );
        
    this.svg_pages[this.currentPage] += pathString;
    return gid;

};

