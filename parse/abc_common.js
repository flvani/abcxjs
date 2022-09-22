//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
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

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.math = {};
    
window.ABCXJS.math.isNumber = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};    

if (!window.ABCXJS.parse)
	window.ABCXJS.misc = {};
    
window.ABCXJS.misc.isOpera = function() { // Opera 8.0+
    return ( (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0 );
};

window.ABCXJS.misc.isChrome= function() {
    return (!!window.chrome && !!window.chrome.webstore);
};

window.ABCXJS.misc.isChromium= function() { // Chrome 1+
    var test1 =  (( !!window.chrome && !ABCXJS.misc.isOpera() ) > 0 ); 
   
    if(!test1) return false;
    
    for (var i=0; i<navigator.plugins.length; i++)
        if (navigator.plugins[i].name === 'Chrome PDF Viewer') return false;
    
    return true;
};

window.ABCXJS.misc.isFirefox = function() { // Firefox 1+ 
    return ( typeof InstallTrigger !== 'undefined' );  
};

window.ABCXJS.misc.isSafari = function() { // Safari 3.0+
    return ( /constructor/i.test(window.HTMLElement) || (function (p) { 
        return p.toString() === "[object SafariRemoteNotification]"; } )
            (!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)) 
    ); 
};

window.ABCXJS.misc.isIE = function() {
    
    if( /* @ cc_on ! @ */ false || !! document.documentMode ) { // Internet Explorer 6-11
      return true; 
    }

    if( navigator.appName.indexOf("Internet Explorer")!==-1 ){ // Yeah, he's using IE
       return true;
    }
    return false;
};    

window.ABCXJS.misc.isEdge = function() {
    return (!ABCXJS.misc.isIE() && !!window.StyleMedia); // Edge 20+
};


if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};

// implemented below a more secure form o copy
window.ABCXJS.parse.clone = function(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null === obj || "object" !== typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = window.ABCXJS.parse.clone(obj[i]);
        }
        return copy;
    }
    
    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = window.ABCXJS.parse.clone(obj[attr]);
        }
        return copy;
    }
    
    throw new Error("Unable to copy obj! Its type isn't supported.");
};


window.ABCXJS.parse.getBarLine = function(line, i) {
    var ii = i;
    var dd = 2; // conta repeticoes ao acrescentar múltiplos ":" à esquerda da barra
    switch (line.charAt(i)) {
        case ']':
            ++i;
            switch (line.charAt(i)) {
                case '|': return {len: 2, token: "bar_thick_thin"};
                case '[':
                    ++i;
                    if ((line.charAt(i) >= '1' && line.charAt(i) <= '9') || line.charAt(i) === '"')
                        return {len: 2, token: "bar_invisible"};
                    return {len: 1, warn: "Unknown bar symbol"};
                default:
                    return {len: 1, token: "bar_invisible"};
            }
            break;
        case ':':
            ++i;
            while(line.charAt(i)===':') {++i; dd++;}
            switch (line.charAt(i)) {
                case '|':	// :|
                    ++i;
                    switch (line.charAt(i)) {
                        case ']':	// :|]
                            ++i;
                            switch (line.charAt(i)) {
                                case '|':	// :|]|
                                    ++i;
                                    if (line.charAt(i) === ':') {
                                        while(line.charAt(i)===':') {++i;}
                                        return {len: i-ii, token: "bar_dbl_repeat", repeat: dd};
                                    }
                                    return {len: i-ii, token: "bar_right_repeat", repeat: dd};
                                default:
                                    return {len: i-ii, token: "bar_right_repeat", repeat: dd};
                            }
                            break;
                        case ':':	// :|:
                            while(line.charAt(i)===':') {++i;}
                            return {len: i-ii, token: "bar_dbl_repeat", repeat: dd };
                        case '|':	// :||
                            ++i;
                            if (line.charAt(i) === ':') { //:||:
                                while(line.charAt(i)===':') {++i;}
                                return {len: i-ii, token: "bar_dbl_repeat", repeat: dd};
                            }
                            return {len: i-ii, token: "bar_right_repeat", repeat: dd};
                        default:
                            return {len: i-ii, token: "bar_right_repeat", repeat: dd };
                    }
                    break;
                default:
                    return {len: i-ii, token: "bar_dbl_repeat"};
            }
            break;
        case '[':	// [
            ++i;
            if (line.charAt(i) === '|') {	// [|
                ++i;
                switch (line.charAt(i)) {
                    case ':': // [|:
                       while(line.charAt(i)===':') {++i;}
                       return {len: i-ii, token: "bar_left_repeat"};
                    case ']': return {len: 3, token: "bar_invisible"};
                    default: return {len: 2, token: "bar_thick_thin"};
                }
            } else {
                if ((line.charAt(i) >= '1' && line.charAt(i) <= '9') || line.charAt(i) === '"')
                    return {len: 1, token: "bar_invisible"};
                return {len: 0};
            }
            break;
        case '|':	// |
            ++i;
            switch (line.charAt(i)) {
                case ']': return {len: 2, token: "bar_thin_thick"};
                case '|': // ||
                    ++i;
                    if (line.charAt(i) === ':') { // ||:
                        while(line.charAt(i)===':') {++i;}
                        return {len: i-ii, token: "bar_left_repeat"};
                    }
                    return {len: 2, token: "bar_thin_thin"};
                case ':':	// |:
                    while(line.charAt(i)===':') {++i;}
                    return { len: i-ii, token: "bar_left_repeat"};
                default: return {len: 1, token: "bar_thin"};
            }
            break;
    }
    return {len: 0};
};


