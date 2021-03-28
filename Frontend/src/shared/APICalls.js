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
