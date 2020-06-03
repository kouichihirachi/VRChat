<template>
  <div class="container">
    <tracker ref="Tracker" @axis="axis"></tracker>
    <vrm ref="Vrm"></vrm>
    <br />
    <video
      id="preview"
      width="400"
      height="300"
      loop
      playsinline
      autoplay
    ></video>
    <button @click="startTracking">Start Tracking</button>
  </div>
</template>

<script>
import Tracker from "~/components/Tracker.vue";
import Vrm from "~/components/Vrm.vue";

export default {
  components: {
    Tracker,
    Vrm
  },
  mounted() {
    let canvas = this.$refs.Vrm.$refs.model;
    let video = document.getElementById("preview");
    let stream = canvas.captureStream(30);
    video.srcObject = stream;
  },
  methods: {
    startTracking() {
      this.$refs.Tracker.startTracking();
    },
    axis(axis) {
      this.$refs.Vrm.RenderVrm(axis);
    }
  }
};
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
