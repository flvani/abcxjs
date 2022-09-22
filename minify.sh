#!/bin/sh
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "Call with a version number argument in the form x.yy"
echo $1 | grep -E -q '^[1-9]\.[0-9]+$' || die "Version number argument required (x.yy), $1 provided"
echo "Concatenating all files..."

cat ace/src/ace.js ace/src/mode-abcx.js ace/src/theme-abcx.js > tmp/ace4abcx.js

cat css/perfect-scrollbar.css css/help.css css/menu-group.css css/dropdown-menu.css css/tabbed-view.css css/draggable.css css/slider.css > tmp/styles4abcx.css
cat css/perfect-scrollbar.css css/help.css > tmp/styles4help.css

cat diatonic/diatonic_common.js diatonic/diatonic_accordion_map.js \
        diatonic/diatonic_keyboard.js diatonic/diatonic_button.js > tmp/diatonic.js

cat parse/abc_common.js parse/abc_parse.js parse/abc_parse_directive.js parse/abc_parse_header.js \
        parse/abc_parse_key_voice.js parse/abc_tokenizer.js parse/abc_transposer.js > tmp/parse.js

cat tablature/tablature_accordion.js tablature/tablature_accordion_parse.js \
        tablature/tablature_accordion_infer.js tablature/tablature_accordion_layout.js > tmp/tablature.js

cat write/abc_glyphs.js write/abc_graphelements.js \
        write/abc_layout.js write/abc_write.js write/sprintf.js > tmp/write.js

cat midi/midi_common.js  midi/midi_parser.js  midi/midi_player.js > tmp/midi.js

cat svg/svg.js svg/glyphs.js > tmp/svg.js

cat scroll/perfect-scrollbar.js draggable/draggable.js draggable/dropdown.js draggable/dialogs.js draggable/slider.js > tmp/abcjs-windows.js
cat scroll/perfect-scrollbar.js help/help.js > tmp/abcx-help.js

cat api/abc_tunebook.js data/abc_tune.js tmp/parse.js tmp/write.js tmp/svg.js edit/abc_selectors.js edit/abc_editarea.js > tmp/abcjs-nomidi.js

cat tmp/abcjs-nomidi.js tmp/midi.js tmp/abcjs-windows.js > tmp/abcjs-all.js

cat tmp/abcjs-all.js edit/abc_editor.js > tmp/abcjs-editor.js
cat tmp/abcjs-nomidi.js edit/abc_editor.js > tmp/abcjs-editor-nomidi.js

cat tmp/abcjs-all.js tmp/tablature.js > tmp/abcxjs.js
cat tmp/abcjs-nomidi.js tmp/tablature.js > tmp/abcxjs-nomidi.js


echo "Compressing STYLES4ABCX css ..."
java -jar yuicompressor-2.4.8.jar  --line-break 7000 -o bin/styles4abcx_$1-min.css tmp/styles4abcx.css
java -jar yuicompressor-2.4.8.jar  --line-break 7000 -o bin/styles4help-min.css tmp/styles4help.css

echo "Compressing ACE4ABCX lib ..."
java -jar yuicompressor-2.4.8.jar  --line-break 7000 -o bin/ace4abcx_$1-min.js tmp/ace4abcx.js

echo "Compressing ABCX lib ..."
java -jar yuicompressor-2.4.8.jar --line-break 7000 -o bin/abcxjs_$1-min.js tmp/abcxjs.js

echo "Compressing ABCX help lib ..."
java -jar yuicompressor-2.4.8.jar  --line-break 7000 -o bin/abcx-help-min.js tmp/abcx-help.js

echo "Compressing diatonic-map lib..."
java -jar yuicompressor-2.4.8.jar  --line-break 7000 -o bin/diatonic_$1-min.js tmp/diatonic.js

echo "Compressing file manager lib..."
java -jar yuicompressor-2.4.8.jar  --line-break 7000 -o bin/filemanager_$1-min.js file/filemanager.js

echo "Compressing file kellycollorpicker lib..."
java -jar yuicompressor-2.4.8.jar  --line-break 7000 -o jslib/html5kellycolorpicker.min.js jslib/html5kellycolorpicker.js


cp tmp/abcx-help.js jslib/
cp bin/abcx-help-min.js jslib/

cp fontsIco/abcx.* ../diatonic-map/fontsIco/
cp jslib/* ../diatonic-map/jslib/

cp tmp/abcxjs.js  ../diatonic-map/abcxjs/
cp tmp/ace4abcx.js  ../diatonic-map/ace4abcx/
cp tmp/diatonic.js  ../diatonic-map/diatonic/
cp file/filemanager.js  ../diatonic-map/file/
cp tmp/styles4abcx.css  ../diatonic-map/css/
cp tmp/styles4help.css  ../diatonic-map/css/

cp bin/abcxjs_$1-min.js ../diatonic-map/abcxjs/
cp bin/ace4abcx_$1-min.js ../diatonic-map/ace4abcx/
cp bin/diatonic_$1-min.js ../diatonic-map/diatonic/
cp bin/filemanager_$1-min.js ../diatonic-map/file/
cp bin/styles4abcx_$1-min.css  ../diatonic-map/css/
cp bin/styles4help-min.css  ../diatonic-map/css/

#echo "Removing temporary files..."
#rm tmp/*

