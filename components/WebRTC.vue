<template>
  <div id="webrtc">
    <div class="row" ref="remoteStream"></div>
    <div class="row">
      <div class="form-inline">
        <div class="form-group mb-2">
          <input type="text" v-model="roomName" placeholder="Room Name" class="form-control" />
        </div>
        <button @click="connect" class="btn btn-info mb-2 mx-1">接続</button>
        <button @click="close" class="btn btn-info mb-2 mx-1">閉じる</button>
      </div>
    </div>
    <div class="row">
      <textarea v-model="messages" class="form-control col-6"></textarea>
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
      room: "",
      messages: ""
    };
  },
  props: ["localStream", "audioTrack"],
  mounted() {
    this.peer = new peer({
      key: "2cc1c46b-a0e9-47bc-ab5e-65586b72ee58",
      debug: 3
    });
    this.messages += "サーバーに接続しました\n";
  },
  methods: {
    connect() {
      if (!this.roomName) {
        return;
      }
      this.localStream.addTrack(this.audioTrack);
      this.room = this.peer.joinRoom(this.roomName, {
        mode: "sfu",
        stream: this.localStream
      });
      this.room.once("open", () => {
        this.messages += "体育館に入室しました\n";
      });
      this.room.once("data", data => {
        //データ受信
      });
      this.room.on("peerJoin", peerId => {
        this.messages += `${peerId} が入室しました\n`;
      });
      this.room.on("stream", async stream => {
        if (!this.connectedPeers.includes(stream.peerId)) {
          this.connectedPeers.push(stream.peerId);
          const newVideo = document.createElement("video");
          newVideo.width = 400;
          newVideo.height = 300;
          newVideo.srcObject = stream;
          newVideo.playsInline = true;
          newVideo.setAttribute("data-peer-id", stream.peerId);
          newVideo.className = "col-4";
          this.$refs.remoteStream.append(newVideo);
          await newVideo.play().catch(console.error);
        }
      });
      this.room.on("peerLeave", peerId => {
        this.messages += `${peerId} が退場しました\n`;
        const remoteVideo = this.$refs.remoteStream.querySelector(
          "[data-peer-id='" + peerId + "']"
        );
        this.connectedPeers = this.connectedPeers.filter(id => id !== peerId);
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
      this.room.close();
      this.messages += "自主退場しました\n";
    }
  }
};
</script>