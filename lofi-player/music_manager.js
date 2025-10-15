/**
 * @file music manager
 * 
 * Singleton that manages lofi song playback.
 */
function MusicManager() {
  if (MusicManager._instance) {
    return MusicManager._instance;
  }
  if (!(this instanceof MusicManager)) {
    return new MusicManager();
  }
  MusicManager._instance = this;

  // start MusicManager constructor
  setInterval(() => this._loop(), 15); // millisecs
  this._step = 100 / 1000; // seconds, must be greater than interval
  this._lookAhead = this._step;
  this._lastSnData = { measure: 0, beat: 0 }; // returned from most recent call to ScheduleNotes
  this._ac = new AudioContext()

  // Create a gain node to control volume
  const gainNode = this._ac.createGain();
  gainNode.gain.value = 0.5; // Initial volume (0 to 1)
  gainNode.connect(this._ac.destination);
  this.outNode = gainNode

  /**
   * @param {number} time
   * @param {number} dur
   */
  this.mainMusicLoop = function(time, dur) {
    this._lastSnData = this._songScheduler(time, 1.5 * dur);

    if (this._lastSnData.finished) {
      this._playing = false;
    }
  };

  this.isPlaying = function() {
    return this._playing && (this._ac.state !== 'suspended');
  };

  this.getPlayingBeatIndex = function() {
    if (this._playing) {
      return this._lastSnData;
    }
    return null;
  };

  this.getBeatInMeasure = function(voiceIndex) {
    if (!this._playing) {
      return -1;
    }
    if (!this._lastSnData.beatInMeasure) {
      return -1;
    }
    return this._lastSnData.beatInMeasure[voiceIndex];
  };

  this.stopMusic = function() {
    this._playing = false;
    this._ac.close()
    MusicManager._instance = null;
  };

  this.setSong = function(songData) {
    if (this._playing && this._currentSongTitleKey === songData.titleKey) {
      return; // already playing given song
    }
    this.startMusicLoop(songData);
  };

  /**
   *
   * @param {object} songData
   * @param {number} skipTime
   */
  this.startMusicLoop = function(songData = null, skipTime = 0) {
    const data = songData || DANCE_SONG;
    this.songData = data;

    this._currentSongTitleKey = data.titleKey;
    this._lastMusicLoop = this._ac.currentTime;
    this._songStartTime = this._ac.currentTime - skipTime;
    this._songScheduler = SongParser.getScheduler(data, this._songStartTime);

    this._ac.resume();
    this._playing = true;
  };

  /**
   * underlying loop function that gets called periodically
   * even if music is not playing
   */
  this._loop = function() {
    if (this._playing) {
      const diff = this._ac.currentTime - this._lastMusicLoop;
      if (diff >= this._lookAhead) {
        const nextNote = this._lastMusicLoop + this._step;
        this.mainMusicLoop(nextNote, this._step);
        this._lastMusicLoop = nextNote;
      }
    }
  };
}

