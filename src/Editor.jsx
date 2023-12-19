import React from "react";
import ABCJS from "abcjs";

const Editor = ({value}) => {

    const abcEditor = React.useRef(null);

    React.useEffect(() => {
        abcEditor.current= new ABCJS.Editor("abc", {
            canvas_id: "paper",
            warnings_id: "warnings",
            abcjsParams: {}
        });
    }
    , []);

    return (
        <div>
            <div className="container">
                <textarea id="abc" cols="80" rows="12" spellCheck="false" value={value}>
                </textarea>
            <div id="paper"></div>
            <div id="warnings"></div>
            </div>
        </div>
    );
}
export default Editor;