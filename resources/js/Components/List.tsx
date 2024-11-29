import React from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { Edit2Icon, Eye, Trash } from "lucide-react";

interface ListProps {
    rows: any[];
    columns: string[];
    onEdit: (row: any) => void;
    onDelete: (row: any) => void;
    onView: (row: any) => void;
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function List({
    rows,
    columns,
    onEdit,
    onDelete,
    onView,
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
}: ListProps) {
    const gridColumns: GridColDef[] = [
        ...columns.map((column) => ({
            field: column,
            headerName: column.charAt(0).toUpperCase() + column.slice(1),
            flex: 1,
            sortable: true,
        })),
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                    }}
                >
                    <IconButton
                        onClick={() => onView(params.row)}
                        aria-label="view"
                        color="primary"
                    >
                        <Eye size={18} />
                    </IconButton>
                    <IconButton
                        onClick={() => onEdit(params.row)}
                        aria-label="edit"
                        color="success"
                    >
                        <Edit2Icon size={18} />
                    </IconButton>
                    <IconButton
                        onClick={() => onDelete(params.row)}
                        aria-label="delete"
                        color="error"
                    >
                        <Trash size={18} />
                    </IconButton>
                </div>
            ),
        },
    ];

    return (
        <div
            style={{
                height: "320px",
                width: "100%",
                overflow: "auto",
                padding: "10px",
            }}
        >
            <DataGrid
                rows={rows}
                columns={gridColumns}
                pageSize={itemsPerPage}
                rowsPerPageOptions={[itemsPerPage]}
                pagination
                paginationMode="server"
                onPageChange={(params) => onPageChange(params.page + 1)} // Handling page change
                rowCount={totalItems}
                disableSelectionOnClick
                autoHeight
                sx={{
                    "& .MuiDataGrid-cell": {
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                    },
                }}
            />
        </div>
    );
}
