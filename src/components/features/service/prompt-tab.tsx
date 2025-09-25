import { Table, useTablePagination, type Sorting } from "@innogrid/ui";
import { useState } from "react";

export const PromptTab = () => {
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([
    { id: "name", desc: false },
  ]);
  const [rowData, setRowData] = useState([
    {
      name: "프롬프트1",
      creator: "홍길동",
      variable: "3개",
      desc: "설명이 들어갑니다. 설명이 들어갑니다.",
      date: "2025-12-31 10:12",
    },
  ]);
  const columns = [
    {
      id: "name",
      header: "이름",
      accessorFn: (row) => row.name,
      size: 334,
    },
    {
      id: "creator",
      header: "생성자",
      accessorFn: (row) => row.creator,
      size: 334,
    },
    {
      id: "variable",
      header: "변수",
      accessorFn: (row) => row.variable,
      size: 334,
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
