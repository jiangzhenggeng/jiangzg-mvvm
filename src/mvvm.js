import Mvvm from './mvvm-v3/Mvvm'

window.vm = new Mvvm({
  el: '#mvvm',
  template: `
  <div data-col="hsh">
  scs {{vb}} vd {{a}} f {{b}}  dd 
</div>
  `,
  data: {
    a: '1',
    b: '2',
    c: {
      d: {
        e: 'e',
      },
    },
  },
  computed: {
    vb () {
      return this.a + this.b
    },
  },
  methods: {
    testToggle () {
      this.b = Math.random()
    },
  },
})

