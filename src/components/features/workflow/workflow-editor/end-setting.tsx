import { type ChangeEvent } from 'react';
import styles from '@/pages/workflow/workflow.module.scss';
import { Input, Select } from '@innogrid/ui';
import { IconDel } from '@/assets/img/icon';
import { useWorkflowStore } from '@/store/useWorkflowStore';

type OutputVariable = {
  name: string;
  value: string;
};

type SelectOption = { text: string; value: string };

const createDefaultOutput = (): OutputVariable => ({
  name: '',
  value: '',
});

export const EndSetting = () => {
  const nodes = useWorkflowStore((s) => s.nodes);
  const selectedNode = useWorkflowStore((s) => s.nodes.find((n) => n.id === s.selectedNodeId));
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  if (!selectedNode) return null;

  const description = (selectedNode.data.description as string | undefined) ?? '';
  const outputVariables = (selectedNode.data.output_variable ?? []) as OutputVariable[];

  const upstreamVariableOptions = nodes
    .filter((node) => node.id !== selectedNode.id)
    .flatMap((node) => {
      if (node.type === 'START') {
        const inputFields = (node.data.inputFields ?? []) as {
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
      return [];
    });

  const outputValueOptions = Array.from(
    new Map(
      [
        ...upstreamVariableOptions,
        ...outputVariables
          .filter((item) => item.value)
          .map((item) => ({
            text: item.value,
            value: item.value,
          })),
      ].map((option) => [option.value, option])
    ).values()
  );

  const updateOutputVariables = (next: OutputVariable[]) => {
    updateNodeData(selectedNode.id, { output_variable: next });
  };

  const updateOutputVariable = (index: number, partial: Partial<OutputVariable>) => {
    updateOutputVariables(
      outputVariables.map((item, idx) => (idx === index ? { ...item, ...partial } : item))
    );
  };

  const addOutputVariable = () => {
    updateOutputVariables([...outputVariables, createDefaultOutput()]);
  };

  const removeOutputVariable = (index: number) => {
    updateOutputVariables(outputVariables.filter((_, idx) => idx !== index));
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
          <div className={styles.addItemName}>출력 변수</div>
          <button type="button" className={styles.btnPlus} onClick={addOutputVariable}>
            <span>생성</span>
          </button>
        </div>
        {outputVariables.length === 0 && (
          <div className={styles.emptyBox}>
            <span>생성된 출력 변수가 없습니다.</span>
          </div>
        )}
        {outputVariables.map((outputVariable, index) => {
          const selectedValue =
            outputValueOptions.find((option) => option.value === outputVariable.value) ?? null;

          return (
            <div key={`${selectedNode.id}-output-${index}`} className={styles.row3}>
              <Input
                placeholder="출력 변수명을 입력해주세요."
                value={outputVariable.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateOutputVariable(index, { name: e.target.value })
                }
              />
              <div className="w-28.75 shrink-0">
                <Select
                  options={outputValueOptions}
                  getOptionLabel={(option: SelectOption) => option?.text ?? ''}
                  getOptionValue={(option: SelectOption) => option?.value ?? ''}
                  value={selectedValue}
                  onChange={(option: SelectOption | null) =>
                    updateOutputVariable(index, { value: option?.value ?? '' })
                  }
                  styles={{
                    valueContainer: (base) => ({
                      ...base,
                      minWidth: 0,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }),
                  }}
                  menuPosition="fixed"
                />
              </div>
              <button
                type="button"
                className={`${styles.btnIconDel} flex shrink-0 items-center justify-center`}
                onClick={() => removeOutputVariable(index)}
              >
                <span className={`${styles.iconDel} flex shrink-0 items-center justify-center`}>
                  <IconDel />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
