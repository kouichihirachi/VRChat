<template>
  <div class="container">
    <tracker ref="Tracker" @axis="axis"></tracker>
    <vrm ref="Vrm"></vrm>
    <br />
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
  mounted() {},
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
