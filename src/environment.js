import * as THREE from 'three';

export function createEnvironment(scene) {
  // 1. Soft Fog
  scene.fog = new THREE.FogExp2(0x020208, 0.008); // Reduced fog density to see temple better

  // 2. Mihintale Temple Complex
  const mihintaleGroup = new THREE.Group();
  
  // --- Materials ---
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x111620, flatShading: true });
  // Add slight emissive so the white structure is never completely dark
  const whiteMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.7, 
    metalness: 0.1,
    emissive: 0x111111 
  });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 });
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x3d2314 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x0f3b18 });

  // --- 1. The Main Rock / Mountain ---
  const mountainGeo = new THREE.CylinderGeometry(40, 70, 30, 16);
  // Add some randomness to vertices to make it look like a rock
  const posAttribute = mountainGeo.attributes.position;
  for (let i = 0; i < posAttribute.count; i++) {
    if (posAttribute.getY(i) < 15 && posAttribute.getY(i) > -15) {
      posAttribute.setX(i, posAttribute.getX(i) + (Math.random() * 5 - 2.5));
      posAttribute.setZ(i, posAttribute.getZ(i) + (Math.random() * 5 - 2.5));
    }
  }
  mountainGeo.computeVertexNormals();
  const mountain = new THREE.Mesh(mountainGeo, rockMat);
  mountain.position.y = -15;
  mihintaleGroup.add(mountain);

  // --- Buddha Background Image ---
  const textureLoader = new THREE.TextureLoader();
  // Expecting the user to place their image as public/buddha.webp
  const buddhaTexture = textureLoader.load('/buddha.webp'); 
  buddhaTexture.colorSpace = THREE.SRGBColorSpace;
  const buddhaMat = new THREE.MeshBasicMaterial({ 
    map: buddhaTexture,
    transparent: true,
    opacity: 0.95,
    fog: false // Ignore fog to prevent turning black
  });
  // Aspect ratio based on standard portrait image
  const buddhaGeo = new THREE.PlaneGeometry(300, 420);
  const buddhaPlane = new THREE.Mesh(buddhaGeo, buddhaMat);
  // Positioned high and behind the stupa
  buddhaPlane.position.set(0, 150, -150);
  mihintaleGroup.add(buddhaPlane);

  // --- 2. The Main Stupa (Maha Seya) ---
  const stupaGroup = new THREE.Group();
  stupaGroup.position.set(0, 0, 0);

  // Base platform (Salapatala Maluwa)
  const stupaBase = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 2, 32), whiteMat);
  stupaBase.position.y = 1;
  stupaGroup.add(stupaBase);

  // 3 Pesawal (Rings)
  for(let i=0; i<3; i++) {
    const r = 16 - (i * 1.5);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 32), whiteMat);
    ring.position.y = 2.5 + i * 1;
    stupaGroup.add(ring);
  }

  // Dome (Garbhaya)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(13, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), whiteMat);
  dome.position.y = 5.5;
  stupaGroup.add(dome);

  // Hatharas Kotuwa (Square box on top)
  const squareBox = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), whiteMat);
  squareBox.position.y = 20;
  stupaGroup.add(squareBox);

  // Devatha Kotuwa (Cylinder above square)
  const devCyl = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 2, 16), whiteMat);
  devCyl.position.y = 23;
  stupaGroup.add(devCyl);

  // Koth Kerella (Spire)
  const spire = new THREE.Mesh(new THREE.ConeGeometry(2.5, 12, 16), whiteMat);
  spire.position.y = 30;
  stupaGroup.add(spire);

  // Chudamanikya (Golden Gem on top)
  const gem = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), goldMat);
  gem.position.y = 36.5;
  stupaGroup.add(gem);

  // Glowing Stupa Top Light
  const stupaLight = new THREE.PointLight(0xffffff, 800, 200);
  stupaLight.position.set(0, 45, 0);
  stupaGroup.add(stupaLight);

  // 4 Floodlights on the ground to illuminate the Chaithya beautifully
  const floodColor = 0xfff5e6; // Warm bright white
  const floodInt = 600;
  
  const fl1 = new THREE.PointLight(floodColor, floodInt, 100);
  fl1.position.set(18, 5, 18);
  stupaGroup.add(fl1);
  
  const fl2 = new THREE.PointLight(floodColor, floodInt, 100);
  fl2.position.set(-18, 5, 18);
  stupaGroup.add(fl2);
  
  const fl3 = new THREE.PointLight(floodColor, floodInt, 100);
  fl3.position.set(18, 5, -18);
  stupaGroup.add(fl3);
  
  const fl4 = new THREE.PointLight(floodColor, floodInt, 100);
  fl4.position.set(-18, 5, -18);
  stupaGroup.add(fl4);

  mihintaleGroup.add(stupaGroup);

  // --- 3. The Stairway (Representational steps) ---
  const stairsGroup = new THREE.Group();
  for(let i=0; i<60; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 3), rockMat);
    step.position.set(0, -25 + (i * 0.4), 40 + (i * 1.5));
    stairsGroup.add(step);
  }
  mihintaleGroup.add(stairsGroup);



  // Position Mihintale monumentally in the background
  mihintaleGroup.position.set(-60, 5, -150);
  mihintaleGroup.scale.set(1.5, 1.5, 1.5);

  scene.add(mihintaleGroup);

  // 3. Floating Particles (Stars/Lanterns)
  const particleCount = 1500; // Increased particle count due to larger view distance
  const particlesGeo = new THREE.BufferGeometry();
  const posArray = new Float32Array(particleCount * 3);

  for(let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 500; // Wider spread
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  // Custom glowing material
  const particlesMat = new THREE.PointsMaterial({
    size: 0.5,
    color: 0xffde59, // Soft warm glow
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particlesMesh);

  return { particlesMesh, mihintaleGroup };
}
