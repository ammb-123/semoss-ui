import { useState } from 'react';
import {
    DeleteOutline,
    FolderOutlined,
    InsertDriveFileOutlined,
} from '@mui/icons-material';
import {
    CircularProgress,
    Icon,
    IconButton,
    styled,
    TreeView,
    Typography,
} from '@semoss/ui';
import { usePixel } from '@/hooks';

const StyledNode = styled(TreeView.Item)(({ theme }) => ({
    '.MuiCollapse-wrapperInner': {
        height: 'auto',
        overflow: 'none',
    },
}));

const StyledLabel = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: theme.spacing(3),
    width: '100%',
    gap: theme.spacing(1),
}));

const StyledTypography = styled(Typography)(() => ({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flex: '1',
}));

interface FileNodeProps {
    /** Type of file opened */
    type: 'app' | 'insight';

    /** Space where the file is located */
    space: string;

    /** file details */
    name: string;
    path: string;
    isDirectory: boolean;
    lastModified: string;

    /** node details */
    expanded: string[];
    selected: string[];

    /** Triggered when the Track Icon is clicked */
    onTrashClick: (filePath: string) => void;
}

export const FileNode = (props: FileNodeProps) => {
    const {
        type,
        space,
        path,
        name,
        isDirectory,
        expanded,
        selected,
        onTrashClick = () => null,
    } = props;
    const [isHovered, setIsHovered] = useState(false);

    const isOpen = expanded.indexOf(path) > -1;
    const isSelected = selected.indexOf(path) > -1;

    const getAssets = usePixel<
        {
            lastModified: string;
            name: string;
            path: string;
            type: 'directory' | 'file';
        }[]
    >(
        isDirectory && isOpen
            ? type === 'app'
                ? `BrowseAsset(filePath=["${path}"], space=["${space}"]);`
                : ''
            : '',
    );

    return (
        <StyledNode
            key={path}
            nodeId={path}
            title={name}
            label={
                <StyledLabel
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <Icon color={'disabled'} fontSize="small">
                        {isDirectory ? (
                            <FolderOutlined fontSize="inherit" />
                        ) : (
                            <InsertDriveFileOutlined fontSize="inherit" />
                        )}
                    </Icon>
                    <StyledTypography variant="body2">{name}</StyledTypography>
                    {isHovered ? (
                        <IconButton
                            title={`Delete ${name}`}
                            onClick={(e) => {
                                // don't allow it to propagate
                                e.stopPropagation();

                                // trigger
                                onTrashClick(path);
                            }}
                            size="small"
                            color={'default'}
                        >
                            <DeleteOutline fontSize="inherit" />
                        </IconButton>
                    ) : null}
                </StyledLabel>
            }
        >
            {isDirectory ? (
                <>
                    {getAssets.status === 'INITIAL' ||
                    getAssets.status === 'LOADING' ? (
                        <Icon color="disabled">
                            <CircularProgress color="inherit" size={'small'} />
                        </Icon>
                    ) : null}
                    {getAssets.status === 'SUCCESS'
                        ? getAssets.data.map((n) => {
                              return (
                                  <FileNode
                                      key={n.path}
                                      type={type}
                                      space={space}
                                      isDirectory={n.type === 'directory'}
                                      name={n.name}
                                      path={n.path}
                                      lastModified={n.lastModified}
                                      expanded={expanded}
                                      selected={selected}
                                      onTrashClick={(path) => {
                                          onTrashClick(path);
                                      }}
                                  />
                              );
                          })
                        : null}
                </>
            ) : null}
        </StyledNode>
    );
};
