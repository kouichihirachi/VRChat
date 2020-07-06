// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas-container'),
  alpha: true //背景透明化
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// camera
const camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 20.0);
camera.position.set(0.0, 1.0, 2.0);

// camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0.0, 1.0, 0.0);
controls.update();

// scene
const scene = new THREE.Scene();

let currentVrm = undefined;
function initScene(spec) {
  // light
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1.0, 1.0, 1.0).normalize();
  scene.add(light);

  // gltf and vrm
  const loader = new THREE.GLTFLoader();
  loader.crossOrigin = 'anonymous';
  loader.load(

    '/model/ShachikuChan.vrm',

    (gltf) => {

      THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);

      THREE.VRM.from(gltf).then((vrm) => {

        scene.add(vrm.scene);
        currentVrm = vrm;

        vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips).rotation.y = Math.PI;

        console.log(vrm);

      });

    },

    (progress) => console.log('モデル読み込み中...', 100.0 * (progress.loaded / progress.total), '%'),

    (error) => console.error(error)

  );

  // helpers

  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}


JEEFACEFILTERAPI.init({
  canvasId: 'canvas-container',
  NNCpath: '/script/jeelizFaceFilter/',
  callbackReady: function (errCode, spec) {
    if (errCode) {
      console.log('AN ERROR HAPPENS. ERROR CODE =', errCode);
      return;
    }
    initScene(spec);
    console.log('INFO: JEEFACEFILTERAPI IS READY');
  },
  callbackTrack: function (detectState) {
    if (currentVrm) {
      currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Neck).rotation.y = detectState.ry;
      console.log(detectState.ry);
      currentVrm.update(100);
    }
    renderer.render(scene, camera);
  }
});

