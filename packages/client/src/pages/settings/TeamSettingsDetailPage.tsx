import { useLocation, useSearchParams, useParams } from 'react-router-dom';
import { styled } from '@semoss/ui';

import {
    TeamMembersTable,
    TeamProjectsTable,
    TeamEnginesTable,
} from '@/components/teams';
import { TeamMembersProviderBanner } from '@/components/teams/TeamMembersProviderBanner';

const StyledContainer = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'flex',
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
}));

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    flexShrink: '0',
}));

export const TeamSettingsDetailPage = () => {
    const { state } = useLocation();

    
    const type = state.type;
    const id = state.id;

    return (
        <StyledContainer>
            <StyledContent>
                {!type ? (
                    <TeamMembersTable groupId={id} name="MEMBERS" />
                ) : (
                    <TeamMembersProviderBanner type={type} />
                )}

                <TeamProjectsTable
                    groupId={id}
                    groupType={type}
                    name="PROJECTS"
                />

                <TeamEnginesTable
                    groupId={id}
                    groupType={type}
                    name="ENGINES"
                />
            </StyledContent>
        </StyledContainer>
    );
};
