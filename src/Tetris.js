import {
  FlashOutAnimate,
  Animate
} from './FlashOutAnimate';
import {
  stageInfo,
  rects
} from './Tetris.Cfg';

// const bw = 20; //方块的长度
// const stageW = 10;
// const stageH = 16;

const {
  bw,
  stageH,
  stageW,
  blocks
} = stageInfo;

const center = {
  x: 1,
  y: 1
};

const GAME_PLAYED = 1;
const GAME_OVER = 0;

let gameStatus = GAME_PLAYED;

let begin = Date.now();


let ctx = null;

let cmd = null;

let activeAnimate = null;
let animationId = 0;

//绘舞台
function draw() {

  ctx.clearRect(0, 0, stageW * bw, stageH * bw);

  for (let i = 0; i < stageH; i++) {
    // let row = '';
    for (let j = 0; j < stageW; j++) {
      // let bb = blockList[ stageW*i+j ];
      drawBlock(i, j);
    }
  }
}

export function drawBlock(i, j) {
  /* eslint default-case:0 */
  switch (blocks[i][j]) {
    case 0:
      break;
    case 2:
      //停止的方块
      // bb.className = 'idel';
      _drawBlock(ctx, j * bw, i * bw, bw, '#0f0');
      break;
    case 1:
      //下落的方块
      _drawBlock(ctx, j * bw, i * bw, bw);
      break;
  }
}

//画出方块
function _drawBlock(ctx, x, y, width, color) {

  ctx.fillStyle = color || '#f00';

  ctx.fillRect(x, y, width, width);

  ctx.strokeRect(x, y, width, width);

}

let _90 = -Math.PI / 2,
  _cos90 = Math.cos(_90),
  _sin90 = Math.sin(_90);

function rotate(center, angle) {

  let beginX = center.x - 1;
  let endX = beginX + 3;
  let beginY = center.y - 1;
  let endY = beginY + 3;

  if (beginX < 0 || endX - 1 === stageW) {
    return;
  }

  if (angle === undefined) {
    angle = 90;
  }

  let tmp = null;

  //判断是否可以旋转
  let result = turnLeftTest(center);
  if (result === true) { /* console.log('不可旋转!'); */
    //
    return;

  } else {

    switch (result) {
      case 'right':

        //如果是从四个4格的竖条变形到横条
        if (blocks[endY][center.x] === 1 ? moveLeft(center, 2) : moveLeft(center)) {

          let rs = turnLeftTest(center);

          if (rs instanceof Array) {
            //如果右移后可以旋转
            beginX = center.x - 1;
            endX = beginX + 3;
            beginY = center.y - 1;
            endY = beginY + 3;
            tmp = rs;
            break;
          } else {
            //不能旋转的话恢复原位
            blocks[endY][center.x] === 1 ? moveRight(center, 2) : moveRight(center);
          }

        }

        return;
      case 'left':

        if (moveRight(center)) {
          let rs = turnLeftTest(center);

          if (rs instanceof Array) {
            //如果右移后可以旋转
            beginX = center.x - 1;
            endX = beginX + 3;
            beginY = center.y - 1;
            endY = beginY + 3;
            tmp = rs;
            break;
          } else {
            //不能旋转的话恢复原位
            moveLeft(center);
          }
        }
        return;
      case 'top':
      case 'bottom':
        return;
      default:
        tmp = result;
    }
  }
  // console.log(result)

  //判断是不是四格的长条
  let x4 = blocks[center.y][endX],
    y4 = blocks[endY][center.x];
  // let crossArea = false;
  if (x4 === 1 && (angle === 90 || angle === 270)) {
    //这是一个横向4格的形状
    blocks[center.y][endX] = 0;
    blocks[endY][center.x] = 1;

    // console.log('--1--', angle );
  } else if (y4 === 1 && (angle === 90 || angle === 270)) {
    //这是一个纵向4格的形状
    blocks[center.y][endX] = 1;
    blocks[endY][center.x] = 0;
  }

  for (let y = beginY, i = 0; y < endY; y++, i++) {
    for (let x = beginX, k = 0; x < endX; x++, k++) {

      blocks[y][x] !== 2 && (blocks[y][x] = tmp[i][k]);

    }
  }

}

let ROTATE = 32,
  LEFT = 37,
  RIGHT = 39,
  DOWN = 40;

document.onkeydown = function (e) {
  cmd = e.keyCode;

  switch (cmd) {

    case ROTATE:
      rotate(center);
      draw();
      break;
    case LEFT:
      moveLeft(center);
      draw();
      break;
    case RIGHT:
      moveRight(center);
      draw();
      break;
    case DOWN:
      fallDown(center);
      draw();

  }

};


