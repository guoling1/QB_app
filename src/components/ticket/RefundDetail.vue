<template lang="html">
  <div class="main">
    <div class="train-info">
      <div class="left">
        <div class="time">{{massages.startTime}}</div>
        <div class="place">{{massages.fromStationName}}</div>
        <div class="date">{{otherInfo.startDate}}</div>
      </div>
      <div class="middle">
        <div class="trains">{{massages.checi}}</div>
        <div class="ch"></div>
        <div class="date">耗时{{otherInfo.runTime}}</div>
      </div>
      <div class="right">
        <div class="time">{{massages.endTime}}</div>
        <div class="place">{{massages.toStationName}}</div>
        <div class="date">{{otherInfo.arriveDate}}</div>
      </div>
    </div>
    <ul class="bottom">
      <li v-for="(passenger,index) in massages.passengers">
        <div class="left">
          <span class="name">{{passenger.name}}</span>
          <span class="type">{{passenger.piaoTypeName}}</span>

          <p class="number">
            {{passenger.passportSeNo}}
          </p>

          <p class="state" id="esc">{{passengerStatus[passenger.status-1]}}
            <span @click="show(index)" v-if="passenger.status==2">退票</span>
          </p>
        </div>
        <div class="right">
          <p class="seat">{{passenger.cxin}}</p>

          <p class="seatType">{{massages.zwName}}</p>

          <p class="price">￥{{passenger.price}}</p>
        </div>
      </li>
    </ul>
    <div class="return" @click="back">返回</div>
    <div class="mask" v-if="$open">
      <!-- 第一层遮罩：确认退票 -->
      <div class="floor" v-if="$$open">
        <div class="space_t">
          <div class="xx" @click="show"></div>
          <div class="word">退票</div>
        </div>
        <div class="table">
          <div class="train-info">
            <div class="left">
              <div class="time">{{massages.startTime}}</div>
              <div class="place">{{massages.fromStationName}}</div>
              <div class="date">{{otherInfo.startDate}}</div>
            </div>
            <div class="middle">
              <div class="trains">{{massages.checi}}</div>
              <div class="ch"></div>
              <div class="date">耗时{{otherInfo.runTime}}</div>
            </div>
            <div class="right">
              <div class="time">{{massages.endTime}}</div>
              <div class="place">{{massages.toStationName}}</div>
              <div class="date">{{otherInfo.arriveDate}}</div>
            </div>
          </div>
          <ul class="bottom">
            <li>
              <div class="left">
                <span class="name">{{massages.passengers[this.$data.$index].name}}</span>
                <span class="type">{{massages.passengers[this.$data.$index].piaoTypeName}}</span>

                <p class="number">
                  {{massages.passengers[this.$data.$index].passportSeNo}}
                </p>

                <p class="state">{{passengerStatus[massages.passengers[this.$data.$index].status-1]}}</p>
              </div>
              <div class="right">
                <p class="seat">{{massages.passengers[this.$data.$index].cxin}}</p>

                <p class="seatType">{{massages.zwName}}</p>

                <p class="price">￥{{massages.passengers[this.$data.$index].price}}</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="notice">
          <p>在线退票时间：6:00-22:55（其他时间须前往火车站窗口办理)</p>

          <p>发车前35分钟且未打印纸质车票，可在“我的订单”中申请退票</p>

          <p>已经打印车票，需要携带车票前往火车站窗口办理。</p>

          <p>退票手续费：</p>

          <p>发车前15天（不含）以上，不收取退票费；</p>

          <p>发车前49小时以上，手续费5%；</p>

          <p>发车前25-49小时，手续费10%；</p>

          <p>发车前25小时内，手续费20%；</p>
        </div>
        <div class="button">
          <p @click="show">不退了</p>

          <p @click.self="confirm">确定退票</p>
        </div>
      </div>
      <!-- 第二层：退票成功 -->
      <div class="success" v-else="$$open">
        <div class="content">
          <img src="../../assets/success.png" alt=""/>

          <p>退票成功</p>
        </div>
        <div class="sure" @click.self="success()">确定</div>
      </div>
    </div>
    <message></message>
  </div>
