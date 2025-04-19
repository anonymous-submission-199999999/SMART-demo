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
    let currentBar = -1;
    let currentPosition = 0; // This will store the most recent position value
    let currentTempo = 120;
    let currentTimeSig = null;
    let currentTrack = null;

    // Create a default track if none exists
    currentTrack = midi.addTrack();

    // For position calculation
    const PPQ = 480; // Pulses Per Quarter note
    let ticksPerBeat = PPQ;

    let currentBarTick = 0;
    let ticksPerBar = null;

    let ticksPerPosition = null;


    // Process tokens
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // Skip empty tokens
        if (!token) continue;

        // Check if it's a parameter setting
        if (token.includes('_')) {
            const [param, value] = token.split('_');

            switch (param) {
                case 'Bar':
                    // Handle bar changes
                    // increment by ticks in the current bar
                    currentBar += 1;

                    if (currentBar > 0) {
                        // add ticks
                        currentBarTick += ticksPerBar;
                    }

                    break;
                   
                case 'TimeSig':
                    // Handle time signature changes
                    const [num, denom] = value.split('/');
                    currentTimeSig = {
                        numerator: parseInt(num),
                        denominator: parseInt(denom)
                    };
                    // Update ticks per bar based on new time signature
                    ticksPerBar = ticksPerBeat * currentTimeSig.numerator * (4 / currentTimeSig.denominator);
                    midi.header.timeSignatures.push({
                        ticks: currentBarTick,
                        timeSignature: [currentTimeSig.numerator, currentTimeSig.denominator]
                    });
                    ticksPerPosition = (4 / currentTimeSig.denominator) * ticksPerBeat/12; // Calculate ticks per position
                    break;

                case 'Tempo':
                    // Handle tempo changes
                    currentTempo = parseFloat(value);
                    midi.header.tempos.push({
                        ticks: currentBarTick,
                        bpm: currentTempo
                    });
                    break;

                case 'Position':
                    // Update the current position
                    currentPosition = parseInt(value);
                    break;

                case 'Program':
                    // -1 indicates drums (channel 10)
                    // Handle program changes (instrument changes)
                    let programNumber = parseInt(value);
                    break;

                case 'PitchDrum':
                    // Handle note pitch
                    let midiPitchDrum = parseInt(value);

                    // Calculate effective bar and position
                    let startTickDrum = currentBarTick + (currentPosition * ticksPerPosition);

                    // Look ahead for velocity and duration
                    if (i + 2 < tokens.length && tokens[i + 1].includes('Velocity') && tokens[i + 2].includes('Duration')) {
                        let velocity = parseInt(tokens[i + 1].split('_')[1]) / 127; // Normalize to 0-1
                        let durationStr = tokens[i + 2].split('_')[1];
                        // Parse duration in format like "0.6.12"
                        let durationParts = durationStr.split('.');
                        let durationBig = parseInt(durationParts[0] || 0);
                        let durationSmall = parseInt(durationParts[1] || 0);
                        let durationRes = parseInt(durationParts[2] || 0);
                        // Calculate duration in ticks
                        let durationInTicks = Math.max(1, Math.round(
                            (durationBig * ticksPerBeat) +
                            (durationSmall * ticksPerBeat / durationRes)
                        ));
                        // Add the note to the track
                        currentTrack.addNote({
                            midi: midiPitchDrum,
                            ticks: startTickDrum,
                            durationTicks: ticksPerBeat/8,
                            velocity: (velocity * 0.9)
                        });
                        // Skip the velocity and duration tokens since we've processed them
                        i += 2;
                    }
                    break;

                case 'Pitch':
                    // Handle note pitch
                    let midiPitch = parseInt(value);

                    // Calculate effective bar and position
                    let startTick = currentBarTick + (currentPosition * ticksPerPosition);

                    // Look ahead for velocity and duration
                    if (i + 2 < tokens.length && tokens[i + 1].includes('Velocity') && tokens[i + 2].includes('Duration')) {
                        let velocity = parseInt(tokens[i + 1].split('_')[1]) / 127; // Normalize to 0-1
                        let durationStr = tokens[i + 2].split('_')[1];
                        // Parse duration in format like "0.6.12"
                        let durationParts = durationStr.split('.');
                        let durationBig = parseInt(durationParts[0] || 0);
                        let durationSmall = parseInt(durationParts[1] || 0);
                        let durationRes = parseInt(durationParts[2] || 0);
                        // Calculate duration in ticks
                        let durationInTicks = Math.max(1, Math.round(
                            (durationBig * ticksPerBeat) +
                            (durationSmall * ticksPerBeat / durationRes)
                        ));
                        // Add the note to the track
                        currentTrack.addNote({
                            midi: midiPitch,
                            ticks: startTick,
                            durationTicks: durationInTicks,
                            velocity: ( velocity *0.9)
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
 * const remiText = "Bar_None TimeSig_4/4 Position_0 Tempo_126.67 Pitch_58 Velocity_55 Duration_3.0.12 Position_6 Pitch_65 Velocity_63 Duration_0.7.12 Position_12 Pitch_74 Velocity_55 Duration_3.0.12 Position_13 Pitch_65 Velocity_35 Duration_1.11.12 Pitch_70 Velocity_55 Duration_1.11.12 Position_36 Pitch_58 Velocity_59 Duration_2.11.12";
 * const midi = remiToMidi(remiText);
 * 
 * // In browser - download the MIDI file
 * const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = 'converted.mid';
 * a.click();
 */