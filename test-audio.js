// Test the audio engine functionality
const path = require('path');
const fs = require('fs');

// First, check if the compiled audio.js exists
const audioJsPath = path.join(__dirname, 'src/lib/audio.js');
const audioTsPath = path.join(__dirname, 'src/lib/audio.ts');

console.log('Checking for audio files...');

if (fs.existsSync(audioJsPath)) {
  console.log('Found audio.js (compiled)');
  const audioModule = require(audioJsPath);
  const audio = audioModule.audio;
  
  // Run tests
  console.log('\nTesting AudioEngine...');
  console.log('1. Initial muted state:', audio.isMuted);
  
  audio.toggle();
  console.log('3. After toggle:', audio.isMuted);
  audio.toggle();
  console.log('4. After second toggle:', audio.isMuted);
  
  audio.setMuted(true);
  console.log('5. After setMuted(true):', audio.isMuted);
  audio.setMuted(false);
  console.log('6. After setMuted(false):', audio.isMuted);
  
  // Check song.mp3
  const songPath = path.join(__dirname, 'song.mp3');
  if (fs.existsSync(songPath)) {
    const stats = fs.statSync(songPath);
    console.log('7. Song file exists:', songPath);
    console.log('8. Song file size:', Math.round(stats.size / 1024), 'KB');
  }
  
  console.log('\nAll tests completed!');
} else {
  console.log('audio.js not found, looking for audio.ts instead');
  console.log('Audio engine source file exists:', fs.existsSync(audioTsPath));
  console.log('\nNote: The audio engine needs to be compiled to .js first');
  console.log('Or you need to run: npm run build');
}