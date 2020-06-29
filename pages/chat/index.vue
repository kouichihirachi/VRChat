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
        <vrm ref="Vrm" @getStream="getStream" @getTrack="getTrack" />
        <div class="row">
          <button
            @click="changeTracking"
            class="btn btn-success mr-1"
          >{{isTracking?"トラッキング停止":"トラッキング開始"}}</button>
          <button class="btn btn-info" @click="openSetting">
            <font-awesome-icon icon="cogs" />
          </button>
        </div>
      </div>
      <div class="col">
        <WebRTC ref="WebRTC" :localStream="localStream" :audioTrack="audioTrack" />
      </div>
    </div>
    <!--
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
      <button
        @click="changeTracking"
        class="btn btn-success mr-1"
      >{{isTracking?"トラッキング停止":"トラッキング開始"}}</button>
    </div>
    <div class="row">
      <ul>
        <li>目をぱちぱちすると戻るよ</li>
        <li>顔を隠さないでね</li>
      </ul>
    </div>
    <button class="btn btn-info" @click="openSetting">設定</button>
    -->
    <toast />
  </div>
</template>

<script>
import Tracker from "~/components/Tracker.vue";
import Vrm from "~/components/Vrm.vue";
import WebRTC from "~/components/WebRTC.vue";
import Setting from "~/components/Setting.vue";
import Toast from "~/components/Toast.vue";

export default {
  components: {
    Tracker,
    Vrm,
    WebRTC,
    Setting,
    Toast
  },
  data() {
    return {
      localStream: "",
      audioTrack: "",
      viewFlag: true,
      isTracking: false
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
    changeTracking() {
      this.isTracking = !this.isTracking;
      if (this.isTracking) {
        this.$refs.Tracker.startTracking();
      } else {
        this.$refs.Tracker.stopTracking();
      }
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