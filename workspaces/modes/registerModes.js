import { ModeRegistry } from './ModeRegistry';
import { DesignMode } from './designMode';
import { EducationMode } from './educationMode';
import { PodcastMode } from './podcastMode';
import { ReviewMode } from './reviewMode';
import { VideoMode } from './videoMode';
import { WriterMode } from './writerMode';

export function registerModes() {
  ModeRegistry.register(DesignMode);
  ModeRegistry.register(EducationMode);
  ModeRegistry.register(PodcastMode);
  ModeRegistry.register(ReviewMode);
  ModeRegistry.register(VideoMode);
  ModeRegistry.register(WriterMode);
}

registerModes();
