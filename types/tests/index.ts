import { initClient } from 'messagebird';

// $ExpectType MessageBird
initClient('<AccessKey>');

// $ExpectType MessageBird
initClient('<AccessKey>', 42);
