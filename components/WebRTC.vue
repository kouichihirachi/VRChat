<template>
  <div id="webrtc" class="container">
    <div ref="remoteStream"></div>
    <div class="row">
      <div class="form-inline">
        <div class="form-group mb-2">
          <input type="text" v-model="roomName" placeholder="Room Name" class="form-control" />
        </div>
        <button @click="connect" class="btn btn-info mb-2 mx-1">接続</button>
        <button @click="close" class="btn btn-info mb-2 mx-1">閉じる</button>
      </div>
    </div>
    <p style="white-space: pre-wrap;">{{messages}}</p>
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
      room: "",
      messages: ""
    };
  },
  props: ["localStream"],
  mounted() {
    this.peer = new peer({
      key: "2cc1c46b-a0e9-47bc-ab5e-65586b72ee58",
      debug: 3
    });
    this.messages += "Opend\n";
  },
  methods: {
    connect() {
      if (!this.roomName) {
        return;
      }
      this.room = this.peer.joinRoom(this.roomName, {
        mode: "mesh",
        stream: this.localStream
      });
      this.room.on("open", () => {
        this.messages += "Connected\n";
        this.connect(this.room);
      });
      this.room.on("data", data => {
        //データ受信
      });
      this.room.on("peerJoin", peerId => {
        this.messages += `=== ${peerId} joined ===\n`;
      });
      this.room.on("stream", async stream => {
        if (!this.connectedPeers.includes(stream.peerId)) {
          this.connectedPeers.push(stream.peerId);
          this.messages += "New Stream\n";
          const newVideo = document.createElement("video");
          newVideo.width = 400;
          newVideo.height = 300;
          newVideo.srcObject = stream;
          newVideo.playsInline = true;
          newVideo.setAttribute("data-peer-id", stream.peerId);
          this.$refs.remoteStream.append(newVideo);
          await newVideo.play().catch(console.error);
        }
      });
      this.room.on("peerLeave", peerId => {
        const remoteVideo = this.$refs.remoteStream.querySelector(
          "[data-peer-id=${peerId}]"
        );
        this.connectedPeers = connectedPeers.filter(id => id !== peerId);
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    },
    send(axis) {
      this.room.send(axis);
    },
    close() {
      Array.from(this.$refs.remoteStream.children).forEach(remoteVideo => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
      this.messages += "Closed\n";
    }
  }
};
</script>