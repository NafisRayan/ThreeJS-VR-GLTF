// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// Import OrbitControls for camera movement
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// Import GLTFLoader for loading .gltf models
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a new Three.js scene
const scene = new THREE.Scene();

// Set up a Perspective Camera with field of view, aspect ratio, and clipping planes
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 12; // Set the camera's z position to see the models
camera.position.y = 3;
camera.position.x = 0;
// Create a WebGL renderer with transparency enabled
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight); // Set the renderer size
document.body.appendChild(renderer.domElement); // Add the renderer to the DOM

// Instantiate OrbitControls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);

// GLTF model folders
const modelsFolders = [
  { folder: 'mars_surface_terrain_model', scale: [50, 50, 50], position: [270,85,-500], rotation: [-.04, Math.PI, 0], animation: false },
  { folder: 'curiosity_rover', scale: [2.5, 2.5, 2.5], position: [-2, -4, -25], rotation: [0, 0, 0], animation: true },
  { folder: 'astronaut', scale: [2, 2, 2], position: [-12, -4.5, 2], rotation: [0, -250.8, 0], animation: true },
  { folder: 'perseverance_mars_rover', scale: [2, 2, 2], position: [-18, -3, -12], rotation: [0, 0, 0], animation: false },
  // { folder: 'mariner_4_spacecraft', scale: [1, 1, 1], position: [8, 18, -40], rotation: [0, Math.PI, 0], animation: false },
  { folder: 'space_shuttle', scale: [.9,.9,.9], position: [-50,-1, -120], rotation: [0, -200, 0], animation: false },
  { folder: 'robot_from_the_series_love_death_and_robots', scale: [.3, .3, .3], position: [8, 0.-2 , 5], rotation: [0, 10.2, 0], animation: false },
  // { folder: 'planet_earth', scale: [20, 20, 20], position: [25, 50, -500], rotation: [0, Math.PI, 0], animation: false },
  // { folder: 'planet', scale: [.0023, .0023, .0023], position: [-10, 18, -50], rotation: [0, Math.PI, 0], animation: false },
  { folder: 'planet', scale: [1, 1, 1], position: [-5, 18, -50], rotation: [0, Math.PI, 0], animation: false },
  // { folder: 'solar_skid', scale: [.03,.03,.04], position: [14.5, -2.3, -3], rotation: [0, -269.3, 0], animation: false },
  { folder: 'solar_skid', scale: [.03,.03,.04], position: [13, -2.3, -11], rotation: [0, -269.3, 0], animation: false },
  { folder: 'solar_skid', scale: [.03,.03,.04], position: [12, -2.3, -19], rotation: [0, -269.3, 0], animation: false },
  { folder: 'solar_skid', scale: [.03,.03,.04], position: [11, -2.3, -28], rotation: [0, -269.3, 0], animation: false },
  { folder: 'solar_skid', scale: [.03,.03,.04], position: [10, -2.3, -37], rotation: [0, -269.3, 0], animation: false },
  { folder: 'sci_fi_enclosure', scale: [1.6, 1.6, 1.6], position: [40, -2.3, -47], rotation: [0, 0, 0], animation: false }
];

let models = []; // Array to store loaded models

// Load multiple .gltf models using GLTFLoader
const loader = new GLTFLoader();
modelsFolders.forEach((modelData, index) => {
  loader.load(
    `models/${modelData.folder}/scene.gltf`,
    function (gltf) {
      const model = gltf.scene;

      // Play animations if available
      // if (gltf.animations.length > 0) {
      //   model.mixer = new THREE.AnimationMixer(model);
      //   model.mixer.clipAction(gltf.animations[0]).play();
      //   model.rotation.set(...(modelData.rotation || [0, 0, 0]));  // Default rotation if none provided
      // }
      model.rotation.set(...(modelData.rotation || [0, 0, 0]));  // Default rotation if none provided
      if (modelData.animation) {
        model.mixer = new THREE.AnimationMixer(model);
        model.mixer.clipAction(gltf.animations[0]).play();
        // model.rotation.set(...(modelData.rotation || [0, 0, 0]));  // Default rotation if none provided
      } else {
        // Stop existing animations if any
        if (model.mixer) {
          model.mixer.stopAllActions();
          model.mixer = null;
          // model.rotation.set(...(modelData.rotation || [0, 0, 0]));  // Default rotation if none provided
        }
      }


      // Set scale and position of each model
      model.scale.set(...modelData.scale);
      model.position.set(...modelData.position);

      // Add the model to the scene and the array
      scene.add(model);
      models.push(model);
    },
    undefined,
    function (error) {
      console.error(`An error occurred while loading ${modelData.folder}:`, error);
    }
  );
});

// Add ambient lighting to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Add a directional light for more lighting effects
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5); // Position the light
scene.add(directionalLight);

// Handle window resizing
window.addEventListener('resize', function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Update camera aspect ratio and renderer size
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// Animation loop to render the scene
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update camera controls
  
  // Update animations for each model
  models.forEach((model) => {
    if (model && model.mixer) {
      model.mixer.update(0.016); // Update animation mixer
    }
  });
  
  renderer.render(scene, camera); // Render the scene with the camera
}
animate(); // Start the rendering loop
