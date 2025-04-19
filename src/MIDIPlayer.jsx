import { useState, useRef, useEffect } from 'react'
import 'html-midi-player'
import "./Midi.css"

const MIDIPlayer = ({ src, isPlaying }) => {
    const visualizerRef = useRef(null);
    const playerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        visualizerRef.current.config = {
            noteHeight: 4,
            pixelsPerTimeStep: 24,
            minPitch: 21,
            maxPitch: 108,
        };
    }, [visualizerRef.current])

    useEffect(() => {
        if (isPlaying) {
            if (playerRef.current) {
                playerRef.current.stop();
                containerRef.current.removeChild(playerRef.current);
                playerRef.current = null;
            }
            playerRef.current = document.createElement('midi-player');
            containerRef.current.appendChild(playerRef.current);
            playerRef.current.soundFont = "https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus";
            playerRef.current.src = src;
            playerRef.current.loop = false;
            playerRef.current.addVisualizer(visualizerRef.current);
            playerRef.current.addEventListener('load', () => {
                console.log("loaded");
                playerRef.current.loop = true;
                playerRef.current.start();
            })
        }
        if (!isPlaying) {
            if (playerRef.current) {
                playerRef.current.stop();
                containerRef.current.removeChild(playerRef.current);
                playerRef.current = null;
            }
        }
    }, [isPlaying, src])

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: '10px',
            boxSizing: 'border-box',
            minHeight: '250px',
        }}>
            <midi-visualizer
                style={{
                    border: "1px solid black",
                    maxWidth: '100%',
                    height: 'auto'
                }}
                src={src}
                ref={visualizerRef}
            ></midi-visualizer>
            <div ref={containerRef} style={{ display: "none" }}></div>
        </div>
    )
}

export default MIDIPlayer