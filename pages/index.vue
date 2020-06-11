<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <tracker ref="Tracker" @axis="axis"></tracker>
      </div>
      <div class="col">
        <vrm ref="Vrm"></vrm>
        <vrm ref="RemoteVrm"></vrm>
      </div>
    </div>
    <div class="row">
      <WebRTC ref="WebRTC" @renderRemote="renderRemote" />
    </div>
    <button @click="startTracking" class="btn btn-success">Start Tracking</button>
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
  mounted() {},
  methods: {
    startTracking() {
      this.$refs.Tracker.startTracking();
    },
    axis(axis) {
      this.$refs.Vrm.RenderVrm(axis);
      this.$refs.WebRTC.send(axis);
    },
    renderRemote(axis) {
      this.$refs.RemoteVrm.RenderVrm(axis);
    }
  }
};
</script>