
import { Midi } from '@tonejs/midi';
/**
 * Converts tokenized REMI format to a Tone.js MIDI object
 * @param {string} remiText - The REMI tokenized text
 * @returns {object} - Tone.js MIDI object
 */
export function remiToMidi(remiText) {
    // Create a new MIDI object
    const midi = new Midi();

    // Parse the REMI tokens
    const tokens = remiText.split(/\s+/);

    // Track the current state
    let currentBar = 0;
    let currentPosition = 0;
    let currentTempo = 120;
    let currentTimeSig = { numerator: 4, denominator: 4 };
    let currentTrack = null;

    // Create a default track if none exists
    currentTrack = midi.addTrack({instrument:1});

    // For position calculation
    const PPQ = 480; // Pulses Per Quarter note
    let ticksPerBeat = PPQ;
    let ticksPerBar = ticksPerBeat * currentTimeSig.numerator * (4 / currentTimeSig.denominator);

    // Process tokens
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // Check if it's a parameter setting
        if (token.includes('_')) {
            const [param, value] = token.split('_');

            switch (param) {
                case 'Bar':
                    // Handle bar changes
                    if (value === 'None') {
                        currentBar++;
                    } else {
                        currentBar = parseInt(value);
                    }
                    currentPosition = 0;
                    break;

                case 'TimeSig':
                    // Handle time signature changes
                    const [num, denom] = value.split('/');
                    currentTimeSig = {
                        numerator: parseInt(num),
                        denominator: parseInt(denom)
                    };
                    ticksPerBar = ticksPerBeat * currentTimeSig.numerator * (4 / currentTimeSig.denominator);
                    midi.header.timeSignatures.push({
                        ticks: currentBar * ticksPerBar,
                        timeSignature: [currentTimeSig.numerator, currentTimeSig.denominator]
                    });
                    break;

                case 'Position':
                    // Handle position in the bar
                    currentPosition = parseInt(value);
                    break;

                case 'Tempo':
                    // Handle tempo changes
                    currentTempo = parseFloat(value);
                    midi.header.tempos.push({
                        ticks: currentBar * ticksPerBar + currentPosition * (ticksPerBar / 24),
                        bpm: currentTempo
                    });
                    break;

                case 'Pitch':
                    // Handle note pitch
                    const midiPitch = parseInt(value);

                    // Look ahead for velocity and duration
                    if (i + 2 < tokens.length && tokens[i + 1].includes('Velocity') && tokens[i + 2].includes('Duration')) {
                        const velocity = parseInt(tokens[i + 1].split('_')[1]) / 127; // Normalize to 0-1
                        const durationStr = tokens[i + 2].split('_')[1];

                        // Parse duration in format like "0.6.12" (bars.beats.ticks)
                        const durationParts = durationStr.split('.');
                        const durationBars = parseInt(durationParts[0] || 0);
                        const durationBeats = parseInt(durationParts[1] || 0);
                        const durationTicks = parseInt(durationParts[2] || 0);

                        // Calculate start ticks
                        const startTicks = (currentBar * ticksPerBar) + (currentPosition * (ticksPerBar / 24));

                        // Calculate duration in ticks
                        const durationInTicks = (durationBars * ticksPerBar) +
                            (durationBeats * ticksPerBeat) +
                            (durationTicks * (ticksPerBeat / 12));

                        // Add the note to the track
                        currentTrack.addNote({
                            midi: midiPitch,
                            ticks: startTicks,
                            durationTicks: durationInTicks,
                            velocity: velocity
                        });

                        // Skip the velocity and duration tokens since we've processed them
                        i += 2;
                    }
                    break;
            }
        }
    }

    // Set the name in the header
    midi.header.name = "Converted from REMI";

    return midi;
}

/**
 * Example usage:
 * 
 * // Using the function with text data
 * const remiText = "Bar_None TimeSig_2/4 Position_0 Tempo_106.67 Pitch_58 Velocity_87 Duration_0.6.12...";
 * const midi = remiToMidi(remiText);
 * 
 * // In browser - download the MIDI file
 * const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = 'converted.mid';
 * a.click();
 * 
 * // In Node.js - write to file
 * // fs.writeFileSync("output.mid", Buffer.from(midi.toArray()));
 */