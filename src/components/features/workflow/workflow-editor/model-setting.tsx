import { IconArrCount } from '@/assets/img/icon';
import { useGetCustomModels, useGetModelCatalogs } from '@/hooks/service/models';
import { useGetPrompts } from '@/hooks/service/prompts';
import styles from '@/pages/workflow/workflow.module.scss';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { Accordion, Button, Input, RadioGroupButton, Select, Slider, Textarea } from '@innogrid/ui';
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@radix-ui/react-popover';
import { useMemo, type ChangeEvent } from 'react';

type SelectOption = { text: string; value: string };
type ModelTypeValue = 'custom' | 'catalog';

type NumericConfigKey = 'temperature' | 'top_p' | 'max_tokens';

type NumericConfig = {
  key: NumericConfigKey;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

const MODEL_TYPE_OPTIONS: { label: string; value: ModelTypeValue }[] = [
  { label: '커스텀 모델', value: 'custom' },
  { label: '모델 카탈로그', value: 'catalog' },
];

const NUMERIC_CONFIGS: NumericConfig[] = [
  { key: 'temperature', label: 'Temperature', min: 0, max: 1, step: 0.1, defaultValue: 0.7 },
  { key: 'top_p', label: 'Top P', min: 0, max: 1, step: 0.1, defaultValue: 0.9 },
  { key: 'max_tokens', label: 'Max Tokens', min: 1, max: 4096, step: 1, defaultValue: 2048 },
];

const accordionItems = [
  {
    label: '모델 설정',
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

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizeNumber = (value: number, step: number) => {
  if (step >= 1) return Math.trunc(value);
  return Number(value.toFixed(1));
};

const DEFAULT_CONTEXT_OPTIONS: Partial<Record<string, SelectOption[]>> = {
  KNOWLEDGE_BASE: [{ text: 'text', value: 'text' }],
  MODEL: [{ text: 'text', value: 'text' }],
};

const getContextOptions = (node: ReturnType<typeof useWorkflowStore.getState>['nodes'][number]) => {
  if (node.type === 'START') {
    const inputFields = (node.data.inputFields ?? []) as {
      type?: 'text' | 'file';
      variable?: string;
      label?: string;
    }[];

    return inputFields
      .filter((field) => field.variable)
      .map((field) => ({
        text: field.label?.trim() || field.variable || '',
        value: field.variable || '',
      }));
  }

  const outputVariables = (node.data.output_variable ?? []) as {
    name?: string;
    value?: string;
  }[];

  const outputOptions = outputVariables
    .filter((field) => field.name)
    .map((field) => ({
      text: field.name?.trim() || field.value || '',
      value: field.name || '',
    }));

  if (outputOptions.length > 0) return outputOptions;

  return DEFAULT_CONTEXT_OPTIONS[node.type ?? ''] ?? [];
};

export const ModelSetting = () => {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const selectedNode = useWorkflowStore((s) => s.nodes.find((n) => n.id === s.selectedNodeId));
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const modelListParams = useMemo(() => ({ size: 100 }), []);
  const { customModels } = useGetCustomModels(modelListParams);
  const { modelCatalogs } = useGetModelCatalogs(modelListParams);
  const { prompts } = useGetPrompts();
  const customModelOptions = useMemo(
    () => customModels.map((model) => ({ text: model.name, value: String(model.id) })),
    [customModels]
  );
  const modelCatalogOptions = useMemo(
    () => modelCatalogs.map((model) => ({ text: model.name, value: String(model.id) })),
    [modelCatalogs]
  );

  if (!selectedNode) return null;

  const description = (selectedNode.data.description as string | undefined) ?? '';
  const modelType = ((selectedNode.data.type as ModelTypeValue | undefined) ??
    'custom') as ModelTypeValue;
  const modelId = (selectedNode.data.model_id as string | undefined) ?? '';
  const context = (selectedNode.data.context as string | undefined) ?? '';
  const promptId = (selectedNode.data.prompt_id as string | undefined) ?? '';

  const modelOptions = modelType === 'custom' ? customModelOptions : modelCatalogOptions;

  const selectedModelOption = modelOptions.find((option) => option.value === modelId) ?? null;

  const connectedNodeIds = new Set(
    edges.filter((edge) => edge.target === selectedNode.id).map((edge) => edge.source)
  );

  const contextOptions = Array.from(
    new Map(
      nodes
        .filter((node) => connectedNodeIds.has(node.id))
        .flatMap(getContextOptions)
        .concat(context ? [{ text: context, value: context }] : [])
        .map((option) => [option.value, option])
    ).values()
  );

  const selectedContextOption = contextOptions.find((option) => option.value === context) ?? null;

  const promptOptions = prompts.map((prompt) => ({
    text: prompt.name,
    value: String(prompt.surro_prompt_id),
  }));
  const selectedPromptOption = promptOptions.find((option) => option.value === promptId) ?? null;
  const selectedPrompt = prompts.find((prompt) => String(prompt.surro_prompt_id) === promptId);

  const updateModelConfig = (key: NumericConfigKey, nextValue: number) => {
    const config = NUMERIC_CONFIGS.find((item) => item.key === key);
    if (!config) return;

    const normalized = normalizeNumber(clampNumber(nextValue, config.min, config.max), config.step);
    updateNodeData(selectedNode.id, { [key]: normalized });
  };

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
          <div className={`${styles.addItemName} page-icon-requisite`}>모델 유형</div>
        </div>
        <div className={styles.col2}>
          <RadioGroupButton
            id="model-type"
            orientation="vertical"
            options={MODEL_TYPE_OPTIONS}
            value={modelType}
            onValueChange={(value: string) => updateNodeData(selectedNode.id, { type: value })}
          />
        </div>
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>모델</div>
        </div>
        <div className={styles.row2}>
          <div className={styles.row2Grow}>
            <Select
              options={modelOptions}
              getOptionLabel={(option: SelectOption) => option?.text ?? ''}
              getOptionValue={(option: SelectOption) => option?.value ?? ''}
              value={selectedModelOption}
              onChange={(option: SelectOption | null) =>
                updateNodeData(selectedNode.id, { model_id: option?.value ?? '' })
              }
              menuPosition="fixed"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button size="medium" color="tertiary" disabled={!modelId}>
                설정
              </Button>
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent sideOffset={5}>
                <div className={`${styles.setBox} ${styles.active}`}>
                  <div className={styles.setName}>모델 설정</div>
                  {NUMERIC_CONFIGS.map((config) => {
                    const rawValue =
                      typeof selectedNode.data[config.key] === 'number'
                        ? (selectedNode.data[config.key] as number)
                        : config.defaultValue;

                    return (
                      <div key={config.key} className={styles.setInner}>
                        <div className={styles.setItem}>
                          <div className={styles.setItemName}>{config.label}</div>
                          <div className={styles.slider}>
                            <Slider
                              value={[rawValue]}
                              onValueChange={(value: number[]) =>
                                updateModelConfig(config.key, value[0] ?? config.defaultValue)
                              }
                              min={config.min}
                              max={config.max}
                              step={config.step}
                            />
                          </div>
                          <div className={styles.numCount}>
                            <input
                              type="number"
                              placeholder="0"
                              min={config.min}
                              max={config.max}
                              step={config.step}
                              value={rawValue}
                              onChange={(e) => {
                                const next = Number(e.target.value);
                                updateModelConfig(
                                  config.key,
                                  Number.isFinite(next) ? next : config.defaultValue
                                );
                              }}
                            />
                            <div className={styles.numCountControl}>
                              <button
                                type="button"
                                className={styles.btnNum}
                                onClick={() =>
                                  updateModelConfig(config.key, rawValue + config.step)
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
                                  updateModelConfig(config.key, rawValue - config.step)
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
                    );
                  })}
                </div>
              </PopoverContent>
            </PopoverPortal>
          </Popover>
        </div>
      </div>

      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>컨텍스트</div>
        </div>
        <Select
          options={contextOptions}
          getOptionLabel={(option: SelectOption) => option?.text ?? ''}
          getOptionValue={(option: SelectOption) => option?.value ?? ''}
          value={selectedContextOption}
          onChange={(option: SelectOption | null) =>
            updateNodeData(selectedNode.id, { context: option?.value ?? '' })
          }
          menuPosition="fixed"
        />
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.addItemNameBox}>
          <div className={`${styles.addItemName} page-icon-requisite`}>프롬프트</div>
        </div>
        <Select
          options={promptOptions}
          getOptionLabel={(option: SelectOption) => option?.text ?? ''}
          getOptionValue={(option: SelectOption) => option?.value ?? ''}
          value={selectedPromptOption}
          onChange={(option: SelectOption | null) =>
            updateNodeData(selectedNode.id, { prompt_id: option?.value ?? '' })
          }
          menuPosition="fixed"
        />
        <div className={styles.promptTextareaBox}>
          <Textarea onChange={() => {}} value={selectedPrompt?.content ?? ''} readOnly />
        </div>
      </div>
      <div className={styles.addItemBox}>
        <div className={styles.accordion}>
          <Accordion components={accordionItems} defaultValue="0" />
        </div>
      </div>
    </div>
  );
};
