<template>
  <div id="Vrm">
    <!-- 3Dモデル表示 -->
    <canvas id="model" ref="model" width="400" height="300" hidden></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRM, VRMUtils, VRMSchema } from "@pixiv/three-vrm";

export default {
  name: "Vrm",
  data() {
    let renderer, camera, currentVrm, scene, clock;
    return {
      renderer,
      camera,
      currentVrm,
      scene,
      clock,
      currentVrm
    };
  },
  mounted() {
    this.clock = new THREE.Clock();
    this.CreateRenderer();
    this.CreateCamera();
    this.CreateScene();
    this.LoadModels();
  },
  methods: {
    CreateRenderer() {
      // レンダラー
      const $canvas = document.getElementById("model");
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
