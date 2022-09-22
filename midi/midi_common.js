if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

window.ABCXJS.midi.keyToNote = {}; // C8  == 108
window.ABCXJS.midi.minNote = 0x15; //  A0 = first note
window.ABCXJS.midi.maxNote = 0x6C; //  C8 = last note

// popular array keyToNote com o valor midi de cada nota nomeada
for (var n = window.ABCXJS.midi.minNote; n <= window.ABCXJS.midi.maxNote; n++) {
    var octave = (n - 12) / 12 >> 0;
    var name = ABCXJS.parse.number2keysharp[n % 12] + octave;
    ABCXJS.midi.keyToNote[name] = n;
    name = ABCXJS.parse.number2keyflat[n % 12] + octave;
    ABCXJS.midi.keyToNote[name] = n;
}
