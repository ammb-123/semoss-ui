import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
    ContentCopyOutlined,
    DeleteOutline,
    SourceOutlined,
} from '@mui/icons-material';
import { alpha, Icon, IconButton, Stack, styled, Typography } from '@semoss/ui';

const StyledItem = styled('li', {
    shouldForwardProp: (prop) => prop !== 'isDragging' && prop !== 'isSelected',
})<{
    isDragging: boolean;
    isSelected: boolean;
}>(({ theme, isDragging, isSelected }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.spacing(4),
    width: '100%',
    padding: theme.spacing(0.5),
    gap: theme.spacing(0.5),
    opacity: isDragging ? theme.palette.action.hoverOpacity : 1,
    backgroundColor: isSelected
        ? alpha(
              theme.palette.primary.main,
              theme.palette.action.selectedOpacity,
          )
        : theme.palette.background.paper,
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledTypography = styled(Typography)(() => ({
    textAlign: 'left',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flex: '1',
}));

interface NotebookExplorerItemProps {
    /**  Details */
    id: string;

    /*** Track if the item is selected*/
    isSelected: boolean;

    /** Triggered when the item is clicked*/
    onClick: () => void;

    /** Triggered when the item starts dragging */
    onDragStart: () => void;

    /** Triggered when the item's trash icon */
    onTrashClick: () => void;

    /** Triggered when the item's copy icon */
    onCopyClick: () => void;
}

export const NotebookExplorerItem: React.FC<NotebookExplorerItemProps> =
    observer((props) => {
        const {
            id,
            isSelected = false,
            onClick = () => null,
            onDragStart = () => null,
            onTrashClick = () => null,
            onCopyClick = () => null,
        } = props;

        const [isHovered, setIsHovered] = useState(false);
        const [isDragging, setIsDragging] = useState(false);

        const name = id;

        return (
            <StyledItem
                draggable={true}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                isDragging={isDragging}
                isSelected={isSelected}
                onDragStart={() => {
                    setIsDragging(true);

                    // trigger the callback
                    onDragStart();
                }}
                onDragEnd={() => {
                    setIsDragging(false);
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                <Icon color={'disabled'} fontSize="small">
                    <SourceOutlined fontSize="inherit" />
                </Icon>
                <StyledTypography variant="body2">{name}</StyledTypography>
                {isHovered ? (
                    <Stack direction="row" alignItems={'center'} spacing={0}>
                        <IconButton
                            title={`Duplicate ${name}`}
                            onClick={(e) => {
                                // don't allow it to propagate
                                e.stopPropagation();

                                // trigger
                                onCopyClick();
                            }}
                            size="small"
                            color={'default'}
                        >
                            <ContentCopyOutlined fontSize="inherit" />
                        </IconButton>
                        <IconButton
                            title={`Delete ${name}`}
                            onClick={(e) => {
                                // don't allow it to propagate
                                e.stopPropagation();

                                // trigger
                                onTrashClick();
                            }}
                            size="small"
                            color={'default'}
                        >
                            <DeleteOutline fontSize="inherit" />
                        </IconButton>
                    </Stack>
                ) : null}
            </StyledItem>
        );
    });