function fallDown(center) {

  //对下落方向做碰撞检测
  for (let endY = center.y + 3; endY >= center.y; endY--) {
    for (let startX = center.x - 1, endX = startX + 4; startX < endX; startX++) {

      //确保数组下标不越界
      if (!blocks[endY] || (blocks[endY][startX] &&
          blocks[endY][startX]) === 2) {
        let preY = endY - 1;
        if (blocks[preY]) {
          // let preStatus = blocks[preY][startX];
          //判断在这格上方的格子是不是下落的方块
          if (blocks[preY][startX] === 1) {
            return false;
          }
        }

      }
    }
  }


  //从底部开始循环
  for (let endY = center.y + 3; endY >= center.y; endY--) {
    for (let startX = center.x - 1, endX = startX + 4; startX < endX; startX++) {
      let flagY = endY - 1;
      //确保数组下标不越界
      if (blocks[flagY] && blocks[flagY][startX]) {
        let preStatus = blocks[flagY][startX];
        if (preStatus === 1) {
          blocks[endY][startX] = preStatus;
          blocks[endY - 1][startX] = 0;
        }
      }
    }
  }
  center.y++;
  return true;
}

/**
 *对左旋转做碰撞检测
 *是：碰撞
 *否：没碰撞
 */
function turnLeftTest(center) {
  let top = {
    x: center.x,
    y: center.y - 1,
    value: blocks[center.y - 1][center.x]
  };
  if (top.value === 1 && blocks[top.y][center.x - 1] === 2) {
    return 'left';
  }

  let left = {
    x: center.x - 1,
    y: center.y,
    value: blocks[center.y][center.x - 1]
  };
  if (left.value === 1 && blocks[center.y + 1][left.x] === 2) {
    return 'left';
  }

  let right = {
    x: center.x + 1,
    y: center.y,
    value: blocks[center.y][center.x + 1]
  };
  if (right.value === 1 && blocks[center.y - 1][right.x] === 2) {
    return 'right';
  }

  let bottom = {
    x: center.x,
    y: center.y + 1,
    value: blocks[center.y + 1][center.x]
  };
  if (bottom.value === 1 && blocks[center.y][center.x + 1] === 2) {
    return 'right';
  }

  let endX = center.x + 2,
    endY = center.y + 2;

  let x4 = blocks[center.y][endX],
    y4 = blocks[endY] && blocks[endY][center.x];
  if (x4 === 1) {
    //这是一个横向4格的形状
    if (y4 === 2 || y4 === undefined) {
      //如果旋转后会碰到死亡的方块，不让其旋转
      return true;
    }

  } else if (y4 === 1) {
    //这是一个纵向4格的形状
    if (x4 === 2 || x4 === undefined) {
      // crossArea = true;
      return 'right';
    }
  }
  //如果是4格长条，判断右下角是否有死亡的方块，有就不能旋转
  if (blocks[endY][endX] === 2 ||
    blocks[center.y + 1][endX] === 2) {
    return 'right';
  }

  let beginX = center.x - 1;
  endX = beginX + 3;
  let beginY = center.y - 1;
  endY = beginY + 3;
  let tmp = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  for (let y = beginY, i = 0; y < endY; y++, i--) {
    for (let x = beginX, k = 0; x < endX; x++, k++) {

      let rx = (_cos90 * (k - 1) - _sin90 * (i + 1) + 1 + 0.01) >> 0;
      let ry = -1 * (_cos90 * (i + 1) + _sin90 * (k - 1) - 1 - 0.01) >> 0;

      let nx = beginX + rx;

      if (blocks[beginY + ry][nx] === 2) {
        //console.log('======>不能旋转');

        if (nx < center.x) {
          //rotate(center, angle);
          return 'left';
        } else if (nx > center.x) {
          return 'right';
        }


      }

      blocks[y][x] !== 2 && (tmp[ry][rx] = blocks[y][x] ? 1 : 0);

    }
  }

  return tmp;
}

/**
 *对右旋转做碰撞检测
 */
/* eslint no-unused-vars: "off" */
function turnRightTest(center) {

  let top = {
    x: center.x,
    y: center.y - 1,
    value: blocks[center.y - 1][center.x]
  };
  if (top.value === 1 && blocks[top.y][center.x + 1] === 2) {
    return true;
  }

  let left = {
    x: center.x - 1,
    y: center.y,
    value: blocks[center.y][center.x - 1]
  };
  if (left.value === 1 && blocks[center.y - 1][left.x] === 2) {
    return true;
  }

  let right = {
    x: center.x + 1,
    y: center.y,
    value: blocks[center.y][center.x + 1]
  };
  if (right.value === 1 && blocks[center.y + 1][right.x] === 2) {
    return true;
  }

  let bottom = {
    x: center.x,
    y: center.y + 1,
    value: blocks[center.y + 1][center.x]
  };
  if (bottom.value === 1 && blocks[bottom.y][center.x - 1] === 2) {
    return true;
  }
  return false;
}

/**
 *左移
 */
