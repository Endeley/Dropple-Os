import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./bench/alias-loader.mjs', pathToFileURL('./'));
