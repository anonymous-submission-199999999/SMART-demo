import { useState, useRef, useEffect } from 'react';
import audioIndex from './audioIndex';

const AudioComparison = () => {
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const [selectedExperiment, setSelectedExperiment] = useState(null);
    const audioRefs = useRef({});

    // Simple helper function to get the correct audio path based on environment
    const getAudioPath = (fileInfo) => {
        if (!fileInfo) return null;

        // Check if we're in development or production
        const isDev = import.meta.env.DEV;
        const basePath = isDev ? '' : import.meta.env.BASE_URL || '/';

        // Use the relativeMp3Path which doesn't have the 'public/' prefix
        return `${basePath}${fileInfo.relativeMp3Path}`;
    };

    // Set the first experiment as selected when component mounts
    useEffect(() => {
        if (audioIndex && audioIndex.uniqueExperiments && audioIndex.uniqueExperiments.length > 0) {
            setSelectedExperiment(audioIndex.uniqueExperiments[0]);
        }
    }, []);

    // Play and Pause icons as SVG
    const PlayIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
        </svg>
    );

    // Playing icon with animation
    const PlayingIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="playing-icon">
            <path d="M8 5v14l11-7z" />
            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .playing-icon {
                    animation: blink 1s ease-in-out infinite;
                }
            `}</style>
        </svg>
    );

    // Styles
    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '12px',
            fontFamily: 'sans-serif'
        },
        title: {
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '12px',
        },
        subtitle: {
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '12px',
            marginTop: '16px',
        },
        experimentSelector: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px',
        },
        experimentButton: {
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'normal',
            fontSize: '14px',
        },
        experimentButtonActive: {
            padding: '6px 12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: '1px solid #2563eb',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
        },
        tableContainer: {
            overflowX: 'auto',
            width: '100%',
            maxWidth: '100%',
            marginBottom: '24px',
        },
        table: {
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            minWidth: '300px',
        },
        tableHead: {
            backgroundColor: '#f3f4f6',
        },
        headerCell: {
            padding: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#f3f4f6',
        },
        promptCell: {
            padding: '8px',
            border: '1px solid #e5e7eb',
            fontWeight: '600',
            backgroundColor: '#f9fafb',
            position: 'sticky',
            left: 0,
            zIndex: 1,
            maxWidth: '180px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        dataCell: {
            padding: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            verticalAlign: 'middle',
        },
        playButton: {
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '6px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            width: '30px',
            height: '30px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        playingButton: {
            backgroundColor: 'forestgreen',
            color: 'white',
            padding: '6px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            width: '30px',
            height: '30px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        fileInfo: {
            fontSize: '10px',
            marginTop: '4px',
            color: '#4b5563',
        },
        audioDetails: {
            fontSize: '12px',
            color: '#4b5563',
            marginTop: '4px',
        },
        noSamples: {
            color: '#9ca3af',
            fontSize: '12px',
        },
        responsiveNote: {
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '8px',
            marginBottom: '16px',
        },
        legend: {
            marginTop: '16px',
            marginBottom: '24px',
            fontSize: '14px',
        },
        legendItem: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
        },
        legendColor: {
            width: '16px',
            height: '16px',
            marginRight: '8px',
            borderRadius: '4px',
        },
        infoText: {
            fontSize: '14px',
            color: '#4b5563',
            marginBottom: '16px',
        }
    };

    // Helper function to get the full path for an audio file
    const getFullAudioPath = (audioInfo) => {
        return audioInfo ? getAudioPath(audioInfo) : null;
    };

    const handlePlay = (audioInfo) => {
        if (!audioInfo) return;

        const audioPath = getAudioPath(audioInfo);

        // Stop currently playing audio if any
        if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
            audioRefs.current[currentlyPlaying].pause();
            audioRefs.current[currentlyPlaying].currentTime = 0;
        }

        // If clicking the currently playing button, just stop it
        if (currentlyPlaying === audioPath) {
            setCurrentlyPlaying(null);
            return;
        }

        // Play the new audio
        if (audioRefs.current[audioPath]) {
            console.log("Playing audio:", audioPath);
            audioRefs.current[audioPath].play()
                .catch(error => {
                    console.error("Error playing audio:", error);
                });
            setCurrentlyPlaying(audioPath);
        }
    };

    // Register when audio ends playing
    useEffect(() => {
        const refs = audioRefs.current;

        Object.entries(refs).forEach(([path, audioElement]) => {
            if (audioElement) {
                audioElement.onended = () => {
                    if (currentlyPlaying === path) {
                        setCurrentlyPlaying(null);
                    }
                };
            }
        });

        // Clean up event listeners when component unmounts
        return () => {
            Object.values(refs).forEach(audioElement => {
                if (audioElement) {
                    audioElement.onended = null;
                }
            });
        };
    }, [currentlyPlaying]);

    // Early return if no data is available
    if (!audioIndex || !audioIndex.allFiles || audioIndex.allFiles.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '48px' }}>
                No audio files found
            </div>
        );
    }

    // Function to extract time signature and tempo from prompt
    const extractAudioInfo = (prompt) => {
        if (!prompt) return { timeSignature: '-', tempo: '-' };

        const timeSignatureMatch = prompt.match(/TimeSig_(\d+d\d+)/);
        const tempoMatch = prompt.match(/Tempo_(\d+(?:\.\d+)?)/);

        const timeSignature = timeSignatureMatch ? timeSignatureMatch[1].replace('d', '/') : '-';
        const tempo = tempoMatch ? tempoMatch[1] : '-';

        return { timeSignature, tempo };
    };

    // Get examples for the selected experiment - FIXED to use file indices
    const getExperimentExamples = () => {
        if (!selectedExperiment || !audioIndex.experiments[selectedExperiment]) {
            return [];
        }

        const experimentFiles = audioIndex.experiments[selectedExperiment];

        // Group by promptIndex to ensure we get one entry for each original index
        const examplesByPromptIndex = {};

        // First group files by promptIndex
        experimentFiles.forEach(file => {
            if (!examplesByPromptIndex[file.promptIndex]) {
                examplesByPromptIndex[file.promptIndex] = {
                    promptIndex: file.promptIndex,
                    prompt: file.prompt,
                    models: {}
                };
            }
            examplesByPromptIndex[file.promptIndex].models[file.model] = file;
        });

        // Convert to array and sort by promptIndex
        return Object.values(examplesByPromptIndex).sort((a, b) => {
            return parseInt(a.promptIndex) - parseInt(b.promptIndex);
        });
    };

    const examples = getExperimentExamples();

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Audio Comparison</h1>

            <div style={styles.experimentSelector}>
                {audioIndex.uniqueExperiments.map(experiment => (
                    <button
                        key={experiment}
                        style={selectedExperiment === experiment ? styles.experimentButtonActive : styles.experimentButton}
                        onClick={() => setSelectedExperiment(experiment)}
                    >
                        {experiment.replace('experiment_A', 'tuning with procedural prompts').replace("experiment_B", "tuning with prompts from piano dataset")}
                    </button>
                ))}
            </div>

            <div style={styles.infoText}>
                These examples showcase outputs from the base and SMART tuned models using the same randomly selected prompts using different models.
                Temperature of 1.0 was used for all samples.
                All samples reflect the raw outputs of the models, without any filtering, post-processing, meaning some samples might be short or silent.
                Occasional deviations from tempos stated in the prompt are due to the model inserting a tempo change.
                All outputs are rendered using the same soundfont as used during finetuning.
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead style={styles.tableHead}>
                        <tr>
                            <th style={styles.headerCell}>Prompt</th>
                            <th style={styles.headerCell}>Base Model</th>
                            <th style={styles.headerCell}>Fine-tuned Model</th>
                        </tr>
                    </thead>
                    <tbody>
                        {examples.map(example => {
                            const baseAudio = example.models?.base;
                            const finetunedAudio = example.models?.finetuned;
                            const { timeSignature, tempo } = extractAudioInfo(example.prompt);

                            const isBaseAudioPlaying = currentlyPlaying === getAudioPath(baseAudio);
                            const isFinetunedAudioPlaying = currentlyPlaying === getAudioPath(finetunedAudio);

                            return (
                                <tr key={`${example.promptIndex}-${example.prompt}`}>
                                    <td style={styles.dataCell}>
                                        {timeSignature}, {tempo} BPM
                                        {/* <div style={styles.fileInfo}>Index: {example.promptIndex}</div> */}
                                    </td>
                                    <td style={styles.dataCell}>
                                        {baseAudio ? (
                                            <div>
                                                <button
                                                    onClick={() => handlePlay(baseAudio)}
                                                    style={isBaseAudioPlaying ? styles.playingButton : styles.playButton}
                                                    title={isBaseAudioPlaying ? "Stop" : "Play Base Model Audio"}
                                                >
                                                    {isBaseAudioPlaying ? <PlayingIcon /> : <PlayIcon />}
                                                </button>
                                                <audio
                                                    ref={el => {
                                                        if (el) audioRefs.current[getAudioPath(baseAudio)] = el;
                                                    }}
                                                    controls={false}
                                                    src={getAudioPath(baseAudio)}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={styles.noSamples}>No audio</div>
                                        )}
                                    </td>
                                    <td style={styles.dataCell}>
                                        {finetunedAudio ? (
                                            <div>
                                                <button
                                                    onClick={() => handlePlay(finetunedAudio)}
                                                    style={isFinetunedAudioPlaying ? styles.playingButton : styles.playButton}
                                                    title={isFinetunedAudioPlaying ? "Stop" : "Play Fine-tuned Model Audio"}
                                                >
                                                    {isFinetunedAudioPlaying ? <PlayingIcon /> : <PlayIcon />}
                                                </button>
                                                <audio
                                                    ref={el => {
                                                        if (el) audioRefs.current[getAudioPath(finetunedAudio)] = el;
                                                    }}
                                                    controls={false}
                                                    src={getAudioPath(finetunedAudio)}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={styles.noSamples}>No audio</div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AudioComparison;