import { BreadCrumb } from '@innogrid/ui';
import { useNavigate, useParams } from 'react-router';
import { EditPromptButton } from '../../../components/features/prompt/edit-prompt-button';
import { DeletePromptButton } from '../../../components/features/prompt/delete-prompt-button';
import { useGetPrompt } from '@/hooks/service/prompts';
import { formatDateTime } from '@/util/date';

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
            <EditPromptButton />
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
              <pre className="page-input_item-code">
                <code>{prompt?.content}</code>
              </pre>
            </div>
          </div>
          <div className="page-detail-round-box page-w-536">
            <div className="page-detail-round-name">변수</div>
            <div className="page-detail-round-data page-h-430">
              {prompt?.prompt_variable?.map((variable) => (
                <div key={variable.id}>{variable.name}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