</template>

<script lang="babel">
  import Vue from 'vue'
  import Message from '../Message.vue'

  export default {
    name: 'menu',
    components: {
      Message
    },
    data () {
      return {
        open: false,
        $open: true,
        massages: [],
        passengerStatus: ["出票中", "出票成功", "出票失败", "退票中", "退票中", "已退票", "退票失败", "已取消"]
      }
    },
    beforeCreate: function () {
      let query = this.$route.query;
      if (query.grabTicketFormId == undefined) {
        this.$http.post('/order/queryById', {
          orderFormId: query.orderid
        }).then(function (res) {
          this.$data.massages = res.data;
        }, function () {
          this.$store.commit('MESSAGE_PROMPT_SHOW', {
            text: '查询订单信息失败'
          })
        });
      } else {
        this.$http.post('/order/grab/queryById', {
          grabTicketFormId: query.grabTicketFormId,
          appid: query.appid,
          uid: query.uid
        }).then(function (res) {
          this.$data.massages = res.data;
        }, function () {
          this.$store.commit('MESSAGE_PROMPT_SHOW', {
            text: '查询订单信息失败'
          })
        });
      }
    },
    methods: {
      show: function (index) {
        if (index == "undefined") {
          this.$data.open = !this.$data.open;
        } else {
          this.$data.open = !this.$data.open;
          this.$data.$index = index;
        }
      },
      back: function () {
        this.$router.go(-1);
      },
      confirm: function () {
        this.$http.post('/ticket/refund', {
          orderFormDetailId: this.$data.massages.passengers[this.$data.$index].orderFormDetailId
        }).then(function () {
          this.$data.$open = !this.$data.$open;
        }, function () {
          this.$store.commit('MESSAGE_PROMPT_SHOW', {
            text: '退票失败'
          })
        });
      },
      success: function () {
        this.$data.open = false;
        this.$data.$open = true;
        this.$data.massages.passengers[this.$data.$index].status = 9;
      }
    },
    computed: {
      $open: function () {
        return this.$data.open
      },
      $$open: function () {
        return this.$data.$open;
      },
      otherInfo: function () {
        let a = 0;
        let b = 0;
        // 乘车人数 车票价格
        for (let i in this.$data.massages.passengers) {
          a++;
          b = this.$data.massages.passengers[i]['price'];
        }
        // 套餐价格
        let c = (this.$data.massages.totalPrice - this.$data.massages.ticketTotalPrice) / a;
        // 运行时间
        let runMin = this.$data.massages.runTime;
        let runH = 0;
        let runM = 0;
        if (runMin >= 60) {
          runH = parseInt(runMin / 60);
          runM = runMin % 60;
        }
        // 出发日期 到达日期
        let weekWord = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        let start = new Date(this.$data.massages.startDate);
        let arrive = new Date(this.$data.massages.endDate);
        return {
          passengersNum: a,
          ticket: b,
          insurance: c,
          runTime: runH + '小时' + runM + '分钟',
          startDate: (start.getMonth() + 1) + '-' + start.getDate() + ' ' + weekWord[start.getDay()],
          arriveDate: (arrive.getMonth() + 1) + '-' + arrive.getDate() + ' ' + weekWord[arrive.getDay()],
          expire: false
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .flexItem(@val,@width:0) {
    box-flex: @val;
    -webkit-box-flex: @val;
    -webkit-flex: @val;
    -ms-flex: @val;
    flex: @val;
  }

  .space_t {
    width: 100%;
    height: 49px;
    line-height: 49px;
    border-bottom: 1px solid #f5f5f5;
    position: relative;
    .xx {
      width: 14px;
      height: 14px;
      background: url("../../assets/xx.png") no-repeat center;
      background-size: 14px 14px;
      padding: 15px;
      position: absolute;
      top: 9px;
      left: 10px;
    }
    .word {
      font-size: 15px;
      color: #111;
      width: 100%;
      height: 49px;
      line-height: 49px;
      text-align: center;
    }
  }

  .main {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #f5f5f5;
    .flexItem(1, 100%);
  }

  .train-info {
    padding: 20px 15px;
    background-color: #FFF;
    margin-bottom: 5px;
    overflow: hidden;
    position: relative;
    border-bottom: 1px dotted #f5f5f5;
    &.no-padding {
      padding: 0;
    }
    .left {
      float: left;
    }
    .middle {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      text-align: center;
      margin-top: 24px;
      .ch {
        width: 105px;
        height: 4px;
        margin: 5px auto 10px;
        background: url("../../assets/ch.png") no-repeat center;
        background-size: 105px 4px;
      }
    }
    .right {
      float: right;
    }
    .time {
      font-size: 18px;
      color: #111;
      font-weight: bold;
    }
    .place {
      font-size: 20px;
      color: #111;
      font-weight: bold;
    }
    .date {
      font-size: 12px;
      color: #999;
    }
    .trains {
      font-size: 18px;
      color: #1ca0e2;
      font-weight: bold;
    }
  }

  .bottom {
    background: #fff;
    padding: 0 15px;
    overflow: hidden;
    li:last-child {
      border: none;
    }
    li {
      padding: 17px 0 14px 0;
      overflow: hidden;
      border-bottom: 1px solid #c9c9c9;
      color: #999;
      .left {
        float: left;
        position: relative;
        .name {
          position: absolute;;
          left: 0;
          color: #000;
          font-size: 15px;
        }
        .type {
          font-size: 12px;
        }
        .state {
          text-align: left;
          font-size: 12px;
          span {
            display: inline-block;
            margin-left: 12px;
            color: #1ca0e2;
          }
        }
        .number {
          height: 35px;
          line-height: 35px;
        }
      }

      .right {
        float: right;
        font-size: 12px;
        .seat {
          color: #000;
          font-size: 15px;
        }
        .seatType {
          height: 31px;
          line-height: 31px;
          text-align: right;
        }
        .price {
          color: #000;
          text-align: right;
        }
      }
    }

  }

  .mask {
    //display: none;
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, .7);

    .floor {
      background: #fff;
      width: 100%;
      position: absolute;;
      bottom: 0;
      left: 0;
      .table {
        width: 350px;
        margin: 15px auto 0;
        border: 1px solid #ebebeb;
        border-radius: 1px;
        z-index: 10;
        overflow: hidden;
      }
      .notice {
        margin: 25px 0 14px 20px;
        font-size: 12px;
        color: #999;
        z-index: -2;
        p {
          line-height: 24px;
          text-align: left;
        }
      }
      .button {
        border-top: 1px solid #ebebeb;
        color: #4ab9f1;
        font-size: 15px;
        p {
          float: left;
          width: 50%;
          height: 50px;
          border-right: 1px solid #ebebeb;
          line-height: 50px;
          text-align: center;
        }
      }
    }
  }

  .success {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;

    .content {
      width: 100%;
      height: 295px;
      border-bottom: 1px solid #ededed;
      img {
        margin-top: 85px;
        display: inline-block;
        position: relative;
        top: 50%;
        width: 82px;
        height: 82px;
      }
      p {
        font-size: 18px;
        margin-top: 17px;
      }
    }
    .sure {
      height: 50px;
      line-height: 50px;
      font-size: 15px;
      color: #4ab9f1;
      font-weight: bold;
    }
  }

  .return {
    width: 100%;
    height: 50px;
    line-height: 50px;
    font-size: 15px;
    color: #4ab9f1;
    position: fixed;
    bottom: 0;
    left: 0;
    background: #FFF;
  }
</style>
