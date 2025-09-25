import {
  CellCheckbox,
  HeaderCheckbox,
  Table,
  useTablePagination,
  useTableSelection,
  type Sorting,
} from "@innogrid/ui";
import { CreateWorkflowButton } from "../workflow/create-workflow-button";
import { DeleteWorkflowButton } from "../workflow/delete-workflow-button";
import { EditWorkflowButton } from "../workflow/edit-workflow-button";
import { useState } from "react";
import { Link } from "react-router";

export const WorkflowTab = () => {
  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([
    { id: "name", desc: false },
  ]);
  const [rowData, setRowData] = useState([
    {
      name: "테스트워크플로우",
      id: "워크플로우 001",
      state: "Running",
      desc: "설명이 들어갑니다. 설명이 들어갑니다.",
      date: "2025-12-31 10:12",
    },
  ]);
  const columns = [
    {
      id: "select",
      size: 30,
      header: ({ table }) => <HeaderCheckbox table={table} />,
      cell: ({ row }) => <CellCheckbox row={row} />,
      enableSorting: false, //오름차순/내림차순 아이콘 숨기기
    },
    {
      id: "name",
      header: "이름",
      accessorFn: (row) => row.name,
      size: 325,
      cell: ({ row }) => (
        <Link to={`/workflow/${row.original.name}`} className="table-td-link">
          {row.original.name}
        </Link>
      ),
    },
    {
      id: "id",
      header: "워크플로우ID",
      accessorFn: (row) => row.id,
      size: 325,
    },
    {
      id: "state",
      header: "상태",
      accessorFn: (row) => row.state,
      size: 325,
      cell: ({ row }) => (
        <span className="table-td-state table-td-state-run">
          {row.original.state}
        </span>
      ),
    },
    {
      id: "desc",
      header: "설명",
      accessorFn: (row) => row.desc,
      size: 434,
      enableSorting: false, //오름차순/내림차순 아이콘 숨기기
    },
    {
      id: "date",
      header: "생성일시",
      accessorFn: (row) => row.date,
      size: 325,
    },
  ];

  return (
    <div className="tabs-Content">
      <div className="page-toolBox">
        <div className="page-toolBox-btns">
          <CreateWorkflowButton />
          <EditWorkflowButton />
          <DeleteWorkflowButton />
        </div>
      </div>
      <div>
        <Table
          useClientPagination
          useMultiSelect
          columns={columns}
          data={rowData}
          totalCount={rowData.length}
          pagination={pagination}
          setPagination={setPagination}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          setSorting={setSorting}
          sorting={sorting}
        />
      </div>
    </div>
  );
};
