const template = document.createElement('template')
import css from './style.js'

template.innerHTML = `${css}
<div id="blade" >
<h2 id="title"></h2>
    <audio controls id="audio"  class="audio-element" src=""></audio><br>
    <button id="play"><img src="./assets/imgs/play.png" alt="Play"/></button>
    <button id="pause"><img src="./assets/imgs/pause.png" alt="Pause"/></button>
    <button id="backward"><img src="./assets/imgs/replay-10.png" alt="Backward"/></button>
    <button id="forward"><img src="./assets/imgs/forward-10.png" alt="Forward"/></button>
    <button id="stop"><img src="./assets/imgs/stop.png" alt="stop"/></button>
    <br><br>
    <webaudio-knob 
        id="panner" 
        src="./assets/imgs/button4.png" 
        min="-1" max="1" value="0" step="0.1" diameter="60" 
        tooltip="Panne">
    </webaudio-knob>
    <webaudio-knob 
        id="gain" 
        src="./assets/imgs/button5.png" 
        value="0"  max="3"  step="0.1" diameter="60" 
        tooltip="Volume">
    </webaudio-knob>
    <br><br>

    <div class="canvas-wrapper">
      <canvas id="frequencies-visualization"></canvas><br>
    </div>

    <div id="equalizer">
<div id="equalizer-inputs">
        <webaudio-knob 
          id="eq-in-1" 
          src="./assets/imgs/LittlePhatty.png" 
          value="0" min="-20" max="20" step="0.1" diameter="60"  tooltip="Band 60Hz">
        </webaudio-knob>
      
        <webaudio-knob 
          id="eq-in-2" 
          src="./assets/imgs/LittlePhatty.png" 
          value="0" min="-20" max="20" step="0.1" diameter="60"  tooltip="Band 170Hz">
        </webaudio-knob>
     
        <webaudio-knob 
            id="eq-in-3" 
            src="./assets/imgs/LittlePhatty.png" 
            value="0" min="-20" max="20" step="0.1" diameter="60"  tooltip="Band 350Hz">
        </webaudio-knob>
     
        <webaudio-knob 
            id="eq-in-4" 
            src="./assets/imgs/LittlePhatty.png" 
            value="0" min="-20" max="20" step="0.1" diameter="60"  tooltip="Band 1000Hz">
        </webaudio-knob>
     
      
        <webaudio-knob 
          id="eq-in-5" 
          src="./assets/imgs/LittlePhatty.png" 
          value="0" min="-20" max="20" step="0.1" diameter="60"  tooltip="Band 3500Hz">
        </webaudio-knob>
    
        <webaudio-knob 
          id="eq-in-5" 
          src="./assets/imgs/LittlePhatty.png" 
          value="0" min="-20" max="20" step="0.1" diameter="60"  tooltip="Band 10000Hz">
        </webaudio-knob>
    </div>
    </div>
`

export default template


// <label class="switch">
// <input type="checkbox">
// <span class="slider round"></span>
// </label><br>