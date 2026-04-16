import { BreadCrumb, Button, Input, Textarea } from '@innogrid/ui';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useGetKnowledgeBase, useUpdateKnowledgeBase } from '@/hooks/service/knowledgebase';

interface KnowledgeBaseForm {
  name: string;
  description: string;
}

export default function KnowledgeBaseEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const surro_knowledge_id = Number(id);

  const { knowledgeBase } = useGetKnowledgeBase(surro_knowledge_id);
  const { updateKnowledgeBase, isPending } = useUpdateKnowledgeBase();

  const [formData, setFormData] = useState<KnowledgeBaseForm>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!knowledgeBase) return;
    setFormData({
      name: knowledgeBase.name ?? '',
      description: knowledgeBase.description ?? '',
    });
  }, [knowledgeBase]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    updateKnowledgeBase(
      { surro_knowledge_id, ...formData },
      { onSuccess: () => navigate('/knowledge-base') },
    );
  };

  return (
    <main>
      <BreadCrumb
        items={[{ label: '지식 베이스', path: '/knowledge-base' }, { label: '지식 베이스 편집' }]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">지식 베이스 편집</h2>
      </div>
      <div className="page-content page-pb-40">
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">이름</div>
            <div className="page-input_item-data">
              <Input
                name="name"
                placeholder="이름을 입력해주세요."
                value={formData.name}
                onChange={onChange}
              />
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data">
              <Textarea
                name="description"
                placeholder="설명을 입력해주세요."
                value={formData.description}
                onChange={onChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="page-footer">
        <div className="page-footer_btn-box">
          <div />
          <div>
            <Button size="large" color="secondary" onClick={() => navigate('/knowledge-base')}>
              취소
            </Button>
            <Button size="large" color="primary" disabled={isPending} onClick={handleSubmit}>
              저장
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
