/// Zappar for ThreeJS Examples
/// Instant Tracking 3D Model

// In this example we track a 3D model using instant world tracking

import * as THREE from "three";
import * as ZapparThree from "@zappar/zappar-threejs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ZapparSharing from "@zappar/sharing";
import * as ZapparVideoRecorder from "@zappar/video-recorder";
const model = new URL("../assets/diwali_3d_poster.glb", import.meta.url).href;
import "./index.css";
// The SDK is supported on many different browsers, but there are some that
// don't provide camera access. This function detects if the browser is supported
// For more information on support, check out the readme over at
// https://www.npmjs.com/package/@zappar/zappar-threejs
if (ZapparThree.browserIncompatible()) {
  // The browserIncompatibleUI() function shows a full-page dialog that informs the user
  // they're using an unsupported browser, and provides a button to 'copy' the current page
  // URL so they can 'paste' it into the address bar of a compatible alternative.
  ZapparThree.browserIncompatibleUI();

  // If the browser is not compatible, we can avoid setting up the rest of the page
  // so we throw an exception here.
  throw new Error("Unsupported browser");
}

// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded. You can use this if it's helpful, or use
// your own loading UI - it's up to you :-)
const manager = new ZapparThree.LoadingManager();

// Construct our ThreeJS renderer and scene as usual
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
document.body.appendChild(renderer.domElement);

// As with a normal ThreeJS scene, resize the canvas if the window resizes
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Create a Zappar camera that we'll use instead of a ThreeJS camera
const camera = new ZapparThree.Camera();

// In order to use camera and motion data, we need to ask the users for permission
// The Zappar library comes with some UI to help with that, so let's use it
ZapparThree.permissionRequestUI().then((granted) => {
  // If the user granted us the permissions we need then we can start the camera
  // Otherwise let's them know that it's necessary with Zappar's permission denied UI
  if (granted) camera.start();
  else ZapparThree.permissionDeniedUI();
});

// The Zappar component needs to know our WebGL context, so set it like this:
ZapparThree.glContextSet(renderer.getContext());

// Set the background of our scene to be the camera background texture
// that's provided by the Zappar camera
scene.background = camera.backgroundTexture;

// Create an InstantWorldTracker and wrap it in an InstantWorldAnchorGroup for us
// to put our ThreeJS content into
const instantTracker = new ZapparThree.InstantWorldTracker();
const instantTrackerGroup = new ZapparThree.InstantWorldAnchorGroup(
  camera,
  instantTracker
);

// Add our instant tracker group into the ThreeJS scene
scene.add(instantTrackerGroup);

// Load a 3D model to place within our group (using ThreeJS's GLTF loader)
// Pass our loading manager in to ensure the progress bar works correctly
const gltfLoader = new GLTFLoader(manager);
let mymodel: any;
gltfLoader.load(
  model,
  (gltf) => {
    // Now the model has been loaded, we can add it to our instant_tracker_group
    mymodel = gltf.scene;
    instantTrackerGroup.add(gltf.scene);
    gltf.scene.visible = false;
    gltf.scene.scale.set(0.15, 0.25, 0.25);
    gltf.scene.position.set(0, -0.2, 0);
    // console.log(gltf.scene);
  },
  undefined,
  () => {
    console.log("An error ocurred loading the GLTF model");
  }
);

//==================FIRE CRACKERs========================

function getRandomHexColorWithAlpha() {
  // Generate a random integer between 0 and 0xffffff (16777215 in decimal)
  const randomColor = Math.floor(Math.random() * 0xffffff);
  // Convert the integer to a hexadecimal string with '0x' prefix
  const hexColor = `0x${randomColor.toString(16)}`;
  // Add the '1' at the end
  return `${hexColor}1`;
}

// Particle system parameters
const particleCount = 10000; // Adjust the number of particles as desired
const particleSize = 0.006; // Adjust the size of the particles
const particleColor = getRandomHexColorWithAlpha(); // Adjust the color of the particles

// Create the particle system
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
  size: particleSize,
  color: particleColor,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
instantTrackerGroup.add(particles);

// Generate random particle positions and colors
const positions = [];
const colors = [];

for (let i = 0; i < particleCount; i++) {
  const x = (Math.random() - 0.5) * 10;
  const y = (Math.random() - 0.5) * 10;
  const z = (Math.random() - 0.5) * 10;
  positions.push(x, y, z);

  const r = Math.random();
  const g = Math.random();
  const b = Math.random();
  colors.push(r, g, b);
}

particlesGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);
particlesGeometry.setAttribute(
  "color",
  new THREE.Float32BufferAttribute(colors, 3)
);

// spiral

// const particlesGeometry2 = new THREE.BufferGeometry();

