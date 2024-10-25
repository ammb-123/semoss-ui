import { makeAutoObservable } from 'mobx';

import { Role } from '@/types';
import { RootStore } from '@/stores';

import { AppMetadata } from '@/components/app';
import { IJsonModel, Model } from 'flexlayout-react';

export interface WorkspaceStoreInterface {
    /**
     * ID of App
     */
    appId: string;

    /**
     * Show Loading or not
     */
    isLoading: boolean;

    /**
     * User's role relative to the app
     */
    role: Role;

    /**
     * Metadata associated with the loaded app
     */
    metadata: AppMetadata;

    /**
     * Optional Model Engine to use
     */
    agentModelEngine: string;

    /**
     * Type of the app
     */
    type: 'BLOCKS' | 'CODE';

    /** layout information */
    layout: {
        /**
         * Selected layouts
         */
        selected: string;

        /**
         * List of available layouts
         */
        available: {
            /** id of the layout */
            id: string;

            /** name of the layout */
            name: string;

            /** Model associated with the layout */
            model: Model;
        }[];
    };

    /** overlay information */
    overlay: {
        /**
         * Track if the overlay is open or closed
         */
        open: boolean;

        /**
         * Options associated with the overlay
         */
        options: {
            /**
             * Set the maxWidth of the overlay
             */
            maxWidth: 'sm' | 'md' | 'lg' | 'xl' | null;
        };

        /**
         * Content to display in the overlay
         */
        content: () => JSX.Element;
    };
}

export interface WorkspaceConfigInterface {
    /**
     * Get the ID of the connected app
     */
    appId: string;

    /**
     * User's role relative to the app
     */
    role: Role;

    /**
     * Type of the app
     */
    type: 'BLOCKS' | 'CODE';

    /**
     * Metadata associated with the loaded app
     */
    metadata: AppMetadata;
}

/**
 * Store that manages instances of the insights and handles applicaiton level querying
 */
export class WorkspaceStore {
    private _root: RootStore;
    private _store: WorkspaceStoreInterface = {
        appId: '',
        isLoading: false,
        role: 'READ_ONLY',
        type: 'CODE',
        agentModelEngine: '',
        metadata: {
            project_id: '',
            project_name: '',
            project_type: '',
            project_cost: '',
            project_global: '',
            project_catalog_name: '',
            project_created_by: '',
            project_created_by_type: '',
            project_date_created: '',
        },
        layout: {
            selected: '',
            available: [],
        },
        overlay: {
            open: false,
            options: {
                maxWidth: 'sm',
            },
            content: () => null,
        },
    };

    constructor(root: RootStore, config: WorkspaceConfigInterface) {
        // register the root
        this._root = root;

        // set the appId
        this._store.appId = config.appId;
        this._store.type = config.type;

        // update the data
        if (config.role) {
            this._store.role = config.role;
        }

        if (config.role) {
            this._store.metadata = config.metadata;
        }

        // make it observable
        makeAutoObservable(this);
    }

    /**
     * Getters
     */
    /**
     * Get the ID of the connected app
     */
    get appId() {
        return this._store.appId;
    }

    /**
     * Get the agentModelEngine
     */
    get agentModelEngine() {
        return this._store.agentModelEngine;
    }

    /**
     * Get if the app is loading
     */
    get isLoading() {
        return this._store.isLoading;
    }

    /**
     * Get layout
     */
    get layout() {
        return this._store.layout;
    }

    /**
     * Get the selected layout of the workspace
     */
    get selectedLayout() {
        for (const s of this._store.layout.available) {
            if (s.id === this._store.layout.selected) {
                return s;
            }
        }

        return null;
    }

    /**
     * Get the selected layout of the workspace
     */
    get availableLayouts() {
        return this._store.layout.available;
    }

    /**
     * Get the user's role in relation to the app
     */
    get role() {
        return this._store.role;
    }
    /**
     * Type of the app
     */
    get type() {
        return this._store.type;
    }

    /**
     * Get metadata associated with the app
     */
    get metadata() {
        return this._store.metadata;
    }

    /**
     * Get overlay information associated with the workspace
     */
    get overlay() {
        return this._store.overlay;
    }

    /**
     * Actions
     */
    /**
     * Configure the worksapce based on the settings
     * @param options - options to configure the workspace with
     */
    configure = (options: {
        /** Initial View */
        layout: {
            selected: string;
            available: {
                /** id of the layout */
                id: string;

                /** name of the layout */
                name: string;

                /** Data associated with the layout */
                data: IJsonModel;
            }[];
        };
    }) => {
        // create the layout
        this._store.layout = {
            selected: options.layout.selected,
            available: options.layout.available.map((l) => {
                return {
                    ...l,
                    model: Model.fromJson(l.data),
                };
            }),
        };
    };
    /**
     * Set the loading screen for the app
     * @param isLoading - true if loading screen is on
     */
    setLoading = (isLoading: boolean) => {
        this._store.isLoading = isLoading;
    };

    /**
     * Select the layout
     */
    selectLayout = (selected: string) => {
        this._store.layout.selected = selected;
    };

    /**
     * Select the layout
     */
    updateLayout = (
        layout: string,
        options: Partial<WorkspaceStore['layout']['available'][number]>,
    ) => {
        this._store.layout.available[layout] = {
            ...this._store.layout.available[layout],
            ...options,
        };
    };

    /**
     * Open the overlay
     */
    openOverlay = (
        content: WorkspaceStoreInterface['overlay']['content'],
        options: WorkspaceStoreInterface['overlay']['options'] = {
            maxWidth: 'sm',
        },
    ) => {
        // open the overlay
        this._store.overlay.open = true;

        // set the content
        this._store.overlay.content = content;
        this._store.overlay.options = options;
    };

    /**
     * Close the overlay
     */
    closeOverlay = () => {
        // close the overlay
        this._store.overlay.open = false;

        // clear the content
        this._store.overlay.content = null;
    };
}
