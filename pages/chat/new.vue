<template>
  <div class="container">
    <div class="row">
      <div class="col-4 bg-dark">
        <setting />
      </div>
      <div class="col-8 bg-info"></div>
    </div>
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
  }
};
</script>