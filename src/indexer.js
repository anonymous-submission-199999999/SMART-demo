// src/indexer.js
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Update these paths as needed
const AUDIO_DIR = 'audio_examples';
const MP3_OUTPUT_DIR = 'public/audio_examples_mp3';
const OUTPUT_FILE = 'src/audioIndex.js';
const MAX_DURATION = 10; // Maximum duration in seconds

// Create output directory if it doesn't exist
function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        console.log(`Created directory: ${directory}`);
    }
}

// Convert WAV to MP3 using ffmpeg and crop to MAX_DURATION seconds
async function convertWavToMp3(wavPath, mp3Path) {
    try {
        // Get the duration of the audio file
        const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`);
        const duration = parseFloat(stdout.trim());

        console.log(`Original duration of ${path.basename(wavPath)}: ${duration} seconds`);

        // If duration is greater than MAX_DURATION, crop the audio
        if (duration > MAX_DURATION) {
            await execAsync(`ffmpeg -i "${wavPath}" -codec:a libmp3lame -qscale:a 2 -t ${MAX_DURATION} "${mp3Path}"`);
            console.log(`Converted and cropped to ${MAX_DURATION}s: ${path.basename(wavPath)} -> ${path.basename(mp3Path)}`);
        } else {
            // Otherwise convert normally
            await execAsync(`ffmpeg -i "${wavPath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}"`);
            console.log(`Converted: ${path.basename(wavPath)} -> ${path.basename(mp3Path)}`);
        }
        return true;
    } catch (error) {
        console.error(`Error processing ${wavPath}:`, error.message);
        return false;
    }
}

// Parse a filename according to the format
function parseFilename(file, experiment) {
    // Format: <model>_index_<prompt_index>_<prompt_is_here>_<ignore the attempt part>.wav
    const filenameWithoutExt = file.replace('.wav', '');

    // Split by underscores to extract components
    const parts = filenameWithoutExt.split('_');

    if (parts.length < 3) return null;

    // Extract model and index
    const model = parts[0]; // e.g., "base" or "finetuned"

    // Find the position of "index" to locate the prompt_index
    const indexPos = parts.indexOf('index');
    if (indexPos === -1 || indexPos + 1 >= parts.length) return null;

    const promptIndex = parts[indexPos + 1];

    // Extract the prompt (everything between the index and "attempt")
    let promptParts = [];
    let i = indexPos + 2;

    while (i < parts.length && parts[i] !== 'attempt') {
        promptParts.push(parts[i]);
        i++;
    }

    const prompt = promptParts.join('_');

    return {
        filename: file,
        mp3Filename: filenameWithoutExt + '.mp3',
        experiment: experiment || 'unknown_experiment',
        model,
        promptIndex,
        prompt
    };
}

// Find all WAV files in experiment directories
function findWavFiles() {
    const results = [];

    try {
        // Get all items in the AUDIO_DIR
        const items = fs.readdirSync(AUDIO_DIR, { withFileTypes: true });

        // Look for experiment directories
        for (const item of items) {
            if (item.isDirectory()) {
                const experimentPath = path.join(AUDIO_DIR, item.name);
                console.log(`Found experiment directory: ${experimentPath}`);

                // Get all files in the experiment directory
                const files = fs.readdirSync(experimentPath);

                // Filter WAV files
                for (const file of files) {
                    if (file.endsWith('.wav')) {
                        const fullPath = path.join(experimentPath, file);
                        const parsed = parseFilename(file, item.name);

                        if (parsed) {
                            parsed.wavPath = fullPath;
                            results.push(parsed);
                            console.log(`Found WAV file: ${file} in experiment: ${item.name}`);
                        } else {
                            console.log(`Could not parse filename: ${file}`);
                        }
                    }
                }
            }
        }

        console.log(`Found ${results.length} WAV files in total`);
        return results;
    } catch (error) {
        console.error('Error finding WAV files:', error);
        return [];
    }
}

// Main function to create the audio index
async function createIndex() {
    try {
        // Check if audio directory exists
        if (!fs.existsSync(AUDIO_DIR)) {
            console.error(`Directory ${AUDIO_DIR} does not exist`);
            return;
        }

        // Ensure MP3 output directory exists
        ensureDirectoryExists(MP3_OUTPUT_DIR);

        // Find all WAV files
        const wavFiles = findWavFiles();
        console.log(`Found ${wavFiles.length} WAV files to process`);

        if (wavFiles.length === 0) {
            console.error('No WAV files found in the experiment directories.');
            return;
        }

        // Convert WAV files to MP3
        const audioFiles = [];

        for (const file of wavFiles) {
            // Create output structure (experiment/filename.mp3)
            const mp3Directory = path.join(MP3_OUTPUT_DIR, file.experiment);
            ensureDirectoryExists(mp3Directory);

            // Set the full path for the MP3 file
            const mp3Path = path.join(mp3Directory, file.mp3Filename);

            console.log(`Processing file: ${file.filename}`);
            console.log(`WAV path: ${file.wavPath}`);
            console.log(`MP3 path: ${mp3Path}`);

            // Convert WAV to MP3
            const success = await convertWavToMp3(file.wavPath, mp3Path);

            if (success) {
                // Add the converted file to our index
                const relativeMp3Path = path.join('audio_examples_mp3', file.experiment, file.mp3Filename).replace(/\\/g, '/');

                audioFiles.push({
                    ...file,
                    mp3Path: mp3Path.replace(/\\/g, '/'), // Ensure consistent path format
                    relativeMp3Path: relativeMp3Path
                });

                console.log(`Added to index: ${relativeMp3Path}`);
            }
            else {
                console.error(`Failed to convert ${file.wavPath} to MP3`);
                // exit
                process.exit(1);
            }
        }

        // Group files by various attributes
        const experiments = {};
        const models = {};
        const prompts = {};

        audioFiles.forEach(file => {
            // Group by experiment
            if (!experiments[file.experiment]) {
                experiments[file.experiment] = [];
            }
            experiments[file.experiment].push(file);

            // Group by model
            if (!models[file.model]) {
                models[file.model] = [];
            }
            models[file.model].push(file);

            // Group by prompt
            if (!prompts[file.prompt]) {
                prompts[file.prompt] = [];
            }
            prompts[file.prompt].push(file);
        });

        // Create the index
        const audioIndex = {
            allFiles: audioFiles,
            experiments,
            models,
            prompts,
            uniqueExperiments: Object.keys(experiments),
            uniqueModels: Object.keys(models),
            uniquePrompts: Object.keys(prompts)
        };

        // Write the index as a JavaScript module
        const jsContent = `// This file is auto-generated by indexer.js
// DO NOT EDIT MANUALLY

const audioIndex = ${JSON.stringify(audioIndex, null, 2)};

export default audioIndex;
`;

        fs.writeFileSync(OUTPUT_FILE, jsContent);
        console.log(`Audio index module created at ${OUTPUT_FILE}`);
        console.log(`Converted ${audioFiles.length} WAV files to MP3`);
        // print how many files are in the index and

    } catch (error) {
        console.error('Error creating audio index:', error);
    }
}

// Run the indexer
createIndex();