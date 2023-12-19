import React from "react";
import ABCJS from "abcjs";

const Editor = ({abc,setAbc}) => {

    const abcEditor = React.useRef(null);

    React.useEffect(() => {
        abcEditor.current= new ABCJS.Editor("abc", {
            canvas_id: "paper",
            warnings_id: "warnings",
            abcjsParams: {}
        });
    }
    , []);

    React.useEffect(() => {
        if (ABCJS.synth.supportsAudio()) {
            var controlOptions = {
                displayRestart: true,
                displayPlay: true,
                displayProgress: true,
                displayClock: true
            };
            var synthControl = new ABCJS.synth.SynthController();
            synthControl.load("#audio", null, controlOptions);
            synthControl.disable(true);
            var midiBuffer = new ABCJS.synth.CreateSynth();
            var visualObj = ABCJS.renderAbc("paper", abc);
            midiBuffer.init({
                visualObj: visualObj[0],
                options: {

                }

            }).then(function () {
                synthControl.setTune(visualObj[0], true).then(function (response) {
                    document.querySelector(".abcjs-inline-audio").classList.remove("disabled");
                })
            });
        } else {
            console.log("audio is not supported on this browser");
        };
    }
        , [abc]);

    return (
        <div>
            <div className="container">
            <textarea id="abc" cols="80" rows="12" spellCheck="false" value={abc} onChange={(e) => setAbc(e.target.value)}>
            </textarea>
            <div id="paper"></div>
            <div id="warnings"></div>
            <div id="audio"></div>
            </div>
        </div>
    );
}
export default Editor;