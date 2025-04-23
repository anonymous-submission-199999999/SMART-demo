import React, { useState, useEffect, useRef } from 'react';

const ProgramSelector = ({ onProgramsChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPrograms, setSelectedPrograms] = useState([]);
    const [displayedPrograms, setDisplayedPrograms] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Styles
    const styles = {
        container: {
            position: 'relative',
            width: '100%'
        },
        label: {
            marginBottom: '8px',
            fontWeight: '500',
            display: 'block'
        },
        tagsContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '8px'
        },
        tag: {
            backgroundColor: '#e6f0ff',
            padding: '4px 12px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
        },
        tagText: {
            marginRight: '8px'
        },
        tagId: {
            fontSize: '12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '12px',
            padding: '2px 8px',
            marginRight: '4px'
        },
        removeButton: {
            marginLeft: '4px',
            color: '#6b7280',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '16px'
        },
        inputContainer: {
            position: 'relative'
        },
        input: {
            width: '100%',
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            outline: 'none',
            boxSizing: 'border-box'
        },
        dropdown: {
            position: 'absolute',
            width: '100%',
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxHeight: '256px',
            overflowY: 'auto',
            zIndex: 10
        },
        dropdownItem: (isActive, isSelected) => ({
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: isActive ? '#e6f0ff' : 'white',
            opacity: isSelected ? 0.5 : 1
        }),
        itemName: {
            flexGrow: 1
        },
        itemCategory: {
            fontSize: '12px',
            color: '#6b7280'
        }
    };

    // Program categories with their programs
    const programCategories = [
        {
            name: "Drums",
            programs: [{ id: -1, name: "Drums" }]
        },
        {
            name: "Piano",
            programs: [
                { id: 1, name: "Acoustic Grand Piano" },
                { id: 2, name: "Bright Acoustic Piano" },
                { id: 3, name: "Electric Grand Piano" },
                { id: 4, name: "Honky-tonk Piano" },
                { id: 5, name: "Electric Piano 1" },
                { id: 6, name: "Electric Piano 2" },
                { id: 7, name: "Harpsichord" },
                { id: 8, name: "Clavinet" }
            ]
        },
        {
            name: "Chromatic Percussion",
            programs: [
                { id: 9, name: "Celesta" },
                { id: 10, name: "Glockenspiel" },
                { id: 11, name: "Music Box" },
                { id: 12, name: "Vibraphone" },
                { id: 13, name: "Marimba" },
                { id: 14, name: "Xylophone" },
                { id: 15, name: "Tubular Bells" },
                { id: 16, name: "Dulcimer" }
            ]
        },
        {
            name: "Organ",
            programs: [
                { id: 17, name: "Drawbar Organ" },
                { id: 18, name: "Percussive Organ" },
                { id: 19, name: "Rock Organ" },
                { id: 20, name: "Church Organ" },
                { id: 21, name: "Reed Organ" },
                { id: 22, name: "Accordion" },
                { id: 23, name: "Harmonica" },
                { id: 24, name: "Bandoneon" }
            ]
        },
        {
            name: "Guitar",
            programs: [
                { id: 25, name: "Acoustic Guitar (nylon)" },
                { id: 26, name: "Acoustic Guitar (steel)" },
                { id: 27, name: "Electric Guitar (jazz)" },
                { id: 28, name: "Electric Guitar (clean)" },
                { id: 29, name: "Electric Guitar (muted)" },
                { id: 30, name: "Electric Guitar (overdrive)" },
                { id: 31, name: "Electric Guitar (distortion)" },
                { id: 32, name: "Electric Guitar (harmonics)" }
            ]
        },
        {
            name: "Bass",
            programs: [
                { id: 33, name: "Acoustic Bass" },
                { id: 34, name: "Electric Bass (finger)" },
                { id: 35, name: "Electric Bass (picked)" },
                { id: 36, name: "Electric Bass (fretless)" },
                { id: 37, name: "Slap Bass 1" },
                { id: 38, name: "Slap Bass 2" },
                { id: 39, name: "Synth Bass 1" },
                { id: 40, name: "Synth Bass 2" }
            ]
        },
        {
            name: "Strings",
            programs: [
                { id: 41, name: "Violin" },
                { id: 42, name: "Viola" },
                { id: 43, name: "Cello" },
                { id: 44, name: "Contrabass" },
                { id: 45, name: "Tremolo Strings" },
                { id: 46, name: "Pizzicato Strings" },
                { id: 47, name: "Orchestral Harp" },
                { id: 48, name: "Timpani" }
            ]
        },
        {
            name: "Ensemble",
            programs: [
                { id: 49, name: "String Ensemble 1" },
                { id: 50, name: "String Ensemble 2" },
                { id: 51, name: "Synth Strings 1" },
                { id: 52, name: "Synth Strings 2" },
                { id: 53, name: "Choir Aahs" },
                { id: 54, name: "Voice Oohs" },
                { id: 55, name: "Synth Voice" },
                { id: 56, name: "Orchestra Hit" }
            ]
        },
        {
            name: "Brass",
            programs: [
                { id: 57, name: "Trumpet" },
                { id: 58, name: "Trombone" },
                { id: 59, name: "Tuba" },
                { id: 60, name: "Muted Trumpet" },
                { id: 61, name: "French Horn" },
                { id: 62, name: "Brass Section" },
                { id: 63, name: "Synth Brass 1" },
                { id: 64, name: "Synth Brass 2" }
            ]
        },
        {
            name: "Reed",
            programs: [
                { id: 65, name: "Soprano Sax" },
                { id: 66, name: "Alto Sax" },
                { id: 67, name: "Tenor Sax" },
                { id: 68, name: "Baritone Sax" },
                { id: 69, name: "Oboe" },
                { id: 70, name: "English Horn" },
                { id: 71, name: "Bassoon" },
                { id: 72, name: "Clarinet" }
            ]
        },
        {
            name: "Pipe",
            programs: [
                { id: 73, name: "Piccolo" },
                { id: 74, name: "Flute" },
                { id: 75, name: "Recorder" },
                { id: 76, name: "Pan Flute" },
                { id: 77, name: "Blown Bottle" },
                { id: 78, name: "Shakuhachi" },
                { id: 79, name: "Whistle" },
                { id: 80, name: "Ocarina" }
            ]
        },
        {
            name: "Synth Lead",
            programs: [
                { id: 81, name: "Lead 1 (square)" },
                { id: 82, name: "Lead 2 (sawtooth)" },
                { id: 83, name: "Lead 3 (calliope)" },
                { id: 84, name: "Lead 4 (chiff)" },
                { id: 85, name: "Lead 5 (charang)" },
                { id: 86, name: "Lead 6 (voice)" },
                { id: 87, name: "Lead 7 (fifths)" },
                { id: 88, name: "Lead 8 (bass+lead)" }
            ]
        },
        {
            name: "Synth Pad",
            programs: [
                { id: 89, name: "Pad 1 (new age)" },
                { id: 90, name: "Pad 2 (warm)" },
                { id: 91, name: "Pad 3 (polysynth)" },
                { id: 92, name: "Pad 4 (choir)" },
                { id: 93, name: "Pad 5 (bowed)" },
                { id: 94, name: "Pad 6 (metallic)" },
                { id: 95, name: "Pad 7 (halo)" },
                { id: 96, name: "Pad 8 (sweep)" }
            ]
        },
        {
            name: "Synth Effects",
            programs: [
                { id: 97, name: "FX 1 (rain)" },
                { id: 98, name: "FX 2 (soundtrack)" },
                { id: 99, name: "FX 3 (crystal)" },
                { id: 100, name: "FX 4 (atmosphere)" },
                { id: 101, name: "FX 5 (brightness)" },
                { id: 102, name: "FX 6 (goblins)" },
                { id: 103, name: "FX 7 (echoes)" },
                { id: 104, name: "FX 8 (sci-fi)" }
            ]
        },
        {
            name: "Ethnic",
            programs: [
                { id: 105, name: "Sitar" },
                { id: 106, name: "Banjo" },
                { id: 107, name: "Shamisen" },
                { id: 108, name: "Koto" },
                { id: 109, name: "Kalimba" },
                { id: 110, name: "Bag pipe" },
                { id: 111, name: "Fiddle" },
                { id: 112, name: "Shanai" }
            ]
        },
        {
            name: "Percussive",
            programs: [
                { id: 113, name: "Tinkle Bell" },
                { id: 114, name: "Agogô" },
                { id: 115, name: "Steel Drums" },
                { id: 116, name: "Woodblock" },
                { id: 117, name: "Taiko Drum" },
                { id: 118, name: "Melodic Tom" },
                { id: 119, name: "Synth Drum" },
                { id: 120, name: "Reverse Cymbal" }
            ]
        },
        {
            name: "Sound Effects",
            programs: [
                { id: 121, name: "Guitar Fret Noise" },
                { id: 122, name: "Breath Noise" },
                { id: 123, name: "Seashore" },
                { id: 124, name: "Bird Tweet" },
                { id: 125, name: "Telephone Ring" },
                { id: 126, name: "Helicopter" },
                { id: 127, name: "Applause" },
                { id: 128, name: "Gunshot" }
            ]
        }
    ];

    // Flattened array of all programs for easier searching
    const allPrograms = programCategories.flatMap(category =>
        category.programs.map(program => ({
            ...program,
            category: category.name
        }))
    );

    // Filter programs based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setDisplayedPrograms([]);
        } else {
            const filtered = allPrograms.filter(program =>
                program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                program.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setDisplayedPrograms(filtered);
        }
    }, [searchTerm]);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
                return;
            }
        }

        if (isOpen && displayedPrograms.length > 0) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setActiveIndex(prev => (prev + 1) % displayedPrograms.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setActiveIndex(prev => (prev - 1 + displayedPrograms.length) % displayedPrograms.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (displayedPrograms[activeIndex]) {
                        handleProgramSelect(displayedPrograms[activeIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setIsOpen(false);
                    break;
                default:
                    break;
            }
        }
    };

    const handleProgramSelect = (program) => {
        // Check if program is already selected
        const alreadySelected = selectedPrograms.some(p => p.id === program.id);

        if (!alreadySelected) {
            const newSelectedPrograms = [...selectedPrograms, program];
            setSelectedPrograms(newSelectedPrograms);

            if (onProgramsChange) {
                onProgramsChange(newSelectedPrograms.map(p => p.id));
            }
        }

        setSearchTerm('');
        setIsOpen(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const removeProgram = (programId) => {
        const newSelectedPrograms = selectedPrograms.filter(p => p.id !== programId);
        setSelectedPrograms(newSelectedPrograms);

        if (onProgramsChange) {
            onProgramsChange(newSelectedPrograms.map(p => p.id));
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (isOpen && dropdownRef.current && displayedPrograms.length > 0) {
            const activeElement = dropdownRef.current.children[activeIndex];
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeIndex, isOpen, displayedPrograms.length]);

    return (
        <div style={styles.container}>
            <div style={styles.label}>Programs</div>

            {/* Selected programs display */}
            {selectedPrograms.length > 0 && (
                <div style={styles.tagsContainer}>
                    {selectedPrograms.map(program => (
                        <div key={program.id} style={styles.tag}>
                            <span style={styles.tagText}>{program.name}</span>
                            <span style={styles.tagId}>ID: {program.id}</span>
                            <button
                                onClick={() => removeProgram(program.id)}
                                style={styles.removeButton}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div style={styles.inputContainer}>
                <input
                    ref={inputRef}
                    type="text"
                    style={styles.input}
                    placeholder="Search for instruments..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        setActiveIndex(0);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {isOpen && displayedPrograms.length > 0 && (
                <div
                    ref={dropdownRef}
                    style={styles.dropdown}
                >
                    {displayedPrograms.map((program, index) => {
                        const isSelected = selectedPrograms.some(p => p.id === program.id);
                        const itemStyle = styles.dropdownItem(index === activeIndex, isSelected);

                        return (
                            <div
                                key={program.id}
                                style={itemStyle}
                                onClick={() => handleProgramSelect(program)}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                <div style={styles.itemName}>{program.name}</div>
                                <div style={styles.itemCategory}>{program.category}</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const TempoSlider = ({ defaultValue = 120, onChange }) => {
    // Create an array of available tempos from the data
    const tempoValues = [
        40.0, 43.33, 46.67, 50.0, 53.33, 56.67, 60.0, 63.33, 66.67, 70.0,
        73.33, 76.67, 80.0, 83.33, 86.67, 90.0, 93.33, 96.67, 100.0, 103.33,
        106.67, 110.0, 113.33, 116.67, 120.0, 123.33, 126.67, 130.0, 133.33,
        136.67, 140.0, 143.33, 146.67, 150.0, 153.33, 156.67, 160.0, 163.33,
        166.67, 170.0, 173.33, 176.67, 180.0, 183.33, 186.67, 190.0, 193.33,
        196.67, 200.0, 203.33, 206.67, 210.0, 213.33, 216.67, 220.0, 223.33,
        226.67, 230.0, 233.33, 236.67, 240.0, 243.33, 246.67, 250.0
    ];

    // Styles
    const styles = {
        container: {
            width: '100%'
        },
        label: {
            marginBottom: '8px',
            fontWeight: '500',
            display: 'block'
        },
        sliderRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        slider: {
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb'
        },
        tempoValue: {
            fontSize: '18px',
            fontWeight: '500',
            width: '80px',
            textAlign: 'center'
        },
        rangeLabels: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#6b7280',
            padding: '0 4px',
            marginTop: '4px'
        }
    };

    // Find the closest tempo index
    const findClosestTempoIndex = (value) => {
        return tempoValues.reduce((closest, curr, idx) => {
            return Math.abs(curr - value) < Math.abs(tempoValues[closest] - value) ? idx : closest;
        }, 0);
    };

    // Find default value index
    const defaultIndex = findClosestTempoIndex(defaultValue);
    const [tempoIndex, setTempoIndex] = useState(defaultIndex);

    const handleChange = (e) => {
        const index = parseInt(e.target.value);
        setTempoIndex(index);
        if (onChange) {
            onChange(tempoValues[index]);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.label}>Tempo (BPM)</div>
            <div style={styles.sliderRow}>
                <input
                    type="range"
                    min={0}
                    max={tempoValues.length - 1}
                    value={tempoIndex}
                    onChange={handleChange}
                    step={1}
                    style={styles.slider}
                />
                <span style={styles.tempoValue}>{tempoValues[tempoIndex]}</span>
            </div>
            <div style={styles.rangeLabels}>
                <span>{tempoValues[0].toFixed(1)}</span>
                <span>{tempoValues[Math.floor(tempoValues.length / 2)].toFixed(1)}</span>
                <span>{tempoValues[tempoValues.length - 1].toFixed(1)}</span>
            </div>
        </div>
    );
};

const MIDIPromptBuilder = ({ onSubmit }) => {
    const [selectedPrograms, setSelectedPrograms] = useState([]);
    const [tempo, setTempo] = useState(120);

    const styles = {
        container: {
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '24px'
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        },
        previewContainer: {
            marginTop: '16px'
        },
        previewLabel: {
            fontWeight: '500',
            marginBottom: '8px'
        },
        preview: {
            padding: '12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-word'
        }
    };

    // Generate the current prompt
    const generatePrompt = () => {
        // Create program tokens, remember to convert to zero-indexed
        const programTokens = selectedPrograms.map(id =>
            `Program_${id === -1 ? -1 : id - 1}`
        );

        // Build prompt with all required tokens
        const bosToken = 'BOS_None';
        // Format tempo correctly (add .0 if it's a whole number)
        const tempoToken = tempo % 1 === 0 ? `Tempo_${tempo}.0` : `Tempo_${tempo}`;
        const barToken = 'Bar_None';
        const position0Token = 'Position_0';
        const timeSigToken = 'TimeSig_4/4'; // Assuming a default time signature of 4/4

        // Combine all tokens in the correct order
        return [bosToken, ...programTokens, barToken, timeSigToken, position0Token, tempoToken].join(' ');
    };

    // Update the prompt whenever selectedPrograms or tempo changes
    useEffect(() => {
        if (onSubmit) {
            const prompt = generatePrompt();
            onSubmit(prompt);
        }
    }, [selectedPrograms, tempo, onSubmit]);

    // Generate preview text for display
    const getPreviewText = () => {
        const bosToken = 'BOS_None';
        const programTokensText = selectedPrograms.map(id =>
            `Program_${id === -1 ? -1 : id - 1}`
        ).join(' ');
        const tempoFormatted = tempo % 1 === 0 ? `${tempo}.0` : tempo;

        return `${bosToken} ${programTokensText} ${programTokensText ? ' ' : ''}Bar_None TimeSig_4/4 Position_0 Tempo_${tempoFormatted}`;
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>MIDI Prompt Builder</h2>

            <div style={styles.content}>
                <ProgramSelector onProgramsChange={setSelectedPrograms} />
                <TempoSlider onChange={setTempo} />

                <div style={styles.previewContainer}>
                    <div style={styles.previewLabel}>Current Prompt:</div>
                    <div style={styles.preview}>
                        {getPreviewText()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MIDIPromptBuilder;