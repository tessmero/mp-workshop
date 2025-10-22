'use client';

import React from "react";
import './music-player.css'; // Import the CSS file

interface IProps {} // eslint-disable-line @typescript-eslint/no-empty-object-type

interface IState {
  volume: number;
}

export class MusicPlayer extends React.Component<IProps,IState> {

  selectedSongName: string = 'avalanche'
  allSongNames= [
    'avalanche',
    'chess',
    'fight-cub',
    'orbital-launch',
    'sketch-ball',
    'wheely',
    'boating-school',
    'cube-dance',
    'grove-tender',
    'rail-layer',
    'space-quest',
  ]

  currentOggPlayer: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
  allOggPlayers: Record<string,any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any

    constructor(props: IProps) {
        super(props);
        this.state = {
            volume: .5,
        };
        this.handleSliderChange = this.handleSliderChange.bind(this);
    }


  // called when slider is moved
    handleSliderChange(event: React.ChangeEvent<HTMLInputElement>) {
      const newVolume = parseFloat(event.target.value);
      const safeVolume = Number.isFinite(newVolume) ? newVolume : 0;
      this.setState({ volume: safeVolume }, () => {
        this.updateVolume();
      });
    }

  updateVolume(){
    window.MusicManager().outNode.gain.value = this.state.volume * 5; // set volume for lofi
    if( this.currentOggPlayer ){
      this.currentOggPlayer.volume = this.state.volume
    }
  }
  
  // stop current lofi or ogg song
  stopClicked(){
      window.MusicManager().stopMusic(); // stop lofi
      for( const audio of Object.values(this.allOggPlayers) ){
        audio.pause()
      }
  } 

  playLofiClicked(){
    const songData = window.SONGS[this.selectedSongName]

    for( const audio of Object.values(this.allOggPlayers) ){
      audio.pause()
    }
    window.MusicManager().stopMusic();
    window.MusicManager().startMusicLoop(songData);

    this.updateVolume() 
  }

  
  playOggClicked(){
    const songKey = this.selectedSongName

    window.MusicManager().stopMusic(); // stop lofi
  

    for( const [key,audio] of Object.entries(this.allOggPlayers) ){
      if( key !== songKey ){
        audio.pause()
      }
    }

    if( !this.allOggPlayers[songKey] ) {
      // load song for first time
      this.currentOggPlayer = new Audio(`/oggs/${songKey}.ogg`)
      //oggPlayer.addEventListener('canplaythrough', () => oggPlayer.play());
      this.allOggPlayers[songKey] = this.currentOggPlayer
    } else {
      // song previously loaded
      this.currentOggPlayer = this.allOggPlayers[songKey]
    }


    this.startOggPlayer()
    this.updateVolume() 
  }

  startOggPlayer(){
    // play ogg from beginning ASAP
    const audio = this.currentOggPlayer
    audio.currentTime = 0;
    //audio.load()

    console.log('play A')
    audio.play().then(() => { console.log('playing'); }).catch(() => {
      audio.addEventListener('canplaythrough', () => { 
    console.log('play B')
        audio.play()
      }, { once: true });
    });
  }


    render() {
      return (
        <div id="music-player">
          <span id="song-player-label" className="hidden-on-small-screen">Song Player</span>
          <select
            name="select-song"
            id="select-song"
            value={this.selectedSongName}
            onChange={e => {
              this.selectedSongName = e.target.value;
              this.forceUpdate();
            }}
          >
            <option value='avalanche'>avalanche</option>
            <option value='chess'>chess</option>
            <option value='fight-cub'>fight-cub</option>
            <option value='orbital-launch'>orbital-launch</option>
            <option value='sketch-ball'>sketch-ball</option>
            <option value='wheely'>wheely</option>
            <option value='boating-school'>boating-school</option>
            <option value='cube-dance'>cube-dance</option>
            <option value='grove-tender'>grove-tender</option>
            <option value='rail-layer'>rail-layer</option>
            <option value='space-quest'>space-quest</option>
          </select>

          <button id="play" onClick={() => this.playLofiClicked()}>Play A</button>
          <button id="playOgg" onClick={() => this.playOggClicked()}>Play B</button>
          <button id="stop" onClick={() => this.stopClicked()}>Stop</button>
          
          <input 
            type="range" min="0" max="1" step="0.01" 
            className="slider" id="musicVolumeSlider" 
            value={this.state.volume}
            onChange={this.handleSliderChange}
          />
        </div>
      )
    }
}