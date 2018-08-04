/**
 * Created by administrator on 16/11/9.
 */

const state = {
  ctrl: false,
  info: {},
  keepID:[]
};

const mutations = {
  CONTACT_OPEN (state, obj) {
    state.ctrl = obj.ctrl;
    state.keepID = obj.keepID;
  },
  CONTACT_CLOSE (state, obj) {
    state.ctrl = obj.ctrl;
    state.info = obj.info;
  }
};

export default {
  state,
  mutations
}
