<template>
  <div id="presenter">
    <h1>Presenter side controls</h1>

    <div class="tips">
      Please provide your Presenter API token and a meeting name you want to use as a test.<br />
      <br />
      You can get get your API token by visiting <i>Dashboard</i> &gt; <i>Account Settings</i> page in MeetingPulse. <br />
      <br />
      For a meeting you can reuse something you already have that has single-answer polls in it, or choose a name for a new meeting. The prototype will attempt to reuse or create a new meeting and ensure it has at least five single-answer polls.
    </div>

    <div class="form">
      <div class="row">
        <label>Presenter token</label>
        <input
          v-model="token"
          :disabled="$store.state.meetingOk"
          id="presenter__token"
          type="text"
        />
      </div>

      <div class="row">
        <label>Choose meeting</label>
        <input
          v-model="meeting"
          :disabled="$store.state.meetingOk"
          id="presenter__meeting"
          type="text"
        />
      </div>
    </div>

    <h1>Attendee side controls</h1>

    <div class="tips">
      Once you've ensured you have a valid meetings (by using the form above), you can interact with it as an Attendee.<br />
      <br />
      You can connect as a new attendee by hitting "Start session" below, in which case a new token will get generated for that session.<br />
      <br />
      You can terminate a session by hitting the "stop" button and reconnect as the same attendee by leaving the old attendee token as-is. You can also remove said token to get yourself a fresh session.<br />
      <br />
      Voting results are persisted between attendee session reloads unless you opt to use a new attendee token.
    </div>

    <div class="form">
      <div class="row">
        <label>Attendee token</label>
        <input
          :value="$store.state.tokenAttendee"
          @input="setTokenAttendee($event)"
          id="attendee__token"
          placeholder="(leave blank to open a new session)"
          type="text"
        />
      </div>

      <div class="row">
        <button
          id="attendee__start"
          :disabled="!$store.state.meetingOk"
          @click="toggleSession"
        >
          {{ $store.state.sessionActive ? 'Stop' : 'Start' }} session
        </button>
      </div>
    </div>

    <div class="form status">
      <div class="row">
        <label>Status</label>
        <input
          v-model="output"
          id="presenter__output"
          type="text"
          disabled="disabled"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash'

export default {
  data: () => ({
    token: '',
    meeting: '',
    output: ''
  }),

  computed: {
    credsProvided () {
      return this.token + this.meeting
    }
  },

  methods: {
    setTokenAttendee (e) {
      this.$store.commit('SET_ATTENDEE', { token: e.target.value })
    },

    toggleSession () {
      if (!this.$store.state.sessionActive) {
        this.output = 'Starting attendee session'
        this.$store.dispatch('startAttendee')
          .catch(err => err.message)
          .then(out => {
            this.output = out
          })
      } else {
        this.output = 'Scrapped current attendee session'
        this.$store.dispatch('stopAttendee')
      }
    }
  },

  watch: {
    credsProvided: debounce(function debouncedTokenChange (flag) {
      if (!flag) {
        return
      }
      this.$store.commit('SET_PRESENTER', this)
      this.output = 'Validating meeting candidate...'
      this.$store.dispatch('validatePresenter')
        .catch(err => err.message)
        .then(out => {
          this.output = out
        })
    }, 500)
  }
}
</script>

<style lang="scss">
#presenter {
  width: 66%;
  margin: 0 auto;

  .status {
    margin-top: 3em
  }

  .tips {
    font-size: smaller;
    opacity: 0.8;
  }
}
</style>
