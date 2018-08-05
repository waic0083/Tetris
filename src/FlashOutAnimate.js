import {
  drawBlock
} from './Tetris';

import {stageInfo} from './Tetris.Cfg';

const {
  bw,
  stageW,
  blocks
} = stageInfo;

export class FlashOutAnimate {

  constructor(ctx, flashTime, rowsToRemove) {
    this._flashTime = flashTime;
    this._rowsToRemove = rowsToRemove;
    this.index = null;
    this._lastTime = 0;
    this.ctx = ctx;
  }

  update(timestamp) {

    if (this._lastTime === 0 || (timestamp - this._lastTime > 300)) {
      this.flashOut(this._flashTime, this._rowsToRemove);
      this._flashTime--;
      this._lastTime = timestamp;
    }

  }

  flashOut(flashTime, rowsToRemove) {

    let ctx = this.ctx;

    ctx.save();

    ctx.globalAlpha = (flashTime % 2 === 0 ? 0.2 : 1);

    rowsToRemove.forEach(function (i) {

      ctx.clearRect(0, i * bw - 1, stageW * bw, bw);

      for (let j = 0; j < stageW; j++) {
        drawBlock(i, j);
      }
    });

    ctx.restore();

    if (flashTime < 0) {
      //结束当前动画
      Animate.stop(this.index);

      rowsToRemove.forEach((i) => {
        this.rowdown(i);
      });

      this.running = false;
    }
  }

  /**
   *消除后调用此方法向下移
   */
  rowdown(rowId) {
    for (let i = rowId; i >= 0; i--) {
      for (let j = 0; j < stageW; j++) {

        if (blocks[i][j] !== 1) {
          let preBlock = i - 1 < 0 ? 0 : blocks[i - 1][j];

          blocks[i][j] = (preBlock === 1 ? 0 : preBlock);
        }
      }
    }
  }
}

export const Animate = {

  queue: {},
  start: function (animation) {
    let objId = 'animate_' + this.queue.length;
    this.queue[objId] = animation;
    animation.index = objId;
    animation.running = true;
    return animation;
  },

  stop: function (objectId) {
    delete this.queue[objectId];
  },

  loop: function (timestamp) {

    let queue = this.queue;

    Object.keys(queue).forEach(function (key) {
      (queue[key].update) && (queue[key].update(timestamp));
    });
  }
};