// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// Import OrbitControls for camera movement
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// Import GLTFLoader for loading .gltf models
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
// Import the VRButton
import { VRButton } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/webxr/VRButton.js";

// Create a new Three.js scene
const scene = new THREE.Scene();

// Set up a Perspective Camera with field of view, aspect ratio, and clipping planes
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 12); // Set the camera's position

// Create a WebGL renderer with transparency enabled
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight); // Set the renderer size
document.body.appendChild(renderer.domElement); // Add the renderer to the DOM

// Add the VR button to the document
document.body.appendChild(VRButton.createButton(renderer));

// Enable VR mode
renderer.xr.enabled = true;

// Instantiate OrbitControls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Add smooth damping effect
controls.dampingFactor = 0.05;

// GLTF model folders
const modelsFolders = [
  { folder: 'curiosity_rover', scale: [2.5, 2.5, 2.5], position: [-2, -4, -25], rotation: [0, 0, 0], animation: true },
  { folder: 'astronaut', scale: [2, 2, 2], position: [-12, -4.5, 2], rotation: [0, -250.8, 0], animation: true },
  { folder: 'perseverance_mars_rover', scale: [2, 2, 2], position: [-18, -3, -12], rotation: [0, 0, 0], animation: false },
  { folder: 'mariner_4_spacecraft', scale: [1, 1, 1], position: [8, 18, -40], rotation: [0, Math.PI, 0], animation: false },
  { folder: 'space_shuttle', scale: [.9,.9,.9], position: [-50,-1, -120], rotation: [0, -200, 0], animation: false },
  { folder: 'robot_from_the_series_love_death_and_robots', scale: [.3, .3, .3], position: [8, 0.-2 , 5], rotation: [0, 10.2, 0], animation: false },
  { folder: 'planet', scale: [1, 1, 1], position: [-5, 18, -50], rotation: [0, Math.PI, 0], animation: false },
  { folder: 'solar_skid', scale: [.03,.03,.04], position: [13, -2.3, -11], rotation: [0, -269.3, 0], animation: false },
  { folder: 'solar_skid', scale: [.03,.03,.04], position: [12, -2.3, -19], rotation: [0, -269.3, 0], animation: false },
  { folder: 'solar_skid', scale: [.03,.03,.04], position: [11, -2.3, -28], rotation: [0, -269.3, 0], animation: false },
  { folder: 'solar_skid', scale: [.03,.03,.04], position: [10, -2.3, -37], rotation: [0, -269.3, 0], animation: false },
  { folder: 'sci_fi_enclosure', scale: [1.6, 1.6, 1.6], position: [40, -2.3, -47], rotation: [0, 0, 0], animation: false }
];

let models = []; // Array to store loaded models

// Load multiple .gltf models using GLTFLoader
const loader = new GLTFLoader();
modelsFolders.forEach((modelData) => {
  loader.load(
    `models/${modelData.folder}/scene.gltf`,
    (gltf) => {
      const model = gltf.scene;
      model.rotation.set(...(modelData.rotation || [0, 0, 0]));  // Default rotation if none provided
      if (modelData.animation) {
        model.mixer = new THREE.AnimationMixer(model);
        model.mixer.clipAction(gltf.animations[0]).play();
      }

      // Set scale and position of each model
      model.scale.set(...modelData.scale);
      model.position.set(...modelData.position);

      // Add the model to the scene and the array
      scene.add(model);
      models.push(model);
    },
    undefined,
    (error) => {
      console.error(`An error occurred while loading ${modelData.folder}:`, error);
    }
  );
});

// Terrain model loader
function loadSingleModel(folderName, scale = [1, 1, 1], position = [0, 0, 0], rotation = [0, 0, 0], animation = false) {
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      `models/${folderName}/scene.gltf`,
      (gltf) => {
        const model = gltf.scene;
        
        // Set rotation
        model.rotation.set(...rotation);

        // Set scale and position
        model.scale.set(...scale);
        model.position.set(...position);

        // Handle animation if needed
        if (animation) {
          model.mixer = new THREE.AnimationMixer(model);
          model.mixer.clipAction(gltf.animations[0]).play();
        }

        // Add the model to the scene
        scene.add(model);
        
        models.push(model);
        resolve(model);
      },
      undefined,
      (error) => reject(error)
    );
  });
}

async function loadAndAnimateModel(folderName, scale, position, rotation, animation) {
  try {
    const model = await loadSingleModel(folderName, scale, position, rotation, animation);
    console.log(`Model loaded successfully: ${folderName}`);
    animateModel(model);
  } catch (error) {
    console.error(`Error loading model ${folderName}:`, error);
  }
}

// Usage example
loadAndAnimateModel('mars_surface_terrain_model', [50, 50, 50], [270,85,-500], [-.04, Math.PI, 0], false);

// Add ambient lighting to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Add a directional light for more lighting effects
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5); // Position the light
scene.add(directionalLight);

// Camera movement controls
const keys = {};
const moveSpeed = 0.1;
const moveVector = new THREE.Vector3();

window.addEventListener('keydown', (event) => {
  keys[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

function moveCamera() {
  moveVector.set(0, 0, 0);

  if (keys['ArrowUp'] || keys['KeyW']) moveVector.z -= moveSpeed;
  if (keys['ArrowDown'] || keys['KeyS']) moveVector.z += moveSpeed;
  if (keys['ArrowLeft'] || keys['KeyA']) moveVector.x -= moveSpeed;
  if (keys['ArrowRight'] || keys['KeyD']) moveVector.x += moveSpeed;
  if (keys['Space']) moveVector.y += moveSpeed;
  if (keys['ShiftLeft']) moveVector.y -= moveSpeed;

  // Apply rotation to movement vector
  moveVector.applyQuaternion(camera.quaternion);

  // Move the camera
  camera.position.add(moveVector);

  // Update OrbitControls target
  controls.target.copy(camera.position).add(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion));
}

// Animation loop
function animate() {
  renderer.setAnimationLoop(() => {
    moveCamera();
    controls.update(); // Update OrbitControls

    // Update animations for each model
    models.forEach((model) => {
      if (model && model.mixer) {
        model.mixer.update(0.016);
      }
    });

    renderer.render(scene, camera);
  });
}

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// console log camera position
console.log('camera position', camera.position);

animate(); // Start the animation loop