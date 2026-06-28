import * as THREE from 'three';

export async function createThorana(scene) {
  const thoranaGroup = new THREE.Group();
  
  const staticGroup = new THREE.Group();
  const lowerRotatingGroup = new THREE.Group();
  const upperRotatingGroup = new THREE.Group();

  thoranaGroup.add(staticGroup);
  thoranaGroup.add(lowerRotatingGroup);
  thoranaGroup.add(upperRotatingGroup);

  // Buddhist Flag Colors for the Kuduwa
  const structureMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, // Bright white frame
    emissive: 0x333333,
    roughness: 0.3
  });

  const flagColors = [
    { color: 0x0033cc, emissive: 0x0022aa }, // Blue
    { color: 0xffcc00, emissive: 0xccaa00 }, // Yellow
    { color: 0xcc0000, emissive: 0xaa0000 }, // Red
    { color: 0xffffff, emissive: 0x666666 }, // White
    { color: 0xff6600, emissive: 0xcc4400 }  // Orange
  ];

  const panelMaterials = flagColors.map(c => new THREE.MeshStandardMaterial({
    color: c.color,
    emissive: c.emissive,
    roughness: 0.2
  }));

  // Base support (Static)
  const baseGeo = new THREE.CylinderGeometry(8, 10, 2, 8);
  const base = new THREE.Mesh(baseGeo, panelMaterials[1]); // Yellow base
  base.position.y = -1;
  staticGroup.add(base);

  const mainPillarGeo = new THREE.CylinderGeometry(2.5, 4, 30, 8);
  const mainPillar = new THREE.Mesh(mainPillarGeo, panelMaterials[0]); // Blue pillar
  mainPillar.position.y = 15;
  staticGroup.add(mainPillar);

  // Intense Inner Light
  const innerLight = new THREE.PointLight(0xffffff, 3000, 60);
  innerLight.position.set(0, 15, 0);
  staticGroup.add(innerLight);

  // Fetch Image Config
  let panelImages = { upperPanels: [], lowerPanels: [] };
  try {
    const res = await fetch('/api/config');
    panelImages = await res.json();
  } catch(e) {
    console.log("Could not load panel config (Backend might not be running)");
  }

  const textureLoader = new THREE.TextureLoader();
  const lowerBulbPositions = [];
  const upperBulbPositions = [];

  const createOctagonLayer = (radius, height, yPos, addPanels, isUpper, parentGroup) => {
    const layerGroup = new THREE.Group();
    layerGroup.position.y = yPos;
    
    const sides = 8;
    const angleStep = (Math.PI * 2) / sides;
    const sideLength = 2 * radius * Math.tan(Math.PI / sides);
    
    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep;
      
      const beamGeo = new THREE.BoxGeometry(sideLength, 0.5, 0.5);
      const beam = new THREE.Mesh(beamGeo, structureMat);
      beam.position.x = Math.sin(angle) * radius;
      beam.position.z = Math.cos(angle) * radius;
      beam.rotation.y = angle;
      layerGroup.add(beam);

      const numBulbsPerBeam = 5;
      for(let b = 0; b < numBulbsPerBeam; b++) {
        const offset = (b / (numBulbsPerBeam - 1)) - 0.5;
        const bX = beam.position.x + Math.cos(angle) * offset * sideLength;
        const bZ = beam.position.z - Math.sin(angle) * offset * sideLength;
        const pos = new THREE.Vector3(bX, yPos, bZ);
        if (isUpper) upperBulbPositions.push(pos);
        else lowerBulbPositions.push(pos);
      }

      if (addPanels) {
        const panelGeo = new THREE.BoxGeometry(sideLength * 0.9, height * 0.9, 0.2);
        
        let pMat = panelMaterials[i % 5];
        
        // Apply texture if available
        const imgUrl = isUpper ? panelImages.upperPanels[i] : panelImages.lowerPanels[i];
        if (imgUrl) {
          const texture = textureLoader.load(imgUrl);
          texture.colorSpace = THREE.SRGBColorSpace;
          pMat = new THREE.MeshBasicMaterial({
            map: texture
          });
        }

        const panel = new THREE.Mesh(panelGeo, pMat);
        panel.position.x = Math.sin(angle) * radius;
        panel.position.y = height / 2;
        panel.position.z = Math.cos(angle) * radius;
        panel.rotation.y = angle;
        panel.userData = { isPanel: true, panelId: i, isUpper, imgUrl }; 
        layerGroup.add(panel);

        const pHeightY = (height * 0.9) / 2;
        for(let b=0; b<4; b++) {
          const offset = (b/3) - 0.5;
          const bX = panel.position.x + Math.cos(angle) * offset * (sideLength*0.9);
          const bZ = panel.position.z - Math.sin(angle) * offset * (sideLength*0.9);
          const pos = new THREE.Vector3(bX, yPos + height/2 + pHeightY, bZ);
          if (isUpper) upperBulbPositions.push(pos);
          else lowerBulbPositions.push(pos);
        }
      }
    }
    parentGroup.add(layerGroup);
  };

  // Build Lower Layers
  createOctagonLayer(12, 0, 5, false, false, lowerRotatingGroup);
  createOctagonLayer(15, 8, 8, true, false, lowerRotatingGroup); // Lower Panels

  // Build Upper Layers
  createOctagonLayer(12, 0, 18, false, true, upperRotatingGroup);
  createOctagonLayer(8, 6, 20, true, true, upperRotatingGroup); // Upper Panels
  createOctagonLayer(6, 0, 27, false, true, upperRotatingGroup);
  
  // Create InstancedMesh for Bulbs
  const bulbGeo = new THREE.SphereGeometry(0.45, 12, 12);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
  
  const createInstancedBulbs = (positions, group) => {
    const instanced = new THREE.InstancedMesh(bulbGeo, bulbMat.clone(), positions.length);
    const dummy = new THREE.Object3D();
    const colorDummy = new THREE.Color(0xffffff);

    for(let i = 0; i < positions.length; i++) {
      dummy.position.copy(positions[i]);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
      instanced.setColorAt(i, colorDummy);
    }
    instanced.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
    if(instanced.instanceColor) instanced.instanceColor.setUsage( THREE.DynamicDrawUsage );
    
    // Convert positions to local space since they were absolute
    // Actually wait, earlier I didn't offset local space. group is at (0,0,0) so it's perfectly fine.
    group.add(instanced);
    return instanced;
  };

  const lowerInstancedBulbs = createInstancedBulbs(lowerBulbPositions, lowerRotatingGroup);
  const upperInstancedBulbs = createInstancedBulbs(upperBulbPositions, upperRotatingGroup);

  scene.add(thoranaGroup);

  return { 
    thoranaGroup, 
    lowerRotatingGroup, 
    upperRotatingGroup,
    lowerInstancedBulbs,
    upperInstancedBulbs,
    lowerBulbCount: lowerBulbPositions.length,
    upperBulbCount: upperBulbPositions.length
  };
}
