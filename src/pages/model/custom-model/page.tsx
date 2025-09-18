import {
  BreadCrumb,
  CellCheckbox,
  HeaderCheckbox,
  SearchInput,
  Table,
  useSearchInputState,
  useTablePagination,
  useTableSelection,
  type Sorting,
} from "@innogrid/ui";
import { useState } from "react";
import { CreateCustomModelButton } from "../../../components/features/model/create-custom-model-button";
import { Link } from "react-router";
import { EditCustomModelButton } from "../../../components/features/model/edit-custom-model-button";
import { DeleteCustomModelButton } from "../../../components/features/model/delete-custom-model-button";
import { HardwareOptimizationButton } from "../../../components/features/model/hardware-optimization-button";
import { ModelCompressionButton } from "../../../components/features/model/model-compression-button";

export default function CustomModelPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([
    { id: "name", desc: false },
  ]);

  return (
    <main>
      <BreadCrumb
        items={[{ label: "모델" }, { label: "커스텀 모델" }]}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">커스텀 모델</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateCustomModelButton />
            <EditCustomModelButton />
            <DeleteCustomModelButton />
            <HardwareOptimizationButton />
            <ModelCompressionButton />
          </div>
          <div>
            <div>
              <SearchInput
                variant="default"
                placeholder="검색어를 입력해주세요"
                {...restProps}
              />
            </div>
          </div>
        </div>
        <div>
          <Table
            useClientPagination
            useMultiSelect
            columns={columns}
            data={data}
            totalCount={data.length}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            setSorting={setSorting}
            sorting={sorting}
          />
        </div>
      </div>
    </main>
  );
}

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
    size: 225,
    cell: ({ row }) => (
      <Link to={"/model/custom-model/test"} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "id",
    header: "워크플로우 ID",
    accessorFn: (row) => row.tag,
    size: 225,
  },
  {
    id: "creator",
    header: "생성자",
    accessorFn: (row) => row.creator,
    size: 225,
  },
  {
    id: "service",
    header: "서비스",
    accessorFn: (row) => row.desc,
    size: 234,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: "category",
    header: "카테고리",
    accessorFn: (row) => row.date,
    size: 225,
  },
  {
    id: "status",
    header: "상태",
    accessorFn: (row) => row.date,
    size: 225,
  },
  {
    id: "desc",
    header: "설명",
    accessorFn: (row) => row.date,
    size: 225,
  },
  {
    id: "date",
    header: "생성일시",
    accessorFn: (row) => row.date,
    size: 225,
  },
];

const data = [
  {
    name: "Sample1",
    tag: "Custom",
    creator: "CustomA",
    desc: "설명이 들어갑니다. 설명이 들어갑니다.",
    date: "2025-12-31 10:12",
  },
  {
    name: "Sample2",
    tag: "Custom",
    creator: "CustomB",
    desc: "설명이 들어갑니다. 설명이 들어갑니다.",
    date: "2025-12-31 10:12",
  },
  {
    name: "Sample3",
    tag: "Custom",
    creator: "CustomC",
    desc: "설명이 들어갑니다. 설명이 들어갑니다.",
    date: "2025-12-31 10:12",
  },
  {
    name: "Sample4",
    tag: "Custom",
    creator: "CustomD",
    desc: "설명이 들어갑니다. 설명이 들어갑니다.",
    date: "2025-12-31 10:12",
  },
  {
    name: "Sample5",
    tag: "Custom",
    creator: "CustomE",
    desc: "설명이 들어갑니다. 설명이 들어갑니다.",
    date: "2025-12-31 10:12",
  },
  {
    name: "Sample6",
    tag: "Custom",
    creator: "CustomF",
    desc: "설명이 들어갑니다. 설명이 들어갑니다.",
    date: "2025-12-31 10:12",
  },
  {
    name: "Sample7",
    tag: "Custom",
    creator: "CustomG",
    desc: "설명이 들어갑니다. 설명이 들어갑니다.",
    date: "2025-12-31 10:12",
  },
  {
    name: "Sample8",
    tag: "Custom",
    creator: "CustomH",
    desc: "설명이 들어갑니다. 설명이 들어갑니다.",
    date: "2025-12-31 10:12",
  },
  {
    name: "Sample9",
    tag: "Custom",
    creator: "CustomI",
    desc: "설명이 들어갑니다. 설명이 들어갑니다.",
    date: "2025-12-31 10:12",
  },
  {
    name: "Sample10",
    tag: "Custom",
    creator: "CustomJ",
    desc: "설명이 들어갑니다. 설명이 들어갑니다.",
    date: "2025-12-31 10:12",
  },
];
