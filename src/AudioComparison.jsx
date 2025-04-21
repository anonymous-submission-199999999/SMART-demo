import { useState, useRef, useEffect } from 'react';
import audioIndex from './audioIndex';

const AudioComparison = () => {
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const [selectedExperiment, setSelectedExperiment] = useState(null);
    const [loadingStates, setLoadingStates] = useState({});
    const [isMobile, setIsMobile] = useState(false);
    const audioRefs = useRef({});

    // Check if the user is on a mobile device
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            setIsMobile(mobileRegex.test(userAgent));
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Simple helper function to get the correct audio path based on environment
    const getAudioPath = (fileInfo) => {
        if (!fileInfo) return null;
        const isDev = import.meta.env.DEV;
        const basePath = isDev ? '' : import.meta.env.BASE_URL || '/';
        return `${basePath}${fileInfo.relativeMp3Path}`;
    };

    // Set the first experiment as selected when component mounts
    useEffect(() => {
        if (audioIndex?.uniqueExperiments?.length > 0) {
            setSelectedExperiment(audioIndex.uniqueExperiments[0]);
        }
    }, []);

    // Base styles object with common values to reduce redundancy
    const baseStyles = {
        button: {
            padding: '6px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
        },
        cell: {
            padding: '8px',
            border: '1px solid #e5e7eb',
        }
    };

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
            ...baseStyles.button,
            backgroundColor: '#f3f4f6',
            fontWeight: 'normal',
        },
        experimentButtonActive: {
            ...baseStyles.button,
            backgroundColor: '#3b82f6',
            color: 'white',
            border: '1px solid #2563eb',
            fontWeight: 'bold',
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
            ...baseStyles.cell,
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#f3f4f6',
        },
        promptCell: {
            ...baseStyles.cell,
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
            ...baseStyles.cell,
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
        loadingButton: {
            backgroundColor: '#9ca3af',
            color: 'white',
            padding: '6px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'wait',
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
        noSamples: {
            color: '#9ca3af',
            fontSize: '12px',
        },
        infoText: {
            fontSize: '14px',
            color: '#4b5563',
            marginBottom: '16px',
        },
        mobileWarning: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
            textAlign: 'center',
        },
        warningTitle: {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
        },
        warningText: {
            fontSize: '16px',
            marginBottom: '24px',
            maxWidth: '80%',
            lineHeight: '1.5',
        },
        continueButton: {
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
        }
    };

    // Lazy load audio and track loading state
    const loadAudio = (audioInfo) => {
        return new Promise((resolve, reject) => {
            if (!audioInfo) {
                reject('No audio info');
                return;
            }

            console.log("Loading audio:", audioInfo);

            const audioPath = getAudioPath(audioInfo);

            // If already loaded, return immediately
            if (audioRefs.current[audioPath]) {
                resolve(audioRefs.current[audioPath]);
                return;
            }

            // Set loading state
            setLoadingStates(prev => ({ ...prev, [audioPath]: true }));

            // Create new audio element
            const audio = new Audio();

            // Configure audio for better mobile compatibility
            audio.preload = 'auto';
            audio.playsinline = true;

            // Once loaded, update the refs and loading state
            audio.oncanplaythrough = () => {
                audioRefs.current[audioPath] = audio;
                setLoadingStates(prev => ({ ...prev, [audioPath]: false }));
                resolve(audio);
            };

            // Handle loading errors
            audio.onerror = () => {
                console.error("Error loading audio:", audioPath);
                setLoadingStates(prev => ({ ...prev, [audioPath]: false }));
                reject('Failed to load audio');
            };

            // Start loading
            audio.src = audioPath;
        });
    };

    const handlePlay = async (audioInfo) => {
        if (!audioInfo) return;

        const audioPath = getAudioPath(audioInfo);

        // If clicking the currently playing button, just stop it
        if (currentlyPlaying === audioPath) {
            if (audioRefs.current[audioPath]) {
                audioRefs.current[audioPath].pause();
                audioRefs.current[audioPath].currentTime = 0;
            }
            setCurrentlyPlaying(null);
            return;
        }

        // Stop currently playing audio if any
        if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
            audioRefs.current[currentlyPlaying].pause();
            audioRefs.current[currentlyPlaying].currentTime = 0;
            setCurrentlyPlaying(null);
        }

        try {
            // Set loading state (even if already loading)
            if (!audioRefs.current[audioPath]) {
                setLoadingStates(prev => ({ ...prev, [audioPath]: true }));
            }

            // Load the audio (will resolve immediately if already loaded)
            const audio = await loadAudio(audioInfo);

            // Play the audio once it's loaded - with mobile fixes
            try {
                // Set properties that help with mobile playback
                audio.playsinline = true;
                audio.muted = false; // Ensure it's not muted
                audio.volume = 0.5;  // Set volume to max

                // Special handling for iOS devices
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    // iOS often requires a user gesture to play audio
                    // Unmute and play in the same promise chain
                    await audio.play();
                } else {
                    // For other devices
                    await audio.play();
                }

                setCurrentlyPlaying(audioPath);
            } catch (playError) {
                console.error("Error playing audio (likely autoplay restriction):", playError);

                // If we get an autoplay error, we'll show a message and keep the audio loaded
                // so the user can try again with another click
                setLoadingStates(prev => ({ ...prev, [audioPath]: false }));

                // On mobile, we might need to create a one-time "unlock" for audio context
                if (typeof window !== 'undefined') {
                    const unlockAudio = () => {
                        // Create and play a silent audio element to unlock audio context
                        const silentAudio = new Audio();
                        silentAudio.play().then(() => {
                            // Now try to play our actual audio
                            audio.play().then(() => {
                                setCurrentlyPlaying(audioPath);
                            }).catch(e => console.error("Still couldn't play after unlock:", e));
                        }).catch(e => console.error("Couldn't unlock audio context:", e));

                        // Remove the listener once used
                        document.body.removeEventListener('touchstart', unlockAudio);
                        document.body.removeEventListener('click', unlockAudio);
                    };

                    // Add listeners to try again on next user interaction
                    document.body.addEventListener('touchstart', unlockAudio, false);
                    document.body.addEventListener('click', unlockAudio, false);
                }
            }
        } catch (error) {
            console.error("Error handling audio playback:", error);
            setLoadingStates(prev => ({ ...prev, [audioPath]: false }));
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

    // Mobile warning component
    const MobileWarning = () => {
        const [dismissed, setDismissed] = useState(false);

        if (!isMobile || dismissed) {
            return null;
        }

        return (
            <div style={styles.mobileWarning}>
                <h2 style={styles.warningTitle}>Warning: Mobile Not Supported</h2>
                <p style={styles.warningText}>
                    This audio comparison website does not work properly on mobile devices.
                    For the best experience, please access this site from a desktop or laptop computer.
                </p>
                <button
                    style={styles.continueButton}
                    onClick={() => setDismissed(true)}
                >
                    Continue Anyway
                </button>
            </div>
        );
    };

    // Early return if no data is available
    if (!audioIndex || !audioIndex.allFiles || audioIndex.allFiles.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '48px' }}>
                <MobileWarning />
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

    // Custom SVG icons using CSS for animations
    const PlayIcon = () => (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 5v14l11-7z" />
        </svg>
    );

    const PlayingIcon = () => (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="playing-icon">
            <path d="M8 5v14l11-7z" />
            <style>
                {`
                .playing-icon {
                    animation: blink 1s ease-in-out infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                `}
            </style>
        </svg>
    );

    const LoadingIcon = () => (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="loading-icon">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <style>
                {`
                .loading-icon {
                    animation: spin 1.5s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </svg>
    );

    const examples = getExperimentExamples();

    return (
        <div style={styles.container}>
            <MobileWarning />

            <h1 style={styles.title}>Audio Comparison</h1>

            <div style={styles.experimentSelector}>
                {audioIndex.uniqueExperiments.map(experiment => (
                    <button
                        key={experiment}
                        style={selectedExperiment === experiment ? styles.experimentButtonActive : styles.experimentButton}
                        onClick={() => setSelectedExperiment(experiment)}
                    >
                        {experiment.replace('experiment_A', 'tuning with procedural prompts, 10s').replace("experiment_B", "tuning with prompts from piano dataset, 30s")}
                    </button>
                ))}
            </div>

            <div style={styles.infoText}>
                These examples showcase outputs from the base and SMART tuned models using the same randomly selected prompts using different models.
                Temperature of 1.0 was used for all samples.
                All samples reflect the raw outputs of the models, without any filtering, post-processing, meaning some samples might be short or silent.
                Occasional deviations from tempos and time signatures stated in the prompt are due to the model inserting a new tempo or time signature token.
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

                            const baseAudioPath = getAudioPath(baseAudio);
                            const finetunedAudioPath = getAudioPath(finetunedAudio);

                            const isBaseAudioPlaying = currentlyPlaying === baseAudioPath;
                            const isFinetunedAudioPlaying = currentlyPlaying === finetunedAudioPath;

                            const isBaseAudioLoading = loadingStates[baseAudioPath] === true;
                            const isFinetunedAudioLoading = loadingStates[finetunedAudioPath] === true;

                            return (
                                <tr key={`${example.promptIndex}-${example.prompt}`}>
                                    <td style={styles.dataCell}>
                                        {timeSignature}, {tempo} BPM
                                    </td>
                                    <td style={styles.dataCell}>
                                        {baseAudio ? (
                                            <div>
                                                <button
                                                    onClick={() => handlePlay(baseAudio)}
                                                    style={
                                                        isBaseAudioLoading ? styles.loadingButton :
                                                            isBaseAudioPlaying ? styles.playingButton :
                                                                styles.playButton
                                                    }
                                                    title={
                                                        isBaseAudioLoading ? "Loading..." :
                                                            isBaseAudioPlaying ? "Stop" :
                                                                "Play Base Model Audio"
                                                    }
                                                >
                                                    {isBaseAudioLoading ? <LoadingIcon /> :
                                                        isBaseAudioPlaying ? <PlayingIcon /> :
                                                            <PlayIcon />}
                                                </button>
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
                                                    style={
                                                        isFinetunedAudioLoading ? styles.loadingButton :
                                                            isFinetunedAudioPlaying ? styles.playingButton :
                                                                styles.playButton
                                                    }
                                                    title={
                                                        isFinetunedAudioLoading ? "Loading..." :
                                                            isFinetunedAudioPlaying ? "Stop" :
                                                                "Play Fine-tuned Model Audio"
                                                    }
                                                >
                                                    {isFinetunedAudioLoading ? <LoadingIcon /> :
                                                        isFinetunedAudioPlaying ? <PlayingIcon /> :
                                                            <PlayIcon />}
                                                </button>
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