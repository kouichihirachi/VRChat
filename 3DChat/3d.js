//グローバル変数
let centerValue = 0.9;//顔が正面のときのxDeg値
let yParam = 1.6;//中央のときのatan2の値

/*
 描画で使う各種関数
*/
let middle_x = 0;
let center_x = 0;
let center_y = 0;
let center_z = 0;
let body_x = 218;
let body_y = 198;


let pre_i = 0;

function setting() {
  let positions = ctrack.getCurrentPosition();
  //alert(positions[1][1]);
  Initial_Tilit(positions);
  return;
}


//初期の傾きの設定
function Initial_Tilit(event) {

  /*for (var i = 0; i < POS.length; ++i) {
    dot(90, 90, 'gray');
  }*/
  let centerValue = 0.9;//顔が正面のときのxDeg値
  //let yParam = 1.6;//中央のときのatan2の値 

  // X軸方向の傾き
  let tops = ((event[0][1] + event[14][1]) / 2);
  let bottoms = ((event[6][1] + event[8][1]) / 2);
  let middle = bottoms + ((tops - bottoms) / 2);
  let x = (centerValue - (event[37][1] / middle)) / 0.2 * Math.PI / 2;
  center_x = Math.round(x * 10) / 10;
  // Y軸方向の傾き
  //center_y = Math.atan2(event[33][1] - event[7][1], event[33][0] - event[7][0]) ;
  //center_y=-Math.atan((event[33][0]-((event[25][0]+event[30][0])/2))/((event[14][0]-event[0][0])/2))*4;
  //Z軸方向の傾き
  //center_z=Math.PI / 2 - Math.atan2(event[62][1] - event[33][1], event[62][0] - event[33][0]);

  //body_x = event[62][0];
  //body_y = event[62][1];
  alert(stack[0].x);
  return x;
}



let fter = 40;
let bigin_x = 230;
let bigin_y = 200;



function mapEventTo3dTransforms(event) {
  //2次元座標から3次元の傾きを取得
  //全体的に微妙なところがある
  //let safter=20;

  if (event) {
    let scale = Math.sqrt(Math.pow((event[33][0] - event[62][0]), 2) + Math.pow((event[33][1] - event[62][1]), 2));
    let scaler = Math.sqrt(Math.pow((event[62][0] - bigin_x), 2) + Math.pow((event[62][1] - bigin_y), 2));

    if ((90 >= scaler) && (Math.abs(scale) <= (fter + 0.7))) {

      fter = scale;
      bigin_x = event[62][0];
      bigin_y = event[62][1];
      //safter=scaler;

      // X軸方向の傾き
      let tops = ((event[0][1] + event[14][1]) / 2);
      let bottoms = ((event[6][1] + event[8][1]) / 2);
      let middle = bottoms + ((tops - bottoms) / 2);
      let centerValue = 0.9;//顔が正面のときのxDeg値

      // if(middle_x==0){
      let xDeg = ((centerValue - (event[37][1] / middle)) / 0.2 * Math.PI / 2) - center_x;
      //}
      /// else{
      //let xDeg = ((middle-middle_x)*(centerValue-event[37][1]-center_x)/(0.2*middle*midle_x))*Math*PI;
      //}
      //alert(middle);
      //console.log(xDeg);

      // Y軸方向の傾き
      //var t2 = event[62], t1 = [(event[13][0] - event[1][0]) / 2, (event[13][1] - event[1][1]) / 2];
      //let yParam = 1.55;//中央のときのatan2の値
      //var yDeg = ((Math.atan2(event[33][1] - event[7][1], event[33][0] - event[7][0]) + yParam) / 0.1 * Math.PI / 6)-center_y;

      let yDeg = -Math.atan((event[33][0] - ((event[25][0] + event[30][0]) / 2)) / ((event[14][0] - event[0][0]) / 2)) * 4;

      // Z軸方向の傾き
      //let zDeg = (Math.PI / 2 - Math.atan2(event[62][1] - event[33][1], event[62][0] - event[33][0]))-center_z;

      let zDeg = Math.atan((event[27][1] - event[33][1]) / (event[32][0] - event[27][0])) * 1.5 - center_z;

      //pre_i=0;

      return {
        x: xDeg,
        y: yDeg,
        z: zDeg
      };

    }
    else {
      fter = 40;
      //bigin_x=(230+bigin_x)/2;
      //bigin_y=(200+bigin_y)/2;
    }
    //else  alert(scale);
  }
  /*else{
    let def=prediction();
    let xDeg=stack[19].x-def.x;
    let yDeg=stack[19].y-def.y;
    let zDeg=stack[19]-def.z;
    //alert(1);
    let xDeg=stack[18].x+0.1;
    let yDeg=stack[19].y+0.1;
    let zDeg=stack[19].z+0.1;
    pre_i+=1;

    return {
      x: xDeg,
      y: yDeg,
      z: zDeg
    };
  }
  */
}


