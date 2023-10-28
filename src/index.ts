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
const canvas =
  document.querySelector("canvas") || document.createElement("canvas");

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

  // The Zappar camera must have updateFrame called every frame
  camera.updateFrame(renderer);

  // Draw the ThreeJS scene in the usual way, but using the Zappar camera
  renderer.render(scene, camera);

  // Call render() again next frame
  requestAnimationFrame(render);
}

function startFirecrackerAnimation() {
  var c: any = canvas;
  var ctx = c.getContext("2d");

  var cwidth: any, cheight: any;
  var shells: any = [];
  var pass: any = [];

  var colors = [
    "#FF5252",
    "#FF4081",
    "#E040FB",
    "#7C4DFF",
    "#536DFE",
    "#448AFF",
    "#40C4FF",
    "#18FFFF",
    "#64FFDA",
    "#69F0AE",
    "#B2FF59",
    "#EEFF41",
    "#FFFF00",
    "#FFD740",
    "#FFAB40",
    "#FF6E40",
  ];

  window.onresize = function () {
    reset();
  };
  reset();

  function reset() {
    cwidth = window.innerWidth;
    cheight = window.innerHeight;
    c.width = cwidth;
    c.height = cheight;
  }

  function newShell() {
    var left: any = Math.random() > 0.5;
    var shell: any = {};
    shell.x = 1 * left;
    shell.y = 1;
    shell.xoff = (0.01 + Math.random() * 0.007) * (left ? 1 : -1);
    shell.yoff = 0.01 + Math.random() * 0.007;
    shell.size = Math.random() * 6 + 3;
    shell.color = colors[Math.floor(Math.random() * colors.length)];

    shells.push(shell);
  }

  function newPass(shell: any) {
    var pasCount = Math.ceil(Math.pow(shell.size, 2) * Math.PI);

    for (let i = 0; i < pasCount; i++) {
      var pas: any = {};
      pas.x = shell.x * cwidth;
      pas.y = shell.y * cheight;

      var a = Math.random() * 4;
      var s = Math.random() * 10;

      pas.xoff = s * Math.sin((5 - a) * (Math.PI / 2));
      pas.yoff = s * Math.sin(a * (Math.PI / 2));

      pas.color = shell.color;
      pas.size = Math.sqrt(shell.size);

      if (pass.length < 1000) {
        pass.push(pas);
      }
    }
  }

  var lastRun = 0;
  Run();

  function Run() {
    var dt = 1;
    if (lastRun != 0) {
      dt = Math.min(50, performance.now() - lastRun);
    }
    lastRun = performance.now();

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, cwidth, cheight);

    if (shells.length < 10 && Math.random() > 0.96) {
      newShell();
    }

    for (let ix in shells) {
      var shell = shells[ix];

      ctx.beginPath();
      ctx.arc(shell.x * cwidth, shell.y * cheight, shell.size, 0, 2 * Math.PI);
      ctx.fillStyle = shell.color;
      ctx.fill();

      shell.x -= shell.xoff;
      shell.y -= shell.yoff;
      shell.xoff -= shell.xoff * dt * 0.001;
      shell.yoff -= (shell.yoff + 0.2) * dt * 0.00005;

      if (shell.yoff < -0.005) {
        newPass(shell);
        shells.splice(ix, 1);
      }
    }

    for (let ix in pass) {
      var pas = pass[ix];

      ctx.beginPath();
      ctx.arc(pas.x, pas.y, pas.size, 0, 2 * Math.PI);
      ctx.fillStyle = pas.color;
      ctx.fill();

      pas.x -= pas.xoff;
      pas.y -= pas.yoff;
      pas.xoff -= pas.xoff * dt * 0.001;
      pas.yoff -= (pas.yoff + 5) * dt * 0.0005;
      pas.size -= dt * 0.002 * Math.random();

      if (pas.y > cheight || pas.y < -50 || pas.size <= 0) {
        pass.splice(ix, 1);
      }
    }

    requestAnimationFrame(Run);
  }
}

// Start things off
render();
