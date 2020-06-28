<template>
  <div class="container">
    <setting
      :localStream="localStream"
      v-if="viewFlag"
      @close="closeWindows"
      @changeModel="changeModel"
      @changeBackground="changeBackground"
    />
    <div class="row">
      <div class="col">
        <tracker ref="Tracker" @axis="axis" @getAudioTrack="getAudioTrack"></tracker>
      </div>
      <div class="col">
        <vrm ref="Vrm" @getStream="getStream" @getTrack="getTrack" />
      </div>
    </div>
    <div>
      <WebRTC ref="WebRTC" :localStream="localStream" :audioTrack="audioTrack" />
    </div>
    <div class="row">
      <button @click="startTracking" class="btn btn-success mr-1">トラッキング開始</button>
      <button @click="stopTracking" class="btn btn-success mr-1">トラッキング停止</button>
    </div>
    <div class="row">
      <ul>
        <li>目をぱちぱちすると戻るよ</li>
        <li>マスクはしないでね</li>
      </ul>
    </div>
    <button class="btn btn-info" @click="openSetting">設定</button>
  </div>
</template>

<script>
import Tracker from "~/components/Tracker.vue";
import Vrm from "~/components/Vrm.vue";
import WebRTC from "~/components/WebRTC.vue";
import Setting from "~/components/Setting.vue";

export default {
  components: {
    Tracker,
    Vrm,
    WebRTC,
    Setting
  },
  data() {
    return {
      localStream: "",
      audioTrack: "",
      viewFlag: true
    };
  },
  mounted() {},
  methods: {
    openSetting() {
      this.viewFlag = true;
    },
    closeWindows() {
      this.viewFlag = false;
    },
    getStream(stream) {
      this.localStream = stream;
    },
    getAudioTrack(track) {
      this.audioTrack = track;
    },
    changeModel(modelName) {
      this.$refs.Vrm.LoadModels(modelName);
    },
    changeBackground(color) {
      this.$refs.Vrm.changeBackground(color);
    },
    startTracking() {
      this.$refs.Tracker.startTracking();
    },
    stopTracking() {
      this.$refs.Tracker.stopTracking();
    },
    getTrack() {
      this.$refs.Tracker.drawLoop();
    },
    axis(axis) {
      this.$refs.Vrm.ChangeVrm(axis);
    }
  }
};
</script>