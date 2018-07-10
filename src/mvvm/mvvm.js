import Mvvm from './mvvm/index'

/* eslint-disable */
window.vm = new Mvvm({
  el: '#mvvm',
  data: {
    a: '1',
    b: '2',
  },
  methods: {
    testToggle () {
      this.b = 'b'
    },
  },
})

