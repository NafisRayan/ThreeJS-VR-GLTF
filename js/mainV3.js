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
camera.position.z = 5; // Set the camera's z position to see the model

// Create a WebGL renderer with transparency enabled
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight); // Set the renderer size
document.body.appendChild(renderer.domElement); // Add the renderer to the DOM

// Instantiate OrbitControls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);

let gltfFolder = 'curiosity_rover'
let model; // Declare model variable globally

// Load the .gltf model using GLTFLoader
const loader = new GLTFLoader();
loader.load(
  `models/${gltfFolder}/scene.gltf`,
  function (gltf) {
    model = gltf.scene; // Assign the loaded model to the global model variable
    
    // Play animations
    if (model.animations) {
      model.mixer = new THREE.AnimationMixer(model);
      model.mixer.clipAction(gltf.animations[0]).play();
    }
    
    model.scale.set(1, 1, 1); // Optional: Set the scale of the model
    scene.add(model); // Add the model to the scene
  },
  undefined,
  function (error) {
    console.error('An error occurred while loading the model:', error);
  }
);

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
  
  // Update animations
  if (model && model.mixer) {
    model.mixer.update(0.016); // Update animation mixer
  }
  
  renderer.render(scene, camera); // Render the scene with the camera
}
animate();

// Start the rendering loop
animate();