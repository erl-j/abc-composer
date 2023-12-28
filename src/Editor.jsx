import React from "react";
import ABCJS, { synth } from "abcjs";
// import css abcjs-audio.css

import "./abc-audio.css";


const Editor = ({ abc, setAbc }) => {

    const abcEditor = React.useRef(null);
    const synthControl = React.useRef(null);


    React.useEffect(() => {
        abcEditor.current = new ABCJS.Editor("abc", {
            canvas_id: "paper",
            warnings_id: "warnings",
            abcjsParams: {}
        });
    }
        , []);

    // pause audio when abc changes


    React.useEffect(() => {

        // if synth control exists, pause it
        if (synthControl.current) {
            synthControl.current.pause() 
        }
        if (ABCJS.synth.supportsAudio()) {
            var controlOptions = {
                displayRestart: true,
                displayPlay: true,
                displayProgress: true,
                displayClock: true
            };
            synthControl.current = new ABCJS.synth.SynthController();
            synthControl.current.load("#audio", null, controlOptions);
            synthControl.current.disable(true);
            var midiBuffer = new ABCJS.synth.CreateSynth();
            var visualObj = ABCJS.renderAbc("paper", abc);
            midiBuffer.init({
                visualObj: visualObj[0],
                options: {

                }

            }).then(function () {
                synthControl.current.setTune(visualObj[0], true).then(function (response) {
                    document.querySelector(".abcjs-inline-audio").classList.remove("disabled");
                }
                )
            });
        } else {
            console.log("audio is not supported on this browser");
        };
    }
        , [abc]);


    const downloadMidi = () => {
        var abc = document.getElementById("abc").value;
        var a = document.getElementById("midi-download");
        var midi = ABCJS.synth.getMidiFile(abc, { midiOutputType: "encoded" })
        a.setAttribute("href", midi)
        a.click();
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", width: "100%" }} >
            <div id="audio" className="abcjs-inline-audio" style={{ width: "20%" }}></div>
            <button onClick={downloadMidi}>Download midi</button>
            <a id="midi-download" download="example.mid"></a>
            </div>

            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", width: "100%" }} >
                <textarea style={{ flexGrow: 3 }} id="abc" spellCheck="false" value={abc} onChange={(e) => setAbc(e.target.value)} />
                <div style={{ flexGrow: 3, display: "flex", flexDirection: "column", alignItems: "center", }}>
                    <div id="paper"></div>
                    <div id="warnings"></div>
                </div>

            </div>
        </div>
    );
}
export default Editor;