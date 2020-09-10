<template>
  <div id="Tracker">
    <!-- カメラ表示 -->
    <div id="container">
      <video id="camera" ref="camera" width="240" height="180" loop playsinline autoplay>
        <source src="~assets/test.mp4" />
      </video>
      <canvas ref="cameraOverlay" id="cameraOverlay" width="240" height="180"></canvas>
      <!-- {{volume}} -->
    </div>
  </div>
</template>
<style>
#cameraOverlay {
  position: absolute;
  top: 0px;
  left: 0px;
  -o-transform: scaleX(-1);
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
#camera {
  -o-transform: scaleX(-1);
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
#container {
  position: relative;
  width: 370px;
}
</style>
<script>
import clm from "clmtrackr";
import emotionClassifier from "./emotionClassifier.js";
import Stats from "stats.js";

const ctrack = new clm.tracker({
  faceDetection: {
    useWebWorkers: false,
  },
});

var classifier = new emotionClassifier(); // ★emotionClassifier オブジェクトを作成
classifier.init(); // ★classifier を所定の感情モデル（※2）で初期化

export default {
  name: "Tracker",
  data() {
    let render,
      tracker,
      vid,
      overlay,
      overlayCC,
      vidWidth,
      vidHeight,
      stack,
      analyser,
      frequencies,
      volume,
      isTracking,
      nose_length,
      nose_length2,
      center_x,
      center_y,
      center_z,
      isCameraEnable;
    return {
      render,
      tracker,
      vid,
      overlay,
      overlayCC,
      vidWidth,
      vidHeight,
      stack,
      analyser,
      frequencies,
      volume,
      isTracking,
      nose_length,
      nose_length2,
      center_x,
      center_y,
      center_z,
      isCameraEnable,
    };
  },
  async mounted() {
    this.vid = this.$refs.camera;
    this.overlay = this.$refs.cameraOverlay;
    this.overlayCC = this.overlay.getContext("2d");
    this.vidWidth = this.vid.width;
    this.vidHeight = this.vid.height;
    this.isTracking = false;
    this.drawLoop();
    ctrack.init();

    //fpsモニタリング用
    const stats = new Stats();
    document.body.appendChild(stats.domElement);
    // update stats on every iteration
    document.addEventListener(
      "clmtrackrIteration",
      function (event) {
        stats.update();
      },
      false
    );

    this.stack = [];
  },
  methods: {
    async startCamera() {
      const stream = await navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .catch(() => {
          alert("カメラが接続されていません");
        });

      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      let context = new AudioContext();
      this.analyser = context.createAnalyser();
      this.frequencies = new Uint8Array(this.analyser.frequencyBinCount);
      window.hackForMozzila = stream;
      await context.createMediaStreamSource(stream).connect(this.analyser);
      this.$emit("getAudioTrack", stream.getAudioTracks()[0]);

      this.vid.muted = true;
      this.vid.srcObject = stream;
      await this.vid.play();
    },
    getFrequency() {
      //周波数ごとの振幅を取得して配列に格納
      this.analyser.getByteFrequencyData(this.frequencies);
      return (
        this.frequencies.reduce(function (previous, current) {
          return previous + current;
        }) / this.analyser.frequencyBinCount
      );
    },
    drawLoop() {
      requestAnimationFrame(this.drawLoop);
      this.overlayCC.clearRect(0, 0, this.vidWidth, this.vidHeight);
      let axis = {};
      const CurrentPosition = ctrack.getCurrentPosition();
      if (CurrentPosition && this.isTracking) {
        let event = CurrentPosition;
        ctrack.draw(this.overlay);
        if (
          this.center_x != null &&
          this.center_y != null &&
          this.center_z != null
        ) {
          axis = this.mapEventTo3dTransforms(event);
          axis = this.maximumLimiter(axis);
          axis = this.limiter(axis);
          axis = this.getMovingAverage(axis);
        }

        //表情認識
        var parameters = ctrack.getCurrentParameters(); // ★現在の顔のパラメータを取得
        var emotion = classifier.meanPredict(parameters); // ★そのパラメータから感情を推定して emotion に結果を入れる
        axis.emotion = emotion ? emotion : undefined;
      }

      //口の動き
      if (this.analyser) {
        this.volume = Math.floor(this.getFrequency());
        const threshold = 10; //閾値以上の音を拾う
        this.volume = (this.volume - threshold) / (100 - threshold);
        axis.volume = this.volume;
      }

      if (axis === {}) axis = 0;
      this.$emit("axis", axis);
      return;
    },
    startTracking() {
      if (!this.isTracking) {
        if (this.vid != null) {
          this.vid.play();
          ctrack.start(this.vid);
        }
        this.isTracking = true;
      }
    },
    stopTracking() {
      if (this.isTracking) {
        this.isTracking = false;
      }
    },
    //初期設定:コメントアウト後で外す
    Initial_Tilit() {
      if (ctrack.getCurrentPosition() && this.isTracking) {
        //console.log("why");
        let event = ctrack.getCurrentPosition();
        let centerValue = 0.9; //顔が正面のときのxDeg値
        let yParam = 1.6; //中央のときのatan2の値

        //X軸方向の傾き
        let tops = (event[0][1] + event[14][1]) / 2;
        let bottoms = (event[6][1] + event[8][1]) / 2;
        let middle = bottoms + (tops - bottoms) / 2;
        this.center_x =
          Math.floor(
            ((((centerValue - event[37][1] / middle) / 0.2) * Math.PI) / 2) *
              100
          ) / 100;
        //Y軸方向の傾き
        this.center_y =
          Math.floor(
            -Math.atan(
              (event[33][0] - (event[25][0] + event[30][0]) / 2) /
                ((event[14][0] - event[0][0]) / 2)
            ) *
              4 *
              100
          ) / 100;
        //Z軸方向の傾き
        this.center_z =
          Math.floor(
            Math.atan(
              (event[27][1] - event[32][1]) / (event[32][0] - event[27][0])
            ) *
              1.5 *
              100
          ) / 100;

        return;
      }
    },
    mapEventTo3dTransforms(event) {
      //2次元座標から3次元の傾きを取得
      //全体的に微妙なところがある
      if (event) {
        //コメントアウト後で外す

        //現在の鼻の長さ

        //どのくらいの距離移動したか

        let tops = (event[0][1] + event[14][1]) / 2;
        let bottoms = (event[6][1] + event[8][1]) / 2;
        let middle = bottoms + (tops - bottoms) / 2;
        let centerValue = 0.9; //顔が正面のときのxDeg値
        let xDeg =
          (((centerValue - event[37][1] / middle) / 0.2) * Math.PI) / 2 -
          this.center_x;

        // Y軸方向の傾き
        let yDeg =
          -Math.atan(
            (event[33][0] - (event[25][0] + event[30][0]) / 2) /
              ((event[14][0] - event[0][0]) / 2)
          ) *
            4 -
          this.center_y;
        // Z軸方向の傾き
        let zDeg =
          Math.atan(
            (event[27][1] - event[32][1]) / (event[32][0] - event[27][0])
          ) *
            1.5 -
          this.center_z;
        //console.log(zDeg);
        return {
          x: xDeg,
          y: yDeg,
          z: zDeg,
        };
        //コメントアウト後で外す
        /*
        } else {
          this.nose_length2 = this.nose_length;
          return {
            x: 0,
            y: 0,
            z: 0,
          };
        }*/
      }
    },
    limiter(axis) {
      const maxlimit = (20 / 180) * Math.PI; //これ以下の動きは無視
      const minlimit = (10 / 180) * Math.PI; //これ以上の動きは無視
      this.prevX = 0;
      this.prevY = 0;
      this.prevZ = 0;
      let x, y, z;
      //console.log(Math.abs(axis.x - this.prevX));
      if (
        Math.abs(axis.x - this.prevX) < maxlimit &&
        Math.abs(axis.x - this.prevX) > minlimit
      ) {
        x = axis.x;
        this.prevX = x;
      } else {
        if (axis.x > this.prevX) x = axis.x;
        else if (axis.x < this.prevX) x = axis.x;
      }
      if (
        Math.abs(axis.y - this.prevY) < maxlimit &&
        Math.abs(axis.y - this.prevY) > minlimit
      ) {
        y = axis.y;
        this.prevY = y;
      } else {
        if (axis.y > this.prevY) y = axis.y;
        else if (axis.y < this.prevY) y = axis.y;
      }
      if (
        Math.abs(axis.z - this.prevZ) < maxlimit &&
        Math.abs(axis.z - this.prevZ) > minlimit
      ) {
        z = axis.z;
        this.prevZ = z;
      } else {
        if (axis.z > this.prevZ) z = axis.z;
        else if (axis.z < this.prevZ) z = axis.z;
      }
      return {
        x: x,
        y: y,
        z: z,
      };
    },
    getMovingAverage(axis) {
      //5回分の移動平均を取り，なめらかにする
      let averageAxis = { x: 0, y: 0, z: 0 };

      if (this.stack.length > 5) {
        this.stack.shift();
        this.stack.push(axis);
        for (let i = 0; i < this.stack.length; i++) {
          averageAxis.x += this.stack[i].x;
          averageAxis.y += this.stack[i].y;
          averageAxis.z += this.stack[i].z;
        }
        averageAxis.x /= this.stack.length;
        averageAxis.y /= this.stack.length;
        averageAxis.z /= this.stack.length;
        this.stack.pop();
        this.stack.push(averageAxis);
        return averageAxis;
      } else {
        this.stack.push(axis);
        return axis;
      }
    },
    maximumLimiter(axis) {
      const limit = (45 / 180) * Math.PI;
      if (axis.x > limit) axis.x = limit;
      if (axis.y > limit / 2) axis.y = limit / 2;
      if (axis.z > limit) axis.z = limit;
      if (axis.x < -limit) axis.x = -limit;
      if (axis.y < -limit / 2) axis.y = -limit / 2;
      if (axis.z < -limit) axis.z = -limit;
      return axis;
    },
  },
};
</script>
