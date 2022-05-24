import axios from 'axios'
import { setAlert } from './alert'

import {
    CLEAR_PROFILE,
    GET_PROFILE,
    PROFILE_ERROR,
    UPDATE_PROFILE,
    ACCOUNT_DELETED,
    GET_PROFILES,
    GET_REPOS
} from './types'


export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('/api/profile/me')

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {
        console.log('comment under catch1', err)
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })

    }
}

export const getProfiles = () => async dispatch => {
    console.log('test comment')
    dispatch({ type: CLEAR_PROFILE })
    try {
        console.log('comment under try')
        const res = await axios.get('/api/profile/')

        dispatch({
            type: GET_PROFILES,
            payload: res.data
        })
    } catch (err) {
        console.log('comment under catch2', err)
        if (err && err.length !== 0) {

            dispatch({
                type: PROFILE_ERROR,
                payload: { msg: err.response.statusText, status: err.response.status }
                
            })
        } 

    }
}




export const getProfileById = userId => async dispatch => {
    try {
        const res = await axios.get(`/api/profile/user/${userId}`)
        console.log('data user', res.data.user)
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {
        console.log('comment under catch3', err.response)
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })

    }
}


export const getGithubRepos = username => async dispatch => {
    try {
        const res = await axios.get(`/api/profile/github/${username}`)
        console.log(res.data)
        dispatch({
            type: GET_REPOS,
            payload: res.data
        })
    } catch (err) {
        console.log('comment under catch4', err)
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })

    }
}




export const createProfile = (FormData, history, edit = false) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const res = await axios.post('/api/profile', FormData, config)

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })

        dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'))

        if (!edit) {
            history.push('/dashboard')
        }
    } catch (err) {
        console.log('comment under catch5', err)
        const errors = err.response.data.errors;
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

export const addExperience = (FormData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const res = await axios.put('api/profile/experience', FormData, config)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Experience Added', 'success'))
        history.push('/dashboard')

    } catch (err) {
        console.log('comment under catch6', err)
        const errors = err.response.data.errors;
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}






export const addEducation = (FormData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const res = await axios.put('api/profile/education', FormData, config)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Education Added', 'success'))
        history.push('/dashboard')

    } catch (err) {
        console.log('comment under catch7', err)
        const errors = err.response.data.errors;
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}


export const deleteExperience = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/experience/${id}`)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Experience Removed', 'success'))
    } catch (err) {
        console.log('comment under catch8', err)
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}


export const deleteEducation = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/education/${id}`)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Education Removed', 'success'))
    } catch (err) {
        console.log('comment under catch9', err)
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}




export const deleteAccount = () => async dispatch => {
    if (window.confirm('Are you sure to delete your Account?')) {


        try {
            await axios.delete('/api/profile')

            dispatch({
                type: CLEAR_PROFILE
            })
            dispatch({
                type: ACCOUNT_DELETED
            })
            dispatch(setAlert('Your account has been permanently Deleted'))
        } catch (err) {
            console.log('comment under catch10', err)
            dispatch({
                type: PROFILE_ERROR,
                payload: { msg: err.response.statusText, status: err.response.status }
            })
        }
    }

}