function get_body_deg(event) {
  if (event) {

    /*let tops_x = ((event[0][0] + event[14][0]) / 2);
    let bottoms_x = ((event[6][0] + event[8][0]) / 2);
    let middle_x = bottoms_x + ((tops_x - bottoms_x) / 2);
    let tops_y = ((event[0][1] + event[14][1]) / 2);
    let bottoms_y = ((event[6][1] + event[8][1]) / 2);
    let middle_y = bottoms_y + ((tops_y - bottoms_y) / 2);
    let deg=Math.PI/2 + Math.atan2(middle_y-198,middle_x-218);*/

    //let aa=2;
    //let deg=Math.PI/2 + Math.atan2((event[62][1]+198)/2,event[62][0]-218);
    let deg = Math.PI / 2 + Math.atan2(event[62][1] - body_y, event[62][0] - body_x);
    if (event[7][1] > 290) deg = deg / 5;
    //else  let deg=0;
    //alert(event[7][1]);
    return -deg / 4.5;
    //let deg=(Math.PI / 2 - Math.atan2(event[62][1] - event[33][1], event[62][0] - event[33][0]))/2;
    /*if(Math.abs(event[62][0]-230)>20){
      let deg=(Math.PI / 2 - Math.atan2(event[62][1] - event[33][1], event[62][0] - event[33][0]))/2;
      //if(Math.abs(deg)<0.07) return 0;
      //else{
        if(deg>0.2) return 0.15;
        else{
          if(deg<-0.2)  return -0.15;
          //else return deg;
        } 
      //}
      
      //return deg/2;
    }*/

  }

}
function body_deg_limitter(body_deg) {
  if (body_deg > 0.3) body_deg = 0.3;
  else if (body_deg < -0.3) body_deg = -0.3;
  return body_deg;
}

function limiter(axis) {
  const maxlimit = 20 / 180 * Math.PI;//これ以下の動きは無視
  const minlimit = 10 / 180 * Math.PI;//これ以上の動きは無視
  this.prevX = 0;
  this.prevY = 0;
  this.prevZ = 0;
  let x, y, z;
  console.log(Math.abs(axis.x - this.prevX));
  if (Math.abs(axis.x - this.prevX) < maxlimit && Math.abs(axis.x - this.prevX) > minlimit) {
    x = axis.x;
    this.prevX = x;
  } else {
    if (axis.x > this.prevX) x = axis.x;
    else if (axis.x < this.prevX) x = axis.x;
  }
  if (Math.abs(axis.y - this.prevY) < maxlimit && Math.abs(axis.y - this.prevY) > minlimit) {
    y = axis.y;
    this.prevY = y;
  } else {
    if (axis.y > this.prevY) y = axis.y;
    else if (axis.y < this.prevY) y = axis.y;
  }
  if (Math.abs(axis.z - this.prevZ) < maxlimit && Math.abs(axis.z - this.prevZ) > minlimit) {
    z = axis.z;
    this.prevZ = z;
  } else {
    if (axis.z > this.prevZ) z = axis.z;
    else if (axis.z < this.prevZ) z = axis.z;
  }
  return {
    x: x,
    y: y,
    z: z
  };
}

//this.stack = [];

