import { BreadCrumb } from '@innogrid/ui';
import { Fragment, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { EditPromptButton } from '../../../components/features/prompt/edit-prompt-button';
import { DeletePromptButton } from '../../../components/features/prompt/delete-prompt-button';
import { useGetPrompt } from '@/hooks/service/prompts';
import { formatDateTime } from '@/util/date';

/** 본문에서 `{{#변수#}}`를 찾아 인디고 칩으로 강조한다 (에디터 하이라이트와 동일 색). */
const VARIABLE_RE = /\{\{#\s*([^{}#]+?)\s*#\}\}/g;

const highlightVariables = (content: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (let m = VARIABLE_RE.exec(content); m !== null; m = VARIABLE_RE.exec(content)) {
    if (m.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{content.slice(lastIndex, m.index)}</Fragment>);
    }
    nodes.push(
      <span
        key={key++}
        className="rounded-sm bg-[#eef2ff] py-px text-[#4f46e5] box-decoration-clone"
      >
        {m[0]}
      </span>
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < content.length) {
    nodes.push(<Fragment key={key++}>{content.slice(lastIndex)}</Fragment>);
  }
  return nodes;
};

const VariableChip = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-2">
    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-[#eef2ff] text-sm font-semibold text-[#4f46e5]">
      #
    </span>
    <span className="flex min-w-0 flex-col">
      <span className="truncate text-[13px] font-medium text-[#24292f]">{name}</span>
      <span className="truncate text-xs text-[#999]">{`{{#${name}#}}`}</span>
    </span>
  </div>
);

export default function PromptDetailPage() {
  const { id } = useParams();
  const promptId = Number(id);
  const { prompt } = useGetPrompt(promptId);
  const navigate = useNavigate();

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '프롬프트', path: '/prompt' }, { label: prompt?.name || '' }]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">프롬프트 테스트</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <EditPromptButton promptId={promptId} />
            <DeletePromptButton promptId={promptId} />
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          {/* 최대 ul 3개, li 5개 사용 해주세요. */}
          <ul className="page-detail-list">
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">
                {formatDateTime(prompt?.created_at.toString()) ?? 'N/A'}
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">최근 업데이트</div>
              <div className="page-detail_item-data">
                {formatDateTime(prompt?.updated_at.toString()) ?? 'N/A'}
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">{prompt?.description ?? 'N/A'}</div>
            </li>
            <li>
              <div className="page-detail_item-name">생성자</div>
              <div className="page-detail_item-data">{prompt?.created_by ?? 'N/A'}</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <div className="page-content-detail-row2">
          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">프롬프트</div>
            <div className="page-detail-round-data page-h-430">
              {prompt?.content ? (
                <p className="text-[14px] leading-[1.7] whitespace-pre-wrap wrap-break-word text-[#24292f]">
                  {highlightVariables(prompt.content)}
                </p>
              ) : (
                <div className="flex h-full items-center justify-center text-[13px] text-[#999]">
                  내용이 없습니다.
                </div>
              )}
            </div>
          </div>
          <div className="page-detail-round-box page-w-536">
            <div className="page-detail-round-name">
              변수
              {prompt?.prompt_variable?.length ? (
                <span className="ml-1.5 text-[#999]">{prompt.prompt_variable.length}</span>
              ) : null}
            </div>
            <div className="page-detail-round-data page-h-430">
              {prompt?.prompt_variable?.length ? (
                <div className="flex flex-col gap-2">
                  {prompt.prompt_variable.map((variable) => (
                    <VariableChip key={variable.id} name={variable.name} />
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-[13px] text-[#999]">
                  사용 중인 변수가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
