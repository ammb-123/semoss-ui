import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useBlock } from '@/hooks';
import { BlockComponent } from '@/stores';
import {
    styled,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Menu,
} from '@mui/material';

import { GridColumn, GridRow, GridBlockDef } from './grid-block.types';
import { MenuItem } from '@semoss/ui';

const DEFAULT_HEIGHT = '300px';
const DEFAULT_WIDTH = '500px';
const DEFAULT_COLUMN_WIDTH = '160px';

const StyledBlock = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: DEFAULT_HEIGHT,
    width: DEFAULT_WIDTH,
    overflow: 'hidden',
}));

const StyledTableContainer = styled(TableContainer)(() => ({
    flex: '1',
}));

const StyledTableHeadRow = styled(TableRow)(() => ({
    color: 'inherit',
    backgroundColor: 'inherit',
}));

const StyledTableHeadCell = styled(TableCell)(() => ({
    textTransform: 'capitalize',
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledTableCell = styled(TableCell)(() => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

export const GridBlock: BlockComponent = observer(({ id }) => {
    const { dispatch, attrs, data } = useBlock<GridBlockDef>(id);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        column: GridColumn;
        row: GridRow;
    } | null>(null);

    // get the headers
    const columns: GridColumn[] = useMemo(() => {
        if (data.source === 'CUSTOM') {
            // TODO: Remove this check. This is bad.
            try {
                if (!data.columns) {
                    return [];
                } else if (typeof data.columns === 'string') {
                    return JSON.parse(data.columns || []);
                } else if (Array.isArray(data.columns)) {
                    return data.columns;
                }
            } catch (e) {
                // noop
            }

            return [];
        } else if (data.source === 'FRAME') {
            return [];
        }

        return [];
    }, [data.source, data.columns]);

    // get the values
    const values: Record<string, GridRow>[] = useMemo(() => {
        if (data.source === 'CUSTOM') {
            // TODO: Remove this conversion. This is bad.
            let values = [];
            try {
                if (!data.values) {
                    values = [];
                } else if (typeof data.values === 'string') {
                    values = JSON.parse(data.values) as Record<
                        string,
                        GridRow
                    >[];
                } else if (Array.isArray(data.values)) {
                    values = data.values as Record<string, GridRow>[];
                }
            } catch (e) {
                // noop
            }

            return values;
        } else if (data.source === 'FRAME') {
            return [];
        }

        return [];
    }, [data.source, data.values]);

    // get the rows
    const rows: Record<string, GridRow>[] = useMemo(() => {
        if (data.source === 'CUSTOM') {
            return values
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                    return Object.keys(row).reduce((acc, val) => {
                        // convert to string
                        acc[val] =
                            typeof row[val] === 'string'
                                ? row[val]
                                : JSON.stringify(row[val]);

                        return acc;
                    }, {});
                });
        } else if (data.source === 'FRAME') {
            return [];
        }

        return [];
    }, [data.source, values, page, rowsPerPage]);

    // get the count
    let count = 0;
    if (data.source === 'CUSTOM') {
        count = values.length;
    } else if (data.source === 'FRAME') {
        count == 0;
    }

    // get the total width of the table based on the columns
    const tableWidth: number = columns.reduce((acc, val) => {
        if (val.hidden) {
            return acc;
        }

        // if it is a number, add it
        if (!isNaN(Number(val.width))) {
            return acc + Number(val.width);
        }

        return acc + parseInt(DEFAULT_COLUMN_WIDTH);
    }, 0);

    /**
     * Handle the callback for the context menu
     * @param event - triggered event
     * @param column - selected column
     * @param row - value
     */
    const handleTableCellOnContextMenu = (
        event: React.MouseEvent,
        column: GridColumn,
        row: GridRow,
    ) => {
        // prevent the default interaction
        event.preventDefault();

        // ignore if there are no items
        if (!data.contextMenu || data.contextMenu.items.length === 0) {
            return;
        }

        // open the menu and save the data
        setContextMenu(
            contextMenu === null
                ? {
                      mouseX: event.clientX + 2,
                      mouseY: event.clientY - 6,
                      column: column,
                      row: row,
                  }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                  // Other native context menus might behave different.
                  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                  null,
        );
    };

    return (
        <StyledBlock sx={{ ...data.style }} {...attrs}>
            <StyledTableContainer>
                <Table
                    size="small"
                    stickyHeader={true}
                    sx={{ minWidth: tableWidth }}
                >
                    <TableHead>
                        <StyledTableHeadRow>
                            {columns.map((c) => {
                                return (
                                    <StyledTableHeadCell
                                        key={c.key}
                                        align="left"
                                        title={c.name}
                                        sx={{
                                            //This component is weird because it is a table / has a special layout, you have to either use minWidth or maxWidth
                                            maxWidth: !isNaN(Number(c.width))
                                                ? c.width
                                                : DEFAULT_COLUMN_WIDTH,
                                        }}
                                    >
                                        {c.name}
                                    </StyledTableHeadCell>
                                );
                            })}
                        </StyledTableHeadRow>
                        {data?.loading ? (
                            <tr>
                                <td colSpan={100}>
                                    <LinearProgress color="inherit" />
                                </td>
                            </tr>
                        ) : (
                            <></>
                        )}
                    </TableHead>
                    <TableBody>
                        {rows.length ? (
                            rows.map((r, rIdx) => {
                                return (
                                    <TableRow key={rIdx}>
                                        {columns.map((c) => {
                                            return (
                                                <StyledTableCell
                                                    key={c.key}
                                                    align="left"
                                                    title={r[c.key]}
                                                    sx={{
                                                        //This component is weird because it is a table / has a special layout, you have to either use minWidth or maxWidth
                                                        maxWidth: !isNaN(
                                                            Number(c.width),
                                                        )
                                                            ? c.width
                                                            : DEFAULT_COLUMN_WIDTH,
                                                    }}
                                                    onContextMenu={(e) =>
                                                        handleTableCellOnContextMenu(
                                                            e,
                                                            c,
                                                            r[c.key],
                                                        )
                                                    }
                                                >
                                                    {c.hidden ? (
                                                        <>&nbsp;</>
                                                    ) : (
                                                        r[c.key]
                                                    )}
                                                </StyledTableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={100}>&nbsp;</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </StyledTableContainer>
            <Menu
                open={contextMenu !== null}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                {data.contextMenu?.items.map((i, idx) => (
                    <MenuItem
                        key={idx}
                        dense={true}
                        value={idx}
                        onClick={() => dispatch(i.action)}
                    >
                        {i.name}
                    </MenuItem>
                ))}
            </Menu>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setPage(0);
                }}
            />
        </StyledBlock>
    );
});
