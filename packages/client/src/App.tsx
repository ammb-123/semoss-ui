import { useEffect } from 'react';
import axios, { isAxiosError } from 'axios';
import { Env } from '@/env';
import { RootStore } from '@/stores';
import { RootStoreContext } from '@/contexts';
import { AppWrapper } from './AppWrapper';

// add response interceptors
axios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
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
    },
);

// create a new root store
const _store = new RootStore();

// add request interceptors
axios.interceptors.request.use(
    function (config) {
        if (_store.configStore.store.config.csrf) {
            const url = `${Env.MODULE}/api/config/fetchCsrf`;
            const setHeaders = { headers: { 'X-CSRF-Token': 'fetch' } };

            //get and set token in header
            axios
                .get(url, setHeaders)
                .then((response) => {
                    console.log({ response });
                    config.headers['X-CSRF-Token'] = response;
                })
                .catch((error) => {
                    console.log({ error });
                });
        } else {
            return config;
        }
    },
    function (error) {
        console.log({ error });
    },
);

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
