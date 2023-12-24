import { useEffect, useRef, useState } from 'react'
import Progress from './components/Progress';
import Editor from './Editor';

function App() {

  // Model loading
  const [ready, setReady] = useState(null);
  const [progressItems, setProgressItems] = useState([]);

  // Inputs and outputs
  const [input, setInput] = useState('');
  const [abc, setAbc] = useState('');
  const [disabled, setDisabled] = useState(false);



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
          console.log(e)
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
    });
  }

  console.log(abc);

  // everything after @ is abc
  // everything before @ is text

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} style={{ width: "100%" }}/>
        {ready && <Editor abc={abc} setAbc={setAbc} />}
        <button disabled={disabled} onClick={generate}>Generate</button>
        {ready === false && (
          <label>Loading models... (only run once)</label>
        )}
        {progressItems.map(data => (
          <div key={data.file}>
            <Progress text={data.file} percentage={data.progress} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App