/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, slideId: 0, oneTimeCloseFunction : null, lastOpen: null };
        
DRAGGABLE.ui.Slider = function (topDiv, opts ) {

    var self = this;

    self.color = opts.color || 'white';
    self.bgcolor = opts.bgcolor || 'black';
    self.opacity = opts.opacity || '30%'
    self.speed = opts.speed || 100;
    self.step = opts.step || 5;
    self.size = opts.size || { w: 150, h:23, tw: 42 }
    self.callback = opts.callback;
    self.type = opts.type || 'perc';

    this.id = ++ DRAGGABLE.ui.slideId;
    this.container = ( typeof topDiv === 'object' ) ? topDiv : document.getElementById(topDiv);

    this.container.className = "slide-container";
    this.container.id = "slider" + this.id;

    this.tracker = document.createElement('div');
    this.tracker.className = "slide-tracker";
    this.tracker.id = "tracker" + this.id;
    this.tracker.style.background = self.bgcolor;
    this.tracker.style.opacity = self.opacity;
    this.container.appendChild(this.tracker);

    this.thumb = document.createElement('div');
    this.thumb.className = "slide-thumb";
    this.thumb.id = "thumb" + this.id;
    this.container.appendChild(this.thumb);
    
    this.thumb.span = document.createElement('span');
    this.thumb.span.style.color  =  self.color;
    this.thumb.span.style.background  =  self.bgcolor;
    this.thumb.span.style.width  = + self.size.tw + 'px';
    this.thumb.span.style.height  = (self.size.h + 1) +  'px';
    this.thumb.span.style.lineHeight  = (self.size.h + 1) +  'px';
    this.thumb.span.style.marginTop  = '-1px';
    this.thumb.span.style.paddingTop  = '1px';
    this.thumb.span.innerHTML  = (opts.start + '%') || 100;
    this.thumb.appendChild(this.thumb.span);

    this.slider = document.createElement('input');
    this.slider.type="range";
    this.slider.min = opts.min || 0;
    this.slider.max = opts.max || 100;
    this.slider.value = opts.start || 100;
    this.slider.step = opts.step || 1;
    this.container.appendChild(this.slider);
    
    this.container.style.height= self.size.h +"px"
    this.container.style.width=self.size.w +"px"

    this.slider.oninput = function(e) {
        self.updateScreen(true);
        e.stopPropagation();
        e.preventDefault();
    };

	this.setValue = function(val) {
        this.slider.value = val;
        this.updateScreen(false);
    }

	this.updateScreen = function(call) {
        const
            pct = Number( (this.slider.value - this.slider.min) / (this.slider.max - this.slider.min) ),
            newPosition = 100 * (pct - 0.5),
            newDelta =  self.size.tw * (0.5 - pct);

        this.setDisplay(this.slider.value);

        this.thumb.style.left = 'calc('+newPosition+'% + '+newDelta+'px)';

        (call) && (self.callback) && self.callback(this.slider.value);
    };

	this.setDisplay = function(val) {
        switch( this.type ) {
            case 'perc':
                this.thumb.span.innerHTML = val+'%';
                break;
            case 'bin':
                this.thumb.span.innerHTML = val>0?'on':'off';
                this.thumb.style.filter = (val>0?'none': "grayscale(1)");
                this.tracker.style.filter = (val>0?'none': "grayscale(100%)");
                break;
            default:
                this.thumb.span.innerHTML = val;
                break;
        }
    };

    self.updateScreen(false);
};

DRAGGABLE.ui.Slider.prototype.enable = function( ) {
    this.container.style.pointerEvents = 'all';
    this.container.style.backgroundColor = 'transparent';
    this.container.style.opacity = '1';
};

DRAGGABLE.ui.Slider.prototype.disable = function( ) {
   this.container.style.pointerEvents = 'none';
   this.container.style.backgroundColor = 'gray';
   this.container.style.opacity = '0.3';
};

DRAGGABLE.ui.Slider.prototype.getValue = function( ) {
   return this.slider.value;
};

DRAGGABLE.ui.Slider.prototype.getBoolValue = function( ) {
    return (this.slider.value != 0);
 };
 