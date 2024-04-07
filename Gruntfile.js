module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig( {
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            bin: {
                src: 'bin'
            }
        },        
        concat: {
            options: {
                separator: '\n'
            },
            styles4abcx: {
                src: [
                    'css/perfect-scrollbar.css', 'css/help.css', 'css/menu-group.css', 
                    'css/dropdown-menu.css', 'css/tabbed-view.css', 'css/draggable.css', 'css/slider.css'
                ],
                dest: 'tmp/styles4abcx.css'
            },
            styles4help: {
                src: ['css/perfect-scrollbar.css', 'css/help.css'],
                dest: 'tmp/styles4help.css'
            },
            ace: {
                src: ['ace/src/ace.js', 'ace/src/mode-abcx.js', 'ace/src/theme-abcx.js'],
                dest: 'tmp/ace4abcx.js'
            },
            diatonic: {
                src: [
                    'diatonic/diatonic_common.js', 'diatonic/diatonic_accordion_map.js',
                    'diatonic/diatonic_keyboard.js', 'diatonic/diatonic_button.js'
                ],
                dest: 'tmp/diatonic.js'
            },
            tuneAPI: {
                src: [
                    'api/abc_tunebook.js', 'data/abc_tune.js'
                ],
                dest: 'tmp/tune.api.js'
            },
            parse: {
                src: [
                    'parse/abc_common.js', 'parse/abc_parse.js', 'parse/abc_parse_directive.js',
                    'parse/abc_parse_header.js', 'parse/abc_parse_key_voice.js', 'parse/abc_tokenizer.js',
                    'parse/abc_transposer.js', 'parse/abc_rebalance.js'
                ],
                dest: 'tmp/parse.js'
            },
            write: {
                src: [
                    'write/abc_glyphs.js', 'write/abc_graphelements.js',
                    'write/abc_layout.js', 'write/abc_write.js', 'write/sprintf.js'
                ],
                dest: 'tmp/write.js'
            },
            svg: {
                src: [
                    'svg/svg.js', 'svg/glyphs.js'
                ],
                dest: 'tmp/svg.js'
            },
            edit: {
                src: [
                    'edit/abc_selectors.js', 'edit/abc_editarea.js'
                ],
                dest: 'tmp/edit.js'
            },
            midi: {
                src: [
                    'midi/midi_common.js', 'midi/midi_parser.js', 'midi/midi_player.js'
                ],
                dest: 'tmp/midi.js'
            },
            windowsAPI: {
                src: [
                    'scroll/perfect-scrollbar.js', 'draggable/draggable.js', 'draggable/dropdown.js',
                    'draggable/dialogs.js', 'draggable/slider.js'
                ],
                dest: 'tmp/windows.js'
            },
            tablature: {
                src: [
                    'tablature/tablature_accordion.js', 'tablature/tablature_accordion_parse.js',
                    'tablature/tablature_accordion_infer.js', 'tablature/tablature_accordion_layout.js'
                ],
                dest: 'tmp/tablature.js'
            },
            help: {
                src: [
                    'scroll/perfect-scrollbar.js', 'help/help.js'
                ],
                dest: 'tmp/abcx-help.js'
            },
            abcxjs: {
                src: [
                    'tmp/tune.api.js', 'tmp/parse.js', 'tmp/write.js', 'tmp/svg.js', 'tmp/edit.js', 
                    'tmp/midi.js', 'tmp/windows.js', 'tmp/tablature.js'
                ],
                dest: 'tmp/abcxjs.js'
            }   
        },
        cssmin: {
            minify: {
                files:[
                    {src: 'tmp/styles4abcx.css', dest: 'bin/styles4abcx_<%= pkg.version %>-min.css'},
                    {src: 'tmp/styles4help.css', dest: 'bin/styles4help.min.css'},
                ]
            }
        },
        uglify: {
            static_js: {
                files: [
                    {src: 'file/filemanager.js', dest: 'bin/filemanager_<%= pkg.version %>-min.js'},
                    {src: 'tmp/abcxjs.js', dest: 'bin/abcxjs_<%= pkg.version %>-min.js'},
                    {src: 'tmp/ace4abcx.js', dest: 'bin/ace4abcx_<%= pkg.version %>-min.js'},
                    {src: 'tmp/diatonic.js', dest: 'bin/diatonic_<%= pkg.version %>-min.js'},
                    {src: 'tmp/abcx-help.js', dest: 'bin/abcx-help.min.js'},
                    {src: 'jslib/html5kellycolorpicker.js', dest: 'jslib/html5kellycolorpicker.min.js'},
                ]
            }
        },
        copy: {
            public: {
                files: [
                    {expand: true, cwd: 'tmp/', src: 'abcxjs.js', dest: '../diatonic-map/abcxjs/' },
                    {expand: true, cwd: 'tmp/', src: 'abcx-help.js', dest: 'jslib/' },
                    {expand: true, cwd: 'tmp/', src: 'ace4abcx.js', dest: '../diatonic-map/ace4abcx/' },
                    {expand: true, cwd: 'tmp/', src: 'diatonic.js', dest: '../diatonic-map/diatonic/' },
                    {expand: true, cwd: 'tmp/', src: 'styles4abcx.css', dest: '../diatonic-map/css/' },
                    {expand: true, cwd: 'tmp/', src: 'styles4help.css', dest: '../diatonic-map/css/' },
                    {src: 'file/filemanager.js', dest: '../diatonic-map/' },
                ]
            },
            jslib: {
                expand: true,
                cwd: 'jslib',
                src: '**',
                dest: '../diatonic-map/jslib'
            },
            fonts: {
                expand: true,
                cwd: 'fontsIco',
                src: 'abcx.*',
                dest: '../diatonic-map/fontsIco'
            },
            mini: {
                files: [
                    {expand: true, cwd: 'bin/', src: 'abcxjs_<%= pkg.version %>-min.js', dest: '../diatonic-map/abcxjs' },
                    {expand: true, cwd: 'bin/', src: 'ace4abcx_<%= pkg.version %>-min.js', dest: '../diatonic-map/ace4abcx/' },
                    {expand: true, cwd: 'bin/', src: 'diatonic_<%= pkg.version %>-min.js', dest: '../diatonic-map/diatonic/' },
                    {expand: true, cwd: 'bin/', src: 'filemanager_<%= pkg.version %>-min.js', dest: '../diatonic-map/file/' },
                    {expand: true, cwd: 'bin/', src: 'styles4abcx<%= pkg.version %>-min.css', dest: '../diatonic-map/css/' },
                    {expand: true, cwd: 'bin/', src: 'styles4help.min.css', dest: '../diatonic-map/css/' },
                    {expand: true, cwd: 'bin/', src: 'abcx-help.min.js', dest: 'jslib/' },
                ]
            },
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy'); 
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Register tasks
    grunt.registerTask('default', ['clean','concat', 'cssmin', 'uglify', 'copy']);

};

