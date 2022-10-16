// export { default as AudioPlayer } from './components/AudioPlayer/index.js'

import template from './components/template.js'
import '../lib/webaudio-controls.js'

let ctx = window.AudioContext || window.webkitAudioContext

export default class AudioLector extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(template.content.cloneNode(true))

        this.equalizerFrequencies = [60, 170, 350, 1000, 3500, 10000]
        this.filters = []
        this.fftSizeWaveForm = 1024
        this.fftSizeFrequencies = 64

        this.init().then(async () => {
            await this.initDraw()
        })
    }

    init = async () => {
        this.initAudioNodes()
        this.initQuerySelectors()
        this.initAttribute().then(() => {
            this.audioPlayer.src = this.srcAttribute
        })

        try {
            this.connectAudioNodes().then(() => {
            })
        } catch (e) {
            console.log('error audio node')
        }
        this.shadowRoot.querySelector('#title').innerHTML = this.titleAttribute
        this.initEventListener()
    }

    connectAudioNodes = async () => {
        let gainAudioPlayerSource = this.audioContext.createMediaElementSource(
            this.audioPlayer
        )

        gainAudioPlayerSource.connect(this.filters[0])

        for (let i = 0; i < this.filters.length - 1; i++) {
            this.filters[i].connect(this.filters[i + 1])
        }

        this.filters[this.filters.length - 1].connect(this.panNode)

        this.panNode.connect(this.gainNode)
        this.gainNode.connect(this.dest)

        //connect to visualizeer
        this.gainNode.connect(this.analyserWaveForm)
        this.gainNode.connect(this.analyserFrequencies)
    }

    initAudioNodes = () => {
        this.audioContext = new ctx()
        this.dest = this.audioContext.destination

        this.gainNode = this.audioContext.createGain()
        this.panNode = this.audioContext.createStereoPanner()

        //waveForm
        this.analyserWaveForm = this.audioContext.createAnalyser()
        this.analyserWaveForm.fftSize = this.fftSizeWaveForm
        this.analyserWaveForm.bufferLength = this.analyserWaveForm.frequencyBinCount
        this.analyserWaveForm.dataArray = new Uint8Array(
            this.analyserWaveForm.bufferLength
        )

        //frequenciesVisualization
        this.analyserFrequencies = this.audioContext.createAnalyser()
        this.analyserFrequencies.fftSize = this.fftSizeFrequencies
        this.analyserFrequencies.bufferLength = this.analyserFrequencies.frequencyBinCount
        this.analyserFrequencies.dataArray = new Uint8Array(
            this.analyserFrequencies.bufferLength
        )

        this.initEqualizer()
    }

    initQuerySelectors = () => {
        this.audioPlayer = this.shadowRoot.querySelector('.audio-element')
        this.gainSlider = this.shadowRoot.querySelector('#gain')
        this.stereoPanner = this.shadowRoot.querySelector('#panner')
        this.equalizerInputs = this.shadowRoot.querySelectorAll('[id^=eq-in-]')
        this.equalizerValues = this.shadowRoot.querySelectorAll('#eq-value')
        this.switchDrawInput = this.shadowRoot.querySelector('.switch')
        this.gainValue = this.shadowRoot.querySelector('#gain-value')
        this.button = {
            play: this.shadowRoot.querySelector('#play'),
            pause: this.shadowRoot.querySelector('#pause'),
            backward: this.shadowRoot.querySelector('#backward'),
            forward: this.shadowRoot.querySelector('#forward'),
            stop: this.shadowRoot.querySelector('#stop'),
        }
        this.innerTitle = this.shadowRoot.querySelector('#title')
        this.canvasWaveForm = this.shadowRoot.querySelector('#wave-form')
        this.canvasFrequencies = this.shadowRoot.querySelector(
            '#frequencies-visualization'
        )
    }

    initEventListener = () => {
        this.gainSlider.oninput = (e) => {
            this.gainNode.gain.value = e.target.value
            this.gainValue.innerHTML = e.target.value
        }

        this.button.backward.addEventListener('click', this.goBackward)
        this.button.forward.addEventListener('click', this.gorForward)

        this.stereoPanner.oninput = (e) => {
            this.panNode.pan.setValueAtTime(
                e.target.value,
                this.audioContext.currentTime
            )
        }

        this.button.play.addEventListener('click', this.play)
        this.button.pause.addEventListener('click', this.pause)
        this.button.stop.addEventListener('click', this.stop)

        this.equalizerInputs.forEach((e, i) => {
            e.oninput = (e) => {
                this.filters[i].gain.value = e.target.value
                this.equalizerValues[i].innerHTML = e.target.value
            }
        })



        this.audioPlayer.onplay = () => {
            this.audioContext.resume()
        }
    }

    initAttribute = async () => {
        this.srcAttribute = this.getAttribute('src')
        this.titleAttribute = this.innerHTML
    }

    initEqualizer = () => {
        this.equalizerFrequencies.forEach((freq) => {
            const eq = this.audioContext.createBiquadFilter()
            eq.frequency.value = freq
            eq.type = 'peaking'
            eq.gain.value = 0
            this.filters.push(eq)
        })
    }

    drawWaveForm = () => {
        let width = this.canvasWaveForm.width
        let height = this.canvasWaveForm.height
        let canvasContext = this.canvasWaveForm.getContext('2d')

        canvasContext.fillStyle = 'rgba(0, 0, 0, 0.5)'
        canvasContext.fillRect(0, 0, width, height)

        this.analyserWaveForm.getByteTimeDomainData(
            this.analyserWaveForm.dataArray
        )

        canvasContext.lineWidth = 2
        canvasContext.strokeStyle = 'black'

        canvasContext.beginPath()

        let sliceWidth = width / this.analyserWaveForm.bufferLength
        let x = 0

        for (let i = 0; i < this.analyserWaveForm.bufferLength; i++) {
            // dataArray values are between 0 and 255,
            // normalize v, now between 0 and 1
            let v = this.analyserWaveForm.dataArray[i] / 255
            // y will be in [0, canvas height], in pixels
            let y = v * height

            if (i === 0) {
                canvasContext.moveTo(x, y)
            } else {
                canvasContext.lineTo(x, y)
            }

            x += sliceWidth
        }

        canvasContext.lineTo(
            this.canvasWaveForm.width,
            this.canvasWaveForm.height / 2
        )

        canvasContext.stroke()

        requestAnimationFrame(this.drawWaveForm)
    }

    drawFrequencies = () => {
        let width = this.canvasFrequencies.width
        let height = this.canvasFrequencies.height
        let canvasContext = this.canvasFrequencies.getContext('2d')

        // clear  canvas
        canvasContext.clearRect(0, 0, width, height)
        // Get analyser data
        this.analyserFrequencies.getByteFrequencyData(
            this.analyserFrequencies.dataArray
        )

        let barWidth = width / this.analyserFrequencies.bufferLength
        let barHeight
        let x = 0

        let heightScale = height / 128
        for (let i = 0; i < this.analyserFrequencies.bufferLength; i++) {
            barHeight = this.analyserFrequencies.dataArray[i]
            canvasContext.fillStyle = 'rgb(' + (barHeight + 100) + ',190,150)'
            barHeight *= heightScale
            canvasContext.fillRect(
                x,
                height - barHeight / 2,
                barWidth,
                barHeight / 2
            )

            x += barWidth + 2
        }
        //  the visualize function a 60 frames/s
        requestAnimationFrame(this.drawFrequencies)
    }

    play = () => {
        this.audioPlayer.play()
        this.audioContext.resume()
    }

    pause = () => {
        this.audioPlayer.pause()
    }

    initDraw = async () => {
        requestAnimationFrame(this.drawWaveForm)
        requestAnimationFrame(this.drawFrequencies)
    }

    gorForward = () => {
        this.audioPlayer.currentTime += 10
    }

    goBackward = () => {
        this.audioPlayer.currentTime -= 10
    }

    stop = () => {
        this.audioPlayer.pause()
        this.audioPlayer.currentTime = 0
    }

    
}

customElements.define('audio-lector', AudioLector)


