import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
// Native Node env loader preserves variables already supplied by the shell.
if (existsSync('.env.local')) loadEnvFile('.env.local');
