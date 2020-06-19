<template>
  <div id="Vrm">
    <!-- 3Dモデル表示 -->
    <div class="view">
      <h5 class="status">{{ status }}</h5>
      <canvas ref="model" width="400" height="300"></canvas>
    </div>
    <div>
      <label>モデルを選択：</label>
      <select v-model="modelName" @change="LoadModels(modelName)">
        <option disabled value>選択してください</option>
        <option value="JK.vrm">JK</option>
        <option value="sabaru.vrm">サーバルちゃん</option>
      </select>
    </div>
  </div>
</template>

<style>
.view {
  position: relative;
}
.view > .status {
  position: absolute;
  top: 6em;
  left: 5em;
  bottom: 0;
  text-align: center;
  margin: auto;
}
</style>

<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { VRM, VRMUtils, VRMSchema } from "@pixiv/three-vrm";

export default {
  name: "Vrm",
  data() {
    let renderer, camera, currentVrm, scene, clock, modelName;
    return {
      renderer,
      camera,
      currentVrm,
      scene,
      clock,
      currentVrm,
      status,
      modelName
    };
  },
  mounted() {
    this.clock = new THREE.Clock();
    this.CreateRenderer();
    this.CreateCamera();
    this.CreateScene();
    this.status = "モデルを選択してください";
    this.renderer.render(this.scene, this.camera);
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
      const controls = new OrbitControls(this.camera, this.$refs.model);
      controls.screenSpacePanning = true;
      controls.target.set(0.0, 1.0, 0.0);
      controls.update();
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
    DeleteModel() {
      this.scene.remove(this.currentVrm.scene);
    },
    LoadModels(modelName) {
      // モデル
      this.status = "モデル読み込み中...";
      if (this.currentVrm) this.DeleteModel();
      const modelSrc = "/models/" + modelName; // 利用するモデルの配置場所
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
        });
      });
      this.renderer.render(this.scene, this.camera);
    },
    ChangeVrm(axis) {
      //瞬き
      console.log(axis);
      if (this.currentVrm) {
        const blinkVal =
          Math.sin((this.clock.elapsedTime * 1) / 3) ** 1024 +
          Math.sin((this.clock.elapsedTime * 4) / 7) ** 1024;

        this.currentVrm.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.Blink,
          blinkVal
        );
      }
      // 基本的にはこの関数内を変えれば良い
      // TODO
      /*
      表情のトラッキング
      手の初分(挙手出来るようにするとか)
    */
      if (this.currentVrm && axis != 0) {
        const deltaTime = this.clock.getDelta();
        this.currentVrm.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.A,
          axis.volume
        );
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
        this.currentVrm.update(deltaTime);
      }
      if (this.renderer) {
        // VRMモデルを更新
        this.renderer.render(this.scene, this.camera);
      }
    }
  }
};
</script>
