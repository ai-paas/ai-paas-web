import {
  Accordion,
  Button,
  Checkbox,
  Input,
  RadioGroupButton,
  Select,
  Slider,
  type CheckboxCheckedState,
} from '@innogrid/ui';
import { useEffect, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react';
import styles from '@/pages/workflow/workflow.module.scss';
import { IconArrCount, IconDel } from '@/assets/img/icon';
import { useWorkflowStore } from '@/store/useWorkflowStore';

type FieldTypeValue = 'text' | 'file';
type FieldTypeOption = { text: string; value: FieldTypeValue };

const FIELD_TYPE_OPTIONS: FieldTypeOption[] = [
  { text: '짧은 텍스트', value: 'text' },
  { text: '파일 리스트', value: 'file' },
];

const FIELD_TYPE_LABELS: Record<FieldTypeValue, string> = {
  text: 'String',
  file: 'File List',
};

const FILE_CATEGORIES = [
  {
    value: 'document',
    label: '문서',
    desc: 'txt, MD, MDX, MARKDOWN, PDF, HTML, XLSX, XLS, DOC, DOCX, CSV, EML, MSG, PPTX, PPT, XML, EPUB',
  },
  { value: 'image', label: '이미지', desc: 'JPG, JPEG, PNG, GIF, WEBP, SVG' },
  { value: 'audio', label: '오디오', desc: 'MP3, M4A, WAV, AMR, MPGA' },
  { value: 'video', label: '비디오', desc: 'MP4, MOV, MPEG, WEBM' },
] as const;

const BUILT_IN_FILE_TYPES: readonly string[] = FILE_CATEGORIES.map((c) => c.value);

const FILE_UPLOAD_OPTIONS = [
  { label: '파일 업로드', value: 'basic' },
  { label: 'URL', value: 'url' },
  { label: '모두 사용', value: 'all' },
];

const VARIABLE_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const LABEL_MAX_LENGTH = 48;
const MAX_LENGTH_LIMIT = 4096;
const FILE_MAX_NUMBER_LIMIT = 20;

type InputField = {
  type: FieldTypeValue;
  variable: string;
  label: string;
  max_length: number;
  file_type: string;
  file_upload: string;
  file_max_number: number;
};

const createDefaultField = (variable: string): InputField => ({
  type: 'text',
  variable,
  label: '',
  max_length: 48,
  file_type: '',
  file_upload: 'basic',
  file_max_number: 3,
});

const validateVariable = (v: string): string | undefined => {
  if (!v) return '변수명을 입력해주세요.';
  if (!VARIABLE_PATTERN.test(v)) {
    return '영어, 숫자, _만 사용 가능하며 숫자로 시작할 수 없습니다.';
  }
  return undefined;
};

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.trunc(value)));

