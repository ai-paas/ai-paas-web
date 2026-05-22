import { Accordion, Input, Select, Slider } from '@innogrid/ui';
import styles from '@/pages/workflow/workflow.module.scss';
import { type ChangeEvent } from 'react';
import { IconArrCount, IconSet } from '@/assets/img/icon';
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@radix-ui/react-popover';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useGetKnowledgeBases } from '@/hooks/service/knowledgebase';

type SelectOption = { text: string; value: string };
type VariableOption = { variable?: string; label?: string };

const TOP_K_MIN = 1;
const TOP_K_MAX = 10;
const TOP_K_DEFAULT = 3;

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.trunc(value)));

const accordionItems = [
  {
    label: '출력 변수',
    component: (
      <div className={styles.accordionContBox}>
        <div className={styles.accordionCont}>
          <div className={styles.accordionContItem}>
            <div className={styles.accordionContName}>Text</div>
            <div className={styles.accordionContValue}>String</div>
          </div>
          <div className={styles.accordionContItem}>
            <div className={styles.accordionContName}>Value data</div>
            <div className={styles.accordionContValue}>Value data name</div>
          </div>
        </div>
      </div>
    ),
  },
];

export const KnowledgeBaseSetting = () => {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const selectedNode = useWorkflowStore((s) => s.nodes.find((n) => n.id === s.selectedNodeId));
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const { knowledgeBases } = useGetKnowledgeBases({ page: 1, size: 999 });

  if (!selectedNode) return null;

  const description = (selectedNode.data.description as string | undefined) ?? '';
  const queryVariable = (selectedNode.data.query_variable as string | undefined) ?? '';
  const knowledgebaseId = (selectedNode.data.knowledgebase_id as string | undefined) ?? '';
  const topK = clampInt(Number(selectedNode.data.top_k ?? TOP_K_DEFAULT), TOP_K_MIN, TOP_K_MAX);

  const connectedStartNodeIds = new Set(
    edges.filter((edge) => edge.target === selectedNode.id).map((edge) => edge.source)
  );

  const queryVariableOptions = Array.from(
    new Map(
      nodes
        .filter((node) => connectedStartNodeIds.has(node.id))
        .flatMap((node) => {
          if (node.type !== 'START') return [];

          const inputFields = (node.data.inputFields ?? []) as VariableOption[];
          return inputFields
            .filter((field) => field.variable)
            .map((field) => ({
              text: field.label?.trim() || field.variable || '',
              value: field.variable || '',
            }));
        })
        .map((option) => [option.value, option])
    ).values()
  );

  const knowledgeBaseOptions = knowledgeBases.map((knowledgeBase) => ({
    text: knowledgeBase.name,
    value: String(knowledgeBase.surro_knowledge_id),
  }));

  const selectedQueryVariable =
    queryVariableOptions.find((option) => option.value === queryVariable) ?? null;
  const selectedKnowledgeBase =
    knowledgeBaseOptions.find((option) => option.value === knowledgebaseId) ?? null;

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
          <div className={`${styles.addItemName} page-icon-requisite`}>쿼리변수</div>
        </div>
        <Select
          options={queryVariableOptions}
          getOptionLabel={(option: SelectOption) => option?.text ?? ''}
          getOptionValue={(option: SelectOption) => option?.value ?? ''}
          value={selectedQueryVariable}
          onChange={(option: SelectOption | null) =>
            updateNodeData(selectedNode.id, { query_variable: option?.value ?? '' })
          }
          menuPosition="fixed"
        />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>지식 베이스</div>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={styles.btnSet}>
                <span className={styles.iconSet}>
                  <IconSet />
                </span>
              </button>
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent sideOffset={5}>
                <div className={`${styles.setBox} ${styles.setBoxSm} ${styles.active}`}>
                  <div className={styles.setName}>검색 설정</div>
                  <div className={styles.setInner}>
                    <div className={styles.setItem}>
                      <div className={styles.setItemName}>
                        <Slider
                          value={[topK]}
                          onValueChange={(value: number[]) =>
                            updateNodeData(selectedNode.id, {
                              top_k: clampInt(value[0] ?? topK, TOP_K_MIN, TOP_K_MAX),
                            })
                          }
                          min={TOP_K_MIN}
                          max={TOP_K_MAX}
                        />{' '}
                        K
                      </div>
                      <div className={styles.numCount}>
                        <input
                          type="number"
                          placeholder="0"
                          min={TOP_K_MIN}
                          max={TOP_K_MAX}
                          step={1}
                          value={topK}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            updateNodeData(selectedNode.id, {
                              top_k: Number.isFinite(next)
                                ? clampInt(next, TOP_K_MIN, TOP_K_MAX)
                                : TOP_K_DEFAULT,
                            });
                          }}
                        />
                        <div className={styles.numCountControl}>
                          <button
                            type="button"
                            className={styles.btnNum}
                            onClick={() =>
                              updateNodeData(selectedNode.id, {
                                top_k: clampInt(topK + 1, TOP_K_MIN, TOP_K_MAX),
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
                              updateNodeData(selectedNode.id, {
                                top_k: clampInt(topK - 1, TOP_K_MIN, TOP_K_MAX),
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
              </PopoverContent>
            </PopoverPortal>
          </Popover>
        </div>
        <Select
          options={knowledgeBaseOptions}
          getOptionLabel={(option: SelectOption) => option?.text ?? ''}
          getOptionValue={(option: SelectOption) => option?.value ?? ''}
          value={selectedKnowledgeBase}
          onChange={(option: SelectOption | null) =>
            updateNodeData(selectedNode.id, { knowledgebase_id: option?.value ?? '' })
          }
          menuPosition="fixed"
        />
      </div>
      <div className={styles.addItemBox}>
        <div>
          <Accordion components={accordionItems} defaultValue="0" />
        </div>
      </div>
    </div>
  );
};
