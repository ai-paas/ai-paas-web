import { Table, useTablePagination, type Sorting } from "@innogrid/ui";
import { useState } from "react";

export const KnowledgeBaseTab = () => {
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([
    { id: "name", desc: false },
  ]);
  const [rowData, setRowData] = useState([
    {
      name: "테스트 문서",
      workflow: "워크플로우1",
      type: "RAG",
      owner: "홍길동",
      desc: "설명이 들어갑니다. 설명이 들어갑니다.",
      date: "2025-12-31 10:12",
    },
  ]);
  const columns = [
    {
      id: "name",
      header: "이름",
      accessorFn: (row) => row.name,
      size: 300,
    },
    {
      id: "workflow",
      header: "워크플로우",
      accessorFn: (row) => row.workflow,
      size: 300,
    },
    {
      id: "type",
      header: "유형",
      accessorFn: (row) => row.type,
      size: 285,
    },
    {
      id: "owner",
      header: "소유자",
      accessorFn: (row) => row.owner,
      size: 325,
    },
    {
      id: "desc",
      header: "설명",
      accessorFn: (row) => row.desc,
      size: 334,
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
      <Table
        useClientPagination
        columns={columns}
        data={rowData}
        totalCount={rowData.length}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
      />
    </div>
  );
};
