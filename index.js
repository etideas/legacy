import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { FontLoader } from "jsm/loaders/FontLoader.js";
import { TextGeometry } from "jsm/geometries/TextGeometry.js";
import { AudioListener, Audio, AudioLoader } from "three";

document.addEventListener("DOMContentLoaded", function () {
  // Show loading screen
  const loadingScreen = document.getElementById("loading-screen");

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.keyCode === 13) {
      console.log("Enter key pressed, starting Three.js...");
      loadingScreen.style.display = "none"; // Hide loading screen
      startThreeJS(); // Initialize the Three.js scene
    }
  });

  function startThreeJS() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.3); // Fog color
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;

    // Add an Audio Listener to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Array to hold multiple audio tracks
    const audioTracks = [];
    const audioLoader = new THREE.AudioLoader();

    // Load multiple audio files
    const audioFiles = [
      "sound1.mp3",
      "sound2.mp3",
      "sound3.mp3",
      "sound4.mp3",
      "sound5.mp3",
    ]; // Add more as needed

    audioFiles.forEach((audioFile, index) => {
      const sound = new THREE.Audio(listener);
      audioLoader.load(`./audio/${audioFile}`, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false); // Loop will be controlled manually
        sound.setVolume(0.5); // Set volume (adjust as needed)
        audioTracks.push(sound); // Add the sound to the array
      });
    });

    const toggleButton = document.getElementById("toggle-audio");
    let isAudioPlaying = true;

    toggleButton.addEventListener("click", () => {
      if (currentAudioTrack) {
        if (isAudioPlaying) {
          currentAudioTrack.pause(); // Pause the audio
          toggleButton.textContent = "Play Audio"; // Update button text
        } else {
          currentAudioTrack.play(); // Play the audio
          toggleButton.textContent = "Pause Audio"; // Update button text
        }
        isAudioPlaying = !isAudioPlaying; // Toggle the state
      }
    });

    let currentMonthIndex = -1;
    let currentAudioTrack = null;

    // Straight line for the tunnel
    const start = new THREE.Vector3(0, 0, 0);
    const end = new THREE.Vector3(0, 0, -100);
    const straightLine = new THREE.LineCurve3(start, end);

    // Create a tube geometry along the straight line
    const tubeGeo = new THREE.TubeGeometry(straightLine, 222, 0.65, 16, false); // Tube size
    let tubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Tube material
    let tubeMesh = new THREE.Mesh(tubeGeo, tubeMaterial);
    scene.add(tubeMesh);

    // Increase Ambient Light Intensity
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Increased from 0.5 to 1.0
    scene.add(ambientLight);

    // Increase Directional Light Intensity
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Increased from 0.5 to 1.0
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // Rectangle size and spacing (adjustable variables)
    const rectWidth = 1.1; // Width of the rectangle
    const rectHeight = 0.7; // Height of the rectangle
    const spacingBetweenRectangles = 5.0; // Spacing along the tunnel (z-axis)

    // Load images from the img folder
    const numPictures = 101; // Adjust this based on your actual count
    const sizeX = 0.7; // Picture width
    const sizeY = 0.35; // Picture height
    const pictures = [];

    const textureLoader = new THREE.TextureLoader();
    const loadingManager = new THREE.LoadingManager();

    // Loading Manager for showing progress
    loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      console.log(
        `Loading file: ${url}. Loaded ${itemsLoaded} of ${itemsTotal} files.`
      );
    };

    loadingManager.onLoad = function () {
      console.log("All assets loaded.");
    };

    loadingManager.onError = function (url) {
      console.error(`There was an error loading ${url}`);
    };

    // Generate filenames assuming all images are now .jpeg
    const textureURLs = Array.from(
      { length: numPictures },
      (_, i) => `img/img${i + 1}.jpeg`
    );

    // Load textures and create picture meshes
    textureURLs.forEach((url, i) => {
      textureLoader.load(
        url,
        (texture) => {
          console.log(`Texture ${i + 1} loaded successfully from ${url}`);

          const pictureMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
          });
          const pictureGeo = new THREE.PlaneGeometry(sizeX, sizeY);
          const picture = new THREE.Mesh(pictureGeo, pictureMat);

          // Calculate the position of each image in the rectangle
          const groupIndex = Math.floor(i / 4);
          const positionInGroup = i % 4;
          const zPosition = -groupIndex * spacingBetweenRectangles;

          // Vertices of the rectangle
          const positions = [
            new THREE.Vector3(-rectWidth / 2, rectHeight / 2, zPosition), // Top-left
            new THREE.Vector3(rectWidth / 2, rectHeight / 2, zPosition), // Top-right
            new THREE.Vector3(-rectWidth / 2, -rectHeight / 2, zPosition), // Bottom-left
            new THREE.Vector3(rectWidth / 2, -rectHeight / 2, zPosition), // Bottom-right
          ];

          picture.position.copy(positions[positionInGroup]);

          scene.add(picture);
          pictures.push(picture);

          console.log(`Picture ${i + 1} added to the scene`);
        },
        undefined,
        (err) => {
          console.error(`Error loading texture ${i + 1} from ${url}:`, err);
        }
      );
    });

    // Add months along the center of the tunnel
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthColors = [
      0xff0000, 0xffa500, 0xffff00, 0x008000, 0x0000ff, 0x4b0082, 0xee82ee,
      0xa52a2a, 0x00ffff, 0xff69b4, 0x8b4513, 0x000000,
    ]; // Colors for each month

    const textColors = [
      0xff1493, 0xff4500, 0x7fff00, 0x1e90ff, 0xd2691e, 0x9932cc, 0x00ff7f,
      0x8b0000, 0xffd700, 0x20b2aa, 0xee82ee, 0xf0e68c,
    ]; // Text colors for each month

    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      function (font) {
        months.forEach((month, index) => {
          const textMat = new THREE.MeshBasicMaterial({
            color: textColors[index],
          });
          const textGeo = new TextGeometry(month, {
            font: font,
            size: 0.5,
            height: 0.1,
          });

          const textMesh = new THREE.Mesh(textGeo, textMat);

          // Center the text geometry
          textGeo.computeBoundingBox();
          const centerOffset =
            -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

          // Set position at the center of the tunnel
          const p = (index + 1) / (months.length + 1);
          const pos = tubeGeo.parameters.path.getPointAt(p);

          textMesh.position.set(centerOffset, 0, pos.z);

          scene.add(textMesh);
        });
      }
    );

    let scrollPosition = 0;

    function onScroll(event) {
      scrollPosition += event.deltaY * 0.00005; // Adjust scroll speed
      scrollPosition = Math.max(0, Math.min(1, scrollPosition)); // Clamp between 0 and 1
    }

    function updateCamera() {
      const p = scrollPosition;
      const pos = tubeGeo.parameters.path.getPointAt(p);
      const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
      camera.position.copy(pos);
      camera.lookAt(lookAt);

      // Check if we have passed a new month
      const newMonthIndex = Math.floor(p * months.length);
      if (
        newMonthIndex !== currentMonthIndex &&
        newMonthIndex < months.length
      ) {
        currentMonthIndex = newMonthIndex;
        console.log(`Month changed to: ${months[currentMonthIndex]}`);
        changeTubeColor(currentMonthIndex);
        changeBackgroundColor(currentMonthIndex);
        changeAudioTrack(currentMonthIndex); // Switch the audio track
      }

      // Spring back to start when reaching the end
      if (p >= 1) {
        springBackToStart();
      }
    }

    function changeTubeColor(monthIndex) {
      const color = monthColors[monthIndex];
      console.log(`Changing tube color to: ${color.toString(16)}`);
      tubeMaterial.color.setHex(color);
      tubeMaterial.needsUpdate = true; // Force material update
    }

    function changeBackgroundColor(monthIndex) {
      const color = monthColors[monthIndex];
      console.log(`Changing background color to: ${color.toString(16)}`);
      renderer.setClearColor(color); // Update background color
    }

    function changeAudioTrack(monthIndex) {
      if (audioTracks.length > 0) {
        const trackIndex = monthIndex % audioTracks.length; // Loop over available tracks
        const newTrack = audioTracks[trackIndex];

        // Stop the current track if it's playing
        if (currentAudioTrack) {
          currentAudioTrack.stop();
        }

        // Play the new track
        currentAudioTrack = newTrack;
        currentAudioTrack.play();
      }
    }

    function springBackToStart() {
      scrollPosition = 0;
      camera.position.copy(start);
      camera.lookAt(tubeGeo.parameters.path.getPointAt(0.03));
    }

    function animate() {
      requestAnimationFrame(animate);
      updateCamera();
      renderer.render(scene, camera);
      controls.update();
    }
    animate();

    function handleWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleWindowResize, false);
    window.addEventListener("wheel", onScroll, { passive: true });

    // Raycaster for detecting clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pictures);

      if (intersects.length > 0) {
        const intersectedPicture = intersects[0].object;
        showPopup(intersectedPicture);
      }
    }

    function showPopup(picture) {
      const popup = document.createElement("div");
      popup.style.position = "absolute";
      popup.style.left = "50%";
      popup.style.top = "50%";
      popup.style.transform = "translate(-50%, -50%)";
      popup.style.padding = "20px";
      popup.style.backgroundColor = "white";
      popup.style.border = "1px solid black";
      popup.innerHTML = `You clicked on a picture!<br>Position: ${picture.position
        .toArray()
        .join(", ")}`;

      const closeButton = document.createElement("button");
      closeButton.innerHTML = "Close";
      closeButton.addEventListener("click", () => {
        document.body.removeChild(popup);
      });

      popup.appendChild(closeButton);
      document.body.appendChild(popup);
    }

    window.addEventListener("click", onClick, false);
  }
});
