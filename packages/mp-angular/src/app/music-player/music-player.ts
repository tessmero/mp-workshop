import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-music-player',
  imports: [CommonModule,FormsModule],
  templateUrl: './music-player.html',
  styleUrl: './music-player.css'
})


export class MusicPlayer {

  volume:number = .5
  selectedSongName: string = 'avalanche'
  allSongNames= [
      'avalanche',
      'blavalance',
  ]

  currentOggPlayer: any = null
  allOggPlayers: Record<string,any> = {}

  // called when slider is moved
  updateVolume(){
    MusicManager().outNode.gain.value = this.volume * 5; // set volume for lofi
    if( this.currentOggPlayer ){
      this.currentOggPlayer.volume = this.volume
    }
  }
  
  // stop current lofi or ogg song
  stopClicked(){
      MusicManager().stopMusic(); // stop lofi
      for( const audio of Object.values(this.allOggPlayers) ){
        audio.pause()
      }
  } 

  playLofiClicked(){
    const songData = SONGS[this.selectedSongName]

    for( const audio of Object.values(this.allOggPlayers) ){
      audio.pause()
    }
    MusicManager().stopMusic();
    MusicManager().startMusicLoop(songData);

    this.updateVolume() 
  }

  
  playOggClicked(){
    const songKey = this.selectedSongName

    MusicManager().stopMusic(); // stop lofi
  

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

}
