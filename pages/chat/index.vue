<template>
  <div class="container">
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
  </div>
</template>

<script>
import Tracker from "~/components/Tracker.vue";
import Vrm from "~/components/Vrm.vue";
import WebRTC from "~/components/WebRTC.vue";

export default {
  components: {
    Tracker,
    Vrm,
    WebRTC
  },
  data() {
    return {
      localStream: "",
      audioTrack: ""
    };
  },
  mounted() {},
  methods: {
    getStream(stream) {
      this.localStream = stream;
    },
    getAudioTrack(track) {
      this.audioTrack = track;
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