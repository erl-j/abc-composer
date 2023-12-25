import { useEffect, useRef, useState } from 'react'
import Progress from './components/Progress';
import Editor from './Editor';
import Range from './Range';

function App() {

  // Model loading
  const [ready, setReady] = useState(null);
  const [progressItems, setProgressItems] = useState([]);

  // Inputs and outputs
  const [input, setInput] = useState('');
  const [abc, setAbc] = useState('');
  const [disabled, setDisabled] = useState(false);

  const [generationParams, setGenerationParams] = useState({ temperature: 1.0, top_k: 50, top_p: 1.0 })



  const worker = useRef(null);


  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          // Model file start load: add a new progress item to the list.
          setReady(false);
          setProgressItems(prev => [...prev, e.data]);
          break;

        case 'progress':
          // Model file progress: update one of the progress items.
          setProgressItems(
            prev => prev.map(item => {
              if (item.file === e.data.file) {
                return { ...item, progress: e.data.progress }
              }
              return item;
            })
          );
          break;

        case 'done':
          // Model file loaded: remove the progress item from the list.
          setProgressItems(
            prev => prev.filter(item => item.file !== e.data.file)
          );
          break;

        case 'ready':
          // Pipeline ready: the worker is ready to accept messages.
          setReady(true);
          break;

        case 'update':
          // Generation update: update the output text.
          const abcSplit = e.data.output.split("@")[1];
          setAbc(abcSplit);
          break;

        case 'complete':
          // Generation complete: re-enable the "Translate" button
          setDisabled(false);
          break;
      }
    };
    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);
    // Define a cleanup function for when the component is unmounted.
    return () => worker.current.removeEventListener('message', onMessageReceived);
  });

  const generate = () => {
    setDisabled(true);
    worker.current.postMessage({
      text: input + "@",
      generationParams
    });
  }


  // everything after @ is abc
  // everything before @ is text

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection:"column" }}>
      {/* <h1>abc composer</h1> */}
      <div style={{ display: "flex", flexDirection: "row", justifyContent:"space-evenly" }}>
        <div>
        <textarea value={input} onChange={e => setInput(e.target.value)} style={{ width: "100%", height:"100%" }} />
        <button disabled={disabled} onClick={generate}>Generate</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid black", padding: "10px" }}>
          <Range min={0} max={2} step={0.01} defaultValue={1} label="Temperature" description="" value={generationParams.temperature} onChange={value => setGenerationParams(oldGenerationParams => ({ ...oldGenerationParams, temperature: value }))} />
          <Range min={0} max={1} step={0.01} defaultValue={1} label="Top P" description="" value={generationParams.top_p} onChange={value => setGenerationParams(oldGenerationParams => ({ ...oldGenerationParams, top_p: value }))} />
          <Range min={1} max={100} step={1} defaultValue={50} label="Top K" description="" value={generationParams.top_k} onChange={value => setGenerationParams(oldGenerationParams => ({ ...oldGenerationParams, top_k: value }))} />
        </div>

      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

        {ready && <Editor abc={abc} setAbc={setAbc} />}
        {ready === false && (
          <label>Loading models... (only run once)</label>
        )}
        {progressItems.map(data => (
          <div key={data.file}>
            <Progress text={data.file} percentage={data.progress} />
          </div>
        ))}
        {/* <img src="logo.png" alt="logo" style={{ width: "200px", height: "200px" }} /> */}
      </div>
    </div>
  )
}

export default App