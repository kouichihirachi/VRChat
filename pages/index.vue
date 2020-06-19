<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <tracker ref="Tracker" @axis="axis"></tracker>
      </div>
      <div class="col">
        <vrm ref="Vrm" @getStream="getStream" @getTrack="getTrack" />
      </div>
    </div>
    <div class="row">
      <WebRTC ref="WebRTC" :localStream="localStream" />
    </div>
    <div class="row">
      <button @click="startTracking" class="btn btn-success">Start Tracking</button>
      <button @click="stopTracking" class="btn btn-success">Stop Tracking</button>
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
      localStream: ""
    };
  },
  mounted() {},
  methods: {
    getStream(stream) {
      this.localStream = stream;
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