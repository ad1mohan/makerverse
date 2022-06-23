import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import "./style.css";

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};
window.addEventListener("resize", () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
window.addEventListener("dblclick", () => {
	const fullscreenElement =
		document.fullscreenElement || document.webkitFullscreenElement;
	if (!fullscreenElement) {
		if (canvas.requestFullscreen) {
			canvas.requestFullscreen();
		} else if (canvas.webkitRequestFullscreen) {
			canvas.webkitRequestFullscreen();
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (canvas.webkitExitFullscreen) {
			canvas.webkitExitFullscreen();
		}
	}
});

// Env Loader
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
	"./textures/environmentMaps/5/px.png",
	"./textures/environmentMaps/5/nx.png",
	"./textures/environmentMaps/5/py.png",
	"./textures/environmentMaps/5/ny.png",
	"./textures/environmentMaps/5/pz.png",
	"./textures/environmentMaps/5/nz.png",
]);
environmentMapTexture.encoding = THREE.sRGBEncoding;

// GUI
const gui = new dat.GUI();

// Get Canvas DOM
const canvas = document.querySelector(".webgl-canvas");

// Scene
const scene = new THREE.Scene();

// Sphere Mesh
const sphereGeometry = new THREE.SphereBufferGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial();
sphereMaterial.metalness = 0.6;
sphereMaterial.roughness = 0;
sphereMaterial.envMap = environmentMapTexture;
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphereMesh);

const updateAllMaterials = () => {
	sphereMaterial.needsUpdate = true;
};

// Camera = PerspectiveCamera(Field_of_view, screen_width/height)
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Axis helper
const axesHelper = new THREE.AxesHelper(5);
axesHelper.visible = false;
scene.add(axesHelper);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-1.335, 5, -0.035);
const directionalLightCameraHelper = new THREE.CameraHelper(
	directionalLight.shadow.camera
);
directionalLightCameraHelper.visible = false;
scene.add(directionalLight, directionalLightCameraHelper);
scene.background = environmentMapTexture;

// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true,
});
// resize renderer
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;

// GUI Tweaks
gui.add(axesHelper, "visible").name("Axes Helper Visible");
gui
	.add(directionalLightCameraHelper, "visible")
	.name("directionalLight Camera Helper"); // boolean/checkbox
gui.add(sphereMaterial, "metalness").min(0).max(1).step(0.01).name("metalness");
gui.add(sphereMaterial, "roughness").min(0).max(1).step(0.01).name("roughness");
gui
	.add(directionalLight, "intensity")
	.min(0)
	.max(10)
	.step(0.001)
	.name("Sunlight Intensity");
gui
	.add(directionalLight.position, "x")
	.min(-5)
	.max(5)
	.step(0.001)
	.name("Light X");
gui
	.add(directionalLight.position, "y")
	.min(-5)
	.max(5)
	.step(0.001)
	.name("Light Y");
gui
	.add(directionalLight.position, "z")
	.min(-5)
	.max(5)
	.step(0.001)
	.name("Light Z");
gui
	.add(sphereMaterial, "envMapIntensity")
	.min(0)
	.max(10)
	.step(0.001)
	.name("envMapIntensity")
	.onChange(updateAllMaterials);
gui
	.add(renderer, "toneMapping", {
		No: THREE.NoToneMapping,
		Linear: THREE.LinearToneMapping,
		Reinhard: THREE.ReinhardToneMapping,
		Cineon: THREE.CineonToneMapping,
		ACESFilmic: THREE.ACESFilmicToneMapping,
	})
	.onFinishChange(() => {
		renderer.toneMapping = Number(renderer.toneMapping);
		updateAllMaterials();
	});

// makes the camera zoomed in
renderer.render(scene, camera);

// Animation
const tick = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};
tick();
