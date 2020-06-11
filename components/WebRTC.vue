<template>
  <div id="webrtc" class="container">
    <div class="row"></div>
    <div class="row">
      <div class="form-inline">
        <div class="form-group mb-2">
          <input type="text" v-model="roomName" placeholder="Room Name" class="form-control" />
        </div>
        <button @click="connect" class="btn btn-info mb-2 mx-1">接続</button>
      </div>
    </div>
  </div>
</template>
<script>
import peer from "skyway-js";
export default {
  data: () => {
    return {
      roomName: "",
      peer: "",
      connectedPeers: [],
      room: ""
    };
  },
  mounted() {
    this.peer = new peer({
      key: "2cc1c46b-a0e9-47bc-ab5e-65586b72ee58",
      debug: 3
    });
  },
  methods: {
    connect() {
      if (!this.roomName) {
        return;
      }
      this.room = this.peer.joinRoom("mesh_text_" + this.roomName);
      this.room.on("open", () => {
        this.connect(this.room);
      });
      this.room.on("data", data => {
        this.$emit("renderRemote", data.data);
      });
    },
    send(axis) {
      this.room.send(axis);
    }
  }
};
</script>