<template lang="html">
  <transition name="fade">
    <div class="main" v-if="$$message">
      <div class="group" v-show="$$delay">
        <div class="prompt">提示</div>
        <div class="text">{{$$text}}</div>
      </div>
      <div class="group accord" v-show="$$accord">
        <div class="prompt">提示</div>
        <div class="text">{{$$text}}</div>
        <div class="btn" @click="know">确定</div>
      </div>
    </div>
    <div class="prompt" v-if="$$prompt">
      {{$$text}}
    </div>
  </transition>
</template>
<script lang="babel">
  import Vue from 'vue';
  export default {
    name: 'message',
    data () {
      return {
        delay: false,
        accord: false
      }
    },
    methods: {
      know: function () {
        this.$store.commit('MESSAGE_ACCORD_HIDE');
      }
    },
    computed: {
      $$message: function () {
        return this.$store.state.message.message
      },
      $$delay: function () {
        return this.$store.state.message.delay
      },
      $$accord: function () {
        return this.$store.state.message.accord
      },
      $$prompt: function () {
        return this.$store.state.message.prompt
      },
      $$text: function () {
        return this.$store.state.message.text
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

  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s
  }

  .fade-enter, .fade-leave-active {
    opacity: 0
  }

  .prompt {
    position: absolute;
    top: 45%;
    left: 50%;
    z-index: 9999;
    transform: translate3d(-50%, -50%, 0);
    padding: 5px 10px;
    font-size: 16px;
    color: #fff;
    background-color: #373737;
    border-radius: 5px;
    text-align: center;
  }

  .main {
    width: 100%;
    height: 100%;
    overflow: auto;
    .flexItem(1, 100%);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.5);
  }

  .group {
    width: 90%;
    height: auto;
    background-color: #FFF;
    border-radius: 5px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    padding: 20px 15px 25px;
    .prompt {
      font-size: 20px;
      color: #111;
      font-weight: bold;
      line-height: 30px;
      text-align: center;
    }
    .text {
      font-size: 18px;
      color: #111;
      line-height: 30px;
      text-align: center;
      max-height: 300px;
      overflow: auto;
    }
    &.accord {
      padding-bottom: 50px;
      .btn {
        width: 100%;
        height: 44px;
        border-top: 1px solid #f5f5f5;
        text-align: center;
        line-height: 44px;
        position: absolute;
        left: 0;
        bottom: 0;
      }
    }
  }
</style>
