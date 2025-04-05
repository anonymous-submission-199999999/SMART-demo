import { useEffect, useRef, useState } from 'react'
import Progress from './components/Progress';
import Editor from './Editor';
import Range from './Range';
import { remiToMidi } from './remiToMidi';
import "html-midi-player";

function App() {

  // Model loading
  const [ready, setReady] = useState(null);
  const [progressItems, setProgressItems] = useState([]);

  const visualizerRef = useRef(null);

  useEffect(() => {
    if (visualizerRef.current) {
      visualizerRef.current.config = {
        noteHeight: 4,
        pixelsPerTimeStep: 60,
        minPitch: 30
      };
    }
  }
  , [visualizerRef]);



  // Inputs and outputs
  const [input, setInput] = useState('BOS_None');
  const [output, setOutput] = useState('');
  const [disabled, setDisabled] = useState(false);

  const [midiUrl, setMidiUrl] = useState(null);

  const [generationParams, setGenerationParams] = useState({ temperature: 1.0, top_k: 50, top_p: 0.99, max_length: 100 })

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
            setOutput(e.data.output);
          break;

        case 'complete':
          // Generation complete: re-enable the "Translate" button
          setOutput(e.data.output);
          setDisabled(false);
          let midi = remiToMidi(e.data.output);
          const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
          const url = URL.createObjectURL(blob);
          setMidiUrl(url);
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
      text: input,
      generationParams
    });
  }



  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", height:"100%", margin:64}}>
        {/* generation settings */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly" }}>
          <textarea style={{ flexGrow: 4 }} value={input} onChange={e => setInput(e.target.value)} />
          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid black", }}>
            <Range min={1} max={500} step={1} defaultValue={100} label="Max length" description="" value={generationParams.max_length} onChange={value => setGenerationParams(oldGenerationParams => ({ ...oldGenerationParams, max_length: value }))} />
            <Range min={0} max={2} step={0.01} defaultValue={1} label="Temperature" description="" value={generationParams.temperature} onChange={value => setGenerationParams(oldGenerationParams => ({ ...oldGenerationParams, temperature: value }))} />
            <Range min={0} max={1} step={0.01} defaultValue={1} label="Top P" description="" value={generationParams.top_p} onChange={value => setGenerationParams(oldGenerationParams => ({ ...oldGenerationParams, top_p: value }))} />
            <Range min={1} max={100} step={1} defaultValue={50} label="Top K" description="" value={generationParams.top_k} onChange={value => setGenerationParams(oldGenerationParams => ({ ...oldGenerationParams, top_k: value }))} />
          </div>
        </div>
        <button style={{height:64}} disabled={disabled} onClick={generate}>Generate{!ready && " (downloads 89mb model first time)"}</button>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          {progressItems.length > 0 &&
            (<div>
              <label>Loading models... (only run once)</label>
              {progressItems.map(data => (
                <div key={data.file}>
                  <Progress text={data.file} percentage={data.progress} />
                </div>
              ))}
            </div>
            )}
          {ready && output}
          
          {midiUrl && <a href={midiUrl} download="output.mid">Download MIDI</a>}
        </div>
        {midiUrl && 
        <div style={{ height: 300, width: 600, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <midi-player visualizer="#myVisualizer" src={midiUrl} sound-font="https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus" />
          <midi-visualizer type="piano-roll" id="myVisualizer" src={midiUrl} ref={visualizerRef}></midi-visualizer>
        </div>
        }
      </div>
    </div>
  )
}

export default App