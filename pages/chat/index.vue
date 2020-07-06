<template>
  <div class="container-fluid background">
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
          <div class="row">
            <tracker ref="Tracker" @axis="axis" @getAudioTrack="getAudioTrack" class="mt-3 mb-3"></tracker>
          </div>
          <div class="row">
            <vrm ref="Vrm" @getStream="getStream" @getTrack="getTrack" />
          </div>
          <div class="row">
            <div class="jumbotron mt-3 pt-3 pb-3 bg-light">
              <button @click="changeTracking" class="btn btn-success mr-1">
                <font-awesome-icon v-if="!isTracking" icon="stop" />
                <font-awesome-icon v-if="isTracking" icon="play" />
              </button>
              <button @click="toggleConnect" class="btn btn-info">{{isConnected?"切断":"接続"}}</button>
              <button class="btn btn-dark" @click="openSetting">
                <font-awesome-icon icon="cogs" />
              </button>
              <button @click="toggleMute" class="btn btn-info">
                <font-awesome-icon v-if="isMuted" icon="volume-up" />
                <font-awesome-icon v-if="!isMuted" icon="volume-off" />
              </button>
            </div>
          </div>
        </div>
        <div class="col pt-3">
          <WebRTC ref="WebRTC" :localStream="localStream" :audioTrack="audioTrack" />
        </div>
      </div>
      <toast />
    </div>
  </div>
</template>
<style>
.background {
  position: relative;
  height: 100vh;
  min-height: 300px;
  background-image: url("~assets/img/background.jpg");
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  z-index: 0;
  overflow: hidden;
}
.background::before {
  content: "";
  background: inherit;
  -webkit-filter: blur(5px);
  -moz-filter: blur(5px);
  -o-filter: blur(5px);
  -ms-filter: blur(5px);
  filter: blur(5px);
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  z-index: -1;
}
</style>
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
      isTracking: false,
      isConnected: false,
      isMuted: false
    };
  },
  mounted() {},
  methods: {
    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.isMuted) this.$refs.WebRTC.mute();
      else this.$refs.WebRTC.unmute();
    },
    connect() {
      this.$refs.WebRTC.connect();
    },
    close() {
      this.$refs.WebRTC.close();
    },
    toggleConnect() {
      this.isConnected = !this.isConnected;
      if (this.isConnected) this.$refs.WebRTC.connect();
      else this.$refs.WebRTC.close();
    },
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