<template>
  <div id="webrtc">
    <div class="row" id="remoteStream" >
      <Video
        v-for="(stream,key) in remoteStreams"
        autoplay
        :key="key"
        :stream="stream.stream"
        :peerId="stream.peerId"
        v-on:focused="focus"
      ></Video>
    </div>
    <video
      width="360"
      height="270"
      class="pt-1"
      :srcObject.prop="focusVideo.stream"
      loop
      playsinline
      autoplay
    ></video>
  </div>
</template>
<style>
#remoteStream {
  background: gray;
  width: 480px;
  height: 210px;
  padding: 10px;
  margin: 0 auto;
  overflow: auto;
}
</style>
<script>
import Peer from "skyway-js";
import Video from "~/components/Video.vue";

export default {
  components: {
    Video,
  },
  data: () => {
    return {
      roomName: "",
      peer: "",
      connectedPeers: [],
      remoteStreams: [],
      room: "",
      messages: "",
      displayStream: "",
      focusVideo: "",
    };
  },
  props: ["localStream", "audioTrack"],
  async mounted() {
    this.peer = new Peer({
      key: "2cc1c46b-a0e9-47bc-ab5e-65586b72ee58",
      debug: 3,
    });
    if (this.$nuxt.$route.query.room) {
      this.roomName = this.$nuxt.$route.query.room;
    }
  },
  methods: {
    connect() {
      if (!this.roomName) {
        return;
      }
      if (this.audioTrack > 0) this.localStream.addTrack(this.audioTrack);
      this.room = this.peer.joinRoom(this.roomName, {
        mode: "sfu",
        stream: this.localStream,
      });
      this.room.once("open", () => {
        this.$toast.show("入室しました");
      });
      this.room.once("data", (data) => {
        //データ受信
        /*チャット機能実装*/
        const user = data.peerId;
        const message = data.message;
      });
      this.room.on("peerJoin", (peerId) => {
        this.$toast.show(`${peerId} が入室しました`);
      });
      this.room.on("stream", async (stream) => {
        if (!this.connectedPeers.includes(stream.peerId)) {
          this.connectedPeers.push(stream.peerId);
          this.remoteStreams.push({
            peerId: stream.peerId,
            stream: stream,
          });
        }
      });
      this.room.on("peerLeave", (peerId) => {
        this.$toast.show(`${peerId} が退室しました`);
        this.connectedPeers = this.connectedPeers.filter((id) => id !== peerId);
        this.remoteStreams = this.remoteStreams.filter(
          (stream) => stream.peerId !== peerId
        );
        if (peerId === this.focusVideo.peerId) this.focusVideo = "";
      });
    },
    async startMirror() {
      try {
        this.displayStream = await navigator.mediaDevices.getDisplayMedia();
      } catch {
        alert("画面共有を開始できません");
      }
      this.localStream = this.displayStream;
      if (this.audioTrack !== -1) this.localStream.addTrack(this.audioTrack);
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
      this.remoteStreams = [];
      this.room.close();
      this.$toast.show(`退室しました`);
      this.focusVideo = "";
    },
    focus(data) {
      this.focusVideo = data;
    },
  },
};
</script>