function moveLeft(center, step) {

  if (center.x === 0) {
    return false;
  }

  step = step || 1;

  let beginX = center.x - 1,
    endX = beginX + 3;
  let beginY = center.y - 1,
    endY = beginY + 4;

  for (let x = beginX; x < endX; x++) {
    for (let y = beginY; y < endY; y++) {
      let tb = blocks[y];

      //判断是否可移动
      if (tb && tb[x] === 1) {
        //console.log('-------------->>', x);
        let i = 1;
        while (i <= step) {

          if (tb[x - i] === undefined || tb[x - i] === 2) return false;
          i++;
        }

      }
    }
  }

  endX += 2;
  endY += 1;

  for (let x = beginX; x < endX; x++) {
    for (let y = beginY; y < endY; y++) {
      let tb = blocks[y] && blocks[y][x];

      let dx = x - step;

      let leftTb = blocks[y] && blocks[y][dx];

      if (tb === 1) {
        (blocks[y][dx] = tb);
      } else if (leftTb !== 2) {
        leftTb && (blocks[y][dx] = 0);
      }
    }
  }

  center.x -= step;
  return true;
}

/**
 *右移
 *false 不能移动
 */
function moveRight(center, step) {

  if (center.x === stageW - 1) {
    return;
  }

  step = step || 1;

  let endX = center.x - 1,
    beginX = center.x + 2;
  let beginY = center.y - 1,
    endY = beginY + 3;

  for (let x = beginX; x >= endX; x--) {
    for (let y = beginY; y < endY; y++) {
      let tb = blocks[y];

      //判断是否可移动
      if (tb && tb[x] === 1) {
        let i = 1;
        while (i <= step) {

          if (tb[x + i] === undefined || tb[x + i] === 2) return false;
          i++;
        }
      }
    }
  }

  endX--;
  endY += 2;

  for (let x = beginX; x >= endX; x--) {
    for (let y = beginY; y < endY; y++) {
      let tb = blocks[y] && blocks[y][x];

      let dx = x + step;

      let rightTb = blocks[y] && blocks[y][dx];

      if (tb === 1) {
        (blocks[y][dx] = tb);
      } else if (rightTb !== 2) {
        rightTb && (blocks[y][dx] = 0);
      }
    }
  }

  center.x += step;
  return true;
}

/**
 *生成新方块
 */
function newRect(center) {

  //把原来的方块从状态1变为2
  let beginX = center.x - 1;
  let endX = beginX + 4;
  let beginY = center.y - 1;
  let endY = beginY + 4;

  for (let x = beginX; x < endX; x++) {
    for (let y = beginY; y < endY; y++) {
      let tb = blocks[y];

      //判断是否可移动
      if (tb && tb[x] === 1) {
        tb[x] = 2;
      }

    }
  }



  const rect = rects[(Math.random() * rects.length) >> 0];
  center.x = (stageW / 2) >> 0;
  center.y = 1;

  beginX = center.x - 1;
  endX = beginX + 4;
  beginY = center.y - 1;
  endY = beginY + 4;

  for (let y = beginY, i = 0; y < endY; y++, i++) {
    for (let x = beginX, k = 0; x < endX; x++, k++) {

      let block = rect[i][k];

      if (blocks[y][x] === 0) {
        blocks[y][x] = block;
      } else {
        /* eslint no-console:0 */
        console.log('GAME OVER');
        gameOver();
        return;
      }

    }
  }

  let angle = 90 * (Math.random() * 4 >> 0);

  if (0 === blocks[3][center.x] || (0 !== angle % 180)) {
    rotate(center, angle);
  }

}

/**
 *消除行
 */
function scan() {

  let rowsToRemove = [];

  for (let i = 0; i < stageH; i++) {

    let canBeRemove = true;

    for (let j = 0; j < stageW; j++) {
      if (blocks[i][j] !== 2) {
        canBeRemove = false;
        break;
      }

    }

    if (canBeRemove) {
      rowsToRemove.push(i);
    }

  }

  if (rowsToRemove.length > 0) {

    activeAnimate = Animate.start(new FlashOutAnimate(ctx, 3, rowsToRemove));
    activeAnimate.running = true;

  }

}

function gameOver() {

  ctx.clearRect(0, 0, stageW * bw, stageH * bw);
  ctx.fillStyle='#333333';
  ctx.textAlign='center';
  ctx.font='bold 30px Arial';
  ctx.fillText('GAME OVER', stageW * bw * .5, stageH * bw * 0.5);
  stopGame();
}

function mainLoop(timestamp) {
  let now = Date.now();

  if (now - begin >= 500 && GAME_OVER !== gameStatus && (!activeAnimate || !activeAnimate.running)) {
    // console.log(now - begin);

    if (!fallDown(center)) {
      newRect(center);
      scan();
    }
    GAME_OVER !== gameStatus && draw();
    begin = now;
  }

  Animate.loop(timestamp);
  animationId = window.requestAnimationFrame(mainLoop);
}

export function stopGame() {
  gameStatus = GAME_OVER;
  cancelAnimationFrame(animationId);
}

export function startGame(_ctx) {
  ctx = _ctx;
  ctx.strokeStyle = '#00f';

  newRect(center);
  draw();
  mainLoop(0);
}