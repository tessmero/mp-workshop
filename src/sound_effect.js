/**
 * @file SoundEffect
 */
class SoundEffect {
  #duration; // seconds
  #envelope; // volume-over-duration shape

  #minDelay; // if set, may ignore rapid play() calls
  #lastPlayTime;

  #scale; // name or list of freqs to play in sequence within one duration
  #startFreq; // pitch at start of play()
  #endFreq; // pitch at end of duration

  // standard or made up wave "sh"
  #wave;// "sine","square","sawtooth","triangle"

  /**
   *
   * @param {object} params
   * @param {number} params.volume
   * @param {number} params.duration
   * @param {string} params.env Reference to sound envelope data
   * @param {number} params.minDelay
   * @param {number} params.freq
   * @param {number} params.startFreq
   * @param {number} params.endFreq
   * @param {string|number[]} params.scale
   * @param {string} params.wave
   */
  constructor(params = {}) {
    const {

      volume,
      duration,
      env = 'dropEnd', // by default, drop volume in final 0.1 sec

      minDelay,
      freq,
      startFreq,
      endFreq,
      scale,
      wave,
    } = params;

    this.#duration = duration;
    this.#minDelay = minDelay;

    if (scale) {

      if (Array.isArray(scale)) {

        // scale given as array of frequencies
        this.#scale = scale;

      }
      else {

        // given scale like 'A4_majorScale'
        const [rootNote, scaleName] = scale.split('_');
        this.#scale = musicFreqs(rootNote, scaleName);
      }

    }
    else if (freq) {

      // single pitch
      this.#startFreq = freq;
      this.#endFreq = freq;
    }
    else {

      // gradual pitch change
      this.#startFreq = startFreq;
      this.#endFreq = endFreq;
    }

    this.#wave = wave;
    this.#envelope = new SoundEnvelope({ volume, duration, env });
  }

  /**
   * used in default_tool.js to change scale each click
   * @param {string} rootNote
   * @param {string} scaleName
   */
  setScale(rootNote, scaleName) {
    this.#scale = musicFreqs(rootNote, scaleName);
  }

  /**
   * Schedule sound effect to play at precise time, used for music.
   * @param  {number} time The audio context time in the near future
   */
  schedulePlay(time) {
    this.play(null, time);
  }

  /**
   *
   * @param {Vector|number[]} position The position on screen producing sound.
   * @param {number} t The scheduled play time only used for schedulePlay()
   */
  play(position, t = null) {

    const mgr = MusicManager()
    const ac = mgr._ac

    if (ac.state === 'suspended') {
      ac.resume();
    }

    const time = t ? t : ac.currentTime;

    if (!time) { return; }

    const outNode = mgr.outNode;
    //const outNode = ac.destination;

    // check if this is being called to rapidly
    if (this.#minDelay) {
      if (this.#lastPlayTime) {
        const dt = time - this.#lastPlayTime;
        if (dt < this.#minDelay) {

          // too rapid
          return;
        }
      }
      this.#lastPlayTime = time;
    }

    // choose a new pitch if necessary
    // this._updateFreq();

    const startTime = time;
    const endTime = startTime + this.#duration;

    const osc = ac.createOscillator();

    // check for made up wave type
    if (this.#wave === 'sh') {

      // Generate "sh" sound using white noise
      this._playShSound(ac, outNode, startTime, endTime);

    }
    else {

      osc.type = this.#wave;

      // set pitch ramp
      if (this.#scale) {
        this.#scale.forEach((freq, i) => {
          const freqTime = startTime + i * this.#duration / (this.#scale.length + 2);
          osc.frequency.setValueAtTime(freq, freqTime);
        });
      }
      else {
        osc.frequency.setValueAtTime(this.#startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(this.#endFreq, endTime);
      }

      // let envelope set volume ramp
      const gainNode = ac.createGain();
      this.#envelope.applyEnvelope(gainNode, startTime);

      // compute left/right balance
      // const pan = position ? this._computePan(position) : 0;
      // const panNode = ac.createStereoPanner();
      // panNode.pan.value = pan;

      osc.connect(gainNode);

      // gainNode.connect(panNode);
      // panNode.connect(outNode);
      gainNode.connect(outNode);
      osc.start(startTime);
      osc.stop(endTime);
    }
  }

  /**
   * Play the "sh" sound effect using white noise.
   * @param {object} ac
   * @param {object} outNode
   * @param {number} startTime
   * @param {number} endTime
   */
  _playShSound(ac, outNode, startTime, endTime) {
    const sampleRate = ac.sampleRate;
    const bufferSize = sampleRate * this.#duration;

    // Create an AudioBuffer with white noise
    const buffer = ac.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Fill the buffer with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // Random values between -1 and 1
    }

    // Create a buffer source
    const source = ac.createBufferSource();
    source.buffer = buffer;

    // Create a low-pass filter to shape the noise
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(this.#startFreq * 10, startTime);
    filter.frequency.linearRampToValueAtTime(this.#endFreq * 10, endTime);

    // Create a gain node for volume control
    const gainNode = ac.createGain();
    this.#envelope.applyEnvelope(gainNode, startTime);

    // Connect the nodes
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(outNode);

    // Start and stop the sound
    source.start(startTime);
    source.stop(endTime);
  }
}