window.ABCXJS.parse.normalizeAcc = function ( cKey ) {
    return cKey.replace(/([ABCDEFG])#/g,'$1♯').replace(/([ABCDEFG])b/g,'$1♭');
};

window.ABCXJS.parse.denormalizeAcc = function ( cKey ) {
    return cKey.replace(/([ABCDEFG])♯/g,'$1#').replace(/([ABCDEFG])♭/g,'$1b');
};


window.ABCXJS.parse.gsub = function(source, pattern, replacement) {
	return source.split(pattern).join(replacement);
};

window.ABCXJS.parse.strip = function(str) {
	return str.replace(/^\s+/, '').replace(/\s+$/, '');
};

window.ABCXJS.parse.startsWith = function(str, pattern) {
	return str.indexOf(pattern) === 0;
};

window.ABCXJS.parse.endsWith = function(str, pattern) {
	var d = str.length - pattern.length;
	return d >= 0 && str.lastIndexOf(pattern) === d;
};

window.ABCXJS.parse.each = function(arr, iterator, context) {
	for (var i = 0, length = arr.length; i < length; i++)
	  iterator.apply(context, [arr[i],i]);
};

window.ABCXJS.parse.last = function(arr) {
	if (arr.length === 0)
		return null;
	return arr[arr.length-1];
};

window.ABCXJS.parse.compact = function(arr) {
	var output = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i])
			output.push(arr[i]);
	}
	return output;
};

window.ABCXJS.parse.detect = function(arr, iterator) {
	for (var i = 0; i < arr.length; i++) {
		if (iterator(arr[i]))
			return true;
	}
	return false;
};

window.ABCXJS.parse.pitches = 
    { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6, 
        c: 7, d: 8, e: 9, f: 10, g: 11, a: 12, b: 13 };

window.ABCXJS.parse.key2br = 
    {"C":"Dó", "C♯":"Dó♯", "D♭":"Ré♭", "D":"Ré", "D♯":"Ré♯", "E♭":"Mi♭", "E":"Mi", 
     "F":"Fá" ,"F♯":"Fá♯" ,"G♭":"Sol♭", "G":"Sol", "G♯":"Sol♯" ,"A♭":"Lá♭", "A":"Lá", "A♯":"Lá♯", "B♭":"Si♭", "B":"Si" };

window.ABCXJS.parse.key2number = 
    {"C":0, "C♯":1, "D♭":1, "D":2, "D♯":3, "E♭":3, "E":4, 
     "F":5 ,"F♯":6 ,"G♭":6, "G":7, "G♯":8 ,"A♭":8, "A":9, "A♯":10, "B♭":10, "B":11 };

window.ABCXJS.parse.number2keyflat  = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
window.ABCXJS.parse.number2keysharp = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
window.ABCXJS.parse.number2key      = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];

/*
window.ABCXJS.parse.number2keyflat_br  = ["Dó", "Ré♭", "Ré", "Mi♭", "Mi", "Fá", "Sol♭", "Sol", "Lá♭",  "Lá", "Si♭", "Si"];
window.ABCXJS.parse.number2keysharp_br = ["Dó", "Dó♯", "Ré", "Ré♯", "Mi", "Fá", "Fá♯",  "Sol", "Sol♯", "Lá", "Lá♯", "Si"];
window.ABCXJS.parse.number2key_br      = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯",  "Sol", "Sol♯", "Lá", "Si♭", "Si"];
*/

window.ABCXJS.parse.number2staff   = 
    [    
         {note:"C", acc:""}
        ,{note:"D", acc:"flat"} 
        ,{note:"D", acc:""}
        ,{note:"E", acc:"flat"} 
        ,{note:"E", acc:""} 
        ,{note:"F", acc:""}
        ,{note:"G", acc:"flat"} 
        ,{note:"G", acc:""} 
        ,{note:"A", acc:"flat"} 
        ,{note:"A", acc:""} 
        ,{note:"B", acc:"flat"} 
        ,{note:"B", acc:""}
    ];

window.ABCXJS.parse.number2staffSharp   = 
    [    
        {note:"C", acc:""}
       ,{note:"C", acc:"sharp"}
       ,{note:"D", acc:""} 
       ,{note:"D", acc:"sharp"}
       ,{note:"E", acc:""} 
       ,{note:"F", acc:""} 
       ,{note:"F", acc:"sharp"}
       ,{note:"G", acc:""} 
       ,{note:"G", acc:"sharp"} 
       ,{note:"A", acc:""} 
       ,{note:"A", acc:"sharp"} 
       ,{note:"B", acc:""} 
    ];

window.ABCXJS.parse.stringify = function(objeto) {

    var cache = [];
    var ret = JSON.stringify(objeto, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    return ret;
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
