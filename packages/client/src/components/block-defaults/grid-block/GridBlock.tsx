import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useBlock, useFrame } from '@/hooks';
import { BlockComponent, BlockDef } from '@/stores';
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

import { GridBlockColumn } from './grid-block.types';
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

export interface GridBlockDef extends BlockDef<'grid'> {
    widget: 'grid';

    /** data associated with the block */
    data: {
        /** Bind the grid to a frame */
        frame: {
            name: string;
        };

        /** Column Definitions */
        columns: GridBlockColumn[];

        /** */
        style: Pick<
            React.CSSProperties,
            | 'background'
            | 'border'
            | 'borderColor'
            | 'borderStyle'
            | 'borderWidth'
            | 'height'
            | 'width'
        >;
    };
}

export const GridBlock: BlockComponent = observer(({ id }) => {
    const { attrs, data } = useBlock<GridBlockDef>(id);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        column: GridBlockColumn;
        value: unknown;
    } | null>(null);

    // get the frame
    const frame = useFrame(data.frame.name, {
        limit: rowsPerPage * page,
        collect: rowsPerPage,
        enableCount: true,
    });

    // get the columns as as a map
    const columnMap: Record<string, GridBlockColumn> = data.columns.reduce(
        (acc, val) => {
            acc[val.key] = val;

            return acc;
        },
        {},
    );

    // get the total width of the table based on the columns
    const tableWidth: number = data.columns.reduce((acc, val) => {
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
        column: GridBlockColumn,
        value: unknown,
    ) => {
        // prevent the default interaction
        event.preventDefault();

        // open the menu and save the data
        setContextMenu(
            contextMenu === null
                ? {
                      mouseX: event.clientX + 2,
                      mouseY: event.clientY - 6,
                      column: column,
                      value: value,
                  }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                  // Other native context menus might behave different.
                  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                  null,
        );
    };

    return (
        <StyledBlock sx={data.style} {...attrs}>
            <StyledTableContainer>
                <Table
                    size="small"
                    stickyHeader={true}
                    sx={{ minWidth: tableWidth }}
                >
                    <TableHead>
                        <StyledTableHeadRow>
                            {frame.status === 'SUCCESS'
                                ? frame.data.headers.map((h) => {
                                      // check if the header as a column
                                      const column = columnMap[h];
                                      if (!column) {
                                          return null;
                                      }

                                      return (
                                          <StyledTableHeadCell
                                              key={column.key}
                                              align="left"
                                              title={column.name}
                                              sx={{
                                                  //This component is weird because it is a table / has a special layout, you have to either use minWidth or maxWidth
                                                  maxWidth: !isNaN(
                                                      Number(column.width),
                                                  )
                                                      ? column.width
                                                      : DEFAULT_COLUMN_WIDTH,
                                              }}
                                          >
                                              {column.name}
                                          </StyledTableHeadCell>
                                      );
                                  })
                                : null}
                            {frame.status === 'LOADING' ? (
                                <LinearProgress />
                            ) : null}
                        </StyledTableHeadRow>
                    </TableHead>
                    <TableBody>
                        {frame.status === 'SUCCESS'
                            ? frame.data.values.map((r, rIdx) => {
                                  return (
                                      <TableRow key={rIdx}>
                                          {r.map((v, hIdx) => {
                                              const header =
                                                  frame.data.headers[hIdx];

                                              // check if the header exists as a column
                                              const column = columnMap[header];
                                              if (!column) {
                                                  return null;
                                              }

                                              // str for rendering and title
                                              const str =
                                                  v !== 'string'
                                                      ? JSON.stringify(v)
                                                      : v;

                                              return (
                                                  <StyledTableCell
                                                      key={column.key}
                                                      align="left"
                                                      title={str}
                                                      sx={{
                                                          //This component is weird because it is a table / has a special layout, you have to either use minWidth or maxWidth
                                                          maxWidth: !isNaN(
                                                              Number(
                                                                  column.width,
                                                              ),
                                                          )
                                                              ? column.width
                                                              : DEFAULT_COLUMN_WIDTH,
                                                      }}
                                                      onContextMenu={(e) =>
                                                          handleTableCellOnContextMenu(
                                                              e,
                                                              column,
                                                              v,
                                                          )
                                                      }
                                                  >
                                                      {str}
                                                  </StyledTableCell>
                                              );
                                          })}
                                      </TableRow>
                                  );
                              })
                            : null}
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
                {/* {data.contextMenu?.items.map((i, idx) => (
                    <MenuItem
                        key={idx}
                        dense={true}
                        value={idx}
                        onClick={() => console.log(i.action)}
                    >
                        {i.name}
                    </MenuItem>
                ))} */}
                {/* TODO: */}
                <MenuItem value={'TODO'}>TODO</MenuItem>
            </Menu>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={frame.count}
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
