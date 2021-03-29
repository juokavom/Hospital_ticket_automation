import { baseUrl } from "./baseUrl";

export const GET = async(endpoint) => {
    return fetch(baseUrl + endpoint)
        .then(response => {
            if (response.ok) {
                return response;
            } else {
                var error = new Error('Error ' +
                    response.status + ': ' + response.statusText);
                error.response = response;
                return error;
            }
        },
            error => {
                var errmess = new Error(error.message);
                throw errmess;
            })
            .then(response => response.json())
            .then(response => response)
}

export const login = async(credentials) => {
    return fetch(baseUrl + '/login', {
        method: 'POST',
        body: '',
        headers: {
            'Authorization' : 'Basic ' + window.btoa(credentials.title + ':' + credentials.password),
            'Content-Type': 'application/json'
        },
    }).then(response => response);
}
