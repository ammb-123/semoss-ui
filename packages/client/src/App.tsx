import { useEffect } from 'react';
import axios, { isAxiosError } from 'axios';
import { Env } from '@/env';
import { RootStore } from '@/stores';
import { RootStoreContext } from '@/contexts';
import { AppWrapper } from './AppWrapper';

// add interceptors
let token = '';
axios.interceptors.request.use(
    async (config) => {
        // Check if the request is a GET request
        if (config.method === 'get' && config.params) {
            config.paramsSerializer = (params) => {
                return Object.keys(params)
                    .map((key) => {
                        if (params[key] === undefined) {
                            return '';
                        }

                        return `${encodeURIComponent(key)}=${encodeURIComponent(
                            params[key],
                        )}`;
                    })
                    .filter((p) => {
                        if (p) {
                            return true;
                        }

                        return false;
                    })
                    .join('&');
            };
        }

        // Check if CSRF is enabled
        if (config.method === 'post' && _store.configStore.store.config.csrf) {
            if (token) {
                config.headers['X-CSRF-Token'] = token;
            } else {
                token = await getCsrfToken();
                config.headers['X-CSRF-Token'] = token;
            }
        }
        return config;
    },
    (error) => {
        // Handle request error
        return Promise.reject(error);
    },
);

axios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        getError(error);
    },
);

// create a new root store
const _store = new RootStore();

//get and set CSRF Token
async function getCsrfToken(): Promise<any> {
    const url = `${Env.MODULE}/api/config/fetchCsrf`;
    const csrfHeaders = { headers: { 'X-CSRF-Token': 'fetch' } };

    try {
        const response = await axios.get(url, csrfHeaders);

        // not sure why the server is sending it as lowercase, preserving headers doesn't fix it
        const token =
            response.headers['X-CSRF-Token'] ||
            response.headers['x-csrf-token'] ||
            '';

        return token;
    } catch (error) {
        return null;
    }
}

//get error from request or response
function getError(error) {
    if (error.status === 302 && error.headers && error.headers.redirect) {
        window.location.replace(error.headers.redirect);
    }

    if (isAxiosError(error)) {
        const { response } = error;
        if (
            response.status === 302 &&
            response.headers &&
            response.headers.redirect
        ) {
            window.location.replace(response.headers.redirect);
        }
    }

    const apiMessage = error.response?.data?.errorMessage;
    if (apiMessage && typeof apiMessage === 'string') {
        // Exception for returning the errorMessage provided via the API if available.
        return Promise.reject(apiMessage);
    } else if (error.message) {
        // return the message if it exists
        return Promise.reject(error.message);
    } else {
        // reject with generic error
        return Promise.reject('Error');
    }
}

export const App = () => {
    useEffect(() => {
        // load the environment from the document (production)
        try {
            const env = JSON.parse(
                document.getElementById('semoss-env')?.textContent || '',
            ) as {
                MODULE: string;
            };

            // update the enviornment variables with the module
            if (env) {
                Env.update({
                    MODULE: env.MODULE,
                });
            }
        } catch (e) {
            // noop
        }

        // intialize it
        _store.configStore.initialize();
    }, []);

    //  NCRT ASK - (https://play.semoss.org/ncrt/SemossWeb/packages/client/dist/#!/)
    if (window.location.href.includes('client/dist/#!/')) {
        window.location.href = window.location.href.replace(
            /(client\/dist\/)#!/,
            '$1#',
        );
    }
    return (
        <RootStoreContext.Provider value={_store}>
            <AppWrapper />
        </RootStoreContext.Provider>
    );
};
