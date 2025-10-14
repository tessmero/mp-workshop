/**
 * @file SongParser object that parses song data
 * schedule sounds precisely as a part of the main music loop
 */

var musicScoreVolume = 1

class SongParser {

  /**
   * Get a function that takes (time,duration) in near future
   * and schedules the corresponding notes for playback.
   * @param  {object} songData The object in data/songs
   * @param  {number} startTime The time to play the first note.
   * @returns {Function} The scheduler that will play the song.
   */
  static getScheduler(songData, startTime) {
    const parser = new SongParser(songData, startTime);
    return (t, dur) => parser.scheduleNotes(t, dur);
  }

  #songData;
  #startTime;
  #endTime;

  #beatIndex = 0; // progress through song
  #measureIndex = 0;

  // used to highlight notes in interface
  #beatInMeasureByVoice = {};

  // copy of score where notes get erased after scheduling
  #editScore;

  // global music volume envelope
  #scoreEnv;

  /**
   *
   * @param {object} songData
   * @param {number} startTime
   */
  constructor(songData, startTime) {
    this.#songData = songData;
    this.#startTime = startTime;

    // compute total duration of song based on first voice
    let nBeats = 0;
    songData.score.forEach((group) => { nBeats = nBeats + group[0].length; });
    const songDur = songData.voices[0].duration * nBeats;
    this.#endTime = songDur;

    //
    this.#editScore = JSON.parse(JSON.stringify(songData.score));
  }

  /**
   *
   */
  _oncePerBeatCheck(time) {

    // check if in score volume envelope
    if (this.#scoreEnv) {
      const { start: t0, end: t1 } = this.#scoreEnv;
      const r = (t1 - time) / (t1 - t0);
      musicScoreVolume = r;
    }
    else {
      musicScoreVolume = 1;
    }
  }

  /**
   *
   * @param {number} measureIndex
   */
  _oncePerMeasureCheck(measureIndex, time) {

    const { voices } = this.#songData;
    const score = this.#editScore;

    // check if score volume envelope started
    // check if measure has extra array element with params
    if (score[measureIndex].length > voices.length) {
      const { start } = score[measureIndex][voices.length];
      if (start) {
        this.#scoreEnv = {
          start: time,
          end: this.#endTime,
        };
      }
    }
  }

  /**
   * @param {number} t
   * @param {number} dur
   */
  scheduleNotes(t, dur) {

    const time = t - this.#startTime;
    if (time > this.#endTime) {
      return { finished: true }; // indicate song ended (music_manager.js)
    }

    const {
      voices, // score,
    } = this.#songData;
    const score = this.#editScore;

    voices.forEach((voice, voiceIndex) => {

      // find beat index
      const beatDur = voice.duration;
      const beatIndex = Math.floor(time / beatDur);
      const nextIndex = Math.floor((time + dur) / beatDur);
      if (beatIndex === nextIndex) {

        // the given time interval
        // doesn't cross over beat
        return;
      }
      this.#beatIndex = beatIndex;

      // check this beat in the score
      const { measureIndex, scoreVal, beatInMeasure } = this._getScoreVal(score, voiceIndex, beatIndex - 1);
      this.#beatInMeasureByVoice[voiceIndex] = beatInMeasure;
      this.#measureIndex = measureIndex;

      // once-per-measure check...
      if (voiceIndex === 0 && beatInMeasure === 0) {
        this._oncePerMeasureCheck(measureIndex, time);
      }

      // once per beat check...
      if (voiceIndex === 0) {
        this._oncePerBeatCheck(time);
      }

      if (typeof(scoreVal) !== 'number') {

        // no notes starting on this beat
        return;
      }

      // frequency to play
      const freq = _namedNotes[SongParser.getNoteName(voice, scoreVal)];
      if (typeof(freq) !== 'number') {

        // no valid frequency
        return;
      }

      // check if note should be sustained longer than one beat
      let duration = voice.duration;
      let i = beatIndex;
      while (this._getScoreVal(score, voiceIndex, i).scoreVal === 'sustain') {
        duration = duration + voice.duration;
        i++;
      }

      // precise audio context time to schedule note
      const beatTime = this.#startTime + beatDur * beatIndex;

      // schedule note to play
      if (voice.endFreq) {

        new SoundEffect({
          ...voice,
          duration,
        }).schedulePlay(beatTime + 0.2);
      }
      else {
        new SoundEffect({
          ...voice,
          freq,
          duration,
        }).schedulePlay(beatTime + 0.2);
      }

      // prevent note from being scheduled again
      score[measureIndex][voiceIndex][beatInMeasure] = 'rest';
    });

    return {
      measure: this.#measureIndex,
      beat: this.#beatIndex,
      finished: false,
      beatInMeasure: voices.map(
        (_voice, voiceIndex) => this._getBeatInMeasure(voiceIndex)),
    };
  }

  /**
   *
   * @param {object} voice The voice parameters
   * @param {string|number} scoreVal The value in score
   */
  static getNoteName(voice, scoreVal) {
    const noteIndex = scoreVal + Object.keys(_namedNotes).indexOf(voice.freq);
    return Object.keys(_namedNotes)[noteIndex];
  }

  /**
   *
   * @param {object} score The score sequence from song data
   * @param {number} voiceIndex
   * @param {number} beatIndex
   */
  _getScoreVal(score, voiceIndex, beatIndex) {
    let i = 0;
    let measureIndex = 0;
    for (const measure of score) {
      const nbeats = measure[voiceIndex].length;
      if (i + nbeats <= beatIndex) {
        i = i + nbeats;
      }
      else {
        return {
          measureIndex,
          beatInMeasure: beatIndex - i,
          scoreVal: measure[voiceIndex][beatIndex - i],
        };
      }
      measureIndex++;
    }
    return {};
  }

  /**
   * Used to highlight notes in sequencer interface
   * @param {number} voiceIndex
   */
  _getBeatInMeasure(voiceIndex) {
    if (Object.hasOwn(this.#beatInMeasureByVoice, voiceIndex)) {
      return this.#beatInMeasureByVoice[voiceIndex];
    }
    return -1;
  }
}
