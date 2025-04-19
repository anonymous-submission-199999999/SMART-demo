import React from 'react'
import ReactDOM from 'react-dom/client'
import PianoApp from './PianoApp.jsx'
import LoopApp from './LoopApp.jsx'
import IrmaApp from './IrmaApp.jsx'
import AudioComparison from './AudioComparison.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioComparison></AudioComparison>
    {/* <LoopApp></LoopApp> */}
    {/* <PianoApp></PianoApp> */}
    {/* <IrmaApp></IrmaApp> */}
  </React.StrictMode>,
)
