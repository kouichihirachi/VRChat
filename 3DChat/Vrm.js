/*
  VRMの表示部分
*/


// レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#output'),
  alpha: true
});
renderer.setSize(400, 300);
renderer.setPixelRatio(window.devicePixelRatio);

// カメラ
const camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 20.0);
camera.position.set(0.0, 1.4, 1.2);

// カメラコントロール(デバッグ時にのみ使用)
/*
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0.0, 1.0, 0.0);
controls.update();
*/

// シーン
const scene = new THREE.Scene();

// ライト
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);

//モデル
let modelSrc = '/model/ShachikuChan.vrm';//利用するモデルの配置場所
let currentVrm = undefined;
const loader = new THREE.GLTFLoader();
loader.crossOrigin = 'anonymous';
loader.load(
  modelSrc,
  (gltf) => {
    THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);
    THREE.VRM.from(gltf).then((vrm) => {
      scene.add(vrm.scene);
      currentVrm = vrm;
      vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips).rotation.y = Math.PI;
      //console.log(vrm);
    });
  },
  (progress) => console.log('モデルを読み込んでいます...', 100.0 * (progress.loaded / progress.total), '%'),
  (error) => console.error(error)
);

// helpers(デバッグで必要なら有効に)
/*
//グリッドを表示
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

//軸を表示
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
*/




const clock = new THREE.Clock();

function renderVrm(axis,body_deg) {
  //基本的にはこの関数ないを変えれば良い



  const deltaTime = clock.getDelta();

  //TODO
  /*
    表情のトラッキング
    瞬きの実装(自然な周期で)
  */   	
   // 手の初分(挙手出来るようにするとか)



  

  if (currentVrm) {

    axis = maximumLimiter(axis);//動く範囲の制限
    axis = limiter(axis);//外れ値を除く
    axis = getMovingAverage(axis);//移動平均
    body_deg=body_deg_limitter(body_deg);
    body_deg=deg_limit(body_deg);
    // ボーンをセット
    currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Neck).rotation.z = axis.z;
    currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Neck).rotation.y = axis.y;
    currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Neck).rotation.x = axis.x;
    //currentVrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Spine).rotation.z = body_deg;//axis.z/2-0.05;
    // VRMモデルを更新
    currentVrm.update(deltaTime);
  }
  renderer.render(scene, camera);
}