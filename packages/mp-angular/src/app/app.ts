import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MusicPlayer } from './music-player/music-player';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MusicPlayer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('mp-angular');
}
