<template>
  <div class="ViewModal">
    <div class="container" id="modal">
      <h3>設定</h3>
      <hr />
      <div class="row">
        <div class="col">
          <div class="form-group">
            <label for="modelSelect">モデル：</label>
            <select
              id="modelSelect"
              v-bind:disabled="isLoading"
              v-model="modelName"
              @change="changeModel(modelName)"
              class="form-control"
            >
              <option disabled>選択してください</option>
              <option value="re-ya.vrm" selected="selected">れいやちゃん</option>
              <option value="JK.vrm" selected="selected">女子高生</option>
              <option value="sabaru.vrm">サーバルちゃん</option>
              <option value="neko.vrm">猫</option>
              <option value="shirohage.vrm">城禿君</option>
              <option value="shark.vrm">サメ君</option>
              <option value="reiwa_rei.vrm">令和の令</option>
              <option value="reiwa_wa.vrm">令和の和</option>
              <option value="mazyco.vrm">魔剤子</option>
            </select>
          </div>
          <div class="form-group">
            <label for="backgroundSelect">背景色：</label>
            <select
              id="backgroundSelect"
              v-model="color"
              @change="changeBackground(color)"
              class="form-control"
            >
              <option disabled>選択してください</option>
              <option value="0xffebcd" selected="selected">ベージュ</option>
              <option value="0x9cbb1c">黄緑</option>
              <option value="0xffa500">オレンジ</option>
              <option value="0xffffff">白</option>
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
export default {
  data() {
    return {
      color: "",
      modelName: "",
      isLoading: false,
    };
  },
  methods: {
    close() {
      this.$emit("close");
    },
    changeModel(modelName) {
      this.isLoading = true;
      this.modelName = modelName;
      this.$emit("changeModel", modelName);
    },
    changeBackground(color) {
      this.color = color;
      this.$emit("changeBackground", color);
    },
    changeStatus() {
      this.isLoading = false;
    },
  },
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
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.5);
  border: double 6px #58ffff44;
  box-shadow: 8px 15px 40px #1a251a65 inset;
  font-size: 2vw;
}
</style>
