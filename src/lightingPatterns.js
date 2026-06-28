import * as THREE from 'three';

const colorPalette = [
  new THREE.Color(0xff8800), // Orange
  new THREE.Color(0xffff00), // Yellow
  new THREE.Color(0x0088ff), // Blue
  new THREE.Color(0xffffff), // White
  new THREE.Color(0xff0000)  // Red
];

export function updateLightingPatterns(time, pattern, instancedBulbs, bulbCount) {
  if (!instancedBulbs || bulbCount === 0) return;

  const dummyColor = new THREE.Color();
  
  for (let i = 0; i < bulbCount; i++) {
    switch (pattern) {
      case 'chasing':
        // Chasing effect: light moves along the index
        const speed = 10;
        const offset = (i + Math.floor(time * speed)) % 20;
        if (offset < 5) {
          dummyColor.copy(colorPalette[1]); // Yellow
        } else if (offset < 10) {
          dummyColor.copy(colorPalette[2]); // Blue
        } else {
          dummyColor.setHex(0x111111); // Off/Dim
        }
        break;
        
      case 'flashing':
        // Alternating flashes
        const flashRate = 4;
        if (Math.floor(time * flashRate) % 2 === 0) {
          dummyColor.copy(i % 2 === 0 ? colorPalette[0] : colorPalette[2]);
        } else {
          dummyColor.copy(i % 2 === 0 ? colorPalette[2] : colorPalette[0]);
        }
        break;

      case 'fading':
        // Smooth color transitions
        const fadeSpeed = 0.5;
        const colorIndex = Math.floor(time * fadeSpeed) % colorPalette.length;
        const nextColorIndex = (colorIndex + 1) % colorPalette.length;
        const lerpFactor = (time * fadeSpeed) % 1;
        
        dummyColor.copy(colorPalette[colorIndex]).lerp(colorPalette[nextColorIndex], lerpFactor);
        
        // Add some variation per bulb index
        if (i % 3 === 0) {
          dummyColor.lerp(new THREE.Color(0xffffff), 0.2);
        }
        break;

      case 'pulse':
        // Neon pulse based on sine wave and index
        const pulseSpeed = 3;
        const intensity = (Math.sin(time * pulseSpeed + (i % 10) * 0.5) + 1) / 2; // 0 to 1
        dummyColor.setRGB(
          colorPalette[0].r * intensity,
          colorPalette[0].g * intensity,
          colorPalette[0].b * intensity
        );
        // Add neon blue pulse on alternate bulbs
        if (i % 2 !== 0) {
           dummyColor.setRGB(
            colorPalette[2].r * intensity,
            colorPalette[2].g * intensity,
            colorPalette[2].b * intensity
          );
        }
        break;
        
      case 'wave':
        // A wave effect mapping across indices
        const waveSpeed = 2;
        const waveLength = 0.5;
        const wavePos = (i % 20);
        const waveIntensity = (Math.sin(time * waveSpeed - wavePos * waveLength) + 1) / 2;
        
        // Apply color from the palette based on bulb index
        const baseC = colorPalette[i % 5];
        dummyColor.setRGB(
          baseC.r * waveIntensity,
          baseC.g * waveIntensity,
          baseC.b * waveIntensity
        );
        // Add a bright white peak to the wave
        if (waveIntensity > 0.9) {
          dummyColor.setHex(0xffffff);
        }
        break;
        
      default:
        dummyColor.setHex(0xffffff);
    }
    
    instancedBulbs.setColorAt(i, dummyColor);
  }
  
  instancedBulbs.instanceColor.needsUpdate = true;
}
