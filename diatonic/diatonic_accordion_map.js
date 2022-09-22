/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.AccordionMap = function (res, local, opts) {
    this.id = res.id;
    this.menuOrder = res.menuOrder;
    this.model = res.model;
    this.tuning = res.tuning;
    this.buttons = res.buttons;
    this.image = res.image || 'images/accordions/accordion.default.gif';
    this.keyboard = new DIATONIC.map.Keyboard( res.keyboard, res.pedal, opts );
    this.songPathList = res.songPathList;
    this.practicePathList = res.practicePathList;
    this.chordPathList = res.chordPathList;
    this.localResource = local || false;
    this.songs = { items:{}, sortedIndex: [] };
    this.practices = { items:{}, sortedIndex: [] };
    this.chords = { items:{}, sortedIndex: [] };

    if( ! this.localResource ) {
        this.songs = this.loadABCX( this.songPathList );
        this.chords = this.loadABCX( this.chordPathList );
        this.practices = this.loadABCX( this.practicePathList );
    }
};

DIATONIC.map.AccordionMap.prototype.getId = function () {
    return this.id;
};

DIATONIC.map.AccordionMap.prototype.getFullName = function () {
    return this.getTxtModel() + " " + this.getTxtTuning() + " - " + this.getTxtNumButtons();
};

DIATONIC.map.AccordionMap.prototype.getTxtModel = function () {
    return this.model;
};

DIATONIC.map.AccordionMap.prototype.getTxtNumButtons = function() {
    var a = this.buttons;
    var str_label = '';
    for (var c = a.length-1; c > 0 ; c--) {
      str_label = '/' + a[c] + str_label;
    }
    return a[0] + str_label;
};

DIATONIC.map.AccordionMap.prototype.getTxtTuning = function() {
    var a = this.tuning;
    var str_label = '';
    for (var c = a.length-1; c > 0 ; c--) {
      str_label = '/' +  a[c] + str_label;
    }
    return  a[0] + str_label;
};

DIATONIC.map.AccordionMap.prototype.getPathToImage = function () {
    return this.image;
};

DIATONIC.map.AccordionMap.prototype.getAbcText = function (type, title) {
    return this[type].items[title];
};

DIATONIC.map.AccordionMap.prototype.setSong = function (name, content, addSort) {
    this.songs.items[name] = content;
    if( addSort ) this.songs.sortedIndex.push( name );
};

DIATONIC.map.AccordionMap.prototype.getFirstSong = function () {
    var ret = this.songs.sortedIndex[0] || "";
    return ret;
};

DIATONIC.map.AccordionMap.prototype.getFirstPractice = function () {
    var ret = this.practices.sortedIndex[0] || "";
    return ret;
};

DIATONIC.map.AccordionMap.prototype.getFirstChord = function () {
    var ret = this.chords.sortedIndex[0] || "";
    return ret;
};


//DIATONIC.map.AccordionMap.prototype.getChord = function (name) {
//
//DIATONIC.map.AccordionMap.prototype.getChord = function (name) {
//    return this.chords.items[name];
//};
//DIATONIC.map.AccordionMap.prototype.setChord = function (name,content, addSort) {
//    this.chords.items[name] = content;
//    if(addSort) this.chords.sortedIndex.push( name );
//};
//
//DIATONIC.map.AccordionMap.prototype.getSong = function (name) {
//    return this.songs.items[name];
//};
//DIATONIC.map.AccordionMap.prototype.getPractice = function (name) {
//    return this.practices.items[name];
//};
//DIATONIC.map.AccordionMap.prototype.setPractice = function (name,content, addSort) {
//    this.practices.items[name] = content;
//    if(addSort) this.practices.sortedIndex.push( name );
//};

DIATONIC.map.AccordionMap.prototype.loadABCX = function(pathList, cb ) {
    var toLoad = 0;
    var path;
    var objRet = { items:{}, ids: {}, details:{}, sortedIndex: [] };
    for (var s = 0; s < pathList.length; s++) {
        toLoad ++;
        FILEMANAGER.register('ABCX');
        path = pathList[s];
        $.get( path )
            .done( function( data ) {
                FILEMANAGER.deregister('ABCX', true);
                var tunebook = new ABCXJS.TuneBook(data);
                for (var t = 0; t < tunebook.tunes.length; t ++)  {
                    var tune = tunebook.tunes[t];
                    var id = tune.id;
                    var hidden = false;
                    if( id.toLowerCase().charAt(0) === 'h' ) {
                        id = id.substr(1);
                        hidden = true;
                    }
                    
                    objRet.ids[id] = tune.title;
                    objRet.items[tune.title] = tune.abc;
                    objRet.details[tune.title] = { composer: tune.composer, id: id, hidden: hidden  };
                    objRet.sortedIndex.push( tune.title );
                }    
            })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('ABCX', false);
                var err = textStatus + ", " + error;
                if( data && data.responseText !== undefined )
                    waterbug.log( "ABCX Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + err );
                else
                    waterbug.log( "ABCX Load Failed:\nLoading: " + path + "...\nError:\n " + err );
            })
            .always(function() {
                toLoad --;
                if(toLoad === 0 ) { 
                   objRet.sortedIndex.sort();
                   if(cb) cb(); // call back in the last pass
                }
            });
    }
    return objRet;
};
