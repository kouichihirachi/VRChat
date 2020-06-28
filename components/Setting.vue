<template>
  <div class="ViewModal">
    <div class="container" id="modal">
      <h3>設定</h3>
      <hr />
      <div class="row">
        <div class="col">
          <div class="form-group">
            <label>モデル：</label>
            <select v-model="modelName" @change="changeModel(modelName)" class="form-control">
              <option disabled value>選択してください</option>
              <option value="JK.vrm" selected>JK</option>
              <option value="sabaru.vrm">サーバルちゃん</option>
              <option value="a.vrm">猫</option>
              <option value="b.vrm">城禿君</option>
              <option value="c.vrm">城禿君</option>
            </select>
          </div>
          <div class="form-group">
            <label>背景色：</label>
            <select v-model="color" @change="changeBackground(color)" class="form-control">
              <option value="0xffebcd" selected>ベージュ</option>
              <option value="0x9cbb1c">黄緑</option>
            </select>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <button class="btn btn-info" @click="close">閉じる</button>
        </div>
      </div>
    </div>
    <div id="overlay"></div>
  </div>
</template>
<script>
import Vrm from "~/components/Vrm.vue";
export default {
  modelName() {
    this.modelName = "JK.vrm";
    this.color = "";
  },
  methods: {
    close() {
      this.$emit("close");
    },
    changeModel(modelName) {
      this.$emit("changeModel", modelName);
    },
    changeBackground(color) {
      this.$emit("changeBackground", color);
    }
  }
};
</script>
<style>
#overlay {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.65);
}
#modal {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 2;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 400px;
  max-height: 70vh;
  box-sizing: border-box;
  padding: 32px;
  border-radius: 8px;
  background-color: #fff;
}
</style>