function getMovingAverage(axis) {
  //5回分の移動平均を取り，なめらかにする

  this.stack = [];
  averageAxis = { x: 0, y: 0, z: 0 };
  let a = 20;
  if (stack.length > a) {
    stack.shift();
    stack.push(axis);

    let limit_x = Math.abs(stack[a - 2].x - stack[a - 3].x);
    let limit_y = Math.abs(stack[a - 2].y - stack[a - 3].y);
    let limit_z = Math.abs(stack[a - 2].z - stack[a - 3].z);

    let difference_x = Math.abs(stack[a - 1].x - stack[a - 2].x);
    let difference_y = Math.abs(stack[a - 1].y - stack[a - 2].y);
    let difference_z = Math.abs(stack[a - 1].z - stack[a - 2].z);
    stack[a - 1].x = move_limit(limit_x, difference_x, stack[a - 1].x, stack[a - 2].x);
    stack[a - 1].y = move_limit(limit_y, difference_y, stack[a - 1].y, stack[a - 2].y);
    stack[a - 1].z = move_limit(limit_z, difference_z, stack[a - 1].z, stack[a - 2].z);

    for (let i = 0; i < stack.length; i++) {
      averageAxis.x += stack[i].x;
      averageAxis.y += stack[i].y;
      averageAxis.z += stack[i].z;
    }
    averageAxis.x /= stack.length;
    averageAxis.y /= stack.length;
    averageAxis.z /= stack.length;
    stack.pop();
    stack.push(averageAxis);

    return averageAxis;
  } else {
    return axis;
  }
}

function maximumLimiter(axis) {
  const limit = 70 / 180 * Math.PI;
  if (axis.x > limit) axis.x = limit;
  if (axis.y > limit / 2) axis.y = limit / 2;
  if (axis.z > limit) axis.z = limit;
  if (axis.x < -limit) axis.x = -limit;
  if (axis.y < -limit / 2) axis.y = -limit / 2;
  if (axis.z < -limit) axis.z = -limit;
  return axis;
}

function move_limit(limit, difference, after, before) {
  if ((difference < (limit * 2)) || (diffirence > 0.001)) after = before;
  else {//if(difference>limit){
    if (after > before) after = before + limit;
    else after = before - limit;
  }
  return after;
}
hans = -1.3;

function hans_up() {
  alert(hans);
  return -hans;
}

//破棄
function deg_limit(deg) {
  this.astack = [];
  averageAxis = 0;
  if (astack.length > 20) {
    for (let i = 0; i < astack.length; i++) {
      averageAxis += astack[i];
    }
    averageAxis /= astack.length;
    return averageAxis;
  }
  else {
    return deg;
  }
}


function prediction() {
  this.difference = [];
  if (pre_i == 0) {
    for (let i = 0; i < (stack.length - 1); i++) {
      difference.push(stack[i + 1] - stack[i]);
    }
    pre_i += 1;
    //近似直線を求める
    xline = rough_line(difference.x);
    yline = rough_line(difference.y);
    zline = rough_line(difference.z);
  }
  //求めた近似曲線から次の点を求める
  let x_eg = xline.a * pre_i + xline.b;
  let y_eg = yline.a * pre_i + yline.b;
  let z_eg = zline.a * pre_i + zline.b;
  return {
    x: x_eg,
    y: y_eg,
    z: z_eg
  }
}

function rough_line(x) {
  let katamuki, seppen;
  let sum_xy = 0, sum_x = 0, sum_y = 0, sum_x2 = 0;
  for (let i = 0; i < x.length; i++) {
    sum_xy += x[i] * i;
    sum_x += x[i];
    sum_y += i;
    sum_x2 += pow(x[i], 2);
  }
  a = (x.length * sum_xy - sum_x * sum_y) / (x.length * sum_x2 - Math.pow(sum_x, 2));
  b = (sum_x2 * sum_y - sum_xy * sum_x) / (x.length * sum_x2 - Math.pow(sum_x, 2));
  return {
    a: katamuki,
    b: seppen
  }
}


/*
Animate(){
  //alert(2);
  console.log("Called");
  isAnimate = true;
  let finished = true;
  if (currentVrm) {
    const deltaTime = clock.getDelta();
    const Animation = [
      {
        Bone: currentVrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.LeftUpperArm
        ).rotation.x,
        Deg: Math.PI / 2
      },
      {
        Bone: currentVrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.LeftLowerArm
        ).rotation.y,
        Deg: Math.PI / 2
      }
    ];
    for (let i = 0; i < Animation.length; i++) {
      const target = Animation[i].Deg;
      const Bone = Animation[i].Bone;
      const now = Bone;
      const diff = target - now;
      console.log(diff);
      if (diff > 0) {
        finished = false;
        currentVrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.LeftUpperArm
        ).rotation.x = clock.elapsedTime * 0.8;
        currentVrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.LeftLowerArm
        ).rotation.y = -clock.elapsedTime * 0.8;
      }
    }
    if (finished) isAnimate = false;
    currentVrm.update(deltaTime);
  }
},*/
