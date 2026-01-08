import { ModeRegistry } from './ModeRegistry';
import { DesignMode } from './designMode';
import { PodcastMode } from './podcastMode';
import { VideoMode } from './videoMode';
import { WriterMode } from './writerMode';

export function registerModes() {
  ModeRegistry.register(DesignMode);
  ModeRegistry.register(PodcastMode);
  ModeRegistry.register(VideoMode);
  ModeRegistry.register(WriterMode);
}

registerModes();
