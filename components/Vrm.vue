<template>
  <div id="Vrm">
    <!-- 3Dモデル表示 -->
    <canvas ref="model" width="400" height="300"></canvas>
    <h1>{{ status }}</h1>
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
    let status = "Now Loading...";
    return {
      renderer,
      camera,
      currentVrm,
      scene,
      clock,
      currentVrm,
      status
    };
  },
  mounted() {
    this.clock = new THREE.Clock();
    this.CreateRenderer();
    this.CreateCamera();
    this.CreateScene();
    this.LoadModels();
    const canvas = this.$refs.model;
    const stream = canvas.captureStream();
    this.$emit("getStream", stream);
  },
  methods: {
    CreateRenderer() {
      // レンダラー
      const $canvas = this.$refs.model;
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: $canvas
      });
      this.renderer.setSize(400, 300);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(0xffebcd);
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
          vrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.RightUpperArm
          ).rotation.z = -(Math.PI / 2 - 0.3);
          vrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.LeftUpperArm
          ).rotation.z = Math.PI / 2 - 0.3;
          vrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.LeftHand
          ).rotation.z = 0.1;
          vrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.RightHand
          ).rotation.z = -0.1;
          this.renderer.render(this.scene, this.camera);
        });
      });
      this.renderer.render(this.scene, this.camera);
    },
    RenderVrm(axis) {
      // 基本的にはこの関数内を変えれば良い

      //瞬き
      const deltaTime = this.clock.getDelta();
      const blinkVal =
        Math.sin((this.clock.elapsedTime * 1) / 3) ** 1024 +
        Math.sin((this.clock.elapsedTime * 4) / 7) ** 1024;

      console.log(axis.volume);
      if (this.currentVrm) {
        this.currentVrm.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.Blink,
          blinkVal
        );
        this.currentVrm.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.A,
          axis.volume
        );
      }

      // TODO
      /*
      表情のトラッキング
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
