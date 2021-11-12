<template>
  <div id="app">
    <presenter></presenter>
    <attendee></attendee>
  </div>
</template>

<script>
import Presenter from './components/Presenter.vue'
import Attendee from './components/Attendee.vue'

export default {
  name: 'App',
  components: {
    Presenter,
    Attendee
  }
}
</script>

<style lang="scss">
#app {
  position: relative;
  font-family: Helvetica, Arial, sans-serif;

  .form {
    .row {
      margin: 1em 0;

      label {
        display: inline-block;
        width: calc(33% - 1em);
        margin-right: 0.5em;
        text-align: right;
      }

      input {
        width: calc(66% - 1em);
        margin-left: 0.5em;
      }

      button {
        display: block;
        margin: 1em auto;
      }
    }
  }
}

#presenter {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 40%;

  padding: 1em;
  box-sizing: border-box;
}

#attendee {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 60%;

  padding: 1em;
  box-sizing: border-box;
}
</style>