export const StartSetting = () => {
  const selectedNode = useWorkflowStore((s) => s.nodes.find((n) => n.id === s.selectedNodeId));
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const [selectedFieldIdx, setSelectedFieldIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<InputField | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [etcText, setEtcText] = useState<string>('');

  const inputFields = (selectedNode?.data.inputFields ?? []) as InputField[];
  const description = (selectedNode?.data.description as string | undefined) ?? '';

  useEffect(() => {
    if (isCreating) return;
    if (inputFields.length === 0) {
      if (selectedFieldIdx !== null) {
        setSelectedFieldIdx(null);
        setDraft(null);
        setEtcText('');
      }
      return;
    }
    if (selectedFieldIdx !== null && selectedFieldIdx >= inputFields.length) {
      setSelectedFieldIdx(null);
      setDraft(null);
      setEtcText('');
    }
  }, [selectedNode?.id, inputFields.length, selectedFieldIdx, isCreating]);

  if (!selectedNode) return null;

  const updateDraft = (partial: Partial<InputField>) => {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const generateVariable = () => {
    const existing = new Set(inputFields.map((f) => f.variable));
    let i = 1;
    while (existing.has(`var_${i}`)) i++;
    return `var_${i}`;
  };

  const addField = () => {
    setIsCreating(true);
    setSelectedFieldIdx(null);
    setDraft(createDefaultField(generateVariable()));
    setEtcText('');
  };

  const selectField = (idx: number) => {
    setIsCreating(false);
    setSelectedFieldIdx(idx);
    setDraft({ ...inputFields[idx] });
    setEtcText('');
  };

  const removeField = (idx: number, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const newFields = inputFields.filter((_, i) => i !== idx);
    updateNodeData(selectedNode.id, { inputFields: newFields });

    if (isCreating) {
      if (selectedFieldIdx !== null && selectedFieldIdx > idx) {
        setSelectedFieldIdx(selectedFieldIdx - 1);
      }
      return;
    }

    if (newFields.length === 0) {
      setSelectedFieldIdx(null);
      setDraft(null);
      setEtcText('');
      return;
    }

    if (selectedFieldIdx === idx) {
      setSelectedFieldIdx(null);
      setDraft(null);
      setEtcText('');
    } else if (selectedFieldIdx !== null && selectedFieldIdx > idx) {
      setSelectedFieldIdx(selectedFieldIdx - 1);
    }
  };

  const variableError = draft ? validateVariable(draft.variable) : undefined;
  const canSave = !!draft && !variableError;

  const closeDraft = () => {
    setIsCreating(false);
    setSelectedFieldIdx(null);
    setDraft(null);
    setEtcText('');
  };

  const saveDraft = () => {
    if (!canSave || !draft) return;
    if (isCreating) {
      updateNodeData(selectedNode.id, { inputFields: [...inputFields, draft] });
    } else if (selectedFieldIdx !== null) {
      const newFields = inputFields.map((f, i) => (i === selectedFieldIdx ? draft : f));
      updateNodeData(selectedNode.id, { inputFields: newFields });
    } else {
      return;
    }
    closeDraft();
  };

  const cancelDraft = () => {
    closeDraft();
  };

  const fileTypes = draft
    ? draft.file_type
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const etcTypes = fileTypes.filter((t) => !BUILT_IN_FILE_TYPES.includes(t));
  const isEtcChecked = etcTypes.length > 0;

  const setFileTypes = (next: string[]) => {
    const deduped = Array.from(new Set(next.map((s) => s.trim()).filter(Boolean)));
    updateDraft({ file_type: deduped.join(',') });
  };

  const toggleFileType = (value: string, checked: boolean) => {
    if (checked) setFileTypes([...fileTypes, value]);
    else setFileTypes(fileTypes.filter((t) => t !== value));
  };

  const addEtcType = () => {
    const trimmed = etcText.trim().replace(/^\./, '').toLowerCase();
    if (!trimmed) return;
    setFileTypes([...fileTypes, trimmed]);
    setEtcText('');
  };

  const removeEtcType = (value: string) => {
    setFileTypes(fileTypes.filter((t) => t !== value));
  };

  const onEtcKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEtcType();
    }
  };

  const fieldTypeValue = draft
    ? (FIELD_TYPE_OPTIONS.find((opt) => opt.value === draft.type) ?? null)
    : null;

  const accordionItems = draft
    ? [
        {
          label: '파일 설정',
          component: (
            <div className={styles.accordionAddBox}>
              <div className={styles.accordionAdd}>
                <div className={styles.accordionAddItem}>
                  {FILE_CATEGORIES.map((cat) => (
                    <div key={cat.value} className={styles.accordionAddCheckBox}>
                      <Checkbox
                        id={`file-cat-${cat.value}`}
                        label={cat.label}
                        checked={fileTypes.includes(cat.value)}
                        onCheckedChange={(value: CheckboxCheckedState) =>
                          toggleFileType(cat.value, value === true)
                        }
                      />
                      <p>{cat.desc}</p>
                    </div>
                  ))}
                  <div className={styles.accordionAddCheckBox}>
                    <Checkbox
                      id="file-cat-etc"
                      label="기타"
                      checked={isEtcChecked}
                      onCheckedChange={(value: CheckboxCheckedState) => {
                        if (value !== true) {
                          setFileTypes(fileTypes.filter((t) => BUILT_IN_FILE_TYPES.includes(t)));
                          setEtcText('');
                        }
                      }}
                    />
                    <div className={styles.accordionAddCheckInput}>
                      <Input
                        placeholder="확장자 입력 후 생성"
                        value={etcText}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEtcText(e.target.value)}
                        onKeyDown={onEtcKeyDown}
                      />
                      <button type="button" className={styles.btnIconPlusSm} onClick={addEtcType}>
                        <span>생성</span>
                      </button>
                    </div>
                  </div>
                  {etcTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-1 pt-2">
                      {etcTypes.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeEtcType(t)}
                            className="text-blue-500 hover:text-blue-700"
                            aria-label={`${t} 삭제`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.accordionAddItem}>
                  <div className={styles.addItemNameBox}>
                    <div className={styles.addItemName}>파일 업로드 방식</div>
                  </div>
                  <RadioGroupButton
                    id="file-upload-mode"
                    options={FILE_UPLOAD_OPTIONS}
                    value={draft.file_upload}
                    onValueChange={(value: string) => updateDraft({ file_upload: value })}
                  />
                </div>
                <div className={styles.accordionAddItem}>
                  <div className={styles.addItemNameBox}>
                    <div className={styles.addItemName}>최대 파일 수</div>
                  </div>
                  <div className={styles.accordionAddItemSet}>
                    <div className={styles.slider}>
                      <Slider
                        value={[draft.file_max_number]}
                        onValueChange={(v: number[]) =>
                          updateDraft({
                            file_max_number: clampInt(v[0] ?? 0, 0, FILE_MAX_NUMBER_LIMIT),
                          })
                        }
                        max={FILE_MAX_NUMBER_LIMIT}
                        min={0}
                      />
                    </div>
                    <div className={styles.numCount}>
                      <input
                        type="number"
                        placeholder="0"
                        step={1}
                        min={0}
                        max={FILE_MAX_NUMBER_LIMIT}
                        value={draft.file_max_number}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          updateDraft({
                            file_max_number: Number.isFinite(next)
                              ? clampInt(next, 0, FILE_MAX_NUMBER_LIMIT)
                              : 0,
                          });
                        }}
                      />
                      <div className={styles.numCountControl}>
                        <button
                          type="button"
                          className={styles.btnNum}
                          onClick={() =>
                            updateDraft({
                              file_max_number: clampInt(
                                draft.file_max_number + 1,
                                0,
                                FILE_MAX_NUMBER_LIMIT
                              ),
                            })
                          }
                        >
                          <span className={`${styles.iconArr} ${styles.iconArrUp}`}>
                            <IconArrCount />
                          </span>
                        </button>
                        <button
                          type="button"
                          className={styles.btnNum}
                          onClick={() =>
                            updateDraft({
                              file_max_number: clampInt(
                                draft.file_max_number - 1,
                                0,
                                FILE_MAX_NUMBER_LIMIT
                              ),
                            })
                          }
                        >
                          <span className={`${styles.iconArr} ${styles.iconArrDown}`}>
                            <IconArrCount />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ]
    : [];

  return (
    <div className={styles.addInner}>
      <div className={styles.addTopBox}>
        <input
          type="text"
          placeholder="이름을 입력해주세요."
          value={selectedNode.data.name ?? ''}
          onChange={(e) => updateNodeData(selectedNode.id, { name: e.target.value })}
          className={styles.addTitleInput}
        />
      </div>

      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>설명</div>
        </div>
        <Input
          placeholder="설명을 입력해주세요."
          value={description}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateNodeData(selectedNode.id, { description: e.target.value })
          }
        />
      </div>

      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>입력필드</div>
          <button type="button" className={styles.btnPlus} onClick={addField}>
            <span>생성</span>
          </button>
        </div>

        {inputFields.length === 0 && (
          <div className={styles.emptyBox}>
            <span>생성된 입력필드가 없습니다.</span>
          </div>
        )}
        {inputFields.map((field, idx) => (
          <div
            key={idx}
            onClick={() => selectField(idx)}
            className={`${styles.addItemField} ${selectedFieldIdx === idx ? styles.active : ''}`}
          >
            <div>
              <span>{'{X}'}</span>
              <span className={styles.addItemFieldId}>{field.variable || '미지정'}</span>
            </div>
            <span className={styles.addItemFieldText}>{FIELD_TYPE_LABELS[field.type]}</span>
            <button
              type="button"
              className={`${styles.btnIconDel} flex items-center justify-center`}
              onClick={(e) => removeField(idx, e)}
            >
              <span className={`${styles.iconDel} flex items-center justify-center`}>
                <IconDel />
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className={`${styles.addItemBox} ${styles.addItemHr}`}>
        <div className={styles.addItemNameBox}>
          <div className={styles.addItemName}>입력필드 설정</div>
          {draft && (
            <div className={styles.row2}>
              <Button onClick={cancelDraft} size="small" color="tertiary">
                취소
              </Button>
              <Button onClick={saveDraft} size="small" color="primary" disabled={!canSave}>
                저장
              </Button>
            </div>
          )}
        </div>
      </div>
      {draft ? (
        <>
          <div className={styles.addItemBox}>
            <div className={styles.addItemNameBox}>
              <div className={styles.addItemName}>필드 타입</div>
            </div>
            <Select
              options={FIELD_TYPE_OPTIONS}
              getOptionLabel={(option: FieldTypeOption) => option?.text ?? ''}
              getOptionValue={(option: FieldTypeOption) => option?.value ?? ''}
              value={fieldTypeValue}
              onChange={(option: FieldTypeOption | null) => {
                if (option) updateDraft({ type: option.value });
              }}
              menuPosition="fixed"
            />
          </div>
          <div className={styles.addItemBox}>
            <div className={styles.addItemNameBox}>
              <div className={styles.addItemName}>변수명</div>
            </div>
            <Input
              placeholder="변수명을 입력해주세요."
              value={draft.variable}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateDraft({ variable: e.target.value })
              }
              variant={variableError ? 'err' : 'default'}
              errMessage={variableError}
            />
          </div>
          <div className={styles.addItemBox}>
            <div className={styles.addItemNameBox}>
              <div className={styles.addItemName}>레이블명</div>
            </div>
            <Input
              placeholder="레이블명을 입력해주세요."
              value={draft.label}
              maxLength={LABEL_MAX_LENGTH}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateDraft({ label: e.target.value.slice(0, LABEL_MAX_LENGTH) })
              }
            />
          </div>

          {draft.type === 'text' && (
            <div className={styles.addItemBox}>
              <div className={styles.addItemNameBox}>
                <div className={styles.addItemName}>최대길이</div>
              </div>
              <Input
                type="number"
                placeholder="0"
                step={1}
                min={0}
                max={MAX_LENGTH_LIMIT}
                value={String(draft.max_length)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const next = Number(e.target.value);
                  updateDraft({
                    max_length: Number.isFinite(next) ? clampInt(next, 0, MAX_LENGTH_LIMIT) : 0,
                  });
                }}
              >
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    className="group flex h-1.25 w-3 items-center justify-center"
                    onClick={() =>
                      updateDraft({
                        max_length: clampInt(draft.max_length + 1, 0, MAX_LENGTH_LIMIT),
                      })
                    }
                  >
                    <span className="block h-1.25 w-2 opacity-60 group-hover:opacity-100">
                      <IconArrCount />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="group flex h-1.25 w-3 items-center justify-center"
                    onClick={() =>
                      updateDraft({
                        max_length: clampInt(draft.max_length - 1, 0, MAX_LENGTH_LIMIT),
                      })
                    }
                  >
                    <span className="block h-1.25 w-2 rotate-180 opacity-60 group-hover:opacity-100">
                      <IconArrCount />
                    </span>
                  </button>
                </div>
              </Input>
            </div>
          )}

          {draft.type === 'file' && (
            <div className={styles.addItemBox}>
              <Accordion

                components={accordionItems}
                defaultValue="0"
              />
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyBox}>
          <span>입력필드를 생성하거나 선택해주세요.</span>
        </div>
      )}
    </div>
  );
};
