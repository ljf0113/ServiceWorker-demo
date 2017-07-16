/**
 * Created by liangjianfeng on 2017/7/15.
 */

new Vue({
  el: '#app',
  data: {
    items: [1, 2, 3],
    img: null,
  },
  methods: {
    setImg(){
      this.img = '/1.jpg';
    }
  }
})