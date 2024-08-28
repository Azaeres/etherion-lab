// src/sounds-control.ts
export class SoundsControl {
  private context: AudioContext
  private sources: { [key: string]: AudioBufferSourceNode } = {}
  private buffers: { [key: string]: AudioBuffer } = {}
  private isPlaying: { [key: string]: boolean } = {}
  private isLooping: { [key: string]: boolean } = {}
  private startTime: { [key: string]: number } = {}
  private pausedTime: { [key: string]: number } = {}
  private currentlyPlaying: string | null = null
  private gainNode: GainNode
  private effectGainNode: GainNode
  private playbackRates: { [key: string]: number } = {}
  private timers: { [key: string]: NodeJS.Timeout | null } = {}

  constructor() {
    this.context = new window.AudioContext({
      latencyHint: 'interactive',
      sampleRate: 48000,
    })
    this.gainNode = this.context.createGain()
    this.gainNode.connect(this.context.destination)
    this.effectGainNode = this.context.createGain()
    this.effectGainNode.connect(this.context.destination)
  }

  async loadSound(url: string, id: string): Promise<void> {
    if (!this.buffers[id]) {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer)
      this.buffers[id] = audioBuffer
    }
  }

  isSoundLoaded(id: string): boolean {
    return !!this.buffers[id]
  }

  isSoundPlaying(id: string): boolean {
    return !!this.isPlaying[id]
  }

  async play(id: string, startTime: number = 0): Promise<void> {
    if (!this.isSoundLoaded(id)) {
      throw new Error(`Sound ${id} not loaded`)
    }
    this.stop(id)
    const source = this.context.createBufferSource()
    source.buffer = this.buffers[id] ?? null
    source.connect(this.gainNode)
    source.loop = this.isLooping[id] || false
    source.playbackRate.value = this.playbackRates[id] || 1
    source.start(0, startTime)
    this.sources[id] = source
    this.isPlaying[id] = true
    this.startTime[id] = this.context.currentTime - startTime
    this.currentlyPlaying = id

    source.onended = () => {
      this.isPlaying[id] = false
    }

    this.context.onstatechange = (...rest) => {
      console.log('context.onstatechange  > this.context.state:', this.context.state, rest)
      if (this.context.state === 'suspended') {
        this.context.resume().then(() => this.play(id, this.pausedTime[id]))
      }
    }
  }

  async playEffect(id: string): Promise<void> {
    if (!this.isSoundLoaded(id)) {
      throw new Error(`Sound ${id} not loaded`)
    }
    const source = this.context.createBufferSource()
    source.buffer = this.buffers[id] ?? null
    source.connect(this.effectGainNode)
    source.playbackRate.value = this.playbackRates[id] || 1
    source.start(0)
  }

  stop(id: string): void {
    if (this.sources[id]) {
      clearTimeout(this.timers[id]!)
      this.timers[id] = null
      this.pausedTime[id] = this.context.currentTime - this.startTime[id]!
      this.sources[id].stop(0)
      this.sources[id].disconnect()
      delete this.sources[id]
      this.isPlaying[id] = false
      if (this.currentlyPlaying === id) {
        this.currentlyPlaying = null
      }
    }
  }

  fadeOut(id: string, duration: number = 1): void {
    if (this.sources[id]) {
      const startTime = this.context.currentTime
      const endTime = startTime + duration

      this.gainNode.gain.setValueAtTime(1.0, startTime)
      this.gainNode.gain.linearRampToValueAtTime(0.0, endTime)

      // Stop the audio source after the fade-out duration.
      this.gainNode.gain.setValueAtTime(1.0, endTime)
      this.sources[id].stop(endTime)

      this.timers[id] = setTimeout(() => {
        if (this.sources[id]) {
          this.gainNode.gain.setValueAtTime(1.0, endTime)
          this.stop(id)
        }
      }, duration * 1000) // Convert duration to milliseconds
    }
  }

  loop(id: string, startTime: number = 0): void {
    this.isLooping[id] = true
    this.play(id, startTime)
  }

  setVolume(volume: number): void {
    if (volume < 0) {
      volume = 0
    } else if (volume > 1) {
      volume = 1
    }
    this.gainNode.gain.setValueAtTime(volume, this.context.currentTime)
  }

  setEffectVolume(volume: number): void {
    if (volume < 0) {
      volume = 0
    } else if (volume > 1) {
      volume = 1
    }
    this.effectGainNode.gain.setValueAtTime(volume, this.context.currentTime)
  }

  setPlaybackRate(id: string, rate: number): void {
    if (this.sources[id]) {
      this.sources[id].playbackRate.value = rate
    }
    this.playbackRates[id] = rate
  }

  setGlobalPlaybackRate(rate: number): void {
    Object.keys(this.sources).forEach((id) => {
      this.setPlaybackRate(id, rate)
    })
  }

  faster(id: string, rate: number = 1.5): void {
    this.setPlaybackRate(id, rate)
  }

  slow(id: string, rate: number = 0.75): void {
    this.setPlaybackRate(id, rate)
  }

  fasterEffect(id: string, rate: number = 1.5): void {
    this.setPlaybackRate(id, rate)
  }

  slowEffect(id: string, rate: number = 0.75): void {
    this.setPlaybackRate(id, rate)
  }

  pauseAll(): void {
    Object.keys(this.sources).forEach((id) => {
      if (this.sources[id]) {
        this.pausedTime[id] = this.context.currentTime - this.startTime[id]!
        this.sources[id].stop(0)
        this.isPlaying[id] = false
      }
    })
  }

  resumeAll(): void {
    if (this.currentlyPlaying && this.pausedTime[this.currentlyPlaying] !== undefined) {
      this.play(this.currentlyPlaying, this.pausedTime[this.currentlyPlaying])
    }
  }
}
