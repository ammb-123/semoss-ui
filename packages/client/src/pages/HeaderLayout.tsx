import { observer } from 'mobx-react-lite';
import { Outlet, useLocation } from 'react-router-dom';
import { styled } from '@semoss/ui';

import { Navbar } from '@/components/ui';
import { useMemo } from 'react';

const NAV_HEIGHT = '48px';

const StyledContent = styled('div', {
    shouldForwardProp: (prop) => prop !== 'showNav',
})<{
    /** Track if we show app navbar */
    showNav: boolean;
}>(({ theme, showNav }) => ({
    position: 'absolute',
    paddingTop: showNav ? NAV_HEIGHT : '0px',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
}));

/**
 * Wrap the routes with a header
 */
export const HeaderLayout = observer((props) => {
    const location = useLocation();
    const showNav = location.pathname.includes('/detail');
    return (
        <>
            {showNav && <Navbar />}
            <StyledContent showNav={showNav}>
                <Outlet />
            </StyledContent>
        </>
    );
});
