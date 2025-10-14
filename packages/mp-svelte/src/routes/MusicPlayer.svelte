
<script>
    import {SONGS, MusicManager} from '/javascript/lofi-music-manager.js?url'
    let volume = .5

  let oggPlayer = null
  const allOggPlayers = {}

  function updateVolume(){
    MusicManager().outNode.gain.value = volume * 5; // set volume for lofi
    if( oggPlayer ){
      oggPlayer.volume = volume
    }
  }

  function playLofiClicked(){
    const selectElement = document.getElementById("select-song");
    const songKey = selectElement.value; 
    const songData = SONGS[songKey]

    for( const audio of Object.values(allOggPlayers) ){
      audio.pause()
    }
    MusicManager().stopMusic();
    MusicManager().startMusicLoop(songData);

    updateVolume() 
  }

  function startOggPlayer(){

    // play ogg from beginning ASAP
    const audio = oggPlayer
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

  function playOggClicked(){
    const selectElement = document.getElementById("select-song");
    const songKey = selectElement.value; 


    MusicManager().stopMusic(); // stop lofi
  

    for( const [key,audio] of Object.entries(allOggPlayers) ){
      if( key !== songKey ){
        audio.pause()
      }
    }

    if( !allOggPlayers[songKey] ) {
      // load song for first time
      oggPlayer = new Audio(`/oggs/${songKey}.ogg`)
      //oggPlayer.addEventListener('canplaythrough', () => oggPlayer.play());
      allOggPlayers[songKey] = oggPlayer
    } else {
      // song previously loaded
      oggPlayer = allOggPlayers[songKey]
    }


    startOggPlayer()
    updateVolume() 
  }

  function stopClicked(){
    
      MusicManager().stopMusic(); // stop lofi
      for( const audio of Object.values(allOggPlayers) ){
        audio.pause()
      }
  }
</script>


<div id="music-player">
  <span id="song-player-label" class="hidden-on-small-screen">Song Player</span>
  <select name="select-song" id="select-song">
    <option value="avalanche">Avalanche</option>
  </select>
  <button id="play" onclick={playLofiClicked}>Play A</button>
  <button id="playOgg" onclick={playOggClicked}>Play B</button>
  <button id="stop" onclick={stopClicked}>Stop</button>
  <input 
    type="range" min="0" max="1" step="0.01" 
    bind:value={volume} oninput={updateVolume}
    class="slider" id="musicVolumeSlider"
    >
</div>

<style> 

  @media (max-width: 600px) {
       .hidden-on-small-screen {
           display: none;
       }
   }
  #music-player {
    position: fixed;
    bottom: 50%;
    left: 0;
    width: 100%;
    background-color: #f0f0f0;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  #music-player > * {
    margin: 0 3px;
  }

  #song-player-label {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: bold;
  }
</style>
