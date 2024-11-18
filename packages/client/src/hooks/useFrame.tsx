import { useBlocksPixel } from './useBlocksPixel';

/**
 * Run pixel within blocks context
 * @returns Pixel response
 */
export function useFrame(
    /** Frame to get data from */
    frame = '',

    /** Options for the frame */
    options?: Partial<{
        /** Selector to grab the data */
        selector: string;

        /** Where to start grabbing the data */
        limit: number;

        /** How many to collect */
        collect: number;

        /** Enable the count */
        enableCount: boolean;
    }>,
) {
    const {
        selector = 'QueryAll()',
        limit = 0,
        collect = 1000,
        enableCount = false,
    } = options;

    /**
     * Get the data
     */
    const getData = useBlocksPixel<{
        data: {
            headers: string[];
            values: unknown[][];
        };
    }>(
        frame
            ? `META | Frame("${frame}") | ${selector} | Limit(${limit}) | Collect(${collect});`
            : '',
        {
            silent: true,
        },
    );

    /**
     * Get the count of all of the values
     */
    const getCount = useBlocksPixel<number>(
        enableCount && frame
            ? `META | Frame("${frame}") | ${selector} | Distinct(false) | QueryRowCount();`
            : '',
        {
            silent: true,
        },
    );

    return {
        status: getData.status,
        data:
            getData.status === 'SUCCESS'
                ? getData.data.data
                : {
                      headers: [],
                      values: [],
                  },
        error: getData.error,
        count: getCount.status === 'SUCCESS' ? getCount.data : -1,
    };
}
