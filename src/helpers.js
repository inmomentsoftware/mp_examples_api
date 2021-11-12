import Axios from 'axios'
import { get } from 'lodash'

// #region API connectivty

const Instance = Axios.create({
  baseURL: 'https://dev.meet.ps/api/',
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json'
  },
  crossDomain: true,
  responseType: 'json',
  transformResponse: [
    data => {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          data = {
            error: {
              message: 'Unable to process your request due to API interaction failure',
              code: 503
            }
          }
        }
      }
      return get(data, 'error', null) || get(data, 'result', null)
    }
  ]
})

const getAuthHeaders = token => {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

const tT = response => get(response, 'data', null)

const tC = error => {
  const payload = get(error, ['response', 'data'], null)
  return Promise.reject(payload)
}

const httpGet = (url, token) => Instance.get(url, getAuthHeaders(token)).then(tT, tC)
const httpPost = (url, token, data) => Instance.post(url, data, getAuthHeaders(token)).then(tT, tC)
const httpPut = (url, token, data) => Instance.put(url, data, getAuthHeaders(token)).then(tT, tC)

// #endregion

export {
  httpGet,
  httpPost,
  httpPut
}
