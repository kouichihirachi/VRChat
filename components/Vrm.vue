<template>
  <div id="Vrm">
    <!-- 3Dモデル表示 -->
    <div class="view">
      <p class="status">{{ status }}</p>
      <canvas ref="model" width="240" height="180"></canvas>
    </div>
    <!--
    <div>
      <button @click="Animate" class="btn btn-success">Animation</button>
    </div>
    -->
  </div>
</template>

<style>
.view {
  position: relative;
}
.view > .status {
  position: absolute;
  font-size: 18px;
  top: 4em;
  left: 0.5em;
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
    let renderer, camera, currentVrm, scene, clock, modelName, isAnimate, mixer;
    return {
      renderer,
      camera,
      scene,
      clock,
      currentVrm,
      status,
      modelName,
      isAnimate,
      mixer,
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
    this.isAnimate = false;
  },
  methods: {
    CreateRenderer() {
      // レンダラー
      const $canvas = this.$refs.model;
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: $canvas,
      });
      this.renderer.setSize(240, 180);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(0xffebcd);
    },
    changeBackground(color) {
      this.renderer.setClearColor(Number(color));
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
      loader.load(modelSrc, (gltf) => {
        VRM.from(gltf).then((vrm) => {
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

          // keyframe animations
          const bones = [VRMSchema.HumanoidBoneName.Neck].map((boneName) => {
            return vrm.humanoid.getBoneNode(boneName);
          });
          //console.log(bones);
          this.$emit("finishLoading");
        });
      });
      this.renderer.render(this.scene, this.camera);
    },
    Animate() {
      console.log("Called");
      this.isAnimate = true;
      let finished = true;
      if (this.currentVrm) {
        const deltaTime = this.clock.getDelta();
        const Animation = [
          {
            Bone: this.currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftUpperArm
            ).rotation.x,
            Deg: Math.PI / 2,
          },
          {
            Bone: this.currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftLowerArm
            ).rotation.y,
            Deg: Math.PI / 2,
          },
        ];
        for (let i = 0; i < Animation.length; i++) {
          const target = Animation[i].Deg;
          const Bone = Animation[i].Bone;
          const now = Bone;
          const diff = target - now;
          //console.log(diff);
          if (diff > 0) {
            finished = false;
            this.currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftUpperArm
            ).rotation.x = this.clock.elapsedTime * 0.8;
            this.currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftLowerArm
            ).rotation.y = -this.clock.elapsedTime * 0.8;
          }
        }
        if (finished) this.isAnimate = false;
        this.currentVrm.update(deltaTime);
      }
    },
    ChangeVrm(axis) {
      //瞬き
      if (this.currentVrm) {
        const canvas = this.renderer.domElement;
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;

        const blinkVal =
          Math.sin((this.clock.elapsedTime * 1) / 3) ** 1024 +
          Math.sin((this.clock.elapsedTime * 4) / 7) ** 1024;
        this.currentVrm.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.Blink,
          blinkVal
        );
        if (this.isAnimate) this.Animate();
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
        if (axis.x && axis.y && axis.z) {
          // ボーンをセットs
          this.currentVrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.Neck
          ).rotation.x = axis.x;
          this.currentVrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.Neck
          ).rotation.y = axis.y;
          this.currentVrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.Neck
          ).rotation.z = axis.z;
        }
        if (axis.emotion != undefined) {
          console.log(axis.emotion);
          this.currentVrm.blendShapeProxy.setValue(
            VRMSchema.BlendShapePresetName.Fun,
            axis.emotion[5].value * 100
          );

          this.currentVrm.blendShapeProxy.setValue(
            VRMSchema.BlendShapePresetName.Sorrow,
            axis.emotion[3].value * 100
          );
          this.currentVrm.blendShapeProxy.setValue(
            VRMSchema.BlendShapePresetName.Angry,
            axis.emotion[0].value * 100
          );
        }
        this.currentVrm.update(deltaTime);
      }
      if (this.renderer) {
        // VRMモデルを更新
        this.renderer.render(this.scene, this.camera);
      }
    },
  },
};
</script>
