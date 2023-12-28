import * as React from "react"
import "./index.css"
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css';


const Range = ({ min, max, value, defaultValue, step, onChange, label, description, displayValue }) => {

    if (displayValue === undefined) {
        displayValue = value
    }
    return (
        <>
            <div id={label}>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", fontSize: 13 }}>
                    <div>{label}</div>
                    <div>{displayValue}</div>
                </div>
                <input className="slider" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(e.target.valueAsNumber)}
                onDoubleClick={() => onChange(defaultValue)} 
                ></input>
            </div>
            {label!="" && <Tooltip place={"right"} anchorId={label} content={description} style={{ zIndex: 10 }} />}
        </>
    )
}

export default Range