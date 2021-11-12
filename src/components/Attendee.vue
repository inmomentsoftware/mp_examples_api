<template>
  <div id="attendee">
    <h1>Attendee experience</h1>

    <div v-if="preflightOk && sessionOk">
      <!-- Output all polls still eligible for voting -->
      <div
        class="poll"
        :class="{ answered: poll.answered }"
        v-for="poll in polls"
        :key="poll.id"
      >
        <h3>{{ poll.question }}</h3>
        <ul>
          <li
            v-for="(answer, idx) in poll.answers"
            :key="`${poll.id}-${idx}`"
          >
            <a
              href="#"
              :class="{ answered: poll.answered && idx === poll.vote }"
              @click.prevent="castVote(poll, idx)"
            >
              {{ answer }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <h2 v-if="!preflightOk">
      Please complete the Presenter preparation steps above
    </h2>

    <h2 v-else-if="!sessionOk">
      Waiting for the session to start
    </h2>
  </div>
</template>

<script>

export default {
  computed: {
    sessionOk () {
      return this.$store.state.sessionActive
    },

    preflightOk () {
      return this.$store.state.meetingOk
    },

    token () {
      return this.$store.state.tokenAttendee
    },

    polls () {
      return this.$store.state.sessionPolls.map(poll => {
        poll.vote = this.$store.state.sessionVotes[poll.id]
        poll.answered = typeof poll.vote !== 'undefined'
        return poll
      })
    }
  },

  methods: {
    castVote (poll, idx) {
      this.$store.dispatch('answer', { poll, idx })
    }
  },

  watch: {
  }
}
</script>

<style lang="scss">
.poll.answered {
  opacity: 0.4
}

a {
  text-decoration: none;
  font-weight: 600;
  color: #5d2dff;
  line-height: 1.5em;
  padding: 0.25em 0.5em;

  &:not(.answered):hover {
    background-color: Silver;
  }

  &.answered {
    color: white;
    background-color: #5d2dff;
  }
}
</style>
