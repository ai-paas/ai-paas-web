import { useState } from 'react';
import { BreadCrumb, Button, Input, Textarea } from '@innogrid/ui';
import { IconDocument, IconFileUp } from '../../../assets/img/icon';
import { useNavigate } from 'react-router';
import { useCreateDataset } from '@/hooks/service/datasets';

interface Dataset {
  name: string;
  description: string;
  file?: File;
}

export default function DatasetCreatePage() {
  const [dataset, setDataset] = useState<Dataset>({
    name: '',
    description: '',
  });
  const { createDataset, isPending } = useCreateDataset();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setDataset((prev) => ({ ...prev, file: filesArray[0] }));
    }
  };

  const handleSubmit = async () => {
    if (!dataset.name || !dataset.description || !dataset.file) return;

    const formData = new FormData();
    formData.append('name', dataset.name);
    formData.append('description', dataset.description);
    formData.append('file', dataset.file);

    await createDataset(formData);
    navigate('/dataset');
  };

  return (
    <main>
      <BreadCrumb
        items={[{ label: '데이터 셋', path: '/dataset' }, { label: '데이터 셋 생성' }]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">데이터 셋 생성</h2>
      </div>
      <div className="page-content page-pb-40">
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">이름</div>
            <div className="page-input_item-data">
              <Input
                placeholder="이름을 입력해주세요."
                value={dataset.name}
                onChange={(e) => setDataset({ ...dataset, name: e.target.value })}
              />
              <p className="page-input_item-input-desc">이름 입력에 대한 설명글이 들어갑니다.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">학습 파일</div>
            <div className="page-input_item-data">
              <div className="page-input_item-data_fileUpload">
                <label className="fileUpload-preview">
                  <input type="file" className="fileUpload-file" onChange={handleFileChange} />
                  <IconFileUp />
                  <p className="fileUpload-preview_msg">
                    파일을 여기에 드래그하거나 클릭하여 업로드하세요.
                    <br />
                    (jpg/jpeg 50MB 이하)
                  </p>
                </label>
                {dataset.file && (
                  <div className="flex items-center gap-2">
                    <IconDocument className="page-icon-document" />
                    <span>{dataset.file.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">설명</div>
            <div className="page-input_item-data">
              <Textarea
                value={dataset.description}
                onChange={(e) => setDataset({ ...dataset, description: e.target.value })}
                placeholder="설명을 입력해주세요."
              />
            </div>
          </div>
        </div>
      </div>
      <div className="page-footer">
        <div className="page-footer_btn-box">
          <div />
          <div>
            <Button size="large" color="secondary" onClick={() => navigate('/dataset')}>
              취소
            </Button>
            <Button size="large" color="primary" disabled={isPending} onClick={handleSubmit}>
              생성
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
