/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.color = {};
DIATONIC.map.color.fill = 'none';
DIATONIC.map.color.background = 'none';
DIATONIC.map.color.open = '#00ff00';
DIATONIC.map.color.close = '#00b2ee';

DIATONIC.map.loadAccordionMaps = function ( files, opts, cb )  {
    
    if( ! DIATONIC.map.accordionMaps )
        DIATONIC.map.accordionMaps = [];
    
    var toLoad = 0;
    for( var f = 0; f <  files.length; f ++ ) {
        toLoad ++;
        FILEMANAGER.register('MAP');

        $.getJSON( files[f], {  format: "json"  })
            .done(function( data ) {
                FILEMANAGER.deregister('MAP', true);
                DIATONIC.map.accordionMaps.push( new DIATONIC.map.AccordionMap(data, false, opts) );
            })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('MAP', false);
                var err = textStatus + ", " + error;
                waterbug.log( "Accordion Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + err );
            })
            .always(function() {
                toLoad --; 
                if( toLoad === 0 ) {
                    DIATONIC.map.sortAccordions();
                    cb && cb();
                }
            });
    }
};

DIATONIC.map.sortAccordions = function () {
    DIATONIC.map.accordionMaps.sort( function(a,b) { 
        return parseInt(a.menuOrder) - parseInt(b.menuOrder);
    });
};
