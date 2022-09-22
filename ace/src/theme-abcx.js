define("ace/theme/abcx",["require","exports","module","ace/lib/dom"], function(require, exports, module) {
"use strict";

exports.isDark = false;
exports.cssText = ".ace-abcx {\
background-color: #FFFFFF;\
color: black;\
}\
.ace-datadiv {\
position: relative;\
display: block;\
overflow: auto;\
top: 0;\
left: 0;\
height:100% !important; \
width:100%;\
}\
.ace-abcx .ace_cursor {\
color: black;\
}\
.ace-abcx .ace_strong {\
font-weight:bold;\
}\
.ace-abcx .ace_italic {\
font-style: italic;\
}\
.ace-abcx .ace_invisible {\
color: #ddd;\
}\
.ace-abcx .ace_marker-layer .ace_step {\
background: rgb(255, 255, 0);\
}\
.ace-abcx .ace_marker-layer .ace_selected-word {\
border: none;\
}\
.ace-abcx .ace_marker-layer .ace_selection {\
background-color: blue;\
opacity:0.15;\
}\
.ace-abcx .ace_gutter-active-line,\
.ace-abcx .ace_active-line {\
background: blue;\
opacity:0.05;\
}\
.ace-abcx .ace_gutter {\
background: #EBEBEB;\
background: #e9edf0;\
border-right: 2px solid rgba(159, 159, 159, 0.3);\
color: rgb(136, 136, 136);\
}\
.ace-abcx .ace_print-margin {\
width: 1px;\
background: #ebebeb;\
}\
.ace-abcx .ace_directive {\
color: #009900;\
}\
.ace-abcx .ace_keyword {\
color: darkblue;\
}\
.ace-abcx .ace_variable {\
color: #05a;\
}\
.ace-abcx .ace_operator {\
color: #FF00FF;\
}\
.ace-abcx .ace_constant {\
color: darkblue;\
}\
.ace-abcx .ace_constant.ace_numeric {\
color: rgb(6, 150, 14);\
}\
.ace-abcx .ace_modifier {\
color: #994400;\
}\
.ace-abcx .ace_string {\
color: #ff0000 \
}\
.ace-abcx .ace_decoration {\
color: #ffaa00 \
}\
.ace-abcx .ace_comment {\
color: #AAAAAA;\
}\
.ace-abcx .ace_attribute {\
color: #708 \
}\
.ace-abcx .ace_lyrics {\
color: #994400;\
}";
    

exports.cssClass = "ace-abcx";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
