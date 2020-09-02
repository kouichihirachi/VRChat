<template>
  <div class="container-fluid background">
    <div class="container">
      <div class="row">
        <div class="Mainbox">
        <!--jumbotron mt-5 pt-3 pb-3 bg-light md-5 mx-auto justify-content-center text-center-->
          <div class="text-center">
            <h1><span>V</span>会議</h1>
            <p class="text-muted">Make Your Conference More Fun!</p>
          </div>
          <hr />V会議はあなたがバーチャルアバターで
          <br />会議に参加できる新しいWeb会議システム
          <hr />
          <div class="form-group mb-2">
            <label for="roomId">RoomID</label>
            <input id="roomId" type="text" class="form-control" v-model="roomId" placeholder="RoomID" />
          </div>
          <div class="form-group">
            <nuxt-link :to="{name:'chat',query:{room:roomId}}" class="btn btn-info">会議を開始</nuxt-link>
          </div>
          <small class="hoi">
            RoomIDは自身で設定することも可能ですが
            <br />セキュリティ上の観点から推奨しません
          </small>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.Mainbox{
  margin:auto;
  margin-top:5em;
  text-align: center;
  width: 70%;
  padding:20px 50px;
  border-radius: 10px;
  background:rgba(255,255,255,0.5);
  border: double 6px #58ffff44;
  box-shadow: 8px 15px 40px #1a251a65 inset;
  font-size:2vw;
}

.text-center h1{
  font-size: 8vw;
  text-shadow: 6px 3px 5px silver;
  font-family: 'Yu Mincho';
  font-weight: bold;
}
.text-center span{
  font-size: 14vw;
  font-family: "BIZ UDP明朝";
  font-weight: Bold;
  font-style: italic;
}

.background {
  position: relative;
  height: 100vh;
  min-height: 300px;
  background-image: url("~assets/img/background.jpg");
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  z-index: 0;
  overflow: hidden;
}
.background::before {
  content: "";
  background: inherit;
  -webkit-filter: blur(5px);
  -moz-filter: blur(5px);
  -o-filter: blur(5px);
  -ms-filter: blur(5px);
  filter: blur(5px);
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  z-index: -1;
}

</style>
<script>
export default {
  data() {
    return {
      roomId: "test"
    };
  },
  mounted() {
    this.roomId = Math.random()
      .toString(32)
      .substring(2);
  }
};
</script>
