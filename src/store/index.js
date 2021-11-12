import Vue from 'vue'
import Vuex from 'vuex'

import { httpGet, httpPost, httpPut } from './../helpers'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // Presenter token needed to ensure the reference meeting is okay.
    // It gets created automatically if neeeded.
    tokenPresenter: '',

    // Attendee token is issued on demand for test runs of the Attendee UI
    tokenAttendee: '',

    // Reference meeting that we validate as Presenter and then let Attendee in.
    meetingId: '',
    // Attendee activity cannot start unless we do Presenter-side preflight checks.
    meetingOk: false,

    // Attendee session tracking
    sessionActive: false,
    sessionUID: null,
    sessionPolls: [],
    sessionVotes: {}
  },

  mutations: {
    SET_PRESENTER (state, { token, meeting }) {
      state.tokenPresenter = token
      state.meetingId = meeting
    },

    SET_ATTENDEE (state, { token, uid }) {
      state.tokenAttendee = token
      state.sessionUID = uid
    },

    SET_STATE (state, { polls, votes }) {
      state.sessionPolls = polls
      state.sessionVotes = votes
      state.sessionActive = true
    },

    // NB: using nested objects within VueX is not recommended.
    MARK_ANSWERED (state, { poll, idx }) {
      if (idx === null) {
        Vue.set(state.sessionVotes, poll.id, undefined)
      } else {
        Vue.set(state.sessionVotes, poll.id, idx)
      }
    },

    RESET_ATTENDEE (state) {
      state.sessionActive = false
      state.sessionUID = null
      state.sessionPolls.length = 0
      state.sessionVotes = 0
    },

    PRESENTER_ACK (state) {
      state.meetingOk = true
    }
  },

  actions: {
    async validatePresenter ({ state, commit }) {
      const token = state.tokenPresenter
      const meeting = state.meetingId

      if (!(token && meeting)) {
        return 'Missing prerequisite info to validate the meeting'
      }

      try {
        // Ensure the meeting is there and ours
        try {
          await httpGet(`meetings/${meeting}/roles`, token)
        } catch (e) {
          if (e.code === 401) {
            return 'You\'ve got an invalid API token'
          }
          if (e.code === 403) {
            return 'This meeting name is already used by another customer'
          }
          if (e.code === 404) {
            // Okay to create
            await httpPost(`meetings/${meeting}`, token, {
              settings: {
                features: {
                  polls: true
                }
              }
            })
          }
        }

        // Check how polls fare and create some simple examples
        let polls = await httpGet(`meetings/${meeting}/polls`, token)
        let okPolls = polls.filter(poll => poll.type === 'voted')

        for (let i = okPolls.length + 1; i < 6; i++) {
          const poll = {
            question: `What is the correct answer to quiz #${i}?`,
            answers: ['A', 'B', 'C', 'D'],
            type: 'voted'
          }
          await httpPost(`meetings/${meeting}/polls/`, token, poll)
        }

        // Re-query to validate.
        polls = await httpGet(`meetings/${meeting}/polls`, token)
        okPolls = polls.filter(poll => poll.type === 'voted')

        commit('PRESENTER_ACK')
        return `Meeting "${meeting} is ok and has ${okPolls.length} polls`
      } catch (e) {
        return (e && e.message) || 'unknown error preparing presenter side'
      }
    },

    async startAttendee ({ state, commit }) {
      try {
        // Issue a new attendee token if left empty
        let token = state.tokenAttendee
        if (!token) {
          const tokenInfo = await httpPost('auth/anonymous', null, { idToken: true })
          token = tokenInfo.idToken
        }
        // Validate the token and get the respected user ID.
        const authInfo = await httpGet('auth', token)
        const { uid } = authInfo
        const meeting = state.meetingId
        commit('SET_ATTENDEE', { token, uid })

        // Ensure valid meeting participant
        await httpPut(`meetings/${meeting}/participants/${uid}`, token)

        const polls = await httpGet(`meetings/${meeting}/polls`, token)
        const { votes } = await httpGet(`meetings/${meeting}/polls/state/${uid}`, token)

        commit('SET_STATE', {
          polls: polls.filter(poll => poll.type === 'voted'),
          votes
        })

        // Pull polls-related data
        return 'Attendee site ok and running'
      } catch (e) {
        return (e && e.message) || 'unknown error preparing attendee side'
      }
    },

    async stopAttendee ({ commit }) {
      commit('RESET_ATTENDEE')
    },

    async answer ({ state, commit }, { poll, idx }) {
      // Latency hiding: register the vote locally before updating the backend, but revert that if there were problems.
      commit('MARK_ANSWERED', { poll, idx })
      return httpPut(`meetings/${state.meetingId}/polls/${poll.id}/vote`, state.tokenAttendee, idx)
        .catch(() => commit('MARK_ANSWERED', { poll, idx: null }))
    }
  }
})
