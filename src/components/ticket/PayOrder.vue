<template lang="html">
  <div class="main">
    <div class="from">
      <div class="state" v-show="orderInfo.status==2">
        <i></i>正在为您占座中...
      </div>
      <div class="state" v-show="orderInfo.status==3||orderInfo.status==7">
        <span v-if="countdown">您的座位还会为您保留{{countdown}}分钟，请尽快完成支付</span>
        <span v-if="!countdown">您的订单已失效</span>
      </div>
      <div class="state" v-show="orderInfo.status==13">
        <span>您的订单已取消</span>
      </div>
      <div class="space">
        <div class="train-info">
          <div class="left">
            <div class="time">{{orderInfo.startTime}}</div>
            <div class="place">{{orderInfo.fromStationName}}</div>
            <div class="date">{{otherInfo.startDate}}</div>
          </div>
          <div class="middle">
            <div class="trains">{{orderInfo.checi}}</div>
            <div class="ch"></div>
            <div class="date">耗时{{otherInfo.runTime}}</div>
          </div>
          <div class="right">
            <div class="time">{{orderInfo.endTime}}</div>
            <div class="place">{{orderInfo.toStationName}}</div>
            <div class="date">{{otherInfo.arriveDate}}</div>
          </div>
        </div>
        <div v-show="orderInfo.status==3">
          <div class="man-info" v-for="people in orderInfo.passengers">
            <div class="left">
              <div class="big">{{people.name}} <span class="small">{{people.piaoTypeName}}</span></div>
              <div class="small">{{people.passportSeNo}}</div>
              <div class="red">待支付</div>
            </div>
            <div class="right">
              <div class="big">{{people.cxin}}</div>
              <div class="small">{{orderInfo.zwName}}</div>
              <div class="red">￥<span>{{people.price}}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="space" v-show="orderInfo.status==3" @click="cancel">
        <div class="cancel">取消订单</div>
      </div>
      <div class="submit">
        <div class="detail" v-bind:class="{active:detail}">
          <div class="tt">金额详情</div>
          <div class="tt_detail">
            <div class="left">火车票</div>
            <div class="right">x{{otherInfo.passengersNum}}人</div>
            <div class="right margin">￥{{otherInfo.ticket}}</div>
          </div>
          <div class="tt_detail">
            <div class="left">出票套餐</div>
            <div class="right">x{{otherInfo.passengersNum}}人</div>
            <div class="right margin">￥{{otherInfo.insurance}}</div>
          </div>
        </div>
        <div class="btn">
          <div class="left" @click="detailShow">
            <div class="amount">实付款<span class="red">￥</span><span class="red big">{{orderInfo.totalPrice}}</span></div>
            <div class="i" v-bind:class="{active:detail}"></div>
          </div>
          <div class="right" v-bind:class="{dis:(orderInfo.status!=3&&orderInfo.status!=7)||!countdown}" @click="submit">立即支付</div>
        </div>
      </div>
    </div>
    <message></message>
    <pay></pay>
  </div>
</template>

