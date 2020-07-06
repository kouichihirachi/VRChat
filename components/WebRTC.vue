<template>
  <div id="webrtc">
    <div class="row" ref="remoteStream"></div>
    <video width="720" height="540" class="pt-1" ref="mainStream" loop playsinline autoplay></video>
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
      messages: "",
      displayStream: ""
    };
  },
  props: ["localStream", "audioTrack"],
  async mounted() {
    this.peer = new peer({
      key: "2cc1c46b-a0e9-47bc-ab5e-65586b72ee58",
      debug: 3
    });
    //this.$toast.show("サーバーに接続しました");
    if (this.$nuxt.$route.query.room) {
      this.roomName = this.$nuxt.$route.query.room;
    }
    //this.displayStream = await navigator.mediaDevices.getDisplayMedia();
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
        this.$toast.show("入室しました");
      });
      this.room.once("data", data => {
        //データ受信
        /*チャット機能実装*/
        const user = data.peerId;
        const message = data.message;
      });
      this.room.on("peerJoin", peerId => {
        this.$toast.show(`${peerId} が入室しました`);
      });
      this.room.on("stream", async stream => {
        if (!this.connectedPeers.includes(stream.peerId)) {
          this.connectedPeers.push(stream.peerId);
          const newVideo = document.createElement("video");
          newVideo.width = 240;
          newVideo.height = 180;
          newVideo.srcObject = stream;
          newVideo.playsInline = true;
          newVideo.setAttribute("data-peer-id", stream.peerId);
          this.$refs.mainStream.srcObject = stream;
          //newVideo.className = "col-4";
          this.$refs.remoteStream.append(newVideo);
          await newVideo.play().catch(console.error);
        }
      });
      this.room.on("peerLeave", peerId => {
        this.$toast.show(`${peerId} が退室しました`);
        const remoteVideo = this.$refs.remoteStream.querySelector(
          "[data-peer-id='" + peerId + "']"
        );
        this.connectedPeers = this.connectedPeers.filter(id => id !== peerId);
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    },
    async startMirroir() {
      this.displayStream = await navigator.mediaDevices.getDisplayMedia();
      this.localStream = this.displayStream;
      this.localStream.addTrack(this.audioTrack);
    },
    mute() {
      this.localStream.getAudioTracks()[0].enabled = false;
    },
    unmute() {
      this.localStream.getAudioTracks()[0].enabled = true;
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
      this.$toast.show(`退室しました`);
    }
  }
};
</script>