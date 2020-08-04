<template>
  <video autoplay :srcObject.prop="stream" :peerId="peerId" width="360" height="270"></video>
</template>

<script>
export default {
  name: "Video",
  props:[
    "stream",
    "peerId"
  ]
}
</script>

<style scoped>

</style>
