import * as THREE from 'three';

export function setupInteractions(camera, scene, thoranaState) {
  
  // UI Buttons
  const btnChasing = document.getElementById('btn-chasing');
  const btnFlashing = document.getElementById('btn-flashing');
  const btnFading = document.getElementById('btn-fading');
  const btnPulse = document.getElementById('btn-pulse');
  const btnWave = document.getElementById('btn-wave');
  const buttons = [btnChasing, btnFlashing, btnFading, btnPulse, btnWave];

  const setPatternUI = (index) => {
    buttons.forEach(btn => btn.classList.remove('active'));
    if (buttons[index]) buttons[index].classList.add('active');
  };

  btnChasing.addEventListener('click', () => { thoranaState.currentPatternIndex = 0; setPatternUI(0); });
  btnFlashing.addEventListener('click', () => { thoranaState.currentPatternIndex = 1; setPatternUI(1); });
  btnFading.addEventListener('click', () => { thoranaState.currentPatternIndex = 2; setPatternUI(2); });
  btnPulse.addEventListener('click', () => { thoranaState.currentPatternIndex = 3; setPatternUI(3); });
  btnWave.addEventListener('click', () => { thoranaState.currentPatternIndex = 4; setPatternUI(4); });

  // Audio Control (YouTube Iframe API)
  const btnAudio = document.getElementById('btn-audio');
  const iconPlay = btnAudio.querySelector('.icon-play');
  const iconPause = btnAudio.querySelector('.icon-pause');
  let isPlaying = false;
  let ytPlayer;

  // This function is called automatically when YouTube API is ready
  window.onYouTubeIframeAPIReady = () => {
    ytPlayer = new window.YT.Player('yt-player', {
      height: '0',
      width: '0',
      videoId: 'tpjwm-Ozl10', // The Bakthi Geetha Video ID
      playerVars: {
        'autoplay': 1,
        'controls': 0,
        'loop': 1,
        'playlist': 'tpjwm-Ozl10' // Needed for loop to work
      },
      events: {
        'onReady': () => {
          // Attempt autoplay
          ytPlayer.playVideo();
          isPlaying = true;
          iconPlay.style.display = 'none';
          iconPause.style.display = 'block';

          // Enable button once player is ready
          btnAudio.addEventListener('click', () => {
            if (isPlaying) {
              ytPlayer.pauseVideo();
              iconPlay.style.display = 'block';
              iconPause.style.display = 'none';
            } else {
              ytPlayer.playVideo();
              iconPlay.style.display = 'none';
              iconPause.style.display = 'block';
            }
            isPlaying = !isPlaying;
          });

          // Volume control
          const volumeSlider = document.getElementById('volume-slider');
          volumeSlider.addEventListener('input', (e) => {
            if (ytPlayer && ytPlayer.setVolume) {
              ytPlayer.setVolume(e.target.value);
            }
          });
        }
      }
    });
  };

  // Developer Notice Modal
  const devModal = document.getElementById('dev-modal');
  const btnOpenDev = document.getElementById('btn-open-dev');
  const btnCloseDev = document.getElementById('btn-close-dev');

  btnOpenDev.addEventListener('click', () => {
    devModal.classList.remove('hidden');
  });

  btnCloseDev.addEventListener('click', () => {
    devModal.classList.add('hidden');
  });

  // Load YouTube API script dynamically
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Modal Control
  const storyModal = document.getElementById('story-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const imageModal = document.getElementById('image-modal');
  const btnCloseImageModal = document.getElementById('btn-close-image-modal');
  const fullImage = document.getElementById('full-image');

  // Start with rotation paused since the story modal is shown on load
  thoranaState.isPaused = true;
  
  btnCloseModal.addEventListener('click', () => {
    storyModal.classList.add('hidden');
    thoranaState.isPaused = false;
  });

  btnCloseImageModal.addEventListener('click', () => {
    imageModal.classList.add('hidden');
    thoranaState.isPaused = false;
  });

  // Raycaster for Thorana clicks
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (event) => {
    // Ignore UI clicks
    if (event.target.closest('#ui-container') || event.target.closest('.modal-content')) return;

    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      // Find the first intersected object that is a panel
      const hit = intersects.find(intersect => intersect.object.userData && intersect.object.userData.isPanel);
      
      if (hit) {
        if (hit.object.userData.imgUrl) {
          // Open image modal
          fullImage.src = hit.object.userData.imgUrl;
          imageModal.classList.remove('hidden');
        } else {
          // Open story modal
          storyModal.classList.remove('hidden');
        }
        thoranaState.isPaused = true;
      }
    }
  });

  return {
    updateUIPattern: setPatternUI
  };
}
