<template>
  <div id="Tracker">
    <!-- カメラ表示 -->
    <div id="container">
      <video
        id="camera"
        ref="camera"
        width="400"
        height="300"
        loop
        playsinline
        autoplay
      ></video>
      <canvas
        ref="cameraOverlay"
        id="cameraOverlay"
        width="400"
        height="300"
      ></canvas>
      <!-- 3Dモデル表示 -->
      <canvas ref="model" width="400" height="300"></canvas>
      <h1>{{ status }}</h1>
    </div>
  </div>
</template>
<style>
#cameraOverlay {
  position: absolute;
  top: 0px;
  left: 0px;
  -o-transform: scaleX(-1);
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  -ms-filter: fliph; /*IE*/
  filter: fliph; /*IE*/
}
#camera {
  -o-transform: scaleX(-1);
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  -ms-filter: fliph; /*IE*/
  filter: fliph; /*IE*/
}
#container {
  position: relative;
  width: 370px;
  /*margin : 0px auto;*/
}
</style>
<script>
import clm from "clmtrackr";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRM, VRMUtils, VRMSchema } from "@pixiv/three-vrm";

const ctrack = new clm.tracker({
  faceDetection: {
    useWebWorkers: false
  }
});

export default {
  name: "Tracker",
  data() {
    let render, tracker, vid, overlay, overlayCC, vidWidth, vidHeight, stack;
    let renderer, camera, currentVrm, scene, clock;
    let status = "Now Loading...";
    return {
      render,
      tracker,
      vid,
      overlay,
      overlayCC,
      vidWidth,
      vidHeight,
      stack,
      renderer,
      camera,
      currentVrm,
      scene,
      clock,
      currentVrm,
      status
    };
  },
  async mounted() {
    this.vid = this.$refs.camera;
    this.overlay = this.$refs.cameraOverlay;
    this.overlayCC = this.overlay.getContext("2d");
    this.vidWidth = this.vid.width;
    this.vidHeight = this.vid.height;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    this.vid.muted = true;
    this.vid.srcObject = stream;
    await this.vid.play();
    ctrack.init();
    this.clock = new THREE.Clock();
    this.CreateRenderer();
    this.CreateCamera();
    this.CreateScene();
    this.LoadModels();
  },
  methods: {
    drawLoop() {
      requestAnimationFrame(this.drawLoop);
      this.overlayCC.clearRect(0, 0, this.vidWidth, this.vidHeight);
      if (ctrack.getCurrentPosition()) {
        let event = ctrack.getCurrentPosition();
        let axis = this.mapEventTo3dTransforms(event);
        axis = this.maximumLimiter(axis);
        axis = this.limiter(axis);
        axis = this.getMovingAverage(axis);
        this.RenderVrm(axis);
        ctrack.draw(this.overlay);
      }
    },
    startTracking() {
      if (this.vid != null) {
        this.vid.play();
        ctrack.start(this.vid);
      }
      this.drawLoop();
    },
    mapEventTo3dTransforms(event) {
      //2次元座標から3次元の傾きを取得
      //全体的に微妙なところがある
      if (event) {
        // X軸方向の傾き
        let tops = (event[0][1] + event[14][1]) / 2;
        let bottoms = (event[6][1] + event[8][1]) / 2;
        let middle = bottoms + (tops - bottoms) / 2;
        let centerValue = 0.9; //顔が正面のときのxDeg値
        let xDeg =
          (((centerValue - event[37][1] / middle) / 0.2) * Math.PI) / 2;
        //console.log(xDeg);
        // Y軸方向の傾き
        var t2 = event[62],
          t1 = [
            (event[13][0] - event[1][0]) / 2,
            (event[13][1] - event[1][1]) / 2
          ];
        let yParam = 1.6; //中央のときのatan2の値
        var yDeg =
          (((Math.atan2(
            event[33][1] - event[7][1],
            event[33][0] - event[7][0]
          ) +
            yParam) /
            0.1) *
            Math.PI) /
          6;
        // Z軸方向の傾き
        let zDeg =
          Math.PI / 2 -
          Math.atan2(event[62][1] - event[33][1], event[62][0] - event[33][0]);
        return {
          x: xDeg,
          y: yDeg,
          z: zDeg
        };
      }
    },
    limiter(axis) {
      const maxlimit = (20 / 180) * Math.PI; //これ以下の動きは無視
      const minlimit = (10 / 180) * Math.PI; //これ以上の動きは無視
      this.prevX = 0;
      this.prevY = 0;
      this.prevZ = 0;
      let x, y, z;
      console.log(Math.abs(axis.x - this.prevX));
      if (
        Math.abs(axis.x - this.prevX) < maxlimit &&
        Math.abs(axis.x - this.prevX) > minlimit
      ) {
        x = axis.x;
        this.prevX = x;
      } else {
        if (axis.x > this.prevX) x = axis.x;
        else if (axis.x < this.prevX) x = axis.x;
      }
      if (
        Math.abs(axis.y - this.prevY) < maxlimit &&
        Math.abs(axis.y - this.prevY) > minlimit
      ) {
        y = axis.y;
        this.prevY = y;
      } else {
        if (axis.y > this.prevY) y = axis.y;
        else if (axis.y < this.prevY) y = axis.y;
      }
      if (
        Math.abs(axis.z - this.prevZ) < maxlimit &&
        Math.abs(axis.z - this.prevZ) > minlimit
      ) {
        z = axis.z;
        this.prevZ = z;
      } else {
        if (axis.z > this.prevZ) z = axis.z;
        else if (axis.z < this.prevZ) z = axis.z;
      }
      return {
        x: x,
        y: y,
        z: z
      };
    },
    getMovingAverage(axis) {
      //5回分の移動平均を取り，なめらかにする
      this.stack = [];
      let averageAxis = { x: 0, y: 0, z: 0 };
      if (this.stack.length > 10) {
        this.stack.pop();
        this.stack.push(axis);
        for (let i = 0; i < this.stack.length; i++) {
          averageAxis.x += stack[i].x;
          averageAxis.y += stack[i].y;
          averageAxis.z += stack[i].z;
        }
        averageAxis.x /= stack.length;
        averageAxis.y /= stack.length;
        averageAxis.z /= stack.length;
        return averageAxis;
      } else {
        return axis;
      }
    },
    maximumLimiter(axis) {
      const limit = (45 / 180) * Math.PI;
      if (axis.x > limit) axis.x = limit;
      if (axis.y > limit / 2) axis.y = limit / 2;
      if (axis.z > limit) axis.z = limit;
      if (axis.x < -limit) axis.x = -limit;
      if (axis.y < -limit / 2) axis.y = -limit / 2;
      if (axis.z < -limit) axis.z = -limit;
      return axis;
    },
    CreateRenderer() {
      // レンダラー
      const $canvas = this.$refs.model;
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas: $canvas
      });
      this.renderer.setSize(400, 300);
      this.renderer.setPixelRatio(window.devicePixelRatio);
    },
    CreateCamera() {
      // カメラ
      this.camera = new THREE.PerspectiveCamera(
        30.0,
        window.innerWidth / window.innerHeight,
        0.1,
        20.0
      );
      this.camera.position.set(0.0, 1.2, 0.8);
    },
    CreateScene() {
      // シーン
      this.scene = new THREE.Scene();
      // ライト
      const color = new THREE.Color("rgb(255, 255, 255)");
      const light = new THREE.DirectionalLight(color);
      light.position.set(1.0, 1.0, 1.0).normalize();
      this.scene.add(light);
    },
    LoadModels() {
      // モデル
      const modelSrc = "/models/JK.vrm"; // 利用するモデルの配置場所
      const loader = new GLTFLoader();
      loader.crossOrigin = "anonymous";
      loader.load(modelSrc, gltf => {
        VRM.from(gltf).then(vrm => {
          this.status = "";
          VRMUtils.removeUnnecessaryJoints(gltf.scene);
          if (this.scene != null) {
            this.scene.add(vrm.scene);
          }
          this.currentVrm = vrm;
          vrm.scene.rotation.y = Math.PI;
          this.renderer.render(this.scene, this.camera);
        });
      });
    },
    RenderVrm(axis) {
      // 基本的にはこの関数内を変えれば良い
      const deltaTime = this.clock.getDelta();
      // TODO
      /*
      表情のトラッキング
      瞬きの実装(自然な周期で)
      手の初分(挙手出来るようにするとか)
    */
      if (this.currentVrm) {
        // ボーンをセット
        this.currentVrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.Neck
        ).rotation.x = axis.x;
        this.currentVrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.Neck
        ).rotation.y = axis.y;
        this.currentVrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.Neck
        ).rotation.z = axis.z;
        // VRMモデルを更新
        this.currentVrm.update(deltaTime);
      }
      this.renderer.render(this.scene, this.camera);
    }
  }
};
</script>