// const particleCount2 = 1000000;
// const positions2 = new Float32Array(particleCount * 3);
// const colors2 = new Float32Array(particleCount * 3);

// const particleColor2 = new THREE.Color(0xffa500); // Fire color

// const spiral = (t: any) => {
//   const r = t; // Radius increases linearly with time
//   const theta = 50 * t; // Angle increases linearly with time
//   const x = r * Math.cos(theta);
//   const y = r * Math.sin(theta);
//   const z = (Math.random() - 0.5) * 2;
//   return new THREE.Vector3(x, y, z);
// };

// for (let i = 0; i < particleCount2; i++) {
//   const t = i / (particleCount2 - 1); // Linearly distribute points along the spiral
//   const point = spiral(t);

//   positions2[i * 3] = point.x;
//   positions2[i * 3 + 1] = point.y;
//   positions2[i * 3 + 2] = point.z;

//   colors2[i * 3] = particleColor2.r;
//   colors2[i * 3 + 1] = particleColor2.g;
//   colors2[i * 3 + 2] = particleColor2.b;
// }

// particlesGeometry2.setAttribute(
//   "position",
//   new THREE.BufferAttribute(positions2, 3)
// );
// particlesGeometry2.setAttribute("color", new THREE.BufferAttribute(colors2, 3));

// const particlesMaterial2 = new THREE.PointsMaterial({
//   size: 0.05,
//   //@ts-ignore
//   vertexColors: THREE.VertexColors,
// });

// const particles2 = new THREE.Points(particlesGeometry2, particlesMaterial2);
// instantTrackerGroup.add(particles2);

// Let's add some lighting, first a directional light above the model pointing down
const directionalLight = new THREE.DirectionalLight("white", 0.8);
directionalLight.position.set(0, 5, 0);
directionalLight.lookAt(0, 0, 0);
instantTrackerGroup.add(directionalLight);

// And then a little ambient light to brighten the model up a bit
const ambientLight = new THREE.AmbientLight("white", 0.4);
instantTrackerGroup.add(ambientLight);

// When the experience loads we'll let the user choose a place in their room for
// the content to appear using setAnchorPoseFromCameraOffset (see below)
// The user can confirm the location by tapping on the screen
let hasPlaced = false;
const placeButton =
  document.getElementById("tap-to-place") || document.createElement("div");
placeButton.addEventListener("click", () => {
  hasPlaced = true;
  mymodel.visible = true;
  placeButton.remove();
});

// Get a reference to the 'Snapshot' button so we can attach a 'click' listener
const canvas = document.getElementById("firecrackerCanvas");

const imageBtn =
  document.getElementById("image") || document.createElement("div");
imageBtn.addEventListener("click", () => {
  // Create an image from the canvas
  const planeGeometry = new THREE.PlaneGeometry(2, 2);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(planeMesh);

  // Temporarily set the camera to focus on the planeMesh
  const originalCameraPosition = camera.position.clone();
  camera.position.set(
    planeMesh.position.x,
    planeMesh.position.y,
    planeMesh.position.z + 5
  );

  camera.lookAt(planeMesh.position);

  // Render the scene
  renderer.render(scene, camera);
  // Convert canvas data to url
  const url = canvas.toDataURL("image/jpeg", 0.8);

  // Take snapshot
  ZapparSharing({
    data: url,
  });
});

// video capture
const videoBtn =
  document.getElementById("video") || document.createElement("div");
let isRecording = false;
ZapparVideoRecorder.createCanvasVideoRecorder(canvas, {}).then((recorder) => {
  videoBtn.addEventListener("click", () => {
    if (!isRecording) {
      isRecording = true;
      recorder.start();
    } else {
      isRecording = false;
      recorder.stop();
    }
  });

  recorder.onComplete.bind(async (res) => {
    ZapparSharing({
      data: await res.asDataURL(),
    });
  });
});

// Use a function to render our scene as usual
function render(): void {
  if (!hasPlaced) {
    // If the user hasn't chosen a place in their room yet, update the instant tracker
    // to be directly in front of the user
    instantTrackerGroup.setAnchorPoseFromCameraOffset(0, 0, -5);
  }

  // Update particle positions or properties here
  const positions: any = particlesGeometry.getAttribute("position").array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] += Math.random() * 0.01; // Move particles upward
    if (positions[i + 1] > 5) {
      positions[i + 1] = -5; // Reset particles' Y position when they go beyond the screen
    }
  }
  particlesGeometry.getAttribute("position").needsUpdate = true;
  // particles.rotation.z += 0.001;

  // The Zappar camera must have updateFrame called every frame
  camera.updateFrame(renderer);

  // Draw the ThreeJS scene in the usual way, but using the Zappar camera
  renderer.render(scene, camera);

  // Call render() again next frame
  requestAnimationFrame(render);
}

// Start things off
render();
