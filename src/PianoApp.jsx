import { useEffect, useRef, useState } from 'react'
import Progress from './components/Progress';
import Editor from './Editor';
import Range from './Range';
import { remiToMidi } from './remiToMidi';
import "html-midi-player";
import MIDIPlayer from './MIDIPlayer';
import { Midi } from '@tonejs/midi';

function PianoApp() {
  // Application state
  const [tokenStr, setTokenStr] = useState('BOS_None Bar_None TimeSig_4/4 Position_0 Tempo_120.0');
  const [output, setOutput] = useState('');
  const [ready, setReady] = useState(null);
  const [progressItems, setProgressItems] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [midiUrl, setMidiUrl] = useState(null);
  const [generationParams, setGenerationParams] = useState({
    temperature: 1.0,
    top_p: 0.99,
    max_length: 512
  });

  // Music parameters
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [availableTempos, setAvailableTempos] = useState([]);
  const [timeSignatures, setTimeSignatures] = useState([]);

  // Load tokenizer data
  useEffect(() => {
    const loadTokenizerData = async () => {
      try {
        // Load the tokenizer.json from the specific path shown in the file structure
        const response = await fetch('models/model_tjs_long/tokenizer.json');
        if (!response.ok) {
          throw new Error(`Failed to load tokenizer.json: ${response.status}`);
        }
        const tokenizerData = await response.json();

        // Extract tempo values from tokenizer
        const tempos = Object.keys(tokenizerData.model.vocab)
          .filter(key => key.startsWith('Tempo_'))
          .map(key => {
            const value = parseFloat(key.replace('Tempo_', ''));
            return { token: key, value };
          })
          .sort((a, b) => a.value - b.value);

        // Extract time signature values from tokenizer
        const timeSigs = Object.keys(tokenizerData.model.vocab)
          .filter(key => key.startsWith('TimeSig_'))
          .map(key => {
            const sig = key.replace('TimeSig_', '');
            return { token: key, signature: sig };
          });

        setAvailableTempos(tempos);
        setTimeSignatures(timeSigs.map(ts => ts.signature));

        // Set initial values if available
        if (tempos.length > 0) {
          const closestTempo = tempos.reduce((prev, curr) =>
            Math.abs(curr.value - 120) < Math.abs(prev.value - 120) ? curr : prev
          );
          setTempo(closestTempo.value);
        }
      } catch (error) {
        console.error('Error loading tokenizer data:', error);
      }
    };

    loadTokenizerData();
  }, []);

  // Refs
  const visualizerRef = useRef(null);
  const worker = useRef(null);

  // Styles
  const styles = {
    container: {
      width: "100vw",
      height: "100vh"
    },
    appWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "left",
      height: "100%",
      margin: 64
    },
    inputRow: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginBottom: 16
    },
    textarea: {
      flexGrow: 4,
      padding: 10,
      fontFamily: "monospace",
      fontSize: 14,
      borderRadius: 4,
      border: "1px solid #ccc"
    },
    controlPanel: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      border: "1px solid #ccc",
      borderRadius: 4,
      padding: 10,
      marginLeft: 16
    },
    generateButton: {
      height: 48,
      backgroundColor: disabled ? "#cccccc" : "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: 4,
      padding: "10px 20px",
      fontSize: 16,
      cursor: disabled ? "not-allowed" : "pointer",
      marginBottom: 16
    },
    outputSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start"
    },
    loadingSection: {
      margin: 16
    },
    downloadLink: {
      display: "inline-block",
      padding: "8px 16px",
      backgroundColor: "#2196F3",
      color: "white",
      textDecoration: "none",
      borderRadius: 4,
      marginTop: 16
    },
    playerSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      border: "1px solid #ccc",
      borderRadius: 4,
      padding: 16,
      marginTop: 16,
      cursor: "pointer",
      width: "100%"
    },
    outputText: {
      fontFamily: "monospace",
      whiteSpace: "pre-wrap",
      padding: 10,
      border: "1px solid #ccc",
      borderRadius: 4,
      backgroundColor: "#f9f9f9",
      width: "100%",
      height: "200px",
      overflowY: "auto"
    },
    musicControls: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      marginBottom: 20,
      border: "1px solid #ccc",
      borderRadius: 4,
      padding: 16
    },
    controlLabel: {
      fontSize: 18,
      marginBottom: 10
    },
    slider: {
      width: "100%",
      margin: "10px 0",
      cursor: "pointer"
    },
    sliderValue: {
      fontFamily: "monospace",
      fontSize: 24,
      textAlign: "center",
      margin: "5px 0 20px 0"
    },
    buttonGroup: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 10
    },
    timeSignatureButton: {
      padding: "8px 12px",
      border: "1px solid #ccc",
      borderRadius: 4,
      cursor: "pointer",
      fontSize: 14
    },
    activeButton: {
      backgroundColor: "#2196F3",
      color: "white",
      border: "1px solid #2196F3"
    }
  };

  // Update token string when tempo or time signature changes
  useEffect(() => {
    if (availableTempos.length === 0) return; // Wait until tempos are loaded

    // Parse the existing token string to maintain other tokens
    const tokens = tokenStr.split(' ');

    // Find the actual tempo token from availableTempos that matches our current tempo
    const tempoToken = availableTempos.find(t => t.value === tempo)?.token || `Tempo_${tempo.toFixed(2)}`;
    const timeSignatureToken = `TimeSig_${timeSignature}`;

    // Find and replace the tempo and time signature tokens
    let updatedTokens = tokens.map(token => {
      if (token.startsWith('Tempo_')) {
        return tempoToken;
      } else if (token.startsWith('TimeSig_')) {
        return timeSignatureToken;
      }
      return token;
    });

    // Check if we need to add tokens if they don't exist
    if (!tokens.some(token => token.startsWith('Tempo_'))) {
      updatedTokens.push(tempoToken);
    }

    if (!tokens.some(token => token.startsWith('TimeSig_'))) {
      updatedTokens.push(timeSignatureToken);
    }

    setTokenStr(updatedTokens.join(' '));
  }, [tempo, timeSignature, availableTempos]);

  // Configure visualizer when ref is available
  useEffect(() => {
    if (visualizerRef.current) {
      visualizerRef.current.config = {
        noteHeight: 4,
        pixelsPerTimeStep: 60,
        minPitch: 30
      };
    }
  }, [visualizerRef]);

  // Initialize and handle worker
  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./pianoWorker.js', import.meta.url), {
        type: 'module'
      });
    }

    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          setReady(false);
          setProgressItems(prev => [...prev, e.data]);
          break;

        case 'progress':
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
          setProgressItems(
            prev => prev.filter(item => item.file !== e.data.file)
          );
          break;

        case 'ready':
          setReady(true);
          break;

        case 'update':
          setOutput(e.data.output);
          break;

        case 'complete':
          setOutput(e.data.output);
          setDisabled(false);
          let midi = remiToMidi(e.data.output);
          const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
          const url = URL.createObjectURL(blob);
          setMidiUrl(url);
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);

    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  // Generate music
  const generate = () => {
    setDisabled(true);
    worker.current.postMessage({
      text: tokenStr,
      generationParams
    });
  }

  // Handle tempo change
  const handleTempoChange = (e) => {
    const newTempo = parseFloat(e.target.value);

    // Find the closest available tempo from the tokenizer
    if (availableTempos.length > 0) {
      const closestTempo = availableTempos.reduce((prev, curr) =>
        Math.abs(curr.value - newTempo) < Math.abs(prev.value - newTempo) ? curr : prev
      );
      setTempo(closestTempo.value);
    } else {
      setTempo(newTempo);
    }
  };

  // Handle time signature selection
  const handleTimeSignatureChange = (sig) => {
    setTimeSignature(sig);
  };

  return (
    <div style={styles.container}>
      <div style={styles.appWrapper}>
        {/* Music controls section */}
        <div style={styles.musicControls}>
          <div>
            <div style={styles.controlLabel}>Tempo</div>
            <div style={styles.sliderValue}>{tempo}</div>
            {availableTempos.length > 0 && (
              <input
                type="range"
                min={availableTempos[0].value}
                max={availableTempos[availableTempos.length - 1].value}
                step={(availableTempos[1]?.value - availableTempos[0]?.value) || 1}
                value={tempo}
                onChange={handleTempoChange}
                style={styles.slider}
              />
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={styles.controlLabel}>Time signature</div>
            <div style={styles.buttonGroup}>
              {timeSignatures.map((sig) => (
                <button
                  key={sig}
                  onClick={() => handleTimeSignatureChange(sig)}
                  style={{
                    ...styles.timeSignatureButton,
                    ...(timeSignature === sig ? styles.activeButton : {})
                  }}
                >
                  {sig}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input and controls section */}
        <div style={styles.inputRow}>
          <textarea
            style={styles.textarea}
            value={tokenStr}
            onChange={e => setTokenStr(e.target.value)}
            placeholder="Enter token string..."
          />
          <div style={styles.controlPanel}>
            <Range
              min={1}
              max={2048}
              step={1}
              defaultValue={512}
              label="Max length"
              description=""
              value={generationParams.max_length}
              onChange={value => setGenerationParams(prev => ({ ...prev, max_length: value }))}
            />
            <Range
              min={0}
              max={2}
              step={0.01}
              defaultValue={1}
              label="Temperature"
              description=""
              value={generationParams.temperature}
              onChange={value => setGenerationParams(prev => ({ ...prev, temperature: value }))}
            />
            <Range
              min={0}
              max={1}
              step={0.01}
              defaultValue={0.99}
              label="Top P"
              description=""
              value={generationParams.top_p}
              onChange={value => setGenerationParams(prev => ({ ...prev, top_p: value }))}
            />
          </div>
        </div>

        {/* Generate button */}
        <button
          style={styles.generateButton}
          disabled={disabled}
          onClick={generate}
        >
          Generate{!ready && " (downloads 89mb model first time)"}
        </button>

        {/* Loading and output section */}
        <div style={styles.outputSection}>
          {progressItems.length > 0 && (
            <div style={styles.loadingSection}>
              <label>Loading models... (only run once)</label>
              {progressItems.map(data => (
                <div key={data.file}>
                  <Progress text={data.file} percentage={data.progress} />
                </div>
              ))}
            </div>
          )}

          {ready && output && (
            <div style={styles.outputText}>
              {output}
            </div>
          )}

          {midiUrl && (
            <a href={midiUrl} download="output.mid" style={styles.downloadLink}>
              Download MIDI
            </a>
          )}

          {/* MIDI Player */}
          {midiUrl && (
            <div
              onClick={() => setIsPlaying(!isPlaying)}
              style={styles.playerSection}
            >
              <MIDIPlayer src={midiUrl} isPlaying={isPlaying} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PianoApp