<script lang="babel">
  import Vue from 'vue'
  import Datetime from './Datetime.vue'
  import Message from '../Message.vue'
  import Pay from '../pay/Main.vue'

  export default {
    name: 'menu',
    components: {
      Datetime,
      Message,
      Pay
    },
    data: function () {
      return {
        common: {
          appid: '',
          uid: ''
        },
        orderInfo: '',
        countdown: '15:00',
        payInfo: {
          orderId: '',
          price: '00.0',
          bank: false,
          list: true,
          sendCtrl: true,
          timer: 60,
          cardList: '',
          peopleInfo: '',
          checkout: {},
          index: 0,
          checkCode: '',
          sn: ''
        },
        detail: false
      }
    },
    beforeCreate:function () {
      let query = this.$route.query;
      this.$http.post('/order/queryById', {
        orderFormId: query.id
      }).then(function (res) {
        this.$data.orderInfo = res.data;
        this.$data.common.appid = query.appid;
        this.$data.common.uid = query.uid;
        this.$data.payInfo.orderId = query.id;
        this.$data.payInfo.price = res.data.totalPrice;
        if(res.data.status == 3){
          this.timer(this.$data.orderInfo.expireTime);
        }
      },function(){
        this.$store.commit('MESSAGE_PROMPT_SHOW', {
          text: '查询订单信息失败'
        })
      });
    },
    created: function () {
      // 这里 轮询 等待回调
      let polling = '';
      const pollFun = ()=>{
        this.$http.post('/order/queryById', {
          orderFormId: this.$data.orderInfo.orderFormId
        }).then(function (res) {
          if ((res.data.status == 3 ||res.data.status ==  7)) {
            clearInterval(polling);
            this.$data.orderInfo = res.data;
            this.$data.payInfo.price = res.data.totalPrice;
          } else if ((res.data.status == 4 ||res.data.status ==  6)) {
            clearInterval(polling);
            this.$data.orderInfo = res.data;
            this.$store.commit('MESSAGE_PROMPT_SHOW', {
              text: '占座失败'
            });
          } else if (res.data.status == 13) {
            clearInterval(polling);
            this.$data.orderInfo = res.data;
          }
        },function(){
          clearInterval(polling);
          this.$store.commit('MESSAGE_PROMPT_SHOW', {
            text: '查询订单信息失败'
          })
        });
      }
      polling = setInterval(pollFun, 1500);
    },
    methods: {
      detailShow: function () {
        this.$data.detail = !this.$data.detail;
      },
      timer: function (t) {
        let polling2 = '';
        const pollFun2 = ()=>{
          let time = t - new Date().getTime();
          if (time <= 0) {
            this.$data.countdown = false;
            clearInterval(polling2);
          } else {
            let min = parseInt(time / (1000 * 60));
            let ss = parseInt((time - min * (1000 * 60)) / 1000);
            if (ss < 10) {
              ss = '0' + ss;
            }
            this.$data.countdown = min + ':' + ss;
          }
        }
        polling2 = setInterval(pollFun2, 1000);
      },
      cancel: function () {
        this.$http.post('/ticket/cancelOrder', {
          orderFormId: this.$data.orderInfo.orderFormId
        }).then(function () {
          this.$http.post('/order/queryById', {
            orderFormId: this.$data.payInfo.orderId
          }).then(function (res) {
            this.$data.orderInfo = res.data;
            this.$data.payInfo.price = res.data.totalPrice;
          },function(){
            this.$store.commit('MESSAGE_PROMPT_SHOW', {
              text: '查询订单信息失败'
            })
          });
          this.$store.commit('MESSAGE_PROMPT_SHOW', {
            text: '订单取消成功'
          })
        },function(){
          this.$store.commit('MESSAGE_PROMPT_SHOW', {
            text: '订单取消失败'
          })
        });
      },
      submit: function () {
        // 首先判断订单状态,决定是否能支付
        if ((this.$data.orderInfo.status == 3||this.$data.orderInfo.status == 7) && this.$data.countdown) {
          this.$store.commit('PAY_CALL', {
            appid: this.$data.common.appid,
            uid: this.$data.common.uid,
            orderId: this.$data.payInfo.orderId,
            price: this.$data.payInfo.price,
            type: 'pre'
          });
        }
      }
    },
    computed: {
      $payInfo: function () {
        return this.$data.payInfo;
      },
      pageInfo: function () {
        return this.$data.orderInfo
      },
      otherInfo: function () {
        let a = 0;
        let b = 0;
        // 乘车人数 车票价格
        for (let i in this.$data.orderInfo.passengers) {
          a++;
          b = this.$data.orderInfo.passengers[i]['price'];
        }
        // 套餐价格
        let c = (this.$data.orderInfo.totalPrice - this.$data.orderInfo.ticketTotalPrice) / a;
        // 运行时间
        let runMin = this.$data.orderInfo.runTime;
        let runH = 0;
        let runM = 0;
        if (runMin >= 60) {
          runH = parseInt(runMin / 60);
          runM = runMin % 60;
        }
        // 出发日期 到达日期
        let weekWord = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        let start = new Date(this.$data.orderInfo.startDate);
        let arrive = new Date(this.$data.orderInfo.endDate);
        return {
          passengersNum: parseInt(a),
          ticket: b,
          insurance: parseInt(c),
          runTime: runH + '小时' + runM + '分钟',
          startDate: (start.getMonth() + 1) + '-' + start.getDate() + ' ' + weekWord[start.getDay()],
          arriveDate: (arrive.getMonth() + 1) + '-' + arrive.getDate() + ' ' + weekWord[arrive.getDay()],
          expire: false
        }
      },
      expireTime: function () {
        return this.$data.countdown;
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
    width: @width;
  }

  .main {
    width: 100%;
    height: 100%;
    overflow: hidden;
    .flexItem(1, 100%);
    background-color: #f5f5f5;
  }

  .state {
    width: 100%;
    height: 50px;
    background-color: #fef0f0;
    border: 1px solid #fed4d4;
    line-height: 50px;
    font-size: 15px;
    color: #ff6565;
    text-align: center;
    i {
      display: inline-block;
      margin-right: 5px;
      transform: translate3d(0, 2px, 0);
      width: 16px;
      height: 16px;
      background: url("../../assets/time.gif") no-repeat center;
      background-size: 16px 16px;
    }
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

  .man-info {
    background-color: #FFF;
    padding: 10px 0;
    overflow: hidden;
    .left {
      float: left;
      text-align: left;
    }
    .right {
      float: right;
      text-align: right;
    }
    .big {
      line-height: 26px;
      font-size: 15px;
      color: #111;
    }
    .small {
      line-height: 20px;
      font-size: 12px;
      color: #999;
    }
    .red {
      line-height: 20px;
      font-size: 12px;
      color: #fe6969;
    }
  }

  .cancel {
    width: 100%;
    height: 50%;
    line-height: 50px;
    font-size: 15px;
    color: #1ca0e2;
  }

  .from {
    .space {
      padding: 0 15px;
      background-color: #FFF;
      border-bottom: 5px solid #f5f5f5;
      &.no-border {
        border: none;
      }
      &.no-padding {
        padding: 0;
      }
    }
    .handle {
      height: 56px;
      border-top: 1px solid #efefef;
      border-bottom: 1px solid #efefef;
      position: relative;
      .btn {
        width: 50%;
        height: 56px;
        line-height: 56px;
        font-size: 15px;
        color: #1ca0e2;
        float: left;
        text-align: center;
      }
      .line {
        position: absolute;
        width: 1px;
        height: 56px;
        background-color: #efefef;
        top: 0;
        left: 50%;
      }
    }
    .group {
      height: 56px;
      border-bottom: 1px dashed #efefef;
      &.no-border {
        border: none;
      }
      .prompt {
        float: left;
        font-size: 16px;
        color: #111;
        line-height: 56px;
        margin-right: 18px;
      }
      .logo {
        width: 26px;
        height: 26px;
        float: left;
        margin-top: 14px;
        margin-right: 10px;
        background: url("../../assets/12306.png") no-repeat;
        background-size: 26px 26px;
      }
      .list {
        width: 19px;
        height: 19px;
        float: left;
        margin-top: 18px;
        margin-right: 10px;
        background: url("../../assets/list.png") no-repeat;
        background-size: 19px 19px;
      }
      .write {
        &.empty {
          color: #CCC;
        }
        &.no-prompt {
          background: none;
        }
        &.right {
          text-align: right;
        }
        .info {
          float: right;
          font-size: 12px;
          color: #b6b6b6;
        }
        .name {
          font-weight: bold;
        }
        .price {
          color: #f14242;
          margin-right: 15px;
        }
        line-height: 56px;
        font-size: 16px;
        color: #111;
        text-align: left;
        background: url("../../assets/prompt-arrow.png") no-repeat right;
        background-size: 7px 12px;
      }
    }

  }

  .goto {
    padding: 14px 0 6px;
    border-bottom: 1px solid #efefef;
    .side {
      overflow: hidden;
      &.show {
        font-size: 12px;
        color: #999;
      }
      &.write {
        margin-top: 9px;
        font-size: 24px;
        font-weight: bold;
        color: #111;
        text-align: center;
        .middle {
          width: 27px;
          height: 27px;
          margin-top: 4px;
        }
      }
      .left {
        float: left;
      }
      .right {
        float: right;
      }
    }
  }

  .submit {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 49px;
    .detail {
      position: absolute;
      z-index: 1;
      background-color: #FFF;
      width: 100%;
      top: 0;
      left: 0;
      padding: 15px;
      &.active {
        top: -88px;
      }
      .tt {
        font-size: 12px;
        color: #111;
        text-align: left;
      }
      .tt_detail {
        font-size: 12px;
        color: #111;
        margin-top: 5px;
        overflow: hidden;
        .left {
          float: left;
        }
        .right {
          float: right;
        }
        .margin {
          margin-right: 50px;
        }
      }
    }
    .btn {
      position: absolute;
      z-index: 9;
      background-color: #FFF;
      width: 100%;
      height: 49px;
      .left {
        float: left;
        width: 50%;
        .amount {
          float: left;
          padding-left: 30px;
          line-height: 49px;
          font-size: 12px;
          color: #999;
          margin-right: 20px;
          .red {
            color: #fe6969;
          }
          .big {
            font-size: 18px;
          }
        }
        .i {
          width: 12px;
          height: 7px;
          float: left;
          margin-top: 20px;
          background: url("../../assets/detail.png") no-repeat center;
          background-size: 12px 7px;
          transform: rotate(180deg);
          &.active {
            transform: rotate(0deg);
          }
        }
      }
      .right {
        float: right;
        width: 50%;
        height: 49px;
        line-height: 49px;
        font-size: 15px;
        color: #FFF;
        background-color: #4ab9f1;
        &.dis {
          background-color: #8fcfef;
          color: #cfefff;
        }
      }
    }
  }
</style>
