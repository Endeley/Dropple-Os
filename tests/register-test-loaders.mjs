import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./bench/alias-loader.mjs', pathToFileURL('./'));
register('./tests/loaders/ts-test-loader.mjs', pathToFileURL('./'));
